<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Central\Shop;
use App\Models\StoreDomain;
use App\Services\Domain\DnsVerificationService;
use App\Services\Domain\DomainProvisioningService;
use App\Services\Domain\DomainValidationService;
use App\Support\StoreToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StoreDomainController extends Controller
{
    public function __construct(
        protected DomainValidationService $validationService,
        protected DnsVerificationService $dnsService,
        protected DomainProvisioningService $provisioningService
    ) {}

    /**
     * Resolve active authenticated store
     */
    protected function resolveCurrentShop(Request $request): ?Shop
    {
        // 1. Injected by IdentifyTenant middleware
        $shop = $request->attributes->get('tenant') ?? app('current_shop');
        if ($shop instanceof Shop) {
            return $shop;
        }

        // 2. Resolve via StoreToken
        $shopCode = StoreToken::resolveShopCodeFromRequest($request);
        if ($shopCode) {
            $shop = Shop::where('shop_code', strtoupper($shopCode))->first();
            if ($shop) {
                return $shop;
            }
        }

        // 3. Fallback to active store cookie
        $cookieCode = $request->cookie(StoreToken::CODE_COOKIE) ?: $request->cookie(StoreToken::LEGACY_CODE_COOKIE);
        if ($cookieCode) {
            return Shop::where('shop_code', strtoupper($cookieCode))->first();
        }

        return null;
    }

    /**
     * GET /api/store/domains
     * Retrieve the current custom domain details for the store
     */
    public function getStoreDomain(Request $request): JsonResponse
    {
        $shop = $this->resolveCurrentShop($request);
        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Shop session expired or invalid store.',
            ], 401);
        }

        $domainRecord = StoreDomain::where('store_id', $shop->id)
            ->with(['logs' => function ($q) {
                $q->latest()->limit(10);
            }])
            ->first();

        $serverIp = $this->dnsService->getExpectedServerIp();

        return response()->json([
            'success' => true,
            'shop_code' => $shop->shop_code,
            'shop_name' => $shop->name,
            'default_store_url' => "https://shoppy.live/shop/{$shop->shop_code}",
            'server_ip' => $serverIp,
            'domain' => $domainRecord ? [
                'id' => $domainRecord->id,
                'domain' => $domainRecord->domain,
                'www_enabled' => (bool) $domainRecord->www_enabled,
                'verification_token' => $domainRecord->verification_token,
                'dns_status' => $domainRecord->dns_status,
                'ssl_status' => $domainRecord->ssl_status,
                'status' => $domainRecord->status,
                'ssl_expiry_at' => $domainRecord->ssl_expiry_at?->toIso8601String(),
                'verified_at' => $domainRecord->verified_at?->toIso8601String(),
                'activated_at' => $domainRecord->activated_at?->toIso8601String(),
                'error_message' => $domainRecord->error_message,
                'created_at' => $domainRecord->created_at->toIso8601String(),
                'logs' => $domainRecord->logs,
            ] : null,
            'dns_instructions' => $domainRecord ? [
                'root' => [
                    'type' => 'A',
                    'host' => '@',
                    'value' => $serverIp,
                    'description' => 'Points your apex domain to Shoppy ERP server',
                ],
                'www' => [
                    'type' => 'CNAME',
                    'host' => 'www',
                    'value' => $domainRecord->domain,
                    'description' => 'Alias for www subdomain',
                ],
                'verification' => [
                    'type' => 'TXT',
                    'host' => '_shoppy-verification',
                    'value' => $domainRecord->verification_token,
                    'description' => 'Verifies ownership of your domain',
                ],
            ] : null,
        ]);
    }

    /**
     * POST /api/store/domains
     * Connect a new custom domain
     */
    public function connectDomain(Request $request): JsonResponse
    {
        $shop = $this->resolveCurrentShop($request);
        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Shop session expired or invalid store.',
            ], 401);
        }

        $rawDomain = (string) $request->input('domain', '');
        $wwwEnabled = (bool) $request->input('www_enabled', true);

        try {
            $normalizedDomain = $this->validationService->validate($rawDomain);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->validator->errors()->first('domain') ?: 'Invalid domain name.',
                'errors' => $e->validator->errors(),
            ], 422);
        }

        // Each store can have 1 active/pending custom domain at a time
        $existing = StoreDomain::where('store_id', $shop->id)->first();
        if ($existing) {
            if ($existing->domain === $normalizedDomain) {
                return response()->json([
                    'success' => true,
                    'message' => 'Domain is already registered for this store.',
                    'domain' => $existing,
                ]);
            }

            // Remove previous if changing domain
            $this->provisioningService->remove($existing);
        }

        $token = $this->validationService->generateVerificationToken();

        $domainRecord = StoreDomain::create([
            'user_id' => $shop->owner_id ?? null,
            'store_id' => $shop->id,
            'domain' => $normalizedDomain,
            'www_enabled' => $wwwEnabled,
            'verification_token' => $token,
            'dns_status' => 'pending',
            'ssl_status' => 'pending',
            'status' => 'pending_verification',
        ]);

        $domainRecord->log('submitted', 'info', "Custom domain {$normalizedDomain} submitted. Awaiting DNS setup.");

        $serverIp = $this->dnsService->getExpectedServerIp();

        return response()->json([
            'success' => true,
            'message' => "Custom domain '{$normalizedDomain}' registered! Please configure the DNS records below with your domain registrar.",
            'domain' => $domainRecord,
            'server_ip' => $serverIp,
            'dns_instructions' => [
                'root' => [
                    'type' => 'A',
                    'host' => '@',
                    'value' => $serverIp,
                ],
                'www' => [
                    'type' => 'CNAME',
                    'host' => 'www',
                    'value' => $normalizedDomain,
                ],
                'verification' => [
                    'type' => 'TXT',
                    'host' => '_shoppy-verification',
                    'value' => $token,
                ],
            ],
        ]);
    }

    /**
     * POST /api/store/domains/{id}/verify
     * Verify DNS ownership and automatically provision server vhost + SSL
     */
    public function verifyDomain(Request $request, int $id): JsonResponse
    {
        $shop = $this->resolveCurrentShop($request);
        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => 'Shop session expired.',
            ], 401);
        }

        $domainRecord = StoreDomain::where('id', $id)
            ->where('store_id', $shop->id)
            ->first();

        if (!$domainRecord) {
            return response()->json([
                'success' => false,
                'message' => 'Domain record not found.',
            ], 404);
        }

        $domainRecord->log('dns_check', 'info', "Running DNS verification check for {$domainRecord->domain}...");

        // Verify DNS A & TXT records
        $dnsResult = $this->dnsService->verify($domainRecord);

        if (!$dnsResult['success']) {
            $domainRecord->update([
                'dns_status' => 'failed',
                'status' => 'dns_verification_failed',
                'error_message' => implode(' | ', $dnsResult['errors']),
            ]);

            $domainRecord->log('dns_check', 'failed', "DNS verification failed.", $dnsResult['errors']);

            return response()->json([
                'success' => false,
                'message' => 'DNS verification failed. Please check the DNS records and allow a few minutes for DNS propagation.',
                'dns_result' => $dnsResult,
                'domain' => $domainRecord->fresh(),
            ], 422);
        }

        // DNS is successfully verified!
        $domainRecord->update([
            'dns_status' => 'verified',
            'status' => 'dns_verified',
            'verified_at' => now(),
            'error_message' => null,
        ]);

        $domainRecord->log('dns_check', 'success', "DNS ownership successfully verified for {$domainRecord->domain}!");

        // Step 4 & 5: Trigger Automated Server Provisioning & SSL Installation
        $provResult = $this->provisioningService->provision($domainRecord);

        return response()->json([
            'success' => true,
            'message' => $provResult['message'] ?? 'Domain verified and provisioned successfully!',
            'dns_result' => $dnsResult,
            'provisioning' => $provResult,
            'domain' => $domainRecord->fresh(),
        ]);
    }

    /**
     * POST /api/store/domains/{id}/retry
     * Retry failed provisioning or SSL installation
     */
    public function retryDomain(Request $request, int $id): JsonResponse
    {
        $shop = $this->resolveCurrentShop($request);
        if (!$shop) {
            return response()->json(['success' => false, 'message' => 'Shop session expired.'], 401);
        }

        $domainRecord = StoreDomain::where('id', $id)->where('store_id', $shop->id)->first();
        if (!$domainRecord) {
            return response()->json(['success' => false, 'message' => 'Domain not found.'], 404);
        }

        // Re-run DNS first
        $dnsResult = $this->dnsService->verify($domainRecord);
        if (!$dnsResult['success']) {
            $domainRecord->update([
                'dns_status' => 'failed',
                'status' => 'dns_verification_failed',
                'error_message' => implode(' | ', $dnsResult['errors']),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'DNS records are not resolving yet. ' . implode(' ', $dnsResult['errors']),
                'domain' => $domainRecord,
            ], 422);
        }

        $provResult = $this->provisioningService->provision($domainRecord);

        return response()->json([
            'success' => $provResult['success'],
            'message' => $provResult['message'] ?? 'Provisioning re-executed.',
            'domain' => $domainRecord->fresh(),
        ]);
    }

    /**
     * DELETE /api/store/domains/{id}
     * Remove custom domain and cleanup Nginx configuration
     */
    public function removeDomain(Request $request, int $id): JsonResponse
    {
        $shop = $this->resolveCurrentShop($request);
        if (!$shop) {
            return response()->json(['success' => false, 'message' => 'Shop session expired.'], 401);
        }

        $domainRecord = StoreDomain::where('id', $id)->where('store_id', $shop->id)->first();
        if (!$domainRecord) {
            return response()->json(['success' => false, 'message' => 'Domain not found.'], 404);
        }

        $res = $this->provisioningService->remove($domainRecord);

        return response()->json([
            'success' => true,
            'message' => $res['message'] ?? 'Custom domain removed successfully.',
        ]);
    }

    /**
     * GET /api/master/domains
     * Master Super Admin management list of all custom domains (PRD Section 13)
     */
    public function masterListDomains(Request $request): JsonResponse
    {
        $query = StoreDomain::with('store')->latest();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('domain', 'like', "%{$search}%")
                  ->orWhereHas('store', function ($sq) use ($search) {
                      $sq->where('shop_code', 'like', "%{$search}%")
                         ->orWhere('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $domains = $query->paginate(25);

        return response()->json([
            'success' => true,
            'data' => $domains,
        ]);
    }
}

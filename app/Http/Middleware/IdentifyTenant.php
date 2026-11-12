<?php

namespace App\Http\Middleware;

use App\Models\Central\Shop;
use App\Models\Central\ShopDomain;
use App\Support\StoreToken;
use App\Tenancy\TenantManager;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    public function __construct(protected TenantManager $tenantManager)
    {
    }

    public function handle(Request $request, Closure $next): Response
    {
        $shop = $this->resolveTenant($request);

        if (!$shop) {
            if ($request->expectsJson() || $request->is('api/*')) {
                return response()->json([
                    'error' => 'tenant_not_found',
                    'message' => 'Shop could not be identified for this request. Please specify a valid domain or X-Shop-Code header.',
                ], 404);
            }

            return response()->view('errors.tenant-not-found', [], 404);
        }

        // Check if shop is suspended or archived
        if ($shop->isSuspended()) {
            return response()->json([
                'error' => 'shop_suspended',
                'message' => 'This shop is currently suspended or past its grace period. Please contact support.',
                'status' => $shop->status,
            ], 403);
        }

        // Set tenant context and dynamically switch database connection
        $this->tenantManager->setCurrentTenant($shop);
        $request->attributes->set('tenant', $shop);
        app()->instance('current_shop', $shop);

        return $next($request);
    }

    /**
     * Resolve shop from Hostname, Custom Domain, or X-Shop-Code Header.
     */
    protected function resolveTenant(Request $request): ?Shop
    {
        // 1. Explicit Query Hint / Verified Store Auth Token / Header / Cookie / Session
        $tokenCode = StoreToken::resolveShopCodeFromRequest($request);

        $shopCode = $request->query('code')
            ?? $request->query('shop_code')
            ?? $request->query('store_code')
            ?? $tokenCode
            ?? $request->header('X-Shop-Code')
            ?? $request->header('X-Store-Code')
            ?? $request->cookie(StoreToken::CODE_COOKIE)
            ?? $request->cookie(StoreToken::LEGACY_CODE_COOKIE)
            ?? ($request->hasSession() ? session('active_store_code') : null);

        // Check Referer header if available (e.g. AJAX request from /SP20261110124405 or ?code=SP...)
        if (!$shopCode && $request->headers->has('referer')) {
            $referer = (string) $request->header('referer');
            $refPath = parse_url($referer, PHP_URL_PATH) ?? '';
            $refQuery = parse_url($referer, PHP_URL_QUERY) ?? '';
            if ($refQuery) {
                parse_str($refQuery, $refParams);
                $shopCode = $refParams['code'] ?? $refParams['shop_code'] ?? null;
            }
            if (!$shopCode && $refPath) {
                $refSegment = trim($refPath, '/');
                if (preg_match('/^(SP[0-9A-Z]+|STORE[0-9A-Z]+|SHP-[0-9A-Z]+)$/i', $refSegment, $matches)) {
                    $shopCode = $matches[1];
                }
            }
        }

        if ($shopCode) {
            $shop = Shop::where('shop_code', strtoupper(trim((string) $shopCode)))->first();
            if ($shop) {
                return $shop;
            }
        }

        // 2. Resolve via Full Hostname in shop_domains (e.g. store.brand.com)
        $host = strtolower($request->getHost());

        $shopDomain = ShopDomain::where('domain', $host)
            ->where('is_verified', true)
            ->with('shop')
            ->first();

        if ($shopDomain && $shopDomain->shop) {
            return $shopDomain->shop;
        }

        // 3. Fallback: Extract subdomain
        $parts = explode('.', $host);
        if (count($parts) >= 2) {
            $subdomain = $parts[0];
            if (!in_array($subdomain, ['www', 'admin', 'api', 'central', 'localhost', '127'])) {
                $shop = Shop::where('slug', $subdomain)->first();
                if ($shop) {
                    return $shop;
                }
            }
        }

        // 4. Only allow default active shop fallback on public storefront routes, NEVER private tenant admin/POS APIs
        if ($request->is('api/storefront/*')) {
            return Shop::where('status', 'active')->first();
        }

        return null;
    }
}

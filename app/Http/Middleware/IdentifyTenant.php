<?php

namespace App\Http\Middleware;

use App\Models\Central\Shop;
use App\Models\Central\ShopDomain;
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
        // 1. Explicit Header / Request Hint (Highest priority for API/POS/Mobile clients)
        $shopCode = $request->header('X-Shop-Code') ?? $request->query('shop_code');
        if ($shopCode) {
            $shop = Shop::where('shop_code', $shopCode)->first();
            if ($shop) {
                return $shop;
            }
        }

        // 2. Resolve via Full Hostname in shop_domains (e.g. store.rameshfashion.com or ramesh.shoppy.local)
        $host = strtolower($request->getHost());

        $shopDomain = ShopDomain::where('domain', $host)
            ->where('is_verified', true)
            ->with('shop')
            ->first();

        if ($shopDomain && $shopDomain->shop) {
            return $shopDomain->shop;
        }

        // 3. Fallback: Extract subdomain (e.g. 'ramesh' from 'ramesh.shoppy.local' or 'ramesh.localhost')
        $parts = explode('.', $host);
        if (count($parts) >= 2) {
            $subdomain = $parts[0];
            // Exclude central domains
            if (!in_array($subdomain, ['www', 'admin', 'api', 'central', 'localhost'])) {
                $shop = Shop::where('slug', $subdomain)->first();
                if ($shop) {
                    return $shop;
                }
            }
        }

        return null;
    }
}

<?php

use App\Support\StoreToken;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$loadWebsiteMeta = function (): array {
    $defaults = [
        'meta_title' => 'Shoppy ERP — GST Billing, Retail POS & E-Commerce Software | Enexa IT',
        'meta_description' => "India's trusted high-speed POS counter billing software, GST tax invoicing (B2B/B2C), WhatsApp invoice sharing & omnichannel online storefront platform by Enexa IT Solutions Private Limited.",
        'meta_keywords' => 'GST billing software, POS billing software, retail ERP, WhatsApp invoicing, online storefront, Shoppy ERP, Enexa IT Solutions',
        'favicon_url' => '/favicon.png?v=1',
        'og_image' => '',
        'site_logo' => '',
    ];

    try {
        if (Schema::connection('mysql')->hasTable('website_settings')) {
            $rows = DB::connection('mysql')->table('website_settings')->pluck('value', 'key')->toArray();
            return array_merge($defaults, array_filter($rows, fn ($v) => $v !== null && $v !== ''));
        }
    } catch (\Throwable $e) {
        // Fallback silently when central DB is unreachable during early boot
    }

    return $defaults;
};

$resolveWebShopCode = function (): string {
    $req = request();
    $queryCode = strtoupper(trim((string) ($req->query('code') ?: $req->query('shop_code') ?: '')));
    if ($queryCode !== '') {
        if ($req->hasSession()) {
            session(['active_store_code' => $queryCode]);
        }
        return $queryCode;
    }

    $tokenCode = StoreToken::resolveShopCodeFromRequest($req);
    if ($tokenCode) {
        return $tokenCode;
    }

    $cookieOrSession = strtoupper(trim((string) (
        $req->cookie(StoreToken::CODE_COOKIE)
        ?: $req->cookie(StoreToken::LEGACY_CODE_COOKIE)
        ?: ($req->hasSession() ? session('active_store_code') : '')
    )));

    return $cookieOrSession;
};

// Dedicated portals
Route::get('/storefront', function () use ($resolveWebShopCode) {
    $shopCode = $resolveWebShopCode();
    if (!$shopCode) {
        $shop = DB::connection('mysql')->table('shops')->where('status', 'active')->first();
        $shopCode = $shop->shop_code ?? '';
    } else {
        $shop = DB::connection('mysql')->table('shops')->where('shop_code', $shopCode)->first();
    }
    $title = ($shop ? $shop->name : 'Shoppy Store') . ' — Online Shopping';
    return view('app', [
        'entry' => 'storefront',
        'title' => $title,
        'shopCode' => $shopCode,
    ]);
});

Route::get('/pos-terminal', function () use ($resolveWebShopCode) {
    $shopCode = $resolveWebShopCode();
    $shop = $shopCode ? DB::connection('mysql')->table('shops')->where('shop_code', $shopCode)->first() : null;
    $title = ($shop ? $shop->name : 'Shoppy') . ' — POS Billing Counter Terminal';
    return view('app', [
        'entry' => 'pos',
        'title' => $title,
        'shopCode' => $shopCode,
    ]);
});

Route::get('/central-admin-portal', function () {
    return view('app', [
        'entry' => 'central-admin',
        'title' => 'Shoppy Central SaaS Admin & Partner Portal',
    ]);
});

Route::get('/banking-portal', function () {
    return view('app', [
        'entry' => 'banking-panel',
        'title' => 'Enexa Banking — CRM & Lead Manager Portal',
        'htmlClass' => 'h-full bg-[#f4f7fa] text-slate-800',
        'bodyClass' => 'min-h-full flex flex-col bg-[#f4f7fa] text-slate-800 selection:bg-cyan-500 selection:text-white',
    ]);
});

// Super Admin Master Portal (Multi-tenant, Subscription Master, All Shops List)
Route::get('/master/{any?}', function () use ($loadWebsiteMeta) {
    $theme = request()->cookie('shoppy_erp_theme', 'light');
    $isDark = ($theme === 'dark');
    $seo = $loadWebsiteMeta();
    return response()
        ->view('app', [
            'entry' => 'app',
            'title' => 'Shoppy Super Admin — Master SaaS Portal',
            'faviconUrl' => $seo['favicon_url'],
            'shopCode' => 'MASTER-ROOT',
            'htmlClass' => $isDark ? 'h-full bg-slate-950 text-slate-100 dark' : 'h-full bg-[#f8fafc] text-slate-800',
            'bodyClass' => $isDark ? 'min-h-full flex flex-col bg-slate-950 text-slate-100' : 'min-h-full flex flex-col bg-[#f8fafc] text-slate-800',
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
})->where('any', '.*');

// Merchant Store Login Portal (http://domain/store)
// White-label Merchant Store Login Portal (http://domain/my-store)


Route::get('/store-login', function () {
    return redirect('/my-store');
});

Route::get('/store', function () {
    return redirect('/my-store');
});

// White-label Merchant Store Login Portal (http://domain/my-store)
Route::get('/my-store', function () use ($loadWebsiteMeta) {
    $code = strtoupper(trim((string) (request()->query('code') ?: request()->query('shop_code') ?: '')));
    if ($code !== '' && request()->hasSession()) {
        session(['active_store_code' => $code]);
    }
    $seo = $loadWebsiteMeta();
    $resp = response()
        ->view('app', [
            'entry' => 'app',
            'title' => 'Merchant Store Login — Shoppy ERP',
            'faviconUrl' => $seo['favicon_url'],
            'shopCode' => $code,
            'htmlClass' => 'h-full bg-[#fff9f2] text-slate-800',
            'bodyClass' => 'min-h-full flex flex-col bg-[#fff9f2] text-slate-800 selection:bg-cyan-500 selection:text-white',
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate');

    if ($code !== '') {
        $resp->cookie(StoreToken::CODE_COOKIE, $code, 60 * 24 * 30, '/', null, false, false)
             ->cookie('shoppy_active_store_code', $code, 60 * 24 * 30, '/', null, false, false);
    }

    return $resp;
});

// Dedicated Direct E-Commerce Storefront Routes:
// 1. http://domain/shop/{storeCode} (Instant Direct Access)
// 2. http://domain/{storeCode}/shop
// 3. http://domain/{storeCode}?ecom=1
Route::get('/shop/{storeCode}', function ($storeCode) use ($loadWebsiteMeta) {
    $normalizedCode = strtoupper(trim($storeCode));
    $dbShop = null;
    try {
        $dbShop = DB::connection('mysql')->table('shops')->where('shop_code', $normalizedCode)->first();
    } catch (\Throwable $e) {}

    $shopName = $dbShop ? $dbShop->name : $normalizedCode;
    $seo = $loadWebsiteMeta();

    if (request()->hasSession()) {
        session(['active_store_code' => $normalizedCode]);
    }

    $resp = response()
        ->view('app', [
            'entry' => 'storefront',
            'title' => $shopName . ' — Official Online Store | Exclusive Deals & Fast Delivery',
            'faviconUrl' => $seo['favicon_url'] ?? '/favicon.png',
            'shopCode' => $normalizedCode,
            'htmlClass' => 'h-full bg-[#f8fafc] text-slate-900',
            'bodyClass' => 'min-h-full flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-[#e11d48] selection:text-white',
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate');

    $resp->cookie(StoreToken::CODE_COOKIE, $normalizedCode, 60 * 24 * 30, '/', null, false, false)
         ->cookie('shoppy_active_store_code', $normalizedCode, 60 * 24 * 30, '/', null, false, false)
         ->cookie('shoppy_ecom_' . $normalizedCode, '1', 60 * 24 * 30, '/', null, false, false);

    return $resp;
})->where('storeCode', '^[0-9A-Za-z_\-]+$');

Route::get('/{storeCode}/shop', function ($storeCode) {
    return redirect('/shop/' . strtoupper(trim($storeCode)));
})->where('storeCode', '^(SP[0-9A-Z]+|STORE[0-9A-Z]+|SHP-[0-9A-Z]+)$');

// Store Code dynamic URL routing (http://domain/{storeCode})
// Rule: Jab o ecommerce lega tabhi uske url pe ecommerce aayega, nahi to login page aayega and billing software open hoga
Route::get('/{storeCode}', function ($storeCode) use ($loadWebsiteMeta) {
    $normalizedCode = strtoupper(trim($storeCode));

    $dbShop = null;
    try {
        $dbShop = DB::connection('mysql')->table('shops')->where('shop_code', $normalizedCode)->first();
    } catch (\Throwable $e) {}

    if (!$dbShop) {
        return redirect('/store?code=' . $normalizedCode);
    }

    if (request()->hasSession()) {
        session(['active_store_code' => $normalizedCode]);
    }

    $settings = json_decode($dbShop->settings, true) ?: [];
    $hasEcommerce = !empty($settings['has_ecommerce']);
    
    // Allow instant override via URL parameters ?ecom=1, ?shop=1, or ?store=1
    if (request()->has('ecom') || request()->has('shop') || request()->has('storefront') || request()->has('store')) {
        $hasEcommerce = true;
    }

    $shop = [
        'name' => $dbShop->name,
        'plan' => $settings['plan_name'] ?? 'Shoppy ERP Package',
        'has_ecommerce' => $hasEcommerce,
    ];

    // Check if toggle cookie override exists (e.g. from Super Admin desk)
    $cookieOverride = request()->cookie('shoppy_ecom_' . $normalizedCode);
    if ($cookieOverride !== null) {
        $hasEcommerce = ($cookieOverride === '1');
    }

    $seo = $loadWebsiteMeta();

    // If subscribed to Ecommerce -> Open Online Ecommerce Storefront
    if ($hasEcommerce) {
        return response()
            ->view('app', [
                'entry' => 'storefront',
                'title' => $shop['name'] . ' — Official Online Store | Exclusive Deals & Fast Delivery',
                'faviconUrl' => $seo['favicon_url'] ?? '/favicon.png',
                'shopCode' => $normalizedCode,
                'htmlClass' => 'h-full bg-[#f8fafc] text-slate-900',
                'bodyClass' => 'min-h-full flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-[#e11d48] selection:text-white',
            ])
            ->cookie(StoreToken::CODE_COOKIE, $normalizedCode, 60 * 24 * 30, '/', null, false, false)
            ->cookie('shoppy_active_store_code', $normalizedCode, 60 * 24 * 30, '/', null, false, false)
            ->cookie('shoppy_ecom_' . $normalizedCode, '1', 60 * 24 * 30, '/', null, false, false);
    }

    // If NOT subscribed to Ecommerce -> Open Billing Software Login Page
    return redirect('/store?code=' . $normalizedCode)
        ->cookie(StoreToken::CODE_COOKIE, $normalizedCode, 60 * 24 * 30, '/', null, false, false)
        ->cookie('shoppy_active_store_code', $normalizedCode, 60 * 24 * 30, '/', null, false, false);
})->where('storeCode', '^(SP[0-9A-Z]+|STORE[0-9A-Z]+|SHP-[0-9A-Z]+)$');

// PayU Web Callback handler for external browser redirects
Route::match(['get', 'post'], '/payu/callback/{result}', [\App\Http\Controllers\Central\PayUController::class, 'handleCallback']);

// Direct Mail Trigger URLs for Store Credentials and GST Invoice
Route::get('/credential-mail-send', [\App\Http\Controllers\Central\PaytmController::class, 'sendCredentialMailByShopCode']);
Route::get('/invoice-mail-send', [\App\Http\Controllers\Central\PaytmController::class, 'sendInvoiceMailByShopCode']);

// Direct Test OTP Email Trigger for Diagnostics
Route::get('/test-otp-mail', function () {
    $email = request()->query('email', 'contact@enexa.in');
    $shopCode = request()->query('shop', 'SP20261110124405');
    $otp = (string) random_int(100000, 999999);

    $res = \App\Services\CommunicationService::sendOtpEmail(
        ownerName: 'Store Merchant',
        ownerEmail: $email,
        otp: $otp,
        storeCode: $shopCode,
        storeName: 'Shoppy Verification Test'
    );

    return response()->json([
        'success' => (($res['status'] ?? 0) === 1),
        'timestamp' => now()->toIso8601String(),
        'target_email' => $email,
        'otp' => $otp,
        'communication_result' => $res,
        'resolved_host' => config('services.enexa_mail.host'),
        'resolved_port' => config('services.enexa_mail.port'),
        'resolved_user' => config('services.enexa_mail.username'),
    ]);
});

// Single Page Application (SPA) catch-all route (matching cashbez architecture)
// Handles direct URLs: /shop-admin, /shop-admin/products, /shop-admin/orders, /shop-admin/inventory, etc.
Route::get('/{any}', function () use ($resolveWebShopCode, $loadWebsiteMeta) {
    $shopCode = $resolveWebShopCode();
    $theme = request()->cookie('shoppy_erp_theme', 'light');
    $isDark = ($theme === 'dark');
    $seo = $loadWebsiteMeta();
    return response()
        ->view('app', [
            'entry' => 'app',
            'title' => $seo['meta_title'],
            'metaDescription' => $seo['meta_description'],
            'metaKeywords' => $seo['meta_keywords'],
            'ogImage' => $seo['og_image'] ?: $seo['site_logo'],
            'faviconUrl' => $seo['favicon_url'],
            'shopCode' => $shopCode,
            'htmlClass' => $isDark ? 'h-full bg-slate-950 text-slate-100 dark' : 'h-full bg-[#f4f7fa] text-slate-800',
            'bodyClass' => $isDark ? 'min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white' : 'min-h-full flex flex-col bg-[#f4f7fa] text-slate-800 selection:bg-cyan-500 selection:text-white',
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
        ->header('Pragma', 'no-cache')
        ->header('Expires', '0');
})->where('any', '.*');

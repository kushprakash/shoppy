<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

// Dedicated portals
Route::get('/storefront', function () {
    $shopCode = strtoupper(request()->query('code') ?: session('active_store_code') ?: request()->cookie('shoppy_active_store_code') ?: '');
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

Route::get('/pos-terminal', function () {
    $shopCode = strtoupper(request()->query('code') ?: session('active_store_code') ?: request()->cookie('shoppy_active_store_code') ?: '');
    if (!$shopCode) {
        $shop = DB::connection('mysql')->table('shops')->where('status', 'active')->first();
        $shopCode = $shop->shop_code ?? '';
    } else {
        $shop = DB::connection('mysql')->table('shops')->where('shop_code', $shopCode)->first();
    }
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
Route::get('/master/{any?}', function () {
    $theme = request()->cookie('shoppy_erp_theme', 'light');
    $isDark = ($theme === 'dark');
    return response()
        ->view('app', [
            'entry' => 'app',
            'title' => 'Shoppy Super Admin — Master SaaS Portal',
            'shopCode' => 'MASTER-ROOT',
            'htmlClass' => $isDark ? 'h-full bg-slate-950 text-slate-100 dark' : 'h-full bg-[#f8fafc] text-slate-800',
            'bodyClass' => $isDark ? 'min-h-full flex flex-col bg-slate-950 text-slate-100' : 'min-h-full flex flex-col bg-[#f8fafc] text-slate-800',
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
})->where('any', '.*');

// Merchant Store Login Portal (http://domain/store)
Route::get('/store', function () {
    $code = strtoupper(request()->query('code') ?: session('active_store_code') ?: request()->cookie('shoppy_active_store_code') ?: '');
    if (!$code) {
        $shop = DB::connection('mysql')->table('shops')->where('status', 'active')->first();
        $code = $shop->shop_code ?? '';
    }
    $theme = request()->cookie('shoppy_erp_theme', 'light');
    $isDark = ($theme === 'dark');
    return response()
        ->view('app', [
            'entry' => 'app',
            'title' => 'Merchant Store Login — Shoppy ERP',
            'shopCode' => $code,
            'htmlClass' => $isDark ? 'h-full bg-slate-950 text-slate-100 dark' : 'h-full bg-[#f4f7fa] text-slate-800',
            'bodyClass' => $isDark ? 'min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white' : 'min-h-full flex flex-col bg-[#f4f7fa] text-slate-800 selection:bg-cyan-500 selection:text-white',
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate');
});

Route::get('/store-login', function () {
    return redirect('/store');
});

// Store Code dynamic URL routing (http://domain/{storeCode})
// Rule: Jab o ecommerce lega tabhi uske url pe ecommerce aayega, nahi to login page aayega and billing software open hoga
Route::get('/{storeCode}', function ($storeCode) {
    $normalizedCode = strtoupper($storeCode);

    $dbShop = null;
    try {
        $dbShop = DB::connection('mysql')->table('shops')->where('shop_code', $normalizedCode)->first();
    } catch (\Throwable $e) {}

    if (!$dbShop) {
        return redirect('/store?code=' . $normalizedCode);
    }

    $settings = json_decode($dbShop->settings, true) ?: [];
    $hasEcommerce = !empty($settings['has_ecommerce']);
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

    // If subscribed to Ecommerce -> Open Online Ecommerce Storefront
    if ($hasEcommerce) {
        return view('app', [
            'entry' => 'storefront',
            'title' => $shop['name'] . ' — Online Storefront',
            'shopCode' => $normalizedCode,
        ]);
    }

    // If NOT subscribed to Ecommerce -> Open Billing Software Login Page
    return redirect('/store?code=' . $normalizedCode);
})->where('storeCode', '^(SP[0-9A-Z]+|STORE[0-9A-Z]+|SHP-[0-9A-Z]+)$');

// PayU Web Callback handler for external browser redirects
Route::match(['get', 'post'], '/payu/callback/{result}', [\App\Http\Controllers\Central\PayUController::class, 'handleCallback']);

// Single Page Application (SPA) catch-all route (matching cashbez architecture)
// Handles direct URLs: /shop-admin, /shop-admin/products, /shop-admin/orders, /shop-admin/inventory, etc.
Route::get('/{any}', function () {
    $shopCode = strtoupper(request()->query('code') ?: session('active_store_code') ?: request()->cookie('shoppy_active_store_code') ?: '');
    if (!$shopCode) {
        $shop = DB::connection('mysql')->table('shops')->where('status', 'active')->first();
        $shopCode = $shop->shop_code ?? '';
    }
    $theme = request()->cookie('shoppy_erp_theme', 'light');
    $isDark = ($theme === 'dark');
    return response()
        ->view('app', [
            'entry' => 'app',
            'title' => 'Shoppy ERP — Enexa IT Solutions Private Limited',
            'shopCode' => $shopCode,
            'htmlClass' => $isDark ? 'h-full bg-slate-950 text-slate-100 dark' : 'h-full bg-[#f4f7fa] text-slate-800',
            'bodyClass' => $isDark ? 'min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white' : 'min-h-full flex flex-col bg-[#f4f7fa] text-slate-800 selection:bg-cyan-500 selection:text-white',
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
        ->header('Pragma', 'no-cache')
        ->header('Expires', '0');
})->where('any', '.*');

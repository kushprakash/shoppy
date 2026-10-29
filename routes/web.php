<?php

use Illuminate\Support\Facades\Route;

// Dedicated portals
Route::get('/storefront', function () {
    return view('app', [
        'entry' => 'storefront',
        'title' => 'Ramesh Fashion Store — Online Shopping',
        'shopCode' => 'SHP-A4IFYK',
    ]);
});

Route::get('/pos-terminal', function () {
    return view('app', [
        'entry' => 'pos',
        'title' => 'POS Billing Counter — High Speed Terminal',
        'shopCode' => 'SHP-A4IFYK',
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
    $code = strtoupper(request()->query('code', 'SHP-A4IFYK'));
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

    // Tenant registry (in-memory demo data + fallback, works 100% even if local MySQL is offline)
    $shops = [
        'STORE983515' => [
            'name' => 'Verma General & Kirana Store',
            'plan' => 'GST Billing Software + Ecommerce + Whatsapp Messaging',
            'has_ecommerce' => true,
        ],
        'STORE441029' => [
            'name' => 'Sharma Textile & Garments',
            'plan' => 'GST Billing Software',
            'has_ecommerce' => false,
        ],
        'SHP-A4IFYK' => [
            'name' => 'Ramesh Fashion Store',
            'plan' => 'GST Billing Software + Ecommerce',
            'has_ecommerce' => true,
        ],
        'STORE552190' => [
            'name' => 'Apex Mobile & Electronics',
            'plan' => 'GST Billing Software + Ecommerce',
            'has_ecommerce' => true,
        ],
        'STORE118833' => [
            'name' => 'Kisan Agro Seed & Fertilizer',
            'plan' => 'GST Billing Software + Whatsapp Message suite',
            'has_ecommerce' => false,
        ],
    ];

    $shop = null;
    $hasEcommerce = false;

    try {
        $dbShop = \Illuminate\Support\Facades\DB::connection('mysql')->table('shops')->where('shop_code', $normalizedCode)->first();
        if ($dbShop) {
            $settings = json_decode($dbShop->settings, true) ?: [];
            $hasEcommerce = !empty($settings['has_ecommerce']);
            $shop = [
                'name' => $dbShop->name,
                'plan' => $settings['plan_name'] ?? 'GST Billing Software',
                'has_ecommerce' => $hasEcommerce,
            ];
        }
    } catch (\Throwable $e) {}

    if (!$shop) {
        $shop = $shops[$normalizedCode] ?? [
            'name' => 'Retail Merchant Counter',
            'plan' => 'GST Billing Software',
            'has_ecommerce' => false,
        ];
        $hasEcommerce = $shop['has_ecommerce'];
    }

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
})->where('storeCode', '^(STORE[0-9A-Z]+|SHP-[0-9A-Z]+)$');

// Single Page Application (SPA) catch-all route (matching cashbez architecture)
// Handles direct URLs: /shop-admin, /shop-admin/products, /shop-admin/orders, /shop-admin/inventory, etc.
Route::get('/{any}', function () {
    $theme = request()->cookie('shoppy_erp_theme', 'light');
    $isDark = ($theme === 'dark');
    return response()
        ->view('app', [
            'entry' => 'app',
            'title' => 'Ramesh Fashion ERP — Enterprise Retail & POS Dashboard',
            'shopCode' => 'SHP-A4IFYK',
            'htmlClass' => $isDark ? 'h-full bg-slate-950 text-slate-100 dark' : 'h-full bg-[#f4f7fa] text-slate-800',
            'bodyClass' => $isDark ? 'min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white' : 'min-h-full flex flex-col bg-[#f4f7fa] text-slate-800 selection:bg-cyan-500 selection:text-white',
        ])
        ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
        ->header('Pragma', 'no-cache')
        ->header('Expires', '0');
})->where('any', '.*');

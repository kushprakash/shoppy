<?php

use App\Http\Controllers\Central\CentralAdminController;
use App\Http\Controllers\Central\MasterPortalApiController;
use App\Http\Controllers\Pos\PosController;
use App\Http\Controllers\Storefront\StorefrontController;
use App\Http\Controllers\Tenant\SettingsController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| 1. Central SaaS Admin & Master Portal API Routes (Real MySQL DB Persistence)
|--------------------------------------------------------------------------
*/
Route::prefix('master')->group(function () {
    // Subscription Plans (CRUD)
    Route::get('/plans', [MasterPortalApiController::class, 'getPlans']);
    Route::post('/plans', [MasterPortalApiController::class, 'createPlan']);
    Route::put('/plans/{code}', [MasterPortalApiController::class, 'updatePlan']);
    Route::delete('/plans/{code}', [MasterPortalApiController::class, 'deletePlan']);

    // Stores & Isolated Databases
    Route::get('/stores', [MasterPortalApiController::class, 'getStores']);
    Route::post('/stores/provision', [MasterPortalApiController::class, 'provisionStore']);
    Route::post('/stores/{shopCode}/toggle-ecommerce', [MasterPortalApiController::class, 'toggleEcommerce']);

    // Platform Branding & CMS Settings (Enexa IT Solutions Private Limited)
    Route::get('/settings', [MasterPortalApiController::class, 'getWebsiteSettings']);
    Route::post('/settings', [MasterPortalApiController::class, 'updateWebsiteSettings']);

    // Contact Leads & Inquiries
    Route::get('/leads', [MasterPortalApiController::class, 'getContactInquiries']);
    Route::patch('/leads/{id}/status', [MasterPortalApiController::class, 'updateLeadStatus']);

    // CMS Blogs Management
    Route::post('/blogs', [MasterPortalApiController::class, 'createBlog']);
    Route::delete('/blogs/{id}', [MasterPortalApiController::class, 'deleteBlog']);
});

// Public Dynamic Website APIs
Route::get('/public/landing-data', [MasterPortalApiController::class, 'getPublicLandingData']);
Route::get('/blogs', [MasterPortalApiController::class, 'getBlogs']);
Route::post('/contact', [MasterPortalApiController::class, 'submitContactInquiry']);

Route::prefix('central')->group(function () {
    Route::get('/stats', [CentralAdminController::class, 'getStats']);
    Route::get('/shops', [CentralAdminController::class, 'listShops']);
    Route::post('/shops/provision', [CentralAdminController::class, 'provisionShop']);
    Route::get('/agents', [CentralAdminController::class, 'listAgents']);
    Route::patch('/agents/{id}/status', [CentralAdminController::class, 'updateAgentStatus']);
    Route::get('/commissions', [CentralAdminController::class, 'listCommissions']);
});

/*
|--------------------------------------------------------------------------
| 2. Public Storefront Routes (SEO & Fast CDN Cache Friendly)
|--------------------------------------------------------------------------
| Handled by 'tenant' middleware to identify the current shop
*/
Route::prefix('storefront')->middleware('tenant')->group(function () {
    Route::get('/info', [StorefrontController::class, 'getStoreInfo']);
    Route::get('/catalog', [StorefrontController::class, 'getCatalog']);
    Route::get('/payment-methods', [StorefrontController::class, 'getCheckoutPaymentMethods']);
    Route::post('/calculate-shipping', [StorefrontController::class, 'calculateShipping']);
    Route::post('/order', [StorefrontController::class, 'createOrder']);
});

/*
|--------------------------------------------------------------------------
| 3. Tenant Shop Admin & Settings Routes
|--------------------------------------------------------------------------
| Private ERP, 5 Payment Gateways & 5 Courier Partner configurations
*/
Route::prefix('tenant')->middleware('tenant')->group(function () {
    // 5 Payment Gateways Settings
    Route::get('/settings/payment-gateways', [SettingsController::class, 'getPaymentGateways']);
    Route::post('/settings/payment-gateways/{code}', [SettingsController::class, 'updatePaymentGateway']);

    // 5 Shipping Providers Settings
    Route::get('/settings/shipping-providers', [SettingsController::class, 'getShippingProviders']);
    Route::post('/settings/shipping-providers/{code}', [SettingsController::class, 'updateShippingProvider']);
});

/*
|--------------------------------------------------------------------------
| 4. High-Speed POS Counter Billing Routes (<50ms)
|--------------------------------------------------------------------------
*/
Route::prefix('pos')->middleware('tenant')->group(function () {
    Route::get('/products/search', [PosController::class, 'searchProducts']);
    Route::post('/bill/create', [PosController::class, 'createBill']);
    Route::get('/shift/status', [PosController::class, 'getShiftStatus']);
    Route::post('/shift/open', [PosController::class, 'openShift']);
    Route::post('/shift/close', [PosController::class, 'closeShift']);
});

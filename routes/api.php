<?php

use App\Http\Controllers\Central\CentralAdminController;
use App\Http\Controllers\Central\MasterPortalApiController;
use App\Http\Controllers\Pos\PosController;
use App\Http\Controllers\Storefront\StorefrontController;
use App\Http\Controllers\Tenant\SettingsController;
use App\Http\Controllers\Tenant\TenantErpApiController;
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

    // Super Admin Authentication (Database central_admin_users verification)
    Route::post('/login', [MasterPortalApiController::class, 'login']);
    Route::post('/logout', [MasterPortalApiController::class, 'logout']);
    Route::get('/me', [MasterPortalApiController::class, 'me']);

    // CMS Blogs Management
    Route::post('/blogs', [MasterPortalApiController::class, 'createBlog']);
    Route::delete('/blogs/{id}', [MasterPortalApiController::class, 'deleteBlog']);
});

// Merchant Store Terminal Authentication (Database shops verification)
Route::post('/store/login', [MasterPortalApiController::class, 'storeLogin']);
Route::post('/store/forgot-password/send-otp', [MasterPortalApiController::class, 'forgotPasswordSendOtp']);
Route::post('/store/forgot-password/verify-otp', [MasterPortalApiController::class, 'forgotPasswordVerifyOtp']);
Route::post('/store/forgot-password/reset-password', [MasterPortalApiController::class, 'forgotPasswordReset']);

// Public Dynamic Website APIs
Route::get('/public/landing-data', [MasterPortalApiController::class, 'getPublicLandingData']);
Route::get('/public/gst-states', [MasterPortalApiController::class, 'getGstStates']);
Route::get('/public/verify-agent', [MasterPortalApiController::class, 'verifyAgent']);
Route::get('/tenant/gst-states', [MasterPortalApiController::class, 'getGstStates']);
Route::get('/blogs', [MasterPortalApiController::class, 'getBlogs']);
Route::get('/captcha', [MasterPortalApiController::class, 'generateCaptcha']);
Route::post('/contact', [MasterPortalApiController::class, 'submitContactInquiry']);
Route::post('/contacts', [MasterPortalApiController::class, 'submitContactInquiry']);

// Agent Partner Portal Authentication & Dashboard APIs
Route::post('/agent/login', [MasterPortalApiController::class, 'agentLogin']);
Route::get('/agent/dashboard', [MasterPortalApiController::class, 'getAgentDashboard']);

// Master Super Admin Agent Network Management & Reward APIs
Route::get('/master/agents', [MasterPortalApiController::class, 'getSuperAdminAgents']);
Route::post('/master/agents/create', [MasterPortalApiController::class, 'createAgent']);
Route::post('/master/agents/{id}/update', [MasterPortalApiController::class, 'updateAgent']);
Route::post('/master/agents/add-reward', [MasterPortalApiController::class, 'addAgentReward']);

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

    // Store Branding, Identity, Footer, SEO, SMS & SMTP Settings
    Route::get('/settings/branding', [SettingsController::class, 'getStoreBrandingSettings']);
    Route::post('/settings/branding', [SettingsController::class, 'updateStoreBrandingSettings']);
    Route::post('/settings/upload-image', [SettingsController::class, 'uploadBrandingImage']);
    Route::post('/settings/test-smtp', [SettingsController::class, 'testSmtpConnection']);
    Route::post('/settings/test-sms', [SettingsController::class, 'testSmsConnection']);
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

/*
|--------------------------------------------------------------------------
| 5. Production Tenant Store ERP Data API (Real MySQL DB Persistence)
|--------------------------------------------------------------------------
*/
Route::prefix('tenant/erp')->group(function () {
    Route::get('/init', [TenantErpApiController::class, 'getInitData']);
    Route::post('/products', [TenantErpApiController::class, 'saveProduct']);
    Route::delete('/products/{id}', [TenantErpApiController::class, 'deleteProduct']);
    Route::post('/orders', [TenantErpApiController::class, 'saveOrder']);
    Route::post('/roles', [TenantErpApiController::class, 'saveRole']);
});

/*
|--------------------------------------------------------------------------
| 6. PayU Money Payment Gateway Routes (Store Signup & Renewal)
|--------------------------------------------------------------------------
*/
Route::prefix('payu')->group(function () {
    Route::post('/initiate', [\App\Http\Controllers\Central\PayUController::class, 'initiate']);
    Route::post('/verify', [\App\Http\Controllers\Central\PayUController::class, 'verifyAndComplete']);
    Route::match(['get', 'post'], '/callback/{result}', [\App\Http\Controllers\Central\PayUController::class, 'handleCallback']);
    Route::get('/passbook', [\App\Http\Controllers\Central\PayUController::class, 'getPassbook']);
    Route::get('/status', [\App\Http\Controllers\Central\PayUController::class, 'getSubscriptionStatus']);
});

/*
|--------------------------------------------------------------------------
| 7. Paytm UPI Intent & Dynamic QR Gateway Routes (Store Signup & Renewal)
|--------------------------------------------------------------------------
*/
Route::prefix('paytm')->group(function () {
    Route::post('/initiate-upi', [\App\Http\Controllers\Central\PaytmController::class, 'initiateUpiIntent']);
    Route::post('/verify', [\App\Http\Controllers\Central\PaytmController::class, 'verifyPayment']);
    Route::get('/order-status', [\App\Http\Controllers\Central\PaytmController::class, 'checkOrderStatus']);
});

// Tenant Subscription & Payment Passbook Routes
Route::prefix('tenant/subscription')->group(function () {
    Route::get('/passbook', [\App\Http\Controllers\Central\PayUController::class, 'getPassbook']);
    Route::get('/status', [\App\Http\Controllers\Central\PayUController::class, 'getSubscriptionStatus']);
});

// Direct Mail Trigger Routes
Route::get('/credential-mail-send', [\App\Http\Controllers\Central\PaytmController::class, 'sendCredentialMailByShopCode']);
Route::get('/invoice-mail-send', [\App\Http\Controllers\Central\PaytmController::class, 'sendInvoiceMailByShopCode']);

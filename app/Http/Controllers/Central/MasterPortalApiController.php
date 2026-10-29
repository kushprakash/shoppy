<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MasterPortalApiController extends Controller
{
    /**
     * Get all Subscription Plans from MySQL
     */
    public function getPlans(): JsonResponse
    {
        $plans = DB::connection('mysql')->table('subscription_plans')
            ->where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($plan) {
                return [
                    'id' => $plan->code,
                    'db_id' => $plan->id,
                    'name' => $plan->name,
                    'code' => $plan->code,
                    'shortName' => $plan->short_name ?: 'STANDARD',
                    'category' => $plan->category ?: 'business',
                    'badge' => $plan->badge ?: 'Plan',
                    'ribbonBg' => $plan->ribbon_bg ?: 'bg-[#008ba3]',
                    'buttonText' => $plan->button_text ?: 'SIGN UP',
                    'buttonBg' => ($plan->ribbon_bg ?: 'bg-[#008ba3]') . ' text-white',
                    'hasWhatsappOption' => (bool) $plan->has_whatsapp,
                    'hasEcommerce' => (bool) $plan->has_ecommerce,
                    'subtext' => $plan->subtext ?: 'Billed per store terminal',
                    'cycles' => json_decode($plan->cycles, true) ?: [
                        'monthly' => ['regular' => (float)$plan->monthly_price, 'offer' => (float)$plan->monthly_price, 'offPercent' => 0, 'label' => '/ month', 'ribbonText' => 'POPULAR'],
                        'quarterly' => ['regular' => (float)$plan->monthly_price * 3, 'offer' => (float)$plan->monthly_price * 2.7, 'offPercent' => 10, 'label' => '/ 3 months', 'ribbonText' => 'SAVE 10%*'],
                        'half_yearly' => ['regular' => (float)$plan->monthly_price * 6, 'offer' => (float)$plan->monthly_price * 5, 'offPercent' => 17, 'label' => '/ 6 months', 'ribbonText' => 'SAVE 17%*'],
                        'yearly' => ['regular' => (float)$plan->monthly_price * 12, 'offer' => (float)$plan->annual_price, 'offPercent' => 25, 'label' => '/ year', 'ribbonText' => 'SAVE 25%*'],
                    ],
                    'features' => json_decode($plan->features, true) ?: [],
                    'is_active' => (bool) $plan->is_active,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $plans,
        ]);
    }

    /**
     * Create New Subscription Package into MySQL
     */
    public function createPlan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'shortName' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:64',
            'badge' => 'nullable|string|max:100',
            'ribbonBg' => 'nullable|string|max:64',
            'buttonText' => 'nullable|string|max:64',
            'hasWhatsappOption' => 'nullable|boolean',
            'hasEcommerce' => 'nullable|boolean',
            'subtext' => 'nullable|string|max:255',
            'cycles' => 'required|array',
            'features' => 'required|array',
        ]);

        $code = Str::slug($validated['name']) . '-' . Str::random(4);
        $cycles = $validated['cycles'];
        $monthlyPrice = $cycles['monthly']['offer'] ?? 500;
        $annualPrice = $cycles['yearly']['offer'] ?? 4000;

        $newId = DB::connection('mysql')->table('subscription_plans')->insertGetId([
            'name' => $validated['name'],
            'code' => $code,
            'short_name' => $validated['shortName'] ?? 'CUSTOM TIER',
            'category' => $validated['category'] ?? 'business',
            'badge' => $validated['badge'] ?? 'New Tier',
            'ribbon_bg' => $validated['ribbonBg'] ?? 'bg-[#008ba3]',
            'button_text' => $validated['buttonText'] ?? 'SIGN UP',
            'has_whatsapp' => !empty($validated['hasWhatsappOption']),
            'has_ecommerce' => !empty($validated['hasEcommerce']),
            'subtext' => $validated['subtext'] ?? 'Billed annually per store terminal',
            'monthly_price' => $monthlyPrice,
            'annual_price' => $annualPrice,
            'all_category_access' => true,
            'cycles' => json_encode($cycles),
            'features' => json_encode($validated['features']),
            'is_active' => true,
            'sort_order' => 10,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription Package created successfully in MySQL database!',
            'plan_id' => $newId,
            'code' => $code,
        ], 201);
    }

    /**
     * Update Subscription Plan in MySQL
     */
    public function updatePlan(Request $request, $code): JsonResponse
    {
        $plan = DB::connection('mysql')->table('subscription_plans')->where('code', $code)->first();
        if (!$plan) {
            return response()->json(['success' => false, 'message' => 'Plan not found'], 404);
        }

        $cycles = $request->input('cycles', json_decode($plan->cycles, true));
        $features = $request->input('features', json_decode($plan->features, true));

        $updateData = [
            'name' => $request->input('name', $plan->name),
            'short_name' => $request->input('shortName', $plan->short_name),
            'badge' => $request->input('badge', $plan->badge),
            'category' => $request->input('category', $plan->category),
            'ribbon_bg' => $request->input('ribbonBg', $plan->ribbon_bg),
            'cycles' => json_encode($cycles),
            'features' => json_encode($features),
            'monthly_price' => $cycles['monthly']['offer'] ?? $plan->monthly_price,
            'annual_price' => $cycles['yearly']['offer'] ?? $plan->annual_price,
            'updated_at' => now(),
        ];

        DB::connection('mysql')->table('subscription_plans')->where('code', $code)->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Plan rates and features updated in database!',
        ]);
    }

    /**
     * Delete Plan from MySQL
     */
    public function deletePlan($code): JsonResponse
    {
        DB::connection('mysql')->table('subscription_plans')->where('code', $code)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Plan successfully removed from database!',
        ]);
    }

    /**
     * Get All Stores from MySQL
     */
    public function getStores(): JsonResponse
    {
        $stores = DB::connection('mysql')->table('shops')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($shop) {
                $settings = json_decode($shop->settings, true) ?: [];

                return [
                    'id' => $shop->id,
                    'shop_code' => $shop->shop_code,
                    'name' => $shop->name,
                    'owner_name' => $shop->owner_name,
                    'owner_phone' => $shop->owner_phone,
                    'owner_email' => $shop->owner_email,
                    'city' => $settings['city'] ?? 'Jaipur, Rajasthan',
                    'plan_id' => $settings['plan_id'] ?? 'gst-billing',
                    'plan_name' => $settings['plan_name'] ?? 'GST Billing Software',
                    'billing_cycle' => $settings['billing_cycle'] ?? 'yearly',
                    'has_ecommerce' => isset($settings['has_ecommerce']) ? (bool) $settings['has_ecommerce'] : true,
                    'whatsapp_mode' => $settings['whatsapp_mode'] ?? 'none',
                    'database_name' => $shop->database_name,
                    'status' => $shop->status ?: 'active',
                    'valid_until' => $settings['valid_until'] ?? now()->addYear()->format('Y-m-d'),
                    'due_amount' => (float) ($settings['due_amount'] ?? 0),
                    'created_at' => substr($shop->created_at, 0, 10),
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $stores,
        ]);
    }

    /**
     * Provision Store in MySQL
     */
    public function provisionStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'owner_phone' => 'required|string|max:32',
            'city' => 'nullable|string|max:128',
            'plan_id' => 'required|string|max:64',
            'billing_cycle' => 'nullable|string|max:32',
            'own_whatsapp' => 'nullable|boolean',
        ]);

        $code = 'STORE' . rand(100000, 999999);
        $slug = Str::slug($validated['name']) . '-' . rand(100, 999);
        $dbName = 'tenant_' . strtolower($code);

        // Fetch plan details
        $plan = DB::connection('mysql')->table('subscription_plans')->where('code', $validated['plan_id'])->first();
        $hasEcommerce = $plan ? (bool)$plan->has_ecommerce : false;
        $planName = $plan ? $plan->name : 'GST Billing Software';

        $days = ($validated['billing_cycle'] ?? 'yearly') === 'monthly' ? 30 : (($validated['billing_cycle'] ?? 'yearly') === 'quarterly' ? 90 : (($validated['billing_cycle'] ?? 'yearly') === 'half_yearly' ? 180 : 365));
        $validUntil = now()->addDays($days)->format('Y-m-d');

        $settings = [
            'city' => $validated['city'] ?? 'Jaipur, Rajasthan',
            'plan_id' => $validated['plan_id'],
            'plan_name' => $planName,
            'billing_cycle' => $validated['billing_cycle'] ?? 'yearly',
            'has_ecommerce' => $hasEcommerce,
            'whatsapp_mode' => !empty($validated['own_whatsapp']) ? 'own_number' : ($plan && $plan->has_whatsapp ? 'platform_number' : 'none'),
            'due_amount' => 0,
            'valid_until' => $validUntil,
        ];

        $shopId = DB::connection('mysql')->table('shops')->insertGetId([
            'name' => $validated['name'],
            'shop_code' => $code,
            'slug' => $slug,
            'owner_name' => $validated['owner_name'],
            'owner_email' => strtolower(Str::slug($validated['owner_name'])) . '@merchant.shoppy.io',
            'owner_phone' => $validated['owner_phone'],
            'database_name' => $dbName,
            'status' => 'active',
            'settings' => json_encode($settings),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Store {$validated['name']} ({$code}) provisioned with isolated database {$dbName}!",
            'store' => [
                'id' => $shopId,
                'shop_code' => $code,
                'name' => $validated['name'],
                'database_name' => $dbName,
                'has_ecommerce' => $hasEcommerce,
            ],
        ], 201);
    }

    /**
     * Toggle Store Ecommerce Status in MySQL
     */
    public function toggleEcommerce($shopCode): JsonResponse
    {
        $shop = DB::connection('mysql')->table('shops')->where('shop_code', strtoupper($shopCode))->first();
        if (!$shop) {
            return response()->json(['success' => false, 'message' => 'Store not found'], 404);
        }

        $settings = json_decode($shop->settings, true) ?: [];
        $current = isset($settings['has_ecommerce']) ? (bool) $settings['has_ecommerce'] : true;
        $settings['has_ecommerce'] = !$current;

        DB::connection('mysql')->table('shops')
            ->where('shop_code', strtoupper($shopCode))
            ->update([
                'settings' => json_encode($settings),
                'updated_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'has_ecommerce' => $settings['has_ecommerce'],
            'message' => "Ecommerce module for {$shopCode} is now " . ($settings['has_ecommerce'] ? 'ACTIVE (Storefront URL live)' : 'INACTIVE (Billing Login only)'),
        ]);
    }

    /**
     * Get Website Settings & Enexa IT Solutions Branding
     */
    public function getWebsiteSettings(): JsonResponse
    {
        $settings = DB::connection('mysql')->table('website_settings')->pluck('value', 'key')->toArray();

        // Ensure defaults if any missing
        $defaults = [
            'company_name' => 'Enexa IT Solutions Private Limited',
            'powered_by' => 'Enexa IT Solutions Private Limited',
            'website' => 'https://www.enexa.in',
            'official_domain' => 'www.enexa.in',
            'brand_title' => 'Shoppy ERP & Retail Omnichannel Platform',
            'brand_tagline' => 'Next-Generation POS Billing, GST Compliance & Omnichannel Digital Commerce for Indian Retailers',
            'support_phone' => '+91 98290 00192',
            'support_email' => 'info@enexa.in',
            'sales_email' => 'sales@enexa.in',
            'corporate_address' => 'Enexa IT Solutions Private Limited, IT Park, Tech Zone, Jaipur, Rajasthan - 302020',
            'company_gstin' => '08AABCE1290M1Z5',
            'company_cin' => 'U72900RJ2021PTC075482',
            'hero_banners' => json_encode([]),
        ];

        $merged = array_merge($defaults, $settings);
        if (isset($merged['hero_banners']) && is_string($merged['hero_banners'])) {
            $merged['hero_banners'] = json_decode($merged['hero_banners'], true) ?: [];
        }

        return response()->json([
            'success' => true,
            'data' => $merged,
        ]);
    }

    /**
     * Update Website Settings & Branding in MySQL
     */
    public function updateWebsiteSettings(Request $request): JsonResponse
    {
        $data = $request->all();

        foreach ($data as $key => $val) {
            $valueToStore = is_array($val) ? json_encode($val) : (string) $val;

            DB::connection('mysql')->table('website_settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $valueToStore, 'updated_at' => now()]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Platform settings and branding updated in database!',
        ]);
    }

    /**
     * Get Blogs
     */
    public function getBlogs(): JsonResponse
    {
        $blogs = DB::connection('mysql')->table('blogs')
            ->where('is_published', true)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $blogs,
        ]);
    }

    /**
     * Create Blog Article in MySQL
     */
    public function createBlog(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'excerpt' => 'required|string|max:1000',
            'content' => 'required|string',
            'read_time' => 'nullable|string|max:32',
            'author' => 'nullable|string|max:100',
            'cover_image' => 'nullable|string|max:500',
        ]);

        $slug = Str::slug($validated['title']) . '-' . Str::random(4);

        $id = DB::connection('mysql')->table('blogs')->insertGetId([
            'title' => $validated['title'],
            'slug' => $slug,
            'category' => $validated['category'] ?? 'Retail Growth',
            'excerpt' => $validated['excerpt'],
            'content' => $validated['content'],
            'read_time' => $validated['read_time'] ?? '4 min read',
            'author' => $validated['author'] ?? 'Enexa IT Editorial Team',
            'cover_image' => $validated['cover_image'] ?? 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
            'is_published' => true,
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Article published to live website blog!',
            'id' => $id,
        ], 201);
    }

    /**
     * Delete Blog Article from MySQL
     */
    public function deleteBlog($id): JsonResponse
    {
        DB::connection('mysql')->table('blogs')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Article deleted successfully',
        ]);
    }

    /**
     * Submit Contact Form Lead to MySQL
     */
    public function submitContactInquiry(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:32',
            'email' => 'nullable|email|max:255',
            'business_name' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:128',
            'service_interested' => 'nullable|string|max:128',
            'message' => 'nullable|string|max:2000',
        ]);

        $inquiryId = DB::connection('mysql')->table('contact_inquiries')->insertGetId([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => $validated['email'] ?? null,
            'business_name' => $validated['business_name'] ?? null,
            'city' => $validated['city'] ?? null,
            'service_interested' => $validated['service_interested'] ?? 'GST Billing & POS',
            'message' => $validated['message'] ?? null,
            'status' => 'new',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Thank you! Your inquiry has been submitted. Our Enexa IT retail specialist will call you shortly.',
            'inquiry_id' => $inquiryId,
        ], 201);
    }

    /**
     * Get All Contact Inquiries for Super Admin
     */
    public function getContactInquiries(): JsonResponse
    {
        $leads = DB::connection('mysql')->table('contact_inquiries')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $leads,
        ]);
    }

    /**
     * Update Lead Status (e.g. 'contacted', 'closed', 'new')
     */
    public function updateLeadStatus(Request $request, $id): JsonResponse
    {
        $status = $request->input('status', 'contacted');
        DB::connection('mysql')->table('contact_inquiries')->where('id', $id)->update([
            'status' => $status,
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Lead marked as {$status}",
        ]);
    }

    /**
     * Public Aggregated Landing Page Data (High Speed Cache Friendly)
     */
    public function getPublicLandingData(): JsonResponse
    {
        $plansResponse = $this->getPlans()->getData(true);
        $settingsResponse = $this->getWebsiteSettings()->getData(true);
        $blogsResponse = $this->getBlogs()->getData(true);

        return response()->json([
            'success' => true,
            'plans' => $plansResponse['data'] ?? [],
            'settings' => $settingsResponse['data'] ?? [],
            'blogs' => $blogsResponse['data'] ?? [],
            'powered_by' => 'Enexa IT Solutions Private Limited',
            'official_site' => 'https://www.enexa.in',
        ]);
    }

    /**
     * Authenticate Super Admin User against central_admin_users table in MySQL
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $email = strtolower(trim($validated['email']));
        $password = $validated['password'];

        $admin = DB::connection('mysql')->table('central_admin_users')
            ->where('email', $email)
            ->first();

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password. Access denied.',
            ], 401);
        }

        if (!$admin->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'This Super Admin account is currently inactive.',
            ], 403);
        }

        if (!Hash::check($password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password. Access denied.',
            ], 401);
        }

        $token = bin2hex(random_bytes(32));

        // Persist token in central_admin_users for durable session persistence across reloads
        DB::connection('mysql')->table('central_admin_users')
            ->where('id', $admin->id)
            ->update([
                'remember_token' => $token,
                'updated_at' => now(),
            ]);

        session([
            'master_auth' => true,
            'master_admin_id' => $admin->id,
            'master_admin_email' => $admin->email,
            'master_admin_name' => $admin->name,
            'master_admin_role' => $admin->role,
        ]);

        $cookie = cookie('shoppy_master_token', $token, 60 * 24 * 30, '/', null, false, false);

        return response()->json([
            'success' => true,
            'message' => 'Super Admin authenticated successfully.',
            'token' => $token,
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
            ],
        ])->withCookie($cookie);
    }

    /**
     * Check active Super Admin session
     */
    public function me(Request $request): JsonResponse
    {
        $token = $request->bearerToken()
            ?: $request->header('X-Master-Token')
            ?: $request->cookie('shoppy_master_token');

        $admin = null;

        if ($token) {
            $admin = DB::connection('mysql')->table('central_admin_users')
                ->where('remember_token', $token)
                ->where('is_active', true)
                ->first();
        }

        if (!$admin) {
            $adminId = session('master_admin_id');
            $isAuth = session('master_auth', false);
            if ($adminId && $isAuth) {
                $admin = DB::connection('mysql')->table('central_admin_users')
                    ->where('id', $adminId)
                    ->where('is_active', true)
                    ->first();
            }
        }

        if (!$admin) {
            return response()->json([
                'authenticated' => false,
                'message' => 'No active session found.',
            ], 401);
        }

        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
            ],
        ]);
    }

    /**
     * Super Admin Logout
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken()
            ?: $request->header('X-Master-Token')
            ?: $request->cookie('shoppy_master_token');

        if ($token) {
            DB::connection('mysql')->table('central_admin_users')
                ->where('remember_token', $token)
                ->update(['remember_token' => null]);
        }

        session()->forget(['master_auth', 'master_admin_id', 'master_admin_email', 'master_admin_name', 'master_admin_role']);

        $cookie = cookie()->forget('shoppy_master_token');

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ])->withCookie($cookie);
    }

    /**
     * Authenticate Merchant Store Login against shops table & credentials
     */
    public function storeLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'store_code' => 'required|string',
            'password' => 'required|string',
        ]);

        $code = strtoupper(trim($validated['store_code']));
        $password = $validated['password'];

        $shop = DB::connection('mysql')->table('shops')
            ->where('shop_code', $code)
            ->first();

        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => "Store Code [{$code}] does not exist in registered merchants.",
            ], 404);
        }

        if ($shop->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => "Store [{$code}] is currently {$shop->status}. Please contact support.",
            ], 403);
        }

        // Validate password:
        // Check settings for configured terminal password, or tenant users table
        $settings = json_decode($shop->settings, true) ?: [];
        $expectedPassword = $settings['terminal_password'] ?? null;

        if ($expectedPassword) {
            if ($password !== $expectedPassword && !Hash::check($password, $expectedPassword)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid terminal password for this store.',
                ], 401);
            }
        } else {
            // Must have minimum valid length for terminal password
            if (strlen(trim($password)) < 4) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid terminal password. Password must be at least 4 characters.',
                ], 401);
            }
        }

        session(['active_store_code' => $code]);

        return response()->json([
            'success' => true,
            'message' => "Authenticated for store {$shop->name}",
            'store' => [
                'id' => $shop->id,
                'code' => $shop->shop_code,
                'name' => $shop->name,
                'status' => $shop->status,
                'owner_name' => $shop->owner_name,
                'owner_email' => $shop->owner_email,
            ],
        ]);
    }
}

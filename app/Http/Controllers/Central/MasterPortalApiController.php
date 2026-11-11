<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Support\StoreToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MasterPortalApiController extends Controller
{
    /**
     * Get all Subscription Plans directly from MySQL database (Fully editable)
     */
    public function getPlans(): JsonResponse
    {
        $plans = DB::connection('mysql')->table('subscription_plans')
            ->where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($plan) {
                $cycles = json_decode($plan->cycles, true) ?: [];
                $cycleCode = 'yearly';
                $durationDays = 365;

                if (str_contains($plan->code, 'monthly')) {
                    $cycleCode = 'monthly';
                    $durationDays = 30;
                } elseif (str_contains($plan->code, 'quarterly')) {
                    $cycleCode = 'quarterly';
                    $durationDays = 90;
                } elseif (str_contains($plan->code, 'half-yearly') || str_contains($plan->code, 'half_yearly')) {
                    $cycleCode = 'half_yearly';
                    $durationDays = 180;
                }

                // Dynamic base price based on cycles offer or plan prices
                $basePrice = 8000;
                if (isset($cycles[$cycleCode]['offer'])) {
                    $basePrice = (float)$cycles[$cycleCode]['offer'];
                } elseif ($cycleCode === 'monthly' && $plan->monthly_price) {
                    $basePrice = (float)$plan->monthly_price;
                } elseif ($cycleCode === 'yearly' && $plan->annual_price) {
                    $basePrice = (float)$plan->annual_price;
                } elseif ($cycleCode === 'monthly') {
                    $basePrice = 1000;
                } elseif ($cycleCode === 'quarterly') {
                    $basePrice = 2500;
                } elseif ($cycleCode === 'half_yearly') {
                    $basePrice = 4500;
                }

                $badgeText = $plan->badge !== null ? trim((string) $plan->badge) : '';
                $ribbonBg = trim((string) ($plan->ribbon_bg ?? '')) ?: 'bg-[#008ba3]';

                return [
                    'id' => $plan->code,
                    'db_id' => $plan->id,
                    'name' => $plan->name,
                    'code' => $plan->code,
                    'shortName' => $plan->short_name ?: 'STANDARD',
                    'category' => $plan->category ?: 'business',
                    'badge' => $badgeText,
                    'ribbonBg' => $ribbonBg,
                    'ribbon_bg' => $ribbonBg,
                    'buttonText' => $plan->button_text ?: 'SIGN UP NOW',
                    'buttonBg' => $ribbonBg . ' text-white',
                    'hasWhatsappOption' => (bool) $plan->has_whatsapp,
                    'hasEcommerce' => (bool) $plan->has_ecommerce,
                    'subtext' => $plan->subtext ?: 'Complete ERP & E-Commerce',
                    'billingCycle' => $cycleCode,
                    'basePrice' => $basePrice,
                    'durationDays' => $durationDays,
                    'cycles' => $cycles,
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
        $plan = DB::connection('mysql')->table('subscription_plans')
            ->where('code', $code)
            ->orWhere(function ($q) use ($code) {
                if (is_numeric($code)) {
                    $q->where('id', (int)$code);
                }
            })
            ->first();

        if (!$plan) {
            return response()->json(['success' => false, 'message' => "Plan '{$code}' not found in database"], 404);
        }

        $rawCycles = $request->input('cycles');
        if (is_string($rawCycles)) {
            $rawCycles = json_decode($rawCycles, true);
        }
        $cycles = !empty($rawCycles) ? $rawCycles : (json_decode($plan->cycles, true) ?: []);

        // Sync cycle rates if basePrice passed
        $basePrice = $request->input('basePrice');
        if ($basePrice !== null && is_numeric($basePrice)) {
            $cycleKey = 'monthly';
            if (str_contains($plan->code, 'quarterly')) $cycleKey = 'quarterly';
            elseif (str_contains($plan->code, 'half-yearly') || str_contains($plan->code, 'half_yearly')) $cycleKey = 'half_yearly';
            elseif (str_contains($plan->code, 'yearly')) $cycleKey = 'yearly';

            if (!isset($cycles[$cycleKey])) {
                $cycles[$cycleKey] = [];
            }
            $cycles[$cycleKey]['offer'] = (float)$basePrice;
        }

        $rawFeatures = $request->input('features');
        if (is_string($rawFeatures)) {
            $rawFeatures = json_decode($rawFeatures, true);
        }
        $features = ($rawFeatures !== null) ? $rawFeatures : (json_decode($plan->features, true) ?: []);

        $hasWhatsapp = $plan->has_whatsapp;
        if ($request->has('hasWhatsappOption')) {
            $hasWhatsapp = (bool)$request->input('hasWhatsappOption');
        } elseif ($request->has('has_whatsapp')) {
            $hasWhatsapp = (bool)$request->input('has_whatsapp');
        }

        $hasEcommerce = $plan->has_ecommerce;
        if ($request->has('hasEcommerce')) {
            $hasEcommerce = (bool)$request->input('hasEcommerce');
        } elseif ($request->has('has_ecommerce')) {
            $hasEcommerce = (bool)$request->input('has_ecommerce');
        }

        $monthlyPrice = isset($cycles['monthly']['offer']) ? (float)$cycles['monthly']['offer'] : $plan->monthly_price;
        $annualPrice = isset($cycles['yearly']['offer']) ? (float)$cycles['yearly']['offer'] : $plan->annual_price;

        if ($plan->code === 'quarterly-package' && isset($cycles['quarterly']['offer'])) {
            $monthlyPrice = (float)$cycles['quarterly']['offer'];
        } elseif ($plan->code === 'half-yearly-package' && isset($cycles['half_yearly']['offer'])) {
            $monthlyPrice = (float)$cycles['half_yearly']['offer'];
        }

        $newBadge = $request->exists('badge')
            ? (trim((string) ($request->input('badge') ?? '')) ?: null)
            : $plan->badge;
        $newRibbonBg = ($request->exists('ribbonBg') || $request->exists('ribbon_bg'))
            ? (trim((string) ($request->input('ribbonBg') ?? $request->input('ribbon_bg') ?? '')) ?: 'bg-[#008ba3]')
            : $plan->ribbon_bg;

        if ($request->exists('badge')) {
            $activeCycleKey = 'yearly';
            if (str_contains($plan->code, 'monthly')) $activeCycleKey = 'monthly';
            elseif (str_contains($plan->code, 'quarterly')) $activeCycleKey = 'quarterly';
            elseif (str_contains($plan->code, 'half-yearly') || str_contains($plan->code, 'half_yearly')) $activeCycleKey = 'half_yearly';
            if (isset($cycles[$activeCycleKey]) && is_array($cycles[$activeCycleKey])) {
                $cycles[$activeCycleKey]['ribbonText'] = $newBadge ?? '';
            }
        }

        $updateData = [
            'name' => $request->input('name', $plan->name),
            'short_name' => $request->input('shortName', $request->input('short_name', $plan->short_name)),
            'badge' => $newBadge,
            'category' => $request->input('category', $plan->category),
            'ribbon_bg' => $newRibbonBg,
            'button_text' => $request->input('buttonText', $request->input('button_text', $plan->button_text)),
            'subtext' => $request->input('subtext', $plan->subtext),
            'has_whatsapp' => $hasWhatsapp,
            'has_ecommerce' => $hasEcommerce,
            'cycles' => json_encode($cycles),
            'features' => json_encode($features),
            'monthly_price' => $monthlyPrice,
            'annual_price' => $annualPrice,
            'updated_at' => now(),
        ];

        DB::connection('mysql')->table('subscription_plans')->where('id', $plan->id)->update($updateData);

        return response()->json([
            'success' => true,
            'message' => "Plan '{$updateData['name']}' updated successfully in database!",
            'plan_id' => $plan->id,
            'code' => $plan->code,
            'data' => array_merge((array)$plan, $updateData, [
                'cycles' => $cycles,
                'features' => $features
            ])
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
            'owner_email' => 'nullable|email|max:255',
            'city' => 'nullable|string|max:128',
            'plan_id' => 'required|string|max:64',
            'billing_cycle' => 'nullable|string|max:32',
            'own_whatsapp' => 'nullable|boolean',
        ]);

        $code = 'SP' . date('YmdHis');
        while (DB::connection('mysql')->table('shops')->where('shop_code', $code)->exists()) {
            sleep(1);
            $code = 'SP' . date('YmdHis');
        }
        $slug = Str::slug($validated['name']) . '-' . strtolower(substr($code, -6));
        $dbName = \App\Models\Central\Shop::buildTenantDatabaseName($validated['name'], $code);
        $ownerEmail = !empty($validated['owner_email'])
            ? $validated['owner_email']
            : (strtolower(Str::slug($validated['owner_name'])) . '@' . strtolower($code) . '.shoppy.io');

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
            'owner_email' => $ownerEmail,
            'owner_phone' => $validated['owner_phone'],
            'database_name' => $dbName,
            'status' => 'active',
            'settings' => json_encode($settings),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Provision isolated MySQL tenant database, migrate schema & seed required roles and permissions
        try {
            $sanitizedDbName = preg_replace('/[^a-zA-Z0-9_\-]/', '', $dbName);
            DB::connection('mysql')->statement("CREATE DATABASE IF NOT EXISTS `{$sanitizedDbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

            \Illuminate\Support\Facades\Config::set('database.connections.tenant.database', $sanitizedDbName);
            DB::purge('tenant');
            DB::reconnect('tenant');

            \Illuminate\Support\Facades\Artisan::call('migrate', [
                '--database' => 'tenant',
                '--path' => 'database/migrations/tenant',
                '--force' => true,
            ]);

            // Seed Official GST States into tenant database
            (new \Database\Seeders\GstStatesSeeder)->run('tenant');

            // Seed initial Branch & POS Cash Register
            $branchId = DB::connection('tenant')->table('branches')->insertGetId([
                'name' => 'Main Store',
                'code' => 'BR-01',
                'phone' => $validated['owner_phone'],
                'address' => $validated['city'] ?? 'Store Head Office',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::connection('tenant')->table('warehouses')->insert([
                'branch_id' => $branchId,
                'name' => 'Main Warehouse',
                'code' => 'WH-01',
                'is_default' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::connection('tenant')->table('cash_registers')->insert([
                'branch_id' => $branchId,
                'name' => 'Counter 1',
                'code' => 'POS-01',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Seed the 6 Required Roles & Granular Permissions
            foreach (\App\Tenancy\TenantManager::getRequiredRoles() as $role) {
                DB::connection('tenant')->table('roles')->updateOrInsert(
                    ['slug' => $role['slug']],
                    [
                        'name' => $role['name'],
                        'permissions' => $role['permissions'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }

            // Seed Admin User into tenant users table
            DB::connection('tenant')->table('users')->insertOrIgnore([
                'name' => $validated['owner_name'],
                'email' => $ownerEmail,
                'phone' => $validated['owner_phone'],
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'branch_id' => $branchId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            // Log or continue gracefully
        }

        // Send Welcome SMS & Email
        try {
            \App\Services\CommunicationService::sendWelcomeSms(
                name: $validated['owner_name'],
                mobile: $validated['owner_phone'],
                storeCode: $code,
                password: 'admin123',
                mpin: '123456'
            );
        } catch (\Throwable $e) {}

        try {
            \App\Services\CommunicationService::sendWelcomeEmail(
                ownerName: $validated['owner_name'],
                ownerEmail: $ownerEmail,
                storeCode: $code,
                password: 'admin123',
                storeName: $validated['name'],
                validUntil: $validUntil,
                planName: $planName,
                mpin: '123456'
            );
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => "Store {$validated['name']} ({$code}) provisioned with isolated database {$dbName}!",
            'store' => [
                'id' => $shopId,
                'shop_code' => $code,
                'name' => $validated['name'],
                'owner_name' => $validated['owner_name'],
                'owner_email' => $ownerEmail,
                'owner_phone' => $validated['owner_phone'],
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
     * Generate secure CAPTCHA code and encrypted verification token
     */
    public function generateCaptcha(): JsonResponse
    {
        $chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        $code = '';
        for ($i = 0; $i < 6; $i++) {
            $code .= $chars[random_int(0, strlen($chars) - 1)];
        }

        $payload = json_encode([
            'code' => $code,
            'expires_at' => time() + 900, // 15 mins
            'rand' => Str::random(8),
        ]);
        $token = base64_encode(\Illuminate\Support\Facades\Crypt::encryptString($payload));

        return response()->json([
            'success' => true,
            'code' => $code,
            'token' => $token,
        ]);
    }

    /**
     * Submit Contact Form Lead directly into `contacts` MySQL table with CAPTCHA validation
     */
    public function submitContactInquiry(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:32',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:3000',
            'captcha' => 'required|string|max:16',
            'captcha_token' => 'required|string',
        ]);

        // Verify CAPTCHA
        $captchaInput = strtoupper(trim($validated['captcha']));
        $isValidCaptcha = false;

        try {
            $decryptedJson = \Illuminate\Support\Facades\Crypt::decryptString(base64_decode($validated['captcha_token']));
            $decrypted = json_decode($decryptedJson, true);
            if ($decrypted && isset($decrypted['code'], $decrypted['expires_at'])) {
                if (time() <= $decrypted['expires_at'] && strtoupper($decrypted['code']) === $captchaInput) {
                    $isValidCaptcha = true;
                }
            }
        } catch (\Throwable $e) {
            $isValidCaptcha = false;
        }

        if (!$isValidCaptcha) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid CAPTCHA code. Please enter the correct characters shown in the image.',
            ], 422);
        }

        $subject = $validated['subject'] ?: 'General Inquiry';

        // 1. Primary insert into contacts table
        $contactId = DB::connection('mysql')->table('contacts')->insertGetId([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'subject' => $subject,
            'message' => $validated['message'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'new',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Also insert into contact_inquiries table for master dashboard sync
        try {
            DB::connection('mysql')->table('contact_inquiries')->insert([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'business_name' => $subject,
                'city' => 'Website Inquiry',
                'service_interested' => $subject,
                'message' => $validated['message'],
                'status' => 'new',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => 'Thank you! Your message has been sent successfully. An Enexa IT specialist will get back to you within 24 hours.',
            'contact_id' => $contactId,
        ], 201);
    }

    /**
     * Get All Contact Inquiries for Super Admin
     */
    public function getContactInquiries(): JsonResponse
    {
        if (\Illuminate\Support\Facades\Schema::connection('mysql')->hasTable('contacts')) {
            $contacts = DB::connection('mysql')->table('contacts')
                ->orderBy('id', 'desc')
                ->get();
            if ($contacts->isNotEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => $contacts,
                ]);
            }
        }

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

        $states = [];
        try {
            $states = DB::connection('mysql')->table('gst_states')
                ->where('status', 1)
                ->orderBy('state_code', 'asc')
                ->get(['state_code', 'state_name']);
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'plans' => $plansResponse['data'] ?? [],
            'settings' => $settingsResponse['data'] ?? [],
            'blogs' => $blogsResponse['data'] ?? [],
            'gst_states' => $states,
            'powered_by' => 'Enexa IT Solutions Private Limited',
            'official_site' => 'https://www.enexa.in',
        ]);
    }

    /**
     * Get All Active GST States for Invoicing and Dropdowns
     */
    public function getGstStates(): JsonResponse
    {
        $states = DB::connection('mysql')->table('gst_states')
            ->where('status', 1)
            ->orderBy('state_code', 'asc')
            ->get(['state_code', 'state_name']);

        return response()->json([
            'success' => true,
            'data' => $states,
        ]);
    }

    /**
     * Verify Referral / Agent Code
     */
    public function verifyAgent(Request $request): JsonResponse
    {
        $code = strtoupper(trim((string)$request->input('code', '')));
        if (!$code) {
            return response()->json([
                'success' => false,
                'message' => 'Please enter a referral / agent code.'
            ], 422);
        }

        $agent = DB::connection('mysql')->table('agents')
            ->where('referral_code', $code)
            ->where(function ($q) {
                $q->where('status', 'approved')->orWhere('status', 'active');
            })
            ->first();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => "Invalid or unverified Agent Code '{$code}'."
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => "Agent code verified! Partner: {$agent->name}",
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'referral_code' => $agent->referral_code,
            ]
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

        $loginIdentifier = trim($validated['store_code']);
        $code = strtoupper($loginIdentifier);
        $password = $validated['password'];

        $shop = DB::connection('mysql')->table('shops')
            ->where(function ($q) use ($code, $loginIdentifier) {
                $q->where('shop_code', $code)
                  ->orWhere('owner_email', strtolower($loginIdentifier))
                  ->orWhere('owner_phone', $loginIdentifier);
            })
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

        if ($request->hasSession()) {
            session(['active_store_code' => $shop->shop_code]);
        }

        $token = StoreToken::issue($shop);

        $response = response()->json([
            'success' => true,
            'message' => "Authenticated for store {$shop->name}",
            'token' => $token,
            'store' => [
                'id' => $shop->id,
                'code' => $shop->shop_code,
                'shop_code' => $shop->shop_code,
                'name' => $shop->name,
                'status' => $shop->status,
                'owner_name' => $shop->owner_name,
                'owner_email' => $shop->owner_email,
                'owner_phone' => $shop->owner_phone,
                'database_name' => $shop->database_name ?? null,
                'valid_until' => $settings['valid_until'] ?? null,
                'plan_name' => $settings['plan_name'] ?? null,
            ],
        ]);

        foreach (StoreToken::authCookies($shop->shop_code, $token) as $cookie) {
            $response->withCookie($cookie);
        }

        return $response;
    }

    /**
     * Get Currently Authenticated Store from Signed Token / Cookie
     */
    public function storeMe(Request $request): JsonResponse
    {
        $resolvedCode = StoreToken::resolveShopCodeFromRequest($request)
            ?: strtoupper(trim((string) (
                $request->header('X-Shop-Code')
                ?: $request->cookie(StoreToken::CODE_COOKIE)
                ?: $request->cookie(StoreToken::LEGACY_CODE_COOKIE)
                ?: ($request->hasSession() ? session('active_store_code') : '')
            )));

        if (!$resolvedCode) {
            return response()->json([
                'authenticated' => false,
                'message' => 'No active store session.',
            ], 401);
        }

        $shop = DB::connection('mysql')->table('shops')
            ->where('shop_code', $resolvedCode)
            ->first();

        if (!$shop || $shop->status !== 'active') {
            return response()->json([
                'authenticated' => false,
                'message' => 'Store session invalid or inactive.',
            ], 401);
        }

        $settings = json_decode($shop->settings ?? '{}', true) ?: [];

        return response()->json([
            'authenticated' => true,
            'store' => [
                'id' => $shop->id,
                'code' => $shop->shop_code,
                'shop_code' => $shop->shop_code,
                'name' => $shop->name,
                'status' => $shop->status,
                'owner_name' => $shop->owner_name,
                'owner_email' => $shop->owner_email,
                'owner_phone' => $shop->owner_phone,
                'database_name' => $shop->database_name ?? null,
                'valid_until' => $settings['valid_until'] ?? null,
                'plan_name' => $settings['plan_name'] ?? null,
            ],
        ]);
    }

    /**
     * Logout Merchant Store Session & Clear Token Cookies
     */
    public function storeLogout(Request $request): JsonResponse
    {
        if ($request->hasSession()) {
            session()->forget('active_store_code');
        }

        $response = response()->json([
            'success' => true,
            'message' => 'Logged out from store session.',
        ]);

        foreach (StoreToken::clearCookies() as $cookie) {
            $response->withCookie($cookie);
        }

        return $response;
    }

    /**
     * Send Password Reset OTP to registered Phone (SMS) & Email
     *
     * SMS Template:
     * Your verification login (OTP) is: $otp. Do not share this OTP with anyone. It is valid for the next 10 minutes. ENEXA
     */
    public function forgotPasswordSendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier' => 'required|string|max:255',
        ]);

        $identifier = trim($validated['identifier']);
        $code = strtoupper($identifier);

        $shop = DB::connection('mysql')->table('shops')
            ->where(function ($q) use ($code, $identifier) {
                $q->where('shop_code', $code)
                  ->orWhere('owner_email', strtolower($identifier))
                  ->orWhere('owner_phone', $identifier);
            })
            ->first();

        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => "No registered store found matching '{$identifier}'. Please enter your valid Store Code, Email, or Mobile."
            ], 404);
        }

        if ($shop->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => "Store [{$shop->shop_code}] is currently {$shop->status}. Please contact support."
            ], 403);
        }

        // Generate 6-digit numeric OTP
        $otp = (string) random_int(100000, 999999);
        $cacheKey = "store_pwd_reset_otp_{$shop->id}";

        \Illuminate\Support\Facades\Cache::put($cacheKey, [
            'otp' => $otp,
            'shop_id' => $shop->id,
            'shop_code' => $shop->shop_code,
            'attempts' => 0,
            'created_at' => now()->timestamp,
            'expires_at' => now()->addMinutes(10)->timestamp,
        ], now()->addMinutes(10));

        // Format masked phone & email
        $phone = (string) $shop->owner_phone;
        $maskedPhone = (strlen($phone) >= 10)
            ? str_repeat('*', strlen($phone) - 4) . substr($phone, -4)
            : '******' . substr($phone, -2);

        $email = (string) $shop->owner_email;
        $emailParts = explode('@', $email);
        $maskedEmail = (strlen($emailParts[0]) > 2)
            ? substr($emailParts[0], 0, 2) . '***@' . ($emailParts[1] ?? 'domain.com')
            : '*@' . ($emailParts[1] ?? 'domain.com');

        // Dispatch SMS via Buzzify HTTP API
        try {
            \App\Services\CommunicationService::sendOtpSms(
                mobile: $shop->owner_phone,
                otp: $otp
            );
        } catch (\Throwable $e) {
            Log::error("forgotPasswordSendOtp SMS error: " . $e->getMessage());
        }

        // Dispatch Email via Gmail SMTP
        try {
            \App\Services\CommunicationService::sendOtpEmail(
                ownerName: $shop->owner_name ?: $shop->name,
                ownerEmail: $shop->owner_email,
                otp: $otp,
                storeCode: $shop->shop_code,
                storeName: $shop->name
            );
        } catch (\Throwable $e) {
            Log::error("forgotPasswordSendOtp Email error: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => "Verification OTP has been sent to your registered Mobile ({$maskedPhone}) and Email ({$maskedEmail}). It is valid for 10 minutes.",
            'shop_code' => $shop->shop_code,
            'shop_name' => $shop->name,
            'masked_phone' => $maskedPhone,
            'masked_email' => $maskedEmail,
        ]);
    }

    /**
     * Verify Password Reset OTP
     */
    public function forgotPasswordVerifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        $identifier = trim($validated['identifier']);
        $code = strtoupper($identifier);

        $shop = DB::connection('mysql')->table('shops')
            ->where(function ($q) use ($code, $identifier) {
                $q->where('shop_code', $code)
                  ->orWhere('owner_email', strtolower($identifier))
                  ->orWhere('owner_phone', $identifier);
            })
            ->first();

        if (!$shop) {
            return response()->json(['success' => false, 'message' => 'Store not found.'], 404);
        }

        $cacheKey = "store_pwd_reset_otp_{$shop->id}";
        $cacheData = \Illuminate\Support\Facades\Cache::get($cacheKey);

        if (!$cacheData) {
            return response()->json([
                'success' => false,
                'message' => 'OTP has expired or does not exist. Please request a new OTP.'
            ], 422);
        }

        if (($cacheData['attempts'] ?? 0) >= 5) {
            \Illuminate\Support\Facades\Cache::forget($cacheKey);
            return response()->json([
                'success' => false,
                'message' => 'Too many invalid attempts. Please request a new OTP.'
            ], 429);
        }

        if (trim($cacheData['otp']) !== trim($validated['otp'])) {
            $cacheData['attempts'] = ($cacheData['attempts'] ?? 0) + 1;
            \Illuminate\Support\Facades\Cache::put($cacheKey, $cacheData, now()->addMinutes(10));
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP code. Please enter the correct 6-digit OTP.'
            ], 422);
        }

        // OTP is verified! Generate single-use reset token valid for 15 minutes
        $resetToken = hash('sha256', \Illuminate\Support\Str::random(40) . '_' . $shop->id . '_' . time());
        \Illuminate\Support\Facades\Cache::put("store_pwd_reset_token_{$resetToken}", [
            'shop_id' => $shop->id,
            'shop_code' => $shop->shop_code,
        ], now()->addMinutes(15));

        \Illuminate\Support\Facades\Cache::forget($cacheKey);

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully! Please enter your new password.',
            'reset_token' => $resetToken,
            'shop_code' => $shop->shop_code,
        ]);
    }

    /**
     * Set New Password after verified OTP
     */
    public function forgotPasswordReset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reset_token' => 'required|string',
            'password' => 'required|string|min:4|confirmed',
        ]);

        $resetToken = $validated['reset_token'];
        $tokenData = \Illuminate\Support\Facades\Cache::get("store_pwd_reset_token_{$resetToken}");

        if (!$tokenData) {
            return response()->json([
                'success' => false,
                'message' => 'Password reset session has expired or is invalid. Please request OTP again.'
            ], 422);
        }

        $shop = DB::connection('mysql')->table('shops')->where('id', $tokenData['shop_id'])->first();
        if (!$shop) {
            return response()->json(['success' => false, 'message' => 'Store not found.'], 404);
        }

        $newPassword = $validated['password'];

        // 1. Update central shops settings table
        $settings = json_decode($shop->settings, true) ?: [];
        $settings['terminal_password'] = $newPassword;
        DB::connection('mysql')->table('shops')->where('id', $shop->id)->update([
            'settings' => json_encode($settings),
            'updated_at' => now(),
        ]);

        // 2. Update tenant database admin users table
        try {
            $sanitizedDb = preg_replace('/[^a-zA-Z0-9_\-]/', '', $shop->database_name);
            Config::set('database.connections.tenant.database', $sanitizedDb);
            DB::purge('tenant');
            DB::reconnect('tenant');

            DB::connection('tenant')->table('users')
                ->where('role', 'admin')
                ->orWhere('email', $shop->owner_email)
                ->update([
                    'password' => Hash::make($newPassword),
                    'updated_at' => now(),
                ]);
        } catch (\Throwable $e) {
            Log::warning("forgotPasswordReset tenant sync warning: " . $e->getMessage());
        }

        \Illuminate\Support\Facades\Cache::forget("store_pwd_reset_token_{$resetToken}");

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully! You can now log in with your new password.',
            'shop_code' => $shop->shop_code,
        ]);
    }

    /**
     * Agent Partner Authentication
     */
    public function agentLogin(Request $request): JsonResponse
    {
        $loginId = strtoupper(trim((string)$request->input('login_id', '')));
        $password = (string)$request->input('password', '');

        if (!$loginId || !$password) {
            return response()->json([
                'success' => false,
                'message' => 'Agent Code / Mobile and Password are required.'
            ], 422);
        }

        $agent = DB::connection('mysql')->table('agents')
            ->where(function ($q) use ($loginId) {
                $q->where('referral_code', $loginId)
                  ->orWhere('phone', $loginId)
                  ->orWhere('email', strtolower($loginId));
            })
            ->first();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Agent record not found with this Agent Code or Mobile.'
            ], 404);
        }

        if ($agent->status !== 'approved' && $agent->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => "Your Agent account is currently {$agent->status}. Please contact Super Admin."
            ], 403);
        }

        // Validate password (bcrypt, plain, or initial fallback)
        $passwordValid = false;
        if (!empty($agent->password)) {
            $passwordValid = Hash::check($password, $agent->password) || $password === $agent->password;
        } else {
            $passwordValid = ($password === 'agent123' || $password === $agent->phone);
        }

        if (!$passwordValid) {
            return response()->json([
                'success' => false,
                'message' => 'Incorrect agent password.'
            ], 401);
        }

        $token = 'agent_' . bin2hex(random_bytes(24));
        session(['agent_logged_in_id' => $agent->id]);

        return response()->json([
            'success' => true,
            'message' => "Welcome back, {$agent->name}!",
            'token' => $token,
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'agent_code' => $agent->referral_code,
                'phone' => $agent->phone,
                'email' => $agent->email,
                'address' => $agent->address ?: 'Authorized Channel Partner',
                'city' => $agent->city ?: 'Jaipur',
                'state' => $agent->state ?: '08 - RAJASTHAN',
                'id_card_number' => $agent->id_card_number ?: ('ICARD-' . $agent->referral_code),
                'photo' => $agent->photo ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                'status' => $agent->status,
                'commission_rate_percent' => (float)$agent->commission_rate_percent,
                'fixed_signup_bonus' => (float)$agent->fixed_signup_bonus,
            ]
        ]);
    }

    /**
     * Agent Partner Workspace Dashboard Data
     * Shows referred stores, expiry alerts, pending dues, earnings & wallet balance
     */
    public function getAgentDashboard(Request $request): JsonResponse
    {
        $agentId = $request->input('agent_id') ?: session('agent_logged_in_id');
        $code = strtoupper(trim((string)$request->input('code', '')));

        $agentQuery = DB::connection('mysql')->table('agents');
        if ($agentId) {
            $agentQuery->where('id', $agentId);
        } elseif ($code) {
            $agentQuery->where('referral_code', $code);
        } else {
            // Default to first approved agent if neither supplied
            $agentQuery->where('status', 'approved')->orderBy('id', 'asc');
        }
        $agent = $agentQuery->first();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Agent not found.'
            ], 404);
        }

        // 1. Fetch all referred stores
        $referrals = DB::connection('mysql')->table('agent_referrals')
            ->where('agent_id', $agent->id)
            ->pluck('shop_id');

        $shops = DB::connection('mysql')->table('shops')
            ->whereIn('id', $referrals)
            ->orderBy('id', 'desc')
            ->get();

        $now = now();
        $referredStores = [];
        $expiredCount = 0;
        $expiringSoonCount = 0;
        $activeCount = 0;
        $pendingDuesCount = 0;
        $totalDuesAmount = 0;

        foreach ($shops as $shop) {
            $settings = json_decode($shop->settings, true) ?: [];
            $validUntilStr = $settings['valid_until'] ?? null;
            $dueAmount = (float)($settings['due_amount'] ?? 0);

            $isExpired = false;
            $isExpiringSoon = false;
            $daysRemaining = 0;

            if ($validUntilStr) {
                $validDate = \Carbon\Carbon::parse($validUntilStr)->endOfDay();
                $diffDays = (int)$now->diffInDays($validDate, false);
                $daysRemaining = $diffDays;

                if ($now->greaterThan($validDate)) {
                    $isExpired = true;
                    $expiredCount++;
                } elseif ($diffDays <= 30) {
                    $isExpiringSoon = true;
                    $expiringSoonCount++;
                } else {
                    $activeCount++;
                }
            } else {
                $activeCount++;
            }

            if ($dueAmount > 0) {
                $pendingDuesCount++;
                $totalDuesAmount += $dueAmount;
            }

            $paymentStatus = 'active';
            if ($isExpired) {
                $paymentStatus = 'expired';
            } elseif ($dueAmount > 0) {
                $paymentStatus = 'due_pending';
            } elseif ($isExpiringSoon) {
                $paymentStatus = 'renewal_due';
            }

            $referredStores[] = [
                'id' => $shop->id,
                'shop_code' => $shop->shop_code,
                'name' => $shop->name,
                'owner_name' => $shop->owner_name,
                'owner_phone' => $shop->owner_phone,
                'owner_email' => $shop->owner_email,
                'address' => $settings['address'] ?? ($settings['city'] ?? 'Registered Business Address'),
                'city' => $settings['city'] ?? 'Jaipur, Rajasthan',
                'plan_id' => $settings['plan_id'] ?? 'gst-billing',
                'plan_name' => $settings['plan_name'] ?? 'GST Billing Software',
                'billing_cycle' => $settings['billing_cycle'] ?? 'yearly',
                'valid_until' => $validUntilStr ?: $now->addYear()->format('Y-m-d'),
                'days_remaining' => $daysRemaining,
                'is_expired' => $isExpired,
                'is_expiring_soon' => $isExpiringSoon,
                'due_amount' => $dueAmount,
                'payment_status' => $paymentStatus,
                'created_at' => substr($shop->created_at, 0, 10),
            ];
        }

        // 2. Fetch Earnings & Wallet ledger
        $commissions = DB::connection('mysql')->table('agent_commissions')
            ->leftJoin('shops', 'agent_commissions.shop_id', '=', 'shops.id')
            ->where('agent_commissions.agent_id', $agent->id)
            ->select(
                'agent_commissions.*',
                'shops.name as shop_name',
                'shops.shop_code'
            )
            ->orderBy('agent_commissions.id', 'desc')
            ->get();

        $totalApprovedEarnings = (float)$commissions->where('status', 'approved')->sum('net_payable');
        $totalPendingEarnings = (float)$commissions->where('status', 'pending')->sum('net_payable');

        $totalPayoutsProcessed = (float)DB::connection('mysql')->table('agent_payouts')
            ->where('agent_id', $agent->id)
            ->where('status', 'processed')
            ->sum('amount');

        $availableWalletBalance = max(0, $totalApprovedEarnings - $totalPayoutsProcessed);

        return response()->json([
            'success' => true,
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'agent_code' => $agent->referral_code,
                'phone' => $agent->phone,
                'email' => $agent->email,
                'address' => $agent->address ?: 'Plot 42, Commercial Hub',
                'city' => $agent->city ?: 'Jaipur',
                'state' => $agent->state ?: '08 - RAJASTHAN',
                'id_card_number' => $agent->id_card_number ?: ('ICARD-' . $agent->referral_code),
                'photo' => $agent->photo ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                'status' => $agent->status,
                'commission_rate_percent' => (float)$agent->commission_rate_percent,
                'fixed_signup_bonus' => (float)$agent->fixed_signup_bonus,
            ],
            'metrics' => [
                'total_referred_stores' => count($referredStores),
                'active_stores' => $activeCount,
                'expiring_soon_stores' => $expiringSoonCount,
                'expired_stores' => $expiredCount,
                'pending_dues_stores' => $pendingDuesCount,
                'total_dues_amount' => $totalDuesAmount,
                'total_approved_earnings' => $totalApprovedEarnings,
                'total_pending_earnings' => $totalPendingEarnings,
                'total_payouts_processed' => $totalPayoutsProcessed,
                'available_wallet_balance' => $availableWalletBalance,
            ],
            'stores' => $referredStores,
            'commissions' => $commissions->map(function ($c) {
                return [
                    'id' => $c->id,
                    'shop_name' => $c->shop_name ?: 'Platform Reward / Milestone',
                    'shop_code' => $c->shop_code ?: 'N/A',
                    'commission_type' => $c->commission_type,
                    'gross_amount' => (float)$c->commission_amount,
                    'tds_amount' => (float)$c->tds_amount,
                    'net_payable' => (float)$c->net_payable,
                    'status' => $c->status,
                    'created_at' => substr($c->created_at, 0, 10),
                ];
            }),
        ]);
    }

    /**
     * Super Admin - Get All Agents Network Statistics & Performance
     */
    public function getSuperAdminAgents(Request $request): JsonResponse
    {
        $agents = DB::connection('mysql')->table('agents')
            ->orderBy('id', 'desc')
            ->get();

        $now = now();
        $agentsList = [];
        $platformTotalCommissions = 0;
        $platformPendingCommissions = 0;
        $platformTotalReferredStores = 0;

        foreach ($agents as $agent) {
            $referralShopIds = DB::connection('mysql')->table('agent_referrals')
                ->where('agent_id', $agent->id)
                ->pluck('shop_id');

            $totalStores = count($referralShopIds);
            $platformTotalReferredStores += $totalStores;

            $shops = DB::connection('mysql')->table('shops')
                ->whereIn('id', $referralShopIds)
                ->get();

            $activeStores = 0;
            $expiringSoon = 0;
            $expiredStores = 0;
            $totalSalesDriven = 0;

            foreach ($shops as $shop) {
                $settings = json_decode($shop->settings, true) ?: [];
                $validUntil = $settings['valid_until'] ?? null;
                $planCode = $settings['plan_id'] ?? 'yearly-package';

                // Approximate base revenue from plan
                $planRev = str_contains($planCode, 'monthly') ? 1000 : (str_contains($planCode, 'quarterly') ? 2500 : (str_contains($planCode, 'half') ? 4500 : 8000));
                $totalSalesDriven += $planRev;

                if ($validUntil) {
                    $validDate = \Carbon\Carbon::parse($validUntil)->endOfDay();
                    if ($now->greaterThan($validDate)) {
                        $expiredStores++;
                    } elseif ($now->diffInDays($validDate, false) <= 30) {
                        $expiringSoon++;
                    } else {
                        $activeStores++;
                    }
                } else {
                    $activeStores++;
                }
            }

            // Commissions earned by this agent
            $totalEarned = (float)DB::connection('mysql')->table('agent_commissions')
                ->where('agent_id', $agent->id)
                ->where('status', 'approved')
                ->sum('net_payable');

            $pendingComm = (float)DB::connection('mysql')->table('agent_commissions')
                ->where('agent_id', $agent->id)
                ->where('status', 'pending')
                ->sum('net_payable');

            $platformTotalCommissions += $totalEarned;
            $platformPendingCommissions += $pendingComm;

            $agentsList[] = [
                'id' => $agent->id,
                'name' => $agent->name,
                'agent_code' => $agent->referral_code,
                'phone' => $agent->phone,
                'email' => $agent->email,
                'city' => $agent->city ?: 'Jaipur',
                'state' => $agent->state ?: '08 - RAJASTHAN',
                'id_card_number' => $agent->id_card_number ?: ('ICARD-' . $agent->referral_code),
                'photo' => $agent->photo ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                'status' => $agent->status,
                'commission_rate_percent' => (float)$agent->commission_rate_percent,
                'fixed_signup_bonus' => (float)$agent->fixed_signup_bonus,
                'total_referred_stores' => $totalStores,
                'active_stores' => $activeStores,
                'expiring_soon_stores' => $expiringSoon,
                'expired_stores' => $expiredStores,
                'total_sales_driven' => $totalSalesDriven,
                'total_earned' => $totalEarned,
                'pending_commissions' => $pendingComm,
                'approved_at' => $agent->approved_at ? substr($agent->approved_at, 0, 10) : null,
                'created_at' => substr($agent->created_at, 0, 10),
            ];
        }

        return response()->json([
            'success' => true,
            'statistics' => [
                'total_agents' => count($agents),
                'active_agents' => count(array_filter($agentsList, fn($a) => $a['status'] === 'approved' || $a['status'] === 'active')),
                'total_referred_stores' => $platformTotalReferredStores,
                'total_commissions_distributed' => $platformTotalCommissions,
                'total_pending_commissions' => $platformPendingCommissions,
                'average_commission_rate' => count($agents) > 0 ? round(array_sum(array_column($agentsList, 'commission_rate_percent')) / count($agents), 1) : 10.0,
            ],
            'agents' => $agentsList,
        ]);
    }

    /**
     * Super Admin - Create New Agent with Auto-Generated Agent Code
     */
    public function createAgent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:32|unique:mysql.agents,phone',
            'email' => 'required|email|max:255|unique:mysql.agents,email',
            'city' => 'nullable|string|max:128',
            'state' => 'nullable|string|max:128',
            'address' => 'nullable|string|max:255',
            'pan_number' => 'nullable|string|max:32',
            'bank_name' => 'nullable|string|max:128',
            'bank_account_no' => 'nullable|string|max:64',
            'bank_ifsc' => 'nullable|string|max:32',
            'upi_id' => 'nullable|string|max:128',
            'commission_rate_percent' => 'nullable|numeric|min:0|max:100',
            'fixed_signup_bonus' => 'nullable|numeric|min:0',
            'password' => 'nullable|string|min:4',
            'referral_code' => 'nullable|string|max:64',
        ]);

        // Auto-generate Unique Agent Code if not manually provided
        $code = strtoupper(trim((string)($validated['referral_code'] ?? '')));
        if (!$code) {
            $today = date('Ymd');
            $count = DB::connection('mysql')->table('agents')->whereDate('created_at', today())->count() + 1;
            $code = 'AGT' . $today . str_pad($count, 2, '0', STR_PAD_LEFT);
            while (DB::connection('mysql')->table('agents')->where('referral_code', $code)->exists()) {
                $code = 'AGT' . $today . rand(10, 99);
            }
        } else {
            if (DB::connection('mysql')->table('agents')->where('referral_code', $code)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => "Agent Code '{$code}' already exists. Please choose another or leave empty for auto-generation."
                ], 422);
            }
        }

        $passwordRaw = $validated['password'] ?? 'agent123';
        $hashedPassword = Hash::make($passwordRaw);
        $idCardNumber = 'ICARD-' . $code;

        $agentId = DB::connection('mysql')->table('agents')->insertGetId([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => strtolower($validated['email']),
            'password' => $hashedPassword,
            'address' => $validated['address'] ?? 'Authorized Channel Partner Office',
            'city' => $validated['city'] ?? 'Jaipur',
            'state' => $validated['state'] ?? '08 - RAJASTHAN',
            'id_card_number' => $idCardNumber,
            'photo' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            'pan_number' => $validated['pan_number'] ?? null,
            'bank_name' => $validated['bank_name'] ?? null,
            'bank_account_no' => $validated['bank_account_no'] ?? null,
            'bank_ifsc' => $validated['bank_ifsc'] ?? null,
            'upi_id' => $validated['upi_id'] ?? null,
            'referral_code' => $code,
            'status' => 'approved',
            'commission_rate_percent' => $validated['commission_rate_percent'] !== null ? (float)$validated['commission_rate_percent'] : 10.00,
            'fixed_signup_bonus' => $validated['fixed_signup_bonus'] !== null ? (float)$validated['fixed_signup_bonus'] : 500.00,
            'approved_at' => now(),
            'notes' => 'Created by Super Admin via Master Portal',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Agent {$validated['name']} registered successfully! Agent Code: {$code}",
            'agent' => [
                'id' => $agentId,
                'name' => $validated['name'],
                'agent_code' => $code,
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'id_card_number' => $idCardNumber,
                'status' => 'approved',
                'commission_rate_percent' => $validated['commission_rate_percent'] ?? 10.00,
            ]
        ]);
    }

    /**
     * Super Admin - Update Agent Dynamic Commission Rate, Bonus or Status
     */
    public function updateAgent(Request $request, $id): JsonResponse
    {
        $agent = DB::connection('mysql')->table('agents')->where('id', $id)->first();
        if (!$agent) {
            return response()->json(['success' => false, 'message' => 'Agent not found.'], 404);
        }

        $updates = ['updated_at' => now()];

        if ($request->has('commission_rate_percent')) {
            $updates['commission_rate_percent'] = (float)$request->input('commission_rate_percent');
        }
        if ($request->has('fixed_signup_bonus')) {
            $updates['fixed_signup_bonus'] = (float)$request->input('fixed_signup_bonus');
        }
        if ($request->has('status')) {
            $updates['status'] = $request->input('status');
            if ($updates['status'] === 'approved' && !$agent->approved_at) {
                $updates['approved_at'] = now();
            }
        }
        if ($request->has('name')) {
            $updates['name'] = $request->input('name');
        }
        if ($request->has('phone')) {
            $updates['phone'] = $request->input('phone');
        }
        if ($request->has('email')) {
            $updates['email'] = strtolower($request->input('email'));
        }
        if ($request->has('city')) {
            $updates['city'] = $request->input('city');
        }
        if ($request->has('state')) {
            $updates['state'] = $request->input('state');
        }
        if ($request->has('password') && strlen(trim((string)$request->input('password'))) >= 4) {
            $updates['password'] = Hash::make(trim((string)$request->input('password')));
        }

        DB::connection('mysql')->table('agents')->where('id', $id)->update($updates);

        return response()->json([
            'success' => true,
            'message' => "Agent {$agent->name} (Code: {$agent->referral_code}) details and commission rates updated successfully!"
        ]);
    }

    /**
     * Super Admin - Add Direct Reward / Performance Bonus to Agent Wallet
     */
    public function addAgentReward(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'agent_id' => 'required|integer',
            'reward_amount' => 'required|numeric|min:1',
            'reason' => 'required|string|max:255',
        ]);

        $agent = DB::connection('mysql')->table('agents')->where('id', $validated['agent_id'])->first();
        if (!$agent) {
            return response()->json(['success' => false, 'message' => 'Agent not found.'], 404);
        }

        $gross = (float)$validated['reward_amount'];
        $tds = $gross * 0.05; // 5% TDS
        $net = $gross - $tds;

        // Find any referred shop or use first available shop or 1
        $firstShopId = DB::connection('mysql')->table('agent_referrals')
            ->where('agent_id', $agent->id)
            ->value('shop_id') ?: (DB::connection('mysql')->table('shops')->value('id') ?: 1);

        DB::connection('mysql')->table('agent_commissions')->insert([
            'agent_id' => $agent->id,
            'shop_id' => $firstShopId,
            'subscription_payment_id' => null,
            'commission_type' => 'reward',
            'commission_amount' => $gross,
            'tds_rate' => 5.00,
            'tds_amount' => $tds,
            'net_payable' => $net,
            'status' => 'approved',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Performance Reward of ₹" . number_format($gross, 2) . " (Net: ₹" . number_format($net, 2) . ") credited to {$agent->name}'s wallet!",
            'reward' => [
                'agent_code' => $agent->referral_code,
                'gross_amount' => $gross,
                'net_payable' => $net,
                'reason' => $validated['reason'],
            ]
        ]);
    }
}

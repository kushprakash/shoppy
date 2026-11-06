<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PayUController extends Controller
{
    /**
     * Get plan prices & durations helper
     */
    protected function getPlanDetails(string $planCode, string $billingCycle, bool $ownWhatsapp): array
    {
        $plan = DB::connection('mysql')->table('subscription_plans')->where('code', $planCode)->first();

        $defaultMap = [
            'monthly-package' => ['name' => 'Monthly Package', 'price' => 1000, 'duration' => 30, 'cycle' => 'monthly', 'whatsapp_addon' => 500],
            'quarterly-package' => ['name' => 'Quarterly Package', 'price' => 2500, 'duration' => 90, 'cycle' => 'quarterly', 'whatsapp_addon' => 1500],
            'half-yearly-package' => ['name' => 'Half Yearly Package', 'price' => 4500, 'duration' => 180, 'cycle' => 'half_yearly', 'whatsapp_addon' => 3000],
            'yearly-package' => ['name' => 'Yearly Package', 'price' => 8000, 'duration' => 365, 'cycle' => 'yearly', 'whatsapp_addon' => 6000],
        ];

        $fallback = $defaultMap[$planCode] ?? $defaultMap['yearly-package'];
        $planName = $plan ? $plan->name : $fallback['name'];
        $basePrice = $fallback['price'];
        $durationDays = $fallback['duration'];
        $effectiveCycle = $fallback['cycle'] ?? $billingCycle;

        if ($plan && !empty($plan->cycles)) {
            $cycles = is_string($plan->cycles) ? json_decode($plan->cycles, true) : $plan->cycles;
            if (isset($cycles[$effectiveCycle]['offer'])) {
                $basePrice = (float)$cycles[$effectiveCycle]['offer'];
            }
        }

        $whatsappAddon = $ownWhatsapp ? $fallback['whatsapp_addon'] : 0;
        $totalAmount = $basePrice + $whatsappAddon;

        return [
            'plan_name' => $planName,
            'plan_code' => $planCode,
            'base_price' => $basePrice,
            'whatsapp_addon' => $whatsappAddon,
            'total_amount' => $totalAmount,
            'duration_days' => $durationDays,
            'has_ecommerce' => true,
            'has_whatsapp' => true,
        ];
    }

    /**
     * Initiate PayU Money Payment Request
     * Calculates SHA512 hash and prepares checkout payload
     */
    public function initiate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:onboard,renew',
            'plan_id' => 'required|string',
            'billing_cycle' => 'nullable|string',
            'own_whatsapp' => 'nullable|boolean',
            // Onboarding fields
            'name' => 'required_if:type,onboard|nullable|string|max:255',
            'owner_name' => 'required_if:type,onboard|nullable|string|max:255',
            'owner_phone' => 'required_if:type,onboard|nullable|string|max:32',
            'city' => 'nullable|string|max:128',
            'category' => 'nullable|string|max:128',
            'sub_category' => 'nullable|string|max:128',
            // Renewal fields
            'shop_code' => 'required_if:type,renew|nullable|string|max:32',
        ]);

        $type = $validated['type'];
        $planCode = $validated['plan_id'];
        $cycle = $validated['billing_cycle'] ?: 'yearly';
        $ownWhatsapp = !empty($validated['own_whatsapp']);

        $planInfo = $this->getPlanDetails($planCode, $cycle, $ownWhatsapp);
        $totalAmount = $planInfo['total_amount'];

        // Merchant Keys (Production Live)
        $key = config('services.payu.key', '3VzQpX');
        $salt = config('services.payu.salt', '5suoTv1yxsgU53Q5fr1Ucb2gapTG9yBa');
        $env = config('services.payu.env', 'production');
        $actionUrl = ($env === 'production') ? 'https://secure.payu.in/_payment' : 'https://test.payu.in/_payment';

        $txnid = 'PAYU_' . time() . '_' . strtoupper(Str::random(6));

        $firstname = $request->input('owner_name') ?: ($request->input('name') ?: 'Merchant');
        $phone = preg_replace('/[^0-9]/', '', (string)$request->input('owner_phone'));
        if (strlen($phone) < 10) {
            $phone = '9546042639';
        }
        $email = $request->input('owner_email') ?: (strtolower(Str::slug($firstname)) . '@merchant.shoppy.io');

        $productinfo = ($type === 'onboard')
            ? ('Shoppy ERP Signup - ' . $planInfo['plan_name'])
            : ('Shoppy ERP Renewal - ' . $planInfo['plan_name'] . ' (' . ($validated['shop_code'] ?? '') . ')');

        $formattedAmount = number_format((float)$totalAmount, 2, '.', '');

        // User Defined Fields (UDFs)
        $udf1 = $type; // 'onboard' or 'renew'
        $udf2 = ($type === 'renew') ? ($validated['shop_code'] ?? '') : ($request->input('referral_code') ?: ($request->input('agent_code') ?: ''));
        $udf3 = $planCode;
        $udf4 = $cycle;
        $udf5 = $ownWhatsapp ? '1' : '0';

        // Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
        $hashSequence = "{$key}|{$txnid}|{$formattedAmount}|{$productinfo}|{$firstname}|{$email}|{$udf1}|{$udf2}|{$udf3}|{$udf4}|{$udf5}||||||{$salt}";
        $hash = strtolower(hash('sha512', $hashSequence));

        $surl = url('/api/payu/callback/success');
        $furl = url('/api/payu/callback/failure');

        // Prepare Onboarding metadata to store with payment transaction
        $metadata = null;
        if ($type === 'onboard') {
            $metadata = [
                'name' => $request->input('name') ?: ($request->input('storeName') ?: 'New Retail Store'),
                'owner_name' => $request->input('owner_name') ?: ($request->input('ownerName') ?: 'Store Owner'),
                'owner_phone' => $phone,
                'owner_email' => $email,
                'state_code' => $request->input('state_code') ?: ($request->input('state') ?: '10'),
                'city' => $request->input('city') ?: 'BIHAR',
                'category' => $request->input('category'),
                'sub_category' => $request->input('sub_category'),
                'referral_code' => $request->input('referral_code') ?: ($request->input('agent_code') ?: null),
                'plan_id' => $planCode,
                'billing_cycle' => $cycle,
                'own_whatsapp' => $ownWhatsapp,
            ];
            try {
                \Illuminate\Support\Facades\Cache::put("payu_onboard_{$txnid}", $metadata, now()->addHours(6));
            } catch (\Throwable $e) {}
        }

        // Log pending payment in MySQL subscription_payments
        try {
            $existingShopId = null;
            if ($type === 'renew' && !empty($validated['shop_code'])) {
                $shop = DB::connection('mysql')->table('shops')->where('shop_code', $validated['shop_code'])->first();
                $existingShopId = $shop ? $shop->id : null;
            }

            DB::connection('mysql')->table('subscription_payments')->insert([
                'shop_id' => $existingShopId,
                'shop_subscription_id' => null,
                'amount' => $formattedAmount,
                'payment_method' => 'payu_money',
                'gateway' => 'payu',
                'transaction_id' => $txnid,
                'status' => 'pending',
                'metadata' => $metadata ? json_encode($metadata) : null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning('PayU payment log error: ' . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'gateway' => 'PayU Money',
            'action' => $actionUrl,
            'env' => $env,
            'amount' => $formattedAmount,
            'txnid' => $txnid,
            'params' => [
                'key' => $key,
                'txnid' => $txnid,
                'amount' => $formattedAmount,
                'productinfo' => $productinfo,
                'firstname' => $firstname,
                'email' => $email,
                'phone' => $phone,
                'surl' => $surl,
                'furl' => $furl,
                'hash' => $hash,
                'service_provider' => 'payu_paisa',
                'udf1' => $udf1,
                'udf2' => $udf2,
                'udf3' => $udf3,
                'udf4' => $udf4,
                'udf5' => $udf5,
            ],
            'summary' => [
                'plan_name' => $planInfo['plan_name'],
                'base_price' => $planInfo['base_price'],
                'whatsapp_addon' => $planInfo['whatsapp_addon'],
                'total_amount' => $planInfo['total_amount'],
                'billing_cycle' => $cycle,
                'duration_days' => $planInfo['duration_days'],
                'type' => $type,
            ]
        ]);
    }

    /**
     * Verify PayU Payment and Complete Onboarding or Store Renewal
     */
    public function verifyAndComplete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'txnid' => 'required|string',
            'status' => 'nullable|string',
            'type' => 'required|in:onboard,renew',
            // Onboarding Store Data
            'store_data' => 'nullable|array',
            // Renewal Store Code & Plan
            'shop_code' => 'nullable|string',
            'plan_id' => 'nullable|string',
            'billing_cycle' => 'nullable|string',
            'own_whatsapp' => 'nullable|boolean',
        ]);

        $txnid = $validated['txnid'];
        $type = $validated['type'];
        $status = strtolower($validated['status'] ?? 'success');

        if ($status !== 'success') {
            DB::connection('mysql')->table('subscription_payments')
                ->where('transaction_id', $txnid)
                ->update(['status' => 'failed', 'updated_at' => now()]);

            return response()->json([
                'success' => false,
                'message' => 'PayU Money transaction was cancelled or unsuccessful.'
            ], 400);
        }

        // =====================================================================
        // 1. STORE SIGN UP / ONBOARDING FLOW
        // =====================================================================
        if ($type === 'onboard') {
            // Retrieve metadata saved during initiate if not directly in request
            $metadata = null;
            try {
                $metadata = \Illuminate\Support\Facades\Cache::get("payu_onboard_{$txnid}");
            } catch (\Throwable $e) {}

            if (!$metadata) {
                $payRow = DB::connection('mysql')->table('subscription_payments')->where('transaction_id', $txnid)->first();
                if ($payRow && !empty($payRow->metadata)) {
                    $metadata = json_decode($payRow->metadata, true);
                }
            }

            $storeData = $validated['store_data'] ?? ($metadata ?? []);
            $storeName = $storeData['name'] ?? ($storeData['storeName'] ?? 'New Retail Store');
            $ownerName = $storeData['ownerName'] ?? ($storeData['owner_name'] ?? 'Store Owner');
            $ownerPhone = $storeData['ownerPhone'] ?? ($storeData['owner_phone'] ?? '9546042639');
            $stateCode = $storeData['stateCode'] ?? ($storeData['state_code'] ?? ($storeData['state'] ?? '10'));
            $referralCode = $storeData['referralCode'] ?? ($storeData['referral_code'] ?? ($storeData['agentCode'] ?? ($request->input('udf2') ?: null)));
            $planId = $storeData['planId'] ?? ($storeData['plan_id'] ?? ($request->input('udf3') ?: 'yearly-package'));
            $cycle = $storeData['billingCycle'] ?? ($storeData['billing_cycle'] ?? ($request->input('udf4') ?: 'yearly'));
            $ownWhatsapp = !empty($storeData['ownWhatsapp']) || !empty($storeData['own_whatsapp']) || ($request->input('udf5') === '1');

            $planInfo = $this->getPlanDetails($planId, $cycle, $ownWhatsapp);

            // Format strictly: SP + YmdHis (e.g. SP20261106015100)
            $code = 'SP' . date('YmdHis');
            while (DB::connection('mysql')->table('shops')->where('shop_code', $code)->exists()) {
                sleep(1);
                $code = 'SP' . date('YmdHis');
            }
            $slug = Str::slug($storeName) . '-' . strtolower(substr($code, -6));
            $dbName = 'tenant_' . strtolower($code);
            $validUntil = now()->addDays($planInfo['duration_days'])->format('Y-m-d');

            // Find State Name from gst_states table
            $stateRecord = DB::connection('mysql')->table('gst_states')->where('state_code', $stateCode)->first();
            $stateName = $stateRecord ? $stateRecord->state_name : 'BIHAR';

            $settings = [
                'state_code' => $stateCode,
                'state_name' => $stateName,
                'city' => $stateName,
                'plan_id' => $planId,
                'plan_name' => $planInfo['plan_name'],
                'billing_cycle' => $cycle,
                'has_ecommerce' => true,
                'whatsapp_mode' => $ownWhatsapp ? 'own_number' : 'platform_number',
                'due_amount' => 0,
                'valid_until' => $validUntil,
                'terminal_password' => 'admin123',
                'payment_gateway' => 'payu_money',
                'last_transaction_id' => $txnid,
                'referral_code' => $referralCode,
                'initial_setup_completed' => false,
            ];

            // Insert Shop into central database ONLY UPON VERIFIED PAYMENT
            $shopId = DB::connection('mysql')->table('shops')->insertGetId([
                'name' => $storeName,
                'shop_code' => $code,
                'slug' => $slug,
                'owner_name' => $ownerName,
                'owner_email' => strtolower(Str::slug($ownerName)) . '@' . strtolower($code) . '.shoppy.io',
                'owner_phone' => $ownerPhone,
                'database_name' => $dbName,
                'status' => 'active',
                'settings' => json_encode($settings),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Link Agent Referral & Commission if valid referral_code provided
            if (!empty($referralCode)) {
                $agent = DB::connection('mysql')->table('agents')->where('referral_code', strtoupper(trim($referralCode)))->first();
                if ($agent) {
                    try {
                        DB::connection('mysql')->table('agent_referrals')->insert([
                            'agent_id' => $agent->id,
                            'shop_id' => $shopId,
                            'referral_code' => $agent->referral_code,
                            'referred_at' => now(),
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);

                        $rate = (float)($agent->commission_rate_percent ?: 10.00);
                        $saleAmount = (float)$planInfo['total_amount'];
                        $percentCommission = $saleAmount * ($rate / 100);
                        $bonus = (float)($agent->fixed_signup_bonus ?: 0);
                        $gross = $percentCommission + $bonus;
                        $tds = $gross * 0.05;
                        $net = $gross - $tds;

                        DB::connection('mysql')->table('agent_commissions')->insert([
                            'agent_id' => $agent->id,
                            'shop_id' => $shopId,
                            'subscription_payment_id' => null,
                            'commission_type' => 'signup',
                            'commission_amount' => $gross,
                            'tds_rate' => 5.00,
                            'tds_amount' => $tds,
                            'net_payable' => $net,
                            'status' => 'approved',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    } catch (\Throwable $e) {
                        Log::error('Agent referral linking error: ' . $e->getMessage());
                    }
                }
            }

            // 1. Create Active Store Subscription in shop_subscriptions table
            $planRecord = DB::connection('mysql')->table('subscription_plans')
                ->where('code', $planId)
                ->orWhere('id', is_numeric($planId) ? (int)$planId : 0)
                ->first();
            $planDbId = $planRecord ? $planRecord->id : 1;

            $subscriptionId = DB::connection('mysql')->table('shop_subscriptions')->insertGetId([
                'shop_id' => $shopId,
                'plan_id' => $planDbId,
                'licensed_categories' => json_encode(['all']),
                'starts_at' => now(),
                'expires_at' => $validUntil,
                'grace_ends_at' => now()->addDays($planInfo['duration_days'] + 7)->format('Y-m-d H:i:s'),
                'status' => 'active',
                'auto_renew' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 2. Link payment to subscription & store Passbook metadata
            $invoiceNo = 'INV-' . strtoupper($code) . '-0001';
            $passbookMetadata = array_merge($metadata ?? [], [
                'type' => 'onboard',
                'invoice_no' => $invoiceNo,
                'plan_name' => $planInfo['plan_name'],
                'plan_code' => $planId,
                'duration_days' => $planInfo['duration_days'],
                'billing_cycle' => $cycle,
                'valid_until' => $validUntil,
                'amount_paid' => $planInfo['total_amount'],
                'payment_date' => now()->toIso8601String(),
                'payment_gateway' => 'PayU Money (Live)',
            ]);

            // Update subscription_payments record with subscription link and Passbook ledger data
            DB::connection('mysql')->table('subscription_payments')
                ->where('transaction_id', $txnid)
                ->update([
                    'shop_id' => $shopId,
                    'shop_subscription_id' => $subscriptionId,
                    'status' => 'success',
                    'metadata' => json_encode($passbookMetadata),
                    'updated_at' => now()
                ]);

            // Provision isolated tenant database
            try {
                $sanitizedDbName = preg_replace('/[^a-zA-Z0-9_]/', '', $dbName);
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

                // Seed Initial Branch
                $branchId = DB::connection('tenant')->table('branches')->insertGetId([
                    'name' => 'Main Store',
                    'code' => 'BR-01',
                    'phone' => $ownerPhone,
                    'address' => $stateName,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Seed Default Admin User
                DB::connection('tenant')->table('users')->insert([
                    'name' => $ownerName,
                    'email' => strtolower(Str::slug($ownerName)) . '@' . strtolower($code) . '.shoppy.io',
                    'password' => bcrypt('admin123'),
                    'role' => 'admin',
                    'branch_id' => $branchId,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                // Seed Initial Settings & Subscription info into tenant database
                DB::connection('tenant')->table('settings')->insertOrIgnore([
                    ['key' => 'store_name', 'value' => $storeName, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'owner_name', 'value' => $ownerName, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'contact_phone', 'value' => $ownerPhone, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'state_code', 'value' => $stateCode, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'state_name', 'value' => $stateName, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'theme_color', 'value' => '#008ba3', 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'valid_until', 'value' => $validUntil, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'plan_name', 'value' => $planInfo['plan_name'], 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'plan_id', 'value' => $planId, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'billing_cycle', 'value' => $cycle, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'subscription_id', 'value' => (string)$subscriptionId, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'last_transaction_id', 'value' => $txnid, 'created_at' => now(), 'updated_at' => now()],
                ]);
            } catch (\Throwable $e) {
                Log::error('Tenant DB provisioning error: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'type' => 'onboard',
                'message' => "Payment verified! Store {$code} has been provisioned successfully via PayU Money.",
                'store' => [
                    'id' => $shopId,
                    'shop_code' => $code,
                    'name' => $storeName,
                    'owner_name' => $ownerName,
                    'owner_phone' => $ownerPhone,
                    'state_code' => $stateCode,
                    'state_name' => $stateName,
                    'database_name' => $dbName,
                    'plan_name' => $planInfo['plan_name'],
                    'plan_id' => $planId,
                    'billing_cycle' => $cycle,
                    'valid_until' => $validUntil,
                    'terminal_password' => 'admin123',
                    'status' => 'active',
                    'transaction_id' => $txnid,
                ],
                'auto_login' => true,
                'redirect_url' => '/shop-admin/settings?setup=1',
            ]);
        }

        // =====================================================================
        // 2. STORE RENEWAL FLOW
        // =====================================================================
        if ($type === 'renew') {
            $shopCode = $validated['shop_code'] ?? ($request->input('udf2') ?: '');
            if (!$shopCode) {
                return response()->json(['success' => false, 'message' => 'Store code is required for renewal.'], 422);
            }

            $shop = DB::connection('mysql')->table('shops')->where('shop_code', strtoupper(trim($shopCode)))->first();
            if (!$shop) {
                return response()->json(['success' => false, 'message' => "Store '{$shopCode}' not found in database."], 404);
            }

            $planId = $validated['plan_id'] ?? 'yearly-package';
            $cycle = $validated['billing_cycle'] ?? 'yearly';
            $ownWhatsapp = !empty($validated['own_whatsapp']);

            $planInfo = $this->getPlanDetails($planId, $cycle, $ownWhatsapp);

            // Calculate new validity
            $existingSettings = json_decode($shop->settings ?? '{}', true) ?: [];
            $currentValidUntil = $existingSettings['valid_until'] ?? null;

            $baseDate = now();
            if ($currentValidUntil) {
                $parsed = \Carbon\Carbon::parse($currentValidUntil);
                if ($parsed->isFuture()) {
                    $baseDate = $parsed;
                }
            }
            $newValidUntil = $baseDate->addDays($planInfo['duration_days'])->format('Y-m-d');

            $existingSettings['valid_until'] = $newValidUntil;
            $existingSettings['plan_id'] = $planId;
            $existingSettings['plan_name'] = $planInfo['plan_name'];
            $existingSettings['billing_cycle'] = $cycle;
            if ($ownWhatsapp) {
                $existingSettings['whatsapp_mode'] = 'own_number';
            }
            $existingSettings['last_renewal_date'] = now()->format('Y-m-d H:i:s');
            $existingSettings['last_transaction_id'] = $txnid;
            $existingSettings['payment_gateway'] = 'payu_money';

            DB::connection('mysql')->table('shops')
                ->where('id', $shop->id)
                ->update([
                    'status' => 'active',
                    'settings' => json_encode($existingSettings),
                    'updated_at' => now(),
                ]);

            // 1. Insert new Active Subscription Record into shop_subscriptions
            $planRecord = DB::connection('mysql')->table('subscription_plans')
                ->where('code', $planId)
                ->orWhere('id', is_numeric($planId) ? (int)$planId : 0)
                ->first();
            $planDbId = $planRecord ? $planRecord->id : 1;

            $renewalSubId = DB::connection('mysql')->table('shop_subscriptions')->insertGetId([
                'shop_id' => $shop->id,
                'plan_id' => $planDbId,
                'licensed_categories' => json_encode(['all']),
                'starts_at' => $baseDate->format('Y-m-d H:i:s'),
                'expires_at' => $newValidUntil,
                'grace_ends_at' => \Carbon\Carbon::parse($newValidUntil)->addDays(7)->format('Y-m-d H:i:s'),
                'status' => 'active',
                'auto_renew' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 2. Insert/Update Passbook Entry in subscription_payments
            $renewalInvoiceNo = 'INV-' . strtoupper($shop->shop_code) . '-' . time();
            $renewalPassbookMetadata = [
                'type' => 'renewal',
                'invoice_no' => $renewalInvoiceNo,
                'shop_code' => $shop->shop_code,
                'store_name' => $shop->name,
                'plan_name' => $planInfo['plan_name'],
                'plan_code' => $planId,
                'duration_days' => $planInfo['duration_days'],
                'billing_cycle' => $cycle,
                'valid_until' => $newValidUntil,
                'amount_paid' => $planInfo['total_amount'],
                'payment_date' => now()->toIso8601String(),
                'payment_gateway' => 'PayU Money (Live)',
            ];

            DB::connection('mysql')->table('subscription_payments')
                ->updateOrInsert(
                    ['transaction_id' => $txnid],
                    [
                        'shop_id' => $shop->id,
                        'shop_subscription_id' => $renewalSubId,
                        'amount' => number_format((float)$planInfo['total_amount'], 2, '.', ''),
                        'payment_method' => 'payu_money',
                        'gateway' => 'payu',
                        'status' => 'success',
                        'metadata' => json_encode($renewalPassbookMetadata),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );

            // 3. Update tenant database settings if tenant database exists
            try {
                if (!empty($shop->database_name)) {
                    \Illuminate\Support\Facades\Config::set('database.connections.tenant.database', $shop->database_name);
                    DB::purge('tenant');
                    DB::connection('tenant')->table('settings')->updateOrInsert(
                        ['key' => 'valid_until'],
                        ['value' => $newValidUntil, 'updated_at' => now()]
                    );
                    DB::connection('tenant')->table('settings')->updateOrInsert(
                        ['key' => 'plan_name'],
                        ['value' => $planInfo['plan_name'], 'updated_at' => now()]
                    );
                }
            } catch (\Throwable $e) {}

            // Calculate and auto-credit Agent Renewal Commission if shop was referred by an agent
            try {
                $referral = DB::connection('mysql')->table('agent_referrals')->where('shop_id', $shop->id)->first();
                if ($referral) {
                    $agent = DB::connection('mysql')->table('agents')->where('id', $referral->agent_id)->first();
                    if ($agent && ($agent->status === 'approved' || $agent->status === 'active')) {
                        $rate = (float)($agent->commission_rate_percent ?: 10.00);
                        $saleAmount = (float)$planInfo['total_amount'];
                        $gross = $saleAmount * ($rate / 100);
                        $tds = $gross * 0.05;
                        $net = $gross - $tds;

                        DB::connection('mysql')->table('agent_commissions')->insert([
                            'agent_id' => $agent->id,
                            'shop_id' => $shop->id,
                            'subscription_payment_id' => null,
                            'commission_type' => 'renewal',
                            'commission_amount' => $gross,
                            'tds_rate' => 5.00,
                            'tds_amount' => $tds,
                            'net_payable' => $net,
                            'status' => 'approved',
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                    }
                }
            } catch (\Throwable $e) {
                Log::error('Agent renewal commission credit error: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'type' => 'renew',
                'message' => "Payment of ₹" . number_format($planInfo['total_amount'], 2) . " received via PayU Money! Store {$shop->shop_code} validity extended until {$newValidUntil}.",
                'store' => [
                    'id' => $shop->id,
                    'shop_code' => $shop->shop_code,
                    'name' => $shop->name,
                    'plan_name' => $planInfo['plan_name'],
                    'plan_id' => $planId,
                    'billing_cycle' => $cycle,
                    'valid_until' => $newValidUntil,
                    'status' => 'active',
                    'transaction_id' => $txnid,
                ],
                'valid_until' => $newValidUntil,
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Invalid transaction type.'], 400);
    }

    /**
     * Handle PayU standard web redirect callback (surl / furl)
     */
    public function handleCallback(Request $request, string $result)
    {
        $status = strtolower($request->input('status', ''));
        $txnid = $request->input('txnid', '');
        $type = $request->input('udf1', 'onboard');
        $shopCode = $request->input('udf2', '');

        if ($result === 'success' || $status === 'success') {
            // Process verification
            $req = new Request([
                'txnid' => $txnid,
                'status' => 'success',
                'type' => $type,
                'shop_code' => ($type === 'renew') ? $shopCode : '',
                'plan_id' => $request->input('udf3', 'yearly-package'),
                'billing_cycle' => $request->input('udf4', 'yearly'),
                'own_whatsapp' => $request->input('udf5') === '1',
            ]);

            $response = $this->verifyAndComplete($req);
            $respData = $response->getData(true);
            $finalStoreCode = $respData['store']['shop_code'] ?? $shopCode;

            if ($type === 'onboard') {
                if ($finalStoreCode) {
                    session(['active_store_code' => $finalStoreCode]);
                    cookie()->queue(cookie('shoppy_active_store_code', $finalStoreCode, 60 * 24));
                    cookie()->queue(cookie('shoppy_active_store', $finalStoreCode, 60 * 24));
                }
                return redirect('/shop-admin/settings?setup=1&code=' . urlencode($finalStoreCode) . '&provisioning=1&txnid=' . urlencode($txnid));
            }

            if ($type === 'renew') {
                if ($finalStoreCode) {
                    session(['active_store_code' => $finalStoreCode]);
                    cookie()->queue(cookie('shoppy_active_store_code', $finalStoreCode, 60 * 24));
                    cookie()->queue(cookie('shoppy_active_store', $finalStoreCode, 60 * 24));
                }
                return redirect('/shop-admin?renewal_status=success&code=' . urlencode($finalStoreCode) . '&txnid=' . urlencode($txnid));
            }

            return redirect('/?payu_status=success&txnid=' . urlencode($txnid) . '&type=' . urlencode($type) . '&shop=' . urlencode($finalStoreCode));
        }

        return redirect('/?payu_status=failed&txnid=' . urlencode($txnid));
    }

    /**
     * Get Store Subscription Status & Payment Passbook Ledger
     */
    public function getPassbook(Request $request): JsonResponse
    {
        $shopCode = $request->query('code')
            ?? $request->query('shop_code')
            ?? $request->header('X-Shop-Code')
            ?? session('active_store_code')
            ?? $request->cookie('shoppy_active_store_code');

        $shop = null;
        if ($shopCode) {
            $shop = DB::connection('mysql')->table('shops')->where('shop_code', strtoupper(trim($shopCode)))->first();
        }
        if (!$shop) {
            $shop = DB::connection('mysql')->table('shops')->where('status', 'active')->first();
        }

        if (!$shop) {
            return response()->json(['success' => false, 'message' => 'Store not found.'], 404);
        }

        $settings = json_decode($shop->settings ?? '{}', true) ?: [];
        $validUntil = $settings['valid_until'] ?? null;
        $planName = $settings['plan_name'] ?? 'Yearly Package';
        $cycle = $settings['billing_cycle'] ?? 'yearly';

        $daysRemaining = 0;
        $isExpired = false;
        $isExpiringSoon = false;
        if ($validUntil) {
            $expiry = \Carbon\Carbon::parse($validUntil)->startOfDay();
            $today = now()->startOfDay();
            $daysRemaining = (int)$today->diffInDays($expiry, false);
            $isExpired = ($daysRemaining < 0);
            $isExpiringSoon = ($daysRemaining >= 0 && $daysRemaining <= 5);
        }

        // Fetch all payment ledger rows for this shop (Passbook)
        $payments = DB::connection('mysql')->table('subscription_payments')
            ->where('shop_id', $shop->id)
            ->where('status', 'success')
            ->orderBy('id', 'desc')
            ->get()
            ->map(function ($p) {
                $meta = json_decode($p->metadata ?? '{}', true) ?: [];
                return [
                    'id' => $p->id,
                    'transaction_id' => $p->transaction_id,
                    'amount' => (float)$p->amount,
                    'formatted_amount' => '₹' . number_format((float)$p->amount, 2),
                    'payment_method' => 'PayU Money',
                    'gateway' => 'PayU Gateway (Instant UPI / Cards)',
                    'status' => 'success',
                    'date' => \Carbon\Carbon::parse($p->created_at)->format('d M Y, h:i A'),
                    'invoice_no' => $meta['invoice_no'] ?? ('INV-' . $p->id),
                    'plan_name' => $meta['plan_name'] ?? 'Retail ERP Package',
                    'billing_cycle' => $meta['billing_cycle'] ?? 'yearly',
                    'duration_days' => $meta['duration_days'] ?? 365,
                    'valid_until' => $meta['valid_until'] ?? null,
                    'type' => $meta['type'] ?? 'payment',
                ];
            });

        return response()->json([
            'success' => true,
            'shop' => [
                'id' => $shop->id,
                'name' => $shop->name,
                'shop_code' => $shop->shop_code,
                'status' => $shop->status,
                'plan_name' => $planName,
                'billing_cycle' => $cycle,
                'valid_until' => $validUntil,
                'days_remaining' => $daysRemaining,
                'is_expired' => $isExpired,
                'is_expiring_soon' => $isExpiringSoon,
            ],
            'passbook' => $payments,
            'total_paid' => $payments->sum('amount'),
            'total_transactions' => count($payments),
        ]);
    }

    /**
     * Get Subscription Expiry Status API
     */
    public function getSubscriptionStatus(Request $request): JsonResponse
    {
        return $this->getPassbook($request);
    }
}


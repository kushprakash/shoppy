<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Services\CommunicationService;
use App\Services\PaytmChecksum;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaytmController extends Controller
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
            'base_price' => $basePrice,
            'whatsapp_addon' => $whatsappAddon,
            'total_amount' => $totalAmount,
            'duration_days' => $durationDays,
        ];
    }

    /**
     * Initiate Paytm UPI Intent & Dynamic QR for Store Onboarding / Renewal
     */
    public function initiateUpiIntent(Request $request): JsonResponse
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
            'owner_email' => 'required_if:type,onboard|nullable|email|max:255',
            'state_code' => 'nullable|string|max:16',
            'city' => 'nullable|string|max:128',
            'referral_code' => 'nullable|string|max:64',
            // Renewal fields
            'shop_code' => 'required_if:type,renew|nullable|string|max:32',
        ]);

        $type = $validated['type'];
        $planCode = $validated['plan_id'];
        $cycle = $validated['billing_cycle'] ?: 'yearly';
        $ownWhatsapp = !empty($validated['own_whatsapp']);

        $planInfo = $this->getPlanDetails($planCode, $cycle, $ownWhatsapp);
        $totalAmount = (float)$planInfo['total_amount'];
        $formattedAmount = number_format($totalAmount, 2, '.', '');

        // Generate distinct Order ID: PTM_ + timestamp + 6-random
        $orderId = 'PTM_' . time() . '_' . strtoupper(Str::random(6));

        // Merchant Credentials
        $vpa = config('services.paytm.upi', 'paytm.s1lcife@pty');
        $mid = config('services.paytm.key', 'oMLHAD02125387471881');
        $merchantName = 'Shoppy ERP';

        $storeDisplayName = $type === 'onboard' ? ($request->input('name') ?: 'New Store') : ($request->input('shop_code'));
        $note = "Shoppy ERP - " . Str::limit($storeDisplayName, 25, '');
        $encodedNote = urlencode($note);

        // Standard NPCI UPI Intent Link (Deep-links to GPay, PhonePe, Paytm, BHIM)
        $upiIntentUrl = "upi://pay?pa={$vpa}&pn=" . urlencode($merchantName) . "&tr={$orderId}&am={$formattedAmount}&cu=INR&tn={$encodedNote}&mc=5411";

        // Dynamic QR image generator endpoint
        $qrImageUrl = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=8&data=" . urlencode($upiIntentUrl);

        // Prepare metadata
        $metadata = [
            'type' => $type,
            'order_id' => $orderId,
            'plan_id' => $planCode,
            'plan_name' => $planInfo['plan_name'],
            'billing_cycle' => $cycle,
            'duration_days' => $planInfo['duration_days'],
            'total_amount' => $totalAmount,
            'own_whatsapp' => $ownWhatsapp,
            'name' => $request->input('name') ?: 'New Retail Store',
            'owner_name' => $request->input('owner_name') ?: 'Store Owner',
            'owner_phone' => preg_replace('/[^0-9]/', '', (string)$request->input('owner_phone')),
            'owner_email' => $request->input('owner_email'),
            'state_code' => $request->input('state_code') ?: '10',
            'city' => $request->input('city') ?: 'BIHAR',
            'referral_code' => $request->input('referral_code') ?: null,
            'shop_code' => $request->input('shop_code') ?: null,
            'gateway' => 'paytm_upi',
        ];

        // Cache metadata for 6 hours
        Cache::put("paytm_order_{$orderId}", $metadata, now()->addHours(6));

        // Insert pending payment ledger in subscription_payments
        try {
            DB::connection('mysql')->table('subscription_payments')->insert([
                'transaction_id' => $orderId,
                'amount' => $totalAmount,
                'status' => 'pending',
                'payment_mode' => 'Paytm UPI Dynamic QR',
                'metadata' => json_encode($metadata),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            Log::warning("Paytm initiate payment insert note: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'order_id' => $orderId,
            'amount' => $totalAmount,
            'formatted_amount' => number_format($totalAmount, 2),
            'vpa' => $vpa,
            'mid' => $mid,
            'merchant_name' => $merchantName,
            'plan_name' => $planInfo['plan_name'],
            'upi_intent_url' => $upiIntentUrl,
            'qr_image_url' => $qrImageUrl,
            'metadata' => $metadata,
            'message' => 'Paytm UPI QR & Intent generated successfully. Scan with any UPI app to pay.'
        ]);
    }

    /**
     * Check Order Status from Paytm Gateway V3 API
     */
    public function checkOrderStatus(Request $request): JsonResponse
    {
        $orderId = $request->input('order_id') ?: $request->input('orderId');
        if (!$orderId) {
            return response()->json(['success' => false, 'message' => 'Order ID is required.'], 422);
        }

        $res = $this->queryPaytmOrderStatus($orderId);
        return response()->json($res);
    }

    /**
     * Internal Query to Paytm V3 Gateway Order Status API
     */
    protected function queryPaytmOrderStatus(string $orderId): array
    {
        $mid = config('services.paytm.key', 'oMLHAD02125387471881');
        $merchantKey = config('services.paytm.salt', 'AAuN7izDWN5cb8A5scnUiNME+LkZqI2DWgkXlN1McoP6WZABa/KkFTiLvuPRP6/nWK8BPg/rPhb+u4QMrUEX10UsANTDbJaALcSM9b8Wk218X+55T/zOzb7xoiB+BcX8yYuYayELImXJHIgL/c7nkAnHrwUCmbM97nRbCVVRvU0ku3Tr');

        $paytmParams = [
            "body" => [
                "mid" => $mid,
                "orderId" => $orderId,
            ]
        ];

        try {
            $checksum = PaytmChecksum::generateSignature(json_encode($paytmParams["body"], JSON_UNESCAPED_SLASHES), $merchantKey);
            $paytmParams["head"] = [
                "signature" => $checksum
            ];

            $postData = json_encode($paytmParams, JSON_UNESCAPED_SLASHES);
            $url = "https://securegw.paytm.in/v3/order/status";

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 8);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);

            $response = curl_exec($ch);
            $err = curl_error($ch);
            curl_close($ch);

            Log::info("Paytm queryOrderStatus [{$orderId}]: response = {$response}, curl_err = {$err}");

            if (!$err && $response) {
                $result = json_decode($response, true);
                $resultInfo = $result['body']['resultInfo'] ?? [];
                $resultStatus = $resultInfo['resultStatus'] ?? '';

                if ($resultStatus === 'TXN_SUCCESS') {
                    return [
                        'success' => true,
                        'status' => 'TXN_SUCCESS',
                        'order_id' => $orderId,
                        'txn_id' => $result['body']['txnId'] ?? null,
                        'bank_txn_id' => $result['body']['bankTxnId'] ?? null,
                        'amount' => $result['body']['txnAmount'] ?? null,
                        'message' => 'Transaction verified successfully via Paytm!'
                    ];
                }

                return [
                    'success' => false,
                    'status' => $resultStatus ?: 'PENDING',
                    'order_id' => $orderId,
                    'message' => $resultInfo['resultMsg'] ?? 'Payment pending.'
                ];
            }
        } catch (\Throwable $e) {
            Log::error("Paytm queryOrderStatus error: " . $e->getMessage());
        }

        return [
            'success' => false,
            'status' => 'PENDING',
            'order_id' => $orderId,
            'message' => 'Waiting for UPI payment confirmation...'
        ];
    }

    /**
     * Verify Paytm Payment and Provision Store & Database + Dispatch Welcome SMS & Email
     */
    public function verifyPayment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => 'required|string',
            'status' => 'nullable|string',
            'utr' => 'nullable|string|max:64',
            'store_data' => 'nullable|array',
        ]);

        $orderId = trim($validated['order_id']);
        $submittedStatus = $validated['status'] ?? 'success';
        $utrNumber = $validated['utr'] ?? null;

        // Retrieve metadata saved during initiate
        $metadata = Cache::get("paytm_order_{$orderId}");
        if (!$metadata) {
            $payRow = DB::connection('mysql')->table('subscription_payments')
                ->where('transaction_id', $orderId)
                ->first();
            if ($payRow && !empty($payRow->metadata)) {
                $metadata = json_decode($payRow->metadata, true);
            }
        }

        // Verify with Paytm Gateway
        $paytmCheck = $this->queryPaytmOrderStatus($orderId);
        $isGatewaySuccess = ($paytmCheck['status'] ?? '') === 'TXN_SUCCESS';

        // Allow verification if gateway confirms TXN_SUCCESS OR confirmed manual/app pay
        $verified = $isGatewaySuccess || ($submittedStatus === 'success');
        if (!$verified) {
            return response()->json([
                'success' => false,
                'message' => 'Payment has not been completed yet. Please complete UPI payment and verify again.'
            ], 400);
        }

        $type = $metadata['type'] ?? ($request->input('type') ?: 'onboard');

        // =====================================================================
        // 1. STORE SIGN UP / ONBOARDING FLOW
        // =====================================================================
        if ($type === 'onboard') {
            $storeData = $validated['store_data'] ?? ($metadata ?? []);
            $storeName = $storeData['name'] ?? ($storeData['storeName'] ?? 'New Retail Store');
            $ownerName = $storeData['ownerName'] ?? ($storeData['owner_name'] ?? 'Store Owner');
            $ownerPhone = $storeData['ownerPhone'] ?? ($storeData['owner_phone'] ?? '9546042639');
            $ownerEmail = $storeData['ownerEmail'] ?? ($storeData['owner_email'] ?? ($metadata['owner_email'] ?? null));
            $stateCode = $storeData['stateCode'] ?? ($storeData['state_code'] ?? ($storeData['state'] ?? '10'));
            $referralCode = $storeData['referralCode'] ?? ($storeData['referral_code'] ?? ($metadata['referral_code'] ?? null));
            $planId = $storeData['planId'] ?? ($storeData['plan_id'] ?? ($metadata['plan_id'] ?? 'yearly-package'));
            $cycle = $storeData['billingCycle'] ?? ($storeData['billing_cycle'] ?? ($metadata['billing_cycle'] ?? 'yearly'));
            $ownWhatsapp = !empty($storeData['ownWhatsapp']) || !empty($storeData['own_whatsapp']) || !empty($metadata['own_whatsapp']);

            // Format strictly: SP + YmdHis (e.g. SP20261106015100)
            $code = 'SP' . date('YmdHis');
            while (DB::connection('mysql')->table('shops')->where('shop_code', $code)->exists()) {
                sleep(1);
                $code = 'SP' . date('YmdHis');
            }

            if (empty($ownerEmail) || !filter_var($ownerEmail, FILTER_VALIDATE_EMAIL)) {
                $ownerEmail = strtolower(Str::slug($ownerName)) . '@' . strtolower($code) . '.shoppy.io';
            }

            $planInfo = $this->getPlanDetails($planId, $cycle, $ownWhatsapp);
            $slug = Str::slug($storeName) . '-' . strtolower(substr($code, -6));
            $dbName = \App\Models\Central\Shop::buildTenantDatabaseName($storeName, $code);
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
                'payment_gateway' => 'paytm_upi',
                'last_transaction_id' => $orderId,
                'referral_code' => $referralCode,
                'initial_setup_completed' => false,
            ];

            // 1. Insert Shop into central database
            $shopId = DB::connection('mysql')->table('shops')->insertGetId([
                'name' => $storeName,
                'shop_code' => $code,
                'slug' => $slug,
                'owner_name' => $ownerName,
                'owner_email' => $ownerEmail,
                'owner_phone' => $ownerPhone,
                'database_name' => $dbName,
                'status' => 'active',
                'settings' => json_encode($settings),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // 2. Link Agent Referral & Commission if valid referral_code provided
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

            // 3. Create Subscription Record
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

            // 4. Update subscription_payments record
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
                'payment_gateway' => 'Paytm UPI Dynamic QR',
                'utr_number' => $utrNumber ?: ($paytmCheck['txn_id'] ?? null),
            ]);

            DB::connection('mysql')->table('subscription_payments')
                ->where('transaction_id', $orderId)
                ->update([
                    'shop_id' => $shopId,
                    'shop_subscription_id' => $subscriptionId,
                    'status' => 'success',
                    'metadata' => json_encode($passbookMetadata),
                    'updated_at' => now()
                ]);

            // 5. Provision isolated tenant database
            try {
                $sanitizedDbName = preg_replace('/[^a-zA-Z0-9_\-]/', '', $dbName);
                DB::connection('mysql')->statement("CREATE DATABASE IF NOT EXISTS `{$sanitizedDbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

                Config::set('database.connections.tenant.database', $sanitizedDbName);
                DB::purge('tenant');
                DB::reconnect('tenant');

                Artisan::call('migrate', [
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

                // Seed Default Admin User with actual merchant email & mobile
                DB::connection('tenant')->table('users')->insert([
                    'name' => $ownerName,
                    'email' => $ownerEmail,
                    'phone' => $ownerPhone,
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
                    ['key' => 'contact_email', 'value' => $ownerEmail, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'state_code', 'value' => $stateCode, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'state_name', 'value' => $stateName, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'theme_color', 'value' => '#008ba3', 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'valid_until', 'value' => $validUntil, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'plan_name', 'value' => $planInfo['plan_name'], 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'plan_id', 'value' => $planId, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'billing_cycle', 'value' => $cycle, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'subscription_id', 'value' => (string)$subscriptionId, 'created_at' => now(), 'updated_at' => now()],
                    ['key' => 'last_transaction_id', 'value' => $orderId, 'created_at' => now(), 'updated_at' => now()],
                ]);
            } catch (\Throwable $e) {
                Log::error('Tenant DB provisioning error via Paytm: ' . $e->getMessage());
            }

            // 6. Dispatch Welcome SMS via Buzzify
            try {
                CommunicationService::sendWelcomeSms(
                    name: $ownerName,
                    mobile: $ownerPhone,
                    storeCode: $code,
                    password: 'admin123',
                    mpin: '123456'
                );
            } catch (\Throwable $e) {
                Log::warning("Paytm verify: Welcome SMS error: " . $e->getMessage());
            }

            // 7. Dispatch Welcome Email via Gmail SMTP
            try {
                CommunicationService::sendWelcomeEmail(
                    ownerName: $ownerName,
                    ownerEmail: $ownerEmail,
                    storeCode: $code,
                    password: 'admin123',
                    storeName: $storeName,
                    validUntil: $validUntil,
                    planName: $planInfo['plan_name'],
                    mpin: '123456'
                );
            } catch (\Throwable $e) {
                Log::warning("Paytm verify: Welcome Email error: " . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'type' => 'onboard',
                'message' => "Payment verified! Store {$code} has been provisioned successfully via Paytm UPI.",
                'store' => [
                    'id' => $shopId,
                    'shop_code' => $code,
                    'name' => $storeName,
                    'owner_name' => $ownerName,
                    'owner_email' => $ownerEmail,
                    'owner_phone' => $ownerPhone,
                    'state_code' => $stateCode,
                    'state_name' => $stateName,
                    'database_name' => $dbName,
                    'plan_name' => $planInfo['plan_name'],
                    'plan_id' => $planId,
                    'billing_cycle' => $cycle,
                    'valid_until' => $validUntil,
                    'terminal_password' => 'admin123',
                    'default_mpin' => '123456',
                    'status' => 'active',
                    'transaction_id' => $orderId,
                ],
                'auto_login' => true,
                'redirect_url' => '/shop-admin/settings?setup=1',
            ]);
        }

        // =====================================================================
        // 2. STORE RENEWAL FLOW
        // =====================================================================
        if ($type === 'renew') {
            $shopCode = $metadata['shop_code'] ?? ($request->input('shop_code') ?: '');
            $shop = DB::connection('mysql')->table('shops')->where('shop_code', strtoupper($shopCode))->first();

            if (!$shop) {
                return response()->json(['success' => false, 'message' => 'Store not found for renewal.'], 404);
            }

            $planId = $metadata['plan_id'] ?? 'yearly-package';
            $cycle = $metadata['billing_cycle'] ?? 'yearly';
            $ownWhatsapp = !empty($metadata['own_whatsapp']);
            $planInfo = $this->getPlanDetails($planId, $cycle, $ownWhatsapp);

            $settings = json_decode($shop->settings, true) ?: [];
            $currentValidUntil = $settings['valid_until'] ?? null;

            $baseDate = ($currentValidUntil && strtotime($currentValidUntil) > time())
                ? \Carbon\Carbon::parse($currentValidUntil)
                : now();

            $newValidUntil = $baseDate->addDays($planInfo['duration_days'])->format('Y-m-d');
            $settings['valid_until'] = $newValidUntil;
            $settings['plan_id'] = $planId;
            $settings['plan_name'] = $planInfo['plan_name'];
            $settings['billing_cycle'] = $cycle;
            $settings['last_transaction_id'] = $orderId;

            DB::connection('mysql')->table('shops')->where('id', $shop->id)->update([
                'status' => 'active',
                'settings' => json_encode($settings),
                'updated_at' => now(),
            ]);

            // Update Subscription Record
            DB::connection('mysql')->table('shop_subscriptions')
                ->where('shop_id', $shop->id)
                ->where('status', 'active')
                ->update([
                    'expires_at' => $newValidUntil,
                    'grace_ends_at' => \Carbon\Carbon::parse($newValidUntil)->addDays(7)->format('Y-m-d H:i:s'),
                    'updated_at' => now(),
                ]);

            // Update subscription_payments record
            DB::connection('mysql')->table('subscription_payments')
                ->where('transaction_id', $orderId)
                ->update([
                    'shop_id' => $shop->id,
                    'status' => 'success',
                    'updated_at' => now()
                ]);

            return response()->json([
                'success' => true,
                'type' => 'renew',
                'message' => "Store {$shop->shop_code} subscription renewed until {$newValidUntil} via Paytm UPI!",
                'store' => [
                    'id' => $shop->id,
                    'shop_code' => $shop->shop_code,
                    'name' => $shop->name,
                    'valid_until' => $newValidUntil,
                    'plan_name' => $planInfo['plan_name'],
                ]
            ]);
        }

        return response()->json(['success' => false, 'message' => 'Invalid transaction type.'], 400);
    }
}


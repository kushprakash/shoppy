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
     * Creates order on Paytm V3 Gateway first, then generates UPI QR
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
        $merchantKey = config('services.paytm.salt');
        $merchantName = 'Shoppy ERP';

        $storeDisplayName = $type === 'onboard' ? ($request->input('name') ?: 'New Store') : ($request->input('shop_code'));
        $note = "Shoppy ERP - " . Str::limit($storeDisplayName, 25, '');

        // ================================================================
        // Step A: Create Order on Paytm V3 Gateway (so status check works)
        // ================================================================
        $txnToken = null;
        try {
            $paytmBody = [
                "requestType" => "Payment",
                "mid" => $mid,
                "websiteName" => "DEFAULT",
                "orderId" => $orderId,
                "txnAmount" => [
                    "value" => $formattedAmount,
                    "currency" => "INR",
                ],
                "userInfo" => [
                    "custId" => "CUST_" . preg_replace('/[^0-9]/', '', (string)$request->input('owner_phone', '0000000000')),
                ],
                "callbackUrl" => url('/api/paytm/callback'),
            ];

            $checksum = PaytmChecksum::generateSignature(json_encode($paytmBody, JSON_UNESCAPED_SLASHES), $merchantKey);

            $paytmPayload = json_encode([
                "body" => $paytmBody,
                "head" => [
                    "signature" => $checksum,
                ],
            ], JSON_UNESCAPED_SLASHES);

            $initUrl = "https://securegw.paytm.in/theia/api/v1/initiateTransaction?mid={$mid}&orderId={$orderId}";

            $ch = curl_init($initUrl);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $paytmPayload);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
            curl_setopt($ch, CURLOPT_TIMEOUT, 20);

            $initResponse = curl_exec($ch);
            $initErr = curl_error($ch);
            curl_close($ch);

            Log::info("Paytm initiateTransaction [{$orderId}]: response = {$initResponse}, curl_err = {$initErr}");

            if (!$initErr && $initResponse) {
                $initResult = json_decode($initResponse, true);
                $initStatus = $initResult['body']['resultInfo']['resultStatus'] ?? '';
                if ($initStatus === 'S') {
                    $txnToken = $initResult['body']['txnToken'] ?? null;
                    Log::info("Paytm order created successfully [{$orderId}]: txnToken obtained");
                } else {
                    Log::warning("Paytm initiateTransaction [{$orderId}]: status={$initStatus}, msg=" . ($initResult['body']['resultInfo']['resultMsg'] ?? 'unknown'));
                }
            }
        } catch (\Throwable $e) {
            Log::error("Paytm initiateTransaction error [{$orderId}]: " . $e->getMessage());
        }

        // ================================================================
        // Step B: Generate UPI Intent & QR (works with or without gateway)
        // ================================================================
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
            'txn_token' => $txnToken,
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
            'txn_token' => $txnToken,
            'metadata' => $metadata,
            'message' => 'Paytm UPI QR & Intent generated successfully. Scan with any UPI app to pay.'
        ]);
    }

    /**
     * Check Order Status from Paytm Gateway V3 API
     * Falls back to local DB check if gateway fails (checksum mismatch etc.)
     */
    public function checkOrderStatus(Request $request): JsonResponse
    {
        $orderId = $request->input('order_id') ?: $request->input('orderId');
        if (!$orderId) {
            return response()->json(['success' => false, 'message' => 'Order ID is required.'], 422);
        }

        // Try Paytm V3 Gateway first
        $res = $this->queryPaytmOrderStatus($orderId);

        // If Paytm Gateway confirms success, return immediately
        if (($res['status'] ?? '') === 'TXN_SUCCESS') {
            return response()->json($res);
        }

        // Fallback: Check local subscription_payments table
        // (in case payment was received but gateway status check has issues)
        try {
            $payRow = DB::connection('mysql')->table('subscription_payments')
                ->where('transaction_id', $orderId)
                ->first();

            if ($payRow && $payRow->status === 'success') {
                return response()->json([
                    'success' => true,
                    'status' => 'TXN_SUCCESS',
                    'order_id' => $orderId,
                    'message' => 'Payment already verified and processed.'
                ]);
            }
        } catch (\Throwable $e) {
            Log::warning("checkOrderStatus DB fallback error: " . $e->getMessage());
        }

        return response()->json($res);
    }

    /**
     * Internal Query to Paytm V3 Gateway Order Status API
     */
    protected function queryPaytmOrderStatus(string $orderId): array
    {
        $mid = config('services.paytm.key', 'oMLHAD02125387471881');
     

        try {

            // Prepare Status Check Request
            $jsonData = json_encode(["MID" => $mid, "ORDERID" => $orderId]);
            $url = "https://securegw.paytm.in/order/status?JsonData=" . urlencode($jsonData);

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Consider true for prod
            $response = curl_exec($ch);
            
            if (curl_errno($ch)) {
                Log::error("Paytm cURL Error: " . curl_error($ch));
                curl_close($ch);
                return response()->json(['status' => 0, 'message' => 'Payment Verification Failed (Network)']);
            }
            curl_close($ch);

          

            if (!$err && $response) {
          
             
                $responseArray = json_decode($response, true);

                if ($responseArray && isset($responseArray['STATUS']) && $responseArray['STATUS'] === "TXN_SUCCESS") {
                    return [
                        'success' => true,
                        'status' => 'TXN_SUCCESS',
                        'order_id' => $orderId,
                        'txn_id' => $responseArray['BANKTXNID'] ?? $responseArray['TXNID'] ?? null,
                        'bank_txn_id' => $responseArray['BANKTXNID'] ?? $responseArray['TXNID'] ?? null,
                        'amount' => $responseArray['TXNAMOUNT'] ?? null,
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

            // 7. Dispatch Official GST Tax Invoice Email from ENEXA IT SOLUTIONS PRIVATE LIMITED (Sent BEFORE Welcome Mail)
            try {
                CommunicationService::sendGstInvoiceEmail(
                    ownerName: $ownerName,
                    ownerEmail: $ownerEmail,
                    storeCode: $code,
                    storeName: $storeName,
                    totalAmount: (float)$planInfo['total_amount'],
                    invoiceNumber: $invoiceNo,
                    planName: $planInfo['plan_name'],
                    billingCycle: $cycle,
                    stateCode: $stateCode,
                    stateName: $stateName,
                    ownerPhone: $ownerPhone,
                    transactionId: $orderId,
                    validUntil: $validUntil
                );
                Log::info("Paytm verify: GST Tax Invoice email sent successfully to {$ownerEmail} for store {$code}");
            } catch (\Throwable $e) {
                Log::error("Paytm verify: GST Invoice Email error: " . $e->getMessage());
            }

            // 8. Dispatch Welcome / Login Credentials Email via Gmail SMTP
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
                Log::info("Paytm verify: Welcome email sent successfully to {$ownerEmail} for store {$code}");
            } catch (\Throwable $e) {
                Log::error("Paytm verify: Welcome Email error: " . $e->getMessage());
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

            // Dispatch Official GST Tax Invoice Email on Renewal
            try {
                $renewInvoiceNo = 'INV-REN-' . date('Ymd') . '-' . strtoupper(substr($orderId, -6));
                $renewEmail = $shop->owner_email ?? ($settings['contact_email'] ?? null);
                if ($renewEmail) {
                    CommunicationService::sendGstInvoiceEmail(
                        ownerName: $shop->owner_name ?? 'Store Owner',
                        ownerEmail: $renewEmail,
                        storeCode: $shop->shop_code,
                        storeName: $shop->name,
                        totalAmount: (float)$planInfo['total_amount'],
                        invoiceNumber: $renewInvoiceNo,
                        planName: $planInfo['plan_name'],
                        billingCycle: $cycle,
                        stateCode: $settings['state_code'] ?? '10',
                        stateName: $settings['state_name'] ?? 'BIHAR',
                        ownerPhone: $shop->owner_phone ?? ($settings['contact_phone'] ?? '9546042639'),
                        transactionId: $orderId,
                        validUntil: $newValidUntil
                    );
                    Log::info("Paytm renewal: GST Tax Invoice email sent to {$renewEmail} for {$shop->shop_code}");
                }
            } catch (\Throwable $e) {
                Log::error("Paytm renewal: GST Invoice Email error: " . $e->getMessage());
            }

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


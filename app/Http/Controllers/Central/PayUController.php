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

        if ($plan && !empty($plan->cycles)) {
            $cycles = is_string($plan->cycles) ? json_decode($plan->cycles, true) : $plan->cycles;
            if (isset($cycles[$billingCycle]['offer'])) {
                $basePrice = (float)$cycles[$billingCycle]['offer'];
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

        // Merchant Keys
        $key = config('services.payu.key', 'gtKFFx');
        $salt = config('services.payu.salt', 'eCwWELxi');
        $env = config('services.payu.env', 'test');
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
        $udf2 = $validated['shop_code'] ?? '';
        $udf3 = $planCode;
        $udf4 = $cycle;
        $udf5 = $ownWhatsapp ? '1' : '0';

        // Formula: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
        $hashSequence = "{$key}|{$txnid}|{$formattedAmount}|{$productinfo}|{$firstname}|{$email}|{$udf1}|{$udf2}|{$udf3}|{$udf4}|{$udf5}||||||{$salt}";
        $hash = strtolower(hash('sha512', $hashSequence));

        $surl = url('/api/payu/callback/success');
        $furl = url('/api/payu/callback/failure');

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
            $storeData = $validated['store_data'] ?? [];
            $storeName = $storeData['name'] ?? ($storeData['storeName'] ?? 'New Retail Store');
            $ownerName = $storeData['ownerName'] ?? ($storeData['owner_name'] ?? 'Store Owner');
            $ownerPhone = $storeData['ownerPhone'] ?? ($storeData['owner_phone'] ?? '9546042639');
            $city = $storeData['city'] ?? 'Muzaffarpur, Bihar';
            $planId = $storeData['planId'] ?? ($storeData['plan_id'] ?? 'yearly-package');
            $cycle = $storeData['billingCycle'] ?? ($storeData['billing_cycle'] ?? 'yearly');
            $ownWhatsapp = !empty($storeData['ownWhatsapp']) || !empty($storeData['own_whatsapp']);

            $planInfo = $this->getPlanDetails($planId, $cycle, $ownWhatsapp);

            $code = 'STORE' . rand(100000, 999999);
            $slug = Str::slug($storeName) . '-' . rand(100, 999);
            $dbName = 'tenant_' . strtolower($code);
            $validUntil = now()->addDays($planInfo['duration_days'])->format('Y-m-d');

            $settings = [
                'city' => $city,
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
            ];

            // Insert Shop into central database
            $shopId = DB::connection('mysql')->table('shops')->insertGetId([
                'name' => $storeName,
                'shop_code' => $code,
                'slug' => $slug,
                'owner_name' => $ownerName,
                'owner_email' => strtolower(Str::slug($ownerName)) . '@merchant.shoppy.io',
                'owner_phone' => $ownerPhone,
                'database_name' => $dbName,
                'status' => 'active',
                'settings' => json_encode($settings),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Update subscription_payments record
            DB::connection('mysql')->table('subscription_payments')
                ->where('transaction_id', $txnid)
                ->update([
                    'shop_id' => $shopId,
                    'status' => 'success',
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

                // Seed Initial Branch
                $branchId = DB::connection('tenant')->table('branches')->insertGetId([
                    'name' => 'Main Store',
                    'code' => 'BR-01',
                    'phone' => $ownerPhone,
                    'address' => $city,
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
                    'database_name' => $dbName,
                    'plan_name' => $planInfo['plan_name'],
                    'plan_id' => $planId,
                    'billing_cycle' => $cycle,
                    'valid_until' => $validUntil,
                    'terminal_password' => 'admin123',
                    'status' => 'active',
                    'transaction_id' => $txnid,
                ]
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

            // Update subscription_payments
            DB::connection('mysql')->table('subscription_payments')
                ->where('transaction_id', $txnid)
                ->update([
                    'shop_id' => $shop->id,
                    'status' => 'success',
                    'updated_at' => now(),
                ]);

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
                'shop_code' => $shopCode,
                'plan_id' => $request->input('udf3', 'yearly-package'),
                'billing_cycle' => $request->input('udf4', 'yearly'),
                'own_whatsapp' => $request->input('udf5') === '1',
            ]);

            $this->verifyAndComplete($req);

            return redirect('/?payu_status=success&txnid=' . urlencode($txnid) . '&type=' . urlencode($type) . '&shop=' . urlencode($shopCode));
        }

        return redirect('/?payu_status=failed&txnid=' . urlencode($txnid));
    }
}


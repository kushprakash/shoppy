<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class SettingsController extends Controller
{
    /**
     * Get all 5 pre-integrated Payment Gateways with their status.
     */
    public function getPaymentGateways(): JsonResponse
    {
        $gateways = DB::connection('tenant')->table('tenant_payment_gateways')->get();

        $result = $gateways->map(function ($gw) {
            $credentials = [];
            if (!empty($gw->credentials_encrypted)) {
                try {
                    $decrypted = json_decode(Crypt::decryptString($gw->credentials_encrypted), true) ?? [];
                    // Mask sensitive secret values for UI security
                    foreach ($decrypted as $k => $v) {
                        $len = strlen($v);
                        $credentials[$k] = $len > 6 ? substr($v, 0, 3) . str_repeat('*', $len - 6) . substr($v, -3) : '******';
                    }
                } catch (\Throwable $e) {
                    $credentials = [];
                }
            }

            return [
                'id' => $gw->id,
                'gateway_code' => $gw->gateway_code,
                'display_name' => $gw->display_name,
                'is_active' => (bool) $gw->is_active,
                'is_test_mode' => (bool) $gw->is_test_mode,
                'credentials' => $credentials,
                'has_credentials' => !empty($gw->credentials_encrypted),
                'updated_at' => $gw->updated_at,
            ];
        });

        // Check if any gateway is active
        $hasActiveGateway = $result->contains('is_active', true);

        return response()->json([
            'success' => true,
            'gateways' => $result,
            'fallback_policy' => [
                'has_active_online_gateway' => $hasActiveGateway,
                'active_checkout_mode' => $hasActiveGateway ? 'Online + COD' : 'Only COD (Default Fallback)',
            ],
        ]);
    }

    /**
     * Update/activate a Payment Gateway.
     */
    public function updatePaymentGateway(Request $request, string $code): JsonResponse
    {
        $gateway = DB::connection('tenant')->table('tenant_payment_gateways')
            ->where('gateway_code', $code)
            ->first();

        if (!$gateway) {
            return response()->json(['success' => false, 'message' => 'Invalid payment gateway code'], 404);
        }

        $validated = $request->validate([
            'is_active' => 'required|boolean',
            'is_test_mode' => 'nullable|boolean',
            'credentials' => 'nullable|array',
        ]);

        $updateData = [
            'is_active' => $validated['is_active'],
            'is_test_mode' => $validated['is_test_mode'] ?? $gateway->is_test_mode,
            'updated_at' => now(),
        ];

        // If credentials supplied, encrypt and store
        if (!empty($validated['credentials'])) {
            $updateData['credentials_encrypted'] = Crypt::encryptString(json_encode($validated['credentials']));
        } elseif ($validated['is_active'] && empty($gateway->credentials_encrypted)) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide valid API credentials before activating this gateway.',
            ], 422);
        }

        DB::connection('tenant')->table('tenant_payment_gateways')
            ->where('gateway_code', $code)
            ->update($updateData);

        return response()->json([
            'success' => true,
            'message' => "Payment gateway {$gateway->display_name} updated successfully.",
        ]);
    }

    /**
     * Get all 5 pre-integrated Courier Aggregators with their status.
     */
    public function getShippingProviders(): JsonResponse
    {
        $providers = DB::connection('tenant')->table('tenant_shipping_providers')->get();

        $result = $providers->map(function ($pr) {
            $credentials = [];
            if (!empty($pr->credentials_encrypted)) {
                try {
                    $decrypted = json_decode(Crypt::decryptString($pr->credentials_encrypted), true) ?? [];
                    foreach ($decrypted as $k => $v) {
                        $len = strlen($v);
                        $credentials[$k] = $len > 6 ? substr($v, 0, 3) . str_repeat('*', $len - 6) . substr($v, -3) : '******';
                    }
                } catch (\Throwable $e) {
                    $credentials = [];
                }
            }

            return [
                'id' => $pr->id,
                'provider_code' => $pr->provider_code,
                'display_name' => $pr->display_name,
                'is_active' => (bool) $pr->is_active,
                'pickup_pincode' => $pr->pickup_pincode,
                'settings' => json_decode($pr->settings, true) ?? [],
                'credentials' => $credentials,
                'has_credentials' => !empty($pr->credentials_encrypted),
                'updated_at' => $pr->updated_at,
            ];
        });

        return response()->json([
            'success' => true,
            'providers' => $result,
        ]);
    }

    /**
     * Update/activate a Courier Provider.
     */
    public function updateShippingProvider(Request $request, string $code): JsonResponse
    {
        $provider = DB::connection('tenant')->table('tenant_shipping_providers')
            ->where('provider_code', $code)
            ->first();

        if (!$provider) {
            return response()->json(['success' => false, 'message' => 'Invalid shipping provider code'], 404);
        }

        $validated = $request->validate([
            'is_active' => 'required|boolean',
            'pickup_pincode' => 'nullable|string|max:16',
            'credentials' => 'nullable|array',
            'settings' => 'nullable|array',
        ]);

        $updateData = [
            'is_active' => $validated['is_active'],
            'pickup_pincode' => $validated['pickup_pincode'] ?? $provider->pickup_pincode,
            'settings' => !empty($validated['settings']) ? json_encode($validated['settings']) : $provider->settings,
            'updated_at' => now(),
        ];

        if (!empty($validated['credentials'])) {
            $updateData['credentials_encrypted'] = Crypt::encryptString(json_encode($validated['credentials']));
        } elseif ($validated['is_active'] && empty($provider->credentials_encrypted)) {
            return response()->json([
                'success' => false,
                'message' => 'Please provide valid API credentials before activating this shipping provider.',
            ], 422);
        }

        DB::connection('tenant')->table('tenant_shipping_providers')
            ->where('provider_code', $code)
            ->update($updateData);

        return response()->json([
            'success' => true,
            'message' => "Shipping provider {$provider->display_name} updated successfully.",
        ]);
    }
}

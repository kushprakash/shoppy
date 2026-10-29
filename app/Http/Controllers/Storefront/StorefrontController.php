<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StorefrontController extends Controller
{
    /**
     * Get Storefront basic information, logo, branding, and active business categories.
     */
    public function getStoreInfo(Request $request): JsonResponse
    {
        $shop = $request->attributes->get('tenant');

        $categories = DB::connection('tenant')->table('categories')
            ->where('is_active', true)
            ->get();

        $businessCategories = DB::connection('tenant')->table('business_categories')
            ->where('is_active', true)
            ->get();

        return response()->json([
            'success' => true,
            'store' => [
                'name' => $shop->name,
                'slug' => $shop->slug,
                'shop_code' => $shop->shop_code,
                'phone' => $shop->owner_phone,
                'email' => $shop->owner_email,
                'settings' => $shop->settings ?? [
                    'theme_color' => '#2563eb',
                    'banner_text' => 'Welcome to ' . $shop->name,
                ],
            ],
            'categories' => $categories,
            'business_categories' => $businessCategories,
        ]);
    }

    /**
     * Get product catalog for public storefront (SEO & Cache friendly).
     */
    public function getCatalog(Request $request): JsonResponse
    {
        $query = DB::connection('tenant')->table('products')
            ->where('is_active', true);

        if ($request->has('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('sku', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        $products = $query->latest()->paginate(16);

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    /**
     * Get active payment methods for storefront checkout.
     * RULE: If no online gateway is active, ONLY COD is returned!
     */
    public function getCheckoutPaymentMethods(): JsonResponse
    {
        $activeGateways = DB::connection('tenant')->table('tenant_payment_gateways')
            ->where('is_active', true)
            ->get();

        $methods = [];

        // 1. COD is always available as the base option
        $methods[] = [
            'code' => 'cod',
            'name' => 'Cash on Delivery (COD)',
            'description' => 'Pay cash or UPI upon delivery at your doorstep.',
            'type' => 'offline',
            'is_default' => true,
        ];

        // 2. Add only active online gateways
        foreach ($activeGateways as $gw) {
            $methods[] = [
                'code' => $gw->gateway_code,
                'name' => $gw->display_name,
                'description' => "Pay securely via {$gw->display_name} (UPI, Credit/Debit Card, Netbanking).",
                'type' => 'online',
                'is_test_mode' => (bool) $gw->is_test_mode,
            ];
        }

        return response()->json([
            'success' => true,
            'payment_methods' => $methods,
            'online_gateways_count' => count($activeGateways),
        ]);
    }

    /**
     * Calculate shipping rate using active courier or fallback rate.
     */
    public function calculateShipping(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'pincode' => 'required|string|size:6',
            'total_weight_grams' => 'nullable|integer',
        ]);

        $activeCourier = DB::connection('tenant')->table('tenant_shipping_providers')
            ->where('is_active', true)
            ->first();

        // Calculate rate: if courier is active, simulate/call API; else standard flat rate
        $shippingFee = 60.00; // Standard base shipping fee
        $estimatedDays = '3 - 5 Days';

        if ($activeCourier) {
            $shippingFee = 50.00;
            $estimatedDays = '2 - 4 Days';
        }

        return response()->json([
            'success' => true,
            'shipping_rate' => $shippingFee,
            'estimated_delivery' => $estimatedDays,
            'courier_partner' => $activeCourier ? $activeCourier->display_name : 'Standard Delivery',
            'pincode' => $validated['pincode'],
        ]);
    }

    /**
     * Place a customer order from online storefront.
     */
    public function createOrder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'required|string|max:128',
            'customer_phone' => 'required|string|max:32',
            'customer_email' => 'nullable|email',
            'address_line_1' => 'required|string',
            'city' => 'required|string|max:64',
            'state' => 'required|string|max:64',
            'pincode' => 'required|string|max:16',
            'payment_method' => 'required|string', // cod, phonepe, payu, cashfree, easebuzz, razorpay
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|numeric|min:1',
        ]);

        // Verify payment method validity:
        if ($validated['payment_method'] !== 'cod') {
            $isActiveGateway = DB::connection('tenant')->table('tenant_payment_gateways')
                ->where('gateway_code', $validated['payment_method'])
                ->where('is_active', true)
                ->exists();

            if (!$isActiveGateway) {
                return response()->json([
                    'success' => false,
                    'message' => 'The selected payment gateway is not currently active for this shop. Please choose Cash on Delivery or another active option.',
                ], 422);
            }
        }

        return DB::connection('tenant')->transaction(function () use ($validated) {
            // Find or create customer
            $customer = DB::connection('tenant')->table('customers')
                ->where('phone', $validated['customer_phone'])
                ->first();

            if (!$customer) {
                $customerId = DB::connection('tenant')->table('customers')->insertGetId([
                    'name' => $validated['customer_name'],
                    'phone' => $validated['customer_phone'],
                    'email' => $validated['customer_email'] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $customerId = $customer->id;
            }

            // Calculate Order Totals
            $subtotal = 0;
            $itemsData = [];

            foreach ($validated['items'] as $item) {
                $product = DB::connection('tenant')->table('products')->where('id', $item['product_id'])->first();
                if (!$product) {
                    continue;
                }

                $qty = (float) $item['quantity'];
                $price = (float) $product->selling_price;
                $lineTotal = round($qty * $price, 2);
                $subtotal += $lineTotal;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'tax_rate' => $product->gst_rate,
                    'tax_amount' => round(($lineTotal * $product->gst_rate) / (100 + $product->gst_rate), 2),
                    'total_price' => $lineTotal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            $shippingCharge = 50.00;
            $grandTotal = $subtotal + $shippingCharge;
            $orderNumber = 'ORD-' . strtoupper(Str::random(8));

            $orderId = DB::connection('tenant')->table('orders')->insertGetId([
                'order_number' => $orderNumber,
                'customer_id' => $customerId,
                'channel' => 'online',
                'subtotal' => $subtotal,
                'shipping_charge' => $shippingCharge,
                'grand_total' => $grandTotal,
                'payment_status' => $validated['payment_method'] === 'cod' ? 'pending' : 'pending',
                'order_status' => 'new',
                'payment_method' => $validated['payment_method'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($itemsData as &$itemData) {
                $itemData['order_id'] = $orderId;
            }
            DB::connection('tenant')->table('order_items')->insert($itemsData);

            // Create GST Tax Invoice
            $invoiceNumber = 'INV-' . strtoupper(Str::random(8));
            DB::connection('tenant')->table('invoices')->insert([
                'order_id' => $orderId,
                'invoice_number' => $invoiceNumber,
                'invoice_type' => 'tax_invoice',
                'subtotal' => $subtotal,
                'tax_total' => round($subtotal * 0.18, 2),
                'grand_total' => $grandTotal,
                'status' => 'generated',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Order placed successfully!',
                'order' => [
                    'order_id' => $orderId,
                    'order_number' => $orderNumber,
                    'invoice_number' => $invoiceNumber,
                    'grand_total' => $grandTotal,
                    'payment_method' => $validated['payment_method'],
                    'payment_status' => 'pending',
                ],
            ], 201);
        });
    }
}

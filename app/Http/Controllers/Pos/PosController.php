<?php

namespace App\Http\Controllers\Pos;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PosController extends Controller
{
    /**
     * High-speed barcode / SKU / name product search for POS counters (<50ms).
     */
    public function searchProducts(Request $request): JsonResponse
    {
        $query = $request->query('q', '');

        $products = DB::connection('tenant')->table('products')
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('barcode', $query)
                  ->orWhere('sku', $query)
                  ->orWhere('name', 'like', "%{$query}%");
            })
            ->select('id', 'name', 'sku', 'barcode', 'selling_price', 'mrp', 'gst_rate', 'unit', 'track_inventory')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'products' => $products,
        ]);
    }

    /**
     * Create high-speed POS Counter Bill.
     */
    public function createBill(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customer_name' => 'nullable|string|max:128',
            'customer_phone' => 'nullable|string|max:32',
            'payment_mode' => 'required|string', // cash, card, upi, split
            'cash_amount' => 'nullable|numeric|min:0',
            'upi_amount' => 'nullable|numeric|min:0',
            'card_amount' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer',
            'items.*.quantity' => 'required|numeric|min:0.001',
            'items.*.unit_price' => 'required|numeric|min:0',
            'discount_total' => 'nullable|numeric|min:0',
        ]);

        return DB::connection('tenant')->transaction(function () use ($validated) {
            // Find or create customer
            $customerId = null;
            if (!empty($validated['customer_phone'])) {
                $customer = DB::connection('tenant')->table('customers')
                    ->where('phone', $validated['customer_phone'])
                    ->first();

                if ($customer) {
                    $customerId = $customer->id;
                } else {
                    $customerId = DB::connection('tenant')->table('customers')->insertGetId([
                        'name' => $validated['customer_name'] ?? 'Walk-in Customer',
                        'phone' => $validated['customer_phone'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            $subtotal = 0;
            $taxTotal = 0;
            $orderItems = [];

            foreach ($validated['items'] as $item) {
                $qty = (float) $item['quantity'];
                $price = (float) $item['unit_price'];
                $lineTotal = round($qty * $price, 2);
                $subtotal += $lineTotal;

                $product = DB::connection('tenant')->table('products')->where('id', $item['product_id'])->first();
                $gstRate = $product ? (float) $product->gst_rate : 0.00;
                $taxAmount = round(($lineTotal * $gstRate) / (100 + $gstRate), 2);
                $taxTotal += $taxAmount;

                $orderItems[] = [
                    'product_id' => $item['product_id'],
                    'product_name' => $product ? $product->name : 'POS Item',
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'tax_rate' => $gstRate,
                    'tax_amount' => $taxAmount,
                    'discount_amount' => 0.00,
                    'total_price' => $lineTotal,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // Deduct inventory if tracking is enabled
                if ($product && $product->track_inventory) {
                    DB::connection('tenant')->table('inventory')
                        ->where('product_id', $product->id)
                        ->decrement('quantity', $qty);

                    DB::connection('tenant')->table('stock_movements')->insert([
                        'warehouse_id' => 1,
                        'product_id' => $product->id,
                        'type' => 'sale',
                        'quantity' => -$qty,
                        'balance_after' => 0,
                        'reference_type' => 'pos_sale',
                        'reason' => 'Counter sale',
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            $discount = (float) ($validated['discount_total'] ?? 0);
            $grandTotal = max(0, $subtotal - $discount);
            $orderNumber = 'POS-' . date('Ymd') . '-' . strtoupper(Str::random(4));

            $orderId = DB::connection('tenant')->table('orders')->insertGetId([
                'order_number' => $orderNumber,
                'customer_id' => $customerId,
                'channel' => 'pos',
                'subtotal' => $subtotal,
                'tax_total' => $taxTotal,
                'discount_total' => $discount,
                'grand_total' => $grandTotal,
                'payment_status' => 'paid',
                'order_status' => 'completed',
                'payment_method' => $validated['payment_mode'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($orderItems as &$item) {
                $item['order_id'] = $orderId;
            }
            DB::connection('tenant')->table('order_items')->insert($orderItems);

            // Record Payment
            DB::connection('tenant')->table('payments')->insert([
                'order_id' => $orderId,
                'amount' => $grandTotal,
                'payment_mode' => $validated['payment_mode'],
                'status' => 'completed',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Create GST Tax Invoice
            $invoiceNumber = 'INV-POS-' . strtoupper(Str::random(6));
            $invoiceId = DB::connection('tenant')->table('invoices')->insertGetId([
                'order_id' => $orderId,
                'invoice_number' => $invoiceNumber,
                'invoice_type' => 'tax_invoice',
                'subtotal' => $subtotal,
                'tax_total' => $taxTotal,
                'grand_total' => $grandTotal,
                'status' => 'generated',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'POS Bill generated successfully!',
                'receipt' => [
                    'order_number' => $orderNumber,
                    'invoice_number' => $invoiceNumber,
                    'items_count' => count($orderItems),
                    'subtotal' => $subtotal,
                    'tax_total' => $taxTotal,
                    'discount_total' => $discount,
                    'grand_total' => $grandTotal,
                    'payment_mode' => $validated['payment_mode'],
                    'customer_name' => $validated['customer_name'] ?? 'Walk-in',
                    'timestamp' => now()->format('d-M-Y H:i:s'),
                ],
            ], 201);
        });
    }

    /**
     * Get Cashier Shift Status.
     */
    public function getShiftStatus(): JsonResponse
    {
        $shift = DB::connection('tenant')->table('pos_shifts')
            ->where('status', 'open')
            ->latest()
            ->first();

        return response()->json([
            'success' => true,
            'is_shift_open' => (bool) $shift,
            'shift' => $shift,
        ]);
    }

    /**
     * Open Cashier Shift.
     */
    public function openShift(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'opening_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $shiftId = DB::connection('tenant')->table('pos_shifts')->insertGetId([
            'cash_register_id' => 1,
            'user_id' => 1,
            'opening_cash' => $validated['opening_cash'],
            'status' => 'open',
            'opened_at' => now(),
            'notes' => $validated['notes'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Cashier shift opened successfully.',
            'shift_id' => $shiftId,
        ]);
    }

    /**
     * Close Cashier Shift (Z-Report).
     */
    public function closeShift(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'closing_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $shift = DB::connection('tenant')->table('pos_shifts')
            ->where('status', 'open')
            ->latest()
            ->first();

        if (!$shift) {
            return response()->json(['success' => false, 'message' => 'No active shift found.'], 404);
        }

        // Calculate total cash collected during shift
        $cashSales = DB::connection('tenant')->table('orders')
            ->where('channel', 'pos')
            ->where('payment_method', 'cash')
            ->where('created_at', '>=', $shift->opened_at)
            ->sum('grand_total');

        $expectedCash = (float) $shift->opening_cash + (float) $cashSales;
        $actualCash = (float) $validated['closing_cash'];
        $difference = $actualCash - $expectedCash;

        DB::connection('tenant')->table('pos_shifts')
            ->where('id', $shift->id)
            ->update([
                'closing_cash' => $actualCash,
                'expected_cash' => $expectedCash,
                'closed_at' => now(),
                'status' => 'closed',
                'notes' => $validated['notes'] ?? null,
                'updated_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'message' => 'Shift closed successfully.',
            'z_report' => [
                'opened_at' => $shift->opened_at,
                'closed_at' => now()->toDateTimeString(),
                'opening_cash' => (float) $shift->opening_cash,
                'cash_sales' => (float) $cashSales,
                'expected_cash' => $expectedCash,
                'actual_cash' => $actualCash,
                'difference' => $difference,
                'status' => $difference === 0.0 ? 'Balanced' : ($difference > 0 ? 'Overage' : 'Shortage'),
            ],
        ]);
    }
}

<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class MultiTenantPaymentAndPosTest extends TestCase
{
    protected string $shopCode = 'SHP-A4IFYK';

    /**
     * Test 1: Central Admin stats endpoint returns platform overview.
     */
    public function test_central_admin_stats(): void
    {
        $response = $this->getJson('/api/central/stats');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'stats' => [
                    'total_shops',
                    'active_shops',
                    'total_agents',
                    'approved_agents',
                    'pending_commissions',
                ],
            ]);
    }

    /**
     * Test 2: Storefront checkout returns ONLY COD when no online gateway is active.
     */
    public function test_storefront_returns_only_cod_fallback_when_gateways_inactive(): void
    {
        // Ensure all gateways are inactive first
        DB::connection('mysql')->statement("UPDATE tenant_ramesh_fashion.tenant_payment_gateways SET is_active = 0");

        $response = $this->withHeader('X-Shop-Code', $this->shopCode)
            ->getJson('/api/storefront/payment-methods');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'online_gateways_count' => 0,
            ]);

        $methods = $response->json('payment_methods');
        $this->assertCount(1, $methods);
        $this->assertEquals('cod', $methods[0]['code']);
        $this->assertEquals('Cash on Delivery (COD)', $methods[0]['name']);
    }

    /**
     * Test 3: Activating PhonePe in Shop Settings makes PhonePe appear on storefront checkout.
     */
    public function test_activating_payment_gateway_reflects_on_storefront(): void
    {
        // 1. Activate PhonePe with credentials
        $activateResponse = $this->withHeader('X-Shop-Code', $this->shopCode)
            ->postJson('/api/tenant/settings/payment-gateways/phonepe', [
                'is_active' => true,
                'is_test_mode' => true,
                'credentials' => [
                    'merchant_id' => 'MERCHANTUAT',
                    'salt_key' => '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399',
                    'salt_index' => '1',
                ],
            ]);

        $activateResponse->assertStatus(200);

        // 2. Query storefront checkout payment methods again
        $storefrontResponse = $this->withHeader('X-Shop-Code', $this->shopCode)
            ->getJson('/api/storefront/payment-methods');

        $storefrontResponse->assertStatus(200)
            ->assertJson([
                'success' => true,
                'online_gateways_count' => 1,
            ]);

        $methods = $storefrontResponse->json('payment_methods');
        $this->assertCount(2, $methods); // COD + PhonePe
        $this->assertEquals('cod', $methods[0]['code']);
        $this->assertEquals('phonepe', $methods[1]['code']);
    }

    /**
     * Test 4: POS product search finds items in tenant database.
     */
    public function test_pos_product_search(): void
    {
        $response = $this->withHeader('X-Shop-Code', $this->shopCode)
            ->getJson('/api/pos/products/search?q=shirt');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ]);

        $products = $response->json('products');
        $this->assertNotEmpty($products);
        $this->assertStringContainsString('Shirt', $products[0]['name']);
    }

    /**
     * Test 5: POS bill creation generates invoice and records cash sale.
     */
    public function test_pos_create_bill(): void
    {
        // Fetch product ID from tenant
        $product = DB::connection('mysql')->table('tenant_ramesh_fashion.products')->first();

        $response = $this->withHeader('X-Shop-Code', $this->shopCode)
            ->postJson('/api/pos/bill/create', [
                'customer_name' => 'Amit Sharma',
                'customer_phone' => '9988776655',
                'payment_mode' => 'cash',
                'cash_amount' => 1299.00,
                'items' => [
                    [
                        'product_id' => $product->id,
                        'quantity' => 1,
                        'unit_price' => $product->selling_price,
                    ],
                ],
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'receipt' => [
                    'order_number',
                    'invoice_number',
                    'grand_total',
                    'payment_mode',
                ],
            ]);
    }
}

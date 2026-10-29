<?php

namespace App\Tenancy;

use App\Models\Central\Agent;
use App\Models\Central\AgentCommission;
use App\Models\Central\AgentReferral;
use App\Models\Central\Shop;
use App\Models\Central\ShopCredential;
use App\Models\Central\ShopDomain;
use App\Models\Central\ShopSubscription;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use RuntimeException;

class TenantManager
{
    protected ?Shop $currentTenant = null;

    public function getCurrentTenant(): ?Shop
    {
        return $this->currentTenant;
    }

    public function setCurrentTenant(?Shop $shop): void
    {
        $this->currentTenant = $shop;

        if ($shop) {
            $this->switchConnection($shop);
        }
    }

    /**
     * Switch database connection dynamically to tenant's isolated database.
     */
    public function switchConnection(Shop $shop): void
    {
        Config::set('database.connections.tenant.database', $shop->database_name);
        DB::purge('tenant');
        DB::reconnect('tenant');
        DB::setDefaultConnection('tenant');
    }

    /**
     * Switch back to central database.
     */
    public function switchConnectionToCentral(): void
    {
        DB::purge('mysql');
        DB::reconnect('mysql');
        DB::setDefaultConnection('mysql');
        $this->currentTenant = null;
    }

    /**
     * Create dedicated MySQL database for a new shop.
     */
    public function createTenantDatabase(string $databaseName): void
    {
        // Sanitize database name to prevent SQL injection
        $sanitizedDbName = preg_replace('/[^a-zA-Z0-9_]/', '', $databaseName);

        if (empty($sanitizedDbName)) {
            throw new RuntimeException("Invalid tenant database name: {$databaseName}");
        }

        DB::connection('mysql')->statement(
            "CREATE DATABASE IF NOT EXISTS `{$sanitizedDbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        );
    }

    /**
     * Run tenant migrations inside tenant's isolated database.
     */
    public function runTenantMigrations(Shop $shop): void
    {
        Config::set('database.connections.tenant.database', $shop->database_name);
        DB::purge('tenant');
        DB::reconnect('tenant');

        $exitCode = Artisan::call('migrate', [
            '--database' => 'tenant',
            '--path' => 'database/migrations/tenant',
            '--force' => true,
        ]);

        if ($exitCode !== 0) {
            throw new RuntimeException("Tenant migration failed for shop: {$shop->shop_code}. " . Artisan::output());
        }
    }

    /**
     * Atomic, idempotent shop provisioning pipeline.
     */
    public function provisionNewShop(array $data): Shop
    {
        return DB::connection('mysql')->transaction(function () use ($data) {
            $slug = Str::slug($data['slug'] ?? $data['name']);
            $shopCode = $data['shop_code'] ?? ('SHP-' . strtoupper(Str::random(6)));
            $databaseName = 'tenant_' . str_replace('-', '_', $slug);

            // 1. Create Central Shop Record
            $shop = Shop::create([
                'name' => $data['name'],
                'shop_code' => $shopCode,
                'slug' => $slug,
                'database_name' => $databaseName,
                'status' => 'active',
                'owner_name' => $data['owner_name'],
                'owner_email' => $data['owner_email'],
                'owner_phone' => $data['owner_phone'],
                'settings' => $data['settings'] ?? [
                    'theme_color' => '#3b82f6',
                    'currency' => 'INR',
                ],
            ]);

            // 2. Map Primary Subdomain
            $subdomain = $slug . '.' . env('APP_CENTRAL_DOMAIN', 'shoppy.local');
            ShopDomain::create([
                'shop_id' => $shop->id,
                'domain' => $subdomain,
                'is_custom' => false,
                'is_verified' => true,
                'ssl_status' => 'active',
                'is_primary' => true,
            ]);

            // 3. Generate High-Entropy Cryptographic Merchant Key
            $merchantKey = Str::random(64);
            ShopCredential::create([
                'shop_id' => $shop->id,
                'merchant_key_hash' => hash('sha256', $merchantKey),
                'merchant_key_encrypted' => Crypt::encryptString($merchantKey),
                'key_version' => 1,
                'status' => 'active',
            ]);

            // 4. Create Tenant Database in MySQL
            $this->createTenantDatabase($databaseName);

            // 5. Run Tenant Migrations
            $this->runTenantMigrations($shop);

            // 6. Seed Tenant initial entities (Branch, Warehouse, Admin User, Categories)
            $this->seedTenantInitialData($shop, $data);

            // 7. Create 30-day Trial Subscription
            ShopSubscription::create([
                'shop_id' => $shop->id,
                'licensed_categories' => $data['categories'] ?? ['general_retail'],
                'starts_at' => now(),
                'expires_at' => now()->addDays(30),
                'grace_ends_at' => now()->addDays(37), // 7 days grace period
                'status' => 'active',
                'auto_renew' => true,
            ]);

            // 8. Link Agent Referral if provided
            if (!empty($data['agent_referral_code'])) {
                $agent = Agent::where('referral_code', $data['agent_referral_code'])
                    ->where('status', 'approved')
                    ->first();

                if ($agent) {
                    AgentReferral::create([
                        'agent_id' => $agent->id,
                        'shop_id' => $shop->id,
                        'referral_code' => $agent->referral_code,
                    ]);

                    // Add fixed signup bonus commission
                    AgentCommission::create([
                        'agent_id' => $agent->id,
                        'shop_id' => $shop->id,
                        'commission_type' => 'signup',
                        'commission_amount' => $agent->fixed_signup_bonus,
                        'tds_rate' => 5.00,
                        'tds_amount' => round($agent->fixed_signup_bonus * 0.05, 2),
                        'net_payable' => round($agent->fixed_signup_bonus * 0.95, 2),
                        'status' => 'pending',
                    ]);
                }
            }

            // Return to central connection
            $this->switchConnectionToCentral();

            return $shop;
        });
    }

    /**
     * Seed initial tenant data into newly migrated database.
     */
    protected function seedTenantInitialData(Shop $shop, array $data): void
    {
        Config::set('database.connections.tenant.database', $shop->database_name);
        DB::purge('tenant');
        DB::reconnect('tenant');

        // Create Main Branch
        $branchId = DB::connection('tenant')->table('branches')->insertGetId([
            'name' => 'Main Store',
            'code' => 'BR-01',
            'phone' => $shop->owner_phone,
            'address' => $data['address'] ?? 'Store Head Office',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create Default Warehouse
        DB::connection('tenant')->table('warehouses')->insert([
            'branch_id' => $branchId,
            'name' => 'Main Warehouse',
            'code' => 'WH-01',
            'is_default' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create Shop Owner Admin User
        DB::connection('tenant')->table('users')->insert([
            'branch_id' => $branchId,
            'name' => $shop->owner_name,
            'email' => $shop->owner_email,
            'phone' => $shop->owner_phone,
            'password' => Hash::make($data['password'] ?? 'Secret123!'),
            'role' => 'owner',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Create Default POS Cash Register
        DB::connection('tenant')->table('cash_registers')->insert([
            'branch_id' => $branchId,
            'name' => 'Counter 1',
            'code' => 'POS-01',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Seed Supported Business Categories
        $categories = [
            ['code' => 'fashion', 'name' => 'Fashion & Apparel'],
            ['code' => 'grocery', 'name' => 'Grocery & Supermarket'],
            ['code' => 'electronics', 'name' => 'Electronics & Mobile'],
            ['code' => 'pharmacy', 'name' => 'Pharmacy & Healthcare'],
            ['code' => 'general_retail', 'name' => 'General Retail'],
        ];

        foreach ($categories as $cat) {
            DB::connection('tenant')->table('business_categories')->insert([
                'code' => $cat['code'],
                'name' => $cat['name'],
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed 5 Payment Gateways (inactive by default, merchant activates with keys)
        $gateways = [
            ['gateway_code' => 'phonepe', 'display_name' => 'PhonePe'],
            ['gateway_code' => 'payu', 'display_name' => 'PayU'],
            ['gateway_code' => 'cashfree', 'display_name' => 'Cashfree Payments'],
            ['gateway_code' => 'easebuzz', 'display_name' => 'Easebuzz'],
            ['gateway_code' => 'razorpay', 'display_name' => 'Razorpay'],
        ];

        foreach ($gateways as $gw) {
            DB::connection('tenant')->table('tenant_payment_gateways')->insert([
                'gateway_code' => $gw['gateway_code'],
                'display_name' => $gw['display_name'],
                'is_active' => false,
                'is_test_mode' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Seed 5 Courier Aggregators (inactive by default, merchant activates with keys)
        $couriers = [
            ['provider_code' => 'shiprocket', 'display_name' => 'Shiprocket'],
            ['provider_code' => 'ithink', 'display_name' => 'iThink Logistics'],
            ['provider_code' => 'nimbuspost', 'display_name' => 'NimbusPost'],
            ['provider_code' => 'shipmozo', 'display_name' => 'Shipmozo'],
            ['provider_code' => 'shipway', 'display_name' => 'Shipway'],
        ];

        foreach ($couriers as $cr) {
            DB::connection('tenant')->table('tenant_shipping_providers')->insert([
                'provider_code' => $cr['provider_code'],
                'display_name' => $cr['display_name'],
                'is_active' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}

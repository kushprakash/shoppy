<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed central database master data.
     */
    public function run(): void
    {
        // 1. Central Super Admin
        DB::connection('mysql')->table('central_admin_users')->updateOrInsert(
            ['email' => 'admin@shoppy.local'],
            [
                'name' => 'Shoppy Super Admin',
                'password' => Hash::make('SuperAdmin@2026'),
                'role' => 'super_admin',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // 2. Subscription Plans
        DB::connection('mysql')->table('subscription_plans')->updateOrInsert(
            ['code' => 'all_categories'],
            [
                'name' => 'All-in-One Enterprise Plan',
                'monthly_price' => 750.00,
                'annual_price' => 7500.00,
                'all_category_access' => true,
                'features' => json_encode(['unlimited_products', 'all_categories', 'pos_offline', '5_payment_gateways', '5_courier_partners']),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // 3. Category Pricing for Per-Category model
        $categories = [
            ['code' => 'fashion', 'name' => 'Fashion & Apparel', 'monthly' => 350.00, 'annual' => 3500.00],
            ['code' => 'grocery', 'name' => 'Grocery & Supermarket', 'monthly' => 350.00, 'annual' => 3500.00],
            ['code' => 'electronics', 'name' => 'Electronics & Mobile', 'monthly' => 350.00, 'annual' => 3500.00],
            ['code' => 'pharmacy', 'name' => 'Pharmacy & Healthcare', 'monthly' => 350.00, 'annual' => 3500.00],
            ['code' => 'general_retail', 'name' => 'General Retail', 'monthly' => 250.00, 'annual' => 2500.00],
        ];

        foreach ($categories as $cat) {
            DB::connection('mysql')->table('subscription_category_prices')->updateOrInsert(
                ['category_code' => $cat['code']],
                [
                    'category_name' => $cat['name'],
                    'monthly_price' => $cat['monthly'],
                    'annual_price' => $cat['annual'],
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }

        // 4. Approved Sample Agent
        DB::connection('mysql')->table('agents')->updateOrInsert(
            ['referral_code' => 'AGT-DEMO-101'],
            [
                'name' => 'Rahul Sharma (Partner Agent)',
                'email' => 'rahul.agent@example.com',
                'phone' => '9876543210',
                'pan_number' => 'ABCDE1234F',
                'bank_name' => 'HDFC Bank',
                'bank_account_no' => '50100234567890',
                'bank_ifsc' => 'HDFC0000123',
                'upi_id' => 'rahul@hdfcbank',
                'status' => 'approved',
                'commission_rate_percent' => 10.00,
                'fixed_signup_bonus' => 500.00,
                'approved_at' => now(),
                'notes' => 'Top verified regional partner',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
    }
}

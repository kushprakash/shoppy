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

        // 2. Subscription Packages (The 4 Official Packages)
        $packages = [
            [
                'code' => 'monthly-package',
                'name' => 'Monthly Package',
                'short_name' => 'MONTHLY',
                'category' => 'business',
                'badge' => 'Starter Package',
                'ribbon_bg' => 'bg-[#008ba3]',
                'button_text' => 'SIGN UP NOW',
                'has_whatsapp' => true,
                'has_ecommerce' => true,
                'subtext' => 'Billed monthly • Complete ERP & E-Commerce Suite',
                'monthly_price' => 1000.00,
                'annual_price' => 12000.00,
                'sort_order' => 1,
            ],
            [
                'code' => 'quarterly-package',
                'name' => 'Quarterly Package',
                'short_name' => 'QUARTERLY',
                'category' => 'business',
                'badge' => 'Save ₹500',
                'ribbon_bg' => 'bg-[#6b21a8]',
                'button_text' => 'SIGN UP NOW',
                'has_whatsapp' => true,
                'has_ecommerce' => true,
                'subtext' => 'Billed quarterly (₹833/mo) • Save ₹500 on billing',
                'monthly_price' => 833.33,
                'annual_price' => 10000.00,
                'sort_order' => 2,
            ],
            [
                'code' => 'half-yearly-package',
                'name' => 'Half Yearly Package',
                'short_name' => 'HALF YEARLY',
                'category' => 'business',
                'badge' => 'Save ₹1,500',
                'ribbon_bg' => 'bg-[#00a2c7]',
                'button_text' => 'SIGN UP NOW',
                'has_whatsapp' => true,
                'has_ecommerce' => true,
                'subtext' => 'Billed every 6 months (₹750/mo) • Save ₹1,500',
                'monthly_price' => 750.00,
                'annual_price' => 9000.00,
                'sort_order' => 3,
            ],
            [
                'code' => 'yearly-package',
                'name' => 'Yearly Package',
                'short_name' => 'YEARLY',
                'category' => 'business',
                'badge' => 'Best Value • Save ₹4,000',
                'ribbon_bg' => 'bg-[#0a3e7e]',
                'button_text' => 'SIGN UP NOW',
                'has_whatsapp' => true,
                'has_ecommerce' => true,
                'subtext' => 'Billed annually (₹667/mo) • Maximum Savings of ₹4,000',
                'monthly_price' => 666.66,
                'annual_price' => 8000.00,
                'sort_order' => 4,
            ],
        ];

        foreach ($packages as $pkg) {
            DB::connection('mysql')->table('subscription_plans')->updateOrInsert(
                ['code' => $pkg['code']],
                array_merge($pkg, [
                    'all_category_access' => true,
                    'is_active' => true,
                    'features' => json_encode([
                        'GST Billing Software',
                        'Ecommerce Store Features',
                        'WhatsApp Features',
                        'High-Speed POS Counter Billing (<50ms)',
                        '5 Payment Gateways & 5 Courier Partners',
                        'Real-time Stock & Inventory Sync'
                    ]),
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

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

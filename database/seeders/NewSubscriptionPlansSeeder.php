<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NewSubscriptionPlansSeeder extends Seeder
{
    public function run(): void
    {
        DB::connection('mysql')->statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::connection('mysql')->table('subscription_plans')->truncate();

        $allFeatures = [
            'High-Speed GST Billing Software (Thermal, A4 Auto C/F & B/F, Dot-Matrix 1-Page Medical Tear-off)',
            'Comprehensive Store Management (Multi-Branch Inventory, Stock Ledger, Cashier Shifts & Z-Report)',
            'Omnichannel Ecommerce Suite (Instant Online Web Storefront at domain/{storeCode} with Real-time Sync)',
            'Integrated Payment Gateway Suite (PhonePe, PayU, Razorpay, Cashfree, Easebuzz & Instant UPI QR)',
            'Integrated Courier & Logistics API (Shiprocket, NimbusPost, Delhivery, Auto AWB & Tracking)',
            'WhatsApp Cloud Messaging Suite (Automated Tax Invoices, Payment Reminders & Shift Reports)',
            '1D/2D Barcode Generator, Printable Price Tags & Shelf Labels',
            'Expense Manager, Cash Flow Register & Automated P&L Reports',
            'Staff Roles, Multi-User Cashier Profiles & Audit Permission Logs',
            'Zero Commission on Online Store Sales & Unlimited Products',
            'Dedicated MySQL Database Isolation per Tenant & 100% Data Privacy',
            '24/7 Priority WhatsApp, Phone & Remote Desk Support'
        ];

        $commonCycles = [
            'monthly' => ['regular' => 1000, 'offer' => 1000, 'offPercent' => 0, 'label' => '/ month', 'ribbonText' => 'STARTER', 'months' => 1],
            'quarterly' => ['regular' => 3000, 'offer' => 2500, 'offPercent' => 17, 'label' => '/ 3 months', 'ribbonText' => 'SAVE ₹500', 'months' => 3],
            'half_yearly' => ['regular' => 6000, 'offer' => 4500, 'offPercent' => 25, 'label' => '/ 6 months', 'ribbonText' => 'SAVE ₹1,500', 'months' => 6],
            'yearly' => ['regular' => 12000, 'offer' => 8000, 'offPercent' => 33, 'label' => '/ year', 'ribbonText' => 'BEST VALUE • SAVE ₹4,000', 'months' => 12]
        ];

        $plans = [
            [
                'id' => 1,
                'name' => 'Monthly Package',
                'code' => 'monthly-package',
                'short_name' => 'MONTHLY PLAN',
                'category' => 'business',
                'badge' => 'Starter • Pay As You Go',
                'ribbon_bg' => 'bg-[#008ba3]',
                'button_text' => 'SIGN UP MONTHLY',
                'has_whatsapp' => 1,
                'has_ecommerce' => 1,
                'subtext' => 'Billed monthly (₹1,000/mo) • WhatsApp add-on +₹500/mo',
                'monthly_price' => 1000.00,
                'annual_price' => 12000.00,
                'all_category_access' => 1,
                'cycles' => json_encode($commonCycles),
                'features' => json_encode($allFeatures),
                'is_active' => 1,
                'sort_order' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Quarterly Package',
                'code' => 'quarterly-package',
                'short_name' => 'QUARTERLY PLAN',
                'category' => 'business',
                'badge' => 'Growth • Save ₹500',
                'ribbon_bg' => 'bg-[#00a2c7]',
                'button_text' => 'SIGN UP QUARTERLY',
                'has_whatsapp' => 1,
                'has_ecommerce' => 1,
                'subtext' => 'Billed every 3 months (₹2,500) • Save 17%',
                'monthly_price' => 833.33,
                'annual_price' => 10000.00,
                'all_category_access' => 1,
                'cycles' => json_encode($commonCycles),
                'features' => json_encode($allFeatures),
                'is_active' => 1,
                'sort_order' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Half-Yearly Package',
                'code' => 'half-yearly-package',
                'short_name' => 'HALF-YEARLY PLAN',
                'category' => 'business',
                'badge' => 'Professional • Save ₹1,500',
                'ribbon_bg' => 'bg-[#6b21a8]',
                'button_text' => 'SIGN UP HALF-YEARLY',
                'has_whatsapp' => 1,
                'has_ecommerce' => 1,
                'subtext' => 'Billed every 6 months (₹4,500) • Save 25%',
                'monthly_price' => 750.00,
                'annual_price' => 9000.00,
                'all_category_access' => 1,
                'cycles' => json_encode($commonCycles),
                'features' => json_encode($allFeatures),
                'is_active' => 1,
                'sort_order' => 3,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 4,
                'name' => 'Yearly Package',
                'code' => 'yearly-package',
                'short_name' => 'YEARLY ENTERPRISE',
                'category' => 'business',
                'badge' => 'Best Value • Save ₹4,000',
                'ribbon_bg' => 'bg-[#059669]',
                'button_text' => 'SIGN UP ANNUALLY',
                'has_whatsapp' => 1,
                'has_ecommerce' => 1,
                'subtext' => 'Billed annually (₹8,000/yr) • Save 33% • Priority Support',
                'monthly_price' => 666.67,
                'annual_price' => 8000.00,
                'all_category_access' => 1,
                'cycles' => json_encode($commonCycles),
                'features' => json_encode($allFeatures),
                'is_active' => 1,
                'sort_order' => 4,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($plans as $p) {
            DB::connection('mysql')->table('subscription_plans')->insert($p);
        }

        // Remap any existing shop subscriptions to plan_id 4 (Yearly)
        DB::connection('mysql')->table('shop_subscriptions')->whereNotIn('plan_id', [1, 2, 3, 4])->update(['plan_id' => 4]);

        DB::connection('mysql')->statement('SET FOREIGN_KEY_CHECKS=1;');
    }
}

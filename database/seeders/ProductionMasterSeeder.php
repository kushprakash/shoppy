<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ProductionMasterSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Central Super Admin User
        DB::connection('mysql')->table('central_admin_users')->updateOrInsert(
            ['email' => 'admin@shoppy.io'],
            [
                'name' => 'Super Admin (Enexa IT)',
                'password' => Hash::make('admin123'),
                'role' => 'super_admin',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // 2. Production Subscription Plans (User's Exact Specification: Monthly 1000, Quarterly 2500, Half-Yearly 4500, Yearly 8000 + WhatsApp 500/mo)
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
                'name' => 'Monthly Package',
                'code' => 'monthly-package',
                'short_name' => 'MONTHLY PLAN',
                'category' => 'business',
                'badge' => 'Starter • Pay As You Go',
                'ribbon_bg' => 'bg-[#008ba3]',
                'button_text' => 'SIGN UP MONTHLY',
                'has_whatsapp' => true,
                'has_ecommerce' => true,
                'subtext' => 'Billed monthly (₹1,000/mo) • WhatsApp add-on +₹500/mo',
                'monthly_price' => 1000.00,
                'annual_price' => 12000.00,
                'all_category_access' => true,
                'sort_order' => 1,
                'cycles' => json_encode($commonCycles),
                'features' => json_encode($allFeatures),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Quarterly Package',
                'code' => 'quarterly-package',
                'short_name' => 'QUARTERLY PLAN',
                'category' => 'business',
                'badge' => 'Growth • Save ₹500',
                'ribbon_bg' => 'bg-[#00a2c7]',
                'button_text' => 'SIGN UP QUARTERLY',
                'has_whatsapp' => true,
                'has_ecommerce' => true,
                'subtext' => 'Billed every 3 months (₹2,500) • Save 17%',
                'monthly_price' => 833.33,
                'annual_price' => 10000.00,
                'all_category_access' => true,
                'sort_order' => 2,
                'cycles' => json_encode($commonCycles),
                'features' => json_encode($allFeatures),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Half-Yearly Package',
                'code' => 'half-yearly-package',
                'short_name' => 'HALF-YEARLY PLAN',
                'category' => 'business',
                'badge' => 'Professional • Save ₹1,500',
                'ribbon_bg' => 'bg-[#6b21a8]',
                'button_text' => 'SIGN UP HALF-YEARLY',
                'has_whatsapp' => true,
                'has_ecommerce' => true,
                'subtext' => 'Billed every 6 months (₹4,500) • Save 25%',
                'monthly_price' => 750.00,
                'annual_price' => 9000.00,
                'all_category_access' => true,
                'sort_order' => 3,
                'cycles' => json_encode($commonCycles),
                'features' => json_encode($allFeatures),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'Yearly Package',
                'code' => 'yearly-package',
                'short_name' => 'YEARLY ENTERPRISE',
                'category' => 'business',
                'badge' => 'Best Value • Save ₹4,000',
                'ribbon_bg' => 'bg-[#059669]',
                'button_text' => 'SIGN UP ANNUALLY',
                'has_whatsapp' => true,
                'has_ecommerce' => true,
                'subtext' => 'Billed annually (₹8,000/yr) • Save 33% • Priority Support',
                'monthly_price' => 666.67,
                'annual_price' => 8000.00,
                'all_category_access' => true,
                'sort_order' => 4,
                'cycles' => json_encode($commonCycles),
                'features' => json_encode($allFeatures),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::connection('mysql')->statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::connection('mysql')->table('subscription_plans')->truncate();
        foreach ($plans as $p) {
            DB::connection('mysql')->table('subscription_plans')->insert($p);
        }
        DB::connection('mysql')->statement('SET FOREIGN_KEY_CHECKS=1;');

        // 3. Website Settings: Enexa IT Solutions Private Limited (www.enexa.in)
        $settings = [
            'company_name' => 'Enexa IT Solutions Private Limited',
            'powered_by' => 'Enexa IT Solutions Private Limited',
            'website' => 'https://www.enexa.in',
            'official_domain' => 'www.enexa.in',
            'brand_title' => 'Shoppy ERP & Retail Omnichannel Platform',
            'brand_tagline' => 'Next-Generation POS Billing, GST Compliance & Omnichannel Digital Commerce for Indian Retailers',
            'support_phone' => '+91 98290 00192',
            'support_email' => 'info@enexa.in',
            'sales_email' => 'sales@enexa.in',
            'corporate_address' => 'Enexa IT Solutions Private Limited, IT Park, Tech Zone, Jaipur, Rajasthan - 302020',
            'company_gstin' => '08AABCE1290M1Z5',
            'company_cin' => 'U72900RJ2021PTC075482',
            'header_notice' => '🚀 Trusted by 10,000+ Retail Merchants across India — Powered by Enexa IT Solutions Private Limited',
            'hero_banners' => json_encode([
                [
                    'id' => 1,
                    'badge' => '⚡ Powered by Enexa IT Solutions Private Limited',
                    'title' => 'Complete Retail Invoicing & Thermal POS Counter Suite',
                    'subtitle' => 'High-speed billing (<50ms) for Garments, Grocery, Footwear & Electronics. Instant thermal prints, automated GST filing and barcode inventory.',
                    'tag' => 'Core Retail POS',
                    'ctaText' => 'Explore Plans',
                    'ctaLink' => '#pricing',
                    'gradient' => 'from-[#0d1b2a] via-[#1b263b] to-[#415a77]'
                ],
                [
                    'id' => 2,
                    'badge' => '💬 Official Meta Cloud API Partner',
                    'title' => 'Automated WhatsApp Invoicing & Dynamic Payment QR',
                    'subtitle' => 'Send GST tax bills, payment reminder links with dynamic UPI QR, and marketing updates directly to customer WhatsApp with high open rates.',
                    'tag' => 'WhatsApp CRM',
                    'ctaText' => 'View Pricing',
                    'ctaLink' => '#pricing',
                    'gradient' => 'from-[#062c26] via-[#094238] to-[#0d594b]'
                ],
                [
                    'id' => 3,
                    'badge' => '🌐 Real-time Omnichannel Digital Commerce',
                    'title' => 'Online Storefront Connected Directly to Counter POS',
                    'subtitle' => 'Every store receives a live online shopping portal at domain/{storeCode}. Real-time inventory sync, 5 Indian payment gateways & 5 couriers.',
                    'tag' => 'Omnichannel Storefront',
                    'ctaText' => 'Get Started',
                    'ctaLink' => '#pricing',
                    'gradient' => 'from-[#0b2938] via-[#103e54] to-[#185a7a]'
                ]
            ])
        ];

        foreach ($settings as $key => $val) {
            DB::connection('mysql')->table('website_settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $val, 'group' => 'general', 'created_at' => now(), 'updated_at' => now()]
            );
        }

        // 4. Production Dynamic Blogs
        $blogs = [
            [
                'title' => 'How Indian Retailers Boosted Sales by 35% with Omnichannel POS in 2026',
                'slug' => 'boost-sales-with-omnichannel-pos-2026',
                'excerpt' => 'Discover how physical retail stores in Jaipur, Delhi, and Mumbai are seamlessly combining counter billing with instant web storefronts.',
                'content' => 'Indian retail is evolving rapidly. Merchants who previously relied solely on footfall are now capturing 30-40% additional revenue by providing local customers with an online catalog at domain/{storeCode}. With automated inventory sync, there is zero risk of overselling, while thermal POS handles morning and evening counter rush in under 50 milliseconds.',
                'cover_image' => 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
                'category' => 'Retail Growth',
                'author' => 'Enexa IT Solutions Editorial',
                'read_time' => '4 min read',
                'is_published' => true,
                'published_at' => now()->subDays(2),
                'created_at' => now()->subDays(2),
                'updated_at' => now()->subDays(2),
            ],
            [
                'title' => 'Why WhatsApp Billing & Dynamic UPI QR is Replacing Paper Slips',
                'slug' => 'whatsapp-billing-dynamic-upi-qr',
                'excerpt' => 'Thermal paper rolls cost thousands of rupees annually. Explore how automated WhatsApp PDF invoices save paper while increasing customer repeat rates.',
                'content' => 'Sending digital tax invoices with dynamic UPI QR payment codes directly to customers WhatsApp is revolutionizing Indian store operations. Customers love having their guarantee cards, bills, and payment receipts safely stored on WhatsApp, while shopkeepers collect outstanding credits twice as fast with automated reminders.',
                'cover_image' => 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=800&auto=format&fit=crop&q=80',
                'category' => 'WhatsApp Automation',
                'author' => 'Enexa IT Solutions Editorial',
                'read_time' => '5 min read',
                'is_published' => true,
                'published_at' => now()->subDays(5),
                'created_at' => now()->subDays(5),
                'updated_at' => now()->subDays(5),
            ],
            [
                'title' => 'Demystifying GSTR-1 & B2B Tax Invoicing for Multi-Branch Stores',
                'slug' => 'gstr1-b2b-tax-invoicing-guide',
                'excerpt' => 'A practical, jargon-free guide on managing HSN codes, multi-tax GST slabs, e-Way bills, and accurate monthly GSTR-1 ledger exports.',
                'content' => 'GST compliance does not need to be a nightmare for small business owners. Shoppy by Enexa IT Solutions automates HSN code lookups, applies correct CGST/SGST/IGST tax rates automatically, and lets you generate e-Way bills in 1 click without ever logging into the cumbersome government portal.',
                'cover_image' => 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
                'category' => 'GST Compliance',
                'author' => 'Enexa IT Solutions Legal & Tax Desk',
                'read_time' => '6 min read',
                'is_published' => true,
                'published_at' => now()->subDays(8),
                'created_at' => now()->subDays(8),
                'updated_at' => now()->subDays(8),
            ],
        ];

        foreach ($blogs as $b) {
            DB::connection('mysql')->table('blogs')->updateOrInsert(
                ['slug' => $b['slug']],
                $b
            );
        }

        // 5. Sample Initial Stores in shops table
        $demoShops = [
            [
                'shop_code' => 'SHP-A4IFYK',
                'name' => 'Ramesh Fashion Store',
                'slug' => 'ramesh-fashion-store',
                'owner_name' => 'Ramesh Agarwal',
                'owner_email' => 'ramesh@fashion.in',
                'owner_phone' => '+91 98290 12345',
                'database_name' => 'tenant_ramesh_fashion',
                'status' => 'active',
                'settings' => json_encode([
                    'city' => 'Jaipur, Rajasthan',
                    'plan_id' => 'gst-billing-ecommerce',
                    'plan_name' => 'GST Billing Software + Ecommerce',
                    'billing_cycle' => 'yearly',
                    'has_ecommerce' => true,
                    'whatsapp_mode' => 'platform_number',
                    'due_amount' => 0,
                    'valid_until' => '2027-10-15'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shop_code' => 'STORE983515',
                'name' => 'Verma General & Kirana Store',
                'slug' => 'verma-general-kirana-store',
                'owner_name' => 'Sanjay Verma',
                'owner_email' => 'sanjay@vermastore.in',
                'owner_phone' => '+91 98111 98351',
                'database_name' => 'tenant_store983515',
                'status' => 'active',
                'settings' => json_encode([
                    'city' => 'New Delhi, NCR',
                    'plan_id' => 'gst-billing-ecommerce-whatsapp',
                    'plan_name' => 'GST Billing Software + Ecommerce + Whatsapp Messaging',
                    'billing_cycle' => 'yearly',
                    'has_ecommerce' => true,
                    'whatsapp_mode' => 'own_number',
                    'due_amount' => 0,
                    'valid_until' => '2027-10-20'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shop_code' => 'STORE441029',
                'name' => 'Sharma Textile & Garments',
                'slug' => 'sharma-textile-garments',
                'owner_name' => 'Amit Sharma',
                'owner_email' => 'amit@sharmatextiles.com',
                'owner_phone' => '+91 94140 44102',
                'database_name' => 'tenant_store441029',
                'status' => 'active',
                'settings' => json_encode([
                    'city' => 'Surat, Gujarat',
                    'plan_id' => 'gst-billing',
                    'plan_name' => 'GST Billing Software',
                    'billing_cycle' => 'yearly',
                    'has_ecommerce' => false,
                    'whatsapp_mode' => 'none',
                    'due_amount' => 0,
                    'valid_until' => '2027-08-10'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shop_code' => 'STORE552190',
                'name' => 'Apex Mobile & Electronics',
                'slug' => 'apex-mobile-electronics',
                'owner_name' => 'Vikramaditya Rathore',
                'owner_email' => 'vikram@apexmobile.in',
                'owner_phone' => '+91 98765 52190',
                'database_name' => 'tenant_store552190',
                'status' => 'active',
                'settings' => json_encode([
                    'city' => 'Indore, MP',
                    'plan_id' => 'gst-billing-ecommerce',
                    'plan_name' => 'GST Billing Software + Ecommerce',
                    'billing_cycle' => 'half_yearly',
                    'has_ecommerce' => true,
                    'whatsapp_mode' => 'none',
                    'due_amount' => 0,
                    'valid_until' => '2027-04-21'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'shop_code' => 'STORE118833',
                'name' => 'Kisan Agro Seed & Fertilizer',
                'slug' => 'kisan-agro-seed-fertilizer',
                'owner_name' => 'Mahesh Patel',
                'owner_email' => 'mahesh@kisanagro.org',
                'owner_phone' => '+91 98234 11883',
                'database_name' => 'tenant_store118833',
                'status' => 'expired',
                'settings' => json_encode([
                    'city' => 'Nagpur, Maharashtra',
                    'plan_id' => 'gst-billing-whatsapp',
                    'plan_name' => 'GST Billing Software + Whatsapp Message suite',
                    'billing_cycle' => 'half_yearly',
                    'has_ecommerce' => false,
                    'whatsapp_mode' => 'own_number',
                    'due_amount' => 2850,
                    'valid_until' => '2026-10-20'
                ]),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($demoShops as $ds) {
            DB::connection('mysql')->table('shops')->updateOrInsert(
                ['shop_code' => $ds['shop_code']],
                $ds
            );
        }
    }
}

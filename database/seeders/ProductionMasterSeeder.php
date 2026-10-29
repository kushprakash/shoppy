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

        // 2. Production Subscription Plans (User's Exact Specification)
        $plans = [
            [
                'name' => 'GST Billing Software',
                'code' => 'gst-billing',
                'short_name' => 'TEAM ADVANTAGE',
                'category' => 'business',
                'badge' => 'Core Retail POS',
                'ribbon_bg' => 'bg-[#008ba3]',
                'button_text' => 'SIGN UP',
                'has_whatsapp' => false,
                'has_ecommerce' => false,
                'subtext' => 'Starting at 1 store terminal, billed annually',
                'monthly_price' => 500.00,
                'annual_price' => 4000.00,
                'all_category_access' => true,
                'sort_order' => 1,
                'cycles' => json_encode([
                    'monthly' => ['regular' => 500, 'offer' => 500, 'offPercent' => 0, 'label' => '/ month', 'ribbonText' => 'POPULAR'],
                    'quarterly' => ['regular' => 1500, 'offer' => 1250, 'offPercent' => 17, 'label' => '/ 3 months', 'ribbonText' => 'SAVE 17%*'],
                    'half_yearly' => ['regular' => 3000, 'offer' => 2250, 'offPercent' => 25, 'label' => '/ 6 months', 'ribbonText' => 'SAVE 25%*'],
                    'yearly' => ['regular' => 6000, 'offer' => 4000, 'offPercent' => 33, 'label' => '/ year', 'ribbonText' => 'SAVE 33%*'],
                ]),
                'features' => json_encode([
                    'High-Speed POS Counter Billing (<50ms)',
                    'GST Tax Invoicing (B2B / B2C) & GSTR-1 Ledger',
                    'Thermal 80mm & 50mm Receipt Printing',
                    '1D/2D Barcode Generator & Shelf Labels',
                    'Multi-Branch Inventory & Stock Ledger',
                    'Cash Drawer Float & Daily Z-Report',
                    'Add Contributor Seats & Cashier Profiles',
                    'Free integrations with popular accounting apps',
                    '10,000 barcode lookups per day',
                    '24/7 Expedited phone & email support',
                    'Quizzes & customer feedback at checkout',
                    'Custom logos, store colors, and thermal header',
                    'All data exports (CSV, PDF, XLS, GSTR-1 JSON)'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'GST Billing Software + Whatsapp Message suite',
                'code' => 'gst-billing-whatsapp',
                'short_name' => 'TEAM PREMIER',
                'category' => 'business',
                'badge' => 'Smart Communication',
                'ribbon_bg' => 'bg-[#6b21a8]',
                'button_text' => 'SIGN UP',
                'has_whatsapp' => true,
                'has_ecommerce' => false,
                'subtext' => 'Starting at 1 store terminal, billed annually',
                'monthly_price' => 600.00,
                'annual_price' => 5200.00,
                'all_category_access' => true,
                'sort_order' => 2,
                'cycles' => json_encode([
                    'monthly' => ['regular' => 600, 'offer' => 600, 'offPercent' => 0, 'label' => '/ month', 'ribbonText' => 'POPULAR'],
                    'quarterly' => ['regular' => 1800, 'offer' => 1650, 'offPercent' => 8, 'label' => '/ 3 months', 'ribbonText' => 'SAVE 8%*'],
                    'half_yearly' => ['regular' => 3600, 'offer' => 2850, 'offPercent' => 21, 'label' => '/ 6 months', 'ribbonText' => 'SAVE 21%*'],
                    'yearly' => ['regular' => 7200, 'offer' => 5200, 'offPercent' => 28, 'label' => '/ year', 'ribbonText' => 'SAVE 28%*'],
                ]),
                'features' => json_encode([
                    'All GST Billing Software features included',
                    'Automated WhatsApp GST Tax Invoice Links & PDF',
                    'WhatsApp Payment Reminders & Dynamic UPI QR Links',
                    'Daily Shift Sales & Cash Register Summary to Owner WhatsApp',
                    'Customer WhatsApp Marketing Broadcasts & Loyalty points',
                    'Zero API Gateway Setup Fee',
                    'Add Contributor Seats & Multi-Cashier Logins',
                    '15,000 WhatsApp messages per year included',
                    'Phone support and 24/7 email support',
                    'Custom logo, colors, and verified business badge',
                    'Accept Payments via WhatsApp UPI Intent',
                    'Advanced analytics & customer retention reports',
                    'Industry benchmark comparison'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'GST Billing Software + Ecommerce',
                'code' => 'gst-billing-ecommerce',
                'short_name' => 'TEAM ECOMMERCE',
                'category' => 'business',
                'badge' => 'Digital Storefront',
                'ribbon_bg' => 'bg-[#00a2c7]',
                'button_text' => 'SIGN UP',
                'has_whatsapp' => false,
                'has_ecommerce' => true,
                'subtext' => 'Billed annually with dedicated storefront web address',
                'monthly_price' => 750.00,
                'annual_price' => 6000.00,
                'all_category_access' => true,
                'sort_order' => 3,
                'cycles' => json_encode([
                    'monthly' => ['regular' => 750, 'offer' => 750, 'offPercent' => 0, 'label' => '/ month', 'ribbonText' => 'POPULAR'],
                    'quarterly' => ['regular' => 2250, 'offer' => 2000, 'offPercent' => 11, 'label' => '/ 3 months', 'ribbonText' => 'SAVE 11%*'],
                    'half_yearly' => ['regular' => 4500, 'offer' => 3500, 'offPercent' => 22, 'label' => '/ 6 months', 'ribbonText' => 'SAVE 22%*'],
                    'yearly' => ['regular' => 9000, 'offer' => 6000, 'offPercent' => 33, 'label' => '/ year', 'ribbonText' => 'SAVE 33%*'],
                ]),
                'features' => json_encode([
                    'All GST Billing POS features included',
                    'Instant Online Storefront URL: domain/{storeCode}',
                    'Real-time Catalog & Stock Sync between Counter & Online',
                    'Integrated with 5 Top Indian Payment Gateways',
                    '5 Top Courier Partners (Shiprocket, NimbusPost, etc.)',
                    'Automated AWB Shipping Label & Courier Tracking',
                    'Mobile Responsive Shopping Cart & Quick Checkout',
                    'Store Custom Themes, Banners & Collections',
                    'Zero Commission on Store Sales',
                    'Unlimited Products, Variants & HD Photos',
                    'Dedicated SSL Certificate & Tenant DB Security'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name' => 'GST Billing Software + Ecommerce + Whatsapp Messaging',
                'code' => 'gst-billing-ecommerce-whatsapp',
                'short_name' => 'ENTERPRISE COMPLETE',
                'category' => 'business',
                'badge' => 'Complete Retail Omnichannel',
                'ribbon_bg' => 'bg-[#059669]',
                'button_text' => 'SIGN UP',
                'has_whatsapp' => true,
                'has_ecommerce' => true,
                'subtext' => 'Everything in one unified suite, billed annually',
                'monthly_price' => 850.00,
                'annual_price' => 7500.00,
                'all_category_access' => true,
                'sort_order' => 4,
                'cycles' => json_encode([
                    'monthly' => ['regular' => 850, 'offer' => 850, 'offPercent' => 0, 'label' => '/ month', 'ribbonText' => 'POPULAR'],
                    'quarterly' => ['regular' => 2550, 'offer' => 2500, 'offPercent' => 2, 'label' => '/ 3 months', 'ribbonText' => 'SAVE 2%*'],
                    'half_yearly' => ['regular' => 5100, 'offer' => 4000, 'offPercent' => 22, 'label' => '/ 6 months', 'ribbonText' => 'SAVE 22%*'],
                    'yearly' => ['regular' => 10200, 'offer' => 7500, 'offPercent' => 26, 'label' => '/ year', 'ribbonText' => 'SAVE 26%*'],
                ]),
                'features' => json_encode([
                    'EVERYTHING IN ALL PLANS INCLUDED',
                    'Live Online Storefront at domain/{storeCode}',
                    'Full Official Meta WhatsApp Cloud API suite',
                    'Automated Order Notifications & Live Tracking on WhatsApp',
                    'Accept UPI Intent Payments Directly in WhatsApp',
                    'Own WhatsApp Number Integration Available (+₹400/mo)',
                    'Multi-Warehouse Inventory & Inter-branch Transfer',
                    '5 Payment Gateways (PhonePe, PayU, Razorpay, Cashfree, Easebuzz)',
                    '5 Courier Providers with Auto-dispatch & Reverse Pickup',
                    'VIP 24/7 Dedicated Account Manager Support',
                    'Dedicated Isolated MySQL Database Isolation (100% SLA)'
                ]),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($plans as $p) {
            DB::connection('mysql')->table('subscription_plans')->updateOrInsert(
                ['code' => $p['code']],
                $p
            );
        }

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

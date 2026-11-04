<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ProductionSetupSeeder extends Seeder
{
    /**
     * Run production setup:
     * 1. Sync 4 official packages from MasterPortalApiController
     * 2. Delete legacy dummy packages
     * 3. Clean dummy test stores from shops and foreign key tables
     * 4. Ensure real production store SHP-A4IFYK exists with isolated database tenant_ramesh_fashion
     * 5. Seed required roles & permissions into tenant_ramesh_fashion.roles
     */
    public function run(): void
    {
        $commonFeatures = [
            'High-Speed POS Counter Billing (<50ms)',
            'GST Tax Invoicing (B2B & B2C) & 1-Click GSTR-1 Ledger Export',
            'Thermal 80mm & 50mm Receipt Printing + Dot Matrix & A4',
            '1D/2D Barcode Generator & Shelf Price Tag Designer',
            'Multi-Branch Inventory & Stock Ledger with Reorder Alerts',
            'Cash Drawer Float, Shifts & Daily Z-Report',
            'Live Online Web Storefront at domain/{storeCode}',
            'Real-time Product & Stock Sync between POS Counter and Web Store',
            '5 Indian Payment Gateways (PhonePe, PayU, Cashfree, Easebuzz, Razorpay)',
            '5 Automated Courier Integrations (Shiprocket, NimbusPost, iThink) with automated AWB',
            'Customer Mobile Shopping Cart & Self-Checkout',
            'WhatsApp Invoicing: Auto PDF & Payment Links to Customer WhatsApp',
            'Dynamic UPI QR Codes & Instant Payment Collection Links',
            'Daily Shift Sales & Cash Register Summary to Owner WhatsApp',
            'Optional WhatsApp Message Suite (+₹500/month)',
            '24/7 Priority Expedited Support (Phone, WhatsApp & Email)',
        ];

        // 1. The 4 Official Packages ($defaultPlans)
        $officialPlans = [
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
                'cycles' => json_encode([
                    'monthly' => ['regular' => 1000, 'offer' => 1000, 'offPercent' => 0, 'label' => '/ month', 'ribbonText' => 'MONTHLY'],
                    'quarterly' => ['regular' => 1000, 'offer' => 1000, 'offPercent' => 0, 'label' => '/ month', 'ribbonText' => 'MONTHLY'],
                    'half_yearly' => ['regular' => 1000, 'offer' => 1000, 'offPercent' => 0, 'label' => '/ month', 'ribbonText' => 'MONTHLY'],
                    'yearly' => ['regular' => 1000, 'offer' => 1000, 'offPercent' => 0, 'label' => '/ month', 'ribbonText' => 'MONTHLY'],
                ]),
                'features' => json_encode($commonFeatures),
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
                'cycles' => json_encode([
                    'monthly' => ['regular' => 3000, 'offer' => 2500, 'offPercent' => 17, 'label' => '/ 3 months', 'ribbonText' => 'SAVE 17%'],
                    'quarterly' => ['regular' => 3000, 'offer' => 2500, 'offPercent' => 17, 'label' => '/ 3 months', 'ribbonText' => 'SAVE 17%'],
                    'half_yearly' => ['regular' => 3000, 'offer' => 2500, 'offPercent' => 17, 'label' => '/ 3 months', 'ribbonText' => 'SAVE 17%'],
                    'yearly' => ['regular' => 3000, 'offer' => 2500, 'offPercent' => 17, 'label' => '/ 3 months', 'ribbonText' => 'SAVE 17%'],
                ]),
                'features' => json_encode($commonFeatures),
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
                'cycles' => json_encode([
                    'monthly' => ['regular' => 6000, 'offer' => 4500, 'offPercent' => 25, 'label' => '/ 6 months', 'ribbonText' => 'SAVE 25%'],
                    'quarterly' => ['regular' => 6000, 'offer' => 4500, 'offPercent' => 25, 'label' => '/ 6 months', 'ribbonText' => 'SAVE 25%'],
                    'half_yearly' => ['regular' => 6000, 'offer' => 4500, 'offPercent' => 25, 'label' => '/ 6 months', 'ribbonText' => 'SAVE 25%'],
                    'yearly' => ['regular' => 6000, 'offer' => 4500, 'offPercent' => 25, 'label' => '/ 6 months', 'ribbonText' => 'SAVE 25%'],
                ]),
                'features' => json_encode($commonFeatures),
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
                'cycles' => json_encode([
                    'monthly' => ['regular' => 12000, 'offer' => 8000, 'offPercent' => 33, 'label' => '/ year', 'ribbonText' => 'SAVE 33%'],
                    'quarterly' => ['regular' => 12000, 'offer' => 8000, 'offPercent' => 33, 'label' => '/ year', 'ribbonText' => 'SAVE 33%'],
                    'half_yearly' => ['regular' => 12000, 'offer' => 8000, 'offPercent' => 33, 'label' => '/ year', 'ribbonText' => 'SAVE 33%'],
                    'yearly' => ['regular' => 12000, 'offer' => 8000, 'offPercent' => 33, 'label' => '/ year', 'ribbonText' => 'SAVE 33%'],
                ]),
                'features' => json_encode($commonFeatures),
            ],
        ];

        // Delete all non-official packages
        DB::connection('mysql')->table('subscription_plans')
            ->whereNotIn('code', ['monthly-package', 'quarterly-package', 'half-yearly-package', 'yearly-package'])
            ->delete();

        foreach ($officialPlans as $pkg) {
            DB::connection('mysql')->table('subscription_plans')->updateOrInsert(
                ['code' => $pkg['code']],
                array_merge($pkg, [
                    'all_category_access' => true,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        // 2. Clean dummy shops from shops table
        $dummyCodes = ['STORE983515', 'STORE441029', 'STORE552190', 'STORE118833', 'SHPA4IFYKA'];
        $dummyShopIds = DB::connection('mysql')->table('shops')->whereIn('shop_code', $dummyCodes)->pluck('id')->toArray();

        if (!empty($dummyShopIds)) {
            DB::connection('mysql')->table('agent_commissions')->whereIn('shop_id', $dummyShopIds)->delete();
            DB::connection('mysql')->table('agent_referrals')->whereIn('shop_id', $dummyShopIds)->delete();
            DB::connection('mysql')->table('saas_invoices')->whereIn('shop_id', $dummyShopIds)->delete();
            DB::connection('mysql')->table('shop_credentials')->whereIn('shop_id', $dummyShopIds)->delete();
            DB::connection('mysql')->table('shop_domains')->whereIn('shop_id', $dummyShopIds)->delete();
            DB::connection('mysql')->table('shop_metrics_daily')->whereIn('shop_id', $dummyShopIds)->delete();
            DB::connection('mysql')->table('shop_subscriptions')->whereIn('shop_id', $dummyShopIds)->delete();
            DB::connection('mysql')->table('subscription_payments')->whereIn('shop_id', $dummyShopIds)->delete();
            DB::connection('mysql')->table('tenant_provisioning_jobs')->whereIn('shop_id', $dummyShopIds)->delete();
            DB::connection('mysql')->table('shops')->whereIn('id', $dummyShopIds)->delete();
        }

        // 3. Ensure official production store SHP-A4IFYK exists
        $officialShop = DB::connection('mysql')->table('shops')->where('shop_code', 'SHP-A4IFYK')->first();
        $officialSettings = [
            'city' => 'Jaipur, Rajasthan',
            'plan_id' => 'yearly-package',
            'plan_name' => 'Yearly Package',
            'billing_cycle' => 'yearly',
            'has_ecommerce' => true,
            'whatsapp_mode' => 'platform_number',
            'due_amount' => 0,
            'valid_until' => now()->addDays(365)->format('Y-m-d'),
            'terminal_password' => 'admin123',
        ];

        if (!$officialShop) {
            $shopId = DB::connection('mysql')->table('shops')->insertGetId([
                'name' => 'Shoppy Retail Store',
                'shop_code' => 'SHP-A4IFYK',
                'slug' => 'shoppy-retail-store',
                'owner_name' => 'Shoppy Merchant Admin',
                'owner_email' => 'merchant@shoppy.in',
                'owner_phone' => '+91 98290 00192',
                'database_name' => 'tenant_ramesh_fashion',
                'status' => 'active',
                'settings' => json_encode($officialSettings),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Add domain
            DB::connection('mysql')->table('shop_domains')->insert([
                'shop_id' => $shopId,
                'domain' => 'shp-a4ifyk.shoppy.local',
                'is_custom' => false,
                'is_verified' => true,
                'ssl_status' => 'active',
                'is_primary' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } else {
            DB::connection('mysql')->table('shops')->where('shop_code', 'SHP-A4IFYK')->update([
                'name' => 'Shoppy Retail Store',
                'status' => 'active',
                'settings' => json_encode($officialSettings),
                'updated_at' => now(),
            ]);
        }

        // 4. Seed the 6 required roles into tenant_ramesh_fashion.roles
        try {
            $requiredRoles = [
                [
                    'name' => 'Super Admin',
                    'slug' => 'role-superadmin',
                    'permissions' => json_encode(['*']),
                ],
                [
                    'name' => 'Store Manager',
                    'slug' => 'role-manager',
                    'permissions' => json_encode([
                        'overview.dashboard', 'overview.profit_loss', 'overview.print_pnl',
                        'catalog.view_products', 'catalog.create_product', 'catalog.edit_product',
                        'catalog.categories_setup', 'catalog.barcode_desk',
                        'inventory.view_stock', 'inventory.adjust_stock', 'inventory.low_stock_alerts',
                        'sales.pos_billing', 'sales.view_orders', 'sales.view_gst_invoices',
                        'sales.print_invoice', 'sales.manage_coupons', 'sales.courier_post',
                        'sales.track_shipment', 'sales.eway_bill',
                        'crm.view_customers', 'crm.repay_dues', 'crm.manage_leads',
                        'crm.view_quotations', 'crm.create_quotation', 'crm.quotation_convert',
                        'crm.print_quotation',
                        'purchase.view_suppliers', 'purchase.create_supplier', 'purchase.repay_dues',
                        'purchase.view_bills', 'purchase.create_bill',
                        'hrm.view_employees', 'hrm.attendance_punch', 'hrm.manage_leaves',
                        'expenses.view', 'expenses.create'
                    ]),
                ],
                [
                    'name' => 'POS Cashier & Billing',
                    'slug' => 'role-cashier',
                    'permissions' => json_encode([
                        'overview.dashboard', 'catalog.view_products', 'sales.pos_billing',
                        'sales.view_orders', 'sales.print_invoice', 'sales.manage_coupons',
                        'crm.view_customers', 'crm.repay_dues', 'hrm.attendance_punch'
                    ]),
                ],
                [
                    'name' => 'Warehouse & Stock Clerk',
                    'slug' => 'role-inventory',
                    'permissions' => json_encode([
                        'catalog.view_products', 'catalog.barcode_desk', 'inventory.view_stock',
                        'inventory.adjust_stock', 'inventory.low_stock_alerts', 'sales.courier_post',
                        'sales.track_shipment', 'purchase.view_bills', 'purchase.create_bill',
                        'hrm.attendance_punch'
                    ]),
                ],
                [
                    'name' => 'Chief Accountant',
                    'slug' => 'role-accountant',
                    'permissions' => json_encode([
                        'overview.dashboard', 'overview.profit_loss', 'overview.print_pnl',
                        'sales.view_orders', 'sales.view_gst_invoices', 'sales.print_invoice',
                        'crm.view_customers', 'crm.repay_dues', 'purchase.view_suppliers',
                        'purchase.repay_dues', 'purchase.view_bills', 'hrm.view_employees',
                        'hrm.view_payroll', 'hrm.salary_pay', 'hrm.print_payslip',
                        'expenses.view', 'expenses.create', 'expenses.edit_delete'
                    ]),
                ],
                [
                    'name' => 'Sales & CRM Representative',
                    'slug' => 'role-sales',
                    'permissions' => json_encode([
                        'overview.dashboard', 'catalog.view_products', 'sales.pos_billing',
                        'sales.view_orders', 'crm.view_customers', 'crm.manage_leads',
                        'crm.view_quotations', 'crm.create_quotation', 'hrm.attendance_punch'
                    ]),
                ]
            ];

            foreach ($requiredRoles as $r) {
                DB::connection('mysql')->table('tenant_ramesh_fashion.roles')->updateOrInsert(
                    ['slug' => $r['slug']],
                    [
                        'name' => $r['name'],
                        'permissions' => $r['permissions'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }
        } catch (\Throwable $e) {}
    }
}


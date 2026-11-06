<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Tenancy\TenantManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class TenantErpApiController extends Controller
{
    /**
     * Switch connection to tenant's database
     */
    protected function switchToTenant(string $databaseName): bool
    {
        try {
            $sanitized = preg_replace('/[^a-zA-Z0-9_\-]/', '', $databaseName);
            if (empty($sanitized)) return false;

            Config::set('database.connections.tenant.database', $sanitized);
            DB::purge('tenant');
            DB::reconnect('tenant');
            return true;
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Dynamically resolve shop from request, session, or cookie without hardcoded codes
     */
    protected function resolveShop(Request $request)
    {
        $shopCode = strtoupper(trim(
            $request->header('X-Shop-Code')
            ?: $request->query('shop_code')
            ?: session('active_store_code')
            ?: $request->cookie('shoppy_active_store_code')
            ?: ''
        ));

        if ($shopCode) {
            $shop = DB::connection('mysql')->table('shops')->where('shop_code', $shopCode)->first();
            if ($shop) return $shop;
        }

        return DB::connection('mysql')->table('shops')->where('status', 'active')->first();
    }

    /**
     * Get Store ERP Initialization Data (Live from MySQL)
     */
    public function getInitData(Request $request): JsonResponse
    {
        $shop = $this->resolveShop($request);
        $shopCode = $shop->shop_code ?? '';

        $shopSettings = $shop ? (json_decode($shop->settings, true) ?: []) : [];
        $dbName = $shop->database_name ?? 'tenant_ramesh_fashion';
        $hasTenantDb = $this->switchToTenant($dbName);

        // 1. Roles & Permissions (From tenant DB `roles` table)
        $roles = [];
        if ($hasTenantDb) {
            try {
                $dbRoles = DB::connection('tenant')->table('roles')->get();
                if ($dbRoles->isEmpty()) {
                    // Auto-seed required roles
                    foreach (TenantManager::getRequiredRoles() as $r) {
                        DB::connection('tenant')->table('roles')->updateOrInsert(
                            ['slug' => $r['slug']],
                            [
                                'name' => $r['name'],
                                'permissions' => $r['permissions'],
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]
                        );
                    }
                    $dbRoles = DB::connection('tenant')->table('roles')->get();
                }

                $roles = $dbRoles->map(function ($role) {
                    $perms = json_decode($role->permissions, true) ?: [];
                    return [
                        'id' => $role->slug,
                        'name' => $role->name,
                        'slug' => $role->slug,
                        'description' => self::getRoleDescription($role->slug),
                        'isSystem' => $role->slug === 'role-superadmin',
                        'badgeColor' => self::getRoleBadgeColor($role->slug),
                        'permissions' => $perms,
                    ];
                })->toArray();
            } catch (\Throwable $e) {
                $roles = [];
            }
        }

        if (empty($roles)) {
            // Fallback to the 6 required standard roles
            $roles = array_map(function ($r) {
                return [
                    'id' => $r['slug'],
                    'name' => $r['name'],
                    'slug' => $r['slug'],
                    'description' => self::getRoleDescription($r['slug']),
                    'isSystem' => $r['slug'] === 'role-superadmin',
                    'badgeColor' => self::getRoleBadgeColor($r['slug']),
                    'permissions' => json_decode($r['permissions'], true) ?: [],
                ];
            }, TenantManager::getRequiredRoles());
        }

        // 2. Branches
        $branches = [];
        if ($hasTenantDb) {
            try {
                $branches = DB::connection('tenant')->table('branches')->get()->map(function ($b) {
                    return [
                        'id' => $b->code ?: 'BR-01',
                        'dbId' => $b->id,
                        'name' => $b->name,
                        'code' => $b->code,
                        'city' => $b->city ?: 'Main City',
                        'phone' => $b->phone,
                        'address' => $b->address,
                        'type' => 'Retail Store + POS',
                        'activeTill' => 'POS-01 (Online)',
                    ];
                })->toArray();
            } catch (\Throwable $e) {}
        }
        if (empty($branches)) {
            $branches = [
                ['id' => 'BR-01', 'name' => 'Main Branch', 'code' => 'HQ-MAIN', 'city' => $shopSettings['city'] ?? 'Jaipur', 'type' => 'Retail Store + POS', 'activeTill' => 'POS-01 (Online)']
            ];
        }

        // 3. Products (From tenant DB `products` table)
        $products = [];
        if ($hasTenantDb) {
            try {
                $dbProducts = DB::connection('tenant')->table('products')->where('is_active', true)->get();
                $variants = DB::connection('tenant')->table('product_variants')->get()->groupBy('product_id');
                $inventory = DB::connection('tenant')->table('inventory')->get()->keyBy('product_id');

                $products = $dbProducts->map(function ($p) use ($variants, $inventory) {
                    $stockQty = isset($inventory[$p->id]) ? (float) $inventory[$p->id]->quantity : 0;
                    $pVariants = isset($variants[$p->id]) ? $variants[$p->id]->map(function ($v) {
                        return [
                            'id' => 'v-' . $v->id,
                            'size' => $v->variant_name,
                            'color' => 'Standard',
                            'sku' => $v->sku,
                            'barcode' => $v->barcode,
                            'sellingPrice' => (float) $v->selling_price,
                            'mrp' => (float) $v->mrp,
                            'purchasePrice' => (float) $v->purchase_price,
                            'stock' => 0,
                            'isActive' => (bool) $v->is_active,
                        ];
                    })->toArray() : [];

                    return [
                        'id' => 'PRD-' . $p->id,
                        'db_id' => $p->id,
                        'name' => $p->name,
                        'sku' => $p->sku,
                        'barcode' => $p->barcode,
                        'category' => 'Retail Goods',
                        'sellingPrice' => (float) $p->selling_price,
                        'mrp' => (float) $p->mrp,
                        'purchasePrice' => (float) $p->purchase_price,
                        'gstRate' => (float) $p->gst_rate,
                        'hsnCode' => $p->hsn_code,
                        'unit' => $p->unit ?: 'pcs',
                        'stock' => $stockQty,
                        'status' => $stockQty > 5 ? 'In Stock' : ($stockQty > 0 ? 'Low Stock' : 'Out of Stock'),
                        'variants' => $pVariants,
                    ];
                })->toArray();
            } catch (\Throwable $e) {}
        }

        // 4. Orders
        $orders = [];
        if ($hasTenantDb) {
            try {
                $dbOrders = DB::connection('tenant')->table('orders')->orderBy('id', 'desc')->limit(50)->get();
                $orderIds = $dbOrders->pluck('id')->toArray();
                $orderItems = DB::connection('tenant')->table('order_items')->whereIn('order_id', $orderIds)->get()->groupBy('order_id');

                $orders = $dbOrders->map(function ($o) use ($orderItems) {
                    $items = isset($orderItems[$o->id]) ? $orderItems[$o->id]->map(function ($it) {
                        return [
                            'productId' => 'PRD-' . $it->product_id,
                            'name' => $it->product_name,
                            'qty' => (float) $it->quantity,
                            'price' => (float) $it->unit_price,
                            'total' => (float) $it->total_price,
                        ];
                    })->toArray() : [];

                    return [
                        'id' => $o->order_number,
                        'orderNumber' => $o->order_number,
                        'total' => (float) $o->grand_total,
                        'subtotal' => (float) $o->subtotal,
                        'paymentStatus' => $o->payment_status,
                        'orderStatus' => $o->order_status,
                        'paymentMethod' => $o->payment_method,
                        'channel' => $o->channel,
                        'items' => $items,
                        'date' => substr($o->created_at, 0, 16),
                    ];
                })->toArray();
            } catch (\Throwable $e) {}
        }

        // 5. Customers
        $customers = [];
        if ($hasTenantDb) {
            try {
                $customers = DB::connection('tenant')->table('customers')->limit(50)->get()->map(function ($c) {
                    return [
                        'id' => 'CUST-' . $c->id,
                        'name' => $c->name,
                        'phone' => $c->phone,
                        'email' => $c->email,
                        'gstin' => $c->gstin,
                        'balanceDue' => (float) $c->balance_due,
                    ];
                })->toArray();
            } catch (\Throwable $e) {}
        }

        // 6. Suppliers
        $suppliers = [];
        if ($hasTenantDb) {
            try {
                $suppliers = DB::connection('tenant')->table('suppliers')->limit(50)->get()->map(function ($s) {
                    return [
                        'id' => 'SUP-' . $s->id,
                        'name' => $s->name,
                        'companyName' => $s->company_name,
                        'phone' => $s->phone,
                        'email' => $s->email,
                        'gstin' => $s->gstin,
                        'currentBalance' => (float) $s->current_balance,
                    ];
                })->toArray();
            } catch (\Throwable $e) {}
        }

        // 7. Standard Retail Categories (clean)
        $topCategories = [
            ['id' => 'TOP-1', 'name' => 'General Retail', 'slug' => 'general-retail', 'icon' => '🛍️', 'description' => 'Retail products, goods & merchandise', 'isActive' => true],
            ['id' => 'TOP-2', 'name' => 'Fashion & Apparel', 'slug' => 'fashion-apparel', 'icon' => '👗', 'description' => 'Apparel, garments, footwear and accessories', 'isActive' => true],
            ['id' => 'TOP-3', 'name' => 'Grocery & Kirana', 'slug' => 'grocery-kirana', 'icon' => '🌾', 'description' => 'Packaged foods, grains, daily essentials', 'isActive' => true],
            ['id' => 'TOP-4', 'name' => 'Electronics & Mobile', 'slug' => 'electronics-mobile', 'icon' => '⚡', 'description' => 'Electronics, mobile accessories and gadgets', 'isActive' => true],
        ];

        $midCategories = [
            ['id' => 'MID-101', 'topCategoryId' => 'TOP-1', 'name' => 'Daily Retail Goods', 'slug' => 'daily-goods', 'isActive' => true],
            ['id' => 'MID-201', 'topCategoryId' => 'TOP-2', 'name' => 'Men & Women Wear', 'slug' => 'apparel-wear', 'isActive' => true],
            ['id' => 'MID-301', 'topCategoryId' => 'TOP-3', 'name' => 'Packaged Commodities', 'slug' => 'packaged-commodities', 'isActive' => true],
            ['id' => 'MID-401', 'topCategoryId' => 'TOP-4', 'name' => 'Mobile & Audio Spares', 'slug' => 'audio-spares', 'isActive' => true],
        ];

        $endCategories = [
            ['id' => 'END-1001', 'midCategoryId' => 'MID-101', 'name' => 'General Merchandise', 'slug' => 'general-merchandise', 'isActive' => true],
            ['id' => 'END-2001', 'midCategoryId' => 'MID-201', 'name' => 'Standard Garments', 'slug' => 'standard-garments', 'isActive' => true],
            ['id' => 'END-3001', 'midCategoryId' => 'MID-301', 'name' => 'Packaged Goods', 'slug' => 'packaged-goods', 'isActive' => true],
        ];

        // 8. Standard Retail Sizes
        $sizes = [
            ['id' => 'sz-1', 'group' => 'Apparel Standard', 'code' => 'XS', 'label' => 'Extra Small (XS)'],
            ['id' => 'sz-2', 'group' => 'Apparel Standard', 'code' => 'S', 'label' => 'Small (S)'],
            ['id' => 'sz-3', 'group' => 'Apparel Standard', 'code' => 'M', 'label' => 'Medium (M)'],
            ['id' => 'sz-4', 'group' => 'Apparel Standard', 'code' => 'L', 'label' => 'Large (L)'],
            ['id' => 'sz-5', 'group' => 'Apparel Standard', 'code' => 'XL', 'label' => 'Extra Large (XL)'],
            ['id' => 'sz-6', 'group' => 'Apparel Standard', 'code' => 'XXL', 'label' => 'Double XL (XXL)'],
            ['id' => 'sz-7', 'group' => 'Apparel Standard', 'code' => '3XL', 'label' => 'Triple XL (3XL)'],
            ['id' => 'sz-8', 'group' => 'Waist / Bottoms', 'code' => '28', 'label' => 'Waist 28"'],
            ['id' => 'sz-9', 'group' => 'Waist / Bottoms', 'code' => '30', 'label' => 'Waist 30"'],
            ['id' => 'sz-10', 'group' => 'Waist / Bottoms', 'code' => '32', 'label' => 'Waist 32"'],
            ['id' => 'sz-11', 'group' => 'Waist / Bottoms', 'code' => '34', 'label' => 'Waist 34"'],
            ['id' => 'sz-12', 'group' => 'Waist / Bottoms', 'code' => '36', 'label' => 'Waist 36"'],
            ['id' => 'sz-13', 'group' => 'Packaging / Weights', 'code' => '250g', 'label' => '250 Grams'],
            ['id' => 'sz-14', 'group' => 'Packaging / Weights', 'code' => '500g', 'label' => '500 Grams'],
            ['id' => 'sz-15', 'group' => 'Packaging / Weights', 'code' => '1kg', 'label' => '1 Kilogram'],
            ['id' => 'sz-16', 'group' => 'Packaging / Weights', 'code' => '5kg', 'label' => '5 Kilograms'],
            ['id' => 'sz-17', 'group' => 'Packaging / Weights', 'code' => '1L', 'label' => '1 Litre'],
        ];

        // 9. Standard Colors
        $colors = [
            ['id' => 'clr-1', 'name' => 'Navy Blue', 'hex' => '#1e3a8a', 'code' => 'NAVY'],
            ['id' => 'clr-2', 'name' => 'Sky Blue', 'hex' => '#38bdf8', 'code' => 'SKY'],
            ['id' => 'clr-3', 'name' => 'Pure White', 'hex' => '#ffffff', 'code' => 'WHT'],
            ['id' => 'clr-4', 'name' => 'Charcoal Black', 'hex' => '#0f172a', 'code' => 'BLK'],
            ['id' => 'clr-5', 'name' => 'Crimson Red', 'hex' => '#dc2626', 'code' => 'RED'],
            ['id' => 'clr-6', 'name' => 'Emerald Green', 'hex' => '#059669', 'code' => 'GRN'],
            ['id' => 'clr-7', 'name' => 'Mustard Yellow', 'hex' => '#eab308', 'code' => 'YEL'],
            ['id' => 'clr-8', 'name' => 'Wine Maroon', 'hex' => '#881337', 'code' => 'WNE'],
            ['id' => 'clr-9', 'name' => 'Slate Grey', 'hex' => '#64748b', 'code' => 'GRY'],
        ];

        // 10. Shipping Rules
        $shippingRules = [
            'defaultShippingType' => 'flat',
            'flatRate' => 50.0,
            'freeShippingThreshold' => 999.0,
            'isFreeShippingEnabled' => true,
            'codFee' => 40.0,
            'isCodEnabled' => true,
            'estimatedDeliveryDays' => '3 - 5 Business Days',
            'expressShippingRate' => 120.0,
            'isExpressEnabled' => true,
            'weightSlabs' => [
                ['id' => 'ws-1', 'minWeight' => 0, 'maxWeight' => 0.5, 'rate' => 50, 'label' => 'Up to 500g'],
                ['id' => 'ws-2', 'minWeight' => 0.5, 'maxWeight' => 1.0, 'rate' => 80, 'label' => '500g - 1kg'],
                ['id' => 'ws-3', 'minWeight' => 1.0, 'maxWeight' => 3.0, 'rate' => 140, 'label' => '1kg - 3kg'],
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'shop' => [
                    'code' => $shopCode,
                    'name' => $shop->name ?? 'Shoppy Store',
                    'owner_name' => $shop->owner_name ?? 'Store Merchant',
                    'owner_phone' => $shop->owner_phone ?? '',
                    'plan_name' => $shopSettings['plan_name'] ?? 'Yearly Package',
                    'plan_id' => $shopSettings['plan_id'] ?? 'yearly-package',
                    'billing_cycle' => $shopSettings['billing_cycle'] ?? 'yearly',
                    'valid_until' => $shopSettings['valid_until'] ?? now()->addYear()->format('Y-m-d'),
                    'has_ecommerce' => isset($shopSettings['has_ecommerce']) ? (bool) $shopSettings['has_ecommerce'] : true,
                    'status' => $shop->status ?? 'active',
                ],
                'roles' => $roles,
                'branches' => $branches,
                'topCategories' => $topCategories,
                'midCategories' => $midCategories,
                'endCategories' => $endCategories,
                'sizes' => $sizes,
                'colors' => $colors,
                'shippingRules' => $shippingRules,
                'products' => $products,
                'orders' => $orders,
                'customers' => $customers,
                'suppliers' => $suppliers,
                'purchaseBills' => [],
                'coupons' => [],
                'leads' => [],
                'quotations' => [],
                'employees' => [],
                'attendance' => [],
                'leaves' => [],
                'payroll' => [],
                'expenses' => [],
            ]
        ]);
    }

    /**
     * Save Product directly into Tenant DB
     */
    public function saveProduct(Request $request): JsonResponse
    {
        $shop = $this->resolveShop($request);
        if (!$shop) return response()->json(['success' => false, 'message' => 'Shop not found'], 404);

        $this->switchToTenant($shop->database_name);

        $data = $request->validate([
            'name' => 'required|string|max:255',
            'sku' => 'nullable|string|max:64',
            'barcode' => 'nullable|string|max:64',
            'sellingPrice' => 'required|numeric',
            'mrp' => 'nullable|numeric',
            'purchasePrice' => 'nullable|numeric',
            'gstRate' => 'nullable|numeric',
            'hsnCode' => 'nullable|string|max:32',
            'unit' => 'nullable|string|max:32',
            'stock' => 'nullable|numeric',
        ]);

        $sku = $data['sku'] ?: ('SKU-' . strtoupper(Str::random(8)));
        $slug = Str::slug($data['name']) . '-' . rand(100, 999);

        // Fetch or create default business_category
        $bCat = DB::connection('tenant')->table('business_categories')->first();
        $bCatId = $bCat ? $bCat->id : DB::connection('tenant')->table('business_categories')->insertGetId([
            'code' => 'general_retail',
            'name' => 'General Retail',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $productId = DB::connection('tenant')->table('products')->insertGetId([
            'business_category_id' => $bCatId,
            'name' => $data['name'],
            'slug' => $slug,
            'sku' => $sku,
            'barcode' => $data['barcode'] ?: $sku,
            'selling_price' => $data['sellingPrice'],
            'mrp' => $data['mrp'] ?: $data['sellingPrice'],
            'purchase_price' => $data['purchasePrice'] ?: 0,
            'gst_rate' => $data['gstRate'] ?: 0,
            'hsn_code' => $data['hsnCode'] ?: null,
            'unit' => $data['unit'] ?: 'pcs',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Add inventory
        $wh = DB::connection('tenant')->table('warehouses')->first();
        if ($wh) {
            DB::connection('tenant')->table('inventory')->updateOrInsert(
                ['warehouse_id' => $wh->id, 'product_id' => $productId],
                ['quantity' => $data['stock'] ?: 0, 'updated_at' => now()]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Product saved into tenant database',
            'product' => [
                'id' => 'PRD-' . $productId,
                'db_id' => $productId,
                'name' => $data['name'],
                'sku' => $sku,
                'sellingPrice' => $data['sellingPrice'],
                'stock' => $data['stock'] ?: 0,
            ]
        ]);
    }

    /**
     * Delete Product from Tenant DB
     */
    public function deleteProduct($id, Request $request): JsonResponse
    {
        $shop = $this->resolveShop($request);
        if (!$shop) return response()->json(['success' => false, 'message' => 'Shop not found'], 404);

        $this->switchToTenant($shop->database_name);

        $realId = (int) str_replace('PRD-', '', $id);
        DB::connection('tenant')->table('inventory')->where('product_id', $realId)->delete();
        DB::connection('tenant')->table('product_variants')->where('product_id', $realId)->delete();
        DB::connection('tenant')->table('products')->where('id', $realId)->delete();

        return response()->json(['success' => true, 'message' => 'Product deleted from database']);
    }

    /**
     * Save POS or Online Order into Tenant DB
     */
    public function saveOrder(Request $request): JsonResponse
    {
        $shop = $this->resolveShop($request);
        if (!$shop) return response()->json(['success' => false, 'message' => 'Shop not found'], 404);

        $this->switchToTenant($shop->database_name);

        $data = $request->validate([
            'orderNumber' => 'nullable|string|max:64',
            'subtotal' => 'required|numeric',
            'grandTotal' => 'required|numeric',
            'paymentMethod' => 'nullable|string|max:32',
            'channel' => 'nullable|string|max:32',
            'items' => 'required|array',
        ]);

        $orderNumber = $data['orderNumber'] ?: ('ORD-' . date('Ymd') . '-' . rand(100, 999));

        $orderId = DB::connection('tenant')->table('orders')->insertGetId([
            'order_number' => $orderNumber,
            'channel' => $data['channel'] ?: 'pos',
            'subtotal' => $data['subtotal'],
            'grand_total' => $data['grandTotal'],
            'payment_status' => 'paid',
            'order_status' => 'completed',
            'payment_method' => $data['paymentMethod'] ?: 'cash',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($data['items'] as $it) {
            $prodId = (int) str_replace('PRD-', '', $it['productId'] ?? 1);
            DB::connection('tenant')->table('order_items')->insert([
                'order_id' => $orderId,
                'product_id' => $prodId > 0 ? $prodId : 1,
                'product_name' => $it['name'] ?? 'Product Item',
                'quantity' => $it['qty'] ?? 1,
                'unit_price' => $it['price'] ?? 0,
                'total_price' => ($it['qty'] ?? 1) * ($it['price'] ?? 0),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Order recorded in database',
            'order_number' => $orderNumber,
        ]);
    }

    /**
     * Save Role Permissions into Tenant DB
     */
    public function saveRole(Request $request): JsonResponse
    {
        $shop = $this->resolveShop($request);
        if (!$shop) return response()->json(['success' => false, 'message' => 'Shop not found'], 404);

        $this->switchToTenant($shop->database_name);

        $data = $request->validate([
            'slug' => 'required|string|max:64',
            'name' => 'required|string|max:128',
            'permissions' => 'required|array',
        ]);

        DB::connection('tenant')->table('roles')->updateOrInsert(
            ['slug' => $data['slug']],
            [
                'name' => $data['name'],
                'permissions' => json_encode($data['permissions']),
                'updated_at' => now(),
            ]
        );

        return response()->json(['success' => true, 'message' => 'Role permissions saved in database']);
    }

    // Role Descriptions
    protected static function getRoleDescription(string $slug): string
    {
        return match ($slug) {
            'role-superadmin' => 'Unrestricted full administrative access across all ERP operations and settings',
            'role-manager' => 'Complete operational management: sales, catalog, stock, CRM, staff attendance & overhead expenses',
            'role-cashier' => 'Front-desk POS counter fast billing, invoice printing, customer dues collection, and attendance punch',
            'role-inventory' => 'Stock inward/outward inspection, barcode printing, low stock alerts, courier packaging and dispatch tracking',
            'role-accountant' => 'Financial ledger audits, GST tax invoicing, customer/supplier dues settlements, payroll payouts, and P&L statements',
            'role-sales' => 'Customer inquiries, lead follow-ups, quotation creation, and POS counter billing',
            default => 'Standard store operational role',
        };
    }

    // Role Badge Colors
    protected static function getRoleBadgeColor(string $slug): string
    {
        return match ($slug) {
            'role-superadmin' => 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200',
            'role-manager' => 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200',
            'role-cashier' => 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200',
            'role-inventory' => 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200',
            'role-accountant' => 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200',
            'role-sales' => 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200',
            default => 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
        };
    }
}


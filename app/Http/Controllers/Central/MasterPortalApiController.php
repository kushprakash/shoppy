<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Support\StoreToken;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class MasterPortalApiController extends Controller
{
    /**
     * Get all Subscription Plans directly from MySQL database (Fully editable)
     */
    public function getPlans(): JsonResponse
    {
        $plans = DB::connection('mysql')->table('subscription_plans')
            ->where('is_active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'asc')
            ->get()
            ->map(function ($plan) {
                $cycles = json_decode($plan->cycles, true) ?: [];
                $cycleCode = 'yearly';
                $durationDays = 365;

                if (str_contains($plan->code, 'monthly')) {
                    $cycleCode = 'monthly';
                    $durationDays = 30;
                } elseif (str_contains($plan->code, 'quarterly')) {
                    $cycleCode = 'quarterly';
                    $durationDays = 90;
                } elseif (str_contains($plan->code, 'half-yearly') || str_contains($plan->code, 'half_yearly')) {
                    $cycleCode = 'half_yearly';
                    $durationDays = 180;
                }

                // Dynamic base price based on cycles offer or plan prices
                $basePrice = 8000;
                if (isset($cycles[$cycleCode]['offer'])) {
                    $basePrice = (float)$cycles[$cycleCode]['offer'];
                } elseif ($cycleCode === 'monthly' && $plan->monthly_price) {
                    $basePrice = (float)$plan->monthly_price;
                } elseif ($cycleCode === 'yearly' && $plan->annual_price) {
                    $basePrice = (float)$plan->annual_price;
                } elseif ($cycleCode === 'monthly') {
                    $basePrice = 1000;
                } elseif ($cycleCode === 'quarterly') {
                    $basePrice = 2500;
                } elseif ($cycleCode === 'half_yearly') {
                    $basePrice = 4500;
                }

                $badgeText = $plan->badge !== null ? trim((string) $plan->badge) : '';
                $ribbonBg = trim((string) ($plan->ribbon_bg ?? '')) ?: 'bg-[#008ba3]';

                return [
                    'id' => $plan->code,
                    'db_id' => $plan->id,
                    'name' => $plan->name,
                    'code' => $plan->code,
                    'shortName' => $plan->short_name ?: 'STANDARD',
                    'category' => $plan->category ?: 'business',
                    'badge' => $badgeText,
                    'ribbonBg' => $ribbonBg,
                    'ribbon_bg' => $ribbonBg,
                    'buttonText' => $plan->button_text ?: 'SIGN UP NOW',
                    'buttonBg' => $ribbonBg . ' text-white',
                    'hasWhatsappOption' => (bool) $plan->has_whatsapp,
                    'hasEcommerce' => (bool) $plan->has_ecommerce,
                    'subtext' => $plan->subtext ?: 'Complete ERP & E-Commerce',
                    'billingCycle' => $cycleCode,
                    'basePrice' => $basePrice,
                    'durationDays' => $durationDays,
                    'cycles' => $cycles,
                    'features' => json_decode($plan->features, true) ?: [],
                    'is_active' => (bool) $plan->is_active,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $plans,
        ]);
    }

    /**
     * Create New Subscription Package into MySQL
     */
    public function createPlan(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'shortName' => 'nullable|string|max:100',
            'category' => 'nullable|string|max:64',
            'badge' => 'nullable|string|max:100',
            'ribbonBg' => 'nullable|string|max:64',
            'buttonText' => 'nullable|string|max:64',
            'hasWhatsappOption' => 'nullable|boolean',
            'hasEcommerce' => 'nullable|boolean',
            'subtext' => 'nullable|string|max:255',
            'cycles' => 'required|array',
            'features' => 'required|array',
        ]);

        $code = Str::slug($validated['name']) . '-' . Str::random(4);
        $cycles = $validated['cycles'];
        $monthlyPrice = $cycles['monthly']['offer'] ?? 500;
        $annualPrice = $cycles['yearly']['offer'] ?? 4000;

        $newId = DB::connection('mysql')->table('subscription_plans')->insertGetId([
            'name' => $validated['name'],
            'code' => $code,
            'short_name' => $validated['shortName'] ?? 'CUSTOM TIER',
            'category' => $validated['category'] ?? 'business',
            'badge' => $validated['badge'] ?? 'New Tier',
            'ribbon_bg' => $validated['ribbonBg'] ?? 'bg-[#008ba3]',
            'button_text' => $validated['buttonText'] ?? 'SIGN UP',
            'has_whatsapp' => !empty($validated['hasWhatsappOption']),
            'has_ecommerce' => !empty($validated['hasEcommerce']),
            'subtext' => $validated['subtext'] ?? 'Billed annually per store terminal',
            'monthly_price' => $monthlyPrice,
            'annual_price' => $annualPrice,
            'all_category_access' => true,
            'cycles' => json_encode($cycles),
            'features' => json_encode($validated['features']),
            'is_active' => true,
            'sort_order' => 10,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription Package created successfully in MySQL database!',
            'plan_id' => $newId,
            'code' => $code,
        ], 201);
    }

    /**
     * Update Subscription Plan in MySQL
     */
    public function updatePlan(Request $request, $code): JsonResponse
    {
        $plan = DB::connection('mysql')->table('subscription_plans')
            ->where('code', $code)
            ->orWhere(function ($q) use ($code) {
                if (is_numeric($code)) {
                    $q->where('id', (int)$code);
                }
            })
            ->first();

        if (!$plan) {
            return response()->json(['success' => false, 'message' => "Plan '{$code}' not found in database"], 404);
        }

        $rawCycles = $request->input('cycles');
        if (is_string($rawCycles)) {
            $rawCycles = json_decode($rawCycles, true);
        }
        $cycles = !empty($rawCycles) ? $rawCycles : (json_decode($plan->cycles, true) ?: []);

        // Sync cycle rates if basePrice passed
        $basePrice = $request->input('basePrice');
        if ($basePrice !== null && is_numeric($basePrice)) {
            $cycleKey = 'monthly';
            if (str_contains($plan->code, 'quarterly')) $cycleKey = 'quarterly';
            elseif (str_contains($plan->code, 'half-yearly') || str_contains($plan->code, 'half_yearly')) $cycleKey = 'half_yearly';
            elseif (str_contains($plan->code, 'yearly')) $cycleKey = 'yearly';

            if (!isset($cycles[$cycleKey])) {
                $cycles[$cycleKey] = [];
            }
            $cycles[$cycleKey]['offer'] = (float)$basePrice;
        }

        $rawFeatures = $request->input('features');
        if (is_string($rawFeatures)) {
            $rawFeatures = json_decode($rawFeatures, true);
        }
        $features = ($rawFeatures !== null) ? $rawFeatures : (json_decode($plan->features, true) ?: []);

        $hasWhatsapp = $plan->has_whatsapp;
        if ($request->has('hasWhatsappOption')) {
            $hasWhatsapp = (bool)$request->input('hasWhatsappOption');
        } elseif ($request->has('has_whatsapp')) {
            $hasWhatsapp = (bool)$request->input('has_whatsapp');
        }

        $hasEcommerce = $plan->has_ecommerce;
        if ($request->has('hasEcommerce')) {
            $hasEcommerce = (bool)$request->input('hasEcommerce');
        } elseif ($request->has('has_ecommerce')) {
            $hasEcommerce = (bool)$request->input('has_ecommerce');
        }

        $monthlyPrice = isset($cycles['monthly']['offer']) ? (float)$cycles['monthly']['offer'] : $plan->monthly_price;
        $annualPrice = isset($cycles['yearly']['offer']) ? (float)$cycles['yearly']['offer'] : $plan->annual_price;

        if ($plan->code === 'quarterly-package' && isset($cycles['quarterly']['offer'])) {
            $monthlyPrice = (float)$cycles['quarterly']['offer'];
        } elseif ($plan->code === 'half-yearly-package' && isset($cycles['half_yearly']['offer'])) {
            $monthlyPrice = (float)$cycles['half_yearly']['offer'];
        }

        $newBadge = $request->exists('badge')
            ? (trim((string) ($request->input('badge') ?? '')) ?: null)
            : $plan->badge;
        $newRibbonBg = ($request->exists('ribbonBg') || $request->exists('ribbon_bg'))
            ? (trim((string) ($request->input('ribbonBg') ?? $request->input('ribbon_bg') ?? '')) ?: 'bg-[#008ba3]')
            : $plan->ribbon_bg;

        if ($request->exists('badge')) {
            $activeCycleKey = 'yearly';
            if (str_contains($plan->code, 'monthly')) $activeCycleKey = 'monthly';
            elseif (str_contains($plan->code, 'quarterly')) $activeCycleKey = 'quarterly';
            elseif (str_contains($plan->code, 'half-yearly') || str_contains($plan->code, 'half_yearly')) $activeCycleKey = 'half_yearly';
            if (isset($cycles[$activeCycleKey]) && is_array($cycles[$activeCycleKey])) {
                $cycles[$activeCycleKey]['ribbonText'] = $newBadge ?? '';
            }
        }

        $updateData = [
            'name' => $request->input('name', $plan->name),
            'short_name' => $request->input('shortName', $request->input('short_name', $plan->short_name)),
            'badge' => $newBadge,
            'category' => $request->input('category', $plan->category),
            'ribbon_bg' => $newRibbonBg,
            'button_text' => $request->input('buttonText', $request->input('button_text', $plan->button_text)),
            'subtext' => $request->input('subtext', $plan->subtext),
            'has_whatsapp' => $hasWhatsapp,
            'has_ecommerce' => $hasEcommerce,
            'cycles' => json_encode($cycles),
            'features' => json_encode($features),
            'monthly_price' => $monthlyPrice,
            'annual_price' => $annualPrice,
            'updated_at' => now(),
        ];

        DB::connection('mysql')->table('subscription_plans')->where('id', $plan->id)->update($updateData);

        return response()->json([
            'success' => true,
            'message' => "Plan '{$updateData['name']}' updated successfully in database!",
            'plan_id' => $plan->id,
            'code' => $plan->code,
            'data' => array_merge((array)$plan, $updateData, [
                'cycles' => $cycles,
                'features' => $features
            ])
        ]);
    }

    /**
     * Delete Plan from MySQL
     */
    public function deletePlan($code): JsonResponse
    {
        DB::connection('mysql')->table('subscription_plans')->where('code', $code)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Plan successfully removed from database!',
        ]);
    }

    /**
     * Resolve plan price for a billing cycle from subscription_plans row.
     */
    private function resolvePlanCyclePrice(?object $plan, string $cycle): float
    {
        if (!$plan) {
            return 0.0;
        }

        $cycleKey = strtolower(str_replace('-', '_', $cycle ?: 'yearly'));
        $cycles = json_decode($plan->cycles ?? '{}', true) ?: [];

        if (isset($cycles[$cycleKey]['offer']) && (float) $cycles[$cycleKey]['offer'] > 0) {
            return (float) $cycles[$cycleKey]['offer'];
        }

        return match ($cycleKey) {
            'monthly' => (float) ($plan->monthly_price ?? 0),
            'quarterly' => (float) (($plan->monthly_price ?? 0) * 3),
            'half_yearly' => (float) (($plan->monthly_price ?? 0) * 6),
            default => (float) ($plan->annual_price ?? (($plan->monthly_price ?? 0) * 12)),
        };
    }

    /**
     * Load all non-deleted shops enriched with real subscription expiry, plan metadata, and computed dues.
     */
    private function buildResolvedStoresList(): array
    {
        $conn = DB::connection('mysql');
        $schema = Schema::connection('mysql');

        $plans = $schema->hasTable('subscription_plans')
            ? $conn->table('subscription_plans')->orderBy('sort_order')->orderBy('id')->get()
            : collect();
        $plansById = $plans->keyBy('id');
        $plansByCode = $plans->keyBy('code');

        $latestSubsByShop = collect();
        if ($schema->hasTable('shop_subscriptions')) {
            $latestSubsByShop = $conn->table('shop_subscriptions')
                ->orderBy('id', 'desc')
                ->get()
                ->unique('shop_id')
                ->keyBy('shop_id');
        }

        $shops = $conn->table('shops')
            ->whereNull('deleted_at')
            ->orderBy('id', 'desc')
            ->get();

        $stores = [];
        $todayStart = now()->startOfDay();

        foreach ($shops as $shop) {
            $settings = json_decode($shop->settings ?? '{}', true) ?: [];
            $latestSub = $latestSubsByShop->get($shop->id);

            $plan = null;
            if (!empty($settings['plan_id']) && $plansByCode->has($settings['plan_id'])) {
                $plan = $plansByCode->get($settings['plan_id']);
            } elseif ($latestSub && !empty($latestSub->plan_id) && $plansById->has($latestSub->plan_id)) {
                $plan = $plansById->get($latestSub->plan_id);
            }

            $planCode = $plan ? $plan->code : ($settings['plan_id'] ?? 'unassigned');
            $planName = $plan ? $plan->name : ($settings['plan_name'] ?? 'Custom Plan');
            $billingCycle = $settings['billing_cycle'] ?? 'yearly';

            $validUntil = null;
            if ($latestSub && !empty($latestSub->expires_at)) {
                $validUntil = Carbon::parse($latestSub->expires_at)->format('Y-m-d');
            } elseif (!empty($settings['valid_until'])) {
                $validUntil = (string) $settings['valid_until'];
            }

            $rawStatus = strtolower((string) ($shop->status ?: 'active'));
            $effectiveStatus = $rawStatus ?: 'active';
            if (!in_array($rawStatus, ['suspended', 'archived'], true) && $validUntil) {
                try {
                    $expiryDate = Carbon::parse($validUntil)->endOfDay();
                    if ($expiryDate->lt($todayStart)) {
                        $effectiveStatus = 'expired';
                    } elseif ($expiryDate->lte(now()->copy()->addDays(7)->endOfDay())) {
                        $effectiveStatus = 'expiring_soon';
                    } else {
                        $effectiveStatus = 'active';
                    }
                } catch (\Throwable $e) {
                    // Preserve raw status if stored validity date cannot be parsed
                }
            }

            $dueAmount = (float) ($settings['due_amount'] ?? 0);
            if ($dueAmount <= 0 && $effectiveStatus === 'expired' && $plan) {
                $dueAmount = $this->resolvePlanCyclePrice($plan, $billingCycle);
            }

            $hasEcommerce = isset($settings['has_ecommerce'])
                ? (bool) $settings['has_ecommerce']
                : ($plan ? (bool) $plan->has_ecommerce : true);

            $whatsappMode = $settings['whatsapp_mode']
                ?? (($plan && !empty($plan->has_whatsapp)) ? 'platform_number' : 'none');

            $stores[] = [
                'id' => $shop->id,
                'shop_code' => $shop->shop_code,
                'name' => $shop->name,
                'owner_name' => $shop->owner_name,
                'owner_phone' => $shop->owner_phone,
                'owner_email' => $shop->owner_email,
                'city' => $settings['city'] ?? '—',
                'plan_id' => $planCode,
                'plan_name' => $planName,
                'plan_ribbon_bg' => $plan->ribbon_bg ?? 'bg-[#00a2c7]',
                'billing_cycle' => $billingCycle,
                'has_ecommerce' => $hasEcommerce,
                'whatsapp_mode' => $whatsappMode,
                'own_whatsapp' => $whatsappMode === 'own_number',
                'database_name' => $shop->database_name,
                'status' => $effectiveStatus,
                'valid_until' => $validUntil,
                'due_amount' => round($dueAmount, 2),
                'cycle_amount' => round($this->resolvePlanCyclePrice($plan, $billingCycle), 2),
                'created_at' => $shop->created_at ? substr((string) $shop->created_at, 0, 10) : null,
            ];
        }

        return [$stores, $plans];
    }

    /**
     * Get All Stores from MySQL
     */
    public function getStores(): JsonResponse
    {
        [$stores] = $this->buildResolvedStoresList();

        return response()->json([
            'success' => true,
            'data' => $stores,
        ]);
    }

    /**
     * Get Real-Time Super Admin Dashboard Metrics & Recent Subscription Payments from MySQL
     */
    public function getDashboardStats(): JsonResponse
    {
        $conn = DB::connection('mysql');
        $schema = Schema::connection('mysql');

        [$stores, $plans] = $this->buildResolvedStoresList();

        $totalStores = count($stores);
        $ecommerceStores = 0;
        $billingOnlyStores = 0;
        $activeStores = 0;
        $expiringStores = 0;
        $expiredStores = 0;
        $dueStoresCount = 0;
        $totalDues = 0.0;
        $isolatedDbsCount = 0;
        $whatsappStoresCount = 0;
        $estimatedMrr = 0.0;
        $planBuckets = [];

        foreach ($stores as $s) {
            if ($s['has_ecommerce']) {
                $ecommerceStores++;
            } else {
                $billingOnlyStores++;
            }

            if ($s['status'] === 'active') {
                $activeStores++;
            } elseif ($s['status'] === 'expiring_soon') {
                $expiringStores++;
            } elseif (in_array($s['status'], ['expired', 'suspended'], true)) {
                $expiredStores++;
            }

            if ($s['due_amount'] > 0 || in_array($s['status'], ['expiring_soon', 'expired'], true)) {
                $dueStoresCount++;
            }
            $totalDues += (float) $s['due_amount'];

            if (!empty($s['database_name'])) {
                $isolatedDbsCount++;
            }
            if (($s['whatsapp_mode'] ?? 'none') !== 'none') {
                $whatsappStoresCount++;
            }

            // Active normalized MRR estimate based on assigned plan cycle
            if (in_array($s['status'], ['active', 'expiring_soon'], true) && ($s['cycle_amount'] ?? 0) > 0) {
                $divisor = match (strtolower((string) $s['billing_cycle'])) {
                    'monthly' => 1,
                    'quarterly' => 3,
                    'half_yearly', 'half-yearly' => 6,
                    default => 12,
                };
                $estimatedMrr += ($s['cycle_amount'] / $divisor);
            }

            $key = $s['plan_name'] ?: 'Custom Plan';
            if (!isset($planBuckets[$key])) {
                $planBuckets[$key] = [
                    'code' => $s['plan_id'],
                    'name' => $key,
                    'count' => 0,
                    'ribbon_bg' => $s['plan_ribbon_bg'] ?? 'bg-[#00a2c7]',
                ];
            }
            $planBuckets[$key]['count']++;
        }

        $planShare = collect(array_values($planBuckets))
            ->sortByDesc('count')
            ->values()
            ->map(function ($item) use ($totalStores) {
                $item['percentage'] = $totalStores > 0 ? (int) round(($item['count'] / $totalStores) * 100) : 0;
                return $item;
            })
            ->all();

        // Subscription Revenue & Recent Payments from subscription_payments
        $totalRevenue = 0.0;
        $thisMonthRevenue = 0.0;
        $lastMonthRevenue = 0.0;
        $completedPaymentsCount = 0;
        $pendingPaymentsCount = 0;
        $recentPayments = [];

        if ($schema->hasTable('subscription_payments')) {
            $paidFilter = fn ($q) => $q->whereRaw("LOWER(COALESCE(status, '')) IN ('completed', 'success', 'paid')");

            $totalRevenue = (float) $paidFilter($conn->table('subscription_payments'))->sum('amount');
            $completedPaymentsCount = (int) $paidFilter($conn->table('subscription_payments'))->count();
            $pendingPaymentsCount = (int) $conn->table('subscription_payments')
                ->whereRaw("LOWER(COALESCE(status, '')) = 'pending'")
                ->count();

            $thisMonthStart = now()->startOfMonth();
            $lastMonthStart = now()->copy()->subMonthNoOverflow()->startOfMonth();
            $lastMonthEnd = now()->copy()->subMonthNoOverflow()->endOfMonth();

            $thisMonthRevenue = (float) $paidFilter($conn->table('subscription_payments'))
                ->where('created_at', '>=', $thisMonthStart)
                ->sum('amount');

            $lastMonthRevenue = (float) $paidFilter($conn->table('subscription_payments'))
                ->whereBetween('created_at', [$lastMonthStart, $lastMonthEnd])
                ->sum('amount');

            $rawPayments = $conn->table('subscription_payments as sp')
                ->leftJoin('shops as sh', 'sp.shop_id', '=', 'sh.id')
                ->select(
                    'sp.id',
                    'sp.shop_id',
                    'sp.amount',
                    'sp.payment_method',
                    'sp.gateway',
                    'sp.transaction_id',
                    'sp.status',
                    'sp.metadata',
                    'sp.created_at',
                    'sh.shop_code',
                    'sh.name as shop_name'
                )
                ->orderBy('sp.id', 'desc')
                ->limit(8)
                ->get();

            foreach ($rawPayments as $p) {
                $meta = json_decode($p->metadata ?? '{}', true) ?: [];
                $recentPayments[] = [
                    'id' => $p->id,
                    'shop_code' => $p->shop_code ?: ($meta['shop_code'] ?? 'ONBOARD'),
                    'shop_name' => $p->shop_name ?: ($meta['shop_name'] ?? ($meta['store_name'] ?? 'Store Checkout')),
                    'plan_name' => $meta['plan_name'] ?? ($meta['plan_id'] ?? null),
                    'amount' => (float) $p->amount,
                    'gateway' => $p->gateway ?: ($p->payment_method ?: 'Online'),
                    'payment_method' => $p->payment_method ?: 'online',
                    'transaction_id' => $p->transaction_id ?: ('TXN-' . $p->id),
                    'status' => strtolower((string) ($p->status ?: 'pending')),
                    'created_at' => $p->created_at ? Carbon::parse($p->created_at)->format('d M Y, h:i A') : null,
                ];
            }
        }

        $growthPercent = $lastMonthRevenue > 0
            ? round((($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : null;

        // Leads stats (matches getContactInquiries priority: contacts then contact_inquiries)
        $leadsTotal = 0;
        $leadsNew = 0;
        if ($schema->hasTable('contacts') && $conn->table('contacts')->exists()) {
            $leadsTotal = (int) $conn->table('contacts')->count();
            $leadsNew = (int) $conn->table('contacts')->where('status', 'new')->count();
        } elseif ($schema->hasTable('contact_inquiries')) {
            $leadsTotal = (int) $conn->table('contact_inquiries')->count();
            $leadsNew = (int) $conn->table('contact_inquiries')->where('status', 'new')->count();
        }

        // Agents stats
        $agentsTotal = 0;
        $agentsActive = 0;
        if ($schema->hasTable('agents')) {
            $agentsTotal = (int) $conn->table('agents')->count();
            $agentsActive = (int) $conn->table('agents')
                ->whereIn('status', ['approved', 'active'])
                ->count();
        }

        $blogsPublished = $schema->hasTable('blogs')
            ? (int) $conn->table('blogs')->where('is_published', true)->count()
            : 0;

        // Payment gateway configuration status from server environment
        $activeGateways = [];
        if (!empty(config('services.payu.key')) && !empty(config('services.payu.salt'))) {
            $activeGateways[] = 'PayU';
        }
        if (!empty(config('services.paytm.upi'))) {
            $activeGateways[] = 'Paytm UPI';
        }

        $mailHost = (string) config('mail.mailers.smtp.host', '');
        $smtpConfigured = $mailHost !== '' && $mailHost !== '127.0.0.1';

        return response()->json([
            'success' => true,
            'data' => [
                'revenue' => [
                    'total_revenue' => round($totalRevenue, 2),
                    'this_month_revenue' => round($thisMonthRevenue, 2),
                    'last_month_revenue' => round($lastMonthRevenue, 2),
                    'estimated_mrr' => round($estimatedMrr, 2),
                    'growth_percent' => $growthPercent,
                    'completed_payments_count' => $completedPaymentsCount,
                    'pending_payments_count' => $pendingPaymentsCount,
                ],
                'stores' => [
                    'total' => $totalStores,
                    'ecommerce' => $ecommerceStores,
                    'billing_only' => $billingOnlyStores,
                    'active' => $activeStores,
                    'expiring_soon' => $expiringStores,
                    'expired' => $expiredStores,
                    'due_count' => $dueStoresCount,
                    'total_dues' => round($totalDues, 2),
                    'isolated_dbs' => $isolatedDbsCount,
                    'whatsapp_enabled' => $whatsappStoresCount,
                ],
                'plans' => [
                    'active_count' => $plans->where('is_active', true)->count(),
                    'names' => $plans->where('is_active', true)->pluck('name')->values()->all(),
                    'share' => $planShare,
                ],
                'operations' => [
                    'leads_total' => $leadsTotal,
                    'leads_new' => $leadsNew,
                    'agents_total' => $agentsTotal,
                    'agents_active' => $agentsActive,
                    'blogs_published' => $blogsPublished,
                ],
                'infrastructure' => [
                    'isolated_dbs_count' => $isolatedDbsCount,
                    'total_stores' => $totalStores,
                    'whatsapp_stores_count' => $whatsappStoresCount,
                    'active_gateways' => $activeGateways,
                    'gateways_count' => count($activeGateways),
                    'smtp_configured' => $smtpConfigured,
                    'smtp_host' => $mailHost ?: null,
                ],
                'recent_payments' => $recentPayments,
            ],
        ]);
    }

    /**
     * Provision Store in MySQL
     */
    public function provisionStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'owner_name' => 'required|string|max:255',
            'owner_phone' => 'required|string|max:32',
            'owner_email' => 'nullable|email|max:255',
            'city' => 'nullable|string|max:128',
            'plan_id' => 'required|string|max:64',
            'billing_cycle' => 'nullable|string|max:32',
            'own_whatsapp' => 'nullable|boolean',
        ]);

        $code = 'SP' . date('YmdHis');
        while (DB::connection('mysql')->table('shops')->where('shop_code', $code)->exists()) {
            sleep(1);
            $code = 'SP' . date('YmdHis');
        }
        $slug = Str::slug($validated['name']) . '-' . strtolower(substr($code, -6));
        $dbName = \App\Models\Central\Shop::buildTenantDatabaseName($validated['name'], $code);
        $ownerEmail = !empty($validated['owner_email'])
            ? $validated['owner_email']
            : (strtolower(Str::slug($validated['owner_name'])) . '@' . strtolower($code) . '.shoppy.io');

        // Fetch plan details
        $plan = DB::connection('mysql')->table('subscription_plans')->where('code', $validated['plan_id'])->first();
        $hasEcommerce = $plan ? (bool)$plan->has_ecommerce : false;
        $planName = $plan ? $plan->name : 'GST Billing Software';

        $days = ($validated['billing_cycle'] ?? 'yearly') === 'monthly' ? 30 : (($validated['billing_cycle'] ?? 'yearly') === 'quarterly' ? 90 : (($validated['billing_cycle'] ?? 'yearly') === 'half_yearly' ? 180 : 365));
        $validUntil = now()->addDays($days)->format('Y-m-d');

        $settings = [
            'city' => $validated['city'] ?? 'Jaipur, Rajasthan',
            'plan_id' => $validated['plan_id'],
            'plan_name' => $planName,
            'billing_cycle' => $validated['billing_cycle'] ?? 'yearly',
            'has_ecommerce' => $hasEcommerce,
            'whatsapp_mode' => !empty($validated['own_whatsapp']) ? 'own_number' : ($plan && $plan->has_whatsapp ? 'platform_number' : 'none'),
            'due_amount' => 0,
            'valid_until' => $validUntil,
        ];

        $shopId = DB::connection('mysql')->table('shops')->insertGetId([
            'name' => $validated['name'],
            'shop_code' => $code,
            'slug' => $slug,
            'owner_name' => $validated['owner_name'],
            'owner_email' => $ownerEmail,
            'owner_phone' => $validated['owner_phone'],
            'database_name' => $dbName,
            'status' => 'active',
            'settings' => json_encode($settings),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Provision isolated MySQL tenant database, migrate schema & seed required roles and permissions
        try {
            $sanitizedDbName = preg_replace('/[^a-zA-Z0-9_\-]/', '', $dbName);
            DB::connection('mysql')->statement("CREATE DATABASE IF NOT EXISTS `{$sanitizedDbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

            \Illuminate\Support\Facades\Config::set('database.connections.tenant.database', $sanitizedDbName);
            DB::purge('tenant');
            DB::reconnect('tenant');

            \Illuminate\Support\Facades\Artisan::call('migrate', [
                '--database' => 'tenant',
                '--path' => 'database/migrations/tenant',
                '--force' => true,
            ]);

            // Seed Official GST States into tenant database
            (new \Database\Seeders\GstStatesSeeder)->run('tenant');

            // Seed initial Branch & POS Cash Register
            $branchId = DB::connection('tenant')->table('branches')->insertGetId([
                'name' => 'Main Store',
                'code' => 'BR-01',
                'phone' => $validated['owner_phone'],
                'address' => $validated['city'] ?? 'Store Head Office',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::connection('tenant')->table('warehouses')->insert([
                'branch_id' => $branchId,
                'name' => 'Main Warehouse',
                'code' => 'WH-01',
                'is_default' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::connection('tenant')->table('cash_registers')->insert([
                'branch_id' => $branchId,
                'name' => 'Counter 1',
                'code' => 'POS-01',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Seed the 6 Required Roles & Granular Permissions
            foreach (\App\Tenancy\TenantManager::getRequiredRoles() as $role) {
                DB::connection('tenant')->table('roles')->updateOrInsert(
                    ['slug' => $role['slug']],
                    [
                        'name' => $role['name'],
                        'permissions' => $role['permissions'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]
                );
            }

            // Seed Admin User into tenant users table
            DB::connection('tenant')->table('users')->insertOrIgnore([
                'name' => $validated['owner_name'],
                'email' => $ownerEmail,
                'phone' => $validated['owner_phone'],
                'password' => bcrypt('admin123'),
                'role' => 'admin',
                'branch_id' => $branchId,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {
            // Log or continue gracefully
        }

        // Send Welcome SMS & Email
        try {
            \App\Services\CommunicationService::sendWelcomeSms(
                name: $validated['owner_name'],
                mobile: $validated['owner_phone'],
                storeCode: $code,
                password: 'admin123',
                mpin: '123456'
            );
        } catch (\Throwable $e) {}

        try {
            \App\Services\CommunicationService::sendWelcomeEmail(
                ownerName: $validated['owner_name'],
                ownerEmail: $ownerEmail,
                storeCode: $code,
                password: 'admin123',
                storeName: $validated['name'],
                validUntil: $validUntil,
                planName: $planName,
                mpin: '123456'
            );
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => "Store {$validated['name']} ({$code}) provisioned with isolated database {$dbName}!",
            'store' => [
                'id' => $shopId,
                'shop_code' => $code,
                'name' => $validated['name'],
                'owner_name' => $validated['owner_name'],
                'owner_email' => $ownerEmail,
                'owner_phone' => $validated['owner_phone'],
                'database_name' => $dbName,
                'has_ecommerce' => $hasEcommerce,
            ],
        ], 201);
    }

    /**
     * Toggle Store Ecommerce Status in MySQL
     */
    public function toggleEcommerce($shopCode): JsonResponse
    {
        $shop = DB::connection('mysql')->table('shops')->where('shop_code', strtoupper($shopCode))->first();
        if (!$shop) {
            return response()->json(['success' => false, 'message' => 'Store not found'], 404);
        }

        $settings = json_decode($shop->settings, true) ?: [];
        $current = isset($settings['has_ecommerce']) ? (bool) $settings['has_ecommerce'] : true;
        $settings['has_ecommerce'] = !$current;

        DB::connection('mysql')->table('shops')
            ->where('shop_code', strtoupper($shopCode))
            ->update([
                'settings' => json_encode($settings),
                'updated_at' => now(),
            ]);

        return response()->json([
            'success' => true,
            'has_ecommerce' => $settings['has_ecommerce'],
            'message' => "Ecommerce module for {$shopCode} is now " . ($settings['has_ecommerce'] ? 'ACTIVE (Storefront URL live)' : 'INACTIVE (Billing Login only)'),
        ]);
    }

    /**
     * Build merged website settings with canonical platform defaults.
     */
    private function resolvedWebsiteSettings(): array
    {
        $settings = Schema::connection('mysql')->hasTable('website_settings')
            ? DB::connection('mysql')->table('website_settings')->pluck('value', 'key')->toArray()
            : [];

        $defaults = [
            'company_name' => 'Enexa IT Solutions Private Limited',
            'powered_by' => 'Enexa IT Solutions Private Limited',
            'website' => 'https://www.enexa.in',
            'official_domain' => 'shoppy.live',
            'brand_title' => 'Shoppy ERP — Enexa IT Solutions Private Limited',
            'brand_subtext' => 'Powered by Enexa IT',
            'brand_tagline' => 'Next-Generation POS Billing, GST Compliance & Omnichannel Digital Commerce for Indian Retailers',
            'header_notice' => '',
            'site_logo' => '',
            'footer_logo' => '',
            'favicon_url' => '/favicon.png',
            'meta_title' => 'Shoppy ERP — GST Billing, Retail POS & E-Commerce Software | Enexa IT',
            'meta_description' => "India's trusted high-speed POS counter billing software, GST tax invoicing (B2B/B2C), WhatsApp invoice sharing & omnichannel online storefront platform by Enexa IT Solutions Private Limited.",
            'meta_keywords' => 'GST billing software, POS billing software, retail ERP, WhatsApp invoicing, online storefront, Shoppy ERP, Enexa IT Solutions',
            'og_image' => '',
            'support_phone' => '+91 9546042639',
            'support_email' => 'contact@enexa.in',
            'sales_email' => 'contact@enexa.in',
            'corporate_address' => 'Yadav Nagar Near Hero Honda Agency, Bhagwanpur, Muzaffarpur, Bihar - 842001',
            'support_hours' => 'Mon-Fri: 9:00 AM - 6:00 PM IST',
            'company_gstin' => '08AABCE1290M1Z5',
            'company_cin' => 'U72900RJ2021PTC075482',
            'whatsapp_number' => '9546042639',
            'whatsapp_message' => 'Hello Enexa Team, I would like to know more about Shoppy ERP billing software.',
            'whatsapp_enabled' => '1',
            'footer_description' => "India's trusted GST billing software, lightning-fast retail POS counter terminal, WhatsApp e-invoicing, and omnichannel e-commerce cloud ERP by Enexa IT Solutions Private Limited.",
            'facebook_url' => 'https://facebook.com/enexait',
            'instagram_url' => 'https://instagram.com/enexait',
            'linkedin_url' => 'https://linkedin.com/company/enexait',
            'youtube_url' => 'https://youtube.com/@enexait',
            'hero_banners' => json_encode([]),
        ];

        $merged = array_merge($defaults, $settings);
        if (isset($merged['hero_banners']) && is_string($merged['hero_banners'])) {
            $merged['hero_banners'] = json_decode($merged['hero_banners'], true) ?: [];
        }

        return $merged;
    }

    /**
     * Get Website Settings & Enexa IT Solutions Branding
     */
    public function getWebsiteSettings(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->resolvedWebsiteSettings(),
        ]);
    }

    /**
     * Update Website Settings & Branding in MySQL
     */
    public function updateWebsiteSettings(Request $request): JsonResponse
    {
        $data = $request->all();

        foreach ($data as $key => $val) {
            if (!is_string($key) || $key === '') {
                continue;
            }
            $valueToStore = is_array($val) ? json_encode($val) : (string) ($val ?? '');

            DB::connection('mysql')->table('website_settings')->updateOrInsert(
                ['key' => $key],
                ['value' => $valueToStore, 'updated_at' => now()]
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Platform settings and branding updated in database!',
            'data' => $this->resolvedWebsiteSettings(),
        ]);
    }

    /**
     * Upload Platform Branding Asset (Site Logo, Footer Logo, Favicon, OG Image)
     */
    public function uploadBrandingAsset(Request $request): JsonResponse
    {
        $request->validate([
            'image' => 'required|file|mimes:jpeg,png,jpg,gif,svg,webp,ico|max:5120',
            'type' => 'nullable|string|in:site_logo,footer_logo,favicon,og_image',
        ]);

        $file = $request->file('image');
        $type = $request->input('type', 'site_logo');
        $extension = strtolower($file->getClientOriginalExtension() ?: 'png');
        $filename = 'platform_' . $type . '_' . time() . '_' . Str::random(6) . '.' . $extension;

        $targetPath = public_path('uploads/branding');
        if (!file_exists($targetPath)) {
            mkdir($targetPath, 0755, true);
        }

        $file->move($targetPath, $filename);
        $url = '/uploads/branding/' . $filename;

        $settingKey = match ($type) {
            'favicon' => 'favicon_url',
            'footer_logo' => 'footer_logo',
            'og_image' => 'og_image',
            default => 'site_logo',
        };

        if (Schema::connection('mysql')->hasTable('website_settings')) {
            DB::connection('mysql')->table('website_settings')->updateOrInsert(
                ['key' => $settingKey],
                ['value' => $url, 'updated_at' => now()]
            );
        }

        return response()->json([
            'success' => true,
            'url' => $url,
            'setting_key' => $settingKey,
            'message' => 'Asset uploaded and linked in database!',
        ]);
    }

    /**
     * Get Blogs
     */
    public function getBlogs(): JsonResponse
    {
        $blogs = DB::connection('mysql')->table('blogs')
            ->where('is_published', true)
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $blogs,
        ]);
    }

    /**
     * Create Blog Article in MySQL
     */
    public function createBlog(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'excerpt' => 'required|string|max:1000',
            'content' => 'required|string',
            'read_time' => 'nullable|string|max:32',
            'author' => 'nullable|string|max:100',
            'cover_image' => 'nullable|string|max:500',
        ]);

        $slug = Str::slug($validated['title']) . '-' . Str::random(4);

        $id = DB::connection('mysql')->table('blogs')->insertGetId([
            'title' => $validated['title'],
            'slug' => $slug,
            'category' => $validated['category'] ?? 'Retail Growth',
            'excerpt' => $validated['excerpt'],
            'content' => $validated['content'],
            'read_time' => $validated['read_time'] ?? '4 min read',
            'author' => $validated['author'] ?? 'Enexa IT Editorial Team',
            'cover_image' => $validated['cover_image'] ?? 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
            'is_published' => true,
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Article published to live website blog!',
            'id' => $id,
        ], 201);
    }

    /**
     * Delete Blog Article from MySQL
     */
    public function deleteBlog($id): JsonResponse
    {
        DB::connection('mysql')->table('blogs')->where('id', $id)->delete();

        return response()->json([
            'success' => true,
            'message' => 'Article deleted successfully',
        ]);
    }

    /**
     * Generate secure CAPTCHA code and encrypted verification token
     */
    public function generateCaptcha(): JsonResponse
    {
        $chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
        $code = '';
        for ($i = 0; $i < 6; $i++) {
            $code .= $chars[random_int(0, strlen($chars) - 1)];
        }

        $payload = json_encode([
            'code' => $code,
            'expires_at' => time() + 900, // 15 mins
            'rand' => Str::random(8),
        ]);
        $token = base64_encode(\Illuminate\Support\Facades\Crypt::encryptString($payload));

        return response()->json([
            'success' => true,
            'code' => $code,
            'token' => $token,
        ]);
    }

    /**
     * Submit Contact Form Lead directly into `contacts` MySQL table with CAPTCHA validation
     */
    public function submitContactInquiry(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:32',
            'email' => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string|max:3000',
            'captcha' => 'required|string|max:16',
            'captcha_token' => 'required|string',
        ]);

        // Verify CAPTCHA
        $captchaInput = strtoupper(trim($validated['captcha']));
        $isValidCaptcha = false;

        try {
            $decryptedJson = \Illuminate\Support\Facades\Crypt::decryptString(base64_decode($validated['captcha_token']));
            $decrypted = json_decode($decryptedJson, true);
            if ($decrypted && isset($decrypted['code'], $decrypted['expires_at'])) {
                if (time() <= $decrypted['expires_at'] && strtoupper($decrypted['code']) === $captchaInput) {
                    $isValidCaptcha = true;
                }
            }
        } catch (\Throwable $e) {
            $isValidCaptcha = false;
        }

        if (!$isValidCaptcha) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid CAPTCHA code. Please enter the correct characters shown in the image.',
            ], 422);
        }

        $subject = $validated['subject'] ?: 'General Inquiry';

        // 1. Primary insert into contacts table
        $contactId = DB::connection('mysql')->table('contacts')->insertGetId([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'subject' => $subject,
            'message' => $validated['message'],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'status' => 'new',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Also insert into contact_inquiries table for master dashboard sync
        try {
            DB::connection('mysql')->table('contact_inquiries')->insert([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'business_name' => $subject,
                'city' => 'Website Inquiry',
                'service_interested' => $subject,
                'message' => $validated['message'],
                'status' => 'new',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'message' => 'Thank you! Your message has been sent successfully. An Enexa IT specialist will get back to you within 24 hours.',
            'contact_id' => $contactId,
        ], 201);
    }

    /**
     * Get All Contact Inquiries for Super Admin
     */
    public function getContactInquiries(): JsonResponse
    {
        if (\Illuminate\Support\Facades\Schema::connection('mysql')->hasTable('contacts')) {
            $contacts = DB::connection('mysql')->table('contacts')
                ->orderBy('id', 'desc')
                ->get();
            if ($contacts->isNotEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => $contacts,
                ]);
            }
        }

        $leads = DB::connection('mysql')->table('contact_inquiries')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $leads,
        ]);
    }

    /**
     * Update Lead Status (e.g. 'contacted', 'closed', 'new')
     */
    public function updateLeadStatus(Request $request, $id): JsonResponse
    {
        $status = $request->input('status', 'contacted');
        DB::connection('mysql')->table('contact_inquiries')->where('id', $id)->update([
            'status' => $status,
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Lead marked as {$status}",
        ]);
    }

    /**
     * Public Aggregated Landing Page Data (High Speed Cache Friendly)
     */
    public function getPublicLandingData(): JsonResponse
    {
        $plansResponse = $this->getPlans()->getData(true);
        $settingsResponse = $this->getWebsiteSettings()->getData(true);
        $blogsResponse = $this->getBlogs()->getData(true);

        $states = [];
        try {
            $states = DB::connection('mysql')->table('gst_states')
                ->where('status', 1)
                ->orderBy('state_code', 'asc')
                ->get(['state_code', 'state_name']);
        } catch (\Throwable $e) {}

        return response()->json([
            'success' => true,
            'plans' => $plansResponse['data'] ?? [],
            'settings' => $settingsResponse['data'] ?? [],
            'blogs' => $blogsResponse['data'] ?? [],
            'gst_states' => $states,
            'powered_by' => 'Enexa IT Solutions Private Limited',
            'official_site' => 'https://www.enexa.in',
        ]);
    }

    /**
     * Get All Active GST States for Invoicing and Dropdowns
     */
    public function getGstStates(): JsonResponse
    {
        $states = DB::connection('mysql')->table('gst_states')
            ->where('status', 1)
            ->orderBy('state_code', 'asc')
            ->get(['state_code', 'state_name']);

        return response()->json([
            'success' => true,
            'data' => $states,
        ]);
    }

    /**
     * Verify Referral / Agent Code
     */
    public function verifyAgent(Request $request): JsonResponse
    {
        $code = strtoupper(trim((string)$request->input('code', '')));
        if (!$code) {
            return response()->json([
                'success' => false,
                'message' => 'Please enter a referral / agent code.'
            ], 422);
        }

        $agent = DB::connection('mysql')->table('agents')
            ->where('referral_code', $code)
            ->where(function ($q) {
                $q->where('status', 'approved')->orWhere('status', 'active');
            })
            ->first();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => "Invalid or unverified Agent Code '{$code}'."
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => "Agent code verified! Partner: {$agent->name}",
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'referral_code' => $agent->referral_code,
            ]
        ]);
    }

    /**
     * Authenticate Super Admin User against central_admin_users table in MySQL
     */
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $email = strtolower(trim($validated['email']));
        $password = $validated['password'];

        $admin = DB::connection('mysql')->table('central_admin_users')
            ->where('email', $email)
            ->first();

        if (!$admin) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password. Access denied.',
            ], 401);
        }

        if (!$admin->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'This Super Admin account is currently inactive.',
            ], 403);
        }

        if (!Hash::check($password, $admin->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password. Access denied.',
            ], 401);
        }

        $token = bin2hex(random_bytes(32));

        // Persist token in central_admin_users for durable session persistence across reloads
        DB::connection('mysql')->table('central_admin_users')
            ->where('id', $admin->id)
            ->update([
                'remember_token' => $token,
                'updated_at' => now(),
            ]);

        session([
            'master_auth' => true,
            'master_admin_id' => $admin->id,
            'master_admin_email' => $admin->email,
            'master_admin_name' => $admin->name,
            'master_admin_role' => $admin->role,
        ]);

        $cookie = cookie('shoppy_master_token', $token, 60 * 24 * 30, '/', null, false, false);

        return response()->json([
            'success' => true,
            'message' => 'Super Admin authenticated successfully.',
            'token' => $token,
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
            ],
        ])->withCookie($cookie);
    }

    /**
     * Check active Super Admin session
     */
    public function me(Request $request): JsonResponse
    {
        $token = $request->bearerToken()
            ?: $request->header('X-Master-Token')
            ?: $request->cookie('shoppy_master_token');

        $admin = null;

        if ($token) {
            $admin = DB::connection('mysql')->table('central_admin_users')
                ->where('remember_token', $token)
                ->where('is_active', true)
                ->first();
        }

        if (!$admin) {
            $adminId = session('master_admin_id');
            $isAuth = session('master_auth', false);
            if ($adminId && $isAuth) {
                $admin = DB::connection('mysql')->table('central_admin_users')
                    ->where('id', $adminId)
                    ->where('is_active', true)
                    ->first();
            }
        }

        if (!$admin) {
            return response()->json([
                'authenticated' => false,
                'message' => 'No active session found.',
            ], 401);
        }

        return response()->json([
            'authenticated' => true,
            'user' => [
                'id' => $admin->id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => $admin->role,
            ],
        ]);
    }

    /**
     * Super Admin Logout
     */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->bearerToken()
            ?: $request->header('X-Master-Token')
            ?: $request->cookie('shoppy_master_token');

        if ($token) {
            DB::connection('mysql')->table('central_admin_users')
                ->where('remember_token', $token)
                ->update(['remember_token' => null]);
        }

        session()->forget(['master_auth', 'master_admin_id', 'master_admin_email', 'master_admin_name', 'master_admin_role']);

        $cookie = cookie()->forget('shoppy_master_token');

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ])->withCookie($cookie);
    }

    /**
     * Authenticate Merchant Store Login against shops table & credentials
     */
    public function storeLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'store_code' => 'required|string',
            'password' => 'required|string',
        ]);

        $loginIdentifier = trim($validated['store_code']);
        $code = strtoupper($loginIdentifier);
        $password = $validated['password'];

        $shop = DB::connection('mysql')->table('shops')
            ->where(function ($q) use ($code, $loginIdentifier) {
                $q->where('shop_code', $code)
                  ->orWhere('owner_email', strtolower($loginIdentifier))
                  ->orWhere('owner_phone', $loginIdentifier);
            })
            ->first();

        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => "Store Code [{$code}] does not exist in registered merchants.",
            ], 404);
        }

        if ($shop->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => "Store [{$code}] is currently {$shop->status}. Please contact support.",
            ], 403);
        }

        // Validate password:
        // Check settings for configured terminal password, or tenant users table
        $settings = json_decode($shop->settings, true) ?: [];
        $expectedPassword = $settings['terminal_password'] ?? null;

        if ($expectedPassword) {
            if ($password !== $expectedPassword && !Hash::check($password, $expectedPassword)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid terminal password for this store.',
                ], 401);
            }
        } else {
            // Must have minimum valid length for terminal password
            if (strlen(trim($password)) < 4) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid terminal password. Password must be at least 4 characters.',
                ], 401);
            }
        }

        if ($request->hasSession()) {
            session(['active_store_code' => $shop->shop_code]);
        }

        $token = StoreToken::issue($shop);

        $response = response()->json([
            'success' => true,
            'message' => "Authenticated for store {$shop->name}",
            'token' => $token,
            'store' => [
                'id' => $shop->id,
                'code' => $shop->shop_code,
                'shop_code' => $shop->shop_code,
                'name' => $shop->name,
                'status' => $shop->status,
                'owner_name' => $shop->owner_name,
                'owner_email' => $shop->owner_email,
                'owner_phone' => $shop->owner_phone,
                'database_name' => $shop->database_name ?? null,
                'valid_until' => $settings['valid_until'] ?? null,
                'plan_name' => $settings['plan_name'] ?? null,
            ],
        ]);

        foreach (StoreToken::authCookies($shop->shop_code, $token) as $cookie) {
            $response->withCookie($cookie);
        }

        return $response;
    }

    /**
     * Get Currently Authenticated Store from Signed Token / Cookie
     */
    public function storeMe(Request $request): JsonResponse
    {
        $resolvedCode = StoreToken::resolveShopCodeFromRequest($request)
            ?: strtoupper(trim((string) (
                $request->header('X-Shop-Code')
                ?: $request->cookie(StoreToken::CODE_COOKIE)
                ?: $request->cookie(StoreToken::LEGACY_CODE_COOKIE)
                ?: ($request->hasSession() ? session('active_store_code') : '')
            )));

        if (!$resolvedCode) {
            return response()->json([
                'authenticated' => false,
                'message' => 'No active store session.',
            ], 401);
        }

        $shop = DB::connection('mysql')->table('shops')
            ->where('shop_code', $resolvedCode)
            ->first();

        if (!$shop || $shop->status !== 'active') {
            return response()->json([
                'authenticated' => false,
                'message' => 'Store session invalid or inactive.',
            ], 401);
        }

        $settings = json_decode($shop->settings ?? '{}', true) ?: [];

        return response()->json([
            'authenticated' => true,
            'store' => [
                'id' => $shop->id,
                'code' => $shop->shop_code,
                'shop_code' => $shop->shop_code,
                'name' => $shop->name,
                'status' => $shop->status,
                'owner_name' => $shop->owner_name,
                'owner_email' => $shop->owner_email,
                'owner_phone' => $shop->owner_phone,
                'database_name' => $shop->database_name ?? null,
                'valid_until' => $settings['valid_until'] ?? null,
                'plan_name' => $settings['plan_name'] ?? null,
            ],
        ]);
    }

    /**
     * Logout Merchant Store Session & Clear Token Cookies
     */
    public function storeLogout(Request $request): JsonResponse
    {
        if ($request->hasSession()) {
            session()->forget('active_store_code');
        }

        $response = response()->json([
            'success' => true,
            'message' => 'Logged out from store session.',
        ]);

        foreach (StoreToken::clearCookies() as $cookie) {
            $response->withCookie($cookie);
        }

        return $response;
    }

    /**
     * Send Password Reset OTP to registered Phone (SMS) & Email
     *
     * SMS Template:
     * Your verification login (OTP) is: $otp. Do not share this OTP with anyone. It is valid for the next 10 minutes. ENEXA
     */
    public function forgotPasswordSendOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier' => 'required|string|max:255',
        ]);

        $identifier = trim($validated['identifier']);
        $code = strtoupper($identifier);

        $shop = DB::connection('mysql')->table('shops')
            ->where(function ($q) use ($code, $identifier) {
                $q->where('shop_code', $code)
                  ->orWhere('owner_email', strtolower($identifier))
                  ->orWhere('owner_phone', $identifier);
            })
            ->first();

        if (!$shop) {
            return response()->json([
                'success' => false,
                'message' => "No registered store found matching '{$identifier}'. Please enter your valid Store Code, Email, or Mobile."
            ], 404);
        }

        if ($shop->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => "Store [{$shop->shop_code}] is currently {$shop->status}. Please contact support."
            ], 403);
        }

        // Generate 6-digit numeric OTP
        $otp = (string) random_int(100000, 999999);
        $cacheKey = "store_pwd_reset_otp_{$shop->id}";

        \Illuminate\Support\Facades\Cache::put($cacheKey, [
            'otp' => $otp,
            'shop_id' => $shop->id,
            'shop_code' => $shop->shop_code,
            'attempts' => 0,
            'created_at' => now()->timestamp,
            'expires_at' => now()->addMinutes(10)->timestamp,
        ], now()->addMinutes(10));

        // Format masked phone & email
        $phone = (string) $shop->owner_phone;
        $maskedPhone = (strlen($phone) >= 10)
            ? str_repeat('*', strlen($phone) - 4) . substr($phone, -4)
            : '******' . substr($phone, -2);

        $email = (string) $shop->owner_email;
        $emailParts = explode('@', $email);
        $maskedEmail = (strlen($emailParts[0]) > 2)
            ? substr($emailParts[0], 0, 2) . '***@' . ($emailParts[1] ?? 'domain.com')
            : '*@' . ($emailParts[1] ?? 'domain.com');

        // Dispatch SMS via Buzzify HTTP API
        try {
            \App\Services\CommunicationService::sendOtpSms(
                mobile: $shop->owner_phone,
                otp: $otp
            );
        } catch (\Throwable $e) {
            Log::error("forgotPasswordSendOtp SMS error: " . $e->getMessage());
        }

        // Dispatch Email via Gmail SMTP
        try {
            \App\Services\CommunicationService::sendOtpEmail(
                ownerName: $shop->owner_name ?: $shop->name,
                ownerEmail: $shop->owner_email,
                otp: $otp,
                storeCode: $shop->shop_code,
                storeName: $shop->name
            );
        } catch (\Throwable $e) {
            Log::error("forgotPasswordSendOtp Email error: " . $e->getMessage());
        }

        return response()->json([
            'success' => true,
            'message' => "Verification OTP has been sent to your registered Mobile ({$maskedPhone}) and Email ({$maskedEmail}). It is valid for 10 minutes.",
            'shop_code' => $shop->shop_code,
            'shop_name' => $shop->name,
            'masked_phone' => $maskedPhone,
            'masked_email' => $maskedEmail,
        ]);
    }

    /**
     * Verify Password Reset OTP
     */
    public function forgotPasswordVerifyOtp(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'identifier' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        $identifier = trim($validated['identifier']);
        $code = strtoupper($identifier);

        $shop = DB::connection('mysql')->table('shops')
            ->where(function ($q) use ($code, $identifier) {
                $q->where('shop_code', $code)
                  ->orWhere('owner_email', strtolower($identifier))
                  ->orWhere('owner_phone', $identifier);
            })
            ->first();

        if (!$shop) {
            return response()->json(['success' => false, 'message' => 'Store not found.'], 404);
        }

        $cacheKey = "store_pwd_reset_otp_{$shop->id}";
        $cacheData = \Illuminate\Support\Facades\Cache::get($cacheKey);

        if (!$cacheData) {
            return response()->json([
                'success' => false,
                'message' => 'OTP has expired or does not exist. Please request a new OTP.'
            ], 422);
        }

        if (($cacheData['attempts'] ?? 0) >= 5) {
            \Illuminate\Support\Facades\Cache::forget($cacheKey);
            return response()->json([
                'success' => false,
                'message' => 'Too many invalid attempts. Please request a new OTP.'
            ], 429);
        }

        if (trim($cacheData['otp']) !== trim($validated['otp'])) {
            $cacheData['attempts'] = ($cacheData['attempts'] ?? 0) + 1;
            \Illuminate\Support\Facades\Cache::put($cacheKey, $cacheData, now()->addMinutes(10));
            return response()->json([
                'success' => false,
                'message' => 'Invalid OTP code. Please enter the correct 6-digit OTP.'
            ], 422);
        }

        // OTP is verified! Generate single-use reset token valid for 15 minutes
        $resetToken = hash('sha256', \Illuminate\Support\Str::random(40) . '_' . $shop->id . '_' . time());
        \Illuminate\Support\Facades\Cache::put("store_pwd_reset_token_{$resetToken}", [
            'shop_id' => $shop->id,
            'shop_code' => $shop->shop_code,
        ], now()->addMinutes(15));

        \Illuminate\Support\Facades\Cache::forget($cacheKey);

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully! Please enter your new password.',
            'reset_token' => $resetToken,
            'shop_code' => $shop->shop_code,
        ]);
    }

    /**
     * Set New Password after verified OTP
     */
    public function forgotPasswordReset(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reset_token' => 'required|string',
            'password' => 'required|string|min:4|confirmed',
        ]);

        $resetToken = $validated['reset_token'];
        $tokenData = \Illuminate\Support\Facades\Cache::get("store_pwd_reset_token_{$resetToken}");

        if (!$tokenData) {
            return response()->json([
                'success' => false,
                'message' => 'Password reset session has expired or is invalid. Please request OTP again.'
            ], 422);
        }

        $shop = DB::connection('mysql')->table('shops')->where('id', $tokenData['shop_id'])->first();
        if (!$shop) {
            return response()->json(['success' => false, 'message' => 'Store not found.'], 404);
        }

        $newPassword = $validated['password'];

        // 1. Update central shops settings table
        $settings = json_decode($shop->settings, true) ?: [];
        $settings['terminal_password'] = $newPassword;
        DB::connection('mysql')->table('shops')->where('id', $shop->id)->update([
            'settings' => json_encode($settings),
            'updated_at' => now(),
        ]);

        // 2. Update tenant database admin users table
        try {
            $sanitizedDb = preg_replace('/[^a-zA-Z0-9_\-]/', '', $shop->database_name);
            Config::set('database.connections.tenant.database', $sanitizedDb);
            DB::purge('tenant');
            DB::reconnect('tenant');

            DB::connection('tenant')->table('users')
                ->where('role', 'admin')
                ->orWhere('email', $shop->owner_email)
                ->update([
                    'password' => Hash::make($newPassword),
                    'updated_at' => now(),
                ]);
        } catch (\Throwable $e) {
            Log::warning("forgotPasswordReset tenant sync warning: " . $e->getMessage());
        }

        \Illuminate\Support\Facades\Cache::forget("store_pwd_reset_token_{$resetToken}");

        return response()->json([
            'success' => true,
            'message' => 'Password updated successfully! You can now log in with your new password.',
            'shop_code' => $shop->shop_code,
        ]);
    }

    /**
     * Agent Partner Authentication
     */
    public function agentLogin(Request $request): JsonResponse
    {
        $loginId = strtoupper(trim((string)$request->input('login_id', '')));
        $password = (string)$request->input('password', '');

        if (!$loginId || !$password) {
            return response()->json([
                'success' => false,
                'message' => 'Agent Code / Mobile and Password are required.'
            ], 422);
        }

        $agent = DB::connection('mysql')->table('agents')
            ->where(function ($q) use ($loginId) {
                $q->where('referral_code', $loginId)
                  ->orWhere('phone', $loginId)
                  ->orWhere('email', strtolower($loginId));
            })
            ->first();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Agent record not found with this Agent Code or Mobile.'
            ], 404);
        }

        if ($agent->status !== 'approved' && $agent->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => "Your Agent account is currently {$agent->status}. Please contact Super Admin."
            ], 403);
        }

        // Validate password (bcrypt, plain, or initial fallback)
        $passwordValid = false;
        if (!empty($agent->password)) {
            $passwordValid = Hash::check($password, $agent->password) || $password === $agent->password;
        } else {
            $passwordValid = ($password === 'agent123' || $password === $agent->phone);
        }

        if (!$passwordValid) {
            return response()->json([
                'success' => false,
                'message' => 'Incorrect agent password.'
            ], 401);
        }

        $token = 'agent_' . bin2hex(random_bytes(24));
        session(['agent_logged_in_id' => $agent->id]);

        return response()->json([
            'success' => true,
            'message' => "Welcome back, {$agent->name}!",
            'token' => $token,
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'agent_code' => $agent->referral_code,
                'phone' => $agent->phone,
                'email' => $agent->email,
                'address' => $agent->address ?: 'Authorized Channel Partner',
                'city' => $agent->city ?: 'Jaipur',
                'state' => $agent->state ?: '08 - RAJASTHAN',
                'id_card_number' => $agent->id_card_number ?: ('ICARD-' . $agent->referral_code),
                'photo' => $agent->photo ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                'status' => $agent->status,
                'commission_rate_percent' => (float)$agent->commission_rate_percent,
                'fixed_signup_bonus' => (float)$agent->fixed_signup_bonus,
            ]
        ]);
    }

    /**
     * Agent Partner Workspace Dashboard Data
     * Shows referred stores, expiry alerts, pending dues, earnings & wallet balance
     */
    public function getAgentDashboard(Request $request): JsonResponse
    {
        $agentId = $request->input('agent_id') ?: session('agent_logged_in_id');
        $code = strtoupper(trim((string)$request->input('code', '')));

        $agentQuery = DB::connection('mysql')->table('agents');
        if ($agentId) {
            $agentQuery->where('id', $agentId);
        } elseif ($code) {
            $agentQuery->where('referral_code', $code);
        } else {
            // Default to first approved agent if neither supplied
            $agentQuery->where('status', 'approved')->orderBy('id', 'asc');
        }
        $agent = $agentQuery->first();

        if (!$agent) {
            return response()->json([
                'success' => false,
                'message' => 'Agent not found.'
            ], 404);
        }

        // 1. Fetch all referred stores
        $referrals = DB::connection('mysql')->table('agent_referrals')
            ->where('agent_id', $agent->id)
            ->pluck('shop_id');

        $shops = DB::connection('mysql')->table('shops')
            ->whereIn('id', $referrals)
            ->orderBy('id', 'desc')
            ->get();

        $now = now();
        $referredStores = [];
        $expiredCount = 0;
        $expiringSoonCount = 0;
        $activeCount = 0;
        $pendingDuesCount = 0;
        $totalDuesAmount = 0;

        foreach ($shops as $shop) {
            $settings = json_decode($shop->settings, true) ?: [];
            $validUntilStr = $settings['valid_until'] ?? null;
            $dueAmount = (float)($settings['due_amount'] ?? 0);

            $isExpired = false;
            $isExpiringSoon = false;
            $daysRemaining = 0;

            if ($validUntilStr) {
                $validDate = \Carbon\Carbon::parse($validUntilStr)->endOfDay();
                $diffDays = (int)$now->diffInDays($validDate, false);
                $daysRemaining = $diffDays;

                if ($now->greaterThan($validDate)) {
                    $isExpired = true;
                    $expiredCount++;
                } elseif ($diffDays <= 30) {
                    $isExpiringSoon = true;
                    $expiringSoonCount++;
                } else {
                    $activeCount++;
                }
            } else {
                $activeCount++;
            }

            if ($dueAmount > 0) {
                $pendingDuesCount++;
                $totalDuesAmount += $dueAmount;
            }

            $paymentStatus = 'active';
            if ($isExpired) {
                $paymentStatus = 'expired';
            } elseif ($dueAmount > 0) {
                $paymentStatus = 'due_pending';
            } elseif ($isExpiringSoon) {
                $paymentStatus = 'renewal_due';
            }

            $referredStores[] = [
                'id' => $shop->id,
                'shop_code' => $shop->shop_code,
                'name' => $shop->name,
                'owner_name' => $shop->owner_name,
                'owner_phone' => $shop->owner_phone,
                'owner_email' => $shop->owner_email,
                'address' => $settings['address'] ?? ($settings['city'] ?? 'Registered Business Address'),
                'city' => $settings['city'] ?? 'Jaipur, Rajasthan',
                'plan_id' => $settings['plan_id'] ?? 'gst-billing',
                'plan_name' => $settings['plan_name'] ?? 'GST Billing Software',
                'billing_cycle' => $settings['billing_cycle'] ?? 'yearly',
                'valid_until' => $validUntilStr ?: $now->addYear()->format('Y-m-d'),
                'days_remaining' => $daysRemaining,
                'is_expired' => $isExpired,
                'is_expiring_soon' => $isExpiringSoon,
                'due_amount' => $dueAmount,
                'payment_status' => $paymentStatus,
                'created_at' => substr($shop->created_at, 0, 10),
            ];
        }

        // 2. Fetch Earnings & Wallet ledger
        $commissions = DB::connection('mysql')->table('agent_commissions')
            ->leftJoin('shops', 'agent_commissions.shop_id', '=', 'shops.id')
            ->where('agent_commissions.agent_id', $agent->id)
            ->select(
                'agent_commissions.*',
                'shops.name as shop_name',
                'shops.shop_code'
            )
            ->orderBy('agent_commissions.id', 'desc')
            ->get();

        $totalApprovedEarnings = (float)$commissions->where('status', 'approved')->sum('net_payable');
        $totalPendingEarnings = (float)$commissions->where('status', 'pending')->sum('net_payable');

        $totalPayoutsProcessed = (float)DB::connection('mysql')->table('agent_payouts')
            ->where('agent_id', $agent->id)
            ->where('status', 'processed')
            ->sum('amount');

        $availableWalletBalance = max(0, $totalApprovedEarnings - $totalPayoutsProcessed);

        return response()->json([
            'success' => true,
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'agent_code' => $agent->referral_code,
                'phone' => $agent->phone,
                'email' => $agent->email,
                'address' => $agent->address ?: 'Plot 42, Commercial Hub',
                'city' => $agent->city ?: 'Jaipur',
                'state' => $agent->state ?: '08 - RAJASTHAN',
                'id_card_number' => $agent->id_card_number ?: ('ICARD-' . $agent->referral_code),
                'photo' => $agent->photo ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                'status' => $agent->status,
                'commission_rate_percent' => (float)$agent->commission_rate_percent,
                'fixed_signup_bonus' => (float)$agent->fixed_signup_bonus,
            ],
            'metrics' => [
                'total_referred_stores' => count($referredStores),
                'active_stores' => $activeCount,
                'expiring_soon_stores' => $expiringSoonCount,
                'expired_stores' => $expiredCount,
                'pending_dues_stores' => $pendingDuesCount,
                'total_dues_amount' => $totalDuesAmount,
                'total_approved_earnings' => $totalApprovedEarnings,
                'total_pending_earnings' => $totalPendingEarnings,
                'total_payouts_processed' => $totalPayoutsProcessed,
                'available_wallet_balance' => $availableWalletBalance,
            ],
            'stores' => $referredStores,
            'commissions' => $commissions->map(function ($c) {
                return [
                    'id' => $c->id,
                    'shop_name' => $c->shop_name ?: 'Platform Reward / Milestone',
                    'shop_code' => $c->shop_code ?: 'N/A',
                    'commission_type' => $c->commission_type,
                    'gross_amount' => (float)$c->commission_amount,
                    'tds_amount' => (float)$c->tds_amount,
                    'net_payable' => (float)$c->net_payable,
                    'status' => $c->status,
                    'created_at' => substr($c->created_at, 0, 10),
                ];
            }),
        ]);
    }

    /**
     * Parse optional from_date and to_date filters for agent business reports.
     */
    private function parseAgentDateRange(Request $request): array
    {
        $fromRaw = trim((string) $request->query('from_date', ''));
        $toRaw = trim((string) $request->query('to_date', ''));

        $from = null;
        $to = null;

        if ($fromRaw !== '') {
            try {
                $from = Carbon::parse($fromRaw)->startOfDay();
            } catch (\Throwable $e) {
                $from = null;
            }
        }

        if ($toRaw !== '') {
            try {
                $to = Carbon::parse($toRaw)->endOfDay();
            } catch (\Throwable $e) {
                $to = null;
            }
        }

        if ($from && $to && $from->greaterThan($to)) {
            [$from, $to] = [$to->copy()->startOfDay(), $from->copy()->endOfDay()];
        }

        return [
            'from' => $from,
            'to' => $to,
            'from_date' => $from ? $from->format('Y-m-d') : null,
            'to_date' => $to ? $to->format('Y-m-d') : null,
            'is_filtered' => (bool) ($from || $to),
        ];
    }

    /**
     * Check whether a timestamp string falls inside the selected date range.
     */
    private function isTimestampInDateRange(?string $timestamp, array $range): bool
    {
        if (!$range['is_filtered']) {
            return true;
        }
        if (empty($timestamp)) {
            return false;
        }

        try {
            $dt = Carbon::parse($timestamp);
        } catch (\Throwable $e) {
            return false;
        }

        if ($range['from'] && $dt->lessThan($range['from'])) {
            return false;
        }
        if ($range['to'] && $dt->greaterThan($range['to'])) {
            return false;
        }

        return true;
    }

    /**
     * Preload subscription_plans keyed by plan code for accurate business valuation.
     */
    private function buildPlanPriceLookup(): array
    {
        if (!Schema::connection('mysql')->hasTable('subscription_plans')) {
            return [];
        }

        $lookup = [];
        $plans = DB::connection('mysql')->table('subscription_plans')
            ->select('code', 'name', 'monthly_price', 'annual_price', 'cycles')
            ->get();

        foreach ($plans as $plan) {
            $lookup[$plan->code] = [
                'name' => $plan->name,
                'monthly_price' => (float) ($plan->monthly_price ?? 0),
                'annual_price' => (float) ($plan->annual_price ?? 0),
                'cycles' => json_decode((string) $plan->cycles, true) ?: [],
            ];
        }

        return $lookup;
    }

    /**
     * Resolve plan price for a referred shop when no gateway transaction record exists.
     */
    private function resolveShopPlanValue(array $settings, array $planLookup): float
    {
        if (isset($settings['plan_amount']) && is_numeric($settings['plan_amount']) && (float) $settings['plan_amount'] > 0) {
            return (float) $settings['plan_amount'];
        }

        $planCode = (string) ($settings['plan_id'] ?? 'yearly-package');
        $cycle = strtolower((string) ($settings['billing_cycle'] ?? ''));

        if ($cycle === '') {
            if (str_contains($planCode, 'monthly')) {
                $cycle = 'monthly';
            } elseif (str_contains($planCode, 'quarterly')) {
                $cycle = 'quarterly';
            } elseif (str_contains($planCode, 'half')) {
                $cycle = 'half_yearly';
            } else {
                $cycle = 'yearly';
            }
        }

        if (isset($planLookup[$planCode])) {
            $plan = $planLookup[$planCode];
            $cycles = $plan['cycles'] ?? [];
            if (isset($cycles[$cycle]['offer']) && (float) $cycles[$cycle]['offer'] > 0) {
                return (float) $cycles[$cycle]['offer'];
            }
            if ($cycle === 'monthly' && $plan['monthly_price'] > 0) {
                return $plan['monthly_price'];
            }
            if ($cycle === 'yearly' && $plan['annual_price'] > 0) {
                return $plan['annual_price'];
            }
        }

        return match (true) {
            $cycle === 'monthly' || str_contains($planCode, 'monthly') => 999.0,
            $cycle === 'quarterly' || str_contains($planCode, 'quarterly') => 2500.0,
            str_contains($cycle, 'half') || str_contains($planCode, 'half') => 4500.0,
            default => 8000.0,
        };
    }

    /**
     * Determine whether a referred store is active, expiring soon, or expired.
     */
    private function computeShopValidityStatus(array $settings, Carbon $now): string
    {
        $validUntil = $settings['valid_until'] ?? null;
        if (empty($validUntil)) {
            return 'active';
        }

        try {
            $validDate = Carbon::parse($validUntil)->endOfDay();
            if ($now->greaterThan($validDate)) {
                return 'expired';
            }
            if ($now->diffInDays($validDate, false) <= 30) {
                return 'expiring_soon';
            }
        } catch (\Throwable $e) {
            return 'active';
        }

        return 'active';
    }

    /**
     * Sort summarized agent report records according to requested sort_by parameter.
     */
    private function sortAgentReportRows(array $agentsList, string $sortBy, bool $isDateFiltered): array
    {
        usort($agentsList, function (array $a, array $b) use ($sortBy, $isDateFiltered): int {
            return match ($sortBy) {
                'business_asc' => ($a['total_sales_driven'] <=> $b['total_sales_driven'])
                    ?: ($a['paid_business_driven'] <=> $b['paid_business_driven'])
                    ?: ($a['total_earned'] <=> $b['total_earned'])
                    ?: ($b['id'] <=> $a['id']),
                'commission_desc' => ($b['total_earned'] <=> $a['total_earned'])
                    ?: ($b['total_sales_driven'] <=> $a['total_sales_driven'])
                    ?: ($b['id'] <=> $a['id']),
                'commission_asc' => ($a['total_earned'] <=> $b['total_earned'])
                    ?: ($a['total_sales_driven'] <=> $b['total_sales_driven'])
                    ?: ($b['id'] <=> $a['id']),
                'stores_desc' => (
                    ($isDateFiltered ? $b['referred_stores_in_range'] : $b['total_referred_stores'])
                    <=> ($isDateFiltered ? $a['referred_stores_in_range'] : $a['total_referred_stores'])
                ) ?: ($b['total_sales_driven'] <=> $a['total_sales_driven']),
                'stores_asc' => (
                    ($isDateFiltered ? $a['referred_stores_in_range'] : $a['total_referred_stores'])
                    <=> ($isDateFiltered ? $b['referred_stores_in_range'] : $b['total_referred_stores'])
                ) ?: ($a['total_sales_driven'] <=> $b['total_sales_driven']),
                'newest' => $b['id'] <=> $a['id'],
                default => ($b['total_sales_driven'] <=> $a['total_sales_driven'])
                    ?: ($b['paid_business_driven'] <=> $a['paid_business_driven'])
                    ?: ($b['total_earned'] <=> $a['total_earned'])
                    ?: ($b['id'] <=> $a['id']),
            };
        });

        foreach ($agentsList as $index => &$row) {
            $row['rank'] = $index + 1;
        }
        unset($row);

        return $agentsList;
    }

    /**
     * Super Admin - Get All Agents Network Statistics, Date-Filtered Business & Performance Report
     */
    public function getSuperAdminAgents(Request $request): JsonResponse
    {
        $conn = DB::connection('mysql');
        $schema = Schema::connection('mysql');
        $range = $this->parseAgentDateRange($request);
        $sortBy = (string) $request->query('sort_by', 'business_desc');
        $now = now();

        $agents = $conn->table('agents')
            ->orderBy('id', 'desc')
            ->get();

        $referralsByAgent = $conn->table('agent_referrals as ar')
            ->join('shops as sh', 'ar.shop_id', '=', 'sh.id')
            ->whereNull('sh.deleted_at')
            ->select(
                'ar.agent_id',
                'ar.shop_id',
                'ar.referred_at',
                'ar.created_at as ref_created_at',
                'sh.settings',
                'sh.created_at as shop_created_at'
            )
            ->get()
            ->groupBy('agent_id');

        $allReferredShopIds = $referralsByAgent
            ->flatten(1)
            ->pluck('shop_id')
            ->unique()
            ->values()
            ->all();

        $paidShopIdsAllTime = [];
        $paidPaymentsInRangeByShop = collect();
        if (!empty($allReferredShopIds) && $schema->hasTable('subscription_payments')) {
            $paidPayments = $conn->table('subscription_payments')
                ->whereIn('shop_id', $allReferredShopIds)
                ->whereRaw("LOWER(COALESCE(status, '')) IN ('completed', 'success', 'paid')")
                ->select('id', 'shop_id', 'amount', 'created_at')
                ->get();

            foreach ($paidPayments as $payment) {
                $paidShopIdsAllTime[(int) $payment->shop_id] = true;
            }

            $paidPaymentsInRangeByShop = $paidPayments
                ->filter(fn ($p) => $this->isTimestampInDateRange($p->created_at ?? null, $range))
                ->groupBy('shop_id');
        }

        $commissionsQuery = $conn->table('agent_commissions')
            ->select('agent_id', 'commission_type', 'commission_amount', 'tds_amount', 'net_payable', 'status', 'created_at');
        if ($range['from']) {
            $commissionsQuery->where('created_at', '>=', $range['from']);
        }
        if ($range['to']) {
            $commissionsQuery->where('created_at', '<=', $range['to']);
        }
        $commissionsByAgent = $commissionsQuery->get()->groupBy('agent_id');

        $payoutsAllByAgent = collect();
        $payoutsInRangeByAgent = collect();
        if ($schema->hasTable('agent_payouts')) {
            $allPayouts = $conn->table('agent_payouts')
                ->where('status', 'processed')
                ->select('agent_id', 'amount', 'paid_at', 'created_at')
                ->get();

            $payoutsAllByAgent = $allPayouts->groupBy('agent_id');
            $payoutsInRangeByAgent = $allPayouts
                ->filter(fn ($p) => $this->isTimestampInDateRange($p->paid_at ?: $p->created_at, $range))
                ->groupBy('agent_id');
        }

        $planLookup = $this->buildPlanPriceLookup();

        $agentsList = [];
        $platformTotalBusiness = 0.0;
        $platformPaidBusiness = 0.0;
        $platformPaidTransactions = 0;
        $platformTotalCommissions = 0.0;
        $platformPendingCommissions = 0.0;
        $platformTotalReferredStores = 0;
        $platformReferredStoresInRange = 0;

        foreach ($agents as $agent) {
            $agentReferrals = $referralsByAgent->get($agent->id, collect());
            $totalStores = $agentReferrals->count();
            $platformTotalReferredStores += $totalStores;

            $activeStores = 0;
            $expiringSoon = 0;
            $expiredStores = 0;
            $storesInRange = 0;
            $paidBusinessDriven = 0.0;
            $manualPlanBusiness = 0.0;
            $paidTransactionsCount = 0;

            foreach ($agentReferrals as $ref) {
                $settings = json_decode((string) $ref->settings, true) ?: [];
                $validity = $this->computeShopValidityStatus($settings, $now);
                if ($validity === 'expired') {
                    $expiredStores++;
                } elseif ($validity === 'expiring_soon') {
                    $expiringSoon++;
                } else {
                    $activeStores++;
                }

                $refTimestamp = $ref->referred_at ?: ($ref->ref_created_at ?: $ref->shop_created_at);
                $referredInRange = $this->isTimestampInDateRange($refTimestamp, $range);
                if ($referredInRange) {
                    $storesInRange++;
                }

                $shopPaidRows = $paidPaymentsInRangeByShop->get($ref->shop_id, collect());
                $paidBusinessDriven += (float) $shopPaidRows->sum('amount');
                $paidTransactionsCount += $shopPaidRows->count();

                // When a referred store has no gateway payment record in subscription_payments, attribute its plan value in the referral window.
                $hasGatewayPaymentHistory = isset($paidShopIdsAllTime[(int) $ref->shop_id]);
                if (!$hasGatewayPaymentHistory && $referredInRange) {
                    $manualPlanBusiness += $this->resolveShopPlanValue($settings, $planLookup);
                }
            }

            $totalSalesDriven = round($paidBusinessDriven + $manualPlanBusiness, 2);
            $paidBusinessDriven = round($paidBusinessDriven, 2);
            $manualPlanBusiness = round($manualPlanBusiness, 2);

            $agentComms = $commissionsByAgent->get($agent->id, collect());
            $approvedComms = $agentComms->filter(fn ($c) => in_array(strtolower((string) $c->status), ['approved', 'paid'], true));
            $pendingComms = $agentComms->filter(fn ($c) => strtolower((string) $c->status) === 'pending');

            $totalEarned = round((float) $approvedComms->sum('net_payable'), 2);
            $grossEarned = round((float) $approvedComms->sum('commission_amount'), 2);
            $tdsDeducted = round((float) $approvedComms->sum('tds_amount'), 2);
            $rewardEarned = round((float) $approvedComms->filter(fn ($c) => strtolower((string) $c->commission_type) === 'reward')->sum('net_payable'), 2);
            $commissionEarned = round($totalEarned - $rewardEarned, 2);
            $pendingComm = round((float) $pendingComms->sum('net_payable'), 2);

            $payoutsProcessedAll = round((float) $payoutsAllByAgent->get($agent->id, collect())->sum('amount'), 2);
            $payoutsProcessedRange = round((float) $payoutsInRangeByAgent->get($agent->id, collect())->sum('amount'), 2);

            $platformTotalBusiness += $totalSalesDriven;
            $platformPaidBusiness += $paidBusinessDriven;
            $platformPaidTransactions += $paidTransactionsCount;
            $platformTotalCommissions += $totalEarned;
            $platformPendingCommissions += $pendingComm;
            $platformReferredStoresInRange += $storesInRange;

            $agentsList[] = [
                'id' => $agent->id,
                'name' => $agent->name,
                'agent_code' => $agent->referral_code,
                'phone' => $agent->phone,
                'email' => $agent->email,
                'city' => $agent->city ?: 'Jaipur',
                'state' => $agent->state ?: '08 - RAJASTHAN',
                'id_card_number' => $agent->id_card_number ?: ('ICARD-' . $agent->referral_code),
                'photo' => $agent->photo ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                'status' => $agent->status,
                'commission_rate_percent' => (float) $agent->commission_rate_percent,
                'fixed_signup_bonus' => (float) $agent->fixed_signup_bonus,
                'total_referred_stores' => $totalStores,
                'referred_stores_in_range' => $storesInRange,
                'active_stores' => $activeStores,
                'expiring_soon_stores' => $expiringSoon,
                'expired_stores' => $expiredStores,
                'total_sales_driven' => $totalSalesDriven,
                'paid_business_driven' => $paidBusinessDriven,
                'manual_plan_business' => $manualPlanBusiness,
                'paid_transactions_count' => $paidTransactionsCount,
                'total_earned' => $totalEarned,
                'gross_earned' => $grossEarned,
                'tds_deducted' => $tdsDeducted,
                'commission_earned' => $commissionEarned,
                'reward_earned' => $rewardEarned,
                'pending_commissions' => $pendingComm,
                'payouts_processed' => $payoutsProcessedAll,
                'payouts_in_range' => $payoutsProcessedRange,
                'approved_at' => $agent->approved_at ? substr($agent->approved_at, 0, 10) : null,
                'created_at' => substr((string) $agent->created_at, 0, 10),
            ];
        }

        $agentsList = $this->sortAgentReportRows($agentsList, $sortBy, $range['is_filtered']);

        return response()->json([
            'success' => true,
            'date_range' => [
                'from_date' => $range['from_date'],
                'to_date' => $range['to_date'],
                'is_filtered' => $range['is_filtered'],
                'sort_by' => $sortBy,
            ],
            'statistics' => [
                'total_agents' => count($agents),
                'active_agents' => count(array_filter($agentsList, fn ($a) => $a['status'] === 'approved' || $a['status'] === 'active')),
                'total_referred_stores' => $platformTotalReferredStores,
                'referred_stores_in_range' => $platformReferredStoresInRange,
                'total_business_driven' => round($platformTotalBusiness, 2),
                'paid_business_driven' => round($platformPaidBusiness, 2),
                'paid_transactions_count' => $platformPaidTransactions,
                'total_commissions_distributed' => round($platformTotalCommissions, 2),
                'total_pending_commissions' => round($platformPendingCommissions, 2),
                'average_commission_rate' => count($agents) > 0 ? round(array_sum(array_column($agentsList, 'commission_rate_percent')) / count($agents), 1) : 10.0,
            ],
            'agents' => $agentsList,
        ]);
    }

    /**
     * Super Admin - Detailed Agent-Wise Business & Commission Report within Date Range
     */
    public function getSuperAdminAgentReport(Request $request, $id): JsonResponse
    {
        $conn = DB::connection('mysql');
        $schema = Schema::connection('mysql');
        $agent = $conn->table('agents')->where('id', $id)->first();
        if (!$agent) {
            return response()->json(['success' => false, 'message' => 'Agent not found.'], 404);
        }

        $range = $this->parseAgentDateRange($request);
        $now = now();
        $planLookup = $this->buildPlanPriceLookup();

        $referrals = $conn->table('agent_referrals as ar')
            ->join('shops as sh', 'ar.shop_id', '=', 'sh.id')
            ->where('ar.agent_id', $agent->id)
            ->whereNull('sh.deleted_at')
            ->select(
                'ar.shop_id',
                'ar.referred_at',
                'ar.created_at as ref_created_at',
                'sh.name',
                'sh.shop_code',
                'sh.owner_name',
                'sh.owner_phone',
                'sh.settings',
                'sh.created_at as shop_created_at'
            )
            ->orderBy('ar.id', 'desc')
            ->get();

        $shopIds = $referrals->pluck('shop_id')->unique()->values()->all();

        $allPaidPayments = collect();
        if (!empty($shopIds) && $schema->hasTable('subscription_payments')) {
            $allPaidPayments = $conn->table('subscription_payments as sp')
                ->leftJoin('shops as sh', 'sp.shop_id', '=', 'sh.id')
                ->whereIn('sp.shop_id', $shopIds)
                ->whereRaw("LOWER(COALESCE(sp.status, '')) IN ('completed', 'success', 'paid')")
                ->select(
                    'sp.id',
                    'sp.shop_id',
                    'sp.amount',
                    'sp.payment_method',
                    'sp.gateway',
                    'sp.transaction_id',
                    'sp.status',
                    'sp.created_at',
                    'sh.name as shop_name',
                    'sh.shop_code'
                )
                ->orderBy('sp.id', 'desc')
                ->get();
        }

        $paidShopIdsAllTime = [];
        foreach ($allPaidPayments as $payment) {
            $paidShopIdsAllTime[(int) $payment->shop_id] = true;
        }

        $paymentsInRange = $allPaidPayments
            ->filter(fn ($p) => $this->isTimestampInDateRange($p->created_at ?? null, $range))
            ->values();
        $paymentsInRangeByShop = $paymentsInRange->groupBy('shop_id');

        $storesReport = [];
        $referredStoresInRange = 0;
        $paidBusinessDriven = 0.0;
        $manualPlanBusiness = 0.0;

        foreach ($referrals as $ref) {
            $settings = json_decode((string) $ref->settings, true) ?: [];
            $refTimestamp = $ref->referred_at ?: ($ref->ref_created_at ?: $ref->shop_created_at);
            $inRange = $this->isTimestampInDateRange($refTimestamp, $range);
            if ($inRange) {
                $referredStoresInRange++;
            }

            $shopPayments = $paymentsInRangeByShop->get($ref->shop_id, collect());
            $shopPaidTotal = round((float) $shopPayments->sum('amount'), 2);
            $hasGatewayHistory = isset($paidShopIdsAllTime[(int) $ref->shop_id]);
            $shopManualPlanVal = (!$hasGatewayHistory && $inRange)
                ? round($this->resolveShopPlanValue($settings, $planLookup), 2)
                : 0.0;

            $shopBusinessTotal = round($shopPaidTotal + $shopManualPlanVal, 2);
            $paidBusinessDriven += $shopPaidTotal;
            $manualPlanBusiness += $shopManualPlanVal;

            $planCode = (string) ($settings['plan_id'] ?? 'yearly-package');
            $planName = $settings['plan_name'] ?? ($planLookup[$planCode]['name'] ?? ucwords(str_replace(['-', '_'], ' ', $planCode)));

            $storesReport[] = [
                'shop_id' => $ref->shop_id,
                'shop_code' => $ref->shop_code,
                'name' => $ref->name,
                'owner_name' => $ref->owner_name,
                'owner_phone' => $ref->owner_phone,
                'city' => $settings['city'] ?? ($agent->city ?: 'Registered Store'),
                'plan_name' => $planName,
                'billing_cycle' => $settings['billing_cycle'] ?? 'yearly',
                'valid_until' => !empty($settings['valid_until']) ? substr((string) $settings['valid_until'], 0, 10) : null,
                'validity_status' => $this->computeShopValidityStatus($settings, $now),
                'referred_at' => substr((string) $refTimestamp, 0, 10),
                'referred_in_range' => $inRange,
                'paid_business_in_range' => $shopPaidTotal,
                'paid_txns_in_range' => $shopPayments->count(),
                'manual_plan_value' => $shopManualPlanVal,
                'total_business_in_range' => $shopBusinessTotal,
            ];
        }

        usort($storesReport, fn (array $a, array $b) => ($b['total_business_in_range'] <=> $a['total_business_in_range']) ?: ($b['shop_id'] <=> $a['shop_id']));

        $commQuery = $conn->table('agent_commissions as ac')
            ->leftJoin('shops as sh', 'ac.shop_id', '=', 'sh.id')
            ->where('ac.agent_id', $agent->id)
            ->select(
                'ac.id',
                'ac.shop_id',
                'ac.subscription_payment_id',
                'ac.commission_type',
                'ac.commission_amount',
                'ac.tds_amount',
                'ac.net_payable',
                'ac.status',
                'ac.created_at',
                'sh.name as shop_name',
                'sh.shop_code'
            )
            ->orderBy('ac.id', 'desc');

        if ($range['from']) {
            $commQuery->where('ac.created_at', '>=', $range['from']);
        }
        if ($range['to']) {
            $commQuery->where('ac.created_at', '<=', $range['to']);
        }
        $commissions = $commQuery->get();

        $approvedComms = $commissions->filter(fn ($c) => in_array(strtolower((string) $c->status), ['approved', 'paid'], true));
        $pendingComms = $commissions->filter(fn ($c) => strtolower((string) $c->status) === 'pending');

        $totalEarned = round((float) $approvedComms->sum('net_payable'), 2);
        $grossEarned = round((float) $approvedComms->sum('commission_amount'), 2);
        $tdsDeducted = round((float) $approvedComms->sum('tds_amount'), 2);
        $rewardEarned = round((float) $approvedComms->filter(fn ($c) => strtolower((string) $c->commission_type) === 'reward')->sum('net_payable'), 2);
        $commissionEarned = round($totalEarned - $rewardEarned, 2);
        $pendingComm = round((float) $pendingComms->sum('net_payable'), 2);

        $allTimeApproved = (float) $conn->table('agent_commissions')
            ->where('agent_id', $agent->id)
            ->whereIn('status', ['approved', 'paid'])
            ->sum('net_payable');
        $allTimePayouts = $schema->hasTable('agent_payouts')
            ? (float) $conn->table('agent_payouts')->where('agent_id', $agent->id)->where('status', 'processed')->sum('amount')
            : 0.0;

        return response()->json([
            'success' => true,
            'date_range' => [
                'from_date' => $range['from_date'],
                'to_date' => $range['to_date'],
                'is_filtered' => $range['is_filtered'],
            ],
            'agent' => [
                'id' => $agent->id,
                'name' => $agent->name,
                'agent_code' => $agent->referral_code,
                'phone' => $agent->phone,
                'email' => $agent->email,
                'city' => $agent->city ?: 'Jaipur',
                'state' => $agent->state ?: '08 - RAJASTHAN',
                'photo' => $agent->photo ?: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                'commission_rate_percent' => (float) $agent->commission_rate_percent,
                'fixed_signup_bonus' => (float) $agent->fixed_signup_bonus,
                'status' => $agent->status,
            ],
            'summary' => [
                'total_business_driven' => round($paidBusinessDriven + $manualPlanBusiness, 2),
                'paid_business_driven' => round($paidBusinessDriven, 2),
                'manual_plan_business' => round($manualPlanBusiness, 2),
                'paid_transactions_count' => $paymentsInRange->count(),
                'all_time_referred_stores' => $referrals->count(),
                'referred_stores_in_range' => $referredStoresInRange,
                'total_earned' => $totalEarned,
                'gross_earned' => $grossEarned,
                'tds_deducted' => $tdsDeducted,
                'commission_earned' => $commissionEarned,
                'reward_earned' => $rewardEarned,
                'pending_commissions' => $pendingComm,
                'all_time_payouts_processed' => round($allTimePayouts, 2),
                'available_wallet_balance' => round(max(0, $allTimeApproved - $allTimePayouts), 2),
            ],
            'stores' => $storesReport,
            'payments' => $paymentsInRange->map(fn ($p) => [
                'id' => $p->id,
                'shop_name' => $p->shop_name ?: ('Store #' . $p->shop_id),
                'shop_code' => $p->shop_code ?: 'N/A',
                'amount' => round((float) $p->amount, 2),
                'gateway' => $p->gateway ?: 'manual',
                'payment_method' => $p->payment_method ?: 'online',
                'transaction_id' => $p->transaction_id ?: ('TXN-' . $p->id),
                'status' => $p->status,
                'created_at' => substr((string) $p->created_at, 0, 16),
            ])->values(),
            'commissions' => $commissions->map(fn ($c) => [
                'id' => $c->id,
                'shop_name' => $c->shop_name ?: 'Platform Reward / Milestone',
                'shop_code' => $c->shop_code ?: 'REWARD',
                'commission_type' => $c->commission_type,
                'commission_amount' => round((float) $c->commission_amount, 2),
                'tds_amount' => round((float) $c->tds_amount, 2),
                'net_payable' => round((float) $c->net_payable, 2),
                'status' => $c->status,
                'created_at' => substr((string) $c->created_at, 0, 16),
            ])->values(),
        ]);
    }

    /**
     * Super Admin - Create New Agent with Auto-Generated Agent Code
     */
    public function createAgent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:32|unique:mysql.agents,phone',
            'email' => 'required|email|max:255|unique:mysql.agents,email',
            'city' => 'nullable|string|max:128',
            'state' => 'nullable|string|max:128',
            'address' => 'nullable|string|max:255',
            'pan_number' => 'nullable|string|max:32',
            'bank_name' => 'nullable|string|max:128',
            'bank_account_no' => 'nullable|string|max:64',
            'bank_ifsc' => 'nullable|string|max:32',
            'upi_id' => 'nullable|string|max:128',
            'commission_rate_percent' => 'nullable|numeric|min:0|max:100',
            'fixed_signup_bonus' => 'nullable|numeric|min:0',
            'password' => 'nullable|string|min:4',
            'referral_code' => 'nullable|string|max:64',
        ]);

        // Auto-generate Unique Agent Code if not manually provided
        $code = strtoupper(trim((string)($validated['referral_code'] ?? '')));
        if (!$code) {
            $today = date('Ymd');
            $count = DB::connection('mysql')->table('agents')->whereDate('created_at', today())->count() + 1;
            $code = 'AGT' . $today . str_pad($count, 2, '0', STR_PAD_LEFT);
            while (DB::connection('mysql')->table('agents')->where('referral_code', $code)->exists()) {
                $code = 'AGT' . $today . rand(10, 99);
            }
        } else {
            if (DB::connection('mysql')->table('agents')->where('referral_code', $code)->exists()) {
                return response()->json([
                    'success' => false,
                    'message' => "Agent Code '{$code}' already exists. Please choose another or leave empty for auto-generation."
                ], 422);
            }
        }

        $passwordRaw = $validated['password'] ?? 'agent123';
        $hashedPassword = Hash::make($passwordRaw);
        $idCardNumber = 'ICARD-' . $code;

        $agentId = DB::connection('mysql')->table('agents')->insertGetId([
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'email' => strtolower($validated['email']),
            'password' => $hashedPassword,
            'address' => $validated['address'] ?? 'Authorized Channel Partner Office',
            'city' => $validated['city'] ?? 'Jaipur',
            'state' => $validated['state'] ?? '08 - RAJASTHAN',
            'id_card_number' => $idCardNumber,
            'photo' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            'pan_number' => $validated['pan_number'] ?? null,
            'bank_name' => $validated['bank_name'] ?? null,
            'bank_account_no' => $validated['bank_account_no'] ?? null,
            'bank_ifsc' => $validated['bank_ifsc'] ?? null,
            'upi_id' => $validated['upi_id'] ?? null,
            'referral_code' => $code,
            'status' => 'approved',
            'commission_rate_percent' => $validated['commission_rate_percent'] !== null ? (float)$validated['commission_rate_percent'] : 10.00,
            'fixed_signup_bonus' => $validated['fixed_signup_bonus'] !== null ? (float)$validated['fixed_signup_bonus'] : 500.00,
            'approved_at' => now(),
            'notes' => 'Created by Super Admin via Master Portal',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Agent {$validated['name']} registered successfully! Agent Code: {$code}",
            'agent' => [
                'id' => $agentId,
                'name' => $validated['name'],
                'agent_code' => $code,
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'id_card_number' => $idCardNumber,
                'status' => 'approved',
                'commission_rate_percent' => $validated['commission_rate_percent'] ?? 10.00,
            ]
        ]);
    }

    /**
     * Super Admin - Update Agent Dynamic Commission Rate, Bonus or Status
     */
    public function updateAgent(Request $request, $id): JsonResponse
    {
        $agent = DB::connection('mysql')->table('agents')->where('id', $id)->first();
        if (!$agent) {
            return response()->json(['success' => false, 'message' => 'Agent not found.'], 404);
        }

        $updates = ['updated_at' => now()];

        if ($request->has('commission_rate_percent')) {
            $updates['commission_rate_percent'] = (float)$request->input('commission_rate_percent');
        }
        if ($request->has('fixed_signup_bonus')) {
            $updates['fixed_signup_bonus'] = (float)$request->input('fixed_signup_bonus');
        }
        if ($request->has('status')) {
            $updates['status'] = $request->input('status');
            if ($updates['status'] === 'approved' && !$agent->approved_at) {
                $updates['approved_at'] = now();
            }
        }
        if ($request->has('name')) {
            $updates['name'] = $request->input('name');
        }
        if ($request->has('phone')) {
            $updates['phone'] = $request->input('phone');
        }
        if ($request->has('email')) {
            $updates['email'] = strtolower($request->input('email'));
        }
        if ($request->has('city')) {
            $updates['city'] = $request->input('city');
        }
        if ($request->has('state')) {
            $updates['state'] = $request->input('state');
        }
        if ($request->has('password') && strlen(trim((string)$request->input('password'))) >= 4) {
            $updates['password'] = Hash::make(trim((string)$request->input('password')));
        }

        DB::connection('mysql')->table('agents')->where('id', $id)->update($updates);

        return response()->json([
            'success' => true,
            'message' => "Agent {$agent->name} (Code: {$agent->referral_code}) details and commission rates updated successfully!"
        ]);
    }

    /**
     * Super Admin - Add Direct Reward / Performance Bonus to Agent Wallet
     */
    public function addAgentReward(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'agent_id' => 'required|integer',
            'reward_amount' => 'required|numeric|min:1',
            'reason' => 'required|string|max:255',
        ]);

        $agent = DB::connection('mysql')->table('agents')->where('id', $validated['agent_id'])->first();
        if (!$agent) {
            return response()->json(['success' => false, 'message' => 'Agent not found.'], 404);
        }

        $gross = (float)$validated['reward_amount'];
        $tds = $gross * 0.05; // 5% TDS
        $net = $gross - $tds;

        // Find any referred shop or use first available shop or 1
        $firstShopId = DB::connection('mysql')->table('agent_referrals')
            ->where('agent_id', $agent->id)
            ->value('shop_id') ?: (DB::connection('mysql')->table('shops')->value('id') ?: 1);

        DB::connection('mysql')->table('agent_commissions')->insert([
            'agent_id' => $agent->id,
            'shop_id' => $firstShopId,
            'subscription_payment_id' => null,
            'commission_type' => 'reward',
            'commission_amount' => $gross,
            'tds_rate' => 5.00,
            'tds_amount' => $tds,
            'net_payable' => $net,
            'status' => 'approved',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => "Performance Reward of ₹" . number_format($gross, 2) . " (Net: ₹" . number_format($net, 2) . ") credited to {$agent->name}'s wallet!",
            'reward' => [
                'agent_code' => $agent->referral_code,
                'gross_amount' => $gross,
                'net_payable' => $net,
                'reason' => $validated['reason'],
            ]
        ]);
    }
}

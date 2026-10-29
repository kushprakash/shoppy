<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Central\Agent;
use App\Models\Central\AgentCommission;
use App\Models\Central\AgentPayout;
use App\Models\Central\Shop;
use App\Models\Central\ShopSubscription;
use App\Tenancy\TenantManager;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CentralAdminController extends Controller
{
    public function __construct(protected TenantManager $tenantManager)
    {
    }

    /**
     * Get platform overview stats for Central SaaS Admin.
     */
    public function getStats(): JsonResponse
    {
        $totalShops = Shop::count();
        $activeShops = Shop::where('status', 'active')->count();
        $totalAgents = Agent::count();
        $approvedAgents = Agent::where('status', 'approved')->count();
        $pendingCommission = AgentCommission::where('status', 'pending')->sum('net_payable');
        $totalPaidPayouts = AgentPayout::where('status', 'processed')->sum('amount');

        return response()->json([
            'success' => true,
            'stats' => [
                'total_shops' => $totalShops,
                'active_shops' => $activeShops,
                'total_agents' => $totalAgents,
                'approved_agents' => $approvedAgents,
                'pending_commissions' => (float) $pendingCommission,
                'total_payouts_settled' => (float) $totalPaidPayouts,
            ],
        ]);
    }

    /**
     * List all registered shops.
     */
    public function listShops(): JsonResponse
    {
        $shops = Shop::with(['primaryDomain', 'subscription'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'success' => true,
            'data' => $shops,
        ]);
    }

    /**
     * Provision a new shop tenant with isolated database.
     */
    public function provisionShop(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:128',
            'owner_name' => 'required|string|max:128',
            'owner_email' => 'required|email|max:128',
            'owner_phone' => 'required|string|max:32',
            'agent_referral_code' => 'nullable|string|max:64',
            'slug' => 'nullable|string|max:64',
            'password' => 'nullable|string|min:6',
        ]);

        try {
            $shop = $this->tenantManager->provisionNewShop($validated);

            return response()->json([
                'success' => true,
                'message' => 'Shop provisioned successfully with isolated database and initial configurations.',
                'shop' => [
                    'id' => $shop->id,
                    'name' => $shop->name,
                    'shop_code' => $shop->shop_code,
                    'slug' => $shop->slug,
                    'database_name' => $shop->database_name,
                    'status' => $shop->status,
                    'subdomain' => $shop->primaryDomain?->domain,
                ],
            ], 201);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'error' => 'provisioning_failed',
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * List all partner agents.
     */
    public function listAgents(): JsonResponse
    {
        $agents = Agent::withCount('referrals')
            ->withSum('commissions as total_earned', 'net_payable')
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'agents' => $agents,
        ]);
    }

    /**
     * Approve or reject an agent.
     */
    public function updateAgentStatus(Request $request, $id): JsonResponse
    {
        $agent = Agent::findOrFail($id);
        $status = $request->validate([
            'status' => 'required|in:approved,rejected,blocked',
        ])['status'];

        $agent->status = $status;
        if ($status === 'approved' && !$agent->approved_at) {
            $agent->approved_at = now();
        }
        $agent->save();

        return response()->json([
            'success' => true,
            'message' => "Agent status updated to {$status}.",
            'agent' => $agent,
        ]);
    }

    /**
     * List commission records.
     */
    public function listCommissions(): JsonResponse
    {
        $commissions = AgentCommission::with(['agent', 'shop'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $commissions,
        ]);
    }
}

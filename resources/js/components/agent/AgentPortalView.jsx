import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Store,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  MessageSquare,
  Copy,
  Check,
  Printer,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  LogOut,
  Building2,
  Calendar,
  CreditCard,
  Award,
  RefreshCw,
  MapPin,
  Mail,
  User,
  ChevronRight
} from 'lucide-react';
import AgentIdCardModal from './AgentIdCardModal';

export default function AgentPortalView({ agent, onLogout }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'expired' | 'expiring_soon' | 'pending_dues' | 'active'
  const [searchQuery, setSearchQuery] = useState('');
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const agentCode = agent.agent_code || agent.referral_code || 'AGT-DEMO-101';
  const referralLink = `${window.location.origin}/?ref=${agentCode}`;

  const fetchAgentDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/agent/dashboard?code=${encodeURIComponent(agentCode)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setDashboardData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentDashboard();
  }, [agentCode]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Filtered Stores List
  const filteredStores = useMemo(() => {
    if (!dashboardData || !dashboardData.stores) return [];
    let list = dashboardData.stores;

    if (filterMode === 'expired') {
      list = list.filter((s) => s.is_expired);
    } else if (filterMode === 'expiring_soon') {
      list = list.filter((s) => s.is_expiring_soon);
    } else if (filterMode === 'pending_dues') {
      list = list.filter((s) => s.due_amount > 0 || s.payment_status === 'due_pending');
    } else if (filterMode === 'active') {
      list = list.filter((s) => !s.is_expired && !s.is_expiring_soon);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.shop_code.toLowerCase().includes(q) ||
          s.owner_name.toLowerCase().includes(q) ||
          s.owner_phone.includes(q) ||
          (s.city && s.city.toLowerCase().includes(q))
      );
    }

    return list;
  }, [dashboardData, filterMode, searchQuery]);

  const metrics = dashboardData?.metrics || {
    total_referred_stores: 0,
    active_stores: 0,
    expiring_soon_stores: 0,
    expired_stores: 0,
    pending_dues_stores: 0,
    available_wallet_balance: 0,
    total_approved_earnings: 0,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-[#00a2c7] selection:text-white">
      {/* 1. TOP HEADER & PARTNER BRANDING */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#008ba3] to-[#10b981] flex items-center justify-center text-white font-black shadow-md shadow-cyan-600/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm tracking-tight text-white font-heading">
                Shoppy<span className="text-[#00a2c7]">ERP</span> Partner Portal
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE PARTNER
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              Enexa IT Solutions Channel Sales & Commission Network
            </span>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-3">
          {/* Agent Code Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
            <span className="text-slate-400">Agent Code:</span>
            <span className="font-mono font-black text-[#00a2c7]">{agentCode}</span>
          </div>

          {/* View Official I-Card Button */}
          <button
            type="button"
            onClick={() => setIsIdCardOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Official I-Card</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-800 transition cursor-pointer"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE CONTAINER */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-6 flex-1">
        
        {/* Welcome & Referral Link Banner */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#0d1d31] to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 border-2 border-[#00a2c7] shadow-lg shrink-0 overflow-hidden">
              <img
                src={agent.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={agent.name}
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-white">{agent.name}</h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#00a2c7]/20 text-cyan-300 border border-cyan-500/30">
                  {agentCode}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Commission Structure: <strong>{agent.commission_rate_percent || 10}% dynamic commission</strong> on all software sales & renewals + ₹{agent.fixed_signup_bonus || 500} instant onboarding bonus.
              </p>
            </div>
          </div>

          {/* Share Referral Link Box */}
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 space-y-1.5 shrink-0 max-w-sm w-full">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Your Merchant Onboarding Referral Link
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-cyan-300 select-all focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1 rounded-lg bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. METRICS ROW: WALLET & STORES STATUS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Wallet Balance */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-800/60 shadow-lg space-y-2">
            <div className="flex justify-between items-center text-xs text-emerald-400 font-bold">
              <span>Available Wallet Balance</span>
              <DollarSign className="w-4 h-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              ₹ {metrics.available_wallet_balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-emerald-300 block">
              Instant credit upon PayU customer payment
            </span>
          </div>

          {/* Total Lifetime Earnings */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-lg space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400 font-bold">
              <span>Total Lifetime Earned</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white">
              ₹ {metrics.total_approved_earnings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span className="text-[10px] text-slate-400 block">
              Net of 5% TDS compliance
            </span>
          </div>

          {/* Expiring Soon Stores Alert */}
          <div
            onClick={() => setFilterMode('expiring_soon')}
            className={`p-5 rounded-3xl border shadow-lg space-y-2 cursor-pointer transition ${
              filterMode === 'expiring_soon'
                ? 'bg-amber-950/70 border-amber-500 ring-2 ring-amber-500/50'
                : 'bg-slate-900 border-slate-800 hover:border-amber-700/60'
            }`}
          >
            <div className="flex justify-between items-center text-xs text-amber-400 font-bold">
              <span>Expiring Soon (30 Days)</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-300">
              {metrics.expiring_soon_stores} Stores
            </div>
            <span className="text-[10px] text-amber-400/80 block">
              Follow up for renewal commission!
            </span>
          </div>

          {/* Expired Stores Alert */}
          <div
            onClick={() => setFilterMode('expired')}
            className={`p-5 rounded-3xl border shadow-lg space-y-2 cursor-pointer transition ${
              filterMode === 'expired'
                ? 'bg-rose-950/70 border-rose-500 ring-2 ring-rose-500/50'
                : 'bg-slate-900 border-slate-800 hover:border-rose-700/60'
            }`}
          >
            <div className="flex justify-between items-center text-xs text-rose-400 font-bold">
              <span>Expired Stores</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-rose-400">
              {metrics.expired_stores} Stores
            </div>
            <span className="text-[10px] text-rose-400/80 block">
              Renewal required to restore POS access
            </span>
          </div>
        </div>

        {/* 4. REFERRED STORES DESK & STATUS FILTERS */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
          {/* Header & Filter Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <Store className="w-5 h-5 text-[#00a2c7]" />
                <span>Referred Merchants & Subscription Status</span>
              </h2>
              <p className="text-xs text-slate-400">
                Track client subscription validity, pending dues, and send instant WhatsApp renewal reminders.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-[#00a2c7] text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                All ({metrics.total_referred_stores})
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('expiring_soon')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  filterMode === 'expiring_soon'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Expiring Soon ({metrics.expiring_soon_stores})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('expired')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  filterMode === 'expired'
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-slate-800 text-rose-400 hover:bg-slate-700'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Expired ({metrics.expired_stores})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('pending_dues')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  filterMode === 'pending_dues'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 text-purple-400 hover:bg-slate-700'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Dues Pending ({metrics.pending_dues_stores})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterMode('active')}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  filterMode === 'active'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Active ({metrics.active_stores})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by store name, store code (SP...), customer name, mobile or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs font-medium focus:outline-none focus:border-[#00a2c7]"
            />
          </div>

          {/* Stores List */}
          {isLoading ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#00a2c7]" />
              <span>Loading referred merchant network...</span>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="p-12 text-center border-2 border-dashed border-slate-800 rounded-3xl space-y-2">
              <Store className="w-8 h-8 mx-auto text-slate-600" />
              <h4 className="font-bold text-white text-sm">No Merchants Found in this Filter</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Share your referral code <strong>{agentCode}</strong> with retail shop owners to earn dynamic commissions!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStores.map((shop) => {
                const whatsappText = encodeURIComponent(
                  `Namaste ${shop.owner_name} ji,\nThis is ${agent.name} (Shoppy ERP Partner).\nReminder regarding your store *${shop.name}* (Code: ${shop.shop_code}).\nSubscription validity: ${shop.valid_until}.\nPlease renew your package to continue seamless billing & online store service:\n${window.location.origin}/?renew=${shop.shop_code}`
                );

                return (
                  <div
                    key={shop.id}
                    className={`p-5 rounded-3xl border transition space-y-3.5 relative overflow-hidden ${
                      shop.is_expired
                        ? 'bg-rose-950/20 border-rose-900/60 hover:border-rose-700'
                        : shop.is_expiring_soon
                        ? 'bg-amber-950/20 border-amber-900/60 hover:border-amber-700'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Row: Store Name & Status Badges */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-sm text-white">{shop.name}</h3>
                          <span className="font-mono text-[10px] font-black text-[#00a2c7] bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-800/80">
                            {shop.shop_code}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {shop.city}
                        </span>
                      </div>

                      {/* Expiry Pill */}
                      {shop.is_expired ? (
                        <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-black uppercase flex items-center gap-1 shrink-0">
                          <AlertTriangle className="w-3 h-3" />
                          EXPIRED
                        </span>
                      ) : shop.is_expiring_soon ? (
                        <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black uppercase flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3" />
                          {shop.days_remaining} DAYS LEFT
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-black uppercase flex items-center gap-1 shrink-0">
                          <CheckCircle2 className="w-3 h-3" />
                          ACTIVE
                        </span>
                      )}
                    </div>

                    {/* Customer & Address Details */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800/80 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Customer / Owner:</span>
                        <span className="font-bold text-white">{shop.owner_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Contact Phone:</span>
                        <span className="font-bold text-slate-200 font-mono">{shop.owner_phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Full Address:</span>
                        <span className="text-slate-300 text-right truncate max-w-[200px]" title={shop.address}>
                          {shop.address}
                        </span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400 font-medium">Plan Package:</span>
                        <span className="font-semibold text-cyan-300">{shop.plan_name} ({shop.billing_cycle})</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-medium">Validity Ends:</span>
                        <span className={`font-bold font-mono ${shop.is_expired ? 'text-rose-400' : 'text-slate-200'}`}>
                          {shop.valid_until}
                        </span>
                      </div>

                      {/* Payment Pending / Dues */}
                      {shop.due_amount > 0 && (
                        <div className="flex justify-between text-rose-400 font-bold pt-1 border-t border-slate-800">
                          <span>Pending Payment Due:</span>
                          <span className="font-mono">₹ {shop.due_amount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions: Direct WhatsApp & Call */}
                    <div className="flex items-center gap-2 pt-1">
                      <a
                        href={`https://wa.me/91${shop.owner_phone.replace(/[^0-9]/g, '')}?text=${whatsappText}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Renewal Alert</span>
                      </a>

                      <a
                        href={`tel:${shop.owner_phone}`}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                        title="Call Customer"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. COMMISSION & WALLET LEDGER TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-black text-white tracking-tight flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Wallet Commission Ledger & Payout History</span>
              </h2>
              <p className="text-xs text-slate-400">
                Detailed transaction breakdown of all onboarding bonuses, renewal shares, and performance rewards.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Total Payouts Settled</span>
              <span className="font-mono font-black text-sm text-emerald-400">
                ₹ {metrics.total_payouts_processed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Client / Shop Name</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3 text-right">Sale / Gross</th>
                  <th className="pb-3 text-right">TDS (5%)</th>
                  <th className="pb-3 text-right">Net Credited</th>
                  <th className="pb-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {dashboardData?.commissions?.length > 0 ? (
                  dashboardData.commissions.map((comm) => (
                    <tr key={comm.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 font-mono text-slate-400">{comm.created_at}</td>
                      <td className="py-3 font-bold text-white">
                        {comm.shop_name}
                        {comm.shop_code !== 'N/A' && (
                          <span className="font-mono text-[10px] text-slate-500 ml-1.5 font-normal">
                            ({comm.shop_code})
                          </span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-cyan-300">
                          {comm.commission_type}
                        </span>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300">
                        ₹ {comm.gross_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right font-mono text-rose-400">
                        - ₹ {comm.tds_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-right font-mono font-black text-emerald-400">
                        + ₹ {comm.net_payable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {comm.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      No commission records yet. Refer stores to start earning!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Official Agent ID Card Modal */}
      <AgentIdCardModal
        isOpen={isIdCardOpen}
        onClose={() => setIsIdCardOpen(false)}
        agent={agent}
      />
    </div>
  );
}

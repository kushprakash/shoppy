import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Award,
  TrendingUp,
  CheckCircle2,
  Gift,
  Printer,
  Plus,
  Search,
  RotateCw,
  RefreshCw,
  Edit3,
  X,
  Check,
  Calendar,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
  FileBarChart2
} from 'lucide-react';
import AgentIdCardModal from './AgentIdCardModal';
import AgentRewardModal from './AgentRewardModal';
import AgentCreateModal from './AgentCreateModal';
import AgentBusinessReportModal from './AgentBusinessReportModal';
import {
  formatCurrencyINR as formatCurrency,
  formatLocalYMD,
  downloadCsvFile
} from './agentReportUtils';

const getPresetDateRange = (preset) => {
  const now = new Date();
  const today = formatLocalYMD(now);

  if (preset === 'today') {
    return { from: today, to: today };
  }
  if (preset === 'week') {
    const start = new Date(now);
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
    return { from: formatLocalYMD(start), to: today };
  }
  if (preset === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: formatLocalYMD(start), to: today };
  }
  if (preset === 'last30') {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    return { from: formatLocalYMD(start), to: today };
  }
  return { from: '', to: '' };
};

const exportAgentsCsv = (agents, stats, dateLabel, isDateFiltered) => {
  const headers = [
    'Rank',
    'Agent Code',
    'Agent Name',
    'Phone',
    'City',
    'Status',
    'Commission %',
    'Signup Bonus (INR)',
    'Period Stores Referred',
    'All-Time Stores',
    'Active Stores',
    'Expired Stores',
    'Business Driven (INR)',
    'Gateway Paid (INR)',
    'Paid Txns',
    'Manual Plan Value (INR)',
    'Total Net Earned (INR)',
    'Commission Earned (INR)',
    'Rewards Earned (INR)',
    'Pending Commissions (INR)',
    'Report Period'
  ];

  const rows = agents.map((ag, idx) => [
    idx + 1,
    ag.agent_code,
    ag.name,
    ag.phone,
    ag.city || '',
    ag.status,
    ag.commission_rate_percent,
    ag.fixed_signup_bonus,
    isDateFiltered ? (ag.referred_stores_in_range ?? ag.total_referred_stores) : ag.total_referred_stores,
    ag.total_referred_stores,
    ag.active_stores,
    ag.expired_stores,
    ag.total_sales_driven,
    ag.paid_business_driven ?? 0,
    ag.paid_transactions_count ?? 0,
    ag.manual_plan_business ?? 0,
    ag.total_earned,
    ag.commission_earned ?? ag.total_earned,
    ag.reward_earned ?? 0,
    ag.pending_commissions,
    dateLabel
  ]);

  const totalBusiness = agents.reduce((acc, a) => acc + Number(a.total_sales_driven || 0), 0);
  const totalEarned = agents.reduce((acc, a) => acc + Number(a.total_earned || 0), 0);
  rows.push([
    '',
    'TOTAL',
    `${agents.length} Agents`,
    '',
    '',
    '',
    '',
    '',
    isDateFiltered ? (stats.referred_stores_in_range ?? 0) : stats.total_referred_stores,
    stats.total_referred_stores,
    '',
    '',
    totalBusiness.toFixed(2),
    agents.reduce((acc, a) => acc + Number(a.paid_business_driven || 0), 0).toFixed(2),
    agents.reduce((acc, a) => acc + Number(a.paid_transactions_count || 0), 0),
    agents.reduce((acc, a) => acc + Number(a.manual_plan_business || 0), 0).toFixed(2),
    totalEarned.toFixed(2),
    '',
    '',
    agents.reduce((acc, a) => acc + Number(a.pending_commissions || 0), 0).toFixed(2),
    dateLabel
  ]);

  downloadCsvFile(`agent-business-report-${formatLocalYMD(new Date())}.csv`, headers, rows);
};

export default function SuperAdminAgentsTab() {
  const [agentsData, setAgentsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Date range & business report sorting state
  const [fromDateInput, setFromDateInput] = useState('');
  const [toDateInput, setToDateInput] = useState('');
  const [appliedRange, setAppliedRange] = useState({ from: '', to: '', preset: 'all' });
  const [sortBy, setSortBy] = useState('business_desc');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAgentForCard, setSelectedAgentForCard] = useState(null);
  const [selectedAgentForReward, setSelectedAgentForReward] = useState(null);
  const [selectedAgentForReport, setSelectedAgentForReport] = useState(null);

  // Edit Dynamic Commission Rate Modal
  const [editingAgent, setEditingAgent] = useState(null);
  const [newCommissionRate, setNewCommissionRate] = useState('10.00');
  const [newSignupBonus, setNewSignupBonus] = useState('500.00');
  const [newStatus, setNewStatus] = useState('approved');
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);
  const [updateToast, setUpdateToast] = useState(null);

  const fetchAgents = useCallback(async (fromVal = appliedRange.from, toVal = appliedRange.to, sortVal = sortBy) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (fromVal) params.set('from_date', fromVal);
      if (toVal) params.set('to_date', toVal);
      if (sortVal) params.set('sort_by', sortVal);
      const query = params.toString();

      const res = await fetch(`/api/master/agents${query ? `?${query}` : ''}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setAgentsData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [appliedRange.from, appliedRange.to, sortBy]);

  useEffect(() => {
    fetchAgents(appliedRange.from, appliedRange.to, sortBy);
  }, [appliedRange.from, appliedRange.to]);

  const handleSelectPreset = (preset) => {
    const { from, to } = getPresetDateRange(preset);
    setFromDateInput(from);
    setToDateInput(to);
    setAppliedRange({ from, to, preset });
  };

  const handleApplyDateFilter = (e) => {
    e.preventDefault();
    let f = fromDateInput;
    let t = toDateInput;
    if (f && t && f > t) {
      [f, t] = [t, f];
      setFromDateInput(f);
      setToDateInput(t);
    }
    setAppliedRange({ from: f, to: t, preset: f || t ? 'custom' : 'all' });
  };

  const handleResetDateFilter = () => {
    setFromDateInput('');
    setToDateInput('');
    setAppliedRange({ from: '', to: '', preset: 'all' });
  };

  const handleOpenEdit = (ag) => {
    setEditingAgent(ag);
    setNewCommissionRate(ag.commission_rate_percent.toString());
    setNewSignupBonus((ag.fixed_signup_bonus || 500).toString());
    setNewStatus(ag.status);
  };

  const handleSaveAgentUpdate = async (e) => {
    e.preventDefault();
    if (!editingAgent) return;
    setIsUpdatingRate(true);

    try {
      const res = await fetch(`/api/master/agents/${editingAgent.id}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          commission_rate_percent: parseFloat(newCommissionRate),
          fixed_signup_bonus: parseFloat(newSignupBonus),
          status: newStatus
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUpdateToast(`Updated ${editingAgent.name}: Commission rate is now ${newCommissionRate}%!`);
        setTimeout(() => setUpdateToast(null), 3500);
        setEditingAgent(null);
        fetchAgents(appliedRange.from, appliedRange.to, sortBy);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingRate(false);
    }
  };

  const isDateFiltered = Boolean(appliedRange.from || appliedRange.to);

  const filteredAgents = useMemo(() => {
    if (!agentsData || !agentsData.agents) return [];
    let list = [...agentsData.agents];

    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.agent_code.toLowerCase().includes(q) ||
          (a.phone && a.phone.includes(q)) ||
          (a.city && a.city.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      const storesA = isDateFiltered ? Number(a.referred_stores_in_range ?? 0) : Number(a.total_referred_stores || 0);
      const storesB = isDateFiltered ? Number(b.referred_stores_in_range ?? 0) : Number(b.total_referred_stores || 0);

      switch (sortBy) {
        case 'business_asc':
          return (
            Number(a.total_sales_driven || 0) - Number(b.total_sales_driven || 0) ||
            Number(a.total_earned || 0) - Number(b.total_earned || 0) ||
            b.id - a.id
          );
        case 'commission_desc':
          return (
            Number(b.total_earned || 0) - Number(a.total_earned || 0) ||
            Number(b.total_sales_driven || 0) - Number(a.total_sales_driven || 0) ||
            b.id - a.id
          );
        case 'commission_asc':
          return (
            Number(a.total_earned || 0) - Number(b.total_earned || 0) ||
            Number(a.total_sales_driven || 0) - Number(b.total_sales_driven || 0) ||
            b.id - a.id
          );
        case 'stores_desc':
          return storesB - storesA || Number(b.total_sales_driven || 0) - Number(a.total_sales_driven || 0);
        case 'stores_asc':
          return storesA - storesB || Number(a.total_sales_driven || 0) - Number(b.total_sales_driven || 0);
        case 'newest':
          return b.id - a.id;
        case 'business_desc':
        default:
          return (
            Number(b.total_sales_driven || 0) - Number(a.total_sales_driven || 0) ||
            Number(b.total_earned || 0) - Number(a.total_earned || 0) ||
            b.id - a.id
          );
      }
    });

    return list;
  }, [agentsData, statusFilter, searchQuery, sortBy, isDateFiltered]);

  const stats = agentsData?.statistics || {
    total_agents: 0,
    active_agents: 0,
    total_referred_stores: 0,
    referred_stores_in_range: 0,
    total_business_driven: 0,
    paid_business_driven: 0,
    paid_transactions_count: 0,
    total_commissions_distributed: 0,
    total_pending_commissions: 0,
    average_commission_rate: 10.0,
  };

  const maxBusiness = useMemo(
    () => Math.max(1, ...filteredAgents.map((a) => Number(a.total_sales_driven || 0))),
    [filteredAgents]
  );

  const visibleTotals = useMemo(
    () =>
      filteredAgents.reduce(
        (acc, ag) => {
          acc.storesPeriod += isDateFiltered ? Number(ag.referred_stores_in_range ?? 0) : Number(ag.total_referred_stores || 0);
          acc.storesAll += Number(ag.total_referred_stores || 0);
          acc.business += Number(ag.total_sales_driven || 0);
          acc.paidBusiness += Number(ag.paid_business_driven || 0);
          acc.paidTxns += Number(ag.paid_transactions_count || 0);
          acc.earned += Number(ag.total_earned || 0);
          return acc;
        },
        { storesPeriod: 0, storesAll: 0, business: 0, paidBusiness: 0, paidTxns: 0, earned: 0 }
      ),
    [filteredAgents, isDateFiltered]
  );

  const activeDateLabel = isDateFiltered
    ? `${appliedRange.from || 'Start'} → ${appliedRange.to || 'Today'}`
    : 'All Time';

  const toggleColumnSort = (descKey, ascKey) => {
    setSortBy((prev) => (prev === descKey ? ascKey : descKey));
  };

  const renderSortIcon = (descKey, ascKey) => {
    if (sortBy === descKey) return <ArrowDown className="w-3 h-3 text-[#00a2c7]" />;
    if (sortBy === ascKey) return <ArrowUp className="w-3 h-3 text-[#00a2c7]" />;
    return <ArrowUpDown className="w-3 h-3 opacity-45" />;
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Toast Notification */}
      {updateToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{updateToast}</span>
          </div>
          <button onClick={() => setUpdateToast(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#008ba3] to-[#10b981] flex items-center justify-center text-white shadow-md shadow-cyan-600/20 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Partner Agents Network & Commission Control
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-cyan-50 dark:bg-cyan-950/60 text-[#008ba3] dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 inline-flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {activeDateLabel}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Date-range business analytics, High-to-Low / Low-to-High agent ranking, commission tracking & I-Cards.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => exportAgentsCsv(filteredAgents, stats, activeDateLabel, isDateFiltered)}
            disabled={isLoading || filteredAgents.length === 0}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-extrabold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer transition"
            title="Export Sorted Agent Business Report as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => fetchAgents(appliedRange.from, appliedRange.to, sortBy)}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Refresh Network Stats"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00a2c7]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-black shadow-md shadow-cyan-600/25 flex items-center gap-2 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Agent</span>
          </button>
        </div>
      </div>

      {/* 1. TOTAL AGENT BUSINESS & PERFORMANCE STATISTICS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Business Driven */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-cyan-200/80 dark:border-cyan-900/60 shadow-xs space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#008ba3] dark:text-cyan-400 flex items-center justify-between">
            <span>Business Driven</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </span>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            ₹ {formatCurrency(stats.total_business_driven)}
          </div>
          <span className="text-[10px] text-slate-500 block">
            ₹{formatCurrency(stats.paid_business_driven, 0)} Verified • {stats.paid_transactions_count || 0} Txns
          </span>
        </div>

        {/* Total Agents */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Total Partner Agents
          </span>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {stats.total_agents}
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
            {stats.active_agents} Active • Avg {stats.average_commission_rate}%
          </span>
        </div>

        {/* Total Referred Stores */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            {isDateFiltered ? 'Period Referred Stores' : 'Total Stores Referred'}
          </span>
          <div className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400">
            {isDateFiltered ? stats.referred_stores_in_range : stats.total_referred_stores} Stores
          </div>
          <span className="text-[10px] text-slate-400 block">
            {isDateFiltered ? `Out of ${stats.total_referred_stores} All-Time Stores` : 'Active isolated tenant DBs'}
          </span>
        </div>

        {/* Total Distributed Commissions */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Earned Commissions
          </span>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            ₹ {formatCurrency(stats.total_commissions_distributed)}
          </div>
          <span className="text-[10px] text-emerald-500 block">
            Net credited ({isDateFiltered ? 'In range' : 'All time'})
          </span>
        </div>

        {/* Total Pending Commissions */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Pending Commissions
          </span>
          <div className="text-2xl font-black font-mono text-amber-500">
            ₹ {formatCurrency(stats.total_pending_commissions)}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Awaiting clearance / audit
          </span>
        </div>
      </div>

      {/* 2. AGENTS BUSINESS & REPORT TABLE + DATE RANGE / HIGH-LOW WORKBENCH */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Date Range Filter & Ranking Bar */}
        <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/70 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
          {/* Presets + Date Picker */}
          <form onSubmit={handleApplyDateFilter} className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-600 dark:text-slate-300 mr-1">
              <Calendar className="w-3.5 h-3.5 text-[#00a2c7]" />
              <span>Report Period:</span>
            </div>

            {[
              { id: 'all', label: 'All Time' },
              { id: 'today', label: 'Today' },
              { id: 'week', label: 'This Week' },
              { id: 'month', label: 'This Month' },
              { id: 'last30', label: 'Last 30 Days' }
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase transition cursor-pointer ${
                  appliedRange.preset === p.id
                    ? 'bg-[#00a2c7] text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-[#00a2c7]'
                }`}
              >
                {p.label}
              </button>
            ))}

            <div className="flex items-center gap-1.5 ml-0 sm:ml-1">
              <input
                type="date"
                value={fromDateInput}
                onChange={(e) => setFromDateInput(e.target.value)}
                aria-label="From Date"
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00a2c7]"
              />
              <span className="text-[11px] font-bold text-slate-400">to</span>
              <input
                type="date"
                value={toDateInput}
                onChange={(e) => setToDateInput(e.target.value)}
                aria-label="To Date"
                className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00a2c7]"
              />
              <button
                type="submit"
                className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-[#00a2c7] hover:bg-slate-800 dark:hover:bg-[#008ba3] text-white text-[11px] font-extrabold cursor-pointer transition"
              >
                Apply
              </button>
              {(isDateFiltered || fromDateInput || toDateInput) && (
                <button
                  type="button"
                  onClick={handleResetDateFilter}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-500 text-[11px] font-bold cursor-pointer transition"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* High to Low / Low to High Business Ranking Controls */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] font-extrabold text-slate-500 inline-flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#00a2c7]" />
              <span>Ranking:</span>
            </span>

            <div className="inline-flex rounded-xl bg-white dark:bg-slate-900 p-0.5 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setSortBy('business_desc')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black inline-flex items-center gap-1 cursor-pointer transition ${
                  sortBy === 'business_desc'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <ArrowDown className="w-3 h-3" />
                <span>High → Low</span>
              </button>
              <button
                type="button"
                onClick={() => setSortBy('business_asc')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black inline-flex items-center gap-1 cursor-pointer transition ${
                  sortBy === 'business_asc'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <ArrowUp className="w-3 h-3" />
                <span>Low → High</span>
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort Agent Report"
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00a2c7]"
            >
              <option value="business_desc">Business: High to Low</option>
              <option value="business_asc">Business: Low to High</option>
              <option value="commission_desc">Earned Commission: High to Low</option>
              <option value="commission_asc">Earned Commission: Low to High</option>
              <option value="stores_desc">Referred Stores: High to Low</option>
              <option value="stores_asc">Referred Stores: Low to High</option>
              <option value="newest">Newest Joined First</option>
            </select>
          </div>
        </div>

        {/* Search & Status Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search agent name, Agent Code, phone, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:border-[#00a2c7]"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            <span className="text-slate-400 font-bold text-[11px]">Status:</span>
            {['all', 'approved', 'pending', 'blocked'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg font-bold uppercase text-[10px] transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#00a2c7] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                <th className="pb-3 pr-2 w-10">Rank</th>
                <th className="pb-3 pr-3">Agent Profile & Code</th>
                <th className="pb-3 pr-3">Contact & City</th>
                <th className="pb-3 px-2 text-center">Commission %</th>
                <th className="pb-3 px-2 text-center">
                  <button
                    type="button"
                    onClick={() => toggleColumnSort('stores_desc', 'stores_asc')}
                    className="inline-flex items-center gap-1 uppercase hover:text-slate-700 dark:hover:text-white cursor-pointer"
                  >
                    <span>Stores {isDateFiltered ? '(Period/Total)' : '(Active/Exp)'}</span>
                    {renderSortIcon('stores_desc', 'stores_asc')}
                  </button>
                </th>
                <th className="pb-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleColumnSort('business_desc', 'business_asc')}
                    className="inline-flex items-center gap-1 uppercase hover:text-slate-700 dark:hover:text-white cursor-pointer ml-auto"
                  >
                    <span>Business Driven</span>
                    {renderSortIcon('business_desc', 'business_asc')}
                  </button>
                </th>
                <th className="pb-3 px-3 text-right">
                  <button
                    type="button"
                    onClick={() => toggleColumnSort('commission_desc', 'commission_asc')}
                    className="inline-flex items-center gap-1 uppercase hover:text-slate-700 dark:hover:text-white cursor-pointer ml-auto"
                  >
                    <span>Total Earned</span>
                    {renderSortIcon('commission_desc', 'commission_asc')}
                  </button>
                </th>
                <th className="pb-3 px-2 text-center">Status</th>
                <th className="pb-3 pl-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredAgents.length > 0 ? (
                filteredAgents.map((ag, idx) => {
                  const sharePct = Math.min(100, Math.round((Number(ag.total_sales_driven || 0) / maxBusiness) * 100));
                  const rankNum = idx + 1;
                  const rankBadgeClass =
                    rankNum === 1 && ag.total_sales_driven > 0
                      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                      : rankNum === 2 && ag.total_sales_driven > 0
                      ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
                      : rankNum === 3 && ag.total_sales_driven > 0
                      ? 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800'
                      : 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700';

                  return (
                    <tr key={ag.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      {/* Rank */}
                      <td className="py-3 pr-2">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg border font-mono text-[11px] font-black ${rankBadgeClass}`}>
                          #{rankNum}
                        </span>
                      </td>

                      {/* Agent Profile & Code */}
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={ag.photo}
                            alt={ag.name}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {ag.name}
                            </span>
                            <span className="font-mono text-[10px] font-black text-[#00a2c7] bg-cyan-50 dark:bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-200 dark:border-cyan-800 inline-block mt-0.5">
                              {ag.agent_code}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact & City */}
                      <td className="py-3 pr-3 text-[11px]">
                        <div className="font-mono font-bold text-slate-700 dark:text-slate-300">{ag.phone}</div>
                        <div className="text-slate-400 truncate max-w-[140px]">{ag.city || 'Jaipur'}</div>
                      </td>

                      {/* Dynamic Commission Rate % */}
                      <td className="py-3 px-2 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/80">
                          <span className="font-mono font-black text-[#008ba3] dark:text-cyan-400">
                            {ag.commission_rate_percent}%
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ag)}
                            className="text-slate-400 hover:text-cyan-600 transition"
                            title="Change Commission %"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          + ₹{ag.fixed_signup_bonus} bonus
                        </span>
                      </td>

                      {/* Stores Count */}
                      <td className="py-3 px-2 text-center">
                        <div className="font-bold font-mono text-slate-900 dark:text-white">
                          {isDateFiltered
                            ? `${ag.referred_stores_in_range ?? 0} / ${ag.total_referred_stores}`
                            : ag.total_referred_stores}
                        </div>
                        <span className="text-[9px] text-slate-400 block">
                          <span className="text-emerald-500 font-bold">{ag.active_stores} active</span>
                          {ag.expired_stores > 0 && <span className="text-rose-500 font-bold"> • {ag.expired_stores} exp</span>}
                        </span>
                      </td>

                      {/* Business Driven */}
                      <td className="py-3 px-3 text-right min-w-[155px]">
                        <div className="font-mono font-black text-slate-900 dark:text-white">
                          ₹ {formatCurrency(ag.total_sales_driven)}
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#00a2c7] to-emerald-500 transition-all duration-300"
                            style={{ width: `${ag.total_sales_driven > 0 ? Math.max(6, sharePct) : 0}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          {Number(ag.paid_business_driven || 0) > 0
                            ? `₹${formatCurrency(ag.paid_business_driven, 0)} paid (${ag.paid_transactions_count || 0} txns)`
                            : Number(ag.manual_plan_business || 0) > 0
                            ? 'Plan Value (Manual)'
                            : '0 Txns in period'}
                        </span>
                      </td>

                      {/* Total Earned */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-mono font-black text-emerald-600 dark:text-emerald-400">
                          ₹ {formatCurrency(ag.total_earned)}
                        </div>
                        {(Number(ag.reward_earned || 0) > 0 || Number(ag.pending_commissions || 0) > 0) && (
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            {Number(ag.reward_earned || 0) > 0 ? `Bonus ₹${formatCurrency(ag.reward_earned, 0)}` : ''}
                            {Number(ag.reward_earned || 0) > 0 && Number(ag.pending_commissions || 0) > 0 ? ' • ' : ''}
                            {Number(ag.pending_commissions || 0) > 0 ? `Pend ₹${formatCurrency(ag.pending_commissions, 0)}` : ''}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            ag.status === 'approved' || ag.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                              : ag.status === 'pending'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400'
                          }`}
                        >
                          {ag.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 pl-2 text-right space-x-1 whitespace-nowrap">
                        {/* Detailed Business Report */}
                        <button
                          type="button"
                          onClick={() => setSelectedAgentForReport(ag)}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                          title="View Agent-Wise Store & Payment Report"
                        >
                          <FileBarChart2 className="w-3 h-3" />
                          <span>Report</span>
                        </button>

                        {/* Reward Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedAgentForReward(ag)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                          title="Award Bonus / Reward"
                        >
                          <Gift className="w-3 h-3 text-amber-600" />
                          <span>Reward</span>
                        </button>

                        {/* View I-Card Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedAgentForCard(ag)}
                          className="px-2.5 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 hover:bg-cyan-100 text-[#008ba3] dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/80 text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                          title="View Official I-Card"
                        >
                          <Printer className="w-3 h-3" />
                          <span>I-Card</span>
                        </button>

                        {/* Edit Details */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(ag)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition inline-block cursor-pointer"
                          title="Edit Commission & Status"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 text-xs">
                    {isLoading
                      ? 'Loading agent business & commission metrics...'
                      : 'No partner agents match current query or date filter.'}
                  </td>
                </tr>
              )}
            </tbody>
            {filteredAgents.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/40 font-black text-xs">
                  <td colSpan={4} className="py-3 px-2 text-slate-600 dark:text-slate-300 uppercase text-[10px] tracking-wider">
                    Report Total ({filteredAgents.length} Agents • {activeDateLabel})
                  </td>
                  <td className="py-3 px-2 text-center font-mono text-slate-900 dark:text-white">
                    {isDateFiltered ? `${visibleTotals.storesPeriod} / ${visibleTotals.storesAll}` : visibleTotals.storesAll}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-900 dark:text-white">
                    <div>₹ {formatCurrency(visibleTotals.business)}</div>
                    <span className="text-[9px] font-semibold text-slate-400">
                      ₹{formatCurrency(visibleTotals.paidBusiness, 0)} Verified ({visibleTotals.paidTxns} Txns)
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                    ₹ {formatCurrency(visibleTotals.earned)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* 3. MODAL: EDIT DYNAMIC COMMISSION RATE & STATUS */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Update Agent Commission & Tier
                </h3>
                <p className="text-xs text-slate-500">
                  {editingAgent.name} ({editingAgent.agent_code})
                </p>
              </div>
              <button
                onClick={() => setEditingAgent(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAgentUpdate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dynamic Commission Percentage (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    required
                    value={newCommissionRate}
                    onChange={(e) => setNewCommissionRate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-sm focus:outline-none focus:border-[#00a2c7]"
                  />
                  <span className="absolute right-3.5 top-2.5 font-bold text-slate-400">%</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Takes effect immediately for all upcoming sales & subscription renewals.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fixed Signup Bonus (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={newSignupBonus}
                    onChange={(e) => setNewSignupBonus(e.target.value)}
                    className="w-full pl-7 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-[#00a2c7]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Agent Network Status *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00a2c7]"
                >
                  <option value="approved">Approved & Active</option>
                  <option value="pending">Pending Verification</option>
                  <option value="blocked">Blocked / Inactive</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdatingRate}
                  className="w-full py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-cyan-600/25"
                >
                  {isUpdatingRate ? <RotateCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Dynamic Commission Rate</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <AgentCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAgentCreated={(newAg) => {
          setUpdateToast(`Agent ${newAg.name} registered! Agent Code: ${newAg.agent_code}`);
          setTimeout(() => setUpdateToast(null), 4000);
          fetchAgents(appliedRange.from, appliedRange.to, sortBy);
          setSelectedAgentForCard(newAg);
        }}
      />

      <AgentRewardModal
        isOpen={!!selectedAgentForReward}
        onClose={() => setSelectedAgentForReward(null)}
        agent={selectedAgentForReward}
        onRewardAdded={(res) => {
          setUpdateToast(`Bonus of ₹${res.reward.gross_amount} credited to ${res.reward.agent_code}!`);
          setTimeout(() => setUpdateToast(null), 4000);
          fetchAgents(appliedRange.from, appliedRange.to, sortBy);
        }}
      />

      <AgentIdCardModal
        isOpen={!!selectedAgentForCard}
        onClose={() => setSelectedAgentForCard(null)}
        agent={selectedAgentForCard}
      />

      <AgentBusinessReportModal
        isOpen={!!selectedAgentForReport}
        onClose={() => setSelectedAgentForReport(null)}
        agent={selectedAgentForReport}
        fromDate={appliedRange.from}
        toDate={appliedRange.to}
      />
    </div>
  );
}

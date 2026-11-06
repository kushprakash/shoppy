import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Award,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Gift,
  Printer,
  Sparkles,
  Percent,
  Plus,
  Search,
  Filter,
  RotateCw,
  RefreshCw,
  Edit3,
  X,
  Check,
  ShieldCheck,
  Building2
} from 'lucide-react';
import AgentIdCardModal from './AgentIdCardModal';
import AgentRewardModal from './AgentRewardModal';
import AgentCreateModal from './AgentCreateModal';

export default function SuperAdminAgentsTab() {
  const [agentsData, setAgentsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAgentForCard, setSelectedAgentForCard] = useState(null);
  const [selectedAgentForReward, setSelectedAgentForReward] = useState(null);

  // Edit Dynamic Commission Rate Modal
  const [editingAgent, setEditingAgent] = useState(null);
  const [newCommissionRate, setNewCommissionRate] = useState('10.00');
  const [newSignupBonus, setNewSignupBonus] = useState('500.00');
  const [newStatus, setNewStatus] = useState('approved');
  const [isUpdatingRate, setIsUpdatingRate] = useState(false);
  const [updateToast, setUpdateToast] = useState(null);

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/master/agents');
      const data = await res.json();
      if (res.ok && data.success) {
        setAgentsData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

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
        fetchAgents();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdatingRate(false);
    }
  };

  const filteredAgents = useMemo(() => {
    if (!agentsData || !agentsData.agents) return [];
    let list = agentsData.agents;

    if (statusFilter !== 'all') {
      list = list.filter((a) => a.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.agent_code.toLowerCase().includes(q) ||
          a.phone.includes(q) ||
          (a.city && a.city.toLowerCase().includes(q))
      );
    }

    return list;
  }, [agentsData, statusFilter, searchQuery]);

  const stats = agentsData?.statistics || {
    total_agents: 0,
    active_agents: 0,
    total_referred_stores: 0,
    total_commissions_distributed: 0,
    total_pending_commissions: 0,
    average_commission_rate: 10.0,
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Toast Notification */}
      {updateToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{updateToast}</span>
          </div>
          <button onClick={() => setUpdateToast(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TOP HEADER & ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#008ba3] to-[#10b981] flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                Partner Agents Network & Commission Control
              </h1>
              <p className="text-xs text-slate-500">
                Manage dynamic commission %, issue official I-Cards, audit performance, and award cash bonuses.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={fetchAgents}
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

      {/* 1. TOTAL AGENT INCOME & PERFORMANCE STATISTICS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Agents */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Total Partner Agents
          </span>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
            {stats.total_agents}
          </div>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
            {stats.active_agents} Active Field Agents
          </span>
        </div>

        {/* Total Referred Stores */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Total Stores Referred
          </span>
          <div className="text-2xl font-black font-mono text-cyan-600 dark:text-cyan-400">
            {stats.total_referred_stores} Stores
          </div>
          <span className="text-[10px] text-slate-400 block">
            Active isolated tenant DBs
          </span>
        </div>

        {/* Total Distributed Commissions */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Total Commissions Paid
          </span>
          <div className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            ₹ {stats.total_commissions_distributed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-emerald-500 block">
            Auto-credited on PayU success
          </span>
        </div>

        {/* Total Pending Commissions */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Pending Commissions
          </span>
          <div className="text-2xl font-black font-mono text-amber-500">
            ₹ {stats.total_pending_commissions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-400 block">
            Awaiting clearance / audit
          </span>
        </div>

        {/* Average Commission Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Average Commission
          </span>
          <div className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">
            {stats.average_commission_rate}%
          </div>
          <span className="text-[10px] text-slate-400 block">
            Dynamic per agent tier
          </span>
        </div>
      </div>

      {/* 2. AGENTS PERFORMANCE REPORT TABLE & ACTION WORKBENCH */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        {/* Search & Filter Toolbar */}
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
                <th className="pb-3">Agent Profile & Code</th>
                <th className="pb-3">Contact & City</th>
                <th className="pb-3 text-center">Dynamic Commission %</th>
                <th className="pb-3 text-center">Stores (Active/Exp)</th>
                <th className="pb-3 text-right">Revenue Driven</th>
                <th className="pb-3 text-right">Total Earned</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {filteredAgents.length > 0 ? (
                filteredAgents.map((ag) => (
                  <tr key={ag.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    {/* Agent Profile & Code */}
                    <td className="py-3">
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
                    <td className="py-3 text-[11px]">
                      <div className="font-mono font-bold text-slate-700 dark:text-slate-300">{ag.phone}</div>
                      <div className="text-slate-400 truncate max-w-[140px]">{ag.city || 'Jaipur'}</div>
                    </td>

                    {/* Dynamic Commission Rate % */}
                    <td className="py-3 text-center">
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
                    <td className="py-3 text-center">
                      <div className="font-bold font-mono text-slate-900 dark:text-white">
                        {ag.total_referred_stores}
                      </div>
                      <span className="text-[9px] text-slate-400 block">
                        <span className="text-emerald-500 font-bold">{ag.active_stores} active</span>
                        {ag.expired_stores > 0 && <span className="text-rose-500 font-bold"> • {ag.expired_stores} exp</span>}
                      </span>
                    </td>

                    {/* Revenue Driven */}
                    <td className="py-3 text-right font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹ {ag.total_sales_driven.toLocaleString('en-IN')}
                    </td>

                    {/* Total Earned */}
                    <td className="py-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                      ₹ {ag.total_earned.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>

                    {/* Status */}
                    <td className="py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        ag.status === 'approved' || ag.status === 'active'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400'
                          : ag.status === 'pending'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400'
                      }`}>
                        {ag.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 text-right space-x-1 whitespace-nowrap">
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
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500 text-xs">
                    No partner agents match current query. Click "Register New Agent" to onboard!
                  </td>
                </tr>
              )}
            </tbody>
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
          fetchAgents();
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
          fetchAgents();
        }}
      />

      <AgentIdCardModal
        isOpen={!!selectedAgentForCard}
        onClose={() => setSelectedAgentForCard(null)}
        agent={selectedAgentForCard}
      />
    </div>
  );
}

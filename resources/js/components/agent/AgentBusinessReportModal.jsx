import React, { useEffect, useState } from 'react';
import {
  X,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  Building2,
  CreditCard,
  Award,
  Wallet,
  RotateCw,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { formatCurrencyINR as formatINR, downloadCsvFile as downloadCsv } from './agentReportUtils';

export default function AgentBusinessReportModal({ isOpen, onClose, agent, fromDate, toDate }) {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('stores');

  useEffect(() => {
    if (!isOpen || !agent?.id) return;

    let cancelled = false;
    const loadReport = async () => {
      setIsLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (fromDate) params.set('from_date', fromDate);
        if (toDate) params.set('to_date', toDate);
        const query = params.toString();
        const url = `/api/master/agents/${agent.id}/report${query ? `?${query}` : ''}`;

        const res = await fetch(url);
        const data = await res.json();
        if (!cancelled) {
          if (res.ok && data.success) {
            setReport(data);
          } else {
            setError(data.message || 'Unable to load agent business report.');
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError('Network error while loading agent business report.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadReport();
    return () => {
      cancelled = true;
    };
  }, [isOpen, agent?.id, fromDate, toDate]);

  if (!isOpen || !agent) return null;

  const summary = report?.summary || {};
  const stores = report?.stores || [];
  const payments = report?.payments || [];
  const commissions = report?.commissions || [];
  const dateLabel = fromDate || toDate ? `${fromDate || 'Beginning'} to ${toDate || 'Today'}` : 'All Time';

  const handleExportAgentCsv = () => {
    if (!report) return;
    const headers = [
      'Agent Code',
      'Agent Name',
      'Date Range',
      'Store Code',
      'Store Name',
      'Owner Name',
      'Owner Phone',
      'Plan Name',
      'Billing Cycle',
      'Referred At',
      'In Selected Range',
      'Validity Status',
      'Gateway Paid (INR)',
      'Paid Txns',
      'Manual Plan Value (INR)',
      'Total Business Driven (INR)'
    ];

    const rows = stores.map((st) => [
      report.agent?.agent_code || agent.agent_code,
      report.agent?.name || agent.name,
      dateLabel,
      st.shop_code,
      st.name,
      st.owner_name,
      st.owner_phone,
      st.plan_name,
      st.billing_cycle,
      st.referred_at,
      st.referred_in_range ? 'Yes' : 'No',
      st.validity_status,
      st.paid_business_in_range,
      st.paid_txns_in_range,
      st.manual_plan_value,
      st.total_business_in_range
    ]);

    downloadCsv(
      `agent-business-report-${(agent.agent_code || 'agent').toLowerCase()}-${fromDate || 'all'}-${toDate || 'all'}.csv`,
      headers,
      rows
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-900">
          <div className="flex items-center gap-3.5">
            <img
              src={agent.photo}
              alt={agent.name}
              className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {agent.name} — Business Report
                </h2>
                <span className="font-mono text-[10px] font-black text-[#008ba3] dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-lg border border-cyan-200 dark:border-cyan-800">
                  {agent.agent_code}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-[#00a2c7]" />
                  {dateLabel}
                </span>
                <span>•</span>
                <span>{agent.city || 'Jaipur'}</span>
                <span>•</span>
                <span>Commission: {agent.commission_rate_percent}% + ₹{agent.fixed_signup_bonus}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={handleExportAgentCsv}
              disabled={!report || isLoading}
              className="px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-slate-500 text-xs">
              <RotateCw className="w-6 h-6 animate-spin text-[#00a2c7]" />
              <span>Calculating agent business, payments & commissions...</span>
            </div>
          ) : error ? (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold">
              {error}
            </div>
          ) : (
            <>
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-2xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-900/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#008ba3] dark:text-cyan-400 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Business Driven
                  </span>
                  <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
                    ₹ {formatINR(summary.total_business_driven)}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Paid: ₹{formatINR(summary.paid_business_driven, 0)}
                    {summary.manual_plan_business > 0 ? ` • Plan Est: ₹${formatINR(summary.manual_plan_business, 0)}` : ''}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <CreditCard className="w-3 h-3" /> Verified Gateway Sales
                  </span>
                  <div className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                    ₹ {formatINR(summary.paid_business_driven)}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {summary.paid_transactions_count || 0} Completed Txns in period
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Referred Stores
                  </span>
                  <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
                    {fromDate || toDate
                      ? `${summary.referred_stores_in_range || 0} / ${summary.all_time_referred_stores || 0}`
                      : `${summary.all_time_referred_stores || 0} Stores`}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    {fromDate || toDate ? 'Period New / All-Time Total' : 'Total Stores Onboarded'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Earned (Net Payable)
                  </span>
                  <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                    ₹ {formatINR(summary.total_earned)}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Gross: ₹{formatINR(summary.gross_earned, 0)} • TDS: ₹{formatINR(summary.tds_deducted, 0)}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Wallet className="w-3 h-3" /> Wallet / Pending
                  </span>
                  <div className="text-xl font-black font-mono text-amber-500">
                    ₹ {formatINR(summary.available_wallet_balance)}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Pending: ₹{formatINR(summary.pending_commissions)} • Paid Out: ₹{formatINR(summary.all_time_payouts_processed, 0)}
                  </span>
                </div>
              </div>

              {/* Drilldown Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                {[
                  { id: 'stores', label: `Store-Wise Business (${stores.length})` },
                  { id: 'payments', label: `Paid Transactions (${payments.length})` },
                  { id: 'commissions', label: `Commissions & Rewards (${commissions.length})` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-[#00a2c7] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'stores' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                        <th className="pb-2.5 pr-3">Store & Code</th>
                        <th className="pb-2.5 pr-3">Owner & City</th>
                        <th className="pb-2.5 pr-3">Plan & Cycle</th>
                        <th className="pb-2.5 pr-3">Onboarded</th>
                        <th className="pb-2.5 pr-3 text-center">Validity</th>
                        <th className="pb-2.5 pr-3 text-right">Gateway Paid</th>
                        <th className="pb-2.5 text-right">Business (Selected Range)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {stores.length > 0 ? (
                        stores.map((st) => (
                          <tr key={st.shop_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 pr-3">
                              <div className="font-bold text-slate-900 dark:text-white">{st.name}</div>
                              <div className="font-mono text-[10px] text-[#008ba3] dark:text-cyan-400 font-bold">
                                {st.shop_code}
                              </div>
                            </td>
                            <td className="py-2.5 pr-3 text-[11px]">
                              <div className="font-semibold text-slate-700 dark:text-slate-300">{st.owner_name}</div>
                              <div className="text-slate-400">{st.owner_phone} • {st.city}</div>
                            </td>
                            <td className="py-2.5 pr-3">
                              <div className="font-semibold text-slate-700 dark:text-slate-300">{st.plan_name}</div>
                              <div className="text-[10px] uppercase text-slate-400">{st.billing_cycle}</div>
                            </td>
                            <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                              <div>{st.referred_at}</div>
                              {(fromDate || toDate) && (
                                <span
                                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    st.referred_in_range
                                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                  }`}
                                >
                                  {st.referred_in_range ? 'New in Range' : 'Prior Cohort'}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 pr-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 ${
                                  st.validity_status === 'active'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400'
                                    : st.validity_status === 'expiring_soon'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400'
                                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-400'
                                }`}
                              >
                                {st.validity_status === 'active' && <CheckCircle2 className="w-3 h-3" />}
                                {st.validity_status === 'expiring_soon' && <Clock className="w-3 h-3" />}
                                {st.validity_status === 'expired' && <AlertTriangle className="w-3 h-3" />}
                                <span>{st.validity_status.replace('_', ' ')}</span>
                              </span>
                            </td>
                            <td className="py-2.5 pr-3 text-right font-mono">
                              <div className="font-bold text-slate-700 dark:text-slate-300">
                                ₹ {formatINR(st.paid_business_in_range)}
                              </div>
                              <div className="text-[10px] text-slate-400">{st.paid_txns_in_range} txns</div>
                            </td>
                            <td className="py-2.5 text-right font-mono">
                              <div className="font-black text-slate-900 dark:text-white">
                                ₹ {formatINR(st.total_business_in_range)}
                              </div>
                              {st.manual_plan_value > 0 && st.paid_business_in_range === 0 && (
                                <div className="text-[9px] text-cyan-600 dark:text-cyan-400">Plan Est. (Manual)</div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No referred stores recorded under this agent yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                        <th className="pb-2.5 pr-3">Date & Time</th>
                        <th className="pb-2.5 pr-3">Store</th>
                        <th className="pb-2.5 pr-3">Gateway & Method</th>
                        <th className="pb-2.5 pr-3">Transaction ID</th>
                        <th className="pb-2.5 pr-3 text-center">Status</th>
                        <th className="pb-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {payments.length > 0 ? (
                        payments.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-500">{p.created_at}</td>
                            <td className="py-2.5 pr-3">
                              <div className="font-bold text-slate-900 dark:text-white">{p.shop_name}</div>
                              <div className="font-mono text-[10px] text-slate-400">{p.shop_code}</div>
                            </td>
                            <td className="py-2.5 pr-3 uppercase text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                              {p.gateway} • {p.payment_method}
                            </td>
                            <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-500">{p.transaction_id}</td>
                            <td className="py-2.5 pr-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400">
                                {p.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-right font-mono font-black text-slate-900 dark:text-white">
                              ₹ {formatINR(p.amount)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No completed subscription payments in this date range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'commissions' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                        <th className="pb-2.5 pr-3">Date & Time</th>
                        <th className="pb-2.5 pr-3">Type</th>
                        <th className="pb-2.5 pr-3">Store / Milestone</th>
                        <th className="pb-2.5 pr-3 text-right">Gross (₹)</th>
                        <th className="pb-2.5 pr-3 text-right">TDS (₹)</th>
                        <th className="pb-2.5 pr-3 text-right">Net Payable (₹)</th>
                        <th className="pb-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {commissions.length > 0 ? (
                        commissions.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-500">{c.created_at}</td>
                            <td className="py-2.5 pr-3">
                              <span
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                                  c.commission_type === 'reward'
                                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                                    : c.commission_type === 'renewal'
                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300'
                                    : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/70 dark:text-cyan-300'
                                }`}
                              >
                                {c.commission_type}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3">
                              <div className="font-bold text-slate-900 dark:text-white">{c.shop_name}</div>
                              <div className="font-mono text-[10px] text-slate-400">{c.shop_code}</div>
                            </td>
                            <td className="py-2.5 pr-3 text-right font-mono text-slate-600 dark:text-slate-300">
                              ₹ {formatINR(c.commission_amount)}
                            </td>
                            <td className="py-2.5 pr-3 text-right font-mono text-rose-500">
                              - ₹ {formatINR(c.tds_amount)}
                            </td>
                            <td className="py-2.5 pr-3 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                              ₹ {formatINR(c.net_payable)}
                            </td>
                            <td className="py-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  c.status === 'approved' || c.status === 'paid'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No commission or reward entries in this date range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

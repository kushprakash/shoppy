import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  IndianRupee,
  Calendar,
  Printer,
  Download,
  AlertCircle,
  CheckCircle,
  Building,
  Receipt,
  ShoppingBag,
  CreditCard,
  Percent,
  FileText,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

export default function ProfitLossStatement() {
  const navigate = useNavigate();
  const { orders, expenses, payroll, getProfitLossAnalytics } = useErp();

  const [dateFilter, setDateFilter] = useState('ALL'); // 'ALL' | 'THIS_MONTH' | 'THIS_YEAR'

  // Filter orders and expenses based on dateFilter
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentYearStr = `${now.getFullYear()}`;

  const filteredOrders = orders.filter((o) => {
    if (dateFilter === 'THIS_MONTH') {
      return (o.date || '').includes('2026') || (o.date || '').includes(currentMonthStr);
    }
    return true;
  });

  const filteredExpenses = expenses.filter((e) => {
    if (dateFilter === 'THIS_MONTH') {
      return (e.date || '').startsWith(currentMonthStr) || (e.date || '').includes('2026-10');
    }
    return true;
  });

  // Calculate Financials
  // 1. Revenue
  const offlineSalesRevenue = filteredOrders
    .filter((o) => (o.channelType || '') === 'offline' || !(o.channelType || ''))
    .reduce((acc, o) => acc + (parseFloat(o.total) || 0), 0);

  const onlineSalesRevenue = filteredOrders
    .filter((o) => (o.channelType || '') === 'online')
    .reduce((acc, o) => acc + (parseFloat(o.total) || 0), 0);

  const quotationConvertedRevenue = filteredOrders
    .filter((o) => (o.channel || '').includes('Quotation') || (o.notes || '').includes('Quotation'))
    .reduce((acc, o) => acc + (parseFloat(o.total) || 0), 0);

  const totalSalesRevenue = filteredOrders.reduce((acc, o) => acc + (parseFloat(o.total) || 0), 0);

  // 2. Cost of Goods Sold (COGS)
  const totalCogs = filteredOrders.reduce((acc, o) => acc + (parseFloat(o.costTotal) || 0), 0);

  // 3. Gross Profit
  const grossProfit = totalSalesRevenue - totalCogs;
  const grossMarginPercent = totalSalesRevenue > 0 ? ((grossProfit / totalSalesRevenue) * 100).toFixed(2) : '0.00';

  // 4. Operating Expenses
  const salariesExpense = filteredExpenses
    .filter((e) => (e.category || '').toLowerCase().includes('salary'))
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

  const rentExpense = filteredExpenses
    .filter((e) => (e.category || '').toLowerCase().includes('rent'))
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

  const utilitiesExpense = filteredExpenses
    .filter((e) => (e.category || '').toLowerCase().includes('electric') || (e.category || '').toLowerCase().includes('utilities'))
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

  const packagingExpense = filteredExpenses
    .filter((e) => (e.category || '').toLowerCase().includes('packag'))
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

  const marketingExpense = filteredExpenses
    .filter((e) => (e.category || '').toLowerCase().includes('market'))
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

  const courierShippingCharges = filteredOrders.reduce((acc, o) => acc + (parseFloat(o.shippingCharge) || 0), 0);

  const teaWelfareExpense = filteredExpenses
    .filter((e) => (e.category || '').toLowerCase().includes('tea') || (e.category || '').toLowerCase().includes('refresh'))
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

  const otherExpenses = filteredExpenses
    .filter((e) => {
      const cat = (e.category || '').toLowerCase();
      return !cat.includes('salary') && !cat.includes('rent') && !cat.includes('electric') &&
             !cat.includes('packag') && !cat.includes('market') && !cat.includes('tea');
    })
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);

  const totalOperatingExpenses =
    salariesExpense +
    rentExpense +
    utilitiesExpense +
    packagingExpense +
    marketingExpense +
    courierShippingCharges +
    teaWelfareExpense +
    otherExpenses;

  // 5. Net Profit / (Net Loss)
  const netProfit = grossProfit - totalOperatingExpenses;
  const netMarginPercent = totalSalesRevenue > 0 ? ((netProfit / totalSalesRevenue) * 100).toFixed(2) : '0.00';
  const isProfitable = netProfit >= 0;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Financial Statement of Profit & Loss (P&L)
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-channel revenue turnover, inventory cost of goods sold (COGS), staff payroll, overhead expenses, and bottom-line Net Profit.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setDateFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('THIS_MONTH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                dateFilter === 'THIS_MONTH'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              October 2026
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-slate-300 dark:border-slate-700"
          >
            <Printer className="w-4 h-4" />
            Print P&L Statement
          </button>
        </div>
      </div>

      {/* Main Bottom-Line Health Banner */}
      <div
        className={`p-6 rounded-2xl border shadow-sm transition-all ${
          isProfitable
            ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-500/30 dark:border-emerald-500/20'
            : 'bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/30 dark:border-rose-500/20'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-2xl ${
                isProfitable
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              }`}
            >
              {isProfitable ? <TrendingUp className="w-8 h-8" /> : <TrendingDown className="w-8 h-8" />}
            </div>

            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isProfitable
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                }`}
              >
                {isProfitable ? '✓ Net Profitable Operation' : '⚠ Operating in Net Loss'}
              </span>

              <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                {isProfitable ? '+' : ''}₹{netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bottom-line Net Margin: <strong>{netMarginPercent}%</strong> of Gross Turnover
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block">Gross Profit Margin:</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">{grossMarginPercent}%</span>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-slate-500 block">Total Overhead Burn:</span>
              <span className="text-base font-bold text-rose-600 dark:text-rose-400">
                ₹{totalOperatingExpenses.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars Financial KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Turnover */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">I. Total Revenue</span>
            <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ₹{totalSalesRevenue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">{filteredOrders.length} Invoices & Dispatches</p>
        </div>

        {/* COGS */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">II. Cost of Goods (COGS)</span>
            <span className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ₹{totalCogs.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">Direct inventory purchase cost</p>
        </div>

        {/* Gross Profit */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">III. Gross Profit</span>
            <span className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{grossProfit.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">{grossMarginPercent}% Gross Margin</p>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">IV. Operating Expenses</span>
            <span className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-2">
            ₹{totalOperatingExpenses.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">Salaries, Rent & Overheads</p>
        </div>
      </div>

      {/* Formal Audit-Ready P&L Statement Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">
              Statement of Profit and Loss (Standard Accounting Format)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Prepared for Ramesh Fashion ERP • Currency: INR (₹)
            </p>
          </div>
          <span className="font-mono text-xs text-slate-400">
            {dateFilter === 'ALL' ? 'Cumulative (All Records)' : 'FY 2026-27'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                <th className="py-3 px-6">Particulars / Line Item</th>
                <th className="py-3 px-6 text-right">Schedule / Sub-total (₹)</th>
                <th className="py-3 px-6 text-right">Net Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {/* SECTION I: REVENUE */}
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-slate-900 dark:text-white">
                <td className="py-3 px-6" colSpan={2}>
                  I. REVENUE FROM OPERATIONS (GROSS SALES TURNOVER)
                </td>
                <td className="py-3 px-6 text-right font-black text-emerald-600 dark:text-emerald-400">
                  ₹{totalSalesRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="text-xs text-slate-600 dark:text-slate-400">
                <td className="py-2 px-8">1. POS Offline Fast Billing Sales</td>
                <td className="py-2 px-6 text-right font-mono">₹{offlineSalesRevenue.toLocaleString('en-IN')}</td>
                <td className="py-2 px-6 text-right"></td>
              </tr>
              <tr className="text-xs text-slate-600 dark:text-slate-400">
                <td className="py-2 px-8">2. Online E-Commerce & Shiprocket Dispatches</td>
                <td className="py-2 px-6 text-right font-mono">₹{onlineSalesRevenue.toLocaleString('en-IN')}</td>
                <td className="py-2 px-6 text-right"></td>
              </tr>
              <tr className="text-xs text-slate-600 dark:text-slate-400">
                <td className="py-2 px-8">3. Converted Quotation B2B Orders</td>
                <td className="py-2 px-6 text-right font-mono">₹{quotationConvertedRevenue.toLocaleString('en-IN')}</td>
                <td className="py-2 px-6 text-right"></td>
              </tr>

              {/* SECTION II: COGS */}
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-slate-900 dark:text-white">
                <td className="py-3 px-6" colSpan={2}>
                  II. LESS: COST OF GOODS SOLD (DIRECT INVENTORY PURCHASE COST)
                </td>
                <td className="py-3 px-6 text-right font-mono text-rose-600 dark:text-rose-400">
                  -₹{totalCogs.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
              <tr className="text-xs text-slate-600 dark:text-slate-400">
                <td className="py-2 px-8">Purchase Cost of Finished Goods Sold</td>
                <td className="py-2 px-6 text-right font-mono">₹{totalCogs.toLocaleString('en-IN')}</td>
                <td className="py-2 px-6 text-right"></td>
              </tr>

              {/* SECTION III: GROSS PROFIT */}
              <tr className="bg-emerald-500/10 font-bold text-emerald-900 dark:text-emerald-200 border-y border-emerald-500/30">
                <td className="py-3 px-6 text-base">
                  III. GROSS PROFIT (I - II)
                </td>
                <td className="py-3 px-6 text-right text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  Margin: {grossMarginPercent}%
                </td>
                <td className="py-3 px-6 text-right font-black text-emerald-600 dark:text-emerald-400 text-base">
                  ₹{grossProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              {/* SECTION IV: OPERATING EXPENSES */}
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-bold text-slate-900 dark:text-white">
                <td className="py-3 px-6" colSpan={2}>
                  IV. INDIRECT OPERATING EXPENSES & OVERHEADS
                </td>
                <td className="py-3 px-6 text-right font-mono text-rose-600 dark:text-rose-400">
                  -₹{totalOperatingExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>

              <tr className="text-xs text-slate-600 dark:text-slate-400">
                <td className="py-2 px-8 flex items-center gap-2">
                  <span>•</span> Staff Salaries & Employee Wages (HRM Payroll)
                </td>
                <td className="py-2 px-6 text-right font-mono">₹{salariesExpense.toLocaleString('en-IN')}</td>
                <td className="py-2 px-6 text-right"></td>
              </tr>

              <tr className="text-xs text-slate-600 dark:text-slate-400">
                <td className="py-2 px-8 flex items-center gap-2">
                  <span>•</span> Showroom Retail Rent
                </td>
                <td className="py-2 px-6 text-right font-mono">₹{rentExpense.toLocaleString('en-IN')}</td>
                <td className="py-2 px-6 text-right"></td>
              </tr>

              <tr className="text-xs text-slate-600 dark:text-slate-400">
                <td className="py-2 px-8 flex items-center gap-2">
                  <span>•</span> Electricity, Power & Utilities
                </td>
                <td className="py-2 px-6 text-right font-mono">₹{utilitiesExpense.toLocaleString('en-IN')}</td>
                <td className="py-2 px-6 text-right"></td>
              </tr>

              <tr className="text-xs text-slate-600 dark:text-slate-400">
                <td className="py-2 px-8 flex items-center gap-2">
                  <span>•</span> Courier Logistics & Shiprocket Shipping Charges
                </td>
                <td className="py-2 px-6 text-right font-mono">₹{courierShippingCharges.toLocaleString('en-IN')}</td>
                <td className="py-2 px-6 text-right"></td>
              </tr>

              <tr className="text-xs text-slate-600 dark:text-slate-400">
                <td className="py-2 px-8 flex items-center gap-2">
                  <span>•</span> Packaging Bags, Corrugated Boxes & Tags
                </td>
                <td className="py-2 px-6 text-right font-mono">₹{packagingExpense.toLocaleString('en-IN')}</td>
                <td className="py-2 px-6 text-right"></td>
              </tr>

              <tr className="text-xs text-slate-600 dark:text-slate-400">
                <td className="py-2 px-8 flex items-center gap-2">
                  <span>•</span> Marketing, Leaflet Distribution & Social Ads
                </td>
                <td className="py-2 px-6 text-right font-mono">₹{marketingExpense.toLocaleString('en-IN')}</td>
                <td className="py-2 px-6 text-right"></td>
              </tr>

              <tr className="text-xs text-slate-600 dark:text-slate-400">
                <td className="py-2 px-8 flex items-center gap-2">
                  <span>•</span> Tea, Refreshments & Customer Hospitality
                </td>
                <td className="py-2 px-6 text-right font-mono">₹{teaWelfareExpense.toLocaleString('en-IN')}</td>
                <td className="py-2 px-6 text-right"></td>
              </tr>

              <tr className="text-xs text-slate-600 dark:text-slate-400">
                <td className="py-2 px-8 flex items-center gap-2">
                  <span>•</span> Office Repairs, Maintenance & Misc Overheads
                </td>
                <td className="py-2 px-6 text-right font-mono">₹{otherExpenses.toLocaleString('en-IN')}</td>
                <td className="py-2 px-6 text-right"></td>
              </tr>

              {/* SECTION V: NET PROFIT / (NET LOSS) */}
              <tr
                className={`font-black text-lg border-t-2 ${
                  isProfitable
                    ? 'bg-emerald-500/15 text-emerald-950 dark:text-emerald-100 border-emerald-500'
                    : 'bg-rose-500/15 text-rose-950 dark:text-rose-100 border-rose-500'
                }`}
              >
                <td className="py-4 px-6">
                  V. NET PROFIT / (NET LOSS) (III - IV)
                </td>
                <td className="py-4 px-6 text-right text-xs font-bold uppercase tracking-wider">
                  {isProfitable ? 'Net Profit' : 'Net Loss'} ({netMarginPercent}%)
                </td>
                <td
                  className={`py-4 px-6 text-right text-xl font-black ${
                    isProfitable ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isProfitable ? '+' : ''}₹{netProfit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

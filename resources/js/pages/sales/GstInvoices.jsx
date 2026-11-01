import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Receipt, FileSpreadsheet, Printer, ShieldCheck } from 'lucide-react';

export default function GstInvoices() {
  const { orders, setSelectedInvoice, showToast } = useErp();
  const [filterType, setFilterType] = useState('pakka'); // 'all', 'pakka', 'kachha'

  // Filter orders
  const displayOrders = orders.filter((o) => {
    if (filterType === 'pakka') return (o.billType || 'pakka') === 'pakka';
    if (filterType === 'kachha') return (o.billType || 'pakka') === 'kachha';
    return true;
  });

  const totalGst = displayOrders.reduce((acc, curr) => acc + (curr.gstTotal || 0), 0);
  const totalTaxable = displayOrders.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Taxable Sales Turnover</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹ {totalTaxable.toFixed(2)}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">GSTR-1 Outward taxable turnover value</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total GST Output Tax</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹ {totalGst.toFixed(2)}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">CGST: ₹ {(totalGst / 2).toFixed(2)} + SGST: ₹ {(totalGst / 2).toFixed(2)}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">GSTR-1 JSON Export</p>
            <p className="text-xs text-slate-400 mt-1">NIC portal & CA-ready return export format</p>
          </div>
          <button
            onClick={() => showToast('GSTR-1 JSON generated and downloaded!')}
            className="w-full mt-2 py-1.5 rounded-lg bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export GSTR-1 File
          </button>
        </div>
      </div>

      {/* Tax Invoices Register Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Tax Invoices Register</h3>
            
            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
              <button
                onClick={() => setFilterType('pakka')}
                className={`px-2.5 py-1 rounded font-bold transition ${
                  filterType === 'pakka' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Pakka (GST Only)
              </button>
              <button
                onClick={() => setFilterType('kachha')}
                className={`px-2.5 py-1 rounded font-bold transition ${
                  filterType === 'kachha' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Kachha (Estimates)
              </button>
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded font-bold transition ${
                  filterType === 'all' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All
              </button>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Tax Register
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Invoice Number / Date</th>
                <th className="px-4 py-3">Customer & GSTIN</th>
                <th className="px-4 py-3">Channel Flag</th>
                <th className="px-4 py-3">Bill Type</th>
                <th className="px-4 py-3">Taxable Value</th>
                <th className="px-4 py-3">CGST</th>
                <th className="px-4 py-3">SGST</th>
                <th className="px-4 py-3">Total Invoice</th>
                <th className="px-4 py-3 text-right">E-Invoice & Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayOrders.map((o) => {
                const isOffline = (o.channelType || 'offline') === 'offline' || (o.channel || '').toLowerCase().includes('pos');
                const isPakka = (o.billType || 'pakka') === 'pakka';

                return (
                  <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{o.id}</div>
                      <div className="text-[10px] text-slate-400">{o.date}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{o.customerName}</div>
                      <div className="text-[10px] text-slate-400">URP (B2C) • {o.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isOffline 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' 
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                      }`}>
                        {isOffline ? 'Offline (POS)' : 'Online (E-Com)'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isPakka
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}>
                        {isPakka ? 'Pakka (GST)' : 'Kachha'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-mono">
                      ₹ {o.subtotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      ₹ {(o.gstTotal / 2).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      ₹ {(o.gstTotal / 2).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                      ₹ {o.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedInvoice(o)}
                        className="px-2.5 py-1 rounded bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7] font-bold text-[11px] border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition"
                      >
                        Print 3-in-1
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

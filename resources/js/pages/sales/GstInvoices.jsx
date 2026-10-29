import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Receipt, FileSpreadsheet, Printer } from 'lucide-react';

export default function GstInvoices() {
  const { orders, setSelectedInvoice, showToast } = useErp();

  const totalGst = orders.reduce((acc, curr) => acc + curr.gstTotal, 0);
  const totalTaxable = orders.reduce((acc, curr) => acc + curr.subtotal, 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Taxable Sales Turnover</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹ {totalTaxable.toFixed(2)}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">GSTR-1 Outward taxable value</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total GST Output Tax</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹ {totalGst.toFixed(2)}</h3>
          <p className="text-[10px] text-slate-400 mt-0.5">CGST: ₹ {(totalGst / 2).toFixed(2)} + SGST: ₹ {(totalGst / 2).toFixed(2)}</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">GSTR-1 JSON Export</p>
            <p className="text-xs text-slate-400 mt-1">CA-ready return export format</p>
          </div>
          <button
            onClick={() => showToast('GSTR-1 JSON exported successfully!')}
            className="w-full mt-2 py-1.5 rounded-lg bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export GSTR-1 File
          </button>
        </div>
      </div>

      {/* Tax Invoices Register Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900 dark:text-white">GST Invoices Tax Register</h3>
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Tax Register
          </button>
        </div>

        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 font-semibold uppercase">
            <tr>
              <th className="px-4 py-3">Invoice Number</th>
              <th className="px-4 py-3">Customer & GSTIN</th>
              <th className="px-4 py-3">HSN Code</th>
              <th className="px-4 py-3">Taxable Value</th>
              <th className="px-4 py-3">CGST</th>
              <th className="px-4 py-3">SGST</th>
              <th className="px-4 py-3">Total Invoice</th>
              <th className="px-4 py-3 text-right">E-Invoice IRN</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                <td className="px-4 py-3 font-mono font-bold text-slate-900 dark:text-white">{o.id}</td>
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-800 dark:text-slate-200">{o.customerName}</div>
                  <div className="text-[10px] text-slate-400">URP (B2C)</div>
                </td>
                <td className="px-4 py-3 font-mono text-slate-500">6205, 0405</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">₹ {o.subtotal.toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-500">₹ {(o.gstTotal / 2).toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-500">₹ {(o.gstTotal / 2).toFixed(2)}</td>
                <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">₹ {o.total.toFixed(2)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setSelectedInvoice(o)}
                    className="px-2.5 py-1 rounded bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7] font-bold text-[11px] border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 transition"
                  >
                    View IRN & QR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

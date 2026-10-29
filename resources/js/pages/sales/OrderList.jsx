import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { Search, Printer, FileText, Check } from 'lucide-react';

export default function OrderList() {
  const { orders, setSelectedInvoice } = useErp();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [orders, search]);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Orders & Receipts Directory</h2>
          <p className="text-xs text-slate-500">Live feed from counter POS billing and online storefront checkouts.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Order ID, Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
            />
          </div>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 font-semibold uppercase">
            <tr>
              <th className="px-4 py-3">Order / Date</th>
              <th className="px-4 py-3">Customer Details</th>
              <th className="px-4 py-3">Payment Channel</th>
              <th className="px-4 py-3">Subtotal</th>
              <th className="px-4 py-3">GST Tax</th>
              <th className="px-4 py-3">Grand Total</th>
              <th className="px-4 py-3">Fulfillment Status</th>
              <th className="px-4 py-3 text-right">View / Print</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                <td className="px-4 py-3">
                  <div className="font-mono font-bold text-slate-900 dark:text-white">{o.id}</div>
                  <div className="text-[10px] text-slate-400">{o.date}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-800 dark:text-slate-200">{o.customerName}</div>
                  <div className="text-[10px] text-slate-400">{o.phone}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{o.paymentMethod}</span>
                  <div className="text-[10px] text-slate-400">{o.channel}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">₹ {o.subtotal.toFixed(2)}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">₹ {o.gstTotal.toFixed(2)}</td>
                <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹ {o.total.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7] border border-cyan-200 dark:border-cyan-800">
                    {o.fulfillment}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => setSelectedInvoice(o)}
                    className="px-3 py-1.5 rounded-lg bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-[11px] shadow-xs transition inline-flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> Tax Invoice
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

import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Users, Send, ShoppingCart } from 'lucide-react';

export default function CustomerList() {
  const { customers, showToast } = useErp();

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Customer Master & CRM Directory</h2>
          <p className="text-xs text-slate-500">Track repeat walk-in shoppers, loyalty wallets, and B2B clients.</p>
        </div>
        <button
          onClick={() => showToast('Customer contact book synchronized!')}
          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          Sync Mobile Contacts
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 font-semibold uppercase">
            <tr>
              <th className="px-4 py-3">Customer ID / Name</th>
              <th className="px-4 py-3">Phone & Email</th>
              <th className="px-4 py-3">City</th>
              <th className="px-4 py-3">Customer Tier</th>
              <th className="px-4 py-3">Total Orders</th>
              <th className="px-4 py-3">Lifetime Spend</th>
              <th className="px-4 py-3">Loyalty Points</th>
              <th className="px-4 py-3 text-right">Quick Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                <td className="px-4 py-3">
                  <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                  <div className="font-mono text-slate-400 text-[10px]">{c.id}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-800 dark:text-slate-200 font-medium">{c.mobile}</div>
                  <div className="text-[10px] text-slate-400">{c.email}</div>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.city}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7]">
                    {c.category}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">{c.totalOrders} Orders</td>
                <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                  ₹ {c.lifetimeSpend.toFixed(2)}
                </td>
                <td className="px-4 py-3 font-bold text-indigo-600">{c.loyaltyPoints} Pts</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => showToast(`WhatsApp Bill Link sent to ${c.mobile}`)}
                    className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-100 font-bold text-[11px] transition inline-flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> WhatsApp
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

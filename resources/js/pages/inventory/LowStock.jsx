import React from 'react';
import { useErp } from '../../context/ErpContext';
import { AlertCircle, ShoppingCart } from 'lucide-react';

export default function LowStock() {
  const { products, showToast } = useErp();

  const lowStockItems = products.filter((p) => p.stock <= p.reorderLevel);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Low Stock & Reorder Alerts</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            SKUs that have reached minimum threshold levels and require urgent purchase reorders.
          </p>
        </div>
        <button
          onClick={() => showToast('Master PO batch drafted for all low stock items!')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
        >
          <ShoppingCart className="w-4 h-4" /> Generate Auto PO for All
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 font-semibold uppercase">
            <tr>
              <th className="px-4 py-3">SKU / Item Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Branch Location</th>
              <th className="px-4 py-3">Current Stock</th>
              <th className="px-4 py-3">Reorder Threshold</th>
              <th className="px-4 py-3">Recommended Order</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {lowStockItems.map((p) => {
              const suggested = p.reorderLevel * 3 - p.stock;
              return (
                <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                    <div className="font-mono text-slate-400">{p.sku}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{p.branch}</td>
                  <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400 text-sm">
                    {p.stock} {p.unit}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 font-semibold">{p.reorderLevel} {p.unit}</td>
                  <td className="px-4 py-3 font-bold text-[#00a2c7]">{suggested} {p.unit}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => showToast(`PO Draft generated for ${p.name}`)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition"
                    >
                      Draft Supplier PO
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

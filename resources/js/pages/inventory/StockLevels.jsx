import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Warehouse, Plus, AlertCircle } from 'lucide-react';

export default function StockLevels() {
  const { branches, products, setIsStockAdjustmentOpen } = useErp();

  return (
    <div className="space-y-6">
      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {branches.map((b) => (
          <div key={b.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7] flex items-center justify-center font-bold">
                <Warehouse className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                Active Branch
              </span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{b.name}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Code: {b.code} • City: {b.city}</p>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Total SKUs:</span>
              <span className="text-slate-900 dark:text-white font-bold">{b.skus} Items</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Till Counter:</span>
              <span className="text-[#00a2c7]">{b.activeTill}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Stock Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Warehouse Inventory Breakdown</h3>
            <p className="text-xs text-slate-500">Track on-hand units across branches and fulfillment hubs</p>
          </div>
          <button
            onClick={() => setIsStockAdjustmentOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-[#00a2c7] hover:bg-[#008ba3] text-xs font-bold text-white shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Record Stock Inward / Adjustment
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-3 py-2.5">Product SKU</th>
                <th className="px-3 py-2.5">Item Name</th>
                <th className="px-3 py-2.5">Branch Location</th>
                <th className="px-3 py-2.5">Unit</th>
                <th className="px-3 py-2.5">Available Stock</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="px-3 py-3 font-mono font-bold text-slate-800 dark:text-slate-200">{p.sku}</td>
                  <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">{p.name}</td>
                  <td className="px-3 py-3 text-slate-500">{p.branch}</td>
                  <td className="px-3 py-3 uppercase text-slate-400">{p.unit}</td>
                  <td className="px-3 py-3 font-bold text-slate-900 dark:text-white text-sm">{p.stock}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        p.stock > 10
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : p.stock > 0
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useErp } from '../../context/ErpContext';
import { Warehouse, Save, ChevronLeft } from 'lucide-react';

export default function StockAdjustment() {
  const navigate = useNavigate();
  const { products, setProducts, showToast } = useErp();

  const [form, setForm] = useState({
    productId: products[0]?.id || '',
    type: 'Inward Purchase',
    quantity: 10,
    branch: 'Main Branch (Downtown)',
    notes: 'Warehouse delivery stock inward'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(form.quantity) || 0;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === form.productId) {
          const newStock = form.type.includes('Inward') || form.type.includes('Return')
            ? p.stock + qty
            : Math.max(0, p.stock - qty);
          return {
            ...p,
            stock: newStock,
            status: newStock > 10 ? 'In Stock' : newStock > 0 ? 'Low Stock' : 'Out of Stock'
          };
        }
        return p;
      })
    );
    showToast(`Stock updated: ${form.type} (${form.quantity} units)`);
    navigate('/shop-admin/inventory');
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Record Stock In / Out Movement</h2>
            <p className="text-xs text-slate-500">Record purchases, returns, damages or inter-branch transfers.</p>
          </div>
          <button
            onClick={() => navigate('/shop-admin/inventory')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Select Product *</label>
            <select
              value={form.productId}
              onChange={(e) => setForm({ ...form, productId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Current: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Movement Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="Inward Purchase">Inward Purchase (+)</option>
                <option value="Customer Return">Customer Return (+)</option>
                <option value="Damaged Stock">Damaged / Expired (-)</option>
                <option value="Audit Loss">Audit Shortage (-)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Quantity *</label>
              <input
                type="number"
                required
                min="1"
                value={form.quantity}
                onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Branch Location</label>
            <select
              value={form.branch}
              onChange={(e) => setForm({ ...form, branch: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
            >
              <option value="Main Branch (Downtown)">Main Branch (Downtown)</option>
              <option value="Outlet #2 (Mall Road)">Outlet #2 (Mall Road)</option>
              <option value="Central Warehouse">Central Warehouse & Hub</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notes / Invoice Ref</label>
            <textarea
              rows="2"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="e.g. Received via Delivery Challan #88190"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/shop-admin/inventory')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Stock Movement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useErp } from '../../context/ErpContext';
import { Plus, ChevronLeft, ArrowRight, Save } from 'lucide-react';

export default function AddProduct() {
  const navigate = useNavigate();
  const { addProduct, products } = useErp();

  const [form, setForm] = useState({
    name: '',
    category: 'Fashion & Apparel',
    businessCategory: 'fashion',
    sku: '',
    barcode: '',
    purchasePrice: '',
    sellingPrice: '',
    mrp: '',
    gstRate: '5',
    hsnCode: '',
    unit: 'pcs',
    stock: '',
    branch: 'Main Branch (Downtown)',
    metaAttribute: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.sellingPrice) return;

    const nextId = `PRD-${100 + products.length + 1}`;
    const generatedSku = form.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`;
    const generatedBarcode = form.barcode || `890123400${products.length + 10}`;

    const newEntry = {
      id: nextId,
      name: form.name,
      category: form.category,
      businessCategory: form.businessCategory,
      sku: generatedSku,
      barcode: generatedBarcode,
      purchasePrice: parseFloat(form.purchasePrice) || 0,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      mrp: parseFloat(form.mrp) || parseFloat(form.sellingPrice) * 1.25,
      gstRate: parseFloat(form.gstRate) || 0,
      hsnCode: form.hsnCode || '6205',
      unit: form.unit || 'pcs',
      stock: parseInt(form.stock) || 20,
      reorderLevel: 10,
      branch: form.branch || 'Main Branch (Downtown)',
      status: parseInt(form.stock) > 10 ? 'In Stock' : 'Low Stock'
    };

    addProduct(newEntry);
    navigate('/shop-admin/products');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Create New Master SKU</h2>
            <p className="text-xs text-slate-500">Add product details, tax classification, and branch stock.</p>
          </div>
          <button
            onClick={() => navigate('/shop-admin/products')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" /> Back to List
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Product Title / Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Classic Embroidered Linen Kurta"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-[#00a2c7]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="Fashion & Apparel">Fashion & Apparel</option>
                <option value="Grocery & Supermarket">Grocery & Supermarket</option>
                <option value="Electronics & Gadgets">Electronics & Gadgets</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Unit of Measure</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="pcs">Pieces (Pcs)</option>
                <option value="pack">Pack</option>
                <option value="tin">Tin</option>
                <option value="kg">Kilogram (Kg)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Cost Price (₹)</label>
              <input
                type="number"
                placeholder="650"
                value={form.purchasePrice}
                onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Selling Price (₹) *</label>
              <input
                type="number"
                required
                placeholder="1299"
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none font-bold text-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">MRP (₹)</label>
              <input
                type="number"
                placeholder="1999"
                value={form.mrp}
                onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">GST Tax Slab</label>
              <select
                value={form.gstRate}
                onChange={(e) => setForm({ ...form, gstRate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
              >
                <option value="0">0% (Nil / Essential)</option>
                <option value="5">5% (Garments &lt;1k)</option>
                <option value="12">12% (Garments &gt;1k)</option>
                <option value="18">18% (Gadgets / Audio)</option>
                <option value="28">28% (Luxury)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">HSN / SAC Code</label>
              <input
                type="text"
                placeholder="6205"
                value={form.hsnCode}
                onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Opening Stock</label>
              <input
                type="number"
                placeholder="50"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/shop-admin/products')}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Product & Print Barcode
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

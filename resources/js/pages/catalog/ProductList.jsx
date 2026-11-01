import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useErp } from '../../context/ErpContext';
import {
  Search,
  Plus,
  Download,
  Printer,
  Barcode,
  Edit,
  Trash2,
  Layers,
  Palette,
  Truck,
  X,
  Sparkles
} from 'lucide-react';

export default function ProductList() {
  const navigate = useNavigate();
  const { products, deleteProduct, setSelectedBarcodeProduct, showToast } = useErp();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStockStatus, setFilterStockStatus] = useState('All Stock Status');
  const [filterGstRate, setFilterGstRate] = useState('All GST Rates');
  const [selectedVariantProduct, setSelectedVariantProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesBarcode = (p.barcode || '').toLowerCase().includes(q);
        const matchesHsn = (p.hsnCode || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesBarcode && !matchesHsn) return false;
      }
      if (filterCategory !== 'All Categories' && p.category !== filterCategory) return false;
      if (filterStockStatus !== 'All Stock Status' && p.status !== filterStockStatus) return false;
      if (filterGstRate !== 'All GST Rates' && String(p.gstRate) !== filterGstRate) return false;
      return true;
    });
  }, [products, search, filterCategory, filterStockStatus, filterGstRate]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'SKU', 'Barcode', 'Selling Price', 'MRP', 'Stock', 'GST Rate', 'Status'];
    const rows = filteredProducts.map((p) => [
      `"${p.id}"`,
      `"${p.name}"`,
      `"${p.category}"`,
      `"${p.sku}"`,
      `"${p.barcode}"`,
      `"${p.sellingPrice}"`,
      `"${p.mrp}"`,
      `"${p.stock}"`,
      `"${p.gstRate}%"`,
      `"${p.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ramesh_fashion_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredProducts.length} products to CSV`);
  };

  return (
    <div className="space-y-4">
      {/* Filter & Action Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Product Catalog & Master SKUs</h2>
            <p className="text-xs text-slate-500">
              Manage single-database multi-category products with pricing, GST slabs, barcodes and variants.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print Catalog
            </button>
            <button
              onClick={() => navigate('/shop-admin/products/create')}
              className="px-4 py-1.5 rounded-lg bg-[#00a2c7] hover:bg-[#008ba3] text-xs font-bold text-white shadow-xs shadow-cyan-500/30 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" /> + Add New Product
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Name, SKU, Barcode, HSN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-[#00a2c7]"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="All Categories">All Categories</option>
            <option value="Fashion & Apparel">Fashion & Apparel</option>
            <option value="Grocery & Supermarket">Grocery & Supermarket</option>
            <option value="Electronics & Gadgets">Electronics & Gadgets</option>
          </select>

          <select
            value={filterStockStatus}
            onChange={(e) => setFilterStockStatus(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="All Stock Status">All Stock Status</option>
            <option value="In Stock">In Stock (&gt;10)</option>
            <option value="Low Stock">Low Stock (&lt;10)</option>
            <option value="Out of Stock">Out of Stock (0)</option>
          </select>

          <select
            value={filterGstRate}
            onChange={(e) => setFilterGstRate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="All GST Rates">All GST Rates</option>
            <option value="0">0% (Exempt)</option>
            <option value="5">5% (Garments &lt;1k)</option>
            <option value="12">12% (Garments &gt;1k)</option>
            <option value="18">18% (Electronics)</option>
            <option value="28">28% (Luxury)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3">Product Name & Category</th>
                <th className="px-4 py-3">SKU / Barcode</th>
                <th className="px-4 py-3">Selling Price</th>
                <th className="px-4 py-3">MRP</th>
                <th className="px-4 py-3">Cost Price</th>
                <th className="px-4 py-3">GST Slab</th>
                <th className="px-4 py-3">Current Stock</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => {
                const margin = (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(0);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{p.name}</span>
                        {p.isFreeShipping && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-[9px] font-black text-emerald-600 border border-emerald-300">
                            FREE SHIPPING
                          </span>
                        )}
                      </div>

                      {/* 3-Tier Category Trail */}
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {p.topCategoryName || p.category}
                          {p.midCategoryName && ` > ${p.midCategoryName}`}
                          {p.endCategoryName && ` > ${p.endCategoryName}`}
                        </span>
                        <span className="text-[10px] text-slate-400">Unit: {p.unit}</span>
                      </div>

                      {/* Variant Matrix Trigger Pill */}
                      {p.variants && p.variants.length > 0 && (
                        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setSelectedVariantProduct(p)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 text-[10px] font-black transition shadow-2xs"
                          >
                            <Layers className="w-3 h-3" />
                            <span>{p.variants.length} Variants</span>
                            <span className="font-normal opacity-80">
                              ({Array.from(new Set(p.variants.map((v) => v.size))).slice(0, 4).join(', ')})
                            </span>
                          </button>

                          {/* Quick Color Dots */}
                          <div className="flex items-center -space-x-1">
                            {Array.from(new Set(p.variants.map((v) => v.colorHex))).slice(0, 5).map((hex, i) => (
                              <span
                                key={i}
                                className="w-3 h-3 rounded-full border border-white dark:border-slate-900 shadow-2xs"
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 font-mono">
                      <div className="text-slate-800 dark:text-slate-200 font-bold">{p.sku}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Barcode className="w-3 h-3" /> {p.barcode}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      ₹ {p.sellingPrice.toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-slate-400 line-through">
                      ₹ {p.mrp.toFixed(2)}
                    </td>

                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      <div>₹ {p.purchasePrice.toFixed(2)}</div>
                      <div className="text-[10px] text-cyan-600 font-bold">Margin: {margin}%</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {p.gstRate}% (HSN {p.hsnCode})
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                          p.status === 'In Stock'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                            : p.status === 'Low Stock'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'
                        }`}
                      >
                        {p.stock} {p.unit} ({p.status})
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBarcodeProduct(p)}
                          title="Print Barcode Tag"
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-[#00a2c7] transition"
                        >
                          <Barcode className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => showToast(`Edit modal opened for ${p.sku}`)}
                          title="Edit Product"
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteProduct(p.id)}
                          title="Delete Product"
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredProducts.length} of {products.length} products</span>
          <span>Sync Status: Local Cache + Tenant DB Live</span>
        </div>
      </div>

      {/* Variant Breakdown Modal */}
      {selectedVariantProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {selectedVariantProduct.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-semibold text-[#00a2c7]">
                      {selectedVariantProduct.topCategoryName} &gt; {selectedVariantProduct.midCategoryName} &gt; {selectedVariantProduct.endCategoryName}
                    </span>
                    <span>• {selectedVariantProduct.variants?.length || 0} Total Variants</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedVariantProduct(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-x-auto max-h-[450px]">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold sticky top-0 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-2.5 px-3">Variant (Size / Color)</th>
                    <th className="py-2.5 px-3">Variant SKU</th>
                    <th className="py-2.5 px-3">Barcode</th>
                    <th className="py-2.5 px-3">Cost Price</th>
                    <th className="py-2.5 px-3">Selling Price</th>
                    <th className="py-2.5 px-3">MRP</th>
                    <th className="py-2.5 px-3">Stock (pcs)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedVariantProduct.variants?.map((v) => (
                    <tr key={v.id || v.sku} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                            style={{ backgroundColor: v.colorHex || '#1e3a8a' }}
                          />
                          <span className="font-bold">{v.size}</span>
                          <span className="text-slate-400 font-normal">/ {v.color}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {v.sku}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">
                        {v.barcode}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        ₹ {parseFloat(v.purchasePrice || selectedVariantProduct.purchasePrice).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                        ₹ {parseFloat(v.sellingPrice).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 line-through">
                        ₹ {parseFloat(v.mrp).toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            v.stock > 10
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : v.stock > 0
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}
                        >
                          {v.stock} pcs ({v.stock > 0 ? 'Available' : 'Out of Stock'})
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
              <div className="flex items-center gap-4">
                <span>Weight: <strong>{selectedVariantProduct.weightKg || 0.35} kg</strong></span>
                <span>Dimensions: <strong>{selectedVariantProduct.dimensions || '30x25x3 cm'}</strong></span>
              </div>
              <button
                onClick={() => setSelectedVariantProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold"
              >
                Close Matrix View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

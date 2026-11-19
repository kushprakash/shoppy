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
  Sparkles,
  Compass,
  MapPin,
  Box,
  Grid,
  Check,
  CheckCircle2
} from 'lucide-react';

const STORAGE_DIRECTIONS = [
  { id: 'East (पूर्व)', label: 'पूर्व (East)', icon: '🧭' },
  { id: 'West (पश्चिम)', label: 'पश्चिम (West)', icon: '🧭' },
  { id: 'North (उत्तर)', label: 'उत्तर (North)', icon: '🧭' },
  { id: 'South (दक्षिण)', label: 'दक्षिण (South)', icon: '🧭' },
  { id: 'Center (मध्य)', label: 'मध्य (Center)', icon: '🎯' },
  { id: 'Front Counter (सामने)', label: 'सामने काउंटर (Front)', icon: '🏬' },
  { id: 'Back Godown (पीछे)', label: 'पीछे का गोदाम (Back)', icon: '📦' },
];

const QUICK_LINES = ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5', 'Line 6', 'Line 7', 'Line 8', 'Row A', 'Row B', 'Row C', 'Rack 1', 'Rack 2'];
const QUICK_BOXES = ['Box 01', 'Box 02', 'Box 03', 'Box 04', 'Box 05', 'Box 08', 'Box 10', 'Box 12', 'Box 14', 'Box 15', 'Box 20', 'Box 25', 'Shelf 1', 'Shelf 2', 'Bin 1', 'Bin 2'];
const STORAGE_FLOORS = [
  'Ground Floor (दुकान / भूतल)',
  'Basement (तहखाना / बेसमेंट गोदाम)',
  '1st Floor (पहला तल)',
  '2nd Floor (दूसरा तल)',
  'Back Stock Room (पीछे का स्टॉक रूम)',
  'Central Warehouse (मुख्य वेयरहाउस)'
];

export default function ProductList() {
  const navigate = useNavigate();
  const { products, deleteProduct, updateProductStorageLocation, setSelectedBarcodeProduct, showToast } = useErp();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStockStatus, setFilterStockStatus] = useState('All Stock Status');
  const [filterGstRate, setFilterGstRate] = useState('All GST Rates');
  const [filterDirection, setFilterDirection] = useState('All Directions');
  const [selectedVariantProduct, setSelectedVariantProduct] = useState(null);
  const [editingLocationProduct, setEditingLocationProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesBarcode = (p.barcode || '').toLowerCase().includes(q);
        const matchesHsn = (p.hsnCode || '').toLowerCase().includes(q);
        const matchesLocation =
          (p.storageDirection || '').toLowerCase().includes(q) ||
          (p.storageLine || '').toLowerCase().includes(q) ||
          (p.storageBox || '').toLowerCase().includes(q) ||
          (p.storageLandmark || '').toLowerCase().includes(q) ||
          (p.storageLocationCode || '').toLowerCase().includes(q) ||
          (p.storageFloor || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesBarcode && !matchesHsn && !matchesLocation) return false;
      }
      if (filterCategory !== 'All Categories' && p.category !== filterCategory) return false;
      if (filterStockStatus !== 'All Stock Status' && p.status !== filterStockStatus) return false;
      if (filterGstRate !== 'All GST Rates' && String(p.gstRate) !== filterGstRate) return false;
      if (filterDirection !== 'All Directions' && !(p.storageDirection || 'East (पूर्व)').toLowerCase().includes(filterDirection.toLowerCase())) return false;
      return true;
    });
  }, [products, search, filterCategory, filterStockStatus, filterGstRate, filterDirection]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'SKU', 'Barcode', 'Selling Price', 'MRP', 'Stock', 'GST Rate', 'Status', 'Floor', 'Direction (दिशा)', 'Line (लाइन)', 'Box (बॉक्स)', 'Landmark', 'Locator Code'];
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
      `"${p.status}"`,
      `"${p.storageFloor || 'Ground Floor'}"`,
      `"${p.storageDirection || 'East (पूर्व)'}"`,
      `"${p.storageLine || 'Line 1'}"`,
      `"${p.storageBox || 'Box 01'}"`,
      `"${p.storageLandmark || ''}"`,
      `"${p.storageLocationCode || ''}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `shoppy_inventory_storage_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredProducts.length} products with Storage Locations to CSV`);
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Name, SKU, Barcode, Box, Line, Disha..."
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
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
          >
            <option value="All Directions">📍 All Storage (सभी दिशाएं)</option>
            <option value="East">🧭 पूर्व (East)</option>
            <option value="West">🧭 पश्चिम (West)</option>
            <option value="North">🧭 उत्तर (North)</option>
            <option value="South">🧭 दक्षिण (South)</option>
            <option value="Center">🎯 मध्य (Center)</option>
            <option value="Front">🏬 सामने काउंटर (Front)</option>
            <option value="Back">📦 पीछे का गोदाम (Back)</option>
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
                <th className="px-4 py-3">📍 Storage & Box Locator</th>
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

                    {/* Storage & Shelf Box Locator */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/90 dark:border-amber-800/80 text-amber-900 dark:text-amber-200 font-bold text-xs shadow-2xs w-fit">
                          <Compass className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="text-[#008ba3] dark:text-cyan-400 font-black">
                            {p.storageDirection || 'East (पूर्व)'}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                            {p.storageLine || 'Line 1'}
                          </span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-200/80 dark:bg-amber-800/80 text-[10px] font-black text-amber-900 dark:text-amber-100">
                            {p.storageBox || 'Box 01'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 pl-0.5">
                          <span className="text-slate-500 font-medium">🏬 {p.storageFloor?.split(' ')[0] || 'Ground'}</span>
                          {p.storageLandmark && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[130px] text-slate-500" title={p.storageLandmark}>
                                📍 {p.storageLandmark}
                              </span>
                            </>
                          )}
                        </div>
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
                          onClick={() => setEditingLocationProduct({
                            id: p.id,
                            name: p.name,
                            sku: p.sku,
                            storageFloor: p.storageFloor || 'Ground Floor (दुकान / भूतल)',
                            storageDirection: p.storageDirection || 'East (पूर्व)',
                            storageLine: p.storageLine || 'Line 1',
                            storageBox: p.storageBox || 'Box 01',
                            storageLandmark: p.storageLandmark || ''
                          })}
                          title="Change Shelf / Box Location (लोकेशन बदलें)"
                          className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/60 text-slate-500 hover:text-amber-600 transition"
                        >
                          <Compass className="w-4 h-4" />
                        </button>
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

      {/* Quick Edit Storage Location Modal */}
      {editingLocationProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Update Storage Location (लोकेशन बदलें)
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {editingLocationProduct.name} ({editingLocationProduct.sku})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingLocationProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Floor */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Floor / Area (गोदाम / तल)
                </label>
                <select
                  value={editingLocationProduct.storageFloor}
                  onChange={(e) => setEditingLocationProduct({ ...editingLocationProduct, storageFloor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold focus:outline-none"
                >
                  {STORAGE_FLOORS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Disha / Direction */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Disha / Direction / Zone (दिशा) *</span>
                  <span className="text-[11px] text-amber-600 font-bold">{editingLocationProduct.storageDirection}</span>
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {STORAGE_DIRECTIONS.map((dir) => (
                    <button
                      type="button"
                      key={dir.id}
                      onClick={() => setEditingLocationProduct({ ...editingLocationProduct, storageDirection: dir.id })}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1 cursor-pointer ${
                        editingLocationProduct.storageDirection === dir.id
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      <span>{dir.icon}</span>
                      <span>{dir.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Line and Box */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Line / Row (लाइन) *
                  </label>
                  <input
                    type="text"
                    value={editingLocationProduct.storageLine}
                    onChange={(e) => setEditingLocationProduct({ ...editingLocationProduct, storageLine: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    {QUICK_LINES.slice(0, 5).map((ln) => (
                      <button
                        type="button"
                        key={ln}
                        onClick={() => setEditingLocationProduct({ ...editingLocationProduct, storageLine: ln })}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
                      >
                        {ln}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Box Number (बॉक्स नंबर) *
                  </label>
                  <input
                    type="text"
                    value={editingLocationProduct.storageBox}
                    onChange={(e) => setEditingLocationProduct({ ...editingLocationProduct, storageBox: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center gap-1 flex-wrap mt-1">
                    {QUICK_BOXES.slice(0, 5).map((bx) => (
                      <button
                        type="button"
                        key={bx}
                        onClick={() => setEditingLocationProduct({ ...editingLocationProduct, storageBox: bx })}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
                      >
                        {bx}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Landmark */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Landmark / Identification Note (पहचान चिन्ह)
                </label>
                <input
                  type="text"
                  placeholder="उदा: शीशे वाले रैक के ऊपर, AC के पास..."
                  value={editingLocationProduct.storageLandmark}
                  onChange={(e) => setEditingLocationProduct({ ...editingLocationProduct, storageLandmark: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Preview Tag */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-300/50 dark:border-amber-700/50 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center justify-between">
                <span>📍 लोकेशन: {editingLocationProduct.storageFloor?.split(' ')[0]} &rarr; {editingLocationProduct.storageDirection} &rarr; {editingLocationProduct.storageLine} &rarr; {editingLocationProduct.storageBox}</span>
                <span className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 font-mono text-[10px]">{editingLocationProduct.storageDirection?.slice(0, 4).toUpperCase()}-{editingLocationProduct.storageLine}-{editingLocationProduct.storageBox}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setEditingLocationProduct(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const locCode = `${editingLocationProduct.storageDirection?.slice(0, 4).toUpperCase() || 'EAST'}-${editingLocationProduct.storageLine || 'L1'}-${editingLocationProduct.storageBox || 'B01'}`;
                  updateProductStorageLocation(editingLocationProduct.id, {
                    storageFloor: editingLocationProduct.storageFloor,
                    storageDirection: editingLocationProduct.storageDirection,
                    storageLine: editingLocationProduct.storageLine,
                    storageBox: editingLocationProduct.storageBox,
                    storageLandmark: editingLocationProduct.storageLandmark,
                    storageLocationCode: locCode
                  });
                  setEditingLocationProduct(null);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Location</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

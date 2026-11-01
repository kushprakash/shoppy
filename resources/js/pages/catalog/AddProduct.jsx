import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useErp } from '../../context/ErpContext';
import {
  Plus,
  ChevronLeft,
  ArrowRight,
  Save,
  Layers,
  Sparkles,
  Palette,
  Maximize2,
  Truck,
  Trash2,
  CheckCircle2,
  RefreshCw,
  FolderTree,
  AlertCircle
} from 'lucide-react';

export default function AddProduct() {
  const navigate = useNavigate();
  const {
    addProduct,
    products,
    topCategories,
    midCategories,
    endCategories,
    sizes,
    colors,
    showToast
  } = useErp();

  // Basic Form
  const [form, setForm] = useState({
    name: '',
    description: '',
    topCategoryId: topCategories[0]?.id || '',
    midCategoryId: '',
    endCategoryId: '',
    unit: 'pcs',
    purchasePrice: 650,
    sellingPrice: 1299,
    mrp: 1999,
    gstRate: '5',
    hsnCode: '6205',
    branch: 'Main Branch (Downtown)',
    weightKg: 0.35,
    dimensions: '30x25x3 cm',
    isFreeShipping: false
  });

  // Cascade category selections
  const availableMidCategories = useMemo(() => {
    return midCategories.filter((m) => m.topCategoryId === form.topCategoryId && m.isActive);
  }, [midCategories, form.topCategoryId]);

  const availableEndCategories = useMemo(() => {
    return endCategories.filter((e) => e.midCategoryId === form.midCategoryId && e.isActive);
  }, [endCategories, form.midCategoryId]);

  // Set initial mid and end category when top category changes
  useEffect(() => {
    if (availableMidCategories.length > 0 && !availableMidCategories.some((m) => m.id === form.midCategoryId)) {
      const firstMid = availableMidCategories[0].id;
      setForm((prev) => ({ ...prev, midCategoryId: firstMid }));
    } else if (availableMidCategories.length === 0) {
      setForm((prev) => ({ ...prev, midCategoryId: '', endCategoryId: '' }));
    }
  }, [availableMidCategories]);

  useEffect(() => {
    if (availableEndCategories.length > 0 && !availableEndCategories.some((e) => e.id === form.endCategoryId)) {
      setForm((prev) => ({ ...prev, endCategoryId: availableEndCategories[0].id }));
    } else if (availableEndCategories.length === 0) {
      setForm((prev) => ({ ...prev, endCategoryId: '' }));
    }
  }, [availableEndCategories]);

  // Selected Sizes and Colors for Matrix Generation
  const [selectedSizes, setSelectedSizes] = useState(['M', 'L', 'XL']);
  const [selectedColors, setSelectedColors] = useState(['Sky Blue', 'Navy Blue', 'Pure White']);

  // Generated Variant Matrix
  const [variants, setVariants] = useState([]);

  // Auto-generate initial variant matrix
  useEffect(() => {
    handleGenerateVariants();
  }, []);

  const handleGenerateVariants = () => {
    if (selectedSizes.length === 0 || selectedColors.length === 0) {
      showToast('Please select at least 1 size and 1 color', 'error');
      return;
    }

    const basePrefix = form.name
      ? form.name.split(' ').map((w) => w[0]).join('').slice(0, 4).toUpperCase()
      : 'PRD';

    const matrix = [];
    selectedColors.forEach((colorName) => {
      const colorObj = colors.find((c) => c.name === colorName) || { name: colorName, hex: '#1e3a8a', code: 'CLR' };

      selectedSizes.forEach((sizeCode) => {
        const id = `v-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`;
        const sku = `${basePrefix}-${sizeCode}-${colorObj.code || colorObj.name.slice(0, 3).toUpperCase()}`;
        const barcode = `89012${Math.floor(1000000 + Math.random() * 9000000)}`;

        matrix.push({
          id,
          size: sizeCode,
          color: colorObj.name,
          colorHex: colorObj.hex,
          sku,
          barcode,
          purchasePrice: parseFloat(form.purchasePrice) || 650,
          sellingPrice: parseFloat(form.sellingPrice) || 1299,
          mrp: parseFloat(form.mrp) || 1999,
          stock: 0, // Opening stock is strictly 0. Only increases via Inward Purchase Bills!
          isActive: true
        });
      });
    });

    setVariants(matrix);
    showToast(`Generated ${matrix.length} variants (${selectedSizes.length} sizes × ${selectedColors.length} colors)`);
  };

  // Bulk Variant Updaters
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkMrp, setBulkMrp] = useState('');

  const applyBulkPrice = () => {
    const val = parseFloat(bulkPrice);
    if (isNaN(val) || val <= 0) return;
    setVariants((prev) => prev.map((v) => ({ ...v, sellingPrice: val })));
    showToast(`Applied ₹${val} selling price across all ${variants.length} variants`);
  };

  const handleVariantChange = (id, field, value) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const removeVariant = (id) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  // Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      showToast('Product title is required', 'error');
      return;
    }
    if (variants.length === 0) {
      showToast('At least 1 product variant is required', 'error');
      return;
    }

    const nextId = `PRD-${100 + products.length + 1}`;
    const topCat = topCategories.find((t) => t.id === form.topCategoryId);
    const midCat = midCategories.find((m) => m.id === form.midCategoryId);
    const endCat = endCategories.find((e) => e.id === form.endCategoryId);

    const totalStock = 0; // Strictly 0. Requires Inward Purchase Bill to add stock.
    const minSellingPrice = Math.min(...variants.map((v) => parseFloat(v.sellingPrice) || form.sellingPrice));
    const minMrp = Math.min(...variants.map((v) => parseFloat(v.mrp) || form.mrp));

    const newProduct = {
      id: nextId,
      name: form.name,
      description: form.description || 'Premium retail product configured with live variant inventory matrix.',
      category: topCat ? topCat.name : 'General Catalog',
      businessCategory: 'fashion',
      topCategoryId: form.topCategoryId,
      topCategoryName: topCat?.name || "Men's Fashion",
      midCategoryId: form.midCategoryId,
      midCategoryName: midCat?.name || "Men's Topwear",
      endCategoryId: form.endCategoryId,
      endCategoryName: endCat?.name || "Casual Shirts",
      sku: variants[0]?.sku || `SKU-${Date.now().toString().slice(-6)}`,
      barcode: variants[0]?.barcode || `890123400${products.length + 10}`,
      purchasePrice: parseFloat(form.purchasePrice) || 0,
      sellingPrice: minSellingPrice,
      mrp: minMrp,
      gstRate: parseFloat(form.gstRate) || 0,
      hsnCode: form.hsnCode || '6205',
      unit: form.unit || 'pcs',
      stock: 0,
      reorderLevel: 10,
      branch: form.branch || 'Main Branch (Downtown)',
      weightKg: parseFloat(form.weightKg) || 0.35,
      dimensions: form.dimensions || '30x25x3 cm',
      isFreeShipping: form.isFreeShipping,
      variants: variants.map(v => ({ ...v, stock: 0 })),
      status: 'Out of Stock'
    };

    addProduct(newProduct);
    navigate('/shop-admin/products');
  };

  const selectedTopObj = topCategories.find((t) => t.id === form.topCategoryId);
  const selectedMidObj = midCategories.find((m) => m.id === form.midCategoryId);
  const selectedEndObj = endCategories.find((e) => e.id === form.endCategoryId);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[#00a2c7] text-xs font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Tier Catalog &amp; Variant Engine</span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white">Create New Product with Variant Matrix</h1>
          <p className="text-xs text-slate-500">
            Select 3-Tier category (Top &gt; Mid &gt; End), select Sizes &amp; Colors to auto-generate variant combinations with individual SKUs, barcodes, pricing, and stock.
          </p>
        </div>

        <button
          onClick={() => navigate('/shop-admin/products')}
          className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Products
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ========================================================================= */}
        {/* SECTION 1: 3-TIER CATEGORY HIERARCHY SELECTION                            */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-[#00a2c7] text-xs font-black flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                3-Tier Category Classification (Top &gt; Mid &gt; End)
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/shop-admin/catalog-setup')}
              className="text-xs font-bold text-[#00a2c7] hover:underline flex items-center gap-1"
            >
              + Manage Categories
            </button>
          </div>

          {/* Active Breadcrumb Badge */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 flex items-center gap-2 text-xs flex-wrap">
            <FolderTree className="w-4 h-4 text-[#00a2c7]" />
            <span className="text-slate-400 font-medium">Selected Hierarchy:</span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-[#00a2c7] font-bold">
              {selectedTopObj ? `${selectedTopObj.icon || '👔'} ${selectedTopObj.name}` : 'Select Top Category'}
            </span>
            <span className="text-slate-400">&gt;</span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 font-bold">
              {selectedMidObj ? selectedMidObj.name : 'Select Mid Category'}
            </span>
            <span className="text-slate-400">&gt;</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 font-bold">
              {selectedEndObj ? selectedEndObj.name : 'Select End Category'}
            </span>
          </div>

          {/* Cascading 3 Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Top Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Top Category (Level 1) *
              </label>
              <select
                value={form.topCategoryId}
                onChange={(e) => setForm({ ...form, topCategoryId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:outline-none focus:border-[#00a2c7]"
              >
                {topCategories.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Mid Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mid Category (Level 2) *
              </label>
              <select
                value={form.midCategoryId}
                onChange={(e) => setForm({ ...form, midCategoryId: e.target.value })}
                disabled={availableMidCategories.length === 0}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                {availableMidCategories.length === 0 ? (
                  <option value="">No Mid Categories available</option>
                ) : (
                  availableMidCategories.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* End Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                End Category (Level 3 - Product Shelf) *
              </label>
              <select
                value={form.endCategoryId}
                onChange={(e) => setForm({ ...form, endCategoryId: e.target.value })}
                disabled={availableEndCategories.length === 0}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              >
                {availableEndCategories.length === 0 ? (
                  <option value="">No End Categories available</option>
                ) : (
                  availableEndCategories.map((end) => (
                    <option key={end.id} value={end.id}>
                      {end.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 2: BASIC PRODUCT INFORMATION & TAXATION                           */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-[#00a2c7] text-xs font-black flex items-center justify-center">
              2
            </span>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">Product Master Information</h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Product Title / Commercial Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Oxford Pure Cotton Slim Fit Shirt"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold focus:outline-none focus:border-[#00a2c7]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Storefront Description &amp; Highlights
            </label>
            <textarea
              rows={2}
              placeholder="Key fabric features, care instructions, fit specifications for customers on storefront..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-[#00a2c7]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Unit of Measure</label>
              <select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold focus:outline-none"
              >
                <option value="pcs">Pieces (Pcs)</option>
                <option value="pack">Pack</option>
                <option value="tin">Tin / Can</option>
                <option value="kg">Kilogram (Kg)</option>
                <option value="pair">Pair</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">GST Tax Rate</label>
              <select
                value={form.gstRate}
                onChange={(e) => setForm({ ...form, gstRate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:outline-none text-[#00a2c7]"
              >
                <option value="0">0% (Exempt)</option>
                <option value="5">5% (Garments &lt;1k / Agri)</option>
                <option value="12">12% (Garments &gt;1k / Food)</option>
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
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Fulfillment Branch</label>
              <select
                value={form.branch}
                onChange={(e) => setForm({ ...form, branch: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold focus:outline-none"
              >
                <option value="Main Branch (Downtown)">Main Branch (Downtown)</option>
                <option value="Outlet #2 (Mall Road)">Outlet #2 (Mall Road)</option>
                <option value="Central Warehouse">Central Warehouse</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 3: SIZES & COLORS FOR VARIANT GENERATION                          */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-[#00a2c7] text-xs font-black flex items-center justify-center">
                3
              </span>
              <h2 className="text-sm font-black text-slate-900 dark:text-white">
                Select Sizes &amp; Colors (Variant Ingredients)
              </h2>
            </div>
            <button
              type="button"
              onClick={handleGenerateVariants}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00a2c7] to-indigo-600 hover:opacity-90 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-cyan-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" /> ⚡ Generate Variant Matrix
            </button>
          </div>

          {/* Size Pills Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-indigo-500" /> Choose Sizes (Select Multiple):
              </label>
              <span className="text-[11px] text-slate-400 font-semibold">{selectedSizes.length} selected</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {sizes.map((sz) => {
                const isChecked = selectedSizes.includes(sz.code);
                return (
                  <button
                    type="button"
                    key={sz.id}
                    onClick={() => {
                      if (isChecked) {
                        setSelectedSizes(selectedSizes.filter((s) => s !== sz.code));
                      } else {
                        setSelectedSizes([...selectedSizes, sz.code]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-1.5 border ${
                      isChecked
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {sz.code}
                    {isChecked && <CheckCircle2 className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Swatch Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-rose-500" /> Choose Colors (Select Multiple):
              </label>
              <span className="text-[11px] text-slate-400 font-semibold">{selectedColors.length} selected</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {colors.map((c) => {
                const isChecked = selectedColors.includes(c.name);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => {
                      if (isChecked) {
                        setSelectedColors(selectedColors.filter((cl) => cl !== c.name));
                      } else {
                        setSelectedColors([...selectedColors, c.name]);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                      isChecked
                        ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-400 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                    {isChecked && <CheckCircle2 className="w-3 h-3 text-rose-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: EDITABLE VARIANT MATRIX TABLE                                  */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-[#00a2c7] text-xs font-black flex items-center justify-center">
                4
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white">
                  Generated Variant Matrix ({variants.length} Combinations)
                </h2>
                <p className="text-[10px] text-slate-400">
                  Each variant has its own unique SKU, barcode, price, and stock for POS &amp; eCommerce.
                </p>
              </div>
            </div>

            {/* Fast Bulk Tool */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="Price ₹"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
                />
                <button
                  type="button"
                  onClick={applyBulkPrice}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold"
                >
                  Set Price
                </button>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                🔒 Opening Stock: 0 (Stock increases strictly via Inward Purchase Bills)
              </div>
            </div>
          </div>

          {/* Matrix Grid Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2.5 px-3">Variant (Size / Color)</th>
                  <th className="py-2.5 px-3">Unique SKU</th>
                  <th className="py-2.5 px-3">Barcode (EAN-13)</th>
                  <th className="py-2.5 px-3">Cost Price (₹)</th>
                  <th className="py-2.5 px-3">Selling Price (₹)</th>
                  <th className="py-2.5 px-3">MRP (₹)</th>
                  <th className="py-2.5 px-3">Opening Stock</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {variants.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: v.colorHex }}
                        />
                        <span className="font-bold">{v.size}</span>
                        <span className="text-slate-400 font-normal">/ {v.color}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={v.sku}
                        onChange={(e) => handleVariantChange(v.id, 'sku', e.target.value)}
                        className="w-28 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-900"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={v.barcode}
                        onChange={(e) => handleVariantChange(v.id, 'barcode', e.target.value)}
                        className="w-32 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-mono bg-white dark:bg-slate-900 text-slate-500"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={v.purchasePrice}
                        onChange={(e) => handleVariantChange(v.id, 'purchasePrice', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={v.sellingPrice}
                        onChange={(e) => handleVariantChange(v.id, 'sellingPrice', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 rounded-lg border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-600 bg-white dark:bg-slate-900"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        value={v.mrp}
                        onChange={(e) => handleVariantChange(v.id, 'mrp', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-white dark:bg-slate-900"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                        0 <span className="text-[9px] font-normal text-slate-400">(Inward req.)</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeVariant(v.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 5: SHIPPING ATTRIBUTES & PACKAGE SPECS                             */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-[#00a2c7] text-xs font-black flex items-center justify-center">
              5
            </span>
            <h2 className="text-sm font-black text-slate-900 dark:text-white">
              Shipping &amp; Logistics Packaging Attributes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dead Weight (in Kg) *
              </label>
              <input
                type="number"
                step="0.01"
                placeholder="0.35"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Used for automated courier weight-slab rate calculation.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Package Dimensions (L × W × H cm)
              </label>
              <input
                type="text"
                placeholder="30x25x3 cm"
                value={form.dimensions}
                onChange={(e) => setForm({ ...form, dimensions: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-400">Volumetric weight calculation for courier dispatch.</span>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/40 dark:bg-emerald-950/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFreeShipping}
                  onChange={(e) => setForm({ ...form, isFreeShipping: e.target.checked })}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    Product-Level Free Shipping
                  </div>
                  <div className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80">
                    Always free delivery on storefront
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate('/shop-admin/products')}
            className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#00a2c7] to-indigo-600 hover:from-[#008ba3] hover:to-indigo-700 text-white text-xs font-black shadow-lg shadow-cyan-500/25 flex items-center gap-2 transition"
          >
            <Save className="w-4 h-4" /> Save Product &amp; List on eCommerce ({variants.length} Variants)
          </button>
        </div>
      </form>
    </div>
  );
}

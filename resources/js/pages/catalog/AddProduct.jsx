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
  AlertCircle,
  Compass,
  MapPin,
  Box,
  Navigation,
  Archive,
  Grid,
  CornerDownRight
} from 'lucide-react';

const STORAGE_DIRECTIONS = [
  { id: 'East (पूर्व)', label: 'पूर्व (East)', icon: '🧭', badge: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800' },
  { id: 'West (पश्चिम)', label: 'पश्चिम (West)', icon: '🧭', badge: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800' },
  { id: 'North (उत्तर)', label: 'उत्तर (North)', icon: '🧭', badge: 'bg-indigo-50 text-indigo-700 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800' },
  { id: 'South (दक्षिण)', label: 'दक्षिण (South)', icon: '🧭', badge: 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800' },
  { id: 'Center (मध्य)', label: 'मध्य / सेंटर (Center)', icon: '🎯', badge: 'bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800' },
  { id: 'Front Counter (सामने)', label: 'सामने काउंटर (Front)', icon: '🏬', badge: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800' },
  { id: 'Back Godown (पीछे)', label: 'पीछे का गोदाम (Back)', icon: '📦', badge: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700' },
];

const QUICK_LINES = ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5', 'Line 6', 'Line 7', 'Line 8', 'Row A', 'Row B', 'Row C', 'Rack 1', 'Rack 2', 'Almari 1'];
const QUICK_BOXES = ['Box 01', 'Box 02', 'Box 03', 'Box 04', 'Box 05', 'Box 08', 'Box 10', 'Box 12', 'Box 14', 'Box 15', 'Box 20', 'Box 25', 'Shelf 1', 'Shelf 2', 'Bin 1', 'Bin 2'];
const STORAGE_FLOORS = [
  'Ground Floor (दुकान / भूतल)',
  'Basement (तहखाना / बेसमेंट गोदाम)',
  '1st Floor (पहला तल)',
  '2nd Floor (दूसरा तल)',
  'Back Stock Room (पीछे का स्टॉक रूम)',
  'Central Warehouse (मुख्य वेयरहाउस)'
];

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
    isFreeShipping: false,
    // Warehouse & Store Storage Location Management (दुकान एवं गोदाम रैक-बॉक्स लोकेटर)
    storageFloor: 'Ground Floor (दुकान / भूतल)',
    storageDirection: 'East (पूर्व)',
    storageLine: 'Line 1',
    storageBox: 'Box 01',
    storageRack: 'Rack A',
    storageLandmark: ''
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
      // Physical Storage & Warehouse Locator (दुकान एवं गोदाम रैक-बॉक्स लोकेटर)
      storageFloor: form.storageFloor || 'Ground Floor (दुकान / भूतल)',
      storageDirection: form.storageDirection || 'East (पूर्व)',
      storageLine: form.storageLine || 'Line 1',
      storageBox: form.storageBox || 'Box 01',
      storageRack: form.storageRack || 'Rack A',
      storageLandmark: form.storageLandmark || '',
      storageLocationCode: `${form.storageDirection ? form.storageDirection.slice(0, 4).toUpperCase() : 'DIR'}-${form.storageLine || 'L1'}-${form.storageBox || 'B01'}`,
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
        {/* SECTION 3: WAREHOUSE & STORE STORAGE LOCATOR (DISHA, LINE, BOX)           */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 text-xs font-black flex items-center justify-center">
                3
              </span>
              <div>
                <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-amber-500" />
                  <span>Warehouse & Store Storage Locator (स्टोर / गोदाम लोकेशन - दिशा, लाइन, बॉक्स)</span>
                </h2>
                <p className="text-[11px] text-slate-500">
                  दुकान या वेयरहाउस में प्रोडक्ट तुरंत ढूंढने के लिए दिशा (East/West/North/South), लाइन/रैक और बॉक्स नंबर सेट करें।
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold">
              <Box className="w-3.5 h-3.5 text-amber-500" />
              <span>Smart Stock Locator</span>
            </div>
          </div>

          {/* 1. Floor & Direction Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Floor Selection */}
            <div className="md:col-span-4 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Floor / Store Area (गोदाम / तल) *
              </label>
              <select
                value={form.storageFloor}
                onChange={(e) => setForm({ ...form, storageFloor: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold focus:outline-none focus:border-[#00a2c7]"
              >
                {STORAGE_FLOORS.map((fl) => (
                  <option key={fl} value={fl}>{fl}</option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400">दुकान का ग्राउंड फ्लोर या पिछला गोदाम चुनें।</span>
            </div>

            {/* Disha / Direction Selector */}
            <div className="md:col-span-8 space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-amber-500" />
                  <span>Disha / Direction / Zone (दिशा / दिशा क्षेत्र) *</span>
                </label>
                <span className="text-[11px] font-bold text-[#008ba3] dark:text-cyan-400">
                  चयनित: {form.storageDirection}
                </span>
              </div>

              {/* Quick Direction Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                {STORAGE_DIRECTIONS.map((dir) => {
                  const isSelected = form.storageDirection === dir.id;
                  return (
                    <button
                      type="button"
                      key={dir.id}
                      onClick={() => setForm({ ...form, storageDirection: dir.id })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-white border-amber-500 shadow-xs ring-2 ring-amber-400/40'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                      }`}
                    >
                      <span>{dir.icon}</span>
                      <span>{dir.label}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Direction Input if needed */}
              <div className="pt-1">
                <input
                  type="text"
                  placeholder="या कोई कस्टम दिशा लिखें (उदा: गेट के दाहिने तरफ, पिलर 3, सीढ़ी के पास)..."
                  value={form.storageDirection}
                  onChange={(e) => setForm({ ...form, storageDirection: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Line/Row and Box Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Line / Row / Rack */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Line / Row / Rack Number (किस लाइन / रो / रैक में है) *
              </label>
              <div className="relative">
                <Grid className="w-4 h-4 text-indigo-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Line 1, Line 3, Row B, Rack 04..."
                  value={form.storageLine}
                  onChange={(e) => setForm({ ...form, storageLine: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Quick Line Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Select:</span>
                {QUICK_LINES.slice(0, 8).map((line) => (
                  <button
                    type="button"
                    key={line}
                    onClick={() => setForm({ ...form, storageLine: line })}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                      form.storageLine === line
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    {line}
                  </button>
                ))}
              </div>
            </div>

            {/* Box / Bin Number */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Box / Bin / Shelf Number (किस नंबर के बॉक्स / बिंन में है) *
              </label>
              <div className="relative">
                <Box className="w-4 h-4 text-emerald-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Box 01, Box 15, Shelf 3, Bin 08..."
                  value={form.storageBox}
                  onChange={(e) => setForm({ ...form, storageBox: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Quick Box Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold mr-1">Quick Select:</span>
                {QUICK_BOXES.slice(0, 8).map((box) => (
                  <button
                    type="button"
                    key={box}
                    onClick={() => setForm({ ...form, storageBox: box })}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                      form.storageBox === box
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    {box}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Landmark & Live Locator Preview Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-2 border-t border-slate-100 dark:border-slate-800 items-center">
            {/* Landmark / Notes */}
            <div className="md:col-span-5 space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Landmark / Identification Note (पहचान चिन्ह / लैंडमार्क)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-rose-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="उदा: शीशे वाले रैक के ऊपर, AC के पास, काउंटर 2 के पीछे..."
                  value={form.storageLandmark}
                  onChange={(e) => setForm({ ...form, storageLandmark: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <span className="text-[10px] text-slate-400">स्टाफ को सामान ढूंढने में आसानी के लिए कोई खास पहचान।</span>
            </div>

            {/* Live Interactive Product Locator Badge */}
            <div className="md:col-span-7">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/15 border border-amber-300/60 dark:border-amber-700/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                      Live Warehouse Location Tag (स्टोर लोकेटर)
                    </span>
                  </div>

                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-[10px] font-mono font-black text-slate-700 dark:text-slate-300 border border-amber-200 dark:border-amber-800">
                    {`${form.storageDirection ? form.storageDirection.slice(0, 4).toUpperCase() : 'DIR'}-${form.storageLine || 'L1'}-${form.storageBox || 'B01'}`}
                  </span>
                </div>

                {/* Path Visualizer */}
                <div className="flex items-center gap-2 text-xs flex-wrap font-bold text-slate-800 dark:text-slate-100 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-200/60 dark:border-amber-800/60">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                    🏬 {form.storageFloor?.split(' ')[0] || 'Ground'}
                  </span>
                  <span className="text-amber-500 font-black">&rarr;</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-[11px] text-amber-800 dark:text-amber-200">
                    🧭 {form.storageDirection || 'East (पूर्व)'}
                  </span>
                  <span className="text-amber-500 font-black">&rarr;</span>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-[11px] text-indigo-800 dark:text-indigo-200">
                    🗄️ {form.storageLine || 'Line 1'}
                  </span>
                  <span className="text-amber-500 font-black">&rarr;</span>
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-[11px] text-white shadow-xs font-black">
                    📦 {form.storageBox || 'Box 01'}
                  </span>
                </div>

                {/* Staff Picking Instruction */}
                <p className="text-[11px] text-amber-900/80 dark:text-amber-300/80 leading-relaxed">
                  💡 <strong>स्टाफ पिकिंग गाइड:</strong> दुकान/गोदाम में <strong>{form.storageDirection}</strong> दिशा जाएं &rarr; <strong>{form.storageLine}</strong> पर पहुंचें &rarr; <strong>{form.storageBox}</strong> से यह सामान तुरंत निकालें।
                  {form.storageLandmark && ` (पहचान: "${form.storageLandmark}")`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECTION 4: SIZES & COLORS FOR VARIANT GENERATION                          */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-[#00a2c7] text-xs font-black flex items-center justify-center">
                4
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
        {/* SECTION 5: EDITABLE VARIANT MATRIX TABLE                                  */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-[#00a2c7] text-xs font-black flex items-center justify-center">
                5
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
        {/* SECTION 6: SHIPPING ATTRIBUTES & PACKAGE SPECS                             */}
        {/* ========================================================================= */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-[#00a2c7] text-xs font-black flex items-center justify-center">
              6
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

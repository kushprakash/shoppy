import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  Layers,
  Palette,
  Maximize2,
  Truck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  ChevronRight,
  FolderTree,
  AlertCircle,
  Sparkles,
  Save,
  ArrowRight,
  Sliders,
  DollarSign,
  PackageCheck,
  Tag
} from 'lucide-react';

export default function CatalogSetup() {
  const {
    topCategories,
    addTopCategory,
    updateTopCategory,
    deleteTopCategory,
    midCategories,
    addMidCategory,
    updateMidCategory,
    deleteMidCategory,
    endCategories,
    addEndCategory,
    updateEndCategory,
    deleteEndCategory,
    sizes,
    addSize,
    deleteSize,
    colors,
    addColor,
    deleteColor,
    shippingRules,
    updateShippingRules,
    showToast
  } = useErp();

  const [activeTab, setActiveTab] = useState('categories'); // 'categories', 'sizes', 'colors', 'shipping'

  // Category selection for 3-tier drilling
  const [selectedTopId, setSelectedTopId] = useState(topCategories[0]?.id || 'TOP-1');
  const [selectedMidId, setSelectedMidId] = useState(
    midCategories.find((m) => m.topCategoryId === (topCategories[0]?.id || 'TOP-1'))?.id || midCategories[0]?.id || 'MID-101'
  );

  // Modal / Form States for Categories
  const [topModalOpen, setTopModalOpen] = useState(false);
  const [newTop, setNewTop] = useState({ name: '', slug: '', icon: '👔', description: '', isActive: true });

  const [midModalOpen, setMidModalOpen] = useState(false);
  const [newMid, setNewMid] = useState({ topCategoryId: selectedTopId, name: '', slug: '', isActive: true });

  const [endModalOpen, setEndModalOpen] = useState(false);
  const [newEnd, setNewEnd] = useState({ midCategoryId: selectedMidId, name: '', slug: '', isActive: true });

  // Size Form State
  const [sizeModalOpen, setSizeModalOpen] = useState(false);
  const [selectedSizeGroup, setSelectedSizeGroup] = useState('All');
  const [newSize, setNewSize] = useState({ group: 'Apparel Standard', code: '', label: '' });

  // Color Form State
  const [colorModalOpen, setColorModalOpen] = useState(false);
  const [newColor, setNewColor] = useState({ name: '', hex: '#6366f1', code: '' });

  // Shipping Form State
  const [shippingForm, setShippingForm] = useState({ ...shippingRules });

  // Filtered mid and end categories based on selections
  const currentMidCategories = midCategories.filter((m) => m.topCategoryId === selectedTopId);
  const currentEndCategories = endCategories.filter((e) => e.midCategoryId === selectedMidId);

  // Handlers for Categories
  const handleCreateTop = (e) => {
    e.preventDefault();
    if (!newTop.name.trim()) return;
    const slug = newTop.slug.trim() || newTop.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    addTopCategory({ ...newTop, slug });
    setNewTop({ name: '', slug: '', icon: '🏷️', description: '', isActive: true });
    setTopModalOpen(false);
  };

  const handleCreateMid = (e) => {
    e.preventDefault();
    if (!newMid.name.trim()) return;
    const slug = newMid.slug.trim() || newMid.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    addMidCategory({ ...newMid, topCategoryId: selectedTopId, slug });
    setNewMid({ topCategoryId: selectedTopId, name: '', slug: '', isActive: true });
    setMidModalOpen(false);
  };

  const handleCreateEnd = (e) => {
    e.preventDefault();
    if (!newEnd.name.trim()) return;
    const slug = newEnd.slug.trim() || newEnd.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    addEndCategory({ ...newEnd, midCategoryId: selectedMidId, slug });
    setNewEnd({ midCategoryId: selectedMidId, name: '', slug: '', isActive: true });
    setEndModalOpen(false);
  };

  // Handlers for Sizes
  const handleCreateSize = (e) => {
    e.preventDefault();
    if (!newSize.code.trim()) return;
    addSize({
      group: newSize.group,
      code: newSize.code.toUpperCase().trim(),
      label: newSize.label.trim() || newSize.code.toUpperCase().trim()
    });
    setNewSize({ group: 'Apparel Standard', code: '', label: '' });
    setSizeModalOpen(false);
  };

  // Handlers for Colors
  const handleCreateColor = (e) => {
    e.preventDefault();
    if (!newColor.name.trim()) return;
    const code = newColor.code.trim() || newColor.name.slice(0, 4).toUpperCase();
    addColor({ ...newColor, code });
    setNewColor({ name: '', hex: '#3b82f6', code: '' });
    setColorModalOpen(false);
  };

  // Handlers for Shipping
  const handleSaveShipping = (e) => {
    e.preventDefault();
    updateShippingRules(shippingForm);
  };

  const handleWeightSlabChange = (index, field, value) => {
    const updated = [...shippingForm.weightSlabs];
    updated[index] = { ...updated[index], [field]: parseFloat(value) || 0 };
    setShippingForm({ ...shippingForm, weightSlabs: updated });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Title & Navigation Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Catalog & Logistics Setup</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Categories, Variants & Shipping Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Configure your store's 3-Tier Category Tree (Top, Mid, End), Variant Attributes (Sizes &amp; Color Swatches), and Shipping &amp; Free Delivery slabs. These settings directly power Add Product variant matrix and eCommerce storefront.
          </p>
        </div>

        {/* Global Summary Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-lg font-black text-[#00a2c7]">{topCategories.length}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase">Top Cats</div>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-lg font-black text-indigo-500">{sizes.length}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase">Sizes</div>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-lg font-black text-rose-500">{colors.length}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase">Colors</div>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
            <div className="text-lg font-black text-emerald-500">₹{shippingRules.freeShippingThreshold}</div>
            <div className="text-[10px] font-semibold text-slate-500 uppercase">Free Ship Above</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-[#00a2c7] text-white shadow-md shadow-cyan-500/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3-Tier Categories (Top &gt; Mid &gt; End)</span>
        </button>

        <button
          onClick={() => setActiveTab('sizes')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'sizes'
              ? 'bg-[#00a2c7] text-white shadow-md shadow-cyan-500/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Maximize2 className="w-4 h-4" />
          <span>Sizes &amp; Scale Units ({sizes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('colors')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'colors'
              ? 'bg-[#00a2c7] text-white shadow-md shadow-cyan-500/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>Colors &amp; Swatches ({colors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shipping')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'shipping'
              ? 'bg-[#00a2c7] text-white shadow-md shadow-cyan-500/25'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Shipping &amp; Delivery Management</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: 3-TIER CATEGORIES                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Breadcrumb Hierarchy Ribbon */}
          <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-xs font-medium">
              <span className="text-slate-400 flex items-center gap-1">
                <FolderTree className="w-3.5 h-3.5" /> Selected Path:
              </span>
              <span className="font-bold text-cyan-400">
                {topCategories.find((t) => t.id === selectedTopId)?.name || 'Top'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-bold text-indigo-400">
                {midCategories.find((m) => m.id === selectedMidId)?.name || 'Mid'}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="font-bold text-emerald-400">
                {currentEndCategories.length} End Categories Active
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Click any category card to drill down and manage sub-categories
            </div>
          </div>

          {/* 3 Cascading Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Top Categories (Level 1) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-100 dark:bg-cyan-950/60 text-[#00a2c7] text-xs font-black flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Top Categories</h3>
                      <p className="text-[10px] text-slate-400">Level 1 - Root Category</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setTopModalOpen(true)}
                    className="p-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 hover:bg-[#00a2c7] text-[#00a2c7] hover:text-white transition flex items-center gap-1 text-xs font-bold px-2.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {topCategories.map((top) => {
                    const isSelected = top.id === selectedTopId;
                    const childMids = midCategories.filter((m) => m.topCategoryId === top.id);

                    return (
                      <div
                        key={top.id}
                        onClick={() => {
                          setSelectedTopId(top.id);
                          const firstMid = midCategories.find((m) => m.topCategoryId === top.id);
                          if (firstMid) setSelectedMidId(firstMid.id);
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-50/70 dark:bg-cyan-950/40 border-[#00a2c7] shadow-xs'
                            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{top.icon || '📦'}</span>
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {top.name}
                              {!top.isActive && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 font-bold">
                                  Paused
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {childMids.length} Mid Categories
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateTopCategory(top.id, { isActive: !top.isActive });
                            }}
                            title="Toggle Active"
                            className={`p-1 rounded-lg text-[10px] font-bold ${
                              top.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete top category "${top.name}" and all subcategories?`)) {
                                deleteTopCategory(top.id);
                              }
                            }}
                            title="Delete"
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-[#00a2c7]' : 'text-slate-300 dark:text-slate-600'}`} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Total: {topCategories.length} Categories</span>
                <span className="text-[#00a2c7] font-semibold">Tier 1 Hierarchy</span>
              </div>
            </div>

            {/* Column 2: Mid Categories (Level 2) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-500 text-xs font-black flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">Mid Categories</h3>
                      <p className="text-[10px] text-slate-400">
                        In: <strong className="text-cyan-600">{topCategories.find((t) => t.id === selectedTopId)?.name}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setNewMid({ ...newMid, topCategoryId: selectedTopId });
                      setMidModalOpen(true);
                    }}
                    className="p-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-600 text-indigo-600 hover:text-white transition flex items-center gap-1 text-xs font-bold px-2.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {currentMidCategories.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <p className="text-xs text-slate-400">No Mid Categories created under this Top Category yet.</p>
                      <button
                        onClick={() => setMidModalOpen(true)}
                        className="mt-3 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                      >
                        + Create Mid Category
                      </button>
                    </div>
                  ) : (
                    currentMidCategories.map((mid) => {
                      const isSelected = mid.id === selectedMidId;
                      const childEnds = endCategories.filter((e) => e.midCategoryId === mid.id);

                      return (
                        <div
                          key={mid.id}
                          onClick={() => setSelectedMidId(mid.id)}
                          className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-500 shadow-xs'
                              : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300'
                          }`}
                        >
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {mid.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {childEnds.length} End Categories linked
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateMidCategory(mid.id, { isActive: !mid.isActive });
                              }}
                              title="Toggle Active"
                              className={`p-1 rounded-lg text-[10px] font-bold ${
                                mid.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete mid category "${mid.name}"?`)) {
                                  deleteMidCategory(mid.id);
                                }
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-300 dark:text-slate-600'}`} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Showing {currentMidCategories.length} Mid Categories</span>
                <span className="text-indigo-500 font-semibold">Tier 2 Sub-tree</span>
              </div>
            </div>

            {/* Column 3: End Categories (Level 3 - Product Placement) */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-500 text-xs font-black flex items-center justify-center">
                      3
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white">End Categories</h3>
                      <p className="text-[10px] text-slate-400">
                        In: <strong className="text-indigo-600">{midCategories.find((m) => m.id === selectedMidId)?.name}</strong>
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setNewEnd({ ...newEnd, midCategoryId: selectedMidId });
                      setEndModalOpen(true);
                    }}
                    className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-600 text-emerald-600 hover:text-white transition flex items-center gap-1 text-xs font-bold px-2.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {currentEndCategories.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                      <p className="text-xs text-slate-400">No End Categories defined under this Mid Category.</p>
                      <button
                        onClick={() => setEndModalOpen(true)}
                        className="mt-3 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                      >
                        + Create End Category
                      </button>
                    </div>
                  ) : (
                    currentEndCategories.map((end) => (
                      <div
                        key={end.id}
                        className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-500 transition-all flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-2.5">
                          <Tag className="w-4 h-4 text-emerald-500" />
                          <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white">
                              {end.name}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              slug: {end.slug}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateEndCategory(end.id, { isActive: !end.isActive })}
                            title="Toggle Active"
                            className={`p-1 rounded-lg text-[10px] font-bold ${
                              end.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-slate-400 hover:bg-slate-100'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete end category "${end.name}"?`)) {
                                deleteEndCategory(end.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>{currentEndCategories.length} End Categories Active</span>
                <span className="text-emerald-500 font-semibold">Ready for Products</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SIZES & SCALE UNITS                                                */}
      {/* ========================================================================= */}
      {activeTab === 'sizes' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Product Size Scale Master</h2>
              <p className="text-xs text-slate-500">
                Define standard apparel, waist, footwear or weight unit sizes to generate product variants.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSizeModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                <Plus className="w-4 h-4" /> + Add New Size
              </button>
            </div>
          </div>

          {/* Group Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {['All', 'Apparel Standard', 'Waist / Bottoms', 'Packaging / Weights'].map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedSizeGroup(grp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedSizeGroup === grp
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>

          {/* Sizes Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {sizes
              .filter((s) => selectedSizeGroup === 'All' || s.group === selectedSizeGroup)
              .map((sz) => (
                <div
                  key={sz.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 flex flex-col justify-between hover:border-[#00a2c7] transition group"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {sz.group.slice(0, 10)}
                    </span>
                    <button
                      onClick={() => deleteSize(sz.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="my-2">
                    <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      {sz.code}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{sz.label}</div>
                  </div>
                  <div className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold w-fit">
                    Active Size
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COLORS & SWATCHES                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'colors' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Color Swatches &amp; Palette Master</h2>
              <p className="text-xs text-slate-500">
                Register color names with exact Hex Codes. These will appear as clickable interactive swatches on your eCommerce storefront.
              </p>
            </div>

            <button
              onClick={() => setColorModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" /> + Add New Color
            </button>
          </div>

          {/* Color Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {colors.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 flex flex-col justify-between hover:border-[#00a2c7] transition group shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    {c.code || 'CLR'}
                  </span>
                  <button
                    onClick={() => deleteColor(c.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Visual Swatch Circle */}
                <div className="my-4 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl border-2 border-white dark:border-slate-700 shadow-md flex items-center justify-center shrink-0"
                    style={{ backgroundColor: c.hex }}
                  />
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{c.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">{c.hex}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Storefront Swatch</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SHIPPING & DELIVERY MANAGEMENT                                     */}
      {/* ========================================================================= */}
      {activeTab === 'shipping' && (
        <form onSubmit={handleSaveShipping} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Store Shipping &amp; Logistics Rules</h2>
                <p className="text-xs text-slate-500">
                  Configure flat rate shipping, free shipping thresholds, COD fees, and weight slab charges.
                </p>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition"
              >
                <Save className="w-4 h-4" /> Save Shipping Settings
              </button>
            </div>

            {/* General Policy Settings */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Flat Rate Shipping */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-cyan-600" />
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Standard Flat Delivery Fee
                    </label>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={shippingForm.flatRate}
                    onChange={(e) => setShippingForm({ ...shippingForm, flatRate: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Default courier charge applied when order is below Free threshold.</p>
              </div>

              {/* Free Shipping Threshold */}
              <div className="p-4 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-emerald-600" />
                    <label className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                      Free Shipping Above Order (₹)
                    </label>
                  </div>
                  <input
                    type="checkbox"
                    checked={shippingForm.isFreeShippingEnabled}
                    onChange={(e) => setShippingForm({ ...shippingForm, isFreeShippingEnabled: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={shippingForm.freeShippingThreshold}
                    onChange={(e) => setShippingForm({ ...shippingForm, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-extrabold"
                  />
                </div>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                  Cart totals above this amount automatically receive 100% Free Shipping.
                </p>
              </div>

              {/* COD Fee */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-500" />
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Cash on Delivery (COD) Fee
                    </label>
                  </div>
                  <input
                    type="checkbox"
                    checked={shippingForm.isCodEnabled}
                    onChange={(e) => setShippingForm({ ...shippingForm, isCodEnabled: e.target.checked })}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={shippingForm.codFee}
                    onChange={(e) => setShippingForm({ ...shippingForm, codFee: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                </div>
                <p className="text-[11px] text-slate-400">Extra handling fee added if customer selects Cash on Delivery.</p>
              </div>
            </div>

            {/* Estimated Timelines & Express */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Delivery SLA Text (Shown on Storefront)
                </label>
                <input
                  type="text"
                  value={shippingForm.estimatedDeliveryDays}
                  onChange={(e) => setShippingForm({ ...shippingForm, estimatedDeliveryDays: e.target.value })}
                  placeholder="e.g. 3 - 5 Business Days"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Express 24-48h Delivery Rate (₹)
                </label>
                <input
                  type="number"
                  value={shippingForm.expressShippingRate}
                  onChange={(e) => setShippingForm({ ...shippingForm, expressShippingRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold"
                />
              </div>
            </div>

            {/* Weight Slabs Breakdown Table */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weight Slab Rules (Optional)</h3>
                  <p className="text-[11px] text-slate-400">Dynamic delivery fees based on package dead weight or volumetric weight</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-4">Slab Name</th>
                      <th className="py-2.5 px-4">Min Weight (Kg)</th>
                      <th className="py-2.5 px-4">Max Weight (Kg)</th>
                      <th className="py-2.5 px-4">Courier Rate (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {shippingForm.weightSlabs.map((slab, idx) => (
                      <tr key={slab.id}>
                        <td className="py-2.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{slab.label}</td>
                        <td className="py-2.5 px-4 font-mono">{slab.minWeight} kg</td>
                        <td className="py-2.5 px-4 font-mono">{slab.maxWeight} kg</td>
                        <td className="py-2.5 px-4">
                          <input
                            type="number"
                            value={slab.rate}
                            onChange={(e) => handleWeightSlabChange(idx, 'rate', e.target.value)}
                            className="w-24 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#00a2c7]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADD TOP CATEGORY                                                 */}
      {/* ========================================================================= */}
      {topModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Create New Top Category (Level 1)</h3>
            <form onSubmit={handleCreateTop} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Footwear & Bags"
                  value={newTop.name}
                  onChange={(e) => setNewTop({ ...newTop, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-[#00a2c7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Icon / Emoji</label>
                  <input
                    type="text"
                    value={newTop.icon}
                    onChange={(e) => setNewTop({ ...newTop, icon: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">URL Slug</label>
                  <input
                    type="text"
                    placeholder="auto-generated"
                    value={newTop.slug}
                    onChange={(e) => setNewTop({ ...newTop, slug: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTop.description}
                  onChange={(e) => setNewTop({ ...newTop, description: e.target.value })}
                  placeholder="Short description for SEO and catalog..."
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTopModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00a2c7] hover:bg-[#008ba3] text-white shadow-md shadow-cyan-500/25"
                >
                  Save Top Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD MID CATEGORY                                                 */}
      {/* ========================================================================= */}
      {midModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Create New Mid Category (Level 2)</h3>
            <form onSubmit={handleCreateMid} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Parent Top Category</label>
                <select
                  value={newMid.topCategoryId}
                  onChange={(e) => setNewMid({ ...newMid, topCategoryId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  {topCategories.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.icon} {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mid Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sports Footwear"
                  value={newMid.name}
                  onChange={(e) => setNewMid({ ...newMid, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setMidModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/25"
                >
                  Save Mid Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD END CATEGORY                                                 */}
      {/* ========================================================================= */}
      {endModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Create New End Category (Level 3)</h3>
            <form onSubmit={handleCreateEnd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Parent Mid Category</label>
                <select
                  value={newEnd.midCategoryId}
                  onChange={(e) => setNewEnd({ ...newEnd, midCategoryId: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  {midCategories.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Running Shoes"
                  value={newEnd.name}
                  onChange={(e) => setNewEnd({ ...newEnd, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEndModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25"
                >
                  Save End Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: ADD SIZE                                                         */}
      {/* ========================================================================= */}
      {sizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Add New Size Unit</h3>
            <form onSubmit={handleCreateSize} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Size Group</label>
                <select
                  value={newSize.group}
                  onChange={(e) => setNewSize({ ...newSize, group: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="Apparel Standard">Apparel Standard (XS, S, M, L...)</option>
                  <option value="Waist / Bottoms">Waist / Bottoms (28, 30, 32...)</option>
                  <option value="Footwear (IND/UK)">Footwear (UK-6, UK-7, UK-8...)</option>
                  <option value="Packaging / Weights">Packaging / Weights (500g, 1kg, 5kg...)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Size Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4XL or UK-12"
                  value={newSize.code}
                  onChange={(e) => setNewSize({ ...newSize, code: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Display Label</label>
                <input
                  type="text"
                  placeholder="e.g. 4X-Large (4XL)"
                  value={newSize.label}
                  onChange={(e) => setNewSize({ ...newSize, label: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSizeModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00a2c7] hover:bg-[#008ba3] text-white shadow-md shadow-cyan-500/25"
                >
                  Add Size
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: ADD COLOR                                                        */}
      {/* ========================================================================= */}
      {colorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white">Add New Color Swatch</h3>
            <form onSubmit={handleCreateColor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Color Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Maroon"
                  value={newColor.name}
                  onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Pick Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColor.hex}
                      onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700 p-0.5 bg-white"
                    />
                    <input
                      type="text"
                      value={newColor.hex}
                      onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Color Short Code</label>
                  <input
                    type="text"
                    placeholder="e.g. MRN"
                    value={newColor.code}
                    onChange={(e) => setNewColor({ ...newColor, code: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono uppercase"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl border border-slate-300 shadow-sm"
                  style={{ backgroundColor: newColor.hex }}
                />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {newColor.name || 'Sample Color'}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{newColor.hex}</div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setColorModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00a2c7] hover:bg-[#008ba3] text-white shadow-md shadow-cyan-500/25"
                >
                  Add Color
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

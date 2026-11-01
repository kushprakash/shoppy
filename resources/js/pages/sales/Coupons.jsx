import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  Tag,
  Plus,
  Search,
  Calendar,
  Percent,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Copy,
  Trash2,
  Edit,
  Power,
  Sparkles,
  ShoppingBag,
  TrendingUp,
  X,
  Lock,
  Boxes,
  Check,
  Filter
} from 'lucide-react';

export default function Coupons() {
  const { coupons, addCoupon, addBulkCoupons, updateCoupon, deleteCoupon, showToast } = useErp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'one_time', 'available', 'redeemed', 'percentage', 'flat', 'expired'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  // Form State for Create / Edit Coupon
  const [form, setForm] = useState({
    code: '',
    title: '',
    description: '',
    discountType: 'percentage', // 'percentage' | 'flat'
    discountValue: 10,
    maxDiscountAmount: 300,
    minOrderAmount: 999,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    quantity: 1, // Quantity for bulk 1-time coupons
    isOneTimeUse: true, // 1 coupon one time usable
    usageLimit: 1,
    isActive: true
  });

  const openCreateModal = () => {
    setEditingCoupon(null);
    setForm({
      code: '',
      title: 'Festival Promotional Offer',
      description: 'Single-use discount coupon valid on checkout.',
      discountType: 'percentage',
      discountValue: 15,
      maxDiscountAmount: 500,
      minOrderAmount: 999,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      quantity: 1,
      isOneTimeUse: true,
      usageLimit: 1,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code,
      title: coupon.title,
      description: coupon.description || '',
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      minOrderAmount: coupon.minOrderAmount || 0,
      expiryDate: coupon.expiryDate,
      quantity: 1,
      isOneTimeUse: coupon.isOneTimeUse !== false,
      usageLimit: coupon.usageLimit || 1,
      isActive: coupon.isActive !== false
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim()) {
      showToast('Coupon code / prefix is required', 'error');
      return;
    }

    const qty = parseInt(form.quantity) || 1;

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      discountValue: parseFloat(form.discountValue) || 0,
      maxDiscountAmount: parseFloat(form.maxDiscountAmount) || 0,
      minOrderAmount: parseFloat(form.minOrderAmount) || 0,
      quantity: qty,
      isOneTimeUse: qty > 1 ? true : (form.isOneTimeUse !== false),
      usageLimit: (qty > 1 || form.isOneTimeUse) ? 1 : (parseInt(form.usageLimit) || 500)
    };

    if (editingCoupon) {
      updateCoupon(editingCoupon.id, payload);
    } else {
      addCoupon(payload);
    }

    setIsModalOpen(false);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast(`Coupon code "${code}" copied to clipboard!`);
  };

  // Filtered coupons list
  const filteredCoupons = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return (coupons || []).filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        c.code.toLowerCase().includes(q) ||
        (c.title || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.batchId || '').toLowerCase().includes(q);

      if (!matchSearch) return false;

      const isExhausted = c.isOneTimeUse ? (c.usedCount || 0) >= 1 : (c.usageLimit ? (c.usedCount || 0) >= c.usageLimit : false);
      const isExpired = c.expiryDate < today;

      if (filterType === 'one_time') return c.isOneTimeUse;
      if (filterType === 'available') return !isExhausted && !isExpired && c.isActive;
      if (filterType === 'redeemed') return isExhausted;
      if (filterType === 'percentage') return c.discountType === 'percentage';
      if (filterType === 'flat') return c.discountType === 'flat';
      if (filterType === 'expired') return isExpired;

      return true;
    });
  }, [coupons, search, filterType]);

  // Metrics
  const today = new Date().toISOString().split('T')[0];
  const totalCoupons = (coupons || []).length;
  const oneTimeCoupons = (coupons || []).filter((c) => c.isOneTimeUse).length;
  const availableCoupons = (coupons || []).filter((c) => {
    const isExhausted = c.isOneTimeUse ? (c.usedCount || 0) >= 1 : (c.usageLimit ? (c.usedCount || 0) >= c.usageLimit : false);
    return !isExhausted && c.expiryDate >= today && c.isActive;
  }).length;
  const redeemedCoupons = (coupons || []).filter((c) => (c.usedCount || 0) >= 1).length;
  const totalRedemptions = (coupons || []).reduce((acc, c) => acc + (c.usedCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              E-Commerce Coupon &amp; Discount Vouchers
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              Bulk Creation &amp; 1-Time Usable Vouchers
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Create single promotional discount codes or generate bulk unique 1-time usable customer vouchers with minimum order slabs, expiry dates, and automated checkout redemption.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" /> + Create Coupon / Bulk Vouchers
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Coupons In System</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalCoupons}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Active promo codes &amp; customer vouchers</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">1-Time Usable Available</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {availableCoupons} <span className="text-xs text-slate-400 font-normal">/ {oneTimeCoupons}</span>
          </h3>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">Ready for single-order checkout</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Already Redeemed (Used)</p>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {redeemedCoupons}
          </h3>
          <p className="text-[10px] text-rose-500 mt-0.5 font-medium">Exhausted after 1-time checkout use</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders Redeemed</p>
          <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {totalRedemptions} Times
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Discounts applied on store checkouts</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search coupon code, batch, offer title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            All ({totalCoupons})
          </button>
          <button
            onClick={() => setFilterType('one_time')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap flex items-center gap-1 cursor-pointer ${
              filterType === 'one_time'
                ? 'bg-violet-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Lock className="w-3 h-3" /> 1-Time Vouchers ({oneTimeCoupons})
          </button>
          <button
            onClick={() => setFilterType('available')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
              filterType === 'available'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            ● Available Unused ({availableCoupons})
          </button>
          <button
            onClick={() => setFilterType('redeemed')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
              filterType === 'redeemed'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            ✓ Already Used ({redeemedCoupons})
          </button>
          <button
            onClick={() => setFilterType('percentage')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
              filterType === 'percentage'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            % Percentage
          </button>
          <button
            onClick={() => setFilterType('flat')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
              filterType === 'flat'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            ₹ Flat (Cash)
          </button>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Promo Code</th>
                <th className="px-4 py-3">Voucher Type / Rule</th>
                <th className="px-4 py-3">Offer Title / Description</th>
                <th className="px-4 py-3">Discount Value</th>
                <th className="px-4 py-3">Min Order Slab</th>
                <th className="px-4 py-3">Max Cap</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3 text-center">Redemption Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No coupons match your filter. Click "+ Create Coupon / Bulk Vouchers" to generate.
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => {
                  const isExpired = c.expiryDate < today;
                  const isExhausted = c.isOneTimeUse
                    ? (c.usedCount || 0) >= 1
                    : (c.usageLimit ? (c.usedCount || 0) >= c.usageLimit : false);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                      {/* Code */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-extrabold text-xs px-2.5 py-1 rounded-lg border tracking-wider flex items-center gap-1.5 ${
                            isExhausted
                              ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 border-slate-300 dark:border-slate-700 line-through'
                              : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                          }`}>
                            {c.isOneTimeUse && <Lock className="w-3 h-3 text-indigo-500" />}
                            {c.code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(c.code)}
                            title="Copy Voucher Code"
                            className="p-1 rounded text-slate-400 hover:text-indigo-600 transition cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {c.batchId && (
                          <span className="text-[9px] text-slate-400 font-mono block mt-0.5">
                            Batch: {c.batchId}
                          </span>
                        )}
                      </td>

                      {/* Voucher Type / Rule */}
                      <td className="px-4 py-3">
                        {c.isOneTimeUse ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-800 w-fit">
                              <Lock className="w-2.5 h-2.5 text-purple-600" /> 1-Time Usable
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              Single-Use (1 Order)
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 w-fit">
                              <Boxes className="w-2.5 h-2.5 text-cyan-600" /> Multi-Use Campaign
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              Limit: {c.usageLimit || 500} orders
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Title & Description */}
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900 dark:text-white">{c.title}</div>
                        {c.description && <div className="text-[10px] text-slate-500 truncate max-w-[220px]">{c.description}</div>}
                      </td>

                      {/* Discount Value */}
                      <td className="px-4 py-3">
                        {c.discountType === 'percentage' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded text-xs">
                            <Percent className="w-3 h-3" /> {c.discountValue}% OFF
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-xs">
                            <IndianRupee className="w-3 h-3" /> ₹{c.discountValue} Flat OFF
                          </span>
                        )}
                      </td>

                      {/* Min Order Slab */}
                      <td className="px-4 py-3 font-mono font-semibold text-slate-700 dark:text-slate-300">
                        {c.minOrderAmount > 0 ? `₹${c.minOrderAmount}` : 'No Min Cart'}
                      </td>

                      {/* Max Cap */}
                      <td className="px-4 py-3 font-mono text-slate-500">
                        {c.discountType === 'percentage' && c.maxDiscountAmount > 0
                          ? `Max ₹${c.maxDiscountAmount}`
                          : '—'}
                      </td>

                      {/* Expiry Date */}
                      <td className="px-4 py-3 font-mono">
                        <span className={isExpired ? 'text-rose-600 font-bold' : 'text-slate-600 dark:text-slate-400'}>
                          {c.expiryDate}
                        </span>
                        {isExpired && <span className="block text-[9px] text-rose-500 font-sans font-bold">Expired</span>}
                      </td>

                      {/* Status / Redemption Indicator */}
                      <td className="px-4 py-3 text-center">
                        {c.isOneTimeUse ? (
                          isExhausted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-900 shadow-xs">
                              <Check className="w-3 h-3 text-rose-600" />
                              REDEEMED (1/1)
                            </span>
                          ) : isExpired ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Expired
                            </span>
                          ) : !c.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              Disabled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              AVAILABLE (0/1)
                            </span>
                          )
                        ) : (
                          <div>
                            <button
                              onClick={() => updateCoupon(c.id, { isActive: !c.isActive })}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer ${
                                c.isActive && !isExpired
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}
                            >
                              <Power className="w-3 h-3" />
                              {c.isActive && !isExpired ? 'Active' : 'Disabled'}
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono block mt-1">
                              Used: {c.usedCount || 0} / {c.usageLimit || 500}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Edit Coupon"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteCoupon(c.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Delete Coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT COUPON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {editingCoupon
                    ? `Edit Coupon — ${editingCoupon.code}`
                    : parseInt(form.quantity) > 1
                    ? `Create Bulk Vouchers (${form.quantity} Quantity)`
                    : 'Create Promotional Coupon / Voucher'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="cursor-pointer">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code and Quantity (Quantity determines single vs bulk generation) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {parseInt(form.quantity) > 1 ? 'Base Code / Prefix *' : 'Coupon Code *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={parseInt(form.quantity) > 1 ? 'e.g. DIWALI50 or FESTIVE' : 'e.g. DIWALI20'}
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 uppercase focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {parseInt(form.quantity) > 1 ? 'Prefix for generating unique batch coupons' : 'Exact code customer will enter'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Quantity *</span>
                    {parseInt(form.quantity) > 1 && (
                      <span className="text-[10px] text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950 px-1.5 py-0.2 rounded">
                        Bulk
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="500"
                    disabled={!!editingCoupon}
                    value={form.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setForm({
                        ...form,
                        quantity: val,
                        isOneTimeUse: val > 1 ? true : form.isOneTimeUse,
                        usageLimit: val > 1 ? 1 : form.usageLimit
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">1 bar me multiple</span>
                </div>
              </div>

              {/* BULK LIVE PREVIEW BANNER (When Quantity > 1) */}
              {parseInt(form.quantity) > 1 && (
                <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span>⚡ Bulk Mode Active: Generating {form.quantity} Unique One-Time Usable Vouchers</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">
                    Yeh sabhi <strong>1-time usable</strong> rahenge. 1 coupon sirf 1 bar kisi bhi customer/order ke checkout pe apply hoga aur order punch hone ke bad automatically exhaust ho jayega.
                  </p>
                  <div className="font-mono text-[10px] bg-white dark:bg-slate-900 p-2 rounded-xl border border-indigo-100 dark:border-indigo-900 text-slate-700 dark:text-slate-300 truncate">
                    Preview: {(form.code || 'COUPON')}-01, {(form.code || 'COUPON')}-02, {(form.code || 'COUPON')}-03 ... {(form.code || 'COUPON')}-{String(form.quantity).padStart(2, '0')}
                  </div>
                </div>
              )}

              {/* VOUCHER USAGE RULE SELECTOR (When Quantity === 1) */}
              {parseInt(form.quantity) === 1 && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Voucher Redemption Rule *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className={`p-2.5 rounded-xl border flex items-start gap-2 cursor-pointer transition ${
                      form.isOneTimeUse
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      <input
                        type="radio"
                        name="voucherRule"
                        checked={form.isOneTimeUse}
                        onChange={() => setForm({ ...form, isOneTimeUse: true, usageLimit: 1 })}
                        className="mt-0.5 text-indigo-600"
                      />
                      <div>
                        <div>1-Time Usable (Single-Use)</div>
                        <p className="text-[10px] font-normal text-slate-500">1 bar hi use hoga, fir automatically exhaust</p>
                      </div>
                    </label>

                    <label className={`p-2.5 rounded-xl border flex items-start gap-2 cursor-pointer transition ${
                      !form.isOneTimeUse
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 text-indigo-900 dark:text-indigo-200 font-bold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}>
                      <input
                        type="radio"
                        name="voucherRule"
                        checked={!form.isOneTimeUse}
                        onChange={() => setForm({ ...form, isOneTimeUse: false, usageLimit: 500 })}
                        className="mt-0.5 text-indigo-600"
                      />
                      <div>
                        <div>Multi-Use Campaign</div>
                        <p className="text-[10px] font-normal text-slate-500">Multiple orders me redeem ho sakega</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Title & Customer Description */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Offer Tagline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Festival 20% OFF or Special VIP Gift Voucher"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Customer Description (Shown on Checkout)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Valid on all festive apparel shopping above ₹999..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Discount Type: Flat or Percentage */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Discount Type *
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none"
                  >
                    <option value="percentage">Percentage Discount (% OFF)</option>
                    <option value="flat">Flat Discount (₹ Cash OFF)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Discount Value {form.discountType === 'percentage' ? '(%)' : '(₹)'} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={form.discountType === 'percentage' ? '100' : '99999'}
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-bold font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Amount Slabs: Min Order Value & Max Discount Cap */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Min Order Amount Slab (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 999"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">0 = No minimum required</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={form.discountType === 'flat'}
                    placeholder={form.discountType === 'flat' ? 'N/A for flat' : 'e.g. 500'}
                    value={form.maxDiscountAmount}
                    onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Max limit on % discount</span>
                </div>
              </div>

              {/* Expiry Date & (Optional) Usage Limit for Multi-Use */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.expiryDate}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {form.isOneTimeUse || parseInt(form.quantity) > 1 ? 'Redemption Limit Per Voucher' : 'Total Redemption Limit'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    disabled={form.isOneTimeUse || parseInt(form.quantity) > 1}
                    value={form.isOneTimeUse || parseInt(form.quantity) > 1 ? 1 : form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    {form.isOneTimeUse || parseInt(form.quantity) > 1 ? '1 coupon = 1 time usable' : 'Max total redemptions'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isActive" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Active (Allow customers to apply immediately on checkout)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  {editingCoupon
                    ? 'Save Changes'
                    : parseInt(form.quantity) > 1
                    ? `Generate ${form.quantity} Vouchers`
                    : 'Publish Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

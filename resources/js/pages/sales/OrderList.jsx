import React, { useState, useMemo, useEffect } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  Search, Printer, FileText, Check, TrendingUp, TrendingDown,
  Filter, Receipt, ArrowRight, Plus, Truck, Package, Clock,
  CheckCircle, Send, X, AlertTriangle, ShieldCheck, Tag, Box,
  RefreshCw, Play, Pause, Navigation, Eye, CheckCircle2, History
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OrderList() {
  const {
    orders,
    setSelectedInvoice,
    updateOrderStatus,
    dispatchCourierOrder,
    shippingProviders,
    fetchShipmentStatus,
    syncAllActiveShipments,
    hasPermission
  } = useErp();

  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterChannel, setFilterChannel] = useState('all'); // 'all', 'offline', 'online', 'cod', 'paid', 'pakka', 'kachha', 'dues'

  // Shiprocket Automated Live Cron State
  const [isAutoCronActive, setIsAutoCronActive] = useState(true);
  const [cronCountdown, setCronCountdown] = useState(30);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [trackingModalOrder, setTrackingModalOrder] = useState(null);

  // Active Shipments that require tracking until "Delivered"
  const activeShipments = useMemo(() => {
    return orders.filter((o) => {
      const isOnline = (o.channelType || '') === 'online' || (o.channel || '').toLowerCase().includes('online');
      const hasAwb = !!(o.awb || o.awbNumber || o.courierPartner);
      const isPendingDelivery = !o.fulfillment?.includes('Delivered') &&
                                !o.fulfillment?.includes('Cancelled') &&
                                !o.fulfillment?.includes('Returned');
      return isOnline && hasAwb && isPendingDelivery;
    });
  }, [orders]);

  // AUTOMATED SHIPMENT CRON: Runs until all active shipments reach "Delivered"
  useEffect(() => {
    if (!isAutoCronActive || activeShipments.length === 0) {
      return;
    }

    const timer = setInterval(() => {
      setCronCountdown((prev) => {
        if (prev <= 1) {
          // Trigger automated background sync
          syncAllActiveShipments();
          setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          return 30; // reset 30s countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoCronActive, activeShipments.length, syncAllActiveShipments]);

  const handleManualSyncAll = () => {
    setIsSyncingAll(true);
    syncAllActiveShipments();
    setCronCountdown(30);
    setLastSyncTime(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    setTimeout(() => setIsSyncingAll(false), 700);
  };

  // Courier Dispatch Modal State (Preferred: Shiprocket Multi-Carrier)
  const [dispatchModalOrder, setDispatchModalOrder] = useState(null);
  const [dispatchForm, setDispatchForm] = useState({
    courierPartner: '(Recommended) Shiprocket Multi-Carrier (Express Surface & Air)',
    lengthCm: 25,
    widthCm: 18,
    heightCm: 8,
    weightKg: 0.8,
    shippingCharge: 70,
    pickupPincode: '302001',
    customerPincode: '302020',
    awbNumber: ''
  });

  // Delivery Punch Quick Selector State
  const [punchModalOrder, setPunchModalOrder] = useState(null);
  const [punchStatus, setPunchStatus] = useState('Dispatched');
  const [punchNote, setPunchNote] = useState('');

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        o.id.toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (o.phone || '').includes(q) ||
        (o.awb || o.awbNumber || '').toLowerCase().includes(q);

      if (!matchSearch) return false;

      if (filterChannel === 'offline') {
        return (o.channelType || 'offline') === 'offline' || (o.channel || '').toLowerCase().includes('pos');
      }
      if (filterChannel === 'online') {
        return (o.channelType || '') === 'online' || (o.channel || '').toLowerCase().includes('online');
      }
      if (filterChannel === 'cod') {
        const pm = (o.paymentMethod || '').toLowerCase();
        return pm.includes('cod') || pm.includes('cash on delivery') || o.paymentModeType === 'COD';
      }
      if (filterChannel === 'paid') {
        const pm = (o.paymentMethod || '').toLowerCase();
        return !pm.includes('cod') && (o.duesAmount || 0) === 0;
      }
      if (filterChannel === 'pakka') return (o.billType || 'pakka') === 'pakka';
      if (filterChannel === 'kachha') return (o.billType || 'pakka') === 'kachha';
      if (filterChannel === 'dues') return (o.duesAmount || 0) > 0;

      return true;
    });
  }, [orders, search, filterChannel]);

  // Aggregate Metrics
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalCost = orders.reduce((acc, o) => acc + (o.costTotal || (o.total * 0.7)), 0);
  const totalGrossProfit = totalRevenue - totalCost;
  const overallProfitMargin = totalRevenue > 0 ? ((totalGrossProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const totalDuesPending = orders.reduce((acc, o) => acc + (o.duesAmount || 0), 0);

  const openDispatchModal = (order) => {
    const existingDims = order.packageDimensions || {};
    setDispatchModalOrder(order);
    setDispatchForm({
      courierPartner: order.courierPartner || '(Recommended) Shiprocket Multi-Carrier (Express Surface & Air)',
      lengthCm: existingDims.lengthCm || 25,
      widthCm: existingDims.widthCm || 18,
      heightCm: existingDims.heightCm || 8,
      weightKg: existingDims.weightKg || 0.8,
      shippingCharge: order.shippingCharge || 70,
      pickupPincode: '302001',
      customerPincode: order.city?.match(/\d{6}/)?.[0] || '302020',
      awbNumber: order.awbNumber || order.awb || ''
    });
  };

  const handleDispatchSubmit = (e) => {
    e.preventDefault();
    if (!dispatchModalOrder) return;
    dispatchCourierOrder(dispatchModalOrder.id, dispatchForm);
    setDispatchModalOrder(null);
  };

  const openPunchModal = (order) => {
    setPunchModalOrder(order);
    setPunchStatus(order.fulfillment || 'Ready to Ship');
    setPunchNote('');
  };

  const handlePunchSubmit = (e) => {
    e.preventDefault();
    if (!punchModalOrder) return;
    const isCod = (punchModalOrder.paymentMethod || '').toLowerCase().includes('cod');
    const paymentStatus = punchStatus === 'Delivered' && isCod ? 'Paid (Collected on Delivery)' : punchModalOrder.paymentStatus;
    updateOrderStatus(punchModalOrder.id, {
      fulfillment: punchStatus,
      paymentStatus,
      notes: punchNote
    });
    setPunchModalOrder(null);
  };

  // Volumetric weight calculation: (L * W * H) / 5000
  const volumetricWeight = (
    (parseFloat(dispatchForm.lengthCm || 0) *
      parseFloat(dispatchForm.widthCm || 0) *
      parseFloat(dispatchForm.heightCm || 0)) /
    5000
  ).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              Orders & Sales Register
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-400">
              Offline + Online Live Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit walk-in POS counter sales, dispatch e-commerce packages with dimensions & weight, and auto-fetch Shiprocket tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('sales.manage_coupons') && (
            <button
              onClick={() => navigate('/shop-admin/coupons')}
              className="px-3.5 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center gap-1.5 border border-purple-200 dark:border-purple-800 transition"
            >
              <Tag className="w-4 h-4" /> Coupons Desk
            </button>
          )}
          {hasPermission('sales.pos_billing') && (
            <button
              onClick={() => navigate('/shop-admin/billing')}
              className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition"
            >
              <Plus className="w-4 h-4" /> New Sale / POS Bill
            </button>
          )}
        </div>
      </div>

      {/* SHIPROCKET AUTOMATED CRON & LIVE SHIPMENT TRACKING BANNER */}
      <div className="bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-cyan-900/10 dark:from-purple-950/40 dark:via-indigo-950/40 dark:to-cyan-950/40 border border-purple-200 dark:border-purple-800/80 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
              activeShipments.length > 0
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
            }`}>
              <Truck className="w-5 h-5" />
            </div>
            {activeShipments.length > 0 && isAutoCronActive && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                ⭐ Shiprocket Preferred Tracking & Automated Cron
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                Recommended Provider
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {activeShipments.length > 0 ? (
                <>
                  <strong className="text-purple-600 dark:text-purple-400 font-mono">{activeShipments.length}</strong> active shipment(s) undergoing delivery tracking.
                  {isAutoCronActive ? (
                    <span className="ml-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      (Live Cron ticks every 30s • Next in <span className="font-mono font-bold">{cronCountdown}s</span>)
                    </span>
                  ) : (
                    <span className="ml-1 text-amber-600 font-semibold">(Cron Paused)</span>
                  )}
                  {lastSyncTime && <span className="text-slate-400 ml-1">• Last synced at {lastSyncTime}</span>}
                </>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ All online shipments are currently Delivered & Closed! Cron automatically idle.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Global Manual Sync Button & Cron Pause/Resume Toggle */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {activeShipments.length > 0 && (
            <button
              onClick={() => setIsAutoCronActive(!isAutoCronActive)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border ${
                isAutoCronActive
                  ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
              }`}
              title={isAutoCronActive ? 'Pause background cron timer' : 'Resume background cron timer'}
            >
              {isAutoCronActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoCronActive ? 'Pause Cron' : 'Resume Cron'}</span>
            </button>
          )}

          <button
            onClick={handleManualSyncAll}
            disabled={isSyncingAll}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition active:scale-95 disabled:opacity-50"
            title="Immediately fetch shipment status from Shiprocket API for all non-delivered orders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>Fetch All Shipment Status Now</span>
          </button>
        </div>
      </div>

      {/* KPI Cards including Profit/Loss & Dues */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Sales Turnover</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ₹ {totalRevenue.toFixed(2)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">{orders.length} total billed invoices</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Gross Profit</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            + ₹ {totalGrossProfit.toFixed(2)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Average profit margin: {overallProfitMargin}%</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer Udhaar (Dues)</p>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ₹ {totalDuesPending.toFixed(2)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Pending collection from shoppers</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Shipments Tracked</p>
          <div className="flex items-center gap-3 mt-1.5">
            <div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 block font-mono">
                {activeShipments.length} Active
              </span>
              <span className="text-[10px] text-slate-400">Under Courier Sync</span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block font-mono">
                {orders.filter((o) => (o.fulfillment || '').includes('Delivered')).length} Delivered
              </span>
              <span className="text-[10px] text-slate-400">Completed Orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Order ID, Customer, Phone, AWB..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto text-xs">
          <button
            onClick={() => setFilterChannel('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${filterChannel === 'all'
                ? 'bg-[#00a2c7] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
          >
            All Bills ({orders.length})
          </button>
          <button
            onClick={() => setFilterChannel('online')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${filterChannel === 'online'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
          >
            Online E-Commerce ({orders.filter((o) => (o.channelType || '') === 'online' || (o.channel || '').includes('Storefront')).length})
          </button>
          <button
            onClick={() => setFilterChannel('cod')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${filterChannel === 'cod'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
          >
            COD Orders
          </button>
          <button
            onClick={() => setFilterChannel('paid')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${filterChannel === 'paid'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
          >
            Prepaid Online
          </button>
          <button
            onClick={() => setFilterChannel('offline')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${filterChannel === 'offline'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
          >
            Offline POS Counter
          </button>
          <button
            onClick={() => setFilterChannel('dues')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap ${filterChannel === 'dues'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
          >
            Dues Pending
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Order / Date</th>
                <th className="px-4 py-3">Customer Details</th>
                <th className="px-4 py-3">Channel & Mode</th>
                <th className="px-4 py-3">Bill & Total</th>
                <th className="px-4 py-3">Payment & COD / Paid</th>
                <th className="px-4 py-3">Delivery Status & Shiprocket Tracking</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((o) => {
                const isOffline = (o.channelType || 'offline') === 'offline' || (o.channel || '').toLowerCase().includes('pos');
                const isCod = (o.paymentMethod || '').toLowerCase().includes('cod') || o.paymentModeType === 'COD';
                const isPaid = !isCod && (o.duesAmount || 0) === 0;
                const fulfillment = o.fulfillment || (isOffline ? 'Completed (Handover)' : 'Ready to Ship');
                const dims = o.packageDimensions;
                const isShipmentActive = !isOffline && (o.awb || o.awbNumber || o.courierPartner) &&
                                         !fulfillment.includes('Delivered') &&
                                         !fulfillment.includes('Cancelled') &&
                                         !fulfillment.includes('Returned');

                return (
                  <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                    {/* Order ID & Date */}
                    <td className="px-4 py-3">
                      <div className="font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {o.id}
                        {o.couponCode && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            🏷️ {o.couponCode} (-₹{o.couponDiscount})
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{o.date}</div>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{o.customerName}</div>
                      <div className="text-[10px] text-slate-400">{o.phone} • {o.city}</div>
                    </td>

                    {/* Channel */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${isOffline
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                        {isOffline ? 'Offline (POS Counter)' : 'Online (Storefront)'}
                      </span>
                      <div className="text-[10px] text-slate-400 mt-0.5">{o.channel}</div>
                    </td>

                    {/* Grand Total & Shipping */}
                    <td className="px-4 py-3 font-mono">
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        ₹ {o.total.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {o.shippingCharge ? `Shipping: ₹${o.shippingCharge.toFixed(2)}` : 'Free Shipping'}
                      </div>
                    </td>

                    {/* Payment Method & COD vs Paid status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 mb-1">
                        {isCod ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" /> COD (Cash on Delivery)
                          </span>
                        ) : isPaid ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> PAID (Online Gateway)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-400">
                            Due: ₹ {o.duesAmount?.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                        {o.paymentMethod}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {o.paymentStatus || (isPaid ? 'Paid' : 'Pending')}
                      </span>
                    </td>

                    {/* Delivery Status, Courier & Shiprocket Fetch Status */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          fulfillment.includes('Delivered')
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : fulfillment.includes('Dispatched') || fulfillment.includes('Transit')
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : fulfillment.includes('Out for Delivery')
                            ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {fulfillment}
                        </span>

                        {/* MANUAL SHIPMENT STATUS FETCH BUTTON (Shiprocket API) */}
                        {isShipmentActive && hasPermission('sales.track_shipment') && (
                          <button
                            onClick={() => fetchShipmentStatus(o.id)}
                            className="px-2 py-0.5 rounded bg-purple-100 hover:bg-purple-200 dark:bg-purple-950 dark:hover:bg-purple-900 text-purple-700 dark:text-purple-300 text-[10px] font-bold transition flex items-center gap-1 border border-purple-300 dark:border-purple-800"
                            title="Manually query Shiprocket tracking API for this parcel"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>Fetch Status</span>
                          </button>
                        )}

                        {/* Quick Delivery Punch Button */}
                        <button
                          onClick={() => openPunchModal(o)}
                          title="Punch delivery status update"
                          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-[10px] font-bold transition"
                        >
                          Punch
                        </button>
                      </div>

                      {/* Courier & AWB */}
                      {o.courierPartner && (
                        <div className="text-[10px] text-slate-600 dark:text-slate-400 font-mono flex items-center gap-1">
                          <span>🚚 {o.courierPartner.replace(/\(.*?\)/g, '').trim()}</span>
                          <span>•</span>
                          <button
                            onClick={() => setTrackingModalOrder(o)}
                            className="font-bold text-purple-600 dark:text-purple-400 hover:underline"
                            title="Click to view transit timeline"
                          >
                            {o.awb || o.awbNumber || 'No AWB'}
                          </button>
                        </div>
                      )}

                      {dims && (
                        <div className="text-[9px] text-slate-400 font-mono">
                          📦 {dims.lengthCm}×{dims.widthCm}×{dims.heightCm} cm • {dims.weightKg} kg
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {!isOffline && hasPermission('sales.courier_post') && (
                          <button
                            onClick={() => openDispatchModal(o)}
                            className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-xs transition inline-flex items-center gap-1"
                            title="Enter dimensions & weight and dispatch to Shiprocket"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            {o.awb || o.awbNumber ? 'Re-Dispatch' : 'Courier Post'}
                          </button>
                        )}
                        {hasPermission('sales.print_invoice') && (
                          <button
                            onClick={() => setSelectedInvoice(o)}
                            className="px-3 py-1.5 rounded-lg bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-[11px] shadow-xs transition inline-flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" /> Print Bill
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* COURIER DISPATCH MODAL (Preferred / Recommended: Shiprocket) */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Courier Dispatch & Package Dimensions
                  </h3>
                  <p className="text-xs text-slate-400">
                    Order {dispatchModalOrder.id} • {dispatchModalOrder.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDispatchModalOrder(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PREFERRED SHIPROCKET PARTNER HIGHLIGHT */}
            <div className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border border-purple-200 dark:border-purple-800/80 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <div>
                  <span className="font-extrabold text-purple-900 dark:text-purple-200 block">
                    Preferred Courier: Shiprocket Multi-Carrier
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Instant AWB generation & automatic live background cron tracking until parcel delivery.
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-purple-600 text-white shrink-0">
                RECOMMENDED
              </span>
            </div>

            <form onSubmit={handleDispatchSubmit} className="space-y-4 mt-4 text-xs">
              {/* Courier Partner Selection */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Courier Shipping Partner
                </label>
                <select
                  value={dispatchForm.courierPartner}
                  onChange={(e) => setDispatchForm({ ...dispatchForm, courierPartner: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-purple-300 dark:border-purple-700 bg-purple-50/50 dark:bg-purple-950/40 font-bold text-purple-900 dark:text-purple-200"
                >
                  <option value="(Recommended) Shiprocket Multi-Carrier (Express Surface & Air)">
                    ⭐ (Recommended) Shiprocket Multi-Carrier (Express Surface & Air)
                  </option>
                  <option value="NimbusPost Smart Automation">NimbusPost Smart Automation</option>
                  <option value="Delhivery Surface Express">Delhivery Surface Express</option>
                  <option value="BlueDart Air Express">BlueDart Air Express</option>
                  <option value="iThink Logistics Express">iThink Logistics Express</option>
                </select>
              </div>

              {/* Package Dimensions (Length, Width, Height in CM) */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Package Dimensions (L × W × H in CM)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Length (cm)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      value={dispatchForm.lengthCm}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, lengthCm: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Width (cm)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      value={dispatchForm.widthCm}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, widthCm: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-0.5">Height (cm)</span>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      required
                      value={dispatchForm.heightCm}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, heightCm: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Package Weight & Volumetric Weight Comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Actual Dead Weight (KG)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    required
                    value={dispatchForm.weightKg}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, weightKg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Volumetric Weight (KG)
                  </label>
                  <div className="w-full px-3 py-2 rounded-xl border border-dashed border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30 font-bold text-purple-700 dark:text-purple-300">
                    {volumetricWeight} kg
                  </div>
                </div>
              </div>

              {/* Shipping Charges & AWB Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Shipping Freight Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={dispatchForm.shippingCharge}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, shippingCharge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Custom AWB / Airway Bill (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Auto-generated if empty"
                    value={dispatchForm.awbNumber}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, awbNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono uppercase"
                  />
                </div>
              </div>

              {/* COD Notice if applicable */}
              {(dispatchModalOrder.paymentMethod || '').toLowerCase().includes('cod') && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <div>
                    <span className="font-bold">COD Order Dispatch:</span> Courier partner will collect
                    <strong> ₹{dispatchModalOrder.total?.toFixed(2)}</strong> cash from customer at the time of delivery.
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setDispatchModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-purple-500/20 transition"
                >
                  <Send className="w-4 h-4" /> Post to Shiprocket & Generate AWB
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIVE SHIPMENT TRACKING TIMELINE MODAL */}
      {trackingModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 flex items-center justify-center font-bold">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Live Shipment Tracking
                  </h3>
                  <p className="text-xs text-slate-400">Order #{trackingModalOrder.id}</p>
                </div>
              </div>
              <button
                onClick={() => setTrackingModalOrder(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Courier & AWB Header */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Courier Partner</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {trackingModalOrder.courierPartner || 'Shiprocket Multi-Carrier'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Airway Bill (AWB)</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                    {trackingModalOrder.awb || trackingModalOrder.awbNumber || 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Transit Timeline Stepper */}
              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-700 pl-8">
                {/* 1. Order Booked */}
                <div className="relative">
                  <span className="absolute -left-8 top-0.5 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                    ✓
                  </span>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">Order Booked & Manifested</h5>
                  <p className="text-[10px] text-slate-400">{trackingModalOrder.date} • Central Warehouse, Jaipur</p>
                </div>

                {/* 2. Dispatched */}
                <div className="relative">
                  <span className={`absolute -left-8 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    trackingModalOrder.fulfillment ? 'bg-emerald-500 text-white' : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                  }`}>
                    ✓
                  </span>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">Handed over to Shiprocket Courier</h5>
                  <p className="text-[10px] text-slate-400">{trackingModalOrder.dispatchedAt || trackingModalOrder.date} • Jaipur Hub</p>
                </div>

                {/* 3. In-Transit */}
                <div className="relative">
                  <span className={`absolute -left-8 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    trackingModalOrder.fulfillment?.includes('Transit') || trackingModalOrder.fulfillment?.includes('Delivery') || trackingModalOrder.fulfillment?.includes('Delivered')
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {trackingModalOrder.fulfillment?.includes('Transit') || trackingModalOrder.fulfillment?.includes('Delivery') || trackingModalOrder.fulfillment?.includes('Delivered') ? '✓' : '3'}
                  </span>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">In-Transit via Regional Hub</h5>
                  <p className="text-[10px] text-slate-400">Jaipur Metro Sorting Hub Facility</p>
                </div>

                {/* 4. Out for Delivery */}
                <div className="relative">
                  <span className={`absolute -left-8 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    trackingModalOrder.fulfillment?.includes('Out for Delivery') || trackingModalOrder.fulfillment?.includes('Delivered')
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {trackingModalOrder.fulfillment?.includes('Out for Delivery') || trackingModalOrder.fulfillment?.includes('Delivered') ? '✓' : '4'}
                  </span>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">Out for Delivery</h5>
                  <p className="text-[10px] text-slate-400">Delivery executive assigned with parcel</p>
                </div>

                {/* 5. Delivered */}
                <div className="relative">
                  <span className={`absolute -left-8 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    trackingModalOrder.fulfillment?.includes('Delivered')
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {trackingModalOrder.fulfillment?.includes('Delivered') ? '✓' : '5'}
                  </span>
                  <h5 className="font-bold text-slate-800 dark:text-slate-200">Delivered & Handover Complete</h5>
                  <p className="text-[10px] text-slate-400">Customer Doorstep ({trackingModalOrder.city || 'Destination'})</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    fetchShipmentStatus(trackingModalOrder.id);
                    setTrackingModalOrder(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/20 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Fetch Latest Status
                </button>
                <button
                  type="button"
                  onClick={() => setTrackingModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELIVERY PUNCH MODAL (Store Manager Live Status Update) */}
      {punchModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center font-bold">
                  <CheckCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Delivery Punch Desk
                  </h3>
                  <p className="text-xs text-slate-400">Order #{punchModalOrder.id}</p>
                </div>
              </div>
              <button
                onClick={() => setPunchModalOrder(null)}
                className="p-1 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePunchSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Select New Delivery Status
                </label>
                <select
                  value={punchStatus}
                  onChange={(e) => setPunchStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                >
                  <option value="Ready to Ship">Ready to Ship (Packed in Store)</option>
                  <option value="Dispatched">Dispatched (Handed to Courier)</option>
                  <option value="In-Transit">In-Transit (Hub to Destination)</option>
                  <option value="Out for Delivery">Out for Delivery (Courier Boy on Way)</option>
                  <option value="Delivered">Delivered (Handover Complete)</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Returned / RTO">Returned / RTO (Customer Refused / Undelivered)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Agent / Manager Remarks (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g., Delivered to recipient security desk, OTP verified..."
                  value={punchNote}
                  onChange={(e) => setPunchNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {(punchModalOrder.paymentMethod || '').toLowerCase().includes('cod') && punchStatus === 'Delivered' && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Marking as Delivered will automatically update payment status to <strong>"Paid (Collected on Delivery)"</strong>.
                  </span>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPunchModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition"
                >
                  <Check className="w-4 h-4" /> Punch Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}



import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useErp } from '../context/ErpContext';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingCart,
  Package,
  Wallet,
  Plus,
  Zap,
  Boxes,
  Printer,
  ArrowUpRight,
  Check,
  Eye,
  Layers,
  Receipt,
  FileText,
  Users,
  Barcode,
  BarChart3,
  AlertTriangle,
  ShieldCheck,
  CreditCard,
  Truck,
  Clock,
  Store,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const formatINR = (value) => {
  const num = Number(value) || 0;
  return num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const toLocalDateKey = (d) => {
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${dy}`;
};

const getOrderDateKey = (order) => {
  const raw = order?.createdAt || order?.date || '';
  if (!raw) return '';
  const str = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    return str.slice(0, 10);
  }
  const parsed = new Date(str);
  return !isNaN(parsed.getTime()) ? toLocalDateKey(parsed) : '';
};

const isOrderCancelled = (order) => {
  const status = String(order?.orderStatus || order?.fulfillment || '').toLowerCase();
  return status.includes('cancel') || status.includes('void');
};

const isOnlineOrder = (order) => {
  const ch = String(order?.channelType || order?.channel || '').toLowerCase();
  return ch.includes('online') || ch.includes('web') || ch.includes('ecom') || ch.includes('storefront');
};

const CATEGORY_COLORS = [
  { bar: 'bg-[#00a2c7]', dot: 'bg-[#00a2c7]' },
  { bar: 'bg-indigo-500', dot: 'bg-indigo-500' },
  { bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  { bar: 'bg-amber-500', dot: 'bg-amber-500' },
  { bar: 'bg-purple-500', dot: 'bg-purple-500' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    shopCode,
    storeName,
    storeSettings,
    currentUser,
    products = [],
    orders = [],
    customers = [],
    suppliers = [],
    purchaseBills = [],
    expenses = [],
    branches = [],
    gateways = [],
    shippingProviders = [],
    shiftData = {},
    setSelectedInvoice,
    setIsZReportOpen,
    setIsStockAdjustmentOpen
  } = useErp();

  const [invoiceChannelFilter, setInvoiceChannelFilter] = useState('all');

  const analytics = useMemo(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayKey = toLocalDateKey(today);
    const yesterdayKey = toLocalDateKey(yesterday);

    const validOrders = (orders || []).filter((o) => !isOrderCancelled(o));
    const todayOrders = validOrders.filter((o) => getOrderDateKey(o) === todayKey);
    const yesterdayOrders = validOrders.filter((o) => getOrderDateKey(o) === yesterdayKey);

    const todaySales = todayOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const yesterdaySales = yesterdayOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const allTimeSales = validOrders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

    let salesDeltaPercent = null;
    if (yesterdaySales > 0) {
      salesDeltaPercent = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
    }

    const todayPosCount = todayOrders.filter((o) => !isOnlineOrder(o)).length;
    const todayOnlineCount = todayOrders.filter((o) => isOnlineOrder(o)).length;
    const todayAvgOrder = todayOrders.length > 0 ? todaySales / todayOrders.length : 0;

    // Catalog & Variants metrics
    const totalProducts = (products || []).length;
    const totalVariants = (products || []).reduce((sum, p) => {
      if (Array.isArray(p.variants) && p.variants.length > 0) {
        return sum + p.variants.length;
      }
      return sum + (parseInt(p.variantCount, 10) || 0);
    }, 0);

    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalStockUnits = 0;

    (products || []).forEach((p) => {
      const qty = parseFloat(p.stock ?? 0) || 0;
      const threshold = parseFloat(p.reorderLevel ?? 5) || 5;
      totalStockUnits += qty;
      if (qty <= 0) outOfStockCount += 1;
      else if (qty <= threshold) lowStockCount += 1;
      else inStockCount += 1;
    });

    const lowOrOutCount = lowStockCount + outOfStockCount;

    // Category Share: real revenue share if sales exist, otherwise real catalog SKU breakdown
    const productById = new Map();
    const productByName = new Map();
    (products || []).forEach((p) => {
      if (p.id) productById.set(String(p.id), p);
      if (p.name) productByName.set(String(p.name).toLowerCase(), p);
    });

    const revenueMap = new Map();
    let totalCategorySales = 0;

    validOrders.forEach((o) => {
      if (Array.isArray(o.items) && o.items.length > 0) {
        o.items.forEach((it) => {
          const matched =
            productById.get(String(it.productId || '')) ||
            productByName.get(String(it.name || '').toLowerCase());
          const cat = matched?.topCategoryName || matched?.category || 'General Retail';
          const lineAmt = parseFloat(it.total ?? (parseFloat(it.price || 0) * parseFloat(it.qty || 1))) || 0;
          revenueMap.set(cat, (revenueMap.get(cat) || 0) + lineAmt);
          totalCategorySales += lineAmt;
        });
      } else {
        const cat = isOnlineOrder(o) ? 'Online Storefront' : 'POS Counter';
        const amt = parseFloat(o.total || 0) || 0;
        revenueMap.set(cat, (revenueMap.get(cat) || 0) + amt);
        totalCategorySales += amt;
      }
    });

    let categoryMode = 'sales';
    let categoryShares = [];

    if (totalCategorySales > 0 && revenueMap.size > 0) {
      categoryShares = Array.from(revenueMap.entries())
        .map(([name, amount]) => ({
          name,
          amount,
          percent: Math.round((amount / totalCategorySales) * 100)
        }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);
    } else if (totalProducts > 0) {
      categoryMode = 'catalog';
      const catCountMap = new Map();
      (products || []).forEach((p) => {
        const cat = p.topCategoryName || p.category || 'General Retail';
        catCountMap.set(cat, (catCountMap.get(cat) || 0) + 1);
      });
      categoryShares = Array.from(catCountMap.entries())
        .map(([name, count]) => ({
          name,
          count,
          percent: Math.round((count / totalProducts) * 100)
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    }

    // Customers, Dues & Expenses
    const totalCustomers = (customers || []).length;
    const customerReceivables = (customers || []).reduce((sum, c) => sum + (parseFloat(c.balanceDue) || 0), 0);
    const supplierPayables = (suppliers || []).reduce((sum, s) => sum + (parseFloat(s.currentBalance) || 0), 0);
    const totalExpenses = (expenses || []).reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

    // Integrations health
    const activeGatewaysCount = (gateways || []).filter((g) => g.is_active).length;
    const activeCouriersCount = (shippingProviders || []).filter((s) => s.is_active).length;

    return {
      todaySales,
      yesterdaySales,
      allTimeSales,
      salesDeltaPercent,
      todayOrdersCount: todayOrders.length,
      allOrdersCount: validOrders.length,
      todayPosCount,
      todayOnlineCount,
      todayAvgOrder,
      totalProducts,
      totalVariants,
      totalStockUnits,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      lowOrOutCount,
      categoryMode,
      categoryShares,
      totalCustomers,
      customerReceivables,
      supplierPayables,
      totalExpenses,
      activeGatewaysCount,
      activeCouriersCount
    };
  }, [orders, products, customers, suppliers, expenses, gateways, shippingProviders]);

  const filteredRecentOrders = useMemo(() => {
    const list = (orders || []).filter((o) => {
      if (invoiceChannelFilter === 'pos') return !isOnlineOrder(o);
      if (invoiceChannelFilter === 'online') return isOnlineOrder(o);
      return true;
    });
    return list.slice(0, 8);
  }, [orders, invoiceChannelFilter]);

  const operatorName =
    shiftData?.cashier ||
    currentUser?.name ||
    storeSettings?.owner_name ||
    'Store Owner';

  const todayDisplayDate = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const digitalShiftTotal =
    (parseFloat(shiftData?.upiSales || 0) || 0) +
    (parseFloat(shiftData?.cardSales || 0) || 0) +
    (parseFloat(shiftData?.otherSales || 0) || 0);

  const gstConfigured = Boolean(storeSettings?.gst_number && storeSettings.gst_number.trim());

  const quickShortcuts = [
    {
      label: 'New POS Bill',
      sub: 'Fast counter checkout',
      icon: Zap,
      accent: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      onClick: () => navigate('/shop-admin/billing')
    },
    {
      label: 'Add Product',
      sub: 'SKUs, variants & GST',
      icon: Plus,
      accent: 'text-[#00a2c7] bg-cyan-500/10 border-cyan-500/20',
      onClick: () => navigate('/shop-admin/products/create')
    },
    {
      label: 'All Products',
      sub: `${analytics.totalProducts} SKUs · ${analytics.totalVariants} Var`,
      icon: Package,
      accent: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      onClick: () => navigate('/shop-admin/products')
    },
    {
      label: 'Stock Adjust',
      sub: `${analytics.lowOrOutCount} stock alerts`,
      icon: Boxes,
      accent: 'text-violet-600 dark:text-violet-400 bg-violet-500/10 border-violet-500/20',
      onClick: () => setIsStockAdjustmentOpen(true)
    },
    {
      label: 'Orders & Bills',
      sub: `${analytics.allOrdersCount} total invoices`,
      icon: Receipt,
      accent: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20',
      onClick: () => navigate('/shop-admin/orders')
    },
    {
      label: 'GST Tax Bills',
      sub: 'B2B / B2C tax ledger',
      icon: FileText,
      accent: 'text-teal-600 dark:text-teal-400 bg-teal-500/10 border-teal-500/20',
      onClick: () => navigate('/shop-admin/gst-invoices')
    },
    {
      label: 'Purchase Bills',
      sub: `${(purchaseBills || []).length} inward entries`,
      icon: Truck,
      accent: 'text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20',
      onClick: () => navigate('/shop-admin/purchase-bills')
    },
    {
      label: 'Customers & Dues',
      sub: `${analytics.totalCustomers} parties saved`,
      icon: Users,
      accent: 'text-pink-600 dark:text-pink-400 bg-pink-500/10 border-pink-500/20',
      onClick: () => navigate('/shop-admin/customers')
    },
    {
      label: 'Barcode Desk',
      sub: 'Thermal label print',
      icon: Barcode,
      accent: 'text-slate-700 dark:text-slate-300 bg-slate-500/10 border-slate-500/20',
      onClick: () => navigate('/shop-admin/barcodes')
    },
    {
      label: 'Shift Z-Report',
      sub: 'Cash close & print',
      icon: Printer,
      accent: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20',
      onClick: () => setIsZReportOpen(true)
    }
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Store Command Overview Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/70 to-cyan-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950/30 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#00a2c7]/10 text-[#00a2c7] border border-[#00a2c7]/20">
                <Store className="w-3.5 h-3.5" />
                {storeName || 'Store Dashboard'}
              </span>
              {shopCode && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {shopCode}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                {todayDisplayDate}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back, {operatorName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Live store operations across{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {(branches || []).length || 1} active branch
              </span>
              {' · '}All-time sales{' '}
              <span className="font-bold text-slate-800 dark:text-white tabular-nums">
                ₹ {formatINR(analytics.allTimeSales)}
              </span>
              {' · '}
              <span className="font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                {analytics.totalProducts} products / {analytics.totalVariants} variants
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => navigate('/shop-admin/profit-loss')}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            >
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              <span>P&amp;L Analytics</span>
            </button>

            <button
              onClick={() => navigate('/shop-admin/products/create')}
              className="px-3.5 py-2 rounded-xl border border-cyan-200 dark:border-cyan-800 bg-cyan-50/70 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-xs font-bold text-[#008ba3] dark:text-[#38bdf8] inline-flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>

            <button
              onClick={() => navigate('/shop-admin/billing')}
              className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-extrabold inline-flex items-center gap-1.5 shadow-sm shadow-[#00a2c7]/25 transition cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>Launch POS Billing</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top 4 Live KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* KPI 1: Today's Gross Sales */}
        <div
          onClick={() => navigate('/shop-admin/orders')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-[#00a2c7]/50 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Today&apos;s Gross Sales
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 tabular-nums tracking-tight">
                ₹ {formatINR(analytics.todaySales)}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-100 dark:border-cyan-900 flex items-center justify-center text-[#00a2c7] shrink-0 group-hover:scale-105 transition">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            {analytics.salesDeltaPercent !== null ? (
              <span
                className={`inline-flex items-center gap-1 font-bold ${
                  analytics.salesDeltaPercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                }`}
              >
                {analytics.salesDeltaPercent >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                <span>
                  {analytics.salesDeltaPercent >= 0 ? '+' : ''}
                  {analytics.salesDeltaPercent.toFixed(1)}% vs yesterday
                </span>
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                {analytics.todayOrdersCount > 0 ? 'Live billing active today' : 'No sales recorded today'}
              </span>
            )}
            <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
              Avg: ₹ {formatINR(analytics.todayAvgOrder)}
            </span>
          </div>
        </div>

        {/* KPI 2: Today's Orders */}
        <div
          onClick={() => navigate('/shop-admin/orders')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-400/50 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Today&apos;s Orders
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 tabular-nums tracking-tight">
                {analytics.todayOrdersCount} {analytics.todayOrdersCount === 1 ? 'Order' : 'Orders'}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:scale-105 transition">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300 font-semibold tabular-nums">
              {analytics.todayPosCount} POS Counter · {analytics.todayOnlineCount} Online
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 tabular-nums">
              All-time: {analytics.allOrdersCount}
            </span>
          </div>
        </div>

        {/* KPI 3: Catalog Products & Variants (Explicitly displays Variant count!) */}
        <div
          onClick={() => navigate('/shop-admin/products')}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-emerald-400/50 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Catalog &amp; Variants
              </p>
              <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
                  {analytics.totalProducts} {analytics.totalProducts === 1 ? 'Product' : 'Products'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 tabular-nums">
                  <Layers className="w-3 h-3" />
                  {analytics.totalVariants} {analytics.totalVariants === 1 ? 'Variant' : 'Variants'}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:scale-105 transition">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {analytics.inStockCount} In Stock ({analytics.totalStockUnits} Qty)
            </span>
            <span
              className={`font-bold tabular-nums ${
                analytics.lowOrOutCount > 0
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-400'
              }`}
            >
              {analytics.lowOrOutCount} Low / Out
            </span>
          </div>
        </div>

        {/* KPI 4: Active Shift Drawer (100% Dynamic Operator & Live Drawer Cash) */}
        <div
          onClick={() => setIsZReportOpen(true)}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-amber-400/50 hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Active Shift Drawer
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1.5 tabular-nums tracking-tight">
                ₹ {formatINR(shiftData?.expectedCashInDrawer || 0)}
              </h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 group-hover:scale-105 transition">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-300 truncate" title={`${shiftData?.shiftId || 'Shift #1'} — Open (${operatorName})`}>
              {shiftData?.shiftId || 'Shift #1'} — Open ({operatorName})
            </span>
            <span className="text-[11px] font-bold text-[#00a2c7] shrink-0 tabular-nums">
              Digital: ₹{formatINR(digitalShiftTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Shortcuts Command Dock */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00a2c7]" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Quick Actions &amp; Module Shortcuts
            </h3>
          </div>
          <span className="text-[11px] font-medium text-slate-400 hidden sm:inline">
            One-click navigation across POS, catalog, inventory &amp; accounting
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {quickShortcuts.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                className="flex items-center gap-3 p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-800/70 hover:border-[#00a2c7]/50 hover:shadow-xs transition text-left cursor-pointer group"
              >
                <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 group-hover:scale-105 transition ${item.accent}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {item.sub}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Secondary Business Pulse Row (Receivables, Payables, Expenses, Stock Health) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => navigate('/shop-admin/customers')}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-left hover:border-[#00a2c7]/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Customer Receivables</span>
            <Users className="w-3.5 h-3.5 text-pink-500" />
          </div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            ₹ {formatINR(analytics.customerReceivables)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{analytics.totalCustomers} registered customers</div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/shop-admin/suppliers')}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-left hover:border-[#00a2c7]/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Supplier Payables</span>
            <Truck className="w-3.5 h-3.5 text-orange-500" />
          </div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            ₹ {formatINR(analytics.supplierPayables)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{(suppliers || []).length} active suppliers</div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/shop-admin/expenses')}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-left hover:border-[#00a2c7]/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Recorded Expenses</span>
            <Receipt className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            ₹ {formatINR(analytics.totalExpenses)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{(expenses || []).length} expense vouchers</div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/shop-admin/inventory/low-stock')}
          className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-3 text-left hover:border-[#00a2c7]/40 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Low / Out-of-Stock Alerts</span>
            <AlertTriangle className={`w-3.5 h-3.5 ${analytics.lowOrOutCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <div className="text-base font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {analytics.lowOrOutCount} {analytics.lowOrOutCount === 1 ? 'SKU' : 'SKUs'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {analytics.outOfStockCount} out of stock · {analytics.lowStockCount} low
          </div>
        </button>
      </div>

      {/* 5. Main Operations Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent Sales & Invoices Table with Direct Print Tax Bill Option */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Recent Sales &amp; Invoices</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums">
                  {filteredRecentOrders.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Live transactions across POS counter and online storefront with 1-click Thermal / A4 Tax Bill print
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-[11px] font-bold">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'pos', label: 'POS' },
                  { key: 'online', label: 'Online' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setInvoiceChannelFilter(tab.key)}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      invoiceChannelFilter === tab.key
                        ? 'bg-white dark:bg-slate-900 text-[#00a2c7] shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => navigate('/shop-admin/orders')}
                className="text-xs font-bold text-[#00a2c7] hover:underline flex items-center gap-1 cursor-pointer ml-1"
              >
                <span>View All</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {filteredRecentOrders.length > 0 ? (
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="px-3 py-2.5">Invoice #</th>
                    <th className="px-3 py-2.5">Customer</th>
                    <th className="px-3 py-2.5">Channel</th>
                    <th className="px-3 py-2.5">Amount</th>
                    <th className="px-3 py-2.5">Payment</th>
                    <th className="px-3 py-2.5 text-right">Print / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRecentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-3 py-3">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          {o.orderNumber || o.id}
                        </div>
                        {o.date && (
                          <div className="text-[10px] text-slate-400 mt-0.5">{o.date}</div>
                        )}
                      </td>
                      <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-200">
                        <div>{o.customerName || 'Walk-in Customer'}</div>
                        {o.phone && <div className="text-[10px] text-slate-400">{o.phone}</div>}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isOnlineOrder(o)
                              ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {o.channel || (isOnlineOrder(o) ? 'Online Store' : 'POS Counter')}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          ₹ {formatINR(o.total)}
                        </div>
                        {parseFloat(o.gstTotal || 0) > 0 && (
                          <div className="text-[10px] text-slate-400 tabular-nums">
                            incl. GST ₹{formatINR(o.gstTotal)}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <Check className="w-3 h-3" /> {o.paymentMethod || 'Paid'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(o)}
                            className="px-2.5 py-1.5 rounded-lg bg-[#00a2c7]/10 hover:bg-[#00a2c7] text-[#00a2c7] hover:text-white font-bold text-[11px] transition inline-flex items-center gap-1.5 cursor-pointer"
                            title="Preview & Print Thermal 80mm / A4 / Dot Matrix Invoice"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Tax Bill</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoice(o)}
                            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                            title="Inspect Bill"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
                <Receipt className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                No {invoiceChannelFilter === 'all' ? '' : `${invoiceChannelFilter.toUpperCase()} `}sales invoices yet
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Create your first POS counter bill or receive a storefront order. Every bill includes instant 80mm Thermal &amp; A4 Tax Invoice printing.
              </p>
              <div className="flex items-center gap-2.5 mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/shop-admin/billing')}
                  className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Create First POS Bill</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/shop-admin/products/create')}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  + Add Products First
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Category Performance & Store Payment/Readiness */}
        <div className="lg:col-span-4 space-y-5">
          {/* Multi-Category Breakdown (100% Real Data) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {analytics.categoryMode === 'sales' ? 'Category Sales Share' : 'Catalog Category Mix'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                {analytics.categoryMode === 'sales' ? 'By Revenue' : 'By SKUs'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              {analytics.categoryMode === 'sales'
                ? 'Live revenue distribution across product categories'
                : 'Catalog distribution (sales share updates after first bill)'}
            </p>

            {analytics.categoryShares.length > 0 ? (
              <div className="space-y-3.5 text-xs">
                {analytics.categoryShares.map((cat, idx) => {
                  const palette = CATEGORY_COLORS[idx % CATEGORY_COLORS.length];
                  return (
                    <div key={cat.name}>
                      <div className="flex justify-between items-center font-semibold mb-1.5 gap-2">
                        <span className="text-slate-700 dark:text-slate-300 truncate">{cat.name}</span>
                        <span className="text-slate-900 dark:text-white font-bold tabular-nums shrink-0">
                          {cat.percent}%{' '}
                          <span className="text-slate-400 font-medium">
                            {analytics.categoryMode === 'sales'
                              ? `(₹${formatINR(cat.amount)})`
                              : `(${cat.count} SKU${cat.count === 1 ? '' : 's'})`}
                          </span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${palette.bar}`}
                          style={{ width: `${Math.max(4, cat.percent)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  No products or sales categorized yet
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/shop-admin/products/create')}
                  className="mt-2.5 text-xs font-bold text-[#00a2c7] hover:underline cursor-pointer"
                >
                  + Add your first product
                </button>
              </div>
            )}
          </div>

          {/* Payment Split & Live Store Readiness */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Today&apos;s Collection &amp; Store Readiness
              </h3>
              <p className="text-xs text-slate-400">
                Live register tender split &amp; active configuration status
              </p>
            </div>

            {/* Today's Cash / UPI / Card Pills */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Cash</div>
                <div className="text-xs font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
                  ₹{formatINR(shiftData?.cashSales || 0)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">UPI / QR</div>
                <div className="text-xs font-black text-[#00a2c7] mt-0.5 tabular-nums">
                  ₹{formatINR(shiftData?.upiSales || 0)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Card</div>
                <div className="text-xs font-black text-indigo-600 dark:text-indigo-400 mt-0.5 tabular-nums">
                  ₹{formatINR(shiftData?.cardSales || 0)}
                </div>
              </div>
            </div>

            {/* Real Configuration Status Rows */}
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => navigate('/shop-admin/settings')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <ShieldCheck className={`w-4 h-4 ${gstConfigured ? 'text-emerald-500' : 'text-amber-500'}`} />
                  GST Tax Identity
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                    gstConfigured
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {gstConfigured ? storeSettings.gst_number : 'Setup Pending'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/shop-admin/payment-gateways')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <CreditCard className="w-4 h-4 text-[#00a2c7]" />
                  Online Payment Gateways
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-[#00a2c7] tabular-nums">
                  {analytics.activeGatewaysCount} Active
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/shop-admin/courier-shipping')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <Truck className="w-4 h-4 text-purple-500" />
                  Courier Dispatch Partners
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 tabular-nums">
                  {analytics.activeCouriersCount} Enabled
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/shop-admin/settings')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <span className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
                  <Printer className="w-4 h-4 text-slate-500" />
                  Print Formats
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> 80mm · A4 · Dot Matrix
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

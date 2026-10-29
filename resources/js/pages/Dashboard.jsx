import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useErp } from '../context/ErpContext';
import {
  ArrowUpRight,
  ShoppingCart,
  Boxes,
  Receipt,
  Plus,
  Zap,
  Warehouse,
  Printer,
  Eye,
  Check,
  ArrowRight,
  Scale,
  Barcode
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    orders,
    setSelectedInvoice,
    setIsZReportOpen,
    setIsStockAdjustmentOpen
  } = useErp();

  return (
    <div className="space-y-6">
      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Gross Sales
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹ 48,250.00</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+18.4% vs yesterday</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] flex items-center justify-center font-bold text-lg">
            ₹
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Orders
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">38 Orders</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
              <span>24 POS Counter / 14 Online</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active In-Stock SKUs
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">142 Products</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
              <span>Fashion, Grocery, Electronics</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Active Shift Drawer
            </p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹ 20,500.00</h3>
            <div className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 mt-1">
              <span>Shift #1 — Open (Ramesh)</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick ERP Action Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => navigate('/shop-admin/products/create')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00a2c7] dark:hover:border-cyan-500 transition shadow-xs flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">+ Add New Product</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Variants, GST, Barcodes</p>
          </div>
        </button>

        <a
          href="/pos-terminal"
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition shadow-xs flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Launch POS Billing</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">High-speed counter checkout</p>
          </div>
        </a>

        <button
          onClick={() => setIsStockAdjustmentOpen(true)}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition shadow-xs flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Warehouse className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Stock Inward / Outward</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Record branch inventory</p>
          </div>
        </button>

        <button
          onClick={() => setIsZReportOpen(true)}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition shadow-xs flex items-center gap-3 text-left group"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Shift Z-Report Print</h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Day close & till balance</p>
          </div>
        </button>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Sales & Invoices</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time sync between POS counter and online store</p>
            </div>
            <button
              onClick={() => navigate('/shop-admin/orders')}
              className="text-xs font-bold text-[#00a2c7] hover:underline flex items-center gap-1"
            >
              <span>View All Invoices</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-3 py-2.5">Invoice #</th>
                  <th className="px-3 py-2.5">Customer</th>
                  <th className="px-3 py-2.5">Channel</th>
                  <th className="px-3 py-2.5">Amount</th>
                  <th className="px-3 py-2.5">Payment</th>
                  <th className="px-3 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                    <td className="px-3 py-3 font-mono font-bold text-slate-900 dark:text-white">{o.id}</td>
                    <td className="px-3 py-3 font-medium text-slate-800 dark:text-slate-200">
                      <div>{o.customerName}</div>
                      <div className="text-[10px] text-slate-400">{o.phone}</div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {o.channel}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                      ₹ {o.total.toFixed(2)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-3 h-3" /> {o.paymentMethod}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => setSelectedInvoice(o)}
                        className="px-2.5 py-1 rounded bg-[#00a2c7]/10 hover:bg-[#00a2c7]/20 text-[#00a2c7] font-bold text-[11px] transition inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> Print Tax Bill
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Revenue & Hardware Bridge */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Multi-Category Sales Share
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4">Single DB multi-business catalog</p>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Fashion & Garments</span>
                  <span className="text-[#00a2c7]">52% (₹ 25,090)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#00a2c7] h-full rounded-full" style={{ width: '52%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Electronics & Gadgets</span>
                  <span className="text-indigo-600">28% (₹ 13,510)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '28%' }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 dark:text-slate-300">Grocery & Staples</span>
                  <span className="text-emerald-600">20% (₹ 9,650)</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '20%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Hardware Bridge Status
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">POS Peripherals Connectivity</p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Printer className="w-4 h-4 text-emerald-600" /> ESC/POS Thermal 80mm
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  Connected (USB-0)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Scale className="w-4 h-4 text-cyan-600" /> Weighing Scale (Tola)
                </span>
                <span className="text-[10px] font-bold text-cyan-600 bg-cyan-50 dark:bg-cyan-950 px-2 py-0.5 rounded">
                  Live (COM-3)
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Barcode className="w-4 h-4 text-indigo-600" /> 1D/2D Barcode Gun
                </span>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                  HID Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

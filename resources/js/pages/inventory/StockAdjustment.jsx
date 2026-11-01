import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useErp } from '../../context/ErpContext';
import {
  Warehouse,
  ChevronLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  ShieldCheck,
  ShieldAlert,
  Search,
  Receipt,
  Boxes,
  Calendar,
  AlertCircle
} from 'lucide-react';
import SearchableProductSelect from '../../components/SearchableProductSelect';

export default function StockAdjustment() {
  const navigate = useNavigate();
  const { products, purchaseBills, orders, showToast } = useErp();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [productName, setProductName] = useState(products[0]?.name || '');

  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || products[0];
  }, [products, selectedProductId]);

  // Aggregate recent movements from Inward (Purchase Bills) and Outward (Orders)
  const recentMovements = useMemo(() => {
    const list = [];

    // Inward from purchase bills
    (purchaseBills || []).forEach((pb) => {
      (pb.items || []).forEach((it) => {
        list.push({
          id: `${pb.id}-${it.productId || it.name}`,
          refNo: pb.billNumber || pb.id,
          party: pb.supplierName || 'Supplier Inward',
          type: 'Inward (+)',
          isPositive: true,
          date: pb.billDate || 'Recent',
          productName: it.name,
          productId: it.productId,
          qty: it.qty,
          unit: it.unit || 'pcs',
          voucherType: pb.billType === 'pakka' ? 'Tax Inward' : 'Estimate Inward'
        });
      });
    });

    // Outward from sales
    (orders || []).forEach((ord) => {
      (ord.items || []).forEach((it) => {
        list.push({
          id: `${ord.id}-${it.productId || it.name}`,
          refNo: ord.id,
          party: ord.customerName || 'Walk-in Customer',
          type: 'Outward (-)',
          isPositive: false,
          date: ord.date || 'Recent',
          productName: it.name,
          productId: it.productId,
          qty: it.qty,
          unit: it.unit || 'pcs',
          voucherType: ord.billType === 'pakka' ? 'Tax Invoice' : 'Kachha Bill'
        });
      });
    });

    return list.slice(0, 20);
  }, [purchaseBills, orders]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                Inventory Stock &amp; Audit Movement Hub
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1 border border-amber-300 dark:border-amber-800">
                <ShieldCheck className="w-3 h-3 text-amber-600" /> Audit Locked
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Strict Accounting Policy: Manual stock overrides are disabled. Stock strictly increases via Inward Bills and decreases via Outward Sales.
            </p>
          </div>
          <button
            onClick={() => navigate('/shop-admin/inventory')}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Stock Levels
          </button>
        </div>

        {/* Security / Accounting Enforcement Notice */}
        <div className="mt-5 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-amber-900 dark:text-amber-200">
              Manual Stock Manipulation is Locked by System
            </h4>
            <p className="text-amber-800/90 dark:text-amber-300/80 leading-relaxed text-[11px]">
              Directly editing or fabricating stock balances is prohibited. Every single stock movement in this ERP must be backed by either an <b>Inward Purchase Bill</b> or an <b>Outward Sales Invoice</b>. Use the dedicated action pathways below:
            </p>
          </div>
        </div>

        {/* Two Direct Action Pathways */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {/* Pathway 1: Inward */}
          <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-gradient-to-br from-emerald-50/50 to-white dark:from-emerald-950/20 dark:to-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                <ArrowDownLeft className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Stock In (+)
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">1. Inward Purchase Bill</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Record goods received from suppliers. Automatically increments stock, updates batch numbers, expiry dates, and supplier payables.
              </p>
            </div>
            <button
              onClick={() => navigate('/shop-admin/purchase-bills')}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <Boxes className="w-3.5 h-3.5" /> Create Inward Bill (+ Stock)
            </button>
          </div>

          {/* Pathway 2: Outward */}
          <div className="p-5 rounded-xl border border-cyan-200 dark:border-cyan-800/80 bg-gradient-to-br from-cyan-50/50 to-white dark:from-cyan-950/20 dark:to-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-lg bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300">
                <ArrowUpRight className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                Stock Out (-)
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">2. Outward Sale / POS Bill</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bill customer purchases via barcode scanner or fast search. Automatically decrements inventory and computes live gross profit.
              </p>
            </div>
            <button
              onClick={() => navigate('/shop-admin/billing')}
              className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs"
            >
              <Receipt className="w-3.5 h-3.5" /> Create Outward Sale (- Stock)
            </button>
          </div>
        </div>
      </div>

      {/* Live Product Stock Inspector (Read-Only) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">Live Product Stock Balance Inspector</h3>
          <p className="text-xs text-slate-500">Search any product to inspect its current live ledger balance, pricing, and batch details.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
              Search Product by Name or Barcode:
            </label>
            <SearchableProductSelect
              products={products}
              selectedProductId={selectedProductId}
              productName={productName}
              placeholder="Search product (e.g. Shirt, Rice, Ghee, 8901...)..."
              onSelect={(p) => {
                if (p) {
                  setSelectedProductId(p.id);
                  setProductName(p.name);
                }
              }}
              onNameChange={(name) => setProductName(name)}
            />
          </div>

          {selectedProduct && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedProduct.name}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  (selectedProduct.stock || 0) > 10 
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                    : (selectedProduct.stock || 0) > 0 
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {selectedProduct.status || 'Active'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300 pt-1">
                <div>Current Stock Balance: <b className="text-slate-900 dark:text-white font-mono text-sm">{selectedProduct.stock || 0} {selectedProduct.unit || 'pcs'}</b></div>
                <div>Barcode: <b className="font-mono text-slate-700 dark:text-slate-200">{selectedProduct.barcode || 'N/A'}</b></div>
                <div>HSN Code: <b className="font-mono text-slate-700 dark:text-slate-200">{selectedProduct.hsnCode || '6205'}</b></div>
                <div>GST Rate: <b>{selectedProduct.gstRate || 5}%</b></div>
                <div>Purchase Price: <b>₹{selectedProduct.purchasePrice || 0}</b></div>
                <div>Selling Price: <b className="text-emerald-600 dark:text-emerald-400">₹{selectedProduct.sellingPrice || 0}</b></div>
                {selectedProduct.batchNo && <div>Batch No: <b>{selectedProduct.batchNo}</b></div>}
                {selectedProduct.expiryDate && <div>Expiry: <b>{selectedProduct.expiryDate}</b></div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Movement Audit Trail Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Recent Inward &amp; Outward Inventory Movements</h3>
            <p className="text-[11px] text-slate-500">Live transaction vouchers altering physical stock ledger</p>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Showing last {recentMovements.length} records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Voucher / Bill No</th>
                <th className="py-2.5 px-3">Party (Supplier / Buyer)</th>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 text-right">Movement Qty</th>
                <th className="py-2.5 px-3 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {recentMovements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                    No movements recorded yet. Create an Inward Bill or Outward Sale to begin tracking.
                  </td>
                </tr>
              ) : (
                recentMovements.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-sans ${
                        m.isPositive 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {m.isPositive ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                        {m.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-bold text-slate-900 dark:text-white">
                      {m.refNo}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-700 dark:text-slate-300 font-medium">
                      {m.party}
                    </td>
                    <td className="py-2 px-3 font-sans text-slate-900 dark:text-white font-semibold">
                      {m.productName}
                    </td>
                    <td className={`py-2 px-3 text-right font-black ${
                      m.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {m.isPositive ? `+${m.qty}` : `-${m.qty}`} {m.unit}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-500 font-sans text-[10px]">
                      {m.date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

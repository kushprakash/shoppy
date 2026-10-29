import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useErp } from '../context/ErpContext';
import {
  CheckCircle2,
  X,
  Receipt,
  QrCode,
  Send,
  Printer,
  Barcode,
  Warehouse,
  AlertCircle
} from 'lucide-react';

export default function MainLayout() {
  const {
    isDarkMode,
    toastMessage,
    showToast,
    selectedInvoice,
    setSelectedInvoice,
    selectedBarcodeProduct,
    setSelectedBarcodeProduct,
    isZReportOpen,
    setIsZReportOpen,
    isStockAdjustmentOpen,
    setIsStockAdjustmentOpen,
    shiftData,
    products,
    setProducts
  } = useErp();

  // Stock Adjustment Form
  const [stockForm, setStockForm] = useState({
    productId: products[0]?.id || '',
    type: 'Inward Purchase',
    quantity: 10,
    branch: 'Main Branch (Downtown)',
    notes: 'Vendor delivery stock inward'
  });

  const handleStockSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(stockForm.quantity) || 0;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === stockForm.productId) {
          const newStock = stockForm.type.includes('Inward') || stockForm.type.includes('Return')
            ? p.stock + qty
            : Math.max(0, p.stock - qty);
          return {
            ...p,
            stock: newStock,
            status: newStock > 10 ? 'In Stock' : newStock > 0 ? 'Low Stock' : 'Out of Stock'
          };
        }
        return p;
      })
    );
    setIsStockAdjustmentOpen(false);
    showToast(`Stock updated: ${stockForm.type} (${stockForm.quantity} units)`);
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f4f7fa] text-slate-800'}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage.msg}</span>
        </div>
      )}

      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header />

        {/* Content Outlet for dynamic routes */}
        <main className="px-6 pb-12 flex-1">
          <Outlet />
        </main>
      </div>

      {/* MODAL 1: TAX INVOICE WITH IRN & QR */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-[#00a2c7]" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Tax Invoice — {selectedInvoice.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-4">
              <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
                <h4 className="text-base font-bold uppercase font-heading">Ramesh Fashion Store</h4>
                <p className="text-[10px] text-slate-500">Unit 14, Bapu Bazar, Jaipur, Rajasthan - 302003</p>
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">GSTIN: 08AABCR1290M1Z5</p>
                <p className="text-[10px] text-slate-500">FSSAI Lic: 10019022001429 • Phone: +91 98290 00192</p>
              </div>

              <div className="flex justify-between text-[11px]">
                <div>
                  <div><strong className="text-slate-900 dark:text-white">Invoice No:</strong> {selectedInvoice.id}</div>
                  <div><strong>Date & Time:</strong> {selectedInvoice.date}</div>
                  <div><strong>POS Station:</strong> {selectedInvoice.channel}</div>
                </div>
                <div className="text-right">
                  <div><strong className="text-slate-900 dark:text-white">Customer:</strong> {selectedInvoice.customerName}</div>
                  <div><strong>Mobile:</strong> {selectedInvoice.phone}</div>
                  <div><strong>Payment:</strong> {selectedInvoice.paymentMethod}</div>
                </div>
              </div>

              <table className="w-full text-left text-xs">
                <thead className="border-y border-dashed border-slate-300 dark:border-slate-700">
                  <tr>
                    <th className="py-1.5">Item Description</th>
                    <th className="py-1.5 text-center">Qty</th>
                    <th className="py-1.5 text-right">Rate</th>
                    <th className="py-1.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {selectedInvoice.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-1.5">
                        <div>{it.name}</div>
                        <div className="text-[10px] text-slate-400">GST: {it.gst}</div>
                      </td>
                      <td className="py-1.5 text-center">{it.qty}</td>
                      <td className="py-1.5 text-right">₹ {it.price.toFixed(2)}</td>
                      <td className="py-1.5 text-right">₹ {(it.qty * it.price).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-700 text-right space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Taxable Subtotal:</span>
                  <span>₹ {selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>CGST (Intra-state):</span>
                  <span>₹ {(selectedInvoice.gstTotal / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>SGST (Intra-state):</span>
                  <span>₹ {(selectedInvoice.gstTotal / 2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-300 dark:border-slate-700">
                  <span>Net Amount Paid:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹ {selectedInvoice.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">NIC E-Invoice QR & IRN</div>
                  <div className="font-mono text-[9px] text-slate-500 truncate max-w-sm">
                    IRN: 9f8a32b0c1e8d7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2
                  </div>
                  <div className="text-[9px] text-emerald-600 font-bold mt-0.5">Digitally Signed by GST Suvidha Provider</div>
                </div>
                <QrCode className="w-12 h-12 text-slate-800 dark:text-slate-200" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => showToast(`WhatsApp Bill Link sent to ${selectedInvoice.phone}`)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" /> Send Digital WhatsApp Bill
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" /> Print 80mm Thermal Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BARCODE LABEL PRINT */}
      {selectedBarcodeProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-[#00a2c7]" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Barcode Price Tag Preview</h3>
              </div>
              <button onClick={() => setSelectedBarcodeProduct(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="my-5 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white text-slate-900 text-center font-sans space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider">Ramesh Fashion Store</p>
              <h4 className="font-extrabold text-sm">{selectedBarcodeProduct.name}</h4>

              <div className="flex justify-center items-center py-2">
                <div className="space-y-1">
                  <div className="h-10 flex items-center justify-center gap-[2px]">
                    {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 2, 3, 1, 2, 4, 1].map((w, i) => (
                      <span key={i} className="h-full bg-black block" style={{ width: `${w}px` }} />
                    ))}
                  </div>
                  <div className="font-mono text-[11px] tracking-widest">{selectedBarcodeProduct.barcode}</div>
                </div>
              </div>

              <div className="flex justify-between items-center px-4 pt-2 border-t border-slate-200 text-xs">
                <span className="font-mono text-slate-500">SKU: {selectedBarcodeProduct.sku}</span>
                <span className="text-base font-black text-slate-900">MRP: ₹ {selectedBarcodeProduct.sellingPrice}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedBarcodeProduct(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  showToast('Sent to Zebra/TSC Barcode Thermal Printer!');
                }}
                className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" /> Print 50x25mm Stickers
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Z-REPORT SHIFT CLOSE */}
      {isZReportOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Daily Z-Report Close</h3>
              </div>
              <button onClick={() => setIsZReportOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="my-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-2 border border-dashed border-slate-300 dark:border-slate-700">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <div className="font-bold">RAMESH FASHION STORE</div>
                <div className="text-[10px] text-slate-400">SHIFT CLOSE SUMMARY (Z-REPORT)</div>
                <div className="text-[10px] text-slate-400">{shiftData.openedAt} - NOW</div>
              </div>

              <div className="flex justify-between">
                <span>Opening Cash:</span>
                <span>₹ {shiftData.openingFloat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Sales:</span>
                <span>₹ {shiftData.cashSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>UPI / QR Sales:</span>
                <span>₹ {shiftData.upiSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Card Swipes:</span>
                <span>₹ {shiftData.cardSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-500">
                <span>Petty Cash Out:</span>
                <span>- ₹ {shiftData.pettyCashOut.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-dashed border-slate-300 flex justify-between font-bold text-sm">
                <span>Drawer Total Cash:</span>
                <span className="text-[#00a2c7]">₹ {shiftData.expectedCashInDrawer.toFixed(2)}</span>
              </div>
              <div className="text-center pt-2 text-[10px] text-emerald-600 font-bold">
                ✓ ZERO SHORTAGE / BALANCED
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsZReportOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                  showToast('Z-Report Printed on 80mm ESC/POS Printer!');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" /> Print Z-Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: RECORD STOCK INWARD / ADJUSTMENT */}
      {isStockAdjustmentOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-[#00a2c7]" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Record Stock In / Out</h3>
              </div>
              <button onClick={() => setIsStockAdjustmentOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleStockSubmit} className="space-y-3.5 my-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Product</label>
                <select
                  value={stockForm.productId}
                  onChange={(e) => setStockForm({ ...stockForm, productId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Current Stock: {p.stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Adjustment Type</label>
                  <select
                    value={stockForm.type}
                    onChange={(e) => setStockForm({ ...stockForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Inward Purchase">Inward Purchase (+)</option>
                    <option value="Customer Return">Customer Return (+)</option>
                    <option value="Damaged Stock">Damaged / Expired (-)</option>
                    <option value="Audit Loss">Audit Shortage (-)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={stockForm.quantity}
                    onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Branch Location</label>
                <select
                  value={stockForm.branch}
                  onChange={(e) => setStockForm({ ...stockForm, branch: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                >
                  <option value="Main Branch (Downtown)">Main Branch (Downtown)</option>
                  <option value="Outlet #2 (Mall Road)">Outlet #2 (Mall Road)</option>
                  <option value="Central Warehouse">Central Warehouse & Hub</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStockAdjustmentOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-xs"
                >
                  Save Stock Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

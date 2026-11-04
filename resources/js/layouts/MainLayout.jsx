import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { useErp } from '../context/ErpContext';
import InvoicePrintModal from '../components/InvoicePrintModal';
import EmployeeICardModal from '../components/EmployeeICardModal';
import ProfileUpdateModal from '../components/ProfileUpdateModal';
import ChangePasswordModal from '../components/ChangePasswordModal';
import StoreRenewalModal from '../components/StoreRenewalModal';
import subscriptionService from '../services/subscriptionService';
import {
  CheckCircle2,
  X,
  Receipt,
  QrCode,
  Send,
  Printer,
  Barcode,
  Warehouse,
  AlertCircle,
  AlertTriangle,
  Clock,
  Zap
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
    isICardOpen,
    setIsICardOpen,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isChangePasswordOpen,
    setIsChangePasswordOpen,
    storeName,
    storeSettings,
    shopCode,
    shiftData,
    products,
    setProducts
  } = useErp();

  // Active Store Code & Expiry Status
  const activeCode = localStorage.getItem('shoppy_active_store_code') || shopCode || '';
  const [expiryStatus, setExpiryStatus] = useState(() => subscriptionService.getStoreExpiryStatus(activeCode));
  const [isRenewalModalOpen, setIsRenewalModalOpen] = useState(false);

  useEffect(() => {
    const status = subscriptionService.getStoreExpiryStatus(activeCode);
    setExpiryStatus(status);

    // Auto popup Renewal modal after merchant logs in if expiring soon (<= 5 days) or expired
    const shouldPopup = localStorage.getItem('shoppy_trigger_renewal_popup') === 'true' ||
                        sessionStorage.getItem('shoppy_show_renewal_popup') === 'true' ||
                        (status && status.showAlert);

    if (shouldPopup) {
      setIsRenewalModalOpen(true);
      try {
        localStorage.removeItem('shoppy_trigger_renewal_popup');
        sessionStorage.removeItem('shoppy_show_renewal_popup');
      } catch (err) {}
    }
  }, [activeCode]);

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
        {/* Top Expiry Warning Banner (last 5 days or expired) */}
        {expiryStatus && expiryStatus.showAlert && (
          <div className={`w-full py-2.5 px-6 text-xs font-bold flex flex-wrap items-center justify-between gap-3 shadow-md shrink-0 ${
            expiryStatus.isExpired
              ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white'
              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950'
          }`}>
            <div className="flex items-center gap-2.5">
              {expiryStatus.isExpired ? (
                <AlertTriangle className="w-4 h-4 text-white shrink-0 animate-pulse" />
              ) : (
                <Clock className="w-4 h-4 text-slate-950 shrink-0 animate-pulse" />
              )}
              <span>
                {expiryStatus.isExpired
                  ? `Store License Expired on ${expiryStatus.validUntil}! Renew now to maintain uninterrupted billing & online services.`
                  : `Store Plan Expiry Alert: Your subscription expires in ${expiryStatus.daysRemaining} days (${expiryStatus.validUntil}).`}
              </span>
            </div>
            <button
              onClick={() => setIsRenewalModalOpen(true)}
              className={`px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm transition cursor-pointer flex items-center gap-1.5 ${
                expiryStatus.isExpired
                  ? 'bg-white text-red-700 hover:bg-slate-100'
                  : 'bg-slate-950 text-white hover:bg-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Renew Subscription Now</span>
            </button>
          </div>
        )}

        <Header />

        {/* Content Outlet for dynamic routes */}
        <main className="px-6 pb-12 flex-1">
          <Outlet />
        </main>

        {/* Dynamic ERP Footer with Shop Name */}
        <footer className="mt-auto px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">{storeName}</span>
            <span>•</span>
            <span>{storeSettings?.footer_copyright || `© ${new Date().getFullYear()} ${storeName}. All Rights Reserved.`}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Shop Code: <b className="font-mono text-cyan-600 dark:text-cyan-400">{shopCode}</b></span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Isolated Cloud Active
            </span>
          </div>
        </footer>
      </div>

      {/* 3-IN-1 INVOICE PRINT MODAL (Thermal, A4 Auto-Paginated, Dot Matrix Sprocket) */}
      {selectedInvoice && (
        <InvoicePrintModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
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
              <p className="text-xs font-bold uppercase tracking-wider">{storeName}</p>
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
                <div className="font-bold">{storeName.toUpperCase()}</div>
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

      {/* MODAL 5: EMPLOYEE I-CARD VIEW & PRINT */}
      {isICardOpen && (
        <EmployeeICardModal onClose={() => setIsICardOpen(false)} />
      )}

      {/* MODAL 6: USER PROFILE UPDATE */}
      {isProfileModalOpen && (
        <ProfileUpdateModal onClose={() => setIsProfileModalOpen(false)} />
      )}

      {/* MODAL 7: CHANGE PASSWORD */}
      {isChangePasswordOpen && (
        <ChangePasswordModal onClose={() => setIsChangePasswordOpen(false)} />
      )}

      {/* MODAL 8: STORE LICENSE & SUBSCRIPTION RENEWAL POPUP */}
      <StoreRenewalModal
        isOpen={isRenewalModalOpen}
        onClose={() => setIsRenewalModalOpen(false)}
        shopCode={activeCode}
        onRenewSuccess={(updated) => {
          setExpiryStatus(subscriptionService.getStoreExpiryStatus(activeCode));
          showToast(`Store ${activeCode} license extended successfully!`);
        }}
      />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { 
  Zap, Search, Barcode, Printer, CheckCircle2, User, 
  CreditCard, Banknote, QrCode, RefreshCw, X, ShieldAlert, ArrowLeft
} from 'lucide-react';

export default function PosBilling() {
  const [shopCode, setShopCode] = useState(document.getElementById('root')?.dataset?.shopCode || 'SHP-A4IFYK');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ name: 'Walk-in Customer', phone: '9988776655' });
  const [paymentMode, setPaymentMode] = useState('cash');
  const [shift, setShift] = useState(null);
  const [shiftModal, setShiftModal] = useState(false);
  const [closingCashInput, setClosingCashInput] = useState('');
  const [zReport, setZReport] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const barcodeInputRef = useRef(null);

  axios.defaults.headers.common['X-Shop-Code'] = shopCode;

  const fetchShiftStatus = async () => {
    try {
      const res = await axios.get('/api/pos/shift/status');
      if (res.data.success) {
        setShift(res.data.shift);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      setProducts([]);
      return;
    }
    try {
      const res = await axios.get(`/api/pos/products/search?q=${encodeURIComponent(query)}`);
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchShiftStatus();
    // Default focus on barcode input
    barcodeInputRef.current?.focus();
  }, [shopCode]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, unit_price: parseFloat(product.selling_price) }];
    });
    setSearchQuery('');
    setProducts([]);
    barcodeInputRef.current?.focus();
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
  const taxTotal = cart.reduce((acc, item) => {
    const rate = parseFloat(item.gst_rate || 0);
    const lineTotal = item.unit_price * item.quantity;
    return acc + ((lineTotal * rate) / (100 + rate));
  }, 0);
  const grandTotal = subtotal;

  const handleCompleteBill = async () => {
    if (cart.length === 0) return;
    try {
      setLoading(true);
      const res = await axios.post('/api/pos/bill/create', {
        customer_name: customer.name,
        customer_phone: customer.phone,
        payment_mode: paymentMode,
        items: cart.map((i) => ({
          product_id: i.id,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
      });

      if (res.data.success) {
        setReceipt(res.data.receipt);
        setCart([]);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Bill generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseShift = async () => {
    try {
      const res = await axios.post('/api/pos/shift/close', {
        closing_cash: parseFloat(closingCashInput || 0),
      });
      if (res.data.success) {
        setZReport(res.data.z_report);
        setShift(null);
        setShiftModal(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Shift close failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* Top POS Header */}
      <header className="border-b border-slate-800 bg-slate-900 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/shop-admin" className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div>
            <h1 className="text-lg font-black font-heading tracking-tight flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span>POS Fast Billing Terminal</span>
            </h1>
            <span className="text-xs text-slate-400 font-mono">Counter 1 • {shopCode}</span>
          </div>
        </div>

        {/* Shift Control */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-300">Cashier: Ramesh Kumar</div>
            <div className="text-[11px] text-emerald-400 font-mono">Shift Active • Counter 01</div>
          </div>
          <button 
            onClick={() => setShiftModal(true)}
            className="px-3.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 text-xs font-bold transition"
          >
            Close Shift (Z-Report)
          </button>
        </div>
      </header>

      {/* Main Billing Workstation */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side: Product Search & Quick Grid */}
        <div className="flex-1 p-6 flex flex-col gap-4 border-r border-slate-800 overflow-y-auto">
          {/* Barcode / Search Box */}
          <div className="relative">
            <Barcode className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              ref={barcodeInputRef}
              type="text" 
              placeholder="Scan Barcode (e.g. 8901234001) or Type Product Name..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-slate-900 border-2 border-slate-800 focus:border-indigo-500 text-white font-medium text-base shadow-inner focus:outline-none"
            />
          </div>

          {/* Search Results Dropdown/List */}
          {products.length > 0 && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl space-y-1">
              {products.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="p-3 rounded-lg hover:bg-slate-800 flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <span className="font-bold text-white text-sm block">{p.name}</span>
                    <span className="text-xs text-slate-400 font-mono">SKU: {p.sku} | Barcode: {p.barcode}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold text-base block">₹{p.selling_price}</span>
                    <span className="text-[11px] text-slate-400">GST: {p.gst_rate}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fast Category Grid */}
          <div className="mt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Quick Selection</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button 
                onClick={() => handleSearch('Shirt')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-left transition"
              >
                <span className="text-2xl block mb-1">👔</span>
                <span className="text-xs font-bold text-white block">Shirts</span>
                <span className="text-[10px] text-slate-500">From ₹1,299</span>
              </button>

              <button 
                onClick={() => handleSearch('Jeans')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-left transition"
              >
                <span className="text-2xl block mb-1">👖</span>
                <span className="text-xs font-bold text-white block">Jeans</span>
                <span className="text-[10px] text-slate-500">From ₹1,899</span>
              </button>

              <button 
                onClick={() => handleSearch('Rice')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-left transition"
              >
                <span className="text-2xl block mb-1">🌾</span>
                <span className="text-xs font-bold text-white block">Groceries</span>
                <span className="text-[10px] text-slate-500">From ₹450</span>
              </button>

              <button 
                onClick={() => handleSearch('Earbuds')}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-left transition"
              >
                <span className="text-2xl block mb-1">🎧</span>
                <span className="text-xs font-bold text-white block">Electronics</span>
                <span className="text-[10px] text-slate-500">From ₹1,499</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Bill Ledger & Payment */}
        <div className="w-96 flex-shrink-0 bg-slate-900/60 flex flex-col justify-between p-6 shadow-2xl">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h2 className="font-bold text-white text-base">Current Bill Items ({cart.length})</h2>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs text-rose-400 hover:underline">Clear</button>
              )}
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Scan barcode to add items to bill.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white block">{item.name}</span>
                      <span className="text-slate-400 font-mono">₹{item.unit_price} x {item.quantity}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold">-</button>
                      <span className="font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 font-bold">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment & Ledger Bottom Bar */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            {/* Payment Mode Selector */}
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => setPaymentMode('cash')}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  paymentMode === 'cash' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Cash</span>
              </button>

              <button 
                onClick={() => setPaymentMode('upi')}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  paymentMode === 'upi' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>UPI QR</span>
              </button>

              <button 
                onClick={() => setPaymentMode('card')}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  paymentMode === 'card' ? 'bg-blue-600 text-white border-blue-500' : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Card</span>
              </button>
            </div>

            {/* Totals Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between"><span>Subtotal:</span> <span className="text-white font-mono">₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>GST Included:</span> <span className="text-white font-mono">₹{taxTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                <span>Grand Total:</span>
                <span className="text-emerald-400 font-heading text-xl">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Print & Bill CTA */}
            <button 
              disabled={cart.length === 0 || loading}
              onClick={handleCompleteBill}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>{loading ? 'Processing Bill...' : 'Charge & Print Thermal Bill'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Thermal Receipt Print Modal */}
      {receipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white text-slate-950 font-mono text-xs p-6 rounded-lg max-w-xs w-full shadow-2xl space-y-3">
            <div className="text-center pb-2 border-b border-dashed border-slate-400">
              <h4 className="font-extrabold text-base uppercase">RAMESH FASHION</h4>
              <p className="text-[10px] text-slate-600">Main Market, Delhi • GSTIN: 07AAAAA0000A1Z5</p>
              <p className="text-[10px] text-slate-600">{receipt.timestamp}</p>
            </div>

            <div className="flex justify-between text-[11px]">
              <span>Bill No: {receipt.order_number}</span>
              <span>Inv: {receipt.invoice_number}</span>
            </div>

            <div className="py-2 border-y border-dashed border-slate-400 space-y-1">
              <div className="flex justify-between"><span>Items ({receipt.items_count}):</span> <span>₹{receipt.subtotal}</span></div>
              <div className="flex justify-between"><span>GST Included:</span> <span>₹{receipt.tax_total}</span></div>
              <div className="flex justify-between font-bold text-sm pt-1 border-t border-slate-300">
                <span>TOTAL PAID:</span> <span>₹{receipt.grand_total}</span>
              </div>
              <div className="flex justify-between text-[10px] text-slate-600">
                <span>Payment Mode:</span> <span className="uppercase">{receipt.payment_mode}</span>
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-500 pt-1">
              *** THANK YOU! VISIT AGAIN ***
            </p>

            <div className="pt-3 border-t flex gap-2">
              <button 
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-900 text-white font-sans text-xs font-bold rounded"
              >
                Print Receipt
              </button>
              <button 
                onClick={() => setReceipt(null)}
                className="px-3 py-2 bg-slate-200 text-slate-800 font-sans text-xs font-bold rounded"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shift Close / Z-Report Modal */}
      {shiftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <h3 className="font-bold text-white text-base mb-1">Cashier Shift Close (Z-Report)</h3>
            <p className="text-xs text-slate-400 mb-4">Enter physical cash count in drawer to calculate shortage/overage.</p>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Actual Cash in Drawer (₹)</label>
                <input 
                  type="number"
                  placeholder="Enter Cash Count"
                  value={closingCashInput}
                  onChange={(e) => setClosingCashInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button onClick={() => setShiftModal(false)} className="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
                <button 
                  onClick={handleCloseShift}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white"
                >
                  Generate Z-Report & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PosBilling />);
}

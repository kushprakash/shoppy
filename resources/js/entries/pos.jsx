import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { 
  Zap, Search, Barcode, Printer, CheckCircle2, User, 
  CreditCard, Banknote, QrCode, RefreshCw, X, ShieldAlert, 
  ArrowLeft, ShieldCheck, Receipt, Trash2, TrendingUp, TrendingDown, Phone
} from 'lucide-react';
import InvoicePrintModal from '../components/InvoicePrintModal';

export default function PosBilling() {
  const [shopCode, setShopCode] = useState(document.getElementById('root')?.dataset?.shopCode || 'SHP-A4IFYK');
  
  // Dual Billing: Barcode Scanner & Manual Search
  const [barcodeQuery, setBarcodeQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [cart, setCart] = useState([]);
  
  // Bill Options: Pakka vs Kachha
  const [billType, setBillType] = useState('pakka'); // 'pakka' (GST) | 'kachha' (Estimate/Challan)
  
  // Customer State: Mobile Auto-Detection & On-The-Fly Add
  const [customerPhone, setCustomerPhone] = useState('9988776655');
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerCity, setCustomerCity] = useState('Jaipur, RJ');
  const [customerDues, setCustomerDues] = useState(0);

  // Dynamic Payment Mode & Dues
  const [paymentMode, setPaymentMode] = useState('Cash Counter (POS)');
  const [amountPaid, setAmountPaid] = useState('');
  
  // Shift & Receipt Modals
  const [shift, setShift] = useState(null);
  const [shiftModal, setShiftModal] = useState(false);
  const [closingCashInput, setClosingCashInput] = useState('');
  const [zReport, setZReport] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  
  const barcodeInputRef = useRef(null);

  axios.defaults.headers.common['X-Shop-Code'] = shopCode;

  // Local sample catalog fallback for offline / fast search
  const localCatalog = [
    { id: 'PRD-101', name: 'Premium Cotton Slim Fit Shirt', barcode: '890123400101', sku: 'FSH-SHIRT-01', selling_price: 1299.0, purchase_price: 650.0, gst_rate: 5, hsn: '6205', unit: 'pcs', batchNo: 'RAY-SH-2026', expiryDate: '2029-10-31', stock: 52 },
    { id: 'PRD-102', name: 'Dark Indigo Stretch Denim Jeans', barcode: '890123400102', sku: 'FSH-JEANS-01', selling_price: 1899.0, purchase_price: 950.0, gst_rate: 12, hsn: '6203', unit: 'pcs', batchNo: 'RAY-JN-902', expiryDate: '', stock: 34 },
    { id: 'PRD-103', name: 'Royal Basmati Rice 5kg Aged Pack', barcode: '890123400103', sku: 'GROC-RICE-05', selling_price: 480.0, purchase_price: 380.0, gst_rate: 0, hsn: '1006', unit: 'pack', batchNo: 'BAT-2026-R09', expiryDate: '2028-07-31', stock: 120 },
    { id: 'PRD-104', name: 'Pure Desi Cow Ghee 1L Tin', barcode: '890123400104', sku: 'GROC-GHEE-01', selling_price: 650.0, purchase_price: 520.0, gst_rate: 12, hsn: '0405', unit: 'tin', batchNo: 'BAT-2026-G42', expiryDate: '2027-03-10', stock: 8 },
    { id: 'PRD-105', name: 'True Wireless Stereo Earbuds v5.3', barcode: '890123400105', sku: 'ELEC-BUDS-01', selling_price: 1499.0, purchase_price: 850.0, gst_rate: 18, hsn: '8518', unit: 'pcs', batchNo: 'ALP-TWS-01', expiryDate: '2028-12-31', stock: 24 },
    { id: 'PRD-106', name: 'GaN 65W Fast Wall Charger', barcode: '890123400106', sku: 'ELEC-CHRG-65', selling_price: 1199.0, purchase_price: 620.0, gst_rate: 18, hsn: '8504', unit: 'pcs', batchNo: 'GAN-65-99', expiryDate: '2029-06-30', stock: 15 },
    { id: 'PRD-108', name: 'Handcrafted Festive Linen Kurta', barcode: '890123400108', sku: 'FSH-KURTA-09', selling_price: 1699.0, purchase_price: 850.0, gst_rate: 5, hsn: '6205', unit: 'pcs', batchNo: 'KT-2026-09', expiryDate: '', stock: 45 }
  ];

  const fetchShiftStatus = async () => {
    try {
      const res = await axios.get('/api/pos/shift/status');
      if (res.data.success) {
        setShift(res.data.shift);
      }
    } catch (err) {}
  };

  useEffect(() => {
    fetchShiftStatus();
    barcodeInputRef.current?.focus();
  }, [shopCode]);

  // Handle Barcode Scan
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeQuery.trim()) return;

    const term = barcodeQuery.trim();
    const found = localCatalog.find((p) => p.barcode === term || p.sku === term);
    if (found) {
      addToCart(found);
      setBarcodeQuery('');
    } else {
      // Fallback search online API
      handleSearch(term);
    }
  };

  // Handle Manual Search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = localCatalog.filter(
      (p) => p.name.toLowerCase().includes(q) || p.barcode.includes(q) || p.sku.toLowerCase().includes(q)
    );
    setSearchResults(matches);
  };

  // Add Item to Cart
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          sku: product.sku,
          quantity: 1,
          unit_price: parseFloat(product.selling_price || product.price || 0),
          cost_price: parseFloat(product.purchase_price || 0),
          gst_rate: parseFloat(product.gst_rate || 0),
          hsn: product.hsn || '6205',
          unit: product.unit || 'pcs',
          batchNo: product.batchNo || 'BAT-2026-X',
          expiryDate: product.expiryDate || '2028-12-31'
        }
      ];
    });

    setSearchQuery('');
    setSearchResults([]);
    barcodeInputRef.current?.focus();
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const updateCartField = (id, field, val) => {
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  // Financials & Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
  const costTotal = cart.reduce((acc, item) => acc + (item.cost_price * item.quantity), 0);
  
  const taxTotal = billType === 'pakka'
    ? cart.reduce((acc, item) => {
        const lineTotal = item.unit_price * item.quantity;
        const rate = item.gst_rate || 0;
        return acc + (lineTotal * rate) / 100;
      }, 0)
    : 0;

  const grandTotal = subtotal + taxTotal;
  const grossProfit = grandTotal - costTotal;
  const profitMarginPercent = grandTotal > 0 ? ((grossProfit / grandTotal) * 100).toFixed(1) : '0.0';

  const paidVal = amountPaid === '' ? grandTotal : parseFloat(amountPaid || 0);
  const duesVal = Math.max(0, grandTotal - paidVal);

  // Complete Bill & Trigger 3-Format Print Modal
  const handleCompleteBill = () => {
    if (cart.length === 0) return;

    const invoiceObj = {
      id: `POS-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      customerName: customerName.trim() || 'Walk-in Customer',
      phone: customerPhone.trim() || '9988776655',
      city: customerCity.trim() || 'Jaipur, RJ',
      billType, // 'pakka' (GST) | 'kachha' (Estimate)
      channel: 'POS Counter 01',
      channelType: 'offline', // Offline Invoice flag
      subtotal,
      gstTotal: taxTotal,
      total: grandTotal,
      paidAmount: paidVal,
      duesAmount: duesVal,
      paymentMethod: paymentMode,
      items: cart.map((it) => ({
        name: it.name,
        qty: it.quantity,
        unit: it.unit,
        price: it.unit_price,
        costPrice: it.cost_price,
        gst: billType === 'pakka' ? `${it.gst_rate}%` : '0%',
        hsn: it.hsn,
        batchNo: it.batchNo,
        expiryDate: it.expiryDate
      }))
    };

    setSelectedInvoice(invoiceObj);
    setCart([]);
    setAmountPaid('');
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
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                Offline Mode
              </span>
            </h1>
            <span className="text-xs text-slate-400 font-mono">Counter 1 • {shopCode}</span>
          </div>
        </div>

        {/* Bill Type Switcher: Pakka (GST) vs Kachha (Estimate) */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setBillType('pakka')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              billType === 'pakka'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Pakka (GST)
          </button>
          <button
            type="button"
            onClick={() => setBillType('kachha')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              billType === 'kachha'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" /> Kachha (Estimate)
          </button>
        </div>

        {/* Shift Control */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-300">Cashier: Ramesh Kumar</div>
            <div className="text-[11px] text-emerald-400 font-mono">Shift Active • Station 01</div>
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
        
        {/* Left Side: Product Search, Barcode & Cart Table */}
        <div className="flex-1 p-5 flex flex-col gap-4 border-r border-slate-800 overflow-y-auto">
          
          {/* Barcode & Manual Search Dual Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 1. Barcode Scan Box (Press Enter or scan to add) */}
            <form onSubmit={handleBarcodeSubmit} className="relative">
              <Barcode className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 pointer-events-none" />
              <input 
                ref={barcodeInputRef}
                type="text" 
                placeholder="Scan Barcode (e.g. 890123400101)..." 
                value={barcodeQuery}
                onChange={(e) => setBarcodeQuery(e.target.value)}
                className="w-full pl-11 pr-14 py-3 rounded-xl bg-slate-900 border-2 border-slate-800 focus:border-cyan-500 text-white font-mono text-sm shadow-inner focus:outline-none"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-cyan-600 text-white rounded text-xs font-bold"
              >
                Scan
              </button>
            </form>

            {/* 2. Manual Product Search */}
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
              <input 
                type="text" 
                placeholder="Search Item by Name (Shirt, Ghee, Rice)..." 
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-900 border-2 border-slate-800 focus:border-cyan-500 text-white text-sm shadow-inner focus:outline-none"
              />
            </div>
          </div>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl space-y-1">
              {searchResults.map((p) => (
                <div 
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="p-2.5 rounded-lg hover:bg-slate-800 flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <span className="font-bold text-white text-sm block">{p.name}</span>
                    <span className="text-xs text-slate-400 font-mono">Barcode: {p.barcode} | Stock: {p.stock}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold text-base block font-mono">₹{p.selling_price}</span>
                    <span className="text-[11px] text-slate-400">Cost: ₹{p.purchase_price}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Cart Table with Chooseable Batch & Expiry */}
          <div className="flex-1 bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-cyan-400" />
                <span>Billed Items ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
              </span>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs text-rose-400 hover:underline">
                  Clear All
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="py-20 text-center text-slate-500 space-y-2">
                  <Barcode className="w-12 h-12 mx-auto text-slate-700 animate-pulse" />
                  <p className="text-sm font-semibold">Scan Barcode or Search to Add</p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Item Description</th>
                      <th className="px-3 py-2 w-32">Batch / Expiry (Chooseable)</th>
                      <th className="px-3 py-2 text-center w-24">Qty</th>
                      <th className="px-3 py-2 text-right w-20">Rate</th>
                      {billType === 'pakka' && <th className="px-3 py-2 text-center w-14">GST</th>}
                      <th className="px-3 py-2 text-right w-24">Amount</th>
                      <th className="px-3 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {cart.map((it) => (
                      <tr key={it.id} className="hover:bg-slate-800/40">
                        <td className="px-3 py-2.5">
                          <span className="font-bold text-white block">{it.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">BC: {it.barcode}</span>
                        </td>

                        {/* Batch & Expiry input */}
                        <td className="px-3 py-2.5">
                          <input 
                            type="text" 
                            placeholder="Batch" 
                            value={it.batchNo} 
                            onChange={(e) => updateCartField(it.id, 'batchNo', e.target.value)}
                            className="w-full px-1.5 py-0.5 rounded bg-slate-950 border border-slate-700 text-[10px] font-mono text-cyan-400 mb-1"
                          />
                          <input 
                            type="date" 
                            value={it.expiryDate} 
                            onChange={(e) => updateCartField(it.id, 'expiryDate', e.target.value)}
                            className="w-full px-1 py-0.5 rounded bg-slate-950 border border-slate-700 text-[9px] text-slate-300"
                          />
                        </td>

                        {/* Qty */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center justify-center gap-1 bg-slate-950 rounded p-0.5">
                            <button onClick={() => updateQty(it.id, -1)} className="w-5 h-5 rounded bg-slate-800 font-bold">-</button>
                            <span className="w-6 text-center font-bold font-mono">{it.quantity}</span>
                            <button onClick={() => updateQty(it.id, 1)} className="w-5 h-5 rounded bg-slate-800 font-bold">+</button>
                          </div>
                        </td>

                        <td className="px-3 py-2.5 text-right font-mono font-bold">
                          ₹{it.unit_price.toFixed(2)}
                        </td>

                        {billType === 'pakka' && (
                          <td className="px-3 py-2.5 text-center text-slate-400">
                            {it.gst_rate}%
                          </td>
                        )}

                        <td className="px-3 py-2.5 text-right font-mono font-black text-emerald-400">
                          ₹{(it.unit_price * it.quantity).toFixed(2)}
                        </td>

                        <td className="px-3 py-2.5 text-center">
                          <button onClick={() => updateQty(it.id, -it.quantity)} className="text-slate-500 hover:text-rose-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Customer, Dues, Loss/Profit & Settlement */}
        <div className="w-96 flex-shrink-0 bg-slate-900 flex flex-col justify-between p-5 border-l border-slate-800 overflow-y-auto space-y-4">
          
          {/* Customer Lookup by Mobile (Auto-add on the fly) */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-cyan-400" /> Customer Data (By Mobile)
            </span>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Mobile (9829011234)..."
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-bold"
              />
            </div>
            <div>
              <input 
                type="text" 
                placeholder="Customer Name..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>
          </div>

          {/* Real-time Loss / Profit Option */}
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
            grossProfit >= 0 ? 'bg-emerald-950/40 border-emerald-800' : 'bg-rose-950/40 border-rose-800'
          }`}>
            <div className="flex items-center gap-2">
              {grossProfit >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              )}
              <div>
                <span className="font-bold text-white block">
                  {grossProfit >= 0 ? 'Estimated Bill Profit' : 'Estimated Bill Loss'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Cost: ₹{costTotal.toFixed(2)} | Margin: {profitMarginPercent}%
                </span>
              </div>
            </div>
            <span className={`font-black font-mono text-sm ${
              grossProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {grossProfit >= 0 ? `+ ₹${grossProfit.toFixed(2)}` : `- ₹${Math.abs(grossProfit).toFixed(2)}`}
            </span>
          </div>

          {/* Dynamic Payment Mode Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase">Payment Channel</label>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white"
            >
              <option value="Cash Counter (POS)">Cash Counter</option>
              <option value="PhonePe UPI">PhonePe / GPay QR</option>
              <option value="Debit / Credit Card">Debit / Credit Card</option>
              <option value="Bank Transfer">Bank Transfer / NEFT</option>
              <option value="Credit / Udhaar (Dues)">Credit / Udhaar (Full Dues)</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* Financials & Dues Calculation */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Subtotal:</span>
              <span className="font-mono text-white">₹{subtotal.toFixed(2)}</span>
            </div>
            {billType === 'pakka' && (
              <div className="flex justify-between text-slate-400">
                <span>GST Tax (CGST+SGST):</span>
                <span className="font-mono text-emerald-400">+ ₹{taxTotal.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-base text-white pt-2 border-t border-slate-800">
              <span>Grand Total:</span>
              <span className="font-mono text-emerald-400 text-lg">₹{grandTotal.toFixed(2)}</span>
            </div>

            {/* Dues / Partial Payment */}
            <div className="pt-2 border-t border-dashed border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Amount Paid (₹):</span>
                <input 
                  type="number"
                  step="any"
                  placeholder={grandTotal.toFixed(2)}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-28 px-2 py-1 rounded bg-slate-900 border border-slate-700 font-bold text-right font-mono text-white"
                />
              </div>

              <div className="flex justify-between items-center pt-1 font-bold">
                <span className="text-slate-400">Balance Dues (Udhaar):</span>
                <span className={`font-mono ${duesVal > 0 ? 'text-rose-400 font-black' : 'text-emerald-400'}`}>
                  ₹{duesVal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Complete Bill CTA -> Opens 3-in-1 Print Modal */}
          <button 
            disabled={cart.length === 0}
            onClick={handleCompleteBill}
            className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Printer className="w-4 h-4" />
            <span>Complete & Print 3-in-1 Bill (Ctrl+P)</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3-IN-1 INVOICE PRINT MODAL (THERMAL 80MM, A4, DOT-MATRIX ROLL) */}
      {/* ========================================================================= */}
      {selectedInvoice && (
        <InvoicePrintModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
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

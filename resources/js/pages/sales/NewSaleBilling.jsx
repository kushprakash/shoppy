import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  Zap, Barcode, Search, User, Phone, Plus, Trash2, 
  Printer, CheckCircle2, AlertCircle, QrCode, CreditCard, 
  Banknote, Receipt, Tag, TrendingUp, TrendingDown, Clock, ShieldCheck
} from 'lucide-react';
import InvoicePrintModal from '../../components/InvoicePrintModal';

export default function NewSaleBilling() {
  const { 
    products, 
    customers, 
    createSaleBill, 
    selectedInvoice, 
    setSelectedInvoice, 
    showToast 
  } = useErp();

  // Search & Barcode
  const [barcodeInput, setBarcodeInput] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const barcodeRef = useRef(null);

  // Bill Configuration
  const [billType, setBillType] = useState('pakka'); // 'pakka' (GST) | 'kachha' (Non-GST / Estimate)
  const [channelType] = useState('offline'); // Always offline for POS billing counter
  const [stationName] = useState('POS Counter 01');

  // Customer State (Search by mobile or auto-add)
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('');
  const [existingCustomer, setExistingCustomer] = useState(null);

  // Cart & Line Items
  const [cart, setCart] = useState([]);

  // Payment & Dues
  const [paymentMode, setPaymentMode] = useState('Cash Counter (POS)');
  const [paymentRef, setPaymentRef] = useState(''); // Cheque number, UPI UTR, or Bank UTR
  const [amountPaid, setAmountPaid] = useState('');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Auto focus barcode input on mount
  useEffect(() => {
    barcodeRef.current?.focus();
  }, []);

  // Customer Mobile Number Auto-Detection
  const handlePhoneChange = (val) => {
    setCustomerPhone(val);
    const clean = val.replace(/[^0-9]/g, '');
    if (clean.length >= 4) {
      const match = customers.find((c) => (c.mobile || '').replace(/[^0-9]/g, '').includes(clean));
      if (match) {
        setExistingCustomer(match);
        setCustomerName(match.name);
        setCustomerCity(match.city || 'Jaipur');
        return;
      }
    }
    setExistingCustomer(null);
  };

  // Barcode Scan Handler (Hardware scanner sends Enter or string)
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const term = barcodeInput.trim();
    const found = products.find(
      (p) => p.barcode === term || p.sku === term || (p.variants && p.variants.some((v) => v.barcode === term || v.sku === term))
    );

    if (found) {
      addToCart(found);
      setBarcodeInput('');
      showToast(`Scanned: ${found.name}`);
    } else {
      showToast(`Barcode "${term}" not found in catalog!`, 'error');
    }
  };

  // Add Product to Cart
  const addToCart = (prod) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === prod.id ? { ...item, qty: item.qty + 1 } : item
        );
      }

      // Default batch & expiry from product if available
      return [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          barcode: prod.barcode,
          sku: prod.sku,
          price: prod.sellingPrice || prod.price || 0,
          costPrice: prod.purchasePrice || 0,
          gstRate: prod.gstRate || 0,
          hsn: prod.hsnCode || '6205',
          unit: prod.unit || 'pcs',
          qty: 1,
          batchNo: prod.batchNo || 'BAT-2026-01',
          expiryDate: prod.expiryDate || '2028-12-31',
          availableBatches: [
            { batchNo: prod.batchNo || 'BAT-2026-01', expiryDate: prod.expiryDate || '2028-12-31', stock: prod.stock }
          ]
        }
      ];
    });

    setProductSearch('');
    barcodeRef.current?.focus();
  };

  const updateCartQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((it) => {
          if (it.productId === productId) {
            const newQty = it.qty + delta;
            return newQty > 0 ? { ...it, qty: newQty } : null;
          }
          return it;
        })
        .filter(Boolean)
    );
  };

  const updateCartField = (productId, field, val) => {
    setCart((prev) =>
      prev.map((it) => (it.productId === productId ? { ...it, [field]: val } : it))
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((it) => it.productId !== productId));
  };

  // Search filter for manual product search dropdown
  const filteredSearchProducts = useMemo(() => {
    if (!productSearch.trim()) return [];
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
    ).slice(0, 8);
  }, [products, productSearch]);

  // Calculations
  const subtotal = cart.reduce((acc, it) => acc + (it.price * it.qty), 0);
  const costTotal = cart.reduce((acc, it) => acc + (it.costPrice * it.qty), 0);
  
  const gstTotal = billType === 'pakka'
    ? cart.reduce((acc, it) => {
        const lineVal = it.price * it.qty;
        const rate = it.gstRate || 0;
        return acc + (lineVal * rate) / 100;
      }, 0)
    : 0;

  const grandTotal = subtotal + gstTotal;
  const grossProfit = grandTotal - costTotal;
  const profitMarginPercent = grandTotal > 0 ? ((grossProfit / grandTotal) * 100).toFixed(1) : '0.0';

  const paidVal = amountPaid === '' ? grandTotal : parseFloat(amountPaid || 0);
  const duesVal = Math.max(0, grandTotal - paidVal);

  // Submit and Complete Billing
  const handleCompleteBill = (e) => {
    e?.preventDefault();

    if (cart.length === 0) {
      showToast('Cart is empty! Scan a barcode or search products to bill.', 'error');
      return;
    }

    const billData = {
      customerName: customerName.trim() || 'Walk-in Customer',
      phone: customerPhone.trim() || '9988776655',
      city: customerCity.trim() || 'Jaipur, RJ',
      billType, // 'pakka' | 'kachha'
      channel: stationName,
      channelType: 'offline', // offline invoice flag
      subtotal,
      gstTotal,
      total: grandTotal,
      paidAmount: paidVal,
      duesAmount: duesVal,
      paymentMethod: paymentMode,
      paymentRef: paymentRef || '',
      items: cart.map((it) => ({
        productId: it.productId,
        name: it.name,
        price: it.price,
        costPrice: it.costPrice,
        qty: it.qty,
        unit: it.unit,
        hsn: it.hsn,
        gst: billType === 'pakka' ? `${it.gstRate || 0}%` : '0%',
        batchNo: it.batchNo,
        expiryDate: it.expiryDate
      }))
    };

    createSaleBill(billData);

    // Reset Billing Station
    setCart([]);
    setCustomerPhone('');
    setCustomerName('');
    setCustomerCity('');
    setExistingCustomer(null);
    setPaymentRef('');
    setAmountPaid('');
    barcodeRef.current?.focus();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-sm">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white font-heading">
                POS Fast Billing Desk
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                Offline Counter Sale
              </span>
            </div>
            <p className="text-xs text-slate-500">
              High-speed barcode scanner & manual search • Auto-deduct stock • 3-in-1 Bill Printing
            </p>
          </div>
        </div>

        {/* Bill Type Switcher: Pakka (GST) vs Kachha (Estimate) */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setBillType('pakka')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              billType === 'pakka'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Pakka Bill (GST Tax Invoice)
          </button>

          <button
            type="button"
            onClick={() => setBillType('kachha')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              billType === 'kachha'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" /> Kachha Bill (Estimate / Challan)
          </button>
        </div>
      </div>

      {/* Main Billing Workstation (2-Column Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: PRODUCT SCAN & CART TABLE (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Barcode & Product Search Dual Input Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              
              {/* 1. Hardware Barcode Scan Box (Instant Enter to Add) */}
              <form onSubmit={handleBarcodeSubmit} className="md:col-span-6 relative">
                <div className="flex items-center">
                  <Barcode className="w-5 h-5 absolute left-3 text-cyan-600 pointer-events-none" />
                  <input
                    ref={barcodeRef}
                    type="text"
                    placeholder="Scan Barcode (e.g. 890123400101)..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="w-full pl-10 pr-16 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-cyan-500 text-slate-900 dark:text-white text-xs font-mono font-bold focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-[11px] font-bold"
                  >
                    Add
                  </button>
                </div>
              </form>

              {/* 2. Manual Product Search Box */}
              <div className="md:col-span-6 relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Or Type Name (Shirt, Ghee, Rice, Earbuds)..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-cyan-500 text-slate-900 dark:text-white text-xs focus:outline-none"
                />

                {/* Dropdown Search Results */}
                {filteredSearchProducts.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-30 max-h-60 overflow-y-auto p-1 divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredSearchProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => addToCart(p)}
                        className="p-2.5 hover:bg-cyan-50 dark:hover:bg-slate-800 cursor-pointer rounded-lg flex items-center justify-between text-xs transition"
                      >
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Stock: {p.stock} {p.unit} | Barcode: {p.barcode}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-emerald-600 font-mono text-sm block">
                            ₹ {p.sellingPrice || p.price}
                          </span>
                          <span className="text-[10px] text-slate-400">Cost: ₹{p.purchasePrice || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Items Horizontal Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 text-xs">
              <span className="text-[10px] font-bold uppercase text-slate-400 shrink-0">Quick Add:</span>
              {products.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => addToCart(p)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-cyan-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-[11px] whitespace-nowrap transition"
                >
                  {p.name.split(' ')[0]} {p.name.split(' ')[1] || ''} (₹{p.sellingPrice})
                </button>
              ))}
            </div>
          </div>

          {/* Cart Items Table with Chooseable Batch & Expiry */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-cyan-600" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Cart Items ({cart.reduce((a, b) => a + b.qty, 0)} units)
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={() => setCart([])}
                  className="text-xs text-rose-500 hover:underline font-semibold"
                >
                  Clear Cart
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <Barcode className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 animate-pulse" />
                <p className="text-sm font-semibold">Ready to Scan or Type Items</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Scan barcode with your handheld barcode scanner or use manual search above to begin billing.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2.5">Item Description & Details</th>
                      <th className="px-3 py-2.5 w-44 min-w-[160px]">Batch & Expiry</th>
                      <th className="px-3 py-2.5 text-center w-28">Qty</th>
                      <th className="px-3 py-2.5 text-right w-24">Rate (₹)</th>
                      {billType === 'pakka' && <th className="px-3 py-2.5 text-center w-16">GST</th>}
                      <th className="px-3 py-2.5 text-right w-24">Amount (₹)</th>
                      <th className="px-3 py-2.5 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {cart.map((it) => (
                      <tr key={it.productId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        {/* Item Name, Unit & Barcode */}
                        <td className="px-3 py-3 align-middle">
                          <div className="font-bold text-slate-900 dark:text-white text-xs leading-snug">{it.name}</div>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-slate-400 font-mono">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                              {it.unit || 'pcs'}
                            </span>
                            {it.barcode && <span>BC: {it.barcode}</span>}
                            {it.hsn && <span>• HSN: {it.hsn}</span>}
                          </div>
                        </td>

                        {/* Batch & Expiry (Chooseable per item) */}
                        <td className="px-3 py-3 align-middle">
                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="Batch No (e.g. BAT-01)"
                              value={it.batchNo}
                              onChange={(e) => updateCartField(it.productId, 'batchNo', e.target.value)}
                              className="w-full px-2 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                            />
                            <input
                              type="date"
                              value={it.expiryDate}
                              onChange={(e) => updateCartField(it.productId, 'expiryDate', e.target.value)}
                              className="w-full px-2 py-1 text-[11px] rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
                            />
                          </div>
                        </td>

                        {/* Qty Counter */}
                        <td className="px-3 py-3 align-middle">
                          <div className="flex items-center justify-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 w-fit mx-auto">
                            <button
                              type="button"
                              onClick={() => updateCartQty(it.productId, -1)}
                              className="w-6 h-6 rounded bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold text-xs font-mono">{it.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateCartQty(it.productId, 1)}
                              className="w-6 h-6 rounded bg-white dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Unit Price Rate */}
                        <td className="px-3 py-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200 align-middle">
                          ₹ {it.price.toFixed(2)}
                        </td>

                        {/* GST % */}
                        {billType === 'pakka' && (
                          <td className="px-3 py-3 text-center font-semibold text-slate-600 dark:text-slate-400 align-middle">
                            {it.gstRate}%
                          </td>
                        )}

                        {/* Line Total */}
                        <td className="px-3 py-3 text-right font-black font-mono text-slate-900 dark:text-white align-middle">
                          ₹ {(it.price * it.qty).toFixed(2)}
                        </td>

                        {/* Delete Row */}
                        <td className="px-3 py-3 text-center align-middle">
                          <button
                            type="button"
                            onClick={() => removeFromCart(it.productId)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CUSTOMER, FINANCIALS, DUES & LOSS/PROFIT (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Customer Lookup & Auto-Add Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-cyan-600" /> Customer Information
              </label>
              {existingCustomer ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  Existing Shopper
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  Auto-Save on Bill
                </span>
              )}
            </div>

            {/* Mobile Number Input */}
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Mobile (e.g. 9829011234)..."
                value={customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500 font-bold"
              />
            </div>

            {/* Customer Name */}
            <div>
              <input
                type="text"
                placeholder="Customer Name (e.g. Vikramaditya Rathore)..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Existing Customer Dues Alert */}
            {existingCustomer && (
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-xs flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{existingCustomer.name}</span>
                  <span className="text-[10px] text-slate-500 block">Orders: {existingCustomer.totalOrders} • Tier: {existingCustomer.category}</span>
                </div>
                {(existingCustomer.balanceDue || 0) > 0 ? (
                  <div className="text-right">
                    <span className="text-[10px] text-rose-600 font-bold block">Previous Udhaar:</span>
                    <span className="font-extrabold text-rose-600 font-mono">₹ {existingCustomer.balanceDue.toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600">Zero Dues</span>
                )}
              </div>
            )}
          </div>

          {/* Payment & Dues Summary Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">Bill Summary & Settlement</h3>

            {/* Subtotal & Tax */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal Items:</span>
                <span className="font-mono">₹ {subtotal.toFixed(2)}</span>
              </div>
              {billType === 'pakka' ? (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>GST Output Tax:</span>
                  <span className="font-mono text-emerald-600 font-bold">+ ₹ {gstTotal.toFixed(2)}</span>
                </div>
              ) : (
                <div className="flex justify-between text-amber-600 dark:text-amber-400 text-[11px]">
                  <span>Non-GST Rough Bill:</span>
                  <span>₹ 0.00 (Exempt)</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                <span>Net Payable:</span>
                <span className="font-mono text-cyan-600 dark:text-cyan-400">₹ {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* REAL-TIME PROFIT & LOSS INDICATOR */}
            <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
              grossProfit >= 0 
                ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80' 
                : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80'
            }`}>
              <div className="flex items-center gap-2">
                {grossProfit >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                )}
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {grossProfit >= 0 ? 'Estimated Bill Profit' : 'Estimated Bill Loss'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Cost: ₹{costTotal.toFixed(2)} | Margin: {profitMarginPercent}%
                  </span>
                </div>
              </div>
              <span className={`font-black font-mono text-sm ${
                grossProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {grossProfit >= 0 ? `+ ₹${grossProfit.toFixed(2)}` : `- ₹${Math.abs(grossProfit).toFixed(2)}`}
              </span>
            </div>

            {/* Dynamic Payment Mode Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
                Payment Channel *
              </label>
              <select
                value={paymentMode}
                onChange={(e) => {
                  setPaymentMode(e.target.value);
                  setPaymentRef('');
                }}
                className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold focus:outline-none"
              >
                <option value="Cash Counter (POS)">Cash Counter</option>
                <option value="PhonePe UPI">PhonePe / GPay Dynamic QR</option>
                <option value="Debit / Credit Card">Card (POS Terminal)</option>
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="Credit / Udhaar (Dues)">Credit / Udhaar (Full Dues)</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            {/* Dynamic Payment Reference Input: Cheque No for Cheque, UTR for PhonePe/UPI & Bank Transfer, Card Auth for Card, Hidden for Cash */}
            {(() => {
              const mode = (paymentMode || '').toLowerCase();
              if (mode.includes('cash') || mode.includes('credit') || mode.includes('udhaar')) {
                return null; // Cash and Credit do not require reference input
              }
              const isCheque = mode.includes('cheque');
              const isUpi = mode.includes('upi') || mode.includes('phonepe') || mode.includes('gpay');
              const isCard = mode.includes('card');
              
              const label = isCheque 
                ? 'Cheque Number *' 
                : isUpi 
                  ? 'PhonePe / UPI UTR Number *' 
                  : isCard 
                    ? 'Card Approval / Auth Code *' 
                    : 'Bank Transfer / NEFT UTR Number *';

              const placeholder = isCheque 
                ? 'Enter 6-digit Cheque No (e.g. 409128)...' 
                : isUpi 
                  ? 'Enter 12-digit UPI UTR No (e.g. 428192003819)...' 
                  : isCard 
                    ? 'Enter Card Auth / Ref No...' 
                    : 'Enter Bank NEFT / IMPS UTR No...';

              return (
                <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 border border-cyan-200 dark:border-cyan-800/80 text-xs space-y-1.5 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-cyan-900 dark:text-cyan-200 text-[11px]">
                      {label}
                    </label>
                    <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/60">
                      {isCheque ? 'CHEQUE' : 'UTR / REF'}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder={placeholder}
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-700 font-mono font-bold focus:outline-none focus:border-cyan-500 text-slate-900 dark:text-white"
                  />
                </div>
              );
            })()}

            {/* Dues Management (Amount Paid & Remaining Dues) */}
            <div className="space-y-2 pt-1 border-t border-dashed border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Amount Paid Now (₹):</span>
                <input
                  type="number"
                  step="any"
                  placeholder={grandTotal.toFixed(2)}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-32 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 font-bold text-right font-mono text-xs"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 justify-end">
                <button
                  type="button"
                  onClick={() => setAmountPaid(grandTotal.toString())}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300"
                >
                  Exact (₹{grandTotal.toFixed(0)})
                </button>
                <button
                  type="button"
                  onClick={() => setAmountPaid('0')}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100"
                >
                  Full Udhaar (₹0)
                </button>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="font-bold text-slate-700 dark:text-slate-300">Balance Dues (Udhaar):</span>
                <span className={`font-mono font-black ${duesVal > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  ₹ {duesVal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Complete Bill Button */}
            <button
              type="button"
              onClick={handleCompleteBill}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                cart.length > 0
                  ? 'bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white cursor-pointer shadow-cyan-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Printer className="w-4 h-4" /> Complete Sale & Print Bill (Ctrl+P)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

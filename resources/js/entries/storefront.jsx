import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { 
  ShoppingBag, ShieldCheck, Truck, ArrowRight, CheckCircle2, 
  CreditCard, Sparkles, AlertCircle, Search, Tag, X, User, MapPin, Phone,
  Layers, Palette, Maximize2, Check, ChevronRight, PackageCheck, Zap
} from 'lucide-react';
import { 
  INITIAL_TOP_CATEGORIES, 
  INITIAL_MID_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_SHIPPING_RULES,
  INITIAL_COUPONS
} from '../context/ErpContext';

export default function Storefront() {
  const [shopCode, setShopCode] = useState(document.getElementById('root')?.dataset?.shopCode || 'SHP-A4IFYK');
  const [storeInfo, setStoreInfo] = useState(null);
  
  // Categories from localStorage or defaults
  const [topCategories, setTopCategories] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_top_categories');
      return stored ? JSON.parse(stored) : INITIAL_TOP_CATEGORIES;
    } catch (e) {
      return INITIAL_TOP_CATEGORIES;
    }
  });

  const [midCategories, setMidCategories] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_mid_categories');
      return stored ? JSON.parse(stored) : INITIAL_MID_CATEGORIES;
    } catch (e) {
      return INITIAL_MID_CATEGORIES;
    }
  });

  const [shippingRules, setShippingRules] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_shipping_rules');
      return stored ? JSON.parse(stored) : INITIAL_SHIPPING_RULES;
    } catch (e) {
      return INITIAL_SHIPPING_RULES;
    }
  });

  // Selected Category Filters (3-tier)
  const [selectedTopCat, setSelectedTopCat] = useState('ALL');
  const [selectedMidCat, setSelectedMidCat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Products Master List
  const [products, setProducts] = useState(INITIAL_PRODUCTS);

  // Active Variant Map: { [productId]: { size, color, sku, price, mrp, stock, colorHex } }
  const [selectedVariants, setSelectedVariants] = useState(() => {
    const map = {};
    INITIAL_PRODUCTS.forEach((p) => {
      if (p.variants && p.variants.length > 0) {
        map[p.id] = p.variants[0];
      }
    });
    return map;
  });

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [customerForm, setCustomerForm] = useState({
    name: 'Rohit Verma',
    phone: '9876543210',
    email: 'rohit@example.com',
    address: 'Flat 402, Green Valley Apartments',
    city: 'Jaipur',
    state: 'Rajasthan',
    pincode: '302001',
  });
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // E-Commerce Coupon Discount State
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  axios.defaults.headers.common['X-Shop-Code'] = shopCode;

  // Fetch Store Info & DB catalog if available
  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const [infoRes, catalogRes] = await Promise.all([
        axios.get('/api/storefront/info'),
        axios.get('/api/storefront/catalog'),
      ]);

      if (infoRes.data.success) {
        setStoreInfo(infoRes.data.store);
      }
      if (catalogRes.data.success && catalogRes.data.data?.data?.length > 0) {
        // Merge with initial rich variants if API products lack variants
        const apiProds = catalogRes.data.data.data.map((ap) => {
          const match = INITIAL_PRODUCTS.find((ip) => ip.sku === ap.sku || ip.name === ap.name);
          return match ? { ...match, ...ap } : ap;
        });
        setProducts(apiProds);
      }
    } catch (err) {
      setStoreInfo({
        name: shopCode === 'STORE983515' ? 'Verma General & Kirana Store' : 'Ramesh Fashion & Lifestyle Store',
        code: shopCode,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const res = await axios.get('/api/storefront/payment-methods');
      if (res.data.success) {
        setPaymentMethods(res.data.payment_methods || []);
        if (res.data.payment_methods.length > 0) {
          setSelectedPayment(res.data.payment_methods[0].code);
        }
      }
    } catch (err) {
      setPaymentMethods([
        { code: 'cod', name: 'Cash on Delivery (COD)', description: 'Pay cash or UPI upon delivery at your doorstep.', type: 'offline' },
        { code: 'phonepe', name: 'PhonePe UPI & Cards', description: 'Instant UPI QR and Card checkout.', type: 'online' },
        { code: 'razorpay', name: 'Razorpay Secure Checkout', description: 'Debit/Credit Cards & NetBanking.', type: 'online' },
      ]);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [shopCode]);

  // Variant Selection Handlers
  const handleSelectColor = (productId, colorName) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !product.variants) return;
    const currentVariant = selectedVariants[productId] || product.variants[0];
    // Find matching variant with same size if possible, else first in this color
    const match = product.variants.find((v) => v.color === colorName && v.size === currentVariant.size) ||
                  product.variants.find((v) => v.color === colorName) ||
                  product.variants[0];
    setSelectedVariants((prev) => ({ ...prev, [productId]: match }));
  };

  const handleSelectSize = (productId, sizeCode) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !product.variants) return;
    const currentVariant = selectedVariants[productId] || product.variants[0];
    // Find matching variant with same color if possible, else first in this size
    const match = product.variants.find((v) => v.size === sizeCode && v.color === currentVariant.color) ||
                  product.variants.find((v) => v.size === sizeCode) ||
                  product.variants[0];
    setSelectedVariants((prev) => ({ ...prev, [productId]: match }));
  };

  // Cart Handlers
  const addToCart = (product) => {
    const activeVariant = selectedVariants[product.id] || (product.variants && product.variants[0]) || {
      id: 'default',
      size: 'Standard',
      color: 'Default',
      colorHex: '#1e3a8a',
      sku: product.sku,
      sellingPrice: product.sellingPrice || product.selling_price,
      mrp: product.mrp,
      stock: product.stock
    };

    const cartItemId = `${product.id}-${activeVariant.sku || activeVariant.size}`;

    setCart((prev) => {
      const existing = prev.find((item) => item.cartItemId === cartItemId);
      if (existing) {
        return prev.map((item) =>
          item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          cartItemId,
          productId: product.id,
          name: product.name,
          variantId: activeVariant.id,
          variantSku: activeVariant.sku,
          size: activeVariant.size,
          color: activeVariant.color,
          colorHex: activeVariant.colorHex,
          selling_price: parseFloat(activeVariant.sellingPrice || product.sellingPrice || product.selling_price || 0),
          mrp: parseFloat(activeVariant.mrp || product.mrp || 0),
          isFreeShipping: product.isFreeShipping || false,
          quantity: 1,
        }
      ];
    });

    setCartOpen(true);
  };

  const updateCartQty = (cartItemId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.selling_price * item.quantity), 0);
  
  // Coupon Discount Evaluation (Amount Slab, Expiry, Flat vs Percentage):
  let couponDiscount = 0;
  if (appliedCoupon && subtotal > 0) {
    if (appliedCoupon.discountType === 'percentage') {
      couponDiscount = (subtotal * parseFloat(appliedCoupon.discountValue || 0)) / 100;
      if (appliedCoupon.maxDiscountAmount && couponDiscount > parseFloat(appliedCoupon.maxDiscountAmount)) {
        couponDiscount = parseFloat(appliedCoupon.maxDiscountAmount);
      }
    } else {
      couponDiscount = Math.min(subtotal, parseFloat(appliedCoupon.discountValue || 0));
    }
  }
  couponDiscount = Math.round(couponDiscount);
  const discountedSubtotal = Math.max(0, subtotal - couponDiscount);

  // Shipping Rule Evaluation:
  const isEligibleForFreeShipping = shippingRules.isFreeShippingEnabled && discountedSubtotal >= shippingRules.freeShippingThreshold;
  const rawShippingFee = discountedSubtotal === 0 ? 0 : (isEligibleForFreeShipping ? 0 : shippingRules.flatRate);
  const codExtraFee = (selectedPayment === 'cod' && shippingRules.isCodEnabled && discountedSubtotal > 0) ? shippingRules.codFee : 0;
  const grandTotal = discountedSubtotal + rawShippingFee + codExtraFee;

  const freeShippingDifference = Math.max(0, shippingRules.freeShippingThreshold - discountedSubtotal);
  const freeShippingProgressPercent = Math.min(100, Math.round((discountedSubtotal / shippingRules.freeShippingThreshold) * 100));

  const handleApplyCoupon = (overrideCode) => {
    setCouponError('');
    setCouponSuccess('');
    const codeToTest = (overrideCode || couponCodeInput || '').trim().toUpperCase();
    if (!codeToTest) {
      setCouponError('Please enter a coupon code');
      return;
    }

    let allCoupons = INITIAL_COUPONS;
    try {
      const stored = localStorage.getItem('shoppy_coupons');
      if (stored) {
        allCoupons = JSON.parse(stored);
      }
    } catch (e) {}

    const found = allCoupons.find((c) => c.code === codeToTest);
    if (!found) {
      setCouponError(`Invalid promo code "${codeToTest}". Valid: WELCOME10, FLAT200, FESTIVE25`);
      return;
    }
    if (!found.isActive) {
      setCouponError(`Coupon "${codeToTest}" is currently inactive`);
      return;
    }
    // Check single-use / one-time voucher status
    if (found.isOneTimeUse && (found.usedCount || 0) >= 1) {
      setCouponError(`Coupon "${codeToTest}" is a single-use voucher and has already been redeemed.`);
      return;
    }
    if (found.usageLimit && (found.usedCount || 0) >= found.usageLimit) {
      setCouponError(`Coupon "${codeToTest}" usage limit has been reached.`);
      return;
    }

    if (found.expiryDate) {
      const exp = new Date(found.expiryDate);
      exp.setHours(23, 59, 59, 999);
      if (new Date() > exp) {
        setCouponError(`Coupon "${codeToTest}" expired on ${found.expiryDate}`);
        return;
      }
    }
    if (found.minOrderAmount && subtotal < parseFloat(found.minOrderAmount)) {
      setCouponError(`Min cart value ₹${found.minOrderAmount} required for "${found.code}" (Current: ₹${subtotal.toFixed(0)})`);
      return;
    }

    setAppliedCoupon(found);
    setCouponCodeInput(found.code);
    setCouponSuccess(`Coupon "${found.code}" applied! Saved ₹${found.discountType === 'percentage' ? `${found.discountValue}%` : `₹${found.discountValue}`}.`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput('');
    setCouponError('');
    setCouponSuccess('');
  };

  const handleOpenCheckout = () => {
    fetchPaymentMethods();
    setCheckoutOpen(true);
  };

  const handlePlaceOrder = async () => {
    const orderNumber = `ORD-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const invoiceNumber = `INV-2026-GST-${Math.floor(1000 + Math.random() * 9000)}`;
    const isCod = selectedPayment === 'cod';

    // Construct enriched online order for ERP Live Sync
    const newOrderObj = {
      id: orderNumber,
      invoiceNumber: invoiceNumber,
      customerName: customerForm.name || 'Online Shopper',
      phone: customerForm.phone || '+91 98765 43210',
      email: customerForm.email || 'customer@store.in',
      city: `${customerForm.city || 'Jaipur'}, ${customerForm.state || 'RJ'} - ${customerForm.pincode || '302001'}`,
      address: customerForm.address || 'Doorstep Delivery',
      subtotal: subtotal,
      couponCode: appliedCoupon?.code || '',
      couponDiscount: couponDiscount,
      shippingCharge: rawShippingFee,
      codCharge: codExtraFee,
      gstTotal: Math.round(subtotal * 0.05),
      total: grandTotal,
      paidAmount: isCod ? 0 : grandTotal,
      duesAmount: isCod ? grandTotal : 0,
      paymentMethod: isCod ? 'Cash on Delivery (COD)' : `Prepaid Online (${selectedPayment.toUpperCase()})`,
      paymentStatus: isCod ? 'Pending (Collect on Delivery)' : 'Paid Online',
      paymentModeType: isCod ? 'COD' : 'PREPAID',
      billType: 'pakka',
      channel: 'Storefront Online',
      channelType: 'online',
      fulfillment: 'Ready to Ship',
      packageDimensions: { lengthCm: 25, widthCm: 18, heightCm: 8, weightKg: 0.8 },
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      items: cart.map((it) => ({
        productId: it.productId || 'PRD-101',
        name: it.name,
        qty: it.quantity,
        price: it.selling_price,
        costPrice: it.purchase_price || (it.selling_price * 0.6),
        gst: '5%',
        hsn: '6205',
        unit: 'pcs'
      }))
    };

    // Save directly to localStorage ERP orders queue
    try {
      const storedOrders = localStorage.getItem('shoppy_orders_v3');
      const existing = storedOrders ? JSON.parse(storedOrders) : [];
      localStorage.setItem('shoppy_orders_v3', JSON.stringify([newOrderObj, ...existing]));
    } catch (e) {}

    try {
      const res = await axios.post('/api/storefront/order', {
        customer_name: customerForm.name,
        customer_phone: customerForm.phone,
        customer_email: customerForm.email,
        address_line_1: customerForm.address,
        city: customerForm.city,
        state: customerForm.state,
        pincode: customerForm.pincode,
        payment_method: selectedPayment,
        coupon_code: appliedCoupon?.code,
        coupon_discount: couponDiscount,
        shipping_fee: rawShippingFee,
        items: cart.map((i) => ({ product_id: i.productId || 101, quantity: i.quantity, variant_sku: i.variantSku })),
      });

      if (appliedCoupon) {
        try {
          const rawCoupons = localStorage.getItem('shoppy_coupons');
          if (rawCoupons) {
            const parsed = JSON.parse(rawCoupons);
            const updated = parsed.map((c) => {
              if (c.code === appliedCoupon.code) {
                const nextUsed = (c.usedCount || 0) + 1;
                return {
                  ...c,
                  usedCount: nextUsed,
                  isUsed: c.isOneTimeUse ? nextUsed >= 1 : (c.usageLimit ? nextUsed >= c.usageLimit : false),
                  lastUsedAt: new Date().toISOString()
                };
              }
              return c;
            });
            localStorage.setItem('shoppy_coupons', JSON.stringify(updated));
          }
        } catch (e) {}
      }

      if (res.data?.success) {
        setOrderSuccess({ ...res.data.order, couponCode: appliedCoupon?.code, couponDiscount, payment_method: isCod ? 'COD (Cash on Delivery)' : selectedPayment.toUpperCase() });
        setCart([]);
        setAppliedCoupon(null);
        setCheckoutOpen(false);
        setCartOpen(false);
        return;
      }
    } catch (err) {}

    // Instant offline fallback success display
    if (appliedCoupon) {
      try {
        const rawCoupons = localStorage.getItem('shoppy_coupons');
        if (rawCoupons) {
          const parsed = JSON.parse(rawCoupons);
          const updated = parsed.map((c) => {
            if (c.code === appliedCoupon.code) {
              const nextUsed = (c.usedCount || 0) + 1;
              return {
                ...c,
                usedCount: nextUsed,
                isUsed: c.isOneTimeUse ? nextUsed >= 1 : (c.usageLimit ? nextUsed >= c.usageLimit : false),
                lastUsedAt: new Date().toISOString()
              };
            }
            return c;
          });
          localStorage.setItem('shoppy_coupons', JSON.stringify(updated));
        }
      } catch (e) {}
    }

    setOrderSuccess({
      order_number: orderNumber,
      invoice_number: invoiceNumber,
      grand_total: grandTotal.toFixed(2),
      couponCode: appliedCoupon?.code,
      couponDiscount: couponDiscount,
      payment_method: isCod ? 'COD (Cash on Delivery - Collect ₹' + grandTotal.toFixed(2) + ')' : selectedPayment.toUpperCase() + ' (PREPAID ONLINE)',
    });
    setCart([]);
    setAppliedCoupon(null);
    setCheckoutOpen(false);
    setCartOpen(false);
  };

  // Filtered Products based on 3-tier categories
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedTopCat !== 'ALL' && p.topCategoryId !== selectedTopCat) return false;
      if (selectedMidCat !== 'ALL' && p.midCategoryId !== selectedMidCat) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCategory = (p.topCategoryName || p.category || '').toLowerCase().includes(q);
        const matchesSku = (p.sku || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesSku) return false;
      }
      return true;
    });
  }, [products, selectedTopCat, selectedMidCat, searchQuery]);

  const activeMidCategoryOptions = useMemo(() => {
    if (selectedTopCat === 'ALL') return [];
    return midCategories.filter((m) => m.topCategoryId === selectedTopCat && m.isActive);
  }, [midCategories, selectedTopCat]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Banner with Delivery SLA & Free Shipping Threshold */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-700 to-violet-800 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-3">
        <span className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-cyan-300" />
          <span>⚡ Estimated Delivery: <strong>{shippingRules.estimatedDeliveryDays}</strong></span>
        </span>
        <span className="hidden md:inline text-indigo-300">|</span>
        <span className="hidden md:inline text-amber-300 font-bold">
          🎉 Free Shipping on all orders above ₹{shippingRules.freeShippingThreshold}!
        </span>
        <span className="hidden lg:inline text-indigo-300 font-mono text-[11px] opacity-80">
          (Store: {shopCode})
        </span>
      </div>

      {/* Main Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-600/30">
            {storeInfo?.name ? storeInfo.name[0] : 'S'}
          </div>
          <div>
            <h1 className="text-xl font-extrabold font-heading text-white tracking-tight flex items-center gap-2">
              {storeInfo?.name || 'Ramesh Fashion & Lifestyle Store'}
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold hidden sm:inline">
                Verified Seller
              </span>
            </h1>
            <p className="text-xs text-slate-400">Official Brand Storefront &amp; Direct Catalog</p>
          </div>
        </div>

        {/* Search Bar & Cart Trigger */}
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search shirts, jeans, audio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <a
            href="/shop-admin/products"
            className="text-xs text-slate-400 hover:text-white transition px-3 py-2 rounded-xl border border-slate-800 hover:border-slate-700 hidden sm:block"
          >
            Merchant ERP Admin
          </a>

          <button 
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition active:scale-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag</span>
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-white text-indigo-950 font-black text-xs flex items-center justify-center">
                {cart.reduce((a, b) => a + b.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* 3-Tier Category Filter Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3 space-y-2">
        {/* Tier 1: Top Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-7xl mx-auto">
          <button
            onClick={() => {
              setSelectedTopCat('ALL');
              setSelectedMidCat('ALL');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              selectedTopCat === 'ALL'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> All Categories
          </button>

          {topCategories.map((top) => {
            const isSelected = selectedTopCat === top.id;
            return (
              <button
                key={top.id}
                onClick={() => {
                  setSelectedTopCat(top.id);
                  setSelectedMidCat('ALL');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{top.icon || '📦'}</span>
                <span>{top.name}</span>
              </button>
            );
          })}
        </div>

        {/* Tier 2: Mid Categories (Shows when a top category is selected) */}
        {activeMidCategoryOptions.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-slate-800/80 max-w-7xl mx-auto">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-indigo-400" /> Sub-categories:
            </span>
            <button
              onClick={() => setSelectedMidCat('ALL')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                selectedMidCat === 'ALL'
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Sub-items
            </button>
            {activeMidCategoryOptions.map((mid) => (
              <button
                key={mid.id}
                onClick={() => setSelectedMidCat(mid.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  selectedMidCat === mid.id
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mid.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Catalog Section */}
      <main className="max-w-7xl w-full mx-auto p-6 flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black font-heading text-white tracking-tight flex items-center gap-2">
              Featured Products &amp; Variant Matrix
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-bold">
                {filteredProducts.length} Products Available
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your preferred color swatch and size to view real-time inventory and pricing
            </p>
          </div>
        </div>

        {/* Product Cards Grid with Interactive Variant Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const hasVariants = p.variants && p.variants.length > 0;
            const currentVariant = selectedVariants[p.id] || (hasVariants ? p.variants[0] : null);

            // Price from active variant or product
            const price = parseFloat(currentVariant ? currentVariant.sellingPrice : (p.sellingPrice || p.selling_price || 0));
            const mrp = parseFloat(currentVariant ? currentVariant.mrp : (p.mrp || 0));
            const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;
            const stock = currentVariant ? currentVariant.stock : (p.stock || 0);

            // Extract unique colors and sizes for this product
            const uniqueColors = hasVariants
              ? Array.from(new Set(p.variants.map((v) => v.color))).map((cName) => {
                  const match = p.variants.find((v) => v.color === cName);
                  return { name: cName, hex: match?.colorHex || '#1e3a8a' };
                })
              : [];

            const uniqueSizes = hasVariants
              ? Array.from(new Set(p.variants.map((v) => v.size)))
              : [];

            return (
              <div 
                key={p.id} 
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-slate-700 transition-all duration-300 flex flex-col group shadow-xl"
              >
                {/* Product Image / Icon Placeholder */}
                <div className="h-44 bg-gradient-to-br from-slate-800/80 to-slate-900 flex items-center justify-center p-4 relative">
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-black">
                      {discount}% OFF
                    </span>
                  )}
                  {p.isFreeShipping && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-black flex items-center gap-1">
                      <Truck className="w-3 h-3" /> FREE SHIP
                    </span>
                  )}
                  <span className="text-4xl group-hover:scale-110 transition duration-300">
                    {p.topCategoryId === 'TOP-4' ? '🌾' : p.topCategoryId === 'TOP-3' ? '⚡' : '👔'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Category breadcrumb pill */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
                      <span className="truncate">{p.topCategoryName || p.category} &gt; {p.midCategoryName || 'Retail'}</span>
                      <span className="font-mono">{currentVariant?.sku || p.sku}</span>
                    </div>

                    <h4 className="font-bold text-white text-sm line-clamp-1 group-hover:text-cyan-400 transition">
                      {p.name}
                    </h4>

                    {/* Stock Alert */}
                    <div className="mt-1 flex items-center gap-1.5 text-[10px]">
                      {stock > 10 ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> In Stock ({stock} available)
                        </span>
                      ) : stock > 0 ? (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Only {stock} left in stock!
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold">Out of Stock</span>
                      )}
                    </div>
                  </div>

                  {/* Interactive Variant Selectors: Colors + Sizes */}
                  {hasVariants && (
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      {/* Color Swatches */}
                      {uniqueColors.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                            <span>Color: <strong className="text-white">{currentVariant?.color}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {uniqueColors.map((clr) => {
                              const isActive = currentVariant?.color === clr.name;
                              return (
                                <button
                                  type="button"
                                  key={clr.name}
                                  onClick={() => handleSelectColor(p.id, clr.name)}
                                  title={clr.name}
                                  className={`w-5 h-5 rounded-full border-2 transition p-0.5 flex items-center justify-center ${
                                    isActive
                                      ? 'border-cyan-400 scale-110 shadow-md shadow-cyan-400/40'
                                      : 'border-slate-700 hover:border-slate-500'
                                  }`}
                                  style={{ backgroundColor: clr.hex }}
                                >
                                  {isActive && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Size Pills */}
                      {uniqueSizes.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1">
                            <span>Size: <strong className="text-white">{currentVariant?.size}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {uniqueSizes.map((sz) => {
                              const isActive = currentVariant?.size === sz;
                              return (
                                <button
                                  type="button"
                                  key={sz}
                                  onClick={() => handleSelectSize(p.id, sz)}
                                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition ${
                                    isActive
                                      ? 'bg-indigo-600 text-white shadow-xs'
                                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                                  }`}
                                >
                                  {sz}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pricing and Add To Bag Button */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-base font-black font-heading text-white">
                        ₹{price.toLocaleString('en-IN')}
                      </div>
                      {mrp > price && (
                        <div className="text-[10px] text-slate-500 line-through">
                          ₹{mrp.toLocaleString('en-IN')}
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => addToCart(p)}
                      disabled={stock === 0}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{stock > 0 ? '+ Add' : 'Sold Out'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Slide-out Cart Drawer with Dynamic Free Shipping Progress */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg text-white">Your Shopping Bag ({cart.length})</h3>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            {/* Free Shipping Progress Indicator */}
            {shippingRules.isFreeShippingEnabled && cart.length > 0 && (
              <div className="my-3 p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  {freeShippingDifference === 0 ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <PackageCheck className="w-4 h-4" /> You've unlocked 100% FREE Delivery!
                    </span>
                  ) : (
                    <span className="text-slate-300">
                      Add <strong className="text-amber-400">₹{freeShippingDifference.toFixed(0)}</strong> more for <strong>FREE Delivery</strong>!
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500">{freeShippingProgressPercent}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300"
                    style={{ width: `${freeShippingProgressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Cart Items with Variant Metadata */}
            <div className="flex-1 overflow-y-auto py-2 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                  <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
                  <p>Your bag is currently empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.cartItemId} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-white text-sm">{item.name}</h5>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-cyan-400 font-bold">
                          Size: {item.size}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-medium flex items-center gap-1">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: item.colorHex || '#1e3a8a' }}
                          />
                          {item.color}
                        </span>
                      </div>
                      <span className="text-xs text-emerald-400 font-bold block mt-1">₹{item.selling_price} each</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updateCartQty(item.cartItemId, -1)} 
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-bold text-slate-300"
                      >
                        -
                      </button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => updateCartQty(item.cartItemId, 1)} 
                        className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-bold text-slate-300"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary, Coupon Desk & Checkout */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3 text-xs">
                {/* Coupon Code Input & Promo Chips */}
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5 text-[11px]">
                      <Tag className="w-3.5 h-3.5 text-purple-400" /> Apply Discount Coupon
                    </span>
                    {appliedCoupon && (
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-[10px] text-rose-400 hover:text-rose-300 font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {!appliedCoupon ? (
                    <>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Enter Promo Code (e.g. WELCOME10)"
                          value={couponCodeInput}
                          onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                          className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs placeholder:text-slate-600 focus:outline-none focus:border-purple-500 uppercase"
                        />
                        <button
                          onClick={() => handleApplyCoupon()}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition"
                        >
                          Apply
                        </button>
                      </div>

                      {/* Quick Promo Chips */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                        <span className="text-[10px] text-slate-500 shrink-0">Try:</span>
                        <button
                          onClick={() => handleApplyCoupon('WELCOME10')}
                          className="px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[10px] font-bold hover:bg-purple-900/60 transition"
                        >
                          WELCOME10 (10% OFF)
                        </button>
                        <button
                          onClick={() => handleApplyCoupon('FLAT200')}
                          className="px-2 py-0.5 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-300 text-[10px] font-bold hover:bg-purple-900/60 transition"
                        >
                          FLAT200 (₹200 OFF)
                        </button>
                      </div>

                      {couponError && (
                        <p className="text-[10px] text-rose-400 font-semibold">{couponError}</p>
                      )}
                    </>
                  ) : (
                    <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="font-mono font-bold">{appliedCoupon.code}</span>
                          <span className="text-[10px] block text-emerald-400/80">
                            {appliedCoupon.discountType === 'percentage'
                              ? `${appliedCoupon.discountValue}% OFF (Saved ₹${couponDiscount})`
                              : `Flat ₹${appliedCoupon.discountValue} OFF`}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-400">-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-slate-400">
                    <span>Cart Subtotal:</span>
                    <span className="text-white font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-bold">
                      <span>Coupon Discount ({appliedCoupon?.code}):</span>
                      <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-400">
                    <span>Standard Shipping ({shippingRules.estimatedDeliveryDays}):</span>
                    {rawShippingFee === 0 ? (
                      <span className="text-emerald-400 font-bold uppercase">FREE</span>
                    ) : (
                      <span className="text-white font-semibold">₹{rawShippingFee.toFixed(2)}</span>
                    )}
                  </div>

                  {selectedPayment === 'cod' && codExtraFee > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>COD Handling Fee:</span>
                      <span className="text-amber-400 font-semibold">+₹{codExtraFee.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base text-white font-bold pt-2 border-t border-slate-800">
                    <span>Grand Total Payable:</span>
                    <span className="text-emerald-400 text-lg">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleOpenCheckout}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 mt-2"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">Direct Checkout &amp; Dispatch</h3>
              <button onClick={() => setCheckoutOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            {/* Delivery Address */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> 1. Shipping Address (Doorstep Delivery)
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={customerForm.name} 
                  onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
                <input 
                  type="text" 
                  placeholder="Mobile Phone" 
                  value={customerForm.phone} 
                  onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
              <input 
                type="text" 
                placeholder="Complete Address (House/Flat No, Street, Landmark)" 
                value={customerForm.address} 
                onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
              <div className="grid grid-cols-3 gap-3">
                <input 
                  type="text" 
                  placeholder="City" 
                  value={customerForm.city} 
                  onChange={(e) => setCustomerForm({...customerForm, city: e.target.value})}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
                <input 
                  type="text" 
                  placeholder="State" 
                  value={customerForm.state} 
                  onChange={(e) => setCustomerForm({...customerForm, state: e.target.value})}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
                <input 
                  type="text" 
                  placeholder="Pincode" 
                  value={customerForm.pincode} 
                  onChange={(e) => setCustomerForm({...customerForm, pincode: e.target.value})}
                  className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Payment Mode Selection */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> 2. Choose Payment Mode
              </h4>
              <div className="space-y-2">
                {paymentMethods.map((method) => (
                  <label 
                    key={method.code} 
                    className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition ${
                      selectedPayment === method.code 
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-xs' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value={method.code} 
                      checked={selectedPayment === method.code}
                      onChange={() => setSelectedPayment(method.code)}
                      className="mt-1 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{method.name}</span>
                        {method.code === 'cod' && codExtraFee > 0 && (
                          <span className="text-[10px] text-amber-400 font-bold">+₹{codExtraFee} Handling</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Order Price Breakdown & CTA */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Cart Items Subtotal:</span>
                  <span className="text-white font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Coupon Savings ({appliedCoupon?.code}):</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Standard Shipping Freight:</span>
                  {rawShippingFee === 0 ? (
                    <span className="text-emerald-400 font-bold">FREE DELIVERY</span>
                  ) : (
                    <span className="text-white font-semibold">₹{rawShippingFee.toFixed(2)}</span>
                  )}
                </div>
                {selectedPayment === 'cod' && codExtraFee > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>COD Convenience & Cash Handling:</span>
                    <span className="text-amber-400 font-semibold">+₹{codExtraFee.toFixed(2)}</span>
                  </div>
                )}
                {selectedPayment === 'cod' && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-amber-300/90 flex items-center gap-1.5">
                    <span>📦 <strong>Cash on Delivery:</strong> Please keep exact change ₹{grandTotal.toFixed(2)} ready at delivery.</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[11px] text-slate-400 block">Total Amount to Pay:</span>
                  <span className="text-xl font-black text-emerald-400 font-heading">₹{grandTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={handlePlaceOrder}
                  className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xl shadow-emerald-600/25 transition active:scale-95 flex items-center gap-1.5"
                >
                  <span>Confirm &amp; Place Order</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Order Confirmed Successfully!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your order with selected variants and shipping has been booked into the merchant catalog.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Order ID:</span> <code className="text-white font-mono font-bold">{orderSuccess.order_number}</code></div>
              <div className="flex justify-between"><span className="text-slate-400">GST Invoice:</span> <code className="text-emerald-400 font-mono font-bold">{orderSuccess.invoice_number}</code></div>
              <div className="flex justify-between"><span className="text-slate-400">Total Paid/Due:</span> <span className="text-white font-bold">₹{orderSuccess.grand_total}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Payment Mode:</span> <span className="text-white uppercase font-bold">{orderSuccess.payment_method}</span></div>
            </div>

            <button 
              onClick={() => setOrderSuccess(null)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/25"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Storefront />);
}

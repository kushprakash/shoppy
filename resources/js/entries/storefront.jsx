import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { 
  ShoppingBag, ShieldCheck, Truck, ArrowRight, CheckCircle2, 
  CreditCard, Sparkles, AlertCircle, Search, Tag, X, User, MapPin, Phone
} from 'lucide-react';

export default function Storefront() {
  const [shopCode, setShopCode] = useState(document.getElementById('root')?.dataset?.shopCode || 'SHP-A4IFYK');
  const [storeInfo, setStoreInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
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
    city: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
  });
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [loading, setLoading] = useState(true);

  axios.defaults.headers.common['X-Shop-Code'] = shopCode;

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const [infoRes, catalogRes] = await Promise.all([
        axios.get('/api/storefront/info'),
        axios.get('/api/storefront/catalog'),
      ]);

      if (infoRes.data.success) {
        setStoreInfo(infoRes.data.store);
        setCategories(infoRes.data.categories || []);
      }
      if (catalogRes.data.success) {
        setProducts(catalogRes.data.data.data || []);
      }
    } catch (err) {
      console.warn('Backend API offline, loading default catalog products:', err);
      setStoreInfo({
        name: shopCode === 'STORE983515' ? 'Verma General & Kirana Store' : 'Ramesh Fashion Store',
        code: shopCode,
      });
      setCategories(['Fashion', 'Grocery', 'Electronics', 'Footwear']);
      setProducts([
        {
          id: 101,
          name: 'Classic Slim Fit Denim Shirt',
          sku: 'SHRT-DNM-001',
          selling_price: '1299.00',
          mrp: '1999.00',
          description: 'Premium 100% breathable washed cotton denim shirt with reinforced double stitching.',
        },
        {
          id: 102,
          name: 'Daawat Rozana Gold Basmati Rice (5 Kg)',
          sku: 'GROC-BSM-5KG',
          selling_price: '449.00',
          mrp: '560.00',
          description: 'Aromatic long grain basmati rice, perfect for biryani and daily family meals.',
        },
        {
          id: 103,
          name: 'Fast Charging 65W GaN Multi-Port Adapter',
          sku: 'ELEC-GAN-65W',
          selling_price: '1850.00',
          mrp: '2999.00',
          description: 'Universal Type-C PD adapter with surge protection for laptops and smartphones.',
        },
        {
          id: 104,
          name: 'Embroidered Festive Anarkali Kurti',
          sku: 'KURT-ANK-004',
          selling_price: '1599.00',
          mrp: '2499.00',
          description: 'Pure chanderi silk fabric with zari border work, ideal for festive celebrations.',
        },
      ]);
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
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStoreData();
  }, [shopCode]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const updateCartQty = (productId, delta) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === productId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((acc, item) => acc + (parseFloat(item.selling_price) * item.quantity), 0);
  const shippingCharge = subtotal > 0 ? 50.00 : 0.00;
  const grandTotal = subtotal + shippingCharge;

  const handleOpenCheckout = () => {
    fetchPaymentMethods();
    setCheckoutOpen(true);
  };

  const handlePlaceOrder = async () => {
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
        items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      });

      if (res.data.success) {
        setOrderSuccess(res.data.order);
        setCart([]);
        setCheckoutOpen(false);
        setCartOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Order failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-700 to-violet-800 text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-3">
        <span>⚡ Superfast Delivery by Shiprocket / NimbusPost | Free returns within 7 days</span>
        <span className="hidden md:inline font-mono opacity-80">Shop Code: {shopCode}</span>
      </div>

      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-600/30">
            R
          </div>
          <div>
            <h1 className="text-xl font-extrabold font-heading text-white tracking-tight">
              {storeInfo?.name || 'Ramesh Fashion Store'}
            </h1>
            <p className="text-xs text-slate-400">Official Brand Storefront</p>
          </div>
        </div>

        {/* Navigation & Cart Button */}
        <div className="flex items-center gap-4">
          <a href="/shop-admin" className="text-xs text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700">
            Merchant Admin
          </a>
          <button 
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition"
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

      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800 py-16 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Season Collections & Grocery Essentials</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black font-heading text-white tracking-tight leading-tight">
            Premium Fashion & Everyday Essentials
          </h2>
          <p className="text-slate-400 mt-3 text-base max-w-2xl mx-auto">
            Order online with instant GST invoice, fast courier dispatch, and secure payments via PhonePe, Cashfree, PayU, Easebuzz or Cash on Delivery.
          </p>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <main className="max-w-7xl w-full mx-auto p-6 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-bold font-heading text-white">Featured Products</h3>
            <p className="text-sm text-slate-400">Handpicked directly from our warehouse inventory</p>
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((p) => {
            const price = parseFloat(p.selling_price);
            const mrp = parseFloat(p.mrp);
            const discount = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

            return (
              <div key={p.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all duration-300 flex flex-col group shadow-lg">
                <div className="h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center p-4 relative">
                  {discount > 0 && (
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-extrabold">
                      {discount}% OFF
                    </span>
                  )}
                  <span className="text-4xl">🛍️</span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono text-slate-500">{p.sku}</span>
                    <h4 className="font-bold text-white text-base mt-1 line-clamp-1">{p.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-lg font-black font-heading text-white">₹{price.toLocaleString('en-IN')}</div>
                      {mrp > price && (
                        <div className="text-xs text-slate-500 line-through">₹{mrp.toLocaleString('en-IN')}</div>
                      )}
                    </div>
                    <button 
                      onClick={() => addToCart(p)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Slide-out Cart Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-lg text-white">Your Shopping Bag ({cart.length})</h3>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
                  <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
                  <p>Your bag is currently empty.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold text-white text-sm">{item.name}</h5>
                      <span className="text-xs text-emerald-400 font-bold">₹{item.selling_price} each</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => updateCartQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-bold text-slate-300">-</button>
                      <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                      <button onClick={() => updateCartQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center font-bold text-slate-300">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary & Checkout */}
            {cart.length > 0 && (
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal:</span>
                  <span className="text-white font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Shipping (Express):</span>
                  <span className="text-white font-semibold">₹{shippingCharge.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base text-white font-bold pt-2 border-t border-slate-800">
                  <span>Total Payable:</span>
                  <span className="text-emerald-400 text-lg">₹{grandTotal.toFixed(2)}</span>
                </div>

                <button 
                  onClick={handleOpenCheckout}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition flex items-center justify-center gap-2 mt-4"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-lg text-white">Secure Checkout</h3>
              <button onClick={() => setCheckoutOpen(false)} className="text-slate-400 hover:text-white text-lg">✕</button>
            </div>

            {/* Delivery Address */}
            <div className="mt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Delivery Address</h4>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  value={customerForm.name} 
                  onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                />
                <input 
                  type="text" 
                  placeholder="Mobile Phone" 
                  value={customerForm.phone} 
                  onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                />
              </div>
              <input 
                type="text" 
                placeholder="Full Delivery Address" 
                value={customerForm.address} 
                onChange={(e) => setCustomerForm({...customerForm, address: e.target.value})}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
              />
              <div className="grid grid-cols-3 gap-3">
                <input 
                  type="text" 
                  placeholder="City" 
                  value={customerForm.city} 
                  onChange={(e) => setCustomerForm({...customerForm, city: e.target.value})}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                />
                <input 
                  type="text" 
                  placeholder="State" 
                  value={customerForm.state} 
                  onChange={(e) => setCustomerForm({...customerForm, state: e.target.value})}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white"
                />
                <input 
                  type="text" 
                  placeholder="Pincode" 
                  value={customerForm.pincode} 
                  onChange={(e) => setCustomerForm({...customerForm, pincode: e.target.value})}
                  className="px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-white font-mono"
                />
              </div>
            </div>

            {/* Payment Method Selection (DYNAMIC PRD RULE) */}
            <div className="mt-6 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Select Payment Method</h4>
                <span className="text-xs text-amber-400">
                  {paymentMethods.filter(m => m.type === 'online').length === 0 ? 'Only COD Active by Default' : 'Online Gateways Enabled'}
                </span>
              </div>

              <div className="space-y-2.5">
                {paymentMethods.map((method) => (
                  <label 
                    key={method.code} 
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
                      selectedPayment === method.code 
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-500/10' 
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
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-sm">{method.name}</span>
                        {method.is_test_mode && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono">
                            TEST MODE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{method.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Place Order CTA */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Amount:</span>
                <span className="text-xl font-black text-emerald-400 font-heading">₹{grandTotal.toFixed(2)}</span>
              </div>
              <button 
                onClick={handlePlaceOrder}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/25 transition active:scale-95"
              >
                Confirm & Place Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black font-heading text-white">Order Confirmed!</h3>
            <p className="text-sm text-slate-400 mt-2">Thank you! Your order has been placed and registered in the store system.</p>

            <div className="my-6 p-4 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-400">Order Number:</span> <code className="text-white font-mono">{orderSuccess.order_number}</code></div>
              <div className="flex justify-between"><span className="text-slate-400">GST Invoice No:</span> <code className="text-emerald-400 font-mono">{orderSuccess.invoice_number}</code></div>
              <div className="flex justify-between"><span className="text-slate-400">Total Paid/Due:</span> <span className="text-white font-bold">₹{orderSuccess.grand_total}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Payment Mode:</span> <span className="text-white uppercase font-bold">{orderSuccess.payment_method}</span></div>
            </div>

            <button 
              onClick={() => setOrderSuccess(null)}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/25"
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

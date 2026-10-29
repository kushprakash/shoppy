import React, { createContext, useContext, useState, useEffect } from 'react';

const ErpContext = createContext();

export const INITIAL_PRODUCTS = [
  {
    id: 'PRD-101',
    name: 'Premium Cotton Slim Fit Shirt',
    category: 'Fashion & Apparel',
    businessCategory: 'fashion',
    sku: 'FSH-SHIRT-01',
    barcode: '890123400101',
    purchasePrice: 650.0,
    sellingPrice: 1299.0,
    mrp: 1999.0,
    gstRate: 5,
    hsnCode: '6205',
    unit: 'pcs',
    stock: 52,
    reorderLevel: 15,
    branch: 'Main Branch (Downtown)',
    variants: [
      { size: 'M', color: 'Sky Blue', stock: 18 },
      { size: 'L', color: 'White', stock: 22 },
      { size: 'XL', color: 'Navy Blue', stock: 12 }
    ],
    status: 'In Stock'
  },
  {
    id: 'PRD-102',
    name: 'Dark Indigo Stretch Denim Jeans',
    category: 'Fashion & Apparel',
    businessCategory: 'fashion',
    sku: 'FSH-JEANS-01',
    barcode: '890123400102',
    purchasePrice: 950.0,
    sellingPrice: 1899.0,
    mrp: 2499.0,
    gstRate: 12,
    hsnCode: '6203',
    unit: 'pcs',
    stock: 34,
    reorderLevel: 10,
    branch: 'Main Branch (Downtown)',
    variants: [
      { size: '32', color: 'Dark Indigo', stock: 14 },
      { size: '34', color: 'Dark Indigo', stock: 20 }
    ],
    status: 'In Stock'
  },
  {
    id: 'PRD-103',
    name: 'Royal Basmati Rice 5kg Aged Pack',
    category: 'Grocery & Supermarket',
    businessCategory: 'grocery',
    sku: 'GROC-RICE-05',
    barcode: '890123400103',
    purchasePrice: 380.0,
    sellingPrice: 480.0,
    mrp: 550.0,
    gstRate: 0,
    hsnCode: '1006',
    unit: 'pack',
    stock: 120,
    reorderLevel: 30,
    branch: 'Central Warehouse',
    batchNo: 'BAT-2026-R09',
    mfgDate: '2026-08-01',
    expiryDate: '2028-07-31',
    fssai: '10019022001429',
    status: 'In Stock'
  },
  {
    id: 'PRD-104',
    name: 'Pure Desi Cow Ghee 1L Tin',
    category: 'Grocery & Supermarket',
    businessCategory: 'grocery',
    sku: 'GROC-GHEE-01',
    barcode: '890123400104',
    purchasePrice: 520.0,
    sellingPrice: 650.0,
    mrp: 720.0,
    gstRate: 12,
    hsnCode: '0405',
    unit: 'tin',
    stock: 8,
    reorderLevel: 15,
    branch: 'Main Branch (Downtown)',
    batchNo: 'BAT-2026-G42',
    mfgDate: '2026-09-10',
    expiryDate: '2027-03-10',
    fssai: '10019022001429',
    status: 'Low Stock'
  },
  {
    id: 'PRD-105',
    name: 'True Wireless Stereo Earbuds v5.3',
    category: 'Electronics & Gadgets',
    businessCategory: 'electronics',
    sku: 'ELEC-BUDS-01',
    barcode: '890123400105',
    purchasePrice: 850.0,
    sellingPrice: 1499.0,
    mrp: 2999.0,
    gstRate: 18,
    hsnCode: '8518',
    unit: 'pcs',
    stock: 24,
    reorderLevel: 10,
    branch: 'Outlet #2 (Mall Road)',
    serials: ['SN-882901-A', 'SN-882902-A', 'SN-882903-A'],
    warrantyMonths: 12,
    status: 'In Stock'
  },
  {
    id: 'PRD-106',
    name: 'GaN 65W Fast Wall Charger (Type-C + USB)',
    category: 'Electronics & Gadgets',
    businessCategory: 'electronics',
    sku: 'ELEC-CHRG-65',
    barcode: '890123400106',
    purchasePrice: 620.0,
    sellingPrice: 1199.0,
    mrp: 1899.0,
    gstRate: 18,
    hsnCode: '8504',
    unit: 'pcs',
    stock: 5,
    reorderLevel: 12,
    branch: 'Outlet #2 (Mall Road)',
    serials: ['SN-65W-1092', 'SN-65W-1093'],
    warrantyMonths: 18,
    status: 'Low Stock'
  },
  {
    id: 'PRD-107',
    name: 'Pure Organic Wild Forest Honey 500g',
    category: 'Grocery & Supermarket',
    businessCategory: 'grocery',
    sku: 'GROC-HNY-500',
    barcode: '890123400107',
    purchasePrice: 220.0,
    sellingPrice: 340.0,
    mrp: 410.0,
    gstRate: 5,
    hsnCode: '0409',
    unit: 'jar',
    stock: 0,
    reorderLevel: 15,
    branch: 'Central Warehouse',
    batchNo: 'BAT-2026-H11',
    expiryDate: '2027-09-30',
    status: 'Out of Stock'
  },
  {
    id: 'PRD-108',
    name: 'Handcrafted Festive Linen Kurta',
    category: 'Fashion & Apparel',
    businessCategory: 'fashion',
    sku: 'FSH-KURTA-09',
    barcode: '890123400108',
    purchasePrice: 850.0,
    sellingPrice: 1699.0,
    mrp: 2299.0,
    gstRate: 5,
    hsnCode: '6205',
    unit: 'pcs',
    stock: 45,
    reorderLevel: 10,
    branch: 'Main Branch (Downtown)',
    variants: [
      { size: 'M', color: 'Beige', stock: 15 },
      { size: 'L', color: 'Mustard', stock: 18 },
      { size: 'XL', color: 'Teal', stock: 12 }
    ],
    status: 'In Stock'
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ORD-2026-9041',
    customerName: 'Vikramaditya Rathore',
    phone: '+91 98290 11234',
    itemsCount: 3,
    subtotal: 3198.0,
    gstTotal: 184.0,
    total: 3382.0,
    paymentMethod: 'PhonePe UPI',
    paymentStatus: 'Paid',
    channel: 'Storefront Online',
    fulfillment: 'Shiprocket Dispatched',
    awb: 'SR-9920148102',
    date: '2026-10-21 02:45 PM',
    items: [
      { name: 'Premium Cotton Slim Fit Shirt (L)', qty: 1, price: 1299.0, gst: '5%' },
      { name: 'Dark Indigo Stretch Denim Jeans (34)', qty: 1, price: 1899.0, gst: '12%' }
    ]
  },
  {
    id: 'ORD-2026-9040',
    customerName: 'Ananya Deshmukh',
    phone: '+91 97412 88451',
    itemsCount: 2,
    subtotal: 1130.0,
    gstTotal: 78.0,
    total: 1208.0,
    paymentMethod: 'Cash Counter (POS)',
    paymentStatus: 'Paid',
    channel: 'POS Counter 01',
    fulfillment: 'Completed (Handover)',
    awb: 'POS-WALK-IN',
    date: '2026-10-21 01:20 PM',
    items: [
      { name: 'Pure Desi Cow Ghee 1L Tin', qty: 1, price: 650.0, gst: '12%' },
      { name: 'Royal Basmati Rice 5kg Aged Pack', qty: 1, price: 480.0, gst: '0%' }
    ]
  },
  {
    id: 'ORD-2026-9039',
    customerName: 'Gaurav Kulkarni',
    phone: '+91 99200 44102',
    itemsCount: 1,
    subtotal: 1499.0,
    gstTotal: 228.66,
    total: 1499.0,
    paymentMethod: 'Razorpay Cards',
    paymentStatus: 'Paid',
    channel: 'Storefront Online',
    fulfillment: 'NimbusPost In-Transit',
    awb: 'NP-4481092811',
    date: '2026-10-20 06:15 PM',
    items: [
      { name: 'True Wireless Stereo Earbuds v5.3', qty: 1, price: 1499.0, gst: '18%' }
    ]
  },
  {
    id: 'ORD-2026-9038',
    customerName: 'Rajesh Meena',
    phone: '+91 94140 22910',
    itemsCount: 1,
    subtotal: 1699.0,
    gstTotal: 80.9,
    total: 1699.0,
    paymentMethod: 'Cash on Delivery (COD)',
    paymentStatus: 'Pending Delivery',
    channel: 'Storefront Online',
    fulfillment: 'iThink Logistics Booked',
    awb: 'ITL-772901923',
    date: '2026-10-20 03:10 PM',
    items: [
      { name: 'Handcrafted Festive Linen Kurta (L)', qty: 1, price: 1699.0, gst: '5%' }
    ]
  }
];

export const INITIAL_SUPPLIERS = [
  {
    id: 'SUP-101',
    name: 'Raymond Textiles & Garments Ltd',
    contactPerson: 'Sanjay Kapoor',
    phone: '+91 98201 55678',
    email: 'b2b@raymondapparel.com',
    gstin: '27AAACR1290M1ZP',
    city: 'Bhiwandi, Maharashtra',
    category: 'Fabrics & Apparel',
    balancePayable: 42500.0,
    status: 'Active'
  },
  {
    id: 'SUP-102',
    name: 'ITC Agri & Foods Distribution',
    contactPerson: 'Manoj Bajpai',
    phone: '+91 99340 77123',
    email: 'supply@itcagri.in',
    gstin: '19AAACI2210K1ZV',
    city: 'Kolkata, WB',
    category: 'Grains, Ghee & Agro',
    balancePayable: 18200.0,
    status: 'Active'
  },
  {
    id: 'SUP-103',
    name: 'Alpha Gadgets & Wireless Importers',
    contactPerson: 'Nitin Singhania',
    phone: '+91 98110 33490',
    email: 'sales@alphagadgets.co.in',
    gstin: '07AAACA9910J1ZU',
    city: 'Nehru Place, New Delhi',
    category: 'TWS & Fast Chargers',
    balancePayable: 65400.0,
    status: 'Active'
  }
];

export const INITIAL_CUSTOMERS = [
  {
    id: 'CUST-801',
    name: 'Vikramaditya Rathore',
    mobile: '+91 98290 11234',
    email: 'vikram.rathore@outlook.com',
    city: 'Jaipur, RJ',
    totalOrders: 14,
    lifetimeSpend: 42800.0,
    loyaltyPoints: 428,
    gstin: '08ABCDE1234F1Z5',
    category: 'B2B Wholesale'
  },
  {
    id: 'CUST-802',
    name: 'Ananya Deshmukh',
    mobile: '+91 97412 88451',
    email: 'ananya.d@gmail.com',
    city: 'Mumbai, MH',
    totalOrders: 6,
    lifetimeSpend: 9450.0,
    loyaltyPoints: 94,
    gstin: 'N/A',
    category: 'Retail Walk-in'
  },
  {
    id: 'CUST-803',
    name: 'Gaurav Kulkarni',
    mobile: '+91 99200 44102',
    email: 'gaurav.k@tcs.com',
    city: 'Pune, MH',
    totalOrders: 4,
    lifetimeSpend: 7850.0,
    loyaltyPoints: 78,
    gstin: 'N/A',
    category: 'Online Direct'
  }
];

export const INITIAL_BRANCHES = [
  { id: 'BR-01', name: 'Main Branch (Downtown)', code: 'HQ-MAIN', city: 'Jaipur', type: 'Retail Store + POS', skus: 142, activeTill: 'POS-01 (Online)' },
  { id: 'BR-02', name: 'Outlet #2 (Mall Road)', code: 'OUT-MALL', city: 'Jaipur', type: 'Retail Store + POS', skus: 98, activeTill: 'POS-02 (Online)' },
  { id: 'BR-03', name: 'Central Warehouse & Hub', code: 'WH-CENTRAL', city: 'Sanganer', type: 'Central Fulfillment', skus: 210, activeTill: 'No Till (Dispatches Only)' }
];

export function ErpProvider({ children }) {
  const shopCode = document.getElementById('root')?.dataset?.shopCode || 'SHP-A4IFYK';

  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [branches, setBranches] = useState(INITIAL_BRANCHES);

  const [gateways, setGateways] = useState([
    { gateway_code: 'phonepe', display_name: 'PhonePe PG (UPI & Cards)', is_active: true, is_test_mode: false, has_credentials: true },
    { gateway_code: 'payu', display_name: 'PayU Money & Enterprise', is_active: false, is_test_mode: true, has_credentials: false },
    { gateway_code: 'cashfree', display_name: 'Cashfree Payments & Subscriptions', is_active: true, is_test_mode: true, has_credentials: true },
    { gateway_code: 'easebuzz', display_name: 'Easebuzz Smart Checkout', is_active: false, is_test_mode: true, has_credentials: false },
    { gateway_code: 'razorpay', display_name: 'Razorpay Standard Checkout', is_active: true, is_test_mode: false, has_credentials: true }
  ]);

  const [shippingProviders, setShippingProviders] = useState([
    { provider_code: 'shiprocket', display_name: 'Shiprocket Multi-Carrier', is_active: true, pickup_pincode: '302001' },
    { provider_code: 'ithink', display_name: 'iThink Logistics Express', is_active: true, pickup_pincode: '302001' },
    { provider_code: 'nimbuspost', display_name: 'NimbusPost Smart Automation', is_active: true, pickup_pincode: '302001' },
    { provider_code: 'shipmozo', display_name: 'Shipmozo Aggregator', is_active: false, pickup_pincode: '302001' },
    { provider_code: 'shipway', display_name: 'Shipway Live Tracking', is_active: false, pickup_pincode: '302001' }
  ]);

  const [fallbackPolicy, setFallbackPolicy] = useState({
    has_active_online_gateway: true,
    active_checkout_mode: 'Online Gateways Active + COD Enabled'
  });

  const [shiftData, setShiftData] = useState({
    shiftId: 'SHT-2026-1021-01',
    cashier: 'Ramesh Verma (Store Manager)',
    openedAt: '2026-10-21 09:00 AM',
    openingFloat: 2500.0,
    cashSales: 18450.0,
    upiSales: 24300.0,
    cardSales: 5500.0,
    pettyCashOut: 450.0,
    expectedCashInDrawer: 20500.0,
    actualPhysicalCash: 20500.0
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_erp_theme');
      if (stored) return stored === 'dark';
      const cookieMatch = document.cookie.match(/(?:^|; )shoppy_erp_theme=([^;]*)/);
      return cookieMatch ? cookieMatch[1] === 'dark' : false;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('shoppy_erp_theme', 'dark');
        document.cookie = "shoppy_erp_theme=dark; path=/; max-age=31536000; SameSite=Lax";
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('shoppy_erp_theme', 'light');
        document.cookie = "shoppy_erp_theme=light; path=/; max-age=31536000; SameSite=Lax";
      }
    } catch (e) {}
  }, [isDarkMode]);

  const [toastMessage, setToastMessage] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedBarcodeProduct, setSelectedBarcodeProduct] = useState(null);
  const [isZReportOpen, setIsZReportOpen] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const addProduct = (prod) => {
    setProducts((prev) => [prod, ...prev]);
    showToast(`Product ${prod.name} added to catalog!`);
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product removed from catalog');
  };

  const addSupplier = (sup) => {
    setSuppliers((prev) => [sup, ...prev]);
    showToast(`Supplier ${sup.name} onboarded!`);
  };

  const toggleGateway = (gw) => {
    setGateways((prev) => {
      const updated = prev.map((g) => (g.gateway_code === gw.gateway_code ? { ...g, is_active: !g.is_active } : g));
      const hasActive = updated.some((g) => g.is_active);
      setFallbackPolicy({
        has_active_online_gateway: hasActive,
        active_checkout_mode: hasActive ? 'Online Gateways Active + COD Enabled' : 'Default Fallback Mode: COD Only'
      });
      return updated;
    });
    showToast(`Gateway ${gw.display_name} ${!gw.is_active ? 'Activated' : 'Deactivated'}`);
  };

  const toggleShipping = (provider) => {
    setShippingProviders((prev) =>
      prev.map((p) => (p.provider_code === provider.provider_code ? { ...p, is_active: !p.is_active } : p))
    );
    showToast(`Courier ${provider.display_name} ${!provider.is_active ? 'Activated' : 'Deactivated'}`);
  };

  return (
    <ErpContext.Provider
      value={{
        shopCode,
        products,
        setProducts,
        addProduct,
        deleteProduct,
        orders,
        setOrders,
        suppliers,
        addSupplier,
        customers,
        branches,
        gateways,
        toggleGateway,
        shippingProviders,
        toggleShipping,
        fallbackPolicy,
        shiftData,
        isDarkMode,
        toggleDarkMode,
        toastMessage,
        showToast,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        selectedInvoice,
        setSelectedInvoice,
        selectedBarcodeProduct,
        setSelectedBarcodeProduct,
        isZReportOpen,
        setIsZReportOpen,
        isStockAdjustmentOpen,
        setIsStockAdjustmentOpen
      }}
    >
      {children}
    </ErpContext.Provider>
  );
}

export function useErp() {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
}

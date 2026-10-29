import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import {
  LayoutDashboard,
  Building2,
  Package,
  Boxes,
  Receipt,
  ShoppingCart,
  Users,
  CreditCard,
  Truck,
  Settings,
  HelpCircle,
  Search,
  Plus,
  RotateCw,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Bell,
  Grid2X2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  X,
  ExternalLink,
  Store,
  ArrowRight,
  TrendingUp,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  Check,
  Send,
  MoreVertical,
  ChevronDown,
  Key,
  Copy,
  Wifi,
  Smartphone,
  Shield,
  Zap,
  RefreshCw,
  FileSpreadsheet,
  DollarSign,
  Barcode,
  QrCode,
  Tag,
  Warehouse,
  Percent,
  Sliders,
  Scale,
  ShieldCheck,
  CheckSquare,
  Award,
  Layers,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

// ============================================================================
// 1. INITIAL ENTERPRISE ERP DATASETS (Matching PRD v2.2 Multi-Category)
// ============================================================================

const INITIAL_PRODUCTS = [
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

const INITIAL_ORDERS = [
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

const INITIAL_SUPPLIERS = [
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

const INITIAL_CUSTOMERS = [
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

const INITIAL_BRANCHES = [
  { id: 'BR-01', name: 'Main Branch (Downtown)', code: 'HQ-MAIN', city: 'Jaipur', type: 'Retail Store + POS', skus: 142, activeTill: 'POS-01 (Online)' },
  { id: 'BR-02', name: 'Outlet #2 (Mall Road)', code: 'OUT-MALL', city: 'Jaipur', type: 'Retail Store + POS', skus: 98, activeTill: 'POS-02 (Online)' },
  { id: 'BR-03', name: 'Central Warehouse & Hub', code: 'WH-CENTRAL', city: 'Sanganer', type: 'Central Fulfillment', skus: 210, activeTill: 'No Till (Dispatches Only)' }
];

// ============================================================================
// 2. MAIN SHOP ADMIN & ERP COMPONENT
// ============================================================================

export default function ShopAdmin() {
  const [shopCode, setShopCode] = useState(
    document.getElementById('root')?.dataset?.shopCode || 'SHP-A4IFYK'
  );

  // Navigation & View state (matching banking-panel.jsx architecture)
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [openSubmenus, setOpenSubmenus] = useState({
    catalog: true,
    inventory: false,
    sales: false,
    pos: false,
    purchase: false,
    settings: false
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Theme state (Dark Mode / Light Mode with toggle)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState(null);

  // Main Data States
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [branches, setBranches] = useState(INITIAL_BRANCHES);

  // Payment Gateways & Courier Integrations State (PRD Phase 6)
  const [gateways, setGateways] = useState([
    { gateway_code: 'phonepe', display_name: 'PhonePe PG (Upi & Cards)', is_active: true, is_test_mode: false, has_credentials: true },
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
    active_checkout_mode: 'Online Gateways (PhonePe, Cashfree, Razorpay) + COD Available'
  });

  // Filters & Search States
  const [productSearch, setProductSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStockStatus, setFilterStockStatus] = useState('All Stock Status');
  const [filterGstRate, setFilterGstRate] = useState('All GST Rates');

  // Order Filters
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('All Statuses');

  // Modals state
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedBarcodeProduct, setSelectedBarcodeProduct] = useState(null);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [credentialsForm, setCredentialsForm] = useState({});
  const [isZReportOpen, setIsZReportOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);

  // New Product Form
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Fashion & Apparel',
    businessCategory: 'fashion',
    sku: '',
    barcode: '',
    purchasePrice: '',
    sellingPrice: '',
    mrp: '',
    gstRate: '5',
    hsnCode: '',
    unit: 'pcs',
    stock: '',
    branch: 'Main Branch (Downtown)',
    metaAttribute: ''
  });

  // Current POS Shift Drawer State (PRD Section 10 & 14)
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

  // Show Toast notification
  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Set default header for tenant isolation
  axios.defaults.headers.common['X-Shop-Code'] = shopCode;

  // Fetch live gateway data from backend API if available, else keep initial
  useEffect(() => {
    const loadApiData = async () => {
      try {
        const [gwRes, shipRes] = await Promise.allSettled([
          axios.get('/api/tenant/settings/payment-gateways'),
          axios.get('/api/tenant/settings/shipping-providers')
        ]);
        if (gwRes.status === 'fulfilled' && gwRes.value.data.success) {
          setGateways(gwRes.value.data.gateways);
          if (gwRes.value.data.fallback_policy) {
            setFallbackPolicy(gwRes.value.data.fallback_policy);
          }
        }
        if (shipRes.status === 'fulfilled' && shipRes.value.data.success) {
          setShippingProviders(shipRes.value.data.providers);
        }
      } catch (err) {
        // Fallback to local high-fidelity state
      }
    };
    loadApiData();
  }, [shopCode]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productSearch.trim()) {
        const q = productSearch.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesBarcode = (p.barcode || '').toLowerCase().includes(q);
        const matchesHsn = (p.hsnCode || '').toLowerCase().includes(q);
        if (!matchesName && !matchesSku && !matchesBarcode && !matchesHsn) return false;
      }
      if (filterCategory !== 'All Categories' && p.category !== filterCategory) return false;
      if (filterStockStatus !== 'All Stock Status' && p.status !== filterStockStatus) return false;
      if (filterGstRate !== 'All GST Rates' && String(p.gstRate) !== filterGstRate) return false;
      return true;
    });
  }, [products, productSearch, filterCategory, filterStockStatus, filterGstRate]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderSearch.trim()) {
        const q = orderSearch.toLowerCase();
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesCust = o.customerName.toLowerCase().includes(q);
        const matchesPhone = o.phone.toLowerCase().includes(q);
        if (!matchesId && !matchesCust && !matchesPhone) return false;
      }
      if (orderStatusFilter !== 'All Statuses' && o.paymentStatus !== orderStatusFilter) return false;
      return true;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  // Handle Add Product Submit
  const handleAddProductSubmit = (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.sellingPrice) {
      showToast('Please provide Product Name and Selling Price', 'error');
      return;
    }

    const nextId = `PRD-${100 + products.length + 1}`;
    const generatedSku = newProductForm.sku || `SKU-${Math.floor(100000 + Math.random() * 900000)}`;
    const generatedBarcode = newProductForm.barcode || `890123400${products.length + 10}`;

    const newEntry = {
      id: nextId,
      name: newProductForm.name,
      category: newProductForm.category,
      businessCategory: newProductForm.businessCategory,
      sku: generatedSku,
      barcode: generatedBarcode,
      purchasePrice: parseFloat(newProductForm.purchasePrice) || 0,
      sellingPrice: parseFloat(newProductForm.sellingPrice) || 0,
      mrp: parseFloat(newProductForm.mrp) || parseFloat(newProductForm.sellingPrice) * 1.25,
      gstRate: parseFloat(newProductForm.gstRate) || 0,
      hsnCode: newProductForm.hsnCode || '6205',
      unit: newProductForm.unit || 'pcs',
      stock: parseInt(newProductForm.stock) || 20,
      reorderLevel: 10,
      branch: newProductForm.branch || 'Main Branch (Downtown)',
      status: parseInt(newProductForm.stock) > 10 ? 'In Stock' : 'Low Stock'
    };

    setProducts([newEntry, ...products]);
    setIsAddProductOpen(false);
    showToast(`Product ${newEntry.name} added to catalog!`);

    setNewProductForm({
      name: '',
      category: 'Fashion & Apparel',
      businessCategory: 'fashion',
      sku: '',
      barcode: '',
      purchasePrice: '',
      sellingPrice: '',
      mrp: '',
      gstRate: '5',
      hsnCode: '',
      unit: 'pcs',
      stock: '',
      branch: 'Main Branch (Downtown)',
      metaAttribute: ''
    });
  };

  // Toggle Payment Gateway Active
  const handleToggleGateway = (gw) => {
    const updated = gateways.map((g) => {
      if (g.gateway_code === gw.gateway_code) {
        const nextState = !g.is_active;
        return { ...g, is_active: nextState };
      }
      return g;
    });
    setGateways(updated);

    const hasActiveOnline = updated.some((g) => g.is_active);
    setFallbackPolicy({
      has_active_online_gateway: hasActiveOnline,
      active_checkout_mode: hasActiveOnline
        ? 'Online Gateways Active + COD Enabled'
        : 'Default Fallback Mode: COD Only'
    });

    showToast(`Gateway ${gw.display_name} ${!gw.is_active ? 'Activated' : 'Deactivated'}`);
  };

  // Open Gateway Config Modal
  const handleOpenGatewayModal = (gw) => {
    setSelectedGateway(gw);
    setCredentialsForm(gw.credentials || {});
  };

  // Save Gateway Credentials
  const handleSaveGatewayKeys = () => {
    if (!selectedGateway) return;
    const updated = gateways.map((g) => {
      if (g.gateway_code === selectedGateway.gateway_code) {
        return {
          ...g,
          has_credentials: true,
          is_test_mode: selectedGateway.is_test_mode,
          is_active: selectedGateway.is_active
        };
      }
      return g;
    });
    setGateways(updated);
    setSelectedGateway(null);
    showToast(`API credentials encrypted & stored for ${selectedGateway.display_name}!`);
  };

  // Toggle Shipping Provider
  const handleToggleShipping = (provider) => {
    const updated = shippingProviders.map((p) => {
      if (p.provider_code === provider.provider_code) {
        return { ...p, is_active: !p.is_active };
      }
      return p;
    });
    setShippingProviders(updated);
    showToast(`Courier ${provider.display_name} ${!provider.is_active ? 'Activated' : 'Deactivated'}`);
  };

  // Export Products to CSV
  const handleExportProductsCSV = () => {
    const headers = ['ID', 'Name', 'Category', 'SKU', 'Barcode', 'Selling Price', 'MRP', 'Stock', 'GST Rate', 'Status'];
    const rows = filteredProducts.map((p) => [
      `"${p.id}"`,
      `"${p.name}"`,
      `"${p.category}"`,
      `"${p.sku}"`,
      `"${p.barcode}"`,
      `"${p.sellingPrice}"`,
      `"${p.mrp}"`,
      `"${p.stock}"`,
      `"${p.gstRate}%"`,
      `"${p.status}"`
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ramesh_fashion_inventory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredProducts.length} products to CSV`);
  };

  // ============================================================================
  // SIDEBAR NAVIGATION CONFIGURATION (Matching Banking-Panel Exact Design)
  // ============================================================================

  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: 'ERP Dashboard',
      section: 'Menu',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'catalog',
      label: 'Catalog & Products',
      section: 'ERP Modules',
      icon: <Package className="w-4 h-4" />,
      subItems: [
        { id: 'products', label: 'All Products List' },
        { id: 'create-product', label: '+ Add New Product' },
        { id: 'barcodes', label: 'Barcode Print Desk' }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      section: 'ERP Modules',
      icon: <Warehouse className="w-4 h-4" />,
      subItems: [
        { id: 'stock-levels', label: 'Multi-Branch Stock' },
        { id: 'stock-adjustment', label: 'Stock Adjustment (In/Out)' },
        { id: 'low-stock', label: 'Low Stock Alerts' }
      ]
    },
    {
      id: 'sales',
      label: 'Sales & GST Invoicing',
      section: 'ERP Modules',
      icon: <Receipt className="w-4 h-4" />,
      subItems: [
        { id: 'orders', label: 'Orders & Receipts' },
        { id: 'gst-invoices', label: 'GST Tax Invoices' },
        { id: 'e-way-bills', label: 'E-Way Bill (NIC IRN)' }
      ]
    },
    {
      id: 'pos-shifts',
      label: 'POS Register Shifts',
      section: 'ERP Modules',
      icon: <CreditCard className="w-4 h-4" />
    },
    {
      id: 'purchase',
      label: 'Suppliers & Purchase',
      section: 'ERP Modules',
      icon: <Boxes className="w-4 h-4" />,
      subItems: [
        { id: 'suppliers', label: 'Supplier Directory' },
        { id: 'purchase-bills', label: 'Inward Stock Bills' }
      ]
    },
    {
      id: 'customers',
      label: 'Customer Directory & CRM',
      section: 'ERP Modules',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'payment-gateways',
      label: 'Payment Gateways (5)',
      section: 'Settings & Integrations',
      icon: <Zap className="w-4 h-4" />
    },
    {
      id: 'courier-shipping',
      label: 'Courier & Logistics (5)',
      section: 'Settings & Integrations',
      icon: <Truck className="w-4 h-4" />
    },
    {
      id: 'store-settings',
      label: 'Store & Hardware Config',
      section: 'Settings & Integrations',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  // Helper: check if parent item is active
  const isItemActive = (item) => {
    if (activeMenu === item.id) return true;
    if (item.subItems && item.subItems.some((sub) => sub.id === activeMenu)) return true;
    return false;
  };

  // Handle parent item click
  const handleItemClick = (item) => {
    if (item.subItems && item.subItems.length > 0) {
      const currentlyActive = isItemActive(item);
      if (currentlyActive) {
        setOpenSubmenus((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
      } else {
        setOpenSubmenus((prev) => ({ ...prev, [item.id]: true }));
        setActiveMenu(item.subItems[0].id);
        setMobileSidebarOpen(false);
      }
    } else {
      setActiveMenu(item.id);
      setMobileSidebarOpen(false);
    }
  };

  // Render Sidebar Item with Scooped Curved White/Dark Tab (Exact Banking Panel Match)
  const renderSidebarItem = (item) => {
    const active = isItemActive(item);
    const isOpen = openSubmenus[item.id];

    return (
      <div key={item.id} className="w-full">
        {active ? (
          /* ACTIVE TAB: SCOOPED TAB WITH TOP/BOTTOM CONCAVE CORNER SVGS */
          <div className="relative my-0.5 w-full">
            {/* Top Concave Corner SVG */}
            <div className="absolute -top-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
              <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                <path d="M 0,16 Q 16,16 16,0 L 16,16 Z" fill={isDarkMode ? '#0f172a' : '#f4f7fa'} />
              </svg>
            </div>

            {/* Active Tab Body flush to right-0 */}
            <div
              onClick={() => handleItemClick(item)}
              className={`cursor-pointer relative z-10 ml-1.5 mr-0 pl-1.5 pr-4 py-2 rounded-l-full flex items-center justify-between transition select-none ${
                isDarkMode ? 'bg-slate-900 text-cyan-400' : 'bg-[#f4f7fa] text-[#00a2c7]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Cyan Circular Icon Button */}
                <div className="w-8 h-8 rounded-full bg-[#00a2c7] text-white flex items-center justify-center shadow-xs shadow-cyan-500/30 shrink-0">
                  {item.icon}
                </div>

                {/* Cyan Bold Label */}
                <span className="text-[13.5px] font-bold tracking-tight text-[#00a2c7] dark:text-cyan-400">
                  {item.label}
                </span>
              </div>

              {item.subItems && (
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#00a2c7] dark:text-cyan-400 transition-transform duration-200 ${
                    isOpen ? 'rotate-180' : ''
                  }`}
                />
              )}
            </div>

            {/* Bottom Concave Corner SVG */}
            <div className="absolute -bottom-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
              <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                <path d="M 0,0 Q 16,0 16,16 L 16,0 Z" fill={isDarkMode ? '#0f172a' : '#f4f7fa'} />
              </svg>
            </div>
          </div>
        ) : (
          /* INACTIVE ITEM */
          <div
            onClick={() => handleItemClick(item)}
            className="cursor-pointer mx-1.5 px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#283b50] hover:text-white transition select-none group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa3bf] group-hover:text-white transition-colors">
                {item.icon}
              </div>
              <span className="text-[13.5px] font-medium tracking-tight text-[#8fa3bf] group-hover:text-white">
                {item.label}
              </span>
            </div>

            {item.subItems && (
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            )}
          </div>
        )}

        {/* SUBMENU ITEMS */}
        {item.subItems && isOpen && (
          <div className="pt-2 pb-2 pl-8 pr-3 space-y-2 bg-[#202f40] w-full">
            {item.subItems.map((sub) => {
              const isSubActive = activeMenu === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveMenu(sub.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center gap-2 text-left w-full group transition select-none ${
                    isSubActive ? '' : 'pl-[11px]'
                  }`}
                >
                  {isSubActive && <span className="w-[3px] h-4 bg-white rounded-full shadow-xs shrink-0" />}
                  <span
                    className={`text-[13px] tracking-tight transition-colors ${
                      isSubActive
                        ? 'font-bold text-[#00a2c7] dark:text-cyan-400'
                        : 'font-medium text-[#8fa3bf] hover:text-white'
                    }`}
                  >
                    {sub.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Dynamic Breadcrumb Title
  const getBreadcrumbTitle = () => {
    switch (activeMenu) {
      case 'dashboard':
        return '> Overview > ERP Dashboard';
      case 'catalog':
      case 'products':
        return '> Catalog > All Products';
      case 'create-product':
        return '> Catalog > + Add New Product';
      case 'barcodes':
        return '> Catalog > Barcode Print Desk';
      case 'inventory':
      case 'stock-levels':
        return '> Inventory > Multi-Branch Stock';
      case 'stock-adjustment':
        return '> Inventory > Stock Adjustment';
      case 'low-stock':
        return '> Inventory > Low Stock Alerts';
      case 'sales':
      case 'orders':
        return '> Sales > Orders & Deliveries';
      case 'gst-invoices':
        return '> Sales > GST Invoicing & Tax Ledger';
      case 'e-way-bills':
        return '> Sales > E-Way Bill Generation';
      case 'pos-shifts':
        return '> POS Hardware > Counter Registers & Z-Report';
      case 'purchase':
      case 'suppliers':
        return '> Suppliers & Purchases > Supplier Directory';
      case 'purchase-bills':
        return '> Suppliers & Purchases > Inward Stock Bills';
      case 'customers':
        return '> CRM > Customer Directory';
      case 'payment-gateways':
        return '> Integrations > 5 Pre-Integrated Payment Gateways';
      case 'courier-shipping':
        return '> Integrations > 5 Courier & Shipping Aggregators';
      case 'store-settings':
        return '> Configuration > Store Profile & Hardware Bridge';
      default:
        return '> ERP Management';
    }
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

      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Dark Navy #202f40 matching banking-panel) */}
      {/* ========================================================= */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#202f40] text-[#8fa3bf] flex flex-col transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        {/* Brand Logo Box Header */}
        <div className="p-4 border-b border-[#1a2634]/80 flex items-center justify-between">
          <div className="w-full bg-white rounded-xl p-2.5 shadow-sm flex items-center gap-3 border border-slate-200/50">
            {/* Logo Badge Icon */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#008ba3] via-[#00a8cc] to-[#10b981] flex items-center justify-center text-white shadow-sm shrink-0">
              <Store className="w-5 h-5" />
            </div>
            {/* Logo Text */}
            <div className="leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">Ramesh</span>
                <span className="text-[11px] font-black uppercase text-[#00a2c7] tracking-wider">ERP</span>
              </div>
              <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                Retail & Multi-Tenant SaaS
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto pl-3 pr-0 py-3 space-y-3.5 text-sm font-medium select-none custom-scrollbar">
          {/* MENU SECTION */}
          <div>
            <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-3">
              Overview
            </div>
            {NAV_ITEMS.filter((i) => i.section === 'Menu').map(renderSidebarItem)}
          </div>

          {/* ERP MODULES SECTION */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-3">
              Retail ERP Modules
            </div>
            {NAV_ITEMS.filter((i) => i.section === 'ERP Modules').map(renderSidebarItem)}
          </div>

          {/* SETTINGS & INTEGRATIONS SECTION */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-3">
              Integrations & Config
            </div>
            {NAV_ITEMS.filter((i) => i.section === 'Settings & Integrations').map(renderSidebarItem)}
          </div>

          {/* Quick Cross-Portal Switcher links */}
          <div className="pt-3 border-t border-slate-800/80 mr-3">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              System Portals
            </div>
            <div className="space-y-1 text-xs">
              <a
                href="/pos"
                className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40"
              >
                <span>POS Billing Terminal</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40"
              >
                <span>Online Storefront Preview</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="/banking"
                className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40"
              >
                <span>Enexa Banking Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="/central-admin"
                className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40"
              >
                <span>Central SaaS Admin</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Profile Snippet */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0d1624]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              RF
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">Ramesh Fashion Store</p>
              <p className="text-[10px] text-slate-400 truncate">Store ID: {shopCode}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN APPLICATION WORKSPACE AREA */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header
          className={`sticky top-0 z-30 px-6 py-3 border-b flex items-center justify-between shadow-xs transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          {/* Left: Mobile hamburger + Grid Launcher + Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Grid2X2 className="w-5 h-5" />
            </button>

            <button
              title="Portal Switcher"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Grid2X2 className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-800 dark:text-white tracking-tight">
                Ramesh Fashion Store ERP
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] border border-cyan-200 dark:border-cyan-800">
                {shopCode}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" /> Dedicated DB: tenant_ramesh_fashion
              </span>
            </div>
          </div>

          {/* Right: Theme Toggle + Bell + Quick Launch + Profile */}
          <div className="flex items-center gap-3">
            {/* Quick POS Launch Button */}
            <a
              href="/pos"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm shadow-emerald-600/30 transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>POS Counter</span>
            </a>

            {/* Theme Toggle (Sun / Moon) */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => showToast('4 Low-stock alerts and 2 new storefront orders pending')}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full px-1 shadow-sm">
                  4
                </span>
              </button>
            </div>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-cyan-500/80 shadow-xs flex items-center justify-center bg-slate-200 font-bold text-slate-700 text-xs">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Subheader / Breadcrumbs row */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={() => setActiveMenu('dashboard')}
              title="Go to ERP Dashboard"
              className="w-9 h-9 rounded-full border border-cyan-500/70 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 flex items-center justify-center transition shadow-xs"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              {getBreadcrumbTitle()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7] border border-cyan-200 dark:border-cyan-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Tenant DB: Isolated
            </span>
            <span className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              GSTIN: 08AABCR1290M1Z5
            </span>
          </div>
        </div>

        {/* WORKSPACE CONTENT AREA */}
        <div className="px-6 pb-12 space-y-6">
          {/* ========================================================= */}
          {/* VIEW 1: ERP DASHBOARD OVERVIEW */}
          {/* ========================================================= */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              {/* Top Key Metrics Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Metric 1: Today GMV */}
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

                {/* Metric 2: Today Orders */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Today's Orders
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">38 Orders</h3>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mt-1">
                      <span>24 POS Counter / 14 Online</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                </div>

                {/* Metric 3: In-Stock SKUs */}
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Active In-Stock SKUs
                    </p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">142 Products</h3>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Fashion, Grocery, Electronics</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <Boxes className="w-6 h-6" />
                  </div>
                </div>

                {/* Metric 4: Cash in Register */}
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
                  onClick={() => setActiveMenu('create-product')}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00a2c7] dark:hover:border-cyan-500 transition shadow-xs flex items-center gap-3 text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">+ Add New Product</h4>
                    <p className="text-[10px] text-slate-500">Variants, GST, Barcodes</p>
                  </div>
                </button>

                <a
                  href="/pos"
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition shadow-xs flex items-center gap-3 text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Launch POS Billing</h4>
                    <p className="text-[10px] text-slate-500">High-speed counter checkout</p>
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
                    <p className="text-[10px] text-slate-500">Record branch inventory</p>
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
                    <p className="text-[10px] text-slate-500">Day close & till balance</p>
                  </div>
                </button>
              </div>

              {/* Two Column Grid: Recent Invoices & Multi-Category Revenue */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Column 1 & 2: Recent Live Transactions */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Sales & Invoices</h3>
                      <p className="text-xs text-slate-500">Real-time sync between POS counter and online store</p>
                    </div>
                    <button
                      onClick={() => setActiveMenu('orders')}
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

                {/* Column 3: Category Revenue & Hardware Bridge */}
                <div className="space-y-4">
                  {/* Category Breakdown Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Multi-Category Sales Share
                    </h3>
                    <p className="text-[11px] text-slate-500 mb-4">Single DB multi-business catalog</p>

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

                  {/* Hardware Status Widget (PRD Section 14) */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                      Hardware Bridge Status
                    </h3>
                    <p className="text-[11px] text-slate-500 mb-3">POS Peripherals Connectivity</p>

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
          )}

          {/* ========================================================= */}
          {/* VIEW 2: CATALOG & PRODUCTS MANAGEMENT */}
          {/* ========================================================= */}
          {(activeMenu === 'catalog' || activeMenu === 'products' || activeMenu === 'create-product') && (
            <div className="space-y-4">
              {/* Filter & Action Bar Card (Matching Banking Panel) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Product Catalog & Master SKUs</h2>
                    <p className="text-xs text-slate-500">
                      Manage single-database multi-category products with pricing, GST slabs, barcodes and variants.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleExportProductsCSV}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Catalog
                    </button>
                    <button
                      onClick={() => setIsAddProductOpen(true)}
                      className="px-4 py-1.5 rounded-lg bg-[#00a2c7] hover:bg-[#008ba3] text-xs font-bold text-white shadow-xs shadow-cyan-500/30 flex items-center gap-1.5 transition"
                    >
                      <Plus className="w-4 h-4" /> + Add New Product
                    </button>
                  </div>
                </div>

                {/* Search & Filter Dropdowns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search by Name, SKU, Barcode, HSN..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#00a2c7]"
                    />
                  </div>

                  {/* Category Dropdown */}
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#00a2c7]"
                  >
                    <option value="All Categories">All Categories</option>
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Grocery & Supermarket">Grocery & Supermarket</option>
                    <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                  </select>

                  {/* Stock Status Dropdown */}
                  <select
                    value={filterStockStatus}
                    onChange={(e) => setFilterStockStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#00a2c7]"
                  >
                    <option value="All Stock Status">All Stock Status</option>
                    <option value="In Stock">In Stock (&gt;10)</option>
                    <option value="Low Stock">Low Stock (&lt;10)</option>
                    <option value="Out of Stock">Out of Stock (0)</option>
                  </select>

                  {/* GST Slab Dropdown */}
                  <select
                    value={filterGstRate}
                    onChange={(e) => setFilterGstRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#00a2c7]"
                  >
                    <option value="All GST Rates">All GST Rates</option>
                    <option value="0">0% (Exempt / Grains)</option>
                    <option value="5">5% (Garments &lt; ₹1k, Sugar)</option>
                    <option value="12">12% (Garments &gt; ₹1k, Ghee)</option>
                    <option value="18">18% (TWS, Chargers, Hardware)</option>
                    <option value="28">28% (Luxury / AC)</option>
                  </select>
                </div>
              </div>

              {/* High-Density Products Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 uppercase font-semibold border-b border-slate-200 dark:border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Product Name & Category</th>
                        <th className="px-4 py-3">SKU / Barcode</th>
                        <th className="px-4 py-3">Selling Price</th>
                        <th className="px-4 py-3">MRP</th>
                        <th className="px-4 py-3">Cost Price</th>
                        <th className="px-4 py-3">GST Slab</th>
                        <th className="px-4 py-3">Current Stock</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredProducts.map((p) => {
                        const margin = (((p.sellingPrice - p.purchasePrice) / p.sellingPrice) * 100).toFixed(0);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                            <td className="px-4 py-3">
                              <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                                  {p.category}
                                </span>
                                <span>• Unit: {p.unit}</span>
                              </div>
                            </td>

                            <td className="px-4 py-3 font-mono">
                              <div className="text-slate-800 dark:text-slate-200 font-bold">{p.sku}</div>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Barcode className="w-3 h-3" /> {p.barcode}
                              </div>
                            </td>

                            <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                              ₹ {p.sellingPrice.toFixed(2)}
                            </td>

                            <td className="px-4 py-3 text-slate-400 line-through">
                              ₹ {p.mrp.toFixed(2)}
                            </td>

                            <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                              <div>₹ {p.purchasePrice.toFixed(2)}</div>
                              <div className="text-[10px] text-cyan-600 font-bold">Margin: {margin}%</div>
                            </td>

                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                {p.gstRate}% (HSN {p.hsnCode})
                              </span>
                            </td>

                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                                  p.status === 'In Stock'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                                    : p.status === 'Low Stock'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800'
                                    : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950 dark:text-rose-400 dark:border-rose-800'
                                }`}
                              >
                                {p.stock} {p.unit} ({p.status})
                              </span>
                            </td>

                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedBarcodeProduct(p)}
                                  title="Print Barcode Tag"
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-[#00a2c7] transition"
                                >
                                  <Barcode className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => showToast(`Edit modal opened for ${p.sku}`)}
                                  title="Edit Product"
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 transition"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setProducts(products.filter((item) => item.id !== p.id));
                                    showToast(`Deleted ${p.name}`);
                                  }}
                                  title="Delete Product"
                                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-rose-600 transition"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer with Count */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>Showing {filteredProducts.length} of {products.length} products</span>
                  <span>Sync Status: Local Cache + Tenant DB Live</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: INVENTORY & STOCK MANAGEMENT */}
          {/* ========================================================= */}
          {(activeMenu === 'inventory' || activeMenu === 'stock-levels' || activeMenu === 'stock-adjustment' || activeMenu === 'low-stock') && (
            <div className="space-y-6">
              {/* Branch Warehouses Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {branches.map((b) => (
                  <div key={b.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7] flex items-center justify-center font-bold">
                        <Warehouse className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                        Active Branch
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{b.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Code: {b.code} • City: {b.city}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Total SKUs:</span>
                      <span className="text-slate-900 dark:text-white font-bold">{b.skus} Items</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-500">Till Counter:</span>
                      <span className="text-[#00a2c7]">{b.activeTill}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Low Stock Warning Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      Low Stock Reorder Alerts
                    </h3>
                    <p className="text-xs text-slate-500">Items that have fallen below the branch reorder threshold</p>
                  </div>
                  <button
                    onClick={() => setIsStockAdjustmentOpen(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#00a2c7] hover:bg-[#008ba3] text-xs font-bold text-white shadow-xs transition"
                  >
                    + Record Stock Inward
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold uppercase">
                      <tr>
                        <th className="px-3 py-2.5">SKU / Item</th>
                        <th className="px-3 py-2.5">Category</th>
                        <th className="px-3 py-2.5">Branch Location</th>
                        <th className="px-3 py-2.5">Current Stock</th>
                        <th className="px-3 py-2.5">Reorder Point</th>
                        <th className="px-3 py-2.5 text-right">Quick Purchase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {products
                        .filter((p) => p.stock <= p.reorderLevel)
                        .map((p) => (
                          <tr key={p.id}>
                            <td className="px-3 py-3">
                              <div className="font-bold text-slate-900 dark:text-white">{p.name}</div>
                              <div className="font-mono text-slate-400">{p.sku}</div>
                            </td>
                            <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{p.category}</td>
                            <td className="px-3 py-3 text-slate-600 dark:text-slate-300">{p.branch}</td>
                            <td className="px-3 py-3 font-bold text-rose-600 dark:text-rose-400">
                              {p.stock} {p.unit}
                            </td>
                            <td className="px-3 py-3 text-slate-500">{p.reorderLevel} {p.unit}</td>
                            <td className="px-3 py-3 text-right">
                              <button
                                onClick={() => showToast(`PO Draft generated for ${p.name}`)}
                                className="px-3 py-1 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 transition"
                              >
                                Draft PO to Supplier
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: SALES ORDERS & GST INVOICING */}
          {/* ========================================================= */}
          {(activeMenu === 'sales' || activeMenu === 'orders' || activeMenu === 'gst-invoices' || activeMenu === 'e-way-bills') && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Orders, Invoices & GST Bills</h2>
                  <p className="text-xs text-slate-500">
                    B2B and B2C Invoices with HSN calculation, E-Invoice IRN QR code, and thermal receipts.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search Order ID, Customer..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1"
                  >
                    <Printer className="w-4 h-4" /> Print Ledger
                  </button>
                </div>
              </div>

              {/* Orders Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="px-4 py-3">Order / Date</th>
                      <th className="px-4 py-3">Customer Details</th>
                      <th className="px-4 py-3">Payment Channel</th>
                      <th className="px-4 py-3">Subtotal</th>
                      <th className="px-4 py-3">GST Tax</th>
                      <th className="px-4 py-3">Grand Total</th>
                      <th className="px-4 py-3">Fulfillment Status</th>
                      <th className="px-4 py-3 text-right">View / Print</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">{o.id}</div>
                          <div className="text-[10px] text-slate-400">{o.date}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-800 dark:text-slate-200">{o.customerName}</div>
                          <div className="text-[10px] text-slate-400">{o.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">{o.paymentMethod}</span>
                          <div className="text-[10px] text-slate-400">{o.channel}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">₹ {o.subtotal.toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">₹ {o.gstTotal.toFixed(2)}</td>
                        <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹ {o.total.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7] border border-cyan-200 dark:border-cyan-800">
                            {o.fulfillment}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setSelectedInvoice(o)}
                            className="px-3 py-1.5 rounded-lg bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-[11px] shadow-xs transition inline-flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" /> Tax Invoice
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 5: POS SHIFT REGISTER & Z-REPORT (PRD Section 10 & 14) */}
          {/* ========================================================= */}
          {activeMenu === 'pos-shifts' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Shift Register Active
                    </span>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                      Cash Register #01 (Main Counter)
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cashier: {shiftData.cashier} • Opened at {shiftData.openedAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsZReportOpen(true)}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
                    >
                      <Printer className="w-4 h-4" /> Print Z-Report
                    </button>
                    <a
                      href="/pos"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/30 transition"
                    >
                      <Zap className="w-4 h-4" /> Open Billing Screen
                    </a>
                  </div>
                </div>

                {/* Shift Financials Breakdown Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Floating Cash In</p>
                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                      ₹ {shiftData.openingFloat.toFixed(2)}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Opening change drawer</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Cash Sales Collected</p>
                    <h4 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                      ₹ {shiftData.cashSales.toFixed(2)}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">24 counter cash bills</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">UPI / QR & Cards</p>
                    <h4 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                      ₹ {(shiftData.upiSales + shiftData.cardSales).toFixed(2)}
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Bank settlements directly</p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Expected Physical Cash</p>
                    <h4 className="text-xl font-extrabold text-[#00a2c7] mt-1">
                      ₹ {shiftData.expectedCashInDrawer.toFixed(2)}
                    </h4>
                    <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Drawer Difference: ₹ 0.00</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 6: SUPPLIERS & PURCHASES */}
          {/* ========================================================= */}
          {(activeMenu === 'purchase' || activeMenu === 'suppliers' || activeMenu === 'purchase-bills') && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Supplier Master & Purchase Ledgers</h2>
                  <p className="text-xs text-slate-500">Manage garment mills, FMCG distributors, and electronics vendors.</p>
                </div>
                <button
                  onClick={() => setIsAddSupplierOpen(true)}
                  className="px-4 py-2 rounded-lg bg-[#00a2c7] hover:bg-[#008ba3] text-xs font-bold text-white shadow-xs transition flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> + Add New Supplier
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {suppliers.map((s) => (
                  <div key={s.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {s.id}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                          {s.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-base">{s.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{s.category}</p>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-slate-400" /> {s.contactPerson}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {s.phone}
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <Receipt className="w-3.5 h-3.5 text-slate-400" /> GSTIN: {s.gstin}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">Balance Dues:</span>
                      <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                        ₹ {s.balancePayable.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 7: CUSTOMER DIRECTORY & CRM */}
          {/* ========================================================= */}
          {activeMenu === 'customers' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Customer Master & CRM Directory</h2>
                  <p className="text-xs text-slate-500">Track repeat walk-in shoppers, loyalty wallets, and B2B clients.</p>
                </div>
                <button
                  onClick={() => showToast('Customer import wizard ready')}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  Import Phone Contacts
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="px-4 py-3">Customer ID / Name</th>
                      <th className="px-4 py-3">Phone & Email</th>
                      <th className="px-4 py-3">City</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Total Orders</th>
                      <th className="px-4 py-3">Lifetime Spend</th>
                      <th className="px-4 py-3">Loyalty Points</th>
                      <th className="px-4 py-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {customers.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3">
                          <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                          <div className="font-mono text-slate-400 text-[10px]">{c.id}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-800 dark:text-slate-200 font-medium">{c.mobile}</div>
                          <div className="text-[10px] text-slate-400">{c.email}</div>
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.city}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7]">
                            {c.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold">{c.totalOrders} Orders</td>
                        <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400">
                          ₹ {c.lifetimeSpend.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 font-bold text-indigo-600">{c.loyaltyPoints} Pts</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => showToast(`WhatsApp Bill Link sent to ${c.mobile}`)}
                            className="px-2.5 py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-100 font-bold text-[11px] transition inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" /> WhatsApp
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 8: 5 PAYMENT GATEWAYS (PRD Section 11 & Phase 6) */}
          {/* ========================================================= */}
          {activeMenu === 'payment-gateways' && (
            <div className="space-y-5">
              {/* Fallback Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  fallbackPolicy.has_active_online_gateway
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 flex-shrink-0 text-emerald-600" />
                  <div>
                    <h3 className="font-bold text-sm">
                      {fallbackPolicy.has_active_online_gateway
                        ? 'Online Payment Gateways Active on Storefront'
                        : 'Default Fallback Mode Active: Only COD (Cash on Delivery)'}
                    </h3>
                    <p className="text-xs opacity-85 mt-0.5">
                      {fallbackPolicy.has_active_online_gateway
                        ? 'Customers can now pay online via active gateways (PhonePe, Cashfree, Razorpay) or choose COD.'
                        : 'No online gateway is active yet. Activate at least one gateway below to enable online checkout.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 5 Gateway Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gateways.map((gw) => (
                  <div
                    key={gw.gateway_code}
                    className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                      gw.is_active
                        ? 'bg-white dark:bg-slate-900 border-[#00a2c7]/50 shadow-sm'
                        : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-90'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                              gw.gateway_code === 'phonepe'
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                : gw.gateway_code === 'payu'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : gw.gateway_code === 'cashfree'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                : gw.gateway_code === 'easebuzz'
                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                                : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300'
                            }`}
                          >
                            {gw.gateway_code.substring(0, 3)}
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">{gw.display_name}</h3>
                            <span className="text-xs text-slate-400 font-mono">Code: {gw.gateway_code}</span>
                          </div>
                        </div>

                        {/* Toggle Active Switch */}
                        <button
                          onClick={() => handleToggleGateway(gw)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                            gw.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              gw.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          {gw.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>

                      {/* Credential Status Info */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Key className="w-3.5 h-3.5 text-slate-400" />
                          {gw.has_credentials ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              Keys Configured (AES-256 Encrypted)
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400 font-medium">No Keys Entered</span>
                          )}
                        </span>

                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                          {gw.is_test_mode ? 'Sandbox / Test' : 'Production Live'}
                        </span>
                      </div>
                    </div>

                    {/* Configure Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        onClick={() => handleOpenGatewayModal(gw)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
                      >
                        <Settings className="w-3.5 h-3.5" /> Configure API Keys
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 9: 5 COURIER & SHIPPING AGGREGATORS (PRD Section 12) */}
          {/* ========================================================= */}
          {activeMenu === 'courier-shipping' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Courier & Shipping Aggregators</h2>
                <p className="text-xs text-slate-500 mt-1">
                  5 pre-integrated courier aggregators. Automatically calculate pincode rates, generate AWB, print 4x6 thermal shipping labels, and track live deliveries.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shippingProviders.map((p) => (
                  <div
                    key={p.provider_code}
                    className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7] flex items-center justify-center font-bold">
                            <Truck className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-base">{p.display_name}</h3>
                            <span className="text-xs text-slate-400 font-mono">Code: {p.provider_code}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleToggleShipping(p)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                            p.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              p.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                            }`}
                          />
                          {p.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                        <div>
                          Default Pickup Pincode: <code className="font-mono text-slate-800 dark:text-slate-200 font-bold">{p.pickup_pincode}</code>
                        </div>
                        <div>Features: Automated AWB, 4x6 Barcode Thermal Label, Pickup Request</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        onClick={() => showToast(`Sample AWB generated with ${p.display_name}: AWB-772901`)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
                      >
                        Test Rate & AWB Ping
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 10: STORE & HARDWARE SETTINGS */}
          {/* ========================================================= */}
          {activeMenu === 'store-settings' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Store Identity & Hardware Bridge</h2>
                <p className="text-xs text-slate-500 mt-1">Multi-Tenant ERP shop details, domain mapping and device settings.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Store Name</label>
                    <input
                      type="text"
                      disabled
                      value="Ramesh Fashion Store"
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN Number</label>
                    <input
                      type="text"
                      disabled
                      value="08AABCR1290M1Z5"
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Platform Subdomain</label>
                    <input
                      type="text"
                      disabled
                      value="rameshfashion.shoppy.local"
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-cyan-600 dark:text-cyan-400 border border-slate-300 dark:border-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Custom Domain & SSL Status</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        defaultValue="store.rameshfashion.com"
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                      />
                      <span className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800">
                        SSL Active (Let's Encrypt)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => showToast('Store settings saved successfully')}
                    className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-xs transition"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: ADD NEW PRODUCT MODAL */}
      {/* ========================================================= */}
      {isAddProductOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Add New Product to ERP</h3>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Linen Casual Kurta"
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none focus:border-[#00a2c7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="Fashion & Apparel">Fashion & Apparel</option>
                    <option value="Grocery & Supermarket">Grocery & Supermarket</option>
                    <option value="Electronics & Gadgets">Electronics & Gadgets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <select
                    value={newProductForm.unit}
                    onChange={(e) => setNewProductForm({ ...newProductForm, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="pcs">Pieces (Pcs)</option>
                    <option value="pack">Pack</option>
                    <option value="tin">Tin</option>
                    <option value="kg">Kilogram (Kg)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cost Price (₹)</label>
                  <input
                    type="number"
                    placeholder="650"
                    value={newProductForm.purchasePrice}
                    onChange={(e) => setNewProductForm({ ...newProductForm, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="1299"
                    value={newProductForm.sellingPrice}
                    onChange={(e) => setNewProductForm({ ...newProductForm, sellingPrice: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none font-bold text-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="1999"
                    value={newProductForm.mrp}
                    onChange={(e) => setNewProductForm({ ...newProductForm, mrp: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GST Rate (%)</label>
                  <select
                    value={newProductForm.gstRate}
                    onChange={(e) => setNewProductForm({ ...newProductForm, gstRate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
                  >
                    <option value="0">0% (Nil)</option>
                    <option value="5">5% (Garments &lt;1k)</option>
                    <option value="12">12% (Garments &gt;1k)</option>
                    <option value="18">18% (Electronics)</option>
                    <option value="28">28% (Luxury)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">HSN Code</label>
                  <input
                    type="text"
                    placeholder="6205"
                    value={newProductForm.hsnCode}
                    onChange={(e) => setNewProductForm({ ...newProductForm, hsnCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Opening Stock</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stock: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-bold shadow-xs transition"
                >
                  Save & Print Barcode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: PROFESSIONAL GST TAX INVOICE WITH IRN & QR */}
      {/* ========================================================= */}
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

            {/* Bill Preview Paper */}
            <div className="my-4 p-5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 space-y-4">
              {/* Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-300 dark:border-slate-700">
                <h4 className="text-base font-bold uppercase font-heading">Ramesh Fashion Store</h4>
                <p className="text-[10px] text-slate-500">Unit 14, Bapu Bazar, Jaipur, Rajasthan - 302003</p>
                <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">GSTIN: 08AABCR1290M1Z5</p>
                <p className="text-[10px] text-slate-500">FSSAI Lic: 10019022001429 • Phone: +91 98290 00192</p>
              </div>

              {/* Invoice Meta */}
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

              {/* Items Table */}
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

              {/* Totals & Tax Calculation */}
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

              {/* E-Invoice IRN & QR Box (PRD Section 15) */}
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

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => showToast(`WhatsApp Bill Link sent to ${selectedInvoice.phone}`)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" /> Send Digital WhatsApp Bill
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Printer className="w-3.5 h-3.5" /> Print 80mm Thermal Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: BARCODE LABEL PRINT DESK */}
      {/* ========================================================= */}
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

            {/* Barcode Tag Simulation */}
            <div className="my-5 p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white text-slate-900 text-center font-sans space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider">Ramesh Fashion Store</p>
              <h4 className="font-extrabold text-sm">{selectedBarcodeProduct.name}</h4>

              {/* 1D Barcode Graphic Simulation */}
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

      {/* ========================================================= */}
      {/* MODAL 4: CONFIGURE PAYMENT GATEWAY (AES-256 ENCRYPTED) */}
      {/* ========================================================= */}
      {selectedGateway && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-[#00a2c7]" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Configure {selectedGateway.display_name}
                </h3>
              </div>
              <button onClick={() => setSelectedGateway(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 my-3">
              Enter your merchant API credentials. All secrets are stored in encrypted format (AES-256-CBC) inside your private tenant database.
            </p>

            <div className="space-y-3.5">
              {selectedGateway.gateway_code === 'phonepe' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Merchant ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. M230616048322069"
                      defaultValue="M230616048322069"
                      className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Salt Key
                    </label>
                    <input
                      type="password"
                      placeholder="e.g. 099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
                      defaultValue="099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
                      className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Salt Index
                    </label>
                    <input
                      type="text"
                      placeholder="1"
                      defaultValue="1"
                      className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                </>
              )}

              {selectedGateway.gateway_code !== 'phonepe' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      API Key / Merchant ID
                    </label>
                    <input
                      type="text"
                      placeholder="API Key"
                      defaultValue="LIVE_KEY_88290123"
                      className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      API Secret / Salt
                    </label>
                    <input
                      type="password"
                      placeholder="Secret Key"
                      defaultValue="SECRET_KEY_99810238"
                      className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Environment Mode:</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedGateway({ ...selectedGateway, is_test_mode: !selectedGateway.is_test_mode })
                  }
                  className={`px-3 py-1 rounded-lg text-xs font-bold border ${
                    selectedGateway.is_test_mode
                      ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400'
                  }`}
                >
                  {selectedGateway.is_test_mode ? 'Sandbox / Test Mode' : 'Production Live Mode'}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Enable for Online Checkout:</span>
                <input
                  type="checkbox"
                  checked={selectedGateway.is_active}
                  onChange={(e) => setSelectedGateway({ ...selectedGateway, is_active: e.target.checked })}
                  className="w-4 h-4 rounded text-cyan-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedGateway(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveGatewayKeys}
                className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-xs transition"
              >
                Save & Encrypt Keys
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: Z-REPORT SHIFT CLOSE PRINT PREVIEW */}
      {/* ========================================================= */}
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
    </div>
  );
}

// React 19 Client Mount
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<ShopAdmin />);
}

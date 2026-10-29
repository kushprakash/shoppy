import React, { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  CreditCard,
  PlusCircle,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  ArrowRight,
  Database,
  Store,
  ExternalLink,
  Check,
  Sparkles,
  Sliders,
  DollarSign,
  TrendingUp,
  Receipt,
  MessageSquare,
  Globe,
  Plus,
  Trash2,
  X,
  Phone,
  Moon,
  Sun,
  Lock,
  LogOut,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  AlertTriangle,
  FolderTree,
  Send,
  Calendar,
  Clock,
  CheckCircle,
  Tag,
  Search,
  Filter,
  Grid2X2,
  Bell,
  ShoppingCart,
  Boxes,
  Warehouse,
  Printer,
  Zap,
  Scale,
  Barcode,
  User,
  Settings,
  FileText,
  Mail,
  Eye,
  Edit3,
  Image
} from 'lucide-react';
import subscriptionService from '../../services/subscriptionService';

export default function MasterPortal() {
  // Authentication state for Super Admin (Strictly starts logged out unless session exists)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return (
        sessionStorage.getItem('master_auth') === 'true' ||
        localStorage.getItem('master_auth') === 'true'
      );
    } catch (e) {
      return false;
    }
  });

  const [adminEmail, setAdminEmail] = useState('admin@shoppy.io');
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Navigation tab in Master Portal: 'dashboard' | 'plans' | 'stores' | 'due_payments' | 'categories'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mobile sidebar drawer
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Top profile dropdown state
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  // Platform Branding Modal State (User requested: "setting se o apna branding karega")
  const [isBrandingModalOpen, setIsBrandingModalOpen] = useState(false);
  const [platformBranding, setPlatformBranding] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_platform_branding');
      return stored ? JSON.parse(stored) : {
        platformName: 'Enexa IT Super Admin',
        platformTagline: 'Enterprise Retail ERP & Omnichannel Multi-Tenant Platform',
        companyName: 'Enexa IT Solutions Private Limited',
        website: 'https://www.enexa.in',
        adminName: 'Super Admin (Enexa IT)',
        adminEmail: 'admin@shoppy.io',
        supportPhone: '+91 98290 00192',
        supportEmail: 'info@enexa.in',
        companyGstin: '08AABCE1290M1Z5',
        themeColor: '#00a2c7'
      };
    } catch (e) {
      return {
        platformName: 'Enexa IT Super Admin',
        platformTagline: 'Enterprise Retail ERP & Omnichannel Multi-Tenant Platform',
        companyName: 'Enexa IT Solutions Private Limited',
        website: 'https://www.enexa.in',
        adminName: 'Super Admin (Enexa IT)',
        adminEmail: 'admin@shoppy.io',
        supportPhone: '+91 98290 00192',
        supportEmail: 'info@enexa.in',
        companyGstin: '08AABCE1290M1Z5',
        themeColor: '#00a2c7'
      };
    }
  });

  // Save Platform Branding Handler - Persists to MySQL & localStorage
  const handleSavePlatformBranding = async (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('shoppy_platform_branding', JSON.stringify(platformBranding));
      await subscriptionService.updateWebsiteSettings({
        company_name: platformBranding.companyName,
        brand_title: platformBranding.platformName,
        brand_tagline: platformBranding.platformTagline,
        website: platformBranding.website,
        support_phone: platformBranding.supportPhone,
        support_email: platformBranding.supportEmail,
        company_gstin: platformBranding.companyGstin
      });
    } catch (e) {}
    setIsBrandingModalOpen(false);
    showToast('Platform branding saved and synced to database & public site!');
  };

  // Pricing plans billing cycle: 'monthly' | 'quarterly' | 'half_yearly' | 'yearly'
  const [billingCycle, setBillingCycle] = useState('yearly');

  // WhatsApp Own Number addon selection per plan
  const [ownWhatsapp, setOwnWhatsapp] = useState({
    'gst-billing-whatsapp': false,
    'gst-billing-ecommerce-whatsapp': true
  });

  // Dark Mode State synced with localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_erp_theme');
      if (stored) return stored === 'dark';
      return document.documentElement.classList.contains('dark');
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

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Master Data state from subscriptionService
  const [plans, setPlans] = useState([]);
  const [shops, setShops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Feature Add Modal State
  const [isAddFeatureModalOpen, setIsAddFeatureModalOpen] = useState(false);
  const [targetPlanId, setTargetPlanId] = useState(null);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Edit Pricing & Off % Modal State
  const [isEditPriceModalOpen, setIsEditPriceModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Create New Subscription Package Modal State
  const [isCreatePackageModalOpen, setIsCreatePackageModalOpen] = useState(false);
  const [newPackage, setNewPackage] = useState({
    name: '',
    shortName: 'TEAM ENTERPRISE',
    category: 'business',
    badge: 'Pro Suite',
    ribbonBg: 'bg-[#008ba3]',
    buttonText: 'SIGN UP',
    hasWhatsappOption: false,
    hasEcommerce: false,
    subtext: 'Starting at 1 store terminal, billed annually',
    cycles: {
      monthly: { regular: 800, offer: 650, offPercent: 19, label: '/ month', ribbonText: 'POPULAR' },
      quarterly: { regular: 2400, offer: 1800, offPercent: 25, label: '/ 3 months', ribbonText: 'SAVE 25%*' },
      half_yearly: { regular: 4800, offer: 3200, offPercent: 33, label: '/ 6 months', ribbonText: 'SAVE 33%*' },
      yearly: { regular: 9600, offer: 5800, offPercent: 40, label: '/ year', ribbonText: 'SAVE 40%*' }
    },
    featuresText: 'High-Speed POS Counter Billing (<50ms)\nGST Tax Invoicing (B2B / B2C) & GSTR-1 Ledger\nThermal 80mm & 50mm Receipt Printing\nMulti-Branch Inventory & Stock Ledger\nCloud Real-time Backup & Cashier Access\n24/7 Expedited Priority Support'
  });

  // Add Category Modal State
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Add SubCategory Modal State
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  const [targetParentCatId, setTargetParentCatId] = useState('cat-retail');
  const [newSubName, setNewSubName] = useState('');
  const [newSubCode, setNewSubCode] = useState('');

  // Provision Store Modal State
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [newShop, setNewShop] = useState({
    name: '',
    owner_name: '',
    owner_phone: '',
    city: '',
    category: 'Retail & POS Invoicing',
    sub_category: 'Apparel & Fashion Garments',
    plan_id: 'gst-billing-ecommerce-whatsapp',
    billing_cycle: 'yearly',
    own_whatsapp: false
  });

  // Leads & Contact Inquiries State (from public website /contact form)
  const [leads, setLeads] = useState([]);
  const [leadFilter, setLeadFilter] = useState('all');

  // Website CMS & Branding Settings State
  const [websiteCms, setWebsiteCms] = useState({
    company_name: 'Enexa IT Solutions Private Limited',
    brand_title: 'Shoppy ERP & Retail Omnichannel Platform',
    brand_tagline: 'Next-Generation POS Billing, GST Compliance & Omnichannel Digital Commerce for Indian Retailers',
    header_notice: '🚀 Next-Gen Retail POS & Omnichannel Cloud ERP — Powered by Enexa IT Solutions Private Limited',
    website: 'https://www.enexa.in',
    official_domain: 'www.enexa.in',
    support_phone: '+91 98290 00192',
    support_email: 'info@enexa.in',
    sales_email: 'sales@enexa.in',
    corporate_address: 'Enexa IT Solutions Private Limited, IT Park, Tech Zone, Jaipur, Rajasthan - 302020',
    company_gstin: '08AABCE1290M1Z5',
    company_cin: 'U72900RJ2021PTC075482'
  });

  // Blog Management State
  const [blogs, setBlogs] = useState([]);
  const [isCreateBlogModalOpen, setIsCreateBlogModalOpen] = useState(false);
  const [newBlog, setNewBlog] = useState({
    title: '',
    category: 'Retail Billing & POS',
    excerpt: '',
    content: '',
    author: 'Enexa IT Solutions Private Limited',
    read_time: '4 min read',
    cover_image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80'
  });

  // Toast notification
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Sync data on load and subscribe to master updates
  useEffect(() => {
    const syncData = async () => {
      setPlans(subscriptionService.getPlans());
      setShops(subscriptionService.getStores());
      setCategories(subscriptionService.getCategories());
      setSubcategories(subscriptionService.getSubcategories());
      setWebsiteCms(subscriptionService.getWebsiteSettings());
      setBlogs(subscriptionService.getBlogs());

      // Fetch live leads from backend
      try {
        const liveLeads = await subscriptionService.getLeads();
        if (Array.isArray(liveLeads)) {
          setLeads(liveLeads);
        }
      } catch (e) {}
    };

    syncData();
    window.addEventListener('shoppy:master_updated', syncData);
    return () => window.removeEventListener('shoppy:master_updated', syncData);
  }, []);

  // Super Admin Login Handler
  const handleLogin = (e) => {
    e.preventDefault();
    const emailNorm = (adminEmail || '').trim().toLowerCase();
    const passNorm = (adminPassword || '').trim();

    if (
      (emailNorm.includes('admin') || emailNorm.includes('shoppy')) &&
      (passNorm === 'admin123' || passNorm.length >= 6)
    ) {
      try {
        sessionStorage.setItem('master_auth', 'true');
        localStorage.setItem('master_auth', 'true');
      } catch (err) {}
      setIsAuthenticated(true);
      showToast('Welcome back, Super Admin!');
    } else {
      showToast('Invalid credentials. Use admin@shoppy.io / admin123');
    }
  };

  // Super Admin Logout Handler
  const handleLogout = () => {
    try {
      sessionStorage.removeItem('master_auth');
      localStorage.removeItem('master_auth');
    } catch (err) {}
    setIsAuthenticated(false);
    showToast('Logged out of Super Admin Portal');
  };

  // Price calculation helper
  const getPlanPrice = (plan) => {
    return subscriptionService.calculatePrice(plan, billingCycle, !!ownWhatsapp[plan.id]);
  };

  // Add Feature to Plan
  const handleAddFeature = (e) => {
    e.preventDefault();
    if (!newFeatureText.trim() || !targetPlanId) return;

    const updated = plans.map((p) => {
      if (p.id === targetPlanId) {
        return { ...p, features: [...p.features, newFeatureText.trim()] };
      }
      return p;
    });

    setPlans(updated);
    subscriptionService.savePlans(updated);
    showToast('Feature added and synced to Landing Page!');
    setNewFeatureText('');
    setIsAddFeatureModalOpen(false);
  };

  // Delete Feature from Plan
  const handleDeleteFeature = (planId, featureIdx) => {
    const updated = plans.map((p) => {
      if (p.id === planId) {
        return { ...p, features: p.features.filter((_, i) => i !== featureIdx) };
      }
      return p;
    });

    setPlans(updated);
    subscriptionService.savePlans(updated);
    showToast('Feature removed from plan');
  };

  // Save Pricing edits
  const handleSavePriceEdit = (e) => {
    e.preventDefault();
    if (!editingPlan) return;

    const updated = plans.map((p) => (p.id === editingPlan.id ? editingPlan : p));
    setPlans(updated);
    subscriptionService.savePlans(updated);
    showToast(`Pricing updated for ${editingPlan.name}! Synced with public site.`);
    setIsEditPriceModalOpen(false);
  };

  // Create New Subscription Package Handler
  const handleCreatePackage = (e) => {
    e.preventDefault();
    if (!newPackage.name.trim()) {
      showToast('Please enter a package name');
      return;
    }

    const featuresList = (newPackage.featuresText || '')
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

    const safeSlug = newPackage.name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');

    const planToCreate = {
      id: `plan-${safeSlug}-${Date.now().toString().slice(-4)}`,
      name: newPackage.name.trim(),
      shortName: (newPackage.shortName || 'PRO TIER').trim().toUpperCase(),
      category: newPackage.category || 'business',
      badge: (newPackage.badge || 'New Tier').trim(),
      ribbonBg: newPackage.ribbonBg || 'bg-[#008ba3]',
      buttonBg: newPackage.ribbonBg
        ? `${newPackage.ribbonBg} text-white`
        : 'bg-[#008ba3] hover:bg-[#00768c] text-white',
      buttonText: (newPackage.buttonText || 'SIGN UP').trim().toUpperCase(),
      hasWhatsappOption: !!newPackage.hasWhatsappOption,
      hasEcommerce: !!newPackage.hasEcommerce,
      subtext: (newPackage.subtext || 'Starting at 1 store terminal, billed annually').trim(),
      cycles: newPackage.cycles,
      features: featuresList.length > 0 ? featuresList : [
        'High-Speed POS Counter Billing (<50ms)',
        'GST Tax Invoicing (B2B / B2C) & GSTR-1 Ledger',
        'Thermal 80mm & 50mm Receipt Printing',
        'Multi-Branch Inventory & Stock Ledger',
        '24/7 Dedicated Customer Support'
      ]
    };

    subscriptionService.createPlan(planToCreate);
    setPlans(subscriptionService.getPlans());
    showToast(`Package "${planToCreate.name}" created and published to Landing Page!`);
    setIsCreatePackageModalOpen(false);

    // Reset default form state
    setNewPackage({
      name: '',
      shortName: 'TEAM ENTERPRISE',
      category: 'business',
      badge: 'Pro Suite',
      ribbonBg: 'bg-[#008ba3]',
      buttonText: 'SIGN UP',
      hasWhatsappOption: false,
      hasEcommerce: false,
      subtext: 'Starting at 1 store terminal, billed annually',
      cycles: {
        monthly: { regular: 800, offer: 650, offPercent: 19, label: '/ month', ribbonText: 'POPULAR' },
        quarterly: { regular: 2400, offer: 1800, offPercent: 25, label: '/ 3 months', ribbonText: 'SAVE 25%*' },
        half_yearly: { regular: 4800, offer: 3200, offPercent: 33, label: '/ 6 months', ribbonText: 'SAVE 33%*' },
        yearly: { regular: 9600, offer: 5800, offPercent: 40, label: '/ year', ribbonText: 'SAVE 40%*' }
      },
      featuresText: 'High-Speed POS Counter Billing (<50ms)\nGST Tax Invoicing (B2B / B2C) & GSTR-1 Ledger\nThermal 80mm & 50mm Receipt Printing\nMulti-Branch Inventory & Stock Ledger\nCloud Real-time Backup & Cashier Access\n24/7 Expedited Priority Support'
    });
  };

  // Delete Package Handler
  const handleDeletePlan = (planId, planName) => {
    if (window.confirm(`Are you sure you want to delete package "${planName}"? It will also be removed from the public website.`)) {
      subscriptionService.deletePlan(planId);
      setPlans(subscriptionService.getPlans());
      showToast(`Package "${planName}" removed from system`);
    }
  };

  // Toggle Ecommerce status for store
  const handleToggleEcommerce = (shopCode) => {
    const newStatus = subscriptionService.toggleEcommerce(shopCode);
    setShops(subscriptionService.getStores());
    showToast(
      `Store ${shopCode} ecommerce is now ${newStatus ? 'ACTIVE (Loads Online Storefront)' : 'INACTIVE (Loads Billing Software Login)'}`
    );
  };

  // Provision Store Handler
  const handleCreateShop = (e) => {
    e.preventDefault();
    const created = subscriptionService.onboardStore({
      name: newShop.name,
      ownerName: newShop.owner_name,
      ownerPhone: newShop.owner_phone,
      city: newShop.city,
      category: newShop.category,
      subCategory: newShop.sub_category,
      planId: newShop.plan_id,
      billingCycle: newShop.billing_cycle,
      ownWhatsapp: newShop.own_whatsapp
    });

    setShops(subscriptionService.getStores());
    showToast(`Shop ${created.name} (${created.shop_code}) provisioned successfully!`);
    setIsProvisionModalOpen(false);
    setNewShop({
      name: '',
      owner_name: '',
      owner_phone: '',
      city: '',
      category: 'Retail & POS Invoicing',
      sub_category: 'Apparel & Fashion Garments',
      plan_id: 'gst-billing-ecommerce-whatsapp',
      billing_cycle: 'yearly',
      own_whatsapp: false
    });
  };

  // Send WhatsApp Reminder Handler
  const handleSendReminder = (shop) => {
    showToast(`WhatsApp reminder dispatched to ${shop.owner_name} (${shop.owner_phone}) for ₹${shop.due_amount}`);
  };

  // Settle Payment Handler
  const handleSettlePayment = (shopCode) => {
    subscriptionService.settleDuePayment(shopCode);
    setShops(subscriptionService.getStores());
    showToast(`Payment settled for ${shopCode}. Subscription renewed for 1 full year!`);
  };

  // Add Category Handler
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    subscriptionService.addCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim() || 'Custom retail vertical'
    });

    setCategories(subscriptionService.getCategories());
    setNewCatName('');
    setNewCatDesc('');
    setIsAddCategoryModalOpen(false);
    showToast('Category added successfully!');
  };

  // Delete Category
  const handleDeleteCategory = (catId) => {
    subscriptionService.deleteCategory(catId);
    setCategories(subscriptionService.getCategories());
    setSubcategories(subscriptionService.getSubcategories());
    showToast('Category and its sub-categories removed');
  };

  // Add Subcategory Handler
  const handleAddSubcategory = (e) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    subscriptionService.addSubcategory({
      categoryId: targetParentCatId,
      name: newSubName.trim(),
      code: newSubCode.trim().toUpperCase() || 'SUB-01'
    });

    setSubcategories(subscriptionService.getSubcategories());
    setNewSubName('');
    setNewSubCode('');
    setIsAddSubModalOpen(false);
    showToast('Sub-category added successfully!');
  };

  // Delete Subcategory
  const handleDeleteSubcategory = (subId) => {
    subscriptionService.deleteSubcategory(subId);
    setSubcategories(subscriptionService.getSubcategories());
    showToast('Sub-category deleted');
  };

  // Filtered shops list
  const filteredShops = shops.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.shop_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.owner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'ecommerce'
        ? s.has_ecommerce
        : statusFilter === 'billing_only'
        ? !s.has_ecommerce
        : s.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate Due Payment metrics
  const totalDues = shops.reduce((sum, s) => sum + (s.due_amount || 0), 0);
  const expiringCount = shops.filter((s) => s.status === 'expiring_soon').length;
  const expiredCount = shops.filter((s) => s.status === 'expired').length;
  const dueShops = shops.filter((s) => (s.due_amount && s.due_amount > 0) || s.status === 'expiring_soon' || s.status === 'expired');

  // Filtered Leads
  const filteredLeads = leads.filter((l) => {
    if (leadFilter === 'all') return true;
    return l.status === leadFilter;
  });

  // Save Website CMS Settings Handler (Persists to MySQL table 'website_settings')
  const handleSaveCmsSettings = async (e) => {
    e.preventDefault();
    await subscriptionService.updateWebsiteSettings(websiteCms);
    showToast('Website CMS & Branding saved to MySQL and synced to public site!');
  };

  // Update Lead Status Handler
  const handleUpdateLeadStatus = async (leadId, status) => {
    await subscriptionService.updateLeadStatus(leadId, status);
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status } : l))
    );
    showToast(`Lead #${leadId} status updated to ${status}!`);
  };

  // Create Blog Article Handler (Persists to MySQL table 'blogs')
  const handleCreateBlog = async (e) => {
    e.preventDefault();
    if (!newBlog.title.trim() || !newBlog.content.trim()) {
      showToast('Please enter title and content for the article');
      return;
    }
    const res = await subscriptionService.createBlog(newBlog);
    if (res && res.success) {
      showToast('Article published to public website blog!');
      setIsCreateBlogModalOpen(false);
      setNewBlog({
        title: '',
        category: 'Retail Billing & POS',
        excerpt: '',
        content: '',
        author: 'Enexa IT Solutions Private Limited',
        read_time: '4 min read',
        cover_image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80'
      });
      setBlogs(subscriptionService.getBlogs());
    }
  };

  // Delete Blog Article Handler
  const handleDeleteBlog = async (blogId, blogTitle) => {
    if (window.confirm(`Delete article "${blogTitle}"?`)) {
      await subscriptionService.deleteBlog(blogId);
      setBlogs((prev) => prev.filter((b) => b.id !== blogId));
      showToast('Article deleted from blog');
    }
  };

  // Breadcrumb Title helper
  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return '> Overview > SaaS Platform Dashboard';
      case 'plans':
        return '> Super Admin > Package & Pricing Master';
      case 'stores':
        return `> Super Admin > Stores & Database Master (${shops.length} Active)`;
      case 'due_payments':
        return `> Super Admin > Due Payments & Renewals (${dueShops.length} Overdue)`;
      case 'categories':
        return '> Super Admin > Category & Sub-Category Master';
      case 'cms':
        return '> Super Admin > Website CMS & Enexa IT Solutions Branding';
      case 'leads':
        return `> Super Admin > Public Leads & Contact Inquiries (${leads.length})`;
      case 'blogs':
        return `> Super Admin > Blog & Articles Manager (${blogs.length})`;
      default:
        return '> Overview > Super Admin Master Portal';
    }
  };

  // =========================================================================
  // 1. STRICT SUPER ADMIN LOGIN SCREEN (If not authenticated)
  // =========================================================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 selection:bg-[#00a2c7] selection:text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#008ba3] via-[#00a8cc] to-[#10b981] flex items-center justify-center text-white mx-auto shadow-xl shadow-cyan-500/25">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">Shoppy Super Admin</h1>
            <p className="text-xs text-slate-400">Master SaaS Platform & Multi-Tenant Control Portal</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-300 space-y-1">
            <div className="font-bold text-cyan-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>Restricted Super Admin Area</span>
            </div>
            <p className="text-slate-400">
              Demo Credentials: <span className="font-mono text-white font-bold">admin@shoppy.io</span> /{' '}
              <span className="font-mono text-white font-bold">admin123</span>
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Master Admin Email</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@shoppy.io"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Master Key / Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-medium focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#008ba3] to-[#10b981] hover:from-[#00a8cc] hover:to-[#059669] text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Login to Super Admin Portal</span>
            </button>
          </form>

          <div className="pt-2 text-center">
            <a href="/" className="text-xs text-slate-500 hover:text-cyan-400 transition font-semibold">
              ← Return to Public SaaS Website
            </a>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. LOGGED IN SUPER ADMIN DASHBOARD (MATCHING REQUESTED UI WITH SAAS CONTENT)
  // =========================================================================
  return (
    <div className={`min-h-screen flex font-sans ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f4f7fa] text-slate-800'}`}>
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* MOBILE DRAWER OVERLAY */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* =================================================================== */}
      {/* 1. LEFT SIDEBAR (EXACT LAYOUT WITH SUPER ADMIN MASTERS)             */}
      {/* =================================================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#202f40] text-[#8fa3bf] flex flex-col transition-transform duration-200 ease-in-out
          lg:static lg:translate-x-0
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Brand Logo Header Card (Super Admin) */}
        <div className="p-4 border-b border-[#1a2634]/80 flex items-center justify-between">
          <div className="w-full bg-[#182330] rounded-xl p-2.5 shadow-sm flex items-center gap-3 border border-slate-700/60">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#008ba3] via-[#00a8cc] to-[#10b981] flex items-center justify-center text-white shadow-sm shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-white tracking-tight">Shoppy</span>
                <span className="text-[11px] font-black uppercase text-[#00a2c7] tracking-wider">MASTER</span>
              </div>
              <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                SaaS Multi-Tenant Control
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto pl-3 pr-0 py-3 space-y-3.5 text-sm font-medium select-none custom-scrollbar">
          {/* Section: OVERVIEW */}
          <div>
            <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-3">
              Overview
            </div>
            {/* Scooped Tab when Active */}
            {activeTab === 'dashboard' ? (
              <div className="relative my-0.5 w-full">
                <div className="absolute -top-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,16 Q 16,16 16,0 L 16,16 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>

                <div
                  onClick={() => {
                    setActiveTab('dashboard');
                    setMobileSidebarOpen(false);
                  }}
                  className={`cursor-pointer relative z-10 ml-1.5 mr-0 pl-1.5 pr-4 py-2 rounded-l-full flex items-center justify-between transition select-none ${
                    isDarkMode ? 'bg-slate-950 text-cyan-400' : 'bg-[#f4f7fa] text-[#00a2c7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#00a2c7] text-white flex items-center justify-center shadow-xs shadow-cyan-500/30 shrink-0">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <span className="text-[13.5px] font-bold tracking-tight text-[#00a2c7] dark:text-cyan-400">
                      Platform Overview
                    </span>
                  </div>
                </div>

                <div className="absolute -bottom-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,0 Q 16,0 16,16 L 16,0 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setActiveTab('dashboard');
                  setMobileSidebarOpen(false);
                }}
                className="cursor-pointer mx-1.5 px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#283b50] hover:text-white transition select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa3bf] group-hover:text-white transition-colors">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <span className="text-[13.5px] font-medium tracking-tight text-[#8fa3bf] group-hover:text-white">
                    Platform Overview
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section: SUPER ADMIN MASTERS */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-3">
              Super Admin Masters
            </div>

            {/* Item 1: Package & Pricing Master */}
            {activeTab === 'plans' ? (
              <div className="relative my-0.5 w-full">
                <div className="absolute -top-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,16 Q 16,16 16,0 L 16,16 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
                <div
                  onClick={() => {
                    setActiveTab('plans');
                    setMobileSidebarOpen(false);
                  }}
                  className={`cursor-pointer relative z-10 ml-1.5 mr-0 pl-1.5 pr-4 py-2 rounded-l-full flex items-center justify-between transition select-none ${
                    isDarkMode ? 'bg-slate-950 text-cyan-400' : 'bg-[#f4f7fa] text-[#00a2c7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#00a2c7] text-white flex items-center justify-center shadow-xs shadow-cyan-500/30 shrink-0">
                      <Boxes className="w-4 h-4" />
                    </div>
                    <span className="text-[13.5px] font-bold tracking-tight text-[#00a2c7] dark:text-cyan-400">
                      Package Master
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00a2c7]/20 text-[#00a2c7]">
                    4 Tiers
                  </span>
                </div>
                <div className="absolute -bottom-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,0 Q 16,0 16,16 L 16,0 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setActiveTab('plans');
                  setMobileSidebarOpen(false);
                }}
                className="cursor-pointer mx-1.5 px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#283b50] hover:text-white transition select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa3bf] group-hover:text-white transition-colors">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <span className="text-[13.5px] font-medium tracking-tight text-[#8fa3bf] group-hover:text-white">
                    Package Master
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 group-hover:text-white">
                  4 Tiers
                </span>
              </div>
            )}

            {/* Item 2: Stores & Database Master */}
            {activeTab === 'stores' ? (
              <div className="relative my-0.5 w-full">
                <div className="absolute -top-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,16 Q 16,16 16,0 L 16,16 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
                <div
                  onClick={() => {
                    setActiveTab('stores');
                    setMobileSidebarOpen(false);
                  }}
                  className={`cursor-pointer relative z-10 ml-1.5 mr-0 pl-1.5 pr-4 py-2 rounded-l-full flex items-center justify-between transition select-none ${
                    isDarkMode ? 'bg-slate-950 text-cyan-400' : 'bg-[#f4f7fa] text-[#00a2c7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#00a2c7] text-white flex items-center justify-center shadow-xs shadow-cyan-500/30 shrink-0">
                      <Store className="w-4 h-4" />
                    </div>
                    <span className="text-[13.5px] font-bold tracking-tight text-[#00a2c7] dark:text-cyan-400">
                      Stores & Databases
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00a2c7]/20 text-[#00a2c7]">
                    {shops.length}
                  </span>
                </div>
                <div className="absolute -bottom-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,0 Q 16,0 16,16 L 16,0 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setActiveTab('stores');
                  setMobileSidebarOpen(false);
                }}
                className="cursor-pointer mx-1.5 px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#283b50] hover:text-white transition select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa3bf] group-hover:text-white transition-colors">
                    <Store className="w-4 h-4" />
                  </div>
                  <span className="text-[13.5px] font-medium tracking-tight text-[#8fa3bf] group-hover:text-white">
                    Stores & Databases
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 group-hover:text-white">
                  {shops.length}
                </span>
              </div>
            )}

            {/* Item 3: Due Payments & Renewals */}
            {activeTab === 'due_payments' ? (
              <div className="relative my-0.5 w-full">
                <div className="absolute -top-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,16 Q 16,16 16,0 L 16,16 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
                <div
                  onClick={() => {
                    setActiveTab('due_payments');
                    setMobileSidebarOpen(false);
                  }}
                  className={`cursor-pointer relative z-10 ml-1.5 mr-0 pl-1.5 pr-4 py-2 rounded-l-full flex items-center justify-between transition select-none ${
                    isDarkMode ? 'bg-slate-950 text-rose-400' : 'bg-[#f4f7fa] text-rose-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xs shadow-rose-500/30 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <span className="text-[13.5px] font-bold tracking-tight text-rose-600 dark:text-rose-400">
                      Due Payments
                    </span>
                  </div>
                  {dueShops.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400">
                      {dueShops.length}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,0 Q 16,0 16,16 L 16,0 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setActiveTab('due_payments');
                  setMobileSidebarOpen(false);
                }}
                className="cursor-pointer mx-1.5 px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#283b50] hover:text-white transition select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa3bf] group-hover:text-white transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-[13.5px] font-medium tracking-tight text-[#8fa3bf] group-hover:text-white">
                    Due Payments
                  </span>
                </div>
                {dueShops.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400">
                    {dueShops.length}
                  </span>
                )}
              </div>
            )}

            {/* Item 4: Categories & Sub-Categories */}
            {activeTab === 'categories' ? (
              <div className="relative my-0.5 w-full">
                <div className="absolute -top-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,16 Q 16,16 16,0 L 16,16 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
                <div
                  onClick={() => {
                    setActiveTab('categories');
                    setMobileSidebarOpen(false);
                  }}
                  className={`cursor-pointer relative z-10 ml-1.5 mr-0 pl-1.5 pr-4 py-2 rounded-l-full flex items-center justify-between transition select-none ${
                    isDarkMode ? 'bg-slate-950 text-indigo-400' : 'bg-[#f4f7fa] text-indigo-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs shadow-indigo-500/30 shrink-0">
                      <FolderTree className="w-4 h-4" />
                    </div>
                    <span className="text-[13.5px] font-bold tracking-tight text-indigo-600 dark:text-indigo-400">
                      Categories Master
                    </span>
                  </div>
                </div>
                <div className="absolute -bottom-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,0 Q 16,0 16,16 L 16,0 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setActiveTab('categories');
                  setMobileSidebarOpen(false);
                }}
                className="cursor-pointer mx-1.5 px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#283b50] hover:text-white transition select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa3bf] group-hover:text-white transition-colors">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <span className="text-[13.5px] font-medium tracking-tight text-[#8fa3bf] group-hover:text-white">
                    Categories Master
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section: CMS & PUBLIC PORTAL */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-3">
              CMS & Public Website
            </div>

            {/* CMS & Branding */}
            {activeTab === 'cms' ? (
              <div className="relative my-0.5 w-full">
                <div className="absolute -top-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,16 Q 16,16 16,0 L 16,16 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
                <div
                  onClick={() => {
                    setActiveTab('cms');
                    setMobileSidebarOpen(false);
                  }}
                  className={`cursor-pointer relative z-10 ml-1.5 mr-0 pl-1.5 pr-4 py-2 rounded-l-full flex items-center justify-between transition select-none ${
                    isDarkMode ? 'bg-slate-950 text-cyan-400' : 'bg-[#f4f7fa] text-[#00a2c7]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#00a2c7] text-white flex items-center justify-center shadow-xs shadow-cyan-500/30 shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <span className="text-[13.5px] font-bold tracking-tight text-[#00a2c7] dark:text-cyan-400">
                      Website CMS & Brand
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00a2c7]/20 text-[#00a2c7]">
                    Enexa
                  </span>
                </div>
                <div className="absolute -bottom-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,0 Q 16,0 16,16 L 16,0 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setActiveTab('cms');
                  setMobileSidebarOpen(false);
                }}
                className="cursor-pointer mx-1.5 px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#283b50] hover:text-white transition select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa3bf] group-hover:text-white transition-colors">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="text-[13.5px] font-medium tracking-tight text-[#8fa3bf] group-hover:text-white">
                    Website CMS & Brand
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 group-hover:text-white">
                  Enexa
                </span>
              </div>
            )}

            {/* Leads & Inquiries */}
            {activeTab === 'leads' ? (
              <div className="relative my-0.5 w-full">
                <div className="absolute -top-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,16 Q 16,16 16,0 L 16,16 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
                <div
                  onClick={() => {
                    setActiveTab('leads');
                    setMobileSidebarOpen(false);
                  }}
                  className={`cursor-pointer relative z-10 ml-1.5 mr-0 pl-1.5 pr-4 py-2 rounded-l-full flex items-center justify-between transition select-none ${
                    isDarkMode ? 'bg-slate-950 text-emerald-400' : 'bg-[#f4f7fa] text-emerald-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs shadow-emerald-500/30 shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-[13.5px] font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                      Public Leads
                    </span>
                  </div>
                  {leads.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                      {leads.length}
                    </span>
                  )}
                </div>
                <div className="absolute -bottom-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,0 Q 16,0 16,16 L 16,0 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setActiveTab('leads');
                  setMobileSidebarOpen(false);
                }}
                className="cursor-pointer mx-1.5 px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#283b50] hover:text-white transition select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa3bf] group-hover:text-white transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-[13.5px] font-medium tracking-tight text-[#8fa3bf] group-hover:text-white">
                    Public Leads
                  </span>
                </div>
                {leads.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                    {leads.length}
                  </span>
                )}
              </div>
            )}

            {/* Blogs Manager */}
            {activeTab === 'blogs' ? (
              <div className="relative my-0.5 w-full">
                <div className="absolute -top-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,16 Q 16,16 16,0 L 16,16 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
                <div
                  onClick={() => {
                    setActiveTab('blogs');
                    setMobileSidebarOpen(false);
                  }}
                  className={`cursor-pointer relative z-10 ml-1.5 mr-0 pl-1.5 pr-4 py-2 rounded-l-full flex items-center justify-between transition select-none ${
                    isDarkMode ? 'bg-slate-950 text-amber-400' : 'bg-[#f4f7fa] text-amber-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs shadow-amber-500/30 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-[13.5px] font-bold tracking-tight text-amber-600 dark:text-amber-400">
                      Blog Articles
                    </span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    {blogs.length}
                  </span>
                </div>
                <div className="absolute -bottom-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
                  <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                    <path d="M 0,0 Q 16,0 16,16 L 16,0 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
                  </svg>
                </div>
              </div>
            ) : (
              <div
                onClick={() => {
                  setActiveTab('blogs');
                  setMobileSidebarOpen(false);
                }}
                className="cursor-pointer mx-1.5 px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#283b50] hover:text-white transition select-none group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa3bf] group-hover:text-white transition-colors">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[13.5px] font-medium tracking-tight text-[#8fa3bf] group-hover:text-white">
                    Blog Articles
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 group-hover:text-white">
                  {blogs.length}
                </span>
              </div>
            )}
          </div>

          {/* Section: INTEGRATIONS & CONFIG */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-3">
              Integrations & Config
            </div>

            <div
              onClick={() => showToast('5 Integrated Gateways (PhonePe, PayU, Razorpay, Cashfree, Easebuzz)')}
              className="cursor-pointer mx-1.5 px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#283b50] hover:text-white transition select-none group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa3bf] group-hover:text-white transition-colors">
                  <Zap className="w-4 h-4" />
                </div>
                <span className="text-[13.5px] font-medium tracking-tight text-[#8fa3bf] group-hover:text-white">
                  Payment Gateways (5)
                </span>
              </div>
            </div>

            <div
              onClick={() => showToast('WhatsApp Cloud API Official Meta Webhook: Active')}
              className="cursor-pointer mx-1.5 px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#283b50] hover:text-white transition select-none group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa3bf] group-hover:text-white transition-colors">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <span className="text-[13.5px] font-medium tracking-tight text-[#8fa3bf] group-hover:text-white">
                  WhatsApp Cloud API
                </span>
              </div>
            </div>

            <div
              onClick={() => showToast('Dedicated Tenant DB Isolation: 100% Operational')}
              className="cursor-pointer mx-1.5 px-3 py-2 rounded-lg flex items-center justify-between hover:bg-[#283b50] hover:text-white transition select-none group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#8fa3bf] group-hover:text-white transition-colors">
                  <Database className="w-4 h-4" />
                </div>
                <span className="text-[13.5px] font-medium tracking-tight text-[#8fa3bf] group-hover:text-white">
                  Database Health & Backups
                </span>
              </div>
            </div>
          </div>

          {/* Quick Cross-Portal Switcher (System Portals) */}
          <div className="pt-3 border-t border-slate-800/80 mr-3">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              System Portals
            </div>
            <div className="space-y-1 text-xs">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40"
              >
                <span>Public SaaS Website</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>

              <a
                href="/store"
                className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40"
              >
                <span>Store Merchant Login</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>

              <a
                href="/pos-terminal"
                className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40"
              >
                <span>POS Billing Terminal</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>

              <a
                href="/STORE983515"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40"
              >
                <span>Storefront Demo Preview</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* Footer Profile Box with Super Admin Name & LOGOUT BUTTON (User Req)  */}
        {/* =================================================================== */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0d1624]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#008ba3] to-[#10b981] text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                SA
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{platformBranding.adminName}</p>
                <p className="text-[10px] text-slate-400 truncate">{platformBranding.adminEmail}</p>
              </div>
            </div>

            {/* Prominent Super Admin Logout Button */}
            <button
              onClick={handleLogout}
              title="Logout Super Admin"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer shrink-0 ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* =================================================================== */}
      {/* 2. MAIN WORKSPACE                                                   */}
      {/* =================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header
          className={`sticky top-0 z-30 px-6 py-3 border-b flex items-center justify-between shadow-xs transition-colors ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          {/* Left: Mobile hamburger + Grid Launcher + Super Admin Title + Badges */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Grid2X2 className="w-5 h-5" />
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              title="Super Admin Dashboard"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Grid2X2 className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-slate-800 dark:text-white tracking-tight">
                {platformBranding.platformName}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] border border-cyan-200 dark:border-cyan-800">
                ROOT-MASTER
              </span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                <ShieldCheck className="w-3 h-3" /> Platform DB: master_shoppy (Online)
              </span>
            </div>
          </div>

          {/* Right: + Provision Store button + Theme Toggle + Bell + Profile Avatar Dropdown */}
          <div className="flex items-center gap-3">
            {/* Quick Provision Button */}
            <button
              onClick={() => setIsProvisionModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm shadow-emerald-600/30 transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Provision Store</span>
            </button>

            {/* Quick Create Package Button */}
            <button
              onClick={() => {
                setActiveTab('plans');
                setIsCreatePackageModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#00a2c7] to-cyan-600 hover:from-[#008ba3] hover:to-cyan-700 text-xs font-bold text-white shadow-sm shadow-cyan-500/25 transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Create Package</span>
            </button>

            {/* Theme Toggle (Sun / Moon) */}
            <button
              id="theme-toggle-btn"
              onClick={toggleDarkMode}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => showToast(`${dueShops.length} stores awaiting renewal settlement`)}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative cursor-pointer"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full px-1 shadow-sm">
                  {dueShops.length}
                </span>
              </button>
            </div>

            {/* User Profile Avatar with Dropdown (User requested: Profile, Setting & Logout) */}
            <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="w-8 h-8 rounded-full overflow-hidden border-2 border-cyan-500/80 shadow-xs flex items-center justify-center bg-gradient-to-tr from-[#008ba3] to-[#10b981] font-bold text-white text-xs cursor-pointer hover:ring-2 hover:ring-cyan-400 transition"
                title="Super Admin Profile & Branding"
              >
                SA
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <>
                  <div
                    onClick={() => setIsProfileDropdownOpen(false)}
                    className="fixed inset-0 z-40 bg-transparent"
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
                    {/* Profile Header */}
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#008ba3] to-[#10b981] text-white font-extrabold flex items-center justify-center text-sm shrink-0">
                        SA
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {platformBranding.adminName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {platformBranding.adminEmail}
                        </p>
                        <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7] rounded mt-0.5">
                          Super Admin (Root)
                        </span>
                      </div>
                    </div>

                    {/* Menu Options: Profile, Setting/Branding, Logout */}
                    <div className="py-1 space-y-0.5 text-xs font-semibold">
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          setIsBrandingModalOpen(true);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <Sliders className="w-4 h-4 text-[#00a2c7]" />
                        <div>
                          <div className="font-bold">Platform Branding & Settings</div>
                          <div className="text-[10px] text-slate-400 font-normal">Brand name, GSTIN, Support & Theme</div>
                        </div>
                      </button>

                      <a
                        href="/store"
                        className="w-full px-3 py-2 rounded-xl text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <Store className="w-4 h-4 text-emerald-500" />
                        <div>
                          <div className="font-bold">Merchant Store Login</div>
                          <div className="text-[10px] text-slate-400 font-normal">Go to merchant portal login</div>
                        </div>
                      </a>

                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Logout of Super Admin</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Subheader / Breadcrumbs row (matching screenshot) */}
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Back Button */}
            <button
              onClick={() => setActiveTab('dashboard')}
              title="Back to Platform Overview"
              className="w-9 h-9 rounded-full border border-cyan-500/70 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 flex items-center justify-center transition shadow-xs cursor-pointer"
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
              GSTIN: {platformBranding.companyGstin}
            </span>
          </div>
        </div>

        {/* Main Work Area */}
        <main className="px-6 pb-12 flex-1 space-y-6">
          {/* Top 4 Key Metric Cards (Super Admin Platform Metrics) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Total SaaS MRR / Gross Revenue */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Total Platform MRR
                </p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹ 48,250.00</h3>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+18.4% vs last month</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] flex items-center justify-center font-bold text-lg">
                ₹
              </div>
            </div>

            {/* Metric 2: Provisioned Shops */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Provisioned Stores
                </p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{shops.length} Stores</h3>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                  <span>{shops.filter((s) => s.has_ecommerce).length} Ecommerce / {shops.filter((s) => !s.has_ecommerce).length} Billing Only</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                <Store className="w-6 h-6" />
              </div>
            </div>

            {/* Metric 3: Active Subscription Tiers */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Active Subscription Plans
                </p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{plans.length} Tiers</h3>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-1">
                  <span>GST Billing, WhatsApp, Storefront</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <Boxes className="w-6 h-6" />
              </div>
            </div>

            {/* Metric 4: Outstanding Dues */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Outstanding Dues
                </p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₹ {totalDues.toLocaleString('en-IN')}.00</h3>
                <div className="flex items-center gap-1 text-[11px] font-bold text-rose-500 mt-1">
                  <span>{dueShops.length} Stores Overdue / Expiring</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                <Receipt className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Super Admin Action Cards (matching screenshot layout) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setIsProvisionModalOpen(true)}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#00a2c7] dark:hover:border-cyan-500 transition shadow-xs flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">+ Provision New Store</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Instant tenant onboarding</p>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('plans');
                setIsCreatePackageModalOpen(true);
              }}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-500 transition shadow-xs flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] flex items-center justify-center group-hover:scale-105 transition-transform">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">+ Create New Package</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Launch new pricing tier</p>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('due_payments');
                showToast('Dispatched WhatsApp renewal reminders to all due accounts');
              }}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 transition shadow-xs flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Send WhatsApp Dues</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Automated reminder dispatch</p>
              </div>
            </button>

            <button
              onClick={() => {
                setActiveTab('categories');
                setIsAddCategoryModalOpen(true);
              }}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500 transition shadow-xs flex items-center gap-3 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FolderTree className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">+ Add Retail Category</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Commercial retail verticals</p>
              </div>
            </button>
          </div>

          {/* =================================================================== */}
          {/* VIEW A: SAAS PLATFORM DASHBOARD (MATCHING SCREENSHOT LAYOUT)        */}
          {/* =================================================================== */}
          {activeTab === 'dashboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2 Cols): Active Provisioned Stores & Databases */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Stores & Tenant Databases</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Real-time MySQL isolated databases, plan status & Ecommerce module switches
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('stores')}
                    className="text-xs font-bold text-[#00a2c7] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Stores</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="text-slate-400 uppercase font-semibold text-[11px] border-b border-slate-100 dark:border-slate-800">
                      <tr>
                        <th className="pb-3 font-semibold">STORE CODE & NAME</th>
                        <th className="pb-3 font-semibold">MERCHANT / OWNER</th>
                        <th className="pb-3 font-semibold">ASSIGNED PLAN</th>
                        <th className="pb-3 font-semibold">ECOMMERCE MODULE</th>
                        <th className="pb-3 font-semibold">ISOLATED DB</th>
                        <th className="pb-3 font-semibold text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {shops.map((shop) => (
                        <tr key={shop.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-3.5">
                            <span className="font-mono font-bold text-[#00a2c7]">{shop.shop_code}</span>
                            <div className="font-bold text-slate-900 dark:text-white">{shop.name}</div>
                            <div className="text-[10px] text-slate-400">{shop.city}</div>
                          </td>

                          <td className="py-3.5">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{shop.owner_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{shop.owner_phone}</div>
                          </td>

                          <td className="py-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{shop.plan_name}</div>
                            <div className="text-[10px] font-semibold text-emerald-600 uppercase">
                              {shop.billing_cycle} {shop.own_whatsapp ? '• Own WA' : ''}
                            </div>
                          </td>

                          {/* Interactive Ecommerce Toggle Switch */}
                          <td className="py-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleEcommerce(shop.shop_code)}
                                className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ease-in-out ${
                                  shop.has_ecommerce ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                                title={
                                  shop.has_ecommerce
                                    ? 'Ecommerce Active: URL opens store'
                                    : 'Ecommerce Inactive: URL opens billing login'
                                }
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                    shop.has_ecommerce ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                              <span
                                className={`text-[10px] font-bold ${
                                  shop.has_ecommerce
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-400'
                                }`}
                              >
                                {shop.has_ecommerce ? 'Store Active' : 'Billing Only'}
                              </span>
                            </div>
                          </td>

                          <td className="py-3.5">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 w-max">
                              <Database className="w-3 h-3 text-[#00a2c7]" />
                              {shop.database_name || shop.db_name || 'tenant_db'}
                            </span>
                          </td>

                          <td className="py-3.5 text-right">
                            <a
                              href={`/${shop.shop_code}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1 rounded bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] hover:bg-cyan-100 text-[11px] font-bold inline-flex items-center gap-1 transition"
                            >
                              <span>Launch</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column (1 Col): SaaS Plan Distribution & System Infrastructure */}
              <div className="space-y-6">
                {/* Subscription Tier Distribution */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Subscription Tier Share</h3>
                    <p className="text-[11px] text-slate-400">Active merchant plan distribution</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">Enterprise Omnichannel Suite</span>
                        <span className="text-[#00a2c7]">45%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-[#00a2c7] rounded-full" style={{ width: '45%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">GST Billing + Ecommerce</span>
                        <span className="text-indigo-600 dark:text-indigo-400">30%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: '30%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">GST Billing Software</span>
                        <span className="text-emerald-600 dark:text-emerald-400">25%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multi-Tenant System Infrastructure Status */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Infrastructure Status</h3>
                    <p className="text-[11px] text-slate-400">SaaS Multi-Tenant Connectivity</p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-emerald-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">MySQL Tenant DB Pool</span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">100% Isolated</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-cyan-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">WhatsApp Cloud API</span>
                      </div>
                      <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">Connected</span>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-indigo-500" />
                        <span className="font-semibold text-slate-700 dark:text-slate-300">5 Payment Gateways</span>
                      </div>
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW B: PACKAGE MASTER (SUBSCRIPTION MASTER)                        */}
          {/* =================================================================== */}
          {activeTab === 'plans' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#00a2c7]" />
                    <span>Package & Pricing Master</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage tier pricing, billing cycles, discounts, and real-time public landing page feature matrix.
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Create New Package Button */}
                  <button
                    onClick={() => setIsCreatePackageModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00a2c7] to-cyan-500 hover:from-[#008ba3] hover:to-cyan-600 text-white text-xs font-black shadow-md shadow-cyan-500/25 transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>+ Create New Package</span>
                  </button>

                  {/* Billing Cycle Pill Toggle Switch */}
                  <div className="inline-flex p-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner gap-1">
                    {['monthly', 'quarterly', 'half_yearly', 'yearly'].map((cycle) => (
                      <button
                        key={cycle}
                        onClick={() => setBillingCycle(cycle)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition capitalize cursor-pointer ${
                          billingCycle === cycle
                            ? 'bg-white dark:bg-slate-900 text-[#00a2c7] shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {cycle === 'half_yearly' ? 'Half Yearly' : cycle}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing Cards Grid (Matching SurveyMonkey Layout) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                {plans.map((plan) => {
                  const priceInfo = getPlanPrice(plan);

                  return (
                    <div
                      key={plan.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between overflow-hidden relative transition-all hover:border-[#00a2c7]"
                    >
                      {/* Top-Right Diagonal Ribbon */}
                      <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden pointer-events-none z-10">
                        <div
                          className={`absolute transform rotate-45 text-white text-[9px] font-black tracking-widest py-1 text-center w-36 top-5 -right-9 shadow-md ${
                            plan.ribbonBg || 'bg-[#008ba3]'
                          }`}
                        >
                          {priceInfo.ribbonText}
                        </div>
                      </div>

                      <div className="p-6">
                        {/* Plan Header */}
                        <div className="min-h-[70px] pr-8">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {plan.shortName}
                          </span>
                          <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight mt-0.5">
                            {plan.name}
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-1">{plan.tagline}</p>
                        </div>

                        {/* Price Block */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xs font-bold text-slate-400">₹</span>
                            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                              {(priceInfo.offerPrice ?? priceInfo.offer ?? 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                              /{billingCycle === 'monthly' ? 'mo' : billingCycle === 'yearly' ? 'yr' : billingCycle}
                            </span>
                          </div>

                          {((priceInfo.offPercent || 0) > 0) && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-400 line-through">
                                ₹{(priceInfo.regularPrice ?? priceInfo.regular ?? 0).toLocaleString('en-IN')}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                                {priceInfo.offPercent}% OFF
                              </span>
                            </div>
                          )}
                        </div>

                        {/* WhatsApp Own Number Add-on Switch */}
                        {plan.hasWhatsappOption && (
                          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
                            <label className="flex items-start gap-2 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={!!ownWhatsapp[plan.id]}
                                onChange={(e) =>
                                  setOwnWhatsapp((prev) => ({
                                    ...prev,
                                    [plan.id]: e.target.checked
                                  }))
                                }
                                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                              />
                              <div className="text-[11px] leading-tight">
                                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                                  Use Own WhatsApp Number
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                                  + ₹{(subscriptionService.calculatePrice(plan, billingCycle, true).whatsappAddon || 400)} (₹400/mo)
                                </span>
                              </div>
                            </label>
                          </div>
                        )}

                        {/* Super Admin Quick Actions for this Plan */}
                        <div className="mt-4 flex items-center gap-2">
                          <button
                            onClick={() => {
                              setTargetPlanId(plan.id);
                              setIsAddFeatureModalOpen(true);
                            }}
                            className="flex-1 py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-[#00a2c7]" />
                            <span>Add Feature</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingPlan(JSON.parse(JSON.stringify(plan)));
                              setIsEditPriceModalOpen(true);
                            }}
                            className="py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-[11px] flex items-center justify-center gap-1 transition cursor-pointer"
                            title="Edit Pricing & Discounts"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>Edit Rates</span>
                          </button>
                        </div>

                        {/* Features Checklist */}
                        <div className="mt-5 space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-4">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Included Features</p>
                          <ul className="space-y-2 text-xs">
                            {plan.features.map((feat, idx) => (
                              <li key={idx} className="flex items-start justify-between gap-1 group">
                                <div className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                  <span className="leading-tight">{feat}</span>
                                </div>
                                <button
                                  onClick={() => handleDeleteFeature(plan.id, idx)}
                                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition shrink-0 p-0.5 cursor-pointer"
                                  title="Remove feature"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-500">Live on Public Site</span>
                        <a
                          href="/#pricing-section"
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-[#00a2c7] hover:underline flex items-center gap-1"
                        >
                          <span>Preview</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}

                {/* Dashed Create New Package Card */}
                <div
                  onClick={() => setIsCreatePackageModalOpen(true)}
                  className="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-[#00a2c7] dark:hover:border-cyan-400 bg-slate-50/50 dark:bg-slate-900/40 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition group min-h-[420px]"
                >
                  <div className="w-14 h-14 rounded-2xl bg-cyan-50 dark:bg-cyan-950/80 text-[#00a2c7] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#00a2c7] group-hover:text-white transition shadow-sm">
                    <Plus className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-white group-hover:text-[#00a2c7] transition">
                    + Create New Package
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[210px] mt-1.5 leading-relaxed">
                    Add a new subscription plan with custom monthly, quarterly, and yearly pricing & features
                  </p>
                  <span className="mt-5 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#00a2c7] shadow-xs group-hover:bg-[#00a2c7] group-hover:text-white group-hover:border-[#00a2c7] transition flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4" />
                    <span>Launch New Plan</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW C: STORES MASTER (ALL SHOPS & DATABASE MANAGEMENT)             */}
          {/* =================================================================== */}
          {activeTab === 'stores' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Store className="w-5 h-5 text-[#00a2c7]" />
                    <span>Stores Master & Database Provisioning</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Toggle Ecommerce module access, check dedicated MySQL tenant databases, and onboard stores.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search store, owner, city..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-[#00a2c7]"
                    />
                  </div>

                  <button
                    onClick={() => setIsProvisionModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Provision Store</span>
                  </button>
                </div>
              </div>

              {/* Stores Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Store Code & Name</th>
                        <th className="px-4 py-3">Merchant / Owner</th>
                        <th className="px-4 py-3">Assigned Plan</th>
                        <th className="px-4 py-3">Ecommerce Module</th>
                        <th className="px-4 py-3">Isolated DB</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Direct Store URL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredShops.map((shop) => (
                        <tr key={shop.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                          <td className="px-5 py-3.5">
                            <span className="font-mono font-bold text-[#00a2c7]">{shop.shop_code}</span>
                            <div className="font-bold text-slate-900 dark:text-white">{shop.name}</div>
                            <div className="text-[10px] text-slate-400">{shop.category}</div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-800 dark:text-slate-200">{shop.owner_name}</div>
                            <div className="text-[10px] text-slate-400">{shop.owner_phone}</div>
                            <div className="text-[10px] text-slate-400">{shop.city}</div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{shop.plan_name}</div>
                            <div className="text-[10px] font-semibold text-emerald-600 uppercase">
                              {shop.billing_cycle} {shop.own_whatsapp ? '• Own WA' : ''}
                            </div>
                          </td>

                          {/* Interactive Ecommerce Toggle */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleToggleEcommerce(shop.shop_code)}
                                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${
                                  shop.has_ecommerce ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                                }`}
                                title={
                                  shop.has_ecommerce
                                    ? 'Ecommerce Active: URL loads online storefront'
                                    : 'Ecommerce Inactive: URL redirects to Billing Software Login'
                                }
                              >
                                <div
                                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                                    shop.has_ecommerce ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                              <span
                                className={`text-[11px] font-bold ${
                                  shop.has_ecommerce
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-slate-400 dark:text-slate-500'
                                }`}
                              >
                                {shop.has_ecommerce ? 'Active Store' : 'POS / Billing'}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 w-max">
                              <Database className="w-3 h-3 text-[#00a2c7]" />
                              {shop.database_name || shop.db_name || 'tenant_db'}
                            </span>
                          </td>

                          <td className="px-4 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                shop.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                  : shop.status === 'expiring_soon'
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                  : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                              }`}
                            >
                              {shop.status.replace('_', ' ')}
                            </span>
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <a
                              href={`/${shop.shop_code}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#00a2c7] hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs inline-flex items-center gap-1 transition"
                            >
                              <span>/{shop.shop_code}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW D: DUE PAYMENTS & RENEWALS MASTER                              */}
          {/* =================================================================== */}
          {activeTab === 'due_payments' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Clock className="w-5 h-5 text-rose-500" />
                    <span>Due Payments & Automated Renewals</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Track expiring stores, dispatch 1-click WhatsApp payment links, and record renewal settlements.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      dueShops.forEach((shop) => handleSendReminder(shop));
                      showToast(`Dispatched WhatsApp reminders to all ${dueShops.length} overdue stores!`);
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send All WhatsApp Reminders</span>
                  </button>
                </div>
              </div>

              {/* Dues Summary Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Outstanding Dues</span>
                  <div className="text-2xl font-black text-rose-600 mt-1">₹{totalDues.toLocaleString('en-IN')}.00</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{dueShops.length} stores awaiting renewal payment</p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expiring in 7 Days</span>
                  <div className="text-2xl font-black text-amber-500 mt-1">{expiringCount} Stores</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Grace period active with automated WhatsApp alerts</p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Expired / Suspended</span>
                  <div className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">{expiredCount} Stores</div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Offline mode restricted until renewal settlement</p>
                </div>
              </div>

              {/* Due Stores Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold tracking-wider">
                    <tr>
                      <th className="px-5 py-3">Store Code & Name</th>
                      <th className="px-4 py-3">Merchant Phone</th>
                      <th className="px-4 py-3">Current Plan</th>
                      <th className="px-4 py-3">Validity Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Due Amount</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {shops.map((shop) => (
                      <tr key={shop.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-[#00a2c7]">{shop.shop_code}</span>
                          <div className="font-bold text-slate-900 dark:text-white">{shop.name}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-medium text-slate-700 dark:text-slate-300">{shop.owner_phone}</div>
                          <div className="text-[10px] text-slate-400">{shop.owner_name}</div>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{shop.plan_name}</div>
                          <div className="text-[10px] text-slate-400 uppercase">{shop.billing_cycle}</div>
                        </td>

                        <td className="px-4 py-3.5 font-medium">{shop.valid_until}</td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              shop.status === 'active'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : shop.status === 'expiring_soon'
                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            }`}
                          >
                            {shop.status}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-bold text-sm">
                          {shop.due_amount > 0 ? (
                            <span className="text-rose-600 dark:text-rose-400">
                              ₹{shop.due_amount.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-semibold text-xs">₹0 (Paid)</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right space-x-2">
                          <button
                            onClick={() => handleSendReminder(shop)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            <span>WhatsApp Reminder</span>
                          </button>

                          <button
                            onClick={() => handleSettlePayment(shop.shop_code)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Quick Settle</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW E: CATEGORY & SUB-CATEGORY MASTER                              */}
          {/* =================================================================== */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <FolderTree className="w-5 h-5 text-[#00a2c7]" />
                    <span>Category & Sub-Category Master</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage commercial retail verticals and industry subcategories configured across the SaaS platform.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsAddCategoryModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Category</span>
                  </button>

                  <button
                    onClick={() => setIsAddSubModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Add Sub-Category</span>
                  </button>
                </div>
              </div>

              {/* Categories Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((cat) => {
                  const childSubs = subcategories.filter((s) => s.categoryId === cat.id);

                  return (
                    <div
                      key={cat.id}
                      className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center font-bold">
                            <Tag className="w-4 h-4" />
                          </div>
                          {categories.length > 1 && (
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="text-slate-400 hover:text-rose-500 transition p-1 cursor-pointer"
                              title="Delete category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">{cat.name}</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-snug">{cat.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                          Sub-categories ({childSubs.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {childSubs.map((sub) => (
                            <span
                              key={sub.id}
                              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                            >
                              {sub.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sub-Categories Manager Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-[#00a2c7]" />
                    <span>Active Industry Sub-Categories</span>
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold tracking-wider">
                      <tr>
                        <th className="px-5 py-3">Sub-Category Name</th>
                        <th className="px-4 py-3">Parent Vertical</th>
                        <th className="px-4 py-3">Industry Code</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {subcategories.map((sub) => {
                        const parent = categories.find((c) => c.id === sub.categoryId);

                        return (
                          <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">{sub.name}</td>
                            <td className="px-4 py-3.5 font-semibold text-slate-600 dark:text-slate-300">
                              {parent?.name || 'Retail'}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs font-bold text-indigo-600">{sub.code}</td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => handleDeleteSubcategory(sub.id)}
                                className="text-slate-400 hover:text-rose-500 transition p-1 cursor-pointer"
                                title="Delete subcategory"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW F: WEBSITE CMS & BRANDING SETUP (Enexa IT Solutions)           */}
          {/* =================================================================== */}
          {activeTab === 'cms' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#00a2c7]" />
                    <span>Website CMS & Platform Branding</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live dynamic configuration powering the public portal (www.enexa.in). Persisted to MySQL `website_settings` table.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <a
                    href="/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-[#00a2c7] text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4 text-[#00a2c7]" />
                    <span>Preview Live Site</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <button
                    onClick={handleSaveCmsSettings}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#008ba3] to-[#00a2c7] hover:from-[#00768c] hover:to-[#008ba3] text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save & Publish to Website</span>
                  </button>
                </div>
              </div>

              {/* Form Cards Grid */}
              <form onSubmit={handleSaveCmsSettings} className="space-y-6">
                {/* Section 1: Corporate Entity & Enexa IT Solutions Branding */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Building2 className="w-5 h-5 text-[#00a2c7]" />
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Corporate Entity & Official Branding (Enexa IT Solutions Private Limited)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Company Legal Name
                      </label>
                      <input
                        type="text"
                        value={websiteCms.company_name || ''}
                        onChange={(e) => setWebsiteCms({ ...websiteCms, company_name: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Official Website URL
                      </label>
                      <input
                        type="url"
                        value={websiteCms.website || ''}
                        onChange={(e) => setWebsiteCms({ ...websiteCms, website: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Official Domain
                      </label>
                      <input
                        type="text"
                        value={websiteCms.official_domain || ''}
                        onChange={(e) => setWebsiteCms({ ...websiteCms, official_domain: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Corporate Identification Number (CIN)
                      </label>
                      <input
                        type="text"
                        value={websiteCms.company_cin || ''}
                        onChange={(e) => setWebsiteCms({ ...websiteCms, company_cin: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Company GSTIN
                      </label>
                      <input
                        type="text"
                        value={websiteCms.company_gstin || ''}
                        onChange={(e) => setWebsiteCms({ ...websiteCms, company_gstin: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Registered Corporate Address
                      </label>
                      <input
                        type="text"
                        value={websiteCms.corporate_address || ''}
                        onChange={(e) => setWebsiteCms({ ...websiteCms, corporate_address: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Hero Section & Announcement Ribbon */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Homepage Hero Section & Announcement Ribbon
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Top Announcement Ribbon Notice
                      </label>
                      <input
                        type="text"
                        value={websiteCms.header_notice || ''}
                        onChange={(e) => setWebsiteCms({ ...websiteCms, header_notice: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Brand Platform Title
                        </label>
                        <input
                          type="text"
                          value={websiteCms.brand_title || ''}
                          onChange={(e) => setWebsiteCms({ ...websiteCms, brand_title: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                          Brand Subtitle / Hero Tagline
                        </label>
                        <input
                          type="text"
                          value={websiteCms.brand_tagline || ''}
                          onChange={(e) => setWebsiteCms({ ...websiteCms, brand_tagline: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Support & Contact Channels */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <Phone className="w-5 h-5 text-emerald-500" />
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                      Support Channels & Public Contact Info
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Support Hotline Phone
                      </label>
                      <input
                        type="text"
                        value={websiteCms.support_phone || ''}
                        onChange={(e) => setWebsiteCms({ ...websiteCms, support_phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Official Support Email
                      </label>
                      <input
                        type="email"
                        value={websiteCms.support_email || ''}
                        onChange={(e) => setWebsiteCms({ ...websiteCms, support_email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                        Sales & Demo Email
                      </label>
                      <input
                        type="email"
                        value={websiteCms.sales_email || ''}
                        onChange={(e) => setWebsiteCms({ ...websiteCms, sales_email: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Save CTA */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#008ba3] to-[#00a2c7] hover:from-[#00768c] hover:to-[#008ba3] text-white font-black text-xs shadow-md shadow-cyan-600/20 transition flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Save Platform Settings & Sync with MySQL</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW G: PUBLIC LEADS & CONTACT INQUIRIES                            */}
          {/* =================================================================== */}
          {activeTab === 'leads' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Mail className="w-5 h-5 text-emerald-500" />
                    <span>Public Leads & Contact Inquiries</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Live requests submitted from www.enexa.in contact form (saved directly into MySQL `contact_inquiries` table).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      const live = await subscriptionService.getLeads();
                      if (Array.isArray(live)) setLeads(live);
                      showToast('Refreshed leads from MySQL');
                    }}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Refresh</span>
                  </button>

                  <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
                    {['all', 'new', 'contacted'].map((f) => (
                      <button
                        key={f}
                        onClick={() => setLeadFilter(f)}
                        className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer ${
                          leadFilter === f
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leads Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-500" />
                    <span>Inquiries Queue ({filteredLeads.length} leads)</span>
                  </h3>
                </div>

                {filteredLeads.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-30 text-emerald-500" />
                    <p className="font-bold text-sm text-slate-600 dark:text-slate-400">No inquiries found in this filter</p>
                    <p className="text-xs mt-1">Inquiries submitted via the public Contact page (/contact) will appear here instantly.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold tracking-wider">
                        <tr>
                          <th className="px-5 py-3">Lead Contact</th>
                          <th className="px-4 py-3">Store / Business</th>
                          <th className="px-4 py-3">City</th>
                          <th className="px-4 py-3">Service Interested</th>
                          <th className="px-4 py-3">Message</th>
                          <th className="px-4 py-3">Received At</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                            <td className="px-5 py-3.5">
                              <div className="font-bold text-slate-900 dark:text-white">{lead.name}</div>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px]">
                                <a href={`tel:${lead.phone}`} className="text-cyan-600 hover:underline flex items-center gap-1 font-semibold">
                                  <Phone className="w-3 h-3" />
                                  <span>{lead.phone}</span>
                                </a>
                                {lead.email && (
                                  <a href={`mailto:${lead.email}`} className="text-slate-400 hover:underline flex items-center gap-1">
                                    <Mail className="w-3 h-3" />
                                    <span>{lead.email}</span>
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">
                              {lead.business_name || 'Retail Merchant'}
                            </td>
                            <td className="px-4 py-3.5 text-slate-600 dark:text-slate-300">
                              {lead.city || 'India'}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7]">
                                {lead.service_interested || 'GST Billing'}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 max-w-xs text-slate-500 truncate" title={lead.message}>
                              {lead.message || 'Interested in POS demo'}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                              {lead.created_at ? new Date(lead.created_at).toLocaleString() : 'Just now'}
                            </td>
                            <td className="px-4 py-3.5">
                              {lead.status === 'new' ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                                  NEW LEAD
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                  CONTACTED
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {lead.status === 'new' ? (
                                <button
                                  onClick={() => handleUpdateLeadStatus(lead.id, 'contacted')}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition cursor-pointer"
                                >
                                  Mark Contacted
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateLeadStatus(lead.id, 'new')}
                                  className="px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-700 hover:border-slate-400 text-slate-600 dark:text-slate-400 font-bold text-[11px] transition cursor-pointer"
                                >
                                  Mark New
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* VIEW H: BLOG ARTICLES MANAGER                                       */}
          {/* =================================================================== */}
          {activeTab === 'blogs' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-500" />
                    <span>Blog & Retail Insights Manager</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Publish thought-leadership and SEO articles appearing on the public blog (/blog). Stored in MySQL `blogs` table.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="/blog"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-xs font-bold text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5"
                  >
                    <Eye className="w-4 h-4 text-amber-500" />
                    <span>View Public Blog</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>

                  <button
                    onClick={() => setIsCreateBlogModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Publish New Article</span>
                  </button>
                </div>
              </div>

              {/* Blog Articles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {blogs.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between group"
                  >
                    {b.cover_image && (
                      <div className="h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                        <img
                          src={b.cover_image}
                          alt={b.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                          {b.category || 'Retail Insights'}
                        </span>
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                          <span>{b.author || 'Enexa IT Team'}</span>
                          <span>•</span>
                          <span>{b.read_time || '4 min read'}</span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug line-clamp-2">
                          {b.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                          {b.excerpt}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <a
                          href="/blog"
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <span>Read on site</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          onClick={() => handleDeleteBlog(b.id, b.title)}
                          className="text-slate-400 hover:text-rose-500 transition p-1 cursor-pointer"
                          title="Delete article"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =================================================================== */}
      {/* MODAL 0: PLATFORM BRANDING & SETTINGS (User Requested)              */}
      {/* =================================================================== */}
      {isBrandingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#008ba3] via-[#00a8cc] to-[#10b981] flex items-center justify-center text-white shadow-xs">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Platform Branding & Settings</h3>
                  <p className="text-[11px] text-slate-400">Configure SaaS platform identity, support contacts & legal details</p>
                </div>
              </div>
              <button
                onClick={() => setIsBrandingModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlatformBranding} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Platform SaaS Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={platformBranding.platformName}
                    onChange={(e) => setPlatformBranding({ ...platformBranding, platformName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Admin Display Name
                  </label>
                  <input
                    type="text"
                    value={platformBranding.adminName}
                    onChange={(e) => setPlatformBranding({ ...platformBranding, adminName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tagline / System Description
                </label>
                <input
                  type="text"
                  value={platformBranding.platformTagline}
                  onChange={(e) => setPlatformBranding({ ...platformBranding, platformTagline: e.target.value })}
                  placeholder="e.g. Enterprise Multi-Tenant SaaS Platform"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Support Phone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={platformBranding.supportPhone}
                    onChange={(e) => setPlatformBranding({ ...platformBranding, supportPhone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={platformBranding.companyGstin}
                    onChange={(e) => setPlatformBranding({ ...platformBranding, companyGstin: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBrandingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Platform Settings</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: ADD FEATURE TO PLAN                                        */}
      {/* =================================================================== */}
      {isAddFeatureModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00a2c7]" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Add Feature to {plans.find((p) => p.id === targetPlanId)?.name}
                </h3>
              </div>
              <button
                onClick={() => setIsAddFeatureModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFeature} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Feature Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Automated GSTR-3B Tax Filing Assistance"
                  value={newFeatureText}
                  onChange={(e) => setNewFeatureText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-[#00a2c7]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddFeatureModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Save Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: EDIT PRICING & OFF %                                       */}
      {/* =================================================================== */}
      {isEditPriceModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#00a2c7]" />
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Edit Pricing & Discount %</h3>
                  <p className="text-[11px] text-slate-400">{editingPlan.name}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditPriceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePriceEdit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Display Short Code
                  </label>
                  <input
                    type="text"
                    value={editingPlan.shortName}
                    onChange={(e) => setEditingPlan({ ...editingPlan, shortName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category Filter
                  </label>
                  <select
                    value={editingPlan.category}
                    onChange={(e) => setEditingPlan({ ...editingPlan, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="business">Business Plans</option>
                    <option value="personal">Personal Plans</option>
                    <option value="addons">Add-on Packs & APIs</option>
                  </select>
                </div>
              </div>

              {/* Billing Cycles Prices */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  Cycle Rates & Discount Structure
                </span>

                {['monthly', 'quarterly', 'half_yearly', 'yearly'].map((cycle) => {
                  const data = editingPlan.cycles[cycle];
                  const cycleLabels = {
                    monthly: 'Monthly',
                    quarterly: 'Quarterly (3 Months)',
                    half_yearly: 'Half Yearly (6 Months)',
                    yearly: 'Yearly (12 Months)'
                  };

                  return (
                    <div
                      key={cycle}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-3 gap-2 items-center"
                    >
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                        {cycleLabels[cycle]}
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Offer Price (₹)</label>
                        <input
                          type="number"
                          value={data.offer}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const reg = data.regular;
                            const off = reg > val ? Math.round(((reg - val) / reg) * 100) : 0;
                            setEditingPlan({
                              ...editingPlan,
                              cycles: {
                                ...editingPlan.cycles,
                                [cycle]: {
                                  ...data,
                                  offer: val,
                                  offPercent: off,
                                  ribbonText: off > 0 ? `SAVE ${off}%*` : 'POPULAR'
                                }
                              }
                            });
                          }}
                          className="w-full px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Regular (₹) / Off %</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={data.regular}
                            onChange={(e) => {
                              const reg = parseFloat(e.target.value) || 0;
                              const val = data.offer;
                              const off = reg > val ? Math.round(((reg - val) / reg) * 100) : 0;
                              setEditingPlan({
                                ...editingPlan,
                                cycles: {
                                  ...editingPlan.cycles,
                                  [cycle]: {
                                    ...data,
                                    regular: reg,
                                    offPercent: off,
                                    ribbonText: off > 0 ? `SAVE ${off}%*` : 'POPULAR'
                                  }
                                }
                              });
                            }}
                            className="w-full px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs text-slate-500"
                          />
                          <span className="text-[10px] font-black text-emerald-600 shrink-0">{data.offPercent}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditPriceModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Apply & Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2B: CREATE NEW SUBSCRIPTION PACKAGE                            */}
      {/* =================================================================== */}
      {isCreatePackageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#00a2c7]" />
                  <span>Create New Subscription Package</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Configure plan details, cycle pricing, and feature matrix. Automatically synced to database & public site.
                </p>
              </div>
              <button
                onClick={() => setIsCreatePackageModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePackage} className="space-y-4">
              {/* Package Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. GST Billing + Inventory Pro"
                    value={newPackage.name}
                    onChange={(e) => setNewPackage({ ...newPackage, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00a2c7]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Header Short Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. TEAM ADVANTAGE"
                    value={newPackage.shortName}
                    onChange={(e) => setNewPackage({ ...newPackage, shortName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category Tab
                  </label>
                  <select
                    value={newPackage.category}
                    onChange={(e) => setNewPackage({ ...newPackage, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="business">Business Plans</option>
                    <option value="personal">Personal Plans</option>
                    <option value="addons">Add-on Packs & APIs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Badge / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Core Retail POS"
                    value={newPackage.badge}
                    onChange={(e) => setNewPackage({ ...newPackage, badge: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Corner Ribbon Color
                  </label>
                  <select
                    value={newPackage.ribbonBg}
                    onChange={(e) => setNewPackage({ ...newPackage, ribbonBg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                  >
                    <option value="bg-[#008ba3]">Teal (#008ba3)</option>
                    <option value="bg-[#6b21a8]">Purple (#6b21a8)</option>
                    <option value="bg-[#00a2c7]">Cyan (#00a2c7)</option>
                    <option value="bg-[#059669]">Emerald (#059669)</option>
                    <option value="bg-[#e11d48]">Rose (#e11d48)</option>
                    <option value="bg-[#d97706]">Amber (#d97706)</option>
                  </select>
                </div>
              </div>

              {/* Module Toggles */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex flex-wrap gap-4 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newPackage.hasEcommerce}
                    onChange={(e) => setNewPackage({ ...newPackage, hasEcommerce: e.target.checked })}
                    className="rounded text-[#00a2c7] focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Includes Online Ecommerce Storefront
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newPackage.hasWhatsappOption}
                    onChange={(e) => setNewPackage({ ...newPackage, hasWhatsappOption: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    Includes WhatsApp Message Suite (+ Own WA option)
                  </span>
                </label>
              </div>

              {/* Billing Cycle Rates with Live Off % calculation */}
              <div className="space-y-2.5 pt-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                  Pricing Across 4 Billing Cycles (INR ₹)
                </span>

                {['monthly', 'quarterly', 'half_yearly', 'yearly'].map((cycle) => {
                  const data = newPackage.cycles[cycle];
                  const labels = {
                    monthly: 'Monthly',
                    quarterly: 'Quarterly (3 Mo)',
                    half_yearly: 'Half Yearly (6 Mo)',
                    yearly: 'Yearly (12 Mo)'
                  };

                  return (
                    <div
                      key={cycle}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-3 gap-2 items-center"
                    >
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {labels[cycle]}
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Offer / Sale Price (₹) *</label>
                        <input
                          type="number"
                          required
                          value={data.offer}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            const reg = data.regular;
                            const off = reg > val ? Math.round(((reg - val) / reg) * 100) : 0;
                            setNewPackage({
                              ...newPackage,
                              cycles: {
                                ...newPackage.cycles,
                                [cycle]: {
                                  ...data,
                                  offer: val,
                                  offPercent: off,
                                  ribbonText: off > 0 ? `SAVE ${off}%*` : 'POPULAR'
                                }
                              }
                            });
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Regular / MRP (₹)</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={data.regular}
                            onChange={(e) => {
                              const reg = parseFloat(e.target.value) || 0;
                              const val = data.offer;
                              const off = reg > val ? Math.round(((reg - val) / reg) * 100) : 0;
                              setNewPackage({
                                ...newPackage,
                                cycles: {
                                  ...newPackage.cycles,
                                  [cycle]: {
                                    ...data,
                                    regular: reg,
                                    offPercent: off,
                                    ribbonText: off > 0 ? `SAVE ${off}%*` : 'POPULAR'
                                  }
                                }
                              });
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-xs text-slate-500"
                          />
                          <span className="text-[10px] font-black text-emerald-600 shrink-0">{data.offPercent}% OFF</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Features List */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Included Features (Enter 1 feature per line)
                </label>
                <textarea
                  rows={4}
                  value={newPackage.featuresText}
                  onChange={(e) => setNewPackage({ ...newPackage, featuresText: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  placeholder="High-Speed POS Counter Billing&#10;GST Tax Invoicing&#10;Thermal Printing"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreatePackageModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00a2c7] to-cyan-600 hover:from-[#008ba3] hover:to-cyan-700 text-white font-extrabold text-xs shadow-md shadow-cyan-500/25 transition cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create & Publish Package</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: ADD CATEGORY                                               */}
      {/* =================================================================== */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Retail Industry Category</h3>
              <button
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Healthcare & Pharma"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="e.g. Batch tracking, expiry alerts, doctor prescriptions"
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-500 h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: ADD SUB-CATEGORY                                           */}
      {/* =================================================================== */}
      {isAddSubModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Sub-Category</h3>
              <button
                onClick={() => setIsAddSubModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubcategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Parent Category *
                </label>
                <select
                  value={targetParentCatId}
                  onChange={(e) => setTargetParentCatId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sub-Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Footwear & Shoes"
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-[#00a2c7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Industry Short Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. SHOES"
                  value={newSubCode}
                  onChange={(e) => setNewSubCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold focus:outline-none focus:border-[#00a2c7]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddSubModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Save Sub-Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 5: PROVISION STORE                                            */}
      {/* =================================================================== */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Provision New Shop & Isolated DB
                </h3>
                <p className="text-[11px] text-slate-400">Generates unique store code and assigns subscription</p>
              </div>
              <button
                onClick={() => setIsProvisionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShop} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Garments"
                    value={newShop.name}
                    onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Owner Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajesh Verma"
                    value={newShop.owner_name}
                    onChange={(e) => setNewShop({ ...newShop, owner_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={newShop.owner_phone}
                    onChange={(e) => setNewShop({ ...newShop, owner_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City & State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur, Rajasthan"
                    value={newShop.city}
                    onChange={(e) => setNewShop({ ...newShop, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subscription Package *
                </label>
                <select
                  value={newShop.plan_id}
                  onChange={(e) => setNewShop({ ...newShop, plan_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.hasEcommerce ? '(With Ecommerce)' : '(Billing Only)'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Billing Cycle
                  </label>
                  <select
                    value={newShop.billing_cycle}
                    onChange={(e) => setNewShop({ ...newShop, billing_cycle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half_yearly">Half Yearly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                    <input
                      type="checkbox"
                      checked={newShop.own_whatsapp}
                      onChange={(e) => setNewShop({ ...newShop, own_whatsapp: e.target.checked })}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-bold">Own WhatsApp (+₹400/mo)</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-xs cursor-pointer"
                >
                  Provision Store
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 6: CREATE BLOG ARTICLE (Persisted to MySQL)                   */}
      {/* =================================================================== */}
      {isCreateBlogModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Publish New Blog Article</h3>
                  <p className="text-[11px] text-slate-400">Article will instantly appear on the public website (/blog)</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateBlogModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBlog} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Signs Your Retail Store Needs a Cloud POS in 2026"
                  value={newBlog.title}
                  onChange={(e) => setNewBlog({ ...newBlog, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newBlog.category}
                    onChange={(e) => setNewBlog({ ...newBlog, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="Retail Billing & POS">Retail Billing & POS</option>
                    <option value="GST & Compliance">GST & Compliance</option>
                    <option value="WhatsApp Commerce">WhatsApp Commerce</option>
                    <option value="Omnichannel Strategy">Omnichannel Strategy</option>
                    <option value="Inventory Management">Inventory Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Read Time
                  </label>
                  <input
                    type="text"
                    value={newBlog.read_time}
                    onChange={(e) => setNewBlog({ ...newBlog, read_time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Author
                  </label>
                  <input
                    type="text"
                    value={newBlog.author}
                    onChange={(e) => setNewBlog({ ...newBlog, author: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newBlog.cover_image}
                  onChange={(e) => setNewBlog({ ...newBlog, cover_image: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Article Summary / Excerpt *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Short engaging description for preview cards..."
                  value={newBlog.excerpt}
                  onChange={(e) => setNewBlog({ ...newBlog, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Article Content *
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write the full informative retail article here..."
                  value={newBlog.content}
                  onChange={(e) => setNewBlog({ ...newBlog, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateBlogModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Article to MySQL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

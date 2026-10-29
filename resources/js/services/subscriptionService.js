// Central Subscription & Master Data Service
// Manages Packages, Categories, Subcategories, Stores, and Due Payments
// Synchronizes state across Super Admin (/master) and Public Landing Page (/)

const STORAGE_KEY = 'shoppy_master_saas_data_v2';

const DEFAULT_CATEGORIES = [
  { id: 'cat-retail', name: 'Retail & POS Invoicing', icon: 'Store', description: 'Counter billing, thermal receipt printing, barcode scan' },
  { id: 'cat-ecommerce', name: 'Digital Commerce', icon: 'Globe', description: 'Online storefront, mobile cart, delivery courier sync' },
  { id: 'cat-whatsapp', name: 'WhatsApp CRM & Alerts', icon: 'MessageSquare', description: 'Automated invoice links, payment QR, broadcast marketing' },
  { id: 'cat-omni', name: 'Omnichannel Enterprise', icon: 'Sparkles', description: 'Unified inventory across counter and web store' },
];

const DEFAULT_SUBCATEGORIES = [
  { id: 'sub-apparel', categoryId: 'cat-retail', name: 'Apparel & Fashion Garments', code: 'FASHION' },
  { id: 'sub-grocery', categoryId: 'cat-retail', name: 'Grocery & Supermarket / Kirana', code: 'GROCERY' },
  { id: 'sub-electronics', categoryId: 'cat-retail', name: 'Electronics & Mobile Phones', code: 'ELEC' },
  { id: 'sub-pharmacy', categoryId: 'cat-retail', name: 'Pharmacy & Medical Stores', code: 'PHARMA' },
  { id: 'sub-footwear', categoryId: 'cat-retail', name: 'Footwear & Leather Goods', code: 'FOOTWEAR' },
  { id: 'sub-hardware', categoryId: 'cat-retail', name: 'Hardware & Electrical Spares', code: 'HARDWARE' },
];

const DEFAULT_PLANS = [
  {
    id: 'gst-billing',
    name: 'GST Billing Software',
    shortName: 'TEAM ADVANTAGE',
    category: 'business',
    badge: 'Core Retail POS',
    ribbonBg: 'bg-[#008ba3]',
    buttonBg: 'bg-[#008ba3] hover:bg-[#00768c] text-white',
    buttonText: 'SIGN UP',
    hasWhatsappOption: false,
    hasEcommerce: false,
    subtext: 'Starting at 1 store terminal, billed annually',
    cycles: {
      monthly: { regular: 500, offer: 500, offPercent: 0, label: '/ month', ribbonText: 'POPULAR' },
      quarterly: { regular: 1500, offer: 1250, offPercent: 17, label: '/ 3 months', ribbonText: 'SAVE 17%*' },
      half_yearly: { regular: 3000, offer: 2250, offPercent: 25, label: '/ 6 months', ribbonText: 'SAVE 25%*' },
      yearly: { regular: 6000, offer: 4000, offPercent: 33, label: '/ year', ribbonText: 'SAVE 33%*' }
    },
    features: [
      'High-Speed POS Counter Billing (<50ms)',
      'GST Tax Invoicing (B2B / B2C) & GSTR-1 Ledger',
      'Thermal 80mm & 50mm Receipt Printing',
      '1D/2D Barcode Generator & Shelf Labels',
      'Multi-Branch Inventory & Stock Ledger',
      'Cash Drawer Float & Daily Z-Report',
      'Add Contributor Seats & Cashier Profiles',
      'Free integrations with popular accounting apps',
      '10,000 barcode lookups per day',
      '24/7 Expedited phone & email support',
      'Quizzes & customer feedback at checkout',
      'Custom logos, store colors, and thermal header',
      'All data exports (CSV, PDF, XLS, GSTR-1 JSON)'
    ]
  },
  {
    id: 'gst-billing-whatsapp',
    name: 'GST Billing Software + Whatsapp Message suite',
    shortName: 'TEAM PREMIER',
    category: 'business',
    badge: 'Smart Communication',
    ribbonBg: 'bg-[#6b21a8]',
    buttonBg: 'bg-[#6b21a8] hover:bg-[#581c87] text-white',
    buttonText: 'SIGN UP',
    hasWhatsappOption: true,
    hasEcommerce: false,
    subtext: 'Starting at 1 store terminal, billed annually',
    cycles: {
      monthly: { regular: 600, offer: 600, offPercent: 0, label: '/ month', ribbonText: 'POPULAR' },
      quarterly: { regular: 1800, offer: 1650, offPercent: 8, label: '/ 3 months', ribbonText: 'SAVE 8%*' },
      half_yearly: { regular: 3600, offer: 2850, offPercent: 21, label: '/ 6 months', ribbonText: 'SAVE 21%*' },
      yearly: { regular: 7200, offer: 5200, offPercent: 28, label: '/ year', ribbonText: 'SAVE 28%*' }
    },
    features: [
      'All GST Billing Software features included',
      'Automated WhatsApp GST Tax Invoice Links & PDF',
      'WhatsApp Payment Reminders & Dynamic UPI QR Links',
      'Daily Shift Sales & Cash Register Summary to Owner WhatsApp',
      'Customer WhatsApp Marketing Broadcasts & Loyalty points',
      'Zero API Gateway Setup Fee',
      'Add Contributor Seats & Multi-Cashier Logins',
      '15,000 WhatsApp messages per year included',
      'Phone support and 24/7 email support',
      'Custom logo, colors, and verified business badge',
      'Accept Payments via WhatsApp UPI Intent',
      'Advanced analytics & customer retention reports',
      'Industry benchmark comparison'
    ]
  },
  {
    id: 'gst-billing-ecommerce',
    name: 'GST Billing Software + Ecommerce',
    shortName: 'TEAM ECOMMERCE',
    category: 'business',
    badge: 'Digital Storefront',
    ribbonBg: 'bg-[#00a2c7]',
    buttonBg: 'bg-[#00a2c7] hover:bg-[#008ba3] text-white',
    buttonText: 'SIGN UP',
    hasWhatsappOption: false,
    hasEcommerce: true,
    subtext: 'Starting at 1 store terminal, billed annually',
    cycles: {
      monthly: { regular: 750, offer: 750, offPercent: 0, label: '/ month', ribbonText: 'POPULAR' },
      quarterly: { regular: 2250, offer: 2000, offPercent: 11, label: '/ 3 months', ribbonText: 'SAVE 11%*' },
      half_yearly: { regular: 4500, offer: 3500, offPercent: 22, label: '/ 6 months', ribbonText: 'SAVE 22%*' },
      yearly: { regular: 9000, offer: 6000, offPercent: 33, label: '/ year', ribbonText: 'SAVE 33%*' }
    },
    features: [
      'All GST Billing Software features included',
      'Custom Storefront Web Portal (http://domain/{storeCode})',
      'Customer Mobile Shopping Cart & Self-Checkout',
      '5 Payment Gateways (PhonePe, PayU, Cashfree, Easebuzz, Razorpay)',
      '5 Courier Aggregators (Shiprocket, iThink, NimbusPost, etc.)',
      'Real-time Product & Inventory Sync with POS Terminal',
      'Add Contributor Seats for Web Order Fulfillment',
      'Automated AWB generation & courier tracking links',
      'Unlimited online catalog listings & category tree',
      'Phone support and 24/7 email support',
      'Custom domain support (yourbrand.com)',
      'All data exports (CSV, PDF, XLS, GSTR-1)',
      'Click-map and product analytics dashboard',
      'Abandoned Cart recovery email alerts'
    ]
  },
  {
    id: 'gst-billing-ecommerce-whatsapp',
    name: 'GST Billing Software + Ecommerce + Whatsapp Messaging',
    shortName: 'ENTERPRISE',
    category: 'business',
    badge: 'Omnichannel Full Suite',
    ribbonBg: 'bg-[#0a3e7e]',
    buttonBg: 'bg-[#0a3e7e] hover:bg-[#083063] text-white',
    buttonText: 'SIGN UP',
    hasWhatsappOption: true,
    hasEcommerce: true,
    subtext: 'Powerful admin tools, integrations, and omnichannel features for your business.',
    cycles: {
      monthly: { regular: 850, offer: 850, offPercent: 0, label: '/ month', ribbonText: 'BEST VALUE' },
      quarterly: { regular: 2550, offer: 2500, offPercent: 2, label: '/ 3 months', ribbonText: 'SAVE 2%*' },
      half_yearly: { regular: 5100, offer: 4000, offPercent: 22, label: '/ 6 months', ribbonText: 'SAVE 22%*' },
      yearly: { regular: 10200, offer: 7500, offPercent: 26, label: '/ year', ribbonText: 'SAVE 26%*' }
    },
    features: [
      'Complete All-in-One Enterprise Retail SaaS Suite',
      'Omnichannel POS Counter + Online Web Storefront',
      'Instant WhatsApp Order Confirmation & Dispatch Links',
      'Automated WhatsApp Abandoned Cart Recovery Sequences',
      'Live Shipping Tracking & Delivery Updates on WhatsApp',
      'Dedicated Isolated MySQL Database for Tenant',
      'Advanced collaboration features across headquarter & outlets',
      'Free integrations with all 5 Payment Gateways & 5 Couriers',
      'Unlimited online orders and counter POS bills',
      'Phone support and 24/7 dedicated account manager',
      'Custom logos, colors, and white-label footer removal',
      'Unlimited API access for ERP synchronization',
      'GST Tax Compliance and GSTR-1, GSTR-3B audit reports',
      'Admin dashboard and multi-user role management',
      'Single sign-on (SSO) & biometric drawer authentication',
      'Activity tracking through security audit logs',
      'Dedicated customer success manager & WhatsApp concierge'
    ]
  }
];

const DEFAULT_STORES = [
  {
    id: 1,
    shop_code: 'STORE983515',
    name: 'Verma General & Kirana Store',
    owner_name: 'Rajesh Verma',
    owner_phone: '+91 98351 51234',
    city: 'Lucknow, Uttar Pradesh',
    plan_name: 'GST Billing Software + Ecommerce + Whatsapp Messaging',
    plan_id: 'gst-billing-ecommerce-whatsapp',
    billing_cycle: 'yearly',
    has_ecommerce: true,
    whatsapp_mode: 'own_number',
    database_name: 'tenant_store983515',
    status: 'active',
    valid_until: '2027-10-21',
    due_amount: 0,
    created_at: '2026-10-21'
  },
  {
    id: 2,
    shop_code: 'STORE441029',
    name: 'Sharma Textile & Garments',
    owner_name: 'Mukesh Sharma',
    owner_phone: '+91 98290 44102',
    city: 'Jaipur, Rajasthan',
    plan_name: 'GST Billing Software',
    plan_id: 'gst-billing',
    billing_cycle: 'quarterly',
    has_ecommerce: false,
    whatsapp_mode: 'none',
    database_name: 'tenant_store441029',
    status: 'expiring_soon',
    valid_until: '2026-10-25', // Expiring in 4 days!
    due_amount: 1250,
    created_at: '2026-07-25'
  },
  {
    id: 3,
    shop_code: 'SHP-A4IFYK',
    name: 'Ramesh Fashion Store',
    owner_name: 'Ramesh Sundaram',
    owner_phone: '+91 98290 00192',
    city: 'Jaipur, Rajasthan',
    plan_name: 'GST Billing Software + Ecommerce',
    plan_id: 'gst-billing-ecommerce',
    billing_cycle: 'yearly',
    has_ecommerce: true,
    whatsapp_mode: 'platform_number',
    database_name: 'tenant_ramesh_fashion',
    status: 'active',
    valid_until: '2027-10-15',
    due_amount: 0,
    created_at: '2026-10-15'
  },
  {
    id: 4,
    shop_code: 'STORE118833',
    name: 'Kisan Agro Seed & Fertilizer',
    owner_name: 'Mahesh Patel',
    owner_phone: '+91 98234 11883',
    city: 'Nagpur, Maharashtra',
    plan_name: 'GST Billing Software + Whatsapp Message suite',
    plan_id: 'gst-billing-whatsapp',
    billing_cycle: 'half_yearly',
    has_ecommerce: false,
    whatsapp_mode: 'own_number',
    database_name: 'tenant_store118833',
    status: 'expired',
    valid_until: '2026-10-20', // Expired yesterday!
    due_amount: 2850,
    created_at: '2026-04-20'
  },
  {
    id: 5,
    shop_code: 'STORE552190',
    name: 'Apex Mobile & Electronics',
    owner_name: 'Vikramaditya Rathore',
    owner_phone: '+91 98765 52190',
    city: 'Indore, MP',
    plan_name: 'GST Billing Software + Ecommerce',
    plan_id: 'gst-billing-ecommerce',
    billing_cycle: 'half_yearly',
    has_ecommerce: true,
    whatsapp_mode: 'none',
    database_name: 'tenant_store552190',
    status: 'active',
    valid_until: '2027-04-21',
    due_amount: 0,
    created_at: '2026-10-21'
  }
];

class SubscriptionService {
  constructor() {
    this.init();
    this.syncFromBackend();
  }

  init() {
    try {
      const existing = localStorage.getItem(STORAGE_KEY);
      if (!existing) {
        this.saveState({
          plans: DEFAULT_PLANS,
          categories: DEFAULT_CATEGORIES,
          subcategories: DEFAULT_SUBCATEGORIES,
          stores: DEFAULT_STORES,
          settings: {
            company_name: 'Enexa IT Solutions Private Limited',
            powered_by: 'Enexa IT Solutions Private Limited',
            website: 'https://www.enexa.in',
            official_domain: 'www.enexa.in',
            support_phone: '+91 98290 00192',
            support_email: 'info@enexa.in'
          },
          blogs: []
        });
      }
    } catch (e) {
      // LocalStorage fallback
    }
  }

  // Live Sync from Laravel MySQL APIs
  async syncFromBackend() {
    try {
      // 1. Fetch live plans from MySQL
      const plansRes = await fetch('/api/master/plans');
      if (plansRes.ok) {
        const plansJson = await plansRes.json();
        if (plansJson.success && Array.isArray(plansJson.data) && plansJson.data.length > 0) {
          const state = this.getState();
          state.plans = plansJson.data;
          this.saveState(state);
        }
      }

      // 2. Fetch live stores from MySQL
      const storesRes = await fetch('/api/master/stores');
      if (storesRes.ok) {
        const storesJson = await storesRes.json();
        if (storesJson.success && Array.isArray(storesJson.data)) {
          const state = this.getState();
          state.stores = storesJson.data;
          this.saveState(state);
        }
      }

      // 3. Fetch website settings (Enexa IT Solutions branding)
      const settingsRes = await fetch('/api/master/settings');
      if (settingsRes.ok) {
        const settingsJson = await settingsRes.json();
        if (settingsJson.success && settingsJson.data) {
          const state = this.getState();
          state.settings = settingsJson.data;
          this.saveState(state);
        }
      }

      // 4. Fetch blogs
      const blogsRes = await fetch('/api/blogs');
      if (blogsRes.ok) {
        const blogsJson = await blogsRes.json();
        if (blogsJson.success && Array.isArray(blogsJson.data)) {
          const state = this.getState();
          state.blogs = blogsJson.data;
          this.saveState(state);
        }
      }
    } catch (err) {
      // Sync fallback
    }
  }

  getState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}
    return {
      plans: DEFAULT_PLANS,
      categories: DEFAULT_CATEGORIES,
      subcategories: DEFAULT_SUBCATEGORIES,
      stores: DEFAULT_STORES,
      settings: {
        company_name: 'Enexa IT Solutions Private Limited',
        powered_by: 'Enexa IT Solutions Private Limited',
        website: 'https://www.enexa.in',
        official_domain: 'www.enexa.in'
      },
      blogs: []
    };
  }

  saveState(newState) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      // Dispatch storage event for cross-tab sync
      window.dispatchEvent(new CustomEvent('shoppy:master_updated', { detail: newState }));
    } catch (e) {}
  }

  getPlans() {
    return this.getState().plans;
  }

  savePlans(newPlans) {
    const state = this.getState();
    state.plans = newPlans;
    this.saveState(state);
  }

  // Create Plan - Persists to MySQL via API
  async createPlan(newPlan) {
    const state = this.getState();
    const planId = newPlan.id || ('plan-' + Date.now());
    const formattedPlan = {
      ...newPlan,
      id: planId,
      code: newPlan.code || planId
    };
    state.plans.push(formattedPlan);
    this.saveState(state);

    // Live POST to MySQL API
    try {
      fetch('/api/master/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: newPlan.name,
          shortName: newPlan.shortName,
          category: newPlan.category,
          badge: newPlan.badge,
          ribbonBg: newPlan.ribbonBg,
          buttonText: newPlan.buttonText,
          hasWhatsappOption: newPlan.hasWhatsappOption,
          hasEcommerce: newPlan.hasEcommerce,
          subtext: newPlan.subtext,
          cycles: newPlan.cycles,
          features: newPlan.features
        })
      }).then(() => this.syncFromBackend());
    } catch (e) {
      // Local cache fallback
    }

    return formattedPlan;
  }

  // Delete Plan - Persists to MySQL via API
  async deletePlan(planId) {
    const state = this.getState();
    const target = state.plans.find((p) => p.id === planId || p.code === planId);
    state.plans = state.plans.filter((p) => p.id !== planId && p.code !== planId);
    this.saveState(state);

    if (target) {
      try {
        fetch(`/api/master/plans/${target.code || target.id}`, {
          method: 'DELETE',
          headers: { 'Accept': 'application/json' }
        }).then(() => this.syncFromBackend());
      } catch (e) {}
    }
  }

  // Update Plan rates in MySQL
  async updatePlan(planCode, updatedPlan) {
    const state = this.getState();
    state.plans = state.plans.map((p) => (p.code === planCode || p.id === planCode) ? { ...p, ...updatedPlan } : p);
    this.saveState(state);

    try {
      fetch(`/api/master/plans/${planCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(updatedPlan)
      }).then(() => this.syncFromBackend());
    } catch (e) {}
  }

  getCategories() {
    return this.getState().categories;
  }

  saveCategories(newCategories) {
    const state = this.getState();
    state.categories = newCategories;
    this.saveState(state);
  }

  getSubcategories() {
    return this.getState().subcategories;
  }

  saveSubcategories(newSubs) {
    const state = this.getState();
    state.subcategories = newSubs;
    this.saveState(state);
  }

  getStores() {
    return this.getState().stores;
  }

  saveStores(newStores) {
    const state = this.getState();
    state.stores = newStores;
    this.saveState(state);
  }

  getWebsiteSettings() {
    return this.getState().settings || {
      company_name: 'Enexa IT Solutions Private Limited',
      powered_by: 'Enexa IT Solutions Private Limited',
      website: 'https://www.enexa.in',
      official_domain: 'www.enexa.in',
      support_phone: '+91 98290 00192',
      support_email: 'info@enexa.in'
    };
  }

  async updateWebsiteSettings(newSettings) {
    const state = this.getState();
    state.settings = { ...state.settings, ...newSettings };
    this.saveState(state);

    try {
      await fetch('/api/master/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      this.syncFromBackend();
    } catch (e) {}
  }

  getBlogs() {
    return this.getState().blogs || [];
  }

  async createBlog(blog) {
    try {
      const res = await fetch('/api/master/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(blog)
      });
      const data = await res.json();
      await this.syncFromBackend();
      return data;
    } catch (e) {
      return { success: false };
    }
  }

  async deleteBlog(id) {
    try {
      const res = await fetch(`/api/master/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });
      const data = await res.json();
      await this.syncFromBackend();
      return data;
    } catch (e) {
      return { success: false };
    }
  }

  async submitContact(inquiry) {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(inquiry)
      });
      return await res.json();
    } catch (e) {
      return { success: true, message: 'Inquiry submitted successfully!' };
    }
  }

  async getLeads() {
    try {
      const res = await fetch('/api/master/leads');
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
    } catch (e) {
      // Lead fetch fallback
    }
    return [];
  }

  async updateLeadStatus(id, status) {
    try {
      const res = await fetch(`/api/master/leads/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ status })
      });
      return await res.json();
    } catch (e) {
      return { success: false };
    }
  }

  // Calculate live price helper
  calculatePrice(plan, cycle = 'yearly', useOwnWhatsapp = false) {
    if (!plan || !plan.cycles) {
      return {
        offerPrice: 0,
        regularPrice: 0,
        offer: 0,
        regular: 0,
        offPercent: 0,
        label: '/ year',
        whatsappAddon: 0,
        ribbonText: 'STANDARD'
      };
    }

    const cycleData = plan.cycles[cycle] || plan.cycles.yearly || plan.cycles.monthly || { regular: 0, offer: 0, offPercent: 0, label: '/ year' };
    let offer = Number(cycleData.offer ?? cycleData.offerPrice ?? 0);
    let regular = Number(cycleData.regular ?? cycleData.regularPrice ?? offer);
    let addon = 0;

    if (plan.hasWhatsappOption && useOwnWhatsapp) {
      const multiplier = cycle === 'monthly' ? 1 : cycle === 'quarterly' ? 3 : cycle === 'half_yearly' ? 6 : 12;
      addon = 400 * multiplier;
      offer += addon;
      regular += addon;
    }

    const offPercent = cycleData.offPercent ?? (regular > offer ? Math.round(((regular - offer) / regular) * 100) : 0);

    return {
      offerPrice: offer,
      regularPrice: regular,
      offer: offer,
      regular: regular,
      offPercent: offPercent,
      label: cycleData.label || (cycle === 'monthly' ? '/ month' : cycle === 'quarterly' ? '/ 3 months' : cycle === 'half_yearly' ? '/ 6 months' : '/ year'),
      whatsappAddon: addon,
      ribbonText: cycleData.ribbonText || (offPercent > 0 ? `SAVE ${offPercent}%*` : 'POPULAR')
    };
  }

  // Onboard new store from Landing Page or Master
  onboardStore(formData) {
    const state = this.getState();
    const randomCode = 'STORE' + Math.floor(100000 + Math.random() * 900000);
    const selectedPlan = state.plans.find((p) => p.id === formData.planId) || state.plans[0];

    // Compute validity
    const daysToAdd = formData.billingCycle === 'monthly' ? 30 : formData.billingCycle === 'quarterly' ? 90 : formData.billingCycle === 'half_yearly' ? 180 : 365;
    const now = new Date();
    now.setDate(now.getDate() + daysToAdd);
    const validUntil = now.toISOString().split('T')[0];

    const newStore = {
      id: Date.now(),
      shop_code: randomCode,
      name: formData.name,
      owner_name: formData.ownerName,
      owner_phone: formData.ownerPhone,
      city: formData.city || 'Delhi NCR',
      category: formData.category || 'Retail POS',
      sub_category: formData.subCategory || 'Apparel & Fashion',
      plan_name: selectedPlan.name,
      plan_id: selectedPlan.id,
      billing_cycle: formData.billingCycle,
      has_ecommerce: selectedPlan.hasEcommerce,
      whatsapp_mode: formData.ownWhatsapp ? 'own_number' : selectedPlan.hasWhatsappOption ? 'platform_number' : 'none',
      database_name: `tenant_${randomCode.toLowerCase()}`,
      status: 'active',
      valid_until: validUntil,
      due_amount: 0,
      created_at: new Date().toISOString().split('T')[0]
    };

    state.stores = [newStore, ...state.stores];
    this.saveState(state);
    return newStore;
  }

  // Renew or upgrade / downgrade an existing store's subscription
  renewOrUpgradeStore(shopCode, newPlanId, newBillingCycle, useOwnWhatsapp = false) {
    const state = this.getState();
    const plan = state.plans.find((p) => p.id === newPlanId) || state.plans[0];

    const daysToAdd = newBillingCycle === 'monthly' ? 30 : newBillingCycle === 'quarterly' ? 90 : newBillingCycle === 'half_yearly' ? 180 : 365;
    const now = new Date();
    now.setDate(now.getDate() + daysToAdd);
    const validUntil = now.toISOString().split('T')[0];

    state.stores = state.stores.map((s) => {
      if (s.shop_code.toUpperCase() === shopCode.toUpperCase()) {
        return {
          ...s,
          plan_name: plan.name,
          plan_id: plan.id,
          billing_cycle: newBillingCycle,
          has_ecommerce: plan.hasEcommerce,
          whatsapp_mode: useOwnWhatsapp ? 'own_number' : plan.hasWhatsappOption ? 'platform_number' : 'none',
          status: 'active',
          valid_until: validUntil,
          due_amount: 0
        };
      }
      return s;
    });

    this.saveState(state);
    return state.stores.find((s) => s.shop_code.toUpperCase() === shopCode.toUpperCase());
  }

  // Toggle ecommerce status
  toggleEcommerce(shopCode) {
    const state = this.getState();
    let updatedState = null;
    state.stores = state.stores.map((s) => {
      if (s.shop_code === shopCode) {
        updatedState = !s.has_ecommerce;
        return { ...s, has_ecommerce: updatedState };
      }
      return s;
    });
    this.saveState(state);
    return updatedState;
  }

  // Settle due payment & extend validity
  settleDuePayment(shopCode, months = 3) {
    const state = this.getState();
    const now = new Date();
    now.setDate(now.getDate() + (months * 30));
    const validUntil = now.toISOString().split('T')[0];

    state.stores = state.stores.map((s) => {
      if (s.shop_code.toUpperCase() === shopCode.toUpperCase()) {
        return {
          ...s,
          due_amount: 0,
          status: 'active',
          valid_until: validUntil
        };
      }
      return s;
    });
    this.saveState(state);
    return state.stores.find((s) => s.shop_code.toUpperCase() === shopCode.toUpperCase());
  }

  // Add category
  addCategory(cat) {
    const state = this.getState();
    const id = 'cat-' + Date.now();
    const newCat = { id, ...cat };
    state.categories = [...state.categories, newCat];
    this.saveState(state);
    return newCat;
  }

  // Delete category
  deleteCategory(catId) {
    const state = this.getState();
    state.categories = state.categories.filter((c) => c.id !== catId);
    state.subcategories = state.subcategories.filter((s) => s.categoryId !== catId);
    this.saveState(state);
  }

  // Add subcategory
  addSubcategory(sub) {
    const state = this.getState();
    const id = 'sub-' + Date.now();
    const newSub = { id, ...sub };
    state.subcategories = [...state.subcategories, newSub];
    this.saveState(state);
    return newSub;
  }

  // Delete subcategory
  deleteSubcategory(subId) {
    const state = this.getState();
    state.subcategories = state.subcategories.filter((s) => s.id !== subId);
    this.saveState(state);
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;

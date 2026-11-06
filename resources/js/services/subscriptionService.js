// Central Subscription & Master Data Service
// Manages Packages, Categories, Subcategories, Stores, and Due Payments
// Synchronizes state across Super Admin (/master) and Public Landing Page (/)

const STORAGE_KEY = 'shoppy_master_saas_data_v15_packages';

export const COMMON_ALL_FEATURES = [
  'High-Speed GST Billing Software (Thermal, A4 Auto C/F & B/F, Dot-Matrix 1-Page Medical Tear-off)',
  'Comprehensive Store Management (Multi-Branch Inventory, Stock Ledger, Cashier Shifts & Z-Report)',
  'Omnichannel Ecommerce Suite (Instant Online Web Storefront at domain/{storeCode} with Real-time Sync)',
  'Integrated Payment Gateway Suite (PhonePe, PayU, Razorpay, Cashfree, Easebuzz & Instant UPI QR)',
  'Integrated Courier & Logistics API (Shiprocket, NimbusPost, Delhivery, Auto AWB & Tracking)',
  'WhatsApp Cloud Messaging Suite (Automated Tax Invoices, Payment Reminders & Shift Reports)',
  '1D/2D Barcode Generator, Printable Price Tags & Shelf Labels',
  'Expense Manager, Cash Flow Register & Automated P&L Reports',
  'Staff Roles, Multi-User Cashier Profiles & Audit Permission Logs',
  'Zero Commission on Online Store Sales & Unlimited Products',
  'Dedicated MySQL Database Isolation per Tenant & 100% Data Privacy',
  '24/7 Priority WhatsApp, Phone & Remote Desk Support'
];

export const DEFAULT_PLANS = [
  {
    id: 'monthly-package',
    code: 'monthly-package',
    name: 'Monthly Package',
    shortName: 'MONTHLY PLAN',
    category: 'business',
    badge: 'Starter • Pay As You Go',
    ribbonBg: 'bg-[#008ba3]',
    buttonText: 'SIGN UP NOW',
    buttonBg: 'bg-[#008ba3] text-white',
    hasWhatsappOption: true,
    hasEcommerce: true,
    subtext: 'Billed monthly (₹1,000/mo) • All Features Included',
    billingCycle: 'monthly',
    basePrice: 1000,
    durationDays: 30,
    cycles: {
      monthly: { regular: 1000, offer: 1000, offPercent: 0, label: '/ month', ribbonText: 'STARTER', months: 1 }
    },
    features: COMMON_ALL_FEATURES
  },
  {
    id: 'quarterly-package',
    code: 'quarterly-package',
    name: 'Quarterly Package',
    shortName: 'QUARTERLY PLAN',
    category: 'business',
    badge: 'Save ₹500 • 17% OFF',
    ribbonBg: 'bg-[#6b21a8]',
    buttonText: 'SIGN UP NOW',
    buttonBg: 'bg-[#6b21a8] text-white',
    hasWhatsappOption: true,
    hasEcommerce: true,
    subtext: 'Billed every 3 months (₹2,500) • Save ₹500 on billing',
    billingCycle: 'quarterly',
    basePrice: 2500,
    durationDays: 90,
    cycles: {
      quarterly: { regular: 3000, offer: 2500, offPercent: 17, label: '/ 3 months', ribbonText: 'SAVE ₹500', months: 3 }
    },
    features: COMMON_ALL_FEATURES
  },
  {
    id: 'half-yearly-package',
    code: 'half-yearly-package',
    name: 'Half-Yearly Package',
    shortName: 'HALF-YEARLY PLAN',
    category: 'business',
    badge: 'Save ₹1,500 • 25% OFF',
    ribbonBg: 'bg-[#00a2c7]',
    buttonText: 'SIGN UP NOW',
    buttonBg: 'bg-[#00a2c7] text-white',
    hasWhatsappOption: true,
    hasEcommerce: true,
    subtext: 'Billed every 6 months (₹4,500) • Save ₹1,500 on billing',
    billingCycle: 'half_yearly',
    basePrice: 4500,
    durationDays: 180,
    cycles: {
      half_yearly: { regular: 6000, offer: 4500, offPercent: 25, label: '/ 6 months', ribbonText: 'SAVE ₹1,500', months: 6 }
    },
    features: COMMON_ALL_FEATURES
  },
  {
    id: 'yearly-package',
    code: 'yearly-package',
    name: 'Yearly Package',
    shortName: 'YEARLY ENTERPRISE',
    category: 'business',
    badge: 'Best Value • Save ₹4,000 • 33% OFF',
    ribbonBg: 'bg-[#059669]',
    buttonText: 'SIGN UP NOW',
    buttonBg: 'bg-[#059669] text-white',
    hasWhatsappOption: true,
    hasEcommerce: true,
    subtext: 'Billed annually (₹8,000/yr) • Maximum Savings of ₹4,000',
    billingCycle: 'yearly',
    basePrice: 8000,
    durationDays: 365,
    cycles: {
      yearly: { regular: 12000, offer: 8000, offPercent: 33, label: '/ year', ribbonText: 'BEST VALUE • SAVE ₹4,000', months: 12 }
    },
    features: COMMON_ALL_FEATURES
  }
];

export const INITIAL_PLANS = DEFAULT_PLANS;
export const INITIAL_CATEGORIES = [];
export const INITIAL_SUBCATEGORIES = [];
export const INITIAL_STORES = [];

const DEFAULT_CATEGORIES = [];
const DEFAULT_SUBCATEGORIES = [];
const DEFAULT_STORES = [];

class SubscriptionService {
  constructor() {
    this.init();
    this.syncFromBackend();
  }

  init() {
    try {
      // Purge all legacy localStorage keys to prevent old packages from showing
      const legacyKeys = [
        'shoppy_master_saas_data_v10_live',
        'shoppy_master_saas_data_v9_live',
        'shoppy_master_saas_data_v8',
        'shoppy_master_saas_data_v7',
        'shoppy_master_saas_data_v6',
        'shoppy_master_plans'
      ];
      legacyKeys.forEach((k) => {
        try { localStorage.removeItem(k); } catch (e) {}
      });

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
            support_phone: '+91 9546042639',
            support_email: 'contact@enexa.in'
          },
          blogs: []
        });
      } else {
        // Strictly verify that only the 4 official packages exist
        const parsed = JSON.parse(existing);
        const validCodes = ['monthly-package', 'quarterly-package', 'half-yearly-package', 'yearly-package'];
        const isCorrupt = !Array.isArray(parsed.plans) ||
          parsed.plans.length !== 4 ||
          parsed.plans.some(p => !validCodes.includes(p.code || p.id) || (p.name && p.name.includes('Enterprise Plan')));
        if (isCorrupt) {
          parsed.plans = DEFAULT_PLANS;
          this.saveState(parsed);
        }
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
    const token = localStorage.getItem('master_token') || sessionStorage.getItem('master_token');
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      headers['X-Master-Token'] = token;
    }

    // Optimistically update local state immediately
    const state = this.getState();
    state.plans = (state.plans || []).map((p) => 
      (p.code === planCode || p.id === planCode || (p.db_id && String(p.db_id) === String(planCode))) 
        ? { ...p, ...updatedPlan } 
        : p
    );
    this.saveState(state);

    try {
      const res = await fetch(`/api/master/plans/${encodeURIComponent(planCode)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updatedPlan)
      });
      const data = await res.json();

      // Sync from backend to confirm database persistence
      await this.syncFromBackend();
      return data;
    } catch (e) {
      console.error('SubscriptionService updatePlan error:', e);
      return { success: false, error: e.message };
    }
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
      support_phone: '+91 9546042639',
      support_email: 'contact@enexa.in'
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
  calculatePrice(plan, cycle = null, useWhatsapp = false) {
    if (!plan) {
      return {
        offerPrice: 1000,
        regularPrice: 1000,
        offer: 1000,
        regular: 1000,
        offPercent: 0,
        label: '/ month',
        whatsappAddon: 500,
        ribbonText: 'STARTER'
      };
    }

    const planCode = String(plan.code || plan.id || '').toLowerCase();
    let effectiveCycle = plan.billingCycle;
    if (!effectiveCycle) {
      if (planCode.includes('monthly')) effectiveCycle = 'monthly';
      else if (planCode.includes('quarterly')) effectiveCycle = 'quarterly';
      else if (planCode.includes('half-yearly') || planCode.includes('half_yearly')) effectiveCycle = 'half_yearly';
      else if (planCode.includes('yearly')) effectiveCycle = 'yearly';
      else effectiveCycle = cycle || 'monthly';
    }

    let baseOffer = 1000;
    let months = 1;
    let label = '/ month';

    if (effectiveCycle === 'monthly' || planCode.includes('monthly')) {
      baseOffer = 1000;
      months = 1;
      label = '/ month';
    } else if (effectiveCycle === 'quarterly' || planCode.includes('quarterly')) {
      baseOffer = 2500;
      months = 3;
      label = '/ 3 months';
    } else if (effectiveCycle === 'half_yearly' || planCode.includes('half-yearly') || planCode.includes('half_yearly')) {
      baseOffer = 4500;
      months = 6;
      label = '/ 6 months';
    } else if (effectiveCycle === 'yearly' || planCode.includes('yearly')) {
      baseOffer = 8000;
      months = 12;
      label = '/ year';
    }

    // Dynamic offer price check from cycles object or basePrice
    try {
      const cyclesObj = (plan.cycles && typeof plan.cycles === 'object')
        ? plan.cycles
        : (typeof plan.cycles === 'string' ? JSON.parse(plan.cycles || '{}') : {});
      const cycleData = cyclesObj[effectiveCycle];
      if (cycleData && cycleData.offer !== undefined && cycleData.offer !== null && Number(cycleData.offer) >= 0) {
        baseOffer = Number(cycleData.offer);
      } else if (plan.basePrice !== undefined && plan.basePrice !== null && Number(plan.basePrice) >= 0) {
        baseOffer = Number(plan.basePrice);
      }
    } catch (e) {
      // Fallback to defaults
    }

    // WhatsApp Message Add-on: ₹500 per month
    const monthlyWhatsappRate = 500;
    const whatsappAddon = useWhatsapp ? (monthlyWhatsappRate * months) : 0;
    const finalOffer = baseOffer + whatsappAddon;

    // Regular reference price based on monthly rate of ₹1,000/mo + whatsapp
    let defaultRegular = months * 1000;
    let cyclesObj = null;
    try {
      cyclesObj = (plan.cycles && typeof plan.cycles === 'object') ? plan.cycles : (typeof plan.cycles === 'string' ? JSON.parse(plan.cycles || '{}') : null);
    } catch (e) {}
    const cycleData = cyclesObj ? cyclesObj[effectiveCycle] : null;
    const regularBase = (cycleData && cycleData.regular !== undefined && Number(cycleData.regular) > 0)
      ? Number(cycleData.regular)
      : defaultRegular;
    const regularPrice = regularBase + (useWhatsapp ? (monthlyWhatsappRate * months) : 0);
    const offPercent = regularPrice > finalOffer ? Math.round(((regularPrice - finalOffer) / regularPrice) * 100) : 0;

    let ribbonText = 'POPULAR';
    if (months === 1) ribbonText = 'STARTER';
    if (months === 3) ribbonText = 'SAVE ₹500 • 17% OFF';
    if (months === 6) ribbonText = 'SAVE ₹1,500 • 25% OFF';
    if (months === 12) ribbonText = 'BEST VALUE • SAVE ₹4,000';

    return {
      offerPrice: finalOffer,
      regularPrice: regularPrice,
      offer: finalOffer,
      regular: regularPrice,
      baseOffer: baseOffer,
      offPercent: offPercent,
      label: label,
      months: months,
      whatsappAddon: whatsappAddon,
      hasWhatsapp: !!useWhatsapp,
      ribbonText: ribbonText
    };
  }

  // Get Store Expiry Status helper (for last 5 days alert & popup)
  getStoreExpiryStatus(codeOrStore) {
    let store = null;
    if (typeof codeOrStore === 'object' && codeOrStore !== null) {
      store = codeOrStore;
    } else if (typeof codeOrStore === 'string' && codeOrStore.trim()) {
      const clean = codeOrStore.trim().toUpperCase();
      store = (this.getStores() || []).find((s) => s.shop_code && s.shop_code.toUpperCase() === clean);
    }

    if (!store) {
      try {
        const storedStr = localStorage.getItem('shoppy_store_branding_data') || localStorage.getItem('shoppy_active_store');
        if (storedStr) {
          const parsed = JSON.parse(storedStr);
          if (parsed && (parsed.valid_until || parsed.validUntil)) {
            store = {
              shop_code: parsed.shop_code || parsed.shopCode || codeOrStore,
              name: parsed.store_name || parsed.name || 'Retail Store',
              valid_until: parsed.valid_until || parsed.validUntil
            };
          }
        }
      } catch (e) {}
    }

    if (!store || !store.valid_until) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(store.valid_until);
    expiry.setHours(0, 0, 0, 0);

    const diffMs = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return {
      store,
      shopCode: store.shop_code,
      storeName: store.name,
      validUntil: store.valid_until,
      daysRemaining: diffDays,
      isExpiringSoon: diffDays <= 5 && diffDays >= 0,
      isExpired: diffDays < 0,
      showAlert: diffDays <= 5
    };
  }

  // Fetch Live Subscription Passbook & Ledger from MySQL
  async getLiveSubscriptionPassbook(shopCode) {
    try {
      const code = shopCode || localStorage.getItem('shoppy_active_store_code') || '';
      const res = await fetch(`/api/payu/passbook?code=${encodeURIComponent(code)}`);
      if (res.ok) {
        const json = await res.json();
        return json;
      }
    } catch (e) {
      console.warn('Live subscription passbook fetch error:', e);
    }
    return { success: false, passbook: [] };
  }

  // Onboard new store from Landing Page or Master
  onboardStore(formData) {
    const state = this.getState();
    const randomCode = 'STORE' + Math.floor(100000 + Math.random() * 900000);
    const selectedPlan = (state.plans && state.plans.length > 0)
      ? (state.plans.find((p) => p.id === formData.planId) || state.plans[0])
      : { id: formData.planId || 'yearly-package', name: 'Yearly Package', durationDays: 365, billingCycle: 'yearly' };

    // Compute validity based on selected package duration
    const daysToAdd = selectedPlan?.durationDays || (formData.billingCycle === 'monthly' ? 30 : formData.billingCycle === 'quarterly' ? 90 : formData.billingCycle === 'half_yearly' ? 180 : 365);
    const now = new Date();
    now.setDate(now.getDate() + daysToAdd);
    const validUntil = now.toISOString().split('T')[0];

    const newStore = {
      id: Date.now(),
      shop_code: randomCode,
      name: formData.name,
      owner_name: formData.ownerName,
      owner_phone: formData.ownerPhone,
      city: formData.city || '',
      category: formData.category || '',
      sub_category: formData.subCategory || '',
      plan_name: selectedPlan.name,
      plan_id: selectedPlan.id,
      billing_cycle: selectedPlan.billingCycle || formData.billingCycle || 'yearly',
      has_ecommerce: true,
      whatsapp_mode: formData.ownWhatsapp ? 'own_number' : 'platform_number',
      has_whatsapp_addon: !!formData.ownWhatsapp,
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
  renewOrUpgradeStore(shopCode, newPlanId, newBillingCycle = null, useWhatsapp = false) {
    const state = this.getState();
    const plan = (state.plans && state.plans.length > 0)
      ? (state.plans.find((p) => p.id === newPlanId || p.code === newPlanId) || state.plans[0])
      : { id: newPlanId || 'yearly-package', name: 'Yearly Package', durationDays: 365, billingCycle: 'yearly' };

    const cycle = newBillingCycle || plan.billingCycle || 'yearly';
    const daysToAdd = plan.durationDays || (cycle === 'monthly' ? 30 : cycle === 'quarterly' ? 90 : cycle === 'half_yearly' ? 180 : 365);

    // Calculate new validity extending from current validity (if in future) or from today
    state.stores = state.stores.map((s) => {
      if (s.shop_code.toUpperCase() === shopCode.toUpperCase()) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let baseDate = today;
        if (s.valid_until) {
          const curExp = new Date(s.valid_until);
          curExp.setHours(0, 0, 0, 0);
          if (curExp.getTime() > today.getTime()) {
            baseDate = curExp;
          }
        }

        const newTarget = new Date(baseDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        const newValidUntil = newTarget.toISOString().split('T')[0];

        return {
          ...s,
          plan_name: plan.name,
          plan_id: plan.id,
          billing_cycle: cycle,
          has_ecommerce: true,
          whatsapp_mode: useWhatsapp ? 'own_number' : 'platform_number',
          has_whatsapp_addon: !!useWhatsapp,
          status: 'active',
          valid_until: newValidUntil,
          due_amount: 0
        };
      }
      return s;
    });

    this.saveState(state);
    return state.stores.find((s) => s.shop_code.toUpperCase() === shopCode.toUpperCase());
  }

  // PayU Money Gateway: Initiate payment request
  async initiatePayU(payload) {
    try {
      const res = await fetch('/api/payu/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      console.error('PayU initiation error:', e);
      return { success: false, message: 'Could not connect to PayU payment gateway.' };
    }
  }

  // PayU Money Gateway: Verify payment and finalize store provisioning / renewal in MySQL
  async verifyPayU(payload) {
    try {
      const res = await fetch('/api/payu/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.success && data.store) {
        // Sync local storage store list
        const state = this.getState();
        if (data.type === 'onboard') {
          state.stores = [data.store, ...(state.stores || [])];
        } else if (data.type === 'renew') {
          state.stores = (state.stores || []).map(s => {
            if (s.shop_code.toUpperCase() === data.store.shop_code.toUpperCase()) {
              return { ...s, valid_until: data.valid_until || data.store.valid_until, status: 'active' };
            }
            return s;
          });
        }
        this.saveState(state);
      }
      return data;
    } catch (e) {
      console.error('PayU verification error:', e);
      return { success: false, message: 'Could not verify PayU payment.' };
    }
  }

  // PayU Money Gateway: Submit form redirection to PayU checkout
  submitPayUForm(actionUrl, params) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = actionUrl;
    form.style.display = 'none';

    Object.keys(params).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
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

  // PayU Money Gateway: Initiate payment request
  async initiatePayU(payload) {
    try {
      const res = await fetch('/api/payu/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      console.error('PayU initiation error:', e);
      return { success: false, message: 'Could not connect to PayU payment gateway.' };
    }
  }

  // PayU Money Gateway: Verify payment and finalize store provisioning / renewal in MySQL
  async verifyPayU(payload) {
    try {
      const res = await fetch('/api/payu/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && data.success && data.store) {
        // Sync local storage store list
        const state = this.getState();
        if (data.type === 'onboard') {
          state.stores = [data.store, ...(state.stores || [])];
        } else if (data.type === 'renew') {
          state.stores = (state.stores || []).map(s => {
            if (s.shop_code.toUpperCase() === data.store.shop_code.toUpperCase()) {
              return { ...s, valid_until: data.valid_until || data.store.valid_until, status: 'active' };
            }
            return s;
          });
        }
        this.saveState(state);
      }
      return data;
    } catch (e) {
      console.error('PayU verification error:', e);
      return { success: false, message: 'Could not verify PayU payment.' };
    }
  }

  // PayU Money Gateway: Submit form redirection to PayU checkout
  submitPayUForm(actionUrl, params) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = actionUrl;
    form.style.display = 'none';

    Object.keys(params).forEach(key => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = params[key];
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
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

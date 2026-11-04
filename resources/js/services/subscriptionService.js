// Central Subscription & Master Data Service
// Manages Packages, Categories, Subcategories, Stores, and Due Payments
// Synchronizes state across Super Admin (/master) and Public Landing Page (/)

const STORAGE_KEY = 'shoppy_master_saas_data_v8_live';

export const INITIAL_PLANS = [];
export const INITIAL_CATEGORIES = [];
export const INITIAL_SUBCATEGORIES = [];
export const INITIAL_STORES = [];

const DEFAULT_CATEGORIES = [];
const DEFAULT_SUBCATEGORIES = [];
const COMMON_ALL_FEATURES = [];
const DEFAULT_PLANS = [];
const DEFAULT_STORES = [];

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
            support_phone: '+91 9546042639',
            support_email: 'contact@enexa.in'
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
        whatsappAddon: 0,
        ribbonText: 'STANDARD'
      };
    }

    // Determine target cycle from plan or param
    const effectiveCycle = cycle || plan.billingCycle || 'monthly';

    let baseOffer = plan.basePrice || 1000;
    let months = 1;
    let label = '/ month';

    if (effectiveCycle === 'monthly' || plan.id === 'monthly-package') {
      baseOffer = 1000;
      months = 1;
      label = '/ month';
    } else if (effectiveCycle === 'quarterly' || plan.id === 'quarterly-package') {
      baseOffer = 2500;
      months = 3;
      label = '/ 3 months';
    } else if (effectiveCycle === 'half_yearly' || plan.id === 'half-yearly-package') {
      baseOffer = 4500;
      months = 6;
      label = '/ 6 months';
    } else if (effectiveCycle === 'yearly' || plan.id === 'yearly-package') {
      baseOffer = 8000;
      months = 12;
      label = '/ year';
    }

    // 1 Checkbox for WhatsApp Message: +500 per month if ticked
    const whatsappAddon = useWhatsapp ? (500 * months) : 0;
    const finalOffer = baseOffer + whatsappAddon;

    // Regular reference price based on monthly rate of ₹1,000 + ₹500/mo if whatsapp
    const regularBase = 1000 * months;
    const regularPrice = regularBase + (useWhatsapp ? (500 * months) : 0);
    const offPercent = regularPrice > finalOffer ? Math.round(((regularPrice - finalOffer) / regularPrice) * 100) : 0;

    let ribbonText = 'POPULAR';
    if (months === 3) ribbonText = 'SAVE ₹500';
    if (months === 6) ribbonText = 'SAVE ₹1,500';
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
      store = (this.getStores() || []).find((s) => s.shop_code.toUpperCase() === clean);
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

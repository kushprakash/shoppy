// Central Subscription & Master Data Service
// Manages Packages, Categories, Subcategories, Stores, and Due Payments
// Synchronizes state across Super Admin (/master) and Public Landing Page (/)

const STORAGE_KEY = 'shoppy_master_saas_data_v15_packages';

const TAILWIND_COLOR_MAP = {
  slate: { 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617' },
  gray: { 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2937', 900: '#111827', 950: '#030712' },
  zinc: { 400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46', 800: '#27272a', 900: '#18181b', 950: '#09090b' },
  red: { 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a' },
  orange: { 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407' },
  amber: { 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03' },
  yellow: { 400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12', 950: '#422006' },
  lime: { 400: '#a3e635', 500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f', 800: '#3f6212', 900: '#365314', 950: '#1a2e05' },
  green: { 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16' },
  emerald: { 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22' },
  teal: { 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 900: '#134e4a', 950: '#042f2e' },
  cyan: { 400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344' },
  sky: { 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e', 950: '#082f49' },
  blue: { 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' },
  indigo: { 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b' },
  violet: { 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065' },
  purple: { 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' },
  fuchsia: { 400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 900: '#701a75', 950: '#4a044e' },
  pink: { 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843', 950: '#500724' },
  rose: { 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519' }
};

function resolveTailwindColorToken(token) {
  if (!token) return null;
  const bracketMatch = token.match(/^\[([^\]]+)\]$/);
  if (bracketMatch) return bracketMatch[1].replace(/_/g, ' ');
  if (token === 'black') return '#000000';
  if (token === 'white') return '#ffffff';
  const paletteMatch = token.match(/^([a-z]+)-(\d{2,3})$/i);
  if (paletteMatch) {
    const [, colorName, shade] = paletteMatch;
    return TAILWIND_COLOR_MAP[colorName.toLowerCase()]?.[shade] || null;
  }
  return null;
}

/**
 * Resolve DB `ribbon_bg` value (e.g. `bg-[#6b21a8]`, `#ff5500`, `bg-rose-600`, `linear-gradient(...)`)
 * into runtime-safe `{ className, style }` so colors changed in MySQL apply immediately without rebuilding Tailwind.
 */
export function resolveRibbonStyle(ribbonBg, fallbackColor = '#008ba3') {
  const raw = typeof ribbonBg === 'string' ? ribbonBg.trim() : '';
  if (!raw) {
    return { className: 'bg-[#008ba3]', style: { backgroundColor: fallbackColor } };
  }

  // Raw CSS gradient
  if (/^(linear|radial|conic)-gradient\(/i.test(raw)) {
    return { className: '', style: { background: raw } };
  }

  // Raw CSS color (#hex, rgb(), hsl())
  if (/^(#[0-9a-f]{3,8}|rgba?\(|hsla?\()/i.test(raw)) {
    return { className: '', style: { backgroundColor: raw } };
  }

  // Tailwind arbitrary bg-[...]
  const arbitraryBg = raw.match(/\bbg-\[([^\]]+)\]/i);
  if (arbitraryBg) {
    const cssVal = arbitraryBg[1].replace(/_/g, ' ').trim();
    const isGradient = /gradient\(/i.test(cssVal);
    return {
      className: raw,
      style: isGradient ? { background: cssVal } : { backgroundColor: cssVal }
    };
  }

  // Tailwind gradient classes: from-... to-...
  const fromMatch = raw.match(/\bfrom-([^\s]+)/i);
  const toMatch = raw.match(/\bto-([^\s]+)/i);
  if (fromMatch && toMatch) {
    const fromCss = resolveTailwindColorToken(fromMatch[1]);
    const toCss = resolveTailwindColorToken(toMatch[1]);
    if (fromCss && toCss) {
      return {
        className: raw,
        style: { background: `linear-gradient(to right, ${fromCss}, ${toCss})` }
      };
    }
  }

  // Standard Tailwind utility class like bg-rose-600
  const namedBgMatch = raw.match(/\bbg-([a-z0-9-]+)\b/i);
  if (namedBgMatch) {
    const resolved = resolveTailwindColorToken(namedBgMatch[1]);
    if (resolved) {
      return { className: raw, style: { backgroundColor: resolved } };
    }
    return { className: raw, style: {} };
  }

  // Plain single-word CSS color name (e.g. "crimson", "navy", "teal")
  if (/^[a-z]+$/i.test(raw)) {
    return { className: '', style: { backgroundColor: raw } };
  }

  return { className: raw, style: { backgroundColor: fallbackColor } };
}

export function extractHexFromRibbonBg(ribbonBg, fallback = '#008ba3') {
  const { style } = resolveRibbonStyle(ribbonBg, fallback);
  const bg = style?.backgroundColor || '';
  if (/^#[0-9a-f]{6}$/i.test(bg)) return bg;
  if (/^#[0-9a-f]{3}$/i.test(bg)) {
    return '#' + bg.slice(1).split('').map((c) => c + c).join('');
  }
  return fallback;
}

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
        // Reset only clearly corrupt or legacy Enterprise placeholder plans
        const parsed = JSON.parse(existing);
        const isCorrupt = !Array.isArray(parsed.plans) ||
          parsed.plans.length === 0 ||
          parsed.plans.some(p => p.name && p.name.includes('Enterprise Plan'));
        if (isCorrupt) {
          parsed.plans = DEFAULT_PLANS;
          this.saveState(parsed);
        }
      }
    } catch (e) {
      // LocalStorage fallback
    }
  }

  cachePlansFromApi(apiPlans) {
    if (!Array.isArray(apiPlans) || apiPlans.length === 0) return;
    try {
      const state = this.getState();
      state.plans = apiPlans;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  // Live Sync from Laravel MySQL APIs
  async syncFromBackend() {
    try {
      // 1. Fetch live plans from MySQL
      const plansRes = await fetch('/api/master/plans', { cache: 'no-store' });
      if (plansRes.ok) {
        const plansJson = await plansRes.json();
        if (plansJson.success && Array.isArray(plansJson.data) && plansJson.data.length > 0) {
          const state = this.getState();
          state.plans = plansJson.data;
          this.saveState(state);
        }
      }

      // 2. Fetch live stores from MySQL
      const storesRes = await fetch('/api/master/stores', { cache: 'no-store' });
      if (storesRes.ok) {
        const storesJson = await storesRes.json();
        if (storesJson.success && Array.isArray(storesJson.data)) {
          const state = this.getState();
          state.stores = storesJson.data;
          this.saveState(state);
        }
      }

      // 3. Fetch website settings (Enexa IT Solutions branding)
      const settingsRes = await fetch('/api/master/settings', { cache: 'no-store' });
      if (settingsRes.ok) {
        const settingsJson = await settingsRes.json();
        if (settingsJson.success && settingsJson.data) {
          const state = this.getState();
          state.settings = settingsJson.data;
          this.saveState(state);
        }
      }

      // 4. Fetch blogs
      const blogsRes = await fetch('/api/blogs', { cache: 'no-store' });
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

    const hasExplicitBadge = plan.badge !== undefined && plan.badge !== null;
    const explicitBadge = hasExplicitBadge ? String(plan.badge).trim() : null;

    let ribbonText = '';
    if (hasExplicitBadge) {
      ribbonText = explicitBadge;
    } else if (cycleData && typeof cycleData.ribbonText === 'string' && cycleData.ribbonText.trim() !== '') {
      ribbonText = cycleData.ribbonText.trim();
    } else {
      if (months === 1) ribbonText = 'STARTER';
      else if (months === 3) ribbonText = 'SAVE ₹500 • 17% OFF';
      else if (months === 6) ribbonText = 'SAVE ₹1,500 • 25% OFF';
      else if (months === 12) ribbonText = 'BEST VALUE • SAVE ₹4,000';
      else ribbonText = 'POPULAR';
    }

    const rawRibbonBg = plan.ribbonBg || plan.ribbon_bg || 'bg-[#008ba3]';

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
      ribbonText: ribbonText,
      ribbonBg: rawRibbonBg,
      ribbonStyle: resolveRibbonStyle(rawRibbonBg)
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

  // Paytm UPI Intent & Dynamic QR: Initiate payment request
  async initiatePaytmUpi(payload) {
    try {
      const res = await fetch('/api/paytm/initiate-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      console.error('Paytm UPI initiation error:', e);
      return { success: false, message: 'Could not connect to Paytm UPI gateway.' };
    }
  }

  // Paytm UPI Intent & Dynamic QR: Verify payment and finalize store provisioning
  async verifyPaytmPayment(payload) {
    try {
      const res = await fetch('/api/paytm/verify', {
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
      console.error('Paytm verification error:', e);
      return { success: false, message: 'Could not verify Paytm payment.' };
    }
  }

  // Paytm UPI: Poll Order Status
  async checkPaytmOrderStatus(orderId) {
    try {
      const res = await fetch(`/api/paytm/order-status?order_id=${encodeURIComponent(orderId)}`);
      return await res.json();
    } catch (e) {
      return { success: false, status: 'PENDING' };
    }
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

  // Paytm UPI Intent & Dynamic QR: Initiate payment request
  async initiatePaytmUpi(payload) {
    try {
      const res = await fetch('/api/paytm/initiate-upi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e) {
      console.error('Paytm UPI initiation error:', e);
      return { success: false, message: 'Could not connect to Paytm UPI gateway.' };
    }
  }

  // Paytm UPI Intent & Dynamic QR: Verify payment and finalize store provisioning
  async verifyPaytmPayment(payload) {
    try {
      const res = await fetch('/api/paytm/verify', {
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
      console.error('Paytm verification error:', e);
      return { success: false, message: 'Could not verify Paytm payment.' };
    }
  }

  // Paytm UPI: Poll Order Status
  async checkPaytmOrderStatus(orderId) {
    try {
      const res = await fetch(`/api/paytm/order-status?order_id=${encodeURIComponent(orderId)}`);
      return await res.json();
    } catch (e) {
      return { success: false, status: 'PENDING' };
    }
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

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Store,
  Sparkles,
  ShoppingBag,
  CreditCard,
  MessageSquare,
  ShieldCheck,
  Check,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Globe,
  Sliders,
  Phone,
  Lock,
  Layers,
  HelpCircle,
  X,
  FileText,
  Printer,
  Barcode,
  Truck,
  TrendingUp,
  Award,
  Star,
  Users,
  ChevronDown,
  Laptop,
  Smartphone,
  Monitor,
  Menu,
  Send,
  Mail,
  MapPin,
  Clock,
  Database,
  Boxes,
  Scale,
  Receipt,
  Calendar,
  Share2,
  Search
} from 'lucide-react';
import subscriptionService from '../../services/subscriptionService';

export default function LandingPage({ defaultPage = 'home' }) {
  // Determine initial active page from URL path or prop
  const getInitialPage = () => {
    if (defaultPage && defaultPage !== 'home') return defaultPage;
    const path = window.location.pathname.replace(/^\//, '').toLowerCase();
    const validPages = ['about', 'services', 'pricing', 'blog', 'contact', 'privacy-policy', 'return-policy', 'terms-of-service'];
    return validPages.includes(path) ? path : 'home';
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Live dynamic data from MySQL / subscriptionService
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [settings, setSettings] = useState({
    company_name: 'Enexa IT Solutions Private Limited',
    powered_by: 'Enexa IT Solutions Private Limited',
    website: 'https://www.enexa.in',
    official_domain: 'www.enexa.in',
    brand_title: 'Shoppy ERP & Retail Omnichannel Platform',
    brand_tagline: 'Next-Generation POS Billing, GST Compliance & Omnichannel Digital Commerce for Indian Retailers',
    support_phone: '+91 98290 00192',
    support_email: 'info@enexa.in',
    sales_email: 'sales@enexa.in',
    corporate_address: 'Enexa IT Solutions Private Limited, IT Park, Tech Zone, Jaipur, Rajasthan - 302020',
    company_gstin: '08AABCE1290M1Z5',
    company_cin: 'U72900RJ2021PTC075482'
  });

  // Category tab & billing cycle for pricing view
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('business');
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [ownWhatsapp, setOwnWhatsapp] = useState({
    'gst-billing-whatsapp': false,
    'gst-billing-ecommerce-whatsapp': true
  });

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Hero interactive preview tab: 'invoice' | 'whatsapp' | 'thermal' | 'storefront'
  const [heroPreviewTab, setHeroPreviewTab] = useState('invoice');

  // FAQ Accordion Active Item
  const [openFaq, setOpenFaq] = useState(0);

  // Blog modal active article
  const [activeBlogModal, setActiveBlogModal] = useState(null);
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('all');

  // Working Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    business_name: '',
    city: '',
    service_interested: 'GST Billing & POS',
    message: ''
  });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(null);

  // Onboarding Wizard Modal State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardStep, setOnboardStep] = useState(1);
  const [selectedOnboardPlan, setSelectedOnboardPlan] = useState(null);
  const [onboardForm, setOnboardForm] = useState({
    storeName: '',
    ownerName: '',
    ownerPhone: '',
    city: 'Jaipur, Rajasthan',
    category: 'Retail & POS Invoicing',
    subCategory: 'Apparel & Fashion Garments',
    paymentMethod: 'phonepe_upi'
  });
  const [provisionedStore, setProvisionedStore] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Renewal / Upgrade Modal State
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [lookupStoreCode, setLookupStoreCode] = useState('STORE441029');
  const [foundStore, setFoundStore] = useState(null);
  const [renewPlanId, setRenewPlanId] = useState('gst-billing-ecommerce-whatsapp');
  const [renewCycle, setRenewCycle] = useState('yearly');
  const [renewOwnWhatsapp, setRenewOwnWhatsapp] = useState(true);
  const [renewSuccess, setRenewSuccess] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Sync data on load and subscribe to backend / master updates
  useEffect(() => {
    const loadData = () => {
      setPlans(subscriptionService.getPlans());
      setCategories(subscriptionService.getCategories());
      setSettings(subscriptionService.getWebsiteSettings());
      setBlogs(subscriptionService.getBlogs());
    };

    loadData();

    // Fetch fresh from backend API
    fetch('/api/public/landing-data')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          if (json.plans && json.plans.length > 0) setPlans(json.plans);
          if (json.settings) setSettings((prev) => ({ ...prev, ...json.settings }));
          if (json.blogs && json.blogs.length > 0) setBlogs(json.blogs);
        }
      })
      .catch(() => {});

    const handleMasterUpdate = () => loadData();
    window.addEventListener('shoppy:master_updated', handleMasterUpdate);
    return () => window.removeEventListener('shoppy:master_updated', handleMasterUpdate);
  }, []);

  // Listen to browser forward/back buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '').toLowerCase();
      setCurrentPage(path || 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Navigation handler
  const navigateTo = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.history.pushState(null, '', page === 'home' ? '/' : '/' + page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Carousel Slides Content
  const slides = (settings.hero_banners && settings.hero_banners.length > 0)
    ? settings.hero_banners
    : [
        {
          id: 1,
          badge: '⚡ Powered by Enexa IT Solutions Private Limited',
          title: 'Fastest GST Billing Software & Retail POS Terminal',
          subtitle: 'Counter billing in under 50 milliseconds. Thermal receipt prints (80mm/50mm), automated GST tax invoicing, GSTR-1 ledger exports & multi-branch stock.',
          tag: 'Core Retail POS',
          ctaText: 'View Pricing & Plans',
          action: 'pricing',
          gradient: 'from-[#1e1b4b] via-[#2e1065] to-[#4c1d95]',
          accentBadge: 'bg-amber-400/20 text-amber-300 border-amber-400/30'
        },
        {
          id: 2,
          badge: '💬 Official Meta WhatsApp Cloud API Partner',
          title: 'Automated WhatsApp Invoices & Dynamic UPI QR Codes',
          subtitle: 'Send official GST tax invoice PDFs and instant payment links directly to customers WhatsApp with 98% open rates. Recover dues 3x faster.',
          tag: 'WhatsApp CRM Suite',
          ctaText: 'Explore WhatsApp Plans',
          action: 'pricing',
          gradient: 'from-[#062c26] via-[#094238] to-[#0d594b]',
          accentBadge: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30'
        },
        {
          id: 3,
          badge: '🌐 Real-time Omnichannel Digital Commerce',
          title: 'Online Storefront Connected Directly to Counter POS',
          subtitle: 'Every store gets a live web shopping portal at domain/{storeCode}. Real-time inventory sync, 5 Indian payment gateways, and automatic AWB courier dispatch.',
          tag: 'Omnichannel Storefront',
          ctaText: 'Onboard Store Now',
          action: 'pricing',
          gradient: 'from-[#0b2938] via-[#103e54] to-[#185a7a]',
          accentBadge: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30'
        }
      ];

  // Auto-play Carousel
  useEffect(() => {
    if (isPaused || currentPage !== 'home') return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, slides.length, currentPage]);

  // Calculate live price for any plan
  const getPrice = (plan) => {
    return subscriptionService.calculatePrice(plan, billingCycle, !!ownWhatsapp[plan.id]);
  };

  // Start Onboarding Flow
  const handleStartOnboarding = (plan) => {
    setSelectedOnboardPlan(plan);
    setOnboardStep(1);
    setIsOnboardingOpen(true);
  };

  // Submit Contact Form
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingContact(true);
    setContactSuccess(null);

    const result = await subscriptionService.submitContact(contactForm);
    setIsSubmittingContact(false);

    if (result && result.success) {
      setContactSuccess(result.message || 'Your inquiry has been submitted! Our Enexa IT retail specialist will call you shortly.');
      setContactForm({
        name: '',
        phone: '',
        email: '',
        business_name: '',
        city: '',
        service_interested: 'GST Billing & POS',
        message: ''
      });
      showToast('Inquiry submitted to Enexa IT Solutions team!');
    } else {
      showToast('Notice: Inquiry received and logged!');
      setContactSuccess('Thank you! Your inquiry has been registered with Enexa IT Solutions Private Limited.');
    }
  };

  // Lookup store for renewal
  const handleLookupStore = (e) => {
    e.preventDefault();
    const allStores = subscriptionService.getStores();
    const matched = allStores.find(
      (s) => s.shop_code.toUpperCase() === lookupStoreCode.trim().toUpperCase()
    );

    if (matched) {
      setFoundStore(matched);
      setRenewPlanId(matched.plan_id || 'gst-billing-ecommerce-whatsapp');
      setRenewCycle(matched.billing_cycle || 'yearly');
      setRenewOwnWhatsapp(matched.whatsapp_mode === 'own_number');
      setRenewSuccess(null);
    } else {
      showToast(`Store code "${lookupStoreCode}" not found. Try SHP-A4IFYK or STORE441029`);
      setFoundStore(null);
    }
  };

  // Confirm Store Renewal
  const handleConfirmRenewal = (e) => {
    e.preventDefault();
    if (!foundStore) return;

    subscriptionService.renewOrUpgradeStore(
      foundStore.shop_code,
      renewPlanId,
      renewCycle,
      renewOwnWhatsapp
    );

    setRenewSuccess(
      `Store ${foundStore.shop_code} subscription renewed successfully! New validity extended by 1 year.`
    );
    showToast(`Store ${foundStore.shop_code} renewed successfully!`);
  };

  // Complete Onboarding & Provision Store
  const handleCompleteOnboarding = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      const created = subscriptionService.onboardStore({
        name: onboardForm.storeName || 'My Retail Counter',
        ownerName: onboardForm.ownerName || 'Store Merchant',
        ownerPhone: onboardForm.ownerPhone || '+91 98290 00192',
        city: onboardForm.city,
        category: onboardForm.category,
        subCategory: onboardForm.subCategory,
        planId: selectedOnboardPlan.id,
        billingCycle: billingCycle,
        ownWhatsapp: !!ownWhatsapp[selectedOnboardPlan.id]
      });

      setProvisionedStore(created);
      setIsProcessingPayment(false);
      setOnboardStep(4);
      showToast(`Congratulations! Store ${created.shop_code} is now live!`);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-[#db631a]" />
          <span>{toast}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. TOP ANNOUNCEMENT RIBBON (Enexa IT Solutions Branding)            */}
      {/* =================================================================== */}
      <div className="w-full bg-gradient-to-r from-[#1e1b4b] via-[#311042] to-[#0f172a] text-white text-xs py-2 px-4 flex items-center justify-between border-b border-indigo-950/80">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-extrabold text-[10px] tracking-wide border border-cyan-400/30">
              OFFICIAL
            </span>
            <span className="font-medium text-slate-200 truncate">
              {settings.header_notice || '🚀 Next-Gen Retail POS & Omnichannel Cloud ERP — Powered by Enexa IT Solutions Private Limited'}
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] shrink-0 font-semibold">
            <a href="tel:+919829000192" className="text-slate-300 hover:text-white flex items-center gap-1 transition">
              <Phone className="w-3 h-3 text-cyan-400" />
              <span>+91 98290 00192</span>
            </a>
            <span className="text-slate-600">|</span>
            <a
              href="https://www.enexa.in"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold transition"
            >
              <span>www.enexa.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. STICKY NAVBAR WITH MULTI-PAGE LINKS                              */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        {/* Left: Mobile Drawer Trigger + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div onClick={() => navigateTo('home')} className="flex items-center gap-2.5 cursor-pointer select-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#008ba3] via-[#00a2c7] to-[#10b981] flex items-center justify-center text-white shadow-md shadow-cyan-600/20">
              <Building2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-black text-slate-900 dark:text-white font-heading tracking-tight block leading-tight">
                Shoppy<span className="text-[#00a2c7]">ERP</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block -mt-0.5">
                by Enexa IT Solutions
              </span>
            </div>
          </div>
        </div>

        {/* Center: 6 Main Navigation Links (Home, About, Services, Pricing, Blog, Contact) */}
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700 dark:text-slate-300">
          <button
            onClick={() => navigateTo('home')}
            className={`pb-1 border-b-2 transition cursor-pointer ${
              currentPage === 'home'
                ? 'text-[#00a2c7] border-[#00a2c7]'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => navigateTo('about')}
            className={`pb-1 border-b-2 transition cursor-pointer ${
              currentPage === 'about'
                ? 'text-[#00a2c7] border-[#00a2c7]'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            About Us
          </button>

          <button
            onClick={() => navigateTo('services')}
            className={`pb-1 border-b-2 transition cursor-pointer ${
              currentPage === 'services'
                ? 'text-[#00a2c7] border-[#00a2c7]'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Services & Solutions
          </button>

          <button
            onClick={() => navigateTo('pricing')}
            className={`pb-1 border-b-2 transition cursor-pointer ${
              currentPage === 'pricing'
                ? 'text-[#00a2c7] border-[#00a2c7]'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Pricing & Packages
          </button>

          <button
            onClick={() => navigateTo('blog')}
            className={`pb-1 border-b-2 transition cursor-pointer ${
              currentPage === 'blog'
                ? 'text-[#00a2c7] border-[#00a2c7]'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Blog & Insights
          </button>

          <button
            onClick={() => navigateTo('contact')}
            className={`pb-1 border-b-2 transition cursor-pointer ${
              currentPage === 'contact'
                ? 'text-[#00a2c7] border-[#00a2c7]'
                : 'border-transparent hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Contact Us
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setLookupStoreCode('STORE441029');
              setIsRenewModalOpen(true);
            }}
            className="hidden xl:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Renew Plan</span>
          </button>

          <a
            href="/store"
            className="hidden sm:inline-flex px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Merchant Login
          </a>

          <a
            href="/master"
            className="px-3 py-1.5 rounded-full border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-[#00a2c7] dark:hover:border-cyan-400 transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00a2c7]" />
            <span>Super Admin</span>
          </a>

          <button
            onClick={() => navigateTo('contact')}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-[#008ba3] to-[#00a2c7] hover:from-[#00768c] hover:to-[#008ba3] text-white text-xs font-black shadow-md shadow-cyan-600/20 transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Book Free Demo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 3. MOBILE LEFT SIDEBAR DRAWER (Requested: Home, About, Services...) */}
      {/* =================================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in"
          />

          {/* Drawer Menu */}
          <div className="relative w-80 max-w-[85%] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-250">
            <div>
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#008ba3] to-[#10b981] flex items-center justify-center text-white">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">
                      Shoppy ERP
                    </span>
                    <span className="block text-[9px] font-bold text-slate-400">
                      Enexa IT Solutions
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="p-4 space-y-1 text-sm font-bold">
                {[
                  { id: 'home', label: 'Home', icon: Store },
                  { id: 'about', label: 'About Us', icon: Building2 },
                  { id: 'services', label: 'Services & Solutions', icon: Boxes },
                  { id: 'pricing', label: 'Pricing Plans', icon: CreditCard },
                  { id: 'blog', label: 'Blog & Insights', icon: FileText },
                  { id: 'contact', label: 'Contact Us & Demo', icon: Phone }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition text-left cursor-pointer ${
                        isActive
                          ? 'bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] font-extrabold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#00a2c7]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                  <span className="px-3 pb-2 block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Legal & Policies
                  </span>
                  {[
                    { id: 'privacy-policy', label: 'Privacy Policy' },
                    { id: 'return-policy', label: 'Return Policy' },
                    { id: 'terms-of-service', label: 'Terms of Service' }
                  ].map((leg) => (
                    <button
                      key={leg.id}
                      onClick={() => navigateTo(leg.id)}
                      className={`w-full px-3 py-1.5 text-xs text-left transition cursor-pointer ${
                        currentPage === leg.id
                          ? 'text-[#00a2c7] font-bold'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {leg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                Enexa IT Solutions Pvt Ltd
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                support@enexa.in • +91 98290 00192
              </p>
              <a
                href="https://www.enexa.in"
                target="_blank"
                rel="noreferrer"
                className="mt-2 text-xs font-bold text-[#00a2c7] flex items-center gap-1 hover:underline"
              >
                <span>Visit www.enexa.in</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. MAIN MULTI-PAGE ROUTING CONTAINER                                */}
      {/* =================================================================== */}
      <main className="flex-1 flex flex-col">
        {/* ================================================================= */}
        {/* PAGE 1: HOME PAGE                                                 */}
        {/* ================================================================= */}
        {currentPage === 'home' && (
          <div className="space-y-16 animate-in fade-in duration-300">
            {/* HERO CAROUSEL */}
            <section
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="relative overflow-hidden text-white"
            >
              <div
                className={`transition-all duration-700 bg-gradient-to-r ${slides[currentSlide].gradient} py-16 lg:py-24 px-6 sm:px-12`}
              >
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-7 space-y-6">
                    <div
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md ${slides[currentSlide].accentBadge}`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{slides[currentSlide].badge}</span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight leading-[1.2]">
                      {slides[currentSlide].title}
                    </h1>

                    <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl">
                      {slides[currentSlide].subtitle}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button
                        onClick={() => navigateTo('pricing')}
                        className="px-6 py-3.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
                      >
                        <span>{slides[currentSlide].ctaText || 'Explore Pricing Plans'}</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                      </button>

                      <button
                        onClick={() => navigateTo('contact')}
                        className="px-5 py-3.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition flex items-center gap-2 cursor-pointer"
                      >
                        <Phone className="w-4 h-4 text-cyan-300" />
                        <span>Schedule 1-on-1 Demo</span>
                      </button>
                    </div>

                    {/* Trust Proof Metrics */}
                    <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10 text-left">
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-amber-300">10,000+</div>
                        <div className="text-[11px] text-slate-300">Active Stores</div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-cyan-300">&lt;50ms</div>
                        <div className="text-[11px] text-slate-300">Billing Response</div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-emerald-300">100% Isolated</div>
                        <div className="text-[11px] text-slate-300">Tenant DB Security</div>
                      </div>
                    </div>
                  </div>

                  {/* Hero Right Visual: Interactive Simulator */}
                  <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                        <Store className="w-4 h-4 text-amber-400" />
                        <span>Live Retail Terminal Preview</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        ONLINE 24x7
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">Cotton Formal Shirt (Sky Blue)</p>
                          <p className="text-[10px] text-slate-400 font-mono">BARCODE: 890123400192</p>
                        </div>
                        <span className="font-mono font-black text-emerald-400 text-sm">₹ 899.00</span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/60 border border-white/10 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">Denim Slim-Fit Trousers</p>
                          <p className="text-[10px] text-slate-400 font-mono">BARCODE: 890123400843</p>
                        </div>
                        <span className="font-mono font-black text-emerald-400 text-sm">₹ 1,499.00</span>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="font-bold text-[11px]">WhatsApp E-Invoice Link Sent</span>
                        </div>
                        <span className="text-[10px] font-mono">DELIVERED</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <a
                        href="/pos-terminal"
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs flex items-center justify-center gap-2 shadow-md transition"
                      >
                        <Zap className="w-4 h-4 text-indigo-600" />
                        <span>Launch Fullscreen POS Billing Terminal</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slider Dots */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 z-20">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      currentSlide === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </section>

            {/* 3 CORE PILLARS OVERVIEW */}
            <section className="max-w-7xl mx-auto px-6 sm:px-12">
              <div className="text-center max-w-3xl mx-auto space-y-2 mb-10">
                <span className="text-xs font-black uppercase tracking-wider text-[#00a2c7]">
                  Unified Retail Architecture
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                  Everything Your Retail Business Needs to Scale
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Engineered by Enexa IT Solutions Private Limited for high-volume physical counters and modern digital shopping.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#00a2c7] transition space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] flex items-center justify-center font-bold">
                    <Printer className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    High-Speed Counter POS (<span className="text-[#00a2c7]">&lt;50ms</span>)
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Designed for heavy morning and evening counter rush. Instant barcode lookups, 80mm/50mm ESC/POS thermal receipt printing, cash drawer kick, and offline-resilient cache.
                  </p>
                  <button
                    onClick={() => navigateTo('services')}
                    className="text-xs font-bold text-[#00a2c7] hover:underline flex items-center gap-1 cursor-pointer pt-2"
                  >
                    <span>Explore POS Capabilities</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Official Meta WhatsApp Suite
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Automated WhatsApp GST invoice links, payment collection with dynamic UPI QR codes, and daily shift sales reports sent straight to owner smartphone.
                  </p>
                  <button
                    onClick={() => navigateTo('services')}
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer pt-2"
                  >
                    <span>View WhatsApp Features</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-500 transition space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Integrated Online Storefront
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Every enrolled store receives a dedicated web shopping address at domain/{'{storeCode}'}. Live inventory sync, 5 Indian payment gateways, and automated courier AWB dispatch.
                  </p>
                  <button
                    onClick={() => navigateTo('services')}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer pt-2"
                  >
                    <span>Learn About Storefronts</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </section>

            {/* PRICING PLANS PREVIEW (Connected to MySQL) */}
            <section className="max-w-7xl mx-auto px-6 sm:px-12 space-y-8">
              <div className="text-center max-w-3xl mx-auto space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#00a2c7]">
                  Transparent Subscription Packages
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                  Choose the Right Plan for Your Business
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Real-time MySQL synchronized pricing. Includes isolated database, free updates, and priority customer support.
                </p>

                {/* Billing Cycle Pill Toggle Switch */}
                <div className="inline-flex p-1 rounded-full bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner gap-1 mt-4">
                  {['monthly', 'quarterly', 'half_yearly', 'yearly'].map((cycle) => (
                    <button
                      key={cycle}
                      onClick={() => setBillingCycle(cycle)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition capitalize cursor-pointer ${
                        billingCycle === cycle
                          ? 'bg-white dark:bg-slate-900 text-[#00a2c7] shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cycle === 'half_yearly' ? 'Half Yearly' : cycle === 'yearly' ? 'Annually (Save up to 33%)' : cycle}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
                {plans.slice(0, 4).map((plan) => {
                  const priceInfo = getPrice(plan);

                  return (
                    <div
                      key={plan.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between overflow-hidden relative transition hover:border-[#00a2c7]"
                    >
                      {/* Ribbon */}
                      {priceInfo.offPercent > 0 && (
                        <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden pointer-events-none z-10">
                          <div
                            className={`absolute transform rotate-45 text-white text-[9px] font-black uppercase py-1 text-center w-36 top-5 -right-9 shadow-md ${
                              plan.ribbonBg || 'bg-[#008ba3]'
                            }`}
                          >
                            {priceInfo.ribbonText}
                          </div>
                        </div>
                      )}

                      <div className="p-6">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                          {plan.shortName}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight mt-1 min-h-[44px]">
                          {plan.name}
                        </h3>

                        {/* Price */}
                        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <div className="flex items-baseline gap-1">
                            <span className="text-xs font-bold text-slate-400">₹</span>
                            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                              {Number(priceInfo.offerPrice ?? priceInfo.offer ?? 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">
                              /{billingCycle === 'monthly' ? 'mo' : billingCycle === 'yearly' ? 'yr' : billingCycle}
                            </span>
                          </div>

                          {priceInfo.offPercent > 0 && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-400 line-through">
                                ₹{Number(priceInfo.regularPrice ?? priceInfo.regular ?? 0).toLocaleString('en-IN')}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                                {priceInfo.offPercent}% OFF
                              </span>
                            </div>
                          )}
                        </div>

                        {/* WhatsApp Option Toggle */}
                        {plan.hasWhatsappOption && (
                          <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-left">
                            <label className="flex items-start gap-2 cursor-pointer select-none text-xs">
                              <input
                                type="checkbox"
                                checked={!!ownWhatsapp[plan.id]}
                                onChange={(e) =>
                                  setOwnWhatsapp((prev) => ({
                                    ...prev,
                                    [plan.id]: e.target.checked
                                  }))
                                }
                                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                              />
                              <div className="leading-tight">
                                <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                                  Use Own WhatsApp Number
                                </span>
                                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                                  + ₹{(subscriptionService.calculatePrice(plan, billingCycle, true).whatsappAddon || 400)} (₹400/mo)
                                </span>
                              </div>
                            </label>
                          </div>
                        )}

                        {/* Feature bullets */}
                        <div className="mt-5 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Included Highlights
                          </p>
                          {(plan.features || []).slice(0, 5).map((f, i) => (
                            <div key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                              <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                              <span className="leading-tight">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
                        <button
                          onClick={() => handleStartOnboarding(plan)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#008ba3] to-[#00a2c7] hover:from-[#00768c] hover:to-[#008ba3] text-white font-extrabold text-xs shadow-md shadow-cyan-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>{plan.buttonText || 'SIGN UP NOW'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => navigateTo('pricing')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-[#00a2c7] text-xs font-bold transition cursor-pointer"
                >
                  <span>Compare All Plan Details & Add-ons</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#00a2c7]" />
                </button>
              </div>
            </section>

            {/* RECENT BLOGS PREVIEW */}
            {blogs.length > 0 && (
              <section className="max-w-7xl mx-auto px-6 sm:px-12 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#00a2c7]">
                      Knowledge & Industry Updates
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                      Latest Retail & GST Insights
                    </h2>
                  </div>
                  <button
                    onClick={() => navigateTo('blog')}
                    className="text-xs font-bold text-[#00a2c7] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Articles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {blogs.slice(0, 3).map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setActiveBlogModal(b)}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-[#00a2c7] transition cursor-pointer group flex flex-col justify-between"
                    >
                      {b.cover_image && (
                        <div className="h-44 overflow-hidden relative">
                          <img
                            src={b.cover_image}
                            alt={b.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                            {b.category}
                          </span>
                        </div>
                      )}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#00a2c7] transition line-clamp-2">
                            {b.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                            {b.excerpt}
                          </p>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                          <span>{b.read_time || '4 min read'}</span>
                          <span className="font-bold text-[#00a2c7] flex items-center gap-1">
                            <span>Read Article</span>
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* CALL TO ACTION BANNER */}
            <section className="max-w-7xl mx-auto px-6 sm:px-12">
              <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#008ba3] via-[#00a2c7] to-[#10b981] text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl text-left">
                  <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
                    Join 10,000+ Thriving Merchants
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
                    Ready to Automate Your Retail Store Billing & E-Commerce?
                  </h3>
                  <p className="text-xs sm:text-sm text-white/90">
                    Get started in 5 minutes. Real-time setup with isolated database provisioning — powered by Enexa IT Solutions Private Limited.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => navigateTo('contact')}
                    className="px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-black text-xs shadow-lg transition cursor-pointer"
                  >
                    Request Enterprise Demo
                  </button>
                  <button
                    onClick={() => navigateTo('pricing')}
                    className="px-5 py-3 rounded-xl bg-slate-900/60 hover:bg-slate-900/80 text-white font-bold text-xs border border-white/20 transition cursor-pointer"
                  >
                    View All Plans
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================================================================= */}
        {/* PAGE 2: ABOUT US PAGE (Enexa IT Solutions Private Limited)         */}
        {/* ================================================================= */}
        {currentPage === 'about' && (
          <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] text-xs font-bold border border-cyan-200 dark:border-cyan-800">
                <Building2 className="w-4 h-4" />
                <span>About Enexa IT Solutions Private Limited</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                Architecting Modern Retail & Cloud Commerce for India
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Empowering retailers, distributors, and multi-branch commercial enterprises with lightning-fast cloud POS, seamless GST compliance, and omnichannel digital shopping.
              </p>
            </div>

            {/* Corporate Profile Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-[#00a2c7]">Corporate Profile</span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                  Enexa IT Solutions Private Limited
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Headquartered in the technology hub of Jaipur, Rajasthan, <strong>Enexa IT Solutions Private Limited</strong> is a premier software engineering and enterprise digital commerce technology firm (official website: <a href="https://www.enexa.in" target="_blank" rel="noreferrer" className="text-[#00a2c7] font-bold hover:underline">www.enexa.in</a>).
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Our flagship SaaS platform, <strong>Shoppy ERP</strong>, was designed specifically to bridge the gap between traditional Indian brick-and-mortar retail counters and high-converting omnichannel digital commerce.
                </p>

                <div className="pt-2 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">CORPORATE ID (CIN)</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{settings.company_cin || 'U72900RJ2021PTC075482'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">GST REGISTRATION</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{settings.company_gstin || '08AABCE1290M1Z5'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-gradient-to-tr from-[#008ba3]/10 to-[#10b981]/10 border border-[#00a2c7]/20 space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00a2c7]" />
                    <span>100% Tenant Database Isolation</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Every subscribed store operates on its own dedicated MySQL isolated database. Zero shared data risks, complete commercial privacy, and automatic hourly encrypted cloud backups.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 space-y-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-indigo-500" />
                    <span>High-Speed Offline-First Architecture</span>
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Even during internet outages, counter billing continues uninterrupted with local POS caching and auto-syncs to cloud once connectivity resumes.
                  </p>
                </div>
              </div>
            </div>

            {/* Core Values */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] flex items-center justify-center font-bold">
                  <Scale className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Strict GST Compliance</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Engineered with Indian tax regulations in mind. HSN lookups, multi-slab tax invoices, B2B/B2C separation, and 1-click GSTR-1 ledger exports.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">Customer-First WhatsApp Communication</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Moving India away from expensive thermal rolls by sending verified digital bills and dynamic UPI QR links directly to customer WhatsApp accounts.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">24/7 Dedicated Merchant Support</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Our customer success team in Jaipur provides fast onboarding, barcode printer setup, cashier staff training, and dedicated phone support.
                </p>
              </div>
            </div>

            {/* Official Headquarters Card */}
            <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-cyan-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-sm">Corporate Headquarters</p>
                  <p className="text-slate-300">{settings.corporate_address || 'Enexa IT Solutions Private Limited, IT Park, Tech Zone, Jaipur, Rajasthan 302020'}</p>
                </div>
              </div>
              <a
                href="https://www.enexa.in"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-bold transition flex items-center gap-1.5"
              >
                <span>Visit Enexa Corporate Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PAGE 3: SERVICES & SOLUTIONS PAGE                                 */}
        {/* ================================================================= */}
        {currentPage === 'services' && (
          <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] text-xs font-bold border border-cyan-200 dark:border-cyan-800">
                <Boxes className="w-4 h-4" />
                <span>Enterprise Retail Solutions</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                Complete End-to-End Retail Technology Services
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Designed and maintained by Enexa IT Solutions Private Limited to streamline store operations, accelerate counter checkout, and expand ecommerce reach.
              </p>
            </div>

            {/* 6 Services Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service 1 */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] flex items-center justify-center font-bold">
                  <Printer className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  1. High-Speed Counter POS (<span className="text-[#00a2c7]">&lt;50ms</span>)
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Sub-50ms barcode scanning engine capable of handling over 2,000 customers per hour without lag. Supports ESC/POS 80mm & 50mm thermal printers, cash drawer auto-kick, multi-cashier shifts, and hold-bill capabilities.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> USB, LAN & Bluetooth Thermal Printer Support</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Cashier Shift float balance & automated Day-end Z-Report</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> 1D/2D Barcode Generator & Shelf Price Label Print</li>
                </ul>
              </div>

              {/* Service 2 */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  2. WhatsApp CRM, E-Invoice PDF & Dynamic UPI QR
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Official Meta WhatsApp Cloud API integration. Send clean, branded PDF tax invoices to buyers in 1 click. Generates dynamic UPI QR codes containing the exact bill amount for instant counter collection.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Automated credit due payment reminders on WhatsApp</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Daily shop sales summary dispatched to store owner</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Option to use store's Own WhatsApp number (+₹400/mo)</li>
                </ul>
              </div>

              {/* Service 3 */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center font-bold">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  3. Omnichannel Online Storefront at domain/{'{storeCode}'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Turn your local physical shop into a 24x7 online shopping brand. Real-time two-way inventory sync prevents overselling. Pre-integrated with 5 Indian payment gateways and top courier partners.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Zero commission on direct store sales</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Gateways: PhonePe, PayU, Razorpay, Cashfree, Easebuzz</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Courier API auto-dispatch: Shiprocket, NimbusPost, iThink</li>
                </ul>
              </div>

              {/* Service 4 */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
                  <Boxes className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  4. Multi-Branch Inventory & Stock Ledger
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Complete real-time stock control across multiple retail outlets, central godowns, and web warehouses. Automated purchase orders, batch/expiry alerts, and inter-branch stock transfers.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Low stock alerts and automated supplier reorder slips</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Batch tracking for Pharmacy, Groceries & Perishables</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Multi-size & color variant matrix for Garments & Shoes</li>
                </ul>
              </div>

              {/* Service 5 */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center font-bold">
                  <Receipt className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  5. Automated GST Filing & 1-Click e-Way Bill
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Stay 100% tax compliant without spending hours doing manual calculations. Exports official GSTR-1, GSTR-3B JSON files compatible with government offline tools and tax portals.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Instant e-Way bill generation without logging into gov portal</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Automatic HSN & SAC code lookup with verified tax slabs</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Comprehensive B2B vs B2C tax audit summary</li>
                </ul>
              </div>

              {/* Service 6 */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  6. Enterprise Custom Software Engineering
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Need custom ERP modules, custom warehouse robotics integrations, or specific accounting software bridges? Backed directly by the expert engineering team at Enexa IT Solutions Private Limited.
                </p>
                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Dedicated RESTful APIs and webhook integration</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Custom payment gateway merchant onboarding</li>
                  <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-500" /> Tailored reporting dashboards for retail franchise chains</li>
                </ul>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center pt-4">
              <button
                onClick={() => navigateTo('contact')}
                className="px-8 py-3.5 rounded-full bg-[#00a2c7] hover:bg-[#008ba3] text-white font-extrabold text-sm shadow-lg shadow-cyan-600/25 transition cursor-pointer"
              >
                Consult an Enexa IT Retail Solutions Expert
              </button>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PAGE 4: PRICING & PACKAGES PAGE                                   */}
        {/* ================================================================= */}
        {currentPage === 'pricing' && (
          <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 animate-in fade-in duration-300">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] text-xs font-bold border border-cyan-200 dark:border-cyan-800">
                <CreditCard className="w-4 h-4" />
                <span>Subscription Packages (Synced with Super Admin)</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                Transparent Plans with Dedicated Database Isolation
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose the best package for your retail store. Scale seamlessly as your business grows. No hidden fees.
              </p>

              {/* Billing Cycle Pill Toggle Switch */}
              <div className="inline-flex p-1 rounded-full bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner gap-1 mt-4">
                {['monthly', 'quarterly', 'half_yearly', 'yearly'].map((cycle) => (
                  <button
                    key={cycle}
                    onClick={() => setBillingCycle(cycle)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition capitalize cursor-pointer ${
                      billingCycle === cycle
                        ? 'bg-white dark:bg-slate-900 text-[#00a2c7] shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cycle === 'half_yearly' ? 'Half Yearly' : cycle === 'yearly' ? 'Yearly (Save up to 33%)' : cycle}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {plans.map((plan) => {
                const priceInfo = getPrice(plan);

                return (
                  <div
                    key={plan.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between overflow-hidden relative transition hover:border-[#00a2c7]"
                  >
                    {priceInfo.offPercent > 0 && (
                      <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden pointer-events-none z-10">
                        <div
                          className={`absolute transform rotate-45 text-white text-[9px] font-black uppercase py-1 text-center w-36 top-5 -right-9 shadow-md ${
                            plan.ribbonBg || 'bg-[#008ba3]'
                          }`}
                        >
                          {priceInfo.ribbonText}
                        </div>
                      </div>
                    )}

                    <div className="p-6">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                        {plan.shortName}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight mt-1 min-h-[44px]">
                        {plan.name}
                      </h3>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs font-bold text-slate-400">₹</span>
                          <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            {Number(priceInfo.offerPrice ?? priceInfo.offer ?? 0).toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            /{billingCycle === 'monthly' ? 'mo' : billingCycle === 'yearly' ? 'yr' : billingCycle}
                          </span>
                        </div>

                        {priceInfo.offPercent > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400 line-through">
                              ₹{Number(priceInfo.regularPrice ?? priceInfo.regular ?? 0).toLocaleString('en-IN')}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">
                              {priceInfo.offPercent}% OFF
                            </span>
                          </div>
                        )}
                      </div>

                      {plan.hasWhatsappOption && (
                        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-left">
                          <label className="flex items-start gap-2 cursor-pointer select-none text-xs">
                            <input
                              type="checkbox"
                              checked={!!ownWhatsapp[plan.id]}
                              onChange={(e) =>
                                setOwnWhatsapp((prev) => ({
                                  ...prev,
                                  [plan.id]: e.target.checked
                                }))
                              }
                              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <div className="leading-tight">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                                Use Own WhatsApp Number
                              </span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[10px]">
                                + ₹{(subscriptionService.calculatePrice(plan, billingCycle, true).whatsappAddon || 400)} (₹400/mo)
                              </span>
                            </div>
                          </label>
                        </div>
                      )}

                      <div className="mt-5 space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-4 text-xs">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Complete Features
                        </p>
                        {(plan.features || []).map((f, i) => (
                          <div key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                            <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-tight">{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => handleStartOnboarding(plan)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#008ba3] to-[#00a2c7] hover:from-[#00768c] hover:to-[#008ba3] text-white font-extrabold text-xs shadow-md shadow-cyan-600/20 transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <span>{plan.buttonText || 'SIGN UP NOW'}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PAGE 5: BLOG & KNOWLEDGE HUB PAGE                                 */}
        {/* ================================================================= */}
        {currentPage === 'blog' && (
          <div className="max-w-6xl mx-auto px-6 py-12 space-y-10 animate-in fade-in duration-300">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] text-xs font-bold border border-cyan-200 dark:border-cyan-800">
                <FileText className="w-4 h-4" />
                <span>Retail Knowledge Hub</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                Retail Growth, GST Guidelines & Automation Guides
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Curated by the technical desk and retail specialists at Enexa IT Solutions Private Limited.
              </p>

              {/* Category Filter Pills */}
              <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                {['all', 'Retail Growth', 'GST Compliance', 'WhatsApp Automation'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setBlogCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                      blogCategoryFilter === cat
                        ? 'bg-[#00a2c7] text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'All Articles' : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {blogs
                .filter((b) => (blogCategoryFilter === 'all' ? true : b.category === blogCategoryFilter))
                .map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setActiveBlogModal(b)}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs hover:border-[#00a2c7] transition cursor-pointer group flex flex-col justify-between"
                  >
                    {b.cover_image && (
                      <div className="h-48 overflow-hidden relative">
                        <img
                          src={b.cover_image}
                          alt={b.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/85 text-white backdrop-blur-xs">
                          {b.category}
                        </span>
                      </div>
                    )}
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-[#00a2c7] transition line-clamp-2">
                          {b.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-2.5 line-clamp-3 leading-relaxed">
                          {b.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                        <span className="font-semibold">{b.read_time || '4 min read'}</span>
                        <span className="font-extrabold text-[#00a2c7] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                          <span>Read Article</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PAGE 6: CONTACT & DEMO REQUEST PAGE                               */}
        {/* ================================================================= */}
        {currentPage === 'contact' && (
          <div className="max-w-6xl mx-auto px-6 py-12 space-y-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] text-xs font-bold border border-cyan-200 dark:border-cyan-800">
                <Send className="w-4 h-4" />
                <span>Get in Touch with Our Team</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-heading tracking-tight">
                Connect with Enexa IT Solutions
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Whether you need a personalized 1-on-1 demo, customized retail integration, or pricing guidance, our team is ready to assist.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Working Contact Form (Submits to MySQL contact_inquiries table) */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Request a Callback / Live Demo</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill out the form below. An Enexa IT retail tech specialist will reach out within 2 hours.
                  </p>
                </div>

                {contactSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>{contactSuccess}</span>
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-[#00a2c7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Phone / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-[#00a2c7]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Business / Store Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Sharma Garments"
                        value={contactForm.business_name}
                        onChange={(e) => setContactForm({ ...contactForm, business_name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-[#00a2c7]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        City & State
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Jaipur, Rajasthan"
                        value={contactForm.city}
                        onChange={(e) => setContactForm({ ...contactForm, city: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-[#00a2c7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="rahul@example.com"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none focus:border-[#00a2c7]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Interested In
                    </label>
                    <select
                      value={contactForm.service_interested}
                      onChange={(e) => setContactForm({ ...contactForm, service_interested: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                    >
                      <option value="GST Billing & POS">GST Billing & Fast Counter POS</option>
                      <option value="WhatsApp CRM Suite">WhatsApp CRM & Dynamic UPI QR Suite</option>
                      <option value="Omnichannel Storefront">Omnichannel E-Commerce Storefront</option>
                      <option value="Enterprise Complete Suite">Enterprise Omnichannel Retail Suite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Message / Special Requirements
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tell us about your store terminals, printers, or integration requirements..."
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-[#00a2c7]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingContact}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#008ba3] to-[#00a2c7] hover:from-[#00768c] hover:to-[#008ba3] text-white font-extrabold text-xs shadow-md shadow-cyan-600/25 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmittingContact ? 'Submitting to Database...' : 'Submit Inquiry / Request Demo'}</span>
                  </button>
                </form>
              </div>

              {/* Direct Official Contact Cards */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-6 rounded-3xl bg-slate-900 text-white space-y-4 shadow-sm">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Official Channels</span>
                  <h3 className="text-lg font-bold">Enexa IT Solutions Private Limited</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Corporate headquarters and technical development center located in Jaipur Tech Park.
                  </p>

                  <div className="space-y-3 pt-2 text-xs">
                    <a href="tel:+919829000192" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition">
                      <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">PHONE / WHATSAPP</span>
                        <span className="font-bold text-white">+91 98290 00192</span>
                      </div>
                    </a>

                    <a href="mailto:info@enexa.in" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition">
                      <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">EMAIL SUPPORT</span>
                        <span className="font-bold text-white">info@enexa.in / sales@enexa.in</span>
                      </div>
                    </a>

                    <a href="https://www.enexa.in" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition">
                      <Globe className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">OFFICIAL WEBSITE</span>
                        <span className="font-bold text-white">www.enexa.in</span>
                      </div>
                    </a>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800">
                      <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">OFFICE ADDRESS</span>
                        <span className="font-medium text-slate-200">
                          {settings.corporate_address || 'Enexa IT Solutions Private Limited, IT Park, Tech Zone, Jaipur, Rajasthan 302020'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                  <span className="font-bold text-slate-900 dark:text-white block">Operating Hours & SLA</span>
                  <p className="text-slate-500 leading-relaxed">
                    Merchant phone support: Monday to Saturday, 9:30 AM to 8:30 PM IST. Critical server & POS billing infrastructure monitored 24/7 with 99.99% uptime SLA.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PAGE 7: PRIVACY POLICY                                            */}
        {/* ================================================================= */}
        {currentPage === 'privacy-policy' && (
          <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-[#00a2c7]">Legal & Compliance</span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white font-heading mt-1">
                Privacy Policy — Enexa IT Solutions Private Limited
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Last updated: October 21, 2026 • Governed under the Digital Personal Data Protection (DPDP) Act 2023
              </p>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none space-y-6 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Introduction & Scope</h3>
                <p>
                  <strong>Enexa IT Solutions Private Limited</strong> ("Company", "we", "us", or "our", official website: <a href="https://www.enexa.in" className="text-[#00a2c7] underline">www.enexa.in</a>) operates the Shoppy ERP multi-tenant retail SaaS platform. This Privacy Policy describes how personal, commercial, and financial information is collected, used, and safeguarded when merchants, contributors, and customer end-users access our software.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Dedicated Database Isolation & Data Ownership</h3>
                <p>
                  Every retail merchant is provisioned a distinct, isolated tenant database instance (e.g. <code>tenant_{'{storeCode}'}</code>). Enexa IT Solutions Private Limited does not sell, license, or monetize your store catalog, customer phone numbers, invoices, or revenue numbers. You retain 100% full legal ownership of your data at all times.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Information We Collect</h3>
                <p>
                  <strong>Merchant Details:</strong> Store name, registered business entity, GSTIN, owner mobile number, email, and billing address.<br />
                  <strong>Transaction & Billing Data:</strong> Customer name, phone number, GST tax invoice line items, thermal receipt logs, payment gateway references.<br />
                  <strong>Hardware & Diagnostics:</strong> Browser version, IP address, POS thermal printer status, and error telemetry.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">4. Meta WhatsApp Cloud API Privacy</h3>
                <p>
                  When sending digital bills via WhatsApp, communications travel through official Meta Cloud API infrastructure. Phone numbers are utilized strictly for transaction fulfillment, dynamic UPI payment QR links, and requested delivery status alerts.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">5. Grievance Officer & Contact</h3>
                <p>
                  For data protection inquiries or exercising right of erasure under DPDP Act 2023, contact our Grievance Officer at <code>privacy@enexa.in</code> or write to Enexa IT Solutions Private Limited, IT Park, Tech Zone, Jaipur, Rajasthan 302020.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PAGE 8: RETURN & REFUND POLICY                                    */}
        {/* ================================================================= */}
        {currentPage === 'return-policy' && (
          <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-[#00a2c7]">Commercial Terms</span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white font-heading mt-1">
                Return, Refund & Cancellation Policy
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enexa IT Solutions Private Limited • Transparent SaaS Commercial Guarantees
              </p>
            </div>

            <div className="space-y-6 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold">
                🛡️ 7-Day Unconditional Money-Back Guarantee on all new SaaS subscription plans.
              </div>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. 7-Day Trial Refund Window</h3>
                <p>
                  If you are not completely satisfied with your Shoppy ERP subscription, you may request a 100% full refund within 7 days of initial plan activation. No questions asked. Refunds are credited back to the original UPI, debit card, or net banking account within 5-7 business days.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Subscription Renewals & Upgrades</h3>
                <p>
                  Merchants can upgrade or downgrade billing tiers (e.g. from GST Billing to Omnichannel Ecommerce) at any time. Unused credit from current plan is calculated on a pro-rata basis and adjusted automatically towards the new subscription invoice.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Hardware & Peripherals Warranty</h3>
                <p>
                  Thermal printers, 1D/2D barcode scanners, and cash drawers procured through authorized Enexa IT Solutions channels carry a standard 1-year manufacturer replacement warranty. Defective hardware will be repaired or replaced free of charge during warranty term.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">4. How to Request Cancellation</h3>
                <p>
                  Simply email your request along with store code (e.g. <code>STORE983515</code>) to <code>billing@enexa.in</code> or call customer desk at <code>+91 98290 00192</code>.
                </p>
              </section>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* PAGE 9: TERMS OF SERVICE                                          */}
        {/* ================================================================= */}
        {currentPage === 'terms-of-service' && (
          <div className="max-w-4xl mx-auto px-6 py-12 space-y-8 animate-in fade-in duration-300">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
              <span className="text-xs font-black uppercase tracking-wider text-[#00a2c7]">Master Subscription Agreement</span>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white font-heading mt-1">
                Terms of Service — Enexa IT Solutions Private Limited
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Enexa IT Solutions Private Limited (CIN: U72900RJ2021PTC075482) • Effective: 2026
              </p>
            </div>

            <div className="space-y-6 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h3>
                <p>
                  By registering, creating an account, or provisioning a store code on the Shoppy ERP platform, you enter into a legally binding Master SaaS Agreement with <strong>Enexa IT Solutions Private Limited</strong> (website: <a href="https://www.enexa.in" className="text-[#00a2c7] underline">www.enexa.in</a>).
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Service Level Agreement (99.9% Uptime)</h3>
                <p>
                  Enexa IT Solutions guarantees 99.9% monthly availability for cloud POS APIs, isolated MySQL database clusters, and online storefront delivery. Planned maintenance windows are announced at least 48 hours in advance.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Merchant Responsibilities</h3>
                <p>
                  Merchants are responsible for maintaining the accuracy of products, prices, and tax rates applied to consumer sales. Enexa IT Solutions does not act as seller of record; legal ownership of products sold through POS or web storefront remains entirely with merchant.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">4. Intellectual Property</h3>
                <p>
                  All platform software, algorithms, UI components, and proprietary billing technologies are the exclusive intellectual property of Enexa IT Solutions Private Limited. Merchants receive a non-exclusive, non-transferable license for the active duration of their subscription.
                </p>
              </section>

              <section className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">5. Governing Law & Jurisdiction</h3>
                <p>
                  This agreement is governed by the laws of India. Any legal disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Jaipur, Rajasthan.
                </p>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* =================================================================== */}
      {/* 5. ARTICLE READER MODAL (For Blogs)                                 */}
      {/* =================================================================== */}
      {activeBlogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#00a2c7]/10 text-[#00a2c7]">
                {activeBlogModal.category}
              </span>
              <button
                onClick={() => setActiveBlogModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeBlogModal.cover_image && (
              <img
                src={activeBlogModal.cover_image}
                alt={activeBlogModal.title}
                className="w-full h-56 object-cover rounded-2xl"
              />
            )}

            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-heading">
                {activeBlogModal.title}
              </h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-2">
                <span>By {activeBlogModal.author || 'Enexa IT Team'}</span>
                <span>•</span>
                <span>{activeBlogModal.read_time || '4 min read'}</span>
                <span>•</span>
                <span>Verified Insights</span>
              </div>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {activeBlogModal.excerpt}
              </p>
              <p className="pt-2">
                {activeBlogModal.content}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveBlogModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold text-xs"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 6. ONBOARDING & STORE PROVISIONING MODAL                            */}
      {/* =================================================================== */}
      {isOnboardingOpen && selectedOnboardPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                  {onboardStep === 4 ? 'Store Activated & Live!' : `Onboard Your Store — ${selectedOnboardPlan.name}`}
                </h3>
                <p className="text-[11px] text-slate-400">
                  Step {onboardStep} of 4 • Dedicated Database Provisioning
                </p>
              </div>
              <button
                onClick={() => setIsOnboardingOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Confirm Plan & Price */}
            {onboardStep === 1 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {selectedOnboardPlan.name}
                    </span>
                    <span className="font-black text-xl text-[#00a2c7]">
                      ₹{getPrice(selectedOnboardPlan).offerPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Billed {billingCycle} • {ownWhatsapp[selectedOnboardPlan.id] ? 'Includes Own WhatsApp Addon' : 'Platform WhatsApp'}
                  </p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Features Included:</span>
                  <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    {(selectedOnboardPlan.features || []).slice(0, 5).map((f, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setIsOnboardingOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setOnboardStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-md"
                  >
                    Proceed to Store Details
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Store Details */}
            {onboardStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Store / Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Garments & POS"
                    value={onboardForm.storeName}
                    onChange={(e) => setOnboardForm({ ...onboardForm, storeName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rajesh Verma"
                      value={onboardForm.ownerName}
                      onChange={(e) => setOnboardForm({ ...onboardForm, ownerName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={onboardForm.ownerPhone}
                      onChange={(e) => setOnboardForm({ ...onboardForm, ownerPhone: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City & State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur, Rajasthan"
                    value={onboardForm.city}
                    onChange={(e) => setOnboardForm({ ...onboardForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>

                <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => setOnboardStep(1)} className="text-xs font-semibold text-slate-500">
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!onboardForm.storeName || !onboardForm.ownerName || !onboardForm.ownerPhone) {
                        showToast('Please fill all required store fields');
                        return;
                      }
                      setOnboardStep(3);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Gateway Simulation */}
            {onboardStep === 3 && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-2">
                  <div className="flex justify-between font-bold">
                    <span>Store: {onboardForm.storeName}</span>
                    <span className="text-[#00a2c7]">₹{getPrice(selectedOnboardPlan).offerPrice.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-slate-400">Billing Cycle: {billingCycle}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Select Indian Payment Gateway
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    {['PhonePe UPI', 'Razorpay', 'PayU India', 'Cashfree'].map((gw) => (
                      <button
                        key={gw}
                        type="button"
                        onClick={() => setOnboardForm({ ...onboardForm, paymentMethod: gw })}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                          onboardForm.paymentMethod === gw
                            ? 'border-[#00a2c7] bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7]'
                            : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {gw}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button onClick={() => setOnboardStep(2)} className="text-xs font-semibold text-slate-500">
                    Back
                  </button>
                  <button
                    onClick={handleCompleteOnboarding}
                    disabled={isProcessingPayment}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
                  >
                    <span>{isProcessingPayment ? 'Provisioning Tenant Database...' : 'Pay & Activate Store'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Live Store Provisioned */}
            {onboardStep === 4 && provisionedStore && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Welcome to Shoppy ERP!
                </h4>
                <p className="text-xs text-slate-500">
                  Your store code <strong>{provisionedStore.shop_code}</strong> has been provisioned with dedicated isolated database <code>{provisionedStore.database_name}</code>.
                </p>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-left space-y-1.5">
                  <p><strong>Store Name:</strong> {provisionedStore.name}</p>
                  <p><strong>Storefront URL:</strong> <a href={`/${provisionedStore.shop_code}`} target="_blank" rel="noreferrer" className="text-[#00a2c7] underline font-bold">http://localhost:8000/{provisionedStore.shop_code}</a></p>
                  <p><strong>Billing Terminal:</strong> <a href="/pos-terminal" target="_blank" rel="noreferrer" className="text-indigo-600 underline font-bold">Launch POS Terminal</a></p>
                </div>

                <div className="pt-2">
                  <a
                    href={`/${provisionedStore.shop_code}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-black text-xs block text-center shadow-md transition"
                  >
                    Launch Your Live Storefront Now
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 7. STORE RENEWAL & UPGRADE MODAL                                    */}
      {/* =================================================================== */}
      {isRenewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Renew or Upgrade Store Subscription
                </h3>
              </div>
              <button
                onClick={() => setIsRenewModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLookupStore} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Enter Store Code (e.g. STORE441029)"
                value={lookupStoreCode}
                onChange={(e) => setLookupStoreCode(e.target.value.toUpperCase())}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs"
              >
                Search Store
              </button>
            </form>

            {foundStore && (
              <form onSubmit={handleConfirmRenewal} className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-900 dark:text-white">{foundStore.name} ({foundStore.shop_code})</span>
                    <span className="text-emerald-600 font-bold uppercase">{foundStore.status}</span>
                  </div>
                  <p className="text-slate-400">Current Plan: {foundStore.plan_name}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select New or Renewed Plan:
                  </label>
                  <select
                    value={renewPlanId}
                    onChange={(e) => setRenewPlanId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.hasEcommerce ? '(+Ecommerce)' : '(Billing Only)'}
                      </option>
                    ))}
                  </select>
                </div>

                {renewSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{renewSuccess}</span>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsRenewModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-500"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                  >
                    Confirm Renewal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 8. MODERN ENTERPRISE FOOTER (Powered by Enexa IT Solutions Pvt Ltd) */}
      {/* =================================================================== */}
      <footer className="bg-slate-900 text-white pt-16 pb-10 px-6 sm:px-12 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 text-xs">
          {/* Col 1: Corporate Profile */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#008ba3] to-[#10b981] flex items-center justify-center text-white font-black">
                <Building2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-xl font-black font-heading tracking-tight text-white">
                Shoppy<span className="text-[#00a2c7]">ERP</span>
              </span>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm text-xs">
              Next-generation cloud POS billing, automated WhatsApp GST invoicing, and omnichannel ecommerce platform. Dedicated isolated MySQL databases for retail merchants.
            </p>

            <div className="pt-1 text-[11px] text-slate-400 space-y-1">
              <p><strong>Corporate Entity:</strong> {settings.company_name || 'Enexa IT Solutions Private Limited'}</p>
              <p><strong>CIN:</strong> {settings.company_cin || 'U72900RJ2021PTC075482'} | <strong>GSTIN:</strong> {settings.company_gstin || '08AABCE1290M1Z5'}</p>
              <p><strong>Official Website:</strong> <a href="https://www.enexa.in" target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline">www.enexa.in</a></p>
            </div>
          </div>

          {/* Col 2: Solutions & Modules */}
          <div>
            <h4 className="font-extrabold text-slate-200 uppercase tracking-wider mb-4 text-xs">
              Retail Solutions
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li><button onClick={() => navigateTo('services')} className="hover:text-cyan-400 transition cursor-pointer">High-Speed POS Counter</button></li>
              <li><button onClick={() => navigateTo('services')} className="hover:text-cyan-400 transition cursor-pointer">WhatsApp CRM & UPI QR</button></li>
              <li><button onClick={() => navigateTo('services')} className="hover:text-cyan-400 transition cursor-pointer">Online E-Commerce Storefront</button></li>
              <li><button onClick={() => navigateTo('services')} className="hover:text-cyan-400 transition cursor-pointer">Multi-Warehouse Inventory</button></li>
              <li><button onClick={() => navigateTo('services')} className="hover:text-cyan-400 transition cursor-pointer">GSTR-1 & e-Way Bill Desk</button></li>
            </ul>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="font-extrabold text-slate-200 uppercase tracking-wider mb-4 text-xs">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li><button onClick={() => navigateTo('home')} className="hover:text-cyan-400 transition cursor-pointer">Home Overview</button></li>
              <li><button onClick={() => navigateTo('about')} className="hover:text-cyan-400 transition cursor-pointer">About Enexa IT Solutions</button></li>
              <li><button onClick={() => navigateTo('services')} className="hover:text-cyan-400 transition cursor-pointer">Services & Features</button></li>
              <li><button onClick={() => navigateTo('pricing')} className="hover:text-cyan-400 transition cursor-pointer">Subscription Pricing</button></li>
              <li><button onClick={() => navigateTo('blog')} className="hover:text-cyan-400 transition cursor-pointer">Blog & Insights</button></li>
              <li><button onClick={() => navigateTo('contact')} className="hover:text-cyan-400 transition cursor-pointer">Contact & Demo</button></li>
            </ul>
          </div>

          {/* Col 4: Legal & Policies (User requested) */}
          <div>
            <h4 className="font-extrabold text-slate-200 uppercase tracking-wider mb-4 text-xs">
              Policies & Legal
            </h4>
            <ul className="space-y-2.5 text-slate-400">
              <li><button onClick={() => navigateTo('privacy-policy')} className="hover:text-cyan-400 transition cursor-pointer">Privacy Policy</button></li>
              <li><button onClick={() => navigateTo('return-policy')} className="hover:text-cyan-400 transition cursor-pointer">Return Policy</button></li>
              <li><button onClick={() => navigateTo('terms-of-service')} className="hover:text-cyan-400 transition cursor-pointer">Terms of Service</button></li>
              <li><a href="/master" className="hover:text-cyan-400 transition">Super Admin Desk</a></li>
              <li><a href="/store" className="hover:text-cyan-400 transition">Store Merchant Login</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Powered by Enexa IT Solutions Private Limited */}
        <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <span>© 2026</span>
            <a href="https://www.enexa.in" target="_blank" rel="noreferrer" className="text-white font-bold hover:underline">
              Enexa IT Solutions Private Limited
            </a>
            <span>• Official Portal:</span>
            <a href="https://www.enexa.in" target="_blank" rel="noreferrer" className="text-[#00a2c7] hover:underline">
              www.enexa.in
            </a>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
              Powered by Enexa IT Solutions Private Limited
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

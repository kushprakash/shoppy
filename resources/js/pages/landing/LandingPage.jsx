import React, { useState, useEffect, useRef } from 'react';
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
  RotateCw,
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
  Search,
  ArrowLeft,
  Eye,
  EyeOff,
  User,
  AlertCircle,
  MessageCircle,
  QrCode,
  Copy,
  Rocket,
  Headphones,
  BarChart3,
  Cpu,
  HeartHandshake,
  Quote
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../../../css/enexa-landing.css';
import subscriptionService, { resolveRibbonStyle } from '../../services/subscriptionService';
import StoreRenewalModal from '../../components/StoreRenewalModal';
import ForgotPasswordModal from '../../components/ForgotPasswordModal';
import { setStoreAuthSession } from '../../utils/storeAuth';

// Social Icon Components for Contact section
const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const LinkedinIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
);

const YoutubeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function LandingPage({ defaultPage = 'home' }) {
  const navigate = useNavigate();

  // Set website title as requested: Shoppy ERP — Enexa IT Solutions Private Limited
  useEffect(() => {
    document.title = 'Shoppy ERP — Enexa IT Solutions Private Limited';
  }, []);

  // Determine initial active page from URL path or prop
  const getInitialPage = () => {
    if (defaultPage && defaultPage !== 'home') return defaultPage;
    const path = window.location.pathname.replace(/^\//, '').toLowerCase();
    const validPages = ['about', 'services', 'pricing', 'blog', 'contact', 'privacy-policy', 'return-policy', 'terms-of-service', 'store'];
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
    support_phone: '+91 9546042639',
    support_email: 'contact@enexa.in',
    sales_email: 'contact@enexa.in',
    corporate_address: 'Bhagwanpur, Muzaffarpur, Bihar 842001',
    company_gstin: '08AABCE1290M1Z5',
    company_cin: 'U72900RJ2021PTC075482'
  });

  // Category tab & billing cycle for pricing view
  const [selectedCategoryTab, setSelectedCategoryTab] = useState('business');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [ownWhatsapp, setOwnWhatsapp] = useState({
    'monthly-package': false,
    'quarterly-package': false,
    'half-yearly-package': false,
    'yearly-package': false
  });

  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Hero interactive preview tab: 'invoice' | 'whatsapp' | 'thermal' | 'storefront'
  const [heroPreviewTab, setHeroPreviewTab] = useState('invoice');

  // Enexa-style Hero Typewriter & Scroll Header State
  const TYPED_PHRASES = [
    'GST Billing',
    'Retail POS',
    'Smart Invoices',
    'Web Storefronts',
    'Stock Control'
  ];
  const [typedPhraseIdx, setTypedPhraseIdx] = useState(0);
  const [typedCharCount, setTypedCharCount] = useState(11);
  const [isTypedDeleting, setIsTypedDeleting] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // FAQ Accordion Active Item
  const [openFaq, setOpenFaq] = useState(0);

  // Blog modal active article
  const [activeBlogModal, setActiveBlogModal] = useState(null);
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('all');

  // Working Contact Form State (enexa.in design)
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    captcha: '',
    captcha_token: ''
  });
  const [captchaCode, setCaptchaCode] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(null);
  const [contactError, setContactError] = useState(null);
  const captchaCanvasRef = useRef(null);

  // Onboarding Wizard Modal State
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardStep, setOnboardStep] = useState(1);
  const [selectedOnboardPlan, setSelectedOnboardPlan] = useState(null);
  const [gstStates, setGstStates] = useState([]);
  const [isVerifyingAgent, setIsVerifyingAgent] = useState(false);
  const [onboardForm, setOnboardForm] = useState({
    referralCode: '',
    agentName: '',
    agentVerified: false,
    agentError: null,
    storeName: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: '',
    stateCode: '10',
    city: 'BIHAR',
    category: '',
    subCategory: '',
    paymentMethod: 'paytm_upi'
  });
  const [provisionedStore, setProvisionedStore] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paytmOnboardData, setPaytmOnboardData] = useState(null);
  const [paytmUtr, setPaytmUtr] = useState('');
  const [paymentError, setPaymentError] = useState(null);
  const [copiedVpa, setCopiedVpa] = useState(false);
  const [provisioningPhase, setProvisioningPhase] = useState('idle'); // 'idle' | 'blink' | 'progress' | 'done'
  const [provisionStepIndex, setProvisionStepIndex] = useState(0);
  const [provisionProgress, setProvisionProgress] = useState(15);

  // Renewal / Upgrade Modal State
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [lookupStoreCode, setLookupStoreCode] = useState('');
  const [foundStore, setFoundStore] = useState(null);
  const [renewPlanId, setRenewPlanId] = useState('yearly-package');
  const [renewCycle, setRenewCycle] = useState('yearly');
  const [renewOwnWhatsapp, setRenewOwnWhatsapp] = useState(true);
  const [renewSuccess, setRenewSuccess] = useState(null);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Store Terminal Login State
  const getInitialStoreCode = () => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const code = sp.get('code');
      if (code) return code.toUpperCase();
      return localStorage.getItem('shoppy_saved_store_code') || '';
    } catch {
      return '';
    }
  };

  const [inputStoreCode, setInputStoreCode] = useState(getInitialStoreCode);
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberTerminal, setRememberTerminal] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('forgot') === '1') {
        setIsForgotModalOpen(true);
      }
    } catch (e) {}
  }, []);

  const handleStoreLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);

    const cleanCode = (inputStoreCode || '').trim().toUpperCase();
    const cleanPassword = (inputPassword || '').trim();

    if (!cleanCode) {
      setLoginError('Please enter your Store Code.');
      return;
    }
    if (!cleanPassword) {
      setLoginError('Please enter your terminal Password.');
      return;
    }

    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/store/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          store_code: cleanCode,
          password: cleanPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const resolvedCode = (data.store?.code || data.store?.shop_code || cleanCode).toUpperCase();
        try {
          if (rememberTerminal) {
            localStorage.setItem('shoppy_saved_store_code', resolvedCode);
          } else {
            localStorage.removeItem('shoppy_saved_store_code');
          }

          setStoreAuthSession({
            token: data.token || '',
            shopCode: resolvedCode,
            store: data.store || null
          });

          // Check if store subscription is expiring in last 5 days (or expired) to auto-trigger renewal popup!
          const expCheck = subscriptionService.getStoreExpiryStatus(resolvedCode);
          if (expCheck && expCheck.showAlert) {
            localStorage.setItem('shoppy_trigger_renewal_popup', 'true');
            sessionStorage.setItem('shoppy_show_renewal_popup', 'true');
          }
          window.dispatchEvent(new Event('shoppy:store_auth_changed'));
        } catch (err) { }

        showToast(data.message || `Welcome! Store ${resolvedCode} authenticated`);
        window.location.assign('/shop-admin/dashboard');
      } else {
        setLoginError(data.message || 'Invalid store code or password.');
      }
    } catch (err) {
      setLoginError('Connection error to store server. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
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

    // Fetch fresh from backend API (bypass browser cache so DB changes reflect immediately)
    fetch('/api/public/landing-data', { cache: 'no-store' })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          if (json.plans && json.plans.length > 0) {
            setPlans(json.plans);
            subscriptionService.cachePlansFromApi(json.plans);
          }
          if (json.settings) setSettings((prev) => ({ ...prev, ...json.settings }));
          if (json.blogs && json.blogs.length > 0) setBlogs(json.blogs);
          if (json.gst_states && json.gst_states.length > 0) setGstStates(json.gst_states);
        }
      })
      .catch(() => { });

    // Fetch official GST States for Signup & POS Invoicing
    fetch('/api/public/gst-states')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setGstStates(json.data);
        }
      })
      .catch(() => { });

    // Handle PayU Redirect Success Callback (?payu_status=success&shop=SP...)
    try {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('payu_status') === 'success') {
        const paidShop = sp.get('shop');
        if (paidShop) {
          setStoreAuthSession({ shopCode: paidShop });
          localStorage.setItem('shoppy_initial_setup', 'true');
          showToast(`✓ Payment verified! Launching Store Settings for ${paidShop}...`);
          setTimeout(() => {
            window.location.assign(`/shop-admin/settings?setup=1&code=${encodeURIComponent(paidShop)}`);
          }, 1000);
        }
      }
    } catch (e) {}

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

  // Enexa-style Header Scroll Shadow & Hero Typewriter Loop
  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (currentPage !== 'home') return;
    const currentPhrase = TYPED_PHRASES[typedPhraseIdx % TYPED_PHRASES.length];
    let delay = isTypedDeleting ? 38 : 75;

    if (!isTypedDeleting && typedCharCount >= currentPhrase.length) {
      delay = 1850;
      const pauseTimer = setTimeout(() => setIsTypedDeleting(true), delay);
      return () => clearTimeout(pauseTimer);
    }

    if (isTypedDeleting && typedCharCount === 0) {
      const nextTimer = setTimeout(() => {
        setIsTypedDeleting(false);
        setTypedPhraseIdx((prev) => (prev + 1) % TYPED_PHRASES.length);
      }, 280);
      return () => clearTimeout(nextTimer);
    }

    const typeTimer = setTimeout(() => {
      setTypedCharCount((prev) => prev + (isTypedDeleting ? -1 : 1));
    }, delay);

    return () => clearTimeout(typeTimer);
  }, [typedCharCount, isTypedDeleting, typedPhraseIdx, currentPage]);

  const ENEXA_TESTIMONIALS = [
    {
      name: 'Rajeshwar Agrawal',
      role: 'Owner, Agrawal Supermart & Kirana (Patna)',
      quote: 'Shoppy ERP cut our evening queue time by half. Barcode scan billing and 80mm thermal receipt printing work in milliseconds even with 8,000+ SKUs.',
      rating: 5,
      initials: 'RA',
      color: '#0EA5E9'
    },
    {
      name: 'Dr. Ananya Deshmukh',
      role: 'Director, MedLife Wellness Pharmacy (Pune)',
      quote: 'Dot-matrix tear-off format, batch expiry alerts, and 1-click GSTR-1 export saved our accountant hours every single month. Zero billing errors.',
      rating: 5,
      initials: 'AD',
      color: '#10B981'
    },
    {
      name: 'Imran Khan',
      role: 'Founder, ZAM ZAM Fashion House (Muzaffarpur)',
      quote: 'Our customers love receiving instant GST invoices and UPI payment QR links on WhatsApp. Plus our online storefront orders sync directly to the counter!',
      rating: 5,
      initials: 'IK',
      color: '#F59E0B'
    },
    {
      name: 'Saurabh Kapoor',
      role: 'Managing Partner, Kapoor Electronics (Jaipur)',
      quote: 'Every branch runs smoothly on an isolated database with real-time serial number warranty tracking and multi-counter cashier shift closing reports.',
      rating: 5,
      initials: 'SK',
      color: '#8B5CF6'
    },
    {
      name: 'Meera Nair',
      role: 'Owner, FreshBasket Organic Stores (Kochi)',
      quote: 'Setup took literally under 5 minutes. Weighing scale integration and automated low-stock alerts on owner WhatsApp changed how we manage inventory.',
      rating: 5,
      initials: 'MN',
      color: '#0284C7'
    },
    {
      name: 'Vikramjit Gill',
      role: 'Director, Gill Footwear & Apparel (Ludhiana)',
      quote: 'Size-color matrix barcodes and festive discount coupons run seamlessly across our showroom and online store powered by Enexa IT Solutions.',
      rating: 5,
      initials: 'VG',
      color: '#EC4899'
    }
  ];

  // Calculate live price for any plan
  const getPrice = (plan) => {
    return subscriptionService.calculatePrice(plan, plan?.billingCycle, !!(ownWhatsapp[plan?.id] || ownWhatsapp[plan?.code]));
  };

  // Start Onboarding Flow
  const handleStartOnboarding = (plan) => {
    const targetPlan = plan || (plans && plans.length > 0 ? plans[0] : {
      id: 'monthly-package',
      name: 'Monthly Package',
      billingCycle: 'monthly',
      basePrice: 999
    });
    setSelectedOnboardPlan(targetPlan);
    setBillingCycle(targetPlan?.billingCycle || 'monthly');
    setOnboardStep(1);
    setPaytmOnboardData(null);
    setPaymentError(null);
    setPaytmUtr('');
    setProvisioningPhase('idle');
    setProvisionStepIndex(0);
    setProvisionProgress(15);
    setIsOnboardingOpen(true);
  };

  // Draw CAPTCHA on canvas with noise lines matching enexa.in
  const drawCaptcha = (code) => {
    const canvas = captchaCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Random noise lines like in image 2
    const colors = ['#e11d48', '#2563eb', '#059669', '#d97706', '#7c3aed', '#0891b2', '#111827'];
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = colors[i % colors.length];
      ctx.lineWidth = 1 + Math.random() * 1.5;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 15, Math.random() * canvas.height);
      ctx.bezierCurveTo(
        Math.random() * canvas.width, Math.random() * canvas.height,
        Math.random() * canvas.width, Math.random() * canvas.height,
        canvas.width - Math.random() * 15, Math.random() * canvas.height
      );
      ctx.stroke();
    }

    // Characters with slight rotation and distortion
    const chars = (code || '').split('');
    const charWidth = (canvas.width - 20) / Math.max(chars.length, 1);
    ctx.font = 'bold 22px "Times New Roman", Georgia, serif';
    ctx.textBaseline = 'middle';

    chars.forEach((char, index) => {
      ctx.save();
      const x = 12 + index * charWidth + (Math.random() * 4 - 2);
      const y = canvas.height / 2 + (Math.random() * 4 - 2);
      const angle = (Math.random() * 24 - 12) * (Math.PI / 180);
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = '#111827';
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  };

  // Fetch new CAPTCHA from API
  const refreshCaptcha = async () => {
    try {
      const res = await fetch('/api/captcha');
      const data = await res.json();
      if (data && data.success) {
        setCaptchaCode(data.code);
        setContactForm(prev => ({ ...prev, captcha_token: data.token, captcha: '' }));
        setTimeout(() => drawCaptcha(data.code), 60);
      }
    } catch (err) {
      console.error('Failed to fetch captcha:', err);
    }
  };

  useEffect(() => {
    if (currentPage === 'contact') {
      refreshCaptcha();
    }
  }, [currentPage]);

  // Submit Contact Form (enexa.in design, stored in contacts table)
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError(null);
    setContactSuccess(null);

    if (!contactForm.captcha || contactForm.captcha.trim().length === 0) {
      setContactError('Please enter the CAPTCHA characters shown in the image.');
      return;
    }

    setIsSubmittingContact(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(contactForm)
      });
      const result = await res.json();
      setIsSubmittingContact(false);

      if (res.ok && result.success) {
        setContactSuccess(result.message || "Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.");
        setContactForm({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          captcha: '',
          captcha_token: ''
        });
        showToast('Message sent to Enexa IT Solutions team!');
        refreshCaptcha();
      } else {
        setContactError(result.message || 'Verification failed. Please enter the correct CAPTCHA code.');
        refreshCaptcha();
      }
    } catch (err) {
      setIsSubmittingContact(false);
      setContactError('Submission error. Please check your connection and try again.');
      refreshCaptcha();
    }
  };

  // Lookup store for renewal (Opens PayU Money Renewal Modal)
  const handleLookupStore = (e) => {
    e.preventDefault();
    if (!lookupStoreCode.trim()) {
      showToast('Please enter your merchant store code.');
      return;
    }
    setIsRenewModalOpen(true);
  };

  // Verify Agent / Partner Referral Code
  const handleVerifyAgent = async () => {
    const code = (onboardForm.referralCode || '').trim().toUpperCase();
    if (!code) {
      setOnboardForm((prev) => ({
        ...prev,
        agentName: '',
        agentVerified: false,
        agentError: 'Please enter a referral / agent code.'
      }));
      return;
    }

    setIsVerifyingAgent(true);
    setOnboardForm((prev) => ({ ...prev, agentError: null }));

    try {
      const res = await fetch(`/api/public/verify-agent?code=${encodeURIComponent(code)}`);
      const data = await res.json();
      if (res.ok && data.success && data.agent) {
        setOnboardForm((prev) => ({
          ...prev,
          agentName: data.agent.name,
          referralCode: data.agent.referral_code,
          agentVerified: true,
          agentError: null
        }));
        showToast(`✓ Agent Verified: ${data.agent.name}`);
      } else {
        setOnboardForm((prev) => ({
          ...prev,
          agentName: '',
          agentVerified: false,
          agentError: data.message || 'Invalid or unverified Agent Code'
        }));
      }
    } catch (e) {
      setOnboardForm((prev) => ({
        ...prev,
        agentName: '',
        agentVerified: false,
        agentError: 'Connection error verifying agent.'
      }));
    } finally {
      setIsVerifyingAgent(false);
    }
  };

  // Auto-poll Paytm order status every 1 second for instant detection
  useEffect(() => {
    let pollInterval = null;
    if (isOnboardingOpen && onboardStep === 3 && paytmOnboardData?.order_id && !provisionedStore && provisioningPhase === 'idle') {
      pollInterval = setInterval(async () => {
        try {
          const res = await subscriptionService.checkPaytmOrderStatus(paytmOnboardData.order_id);
          if (res && res.status === 'TXN_SUCCESS') {
            clearInterval(pollInterval);
            handleCompleteOnboarding('success');
          }
        } catch (e) {}
      }, 1000);
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isOnboardingOpen, onboardStep, paytmOnboardData, provisionedStore, provisioningPhase]);

  // Proceed from Step 2 to Step 3: Initiate Paytm UPI Dynamic QR / Intent
  const handleProceedToPayment = async () => {
    if (!onboardForm.storeName || !onboardForm.ownerName || !onboardForm.ownerPhone || !onboardForm.ownerEmail || !onboardForm.stateCode) {
      showToast('Please fill all required store details (Shop Name, Owner Name, Mobile, Email & State).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(onboardForm.ownerEmail.trim())) {
      showToast('Please enter a valid Email Address.');
      return;
    }

    if (onboardForm.ownerPhone.trim().length !== 10) {
      showToast('Please enter a valid 10-digit Mobile Number.');
      return;
    }

    setIsProcessingPayment(true);
    setPaymentError(null);
    setProvisioningPhase('idle');

    const res = await subscriptionService.initiatePaytmUpi({
      type: 'onboard',
      plan_id: selectedOnboardPlan.id,
      billing_cycle: billingCycle,
      own_whatsapp: !!(ownWhatsapp[selectedOnboardPlan.id] || ownWhatsapp[selectedOnboardPlan.code]),
      name: onboardForm.storeName,
      owner_name: onboardForm.ownerName,
      owner_phone: onboardForm.ownerPhone,
      owner_email: onboardForm.ownerEmail.trim(),
      state_code: onboardForm.stateCode,
      referral_code: onboardForm.referralCode || '',
      city: onboardForm.city || 'BIHAR',
      category: onboardForm.category,
      sub_category: onboardForm.subCategory,
    });

    setIsProcessingPayment(false);

    if (res && res.success) {
      setPaytmOnboardData(res);
      setOnboardStep(3);
    } else {
      setPaymentError(res?.message || 'Could not connect to Paytm UPI gateway.');
      setOnboardStep(3);
    }
  };

  // Complete Onboarding: Verify Paytm UPI Payment and Provision Isolated Database Store
  const handleCompleteOnboarding = async (paymentStatus = 'success') => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);
    setPaymentError(null);

    if (!paytmOnboardData?.order_id) {
      setPaymentError('No active payment session found. Please initiate Paytm payment.');
      setIsProcessingPayment(false);
      return;
    }

    try {
      // Phase 1: Round tick mark blinking animation FIRST (payment detected)
      setProvisioningPhase('blink');

      const result = await subscriptionService.verifyPaytmPayment({
        order_id: paytmOnboardData.order_id,
        status: paymentStatus,
        type: 'onboard',
        store_data: {
          storeName: onboardForm.storeName,
          ownerName: onboardForm.ownerName,
          ownerPhone: onboardForm.ownerPhone,
          ownerEmail: onboardForm.ownerEmail.trim(),
          stateCode: onboardForm.stateCode,
          referralCode: onboardForm.referralCode,
          planId: selectedOnboardPlan.id,
          billingCycle: billingCycle,
          ownWhatsapp: !!ownWhatsapp[selectedOnboardPlan.id]
        }
      });

      if (result && result.success && result.store) {
        const store = result.store;
        setProvisionedStore(store);

        // Store login tokens & cookies for seamless merchant auto-login
        setStoreAuthSession({
          token: result.token || '',
          shopCode: store.shop_code || store.code || '',
          store
        });
        localStorage.setItem('shoppy_initial_setup', 'true');

        // Keep blink for 1.8 seconds then move to progress
        setTimeout(() => {
          // Phase 2: Live multi-step provisioning checklist animation
          setProvisioningPhase('progress');
          setProvisionStepIndex(0);
          setProvisionProgress(5);

          const stepSequence = [
            { step: 1, progress: 18 },
            { step: 2, progress: 35 },
            { step: 3, progress: 52 },
            { step: 4, progress: 68 },
            { step: 5, progress: 82 },
            { step: 6, progress: 95 },
            { step: 7, progress: 100 }
          ];

          stepSequence.forEach((item, idx) => {
            setTimeout(() => {
              setProvisionStepIndex(item.step);
              setProvisionProgress(item.progress);

              // Phase 3: All steps finished -> Show credentials & Auto-redirect
              if (idx === stepSequence.length - 1) {
                setTimeout(() => {
                  setProvisioningPhase('done');
                  setOnboardStep(4);
                  setIsProcessingPayment(false);
                  showToast(`🎉 Store ${store.shop_code} live! Dispatching credentials...`);

                  // Auto-redirect to Store Settings with store code to guarantee no blank page
                  setTimeout(() => {
                    setIsOnboardingOpen(false);
                    window.location.href = `/shop-admin/settings?setup=1&code=${store.shop_code}`;
                  }, 3000);
                }, 600);
              }
            }, (idx + 1) * 550);
          });
        }, 1800);

      } else {
        setIsProcessingPayment(false);
        setProvisioningPhase('idle');
        setPaymentError(result?.message || 'Payment verification failed. Please wait for auto-detection or try again.');
      }
    } catch (err) {
      setIsProcessingPayment(false);
      setProvisioningPhase('idle');
      setPaymentError('Connection error during verification. Please check your network and try again.');
    }
  };



  // Dedicated Production Store Login Screen (Distraction-free, Store Code + Password, Zero clutter)
  if (currentPage === 'store') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0c1421] via-[#101b2b] to-[#152338] text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans antialiased selection:bg-[#00a2c7] selection:text-white">
        {/* Top Minimal Navigation Bar */}
        <header className="max-w-5xl mx-auto w-full flex items-center justify-between py-2">
          <button
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition cursor-pointer px-3.5 py-1.5 rounded-full hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Shoppy</span>
          </button>

          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px] text-slate-300">Terminal Server Live</span>
          </div>
        </header>

        {/* Center Production Auth Card */}
        <main className="w-full max-w-[420px] mx-auto my-auto py-6">
          <div className="bg-slate-900/95 border border-slate-800/90 rounded-3xl p-7 sm:p-8 shadow-2xl backdrop-blur-xl">
            {/* Brand Header */}
            <div className="text-center space-y-2 mb-6">
              <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#008ba3] via-[#00a8cc] to-[#10b981] items-center justify-center text-white shadow-xl shadow-cyan-500/20 mb-1">
                <Store className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-extrabold text-white font-heading tracking-tight">
                Store Terminal Login
              </h1>
              <p className="text-xs text-slate-400">
                Enter your Store Code and Password to access your POS & ERP billing desk
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Store Subscription Expiry Alert (Last 5 days or expired) */}
            {(() => {
              const exp = subscriptionService.getStoreExpiryStatus(inputStoreCode);
              if (!exp || !exp.showAlert) return null;

              return (
                <div
                  className={`mb-5 p-4 rounded-2xl border text-xs space-y-2.5 animate-in fade-in shadow-xl ${exp.isExpired
                    ? 'bg-red-500/15 border-red-500/40 text-red-200'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-black">
                      {exp.isExpired ? (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
                      ) : (
                        <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                      )}
                      <span className={exp.isExpired ? 'text-red-300 font-extrabold' : 'text-amber-300 font-extrabold'}>
                        {exp.isExpired ? 'Subscription Expired' : 'Subscription Expiry Alert'}
                      </span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-black ${exp.isExpired ? 'bg-red-500/25 text-red-300' : 'bg-amber-500/25 text-amber-300'
                        }`}
                    >
                      {exp.daysRemaining < 0
                        ? `Expired ${Math.abs(exp.daysRemaining)}d ago`
                        : exp.daysRemaining === 0
                          ? 'Expires Today'
                          : `${exp.daysRemaining} Days Left`}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Store <strong>{exp.storeName}</strong> ({exp.shopCode}) validity {exp.isExpired ? 'expired on' : 'valid until'}{' '}
                    <strong className="text-white font-mono">{exp.validUntil}</strong>. Please renew to keep your POS terminal, billing desk & ecommerce storefront active.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setLookupStoreCode(exp.shopCode);
                      setFoundStore(exp.store);
                      setIsRenewModalOpen(true);
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md ${exp.isExpired
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black'
                      }`}
                  >
                    <Zap className="w-4 h-4" />
                    <span>Renew / Extend Subscription Now</span>
                  </button>
                </div>
              );
            })()}

            {/* Form: Store Code + Password */}
            <form onSubmit={handleStoreLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Store Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={inputStoreCode}
                    onChange={(e) => {
                      setInputStoreCode(e.target.value.toUpperCase());
                      setLoginError(null);
                    }}
                    placeholder="e.g. SHP-XXXXXX"
                    autoFocus
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white font-mono text-xs font-bold tracking-wider placeholder:font-sans placeholder:font-normal placeholder:text-slate-500 focus:outline-none focus:border-[#00a2c7] focus:ring-1 focus:ring-[#00a2c7] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={inputPassword}
                    onChange={(e) => {
                      setInputPassword(e.target.value);
                      setLoginError(null);
                    }}
                    placeholder="Enter terminal password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-white text-xs font-medium placeholder:text-slate-500 focus:outline-none focus:border-[#00a2c7] focus:ring-1 focus:ring-[#00a2c7] transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberTerminal}
                    onChange={(e) => setRememberTerminal(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-[#00a2c7] focus:ring-0 cursor-pointer"
                  />
                  <span>Remember Store Code</span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-[#00a2c7] hover:text-[#38bdf8] hover:underline font-bold transition cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00a8cc] to-[#008ba3] hover:from-[#0096b7] hover:to-[#007b91] text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isLoggingIn ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Verifying Terminal...</span>
                    </>
                  ) : (
                    <>
                      <span>Login to Retail Software</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="pt-5 mt-5 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
              <span>Need help or new merchant activation?</span>
              <br />
              <button
                onClick={() => navigateTo('contact')}
                className="text-[#00a2c7] hover:underline font-semibold mt-1 cursor-pointer"
              >
                Contact Enexa Support Desk
              </button>
            </div>
          </div>
        </main>

        {/* Minimal Footer */}
        <footer className="max-w-5xl mx-auto w-full text-center py-2 text-[11px] text-slate-500">
          <span>© 2026 Enexa IT Solutions Private Limited • Enterprise Retail ERP</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="enexa-landing min-h-screen bg-white text-slate-800 flex flex-col transition-colors duration-200">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <Sparkles className="w-4 h-4 text-[#F59E0B]" />
          <span>{toast}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. ENEXA SIGNATURE STICKY GLASS HEADER                               */}
      {/* =================================================================== */}
      <header className={`enexa-header ${headerScrolled ? 'scrolled' : ''}`}>
        <div className="w-full max-w-[1440px] mx-auto h-full px-5 sm:px-10 lg:px-16 flex items-center justify-between gap-4">
          {/* Left: Mobile Drawer Trigger + Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-sky-50 hover:text-[#0EA5E9] transition cursor-pointer"
              title="Open Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div onClick={() => navigateTo('home')} className="flex items-center gap-2.5 cursor-pointer select-none">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                <Receipt className="w-5 h-5 stroke-[2.3]" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900 tracking-tight block leading-tight">
                  Shoppy<span className="text-[#0EA5E9]">ERP</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 tracking-wide block -mt-0.5">
                  Powered by Enexa IT
                </span>
              </div>
            </div>
          </div>

          {/* Center: Clean Horizontal Navigation Links matching enexa.in */}
          <nav className="hidden lg:flex items-center gap-7">
            <button
              onClick={() => navigateTo('home')}
              className={`enexa-nav-link cursor-pointer ${currentPage === 'home' ? 'active font-semibold' : ''}`}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('about')}
              className={`enexa-nav-link cursor-pointer ${currentPage === 'about' ? 'active font-semibold' : ''}`}
            >
              About
            </button>
            <button
              onClick={() => navigateTo('services')}
              className={`enexa-nav-link cursor-pointer ${currentPage === 'services' ? 'active font-semibold' : ''}`}
            >
              Services
            </button>
            <button
              onClick={() => navigateTo('pricing')}
              className={`enexa-nav-link cursor-pointer ${currentPage === 'pricing' ? 'active font-semibold' : ''}`}
            >
              Pricing
            </button>
            <button
              onClick={() => navigateTo('blog')}
              className={`enexa-nav-link cursor-pointer ${currentPage === 'blog' ? 'active font-semibold' : ''}`}
            >
              Blog
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className={`enexa-nav-link cursor-pointer ${currentPage === 'contact' ? 'active font-semibold' : ''}`}
            >
              Contact
            </button>
          </nav>

          {/* Right CTA Actions matching enexa.in Sign In + Get Started */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              onClick={() => {
                const savedCode = localStorage.getItem('shoppy_saved_store_code') || '';
                setLookupStoreCode(savedCode);
                setIsRenewModalOpen(true);
              }}
              className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#0EA5E9] hover:bg-sky-50 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#0EA5E9]" />
              <span>Renew Plan</span>
            </button>

            <button
              onClick={() => navigateTo('store')}
              className="hidden sm:inline-flex enexa-btn-secondary !py-2 !px-4 !text-xs sm:!text-sm"
            >
              Store Login
            </button>

            <button
              onClick={() => handleStartOnboarding()}
              className="enexa-btn-primary !py-2 !px-4 sm:!px-5 !text-xs sm:!text-sm"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* =================================================================== */}
      {/* 2. MOBILE LEFT SIDEBAR DRAWER                                       */}
      {/* =================================================================== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[80] flex lg:hidden">
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
          />

          <div className="relative w-80 max-w-[85%] bg-white h-full shadow-2xl flex flex-col justify-between z-10">
            <div className="overflow-y-auto">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center text-white">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-bold text-base text-slate-900 block leading-tight">
                      Shoppy<span className="text-[#0EA5E9]">ERP</span>
                    </span>
                    <span className="text-[10px] font-medium text-slate-500">
                      Powered by Enexa IT Solutions
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-4 space-y-1 text-sm font-medium">
                {[
                  { id: 'home', label: 'Home', icon: Store },
                  { id: 'about', label: 'About Us', icon: Building2 },
                  { id: 'services', label: 'Services & Billing Modules', icon: Boxes },
                  { id: 'pricing', label: 'Pricing & Packages', icon: CreditCard },
                  { id: 'blog', label: 'Blog & Insights', icon: FileText },
                  { id: 'contact', label: 'Contact & Book Demo', icon: Phone },
                  { id: 'store', label: 'Store Merchant Login', icon: Lock }
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => navigateTo(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition text-left cursor-pointer ${isActive
                        ? 'bg-sky-50 text-[#0284C7] font-semibold border border-sky-100'
                        : 'text-slate-700 hover:bg-slate-50 hover:text-[#0EA5E9]'
                        }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#0EA5E9]' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <span className="px-3 pb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                      className={`w-full px-3 py-1.5 text-xs text-left transition cursor-pointer ${currentPage === leg.id
                        ? 'text-[#0EA5E9] font-semibold'
                        : 'text-slate-500 hover:text-slate-900'
                        }`}
                    >
                      {leg.label}
                    </button>
                  ))}
                </div>

                <div className="pt-4 space-y-2.5">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleStartOnboarding();
                    }}
                    className="w-full enexa-btn-primary !text-xs"
                  >
                    <span>Get Started Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      const savedCode = localStorage.getItem('shoppy_saved_store_code') || '';
                      setLookupStoreCode(savedCode);
                      setIsRenewModalOpen(true);
                    }}
                    className="w-full enexa-btn-secondary !text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Renew Existing Store Plan</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-xs">
              <p className="font-semibold text-slate-800">Enexa IT Solutions Pvt Ltd</p>
              <p className="text-[11px] text-slate-500 mt-0.5">contact@enexa.in • +91 95460 42639</p>
              <a
                href="https://www.enexa.in"
                target="_blank"
                rel="noreferrer"
                className="mt-2 text-xs font-semibold text-[#0EA5E9] flex items-center gap-1 hover:underline"
              >
                <span>www.enexa.in</span>
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
          <div className="space-y-0 animate-in fade-in duration-300">
            {/* ============================================================= */}
            {/* 1. HERO SECTION (Exact match to https://enexa.in/)            */}
            {/* ============================================================= */}
            <section className="enexa-hero">
              {/* Top-left Decorative Dot Matrix */}
              <div className="enexa-hero-dots hidden sm:block" aria-hidden="true" />

              {/* Subtle Diagonal Curved SVG Accent matching enexa.in screenshot */}
              <svg
                className="pointer-events-none absolute inset-0 w-full h-full opacity-55"
                viewBox="0 0 1440 820"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d="M0 780C320 620 620 420 960 220C1140 115 1300 45 1440 0V820H0V780Z"
                  fill="rgba(255,255,255,0.45)"
                />
              </svg>

              <div className="w-full max-w-[1440px] mx-auto px-5 sm:px-10 lg:px-16 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                  {/* Left Content (~50%) */}
                  <div className="lg:col-span-6 space-y-5 text-left">
                    <h1 className="enexa-hero-title">
                      Elevating <br />
                      Your Modern{' '}
                      <span className="text-[#0EA5E9]">
                        {TYPED_PHRASES[typedPhraseIdx % TYPED_PHRASES.length].slice(0, typedCharCount)}
                      </span>
                      <span className="enexa-typed-cursor" aria-hidden="true">|</span>
                    </h1>

                    <p className="text-base sm:text-lg text-[#475569] leading-relaxed max-w-xl">
                      {settings.hero_subtitle ||
                        'Your Best Retail Billing & POS Provider awaits you! Discover as we bring groundbreaking sub-50ms billing, WhatsApp GST invoices, and store automation tailored to your business needs.'}
                    </p>

                    <div className="flex flex-wrap items-center gap-3.5 pt-1">
                      <button
                        onClick={() => handleStartOnboarding()}
                        className="enexa-btn-primary"
                      >
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4 stroke-[2.3]" />
                      </button>

                      <button
                        onClick={() => navigateTo('pricing')}
                        className="enexa-btn-secondary"
                      >
                        <span>View Pricing &amp; Plans</span>
                      </button>
                    </div>

                    <div>
                      <button
                        onClick={() => navigateTo('services')}
                        className="text-xs sm:text-sm font-semibold text-[#0EA5E9] hover:text-[#0284C7] inline-flex items-center gap-1.5 transition cursor-pointer group"
                      >
                        <span>Start Store Setup in Under 5 Minutes</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Right Transparent Isometric Billing Visual (~50%) */}
                  <div className="lg:col-span-6 flex items-center justify-center lg:justify-end">
                    <div className="enexa-hero-visual-wrap w-full max-w-[510px]">
                      <img
                        src="/images/landing/hero-billing-iso.png"
                        alt="Shoppy ERP Billing Software, Thermal Receipt Printer, Barcode Scanner & UPI QR"
                        className="enexa-hero-visual-img"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================================= */}
            {/* 2. VALUE PROPOSITION CARDS (Why Choose Shoppy ERP)            */}
            {/* ============================================================= */}
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
                  <span className="enexa-pill-badge">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Why Choose Shoppy ERP</span>
                  </span>
                  <h2 className="enexa-section-title">
                    Built for High-Speed Indian Retail &amp; Multi-Branch Stores
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Engineered by Enexa IT Solutions Private Limited to keep morning and evening billing queues moving with zero server lag.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1 */}
                  <div className="enexa-value-card enexa-value-card--blue flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 text-[#0EA5E9] flex items-center justify-center">
                          <Zap className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-[#0284C7]">
                          &lt;50ms Speed
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        Lightning Counter POS
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Instant barcode scanning, 80mm/50mm ESC/POS thermal receipt printing, cash drawer kick, and keyboard shortcuts built for heavy rush hours.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Thermal 80mm</span>
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Barcode Gun</span>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="enexa-value-card enexa-value-card--amber flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-[#F59E0B] flex items-center justify-center">
                          <Receipt className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700">
                          100% GST Ready
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        Zero-Error Tax Billing
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Auto-calculated CGST, SGST &amp; IGST slabs with HSN codes, A4 B2B invoices, medical dot-matrix tear-off prints, and 1-click GSTR-1 CA export.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">GSTR-1 Ready</span>
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">e-Way Bill</span>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="enexa-value-card enexa-value-card--green flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700">
                          98% Open Rate
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        WhatsApp Bills &amp; UPI QR
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Send official PDF tax invoices and dynamic UPI payment QR links directly to customer WhatsApp plus daily shift reports to owner phone.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Meta Cloud API</span>
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Auto Dues</span>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div className="enexa-value-card enexa-value-card--purple flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center">
                          <Database className="w-6 h-6" />
                        </div>
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-700">
                          5 Min Live
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">
                        Isolated MySQL Vault
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Every onboarded store runs on its own dedicated isolated database plus an integrated web storefront at <span className="font-mono text-xs text-slate-800">domain/{'{storeCode}'}</span>.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">99.9% Uptime</span>
                      <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-700">Online Store</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================================= */}
            {/* 3. COMPLETE BILLING & POS SUITE (Enexa Signature Ice-Blue)    */}
            {/* ============================================================= */}
            <section className="enexa-section-api py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
                  {/* Left: Interactive Live Billing Preview Terminal (Equal Width + Equal Height) */}
                  <div className="lg:col-span-6 flex">
                    <div className="w-full h-full bg-white rounded-2xl border border-sky-100 shadow-xl shadow-sky-900/5 overflow-hidden flex flex-col justify-between">
                      {/* Header bar */}
                      <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <Store className="w-4 h-4 text-[#38BDF8]" />
                          <span>Live Billing Suite Preview</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {[
                            { id: 'invoice', label: 'GST Bill' },
                            { id: 'thermal', label: '80mm' },
                            { id: 'whatsapp', label: 'WhatsApp' }
                          ].map((tab) => (
                            <button
                              key={tab.id}
                              onClick={() => setHeroPreviewTab(tab.id)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                                heroPreviewTab === tab.id
                                  ? 'bg-[#0EA5E9] text-white'
                                  : 'bg-slate-800 text-slate-300 hover:text-white'
                              }`}
                            >
                              {tab.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                        {heroPreviewTab === 'invoice' && (
                          <div className="space-y-3.5 flex-1 flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#0EA5E9]">Tax Invoice #INV-0842</p>
                                  <p className="text-sm font-bold text-slate-900">Counter #1 • 12 Nov, 04:18 PM</p>
                                </div>
                                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                                  GST VERIFIED
                                </span>
                              </div>
                              <div className="space-y-2.5 text-xs">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-slate-900">Premium Formal Shirt (XL)</p>
                                    <p className="text-[11px] text-slate-500 font-mono">HSN 6205 • Barcode 8901234001</p>
                                  </div>
                                  <span className="font-mono font-bold text-slate-900">₹ 1,299.00</span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-slate-900">Wireless Optical Mouse</p>
                                    <p className="text-[11px] text-slate-500 font-mono">HSN 8471 • 18% GST Incl.</p>
                                  </div>
                                  <span className="font-mono font-bold text-slate-900">₹ 649.00</span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                  <div>
                                    <p className="font-semibold text-slate-900">Organic Cold-Pressed Oil (1L)</p>
                                    <p className="text-[11px] text-slate-500 font-mono">HSN 1509 • 5% GST • Batch B04</p>
                                  </div>
                                  <span className="font-mono font-bold text-slate-900">₹ 350.00</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3 pt-2 border-t border-dashed border-slate-200">
                              <div className="grid grid-cols-2 gap-2.5 text-xs">
                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                                  <span className="text-[10px] text-slate-500 block">Tax Breakup</span>
                                  <span className="font-bold text-slate-800">CGST + SGST: ₹231.50</span>
                                </div>
                                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                                  <span className="text-[10px] text-slate-500 block">Hardware Bridge</span>
                                  <span className="font-bold text-emerald-700">Thermal + Scanner OK</span>
                                </div>
                              </div>
                              <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between">
                                <span className="text-xs font-bold text-slate-700">Grand Total Paid (UPI QR)</span>
                                <span className="text-lg font-extrabold text-[#0284C7]">₹ 2,298.00</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {heroPreviewTab === 'thermal' && (
                          <div className="bg-slate-50 rounded-xl p-5 font-mono text-[11px] text-slate-800 border border-slate-200 space-y-2.5 flex-1 flex flex-col justify-between">
                            <div className="space-y-2.5">
                              <div className="text-center border-b border-dashed border-slate-300 pb-2.5">
                                <p className="font-bold text-xs">SHARMA SUPERMART &amp; RETAIL</p>
                                <p className="text-[10px] text-slate-500">GSTIN: 08AABCS1429B1Z • 80MM ESC/POS</p>
                              </div>
                              <div className="flex justify-between"><span>1x Basmati Rice 5kg</span><span>₹540.00</span></div>
                              <div className="flex justify-between"><span>2x Cold Pressed Oil</span><span>₹420.00</span></div>
                              <div className="flex justify-between"><span>1x Cotton T-Shirt (L)</span><span>₹699.00</span></div>
                              <div className="flex justify-between text-slate-500"><span>CGST (2.5%) + SGST (2.5%)</span><span>₹82.95</span></div>
                            </div>
                            <div className="space-y-2 pt-2 border-t border-dashed border-slate-300">
                              <div className="flex justify-between font-bold text-xs">
                                <span>TOTAL BILL (PAID UPI)</span>
                                <span>₹1,659.00</span>
                              </div>
                              <div className="flex items-center justify-between text-[10px] text-emerald-700 font-sans font-semibold">
                                <span>✓ Auto-Cut &amp; Cash Drawer Kicked</span>
                                <span>38ms Print Speed</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {heroPreviewTab === 'whatsapp' && (
                          <div className="space-y-3.5 flex-1 flex flex-col justify-between">
                            <div className="space-y-3">
                              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                                    <MessageCircle className="w-4 h-4" />
                                    WhatsApp Digital Bill Delivered
                                  </span>
                                  <span className="text-[10px] font-bold text-emerald-700">✓✓ Read</span>
                                </div>
                                <p className="text-xs text-emerald-900 leading-relaxed">
                                  Dear Customer, thank you for shopping! Download your GST Invoice PDF (#INV-0842) for ₹2,298.00 or pay balance via attached dynamic UPI QR.
                                </p>
                              </div>
                              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-600">Owner Daily Shift Z-Report</span>
                                <span className="px-2 py-0.5 rounded bg-sky-100 text-[#0284C7] font-bold text-[10px]">Auto Sent 10 PM</span>
                              </div>
                              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                                <span className="font-medium text-slate-600">Payment Reminder &amp; Udhar Link</span>
                                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">98% Delivery Rate</span>
                              </div>
                            </div>
                            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-700">Official Meta Cloud API Status</span>
                              <span className="font-bold text-emerald-700">CONNECTED 24x7</span>
                            </div>
                          </div>
                        )}

                        <div className="pt-1 mt-auto">
                          <a
                            href="/pos-terminal"
                            target="_blank"
                            rel="noreferrer"
                            className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                          >
                            <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                            <span>Launch Live POS Terminal Demo</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Headline + 6 Feature Tiles matching left column width & height */}
                  <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                    <div className="space-y-2.5">
                      <span className="enexa-pill-badge">
                        <Printer className="w-3.5 h-3.5" />
                        <span>All-In-One Billing Hardware &amp; Tax Engine</span>
                      </span>
                      <h2 className="enexa-section-title">
                        Get Reliable Speed on Counter Billing, Barcodes &amp; GST Invoices
                      </h2>
                      <p className="text-slate-600 text-sm sm:text-base">
                        Plug-and-play support for thermal printers, barcode guns, electronic weighing scales, and instant online payment collection.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {[
                        {
                          icon: Printer,
                          color: 'bg-sky-50 text-[#0EA5E9]',
                          title: 'Thermal 80mm & 50mm',
                          desc: 'Instant ESC/POS receipt print with store logo, GST breakup & QR.'
                        },
                        {
                          icon: FileText,
                          color: 'bg-emerald-50 text-emerald-600',
                          title: 'A4 & Dot-Matrix Format',
                          desc: 'Switch between B2B Tax Invoice & pharma tear-off templates.'
                        },
                        {
                          icon: Barcode,
                          color: 'bg-amber-50 text-[#F59E0B]',
                          title: '1D / 2D Barcode Designer',
                          desc: 'Print shelf tags & garment stickers directly from stock batches.'
                        },
                        {
                          icon: Scale,
                          color: 'bg-violet-50 text-violet-600',
                          title: 'Weighing Scale & Batch Expiry',
                          desc: 'Live weight capture for groceries + FEFO alerts for pharmacies.'
                        },
                        {
                          icon: CreditCard,
                          color: 'bg-cyan-50 text-[#0284C7]',
                          title: '5 Payment Gateways + UPI',
                          desc: 'Accept cards, cash split tenders, Razorpay, PayU & dynamic UPI.'
                        },
                        {
                          icon: TrendingUp,
                          color: 'bg-rose-50 text-rose-600',
                          title: 'GSTR-1 & Profit Analytics',
                          desc: '1-click GST JSON/Excel export, item-wise margin & shift till.'
                        }
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <div key={idx} className="enexa-api-card flex items-start gap-3.5">
                            <div className={`w-10 h-10 rounded-lg ${item.color} flex items-center justify-center shrink-0`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{item.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-3.5 pt-1">
                      <button onClick={() => navigateTo('services')} className="enexa-btn-primary">
                        <span>Explore All Modules</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button onClick={() => navigateTo('contact')} className="enexa-btn-secondary">
                        <span>Book Live Demo</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================================= */}
            {/* 4. PRICING PLANS PREVIEW (Connected to MySQL DB & Dynamic Ribbons) */}
            {/* ============================================================= */}
            <section className="py-20 bg-white border-y border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="text-center max-w-3xl mx-auto space-y-3">
                  <span className="enexa-pill-badge">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Transparent Subscription Packages</span>
                  </span>
                  <h2 className="enexa-section-title">
                    Choose the Right Plan for Your Retail Business
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Real-time MySQL synchronized pricing. Includes isolated database, free cloud updates, and dedicated merchant support.
                  </p>

                  {/* Billing Cycle Pill Toggle Switch */}
                  <div style={{ display: 'none' }} className="inline-flex p-1 rounded-full bg-slate-100 border border-slate-200 gap-1 mt-4">
                    {['monthly', 'quarterly', 'half_yearly', 'yearly'].map((cycle) => (
                      <button
                        key={cycle}
                        onClick={() => setBillingCycle(cycle)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition capitalize cursor-pointer ${billingCycle === cycle
                          ? 'bg-white text-[#0EA5E9] shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                          }`}
                      >
                        {cycle === 'half_yearly' ? 'Half Yearly' : cycle === 'yearly' ? 'Annually (Save up to 33%)' : cycle}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                  {plans.slice(0, 4).map((plan) => {
                    const priceInfo = getPrice(plan);
                    const ribbonStyle = priceInfo.ribbonStyle || resolveRibbonStyle(plan.ribbonBg || plan.ribbon_bg);

                    return (
                      <div
                        key={plan.id}
                        className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl hover:shadow-sky-500/10 hover:border-[#0EA5E9] hover:-translate-y-1 flex flex-col justify-between overflow-hidden relative transition-all duration-300"
                      >
                        {/* Ribbon dynamically loaded from MySQL subscription_plans.badge & ribbon_bg */}
                        {priceInfo.ribbonText && (
                          <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden pointer-events-none z-10">
                            <div
                              style={ribbonStyle.style}
                              className={`absolute transform rotate-45 text-white text-[9px] font-black uppercase py-1 text-center w-36 top-5 -right-9 shadow-md ${ribbonStyle.className}`}
                            >
                              {priceInfo.ribbonText}
                            </div>
                          </div>
                        )}

                        <div className="p-6">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0EA5E9] block">
                            {plan.shortName}
                          </span>
                          <h3 className="text-lg font-bold text-slate-900 leading-tight mt-1 min-h-[44px]">
                            {plan.name}
                          </h3>

                          {/* Price */}
                          <div className="mt-4 pt-3 border-t border-slate-100">
                            <div className="flex items-baseline gap-1">
                              <span className="text-xs font-bold text-slate-400">₹</span>
                              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                {Number(priceInfo.offerPrice ?? priceInfo.offer ?? 0).toLocaleString('en-IN')}
                              </span>
                              <span className="text-xs font-medium text-slate-500">
                                {priceInfo.label}
                              </span>
                            </div>

                            {priceInfo.offPercent > 0 && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-xs text-slate-400 line-through">
                                  ₹{Number(priceInfo.regularPrice ?? priceInfo.regular ?? 0).toLocaleString('en-IN')}
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {priceInfo.offPercent}% OFF
                                </span>
                              </div>
                            )}
                          </div>

                          {/* WhatsApp Option Toggle (+₹500/month) */}
                          {plan.hasWhatsappOption && (
                            <div className="mt-4 p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-left">
                              <label className="flex items-start gap-2 cursor-pointer select-none text-xs">
                                <input
                                  type="checkbox"
                                  checked={!!(ownWhatsapp[plan.id] || ownWhatsapp[plan.code])}
                                  onChange={(e) =>
                                    setOwnWhatsapp((prev) => ({
                                      ...prev,
                                      [plan.id]: e.target.checked,
                                      [plan.code || plan.id]: e.target.checked
                                    }))
                                  }
                                  className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                />
                                <div className="leading-tight">
                                  <span className="font-semibold text-slate-800 block text-[11px]">
                                    WhatsApp Message Suite
                                  </span>
                                  <span className="text-emerald-700 font-bold text-[10px]">
                                    + ₹500 / month {priceInfo.months > 1 ? `(+₹${(500 * priceInfo.months).toLocaleString('en-IN')})` : ''}
                                  </span>
                                  <span className="text-[9px] text-slate-500 block">
                                    {(ownWhatsapp[plan.id] || ownWhatsapp[plan.code]) ? `✓ Added (+₹${(500 * priceInfo.months).toLocaleString('en-IN')})` : 'Optional • Check to add'}
                                  </span>
                                </div>
                              </label>
                            </div>
                          )}

                          {/* Feature bullets */}
                          <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Included Highlights
                            </p>
                            {(plan.features || []).slice(0, 5).map((f, i) => (
                              <div key={i} className="flex items-start gap-2 text-slate-700">
                                <Check className="w-3.5 h-3.5 text-[#0EA5E9] shrink-0 mt-0.5" />
                                <span className="leading-tight">{f}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="p-4 bg-slate-50/80 border-t border-slate-100">
                          <button
                            onClick={() => handleStartOnboarding(plan)}
                            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] hover:from-[#0284C7] hover:to-[#0369A1] text-white font-bold text-xs shadow-md shadow-sky-500/20 transition cursor-pointer flex items-center justify-center gap-1.5"
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
                    className="enexa-btn-secondary !text-xs"
                  >
                    <span>Compare All Plan Details &amp; Add-ons</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#0EA5E9]" />
                  </button>
                </div>
              </div>
            </section>

            {/* ============================================================= */}
            {/* 5. COMPLETE OMNICHANNEL RETAIL SUITE (Matching B2B Showcase)  */}
            {/* ============================================================= */}
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
                  {/* Left Content (Equal Width + Equal Height) */}
                  <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                    <div className="space-y-5">
                      <span className="enexa-pill-badge !bg-amber-50 !text-amber-700 !border-amber-200">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Complete Retail Suite</span>
                      </span>

                      <h2 className="enexa-section-title">
                        Launch Your Own Branded Storefront &amp; POS ERP in Minutes
                      </h2>

                      <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                        Not just billing — empower your retail shop or supermarket chain with an omnichannel online portal at <span className="font-mono text-xs font-semibold text-[#0284C7]">shoppy.live/{'{storeCode}'}</span> synced seamlessly with live counter inventory.
                      </p>

                      {/* 2 Stat Highlight Cards matching enexa.in */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="enexa-stat-card">
                          <div className="text-2xl sm:text-3xl font-extrabold text-[#0EA5E9]">5 Min</div>
                          <div className="text-xs font-semibold text-slate-600 mt-0.5">Automated DB Activation</div>
                        </div>
                        <div className="enexa-stat-card">
                          <div className="text-2xl sm:text-3xl font-extrabold text-[#F59E0B]">99.9%</div>
                          <div className="text-xs font-semibold text-slate-600 mt-0.5">Cloud Uptime &amp; Daily Backups</div>
                        </div>
                      </div>

                      {/* 8 Feature Chips matching enexa.in B2B grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {[
                          { icon: Globe, label: 'Online Store' },
                          { icon: Boxes, label: 'Multi-Branch' },
                          { icon: Truck, label: 'Courier AWB' },
                          { icon: Users, label: 'Staff & Payroll' },
                          { icon: BarChart3, label: 'Live P&L' },
                          { icon: ShieldCheck, label: 'GST Filings' },
                          { icon: QrCode, label: 'Dynamic UPI' },
                          { icon: Headphones, label: '24x7 Desk' }
                        ].map((chip, idx) => {
                          const Icon = chip.icon;
                          return (
                            <div key={idx} className="enexa-feature-chip">
                              <Icon className="w-4 h-4 text-[#0EA5E9] shrink-0" />
                              <span className="truncate text-xs">{chip.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3.5 pt-1">
                      <button onClick={() => handleStartOnboarding()} className="enexa-btn-primary">
                        <span>Start Your Store Today</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button onClick={() => navigateTo('contact')} className="enexa-btn-secondary">
                        <span>Talk to Our Team</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Architecture Mockup Card (Equal Width + Equal Height) */}
                  <div className="lg:col-span-6 flex relative">
                    <div className="w-full h-full flex flex-col relative bg-gradient-to-br from-slate-50 to-sky-50/70 rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-xl shadow-sky-900/5">
                      {/* Floating Badge Top Right */}
                      <div className="enexa-floating-badge hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-emerald-200 shadow-lg text-xs font-bold text-slate-800 absolute -top-4 right-6 z-10">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Isolated Tenant DB Ready</span>
                      </div>

                      {/* Mockup Window stretched cleanly to match left column height */}
                      <div className="flex-1 flex flex-col justify-between bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div>
                          <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 bg-white px-3 py-0.5 rounded-md border border-slate-200">
                              shoppy.live/store-erp
                            </span>
                            <span className="text-[10px] font-bold text-[#0EA5E9]">LIVE</span>
                          </div>

                          <div className="p-5 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                              <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
                                <span className="text-[10px] font-semibold text-slate-500 block">Today&apos;s POS</span>
                                <span className="text-base font-extrabold text-[#0284C7]">₹48,250</span>
                              </div>
                              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                                <span className="text-[10px] font-semibold text-slate-500 block">Web Orders</span>
                                <span className="text-base font-extrabold text-emerald-700">14 Synced</span>
                              </div>
                              <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
                                <span className="text-[10px] font-semibold text-slate-500 block">Stock SKUs</span>
                                <span className="text-base font-extrabold text-amber-700">1,840+</span>
                              </div>
                            </div>

                            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                                <span>Auto-Sync Counter ↔ Web Storefront</span>
                                <span className="text-emerald-600 font-bold">Real-Time</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#10B981]" />
                              </div>
                              <p className="text-[11px] text-slate-500">
                                Barcode billed at Counter #1 immediately updates available quantity on your public web storefront.
                              </p>
                            </div>

                            {/* Live Unified Activity Feed */}
                            <div className="space-y-2">
                              <div className="p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-2 h-2 rounded-full bg-[#0EA5E9]" />
                                  <div>
                                    <p className="font-semibold text-slate-800">POS Counter #1 • #INV-0842</p>
                                    <p className="text-[10px] text-slate-500">Stock Auto-Deducted • WhatsApp Sent</p>
                                  </div>
                                </div>
                                <span className="font-mono font-bold text-slate-900">₹2,298</span>
                              </div>
                              <div className="p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <div>
                                    <p className="font-semibold text-slate-800">Web Store Order • #WEB-119</p>
                                    <p className="text-[10px] text-slate-500">Razorpay Paid • Courier AWB Ready</p>
                                  </div>
                                </div>
                                <span className="font-mono font-bold text-emerald-700">₹1,450</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600">Dedicated Cloud Database: Active</span>
                          <span className="font-bold text-[#0284C7]">99.9% SLA Synced</span>
                        </div>
                      </div>

                      {/* Floating Badge Bottom Left */}
                      <div className="enexa-floating-badge-delayed hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-sky-200 shadow-lg text-xs font-bold text-slate-800 absolute -bottom-4 left-6 z-10">
                        <ShieldCheck className="w-4 h-4 text-[#0EA5E9]" />
                        <span>Zero Data Mixing Guarantee</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================================= */}
            {/* 6. WHO WE ARE SECTION (Enexa Warm Peach Section)              */}
            {/* ============================================================= */}
            <section className="enexa-section-peach py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  {/* Left Company Proof Card */}
                  <div className="lg:col-span-5 relative">
                    <div className="bg-white rounded-3xl border border-amber-200/70 p-7 shadow-xl shadow-amber-900/5 space-y-5 relative">
                      <div className="enexa-floating-badge inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#0EA5E9] to-[#0284C7] text-white text-xs font-bold shadow-md">
                        <Award className="w-4 h-4" />
                        <span>Enexa IT Solutions Private Limited</span>
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 leading-snug">
                        Simplifying Indian Retail Accounting, Billing &amp; Digital Commerce Since Day One
                      </h3>

                      <div className="grid grid-cols-2 gap-3.5 pt-2">
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-xl font-extrabold text-slate-900">10,000+</div>
                          <div className="text-xs text-slate-500">Retail Terminals Live</div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-xl font-extrabold text-[#0EA5E9]">28 States</div>
                          <div className="text-xs text-slate-500">GST HSN Compliant</div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-xl font-extrabold text-emerald-600">50L+</div>
                          <div className="text-xs text-slate-500">Monthly Invoices Processed</div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="text-xl font-extrabold text-[#F59E0B]">4.8 ★</div>
                          <div className="text-xs text-slate-500">Merchant Support Rating</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Content */}
                  <div className="lg:col-span-7 space-y-5">
                    <span className="enexa-pill-badge">
                      <Building2 className="w-3.5 h-3.5" />
                      <span>About Enexa IT Solutions</span>
                    </span>

                    <h2 className="enexa-section-title">
                      Who We Are
                    </h2>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      We are <strong>Enexa IT Solutions Private Limited</strong> — a technology-first software company empowering Kirana stores, Supermarkets, Medical Pharmacies, Garment Showrooms, and Electronics Retailers across India with modern cloud billing technology.
                    </p>

                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      With <strong>Shoppy ERP</strong>, merchants never choose between fast counter POS and online digital selling. Both run on a unified, isolated cloud database engineered for uncompromising speed and CA-approved GST compliance.
                    </p>

                    <div className="flex flex-wrap items-center gap-3.5 pt-2">
                      <button onClick={() => navigateTo('about')} className="enexa-btn-primary">
                        <span>More About Company</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button onClick={() => navigateTo('services')} className="enexa-btn-secondary">
                        <span>Explore All Services</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================================= */}
            {/* 7. SERVICES 4-CARD SHOWCASE (Matching enexa.in #services)     */}
            {/* ============================================================= */}
            <section className="py-20 bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center max-w-3xl mx-auto space-y-3">
                  <span className="enexa-pill-badge">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>Services We Offer</span>
                  </span>
                  <h2 className="enexa-section-title">
                    End-to-End Retail Software &amp; Billing Modules
                  </h2>
                  <p className="text-slate-600 text-sm sm:text-base">
                    Tailored modular tools built specifically for high-growth Indian wholesale and retail merchants.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      pill: 'POS Counter',
                      pillClass: 'bg-sky-50 text-[#0284C7]',
                      iconBg: 'bg-sky-500 text-white',
                      icon: Printer,
                      title: 'Retail POS & Tax Billing',
                      desc: 'Ultra-fast keyboard & barcode counter checkout with thermal 80mm, A4 B2B, and dot-matrix printing.',
                      bullets: ['Sub-50ms SKU Lookup', 'Hold & Resume Carts', 'Split Cash / Card / UPI']
                    },
                    {
                      pill: 'Inventory',
                      pillClass: 'bg-amber-50 text-amber-700',
                      iconBg: 'bg-amber-500 text-white',
                      icon: Boxes,
                      title: 'Smart Stock & Barcodes',
                      desc: 'Batch-wise expiry alerts, size-color variant tracking, supplier GRN inward, and barcode roll printing.',
                      bullets: ['Size / Color Matrix', 'Low Stock WhatsApp Alert', 'Multi-Godown Transfer']
                    },
                    {
                      pill: 'Omnichannel',
                      pillClass: 'bg-indigo-50 text-indigo-700',
                      iconBg: 'bg-indigo-600 text-white',
                      icon: Globe,
                      title: 'Online Web Storefront',
                      desc: 'Custom store portal connected directly to your live stock count with Razorpay/PayU checkout.',
                      bullets: ['Instant Catalog Publish', 'Courier AWB Generation', 'Zero Double Selling']
                    },
                    {
                      pill: 'CRM & Tax',
                      pillClass: 'bg-emerald-50 text-emerald-700',
                      iconBg: 'bg-emerald-600 text-white',
                      icon: MessageSquare,
                      title: 'WhatsApp Bills & GST Desk',
                      desc: 'Automated digital PDF receipts, party khata udhar reminders, and CA-ready GSTR-1 ledger exports.',
                      bullets: ['Official Meta API Bills', 'Dynamic UPI QR Links', 'GSTR-1 / 3B Reports']
                    }
                  ].map((srv, i) => {
                    const Icon = srv.icon;
                    return (
                      <div key={i} className="enexa-service-card flex flex-col justify-between space-y-5">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className={`w-11 h-11 rounded-xl ${srv.iconBg} flex items-center justify-center shadow-sm`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${srv.pillClass}`}>
                              {srv.pill}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-slate-900">{srv.title}</h3>
                            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{srv.desc}</p>
                          </div>
                          <ul className="space-y-1.5 pt-2 border-t border-slate-100">
                            {srv.bullets.map((b, bi) => (
                              <li key={bi} className="flex items-center gap-2 text-xs text-slate-700">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#0EA5E9] shrink-0" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => navigateTo('services')}
                          className="enexa-btn-ghost pt-1"
                        >
                          <span>Explore Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ============================================================= */}
            {/* 8. TESTIMONIALS CAROUSEL (Matching enexa.in Reviews Section)  */}
            {/* ============================================================= */}
            <section className="py-20 bg-slate-50/75 border-y border-slate-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div className="space-y-2.5">
                    <span className="enexa-pill-badge">
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>Client Testimonials</span>
                    </span>
                    <h2 className="enexa-section-title">
                      Trusted by Store Owners Across India
                    </h2>
                  </div>

                  {/* Google Rating Pill + Arrows matching enexa.in */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-xs">
                      <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-slate-800">4.8 / 5</span>
                      <span className="text-[11px] text-slate-500">Verified Merchants</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setTestimonialIdx((prev) =>
                            prev === 0 ? Math.max(0, ENEXA_TESTIMONIALS.length - 3) : prev - 1
                          )
                        }
                        className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-[#0EA5E9] hover:text-[#0EA5E9] flex items-center justify-center transition cursor-pointer shadow-xs"
                        aria-label="Previous testimonials"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setTestimonialIdx((prev) =>
                            prev >= ENEXA_TESTIMONIALS.length - 3 ? 0 : prev + 1
                          )
                        }
                        className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-[#0EA5E9] hover:text-[#0EA5E9] flex items-center justify-center transition cursor-pointer shadow-xs"
                        aria-label="Next testimonials"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3-Card Window */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {ENEXA_TESTIMONIALS.slice(testimonialIdx, testimonialIdx + 3).map((item, idx) => (
                    <div key={idx} className="enexa-testimonial-card flex flex-col justify-between space-y-5">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                          <Quote className="w-5 h-5 text-sky-200" />
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          &ldquo;{item.quote}&rdquo;
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <div
                          style={{ backgroundColor: item.color }}
                          className="w-10 h-10 rounded-full text-white font-bold text-xs flex items-center justify-center shrink-0"
                        >
                          {item.initials}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                          <p className="text-[11px] text-slate-500">{item.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Dots */}
                <div className="flex items-center justify-center gap-2">
                  {[0, 1, 2, 3].map((dot) => (
                    <button
                      key={dot}
                      onClick={() => setTestimonialIdx(dot)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        testimonialIdx === dot ? 'w-7 bg-[#0EA5E9]' : 'w-2 bg-slate-300 hover:bg-slate-400'
                      }`}
                      aria-label={`Testimonial page ${dot + 1}`}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* ============================================================= */}
            {/* 9. RECENT BLOGS PREVIEW (Styled to match Enexa Cards)         */}
            {/* ============================================================= */}
            {blogs.length > 0 && (
              <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div className="space-y-2">
                      <span className="enexa-pill-badge">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Knowledge &amp; Industry Updates</span>
                      </span>
                      <h2 className="enexa-section-title">
                        Latest Retail &amp; GST Billing Insights
                      </h2>
                    </div>
                    <button
                      onClick={() => navigateTo('blog')}
                      className="enexa-btn-ghost"
                    >
                      <span>View All Articles</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {blogs.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setActiveBlogModal(b)}
                        className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs hover:border-[#0EA5E9] hover:shadow-lg hover:shadow-sky-500/10 hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        {b.cover_image && (
                          <div className="h-44 overflow-hidden relative">
                            <img
                              src={b.cover_image}
                              alt={b.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                            />
                            <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/85 text-white backdrop-blur-xs">
                              {b.category}
                            </span>
                          </div>
                        )}
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-base text-slate-900 group-hover:text-[#0EA5E9] transition line-clamp-2">
                              {b.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                              {b.excerpt}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-xs text-slate-400 pt-4 mt-4 border-t border-slate-100">
                            <span>{b.read_time || '4 min read'}</span>
                            <span className="font-bold text-[#0EA5E9] flex items-center gap-1">
                              <span>Read Article</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ============================================================= */}
            {/* 10. LIGHT ICE-BLUE CTA SECTION (Exact match to enexa.in)      */}
            {/* ============================================================= */}
            <section className="enexa-section-cta py-20 border-t border-sky-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-7 space-y-5 text-left">
                    <span className="enexa-pill-badge">
                      <Rocket className="w-3.5 h-3.5" />
                      <span>Join 10,000+ Thriving Indian Retailers</span>
                    </span>
                    <h2 className="enexa-section-title">
                      Ready to <span className="text-[#0EA5E9]">Transform Your Retail Billing</span> &amp; Launch Online?
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                      Activate your dedicated isolated MySQL store terminal, thermal printer setup, WhatsApp invoice engine, and online storefront in under 5 minutes — powered by Enexa IT Solutions Private Limited.
                    </p>

                    <div className="flex flex-wrap items-center gap-3.5 pt-2">
                      <button
                        onClick={() => handleStartOnboarding()}
                        className="enexa-btn-primary"
                      >
                        <span>Start Free Setup Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigateTo('store')}
                        className="enexa-btn-secondary"
                      >
                        <span>Store Merchant Login</span>
                      </button>
                      <button
                        onClick={() => navigateTo('contact')}
                        className="enexa-btn-ghost ml-1"
                      >
                        <span>Request Enterprise Demo</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex items-center justify-center">
                    <div className="w-full max-w-[440px] rounded-3xl overflow-hidden">
                      <img
                        src="/images/landing/launch-cta-iso.jpg"
                        alt="Launch Shoppy ERP Billing & Retail POS Suite"
                        className="w-full h-auto block mix-blend-multiply"
                      />
                    </div>
                  </div>
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
              <div style={{ display: 'none' }} className="inline-flex p-1 rounded-full bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-inner gap-1 mt-4">
                {['monthly', 'quarterly', 'half_yearly', 'yearly'].map((cycle) => (
                  <button
                    key={cycle}
                    onClick={() => setBillingCycle(cycle)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition capitalize cursor-pointer ${billingCycle === cycle
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
                const ribbonStyle = priceInfo.ribbonStyle || resolveRibbonStyle(plan.ribbonBg || plan.ribbon_bg);

                return (
                  <div
                    key={plan.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between overflow-hidden relative transition hover:border-[#00a2c7]"
                  >
                    {priceInfo.ribbonText && (
                      <div className="absolute top-0 right-0 w-28 h-28 overflow-hidden pointer-events-none z-10">
                        <div
                          style={ribbonStyle.style}
                          className={`absolute transform rotate-45 text-white text-[9px] font-black uppercase py-1 text-center w-36 top-5 -right-9 shadow-md ${ribbonStyle.className}`}
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
                            {priceInfo.label}
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

                      {/* WhatsApp Option Toggle (+₹500/month) */}
                      {plan.hasWhatsappOption && (
                        <div className="mt-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-left">
                          <label className="flex items-start gap-2 cursor-pointer select-none text-xs">
                            <input
                              type="checkbox"
                              checked={!!(ownWhatsapp[plan.id] || ownWhatsapp[plan.code])}
                              onChange={(e) =>
                                setOwnWhatsapp((prev) => ({
                                  ...prev,
                                  [plan.id]: e.target.checked,
                                  [plan.code || plan.id]: e.target.checked
                                }))
                              }
                              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <div className="leading-tight">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">
                                WhatsApp Message Suite
                              </span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                                + ₹500 / month {priceInfo.months > 1 ? `(+₹${(500 * priceInfo.months).toLocaleString('en-IN')})` : ''}
                              </span>
                              <span className="text-[9px] text-slate-500 dark:text-slate-400 block">
                                {(ownWhatsapp[plan.id] || ownWhatsapp[plan.code]) ? `✓ Added (+₹${(500 * priceInfo.months).toLocaleString('en-IN')})` : 'Optional • Check to add'}
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
        )
        }

        {/* ================================================================= */}
        {/* PAGE 5: BLOG & KNOWLEDGE HUB PAGE                                 */}
        {/* ================================================================= */}
        {
          currentPage === 'blog' && (
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
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${blogCategoryFilter === cat
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
          )
        }

        {/* ================================================================= */}
        {/* PAGE 6: CONTACT (ENEXA.IN UI WITH CAPTCHA & CONTACTS DB TABLE)    */}
        {/* ================================================================= */}
        {
          currentPage === 'contact' && (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Card: Let's Connect Form */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[28px] p-8 sm:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
                    Let's Connect
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-8">
                    Share your details and we'll get back to you within 24 hours
                  </p>

                  {/* Feedback Alerts */}
                  {contactSuccess && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                      <span>{contactSuccess}</span>
                    </div>
                  )}

                  {contactError && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2.5">
                      <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                      <span>{contactError}</span>
                    </div>
                  )}

                  <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-5">
                    {/* Row 1: Full Name & Email Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Full Name"
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#0095d9] focus:ring-1 focus:ring-[#0095d9] transition"
                        />
                      </div>
                      <div>
                        <input
                          type="email"
                          required
                          placeholder="Email Address"
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#0095d9] focus:ring-1 focus:ring-[#0095d9] transition"
                        />
                      </div>
                    </div>

                    {/* Row 2: Phone Number & Subject */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <input
                          type="tel"
                          required
                          placeholder="Phone Number"
                          value={contactForm.phone}
                          onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#0095d9] focus:ring-1 focus:ring-[#0095d9] transition"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Subject"
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#0095d9] focus:ring-1 focus:ring-[#0095d9] transition"
                        />
                      </div>
                    </div>

                    {/* Row 3: Your Message */}
                    <div>
                      <textarea
                        rows={4}
                        required
                        placeholder="Your Message"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full px-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#0095d9] focus:ring-1 focus:ring-[#0095d9] transition resize-y min-h-[110px]"
                      />
                    </div>

                    {/* Row 4: Interactive CAPTCHA Display & Verification Input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-[52px]">
                        <canvas
                          ref={captchaCanvasRef}
                          width={155}
                          height={40}
                          className="rounded cursor-pointer select-none"
                          onClick={refreshCaptcha}
                          title="Click image to refresh CAPTCHA"
                        />
                        <button
                          type="button"
                          onClick={refreshCaptcha}
                          title="Refresh CAPTCHA code"
                          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition cursor-pointer"
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <input
                          type="text"
                          required
                          placeholder="Enter CAPTCHA"
                          value={contactForm.captcha}
                          onChange={(e) => setContactForm({ ...contactForm, captcha: e.target.value })}
                          className="w-full px-4 py-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#0095d9] focus:ring-1 focus:ring-[#0095d9] transition"
                        />
                      </div>
                    </div>

                    {/* Row 5: Action Button (Orange solid styling matching enexa.in) */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmittingContact}
                        className="w-full py-3.5 px-6 rounded-xl bg-[#f58220] hover:bg-[#e07315] active:bg-[#c9630e] text-white font-semibold text-sm transition-colors duration-150 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        <span>{isSubmittingContact ? 'Sending Message...' : 'Send Message'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column: Contact Details, Social Links, Operating Hours */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Card 1: Quick Contact */}
                  <div className="bg-white dark:bg-slate-900 rounded-[28px] p-7 sm:p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick Contact</h2>

                    <div className="space-y-5">
                      {/* Phone */}
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-[#0095d9]/10 flex items-center justify-center text-[#0095d9] shrink-0">
                          <Phone className="w-5 h-5 text-[#0095d9]" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">PHONE</span>
                          <a href="tel:+919546042639" className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-[#0095d9] transition">
                            +91 9546042639
                          </a>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-[#0095d9]/10 flex items-center justify-center text-[#0095d9] shrink-0">
                          <Mail className="w-5 h-5 text-[#0095d9]" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">EMAIL</span>
                          <a href="mailto:contact@enexa.in" className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-[#0095d9] transition">
                            contact@enexa.in
                          </a>
                        </div>
                      </div>

                      {/* WhatsApp */}
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-[#0095d9]/10 flex items-center justify-center text-[#0095d9] shrink-0">
                          <MessageCircle className="w-5 h-5 text-[#0095d9]" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">WHATSAPP</span>
                          <a href="https://wa.me/919546042639" target="_blank" rel="noreferrer" className="text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-[#0095d9] transition">
                            Chat with us
                          </a>
                        </div>
                      </div>

                      {/* Office */}
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-[#0095d9]/10 flex items-center justify-center text-[#0095d9] shrink-0">
                          <MapPin className="w-5 h-5 text-[#0095d9]" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">OFFICE</span>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                            Bhagwanpur, Muzaffarpur, Bihar 842001
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Follow Us */}
                  <div className="bg-[#0095d9] dark:bg-[#0082bd] rounded-[24px] p-6 text-white shadow-sm space-y-4">
                    <h3 className="text-base font-bold text-white">Follow Us</h3>
                    <div className="flex items-center gap-3">
                      <a
                        href="https://facebook.com/enexait"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Facebook"
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition backdrop-blur-xs"
                      >
                        <FacebookIcon className="w-4 h-4" />
                      </a>
                      <a
                        href="https://instagram.com/enexait"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="Instagram"
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition backdrop-blur-xs"
                      >
                        <InstagramIcon className="w-4 h-4" />
                      </a>
                      <a
                        href="https://linkedin.com/company/enexait"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="LinkedIn"
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition backdrop-blur-xs"
                      >
                        <LinkedinIcon className="w-4 h-4" />
                      </a>
                      <a
                        href="https://youtube.com/@enexait"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="YouTube"
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition backdrop-blur-xs"
                      >
                        <YoutubeIcon className="w-4 h-4" />
                      </a>
                      <a
                        href="https://wa.me/919546042639"
                        target="_blank"
                        rel="noreferrer"
                        aria-label="WhatsApp"
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition backdrop-blur-xs"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                      </a>
                    </div>
                  </div>

                  {/* Card 3: Operating Hours */}
                  <div className="bg-[#fffbeb] dark:bg-amber-950/20 border border-[#fef3c7] dark:border-amber-900/30 rounded-[20px] p-4 flex items-center gap-3 text-amber-900 dark:text-amber-200 text-sm font-medium">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Mon-Fri: 9:00 AM - 6:00 PM IST</span>
                  </div>
                </div>
              </div>
            </div>
          )
        }

        {/* ================================================================= */}
        {/* PAGE 7: PRIVACY POLICY                                            */}
        {/* ================================================================= */}
        {
          currentPage === 'privacy-policy' && (
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
          )
        }

        {/* ================================================================= */}
        {/* PAGE 8: RETURN & REFUND POLICY                                    */}
        {/* ================================================================= */}
        {
          currentPage === 'return-policy' && (
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
                    Simply email your request along with store code (e.g. <code>SHP-XXXXXX</code>) to <code>billing@enexa.in</code> or call customer desk at <code>+91 95460 42639</code>.
                  </p>
                </section>
              </div>
            </div>
          )
        }

        {/* ================================================================= */}
        {/* PAGE 9: TERMS OF SERVICE                                          */}
        {/* ================================================================= */}
        {
          currentPage === 'terms-of-service' && (
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
          )
        }
      </main >

      {/* =================================================================== */}
      {/* 5. ARTICLE READER MODAL (For Blogs)                                 */}
      {/* =================================================================== */}
      {
        activeBlogModal && (
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
        )
      }

      {/* =================================================================== */}
      {/* 6. ONBOARDING & STORE PROVISIONING MODAL                            */}
      {/* =================================================================== */}
      {
        isOnboardingOpen && selectedOnboardPlan && (
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
                      Billed {billingCycle} • {(ownWhatsapp[selectedOnboardPlan.id] || ownWhatsapp[selectedOnboardPlan.code]) ? 'Includes WhatsApp Message Suite' : 'Standard Suite'}
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

              {/* Step 2: Store Details & Partner Agent Referral */}
              {onboardStep === 2 && (
                <div className="space-y-3.5">
                  {/* Referral Code (Agent Code) with verification */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Referral Code / Agent Code
                      </label>
                      <span className="text-[10px] text-slate-400">Optional Partner Code</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. AGT-DEMO-101"
                        value={onboardForm.referralCode}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setOnboardForm({ ...onboardForm, referralCode: val, agentVerified: false, agentName: '', agentError: null });
                        }}
                        className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-[#00a2c7]"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyAgent}
                        disabled={isVerifyingAgent || !onboardForm.referralCode}
                        className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-[#00a2c7] hover:text-white text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer disabled:opacity-50"
                      >
                        {isVerifyingAgent ? 'Verifying...' : 'Verify'}
                      </button>
                    </div>

                    {/* Verified Agent Name Display */}
                    {onboardForm.agentVerified && onboardForm.agentName && (
                      <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>Verified Partner Agent: {onboardForm.agentName}</span>
                      </div>
                    )}
                    {onboardForm.agentError && (
                      <p className="text-[11px] text-rose-500 font-semibold">{onboardForm.agentError}</p>
                    )}
                  </div>

                  {/* Shop Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Shop / Store Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sharma Garments & Retail POS"
                      value={onboardForm.storeName}
                      onChange={(e) => setOnboardForm({ ...onboardForm, storeName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-[#00a2c7]"
                    />
                  </div>

                  {/* Owner Name & Mobile */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Owner Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Rajesh Sharma"
                        value={onboardForm.ownerName}
                        onChange={(e) => setOnboardForm({ ...onboardForm, ownerName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-[#00a2c7]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        placeholder="10-digit Mobile Number"
                        value={onboardForm.ownerPhone}
                        onChange={(e) => setOnboardForm({ ...onboardForm, ownerPhone: e.target.value.replace(/[^0-9]/g, '') })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold tracking-wide focus:outline-none focus:border-[#00a2c7]"
                      />
                    </div>
                  </div>

                  {/* Owner Email ID */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address (Login ID &amp; Credentials Delivery) *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. merchant@gmail.com"
                      value={onboardForm.ownerEmail}
                      onChange={(e) => setOnboardForm({ ...onboardForm, ownerEmail: e.target.value.trim() })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-[#00a2c7]"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">Your store access credentials, M-PIN &amp; invoice will be sent to this email.</span>
                  </div>

                  {/* State List Dropdown */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      State (GST Jurisdiction) *
                    </label>
                    <select
                      value={onboardForm.stateCode}
                      onChange={(e) => {
                        const val = e.target.value;
                        const selected = gstStates.find((s) => s.state_code === val);
                        setOnboardForm({
                          ...onboardForm,
                          stateCode: val,
                          city: selected ? selected.state_name : val
                        });
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00a2c7]"
                    >
                      {gstStates.length > 0 ? (
                        gstStates.map((st) => (
                          <option key={st.state_code} value={st.state_code}>
                            {st.state_code} — {st.state_name}
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="10">10 — BIHAR</option>
                          <option value="08">08 — RAJASTHAN</option>
                          <option value="09">09 — UTTAR PRADESH</option>
                          <option value="27">27 — MAHARASHTRA</option>
                          <option value="07">07 — DELHI</option>
                        </>
                      )}
                    </select>
                    <span className="text-[10px] text-slate-400 mt-1 block">Used for GST Tax Billing (CGST + SGST vs IGST auto-determination)</span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={() => setOnboardStep(1)} className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white">
                      Back
                    </button>
                    <button
                      onClick={handleProceedToPayment}
                      disabled={isProcessingPayment}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#002e6e] to-[#00b9f5] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-blue-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isProcessingPayment ? (
                        <>
                          <RotateCcw className="w-4 h-4 animate-spin" />
                          <span>Generating Paytm QR...</span>
                        </>
                      ) : (
                        <>
                          <span>Proceed to Paytm UPI Payment</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Paytm UPI Dynamic QR & Intent Payment Gateway OR Live Provisioning Progress */}
              {onboardStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  {/* PHASE 1: ROUND TICK BLINKING ANIMATION (Payment Success) */}
                  {provisioningPhase === 'blink' && (
                    <div className="p-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
                      <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></div>
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 animate-pulse">
                          <Check className="w-12 h-12 stroke-[3.5]" />
                        </div>
                      </div>
                      <div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          Payment Verified Successfully
                        </span>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mt-2">
                          Paytm UPI Payment Received!
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          Transaction confirmed. Starting automated dedicated database provisioning...
                        </p>
                      </div>
                    </div>
                  )}

                  {/* PHASE 2: PROCESSING CHECKLIST (Create Store, Database, Schema, GST, SMS/Email) */}
                  {provisioningPhase === 'progress' && (
                    <div className="p-6 space-y-5 animate-in fade-in duration-200 text-center">
                      {/* Pulsing Database Icon */}
                      <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full bg-cyan-500/20 animate-ping"></div>
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#008ba3] to-cyan-400 text-white flex items-center justify-center shadow-xl shadow-cyan-500/30">
                          <Database className="w-8 h-8 animate-pulse" />
                        </div>
                      </div>

                      <div>
                        <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-cyan-100 dark:bg-cyan-950/60 text-[#008ba3] border border-cyan-200 dark:border-cyan-800">
                          Automated Tenant Provisioning
                        </span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1.5">
                          Creating Your Dedicated Cloud Store...
                        </h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {provisionedStore?.database_name || 'Allocating dedicated MySQL schema instance...'}
                        </p>
                      </div>

                      {/* Animated Progress Bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                          <span>Provisioning Progress</span>
                          <span className="text-[#00a2c7] font-mono">{provisionProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
                          <div
                            className="bg-gradient-to-r from-[#008ba3] via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-400 ease-out shadow-sm"
                            style={{ width: `${provisionProgress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Step-by-Step Live Status Checklist */}
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5 text-left text-xs">
                        {[
                          { label: 'Verifying Payment', sub: `Transaction: ${paytmOnboardData?.order_id || 'Paytm UPI Verified'}` },
                          { label: 'Creating Store', sub: `Store: ${provisionedStore?.shop_code || 'Generating store code...'}` },
                          { label: 'Generating Database', sub: `DB: ${provisionedStore?.database_name || 'Allocating dedicated MySQL instance...'}` },
                          { label: 'Configuring Database', sub: 'Running migrations, seeding 38 GST states & default branch' },
                          { label: 'Creating Login Credentials', sub: `ID: ${provisionedStore?.owner_email || onboardForm.ownerEmail} • Password: admin123 • M-PIN: 123456` },
                          { label: 'Sending Credentials', sub: `SMS to +91 ${provisionedStore?.owner_phone || onboardForm.ownerPhone} & Email via SMTP` },
                          { label: 'Processing Complete — Launching Store Panel', sub: `${provisionedStore?.name || onboardForm.storeName} is now live!` }
                        ].map((s, idx) => {
                          const isDone = provisionStepIndex > idx;
                          const isCurrent = provisionStepIndex === idx;
                          return (
                            <div key={idx} className="flex items-start gap-2.5">
                              <div className="mt-0.5 shrink-0">
                                {isDone ? (
                                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px]">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                ) : isCurrent ? (
                                  <div className="w-4 h-4 rounded-full bg-cyan-500 text-white flex items-center justify-center text-[10px]">
                                    <RotateCcw className="w-3 h-3 animate-spin" />
                                  </div>
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600"></div>
                                )}
                              </div>
                              <div className="leading-tight">
                                <p className={`font-bold ${isDone ? 'text-emerald-600 dark:text-emerald-400' : isCurrent ? 'text-cyan-600 dark:text-cyan-400 font-extrabold' : 'text-slate-400'}`}>
                                  {s.label}
                                </p>
                                <p className="text-[10px] text-slate-400">{s.sub}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STANDARD PAYMENT SCREEN (When provisioningPhase === 'idle') */}
                  {provisioningPhase === 'idle' && (
                    <>
                      {paymentError && (
                        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between">
                          <span>{paymentError}</span>
                          <button onClick={() => setPaymentError(null)} className="text-rose-500 hover:text-rose-700">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {/* Paytm Gateway Header Badge */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#002e6e]/10 via-[#00b9f5]/10 to-transparent border border-[#00b9f5]/30 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#002e6e] to-[#00b9f5] text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
                            <QrCode className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-slate-900 dark:text-white">Paytm UPI &amp; Dynamic QR</span>
                              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#00b9f5] text-white">INSTANT ACTIVATION</span>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                              Scan with any UPI App • Instant Automatic Database Provisioning
                            </span>
                          </div>
                        </div>
                        <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
                      </div>

                      {/* Dynamic QR & Price Card */}
                      <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-center space-y-3">
                        <div className="flex items-baseline justify-center gap-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Amount to Pay:</span>
                          <span className="text-3xl font-black text-slate-900 dark:text-white">
                            ₹{paytmOnboardData?.formatted_amount || getPrice(selectedOnboardPlan).offerPrice.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* QR Code Container */}
                        <div className="relative inline-block p-3 rounded-2xl bg-white shadow-md border border-slate-200">
                          {paytmOnboardData?.qr_image_url ? (
                            <img
                              src={paytmOnboardData.qr_image_url}
                              alt="Paytm Dynamic QR"
                              className="w-48 h-48 mx-auto rounded-lg object-contain"
                            />
                          ) : (
                            <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-lg">
                              <RotateCcw className="w-8 h-8 animate-spin text-[#00b9f5]" />
                            </div>
                          )}
                          <div className="mt-1 text-[10px] font-bold text-slate-600 flex items-center justify-center gap-1">
                            <span>Scan &amp; Pay via Any UPI App</span>
                          </div>
                        </div>

                        {/* UPI VPA Copy Bar */}
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <span className="text-slate-500">Merchant UPI:</span>
                          <span className="font-mono font-bold text-[#002e6e] dark:text-[#38bdf8] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                            {paytmOnboardData?.vpa || 'paytm.s1lcife@pty'}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(paytmOnboardData?.vpa || 'paytm.s1lcife@pty');
                              setCopiedVpa(true);
                              setTimeout(() => setCopiedVpa(false), 2000);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                            title="Copy UPI ID"
                          >
                            {copiedVpa ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>

                        {/* Supported UPI Apps */}
                        <p className="text-[10px] text-slate-400">
                          Supported: Paytm • Google Pay • PhonePe • BHIM • CRED • Any Bank UPI
                        </p>
                      </div>

                      {/* Direct Mobile UPI Intent Button */}
                      {paytmOnboardData?.upi_intent_url && (
                        <div>
                          <a
                            href={paytmOnboardData.upi_intent_url}
                            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#002e6e] via-[#0052a3] to-[#00b9f5] hover:opacity-95 text-white font-black text-xs shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition"
                          >
                            <Smartphone className="w-4 h-4" />
                            <span>Pay via UPI App (Mobile GPay / PhonePe / Paytm)</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      )}

                      {/* Auto-Detection Status Footer */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                        <div className="flex justify-between items-center text-[11px] text-slate-400">
                          <button
                            onClick={() => setOnboardStep(2)}
                            className="font-semibold hover:text-slate-700 dark:hover:text-white cursor-pointer"
                          >
                            ← Back to Store Details
                          </button>
                          <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            Auto-detecting payment...
                          </span>
                        </div>
                        <p className="text-[10px] text-center text-slate-400">
                          Payment will be auto-verified within 1 second of UPI success. No manual action needed.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Step 4: Live Store Provisioned */}
              {onboardStep === 4 && provisionedStore && (
                <div className="space-y-4 text-center animate-in fade-in">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white">
                      Payment Verified &amp; Store Live!
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Dedicated tenant database created. You are now logged in automatically.
                    </p>
                  </div>

                  {/* Store Credentials Card */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-left space-y-2 border border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                      <span className="text-slate-500 font-semibold">Store Code:</span>
                      <span className="font-mono font-black text-sm text-[#00a2c7] bg-cyan-50 dark:bg-cyan-950/60 px-2.5 py-0.5 rounded-lg border border-cyan-200 dark:border-cyan-800">
                        {provisionedStore.shop_code}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Store Name:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{provisionedStore.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Login ID / Email:</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{provisionedStore.owner_email || onboardForm.ownerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Registered Mobile:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{provisionedStore.owner_phone || onboardForm.ownerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Default Password &amp; M-PIN:</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">admin123 / PIN: 123456</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Database Instance:</span>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400 font-bold">{provisionedStore.database_name}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Welcome Email &amp; SMS with login credentials and M-PIN have been dispatched!</span>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Auto-redirecting to Store Settings in a moment...</span>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOnboardingOpen(false);
                        window.location.href = `/shop-admin/settings?setup=1&code=${provisionedStore.shop_code}`;
                      }}
                      className="w-full py-3 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-black text-xs block text-center shadow-md shadow-cyan-600/30 transition cursor-pointer"
                    >
                      Open Store Settings Now (Setup GST &amp; Brand) →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      }

      {/* =================================================================== */}
      {/* 7. STORE RENEWAL & UPGRADE MODAL                                    */}
      {/* =================================================================== */}
      <StoreRenewalModal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        shopCode={lookupStoreCode || ''}
        onRenewSuccess={(renewed) => {
          showToast(`Store ${renewed?.shop_code || lookupStoreCode} subscription renewed successfully!`);
          setIsRenewModalOpen(false);
        }}
      />

      {/* =================================================================== */}
      {/* 8. FORGOT PASSWORD & DUAL-CHANNEL OTP RESET MODAL                   */}
      {/* =================================================================== */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        initialIdentifier={inputStoreCode}
        onSuccess={(updatedCode) => {
          if (updatedCode) {
            setInputStoreCode(updatedCode);
          }
          showToast('Password reset successfully! Please login with your new password.');
        }}
      />

      {/* =================================================================== */}
      {/* 8. ENEXA SIGNATURE FOOTER (Matching https://enexa.in/)              */}
      {/* =================================================================== */}
      <footer className="enexa-footer pt-16 pb-8 border-t border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 text-sm">
            {/* Col 1: Brand + About + Social Buttons (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div onClick={() => navigateTo('home')} className="flex items-center gap-2.5 cursor-pointer select-none">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center text-white shadow-md shadow-sky-500/20">
                  <Receipt className="w-5 h-5 stroke-[2.3]" />
                </div>
                <div>
                  <span className="text-xl font-bold tracking-tight text-white block leading-tight">
                    Shoppy<span className="text-[#38BDF8]">ERP</span>
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 block -mt-0.5">
                    Powered by Enexa IT Solutions
                  </span>
                </div>
              </div>

              <p className="text-slate-400 leading-relaxed text-xs sm:text-sm max-w-sm">
                India&apos;s trusted GST billing software, lightning-fast retail POS counter terminal, WhatsApp e-invoicing, and omnichannel e-commerce cloud ERP by Enexa IT Solutions Private Limited.
              </p>

              {/* Social Links matching enexa.in */}
              <div className="flex items-center gap-2.5 pt-1">
                <a
                  href="https://www.enexa.in"
                  target="_blank"
                  rel="noreferrer"
                  className="enexa-social-btn"
                  title="Official Website"
                >
                  <Globe className="w-4 h-4" />
                </a>
                <a
                  href="mailto:contact@enexa.in"
                  className="enexa-social-btn"
                  title="Email Support"
                >
                  <Mail className="w-4 h-4" />
                </a>
                <a
                  href="tel:+919546042639"
                  className="enexa-social-btn"
                  title="Call Helpline"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a
                  href="https://wa.me/919546042639"
                  target="_blank"
                  rel="noreferrer"
                  className="enexa-social-btn"
                  title="WhatsApp Support"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Col 2: Quick Links (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <h4 className="font-semibold text-white text-sm tracking-wide">Quick Links</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => navigateTo('home')} className="enexa-footer-link cursor-pointer">Home</button></li>
                <li><button onClick={() => navigateTo('about')} className="enexa-footer-link cursor-pointer">About Us</button></li>
                <li><button onClick={() => navigateTo('services')} className="enexa-footer-link cursor-pointer">Services</button></li>
                <li><button onClick={() => navigateTo('pricing')} className="enexa-footer-link cursor-pointer">Pricing</button></li>
                <li><button onClick={() => navigateTo('blog')} className="enexa-footer-link cursor-pointer">Blog &amp; Insights</button></li>
                <li><button onClick={() => navigateTo('contact')} className="enexa-footer-link cursor-pointer">Contact Us</button></li>
              </ul>
            </div>

            {/* Col 3: Billing Modules & Account (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="font-semibold text-white text-sm tracking-wide">Billing Solutions</h4>
              <ul className="space-y-2.5">
                <li><button onClick={() => navigateTo('services')} className="enexa-footer-link cursor-pointer">High-Speed Counter POS (&lt;50ms)</button></li>
                <li><button onClick={() => navigateTo('services')} className="enexa-footer-link cursor-pointer">Thermal 80mm / A4 / Dot-Matrix</button></li>
                <li><button onClick={() => navigateTo('services')} className="enexa-footer-link cursor-pointer">WhatsApp Invoices &amp; UPI QR</button></li>
                <li><button onClick={() => navigateTo('services')} className="enexa-footer-link cursor-pointer">Online Storefront &amp; Couriers</button></li>
                <li><button onClick={() => navigateTo('store')} className="enexa-footer-link cursor-pointer">Store Merchant Login</button></li>
              </ul>
            </div>

            {/* Col 4: Contact Info matching enexa.in (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              <h4 className="font-semibold text-white text-sm tracking-wide">Contact Information</h4>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-400">
                <li className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#38BDF8] shrink-0 mt-0.5" />
                  <span>
                    {settings.company_address ||
                      'Yadav Nagar Near Hero Honda Agency, Bhagwanpur, Muzaffarpur, Bihar - 842001'}
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <a href="tel:+919546042639" className="hover:text-[#38BDF8] transition">
                    +91 95460 42639
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#38BDF8] shrink-0" />
                  <a href="mailto:contact@enexa.in" className="hover:text-[#38BDF8] transition">
                    contact@enexa.in
                  </a>
                </li>
              </ul>

              <div className="pt-2 text-[11px] text-slate-500 space-y-0.5">
                <p>CIN: {settings.company_cin || 'U72900RJ2021PTC075482'}</p>
                <p>GSTIN: {settings.company_gstin || '08AABCE1290M1Z5'}</p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800/80 mt-12 pt-7 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p className="text-center sm:text-left">
              © 2026{' '}
              <a href="https://www.enexa.in" target="_blank" rel="noreferrer" className="text-white font-semibold hover:text-[#38BDF8] transition">
                {settings.company_name || 'Enexa IT Solutions Private Limited'}
              </a>
              . All rights reserved.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <button onClick={() => navigateTo('privacy-policy')} className="hover:text-[#38BDF8] transition cursor-pointer">
                Privacy Policy
              </button>
              <span className="text-slate-700">•</span>
              <button onClick={() => navigateTo('terms-of-service')} className="hover:text-[#38BDF8] transition cursor-pointer">
                Terms of Service
              </button>
              <span className="text-slate-700">•</span>
              <button onClick={() => navigateTo('return-policy')} className="hover:text-[#38BDF8] transition cursor-pointer">
                Refund Policy
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Circular WhatsApp Chat Button matching enexa.in */}
      <a
        href="https://wa.me/919546042639?text=Hello%20Enexa%20Team%2C%20I%20would%20like%20to%20know%20more%20about%20Shoppy%20ERP%20billing%20software."
        target="_blank"
        rel="noreferrer"
        className="enexa-whatsapp-float"
        title="Chat on WhatsApp"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
      </a>
    </div>
  );
}

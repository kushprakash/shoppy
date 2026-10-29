import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useErp } from '../context/ErpContext';
import {
  Grid2X2,
  Moon,
  Sun,
  Bell,
  ChevronLeft,
  ShieldCheck,
  Zap,
  User,
  Settings,
  LogOut,
  X,
  Store,
  Sliders,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const {
    isDarkMode,
    toggleDarkMode,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    shopCode,
    showToast
  } = useErp();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBrandingOpen, setIsBrandingOpen] = useState(false);

  // Store Branding State (saved to localStorage)
  const [branding, setBranding] = useState(() => {
    try {
      const saved = localStorage.getItem('shoppy_store_branding');
      return saved ? JSON.parse(saved) : {
        storeName: 'Ramesh Fashion Store',
        tagline: 'Retail & Multi-Tenant SaaS',
        ownerName: 'Ramesh Sundaram',
        phone: '+91 98290 00192',
        gstin: '08AABCR1290M1Z5',
        themeColor: '#00a2c7',
        footerNote: 'Thank you for shopping with us! Visit again.'
      };
    } catch (e) {
      return {
        storeName: 'Ramesh Fashion Store',
        tagline: 'Retail & Multi-Tenant SaaS',
        ownerName: 'Ramesh Sundaram',
        phone: '+91 98290 00192',
        gstin: '08AABCR1290M1Z5',
        themeColor: '#00a2c7',
        footerNote: 'Thank you for shopping with us! Visit again.'
      };
    }
  });

  const handleSaveBranding = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('shoppy_store_branding', JSON.stringify(branding));
    } catch (e) {}
    setIsBrandingOpen(false);
    showToast('Store branding & invoice settings saved successfully!');
  };

  const getBreadcrumbTitle = () => {
    switch (path) {
      case '/shop-admin/dashboard':
      case '/shop-admin':
      case '/':
        return '> Overview > ERP Dashboard';
      case '/shop-admin/products':
        return '> Catalog > All Products List';
      case '/shop-admin/products/create':
        return '> Catalog > + Add New Product';
      case '/shop-admin/barcodes':
        return '> Catalog > Barcode Print Desk';
      case '/shop-admin/inventory':
        return '> Inventory > Multi-Branch Stock';
      case '/shop-admin/inventory/adjustments':
        return '> Inventory > Stock Adjustment';
      case '/shop-admin/inventory/low-stock':
        return '> Inventory > Low Stock Alerts';
      case '/shop-admin/orders':
        return '> Sales > Orders & Receipts';
      case '/shop-admin/gst-invoices':
        return '> Sales > GST Invoicing & Tax Ledger';
      case '/shop-admin/e-way-bills':
        return '> Sales > E-Way Bill (NIC IRN)';
      case '/shop-admin/pos-shifts':
        return '> POS Hardware > Counter Registers & Z-Report';
      case '/shop-admin/suppliers':
        return '> Suppliers & Purchases > Supplier Directory';
      case '/shop-admin/purchase-bills':
        return '> Suppliers & Purchases > Inward Stock Bills';
      case '/shop-admin/customers':
        return '> CRM > Customer Directory';
      case '/shop-admin/payment-gateways':
        return '> Integrations > 5 Pre-Integrated Payment Gateways';
      case '/shop-admin/courier-shipping':
        return '> Integrations > 5 Courier & Shipping Aggregators';
      case '/shop-admin/store-settings':
        return '> Configuration > Store Profile & Hardware Bridge';
      default:
        return '> ERP Management';
    }
  };

  return (
    <>
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
            href="/pos-terminal"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm shadow-emerald-600/30 transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>POS Counter</span>
          </a>

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
              onClick={() => showToast('4 Low-stock alerts and 2 new storefront orders pending')}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full px-1 shadow-sm">
                4
              </span>
            </button>
          </div>

          {/* User Profile Avatar with Interactive Dropdown */}
          <div className="relative pl-2 border-l border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-cyan-500/80 shadow-xs flex items-center justify-center bg-slate-200 font-bold text-slate-700 text-xs cursor-pointer hover:ring-2 hover:ring-cyan-400 transition"
              title="Profile & Store Branding"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <>
                <div
                  onClick={() => setIsProfileOpen(false)}
                  className="fixed inset-0 z-40 bg-transparent"
                />
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2">
                  {/* Profile Header */}
                  <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-500 shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {branding.ownerName}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {branding.storeName}
                      </p>
                      <span className="inline-block px-1.5 py-0.5 text-[9px] font-mono font-bold bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7] rounded mt-0.5">
                        {shopCode}
                      </span>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="py-1 space-y-0.5 text-xs font-semibold">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setIsBrandingOpen(true);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition cursor-pointer"
                    >
                      <Sliders className="w-4 h-4 text-[#00a2c7]" />
                      <div>
                        <div className="font-bold">Store Branding & Settings</div>
                        <div className="text-[10px] text-slate-400 font-normal">Logo, theme, tax & bill layout</div>
                      </div>
                    </button>

                    <a
                      href="/store"
                      className="w-full px-3 py-2 rounded-xl text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2.5 transition"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Logout / Switch Store</span>
                    </a>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Subheader / Breadcrumbs row */}
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            title="Go Back"
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
            GSTIN: {branding.gstin}
          </span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* STORE BRANDING & SETTINGS MODAL (User Requested)                    */}
      {/* =================================================================== */}
      {isBrandingOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#008ba3] via-[#00a8cc] to-[#10b981] flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Store Branding & Customization</h3>
                  <p className="text-[11px] text-slate-400">Configure your store logo, name, invoice header & theme</p>
                </div>
              </div>
              <button
                onClick={() => setIsBrandingOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBranding} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Store Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={branding.storeName}
                    onChange={(e) => setBranding({ ...branding, storeName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={branding.ownerName}
                    onChange={(e) => setBranding({ ...branding, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Brand Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={branding.tagline}
                  onChange={(e) => setBranding({ ...branding, tagline: e.target.value })}
                  placeholder="e.g. Retail & Multi-Tenant SaaS"
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
                    value={branding.phone}
                    onChange={(e) => setBranding({ ...branding, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN Number
                  </label>
                  <input
                    type="text"
                    value={branding.gstin}
                    onChange={(e) => setBranding({ ...branding, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tax Bill / Receipt Footer Message
                </label>
                <input
                  type="text"
                  value={branding.footerNote}
                  onChange={(e) => setBranding({ ...branding, footerNote: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsBrandingOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Branding & Apply</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

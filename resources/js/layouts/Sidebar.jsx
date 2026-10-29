import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useErp } from '../context/ErpContext';
import {
  LayoutDashboard,
  Package,
  Warehouse,
  Receipt,
  CreditCard,
  Boxes,
  Users,
  Zap,
  Truck,
  Settings,
  ChevronDown,
  Store,
  ExternalLink,
  LogOut
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const path = location.pathname;
  const { isDarkMode, mobileSidebarOpen, setMobileSidebarOpen, shopCode } = useErp();

  // Navigation schema
  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: 'ERP Dashboard',
      path: '/shop-admin/dashboard',
      section: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />
    },
    {
      id: 'catalog',
      label: 'Catalog & Products',
      section: 'Retail ERP Modules',
      icon: <Package className="w-4 h-4" />,
      subItems: [
        { id: 'products', label: 'All Products List', path: '/shop-admin/products' },
        { id: 'create-product', label: '+ Add New Product', path: '/shop-admin/products/create' },
        { id: 'barcodes', label: 'Barcode Print Desk', path: '/shop-admin/barcodes' }
      ]
    },
    {
      id: 'inventory',
      label: 'Inventory & Stock',
      section: 'Retail ERP Modules',
      icon: <Warehouse className="w-4 h-4" />,
      subItems: [
        { id: 'stock-levels', label: 'Multi-Branch Stock', path: '/shop-admin/inventory' },
        { id: 'stock-adjustment', label: 'Stock Adjustment (In/Out)', path: '/shop-admin/inventory/adjustments' },
        { id: 'low-stock', label: 'Low Stock Alerts', path: '/shop-admin/inventory/low-stock' }
      ]
    },
    {
      id: 'sales',
      label: 'Sales & GST Invoicing',
      section: 'Retail ERP Modules',
      icon: <Receipt className="w-4 h-4" />,
      subItems: [
        { id: 'orders', label: 'Orders & Receipts', path: '/shop-admin/orders' },
        { id: 'gst-invoices', label: 'GST Tax Invoices', path: '/shop-admin/gst-invoices' },
        { id: 'e-way-bills', label: 'E-Way Bill (NIC IRN)', path: '/shop-admin/e-way-bills' }
      ]
    },
    {
      id: 'pos-shifts',
      label: 'POS Register Shifts',
      path: '/shop-admin/pos-shifts',
      section: 'Retail ERP Modules',
      icon: <CreditCard className="w-4 h-4" />
    },
    {
      id: 'purchase',
      label: 'Suppliers & Purchase',
      section: 'Retail ERP Modules',
      icon: <Boxes className="w-4 h-4" />,
      subItems: [
        { id: 'suppliers', label: 'Supplier Directory', path: '/shop-admin/suppliers' },
        { id: 'purchase-bills', label: 'Inward Stock Bills', path: '/shop-admin/purchase-bills' }
      ]
    },
    {
      id: 'customers',
      label: 'Customer Directory & CRM',
      path: '/shop-admin/customers',
      section: 'Retail ERP Modules',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'payment-gateways',
      label: 'Payment Gateways (5)',
      path: '/shop-admin/payment-gateways',
      section: 'Integrations & Config',
      icon: <Zap className="w-4 h-4" />
    },
    {
      id: 'courier-shipping',
      label: 'Courier & Logistics (5)',
      path: '/shop-admin/courier-shipping',
      section: 'Integrations & Config',
      icon: <Truck className="w-4 h-4" />
    },
    {
      id: 'store-settings',
      label: 'Store & Hardware Config',
      path: '/shop-admin/store-settings',
      section: 'Integrations & Config',
      icon: <Settings className="w-4 h-4" />
    }
  ];

  // State for which dropdowns are open (default all closed on first load)
  const [openDropdowns, setOpenDropdowns] = useState({});

  // Automatically keep parent open if current route matches one of its children
  useEffect(() => {
    NAV_ITEMS.forEach((item) => {
      if (item.subItems && item.subItems.some((sub) => sub.path === path)) {
        setOpenDropdowns((prev) => ({ ...prev, [item.id]: true }));
      }
    });
  }, [path]);

  // Check if a parent item has a currently active child route
  const isParentActive = (item) => {
    if (!item.subItems) {
      return item.path === path;
    }
    // DROPDOWN RULE: Parent is ONLY marked active if one of its children is currently active!
    return item.subItems.some((sub) => sub.path === path);
  };

  // Handle Parent Item Click:
  // "dropdown menu pe click karte hi active nhi hoga uske dropdown pe click karne pe active hoga"
  const handleParentClick = (item) => {
    if (item.subItems && item.subItems.length > 0) {
      // Toggle dropdown open/close ONLY. DO NOT NAVIGATE. DO NOT ACTIVATE.
      setOpenDropdowns((prev) => ({
        ...prev,
        [item.id]: !prev[item.id]
      }));
    } else {
      // Direct menu item without dropdown: Navigate to path & close mobile drawer
      navigate(item.path);
      setMobileSidebarOpen(false);
    }
  };

  // Handle Sub-Item Click inside dropdown
  const handleSubItemClick = (subItem) => {
    navigate(subItem.path);
    setMobileSidebarOpen(false);
  };

  // Render Item (Scooped curved active tab when active)
  const renderSidebarItem = (item) => {
    const active = isParentActive(item);
    const isOpen = !!openDropdowns[item.id];

    return (
      <div key={item.id} className="w-full">
        {active ? (
          /* ACTIVE TAB: SCOOPED CURVED WHITE TAB WITH CONCAVE CORNER SVGS */
          <div className="relative my-0.5 w-full">
            {/* Top Concave Corner SVG */}
            <div className="absolute -top-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
              <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                <path d="M 0,16 Q 16,16 16,0 L 16,16 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
              </svg>
            </div>

            {/* Active Tab Body flush to right-0 */}
            <div
              onClick={() => handleParentClick(item)}
              className={`cursor-pointer relative z-10 ml-1.5 mr-0 pl-1.5 pr-4 py-2 rounded-l-full flex items-center justify-between transition select-none ${
                isDarkMode ? 'bg-slate-950 text-cyan-400' : 'bg-[#f4f7fa] text-[#00a2c7]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Cyan Circular Icon Button */}
                <div className="w-8 h-8 rounded-full bg-[#00a2c7] text-white flex items-center justify-center shadow-xs shadow-cyan-500/30 shrink-0">
                  {item.icon}
                </div>

                {/* Bold Label */}
                <span className="text-[13.5px] font-bold tracking-tight text-[#00a2c7] dark:text-cyan-400">
                  {item.label}
                </span>
              </div>

              {/* Arrow only shown when dropdown is closed */}
              {item.subItems && !isOpen && (
                <ChevronDown className="w-3.5 h-3.5 text-[#00a2c7] dark:text-cyan-400" />
              )}
            </div>

            {/* Bottom Concave Corner SVG */}
            <div className="absolute -bottom-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
              <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                <path d="M 0,0 Q 16,0 16,16 L 16,0 Z" fill={isDarkMode ? '#020617' : '#f4f7fa'} />
              </svg>
            </div>
          </div>
        ) : (
          /* INACTIVE ITEM */
          <div
            onClick={() => handleParentClick(item)}
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

            {/* Arrow only shown when dropdown is closed */}
            {item.subItems && !isOpen && (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            )}
          </div>
        )}

        {/* SUBMENU ITEMS */}
        {item.subItems && isOpen && (
          <div className="pt-2 pb-3 pl-7 pr-3 space-y-1 bg-[#202f40] w-full">
            {item.subItems.map((sub) => {
              const isSubActive = path === sub.path;
              return (
                <button
                  key={sub.id}
                  onClick={() => handleSubItemClick(sub)}
                  className={`flex items-center gap-2.5 text-left w-full py-2.5 px-2 rounded-lg group transition select-none hover:bg-[#283b50]/60 ${
                    isSubActive ? 'bg-[#283b50]/40' : 'pl-[14px]'
                  }`}
                >
                  {isSubActive && (
                    <span className="w-[3.5px] h-8 bg-white rounded-full shadow-xs shrink-0" />
                  )}
                  <span
                    className={`text-[13.5px] tracking-tight transition-colors ${
                      isSubActive
                        ? 'font-bold text-[#00a2c7] dark:text-cyan-400'
                        : 'font-medium text-[#8fa3bf] group-hover:text-white'
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

  return (
    <>
      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#202f40] text-[#8fa3bf] flex flex-col transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}
      >
        {/* Brand Logo Header Card */}
        <div className="p-4 border-b border-[#1a2634]/80 flex items-center justify-between">
          <div className="w-full bg-[#182330] rounded-xl p-2.5 shadow-sm flex items-center gap-3 border border-slate-700/60">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#008ba3] via-[#00a8cc] to-[#10b981] flex items-center justify-center text-white shadow-sm shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-white tracking-tight">Ramesh</span>
                <span className="text-[11px] font-black uppercase text-[#00a2c7] tracking-wider">ERP</span>
              </div>
              <p className="text-[8px] font-semibold text-slate-400 uppercase tracking-wider mt-0.5">
                Retail & Multi-Tenant SaaS
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto pl-3 pr-0 py-3 space-y-3.5 text-sm font-medium select-none custom-scrollbar">
          {/* OVERVIEW SECTION */}
          <div>
            <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-3">
              Overview
            </div>
            {NAV_ITEMS.filter((i) => i.section === 'Overview').map(renderSidebarItem)}
          </div>

          {/* RETAIL ERP MODULES */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-3">
              Retail ERP Modules
            </div>
            {NAV_ITEMS.filter((i) => i.section === 'Retail ERP Modules').map(renderSidebarItem)}
          </div>

          {/* INTEGRATIONS & CONFIG */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-3">
              Integrations & Config
            </div>
            {NAV_ITEMS.filter((i) => i.section === 'Integrations & Config').map(renderSidebarItem)}
          </div>

          {/* Quick Cross-Portal Switcher */}
          <div className="pt-3 border-t border-slate-800/80 mr-3">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              System Portals
            </div>
            <div className="space-y-1 text-xs">
              <a
                href="/pos-terminal"
                className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40"
              >
                <span>POS Billing Terminal</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="/storefront"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40"
              >
                <span>Online Storefront Preview</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="/banking-portal"
                className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40"
              >
                <span>Enexa Banking Portal</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a
                href="/central-admin-portal"
                className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40"
              >
                <span>Central SaaS Admin</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Profile Box with Store Name & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0d1624]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs shadow-sm shrink-0">
                RF
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">Ramesh Fashion Store</p>
                <p className="text-[10px] text-slate-400 truncate">Store ID: {shopCode}</p>
              </div>
            </div>

            {/* Logout Button */}
            <a
              href="/store"
              title="Logout / Switch Store"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer shrink-0 ml-1"
            >
              <LogOut className="w-4 h-4" />
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

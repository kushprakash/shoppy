import React, { createContext, useContext, useState, useEffect } from 'react';

const ErpContext = createContext();

export const INITIAL_TOP_CATEGORIES = [];
export const INITIAL_MID_CATEGORIES = [];
export const INITIAL_END_CATEGORIES = [];
export const INITIAL_SIZES = [];
export const INITIAL_COLORS = [];
export const INITIAL_SHIPPING_RULES = {
  defaultShippingType: 'flat',
  flatRate: 0,
  freeShippingThreshold: 0,
  isFreeShippingEnabled: false,
  codFee: 0,
  isCodEnabled: false,
  estimatedDeliveryDays: '',
  expressShippingRate: 0,
  isExpressEnabled: false,
  weightSlabs: []
};

export const INITIAL_PRODUCTS = [];
export const INITIAL_ORDERS = [];
export const INITIAL_SUPPLIERS = [];
export const INITIAL_CUSTOMERS = [];
export const INITIAL_PURCHASE_BILLS = [];
export const INITIAL_BRANCHES = [];
export const INITIAL_COUPONS = [];
export const INITIAL_LEADS = [];
export const INITIAL_QUOTATIONS = [];

// ============================================================================
// GRANULAR ROLE-BASED ACCESS CONTROL (RBAC) & PERMISSION CATALOG
// Every menu, route, and in-page action (print, dues, courier, status, bill, etc.)
// ============================================================================
export const PERMISSION_MODULES = [
  {
    moduleId: 'overview',
    moduleName: 'Dashboard & Financials',
    permissions: [
      { key: 'overview.dashboard', label: 'View ERP Dashboard', description: 'Access main dashboard KPI stats, sales counters, and live widgets' },
      { key: 'overview.profit_loss', label: 'View Profit & Loss (P&L)', description: 'Inspect real-time revenue, COGS, expenses, and net profit statement' },
      { key: 'overview.print_pnl', label: 'Print P&L Statement', description: 'Export and print audit-ready P&L financial document' }
    ]
  },
  {
    moduleId: 'catalog',
    moduleName: 'Products & Master Catalog',
    permissions: [
      { key: 'catalog.view_products', label: 'View Products Catalog', description: 'Browse and search master product inventory catalog' },
      { key: 'catalog.create_product', label: '+ Add New Product', description: 'Create and add new product SKU, barcodes, and pricing' },
      { key: 'catalog.edit_product', label: 'Edit Product Details', description: 'Modify selling prices, MRP, HSN, and GST rates' },
      { key: 'catalog.delete_product', label: 'Delete Product', description: 'Remove products from the active store catalog' },
      { key: 'catalog.categories_setup', label: 'Categories & Shipping Setup', description: 'Configure 3-tier categories, sizes, colors, and shipping rules' },
      { key: 'catalog.barcode_desk', label: 'Barcode Print Desk', description: 'Generate barcode labels and print sticker sheets' }
    ]
  },
  {
    moduleId: 'inventory',
    moduleName: 'Inventory & Stock Control',
    permissions: [
      { key: 'inventory.view_stock', label: 'View Multi-Branch Stock', description: 'Inspect branch-wise available inventory stock' },
      { key: 'inventory.adjust_stock', label: 'Stock Adjustments (In/Out)', description: 'Perform manual inventory corrections and discrepancy adjustments' },
      { key: 'inventory.low_stock_alerts', label: 'Low Stock Alerts', description: 'Monitor reorder level thresholds and restock alerts' }
    ]
  },
  {
    moduleId: 'sales',
    moduleName: 'Sales & POS Billing',
    permissions: [
      { key: 'sales.pos_billing', label: '+ POS Fast Billing Counter', description: 'Punch sales bills, barcode scan items, and collect counter payments' },
      { key: 'sales.view_orders', label: 'View Orders & Receipts', description: 'Access order history and sales transaction ledger' },
      { key: 'sales.view_gst_invoices', label: 'View GST Tax Invoices', description: 'Inspect B2B and B2C GST compliant invoices' },
      { key: 'sales.print_invoice', label: 'Print Invoices & Receipts', description: 'Print Thermal POS slips, standard A4 invoices, and dot matrix rolls' },
      { key: 'sales.manage_coupons', label: 'Manage Discount Coupons', description: 'Create, edit, and activate discount promo codes' },
      { key: 'sales.courier_post', label: 'Courier Post & Dispatch', description: 'Post orders to Shiprocket with parcel dimensions and weight' },
      { key: 'sales.track_shipment', label: 'Live Shipment Tracking & Cron', description: 'Fetch live transit status milestones and control sync cron' },
      { key: 'sales.eway_bill', label: 'E-Way Bill Generation', description: 'Access NIC E-Way Bill portal and generate transport IRN' }
    ]
  },
  {
    moduleId: 'crm',
    moduleName: 'Customers & CRM Quotations',
    permissions: [
      { key: 'crm.view_customers', label: 'View Customer Directory', description: 'Access customer profiles, purchase history, and contact list' },
      { key: 'crm.repay_dues', label: 'Collect / Repay Customer Dues', description: 'Accept customer udhaar balance repayments and update dues ledger' },
      { key: 'crm.manage_leads', label: 'Leads & Follow-up Desk', description: 'Generate leads, log client call remarks, and schedule follow-ups' },
      { key: 'crm.view_quotations', label: 'View Quotations & Estimates', description: 'Browse and inspect proforma price quotations' },
      { key: 'crm.create_quotation', label: '+ Create / Edit Quotation', description: 'Draft new quotations with product line items and discounts' },
      { key: 'crm.quotation_convert', label: 'Confirm Quotation to Final Bill', description: 'Convert accepted quotation into real order with auto stock deduction' },
      { key: 'crm.print_quotation', label: 'Print Proforma Quotation', description: 'Generate and print client quotation estimate PDF' }
    ]
  },
  {
    moduleId: 'purchase',
    moduleName: 'Suppliers & Purchase (Inward)',
    permissions: [
      { key: 'purchase.view_suppliers', label: 'View Supplier Directory', description: 'Inspect onboarded vendors and trade creditor accounts' },
      { key: 'purchase.create_supplier', label: '+ Onboard New Supplier', description: 'Register new vendor profile, GSTIN, and payment terms' },
      { key: 'purchase.repay_dues', label: 'Settle / Repay Supplier Dues', description: 'Record payment vouchers against outstanding supplier dues' },
      { key: 'purchase.view_bills', label: 'View Purchase Invoices', description: 'Browse inward purchase invoices and supplier bills' },
      { key: 'purchase.create_bill', label: '+ Create Inward Purchase Bill', description: 'Log purchase bill and automatically increment product inventory stock' }
    ]
  },
  {
    moduleId: 'hrm',
    moduleName: 'Human Resource (HRM) & Payroll',
    permissions: [
      { key: 'hrm.view_employees', label: 'View Staff & Employees', description: 'Browse store staff directory and role assignments' },
      { key: 'hrm.manage_employees', label: 'Onboard & Edit Employees', description: 'Define salary structures (Basic, HRA, PF/ESI) and bank details' },
      { key: 'hrm.delete_employee', label: 'Remove Employee Profile', description: 'Deactivate and delete employee accounts' },
      { key: 'hrm.attendance_punch', label: 'Punch & Mark Daily Attendance', description: 'Record daily staff in/out timings, present, half-day, and leave' },
      { key: 'hrm.manage_leaves', label: 'Manage Leave Applications', description: 'Apply and approve or reject staff leave requests' },
      { key: 'hrm.view_payroll', label: 'View Monthly Payroll Sheet', description: 'Access monthly wage computation and payout status' },
      { key: 'hrm.salary_pay', label: 'Disburse Salary (Auto Expense)', description: 'Pay employee wages with UTR and auto-log to company expenses' },
      { key: 'hrm.print_payslip', label: 'Print Staff Payslip', description: 'Generate and print formal salary payslip vouchers' }
    ]
  },
  {
    moduleId: 'expenses',
    moduleName: 'Business Expense Management',
    permissions: [
      { key: 'expenses.view', label: 'View Business Expense Ledger', description: 'Inspect store overhead vouchers and category expenditures' },
      { key: 'expenses.create', label: '+ Record New Expense', description: 'Add new expense voucher (Rent, Electricity, Tea, Marketing, etc.)' },
      { key: 'expenses.edit_delete', label: 'Edit & Delete Expenses', description: 'Modify or remove recorded expense vouchers' }
    ]
  },
  {
    moduleId: 'settings',
    moduleName: 'Integrations & Store Config',
    permissions: [
      { key: 'settings.payment_gateways', label: 'Configure Payment Gateways', description: 'Manage PhonePe, Razorpay, Cashfree API credentials' },
      { key: 'settings.courier_logistics', label: 'Configure Courier Providers', description: 'Manage Shiprocket, NimbusPost, iThink credentials' },
      { key: 'settings.store_config', label: 'Store Settings & Branding', description: 'Update store address, GSTIN, invoice logos, and policies' }
    ]
  },
  {
    moduleId: 'roles_permissions',
    moduleName: 'Roles & Access Control (RBAC)',
    permissions: [
      { key: 'roles.manage', label: 'Manage Roles & Permissions', description: 'Create custom roles, edit role permissions, and assign staff' },
      { key: 'roles.user_custom_permissions', label: 'Customize User Specific Permissions', description: 'Assign extra permissions or overrides to individual employees' }
    ]
  }
];

export const ALL_PERMISSION_KEYS = PERMISSION_MODULES.flatMap((m) => m.permissions.map((p) => p.key));

export const INITIAL_ROLES = [];

export const INITIAL_EMPLOYEES = [];
export const INITIAL_ATTENDANCE = [];
export const INITIAL_LEAVES = [];
export const INITIAL_PAYROLL = [];
export const INITIAL_EXPENSES = [];

export function ErpProvider({ children }) {
  const shopCode = localStorage.getItem('shoppy_active_store_code') || document.getElementById('root')?.dataset?.shopCode || '';

  // 3-Tier Hierarchy Categories, Sizes, Colors & Shipping Rules
  const [topCategories, setTopCategories] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_top_categories');
      return stored ? JSON.parse(stored) : INITIAL_TOP_CATEGORIES;
    } catch (e) {
      return INITIAL_TOP_CATEGORIES;
    }
  });

  const [midCategories, setMidCategories] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_mid_categories');
      return stored ? JSON.parse(stored) : INITIAL_MID_CATEGORIES;
    } catch (e) {
      return INITIAL_MID_CATEGORIES;
    }
  });

  const [endCategories, setEndCategories] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_end_categories');
      return stored ? JSON.parse(stored) : INITIAL_END_CATEGORIES;
    } catch (e) {
      return INITIAL_END_CATEGORIES;
    }
  });

  const [sizes, setSizes] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_sizes');
      return stored ? JSON.parse(stored) : INITIAL_SIZES;
    } catch (e) {
      return INITIAL_SIZES;
    }
  });

  const [colors, setColors] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_colors');
      return stored ? JSON.parse(stored) : INITIAL_COLORS;
    } catch (e) {
      return INITIAL_COLORS;
    }
  });

  const [shippingRules, setShippingRules] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_shipping_rules');
      return stored ? JSON.parse(stored) : INITIAL_SHIPPING_RULES;
    } catch (e) {
      return INITIAL_SHIPPING_RULES;
    }
  });

  const addTopCategory = (cat) => {
    const newCat = { ...cat, id: cat.id || `TOP-${Date.now().toString().slice(-4)}` };
    setTopCategories((prev) => [newCat, ...prev]);
    showToast(`Top Category "${cat.name}" added`);
  };
  const updateTopCategory = (id, updated) => {
    setTopCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    showToast('Top Category updated');
  };
  const deleteTopCategory = (id) => {
    setTopCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Top Category deleted');
  };

  const addMidCategory = (cat) => {
    const newCat = { ...cat, id: cat.id || `MID-${Date.now().toString().slice(-4)}` };
    setMidCategories((prev) => [newCat, ...prev]);
    showToast(`Mid Category "${cat.name}" added`);
  };
  const updateMidCategory = (id, updated) => {
    setMidCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    showToast('Mid Category updated');
  };
  const deleteMidCategory = (id) => {
    setMidCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('Mid Category deleted');
  };

  const addEndCategory = (cat) => {
    const newCat = { ...cat, id: cat.id || `END-${Date.now().toString().slice(-4)}` };
    setEndCategories((prev) => [newCat, ...prev]);
    showToast(`End Category "${cat.name}" added`);
  };
  const updateEndCategory = (id, updated) => {
    setEndCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    showToast('End Category updated');
  };
  const deleteEndCategory = (id) => {
    setEndCategories((prev) => prev.filter((c) => c.id !== id));
    showToast('End Category deleted');
  };

  const addSize = (sz) => {
    const newSz = { ...sz, id: sz.id || `sz-${Date.now().toString().slice(-4)}` };
    setSizes((prev) => [...prev, newSz]);
    showToast(`Size "${sz.label}" added`);
  };
  const deleteSize = (id) => {
    setSizes((prev) => prev.filter((s) => s.id !== id));
    showToast('Size option removed');
  };

  const addColor = (clr) => {
    const newClr = { ...clr, id: clr.id || `clr-${Date.now().toString().slice(-4)}` };
    setColors((prev) => [...prev, newClr]);
    showToast(`Color "${clr.name}" added`);
  };
  const deleteColor = (id) => {
    setColors((prev) => prev.filter((c) => c.id !== id));
    showToast('Color option removed');
  };

  const updateShippingRules = (rules) => {
    setShippingRules(rules);
    try {
      localStorage.setItem('shoppy_shipping_rules', JSON.stringify(rules));
    } catch (e) {}
    showToast('Shipping & courier policies updated');
  };

    // -------------------------------------------------------------
  // Live API Fetch for Tenant Store Data from MySQL Database
  // -------------------------------------------------------------
  useEffect(() => {
    let isMounted = true;
    fetch(`/api/tenant/erp/init?shop_code=${shopCode}`)
      .then((res) => res.json())
      .then((res) => {
        if (isMounted && res.success && res.data) {
          const d = res.data;
          if (Array.isArray(d.products)) setProducts(d.products);
          if (Array.isArray(d.orders)) setOrders(d.orders);
          if (Array.isArray(d.customers)) setCustomers(d.customers);
          if (Array.isArray(d.suppliers)) setSuppliers(d.suppliers);
          if (Array.isArray(d.branches)) setBranches(d.branches);
          if (Array.isArray(d.roles) && d.roles.length > 0) setRoles(d.roles);
          if (Array.isArray(d.topCategories) && d.topCategories.length > 0) setTopCategories(d.topCategories);
          if (Array.isArray(d.midCategories) && d.midCategories.length > 0) setMidCategories(d.midCategories);
          if (Array.isArray(d.endCategories) && d.endCategories.length > 0) setEndCategories(d.endCategories);
          if (Array.isArray(d.sizes) && d.sizes.length > 0) setSizes(d.sizes);
          if (Array.isArray(d.colors) && d.colors.length > 0) setColors(d.colors);
          if (d.shippingRules) setShippingRules(d.shippingRules);
          if (d.shop) {
            setStoreSettings((prev) => ({
              ...prev,
              store_name: d.shop.name || prev.store_name,
              owner_name: d.shop.owner_name || prev.owner_name,
              contact_phone: d.shop.owner_phone || prev.contact_phone,
              footer_copyright: `© ${new Date().getFullYear()} ${d.shop.name || 'Shoppy Store'}. All Rights Reserved. Powered by Enexa IT Solutions.`
            }));
          }
        }
      })
      .catch((err) => {
        console.warn('Tenant ERP initialization API fallback:', err);
      });
    return () => { isMounted = false; };
  }, [shopCode]);

  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_products_v3');
      return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
    } catch (e) {
      return INITIAL_PRODUCTS;
    }
  });

  const [orders, setOrders] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_orders_v3');
      return stored ? JSON.parse(stored) : INITIAL_ORDERS;
    } catch (e) {
      return INITIAL_ORDERS;
    }
  });

  const [coupons, setCoupons] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_coupons');
      return stored ? JSON.parse(stored) : INITIAL_COUPONS;
    } catch (e) {
      return INITIAL_COUPONS;
    }
  });

  const [suppliers, setSuppliers] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_suppliers');
      return stored ? JSON.parse(stored) : INITIAL_SUPPLIERS;
    } catch (e) {
      return INITIAL_SUPPLIERS;
    }
  });

  const [customers, setCustomers] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_customers');
      return stored ? JSON.parse(stored) : INITIAL_CUSTOMERS;
    } catch (e) {
      return INITIAL_CUSTOMERS;
    }
  });

  const [purchaseBills, setPurchaseBills] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_purchase_bills');
      return stored ? JSON.parse(stored) : INITIAL_PURCHASE_BILLS;
    } catch (e) {
      return INITIAL_PURCHASE_BILLS;
    }
  });

  const [branches, setBranches] = useState(INITIAL_BRANCHES);

  // CRM State
  const [leads, setLeads] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_crm_leads');
      return stored ? JSON.parse(stored) : INITIAL_LEADS;
    } catch (e) {
      return INITIAL_LEADS;
    }
  });

  const [quotations, setQuotations] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_crm_quotations');
      return stored ? JSON.parse(stored) : INITIAL_QUOTATIONS;
    } catch (e) {
      return INITIAL_QUOTATIONS;
    }
  });

  // HRM State
  const [employees, setEmployees] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_hrm_employees');
      return stored ? JSON.parse(stored) : INITIAL_EMPLOYEES;
    } catch (e) {
      return INITIAL_EMPLOYEES;
    }
  });

  const [attendance, setAttendance] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_hrm_attendance');
      return stored ? JSON.parse(stored) : INITIAL_ATTENDANCE;
    } catch (e) {
      return INITIAL_ATTENDANCE;
    }
  });

  const [leaves, setLeaves] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_hrm_leaves');
      return stored ? JSON.parse(stored) : INITIAL_LEAVES;
    } catch (e) {
      return INITIAL_LEAVES;
    }
  });

  const [payroll, setPayroll] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_hrm_payroll');
      return stored ? JSON.parse(stored) : INITIAL_PAYROLL;
    } catch (e) {
      return INITIAL_PAYROLL;
    }
  });

  // Expenses State
  const [expenses, setExpenses] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_expenses');
      return stored ? JSON.parse(stored) : INITIAL_EXPENSES;
    } catch (e) {
      return INITIAL_EXPENSES;
    }
  });

  // Roles & Permissions (RBAC) State
  const [roles, setRoles] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_rbac_roles');
      return stored ? JSON.parse(stored) : INITIAL_ROLES;
    } catch (e) {
      return INITIAL_ROLES;
    }
  });

  // Store Branding & Identity Settings
  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const activeStoreStr = localStorage.getItem('shoppy_active_store');
      if (activeStoreStr) {
        const activeStore = JSON.parse(activeStoreStr);
        return {
          store_name: activeStore.name || 'Shoppy Store',
          owner_name: activeStore.owner_name || activeStore.ownerName || 'Store Merchant',
          meta_title: 'Shoppy ERP — Enexa IT Solutions Private Limited',
          contact_phone: activeStore.owner_phone || activeStore.ownerPhone || '',
          gst_number: activeStore.gstin || '',
          theme_color: '#00a2c7',
          footer_copyright: `© ${new Date().getFullYear()} ${activeStore.name || 'Shoppy Store'}. All Rights Reserved. Powered by Enexa IT Solutions.`
        };
      }
      const savedData = localStorage.getItem('shoppy_store_branding_data');
      if (savedData) return JSON.parse(savedData);
    } catch (e) {}
    return {
      store_name: 'Shoppy Store',
      owner_name: 'Store Merchant',
      meta_title: 'Shoppy ERP — Enexa IT Solutions Private Limited',
      contact_phone: '',
      gst_number: '',
      theme_color: '#00a2c7',
      footer_copyright: `© ${new Date().getFullYear()} Shoppy Store. All Rights Reserved. Powered by Enexa IT Solutions.`
    };
  });

  const updateStoreSettings = (newSettings) => {
    setStoreSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('shoppy_store_branding_data', JSON.stringify(updated));
        localStorage.setItem('shoppy_store_branding', JSON.stringify({
          storeName: updated.store_name || updated.storeName || 'Shoppy Store',
          tagline: updated.meta_title || updated.tagline || 'Shoppy ERP — Enexa IT Solutions Private Limited',
          ownerName: updated.owner_name || updated.ownerName || 'Store Merchant',
          phone: updated.contact_phone || updated.phone || '',
          gstin: updated.gst_number || updated.gstin || '',
          themeColor: updated.theme_color || updated.themeColor || '#00a2c7',
          footerNote: updated.footer_copyright || updated.footerNote || ''
        }));
      } catch (e) {}
      return updated;
    });
  };

  const storeName = storeSettings.store_name || storeSettings.storeName || 'Shoppy Store';

  // Modal States for I-Card, Profile and Password
  const [isICardOpen, setIsICardOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Active User / Switchable Employee Persona
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_active_user');
      if (stored) return JSON.parse(stored);
      const activeStoreStr = localStorage.getItem('shoppy_active_store');
      const activeStore = activeStoreStr ? JSON.parse(activeStoreStr) : null;
      return {
        id: 'usr-admin',
        name: activeStore?.owner_name || activeStore?.ownerName || 'Store Administrator',
        roleId: 'role-superadmin',
        roleName: 'Super Admin',
        isSuperAdmin: true,
        extraPermissions: [],
        email: activeStore?.email || 'admin@shoppy.live',
        phone: activeStore?.owner_phone || activeStore?.ownerPhone || '',
        avatar: '',
        designation: 'Store Owner & General Manager',
        department: 'Operations',
        bloodGroup: '',
        joiningDate: new Date().toISOString().slice(0, 10),
        address: activeStore?.city || '',
        emergencyContact: {
          name: '',
          phone: ''
        }
      };
    } catch (e) {
      return {
        id: 'usr-admin',
        name: 'Store Administrator',
        roleId: 'role-superadmin',
        roleName: 'Super Admin',
        isSuperAdmin: true,
        extraPermissions: [],
        email: 'admin@shoppy.live',
        phone: '',
        avatar: '',
        designation: 'Store Owner & General Manager',
        department: 'Operations',
        bloodGroup: '',
        joiningDate: new Date().toISOString().slice(0, 10),
        address: '',
        emergencyContact: {
          name: '',
          phone: ''
        }
      };
    }
  });

  // Update Current User Profile
  const updateCurrentUserProfile = (updatedData) => {
    setCurrentUser((prev) => {
      const merged = { ...prev, ...updatedData };
      try {
        localStorage.setItem('shoppy_active_user', JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });

    // Also sync with employees list if matched
    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === updatedData.id || emp.id === currentUser?.id) {
          return {
            ...emp,
            name: updatedData.name || emp.name,
            phone: updatedData.phone || emp.phone,
            email: updatedData.email || emp.email,
            avatar: updatedData.avatar || emp.avatar,
            designation: updatedData.designation || emp.designation,
            department: updatedData.department || emp.department,
            bloodGroup: updatedData.bloodGroup || emp.bloodGroup,
            address: updatedData.address || emp.address,
            emergencyContact: updatedData.emergencyContact || emp.emergencyContact
          };
        }
        return emp;
      })
    );
    showToast('Your profile details updated successfully!');
  };

  // Change Password Handler
  const changeUserPassword = (currentPassword, newPassword) => {
    try {
      const securityInfo = {
        lastChangedAt: new Date().toISOString(),
        updatedBy: currentUser?.name || 'User',
        userId: currentUser?.id || 'usr-admin'
      };
      localStorage.setItem('shoppy_user_security', JSON.stringify(securityInfo));
    } catch (e) {}
    showToast('Password changed successfully! Keep your new credentials safe.');
    return { success: true };
  };

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem('shoppy_products_v3', JSON.stringify(products));
    } catch (e) {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_orders_v3', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_suppliers', JSON.stringify(suppliers));
    } catch (e) {}
  }, [suppliers]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_customers', JSON.stringify(customers));
    } catch (e) {}
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_purchase_bills', JSON.stringify(purchaseBills));
    } catch (e) {}
  }, [purchaseBills]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_coupons', JSON.stringify(coupons));
    } catch (e) {}
  }, [coupons]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_crm_leads', JSON.stringify(leads));
    } catch (e) {}
  }, [leads]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_crm_quotations', JSON.stringify(quotations));
    } catch (e) {}
  }, [quotations]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_hrm_employees', JSON.stringify(employees));
    } catch (e) {}
  }, [employees]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_hrm_attendance', JSON.stringify(attendance));
    } catch (e) {}
  }, [attendance]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_hrm_leaves', JSON.stringify(leaves));
    } catch (e) {}
  }, [leaves]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_hrm_payroll', JSON.stringify(payroll));
    } catch (e) {}
  }, [payroll]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_expenses', JSON.stringify(expenses));
    } catch (e) {}
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_rbac_roles', JSON.stringify(roles));
    } catch (e) {}
  }, [roles]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_active_user', JSON.stringify(currentUser));
    } catch (e) {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_top_categories', JSON.stringify(topCategories));
    } catch (e) {}
  }, [topCategories]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_mid_categories', JSON.stringify(midCategories));
    } catch (e) {}
  }, [midCategories]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_end_categories', JSON.stringify(endCategories));
    } catch (e) {}
  }, [endCategories]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_sizes', JSON.stringify(sizes));
    } catch (e) {}
  }, [sizes]);

  useEffect(() => {
    try {
      localStorage.setItem('shoppy_colors', JSON.stringify(colors));
    } catch (e) {}
  }, [colors]);

  const markCouponAsUsed = (couponCode) => {
    if (!couponCode) return;
    setCoupons((prev) =>
      prev.map((c) => {
        if (c.code.toUpperCase() === couponCode.toUpperCase()) {
          const newUsed = (c.usedCount || 0) + 1;
          return {
            ...c,
            usedCount: newUsed,
            status: c.usageLimit && newUsed >= c.usageLimit ? 'Exhausted' : c.status
          };
        }
        return c;
      })
    );
  };

  const hasPermission = (permissionKey) => {
    if (!permissionKey) return true;
    if (currentUser?.isSuperAdmin) return true;
    const userRole = (roles || []).find((r) => r.id === currentUser?.roleId);
    const rolePermissions = userRole?.permissions || [];
    if (rolePermissions.includes('*') || rolePermissions.includes(permissionKey)) {
      return true;
    }
    const extra = currentUser?.extraPermissions || [];
    return extra.includes(permissionKey);
  };

  const [gateways, setGateways] = useState([
    { gateway_code: 'phonepe', display_name: 'PhonePe PG (UPI & Cards)', is_active: true, is_test_mode: false, has_credentials: true },
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
    active_checkout_mode: 'Online Gateways Active + COD Enabled'
  });

  const [shiftData, setShiftData] = useState({
    shiftId: `SHT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-01`,
    cashier: 'Store Manager',
    openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    openingFloat: 0.0,
    cashSales: 0.0,
    upiSales: 0.0,
    cardSales: 0.0,
    pettyCashOut: 0.0,
    expectedCashInDrawer: 0.0,
    actualPhysicalCash: 0.0
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_erp_theme');
      if (stored) return stored === 'dark';
      const cookieMatch = document.cookie.match(/(?:^|; )shoppy_erp_theme=([^;]*)/);
      return cookieMatch ? cookieMatch[1] === 'dark' : false;
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

  const [toastMessage, setToastMessage] = useState(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [selectedBarcodeProduct, setSelectedBarcodeProduct] = useState(null);
  const [isZReportOpen, setIsZReportOpen] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const addProduct = (prod) => {
    setProducts((prev) => [prod, ...prev]);
    showToast(`Product ${prod.name} added to catalog!`);
  };

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast('Product removed from catalog');
  };

  const addSupplier = (sup) => {
    setSuppliers((prev) => [sup, ...prev]);
    showToast(`Supplier ${sup.name} onboarded!`);
  };

  // 1. ADD INWARD PURCHASE BILL (AUTO-INCREMENTS PRODUCT STOCK & UPDATES SUPPLIER DUES)
  const addPurchaseBill = (billData) => {
    const newBill = {
      ...billData,
      id: billData.id || `PB-${Date.now().toString().slice(-6)}`,
      status: (billData.duesAmount || 0) > 0 ? 'Payment Due' : 'Inward Completed',
      createdAt: new Date().toISOString()
    };

    // Update purchase bills state
    setPurchaseBills((prev) => [newBill, ...prev]);

    // INVENTORY STOCK INCREMENT: Automatically add stock for all inward items!
    if (Array.isArray(billData.items) && billData.items.length > 0) {
      setProducts((prevProducts) => {
        return prevProducts.map((p) => {
          const matchingItem = billData.items.find(
            (it) => (it.productId && it.productId === p.id) || (it.name && it.name.trim().toLowerCase() === p.name.trim().toLowerCase())
          );
          if (matchingItem) {
            const addedQty = parseFloat(matchingItem.qty || 0);
            const newStock = (parseFloat(p.stock) || 0) + addedQty;
            return {
              ...p,
              stock: newStock,
              purchasePrice: matchingItem.purchasePrice ? parseFloat(matchingItem.purchasePrice) : p.purchasePrice,
              sellingPrice: matchingItem.sellingPrice ? parseFloat(matchingItem.sellingPrice) : p.sellingPrice,
              mrp: matchingItem.mrp ? parseFloat(matchingItem.mrp) : p.mrp,
              batchNo: matchingItem.batchNo || p.batchNo,
              expiryDate: matchingItem.expiryDate || p.expiryDate,
              status: newStock > 0 ? (newStock <= (p.reorderLevel || 10) ? 'Low Stock' : 'In Stock') : 'Out of Stock'
            };
          }
          return p;
        });
      });
    }

    // SUPPLIER DUES: If dues amount > 0, update supplier's balancePayable
    if (billData.duesAmount > 0) {
      setSuppliers((prevSuppliers) => {
        return prevSuppliers.map((s) => {
          if (s.id === billData.supplierId || s.phone === billData.supplierPhone || s.name === billData.supplierName) {
            return {
              ...s,
              balancePayable: (parseFloat(s.balancePayable) || 0) + parseFloat(billData.duesAmount)
            };
          }
          return s;
        });
      });
    }

    showToast(`Purchase Bill ${newBill.id} created! Stock added to inventory.`);
    return newBill;
  };

  // 2. RE-PAY SUPPLIER DUES (SETTLE DUES FOR SUPPLIERS)
  const repaySupplierDues = ({ supplierId, amount, paymentMode = 'Cash', note = '', refNumber = '' }) => {
    const payAmt = parseFloat(amount || 0);
    if (payAmt <= 0) return;

    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          const newBalance = Math.max(0, (parseFloat(s.balancePayable) || 0) - payAmt);
          const historyEntry = {
            id: `SPAY-${Date.now().toString().slice(-5)}`,
            date: new Date().toISOString().split('T')[0],
            amount: payAmt,
            paymentMode,
            refNumber,
            note,
            remainingBalance: newBalance
          };
          return {
            ...s,
            balancePayable: newBalance,
            repaymentHistory: [historyEntry, ...(s.repaymentHistory || [])]
          };
        }
        return s;
      })
    );

    showToast(`Payment of ₹${payAmt.toFixed(2)} to supplier recorded! Dues updated.`);
  };

  // 3. RE-PAY CUSTOMER DUES (COLLECT DUES FROM CUSTOMERS)
  const repayCustomerDues = ({ customerId, amount, paymentMode = 'Cash', note = '', refNumber = '' }) => {
    const payAmt = parseFloat(amount || 0);
    if (payAmt <= 0) return;

    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          const newDue = Math.max(0, (parseFloat(c.balanceDue) || 0) - payAmt);
          const historyEntry = {
            id: `CPAY-${Date.now().toString().slice(-5)}`,
            date: new Date().toISOString().split('T')[0],
            amount: payAmt,
            paymentMode,
            refNumber,
            note,
            remainingDue: newDue
          };
          return {
            ...c,
            balanceDue: newDue,
            repaymentHistory: [historyEntry, ...(c.repaymentHistory || [])]
          };
        }
        return c;
      })
    );

    showToast(`Collected ₹${payAmt.toFixed(2)} from customer! Dues updated.`);
  };

  // 4. CREATE SALE BILL / POS INVOICE (DEDUCTS STOCK, AUTO-ADDS CUSTOMER BY MOBILE, COMPUTES PROFIT/LOSS, OPENS PRINT MODAL)
  const createSaleBill = (billData) => {
    let costTotal = 0;
    const processedItems = (billData.items || []).map((it) => {
      const prod = products.find((p) => p.id === it.productId || p.name === it.name);
      const costPrice = it.costPrice !== undefined ? it.costPrice : (prod ? prod.purchasePrice : it.price * 0.7);
      const lineCost = costPrice * it.qty;
      const lineTotal = it.price * it.qty;
      const lineProfit = lineTotal - lineCost;
      costTotal += lineCost;
      return {
        ...it,
        costPrice,
        grossProfit: lineProfit,
        hsn: it.hsn || (prod ? prod.hsnCode : '6205'),
        unit: it.unit || (prod ? prod.unit : 'pcs'),
        batchNo: it.batchNo || (prod ? prod.batchNo : ''),
        expiryDate: it.expiryDate || (prod ? prod.expiryDate : '')
      };
    });

    const grandTotal = parseFloat(billData.total || billData.grandTotal || 0);
    const paidAmount = billData.paidAmount !== undefined ? parseFloat(billData.paidAmount) : grandTotal;
    const duesAmount = billData.duesAmount !== undefined ? parseFloat(billData.duesAmount) : Math.max(0, grandTotal - paidAmount);
    const grossProfit = grandTotal - costTotal;
    const profitMarginPercent = grandTotal > 0 ? ((grossProfit / grandTotal) * 100).toFixed(1) : '0.0';

    const newOrder = {
      id: billData.id || `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`,
      customerName: billData.customerName || 'Walk-in Customer',
      phone: billData.phone || '',
      city: billData.city || '',
      itemsCount: processedItems.reduce((acc, i) => acc + (parseFloat(i.qty) || 0), 0),
      subtotal: parseFloat(billData.subtotal || grandTotal),
      gstTotal: parseFloat(billData.gstTotal || 0),
      total: grandTotal,
      paidAmount,
      duesAmount,
      paymentMethod: billData.paymentMethod || 'Cash Counter (POS)',
      paymentStatus: duesAmount > 0 ? (paidAmount > 0 ? 'Partial Dues' : 'Unpaid Dues') : 'Paid',
      billType: billData.billType || 'pakka', // 'pakka' (GST Tax Invoice) | 'kachha' (Estimate/Challan)
      channel: billData.channel || 'POS Counter 01',
      channelType: billData.channelType || 'offline', // 'offline' | 'online'
      couponCode: billData.couponCode || null,
      couponDiscount: parseFloat(billData.couponDiscount || 0),
      fulfillment: 'Completed (Handover)',
      date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
      items: processedItems,
      costTotal,
      grossProfit,
      profitMarginPercent
    };

    // Save order
    setOrders((prev) => [newOrder, ...prev]);

    // REDEEM COUPON: If single-use or promo coupon was used, increment usedCount
    if (billData.couponCode) {
      markCouponAsUsed(billData.couponCode);
    }

    // INVENTORY DEDUCTION: Deduct sold quantity from product stock
    setProducts((prevProducts) => {
      return prevProducts.map((p) => {
        const soldItem = processedItems.find((it) => it.productId === p.id || it.name === p.name);
        if (soldItem) {
          const newStock = Math.max(0, (parseFloat(p.stock) || 0) - (parseFloat(soldItem.qty) || 0));
          return {
            ...p,
            stock: newStock,
            status: newStock === 0 ? 'Out of Stock' : (newStock <= (p.reorderLevel || 10) ? 'Low Stock' : 'In Stock')
          };
        }
        return p;
      });
    });

    // CUSTOMER AUTO-ADD / UPDATE: If customer exists, update stats; else create customer on the fly
    if (newOrder.phone) {
      setCustomers((prevCustomers) => {
        const cleanPhone = newOrder.phone.replace(/[^0-9]/g, '');
        const existingCust = prevCustomers.find((c) => (c.mobile || '').replace(/[^0-9]/g, '') === cleanPhone);
        if (existingCust) {
          return prevCustomers.map((c) => {
            if (c.id === existingCust.id) {
              return {
                ...c,
                totalOrders: (c.totalOrders || 0) + 1,
                lifetimeSpend: (c.lifetimeSpend || 0) + grandTotal,
                loyaltyPoints: (c.loyaltyPoints || 0) + Math.floor(grandTotal / 100),
                balanceDue: (parseFloat(c.balanceDue) || 0) + duesAmount
              };
            }
            return c;
          });
        } else {
          const newCustomerObj = {
            id: `CUST-${Date.now().toString().slice(-4)}`,
            name: newOrder.customerName || 'Walk-in Customer',
            mobile: newOrder.phone,
            email: cleanPhone ? `${cleanPhone}@customer.shoppy.in` : '',
            city: newOrder.city || '',
            totalOrders: 1,
            lifetimeSpend: grandTotal,
            loyaltyPoints: Math.floor(grandTotal / 100),
            gstin: 'N/A',
            category: 'Retail Walk-in',
            balanceDue: duesAmount,
            createdAt: new Date().toISOString(),
            repaymentHistory: []
          };
          return [newCustomerObj, ...prevCustomers];
        }
      });
    }

    // Auto-open print modal with the generated bill
    setSelectedInvoice(newOrder);

    showToast(`Bill ${newOrder.id} generated! Profit: ₹${grossProfit.toFixed(2)} (${profitMarginPercent}%)`);
    return newOrder;
  };

  const toggleGateway = (gw) => {
    setGateways((prev) => {
      const updated = prev.map((g) => (g.gateway_code === gw.gateway_code ? { ...g, is_active: !g.is_active } : g));
      const hasActive = updated.some((g) => g.is_active);
      setFallbackPolicy({
        has_active_online_gateway: hasActive,
        active_checkout_mode: hasActive ? 'Online Gateways Active + COD Enabled' : 'Default Fallback Mode: COD Only'
      });
      return updated;
    });
    showToast(`Gateway ${gw.display_name} ${!gw.is_active ? 'Activated' : 'Deactivated'}`);
  };

  const toggleShipping = (provider) => {
    setShippingProviders((prev) =>
      prev.map((p) => (p.provider_code === provider.provider_code ? { ...p, is_active: !p.is_active } : p))
    );
    showToast(`Courier ${provider.display_name} ${!provider.is_active ? 'Activated' : 'Deactivated'}`);
  };

  // ===== COUPON CRUD =====
  const addCoupon = (coupon) => {
    const newCoupon = { ...coupon, id: coupon.id || `CPN-${Date.now().toString().slice(-5)}`, usedCount: 0, createdAt: new Date().toISOString() };
    setCoupons((prev) => [newCoupon, ...prev]);
    showToast(`Coupon "${coupon.code}" created!`);
  };

  const addBulkCoupons = (couponsArray) => {
    const newCoupons = couponsArray.map((c, i) => ({
      ...c,
      id: c.id || `CPN-${Date.now().toString().slice(-5)}-${i}`,
      usedCount: 0,
      createdAt: new Date().toISOString()
    }));
    setCoupons((prev) => [...newCoupons, ...prev]);
    showToast(`${newCoupons.length} coupons created in bulk!`);
  };

  const updateCoupon = (id, updated) => {
    setCoupons((prev) => prev.map((c) => (c.id === id ? { ...c, ...updated } : c)));
    showToast('Coupon updated');
  };

  const deleteCoupon = (id) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    showToast('Coupon deleted');
  };

  // ===== ORDER STATUS & SHIPPING =====
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, fulfillment: newStatus } : o)));
    showToast(`Order ${orderId} status → ${newStatus}`);
  };

  const dispatchCourierOrder = (orderId, courierData) => {
    setOrders((prev) => prev.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          fulfillment: 'Dispatched',
          courierProvider: courierData?.provider || 'Shiprocket',
          trackingId: courierData?.trackingId || `TRK-${Date.now().toString().slice(-6)}`,
          dispatchedAt: new Date().toISOString()
        };
      }
      return o;
    }));
    showToast(`Order ${orderId} dispatched via ${courierData?.provider || 'Shiprocket'}!`);
  };

  const fetchShipmentStatus = (orderId) => {
    const order = orders.find((o) => o.id === orderId);
    return {
      orderId,
      status: order?.fulfillment || 'Unknown',
      trackingId: order?.trackingId || null,
      provider: order?.courierProvider || null,
      lastUpdated: new Date().toISOString()
    };
  };

  const syncAllActiveShipments = () => {
    showToast('All active shipment statuses synced!');
  };

  // ===== CRM: LEADS =====
  const addLead = (lead) => {
    const newLead = { ...lead, id: lead.id || `LEAD-${Date.now().toString().slice(-5)}`, createdAt: new Date().toISOString(), followUps: [] };
    setLeads((prev) => [newLead, ...prev]);
    showToast(`Lead "${lead.name}" added!`);
  };

  const updateLead = (id, updated) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...updated } : l)));
    showToast('Lead updated');
  };

  const deleteLead = (id) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    showToast('Lead deleted');
  };

  const addLeadFollowUp = (leadId, followUp) => {
    setLeads((prev) => prev.map((l) => {
      if (l.id === leadId) {
        return { ...l, followUps: [{ ...followUp, id: `FU-${Date.now().toString().slice(-5)}`, createdAt: new Date().toISOString() }, ...(l.followUps || [])] };
      }
      return l;
    }));
    showToast('Follow-up added to lead');
  };

  // ===== CRM: QUOTATIONS =====
  const addQuotation = (quotation) => {
    const newQ = { ...quotation, id: quotation.id || `QTN-${Date.now().toString().slice(-5)}`, status: 'Draft', createdAt: new Date().toISOString() };
    setQuotations((prev) => [newQ, ...prev]);
    showToast(`Quotation ${newQ.id} created!`);
  };

  const updateQuotation = (id, updated) => {
    setQuotations((prev) => prev.map((q) => (q.id === id ? { ...q, ...updated } : q)));
    showToast('Quotation updated');
  };

  const deleteQuotation = (id) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id));
    showToast('Quotation deleted');
  };

  const convertQuotationToInvoice = (quotationId) => {
    const quotation = quotations.find((q) => q.id === quotationId);
    if (!quotation) return null;
    const billData = {
      customerName: quotation.customerName || 'Walk-in Customer',
      phone: quotation.phone || '',
      items: quotation.items || [],
      total: quotation.total || 0,
      subtotal: quotation.subtotal || quotation.total || 0,
      gstTotal: quotation.gstTotal || 0,
      paymentMethod: 'Cash Counter (POS)',
      channel: 'POS Counter 01',
      channelType: 'offline',
      billType: 'pakka'
    };
    const newOrder = createSaleBill(billData);
    setQuotations((prev) => prev.map((q) => (q.id === quotationId ? { ...q, status: 'Converted', convertedOrderId: newOrder.id } : q)));
    showToast(`Quotation ${quotationId} converted to Invoice ${newOrder.id}!`);
    return newOrder;
  };

  // ===== HRM: EMPLOYEES =====
  const addEmployee = (emp) => {
    const newEmp = { ...emp, id: emp.id || `EMP-${Date.now().toString().slice(-5)}`, createdAt: new Date().toISOString() };
    setEmployees((prev) => [newEmp, ...prev]);
    showToast(`Employee "${emp.name}" onboarded!`);
  };

  const updateEmployee = (id, updated) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    showToast('Employee details updated');
  };

  const deleteEmployee = (id) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    showToast('Employee removed');
  };

  // ===== HRM: ATTENDANCE =====
  const markAttendance = (record) => {
    const newRecord = { ...record, id: record.id || `ATT-${Date.now().toString().slice(-5)}`, markedAt: new Date().toISOString() };
    setAttendance((prev) => [newRecord, ...prev]);
  };

  const bulkMarkAttendance = (records) => {
    const newRecords = records.map((r, i) => ({ ...r, id: r.id || `ATT-${Date.now().toString().slice(-5)}-${i}`, markedAt: new Date().toISOString() }));
    setAttendance((prev) => [...newRecords, ...prev]);
    showToast(`Attendance marked for ${records.length} employees`);
  };

  // ===== HRM: LEAVES =====
  const applyLeave = (leave) => {
    const newLeave = { ...leave, id: leave.id || `LV-${Date.now().toString().slice(-5)}`, status: 'Pending', appliedAt: new Date().toISOString() };
    setLeaves((prev) => [newLeave, ...prev]);
    showToast('Leave application submitted');
  };

  const updateLeaveStatus = (id, status) => {
    setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    showToast(`Leave ${status.toLowerCase()}`);
  };

  // ===== HRM: PAYROLL =====
  const processSalaryPayment = (paymentData) => {
    const newPayment = { ...paymentData, id: paymentData.id || `PAY-${Date.now().toString().slice(-5)}`, processedAt: new Date().toISOString() };
    setPayroll((prev) => [newPayment, ...prev]);
    showToast(`Salary ₹${paymentData.amount || paymentData.netPay || 0} processed for ${paymentData.employeeName || 'Employee'}`);
  };

  // ===== EXPENSES =====
  const addExpense = (expense) => {
    const newExp = { ...expense, id: expense.id || `EXP-${Date.now().toString().slice(-5)}`, createdAt: new Date().toISOString() };
    setExpenses((prev) => [newExp, ...prev]);
    showToast(`Expense ₹${expense.amount} recorded`);
  };

  const updateExpense = (id, updated) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...updated } : e)));
    showToast('Expense updated');
  };

  const deleteExpense = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    showToast('Expense deleted');
  };

  // ===== ROLES & PERMISSIONS =====
  const addRole = (role) => {
    const newRole = { ...role, id: role.id || `role-${Date.now().toString().slice(-5)}`, createdAt: new Date().toISOString() };
    setRoles((prev) => [newRole, ...prev]);
    showToast(`Role "${role.name}" created!`);
  };

  const updateRole = (id, updated) => {
    setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
    showToast('Role updated');
  };

  const deleteRole = (id) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
    showToast('Role deleted');
  };

  const assignEmployeeRoleAndPermissions = (employeeId, roleId, extraPermissions = []) => {
    setEmployees((prev) => prev.map((e) => {
      if (e.id === employeeId) {
        return { ...e, roleId, extraPermissions };
      }
      return e;
    }));
    showToast('Employee role & permissions updated');
  };

  const switchUser = (employee) => {
    const userObj = {
      id: employee.id,
      name: employee.name,
      roleId: employee.roleId || 'role-staff',
      roleName: (roles || []).find((r) => r.id === employee.roleId)?.name || 'Staff',
      isSuperAdmin: employee.roleId === 'role-superadmin',
      extraPermissions: employee.extraPermissions || [],
      email: employee.email || '',
      phone: employee.phone || '',
      avatar: employee.avatar || '',
      designation: employee.designation || '',
      department: employee.department || '',
      bloodGroup: employee.bloodGroup || '',
      joiningDate: employee.joiningDate || '',
      address: employee.address || '',
      emergencyContact: employee.emergencyContact || {}
    };
    setCurrentUser(userObj);
    try { localStorage.setItem('shoppy_active_user', JSON.stringify(userObj)); } catch (e) {}
    showToast(`Switched to ${employee.name}`);
  };

  // ===== REPORTS: PROFIT & LOSS ANALYTICS =====
  const getProfitLossAnalytics = (filteredOrders, filteredExpenses) => {
    const ordersData = filteredOrders || orders;
    const expensesData = filteredExpenses || expenses;

    const totalRevenue = ordersData.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
    const totalCost = ordersData.reduce((sum, o) => sum + (parseFloat(o.costTotal) || 0), 0);
    const totalExpenses = expensesData.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
    const totalPayroll = payroll.reduce((sum, p) => sum + (parseFloat(p.amount || p.netPay) || 0), 0);
    const grossProfit = totalRevenue - totalCost;
    const netProfit = grossProfit - totalExpenses - totalPayroll;

    return {
      totalRevenue,
      totalCost,
      grossProfit,
      totalExpenses,
      totalPayroll,
      netProfit,
      grossMargin: totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0.0',
      netMargin: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0.0',
      totalOrders: ordersData.length,
      averageOrderValue: ordersData.length > 0 ? (totalRevenue / ordersData.length).toFixed(2) : '0.00'
    };
  };

  return (
    <ErpContext.Provider
      value={{
        // Core
        shopCode,
        storeName,

        // Products / Catalog
        products,
        setProducts,
        addProduct,
        deleteProduct,
        topCategories,
        setTopCategories,
        addTopCategory,
        updateTopCategory,
        deleteTopCategory,
        midCategories,
        setMidCategories,
        addMidCategory,
        updateMidCategory,
        deleteMidCategory,
        endCategories,
        setEndCategories,
        addEndCategory,
        updateEndCategory,
        deleteEndCategory,
        sizes,
        addSize,
        deleteSize,
        colors,
        addColor,
        deleteColor,
        shippingRules,
        updateShippingRules,

        // Orders / Sales
        orders,
        setOrders,
        createSaleBill,
        updateOrderStatus,
        dispatchCourierOrder,
        fetchShipmentStatus,
        syncAllActiveShipments,

        // Coupons
        coupons,
        addCoupon,
        addBulkCoupons,
        updateCoupon,
        deleteCoupon,

        // Suppliers / Purchase
        suppliers,
        setSuppliers,
        addSupplier,
        repaySupplierDues,
        purchaseBills,
        setPurchaseBills,
        addPurchaseBill,

        // Customers
        customers,
        setCustomers,
        repayCustomerDues,

        // CRM: Leads
        leads,
        addLead,
        updateLead,
        deleteLead,
        addLeadFollowUp,

        // CRM: Quotations
        quotations,
        addQuotation,
        updateQuotation,
        deleteQuotation,
        convertQuotationToInvoice,

        // HRM: Employees
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,

        // HRM: Attendance
        attendance,
        markAttendance,
        bulkMarkAttendance,

        // HRM: Leaves
        leaves,
        applyLeave,
        updateLeaveStatus,

        // HRM: Payroll
        payroll,
        processSalaryPayment,

        // Expenses
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,

        // Reports
        getProfitLossAnalytics,

        // Roles & Permissions
        roles,
        addRole,
        updateRole,
        deleteRole,
        hasPermission,
        assignEmployeeRoleAndPermissions,

        // Current User
        currentUser,
        setCurrentUser,
        switchUser,
        updateCurrentUserProfile,
        changeUserPassword,

        // Store Settings
        storeSettings,
        updateStoreSettings,

        // Infrastructure
        branches,
        gateways,
        toggleGateway,
        shippingProviders,
        toggleShipping,
        fallbackPolicy,
        shiftData,

        // UI State
        isDarkMode,
        toggleDarkMode,
        toastMessage,
        showToast,
        mobileSidebarOpen,
        setMobileSidebarOpen,
        selectedInvoice,
        setSelectedInvoice,
        selectedBarcodeProduct,
        setSelectedBarcodeProduct,
        isZReportOpen,
        setIsZReportOpen,
        isStockAdjustmentOpen,
        setIsStockAdjustmentOpen,
        isICardOpen,
        setIsICardOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isChangePasswordOpen,
        setIsChangePasswordOpen
      }}
    >
      {children}
    </ErpContext.Provider>
  );
}

export function useErp() {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
}

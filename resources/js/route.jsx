import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

import Dashboard from './pages/Dashboard';
import ProductList from './pages/catalog/ProductList';
import AddProduct from './pages/catalog/AddProduct';
import Barcodes from './pages/catalog/Barcodes';
import CatalogSetup from './pages/catalog/CatalogSetup';

import StockLevels from './pages/inventory/StockLevels';
import StockAdjustment from './pages/inventory/StockAdjustment';
import LowStock from './pages/inventory/LowStock';

import OrderList from './pages/sales/OrderList';
import NewSaleBilling from './pages/sales/NewSaleBilling';
import GstInvoices from './pages/sales/GstInvoices';
import EWayBills from './pages/sales/EWayBills';
import Coupons from './pages/sales/Coupons';

import PosShifts from './pages/pos/PosShifts';
import SupplierList from './pages/purchase/SupplierList';
import PurchaseBills from './pages/purchase/PurchaseBills';
import CustomerList from './pages/crm/CustomerList';
import LeadsManager from './pages/crm/LeadsManager';
import QuotationsManager from './pages/crm/QuotationsManager';

import EmployeesManager from './pages/hrm/EmployeesManager';
import AttendanceManager from './pages/hrm/AttendanceManager';
import PayrollManager from './pages/hrm/PayrollManager';

import ExpenseManager from './pages/expenses/ExpenseManager';
import ProfitLossStatement from './pages/reports/ProfitLossStatement';

import PaymentGateways from './pages/settings/PaymentGateways';
import CourierShipping from './pages/settings/CourierShipping';
import StoreSettings from './pages/settings/StoreSettings';
import RolesPermissionsManager from './pages/settings/RolesPermissionsManager';
import MasterPortal from './pages/master/MasterPortal';
import LandingPage from './pages/landing/LandingPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* SaaS Public Multi-Page Dynamic Website (Powered by Enexa IT Solutions Private Limited) */}
      <Route path="/" element={<LandingPage defaultPage="home" />} />
      <Route path="/about" element={<LandingPage defaultPage="about" />} />
      <Route path="/services" element={<LandingPage defaultPage="services" />} />
      <Route path="/pricing" element={<LandingPage defaultPage="pricing" />} />
      <Route path="/blog" element={<LandingPage defaultPage="blog" />} />
      <Route path="/contact" element={<LandingPage defaultPage="contact" />} />
      <Route path="/privacy-policy" element={<LandingPage defaultPage="privacy-policy" />} />
      <Route path="/return-policy" element={<LandingPage defaultPage="return-policy" />} />
      <Route path="/terms-of-service" element={<LandingPage defaultPage="terms-of-service" />} />
      <Route path="/store" element={<LandingPage defaultPage="store" />} />
      <Route path="/store-login" element={<LandingPage defaultPage="store" />} />
      <Route path="/my-store" element={<LandingPage defaultPage="my-store" />} />

      {/* Super Admin Master Portal */}
      <Route path="/master" element={<MasterPortal />} />
      <Route path="/master/*" element={<MasterPortal />} />

      {/* Redirect /shop-admin to dashboard */}
      <Route path="/shop-admin" element={<Navigate to="/shop-admin/dashboard" replace />} />

      {/* Main ERP Layout Routes */}
      <Route element={<MainLayout />}>
        {/* Overview & P&L */}
        <Route path="/shop-admin/dashboard" element={<Dashboard />} />
        <Route path="/shop-admin/profit-loss" element={<ProfitLossStatement />} />

        {/* Catalog */}
        <Route path="/shop-admin/products" element={<ProductList />} />
        <Route path="/shop-admin/products/create" element={<AddProduct />} />
        <Route path="/shop-admin/catalog-setup" element={<CatalogSetup />} />
        <Route path="/shop-admin/barcodes" element={<Barcodes />} />

        {/* Inventory */}
        <Route path="/shop-admin/inventory" element={<StockLevels />} />
        <Route path="/shop-admin/inventory/adjustments" element={<StockAdjustment />} />
        <Route path="/shop-admin/inventory/low-stock" element={<LowStock />} />

        {/* Sales & Billing */}
        <Route path="/shop-admin/billing" element={<NewSaleBilling />} />
        <Route path="/shop-admin/orders" element={<OrderList />} />
        <Route path="/shop-admin/gst-invoices" element={<GstInvoices />} />
        <Route path="/shop-admin/coupons" element={<Coupons />} />
        <Route path="/shop-admin/e-way-bills" element={<EWayBills />} />

        {/* POS Hardware */}
        <Route path="/shop-admin/pos-shifts" element={<PosShifts />} />

        {/* Purchase & Suppliers */}
        <Route path="/shop-admin/suppliers" element={<SupplierList />} />
        <Route path="/shop-admin/purchase-bills" element={<PurchaseBills />} />

        {/* CRM */}
        <Route path="/shop-admin/crm/leads" element={<LeadsManager />} />
        <Route path="/shop-admin/crm/quotations" element={<QuotationsManager />} />
        <Route path="/shop-admin/customers" element={<CustomerList />} />

        {/* Human Resources (HRM) */}
        <Route path="/shop-admin/hrm/employees" element={<EmployeesManager />} />
        <Route path="/shop-admin/hrm/attendance" element={<AttendanceManager />} />
        <Route path="/shop-admin/hrm/payroll" element={<PayrollManager />} />

        {/* Business Expenses */}
        <Route path="/shop-admin/expenses" element={<ExpenseManager />} />

        {/* Roles & Permissions (RBAC) */}
        <Route path="/shop-admin/roles-permissions" element={<RolesPermissionsManager />} />

        {/* Integrations & Settings */}
        <Route path="/shop-admin/payment-gateways" element={<PaymentGateways />} />
        <Route path="/shop-admin/courier-shipping" element={<CourierShipping />} />
        <Route path="/shop-admin/store-settings" element={<StoreSettings />} />
        <Route path="/shop-admin/settings" element={<StoreSettings />} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/shop-admin/dashboard" replace />} />
    </Routes>
  );
}

import React, { useState, useEffect } from 'react';
import { useErp } from '../../context/ErpContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Printer,
  Eye,
  Trash2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  X,
  CreditCard,
  Building,
  Check,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Lock
} from 'lucide-react';

export const QUOTATION_STATUSES = [
  { label: 'Draft', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700' },
  { label: 'Sent', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { label: 'Accepted', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  { label: 'Bill Generated', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  { label: 'Rejected', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800' }
];

export default function QuotationsManager() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    quotations,
    addQuotation,
    updateQuotation,
    deleteQuotation,
    convertQuotationToInvoice,
    products,
    setSelectedInvoice,
    hasPermission
  } = useErp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [confirmConvertModalQuotation, setConfirmConvertModalQuotation] = useState(null);
  const [viewQuotationModal, setViewQuotationModal] = useState(null);

  // Conversion Form options
  const [convertOptions, setConvertOptions] = useState({
    paymentMethod: 'Bank Transfer (NEFT)',
    paidAmount: '',
    duesAmount: 0,
    billType: 'pakka',
    channelType: 'offline',
    utrNumber: '',
    chequeNumber: '',
    notes: ''
  });

  // Create Quotation Form
  const [newQuotation, setNewQuotation] = useState({
    leadId: null,
    customerName: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: 'Jaipur, Rajasthan',
    city: 'Jaipur, RJ',
    date: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0],
    billType: 'pakka',
    channelType: 'offline',
    terms: '1. 100% payment upon delivery or approved credit terms. 2. Rates valid for 30 days. 3. Free delivery within Jaipur metro limits.',
    items: [
      {
        productId: products[0]?.id || '',
        name: products[0]?.name || '',
        sku: products[0]?.sku || '',
        hsn: products[0]?.hsnCode || '6205',
        qty: 1,
        price: products[0]?.sellingPrice || 1000,
        costPrice: products[0]?.purchasePrice || 600,
        gstRate: products[0]?.gstRate || 5,
        unit: products[0]?.unit || 'pcs'
      }
    ],
    discount: 0
  });

  // Pre-fill from Lead if navigated with state
  useEffect(() => {
    if (location.state?.fromLead) {
      const fl = location.state.fromLead;
      setNewQuotation((prev) => ({
        ...prev,
        leadId: fl.leadId || null,
        customerName: fl.customerName || '',
        contactPerson: fl.contactPerson || '',
        phone: fl.phone || '',
        email: fl.email || '',
        city: fl.city || 'Jaipur, RJ',
        terms: fl.notes ? `Requirement: ${fl.notes}\n1. Standard delivery within 7 working days. 2. Rates valid for 30 days.` : prev.terms
      }));
      setIsCreateModalOpen(true);
    }
  }, [location.state]);

  // Quotation Calculations
  const calculateQuotationTotals = (items, discount) => {
    let subtotal = 0;
    let taxTotal = 0;

    items.forEach((it) => {
      const lineSub = (parseFloat(it.price) || 0) * (parseFloat(it.qty) || 0);
      const taxRate = parseFloat(it.gstRate) || 0;
      const lineTax = (lineSub * taxRate) / 100;
      subtotal += lineSub;
      taxTotal += lineTax;
    });

    const disc = parseFloat(discount) || 0;
    const grandTotal = Math.max(0, subtotal - disc + taxTotal);

    return {
      subtotal: Math.round(subtotal),
      taxTotal: Math.round(taxTotal),
      grandTotal: Math.round(grandTotal)
    };
  };

  const handleAddItem = () => {
    const firstProd = products[0] || {};
    setNewQuotation((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: firstProd.id || '',
          name: firstProd.name || '',
          sku: firstProd.sku || '',
          hsn: firstProd.hsnCode || '6205',
          qty: 1,
          price: firstProd.sellingPrice || 1000,
          costPrice: firstProd.purchasePrice || 600,
          gstRate: firstProd.gstRate || 5,
          unit: firstProd.unit || 'pcs'
        }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    if (newQuotation.items.length <= 1) return;
    setNewQuotation((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setNewQuotation((prev) => {
      const updated = [...prev.items];
      if (field === 'productId') {
        const prod = products.find((p) => p.id === value);
        if (prod) {
          updated[index] = {
            ...updated[index],
            productId: prod.id,
            name: prod.name,
            sku: prod.sku,
            hsn: prod.hsnCode,
            price: prod.sellingPrice,
            costPrice: prod.purchasePrice,
            gstRate: prod.gstRate,
            unit: prod.unit
          };
        }
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, items: updated };
    });
  };

  const handleSaveQuotation = (e) => {
    e.preventDefault();
    if (!newQuotation.customerName || !newQuotation.phone) {
      alert('Please fill Customer / Client name and Phone number');
      return;
    }

    const totals = calculateQuotationTotals(newQuotation.items, newQuotation.discount);

    const saved = addQuotation({
      ...newQuotation,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      grandTotal: totals.grandTotal,
      status: 'Sent'
    });

    setIsCreateModalOpen(false);
  };

  // Open Convert Modal
  const handleOpenConvertModal = (qtn) => {
    setConfirmConvertModalQuotation(qtn);
    setConvertOptions({
      paymentMethod: 'Bank Transfer (NEFT)',
      paidAmount: qtn.grandTotal,
      duesAmount: 0,
      billType: qtn.billType || 'pakka',
      channelType: qtn.channelType || 'offline',
      utrNumber: '',
      chequeNumber: '',
      notes: ''
    });
  };

  // Execute Conversion
  const handleExecuteConversion = () => {
    if (!confirmConvertModalQuotation) return;

    let finalPaymentMethod = convertOptions.paymentMethod;
    if (convertOptions.paymentMethod.includes('UPI') && convertOptions.utrNumber) {
      finalPaymentMethod = `PhonePe / UPI (UTR: ${convertOptions.utrNumber})`;
    } else if (convertOptions.paymentMethod.includes('Bank') && convertOptions.utrNumber) {
      finalPaymentMethod = `Bank Transfer (NEFT UTR: ${convertOptions.utrNumber})`;
    } else if (convertOptions.paymentMethod.includes('Cheque') && convertOptions.chequeNumber) {
      finalPaymentMethod = `Cheque (No: ${convertOptions.chequeNumber})`;
    }

    const paid = parseFloat(convertOptions.paidAmount) || 0;
    const dues = Math.max(0, confirmConvertModalQuotation.grandTotal - paid);

    const generatedOrder = convertQuotationToInvoice(confirmConvertModalQuotation.id, {
      paymentMethod: finalPaymentMethod,
      paidAmount: paid,
      duesAmount: dues,
      billType: convertOptions.billType,
      channelType: convertOptions.channelType
    });

    setConfirmConvertModalQuotation(null);
  };

  // KPIs
  const totalQuotationsCount = quotations.length;
  const billGeneratedCount = quotations.filter((q) => q.status === 'Bill Generated').length;
  const pendingQuotationsCount = quotations.filter((q) => q.status !== 'Bill Generated' && q.status !== 'Rejected').length;
  const totalPipelineAmt = quotations.reduce((acc, q) => acc + (parseFloat(q.grandTotal) || 0), 0);

  // Filtered
  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      (q.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.phone || '').includes(searchTerm) ||
      (q.convertedInvoiceId || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (statusName, convertedId) => {
    if (statusName === 'Bill Generated') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shadow-sm">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Bill Generated ({convertedId || 'INV'})
        </span>
      );
    }
    const found = QUOTATION_STATUSES.find((s) => s.label === statusName);
    const colorClass = found ? found.color : 'bg-slate-100 text-slate-800 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
        {statusName}
      </span>
    );
  };

  const previewTotals = calculateQuotationTotals(newQuotation.items, newQuotation.discount);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
              <FileText className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Quotations & Estimate Desk
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create professional GST quotations. Upon client confirmation, convert them into final sale bills with automatic stock deduction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/shop-admin/crm/leads')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-slate-300 dark:border-slate-700"
          >
            Leads Desk
          </button>
          {hasPermission('crm.create_quotation') && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-500/25 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              + Create New Quotation
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Quotations</span>
            <span className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalQuotationsCount}</p>
          <p className="text-xs text-slate-500 mt-1">All quotations generated</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Proposals</span>
            <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{pendingQuotationsCount}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">Pending client confirmation</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Converted to Bills</span>
            <span className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{billGeneratedCount}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Invoiced & stock deducted</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Pipeline Value</span>
            <span className="p-2 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ₹{totalPipelineAmt.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-violet-600 dark:text-violet-400 mt-1 font-medium">Cumulated proposal volume</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search quotation ID, client name, phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
          >
            <option value="ALL">All Statuses</option>
            {QUOTATION_STATUSES.map((st) => (
              <option key={st.label} value={st.label}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Quotation No & Date</th>
                <th className="py-3.5 px-4">Client / Customer</th>
                <th className="py-3.5 px-4">Items Qty</th>
                <th className="py-3.5 px-4">Grand Total (₹)</th>
                <th className="py-3.5 px-4">Quotation Status</th>
                <th className="py-3.5 px-4">Validity</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredQuotations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No quotations found.
                  </td>
                </tr>
              ) : (
                filteredQuotations.map((qtn) => {
                  const isConverted = qtn.status === 'Bill Generated';
                  return (
                    <tr key={qtn.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2.5 py-1 rounded-md">
                            {qtn.id}
                          </span>
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{qtn.date}</p>
                            {qtn.billType && (
                              <span className="text-[10px] uppercase font-bold text-slate-400">
                                {qtn.billType === 'pakka' ? 'GST Invoice' : 'Estimate'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{qtn.customerName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{qtn.phone}</p>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {(qtn.items || []).reduce((acc, it) => acc + (parseFloat(it.qty) || 0), 0)} pcs ({(qtn.items || []).length} items)
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 dark:text-white">
                          ₹{parseFloat(qtn.grandTotal || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {getStatusBadge(qtn.status, qtn.convertedInvoiceId)}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300">
                        {qtn.validUntil || '30 Days'}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* View Quotation Preview */}
                          <button
                            onClick={() => setViewQuotationModal(qtn)}
                            className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                            title="View / Print Quotation"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* IF NOT CONVERTED: Show "Confirm & Convert to Final Bill" button */}
                          {!isConverted ? (
                            hasPermission('crm.quotation_convert') ? (
                              <button
                                onClick={() => handleOpenConvertModal(qtn)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                                title="Confirm quotation & generate final bill"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Confirm & Bill
                              </button>
                            ) : null
                          ) : (
                            /* IF CONVERTED: Read-only locked badge with View Generated Bill */
                            <button
                              onClick={() => {
                                navigate('/shop-admin/orders', {
                                  state: { highlightOrder: qtn.convertedInvoiceId }
                                });
                              }}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium border border-slate-300 dark:border-slate-700 flex items-center gap-1.5"
                              title={`View generated order ${qtn.convertedInvoiceId}`}
                            >
                              <Lock className="w-3 h-3 text-emerald-500" />
                              View Bill ({qtn.convertedInvoiceId})
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Quotation */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-violet-50 dark:bg-violet-950/60 text-violet-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Quotation / Estimate</h3>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuotation} className="space-y-5">
              {/* Customer Details */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Client & Billing Particulars
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Customer / Client Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={newQuotation.customerName}
                      onChange={(e) => setNewQuotation({ ...newQuotation, customerName: e.target.value })}
                      placeholder="e.g. Apex Infotech Ltd"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Phone *
                    </label>
                    <input
                      type="text"
                      required
                      value={newQuotation.phone}
                      onChange={(e) => setNewQuotation({ ...newQuotation, phone: e.target.value })}
                      placeholder="e.g. 9829011223"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={newQuotation.email}
                      onChange={(e) => setNewQuotation({ ...newQuotation, email: e.target.value })}
                      placeholder="e.g. info@client.com"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Billing Address / City
                    </label>
                    <input
                      type="text"
                      value={newQuotation.city}
                      onChange={(e) => setNewQuotation({ ...newQuotation, city: e.target.value })}
                      placeholder="e.g. Jaipur, Rajasthan"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Quotation Date
                    </label>
                    <input
                      type="date"
                      value={newQuotation.date}
                      onChange={(e) => setNewQuotation({ ...newQuotation, date: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Valid Until
                    </label>
                    <input
                      type="date"
                      value={newQuotation.validUntil}
                      onChange={(e) => setNewQuotation({ ...newQuotation, validUntil: e.target.value })}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Product Line Items ({newQuotation.items.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1 bg-violet-50 hover:bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-violet-200 dark:border-violet-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    + Add Product Line
                  </button>
                </div>

                <div className="space-y-2">
                  {newQuotation.items.map((it, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60"
                    >
                      <div className="col-span-12 sm:col-span-5">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Select Product</label>
                        <select
                          value={it.productId}
                          onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium dark:text-white"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (Stock: {p.stock} {p.unit || 'pcs'} | ₹{p.sellingPrice})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={it.qty}
                          onChange={(e) => handleItemChange(idx, 'qty', Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-center font-bold dark:text-white"
                        />
                      </div>

                      <div className="col-span-4 sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Unit Price (₹)</label>
                        <input
                          type="number"
                          value={it.price}
                          onChange={(e) => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium dark:text-white"
                        />
                      </div>

                      <div className="col-span-3 sm:col-span-2">
                        <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">GST Rate %</label>
                        <select
                          value={it.gstRate}
                          onChange={(e) => handleItemChange(idx, 'gstRate', parseFloat(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs dark:text-white"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </div>

                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={newQuotation.items.length <= 1}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg disabled:opacity-30"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Terms & Totals Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Terms & Conditions
                  </label>
                  <textarea
                    rows={4}
                    value={newQuotation.terms}
                    onChange={(e) => setNewQuotation({ ...newQuotation, terms: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs dark:text-white"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400 text-xs">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{previewTotals.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 dark:text-slate-400">Discount (₹):</span>
                    <input
                      type="number"
                      value={newQuotation.discount}
                      onChange={(e) => setNewQuotation({ ...newQuotation, discount: parseFloat(e.target.value) || 0 })}
                      className="w-24 px-2 py-1 text-right bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-xs font-medium dark:text-white"
                    />
                  </div>

                  <div className="flex justify-between text-slate-600 dark:text-slate-400 text-xs">
                    <span>Estimated GST:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      +₹{previewTotals.taxTotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-base font-bold text-slate-900 dark:text-white">
                    <span>Grand Total:</span>
                    <span className="text-violet-600 dark:text-violet-400">
                      ₹{previewTotals.grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-violet-500/20"
                >
                  Save & Issue Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirm Quotation -> Final Bill Conversion */}
      {confirmConvertModalQuotation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-emerald-500/30 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
                  <CheckCircle className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Quotation to Final Bill</h3>
                  <p className="text-xs text-slate-500">Quotation #{confirmConvertModalQuotation.id}</p>
                </div>
              </div>
              <button
                onClick={() => setConfirmConvertModalQuotation(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Automatic Inventory & Ledger Synchronization:
              </p>
              <p className="text-[11px] leading-relaxed">
                Confirming this quotation will create a real invoice in <strong>All Orders</strong>, deduct product stock from inventory, and mark this quotation status as <strong>"Bill Generated"</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <span>Total Quotation Amount:</span>
                <span className="text-lg text-emerald-600 dark:text-emerald-400 font-bold">
                  ₹{parseFloat(confirmConvertModalQuotation.grandTotal).toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode
                </label>
                <select
                  value={convertOptions.paymentMethod}
                  onChange={(e) => setConvertOptions({ ...convertOptions, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                >
                  <option value="Cash Counter (POS)">Cash Counter</option>
                  <option value="PhonePe / UPI">PhonePe / UPI QR Code</option>
                  <option value="Bank Transfer (NEFT)">Bank Transfer / NEFT / RTGS</option>
                  <option value="Cheque">Cheque Payment</option>
                </select>
              </div>

              {/* Dynamic UTR or Cheque input */}
              {convertOptions.paymentMethod.includes('UPI') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    UPI 12-Digit UTR / Transaction Ref No
                  </label>
                  <input
                    type="text"
                    value={convertOptions.utrNumber}
                    onChange={(e) => setConvertOptions({ ...convertOptions, utrNumber: e.target.value })}
                    placeholder="e.g. 429182749102"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono dark:text-white"
                  />
                </div>
              )}

              {convertOptions.paymentMethod.includes('Bank') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Transfer NEFT / RTGS Reference UTR No
                  </label>
                  <input
                    type="text"
                    value={convertOptions.utrNumber}
                    onChange={(e) => setConvertOptions({ ...convertOptions, utrNumber: e.target.value })}
                    placeholder="e.g. HDFC-NEFT-991823"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono dark:text-white"
                  />
                </div>
              )}

              {convertOptions.paymentMethod.includes('Cheque') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cheque Number & Issuing Bank
                  </label>
                  <input
                    type="text"
                    value={convertOptions.chequeNumber}
                    onChange={(e) => setConvertOptions({ ...convertOptions, chequeNumber: e.target.value })}
                    placeholder="e.g. 000492 - HDFC Bank"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paid Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={convertOptions.paidAmount}
                    onChange={(e) => {
                      const paid = parseFloat(e.target.value) || 0;
                      setConvertOptions({
                        ...convertOptions,
                        paidAmount: paid,
                        duesAmount: Math.max(0, confirmConvertModalQuotation.grandTotal - paid)
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Remaining Dues (₹)
                  </label>
                  <input
                    type="number"
                    readOnly
                    value={Math.max(0, confirmConvertModalQuotation.grandTotal - (parseFloat(convertOptions.paidAmount) || 0))}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-amber-600 dark:text-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmConvertModalQuotation(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteConversion}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/25 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Confirm & Generate Final Bill
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: View / Print Quotation Preview */}
      {viewQuotationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-violet-50 dark:bg-violet-950/60 text-violet-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Quotation #{viewQuotationModal.id}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Status: <strong className="text-slate-800 dark:text-slate-200">{viewQuotationModal.status}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  onClick={() => setViewQuotationModal(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Preview Sheet */}
            <div className="p-6 bg-slate-50/70 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-wide">
                    RAMESH FASHION ERP
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showroom #42, M.I. Road, Jaipur, Rajasthan - 302001
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    GSTIN: 08AABCR1234F1Z8 | Contact: +91 98290 12345
                  </p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-violet-100 dark:bg-violet-950/70 text-violet-800 dark:text-violet-300 font-bold text-xs uppercase rounded-md tracking-wider">
                    PROFORMA ESTIMATE / QUOTATION
                  </span>
                  <p className="text-xs text-slate-500 mt-1 font-mono">Date: {viewQuotationModal.date}</p>
                  <p className="text-xs text-slate-500 font-mono">Valid Until: {viewQuotationModal.validUntil}</p>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="font-bold text-slate-500 uppercase">Quotation Issued To:</p>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm mt-0.5">
                    {viewQuotationModal.customerName}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">{viewQuotationModal.city}</p>
                  <p className="font-mono text-slate-600 dark:text-slate-400">Phone: {viewQuotationModal.phone}</p>
                </div>
                {viewQuotationModal.convertedInvoiceId && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <p className="text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Converted to Final Invoice:
                    </p>
                    <p className="text-xs font-mono font-bold text-emerald-900 dark:text-emerald-200 mt-1">
                      Invoice #{viewQuotationModal.convertedInvoiceId}
                    </p>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                      Conversion Timestamp: {viewQuotationModal.convertedAt}
                    </p>
                  </div>
                )}
              </div>

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-200/60 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-300 dark:border-slate-700">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Item Description</th>
                      <th className="py-2 px-3 text-center">HSN</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Rate (₹)</th>
                      <th className="py-2 px-3 text-center">GST %</th>
                      <th className="py-2 px-3 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {(viewQuotationModal.items || []).map((it, idx) => {
                      const lineTotal = (parseFloat(it.price) || 0) * (parseFloat(it.qty) || 0);
                      return (
                        <tr key={idx}>
                          <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                          <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">{it.name}</td>
                          <td className="py-2 px-3 text-center font-mono text-slate-500">{it.hsn || '-'}</td>
                          <td className="py-2 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                            {it.qty} {it.unit || 'pcs'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono">₹{parseFloat(it.price).toFixed(2)}</td>
                          <td className="py-2 px-3 text-center text-slate-500">{it.gstRate || 5}%</td>
                          <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">
                            ₹{lineTotal.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary Totals */}
              <div className="flex justify-between items-start pt-3 border-t border-slate-200 dark:border-slate-700">
                <div className="max-w-xs text-[11px] text-slate-500 dark:text-slate-400">
                  <p className="font-bold text-slate-700 dark:text-slate-300 mb-0.5">Notes & Terms:</p>
                  <p>{viewQuotationModal.terms || 'Standard 30 days validity applies.'}</p>
                </div>

                <div className="w-56 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{parseFloat(viewQuotationModal.subtotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  {viewQuotationModal.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount:</span>
                      <span>-₹{parseFloat(viewQuotationModal.discount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Tax (GST):</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      +₹{parseFloat(viewQuotationModal.taxTotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-slate-300 dark:border-slate-700 flex justify-between text-sm font-bold text-slate-900 dark:text-white">
                    <span>Grand Total:</span>
                    <span className="text-violet-600 dark:text-violet-400 text-base">
                      ₹{parseFloat(viewQuotationModal.grandTotal || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              {hasPermission('crm.print_quotation') && (
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  Print Quotation
                </button>
              )}
              <button
                onClick={() => setViewQuotationModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

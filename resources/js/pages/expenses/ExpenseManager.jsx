import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Plus,
  Search,
  Filter,
  Calendar,
  IndianRupee,
  Receipt,
  FileText,
  Trash2,
  Edit2,
  X,
  TrendingDown,
  Building,
  Zap,
  ShoppingBag,
  Coffee,
  Truck,
  Wrench,
  Percent,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export const EXPENSE_CATEGORIES = [
  { name: 'Shop Rent', icon: <Building className="w-4 h-4 text-purple-500" />, color: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' },
  { name: 'Electricity & Utilities', icon: <Zap className="w-4 h-4 text-amber-500" />, color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  { name: 'Staff Salary & Wages', icon: <IndianRupee className="w-4 h-4 text-emerald-500" />, color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  { name: 'Packaging & Bags', icon: <ShoppingBag className="w-4 h-4 text-blue-500" />, color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  { name: 'Tea & Refreshments', icon: <Coffee className="w-4 h-4 text-orange-500" />, color: 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300' },
  { name: 'Marketing & Promotions', icon: <Percent className="w-4 h-4 text-rose-500" />, color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' },
  { name: 'Courier & Logistics', icon: <Truck className="w-4 h-4 text-indigo-500" />, color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300' },
  { name: 'Repairs & Maintenance', icon: <Wrench className="w-4 h-4 text-slate-500" />, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { name: 'Office Stationery', icon: <FileText className="w-4 h-4 text-cyan-500" />, color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300' },
  { name: 'Miscellaneous', icon: <Receipt className="w-4 h-4 text-slate-400" />, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' }
];

export const PAYMENT_MODES = [
  'Cash',
  'PhonePe / UPI',
  'Bank Transfer (NEFT)',
  'Cheque'
];

export default function ExpenseManager() {
  const navigate = useNavigate();
  const { expenses, addExpense, updateExpense, deleteExpense, hasPermission } = useErp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  // Form State
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Shop Rent',
    amount: '',
    paymentMode: 'Bank Transfer (NEFT)',
    refNumber: '',
    paidTo: '',
    description: '',
    receiptNo: ''
  });

  // KPIs
  const totalExpenseAmount = expenses.reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  const cashExpenses = expenses
    .filter((e) => (e.paymentMode || '').toLowerCase().includes('cash'))
    .reduce((acc, e) => acc + (parseFloat(e.amount) || 0), 0);
  const digitalExpenses = totalExpenseAmount - cashExpenses;

  // Find top category
  const categoryTotals = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + (parseFloat(e.amount) || 0);
  });
  let topCategoryName = 'None';
  let topCategoryAmount = 0;
  Object.keys(categoryTotals).forEach((cat) => {
    if (categoryTotals[cat] > topCategoryAmount) {
      topCategoryAmount = categoryTotals[cat];
      topCategoryName = cat;
    }
  });

  // Filtered
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      (e.paidTo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.refNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || e.category === selectedCategory;
    const matchesMode = selectedPaymentMode === 'ALL' || e.paymentMode === selectedPaymentMode;

    return matchesSearch && matchesCat && matchesMode;
  });

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setExpenseForm({
      date: new Date().toISOString().split('T')[0],
      category: 'Shop Rent',
      amount: '',
      paymentMode: 'Bank Transfer (NEFT)',
      refNumber: '',
      paidTo: '',
      description: '',
      receiptNo: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (exp) => {
    setEditingExpense(exp);
    setExpenseForm({
      date: exp.date || '',
      category: exp.category || 'Shop Rent',
      amount: exp.amount || '',
      paymentMode: exp.paymentMode || 'Cash',
      refNumber: exp.refNumber || '',
      paidTo: exp.paidTo || '',
      description: exp.description || '',
      receiptNo: exp.receiptNo || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSubmitExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      alert('Please enter a valid expense amount');
      return;
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, {
        ...expenseForm,
        amount: parseFloat(expenseForm.amount)
      });
    } else {
      addExpense({
        ...expenseForm,
        amount: parseFloat(expenseForm.amount)
      });
    }

    setIsAddModalOpen(false);
  };

  const getCategoryBadge = (catName) => {
    const found = EXPENSE_CATEGORIES.find((c) => c.name === catName);
    const colorClass = found ? found.color : 'bg-slate-100 text-slate-700';
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${colorClass}`}>
        {found?.icon}
        {catName}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <CreditCard className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Business Expense Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track showroom overheads, store rent, electricity bills, packaging, and tea expenses. Directly synchronized with Profit & Loss statements.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/shop-admin/profit-loss')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-slate-300 dark:border-slate-700"
          >
            <TrendingDown className="w-4 h-4 text-emerald-500" />
            View Profit & Loss (P&L)
          </button>
          {hasPermission('expenses.create') && (
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-rose-500/25 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              + Record New Expense
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Operating Expenses</span>
            <span className="p-2 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-xl">
              <TrendingDown className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ₹{totalExpenseAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-medium">{expenses.length} expense vouchers recorded</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Top Overhead Category</span>
            <span className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
              <Building className="w-5 h-5" />
            </span>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-2 truncate">{topCategoryName}</p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-semibold">
            ₹{topCategoryAmount.toLocaleString('en-IN')} ({totalExpenseAmount > 0 ? ((topCategoryAmount / totalExpenseAmount) * 100).toFixed(1) : 0}% share)
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Digital / Bank Transfers</span>
            <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
            ₹{digitalExpenses.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">UPI & NEFT payments with UTR</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Cash Petty Outflow</span>
            <span className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <Coffee className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            ₹{cashExpenses.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">Daily petty cash & counter vouchers</p>
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
            placeholder="Search vendor, description, UTR, voucher..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
            >
              <option value="ALL">All Categories</option>
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={selectedPaymentMode}
            onChange={(e) => setSelectedPaymentMode(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
          >
            <option value="ALL">All Payment Modes</option>
            {PAYMENT_MODES.map((pm) => (
              <option key={pm} value={pm}>
                {pm}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Ledger Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Voucher No & Date</th>
                <th className="py-3.5 px-4">Expense Category</th>
                <th className="py-3.5 px-4">Paid To / Vendor</th>
                <th className="py-3.5 px-4">Amount (₹)</th>
                <th className="py-3.5 px-4">Payment Method & UTR</th>
                <th className="py-3.5 px-4">Notes / Purpose</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No expenses found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded">
                          {exp.id}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">{exp.date}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{getCategoryBadge(exp.category)}</td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {exp.paidTo || 'Store Vendor'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                        ₹{parseFloat(exp.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{exp.paymentMode}</span>
                        {exp.refNumber && (
                          <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-xs">
                            Ref: {exp.refNumber}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {exp.description || 'General business operational expense'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasPermission('expenses.edit_delete') && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(exp)}
                              className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-lg"
                              title="Edit Expense"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete expense record ${exp.id}?`)) {
                                  deleteExpense(exp.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded-lg"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add / Edit Expense */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 rounded-xl">
                  <CreditCard className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingExpense ? `Edit Expense (${editingExpense.id})` : 'Record Business Expense'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitExpense} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expense Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expense Category *
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white font-medium"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="e.g. 8500"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold text-rose-600 dark:text-rose-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={expenseForm.paymentMode}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  >
                    {PAYMENT_MODES.map((pm) => (
                      <option key={pm} value={pm}>
                        {pm}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dynamic UTR / Cheque reference field */}
              {expenseForm.paymentMode.includes('UPI') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PhonePe / UPI 12-Digit UTR Ref Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={expenseForm.refNumber}
                    onChange={(e) => setExpenseForm({ ...expenseForm, refNumber: e.target.value })}
                    placeholder="e.g. 429182749102"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono dark:text-white"
                  />
                </div>
              )}

              {expenseForm.paymentMode.includes('Bank') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Transfer NEFT / RTGS Reference UTR *
                  </label>
                  <input
                    type="text"
                    required
                    value={expenseForm.refNumber}
                    onChange={(e) => setExpenseForm({ ...expenseForm, refNumber: e.target.value })}
                    placeholder="e.g. NEFT-HDFC-991823"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono dark:text-white"
                  />
                </div>
              )}

              {expenseForm.paymentMode.includes('Cheque') && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cheque Number & Issuing Bank *
                  </label>
                  <input
                    type="text"
                    required
                    value={expenseForm.refNumber}
                    onChange={(e) => setExpenseForm({ ...expenseForm, refNumber: e.target.value })}
                    placeholder="e.g. Cheque #004921 (SBI)"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paid To / Vendor Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={expenseForm.paidTo}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paidTo: e.target.value })}
                    placeholder="e.g. JVVNL or Landlord"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bill / Voucher / Receipt No
                  </label>
                  <input
                    type="text"
                    value={expenseForm.receiptNo}
                    onChange={(e) => setExpenseForm({ ...expenseForm, receiptNo: e.target.value })}
                    placeholder="e.g. BILL-9921"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Purpose of Expense
                </label>
                <textarea
                  rows={2}
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="e.g. Monthly showroom power bill for AC and ambient lighting..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-rose-500/20"
                >
                  {editingExpense ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

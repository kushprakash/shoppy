import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  Boxes, Printer, Plus, Search, Filter, Calendar,
  CheckCircle2, AlertCircle, X, Receipt, Building2, Phone, ArrowRight, Trash2, FileText,
  Maximize2, Minimize2
} from 'lucide-react';
import InvoicePrintModal from '../../components/InvoicePrintModal';
import SearchableProductSelect from '../../components/SearchableProductSelect';

export default function PurchaseBills() {
  const {
    purchaseBills,
    addPurchaseBill,
    suppliers,
    addSupplier,
    products,
    showToast
  } = useErp();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'pakka', 'kachha', 'due'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(true); // Default to full screen view for comfortable product entry
  const [isQuickSupplierOpen, setIsQuickSupplierOpen] = useState(false);
  const [viewingBill, setViewingBill] = useState(null);

  // Form state for New Inward Purchase Bill
  const [supplierInput, setSupplierInput] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [billNumber, setBillNumber] = useState(`PB-INV-${Date.now().toString().slice(-4)}`);
  const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
  const [billType, setBillType] = useState('pakka'); // 'pakka' (GST) | 'kachha' (Non-GST)
  const [paymentMode, setPaymentMode] = useState('Bank Transfer / NEFT');
  const [paymentRef, setPaymentRef] = useState(''); // Cheque number or UTR number
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');

  // Quick Supplier Form
  const [quickSupplier, setQuickSupplier] = useState({
    name: '',
    phone: '',
    contactPerson: '',
    gstin: '',
    city: 'Jaipur'
  });

  // Purchase Items Table State
  const [items, setItems] = useState([
    {
      productId: '',
      name: '',
      batchNo: '',
      expiryDate: '',
      qty: 10,
      unit: 'pcs',
      purchasePrice: 500,
      mrp: 999,
      sellingPrice: 799,
      gstRate: 5
    }
  ]);

  // Handle supplier mobile search or selection
  const handleSupplierSearch = (val) => {
    setSupplierInput(val);
    const clean = val.replace(/[^0-9]/g, '');
    const found = suppliers.find(
      (s) => (clean.length >= 4 && s.phone.replace(/[^0-9]/g, '').includes(clean)) ||
        s.name.toLowerCase().includes(val.toLowerCase())
    );
    if (found) {
      setSelectedSupplier(found);
    } else {
      setSelectedSupplier(null);
    }
  };

  const handleSelectSupplierDirect = (sup) => {
    setSelectedSupplier(sup);
    setSupplierInput(`${sup.name} (${sup.phone})`);
  };

  // Quick add supplier inline
  const handleSaveQuickSupplier = (e) => {
    e.preventDefault();
    if (!quickSupplier.name || !quickSupplier.phone) {
      showToast('Supplier Name and Phone are required!', 'error');
      return;
    }
    const newSup = {
      id: `SUP-${Date.now().toString().slice(-4)}`,
      ...quickSupplier,
      category: 'General Wholesaler',
      balancePayable: 0.0,
      status: 'Active',
      repaymentHistory: []
    };
    addSupplier(newSup);
    setSelectedSupplier(newSup);
    setSupplierInput(`${newSup.name} (${newSup.phone})`);
    setIsQuickSupplierOpen(false);
    setQuickSupplier({ name: '', phone: '', contactPerson: '', gstin: '', city: 'Jaipur' });
  };

  // Handle direct product selection from SearchableProductSelect
  const handleSelectProduct = (index, prod) => {
    setItems((prev) => {
      const updated = [...prev];
      if (prod) {
        updated[index] = {
          ...updated[index],
          productId: prod.id,
          name: prod.name,
          unit: prod.unit || 'pcs',
          purchasePrice: prod.purchasePrice || 0,
          sellingPrice: prod.sellingPrice || 0,
          mrp: prod.mrp || 0,
          gstRate: prod.gstRate !== undefined ? prod.gstRate : 5,
          batchNo: prod.batchNo || '',
          expiryDate: prod.expiryDate || ''
        };
      } else {
        updated[index] = {
          ...updated[index],
          productId: '',
          name: ''
        };
      }
      return updated;
    });
  };

  // Item row operations
  const handleItemChange = (index, field, val) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };

      // If user selected an existing product, autofill its details
      if (field === 'productId') {
        const prod = products.find((p) => p.id === val);
        if (prod) {
          updated[index].name = prod.name;
          updated[index].unit = prod.unit || 'pcs';
          updated[index].purchasePrice = prod.purchasePrice || 0;
          updated[index].sellingPrice = prod.sellingPrice || 0;
          updated[index].mrp = prod.mrp || 0;
          updated[index].gstRate = prod.gstRate || 0;
          updated[index].batchNo = prod.batchNo || '';
          updated[index].expiryDate = prod.expiryDate || '';
        }
      }
      return updated;
    });
  };

  const addItemRow = () => {
    setItems((prev) => [
      ...prev,
      {
        productId: '',
        name: '',
        batchNo: '',
        expiryDate: '',
        qty: 1,
        unit: 'pcs',
        purchasePrice: 0,
        mrp: 0,
        sellingPrice: 0,
        gstRate: 5
      }
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Totals calculations
  const subtotal = items.reduce((acc, it) => acc + (parseFloat(it.qty || 0) * parseFloat(it.purchasePrice || 0)), 0);
  const gstTotal = billType === 'pakka'
    ? items.reduce((acc, it) => {
      const lineVal = parseFloat(it.qty || 0) * parseFloat(it.purchasePrice || 0);
      const rate = parseFloat(it.gstRate || 0);
      return acc + (lineVal * rate) / 100;
    }, 0)
    : 0;
  const grandTotal = subtotal + gstTotal;
  const paidVal = amountPaid === '' ? grandTotal : parseFloat(amountPaid || 0);
  const duesVal = Math.max(0, grandTotal - paidVal);

  // Submit Inward Purchase Bill
  const handleSubmitPurchaseBill = (e) => {
    e.preventDefault();

    if (!selectedSupplier && !supplierInput) {
      showToast('Please select or enter Supplier details', 'error');
      return;
    }

    if (items.length === 0 || !items[0].name) {
      showToast('Please add at least one product with name and quantity', 'error');
      return;
    }

    const billData = {
      billNumber: billNumber || `PB-INV-${Date.now().toString().slice(-4)}`,
      supplierId: selectedSupplier ? selectedSupplier.id : `SUP-WALK-${Date.now().toString().slice(-4)}`,
      supplierName: selectedSupplier ? selectedSupplier.name : supplierInput,
      supplierPhone: selectedSupplier ? selectedSupplier.phone : '+91 98000 00000',
      billDate,
      billType,
      subtotal,
      gstTotal,
      total: grandTotal,
      paidAmount: paidVal,
      duesAmount: duesVal,
      paymentMode,
      paymentRef: paymentRef || '',
      notes,
      items: items.map((it) => ({
        productId: it.productId,
        name: it.name,
        batchNo: it.batchNo,
        expiryDate: it.expiryDate,
        qty: parseFloat(it.qty || 0),
        unit: it.unit || 'pcs',
        purchasePrice: parseFloat(it.purchasePrice || 0),
        mrp: parseFloat(it.mrp || 0),
        sellingPrice: parseFloat(it.sellingPrice || 0),
        gstRate: parseFloat(it.gstRate || 0),
        amount: parseFloat(it.qty || 0) * parseFloat(it.purchasePrice || 0)
      }))
    };

    const saved = addPurchaseBill(billData);
    setIsModalOpen(false);
    // Reset Form
    setSupplierInput('');
    setSelectedSupplier(null);
    setPaymentRef('');
    setAmountPaid('');
    setNotes('');
    setItems([
      {
        productId: '',
        name: '',
        batchNo: '',
        expiryDate: '',
        qty: 10,
        unit: 'pcs',
        purchasePrice: 500,
        mrp: 999,
        sellingPrice: 799,
        gstRate: 5
      }
    ]);
  };

  // Filtered Bills List
  const filteredBills = useMemo(() => {
    return purchaseBills.filter((b) => {
      const q = search.toLowerCase();
      const matchSearch =
        (b.id || '').toLowerCase().includes(q) ||
        (b.billNumber || '').toLowerCase().includes(q) ||
        (b.supplierName || '').toLowerCase().includes(q) ||
        (b.supplierPhone || '').includes(q);

      if (!matchSearch) return false;

      if (filterType === 'pakka') return (b.billType || 'pakka') === 'pakka';
      if (filterType === 'kachha') return (b.billType || 'pakka') === 'kachha';
      if (filterType === 'due') return (b.duesAmount || 0) > 0;
      return true;
    });
  }, [purchaseBills, search, filterType]);

  // Overall statistics
  const totalPurchaseSum = purchaseBills.reduce((acc, b) => acc + (b.total || 0), 0);
  const totalItcCredit = purchaseBills.reduce((acc, b) => acc + (b.gstTotal || 0), 0);
  const totalSupplierDues = purchaseBills.reduce((acc, b) => acc + (b.duesAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              Inward Stock Purchase Register
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-400">
              Auto Stock Sync
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Record supplier purchase bills, batch & expiry, ITC credit, payment dues, and auto-increase stock.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition"
          >
            <Plus className="w-4 h-4" />  New Purchase Bill (Inward)
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inward Purchase</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ₹ {totalPurchaseSum.toFixed(2)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Cumulative stock purchase value</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Input Tax Credit (ITC GST)</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹ {totalItcCredit.toFixed(2)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Eligible ITC against GSTR-2B</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Supplier Dues (Pending)</p>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ₹ {totalSupplierDues.toFixed(2)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Outstanding balance payable to mills & distributors</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Bill No, Supplier, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterType === 'all'
                ? 'bg-[#00a2c7] text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
          >
            All Bills ({purchaseBills.length})
          </button>
          <button
            onClick={() => setFilterType('pakka')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterType === 'pakka'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
          >
            Pakka (GST Tax Bills)
          </button>
          <button
            onClick={() => setFilterType('kachha')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterType === 'kachha'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
          >
            Kachha (Cash Rough Bills)
          </button>
          <button
            onClick={() => setFilterType('due')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${filterType === 'due'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
          >
            Payment Due Only
          </button>
        </div>
      </div>

      {/* Purchase Bills Register Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Inward ID / Supplier Invoice</th>
                <th className="px-4 py-3">Supplier Name & Phone</th>
                <th className="px-4 py-3">Bill Type</th>
                <th className="px-4 py-3">Items / Batch</th>
                <th className="px-4 py-3">Taxable Value</th>
                <th className="px-4 py-3">Input GST</th>
                <th className="px-4 py-3">Total Amount</th>
                <th className="px-4 py-3">Paid / Dues</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBills.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3">
                    <div className="font-mono font-bold text-slate-900 dark:text-white">{b.id}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Inv: {b.billNumber}</div>
                    <div className="text-[10px] text-slate-400">{b.billDate}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{b.supplierName}</div>
                    <div className="text-[10px] text-slate-400">{b.supplierPhone}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${(b.billType || 'pakka') === 'pakka'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                      }`}>
                      {(b.billType || 'pakka') === 'pakka' ? 'Pakka (GST)' : 'Kachha (Cash)'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                      {b.items?.length || 1} Products Inward
                    </div>
                    {b.items?.[0] && (
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {b.items[0].name} {b.items[0].batchNo ? `(B:${b.items[0].batchNo})` : ''}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-mono">
                    ₹ {b.subtotal.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-emerald-600 font-bold font-mono">
                    ₹ {b.gstTotal.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-black text-slate-900 dark:text-white font-mono text-sm">
                    ₹ {b.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-emerald-600 font-mono text-[11px]">
                      Paid: ₹ {(b.paidAmount || 0).toFixed(2)}
                    </div>
                    {b.paymentRef && (
                      <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                        {b.paymentMode?.includes('Cheque') ? 'Chq' : 'UTR'}: {b.paymentRef}
                      </div>
                    )}
                    {(b.duesAmount || 0) > 0 ? (
                      <div className="font-bold text-rose-600 font-mono text-[10px]">
                        Due: ₹ {b.duesAmount.toFixed(2)}
                      </div>
                    ) : (
                      <div className="text-[10px] text-slate-400">No Dues (NIL)</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${(b.duesAmount || 0) > 0
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                        : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                      }`}>
                      {b.status || ((b.duesAmount || 0) > 0 ? 'Payment Due' : 'Completed')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setViewingBill(b)}
                      className="px-2.5 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-[#00a2c7] hover:bg-cyan-100 dark:hover:bg-cyan-900/60 font-bold text-[11px] transition inline-flex items-center gap-1 border border-cyan-200 dark:border-cyan-800"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: NEW INWARD PURCHASE BILL DRAWER/MODAL (STOCK AUTO-INCREMENT) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-1 sm:p-2 md:p-3 overflow-y-auto">
          <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${isFullscreen
              ? 'h-[98vh] max-h-[98vh] max-w-[99vw]'
              : 'h-[92vh] max-h-[92vh] max-w-6xl my-auto'
            }`}>

            {/* Modal Header */}
            <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                      Create Inward Stock Purchase Bill
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300 hidden sm:inline-block">
                      {isFullscreen ? 'Full Screen View' : 'Standard View'}
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500">
                    Product stock will automatically increase upon saving. Expiry & Batch support included.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title={isFullscreen ? "Restore standard size" : "Expand to Full Screen"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmitPurchaseBill} className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* Supplier Search & Autofill Section */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                    1. Supplier Selection (Search by Mobile or Name) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickSupplierOpen(true)}
                    className="text-xs text-cyan-600 hover:underline font-bold flex items-center gap-1 self-start sm:self-auto"
                  >
                    + Quick Add New Supplier
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2 relative">
                    <input
                      type="text"
                      placeholder="Type Supplier Name or Phone Number (e.g. 98201...)"
                      value={supplierInput}
                      onChange={(e) => handleSupplierSearch(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:outline-none focus:border-cyan-500"
                    />
                    {/* Quick matching dropdown */}
                    {supplierInput && !selectedSupplier && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 max-h-48 overflow-y-auto p-1.5 divide-y divide-slate-100 dark:divide-slate-800">
                        {suppliers.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => handleSelectSupplierDirect(s)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer rounded-lg text-xs flex justify-between items-center"
                          >
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                              <span className="text-[11px] text-slate-400 block">{s.phone} • {s.city}</span>
                            </div>
                            <span className="text-rose-600 font-bold text-[11px]">Dues: ₹{s.balancePayable.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <select
                      onChange={(e) => {
                        const sup = suppliers.find((s) => s.id === e.target.value);
                        if (sup) handleSelectSupplierDirect(sup);
                      }}
                      value={selectedSupplier ? selectedSupplier.id : ''}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600"
                    >
                      <option value="">-- Choose from Directory --</option>
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.phone})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Selected Supplier Card Preview */}
                {selectedSupplier && (
                  <div className="p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800/80 flex flex-wrap items-center justify-between text-xs gap-2">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{selectedSupplier.name}</span>
                      <span className="text-slate-500 ml-2">GSTIN: {selectedSupplier.gstin || 'N/A'}</span>
                      <span className="text-slate-500 ml-2">Phone: {selectedSupplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600 dark:text-slate-400 font-semibold">Previous Dues:</span>
                      <span className="font-extrabold text-rose-600">₹ {selectedSupplier.balancePayable.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Bill Details: Number, Date, Bill Type */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Supplier Bill Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={billNumber}
                    onChange={(e) => setBillNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Invoice Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={billDate}
                    onChange={(e) => setBillDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bill Type (Kachha / Pakka) *
                  </label>
                  <select
                    value={billType}
                    onChange={(e) => setBillType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="pakka">Pakka Bill (GST Tax Inward + ITC Credit)</option>
                    <option value="kachha">Kachha Bill (Non-GST / Cash Inward)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Mode *
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => {
                      setPaymentMode(e.target.value);
                      setPaymentRef('');
                    }}
                    className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
                  >
                    <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                    <option value="PhonePe UPI">PhonePe / UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Credit / Udhaar (Dues)">Credit / Udhaar (Full Dues)</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Payment Reference Input: Cheque No for Cheque, UTR for PhonePe/UPI & Bank Transfer, Hidden for Cash */}
              {(() => {
                const mode = (paymentMode || '').toLowerCase();
                if (mode.includes('cash') || mode.includes('credit') || mode.includes('udhaar')) {
                  return null; // Cash and Credit do not require reference input
                }
                const isCheque = mode.includes('cheque');
                const isUpi = mode.includes('upi') || mode.includes('phonepe');
                
                const label = isCheque 
                  ? 'Cheque Number *' 
                  : isUpi 
                    ? 'PhonePe / UPI UTR Number *' 
                    : 'Bank Transfer / NEFT UTR Number *';
                
                const placeholder = isCheque 
                  ? 'Enter 6-digit Cheque Number (e.g. 409128)...' 
                  : isUpi 
                    ? 'Enter 12-digit UPI UTR No (e.g. 428192003819)...' 
                    : 'Enter Bank NEFT / RTGS / IMPS UTR Reference No...';

                return (
                  <div className="p-3 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded bg-cyan-600 text-white font-mono font-bold text-[10px] tracking-wide">
                        {isCheque ? 'CHEQUE' : 'UTR REF'}
                      </span>
                      <div>
                        <label className="text-xs font-bold text-slate-900 dark:text-white block">
                          {label}
                        </label>
                        <span className="text-[11px] text-slate-500">
                          {isCheque 
                            ? 'Bank Cheque number for payment proof and clearance record' 
                            : 'Digital transaction UTR reference code for accounting reconciliation'}
                        </span>
                      </div>
                    </div>
                    <div className="w-full sm:w-80">
                      <input
                        type="text"
                        required
                        placeholder={placeholder}
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-cyan-300 dark:border-cyan-700 font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 shadow-xs"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Product Lines Section with Searchable Product Select, Chooseable Batch & Expiry */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider block">
                      2. Inward Products (Stock will be added to Catalog)
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Search product by name/SKU/barcode or enter a new item name.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> + Add Another Item Line
                  </button>
                </div>

                {/* DESKTOP TABLE VIEW (Full Width & No Truncation) */}
                <div className="hidden md:block border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
                  <div className="overflow-x-auto min-h-[220px]">
                    <table className="w-full text-left text-xs min-w-[1120px]">
                      <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3 w-80 min-w-[300px]">Search Product or Type Name *</th>
                          <th className="p-3 w-32 min-w-[125px]">Batch No (Opt)</th>
                          <th className="p-3 w-36 min-w-[140px]">Expiry Date (Opt)</th>
                          <th className="p-3 w-24 min-w-[90px]">Inward Qty</th>
                          <th className="p-3 w-24 min-w-[90px]">Unit</th>
                          <th className="p-3 w-28 min-w-[110px]">Cost / Rate (₹)</th>
                          <th className="p-3 w-28 min-w-[110px]">Selling Price (₹)</th>
                          {billType === 'pakka' && <th className="p-3 w-24 min-w-[90px]">GST %</th>}
                          <th className="p-3 w-28 min-w-[110px] text-right">Line Total (₹)</th>
                          <th className="p-3 w-10 text-center"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {items.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                            {/* Product Searchable Selection */}
                            <td className="p-2.5 align-top">
                              <SearchableProductSelect
                                products={products}
                                selectedProductId={row.productId}
                                productName={row.name}
                                placeholder="Search product by name, SKU or barcode..."
                                onSelect={(prod) => handleSelectProduct(idx, prod)}
                                onNameChange={(name) => handleItemChange(idx, 'name', name)}
                              />
                            </td>

                            {/* Batch No (Chooseable) */}
                            <td className="p-2.5 align-top">
                              <input
                                type="text"
                                placeholder="e.g. B-2026-X"
                                value={row.batchNo}
                                onChange={(e) => handleItemChange(idx, 'batchNo', e.target.value)}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                              />
                            </td>

                            {/* Expiry Date (Chooseable) */}
                            <td className="p-2.5 align-top">
                              <input
                                type="date"
                                value={row.expiryDate}
                                onChange={(e) => handleItemChange(idx, 'expiryDate', e.target.value)}
                                className="w-full px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                              />
                            </td>

                            {/* Qty */}
                            <td className="p-2.5 align-top">
                              <input
                                type="number"
                                min="1"
                                step="any"
                                required
                                value={row.qty}
                                onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                                className="w-full px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-bold font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                              />
                            </td>

                            {/* Unit */}
                            <td className="p-2.5 align-top">
                              <select
                                value={row.unit}
                                onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                                className="w-full px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                              >
                                <option value="pcs">pcs</option>
                                <option value="tin">tin</option>
                                <option value="jar">jar</option>
                                <option value="kg">kg</option>
                                <option value="pack">pack</option>
                                <option value="box">box</option>
                                <option value="strip">strip</option>
                                <option value="meter">meter</option>
                                <option value="litre">litre</option>
                              </select>
                            </td>

                            {/* Cost / Purchase Price */}
                            <td className="p-2.5 align-top">
                              <div className="relative">
                                <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-xs">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  required
                                  value={row.purchasePrice}
                                  onChange={(e) => handleItemChange(idx, 'purchasePrice', e.target.value)}
                                  className="w-full pl-6 pr-2 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                                />
                              </div>
                            </td>

                            {/* Selling Price */}
                            <td className="p-2.5 align-top">
                              <div className="relative">
                                <span className="absolute left-2.5 top-1.5 text-slate-400 font-mono text-xs">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="any"
                                  value={row.sellingPrice}
                                  onChange={(e) => handleItemChange(idx, 'sellingPrice', e.target.value)}
                                  className="w-full pl-6 pr-2 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                                />
                              </div>
                            </td>

                            {/* GST Rate */}
                            {billType === 'pakka' && (
                              <td className="p-2.5 align-top">
                                <select
                                  value={row.gstRate}
                                  onChange={(e) => handleItemChange(idx, 'gstRate', e.target.value)}
                                  className="w-full px-2 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-cyan-500"
                                >
                                  <option value="0">0% GST</option>
                                  <option value="5">5% GST</option>
                                  <option value="12">12% GST</option>
                                  <option value="18">18% GST</option>
                                  <option value="28">28% GST</option>
                                </select>
                              </td>
                            )}

                            {/* Line Total */}
                            <td className="p-2.5 align-top text-right font-bold font-mono text-xs text-slate-900 dark:text-white pt-3">
                              ₹ {(parseFloat(row.qty || 0) * parseFloat(row.purchasePrice || 0)).toFixed(2)}
                            </td>

                            {/* Remove Row */}
                            <td className="p-2.5 align-top text-center pt-2.5">
                              {items.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeItemRow(idx)}
                                  className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
                                  title="Remove Item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* MOBILE RESPONSIVE CARDS VIEW (< 768px screens) */}
                <div className="md:hidden space-y-3">
                  {items.map((row, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-cyan-600/10 text-cyan-600 flex items-center justify-center text-[10px]">
                            {idx + 1}
                          </span>
                          Item #{idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-extrabold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded">
                            ₹ {(parseFloat(row.qty || 0) * parseFloat(row.purchasePrice || 0)).toFixed(2)}
                          </span>
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeItemRow(idx)}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Product Searchable Select */}
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                          Select / Search Product *
                        </label>
                        <SearchableProductSelect
                          products={products}
                          selectedProductId={row.productId}
                          productName={row.name}
                          placeholder="Search product by name, SKU or barcode..."
                          onSelect={(prod) => handleSelectProduct(idx, prod)}
                          onNameChange={(name) => handleItemChange(idx, 'name', name)}
                        />
                      </div>

                      {/* Batch & Expiry Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            Batch No (Opt)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. B-2026-X"
                            value={row.batchNo}
                            onChange={(e) => handleItemChange(idx, 'batchNo', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            Expiry Date (Opt)
                          </label>
                          <input
                            type="date"
                            value={row.expiryDate}
                            onChange={(e) => handleItemChange(idx, 'expiryDate', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          />
                        </div>
                      </div>

                      {/* Qty & Unit Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            Inward Qty *
                          </label>
                          <input
                            type="number"
                            min="1"
                            step="any"
                            required
                            value={row.qty}
                            onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            Unit
                          </label>
                          <select
                            value={row.unit}
                            onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                            className="w-full px-2 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          >
                            <option value="pcs">pcs</option>
                            <option value="tin">tin</option>
                            <option value="jar">jar</option>
                            <option value="kg">kg</option>
                            <option value="pack">pack</option>
                            <option value="box">box</option>
                            <option value="strip">strip</option>
                            <option value="meter">meter</option>
                            <option value="litre">litre</option>
                          </select>
                        </div>
                      </div>

                      {/* Cost & Selling Price Grid */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            Cost / Rate (₹) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            required
                            value={row.purchasePrice}
                            onChange={(e) => handleItemChange(idx, 'purchasePrice', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            Selling Price (₹)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={row.sellingPrice}
                            onChange={(e) => handleItemChange(idx, 'sellingPrice', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                          />
                        </div>
                      </div>

                      {/* GST Selector (Pakka Bill) */}
                      {billType === 'pakka' && (
                        <div>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">
                            GST Tax Rate
                          </label>
                          <select
                            value={row.gstRate}
                            onChange={(e) => handleItemChange(idx, 'gstRate', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          >
                            <option value="0">0% GST</option>
                            <option value="5">5% GST</option>
                            <option value="12">12% GST</option>
                            <option value="18">18% GST</option>
                            <option value="28">28% GST</option>
                          </select>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation & Dues Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notes / Inward Remarks (Optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Received at warehouse in good condition, transport invoice #442..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 resize-none"
                  />
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>Taxable Subtotal:</span>
                    <span className="font-mono">₹ {subtotal.toFixed(2)}</span>
                  </div>

                  {billType === 'pakka' && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Input Tax Credit (ITC GST):</span>
                      <span className="font-mono text-emerald-600 font-bold">+ ₹ {gstTotal.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between font-black text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
                    <span>Grand Total Bill Amount:</span>
                    <span className="font-mono">₹ {grandTotal.toFixed(2)}</span>
                  </div>

                  {/* Payment Amount & Remaining Dues */}
                  <div className="pt-2 border-t border-dashed border-slate-300 dark:border-slate-600 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Amount Paid Now (₹):</span>
                      <input
                        type="number"
                        step="any"
                        placeholder={grandTotal.toFixed(2)}
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(e.target.value)}
                        className="w-32 px-2 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 font-bold text-right font-mono"
                      />
                    </div>

                    <div className="flex justify-between font-extrabold text-xs">
                      <span>Remaining Dues to Supplier:</span>
                      <span className={duesVal > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        ₹ {duesVal.toFixed(2)} {duesVal > 0 ? '(Added to Supplier Balance)' : '(Fully Paid)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-md shadow-cyan-500/20"
                >
                  Save Bill & Increase Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK ADD NEW SUPPLIER (INLINE) */}
      {/* ========================================================================= */}
      {isQuickSupplierOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Quick Add Supplier</h3>
              <button onClick={() => setIsQuickSupplierOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickSupplier} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Supplier / Mill Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vardhman Textiles Ltd"
                  value={quickSupplier.name}
                  onChange={(e) => setQuickSupplier({ ...quickSupplier, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Phone / Mobile Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98200 12345"
                  value={quickSupplier.phone}
                  onChange={(e) => setQuickSupplier({ ...quickSupplier, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Manager Name"
                    value={quickSupplier.contactPerson}
                    onChange={(e) => setQuickSupplier({ ...quickSupplier, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">City</label>
                  <input
                    type="text"
                    value={quickSupplier.city}
                    onChange={(e) => setQuickSupplier({ ...quickSupplier, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">GSTIN Number (Optional)</label>
                <input
                  type="text"
                  placeholder="08AABCR1290M1Z5"
                  value={quickSupplier.gstin}
                  onChange={(e) => setQuickSupplier({ ...quickSupplier, gstin: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickSupplierOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: INWARD SLIP PRINT (SUPPORTS 3 FORMATS) */}
      {/* ========================================================================= */}
      {viewingBill && (
        <InvoicePrintModal
          invoice={{
            id: viewingBill.id,
            date: viewingBill.billDate,
            customerName: `[SUPPLIER] ${viewingBill.supplierName}`,
            phone: viewingBill.supplierPhone,
            paymentMethod: viewingBill.paymentMode,
            billType: viewingBill.billType,
            channel: 'Inward Warehouse Receipt',
            channelType: 'offline',
            subtotal: viewingBill.subtotal,
            gstTotal: viewingBill.gstTotal,
            total: viewingBill.total,
            paidAmount: viewingBill.paidAmount,
            duesAmount: viewingBill.duesAmount,
            items: (viewingBill.items || []).map((i) => ({
              name: i.name,
              qty: i.qty,
              unit: i.unit,
              price: i.purchasePrice,
              gst: `${i.gstRate || 0}%`,
              batchNo: i.batchNo,
              expiryDate: i.expiryDate
            }))
          }}
          onClose={() => setViewingBill(null)}
        />
      )}
    </div>
  );
}

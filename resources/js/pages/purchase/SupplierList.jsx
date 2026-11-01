import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  Plus, Users, Phone, Receipt, X, Search, CreditCard, 
  CheckCircle2, ArrowUpRight, History, Building2, MapPin
} from 'lucide-react';

export default function SupplierList() {
  const { suppliers, addSupplier, repaySupplierDues, showToast, hasPermission } = useErp();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  // Repay Dues Modal State
  const [repaySupplier, setRepaySupplier] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayMode, setRepayMode] = useState('Bank Transfer / NEFT');
  const [repayRef, setRepayRef] = useState('');
  const [repayNote, setRepayNote] = useState('');

  const [form, setForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    gstin: '',
    city: 'Jaipur',
    category: 'Fabrics & Garments'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    const newSup = {
      id: `SUP-${100 + suppliers.length + 1}`,
      ...form,
      balancePayable: 0.0,
      status: 'Active',
      repaymentHistory: []
    };
    addSupplier(newSup);
    setIsOpen(false);
    setForm({ name: '', contactPerson: '', phone: '', email: '', gstin: '', city: 'Jaipur', category: 'Fabrics & Garments' });
  };

  const handleOpenRepayModal = (sup) => {
    setRepaySupplier(sup);
    setRepayAmount(sup.balancePayable.toString());
    setRepayRef(`TXN-${Date.now().toString().slice(-6)}`);
    setRepayNote('');
  };

  const handleExecuteRepay = (e) => {
    e.preventDefault();
    if (!repaySupplier) return;
    const amt = parseFloat(repayAmount || 0);
    if (amt <= 0) {
      showToast('Please enter a valid repayment amount', 'error');
      return;
    }
    repaySupplierDues({
      supplierId: repaySupplier.id,
      amount: amt,
      paymentMode: repayMode,
      note: repayNote,
      refNumber: repayRef
    });
    setRepaySupplier(null);
  };

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const q = search.toLowerCase();
      return (
        s.name.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        (s.contactPerson || '').toLowerCase().includes(q) ||
        (s.gstin || '').toLowerCase().includes(q) ||
        (s.city || '').toLowerCase().includes(q)
      );
    });
  }, [suppliers, search]);

  const totalDuesPayable = suppliers.reduce((acc, s) => acc + (parseFloat(s.balancePayable) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              Supplier Directory & Dues Management
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-400">
              Total Dues: ₹ {totalDuesPayable.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage textile mills, pharma distributors, grocery wholesalers & settle outstanding vendor dues.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasPermission('purchase.create_supplier') && (
            <button
              onClick={() => setIsOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-xs font-bold text-white shadow-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> + Add New Supplier
            </button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search Supplier Name, Mobile, City, GSTIN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredSuppliers.map((s) => (
          <div 
            key={s.id} 
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {s.id}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                  {s.status || 'Active'}
                </span>
              </div>

              <h3 className="font-black text-slate-900 dark:text-white text-base">{s.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{s.category}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" /> {s.contactPerson || 'Proprietor'}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" /> {s.phone}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {s.city || 'Jaipur'}
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <Receipt className="w-3.5 h-3.5 text-slate-400" /> GSTIN: {s.gstin || 'Unregistered'}
                </div>
              </div>
            </div>

            {/* Dues & Settle Button */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-medium">Balance Payable:</span>
                <span className={`text-sm font-black font-mono ${
                  s.balancePayable > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                }`}>
                  ₹ {(s.balancePayable || 0).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {hasPermission('purchase.repay_dues') && (
                  <button
                    onClick={() => handleOpenRepayModal(s)}
                    className={`w-full py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs ${
                      s.balancePayable > 0
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Re-Pay / Settle Dues
                  </button>
                )}
              </div>

              {/* Past Repayment Badge */}
              {s.repaymentHistory && s.repaymentHistory.length > 0 && (
                <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                  <History className="w-3 h-3 text-emerald-500" />
                  <span>Last paid: ₹{s.repaymentHistory[0].amount.toFixed(2)} on {s.repaymentHistory[0].date}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW SUPPLIER MODAL */}
      {/* ========================================================================= */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Add New Supplier</h3>
              <button onClick={() => setIsOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company / Mill Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vardhman Spinning Mills Ltd"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="Manager"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone / Mobile *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98201 12345"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  placeholder="27AAACR1290M1ZP"
                  value={form.gstin}
                  onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RE-PAY / SETTLE SUPPLIER DUES MODAL (ALL DUES RE-PAY OPTION) */}
      {/* ========================================================================= */}
      {repaySupplier && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Settle Supplier Dues (Re-Pay)
                  </h3>
                  <p className="text-xs text-slate-500">{repaySupplier.name}</p>
                </div>
              </div>
              <button onClick={() => setRepaySupplier(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleExecuteRepay} className="space-y-4 mt-4 text-xs">
              {/* Current Outstanding Dues Display */}
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold block">Outstanding Balance Payable:</span>
                  <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                    ₹ {repaySupplier.balancePayable.toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRepayAmount(repaySupplier.balancePayable.toString())}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                >
                  Pay Full Dues
                </button>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Repayment Amount (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min="1"
                  max={repaySupplier.balancePayable > 0 ? repaySupplier.balancePayable : 1000000}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-base font-mono"
                />
              </div>

              <div className={repayMode === 'Cash' ? 'grid grid-cols-1 gap-3' : 'grid grid-cols-2 gap-3'}>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Payment Mode *
                  </label>
                  <select
                    value={repayMode}
                    onChange={(e) => {
                      setRepayMode(e.target.value);
                      setRepayRef('');
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                    <option value="PhonePe UPI">PhonePe / UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                {repayMode !== 'Cash' && (
                  <div>
                    <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                      {repayMode === 'Cheque'
                        ? 'Cheque Number *'
                        : (repayMode.includes('UPI') || repayMode.includes('PhonePe'))
                          ? 'PhonePe / UPI UTR Number *'
                          : 'Bank Transfer / NEFT UTR Number *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={repayMode === 'Cheque' ? 'e.g. 6-digit Cheque No' : 'e.g. 12-digit UTR No'}
                      value={repayRef}
                      onChange={(e) => setRepayRef(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Notes / Payment Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Settle bill #8841 via HDFC netbanking"
                  value={repayNote}
                  onChange={(e) => setRepayNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Past Repayment Ledger if any */}
              {repaySupplier.repaymentHistory && repaySupplier.repaymentHistory.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                    <History className="w-3.5 h-3.5" /> Recent Repayment History:
                  </p>
                  <div className="max-h-28 overflow-y-auto space-y-1">
                    {repaySupplier.repaymentHistory.map((h, i) => (
                      <div key={i} className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between text-[11px]">
                        <span>{h.date} • {h.paymentMode}</span>
                        <span className="font-bold text-emerald-600">₹ {h.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRepaySupplier(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Confirm Repayment (Deduct Dues)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

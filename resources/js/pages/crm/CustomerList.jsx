import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { 
  Users, Send, ShoppingCart, Search, CreditCard, 
  X, CheckCircle2, History, Phone, AlertCircle
} from 'lucide-react';

export default function CustomerList() {
  const { customers, repayCustomerDues, showToast, hasPermission } = useErp();
  const [search, setSearch] = useState('');
  
  // Re-pay Dues Modal State
  const [repayCustomer, setRepayCustomer] = useState(null);
  const [repayAmount, setRepayAmount] = useState('');
  const [repayMode, setRepayMode] = useState('Cash');
  const [repayRef, setRepayRef] = useState('');
  const [repayNote, setRepayNote] = useState('');

  const handleOpenRepayModal = (cust) => {
    setRepayCustomer(cust);
    setRepayAmount((cust.balanceDue || 0).toString());
    setRepayRef(`RCPT-${Date.now().toString().slice(-6)}`);
    setRepayNote('');
  };

  const handleExecuteRepay = (e) => {
    e.preventDefault();
    if (!repayCustomer) return;
    const amt = parseFloat(repayAmount || 0);
    if (amt <= 0) {
      showToast('Please enter a valid collection amount', 'error');
      return;
    }
    repayCustomerDues({
      customerId: repayCustomer.id,
      amount: amt,
      paymentMode: repayMode,
      note: repayNote,
      refNumber: repayRef
    });
    setRepayCustomer(null);
  };

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.mobile || '').includes(q) ||
        (c.city || '').toLowerCase().includes(q) ||
        (c.id || '').toLowerCase().includes(q)
      );
    });
  }, [customers, search]);

  const totalMarketDues = customers.reduce((acc, c) => acc + (parseFloat(c.balanceDue) || 0), 0);
  const totalLifetimeSales = customers.reduce((acc, c) => acc + (parseFloat(c.lifetimeSpend) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              Customer Directory & Dues Ledger (CRM)
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-400">
              Outstanding Dues: ₹ {totalMarketDues.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-saved during billing via mobile number. Manage repeat shoppers, loyalty wallets & customer dues collection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => showToast('Customer database synced with WhatsApp & SMS contacts!')}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
          >
            Sync Mobile Contacts
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Registered Shoppers</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {customers.length}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Walk-in POS & online storefront accounts</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative Lifetime Spend</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            ₹ {totalLifetimeSales.toFixed(2)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Customer revenue turnover</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Market Udhaar / Customer Dues</p>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            ₹ {totalMarketDues.toFixed(2)}
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">Total credit balance to be collected</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        <input
          type="text"
          placeholder="Search Customer Name, Mobile, City..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="px-4 py-3">Customer ID / Name</th>
                <th className="px-4 py-3">Phone & Email</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Tier</th>
                <th className="px-4 py-3">Total Orders</th>
                <th className="px-4 py-3">Lifetime Spend</th>
                <th className="px-4 py-3">Outstanding Dues</th>
                <th className="px-4 py-3 text-right">Dues Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCustomers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                    <div className="font-mono text-slate-400 text-[10px]">{c.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-800 dark:text-slate-200 font-medium">{c.mobile}</div>
                    <div className="text-[10px] text-slate-400">{c.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.city || 'Jaipur'}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7]">
                      {c.category || 'Retail Walk-in'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{c.totalOrders || 1} Orders</td>
                  <td className="px-4 py-3 font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹ {(c.lifetimeSpend || 0).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 font-mono">
                    {(c.balanceDue || 0) > 0 ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900">
                        ₹ {c.balanceDue.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold text-[11px]">NIL (No Dues)</span>
                    )}
                  </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {hasPermission('crm.repay_dues') && (
                          <button
                            onClick={() => handleOpenRepayModal(c)}
                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                              (c.balanceDue || 0) > 0
                                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-xs'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" /> Re-Pay / Collect
                          </button>
                        )}

                      <button
                        onClick={() => {
                          const clean = (c.mobile || '').replace(/[^0-9]/g, '');
                          window.open(`https://wa.me/${clean.length === 10 ? '91' + clean : clean}?text=Hello%20${encodeURIComponent(c.name)}%2C%20thank%20you%20for%20shopping%20at%20Ramesh%20Fashion%20Store!`, '_blank');
                        }}
                        className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 hover:bg-emerald-100 transition"
                        title="Send WhatsApp message"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: RE-PAY / COLLECT CUSTOMER DUES (RE-PAY ALL OPTION) */}
      {/* ========================================================================= */}
      {repayCustomer && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Collect Customer Dues (Re-Pay)
                  </h3>
                  <p className="text-xs text-slate-500">{repayCustomer.name} ({repayCustomer.mobile})</p>
                </div>
              </div>
              <button onClick={() => setRepayCustomer(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleExecuteRepay} className="space-y-4 mt-4 text-xs">
              {/* Current Outstanding Dues Display */}
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 flex items-center justify-between">
                <div>
                  <span className="text-slate-600 dark:text-slate-400 font-semibold block">Total Pending Dues (Udhaar):</span>
                  <span className="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">
                    ₹ {(repayCustomer.balanceDue || 0).toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setRepayAmount((repayCustomer.balanceDue || 0).toString())}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-xs"
                >
                  Clear Full Dues
                </button>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Collection Amount Received (₹) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  min="1"
                  max={(repayCustomer.balanceDue || 0) > 0 ? repayCustomer.balanceDue : 1000000}
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-base font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Payment Mode *
                  </label>
                  <select
                    value={repayMode}
                    onChange={(e) => setRepayMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="Cash">Cash Counter</option>
                    <option value="PhonePe UPI">PhonePe / GPay UPI</option>
                    <option value="Card (POS Machine)">Debit / Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Receipt / Transaction Ref
                  </label>
                  <input
                    type="text"
                    value={repayRef}
                    onChange={(e) => setRepayRef(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Collection Note / Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cleared bill dues at store counter"
                  value={repayNote}
                  onChange={(e) => setRepayNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              {/* Past Repayment History */}
              {repayCustomer.repaymentHistory && repayCustomer.repaymentHistory.length > 0 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="font-bold text-slate-600 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                    <History className="w-3.5 h-3.5" /> Recent Dues Receipts:
                  </p>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {repayCustomer.repaymentHistory.map((h, i) => (
                      <div key={i} className="p-2 rounded bg-slate-100 dark:bg-slate-800 flex justify-between text-[11px]">
                        <span>{h.date} • {h.paymentMode}</span>
                        <span className="font-bold text-emerald-600 font-mono">₹ {h.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRepayCustomer(null)}
                  className="px-3 py-1.5 rounded-lg text-slate-500 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Confirm Receipt (Clear Dues)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

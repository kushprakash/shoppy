import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Boxes, Printer } from 'lucide-react';

export default function PurchaseBills() {
  const { showToast } = useErp();

  const sampleBills = [
    { id: 'PB-2026-101', supplier: 'Raymond Textiles & Garments Ltd', date: '2026-10-18', amount: 42500.0, gst: 2125.0, status: 'Inward Completed' },
    { id: 'PB-2026-102', supplier: 'ITC Agri & Foods Distribution', date: '2026-10-14', amount: 18200.0, gst: 910.0, status: 'Inward Completed' },
    { id: 'PB-2026-103', supplier: 'Alpha Gadgets & Wireless Importers', date: '2026-10-10', amount: 65400.0, gst: 11772.0, status: 'Payment Due' }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Inward Stock Purchase Bills</h2>
          <p className="text-xs text-slate-500">Inward inventory invoices with ITC (Input Tax Credit) ledger records.</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 flex items-center gap-1.5"
        >
          <Printer className="w-4 h-4" /> Print Purchase Register
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/70 text-slate-500 font-semibold uppercase">
            <tr>
              <th className="px-4 py-3">Bill Number / Date</th>
              <th className="px-4 py-3">Supplier Name</th>
              <th className="px-4 py-3">Taxable Value</th>
              <th className="px-4 py-3">Input GST Credit</th>
              <th className="px-4 py-3">Total Bill Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sampleBills.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition">
                <td className="px-4 py-3">
                  <div className="font-mono font-bold text-slate-900 dark:text-white">{b.id}</div>
                  <div className="text-[10px] text-slate-400">{b.date}</div>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{b.supplier}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-300">₹ {b.amount.toFixed(2)}</td>
                <td className="px-4 py-3 text-emerald-600 font-bold">₹ {b.gst.toFixed(2)}</td>
                <td className="px-4 py-3 font-black text-slate-900 dark:text-white text-sm">
                  ₹ {(b.amount + b.gst).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => showToast(`Opening Purchase Bill ${b.id}`)}
                    className="px-2.5 py-1 rounded bg-[#00a2c7]/10 text-[#00a2c7] hover:bg-[#00a2c7]/20 font-bold text-[11px] transition"
                  >
                    View Inward Slip
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

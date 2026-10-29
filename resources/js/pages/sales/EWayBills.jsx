import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Truck, Plus, CheckCircle2 } from 'lucide-react';

export default function EWayBills() {
  const { showToast } = useErp();

  const [form, setForm] = useState({
    invoiceNumber: 'ORD-2026-9041',
    transporterId: '27AAACR1290M1ZP (VRL Logistics)',
    vehicleNumber: 'RJ-14-GA-8821',
    distanceKm: '180',
    supplyType: 'Outward Inter-state Supply'
  });

  const [bills, setBills] = useState([
    {
      id: 'EWB-2026-881920',
      invoice: 'ORD-2026-9041',
      recipient: 'Vikramaditya Rathore',
      vehicle: 'RJ-14-GA-8821',
      transporter: 'VRL Logistics',
      validUntil: '2026-10-24 11:59 PM',
      status: 'Active (In-Transit)'
    }
  ]);

  const handleGenerate = (e) => {
    e.preventDefault();
    const newBill = {
      id: `EWB-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      invoice: form.invoiceNumber,
      recipient: 'Customer / B2B Client',
      vehicle: form.vehicleNumber,
      transporter: form.transporterId,
      validUntil: '2026-10-25 11:59 PM',
      status: 'Generated & Active'
    };
    setBills([newBill, ...bills]);
    showToast(`E-Way Bill ${newBill.id} generated via NIC Portal!`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">E-Way Bill Generation Desk</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mandatory for consignments & invoices exceeding ₹50,000 under Section 138 of CGST Act.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Generate New E-Way Bill</h3>
          <form onSubmit={handleGenerate} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Invoice Number</label>
              <input
                type="text"
                value={form.invoiceNumber}
                onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Transporter Name / ID</label>
              <input
                type="text"
                value={form.transporterId}
                onChange={(e) => setForm({ ...form, transporterId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Vehicle No</label>
                <input
                  type="text"
                  value={form.vehicleNumber}
                  onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">Distance (KM)</label>
                <input
                  type="number"
                  value={form.distanceKm}
                  onChange={(e) => setForm({ ...form, distanceKm: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 mt-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-xs transition"
            >
              Generate 12-Digit E-Way Bill
            </button>
          </form>
        </div>

        {/* Existing Bills List */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active E-Way Consignments</h3>
          <div className="space-y-3">
            {bills.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#00a2c7]">{b.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                      {b.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Invoice: <span className="font-mono font-bold">{b.invoice}</span> • Vehicle: <span className="font-mono font-bold">{b.vehicle}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Transporter: {b.transporter} • Valid until: {b.validUntil}
                  </div>
                </div>

                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-xs hover:bg-slate-100"
                >
                  Print EWB Slip
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

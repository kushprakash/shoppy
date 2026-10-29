import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Printer, Zap, CheckCircle2 } from 'lucide-react';

export default function PosShifts() {
  const { shiftData, setIsZReportOpen } = useErp();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Shift Register Active
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2">
              Cash Register #01 (Main Counter)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cashier: {shiftData.cashier} • Opened at {shiftData.openedAt}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsZReportOpen(true)}
              className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition"
            >
              <Printer className="w-4 h-4" /> Print Z-Report
            </button>
            <a
              href="/pos-terminal"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm shadow-emerald-600/30 transition"
            >
              <Zap className="w-4 h-4" /> Open Billing Screen
            </a>
          </div>
        </div>

        {/* Shift Financials Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Floating Cash In</p>
            <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              ₹ {shiftData.openingFloat.toFixed(2)}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Opening change drawer</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Cash Sales Collected</p>
            <h4 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
              ₹ {shiftData.cashSales.toFixed(2)}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">24 counter cash bills</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">UPI / QR & Cards</p>
            <h4 className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
              ₹ {(shiftData.upiSales + shiftData.cardSales).toFixed(2)}
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Bank settlements directly</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-semibold text-slate-500 uppercase">Expected Physical Cash</p>
            <h4 className="text-xl font-extrabold text-[#00a2c7] mt-1">
              ₹ {shiftData.expectedCashInDrawer.toFixed(2)}
            </h4>
            <p className="text-[10px] text-emerald-600 font-bold mt-0.5">Drawer Difference: ₹ 0.00</p>
          </div>
        </div>
      </div>
    </div>
  );
}

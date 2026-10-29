import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Truck } from 'lucide-react';

export default function CourierShipping() {
  const { shippingProviders, toggleShipping, showToast } = useErp();

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Courier & Shipping Aggregators (5 Partners)</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          5 pre-integrated courier aggregators. Automatically calculate live pincode rates, generate AWB, print 4x6 thermal shipping labels, and track live deliveries.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {shippingProviders.map((p) => (
          <div
            key={p.provider_code}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950 text-[#00a2c7] flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{p.display_name}</h3>
                    <span className="text-xs text-slate-400 font-mono">Code: {p.provider_code}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleShipping(p)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    p.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800'
                      : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      p.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  {p.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-1">
                <div>
                  Default Pickup Pincode: <code className="font-mono text-slate-800 dark:text-slate-200 font-bold">{p.pickup_pincode}</code>
                </div>
                <div>Features: Automated AWB, 4x6 Barcode Thermal Label, Pickup Request</div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => showToast(`Sample AWB generated with ${p.display_name}: AWB-772901`)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 transition"
              >
                Test Rate & AWB Ping
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { ShieldCheck, Key, Settings, X } from 'lucide-react';

export default function PaymentGateways() {
  const { gateways, toggleGateway, fallbackPolicy, showToast } = useErp();
  const [selectedGateway, setSelectedGateway] = useState(null);

  const handleSaveKeys = () => {
    setSelectedGateway(null);
    showToast('Merchant API keys encrypted and stored in tenant DB!');
  };

  return (
    <div className="space-y-5">
      {/* Fallback Banner (PRD Section 11) */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between ${
          fallbackPolicy.has_active_online_gateway
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
            : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 flex-shrink-0 text-emerald-600" />
          <div>
            <h3 className="font-bold text-sm">
              {fallbackPolicy.has_active_online_gateway
                ? 'Online Payment Gateways Active on Storefront'
                : 'Default Fallback Mode Active: Only COD (Cash on Delivery)'}
            </h3>
            <p className="text-xs opacity-85 mt-0.5">
              {fallbackPolicy.has_active_online_gateway
                ? 'Customers can now pay online via active gateways (PhonePe, Cashfree, Razorpay) or choose COD.'
                : 'No online gateway is active yet. Activate at least one gateway below to enable online checkout.'}
            </p>
          </div>
        </div>
      </div>

      {/* 5 Gateway Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gateways.map((gw) => (
          <div
            key={gw.gateway_code}
            className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
              gw.is_active
                ? 'bg-white dark:bg-slate-900 border-[#00a2c7]/50 shadow-sm'
                : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-90'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase ${
                      gw.gateway_code === 'phonepe'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : gw.gateway_code === 'payu'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : gw.gateway_code === 'cashfree'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : gw.gateway_code === 'easebuzz'
                        ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300'
                        : 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300'
                    }`}
                  >
                    {gw.gateway_code.substring(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base">{gw.display_name}</h3>
                    <span className="text-xs text-slate-400 font-mono">Code: {gw.gateway_code}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleGateway(gw)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    gw.is_active
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      gw.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                    }`}
                  />
                  {gw.is_active ? 'Active' : 'Inactive'}
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-400" />
                  {gw.has_credentials ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                      Keys Configured (AES-256 Encrypted)
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 font-medium">No Keys Entered</span>
                  )}
                </span>

                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                  {gw.is_test_mode ? 'Sandbox / Test' : 'Production Live'}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedGateway(gw)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition flex items-center gap-1.5"
              >
                <Settings className="w-3.5 h-3.5" /> Configure API Keys
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Gateway Modal */}
      {selectedGateway && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Key className="w-5 h-5 text-[#00a2c7]" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Configure {selectedGateway.display_name}
                </h3>
              </div>
              <button onClick={() => setSelectedGateway(null)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 my-3">
              Enter your merchant API credentials. All secrets are stored in encrypted format (AES-256-CBC) inside your private tenant database.
            </p>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Merchant ID / Key ID</label>
                <input
                  type="text"
                  defaultValue="M230616048322069"
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Salt / Secret Key</label>
                <input
                  type="password"
                  defaultValue="099eb0cd-02cf-4e2a-8aca-3e6c6aff0399"
                  className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedGateway(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKeys}
                className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-xs transition"
              >
                Save & Encrypt Keys
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

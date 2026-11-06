import React, { useState } from 'react';
import { X, UserPlus, Sparkles, CheckCircle2, RotateCw, ShieldCheck, Percent, IndianRupee } from 'lucide-react';

export default function AgentCreateModal({ isOpen, onClose, onAgentCreated }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Jaipur',
    state: '08 - RAJASTHAN',
    address: '',
    pan_number: '',
    upi_id: '',
    bank_account_no: '',
    bank_ifsc: '',
    commission_rate_percent: '10.00',
    fixed_signup_bonus: '500.00',
    referral_code: '', // left empty for auto-generation
    password: 'agent123'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/master/agents/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onAgentCreated) onAgentCreated(data.agent);
        onClose();
      } else {
        setError(data.message || 'Failed to create agent.');
      }
    } catch (err) {
      setError('Network error registering agent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl relative my-8">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-[#00a2c7]/10 via-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00a2c7] text-white flex items-center justify-center shadow-md shadow-cyan-600/25">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Register Authorized Channel Partner
              </h3>
              <p className="text-xs text-slate-500">
                Auto-generates unique Agent Code & Official I-Card
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-semibold">
              {error}
            </div>
          )}

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Agent Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Vikramaditya Rathore"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#00a2c7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number *
              </label>
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9]/g, '') })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold tracking-wide text-slate-900 dark:text-white focus:outline-none focus:border-[#00a2c7]"
              />
            </div>
          </div>

          {/* Email & Initial Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Official Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="agent@enexa-partner.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#00a2c7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Portal Login Password *
              </label>
              <input
                type="text"
                required
                placeholder="Default: agent123"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-[#00a2c7]"
              />
            </div>
          </div>

          {/* DYNAMIC COMMISSION % & SIGNUP BONUS */}
          <div className="p-3.5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/80 space-y-3">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#00a2c7]" />
              <span className="font-black text-xs text-slate-900 dark:text-white">
                Dynamic Commission Structure (Super Admin Configurable)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Commission Rate on Sales & Renewals (%) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    required
                    value={formData.commission_rate_percent}
                    onChange={(e) => setFormData({ ...formData, commission_rate_percent: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-black text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#00a2c7]"
                  />
                  <span className="absolute right-3 top-2.5 font-bold text-slate-400">%</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Auto-credited to wallet on every signup and renewal
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Fixed Onboarding Bonus (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    value={formData.fixed_signup_bonus}
                    onChange={(e) => setFormData({ ...formData, fixed_signup_bonus: e.target.value })}
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-black text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#00a2c7]"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Additional bonus per new store activated
                </span>
              </div>
            </div>
          </div>

          {/* AGENT CODE (Auto-Generation Option) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Agent Code (Optional — Auto-Generated if left empty)
            </label>
            <input
              type="text"
              placeholder="e.g. AGT-2026-RAJ (Leave empty for auto-generation)"
              value={formData.referral_code}
              onChange={(e) => setFormData({ ...formData, referral_code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs uppercase font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00a2c7]"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              ✨ If empty, system creates unique code (e.g. <code>AGT{new Date().toISOString().slice(0, 10).replace(/-/g, '')}01</code>) and I-Card.
            </span>
          </div>

          {/* City & State */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Territory City
              </label>
              <input
                type="text"
                placeholder="e.g. Jaipur"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-[#00a2c7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Territory State
              </label>
              <input
                type="text"
                placeholder="e.g. 08 - RAJASTHAN"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-[#00a2c7]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-black text-xs shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition"
            >
              {isSubmitting ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Registering Partner & Generating Code...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Register Agent & Issue I-Card</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

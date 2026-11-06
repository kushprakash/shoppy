import React, { useState } from 'react';
import { X, Gift, Sparkles, CheckCircle2, RotateCw, IndianRupee } from 'lucide-react';

export default function AgentRewardModal({ isOpen, onClose, agent, onRewardAdded }) {
  if (!isOpen || !agent) return null;

  const [rewardAmount, setRewardAmount] = useState('2000');
  const [rewardReason, setRewardReason] = useState('Quarterly Merchant Onboarding Milestone Bonus');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const amountNum = parseFloat(rewardAmount);
    if (!amountNum || amountNum <= 0) {
      setError('Please enter a valid reward amount.');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/master/agents/add-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          agent_id: agent.id,
          reward_amount: amountNum,
          reason: rewardReason.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onRewardAdded) onRewardAdded(data);
        onClose();
      } else {
        setError(data.message || 'Failed to credit reward.');
      }
    } catch (err) {
      setError('Network error adding reward.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000, 10000];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-emerald-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                Award Cash Bonus & Reward
              </h3>
              <p className="text-xs text-slate-500">
                Instantly credits into Agent's wallet balance
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

          {/* Agent Information Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <span className="font-black text-xs text-slate-900 dark:text-white block">
                {agent.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Code: {agent.agent_code || agent.referral_code} • {agent.phone}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
              Rate: {agent.commission_rate_percent}%
            </span>
          </div>

          {/* Quick Amount Pills */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Select Quick Reward Amount
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {quickAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setRewardAmount(amt.toString())}
                  className={`py-2 rounded-xl text-xs font-black transition cursor-pointer border ${
                    rewardAmount === amt.toString()
                      ? 'bg-[#00a2c7] border-[#00a2c7] text-white shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                  }`}
                >
                  ₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Reward Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom Bonus Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold">₹</span>
              <input
                type="number"
                required
                min={1}
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-black text-sm focus:outline-none focus:border-[#00a2c7]"
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
              <span>Gross: ₹{parseFloat(rewardAmount || 0).toLocaleString('en-IN')}</span>
              <span>Net Credited (less 5% TDS): ₹{(parseFloat(rewardAmount || 0) * 0.95).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Reason / Target Milestone */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reward Reason / Milestone Achieved *
            </label>
            <input
              type="text"
              required
              value={rewardReason}
              onChange={(e) => setRewardReason(e.target.value)}
              placeholder="e.g. 10 Active Merchant Referrals Achieved"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-[#00a2c7]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Crediting Wallet...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Credit ₹{parseFloat(rewardAmount || 0).toLocaleString('en-IN')} to Agent Wallet</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

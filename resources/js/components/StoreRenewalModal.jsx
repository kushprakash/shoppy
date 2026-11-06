import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Store,
  Check,
  ShieldCheck,
  MessageSquare,
  Globe,
  Sparkles,
  ArrowRight,
  RotateCcw,
  QrCode,
  Lock,
  ChevronLeft
} from 'lucide-react';
import subscriptionService from '../services/subscriptionService';

export default function StoreRenewalModal({
  isOpen,
  onClose,
  shopCode = '',
  onRenewSuccess
}) {
  const [selectedPlanId, setSelectedPlanId] = useState('yearly-package');
  const [addWhatsapp, setAddWhatsapp] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // PayU Checkout steps: 'plan' | 'payu_checkout' | 'success'
  const [step, setStep] = useState('plan');
  const [payuData, setPayuData] = useState(null);

  const plans = subscriptionService.getPlans();
  const currentExpiry = subscriptionService.getStoreExpiryStatus(shopCode);
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[0] || {
    id: 'yearly-package',
    name: 'Yearly Package',
    billingCycle: 'yearly',
    basePrice: 8000
  };

  const priceCalculation = subscriptionService.calculatePrice(
    selectedPlan,
    selectedPlan.billingCycle || 'yearly',
    addWhatsapp
  );

  useEffect(() => {
    if (isOpen) {
      setSuccessData(null);
      setErrorMessage(null);
      setIsProcessing(false);
      setStep('plan');
      setPayuData(null);
    }
  }, [isOpen, shopCode]);

  if (!isOpen) return null;

  // Step 1: Initiate PayU Money Payment Request and immediately redirect to gateway
  const handleInitiatePayU = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    const res = await subscriptionService.initiatePayU({
      type: 'renew',
      shop_code: shopCode,
      plan_id: selectedPlan.id,
      billing_cycle: selectedPlan.billingCycle || 'yearly',
      own_whatsapp: addWhatsapp
    });

    if (res && res.success && res.action && res.params) {
      setPayuData(res);
      // Directly submit form and redirect to PayU hosted checkout
      subscriptionService.submitPayUForm(res.action, res.params);
    } else {
      setIsProcessing(false);
      setErrorMessage(res?.message || 'Could not connect to PayU Money payment gateway.');
    }
  };

  // Complete PayU verification (either via simulated sandbox approval or callback verification)
  const handleCompletePayUVerification = async (paymentStatus = 'success') => {
    if (!payuData) return;
    setIsProcessing(true);
    setErrorMessage(null);

    const res = await subscriptionService.verifyPayU({
      txnid: payuData.txnid,
      status: paymentStatus,
      type: 'renew',
      shop_code: shopCode,
      plan_id: selectedPlan.id,
      billing_cycle: selectedPlan.billingCycle || 'yearly',
      own_whatsapp: addWhatsapp
    });

    setIsProcessing(false);

    if (res && res.success) {
      setSuccessData({
        store: res.store,
        planName: selectedPlan.name,
        validUntil: res.valid_until || res.store?.valid_until,
        totalPaid: payuData.amount,
        txnid: payuData.txnid
      });
      setStep('success');

      // Clear the trigger flags
      try {
        localStorage.removeItem('shoppy_trigger_renewal_popup');
        sessionStorage.removeItem('shoppy_show_renewal_popup');
      } catch (err) {}

      if (onRenewSuccess) {
        onRenewSuccess(res.store);
      }
    } else {
      setErrorMessage(res?.message || 'PayU Money transaction verification failed.');
    }
  };

  // Redirect to PayU Official Hosted Checkout Page
  const handleRedirectToPayU = () => {
    if (!payuData) return;
    subscriptionService.submitPayUForm(payuData.action, payuData.params);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Top Header */}
        <div className="p-6 bg-gradient-to-r from-[#008ba3] via-[#00a2c7] to-[#10b981] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shadow-inner">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-extrabold text-[10px] uppercase tracking-wider">
                Store Subscription Renewal
              </span>
              <h2 className="text-xl font-black font-heading mt-0.5">
                {currentExpiry?.storeName || 'Merchant Store'} ({shopCode})
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Expiry Alert Badge */}
        {currentExpiry && step === 'plan' && (
          <div className={`px-6 py-3 text-xs flex items-center justify-between border-b ${
            currentExpiry.isExpired
              ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300'
          }`}>
            <div className="flex items-center gap-2">
              {currentExpiry.isExpired ? (
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
              )}
              <span className="font-semibold">
                {currentExpiry.isExpired
                  ? `Subscription Expired on ${currentExpiry.validUntil} (${Math.abs(currentExpiry.daysRemaining)} days ago)`
                  : `Subscription Expiring in ${currentExpiry.daysRemaining} days (Valid until: ${currentExpiry.validUntil})`}
              </span>
            </div>
            <span className="font-mono font-bold text-[11px] uppercase">
              Action Required
            </span>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="m-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 3: SUCCESS STATE                                               */}
        {/* =================================================================== */}
        {step === 'success' && successData ? (
          <div className="p-8 text-center space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                Subscription Renewed Successfully!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Payment verified via PayU Money. POS Counter, GST Invoicing & Storefront validity extended.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-md mx-auto grid grid-cols-2 gap-3 text-xs text-left">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">PACKAGE</span>
                <span className="font-bold text-slate-900 dark:text-white">{successData.planName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">NEW VALIDITY</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{successData.validUntil}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">PAYMENT GATEWAY</span>
                <span className="font-bold text-[#00a2c7]">PayU Money</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold">TRANSACTION ID</span>
                <span className="font-mono text-[10px] text-slate-700 dark:text-slate-300 truncate block">
                  {successData.txnid}
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                <span className="text-slate-400 text-[10px] font-bold">TOTAL AMOUNT PAID</span>
                <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{Number(successData.totalPaid).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#008ba3] to-[#00a2c7] text-white font-bold text-xs shadow-lg shadow-cyan-600/25 transition cursor-pointer"
            >
              Continue to ERP Billing Dashboard
            </button>
          </div>
        ) : null}

        {/* =================================================================== */}
        {/* STEP 2: PAYU MONEY CHECKOUT TERMINAL SCREEN                         */}
        {/* =================================================================== */}
        {step === 'payu_checkout' && payuData ? (
          <div className="p-6 sm:p-8 space-y-6 animate-in fade-in">
            {/* PayU Header Banner */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 rounded-xl bg-[#00a2c7]/10 border border-[#00a2c7]/20 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#00a2c7]" />
                  <span className="text-xs font-black text-[#00a2c7] uppercase tracking-wider">PayU Money</span>
                </div>
                <span className="text-xs text-slate-400 font-medium">256-Bit Bank Grade SSL</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('plan')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Change Plan
              </button>
            </div>

            {/* Order Summary Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Merchant Store</span>
                <span className="font-bold text-slate-900 dark:text-white">{currentExpiry?.storeName || shopCode} ({shopCode})</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Renewal Package</span>
                <span className="font-bold text-slate-900 dark:text-white">{payuData.summary?.plan_name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Base Plan Price</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">₹{payuData.summary?.base_price?.toLocaleString('en-IN')}</span>
              </div>
              {payuData.summary?.whatsapp_addon > 0 && (
                <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400">
                  <span>WhatsApp Message Suite Add-on (+₹500/mo)</span>
                  <span className="font-bold">+₹{payuData.summary?.whatsapp_addon?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Payable via PayU</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">₹{Number(payuData.amount).toLocaleString('en-IN')}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Ref: {payuData.txnid}</span>
              </div>
            </div>

            {/* Supported Payment Methods on PayU */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Accepted Payment Methods on PayU Money:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#00a2c7]" />
                  <span className="font-medium">UPI / QR (GPay, PhonePe)</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium">Cards (Visa, RuPay, Master)</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-500" />
                  <span className="font-medium">Net Banking (50+ Banks)</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="font-medium">PayU Wallets</span>
                </div>
              </div>
            </div>

            {/* Actions: Primary PayU Hosted Redirect + Instant Sandbox Test Button */}
            <div className="space-y-3 pt-3">
              <button
                type="button"
                onClick={handleRedirectToPayU}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#008ba3] via-[#00a2c7] to-cyan-500 hover:from-[#00768c] hover:to-[#008ba3] text-white font-black text-sm tracking-wide shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2.5 cursor-pointer transition transform active:scale-[0.99]"
              >
                <Lock className="w-5 h-5 stroke-[2.5]" />
                <span>Pay Now INR {Number(payuData.amount).toFixed(2)}</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5] ml-1" />
              </button>
            </div>
          </div>
        ) : null}

        {/* =================================================================== */}
        {/* STEP 1: PLAN & DURATION SELECTION FORM                              */}
        {/* =================================================================== */}
        {step === 'plan' && !successData && (
          <form onSubmit={handleInitiatePayU} className="p-6 space-y-6">
            {/* Step 1: 4 Packages Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                1. Select Renewal Package
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {plans.map((p) => {
                  const isSelected = selectedPlanId === p.id;
                  const price = subscriptionService.calculatePrice(p, p.billingCycle, addWhatsapp);

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPlanId(p.id)}
                      className={`p-3.5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between text-left relative ${
                        isSelected
                          ? 'border-[#00a2c7] bg-cyan-50/50 dark:bg-cyan-950/30 shadow-md ring-1 ring-[#00a2c7]'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                      }`}
                    >
                      {p.badge && (
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold text-white mb-2 self-start ${p.ribbonBg || 'bg-[#008ba3]'}`}>
                          {p.badge}
                        </span>
                      )}
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                          {p.name}
                        </h4>
                        <div className="mt-2">
                          <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                            ₹{Number(price.offerPrice).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {price.label}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">
                          {p.durationDays} Days
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00a2c7]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: 1 WhatsApp Message Checkbox (+500/month) */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/30">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addWhatsapp}
                  onChange={(e) => setAddWhatsapp(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Add WhatsApp Message Suite (+₹500 / month)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold">
                      Optional Add-on
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Agar tick karega to ₹500 per month add ho jayega (+₹{priceCalculation.whatsappAddon} for {selectedPlan.name}). Nahi to same base price (₹{Number(priceCalculation.baseOffer).toLocaleString('en-IN')}) me renew ho jayega.
                  </p>
                </div>
              </label>
            </div>

            {/* PayU Money Gateway Selection Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00a2c7]/10 flex items-center justify-center text-[#00a2c7] font-black">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      PayU Money Gateway
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#00a2c7] text-white">
                      SECURE
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Instant Renewal via UPI QR, Debit/Credit Card, Net Banking & PayU Wallet
                  </span>
                </div>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            </div>

            {/* Total Price Summary & CTA */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400 block font-medium">Total Renewal Amount</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    ₹{Number(priceCalculation.offerPrice).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    {priceCalculation.label}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition cursor-pointer"
                >
                  Remind Me Later
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#008ba3] via-[#00a2c7] to-cyan-500 hover:from-[#00768c] hover:to-[#008ba3] text-white font-black text-xs shadow-lg shadow-cyan-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Connecting to PayU...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 stroke-[2.5]" />
                      <span>Pay Now INR {Number(priceCalculation.offerPrice).toFixed(2)}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5] ml-0.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

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
  ChevronLeft,
  Copy,
  Smartphone,
  ExternalLink
} from 'lucide-react';
import subscriptionService, { resolveRibbonStyle } from '../services/subscriptionService';

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

  // Steps: 'plan' | 'paytm_checkout' | 'success'
  const [step, setStep] = useState('plan');
  const [paytmData, setPaytmData] = useState(null);
  const [paytmUtr, setPaytmUtr] = useState('');
  const [copiedVpa, setCopiedVpa] = useState(false);

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
      setPaytmData(null);
      setPaytmUtr('');
    }
  }, [isOpen, shopCode]);

  // Auto-poll Paytm order status when on paytm_checkout step
  useEffect(() => {
    let pollInterval = null;
    if (isOpen && step === 'paytm_checkout' && paytmData?.order_id && !successData) {
      pollInterval = setInterval(async () => {
        try {
          const res = await subscriptionService.checkPaytmOrderStatus(paytmData.order_id);
          if (res && res.status === 'TXN_SUCCESS') {
            clearInterval(pollInterval);
            handleCompletePaytmVerification('success');
          }
        } catch (e) {}
      }, 4000);
    }
    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isOpen, step, paytmData, successData]);

  if (!isOpen) return null;

  // Step 1: Initiate Paytm UPI Payment Request
  const handleInitiatePaytm = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    const res = await subscriptionService.initiatePaytmUpi({
      type: 'renew',
      shop_code: shopCode,
      plan_id: selectedPlan.id,
      billing_cycle: selectedPlan.billingCycle || 'yearly',
      own_whatsapp: addWhatsapp
    });

    setIsProcessing(false);

    if (res && res.success) {
      setPaytmData(res);
      setStep('paytm_checkout');
    } else {
      setErrorMessage(res?.message || 'Could not connect to Paytm UPI payment gateway.');
    }
  };

  // Complete Paytm verification
  const handleCompletePaytmVerification = async (paymentStatus = 'success') => {
    if (!paytmData) return;
    setIsProcessing(true);
    setErrorMessage(null);

    const res = await subscriptionService.verifyPaytmPayment({
      order_id: paytmData.order_id,
      utr: paytmUtr ? paytmUtr.trim() : undefined,
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
        totalPaid: paytmData.amount,
        txnid: paytmData.order_id
      });
      setStep('success');

      try {
        localStorage.removeItem('shoppy_trigger_renewal_popup');
        sessionStorage.removeItem('shoppy_show_renewal_popup');
      } catch (err) {}

      if (onRenewSuccess) {
        onRenewSuccess(res.store);
      }
    } else {
      setErrorMessage(res?.message || 'Paytm payment verification failed. Please enter your 12-digit UTR if paid.');
    }
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
                Payment verified via Paytm UPI. POS Counter, GST Invoicing & Storefront validity extended.
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
                <span className="font-bold text-[#00b9f5]">Paytm UPI Intent</span>
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
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#002e6e] to-[#00b9f5] text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition cursor-pointer"
            >
              Continue to ERP Billing Dashboard
            </button>
          </div>
        ) : null}

        {/* =================================================================== */}
        {/* STEP 2: PAYTM UPI DYNAMIC QR & INTENT TERMINAL SCREEN               */}
        {/* =================================================================== */}
        {step === 'paytm_checkout' && paytmData ? (
          <div className="p-6 sm:p-8 space-y-5 animate-in fade-in">
            {/* Paytm Header Banner */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#002e6e] to-[#00b9f5] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Paytm UPI & Dynamic QR</span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#00b9f5] text-white">INSTANT</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Scan with Paytm, PhonePe, GPay or Any UPI App</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('plan')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Change Plan
              </button>
            </div>

            {/* Dynamic QR & Price Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Renewal Amount:</span>
                <span className="text-3xl font-black text-slate-900 dark:text-white">
                  ₹{paytmData.formatted_amount || Number(paytmData.amount).toLocaleString('en-IN')}
                </span>
              </div>

              {/* QR Image */}
              <div className="relative inline-block p-3 rounded-2xl bg-white shadow-md border border-slate-200">
                {paytmData.qr_image_url ? (
                  <img
                    src={paytmData.qr_image_url}
                    alt="Paytm Dynamic QR"
                    className="w-48 h-48 mx-auto rounded-lg object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-slate-100 rounded-lg">
                    <RotateCcw className="w-8 h-8 animate-spin text-[#00b9f5]" />
                  </div>
                )}
                <div className="mt-1 text-[10px] font-bold text-slate-600 flex items-center justify-center gap-1">
                  <span>Scan & Pay via Any UPI App</span>
                </div>
              </div>

              {/* UPI ID Copy Bar */}
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-slate-500">Merchant UPI:</span>
                <span className="font-mono font-bold text-[#002e6e] dark:text-[#38bdf8] bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  {paytmData.vpa || 'paytm.s1lcife@pty'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(paytmData.vpa || 'paytm.s1lcife@pty');
                    setCopiedVpa(true);
                    setTimeout(() => setCopiedVpa(false), 2000);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  title="Copy UPI ID"
                >
                  {copiedVpa ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <p className="text-[10px] text-slate-400">
                Supported: Paytm • Google Pay • PhonePe • BHIM • CRED • Any Bank UPI
              </p>
            </div>

            {/* Direct Mobile UPI Intent Button */}
            {paytmData.upi_intent_url && (
              <div>
                <a
                  href={paytmData.upi_intent_url}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#002e6e] via-[#0052a3] to-[#00b9f5] hover:opacity-95 text-white font-bold text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Pay via UPI App (Mobile GPay / PhonePe / Paytm)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Manual UTR Input Box (Optional) */}
            <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Paid via UPI? Enter 12-digit UPI Reference / UTR (Optional)
              </label>
              <input
                type="text"
                maxLength={16}
                placeholder="e.g. 431289102941"
                value={paytmUtr}
                onChange={(e) => setPaytmUtr(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold focus:outline-none focus:border-[#00b9f5]"
              />
            </div>

            {/* Actions: Verify & Complete Renewal */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => handleCompletePaytmVerification('success')}
                disabled={isProcessing}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs tracking-wide shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-[0.99] disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Verifying Paytm Payment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I Have Paid — Verify & Renew Subscription</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('plan')}
                  className="font-semibold hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  ← Back to Plans
                </button>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Listening for UPI payment...
                </span>
              </div>
            </div>
          </div>
        ) : null}

        {/* =================================================================== */}
        {/* STEP 1: PLAN & DURATION SELECTION FORM                              */}
        {/* =================================================================== */}
        {step === 'plan' && !successData && (
          <form onSubmit={handleInitiatePaytm} className="p-6 space-y-6">
            {/* Step 1: 4 Packages Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                1. Select Renewal Package
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {plans.map((p) => {
                  const isSelected = selectedPlanId === p.id;
                  const price = subscriptionService.calculatePrice(p, p.billingCycle, addWhatsapp);
                  const ribbonStyle = price.ribbonStyle || resolveRibbonStyle(p.ribbonBg || p.ribbon_bg);
                  const badgeLabel = price.ribbonText !== undefined ? price.ribbonText : p.badge;

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
                      {badgeLabel && (
                        <span
                          style={ribbonStyle.style}
                          className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-extrabold text-white mb-2 self-start ${ribbonStyle.className}`}
                        >
                          {badgeLabel}
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

            {/* Paytm UPI Gateway Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#002e6e]/10 via-[#00b9f5]/10 to-transparent border border-[#00b9f5]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#002e6e] to-[#00b9f5] flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <QrCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Paytm UPI Intent & Dynamic QR
                    </span>
                    <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-[#00b9f5] text-white">
                      INSTANT
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                    Instant renewal with Paytm, PhonePe, Google Pay, BHIM or any UPI App
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
                  className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#002e6e] to-[#00b9f5] hover:opacity-95 text-white font-black text-xs shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Generating Paytm QR...</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 stroke-[2.5]" />
                      <span>Proceed to Paytm UPI Payment</span>
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

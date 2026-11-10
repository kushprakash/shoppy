import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  ShieldCheck,
  Smartphone,
  Mail,
  Lock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  Clock
} from 'lucide-react';

export default function ForgotPasswordModal({
  isOpen,
  onClose,
  initialIdentifier = '',
  onSuccess
}) {
  const [step, setStep] = useState(1); // 1: Identifier, 2: OTP, 3: Set Password, 4: Success
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [maskedInfo, setMaskedInfo] = useState({ phone: '', email: '', shop_code: '', shop_name: '' });
  const [resetToken, setResetToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Timer countdowns (in seconds)
  const [otpTimer, setOtpTimer] = useState(600); // 10 minutes OTP validity
  const [resendCooldown, setResendCooldown] = useState(60); // 60s cooldown for resend button

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setIdentifier(initialIdentifier || '');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccessMsg(null);
      setResetToken('');
    }
  }, [isOpen, initialIdentifier]);

  // Handle countdown timers
  useEffect(() => {
    let interval = null;
    if (step === 2) {
      interval = setInterval(() => {
        setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step]);

  if (!isOpen) return null;

  // Format seconds into MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // STEP 1: Send OTP
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanId = (identifier || '').trim();
    if (!cleanId) {
      setError('Please enter your Store Code, registered Email, or Mobile Number.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/store/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ identifier: cleanId })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setMaskedInfo({
          phone: data.masked_phone || '',
          email: data.masked_email || '',
          shop_code: data.shop_code || cleanId,
          shop_name: data.shop_name || ''
        });
        setOtpTimer(600);
        setResendCooldown(60);
        setSuccessMsg(data.message);
        setStep(2);
      } else {
        setError(data.message || 'Store not found. Please verify your details.');
      }
    } catch (err) {
      setError('Network error. Could not connect to authentication service.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanOtp = (otp || '').trim();
    if (!cleanOtp || cleanOtp.length !== 6) {
      setError('Please enter the complete 6-digit OTP sent to your phone and email.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/store/forgot-password/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          identifier: maskedInfo.shop_code || identifier,
          otp: cleanOtp
        })
      });
      const data = await res.json();

      if (res.ok && data.success && data.reset_token) {
        setResetToken(data.reset_token);
        setError(null);
        setSuccessMsg('OTP verified successfully! Now create your new password.');
        setStep(3);
      } else {
        setError(data.message || 'Invalid or expired OTP code.');
      }
    } catch (err) {
      setError('Network error verifying OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3: Save New Password
  const handleResetPassword = async (e) => {
    if (e) e.preventDefault();
    if (!newPassword || newPassword.length < 4) {
      setError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-type identical passwords.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/store/forgot-password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          reset_token: resetToken,
          password: newPassword,
          password_confirmation: confirmPassword
        })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStep(4);
        if (onSuccess) {
          onSuccess(maskedInfo.shop_code || identifier);
        }
      } else {
        setError(data.message || 'Failed to update password. Session may have expired.');
      }
    } catch (err) {
      setError('Network error saving new password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 text-[#00a2c7] flex items-center justify-center shadow-sm">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                Reset Store Password
              </h3>
              <p className="text-[11px] text-slate-400">
                Step {step} of 3 • Dual SMS &amp; Email Verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 1: Enter Store Identifier                                 */}
        {/* ============================================================== */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-800/60 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <span className="font-bold text-[#00a2c7] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Secure Merchant Verification
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Enter your registered Store Code, Email Address, or 10-digit Mobile Number. A 6-digit OTP will be dispatched immediately to both your registered phone via SMS and email.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Store Code, Email, or Mobile *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. SP2026... or merchant@gmail.com"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#00a2c7] focus:ring-1 focus:ring-[#00a2c7]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Dispatching OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 2: Enter 6-digit OTP                                      */}
        {/* ============================================================== */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>OTP Dispatched!</span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                {maskedInfo.phone && (
                  <div className="flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>SMS sent to: <strong>{maskedInfo.phone}</strong></span>
                  </div>
                )}
                {maskedInfo.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Email sent to: <strong>{maskedInfo.email}</strong></span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Enter 6-Digit OTP *
                </label>
                <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-rose-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(otpTimer)} remaining</span>
                </div>
              </div>
              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="0 0 0 0 0 0"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6));
                  setError(null);
                }}
                className="w-full text-center tracking-[12px] py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xl font-black focus:outline-none focus:border-[#00a2c7] focus:ring-1 focus:ring-[#00a2c7]"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-medium"
              >
                ← Change Number/Email
              </button>

              <button
                type="button"
                onClick={() => {
                  if (resendCooldown === 0) {
                    handleSendOtp();
                  }
                }}
                disabled={resendCooldown > 0 || isLoading}
                className="font-bold text-[#00a2c7] hover:underline disabled:text-slate-400 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP Now'}
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isLoading || otp.length !== 6 || otpTimer === 0}
                className="w-full py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify Code &amp; Proceed</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 3: Enter New Password                                     */}
        {/* ============================================================== */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-xs text-slate-700 dark:text-slate-300">
              Set new terminal login password for Store: <strong>{maskedInfo.shop_code}</strong>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="Enter minimum 4 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#00a2c7] focus:ring-1 focus:ring-[#00a2c7]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Confirm New Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  placeholder="Re-type new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:outline-none focus:border-[#00a2c7] focus:ring-1 focus:ring-[#00a2c7]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-md shadow-cyan-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Saving Password...</span>
                  </>
                ) : (
                  <>
                    <span>Save &amp; Update Password</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 4: Success Message                                        */}
        {/* ============================================================== */}
        {step === 4 && (
          <div className="text-center space-y-4 py-2">
            <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white">
                Password Reset Successfully!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Your terminal password for <strong>{maskedInfo.shop_code}</strong> has been updated. You can now log in using your new credentials.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-black text-xs block text-center shadow-md shadow-cyan-600/30 transition cursor-pointer"
              >
                Proceed to Login →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}


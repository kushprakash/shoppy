import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import {
  X,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  Check,
  Lock,
  AlertCircle
} from 'lucide-react';

export default function ChangePasswordModal({ onClose }) {
  const { currentUser, changeUserPassword, showToast } = useErp();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Password Strength Calculation
  const hasMinLength = newPassword.length >= 8;
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const hasUpperLower = /(?=.*[a-z])(?=.*[A-Z])/.test(newPassword);

  let strengthScore = 0;
  if (hasMinLength) strengthScore += 25;
  if (hasNumber) strengthScore += 25;
  if (hasSpecial) strengthScore += 25;
  if (hasUpperLower) strengthScore += 25;

  let strengthLabel = 'Too Short';
  let strengthColor = 'bg-slate-200 text-slate-500';
  if (strengthScore >= 100) {
    strengthLabel = 'Strong & Secure';
    strengthColor = 'bg-emerald-500 text-emerald-600';
  } else if (strengthScore >= 75) {
    strengthLabel = 'Good';
    strengthColor = 'bg-cyan-500 text-cyan-600';
  } else if (strengthScore >= 50) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-amber-500 text-amber-600';
  } else if (strengthScore > 0) {
    strengthLabel = 'Weak';
    strengthColor = 'bg-rose-500 text-rose-600';
  }

  const validate = () => {
    const errs = {};
    if (!currentPassword) {
      errs.currentPassword = 'Enter your current password';
    }
    if (!newPassword) {
      errs.newPassword = 'Enter a new password';
    } else if (newPassword.length < 8) {
      errs.newPassword = 'Password must be at least 8 characters';
    }
    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setTimeout(() => {
      changeUserPassword(currentPassword, newPassword);
      setIsLoading(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#008ba3] to-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Change Password
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update login credentials for {currentUser?.name || 'Staff User'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter existing password"
                className={`w-full text-xs font-semibold rounded-xl border pl-9 pr-10 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.currentPassword
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-cyan-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-[10px] text-rose-500 mt-0.5">{errors.currentPassword}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className={`w-full text-xs font-semibold rounded-xl border pl-9 pr-10 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.newPassword
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-cyan-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-[10px] text-rose-500 mt-0.5">{errors.newPassword}</p>
            )}

            {/* Strength Meter Bar */}
            {newPassword.length > 0 && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-slate-500">Strength:</span>
                  <span className={strengthColor.split(' ')[1]}>{strengthLabel}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strengthColor.split(' ')[0]}`}
                    style={{ width: `${strengthScore}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className={`w-full text-xs font-semibold rounded-xl border pl-9 pr-10 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.confirmPassword
                    ? 'border-rose-500 focus:ring-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-cyan-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-[10px] text-rose-500 mt-0.5">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Security Checklist */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-[11px]">
            <div className="font-bold text-slate-700 dark:text-slate-300 text-[10.5px]">
              Security Requirements:
            </div>
            <div className="grid grid-cols-2 gap-1 text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  hasMinLength ? 'bg-emerald-100 text-emerald-600 font-bold' : 'bg-slate-200 text-slate-400'
                }`}>
                  ✓
                </span>
                <span>8+ Characters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  hasNumber ? 'bg-emerald-100 text-emerald-600 font-bold' : 'bg-slate-200 text-slate-400'
                }`}>
                  ✓
                </span>
                <span>At least 1 Number</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  hasSpecial ? 'bg-emerald-100 text-emerald-600 font-bold' : 'bg-slate-200 text-slate-400'
                }`}>
                  ✓
                </span>
                <span>Special Symbol (!@#$)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  hasUpperLower ? 'bg-emerald-100 text-emerald-600 font-bold' : 'bg-slate-200 text-slate-400'
                }`}>
                  ✓
                </span>
                <span>Upper & Lowercase</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-extrabold shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{isLoading ? 'Updating Password...' : 'Save New Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

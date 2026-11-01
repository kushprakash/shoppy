import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import {
  X,
  User,
  Phone,
  Mail,
  Building,
  MapPin,
  Droplet,
  Save,
  Camera,
  CheckCircle2,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function ProfileUpdateModal({ onClose }) {
  const { currentUser, updateCurrentUserProfile, showToast } = useErp();

  const [form, setForm] = useState({
    id: currentUser?.id || 'usr-admin',
    name: currentUser?.name || 'Ramesh Sundaram',
    email: currentUser?.email || 'admin@rameshfashion.com',
    phone: currentUser?.phone || '9829012345',
    designation: currentUser?.designation || (currentUser?.isSuperAdmin ? 'Store Owner & General Manager' : 'Store Staff'),
    department: currentUser?.department || 'Operations',
    bloodGroup: currentUser?.bloodGroup || 'B+',
    address: currentUser?.address || 'Shop #14-16, Fashion Plaza, Main M.I. Road, Jaipur, Rajasthan',
    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    emergencyName: currentUser?.emergencyContact?.name || 'Suresh Sundaram',
    emergencyPhone: currentUser?.emergencyContact?.phone || '+91 98290 99887'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('Profile image must be less than 2MB', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({ ...prev, avatar: event.target.result }));
      showToast('Avatar preview updated! Click Save Profile to apply.');
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Full name is required';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email is required';
    if (!form.phone.trim() || form.phone.length < 10) errs.phone = 'Valid 10-digit mobile number required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setTimeout(() => {
      updateCurrentUserProfile({
        id: form.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        designation: form.designation,
        department: form.department,
        bloodGroup: form.bloodGroup,
        address: form.address,
        avatar: form.avatar,
        emergencyContact: {
          name: form.emergencyName,
          phone: form.emergencyPhone
        }
      });
      setIsSaving(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#008ba3] to-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Update My Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personal credentials, contact info & staff identity
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Avatar & Photo Picker */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <div className="relative w-18 h-18 rounded-2xl overflow-hidden border-2 border-cyan-500 shadow-sm shrink-0 bg-white">
              <img
                src={form.avatar}
                alt={form.name}
                className="w-full h-full object-cover"
              />
              <label className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition cursor-pointer">
                <Camera className="w-5 h-5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                {form.name}
              </h4>
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold truncate">
                {form.designation} • {currentUser?.roleName || 'Staff'}
              </p>
              <label className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-[#00a2c7] hover:underline cursor-pointer">
                <Camera className="w-3.5 h-3.5" />
                <span>Upload New Photo (Max 2MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Ramesh Verma"
                  className={`w-full text-xs font-semibold rounded-xl border pl-9 pr-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.name ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-cyan-500'
                  }`}
                />
              </div>
              {errors.name && <p className="text-[10px] text-rose-500 mt-0.5">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="10-digit phone"
                  className={`w-full text-xs font-semibold rounded-xl border pl-9 pr-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.phone ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-cyan-500'
                  }`}
                />
              </div>
              {errors.phone && <p className="text-[10px] text-rose-500 mt-0.5">{errors.phone}</p>}
            </div>
          </div>

          {/* Email & Blood Group */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email Address <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@store.com"
                  className={`w-full text-xs font-semibold rounded-xl border pl-9 pr-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.email ? 'border-rose-500 focus:ring-rose-500' : 'border-slate-200 dark:border-slate-700 focus:ring-cyan-500'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[10px] text-rose-500 mt-0.5">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Blood Group
              </label>
              <div className="relative">
                <Droplet className="w-4 h-4 absolute left-3 top-2.5 text-rose-500" />
                <select
                  value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 pl-9 pr-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>
          </div>

          {/* Designation & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Designation / Job Title
              </label>
              <input
                type="text"
                value={form.designation}
                onChange={(e) => setForm({ ...form, designation: e.target.value })}
                placeholder="e.g. Store Manager"
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <input
                type="text"
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                placeholder="Operations / Sales"
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Residential Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street address, City, Pincode"
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 pl-9 pr-3 py-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/80 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Emergency Contact (Printed on I-Card Back)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={form.emergencyName}
                onChange={(e) => setForm({ ...form, emergencyName: e.target.value })}
                placeholder="Emergency Contact Name"
                className="text-xs font-semibold rounded-xl border border-amber-200 dark:border-amber-800 px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              <input
                type="tel"
                value={form.emergencyPhone}
                onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })}
                placeholder="Emergency Phone Number"
                className="text-xs font-semibold rounded-xl border border-amber-200 dark:border-amber-800 px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Buttons */}
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
              disabled={isSaving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-extrabold shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

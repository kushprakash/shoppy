import React, { useState } from 'react';
import { useErp } from '../context/ErpContext';
import {
  X,
  Printer,
  Download,
  Share2,
  ShieldCheck,
  Building,
  QrCode,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Droplet,
  UserCheck,
  RotateCw,
  Sparkles,
  Check
} from 'lucide-react';

export default function EmployeeICardModal({ onClose, targetEmployeeId = null }) {
  const {
    currentUser,
    employees,
    storeName,
    storeSettings,
    shopCode,
    showToast
  } = useErp();

  // Selected Employee for the I-Card (defaults to targetEmployeeId or currentUser)
  const initialEmpId = targetEmployeeId || currentUser?.id || 'EMP-101';
  const [selectedEmpId, setSelectedEmpId] = useState(initialEmpId);
  const [cardSide, setCardSide] = useState('both'); // 'front' | 'back' | 'both'
  const [isCopied, setIsCopied] = useState(false);

  // Find selected employee data (or fallback to current user)
  const activeEmployee = employees.find((e) => e.id === selectedEmpId) || {
    id: currentUser?.id || 'EMP-101',
    name: currentUser?.name || 'Ramesh Verma',
    designation: currentUser?.designation || (currentUser?.isSuperAdmin ? 'Store Owner & General Manager' : 'Store Staff'),
    department: currentUser?.department || 'Operations',
    phone: currentUser?.phone || '9829044551',
    email: currentUser?.email || 'staff@shoppy.in',
    joiningDate: currentUser?.joiningDate || '2023-01-15',
    bloodGroup: currentUser?.bloodGroup || 'B+',
    address: currentUser?.address || 'Jaipur, Rajasthan',
    avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    emergencyContact: currentUser?.emergencyContact || {
      name: 'Family Helpline',
      phone: '+91 98290 99887'
    }
  };

  const handlePrint = () => {
    window.print();
    showToast('Sending ID Card to printer...');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.origin + `/verify-id/${activeEmployee.id}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
    showToast('Staff Verification Link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Print-specific style */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-icard-area, #printable-icard-area * {
            visibility: visible !important;
          }
          #printable-icard-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 20px !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#008ba3] to-cyan-500 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  Employee Identity Card (I-Card)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  CR-80 Standard
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official staff accreditation, counter punch barcode & emergency credentials
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3">
          {/* Employee Selector Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Select Staff:
            </span>
            <select
              value={selectedEmpId}
              onChange={(e) => setSelectedEmpId(e.target.value)}
              className="text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            >
              <optgroup label="Logged-in User">
                <option value={currentUser?.id || 'usr-admin'}>
                  {currentUser?.name || 'Current User'} ({currentUser?.roleName || 'Active Persona'})
                </option>
              </optgroup>
              <optgroup label="Store Employees">
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.designation} ({emp.id})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* View Toggles & Actions */}
          <div className="flex items-center gap-2">
            {/* View filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              <button
                onClick={() => setCardSide('both')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  cardSide === 'both' ? 'bg-white dark:bg-slate-700 shadow-xs font-bold text-cyan-600 dark:text-cyan-400' : 'hover:text-slate-900'
                }`}
              >
                Side-by-Side
              </button>
              <button
                onClick={() => setCardSide('front')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  cardSide === 'front' ? 'bg-white dark:bg-slate-700 shadow-xs font-bold text-cyan-600 dark:text-cyan-400' : 'hover:text-slate-900'
                }`}
              >
                Front Only
              </button>
              <button
                onClick={() => setCardSide('back')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  cardSide === 'back' ? 'bg-white dark:bg-slate-700 shadow-xs font-bold text-cyan-600 dark:text-cyan-400' : 'hover:text-slate-900'
                }`}
              >
                Back Only
              </button>
            </div>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print I-Card</span>
            </button>
          </div>
        </div>

        {/* Printable Card Showcase Area */}
        <div id="printable-icard-area" className="p-6 bg-slate-100/70 dark:bg-slate-950 flex flex-wrap items-center justify-center gap-8 min-h-[440px]">
          
          {/* ===================== FRONT SIDE ===================== */}
          {(cardSide === 'both' || cardSide === 'front') && (
            <div className="w-[300px] h-[460px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col relative select-none">
              
              {/* Lanyard Hole Punch Slot */}
              <div className="w-full flex justify-center pt-2 pb-1 bg-gradient-to-r from-slate-900 via-[#182330] to-slate-900">
                <div className="w-12 h-2.5 bg-slate-800 rounded-full border border-slate-700 shadow-inner" />
              </div>

              {/* Top Store Header */}
              <div className="bg-gradient-to-r from-slate-900 via-[#182330] to-slate-900 px-4 pb-3 text-center text-white relative">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-sm font-black tracking-tight text-white uppercase truncate">
                    {storeName}
                  </span>
                </div>
                <div className="flex items-center justify-center gap-1.5 mt-0.5">
                  <span className="text-[9px] font-bold tracking-widest text-cyan-400 uppercase">
                    STAFF IDENTITY CARD
                  </span>
                  <span className="text-[8px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono">
                    {shopCode}
                  </span>
                </div>

                {/* Micro Hologram Strip */}
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-rose-400 to-cyan-400 opacity-80" />
              </div>

              {/* Photo & Hologram Area */}
              <div className="pt-4 pb-2 px-6 flex flex-col items-center relative">
                {/* Holographic Security Chip */}
                <div className="absolute top-4 left-6 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-300 text-[8px] font-mono font-bold text-amber-800 shadow-xs">
                  <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                  <span>SECURE</span>
                </div>

                {/* Photo Frame */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-3 border-cyan-500 shadow-lg p-0.5 bg-white relative">
                  <img
                    src={activeEmployee.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
                    alt={activeEmployee.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute bottom-0 right-0 bg-emerald-500 text-white rounded-tl-lg p-0.5" title="Active Employee">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>

                {/* Name & Role */}
                <h4 className="mt-2 text-base font-black text-slate-900 tracking-tight text-center leading-tight">
                  {activeEmployee.name}
                </h4>
                <div className="mt-1 px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-[10px] font-extrabold uppercase tracking-wide text-center">
                  {activeEmployee.designation || 'Staff Associate'}
                </div>
              </div>

              {/* Details Grid */}
              <div className="px-5 py-2 flex-1 space-y-1.5 text-[11px] text-slate-700 border-t border-slate-100 bg-slate-50/50">
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-500">Employee ID:</span>
                  <span className="font-mono font-black text-slate-900">{activeEmployee.id}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-500">Department:</span>
                  <span className="font-bold text-slate-800">{activeEmployee.department || 'Operations'}</span>
                </div>
                <div className="flex justify-between items-center py-0.5 border-b border-slate-200/60">
                  <span className="font-semibold text-slate-500">Date of Joining:</span>
                  <span className="font-medium text-slate-800">{activeEmployee.joiningDate || '2023-01-15'}</span>
                </div>
                <div className="flex justify-between items-center py-0.5">
                  <span className="font-semibold text-slate-500">Blood Group:</span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                    {activeEmployee.bloodGroup || 'B+'}
                  </span>
                </div>
              </div>

              {/* Barcode & Counter Punch Footer */}
              <div className="p-3 bg-white border-t border-slate-200 text-center">
                <div className="flex justify-center items-center h-7 gap-[2px] mb-1">
                  {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 2, 3, 1, 2, 4, 1, 2, 1, 3].map((w, i) => (
                    <span key={i} className="h-full bg-slate-900 block" style={{ width: `${w}px` }} />
                  ))}
                </div>
                <div className="font-mono text-[9px] tracking-widest text-slate-600 font-bold">
                  *{activeEmployee.id}*
                </div>
              </div>
            </div>
          )}

          {/* ===================== BACK SIDE ===================== */}
          {(cardSide === 'both' || cardSide === 'back') && (
            <div className="w-[300px] h-[460px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col relative select-none">
              
              {/* Lanyard Hole Punch Slot */}
              <div className="w-full flex justify-center pt-2 pb-1 bg-gradient-to-r from-slate-900 via-[#182330] to-slate-900">
                <div className="w-12 h-2.5 bg-slate-800 rounded-full border border-slate-700 shadow-inner" />
              </div>

              {/* Magnetic Strip Simulation */}
              <div className="w-full h-8 bg-slate-900 border-y border-slate-800 relative">
                <div className="absolute right-3 top-1 text-[8px] font-mono text-cyan-400 tracking-widest">
                  ACCESS VERIFIED
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="p-4 space-y-2 text-[10px] text-slate-600 flex-1 leading-relaxed">
                <div className="font-bold text-slate-800 text-[10.5px] uppercase tracking-wide">
                  Card Usage Policy
                </div>
                <ul className="list-disc pl-4 space-y-1 text-slate-500">
                  <li>This card is non-transferable and remains the property of {storeName}.</li>
                  <li>Must be worn prominently while inside store premises & counters.</li>
                  <li>In case of loss or theft, notify Store Admin immediately.</li>
                </ul>

                {/* Emergency Contact */}
                <div className="mt-3 p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-900 space-y-0.5">
                  <div className="text-[9px] font-extrabold uppercase tracking-wider text-rose-600">
                    Emergency Contact:
                  </div>
                  <div className="text-[11px] font-bold">
                    {activeEmployee.emergencyContact?.name || 'Store Operations'}
                  </div>
                  <div className="text-[10px] font-mono">
                    {activeEmployee.emergencyContact?.phone || activeEmployee.phone}
                  </div>
                </div>

                {/* Store Address & Contact */}
                <div className="mt-2 text-[9px] text-slate-500 space-y-0.5 border-t border-slate-100 pt-2">
                  <div className="font-bold text-slate-700 truncate">{storeName} HQ</div>
                  <div className="line-clamp-2">
                    {storeSettings?.contact_address || 'Fashion Plaza, M.I. Road, Jaipur, Rajasthan - 302001'}
                  </div>
                  <div className="font-mono text-cyan-700">
                    Helpline: {storeSettings?.contact_phone || '+91 98290 12345'}
                  </div>
                </div>
              </div>

              {/* QR Code & Authorized Signatory Footer */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-12 h-12 bg-white p-1 rounded-lg border border-slate-200 shadow-xs flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-slate-800" />
                  </div>
                  <div className="text-[8px] text-slate-400 leading-tight">
                    <div>SCAN TO</div>
                    <div className="font-bold text-slate-700">VERIFY ID</div>
                  </div>
                </div>

                {/* Signatory Stamp */}
                <div className="text-right">
                  <div className="font-serif italic text-xs font-bold text-indigo-900 tracking-wider">
                    {storeSettings?.owner_name || storeSettings?.ownerName || currentUser?.name || 'Authorized Signatory'}
                  </div>
                  <div className="w-20 border-b border-slate-400 mt-0.5 mb-0.5 ml-auto" />
                  <div className="text-[8px] font-bold uppercase tracking-wider text-slate-500">
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Info */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Standard card dimensions (85.6mm x 53.98mm) ready for thermal PVC printer or paper badge holder.</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isCopied ? 'Link Copied!' : 'Copy Verification QR Link'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

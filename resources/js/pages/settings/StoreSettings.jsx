import React from 'react';
import { useErp } from '../../context/ErpContext';
import { ShieldCheck, Printer, Scale, Barcode } from 'lucide-react';

export default function StoreSettings() {
  const { showToast } = useErp();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Store Identity & Hardware Bridge</h2>
        <p className="text-xs text-slate-500 mt-1">Multi-Tenant ERP shop details, domain mapping and device settings.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Store Name</label>
            <input
              type="text"
              disabled
              value="Ramesh Fashion Store"
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN Number</label>
            <input
              type="text"
              disabled
              value="08AABCR1290M1Z5"
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Platform Subdomain</label>
            <input
              type="text"
              disabled
              value="rameshfashion.shoppy.local"
              className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono text-cyan-600 dark:text-cyan-400 border border-slate-300 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Custom Domain & SSL Status</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                defaultValue="store.rameshfashion.com"
                className="flex-1 px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
              />
              <span className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-bold text-[11px] border border-emerald-300 dark:border-emerald-800">
                SSL Active (Let's Encrypt)
              </span>
            </div>
          </div>
        </div>

        {/* Hardware Bridge Configuration (PRD Section 14) */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">POS Hardware Bridge Integration</h3>
          <p className="text-xs text-slate-500 mb-4">Native serial port and print spooler configuration.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                <Printer className="w-4 h-4 text-emerald-600" /> Thermal Receipt Printer
              </div>
              <p className="text-[11px] text-slate-500">ESC/POS 80mm with Auto Cash Drawer Kick</p>
              <select className="w-full px-2.5 py-1.5 rounded text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
                <option>USB Generic / Text Printer (USB-001)</option>
                <option>Ethernet LAN 192.168.1.100</option>
                <option>Bluetooth BT-POS-80</option>
              </select>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                <Scale className="w-4 h-4 text-cyan-600" /> Weighing Scale (Tola)
              </div>
              <p className="text-[11px] text-slate-500">Continuous Serial Feed Parser</p>
              <select className="w-full px-2.5 py-1.5 rounded text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
                <option>COM3 Serial Port (9600 Baud, 8N1)</option>
                <option>COM4 USB-to-RS232 Adapter</option>
              </select>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                <Barcode className="w-4 h-4 text-indigo-600" /> Barcode Reader
              </div>
              <p className="text-[11px] text-slate-500">HID Keyboard Emulation Mode</p>
              <select className="w-full px-2.5 py-1.5 rounded text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700">
                <option>USB HID Keyboard Hook (Fast)</option>
                <option>Camera QR / Barcode Scanner</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={() => showToast('Store and Hardware preferences saved')}
            className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs shadow-xs transition"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

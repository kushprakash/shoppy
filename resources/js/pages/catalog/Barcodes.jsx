import React from 'react';
import { useErp } from '../../context/ErpContext';
import { Barcode, Printer } from 'lucide-react';

export default function Barcodes() {
  const { products, setSelectedBarcodeProduct, showToast } = useErp();

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Barcode & Price Tag Print Desk</h2>
          <p className="text-xs text-slate-500">
            Generate standard GS1 / EAN-13 barcodes and thermal adhesive shelf stickers (50x25mm).
          </p>
        </div>
        <button
          onClick={() => {
            window.print();
            showToast('All shelf barcode tags sent to thermal spooler');
          }}
          className="px-4 py-2 rounded-xl bg-[#00a2c7] hover:bg-[#008ba3] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition"
        >
          <Printer className="w-4 h-4" /> Batch Print All Tags
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-center space-y-2 shadow-xs hover:border-[#00a2c7] transition"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ramesh Fashion Store</p>
            <h4 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">{p.name}</h4>

            {/* Simulated 1D Barcode */}
            <div className="py-2 flex justify-center">
              <div className="space-y-1">
                <div className="h-9 flex items-center justify-center gap-[2px]">
                  {[2, 1, 3, 1, 2, 4, 1, 3, 2, 1, 3, 1, 4, 2, 1, 3, 2, 1, 2, 3, 1, 2, 4, 1].map((w, i) => (
                    <span key={i} className="h-full bg-slate-900 dark:bg-slate-200 block" style={{ width: `${w}px` }} />
                  ))}
                </div>
                <div className="font-mono text-[10px] tracking-widest text-slate-500">{p.barcode}</div>
              </div>
            </div>

            <div className="flex justify-between items-center px-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-mono text-slate-400 text-[10px]">SKU: {p.sku}</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">MRP: ₹ {p.sellingPrice}</span>
            </div>

            <button
              onClick={() => setSelectedBarcodeProduct(p)}
              className="w-full mt-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-[#00a2c7] hover:text-white text-[11px] font-bold text-slate-700 dark:text-slate-300 transition flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Single Tag
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

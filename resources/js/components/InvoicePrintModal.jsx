import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  X, Printer, Send, FileText, CheckCircle2, QrCode,
  Receipt, Building2, Phone, Calendar, User, CreditCard, AlertCircle
} from 'lucide-react';
import { useErp } from '../context/ErpContext';

// Indian Currency Format Words Converter (Accounting Format)
export function numberToWordsINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount) || amount === 0) {
    return 'Zero Rupees Only';
  }

  const ones = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (num) => {
    if (num < 20) return ones[num];
    const t = tens[Math.floor(num / 10)];
    const o = ones[num % 10];
    return (t + (o ? ' ' + o : '')).trim();
  };

  const convertThreeDigits = (num) => {
    let str = '';
    const h = Math.floor(num / 100);
    const rest = num % 100;
    if (h > 0) {
      str += ones[h] + ' Hundred';
    }
    if (rest > 0) {
      str += (str ? ' and ' : '') + convertTwoDigits(rest);
    }
    return str.trim();
  };

  const parsed = Math.abs(parseFloat(amount));
  const rupees = Math.floor(parsed);
  const paise = Math.round((parsed - rupees) * 100);

  if (rupees === 0 && paise === 0) return 'Zero Rupees Only';

  let str = '';
  let rem = rupees;

  const crores = Math.floor(rem / 10000000);
  rem %= 10000000;

  const lakhs = Math.floor(rem / 100000);
  rem %= 100000;

  const thousands = Math.floor(rem / 1000);
  rem %= 1000;

  const hundreds = rem;

  if (crores > 0) {
    str += (str ? ' ' : '') + convertTwoDigits(crores) + ' Crore';
  }
  if (lakhs > 0) {
    str += (str ? ' ' : '') + convertTwoDigits(lakhs) + ' Lakh';
  }
  if (thousands > 0) {
    str += (str ? ' ' : '') + convertTwoDigits(thousands) + ' Thousand';
  }
  if (hundreds > 0) {
    str += (str ? ' ' : '') + convertThreeDigits(hundreds);
  }

  let result = str ? `INR ${str} Rupees` : '';

  if (paise > 0) {
    const paiseText = convertTwoDigits(paise) + ' Paise';
    result = result ? `${result} and ${paiseText}` : `INR ${paiseText}`;
  }

  return (result + ' Only').replace(/\s+/g, ' ');
}

export default function InvoicePrintModal({ invoice, onClose }) {
  const { showToast, shopCode } = useErp();
  // 3 print format options: 'thermal' | 'a4' | 'dotmatrix'
  const [printFormat, setPrintFormat] = useState('thermal');

  if (!invoice) return null;

  const isPakka = (invoice.billType || 'pakka') === 'pakka';
  const isOffline = (invoice.channelType || invoice.channel || 'offline').toLowerCase().includes('offline') ||
    (invoice.channel || '').toLowerCase().includes('pos');

  const items = invoice.items || [];
  const subtotal = invoice.subtotal || invoice.total || 0;
  const gstTotal = isPakka ? (invoice.gstTotal || 0) : 0;
  const grandTotal = invoice.total || subtotal + gstTotal;
  const paidAmount = invoice.paidAmount !== undefined ? invoice.paidAmount : grandTotal;
  const duesAmount = invoice.duesAmount !== undefined ? invoice.duesAmount : Math.max(0, grandTotal - paidAmount);

  // E-Commerce Online Shipping, Courier & Payment Method Breakdown
  const isCod = (invoice.paymentMethod || '').toLowerCase().includes('cod') || invoice.paymentModeType === 'COD';
  const isPaid = !isCod && duesAmount === 0;
  const couponDiscount = parseFloat(invoice.couponDiscount || 0);
  const couponCode = invoice.couponCode || '';
  const shippingCharge = parseFloat(invoice.shippingCharge || 0);
  const codCharge = parseFloat(invoice.codCharge || 0);
  const dims = invoice.packageDimensions;
  const courierPartner = invoice.courierPartner || '';
  const awbNumber = invoice.awbNumber || invoice.awb || '';

  // Professional Standard A4 Page Capacities:
  // - Single-page invoice (has Header + Customer + Table + Amount in Words + Bank Info + Tax Summary + Signatory): Fits up to 15 items!
  // - Multi-page Invoice:
  //   * Page 1 (has Full Header + Customer Box + Table + C/F row + Footer): Fits 17 items!
  //   * Middle Pages (has Compact Header + Table + B/F row + C/F row + Footer): Fits up to 22 items!
  //   * Last Page (has Compact Header + Table + B/F row + Amount in Words + Bank Info + Tax Summary + Signatory): Fits up to 15 items!
  const paginatedPages = useMemo(() => {
    if (!items || items.length === 0) return [[]];
    // If 15 or fewer items, it fits cleanly on 1 single page!
    if (items.length <= 15) return [items];

    const PAGE1_CAPACITY = 17;
    const MIDDLE_CAPACITY = 22;
    const LAST_PAGE_CAPACITY = 15;

    // For a 2-page invoice (up to 17 + 15 = 32 items):
    if (items.length <= PAGE1_CAPACITY + LAST_PAGE_CAPACITY) {
      // Keep Page 1 filled (up to 17 items) and the rest on Page 2
      const p1Count = Math.min(PAGE1_CAPACITY, Math.max(16, items.length - LAST_PAGE_CAPACITY));
      return [
        items.slice(0, p1Count),
        items.slice(p1Count)
      ];
    }

    // For 3 or more pages (33+ items):
    const pages = [];
    pages.push(items.slice(0, PAGE1_CAPACITY));
    let remaining = items.slice(PAGE1_CAPACITY);

    while (remaining.length > 0) {
      if (remaining.length <= LAST_PAGE_CAPACITY) {
        pages.push(remaining);
        break;
      }
      if (remaining.length <= MIDDLE_CAPACITY + LAST_PAGE_CAPACITY) {
        const midCount = remaining.length - LAST_PAGE_CAPACITY;
        pages.push(remaining.slice(0, midCount));
        pages.push(remaining.slice(midCount));
        break;
      } else {
        pages.push(remaining.slice(0, MIDDLE_CAPACITY));
        remaining = remaining.slice(MIDDLE_CAPACITY);
      }
    }
    return pages;
  }, [items]);

  const handlePrint = useCallback(() => {
    // 1. Determine target element to print based on format
    let targetEl = null;
    if (printFormat === 'a4') {
      targetEl = document.querySelector('.print-root');
    } else if (printFormat === 'thermal') {
      targetEl = document.querySelector('.thermal-receipt');
    } else if (printFormat === 'dotmatrix') {
      targetEl = document.querySelector('.dotmatrix-receipt');
    }

    if (!targetEl) {
      window.print();
      return;
    }

    // 2. Remove any previous print iframe to avoid stale memory
    const existingIframe = document.getElementById('invoice-print-frame');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'invoice-print-frame';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();

    // Grab all stylesheets and style elements from the main document so Tailwind & styling match 1:1
    const headNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(node => node.outerHTML)
      .join('\n');

    const isThermal = printFormat === 'thermal';
    const isDotMatrix = printFormat === 'dotmatrix';

    const printPageStyles = `
      <style>
        @page {
          size: ${isThermal ? '80mm auto' : isDotMatrix ? 'auto' : 'A4 portrait'};
          margin: ${isThermal ? '2mm' : isDotMatrix ? '4mm' : '8mm 10mm'};
        }
        *, *::before, *::after {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #0f172a !important;
          font-family: inherit;
          width: 100% !important;
        }
        .a4-page-sheet {
          width: 100% !important;
          max-width: 100% !important;
          box-shadow: none !important;
          border: none !important;
          border-radius: 0 !important;
          margin: 0 !important;
          padding: 0 0 6mm 0 !important;
          page-break-after: always !important;
          break-after: page !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          background: #ffffff !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          min-height: 255mm !important;
        }
        .a4-page-sheet:last-child {
          page-break-after: avoid !important;
          break-after: avoid !important;
          padding-bottom: 0 !important;
        }
        .thermal-receipt, .dotmatrix-receipt {
          width: 100% !important;
          max-width: 100% !important;
          box-shadow: none !important;
          border: none !important;
          margin: 0 !important;
          padding: 4mm !important;
        }
      </style>
    `;

    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${isPakka ? 'Tax_Invoice' : 'Estimate_Bill'}_${invoice.id || 'Print'}</title>
          ${headNodes}
          ${printPageStyles}
        </head>
        <body class="bg-white text-slate-900">
          <div style="width: 100%;">
            ${targetEl.outerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('Print iframe error:', err);
        window.print();
      }
    }, 350);
  }, [printFormat, isPakka, invoice.id]);

  // Handle Ctrl+P keyboard shortcut cleanly
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handlePrint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrint]);

  const handleWhatsAppShare = () => {
    const phone = (invoice.phone || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `*${isPakka ? 'GST TAX INVOICE' : 'ESTIMATE BILL'}*\n` +
      `Invoice No: ${invoice.id}\n` +
      `Date: ${invoice.date}\n` +
      `Customer: ${invoice.customerName || 'Customer'}\n` +
      `Total: Rs. ${grandTotal.toFixed(2)}\n` +
      `Paid: Rs. ${paidAmount.toFixed(2)}\n` +
      (duesAmount > 0 ? `*Balance Dues: Rs. ${duesAmount.toFixed(2)}*\n` : '') +
      `Type: ${isOffline ? 'Offline Store' : 'Online Store'}\n` +
      `Thank you for shopping with us!`
    );
    window.open(`https://wa.me/${phone ? (phone.length === 10 ? '91' + phone : phone) : ''}?text=${text}`, '_blank');
    showToast(`WhatsApp Bill Link opened for ${invoice.phone || 'customer'}`);
  };

  return (
    <div className="print-modal-backdrop fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="print-modal-container bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[95vh] overflow-hidden my-auto">

        {/* Header Controls (Screen Only) */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/80 no-print">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${isPakka ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'}`}>
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {isPakka ? 'Tax Invoice' : 'Kachha Bill / Estimate'} — {invoice.id}
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${isPakka
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400 border border-amber-300 dark:border-amber-800'
                  }`}>
                  {isPakka ? 'Pakka (GST)' : 'Kachha (Non-GST)'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOffline
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                    : 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
                  }`}>
                  {isOffline ? 'Offline (POS Counter)' : 'Online (E-Commerce)'}
                </span>
              </div>
              <p className="text-xs text-slate-500">Choose your preferred print format below (Thermal, A4, or Dot Matrix Roll Paper).</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Format Selector Bar (Screen Only) */}
        <div className="px-4 py-2.5 bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex items-center gap-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setPrintFormat('thermal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${printFormat === 'thermal'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <span>🧾 1. Thermal Print (80mm/58mm Roll)</span>
            </button>

            <button
              onClick={() => setPrintFormat('a4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${printFormat === 'a4'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <span>📄 2. A4 Size (Standard Tax Invoice)</span>
            </button>

            <button
              onClick={() => setPrintFormat('dotmatrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${printFormat === 'dotmatrix'
                  ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <span>📑 3. Dot Matrix / Sprocket Roll (Medical / Continuous)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" /> WhatsApp
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print Now (Ctrl+P)
            </button>
          </div>
        </div>

        {/* Printable Area - Previews chosen format */}
        <div className="print-modal-scroll flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/50 dark:bg-slate-950 flex justify-center">

          {/* ========================================================= */}
          {/* OPTION 1: THERMAL RECEIPT (58mm / 80mm Roll) */}
          {/* ========================================================= */}
          {printFormat === 'thermal' && (
            <div className="thermal-receipt bg-white text-black p-5 rounded-xl shadow-lg border border-slate-300 w-full max-w-[340px] font-mono text-[11px] leading-relaxed">
              <div className="text-center pb-2 border-b border-dashed border-black">
                <h2 className="text-base font-extrabold uppercase tracking-wide">RAMESH FASHION & RETAIL</h2>
                <p className="text-[10px]">Unit 14, Bapu Bazar, Jaipur - 302003</p>
                <p className="text-[10px]">Phone: +91 98290 00192</p>
                {isPakka ? (
                  <>
                    <p className="text-[10px] font-bold mt-0.5">GSTIN: 08AABCR1290M1Z5</p>
                    <p className="text-[9px] uppercase font-bold mt-1 bg-black text-white px-1.5 py-0.5 inline-block">** GST TAX INVOICE **</p>
                  </>
                ) : (
                  <p className="text-[9px] uppercase font-bold mt-1 bg-gray-200 text-black px-1.5 py-0.5 inline-block">** ESTIMATE / RETAIL MEMO **</p>
                )}
                <p className="text-[9px] text-gray-700 mt-0.5">{isOffline ? 'Counter Sale (Offline)' : 'Online Store Order'}</p>
              </div>

              <div className="py-2 border-b border-dashed border-black space-y-0.5 text-[10px]">
                <div className="flex justify-between">
                  <span>Bill No: <b>{invoice.id}</b></span>
                  <span>{invoice.date?.split(' ')[0] || new Date().toISOString().split('T')[0]}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer: <b>{invoice.customerName || 'Walk-in'}</b></span>
                  <span>{invoice.phone || ''}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pay Mode: <b>{invoice.paymentMethod || 'Cash'}</b></span>
                  <span>Status: <b>{isCod ? 'COD (COLLECT CASH)' : duesAmount > 0 ? 'PARTIAL DUES' : 'PAID'}</b></span>
                </div>
                {awbNumber && (
                  <div className="flex justify-between text-[9px] text-gray-700">
                    <span>AWB: <b>{awbNumber}</b></span>
                    <span>{courierPartner || 'Courier'}</span>
                  </div>
                )}
                {dims && (
                  <div className="text-[9px] text-gray-600">
                    Pkg: {dims.lengthCm}x{dims.widthCm}x{dims.heightCm}cm • {dims.weightKg}kg
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="py-2 border-b border-dashed border-black">
                <div className="grid grid-cols-12 font-bold pb-1 border-b border-dotted border-black text-[10px]">
                  <span className="col-span-6">Item</span>
                  <span className="col-span-2 text-center">Qty</span>
                  <span className="col-span-4 text-right">Price</span>
                </div>
                <div className="divide-y divide-dotted divide-gray-300 pt-1">
                  {items.map((it, idx) => (
                    <div key={idx} className="py-1">
                      <div className="flex justify-between font-bold">
                        <span>{it.name}</span>
                        <span>₹{(it.qty * it.price).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-600">
                        <span>{it.qty} {it.unit || 'pcs'} x ₹{it.price.toFixed(2)}</span>
                        {it.batchNo && <span>B:{it.batchNo} {it.expiryDate ? `Exp:${it.expiryDate}` : ''}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="py-2 border-b border-dashed border-black space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>Coupon ({couponCode}):</span>
                    <span>-₹{couponDiscount.toFixed(2)}</span>
                  </div>
                )}
                {shippingCharge > 0 && (
                  <div className="flex justify-between text-[10px]">
                    <span>Shipping Charges:</span>
                    <span>+₹{shippingCharge.toFixed(2)}</span>
                  </div>
                )}
                {codCharge > 0 && (
                  <div className="flex justify-between text-[10px]">
                    <span>COD Handling Fee:</span>
                    <span>+₹{codCharge.toFixed(2)}</span>
                  </div>
                )}
                {isPakka && (
                  <>
                    <div className="flex justify-between text-gray-600 text-[10px]">
                      <span>CGST (Output):</span>
                      <span>₹{(gstTotal / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-[10px]">
                      <span>SGST (Output):</span>
                      <span>₹{(gstTotal / 2).toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between font-black text-sm pt-1 border-t border-dotted border-black">
                  <span>GRAND TOTAL:</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
                {isCod ? (
                  <div className="flex justify-between font-extrabold text-amber-900 bg-amber-100 px-1 py-0.5 rounded text-[10px]">
                    <span>COLLECT ON DELIVERY:</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="flex justify-between font-bold text-emerald-800">
                    <span>Amount Paid:</span>
                    <span>₹{paidAmount.toFixed(2)}</span>
                  </div>
                )}
                {!isCod && duesAmount > 0 && (
                  <div className="flex justify-between font-extrabold text-red-700 bg-red-50 px-1 py-0.5 rounded">
                    <span>BALANCE DUES:</span>
                    <span>₹{duesAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Barcode & Footer */}
              <div className="text-center pt-3 space-y-1">
                <div className="font-mono text-[9px] tracking-widest font-bold">*{invoice.id}*</div>
                <p className="text-[9px] text-gray-700">Thank You! Please Visit Again.</p>
                <p className="text-[8px] text-gray-500">Goods once sold will only be exchanged within 7 days.</p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* OPTION 2: A4 SIZE TAX INVOICE (Multi-Page Accounting Pagination) */}
          {/* ========================================================= */}
          {printFormat === 'a4' && (
            <div className="w-full max-w-[840px] space-y-6 print:space-y-0 print-root">
              {paginatedPages.map((pageItems, pageIdx) => {
                const totalPages = paginatedPages.length;
                const isFirstPage = pageIdx === 0;
                const isLastPage = pageIdx === totalPages - 1;
                const globalStartIdx = paginatedPages.slice(0, pageIdx).reduce((acc, p) => acc + p.length, 0);
                const runningBefore = paginatedPages.slice(0, pageIdx).reduce((acc, p) => acc + p.reduce((a, it) => a + (parseFloat(it.qty || 0) * parseFloat(it.price || 0)), 0), 0);
                const pageSubtotal = pageItems.reduce((acc, it) => acc + (parseFloat(it.qty || 0) * parseFloat(it.price || 0)), 0);
                const runningUpTo = runningBefore + pageSubtotal;

                return (
                  <div
                    key={pageIdx}
                    className="a4-page-sheet bg-white text-slate-900 p-8 rounded-xl shadow-lg border border-slate-300 w-full text-xs font-sans relative flex flex-col justify-between"
                  >
                    <div>
                      {/* Page Header: Full Header on Page 1, Compact Continuity Header on Page 2+ */}
                      {isFirstPage ? (
                        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-black tracking-tight text-slate-900">RAMESH FASHION STORE</span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${isPakka ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                                }`}>
                                {isPakka ? 'TAX INVOICE' : 'ESTIMATE BILL / CHALLAN'}
                              </span>
                            </div>
                            <p className="text-slate-600 text-xs mt-0.5">Wholesale, Retail & Multi-Branch Garments Merchant</p>
                            <p className="text-slate-600 text-xs">Unit 14, Bapu Bazar, Jaipur, Rajasthan - 302003</p>
                            <p className="text-slate-700 font-semibold text-xs mt-0.5">
                              GSTIN: <span className="font-mono font-bold">08AABCR1290M1Z5</span> | State Code: 08 (Rajasthan)
                            </p>
                            <p className="text-slate-600 text-xs">Phone: +91 98290 00192 | Email: support@rameshfashion.in</p>
                          </div>

                          <div className="text-right border-l-2 border-slate-200 pl-4 space-y-1">
                            <div className="text-sm font-black font-mono text-cyan-800">{invoice.id}</div>
                            <div className="text-slate-500 text-[11px]">Date: <b>{invoice.date}</b></div>
                            <div className="text-slate-500 text-[11px]">Channel: <b>{isOffline ? 'Offline Store POS' : 'Online Storefront'}</b></div>
                            <div className="text-slate-500 text-[11px]">Payment: <b>{invoice.paymentMethod || 'Cash'}</b></div>
                            {totalPages > 1 && (
                              <div className="text-cyan-700 font-bold text-[11px]">Page 1 of {totalPages}</div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-2 mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-black tracking-tight text-slate-900">RAMESH FASHION STORE</span>
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${isPakka ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                                }`}>
                                {isPakka ? 'TAX INVOICE (CONT.)' : 'ESTIMATE BILL (CONT.)'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">Invoice #{invoice.id} • Date: {invoice.date}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-extrabold text-xs text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                              Page {pageIdx + 1} of {totalPages}
                            </span>
                            <span className="text-slate-500 block text-[10px] mt-0.5">Buyer: {invoice.customerName || 'Customer'}</span>
                          </div>
                        </div>
                      )}

                      {/* Buyer & Bill Details Box (Page 1 Only) */}
                      {isFirstPage && (
                        <div className="grid grid-cols-2 gap-4 py-2.5 border-b border-slate-200 bg-slate-50/70 p-3 rounded-lg my-3">
                          <div>
                            <p className="font-bold text-slate-500 uppercase text-[10px]">Billed To (Customer Details):</p>
                            <h4 className="font-extrabold text-slate-900 text-sm mt-0.5">{invoice.customerName || 'Cash Customer'}</h4>
                            <p className="text-slate-600">Mobile: {invoice.phone || 'N/A'}</p>
                            <p className="text-slate-600">Shipping Address: {invoice.city || 'Jaipur, RJ'}</p>
                            {isPakka && <p className="text-slate-600 font-mono text-[11px]">GSTIN: {invoice.customerGstin || 'URP (Unregistered Consumer)'}</p>}
                            {courierPartner && (
                              <p className="text-purple-700 font-bold text-[10px] mt-1 font-mono">
                                🚚 Courier: {courierPartner} {awbNumber ? `(AWB: ${awbNumber})` : ''}
                              </p>
                            )}
                            {dims && (
                              <p className="text-slate-500 font-mono text-[9px]">
                                📦 Dimensions: {dims.lengthCm}×{dims.widthCm}×{dims.heightCm} cm • Weight: {dims.weightKg} kg
                              </p>
                            )}
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-bold text-slate-500 uppercase text-[10px]">Dispatch & Payment Info:</p>
                            <div className="inline-block">
                              {isCod ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                                  COD (Cash on Delivery)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  PAID (Online Gateway)
                                </span>
                              )}
                            </div>
                            <p className="font-semibold text-slate-800 text-[11px]">Mode: {invoice.paymentMethod || 'Cash'}</p>
                            {invoice.paymentRef && (
                              <p className="text-[11px] font-mono font-bold text-cyan-700">Ref: {invoice.paymentRef}</p>
                            )}
                            <p className="font-bold text-xs">
                              Fulfillment: <span className="text-cyan-800 font-extrabold">
                                {invoice.fulfillment || (isOffline ? 'Handover' : 'Ready to Ship')}
                              </span>
                            </p>
                            <p className="text-slate-500 text-[10px]">Place of Supply: Rajasthan (08)</p>
                          </div>
                        </div>
                      )}

                      {/* Paginated Items Table with strict column widths and clean alignment */}
                      <table className="w-full text-left border-collapse border border-slate-400 my-2">
                        <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px]">
                          <tr className="border-b border-slate-400">
                            <th className="border border-slate-300 px-2 py-2 text-center w-8 min-w-[32px] align-middle">#</th>
                            <th className="border border-slate-300 px-3 py-2 text-left min-w-[220px] align-middle">Description of Goods</th>
                            <th className="border border-slate-300 px-2.5 py-2 text-center w-36 min-w-[130px] whitespace-nowrap align-middle">Batch / Expiry</th>
                            <th className="border border-slate-300 px-2 py-2 text-center w-16 min-w-[60px] font-mono align-middle">HSN</th>
                            <th className="border border-slate-300 px-2 py-2 text-center w-20 min-w-[70px] whitespace-nowrap align-middle">Qty</th>
                            <th className="border border-slate-300 px-3 py-2 text-right w-24 min-w-[85px] font-mono align-middle">Rate (₹)</th>
                            {isPakka && <th className="border border-slate-300 px-2 py-2 text-center w-16 min-w-[60px] align-middle">GST %</th>}
                            <th className="border border-slate-300 px-3 py-2 text-right w-28 min-w-[95px] font-mono align-middle">Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {/* Top Row for Page 2+: Brought Forward (B/F) from previous page */}
                          {!isFirstPage && (
                            <tr className="bg-amber-50/90 font-bold border-b border-slate-300">
                              <td colSpan={isPakka ? 7 : 6} className="border border-slate-300 px-3 py-1.5 text-right uppercase text-[10px] text-amber-900 tracking-wider">
                                Total Brought Forward (B/F) from Page {pageIdx}:
                              </td>
                              <td className="border border-slate-300 px-3 py-1.5 text-right font-mono text-xs text-amber-900 font-black">
                                ₹ {runningBefore.toFixed(2)}
                              </td>
                            </tr>
                          )}

                          {pageItems.map((it, itemIdx) => {
                            const itemNumber = globalStartIdx + itemIdx + 1;
                            return (
                              <tr key={itemIdx} className="hover:bg-slate-50/60 transition">
                                <td className="border border-slate-300 px-2 py-1 text-center text-slate-500 font-bold align-middle">
                                  {itemNumber}
                                </td>
                                <td className="border border-slate-300 px-2.5 py-1 align-middle">
                                  <div className="font-bold text-slate-900 text-xs leading-tight">{it.name}</div>
                                  <div className="flex items-center gap-2 text-[9px] text-slate-500">
                                    {it.variant && <span>{it.variant}</span>}
                                    {it.barcode && <span className="font-mono text-slate-400">BC: {it.barcode}</span>}
                                  </div>
                                </td>
                                <td className="border border-slate-300 px-2 py-1 text-center align-middle whitespace-nowrap">
                                  {it.batchNo ? (
                                    <div className="font-mono text-[9px] text-slate-800 font-bold leading-tight">
                                      <span>B: {it.batchNo}</span>
                                      {it.expiryDate && (
                                        <span className="block text-[8px] text-slate-500 font-normal">Exp: {it.expiryDate}</span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 text-[10px]">—</span>
                                  )}
                                </td>
                                <td className="border border-slate-300 px-1.5 py-1 text-center font-mono text-[10px] text-slate-700 align-middle">
                                  {it.hsn || '6205'}
                                </td>
                                <td className="border border-slate-300 px-2 py-1 text-center font-bold text-xs text-slate-900 align-middle whitespace-nowrap">
                                  {it.qty} {it.unit || 'pcs'}
                                </td>
                                <td className="border border-slate-300 px-2.5 py-1 text-right font-mono text-xs text-slate-800 align-middle">
                                  {parseFloat(it.price || 0).toFixed(2)}
                                </td>
                                {isPakka && (
                                  <td className="border border-slate-300 px-1.5 py-1 text-center font-bold text-slate-700 text-[11px] align-middle">
                                    {it.gst || (it.gstRate ? `${it.gstRate}%` : '5%')}
                                  </td>
                                )}
                                <td className="border border-slate-300 px-2.5 py-1 text-right font-bold font-mono text-xs text-slate-900 align-middle">
                                  {(parseFloat(it.qty || 0) * parseFloat(it.price || 0)).toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}

                          {/* Bottom Row for Page 1..(N-1): Carried Forward (C/F) to next page */}
                          {!isLastPage && (
                            <tr className="bg-slate-100 font-bold border-t-2 border-slate-400">
                              <td colSpan={isPakka ? 7 : 6} className="border border-slate-300 px-3 py-2 text-right uppercase text-[10px] text-slate-800 tracking-wider">
                                Total Carried Forward (C/F) to Page {pageIdx + 2}:
                              </td>
                              <td className="border border-slate-300 px-3 py-2 text-right font-mono text-xs text-slate-900 font-black">
                                ₹ {runningUpTo.toFixed(2)}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Intermediate Page Footer */}
                    {!isLastPage && (
                      <div className="mt-auto pt-3 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
                        <p>Terms: Goods once sold will not be taken back after 7 days • Subject to Jaipur jurisdiction only</p>
                        <p className="font-bold text-slate-700">Continued on Page {pageIdx + 2} of {totalPages}</p>
                      </div>
                    )}

                    {/* Final Page: Grand Totals, Amount in Words, Bank Details, and Signatory */}
                    {isLastPage && (
                      <div className="mt-2">
                        {/* Bill Amount in Words (Mandatory GST & Retail Accounting Requirement) */}
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-300 my-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-600 uppercase text-[10px] block tracking-wide">
                              Invoice Amount in Words:
                            </span>
                            <span className="font-black text-slate-900 text-xs tracking-wide">
                              {numberToWordsINR(grandTotal)}
                            </span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[10px] font-bold text-slate-500 uppercase block">Grand Total:</span>
                            <span className="font-mono font-black text-sm text-cyan-800">
                              ₹ {grandTotal.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {/* Bottom Summary & Tax Calculation */}
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="space-y-1.5 border border-slate-200 p-2.5 rounded-lg bg-slate-50/50 text-[11px]">
                            <p className="font-bold text-slate-700 uppercase text-[10px]">Bank & Payment Details:</p>
                            <p className="text-slate-600">Bank: <b>HDFC Bank Ltd, Jaipur Main</b></p>
                            <p className="text-slate-600">A/C No: <b>50200088912044</b></p>
                            <p className="text-slate-600">IFSC Code: <b>HDFC0000054</b> | UPI: <b>rameshstore@hdfcbank</b></p>
                            {invoice.paymentRef && (
                              <p className="text-cyan-700 font-bold font-mono">
                                Payment Ref ({invoice.paymentMethod}): {invoice.paymentRef}
                              </p>
                            )}

                            {isPakka && (
                              <div className="pt-1.5 border-t border-slate-200 flex items-center justify-between">
                                <div className="text-[9px] text-slate-500 font-mono">
                                  IRN: 9f8a32b0c1e8d7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0<br />
                                  Signed by GST Suvidha Provider (E-Invoice Portal)
                                </div>
                                <QrCode className="w-9 h-9 text-slate-800" />
                              </div>
                            )}
                          </div>

                          <div className="border border-slate-200 rounded-lg p-2.5 space-y-1 font-mono text-xs">
                            <div className="flex justify-between text-slate-600 text-[11px]">
                              <span>Taxable Subtotal:</span>
                              <span>₹ {subtotal.toFixed(2)}</span>
                            </div>
                            {couponDiscount > 0 && (
                              <div className="flex justify-between text-emerald-700 font-bold text-[11px]">
                                <span>Coupon Savings ({couponCode}):</span>
                                <span>-₹ {couponDiscount.toFixed(2)}</span>
                              </div>
                            )}
                            {shippingCharge > 0 && (
                              <div className="flex justify-between text-slate-600 text-[11px]">
                                <span>Courier Freight / Shipping:</span>
                                <span>+₹ {shippingCharge.toFixed(2)}</span>
                              </div>
                            )}
                            {codCharge > 0 && (
                              <div className="flex justify-between text-slate-600 text-[11px]">
                                <span>COD Convenience Fee:</span>
                                <span>+₹ {codCharge.toFixed(2)}</span>
                              </div>
                            )}
                            {isPakka && (
                              <>
                                <div className="flex justify-between text-slate-600 text-[11px]">
                                  <span>CGST (Intra-state):</span>
                                  <span>₹ {(gstTotal / 2).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-600 text-[11px]">
                                  <span>SGST (Intra-state):</span>
                                  <span>₹ {(gstTotal / 2).toFixed(2)}</span>
                                </div>
                              </>
                            )}
                            <div className="flex justify-between font-black text-sm text-slate-900 pt-1.5 border-t border-slate-300">
                              <span>TOTAL INVOICE VALUE:</span>
                              <span>₹ {grandTotal.toFixed(2)}</span>
                            </div>
                            {isCod ? (
                              <div className="flex justify-between font-extrabold text-amber-900 bg-amber-50 p-1.5 rounded text-xs border border-amber-200">
                                <span>COD AMOUNT TO COLLECT:</span>
                                <span>₹ {grandTotal.toFixed(2)}</span>
                              </div>
                            ) : (
                              <div className="flex justify-between font-bold text-emerald-700 text-xs">
                                <span>Amount Received (Online):</span>
                                <span>₹ {paidAmount.toFixed(2)}</span>
                              </div>
                            )}
                            {!isCod && duesAmount > 0 && (
                              <div className="flex justify-between font-extrabold text-rose-700 bg-rose-50 p-1 rounded text-xs">
                                <span>REMAINING DUES (UDHAAR):</span>
                                <span>₹ {duesAmount.toFixed(2)}</span>
                              </div>
                            )}
                            {!isCod && duesAmount === 0 && (
                              <div className="flex justify-between font-bold text-emerald-700 text-[10px]">
                                <span>Balance Outstanding:</span>
                                <span>NIL (Full Payment)</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Signatory Footer */}
                        <div className="mt-5 pt-3 border-t border-slate-300 flex justify-between items-end text-[11px] text-slate-600">
                          <div>
                            <p className="font-bold">Terms & Conditions:</p>
                            <p>1. Goods once sold will not be taken back after 7 days.</p>
                            <p>2. Subject to Jaipur jurisdiction only.</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Page {totalPages} of {totalPages}</p>
                          </div>
                          <div className="text-center">
                            <div className="h-8"></div>
                            <p className="font-bold text-slate-900 border-t border-slate-400 pt-1 px-4">For RAMESH FASHION STORE</p>
                            <p className="text-[10px] text-slate-500">Authorized Signatory</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================= */}
          {/* OPTION 3: DOT MATRIX / CONTINUOUS SPROCKET ROLL (Medical / Pharma Roll Paper) */}
          {/* ========================================================= */}
          {printFormat === 'dotmatrix' && (
            <div className="dotmatrix-receipt relative bg-[#fafafa] text-[#111] p-6 rounded-xl shadow-lg border border-slate-400 w-full max-w-[760px] font-mono text-[11px] leading-tight">

              {/* Visual Sprocket Feed Left & Right Perforations Indicator */}
              <div className="absolute left-1.5 top-0 bottom-0 flex flex-col justify-between py-2 text-slate-400 select-none text-[8px]">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span key={i} className="w-2.5 h-2.5 rounded-full border border-slate-300 bg-slate-200/60 block my-1"></span>
                ))}
              </div>
              <div className="absolute right-1.5 top-0 bottom-0 flex flex-col justify-between py-2 text-slate-400 select-none text-[8px]">
                {Array.from({ length: 24 }).map((_, i) => (
                  <span key={i} className="w-2.5 h-2.5 rounded-full border border-slate-300 bg-slate-200/60 block my-1"></span>
                ))}
              </div>

              <div className="mx-5">
                {/* Continuous Dot Matrix Header */}
                <div className="text-center border-b border-black border-dashed pb-2">
                  <div className="text-base font-black tracking-widest uppercase">RAMESH PHARMA & MEDICAL STORE</div>
                  <div className="text-[10px]">Opposite SMS Hospital, Station Road, Jaipur - 302001</div>
                  <div className="text-[10px]">D.L. No: RJ-JP-20B-48192, RJ-JP-21B-48193 | FSSAI: 10019022001429</div>
                  <div className="flex justify-between items-center text-[10px] font-bold mt-1 px-2">
                    <span>GSTIN: 08AABCR1290M1Z5</span>
                    <span className="border border-black px-2 py-0.5 uppercase">
                      {isPakka ? 'RETAIL TAX INVOICE' : 'CASH / ESTIMATE MEMO'}
                    </span>
                    <span>Ph: 0141-2550192</span>
                  </div>
                </div>

                {/* Patient / Customer & Bill Details */}
                <div className="py-2 border-b border-black border-dashed grid grid-cols-2 text-[10px]">
                  <div>
                    <div>INV NO : <b>{invoice.id}</b></div>
                    <div>DATE   : <b>{invoice.date}</b></div>
                    <div>DR REF : <b>Dr. S. K. Sharma (MD)</b></div>
                  </div>
                  <div className="text-right">
                    <div>PATIENT/CUST: <b>{invoice.customerName || 'Walk-in'}</b></div>
                    <div>PHONE/MOBILE: <b>{invoice.phone || 'N/A'}</b></div>
                    <div>CHANNEL     : <b>{isOffline ? 'OFFLINE COUNTER' : 'ONLINE ECOM'}</b></div>
                  </div>
                </div>

                {/* Table Header */}
                <div className="py-1 border-b border-black border-dotted font-bold grid grid-cols-12 text-[10px]">
                  <span className="col-span-1">SR</span>
                  <span className="col-span-4">PRODUCT / MEDICINE</span>
                  <span className="col-span-2 text-center">BATCH / EXP</span>
                  <span className="col-span-1 text-center">QTY</span>
                  <span className="col-span-2 text-right">MRP / RATE</span>
                  <span className="col-span-2 text-right">AMOUNT</span>
                </div>

                {/* Items */}
                <div className="py-1 divide-y divide-dotted divide-gray-400 text-[10px]">
                  {items.map((it, idx) => (
                    <div key={idx} className="py-1 grid grid-cols-12 items-center">
                      <span className="col-span-1">{idx + 1}</span>
                      <span className="col-span-4 font-bold truncate">
                        {it.name}
                        {it.hsn && <span className="text-[8px] block text-gray-600">HSN: {it.hsn}</span>}
                      </span>
                      <span className="col-span-2 text-center font-bold text-red-800">
                        {it.batchNo || 'B-9201'}<br />
                        <span className="text-[9px] text-gray-700">Exp:{it.expiryDate || '12/28'}</span>
                      </span>
                      <span className="col-span-1 text-center font-bold">{it.qty}</span>
                      <span className="col-span-2 text-right">₹{it.price.toFixed(2)}</span>
                      <span className="col-span-2 text-right font-bold">₹{(it.qty * it.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Dot Matrix Totals */}
                <div className="border-t border-black border-dashed pt-2 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span>ITEMS COUNT: {items.length}</span>
                    <span>SUBTOTAL: ₹{subtotal.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between font-bold">
                      <span>COUPON SAVINGS ({couponCode}):</span>
                      <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {shippingCharge > 0 && (
                    <div className="flex justify-between text-[10px]">
                      <span>SHIPPING FREIGHT:</span>
                      <span>+₹{shippingCharge.toFixed(2)}</span>
                    </div>
                  )}
                  {codCharge > 0 && (
                    <div className="flex justify-between text-[10px]">
                      <span>COD CONVENIENCE CHARGE:</span>
                      <span>+₹{codCharge.toFixed(2)}</span>
                    </div>
                  )}
                  {isPakka && (
                    <div className="flex justify-between text-[10px] text-gray-800">
                      <span>GST BREAKDOWN (CGST+SGST):</span>
                      <span>₹{gstTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-black text-sm border-t border-black border-dotted pt-1">
                    <span>*** NET PAYABLE AMOUNT ***</span>
                    <span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>PAYMENT MODE: {invoice.paymentMethod || 'CASH'}</span>
                    <span>{isCod ? `COD TO COLLECT: ₹${grandTotal.toFixed(2)}` : `PAID: ₹${paidAmount.toFixed(2)}`}</span>
                  </div>
                  {!isCod && duesAmount > 0 && (
                    <div className="flex justify-between font-extrabold text-red-900 bg-red-100 px-1 py-0.5">
                      <span>*** OUTSTANDING DUES (UDHAAR) ***</span>
                      <span>₹{duesAmount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Dot matrix footer */}
                <div className="border-t border-black border-dashed mt-3 pt-2 flex justify-between items-center text-[9px]">
                  <div>
                    * Expired or unsealed medicines will not be returned.<br />
                    * Keep medicines in cool & dry place.
                  </div>
                  <div className="text-right">
                    FOR RAMESH PHARMA<br />
                    <br />
                    [SIGN / DISPENSED BY]
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Scoped CSS for browser print targeting only the active preview */}
        <style dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            *, *::before, *::after {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              color: #0f172a !important;
              overflow: visible !important;
              height: auto !important;
              width: 100% !important;
            }
            body * {
              visibility: hidden;
            }
            .no-print {
              display: none !important;
            }
            .print-modal-backdrop,
            .print-modal-container,
            .print-modal-scroll {
              position: static !important;
              inset: auto !important;
              max-height: none !important;
              height: auto !important;
              overflow: visible !important;
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              margin: 0 !important;
              display: block !important;
            }
            .thermal-receipt, .thermal-receipt *,
            .dotmatrix-receipt, .dotmatrix-receipt *,
            .print-root, .print-root *,
            .a4-page-sheet, .a4-page-sheet * {
              visibility: visible;
            }
            .thermal-receipt {
              position: static !important;
              width: 80mm !important;
              max-width: 80mm !important;
              margin: 0 auto !important;
              padding: 2mm !important;
              border: none !important;
              box-shadow: none !important;
            }
            .print-root {
              position: static !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              display: block !important;
            }
            .a4-page-sheet {
              visibility: visible !important;
              position: relative !important;
              width: 100% !important;
              max-width: 100% !important;
              margin: 0 !important;
              padding: 0 0 6mm 0 !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              background: #ffffff !important;
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              min-height: 255mm !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              box-sizing: border-box !important;
            }
            .a4-page-sheet:last-child {
              page-break-after: avoid !important;
              break-after: avoid !important;
              padding-bottom: 0 !important;
            }
            .dotmatrix-receipt {
              position: static !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 4mm !important;
              border: none !important;
              box-shadow: none !important;
            }
          }
        `}} />

      </div>
    </div>
  );
}

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  X, Printer, Send, FileText, CheckCircle2, QrCode,
  Receipt, Building2, Phone, Calendar, User, CreditCard,
  AlertCircle, Scissors, Layers, Check, Sparkles, RefreshCw,
  Sliders, Plus, Minus, Settings2, Info
} from 'lucide-react';
import { useErp } from '../context/ErpContext';

// Indian Currency Format Words Converter (Accounting Format)
export function numberToWordsINR(amount) {
  if (amount === undefined || amount === null || isNaN(amount) || amount === 0) {
    return 'INR Zero Rupees Only';
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

  if (rupees === 0 && paise === 0) return 'INR Zero Rupees Only';

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

// Sample dummy products for simulating multi-page A4 auto-pagination testing
const DEMO_EXTRA_ITEMS = [
  { name: 'Augmentin 625 Duo Tablet', pack: '10 Tabs', batchNo: 'AG-912', expiryDate: '11/27', hsn: '3004', qty: 2, price: 201.50, gst: '12%', gstRate: 12 },
  { name: 'Pan-D Capsule (Alkem Pharma)', pack: '15 Caps', batchNo: 'PD-441', expiryDate: '08/28', hsn: '3004', qty: 3, price: 185.00, gst: '12%', gstRate: 12 },
  { name: 'Dolo 650mg Paracetamol Tablets', pack: '15 Tabs', batchNo: 'DL-882', expiryDate: '03/29', hsn: '3004', qty: 5, price: 34.00, gst: '12%', gstRate: 12 },
  { name: 'Azithral 500 Tablet (Alembic)', pack: '5 Tabs', batchNo: 'AZ-104', expiryDate: '05/27', hsn: '3004', qty: 2, price: 119.50, gst: '12%', gstRate: 12 },
  { name: 'Montair-LC Tablet (Cipla)', pack: '10 Tabs', batchNo: 'ML-772', expiryDate: '09/27', hsn: '3004', qty: 2, price: 215.00, gst: '12%', gstRate: 12 },
  { name: 'Ascoril D Plus Cough Syrup 100ml', pack: '1 Bottle', batchNo: 'AS-632', expiryDate: '01/28', hsn: '3004', qty: 1, price: 135.00, gst: '12%', gstRate: 12 },
  { name: 'Shelcal 500 Calcium Tablets', pack: '15 Tabs', batchNo: 'SH-319', expiryDate: '12/28', hsn: '3004', qty: 2, price: 131.00, gst: '12%', gstRate: 12 },
  { name: 'Becosules Z Multivitamin Capsules', pack: '20 Caps', batchNo: 'BC-501', expiryDate: '04/28', hsn: '3004', qty: 3, price: 54.00, gst: '12%', gstRate: 12 },
  { name: 'Betadine 10% Ointment 20g Tube', pack: '1 Tube', batchNo: 'BT-889', expiryDate: '07/27', hsn: '3004', qty: 1, price: 120.00, gst: '12%', gstRate: 12 },
  { name: 'Electral ORS Energy Sachet 21.8g', pack: '5 Packs', batchNo: 'EL-920', expiryDate: '10/28', hsn: '2106', qty: 4, price: 22.00, gst: '12%', gstRate: 12 },
  { name: 'Volini Pain Relief Gel 30g', pack: '1 Tube', batchNo: 'VL-410', expiryDate: '06/28', hsn: '3004', qty: 1, price: 145.00, gst: '12%', gstRate: 12 },
  { name: 'Telma 40 Blood Pressure Tablets', pack: '30 Tabs', batchNo: 'TL-205', expiryDate: '02/29', hsn: '3004', qty: 1, price: 240.00, gst: '12%', gstRate: 12 },
  { name: 'Glycomet GP 1/500 Tablet', pack: '15 Tabs', batchNo: 'GM-881', expiryDate: '08/27', hsn: '3004', qty: 2, price: 155.00, gst: '12%', gstRate: 12 },
  { name: 'Voveran SR 100mg Tablets', pack: '10 Tabs', batchNo: 'VV-303', expiryDate: '05/28', hsn: '3004', qty: 1, price: 168.00, gst: '12%', gstRate: 12 },
  { name: 'Cetirizine 10mg Anti-Allergy Tabs', pack: '10 Tabs', batchNo: 'CT-110', expiryDate: '07/28', hsn: '3004', qty: 3, price: 18.50, gst: '12%', gstRate: 12 },
  { name: 'Azee 250 Tablet (Cipla Ltd)', pack: '6 Tabs', batchNo: 'AZ-219', expiryDate: '10/27', hsn: '3004', qty: 2, price: 72.00, gst: '12%', gstRate: 12 },
  { name: 'Pantocid 40mg Acid Reflux Tablets', pack: '15 Tabs', batchNo: 'PT-901', expiryDate: '01/29', hsn: '3004', qty: 2, price: 164.00, gst: '12%', gstRate: 12 },
  { name: 'Limcee 500mg Vitamin C Chewable', pack: '15 Tabs', batchNo: 'LC-304', expiryDate: '11/28', hsn: '3004', qty: 4, price: 23.50, gst: '12%', gstRate: 12 },
  { name: 'Neurobion Forte B-Complex Tabs', pack: '30 Tabs', batchNo: 'NF-662', expiryDate: '04/29', hsn: '3004', qty: 2, price: 38.00, gst: '12%', gstRate: 12 },
  { name: 'Zincovit Multivitamin & Minerals', pack: '15 Tabs', batchNo: 'ZN-881', expiryDate: '09/28', hsn: '3004', qty: 3, price: 110.00, gst: '12%', gstRate: 12 },
  { name: 'Allegra 120mg Fexofenadine Tabs', pack: '10 Tabs', batchNo: 'AL-512', expiryDate: '12/28', hsn: '3004', qty: 1, price: 218.00, gst: '12%', gstRate: 12 },
  { name: 'Supradyn Daily Multivitamin Tablet', pack: '15 Tabs', batchNo: 'SD-109', expiryDate: '03/29', hsn: '3004', qty: 2, price: 59.00, gst: '12%', gstRate: 12 },
  { name: 'Digene Antacid Mint Gel 200ml', pack: '1 Bottle', batchNo: 'DG-771', expiryDate: '06/28', hsn: '3004', qty: 1, price: 152.00, gst: '12%', gstRate: 12 },
  { name: 'Combiflam Pain Relief Tablet', pack: '20 Tabs', batchNo: 'CB-404', expiryDate: '08/28', hsn: '3004', qty: 3, price: 46.00, gst: '12%', gstRate: 12 },
  { name: 'Calpol 500 Paracetamol Tablets', pack: '15 Tabs', batchNo: 'CP-920', expiryDate: '05/29', hsn: '3004', qty: 4, price: 20.00, gst: '12%', gstRate: 12 },
  { name: 'Moxikind-CV 625mg Antibiotic', pack: '10 Tabs', batchNo: 'MK-118', expiryDate: '02/28', hsn: '3004', qty: 2, price: 205.00, gst: '12%', gstRate: 12 },
  { name: 'Benadryl Cough Formula Syrup 100ml', pack: '1 Bottle', batchNo: 'BD-339', expiryDate: '10/28', hsn: '3004', qty: 1, price: 129.00, gst: '12%', gstRate: 12 },
  { name: 'Himalaya Liv-52 Liver Care Syrup', pack: '200ml', batchNo: 'LV-802', expiryDate: '12/28', hsn: '3004', qty: 1, price: 175.00, gst: '12%', gstRate: 12 }
];

export default function InvoicePrintModal({ invoice, onClose }) {
  const { showToast, storeSettings, storeName } = useErp();

  // 3 print format options: 'thermal' | 'a4' | 'dotmatrix'
  const [printFormat, setPrintFormat] = useState(() => {
    try {
      return localStorage.getItem('shoppy_last_print_format') || 'a4';
    } catch {
      return 'a4';
    }
  });

  // Simulation count: 0 = actual items, 15 = 15 items (1 page test), 27 = 27 items (2 pages test)
  const [simulationCount, setSimulationCount] = useState(0);

  // Dot matrix paper height mode: 'half' (5.5" / 140mm medical tear-off standard) or 'full' (11" / 280mm)
  const [dotMatrixPaperSize, setDotMatrixPaperSize] = useState('half');

  // =========================================================================
  // USER REQUIREMENT:
  // "agar A4 bill invoice me 27 product jaise hi hoga second page me chala jayega agar 15 aur 15 se kam product hai to 1 hi page me complete set rahega"
  // Default capacity is 26 products per page:
  // - <= 26 products (e.g. 15 or less): completely fits in 1 Page with fixed bottom footer
  // - As soon as 27 products: 26 on page 1, 27th product goes to Page 2
  // =========================================================================
  // Always default to 26 items per page. Enforce minimum 26 so stale
  // localStorage values (e.g. 15 from old Test buttons) don't break layout.
  // =========================================================================
  const [a4ItemsPerPage, setA4ItemsPerPage] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_a4_items_per_page');
      const parsed = stored !== null ? parseInt(stored, 10) : NaN;
      // Enforce minimum 26 — ignore anything less (stale test values)
      if (!isNaN(parsed) && parsed >= 26) return parsed;
      return storeSettings?.a4_items_per_page || 26;
    } catch {
      return 26;
    }
  });

  // Paging mode: 'fixed' (default, uniform products/page) | 'auto' (smart dynamic) | 'custom' (separate page 1 header allowance)
  const [a4PagingMode, setA4PagingMode] = useState(() => {
    try {
      return localStorage.getItem('shoppy_a4_paging_mode') || 'fixed';
    } catch {
      return 'fixed';
    }
  });

  // Advanced: Page 1 items limit when separate mode is toggled
  const [a4Page1Max, setA4Page1Max] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_a4_page1_max');
      return stored ? parseInt(stored, 10) : 26;
    } catch {
      return 26;
    }
  });

  const [a4NextPagesMax, setA4NextPagesMax] = useState(() => {
    try {
      const stored = localStorage.getItem('shoppy_a4_next_pages_max');
      return stored ? parseInt(stored, 10) : 26;
    } catch {
      return 26;
    }
  });

  // Quick helper to change items per page and persist
  const handleA4ItemsPerPageChange = (val) => {
    const num = Math.max(1, Math.min(35, parseInt(val, 10) || 26));
    setA4ItemsPerPage(num);
    setA4PagingMode('fixed');
    try {
      localStorage.setItem('shoppy_a4_items_per_page', num.toString());
      localStorage.setItem('shoppy_a4_paging_mode', 'fixed');
    } catch { }
    showToast(`A4 page capacity set to ${num} products per page`);
  };

  const handlePagingModeChange = (mode) => {
    setA4PagingMode(mode);
    try {
      localStorage.setItem('shoppy_a4_paging_mode', mode);
    } catch { }
    if (mode === 'auto') {
      showToast('A4 Auto-fit enabled (Standard 26 items per page)');
    } else if (mode === 'custom') {
      showToast('Custom Page 1 header allowance enabled');
    } else {
      showToast(`Fixed ${a4ItemsPerPage} products per A4 page`);
    }
  };

  const handleFormatChange = (fmt) => {
    setPrintFormat(fmt);
    try {
      localStorage.setItem('shoppy_last_print_format', fmt);
    } catch { }
  };

  if (!invoice) return null;

  const isPakka = (invoice.billType || 'pakka') === 'pakka';
  const isOffline = (invoice.channelType || invoice.channel || 'offline').toLowerCase().includes('offline') ||
    (invoice.channel || '').toLowerCase().includes('pos');

  // Active items list: use real items, or if simulation enabled, inject extra products
  const activeItems = useMemo(() => {
    const baseItems = invoice.items && invoice.items.length > 0 ? invoice.items : [
      {
        name: invoice.orderNumber ? `Order #${invoice.orderNumber}` : 'Retail Bill Summary',
        variant: invoice.channel || 'Counter Sale',
        barcode: invoice.id || '-',
        hsn: '9999',
        qty: 1,
        price: parseFloat(invoice.subtotal || invoice.total || 0),
        gst: `${invoice.gstTotal ? 'Tax Incl.' : '0%'}`,
        gstRate: 0
      }
    ];

    if (simulationCount === 15) {
      return DEMO_EXTRA_ITEMS.slice(0, 15);
    }
    if (simulationCount === 27) {
      return DEMO_EXTRA_ITEMS.slice(0, 27);
    }
    if (simulationCount > 0) {
      return DEMO_EXTRA_ITEMS.slice(0, simulationCount);
    }

    return baseItems;
  }, [invoice.items, simulationCount]);

  // Recalculate totals based on active items
  const itemsSubtotal = useMemo(() => {
    return activeItems.reduce((acc, it) => acc + (parseFloat(it.qty || 1) * parseFloat(it.price || 0)), 0);
  }, [activeItems]);

  const couponDiscount = parseFloat(invoice.couponDiscount || 0);
  const couponCode = invoice.couponCode || '';
  const shippingCharge = parseFloat(invoice.shippingCharge || 0);
  const codCharge = parseFloat(invoice.codCharge || 0);

  const gstCalculated = useMemo(() => {
    if (!isPakka) return 0;
    return activeItems.reduce((acc, it) => {
      const rate = parseFloat(it.gstRate || (typeof it.gst === 'string' ? it.gst.replace('%', '') : 0) || 5);
      const rowAmt = parseFloat(it.qty || 1) * parseFloat(it.price || 0);
      return acc + (rowAmt * (rate / 100));
    }, 0);
  }, [activeItems, isPakka]);

  const grandTotal = Math.max(0, itemsSubtotal + gstCalculated + shippingCharge + codCharge - couponDiscount);
  const paidAmount = invoice.paidAmount !== undefined ? invoice.paidAmount : grandTotal;
  const duesAmount = invoice.duesAmount !== undefined ? invoice.duesAmount : Math.max(0, grandTotal - paidAmount);

  // E-Commerce Online Shipping, Courier & Payment Method Breakdown
  const isCod = (invoice.paymentMethod || '').toLowerCase().includes('cod') || invoice.paymentModeType === 'COD';
  const dims = invoice.packageDimensions;
  const courierPartner = invoice.courierPartner || '';
  const awbNumber = invoice.awbNumber || invoice.awb || '';

  // Store Brand Details
  const displayStoreName = storeSettings?.store_name || storeSettings?.storeName || storeName || 'Shoppy Store';
  const displayGstin = storeSettings?.gst_number || storeSettings?.gstin || 'Not Configured';
  const displayPhone = storeSettings?.contact_phone || storeSettings?.phone || '';

  // =========================================================================
  // A4 AUTO / MANAGED PAGINATION ALGORITHM
  // User Requirement:
  // "invoice print me 1 a4 page me kitne product set honge o manage kare"
  // "first page la total second ke top row me show hoga (B/F)"
  // "amount ka text me last page me niche show hoga"
  // =========================================================================
  const paginatedPages = useMemo(() => {
    if (!activeItems || activeItems.length === 0) return [[]];

    // MODE A: SMART AUTO-PAGINATION
    if (a4PagingMode === 'auto') {
      const SINGLE_PAGE_MAX = 26;
      if (activeItems.length <= SINGLE_PAGE_MAX) {
        return [activeItems];
      }

      const PAGE1_MAX = 26;
      const pages = [];
      pages.push(activeItems.slice(0, PAGE1_MAX));
      let remaining = activeItems.slice(PAGE1_MAX);

      while (remaining.length > 0) {
        pages.push(remaining.slice(0, PAGE1_MAX));
        remaining = remaining.slice(PAGE1_MAX);
      }
      return pages;
    }

    // MODE B: SEPARATE PAGE 1 CAPACITY (Header space allowance)
    if (a4PagingMode === 'custom') {
      const p1Limit = Math.max(1, parseInt(a4Page1Max, 10) || 26);
      const nextLimit = Math.max(1, parseInt(a4NextPagesMax, 10) || 26);

      if (activeItems.length <= p1Limit) {
        return [activeItems];
      }

      const pages = [];
      pages.push(activeItems.slice(0, p1Limit));
      let remaining = activeItems.slice(p1Limit);

      while (remaining.length > 0) {
        pages.push(remaining.slice(0, nextLimit));
        remaining = remaining.slice(nextLimit);
      }
      return pages;
    }

    // MODE C: FIXED PRODUCTS PER PAGE (Managed by User: e.g. 15, 20, 26, default 26)
    const pageSize = Math.max(1, parseInt(a4ItemsPerPage, 10) || 26);
    const pages = [];
    for (let i = 0; i < activeItems.length; i += pageSize) {
      pages.push(activeItems.slice(i, i + pageSize));
    }
    return pages.length > 0 ? pages : [[]];
  }, [activeItems, a4PagingMode, a4ItemsPerPage, a4Page1Max, a4NextPagesMax]);

  // Clean Print Engine targeting the specific format container
  const handlePrint = useCallback(() => {
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

    // Remove any previous print iframe to prevent stale DOM
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

    // Grab all stylesheets and styles from host document
    const headNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map(node => node.outerHTML)
      .join('\n');

    const isThermal = printFormat === 'thermal';
    const isDotMatrix = printFormat === 'dotmatrix';

    // Dot Matrix Continuous 1-Page Height:
    // Indian standard pharmacy sprocket stationery is 8.5" x 5.5" (215mm x 140mm)
    const dotMatrixHeight = dotMatrixPaperSize === 'half' ? '140mm' : '280mm';

    const printPageStyles = `
      <style>
        @page {
          size: ${isThermal ? '80mm auto' : isDotMatrix ? `215mm ${dotMatrixHeight}` : 'A4 portrait'};
          margin: ${isThermal ? '2mm' : isDotMatrix ? '2mm 4mm' : '10mm 8mm'};
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
          padding: 10mm 8mm !important;
          page-break-after: always !important;
          break-after: page !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          background: #ffffff !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: space-between !important;
          height: 277mm !important;
          min-height: 277mm !important;
          max-height: 277mm !important;
          box-sizing: border-box !important;
          overflow: hidden !important;
        }
        .a4-page-sheet:last-child {
          page-break-after: avoid !important;
          break-after: avoid !important;
        }
        .a4-product-row {
          height: 24px !important;
          max-height: 24px !important;
        }
        .a4-product-row td {
          height: 24px !important;
          max-height: 24px !important;
          overflow: hidden !important;
          white-space: nowrap !important;
        }
        @media print {
          body, html {
            color: #000000 !important;
            background: #ffffff !important;
          }
          .a4-page-sheet {
            color: #000000 !important;
            background: #ffffff !important;
          }
          .a4-page-sheet * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
        .thermal-receipt {
          width: 80mm !important;
          max-width: 80mm !important;
          margin: 0 auto !important;
          padding: 2mm !important;
          border: none !important;
          box-shadow: none !important;
        }
        .dotmatrix-receipt {
          width: 100% !important;
          max-width: 215mm !important;
          max-height: ${dotMatrixHeight} !important;
          overflow: hidden !important;
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          box-shadow: none !important;
          border: none !important;
          margin: 0 auto !important;
          padding: 2mm 4mm !important;
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
  }, [printFormat, dotMatrixPaperSize, isPakka, invoice.id]);

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
    <div className="print-modal-backdrop fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Modal Container */}
      <div className="print-modal-container bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-5xl w-full shadow-2xl flex flex-col max-h-[96vh] overflow-hidden my-auto">

        {/* 1. Header Controls (Screen Only) */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/80 no-print">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isPakka ? 'bg-cyan-500/10 text-[#00a2c7]' : 'bg-amber-500/10 text-amber-600'}`}>
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                  {isPakka ? 'Tax Invoice' : 'Estimate Bill'} — <span className="font-mono text-[#00a2c7]">{invoice.id}</span>
                </h3>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${isPakka
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                  }`}>
                  {isPakka ? 'Pakka (GST)' : 'Kachha (Estimate)'}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOffline
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                  : 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300'
                  }`}>
                  {isOffline ? 'Counter Sale (POS)' : 'E-Commerce Order'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select from 3 print options: Thermal (POS roll), A4 (Auto-paginated C/F & B/F), or Dot Matrix (Medical 1-Page tear-off).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Format Selector Bar with 3 Print Types & Simulation Switch (Screen Only) */}
        <div className="px-4 py-2.5 bg-slate-100/90 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 no-print">
          {/* Format Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl">
            {/* Format 1: Thermal */}
            <button
              onClick={() => handleFormatChange('thermal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${printFormat === 'thermal'
                ? 'bg-white dark:bg-slate-900 text-[#00a2c7] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <span>🧾 1. Thermal Print (80mm/58mm Roll)</span>
            </button>

            {/* Format 2: A4 Standard Tax Invoice */}
            <button
              onClick={() => handleFormatChange('a4')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${printFormat === 'a4'
                ? 'bg-white dark:bg-slate-900 text-[#00a2c7] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <span>📄 2. A4 Size (Multi-Page C/F & B/F)</span>
              {paginatedPages.length > 1 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-100 text-[#00a2c7] dark:bg-cyan-950 font-black">
                  {paginatedPages.length} Pages
                </span>
              )}
            </button>

            {/* Format 3: Dot Matrix / Medical Continuous Sprocket Paper */}
            <button
              onClick={() => handleFormatChange('dotmatrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${printFormat === 'dotmatrix'
                ? 'bg-white dark:bg-slate-900 text-[#00a2c7] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              <span>📑 3. Dot Matrix / Tractor Roll (Medical 1-Page)</span>
            </button>
          </div>

          {/* Action Buttons & Helpers */}
          <div className="flex items-center gap-2 flex-wrap">


            {/* Dot Matrix Height Selector (5.5" Half Page tear-off vs 11" Full Sheet) */}
            {printFormat === 'dotmatrix' && (
              <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-800 px-2 py-1 rounded-lg text-[11px] font-bold">
                <span className="text-slate-500">Form Size:</span>
                <button
                  onClick={() => setDotMatrixPaperSize('half')}
                  className={`px-2 py-0.5 rounded transition ${dotMatrixPaperSize === 'half' ? 'bg-white dark:bg-slate-900 text-[#00a2c7] shadow-xs' : 'text-slate-600'}`}
                >
                  5.5" (140mm Tear-Off)
                </button>
                <button
                  onClick={() => setDotMatrixPaperSize('full')}
                  className={`px-2 py-0.5 rounded transition ${dotMatrixPaperSize === 'full' ? 'bg-white dark:bg-slate-900 text-[#00a2c7] shadow-xs' : 'text-slate-600'}`}
                >
                  11" Full Sheet
                </button>
              </div>
            )}

            <button
              onClick={handleWhatsAppShare}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Send className="w-3.5 h-3.5" /> WhatsApp
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 rounded-lg bg-[#00a2c7] hover:bg-[#008ba3] text-white font-bold text-xs flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print Now (Ctrl+P)
            </button>
          </div>
        </div>



        {/* 3. Printable Area - Previews chosen format */}
        <div className="print-modal-scroll flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-200/60 dark:bg-slate-950 flex justify-center">

          {/* ========================================================= */}
          {/* OPTION 1: THERMAL RECEIPT (58mm / 80mm POS Roll) */}
          {/* ========================================================= */}
          {printFormat === 'thermal' && (
            <div className="thermal-receipt bg-white text-black p-5 rounded-xl shadow-lg border border-slate-300 w-full max-w-[340px] font-mono text-[11px] leading-relaxed">
              <div className="text-center pb-2 border-b border-dashed border-black">
                <h2 className="text-base font-extrabold uppercase tracking-wide">{displayStoreName}</h2>
                <p className="text-[10px]">Unit 14, Bapu Bazar, Jaipur - 302003</p>
                <p className="text-[10px]">Phone: {displayPhone}</p>
                {isPakka ? (
                  <>
                    <p className="text-[10px] font-bold mt-0.5">GSTIN: {displayGstin}</p>
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
                  {activeItems.map((it, idx) => (
                    <div key={idx} className="py-1">
                      <div className="flex justify-between font-bold">
                        <span>{it.name}</span>
                        <span>₹{(parseFloat(it.qty || 1) * parseFloat(it.price || 0)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-[9px] text-gray-600">
                        <span>{it.qty} {it.unit || 'pcs'} x ₹{parseFloat(it.price || 0).toFixed(2)}</span>
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
                  <span>₹{itemsSubtotal.toFixed(2)}</span>
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
                      <span>₹{(gstCalculated / 2).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 text-[10px]">
                      <span>SGST (Output):</span>
                      <span>₹{(gstCalculated / 2).toFixed(2)}</span>
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
          {/* OPTION 2: A4 SIZE TAX INVOICE (Multi-Page Auto C/F & B/F) */}
          {/* ========================================================= */}
          {printFormat === 'a4' && (
            <div className="w-full max-w-[840px] space-y-6 print:space-y-0 print-root">
              {paginatedPages.map((pageItems, pageIdx) => {
                const totalPages = paginatedPages.length;
                const isFirstPage = pageIdx === 0;
                const isLastPage = pageIdx === totalPages - 1;

                // Index of first item on this page
                const globalStartIdx = paginatedPages.slice(0, pageIdx).reduce((acc, p) => acc + p.length, 0);

                // Cumulative subtotal brought forward from all previous pages
                const runningBefore = paginatedPages
                  .slice(0, pageIdx)
                  .reduce((acc, p) => acc + p.reduce((a, it) => a + (parseFloat(it.qty || 1) * parseFloat(it.price || 0)), 0), 0);

                // Subtotal of items on this current page
                const pageSubtotal = pageItems.reduce((acc, it) => acc + (parseFloat(it.qty || 1) * parseFloat(it.price || 0)), 0);

                // Cumulative total carrying forward from this page to next
                const runningUpTo = runningBefore + pageSubtotal;

                // Right-side financial summary rows for last page table footer
                const lastPageSummaryRows = [];
                if (couponDiscount > 0) {
                  lastPageSummaryRows.push({
                    label: `Coupon Discount (${couponCode || 'Promo'}):`,
                    val: `-₹ ${couponDiscount.toFixed(2)}`,
                    cls: 'text-emerald-700 font-bold',
                  });
                }
                if (shippingCharge > 0) {
                  lastPageSummaryRows.push({
                    label: 'Shipping Charges:',
                    val: `+₹ ${shippingCharge.toFixed(2)}`,
                    cls: 'text-slate-700 font-bold',
                  });
                }
                if (isPakka) {
                  lastPageSummaryRows.push({
                    label: 'CGST (Output):',
                    val: `₹ ${(gstCalculated / 2).toFixed(2)}`,
                    cls: 'text-slate-800 font-bold',
                  });
                  lastPageSummaryRows.push({
                    label: 'SGST (Output):',
                    val: `₹ ${(gstCalculated / 2).toFixed(2)}`,
                    cls: 'text-slate-800 font-bold',
                  });
                }
                lastPageSummaryRows.push({
                  label: isPakka ? 'TOTAL VALUE:' : 'TOTAL VALUE:',
                  val: `₹ ${grandTotal.toFixed(2)}`,
                  isTotal: true,
                });
                lastPageSummaryRows.push({
                  label: isCod ? 'COD (Collect on Delivery):' : 'Amount Received:',
                  val: `₹ ${isCod ? grandTotal.toFixed(2) : paidAmount.toFixed(2)}`,
                  cls: isCod ? 'text-amber-800 font-bold' : 'text-emerald-700 font-bold',
                });
                if (!isCod && duesAmount > 0) {
                  lastPageSummaryRows.push({
                    label: 'BALANCE DUES:',
                    val: `₹ ${duesAmount.toFixed(2)}`,
                    isDues: true,
                  });
                }

                return (
                  <div
                    key={pageIdx}
                    className="a4-page-sheet bg-white text-slate-900 p-6 sm:p-7 rounded-xl shadow-lg border border-slate-300 w-full text-xs font-sans relative flex flex-col justify-between"
                    style={{
                      width: '100%',
                      minHeight: '267mm',
                      boxSizing: 'border-box',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    {/* TOP SECTION: Page Header + Buyer Info (Shrink-0) */}
                    <div className="shrink-0">
                      {/* PAGE HEADER: Full Header on Page 1, Compact Continuity Header on Page 2+ */}
                      {isFirstPage ? (
                        <div className="flex items-start justify-between border-b-2 border-slate-800 pb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold tracking-tight text-slate-900 uppercase">
                                {displayStoreName}
                              </span>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase border border-slate-700 bg-slate-100 text-slate-800">
                                {isPakka ? 'TAX INVOICE' : 'ESTIMATE BILL / CHALLAN'}
                              </span>
                            </div>
                            <p className="text-slate-600 font-normal text-xs mt-0.5">Wholesale, Retail &amp; Multi-Branch Garments Merchant</p>
                            <p className="text-slate-600 font-normal text-xs">Unit 14, Bapu Bazar, Jaipur, Rajasthan - 302003</p>
                            <p className="text-slate-700 font-medium text-xs mt-0.5">
                              GSTIN: <span className="font-mono font-bold text-slate-900">{displayGstin}</span> | State Code: 08 (Rajasthan)
                            </p>
                            <p className="text-slate-600 font-normal text-xs">Phone: {displayPhone} | Email: support@shoppyerp.in</p>
                          </div>

                          <div className="text-right border-l-2 border-slate-700 pl-4 space-y-1">
                            <div className="text-base font-bold font-mono text-slate-900">{invoice.id}</div>
                            <div className="text-slate-600 text-[11px]">Date: <span className="font-semibold text-slate-800">{invoice.date}</span></div>
                            <div className="text-slate-600 text-[11px]">Channel: <span className="font-medium text-slate-800">{isOffline ? 'Offline Store POS' : 'Online Storefront'}</span></div>
                            <div className="text-slate-600 text-[11px]">Payment: <span className="font-medium text-slate-800">{invoice.paymentMethod || 'Cash'}</span></div>
                            {totalPages > 1 && (
                              <div className="text-slate-700 font-semibold text-[11px]">
                                Page {pageIdx + 1} of {totalPages}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between border-b-2 border-slate-700 pb-1.5 mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold tracking-tight text-slate-900 uppercase">
                                {displayStoreName}
                              </span>
                              <span className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded uppercase border border-slate-700 bg-slate-100 text-slate-800">
                                {isPakka ? 'TAX INVOICE (CONTINUED)' : 'ESTIMATE BILL (CONTINUED)'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-600 font-mono font-medium">
                              Invoice #{invoice.id} • Date: {invoice.date}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-xs text-slate-800 border border-slate-400 bg-slate-100 px-2.5 py-1 rounded">
                              Page {pageIdx + 1} of {totalPages}
                            </span>
                            <span className="text-slate-600 font-medium block text-[10.5px] mt-0.5">
                              Buyer: {invoice.customerName || 'Customer'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Buyer & Bill Details Box (Page 1 Only) */}
                      {isFirstPage && (
                        <div className="grid grid-cols-2 gap-3 py-2 border border-slate-300 bg-slate-50/50 p-2.5 rounded-lg my-2 text-slate-800">
                          <div>
                            <p className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider">Billed To (Customer Details):</p>
                            <h4 className="font-bold text-slate-900 text-sm mt-0.5">{invoice.customerName || 'Cash Customer'}</h4>
                            <p className="text-slate-600 font-normal text-[11px]">Mobile: <span className="text-slate-800 font-medium">{invoice.phone || 'N/A'}</span></p>
                            <p className="text-slate-600 font-normal text-[11px]">Shipping Address: <span className="text-slate-800 font-medium">{invoice.city || 'Jaipur, RJ'}</span></p>
                            {isPakka && (
                              <p className="text-slate-600 font-mono text-[11px]">
                                GSTIN: <span className="text-slate-800 font-semibold">{invoice.customerGstin || 'URP (Unregistered Consumer)'}</span>
                              </p>
                            )}
                            {courierPartner && (
                              <p className="text-slate-700 font-medium text-[10.5px] mt-1 font-mono">
                                🚚 Courier: {courierPartner} {awbNumber ? `(AWB: ${awbNumber})` : ''}
                              </p>
                            )}
                            {dims && (
                              <p className="text-slate-500 font-mono text-[9.5px]">
                                📦 Dimensions: {dims.lengthCm}×{dims.widthCm}×{dims.heightCm} cm • Weight: {dims.weightKg} kg
                              </p>
                            )}
                          </div>
                          <div className="text-right space-y-1">
                            <p className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider">Dispatch &amp; Payment Info:</p>
                            <div className="inline-block">
                              {isCod ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-400 bg-slate-100 text-slate-800">
                                  COD (Cash on Delivery)
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold border border-slate-400 bg-slate-100 text-slate-800">
                                  PAID (Online / Cash)
                                </span>
                              )}
                            </div>
                            <p className="font-normal text-slate-600 text-[11px]">Mode: <span className="text-slate-800 font-medium">{invoice.paymentMethod || 'Cash'}</span></p>
                            {invoice.paymentRef && (
                              <p className="text-[11px] font-mono text-slate-600">Ref: <span className="text-slate-800 font-semibold">{invoice.paymentRef}</span></p>
                            )}
                            <p className="text-slate-600 font-normal text-xs">
                              Fulfillment: <span className="text-slate-800 font-medium">
                                {invoice.fulfillment || (isOffline ? 'Counter Handover' : 'Ready to Dispatch')}
                              </span>
                            </p>
                            <p className="text-slate-500 font-normal text-[10.5px]">Place of Supply: Rajasthan (08)</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* MIDDLE SECTION: Paginated Items Table (Full-Height Flex, Columns continuous top-to-bottom, NO horizontal row lines in product list) */}
                    <div className="flex-1 flex flex-col min-h-0 my-1">
                      <table className="w-full h-full border-collapse border-2 border-slate-800 table-fixed text-left">
                        <colgroup>
                          <col style={{ width: '5%' }} />
                          <col style={{ width: isPakka ? '48%' : '55%' }} />
                          <col style={{ width: '8%' }} />
                          <col style={{ width: '8%' }} />
                          <col style={{ width: '11%' }} />
                          {isPakka && <col style={{ width: '7%' }} />}
                          <col style={{ width: '13%' }} />
                        </colgroup>
                        <thead className="bg-slate-100 text-slate-800 font-bold uppercase text-[10px] tracking-wider border-b-2 border-slate-800 shrink-0">
                          <tr>
                            <th className="border-r border-slate-400 px-1 py-1.5 text-center">#</th>
                            <th className="border-r border-slate-400 px-2 py-1.5 text-left">Description of Goods</th>
                            <th className="border-r border-slate-400 px-1 py-1.5 text-center font-mono">HSN</th>
                            <th className="border-r border-slate-400 px-1 py-1.5 text-center whitespace-nowrap">Qty</th>
                            <th className="border-r border-slate-400 px-2 py-1.5 text-right font-mono">Rate (₹)</th>
                            {isPakka && <th className="border-r border-slate-400 px-1 py-1.5 text-center">GST%</th>}
                            <th className="px-2 py-1.5 text-right font-mono">Amount (₹)</th>
                          </tr>
                        </thead>
                        <tbody className="h-full">

                          {/* USER REQUIREMENT: "first page la total second ke top row me show hoga (B/F)" */}
                          {/* TOP ROW FOR PAGE 2+: Total Brought Forward (B/F) from previous page */}
                          {!isFirstPage && (
                            <tr className="bg-slate-50 font-semibold border-b border-slate-700" style={{ height: '22px', maxHeight: '22px', overflow: 'hidden' }}>
                              <td colSpan={isPakka ? 6 : 5} className="border-r border-slate-400 px-2 py-0 text-right uppercase text-[9.5px] text-slate-700 font-semibold tracking-wider" style={{ height: '22px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                <span className="border border-slate-400 bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded mr-1.5 font-bold text-[9px]">B/F</span>
                                Total Brought Forward from Page {pageIdx}:
                              </td>
                              <td className="px-2 py-0 text-right font-mono text-[10.5px] text-slate-900 font-semibold" style={{ height: '22px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                ₹ {runningBefore.toFixed(2)}
                              </td>
                            </tr>
                          )}

                          {/* USER REQUIREMENT:
                              "colume upar se niche sata hua rahega"
                              "row line product list me nhi rahega sirf row line niche rahega and upar rahega product list me nhi rahega"
                          */}
                          {pageItems.map((it, itemIdx) => {
                            const itemNumber = globalStartIdx + itemIdx + 1;
                            const rowAmount = parseFloat(it.qty || 1) * parseFloat(it.price || 0);

                            return (
                              <tr key={itemIdx} className="a4-product-row">
                                <td className="border-r border-slate-400 px-1 py-0 text-center text-slate-600 font-medium align-middle text-[10.5px]">
                                  {itemNumber}
                                </td>
                                <td className="border-r border-slate-400 px-2 py-0.5 align-middle">
                                  <div className="font-semibold text-slate-900 text-[11px] leading-tight truncate">{it.name}</div>
                                  <div className="flex items-center gap-2 text-[9px] text-slate-600 mt-0.5 leading-none">
                                    {it.batchNo && (
                                      <span>Batch: <span className="font-mono font-medium text-slate-800">{it.batchNo}</span></span>
                                    )}
                                    {it.expiryDate && (
                                      <span>Exp: <span className="font-mono font-medium text-slate-800">{it.expiryDate}</span></span>
                                    )}
                                    {it.pack && (
                                      <span className="border border-slate-300 px-1 rounded text-slate-600 bg-slate-50">{it.pack}</span>
                                    )}
                                    {it.variant && <span className="text-slate-600">{it.variant}</span>}
                                    {it.barcode && <span className="font-mono text-slate-400">BC:{it.barcode}</span>}
                                  </div>
                                </td>
                                <td className="border-r border-slate-400 px-1 py-0 text-center font-mono font-normal text-[10.5px] text-slate-700 align-middle">
                                  {it.hsn || '6205'}
                                </td>
                                <td className="border-r border-slate-400 px-1 py-0 text-center font-medium text-[11px] text-slate-800 align-middle whitespace-nowrap">
                                  {it.qty} {it.unit || 'pcs'}
                                </td>
                                <td className="border-r border-slate-400 px-2 py-0 text-right font-mono font-normal text-[10.5px] text-slate-800 align-middle">
                                  {parseFloat(it.price || 0).toFixed(2)}
                                </td>
                                {isPakka && (
                                  <td className="border-r border-slate-400 px-1 py-0 text-center font-normal text-slate-700 text-[10px] align-middle">
                                    {it.gst || (it.gstRate ? `${it.gstRate}%` : '5%')}
                                  </td>
                                )}
                                <td className="px-2 py-0 text-right font-medium font-mono text-[11px] text-slate-900 align-middle">
                                  {rowAmount.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}

                          {/* Filler Row: Expands to absorb all remaining empty space and extend column vertical lines to the footer */}
                          <tr className="h-full" style={{ height: 'auto' }}>
                            <td className="border-r border-slate-400 p-0">&nbsp;</td>
                            <td className="border-r border-slate-400 p-0">&nbsp;</td>
                            <td className="border-r border-slate-400 p-0">&nbsp;</td>
                            <td className="border-r border-slate-400 p-0">&nbsp;</td>
                            <td className="border-r border-slate-400 p-0">&nbsp;</td>
                            {isPakka && <td className="border-r border-slate-400 p-0">&nbsp;</td>}
                            <td className="p-0">&nbsp;</td>
                          </tr>

                          {/* USER REQUIREMENT: C/F on all intermediate / non-last pages */}
                          {/* BOTTOM ROW FOR PAGE 1..(N-1): Carried Forward (C/F) to next page */}
                          {!isLastPage && (
                            <tr className="bg-slate-50 font-semibold border-t border-slate-700" style={{ height: '22px', maxHeight: '22px', overflow: 'hidden' }}>
                              <td colSpan={isPakka ? 6 : 5} className="border-r border-slate-400 px-2 py-0 text-right uppercase text-[9.5px] text-slate-700 font-semibold tracking-wider" style={{ height: '22px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                <span className="border border-slate-400 bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded mr-1.5 font-bold text-[9px]">C/F</span>
                                Total Carried Forward to Page {pageIdx + 2}:
                              </td>
                              <td className="px-2 py-0 text-right font-mono text-[10.5px] text-slate-900 font-semibold" style={{ height: '22px', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                ₹ {runningUpTo.toFixed(2)}
                              </td>
                            </tr>
                          )}

                          {/* USER REQUIREMENT: "footer ko bhi row colume me set kare" */}
                          {/* LAST PAGE FOOTER INSIDE TABLE */}
                          {isLastPage && (
                            <>
                              {/* 1. Taxable Subtotal Row (Aligns Qty & Amount directly with table columns above) */}
                              <tr className="bg-slate-50 font-semibold border-t-2 border-slate-800" style={{ height: '24px', maxHeight: '24px' }}>
                                <td colSpan={3} className="border-r border-slate-400 px-2 py-0 text-left uppercase text-[9.5px] text-slate-700 align-middle" style={{ whiteSpace: 'nowrap' }}>
                                  <span className="font-normal text-slate-600">Total Items:</span> <span className="font-bold text-slate-800">{activeItems.length}</span>
                                </td>
                                <td className="border-r border-slate-400 px-1 py-0 text-center font-semibold font-mono text-[10.5px] text-slate-800 align-middle" style={{ whiteSpace: 'nowrap' }}>
                                  {activeItems.reduce((acc, it) => acc + parseFloat(it.qty || 1), 0)} pcs
                                </td>
                                <td colSpan={isPakka ? 2 : 1} className="border-r border-slate-400 px-2 py-0 text-right font-semibold uppercase text-[9.5px] text-slate-700 align-middle" style={{ whiteSpace: 'nowrap' }}>
                                  Taxable Subtotal:
                                </td>
                                <td className="px-2 py-0 text-right font-mono font-bold text-[11px] text-slate-900 align-middle" style={{ whiteSpace: 'nowrap' }}>
                                  ₹ {itemsSubtotal.toFixed(2)}
                                </td>
                              </tr>

                              {/* 2. Total items ke niche = AMOUNT IN WORDS Row */}
                              {lastPageSummaryRows.length > 0 && (
                                <tr className="border-t border-slate-300" style={{ height: '24px', maxHeight: '24px' }}>
                                  <td colSpan={4} className="border-r border-slate-400 px-2 py-0 align-middle" style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    <span className="font-semibold text-slate-600 uppercase text-[9px] mr-1.5">Amount in Words:</span>
                                    <span className="font-medium text-slate-900 text-[10px]">{numberToWordsINR(grandTotal)}</span>
                                  </td>
                                  <td colSpan={isPakka ? 2 : 1} className="border-r border-slate-400 px-2 py-0 text-right align-middle text-[9.5px] font-medium uppercase tracking-wider text-slate-700" style={{ whiteSpace: 'nowrap' }}>
                                    {lastPageSummaryRows[0].label}
                                  </td>
                                  <td className="px-2 py-0 text-right font-mono font-medium align-middle text-[10.5px] text-slate-800" style={{ whiteSpace: 'nowrap' }}>
                                    {lastPageSummaryRows[0].val}
                                  </td>
                                </tr>
                              )}

                              {/* 3. Below Amount in Words: Bank Details (Left with rowSpan) + Remaining Summary rows (Right) */}
                              {lastPageSummaryRows.length > 1 && (
                                <>
                                  <tr className={lastPageSummaryRows[1].isTotal ? 'bg-slate-100 border-t-2 border-b-2 border-slate-800' : 'border-t border-slate-300'} style={{ height: lastPageSummaryRows[1].isTotal ? '26px' : '22px' }}>
                                    {/* Left Cell: Spans across all remaining right-side rows */}
                                    <td
                                      rowSpan={lastPageSummaryRows.length - 1}
                                      colSpan={4}
                                      className="border-r border-slate-400 px-2.5 py-1.5 align-top text-slate-700 bg-white"
                                    >
                                      <div className="font-bold text-slate-800 uppercase text-[9px] mb-0.5 tracking-wider">BANK &amp; PAYMENT DETAILS:</div>
                                      <div className="text-[9.5px] text-slate-600">Bank: <span className="font-semibold text-slate-800">HDFC Bank Ltd, Jaipur Main</span> &nbsp;|&nbsp; A/C: <span className="font-semibold text-slate-800">50200088912044</span></div>
                                      <div className="text-[9.5px] text-slate-600">IFSC: <span className="font-semibold text-slate-800">HDFC0000054</span> &nbsp;|&nbsp; UPI: <span className="font-semibold text-slate-800">shoppy@hdfcbank</span></div>
                                      <div className="mt-0.5 text-[9.5px] text-slate-600">
                                        <span>Payment: <span className="font-semibold text-slate-800">{invoice.paymentMethod || 'Cash'}</span></span>
                                        {invoice.paymentRef && <span className="ml-2 font-mono font-medium text-slate-800">Ref: {invoice.paymentRef}</span>}
                                        {isCod ? (
                                          <span className="ml-2 bg-slate-100 text-slate-800 text-[8.5px] font-semibold px-1.5 py-0.2 rounded border border-slate-300">COD DUE</span>
                                        ) : (
                                          <span className="ml-2 bg-slate-100 text-slate-800 text-[8.5px] font-semibold px-1.5 py-0.2 rounded border border-slate-300">PAID</span>
                                        )}
                                      </div>
                                      {isPakka && <div className="text-slate-500 text-[8.5px] font-mono mt-0.5">IRN: 9f8a32b0c1e8d7f6...Signed by GSP (E-Invoice)</div>}
                                    </td>

                                    <td colSpan={isPakka ? 2 : 1} className={`border-r border-slate-400 px-2 py-0 text-right align-middle text-[9.5px] ${lastPageSummaryRows[1].isTotal ? 'font-bold uppercase text-[10.5px] text-slate-900 tracking-wider' : 'font-medium text-slate-700'}`} style={{ whiteSpace: 'nowrap' }}>
                                      {lastPageSummaryRows[1].label}
                                    </td>
                                    <td className={`px-2 py-0 text-right font-mono align-middle ${lastPageSummaryRows[1].isTotal ? 'font-bold text-[12.5px] text-slate-950' : 'font-medium text-[10.5px] text-slate-800'}`} style={{ whiteSpace: 'nowrap' }}>
                                      {lastPageSummaryRows[1].val}
                                    </td>
                                  </tr>

                                  {/* Subsequent right-side rows (cols 1-4 already spanned by Bank Details above) */}
                                  {lastPageSummaryRows.slice(2).map((r, idx) => (
                                    <tr
                                      key={idx}
                                      className={r.isTotal ? 'bg-slate-100 border-t-2 border-b-2 border-slate-800' : 'border-t border-slate-200'}
                                      style={{ height: r.isTotal ? '26px' : '22px' }}
                                    >
                                      <td colSpan={isPakka ? 2 : 1} className={`border-r border-slate-400 px-2 py-0 text-right align-middle text-[9.5px] ${r.isTotal ? 'font-bold uppercase text-[10.5px] text-slate-900 tracking-wider' : 'font-medium text-slate-700'}`} style={{ whiteSpace: 'nowrap' }}>
                                        {r.label}
                                      </td>
                                      <td className={`px-2 py-0 text-right font-mono align-middle ${r.isTotal ? 'font-bold text-[12.5px] text-slate-950' : 'font-medium text-[10.5px] text-slate-800'}`} style={{ whiteSpace: 'nowrap' }}>
                                        {r.val}
                                      </td>
                                    </tr>
                                  ))}
                                </>
                              )}
                            </>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Intermediate Page Footer (When Not Last Page - Pinned to bottom) */}
                    {!isLastPage && (
                      <div className=" shrink-0 mt-auto pt-2 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
                        <p style={{ display: 'none' }}>Terms: Goods once sold will only be exchanged within 7 days • Subject to Jaipur jurisdiction only</p>
                        <p className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded" style={{ display: 'none' }}>
                          Continued on Page {pageIdx + 2} of {totalPages} ➔
                        </p>
                      </div>
                    )}

                    {/* USER REQUIREMENT: "FOR RAMESH FASHION STORE / Authorized Signatory ye bala sabse bahar right bottom me rahega sab row colume se bahar" */}
                    {/* LAST PAGE OUTSIDE FOOTER: Terms & Conditions on Left, Authorized Signatory on Right */}
                    {isLastPage && (
                      <div className="shrink-0 mt-3 pt-2 border-t border-slate-300 flex justify-between items-end">
                        <div className="text-[9.5px] text-slate-600 max-w-[62%] space-y-0.5">
                          <p className="font-bold text-slate-800">Terms &amp; Conditions:</p>
                          <p className="font-normal text-slate-600">1. Goods once sold will only be exchanged within 7 days with original tag and bill.</p>
                          <p className="font-normal text-slate-600">2. Subject to Jaipur jurisdiction only. This is a computer generated invoice.</p>
                          <p className="text-[9px] text-slate-500 font-mono mt-0.5">Page {pageIdx + 1} of {totalPages}</p>
                        </div>
                        <div className="text-center min-w-[210px]">
                          <div className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                            For {displayStoreName}
                          </div>
                          <div className="h-11"></div>
                          <div className="border-t border-slate-700 pt-1 text-[10px] text-slate-700 font-semibold uppercase tracking-wider">
                            Authorized Signatory
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
          {/* OPTION 3: DOT MATRIX / CONTINUOUS SPROCKET PAPER */}
          {/* USER REQUIREMENT:
              "tisra dono traf dot dot bala page jisme 1 hi page me print hota hai
               medical store me use hota hai print ke bad far kar deta hai"
          */}
          {/* ========================================================= */}
          {printFormat === 'dotmatrix' && (
            <div className="w-full max-w-[820px] relative">
              {/* Top Perforation Guide (Simulating the tear-off continuous roll) */}
              <div className="text-center text-[10px] text-slate-500 font-mono tracking-widest pb-1 border-b border-dashed border-slate-400 flex items-center justify-center gap-2 mb-2 select-none">
                <Scissors className="w-3.5 h-3.5 text-slate-400" />
                <span>- - - - - - [ TEAR OFF ALONG PERFORATION / यहाँ से फाड़ें ] - - - - - -</span>
                <Scissors className="w-3.5 h-3.5 text-slate-400" />
              </div>

              {/* Dot Matrix 1-Page Form Paper with Sprocket Holes on Both Sides */}
              <div
                className={`dotmatrix-receipt relative bg-[#fafbf7] text-[#111] px-7 py-3 rounded-md shadow-md border-2 border-slate-400 font-mono text-[10px] leading-tight ${dotMatrixPaperSize === 'half' ? 'max-h-[140mm] overflow-hidden' : ''
                  }`}
              >
                {/* 1. Left Tractor Feed Sprocket Holes ("dono taraf dot dot bala page") */}
                <div className="absolute left-1.5 top-0 bottom-0 flex flex-col justify-between py-2 text-slate-400 select-none">
                  {Array.from({ length: 22 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-1 my-0.5">
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-400 bg-slate-200/80 block shadow-inner"></span>
                    </div>
                  ))}
                </div>

                {/* Left Perforation Guide Line */}
                <div className="absolute left-5 top-0 bottom-0 border-r border-dotted border-slate-300 select-none"></div>

                {/* 2. Right Tractor Feed Sprocket Holes ("dono taraf dot dot bala page") */}
                <div className="absolute right-1.5 top-0 bottom-0 flex flex-col justify-between py-2 text-slate-400 select-none">
                  {Array.from({ length: 22 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-1 my-0.5">
                      <span className="w-2.5 h-2.5 rounded-full border border-slate-400 bg-slate-200/80 block shadow-inner"></span>
                    </div>
                  ))}
                </div>

                {/* Right Perforation Guide Line */}
                <div className="absolute right-5 top-0 bottom-0 border-l border-dotted border-slate-300 select-none"></div>

                {/* Medical Store Form Body */}
                <div className="mx-2">
                  {/* Pharmacy Header with DL & FSSAI Numbers */}
                  <div className="text-center border-b border-black border-dashed pb-1.5">
                    <div className="text-base font-black tracking-wider uppercase">
                      {displayStoreName.toUpperCase().includes('PHARMA') || displayStoreName.toUpperCase().includes('MEDICAL')
                        ? displayStoreName.toUpperCase()
                        : `${displayStoreName.toUpperCase()} PHARMA & MEDICAL STORE`}
                    </div>
                    <div className="text-[9px]">WHOLESALE & RETAIL CHEMISTS & DRUGGISTS • SURGICAL GOODS</div>
                    <div className="text-[9px]">Opposite SMS Hospital, Station Road, Jaipur, Rajasthan - 302001</div>
                    <div className="text-[9px] font-bold text-slate-900 mt-0.5">
                      D.L. No: <span className="font-mono">RJ-JP-20B-48192, RJ-JP-21B-48193</span> | FSSAI: <span className="font-mono">10019022001429</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold mt-1 px-1">
                      <span>GSTIN: {displayGstin}</span>
                      <span className="border border-black px-2 py-0.5 uppercase tracking-wide bg-slate-100">
                        {isPakka ? 'RETAIL TAX INVOICE' : 'CASH / ESTIMATE MEMO'}
                      </span>
                      <span>Ph: {displayPhone}</span>
                    </div>
                  </div>

                  {/* Doctor & Patient Information Box */}
                  <div className="py-1.5 border-b border-black border-dashed grid grid-cols-2 text-[10px]">
                    <div>
                      <div>INV NO : <b className="font-mono">{invoice.id}</b></div>
                      <div>DATE   : <b>{invoice.date}</b></div>
                      <div>DR REF : <b>Dr. S. K. Sharma (MD, Medicine)</b></div>
                    </div>
                    <div className="text-right">
                      <div>PATIENT/CUST: <b>{invoice.customerName || 'Walk-in Patient'}</b></div>
                      <div>PHONE/MOBILE: <b>{invoice.phone || 'N/A'}</b></div>
                      <div>PAYMENT MODE: <b>{invoice.paymentMethod || 'Cash'}</b></div>
                    </div>
                  </div>

                  {/* Pharmacy Items Table Header */}
                  <div className="py-1 border-b border-black border-dotted font-bold grid grid-cols-12 text-[9px] bg-slate-100/70">
                    <span className="col-span-1 text-center">SR</span>
                    <span className="col-span-4">PRODUCT / MEDICINE</span>
                    <span className="col-span-2 text-center">BATCH / EXP</span>
                    <span className="col-span-1 text-center">QTY</span>
                    <span className="col-span-2 text-right">MRP / RATE</span>
                    <span className="col-span-2 text-right">AMOUNT</span>
                  </div>

                  {/* Pharmacy Items List (Tight Monospace Layout fitting exactly 1 continuous page) */}
                  <div className="divide-y divide-dotted divide-gray-300 text-[10px]">
                    {activeItems.slice(0, dotMatrixPaperSize === 'half' ? 7 : 18).map((it, idx) => {
                      const rowAmount = parseFloat(it.qty || 1) * parseFloat(it.price || 0);
                      return (
                        <div key={idx} className="py-0.5 grid grid-cols-12 items-center">
                          <span className="col-span-1 text-center">{idx + 1}</span>
                          <span className="col-span-4 font-bold truncate">
                            {it.name}
                            {it.pack && <span className="text-[8px] text-gray-600 block">({it.pack})</span>}
                          </span>
                          <span className="col-span-2 text-center font-bold text-red-900 leading-none">
                            {it.batchNo || 'B-9201'}<br />
                            <span className="text-[8px] text-gray-700">Exp:{it.expiryDate || '12/28'}</span>
                          </span>
                          <span className="col-span-1 text-center font-bold">{it.qty} {it.unit || ''}</span>
                          <span className="col-span-2 text-right">₹{parseFloat(it.price || 0).toFixed(2)}</span>
                          <span className="col-span-2 text-right font-bold">₹{rowAmount.toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Notice if more items than single sheet capacity */}
                  {dotMatrixPaperSize === 'half' && activeItems.length > 7 && (
                    <div className="text-[9px] text-amber-800 text-center py-0.5 border-t border-dotted border-gray-400 font-bold">
                      [Showing first 7 items to fit single 5.5" tear-off sheet • Switch to 11" full sheet above for all {activeItems.length} items]
                    </div>
                  )}

                  {/* Dot Matrix Totals */}
                  <div className="border-t border-black border-dashed pt-1 space-y-0.5 text-[10px]">
                    <div className="flex justify-between">
                      <span>ITEMS: <b>{activeItems.length}</b> • TOTAL QTY: <b>{activeItems.reduce((a, b) => a + (parseFloat(b.qty) || 1), 0)}</b></span>
                      <span>SUBTOTAL: ₹{itemsSubtotal.toFixed(2)}</span>
                    </div>

                    {isPakka && (
                      <div className="flex justify-between text-[9px] text-gray-800">
                        <span>CGST + SGST (TAX BREAKDOWN):</span>
                        <span>₹{gstCalculated.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="flex justify-between font-black text-xs border-t border-black border-dotted pt-1">
                      <span>*** NET PAYABLE AMOUNT ***</span>
                      <span>₹{grandTotal.toFixed(2)}</span>
                    </div>

                    {/* Amount in Words for Medical Bill */}
                    <div className="text-[9px] font-bold text-slate-800 pt-0.5">
                      RUPEES: <span className="uppercase">{numberToWordsINR(grandTotal)}</span>
                    </div>

                    <div className="flex justify-between font-bold text-[9px] pt-0.5">
                      <span>STATUS: {isCod ? 'COLLECT COD CASH' : duesAmount > 0 ? 'PARTIAL DUES' : 'PAID IN FULL'}</span>
                      <span>{isCod ? `DUE: ₹${grandTotal.toFixed(2)}` : `PAID: ₹${paidAmount.toFixed(2)}`}</span>
                    </div>
                  </div>

                  {/* Pharmacist Statutory Notice & Signature */}
                  <div className="border-t border-black border-dashed mt-2 pt-1 flex justify-between items-center text-[8px] text-gray-700">
                    <div>
                      * Rx Schedule H Drug: Warning - To be sold by retail on prescription only.<br />
                      * Expired medicines or opened strips will not be accepted back.<br />
                      * Keep medicines in cool & dry place. Subject to local jurisdiction.
                    </div>
                    <div className="text-right">
                      FOR PHARMACY<br />
                      <br />
                      [DISPENSED BY / PHARMACIST]
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Perforation Guide (Simulating tear-off continuous roll) */}
              <div className="text-center text-[10px] text-slate-500 font-mono tracking-widest pt-2 border-t border-dashed border-slate-400 flex items-center justify-center gap-2 mt-2 select-none">
                <Scissors className="w-3.5 h-3.5 text-slate-400" />
                <span>- - - - - - [ TEAR OFF ALONG PERFORATION / यहाँ से फाड़ें ] - - - - - -</span>
                <Scissors className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          )}

        </div>

        {/* Scoped CSS for browser print targeting only the active preview */}
        <style dangerouslySetInnerHTML={{
          __html: `
          /* Fixed row height for all A4 product rows — uniform regardless of content */
          .a4-product-row {
            height: 22px !important;
            max-height: 22px !important;
            overflow: hidden !important;
          }
          .a4-product-row td {
            height: 22px !important;
            max-height: 22px !important;
            overflow: hidden !important;
            white-space: nowrap !important;
          }

          @media print {
            @page {
              size: ${printFormat === 'thermal' ? '80mm auto' : printFormat === 'dotmatrix' ? `215mm ${dotMatrixPaperSize === 'half' ? '140mm' : '280mm'}` : 'A4 portrait'};
              margin: ${printFormat === 'thermal' ? '2mm' : printFormat === 'dotmatrix' ? '2mm 4mm' : '10mm 8mm'};
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
              padding: 10mm 8mm !important;
              border: none !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              background: #ffffff !important;
              page-break-after: always !important;
              break-after: page !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
              box-sizing: border-box !important;
              overflow: hidden !important;
              height: 277mm !important;
              min-height: 277mm !important;
              max-height: 277mm !important;
            }
            .a4-page-sheet:last-child {
              page-break-after: avoid !important;
              break-after: avoid !important;
            }
            /* Fixed row height in print too */
            .a4-product-row {
              height: 22px !important;
              max-height: 22px !important;
            }
            .a4-product-row td {
              height: 22px !important;
              max-height: 22px !important;
              overflow: hidden !important;
              white-space: nowrap !important;
            }
            .dotmatrix-receipt {
              position: static !important;
              width: 100% !important;
              max-width: 215mm !important;
              max-height: ${dotMatrixPaperSize === 'half' ? '140mm' : '280mm'} !important;
              overflow: hidden !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin: 0 auto !important;
              padding: 2mm 4mm !important;
              border: none !important;
              box-shadow: none !important;
            }
          }
        `}} />

      </div>
    </div>
  );
}

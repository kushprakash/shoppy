import React, { useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard,
  Building2,
  FileCode2,
  Receipt,
  HelpCircle,
  Users,
  CalendarDays,
  ShieldCheck,
  FolderKanban,
  Fingerprint,
  CreditCard,
  Building,
  IdCard,
  Search,
  Plus,
  RotateCw,
  FileText,
  Printer,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Moon,
  Sun,
  Bell,
  Grid2X2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  X,
  ExternalLink,
  Store,
  ArrowRight,
  TrendingUp,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  Check,
  Send,
  MoreVertical,
  ChevronDown,
  Settings,
  Key,
  Copy,
  Wifi,
  Smartphone,
  Shield,
  Zap,
  RefreshCw,
  FileSpreadsheet,
  DollarSign,
  Award,
  Lock,
  Unlock,
  Sliders,
  Cpu,
  Layers,
  CheckSquare
} from 'lucide-react';

// ============================================================================
// 1. DATASETS FOR ENTERPRISE BANKING & CRM PORTAL
// ============================================================================

const INITIAL_LEADS = [
  {
    id: 'LD-1082',
    name: 'Rajesh Kumar Verma',
    phone: '+91 98765 43210',
    email: 'rajesh.verma@gmail.com',
    type: 'Retailer',
    priority: 'High',
    leadStatus: 'In Progress',
    followupType: 'Phone Call',
    followupStatus: 'Pending',
    followupDate: '2026-10-22 11:30 AM',
    location: 'Lucknow, UP',
    notes: 'Interested in AEPS biometric terminal and BBPS Bharat Connect integration.'
  },
  {
    id: 'LD-1081',
    name: 'Sneha Patel',
    phone: '+91 98223 11456',
    email: 'sneha.patel@shreeji.in',
    type: 'Distributor',
    priority: 'High',
    leadStatus: 'Contacted',
    followupType: 'WhatsApp',
    followupStatus: 'Completed',
    followupDate: '2026-10-21 04:00 PM',
    location: 'Ahmedabad, Gujarat',
    notes: 'Requested white-label commission slab sheet for 50+ retail network.'
  },
  {
    id: 'LD-1080',
    name: 'Amitabh Sen',
    phone: '+91 97482 66321',
    email: 'amitabh.sen@bengalpay.com',
    type: 'Merchant',
    priority: 'Medium',
    leadStatus: 'Qualified',
    followupType: 'Physical Visit',
    followupStatus: 'Pending',
    followupDate: '2026-10-23 02:00 PM',
    location: 'Kolkata, WB',
    notes: 'POS machine delivery and merchant QR standee installation.'
  },
  {
    id: 'LD-1079',
    name: 'Pooja Sundaram',
    phone: '+91 94432 99812',
    email: 'pooja.s@chennaifin.org',
    type: 'Customer',
    priority: 'Low',
    leadStatus: 'New',
    followupType: 'Email',
    followupStatus: 'Pending',
    followupDate: '2026-10-24 10:00 AM',
    location: 'Chennai, TN',
    notes: 'Inquiry regarding personal loan DSA service and gold loan payout.'
  },
  {
    id: 'LD-1078',
    name: 'Vikas Deshmukh',
    phone: '+91 99234 55112',
    email: 'vikas.deshmukh@omkarmart.in',
    type: 'Retailer',
    priority: 'Urgent',
    leadStatus: 'In Progress',
    followupType: 'Phone Call',
    followupStatus: 'Rescheduled',
    followupDate: '2026-10-22 05:00 PM',
    location: 'Pune, Maharashtra',
    notes: 'Needs Micro-ATM device replacement and instant settlement wallet activation.'
  },
  {
    id: 'LD-1077',
    name: 'Mohammad Tariq',
    phone: '+91 98971 22340',
    email: 'tariq.telecom@yahoo.co.in',
    type: 'Agent',
    priority: 'Medium',
    leadStatus: 'Converted',
    followupType: 'WhatsApp',
    followupStatus: 'Completed',
    followupDate: '2026-10-20 01:15 PM',
    location: 'Kanpur, UP',
    notes: 'KYC completed, onboarding agreement signed. First transaction live.'
  },
  {
    id: 'LD-1076',
    name: 'Sunil Choudhary',
    phone: '+91 96102 33499',
    email: 'sunil.choudhary@marwaribiz.com',
    type: 'White Label Partner',
    priority: 'High',
    leadStatus: 'In Progress',
    followupType: 'Video Demo',
    followupStatus: 'Pending',
    followupDate: '2026-10-25 03:30 PM',
    location: 'Jaipur, Rajasthan',
    notes: 'API integration demo requested for Bharat Connect & PAN UTI SDK.'
  }
];

const INITIAL_AGENTS = [
  { id: 'BC-8891', name: 'Ramesh Verma', shop: 'Verma Digital Kendra', mobile: '+91 98765 43210', location: 'Lucknow, UP', wallet: 24850.50, kyc: 'Verified', status: 'Active', terminal: 'Pax D180 (#PATM-88190)' },
  { id: 'BC-8890', name: 'Amitabh Sen', shop: 'Bengal Mobile & Pay', mobile: '+91 97482 66321', location: 'Kolkata, WB', wallet: 14200.00, kyc: 'Verified', status: 'Active', terminal: 'Mantra MFS100' },
  { id: 'BC-8889', name: 'Sneha Patel', shop: 'Shreeji Enterprise', mobile: '+91 98223 11456', location: 'Ahmedabad, GJ', wallet: 58900.00, kyc: 'Verified', status: 'Active', terminal: 'Morpho MSO1300' },
  { id: 'BC-8888', name: 'Pooja Sundaram', shop: 'Sundaram Kiosk Store', mobile: '+91 94432 99812', location: 'Chennai, TN', wallet: 3120.00, kyc: 'Pending Review', status: 'Pending', terminal: 'Unassigned' },
  { id: 'BC-8887', name: 'Vikas Deshmukh', shop: 'Omkar Communication', mobile: '+91 99234 55112', location: 'Pune, MH', wallet: 42100.25, kyc: 'Verified', status: 'Active', terminal: 'Morefun POS' },
  { id: 'BC-8886', name: 'Mohammad Tariq', shop: 'Tariq CSC Center', mobile: '+91 98971 22340', location: 'Kanpur, UP', wallet: 18450.00, kyc: 'Verified', status: 'Active', terminal: 'Startek FM220' }
];

const INITIAL_DISPUTES = [
  { id: 'DSP-4091', utr: 'UTR998244102', customer: 'Deepak Sharma', agent: 'Verma Digital Kendra', service: 'AEPS Cash Out', amount: '₹ 10,000.00', status: 'In Investigation', date: '2026-10-21 11:15 AM', bank: 'State Bank of India' },
  { id: 'DSP-4090', utr: 'UTR881923004', customer: 'Kavita Devi', agent: 'Bengal Mobile & Pay', service: 'BBPS Electricity', amount: '₹ 2,450.00', status: 'Resolved', date: '2026-10-20 03:40 PM', bank: 'UPPCL Urban' },
  { id: 'DSP-4089', utr: 'UTR772810992', customer: 'Imran Khan', agent: 'Tariq CSC Center', service: 'DMT Money Transfer', amount: '₹ 25,000.00', status: 'NPCI Arbitration', date: '2026-10-19 01:20 PM', bank: 'Punjab National Bank' },
  { id: 'DSP-4088', utr: 'UTR662918231', customer: 'Suresh Patel', agent: 'Shreeji Enterprise', service: 'M-ATM Withdrawal', amount: '₹ 5,000.00', status: 'Open', date: '2026-10-21 09:10 AM', bank: 'Bank of Baroda' }
];

const FINANCIAL_SERVICES_CATALOG = [
  {
    id: 'dmt',
    title: 'Domestic Money Transfer (DMT 2.0)',
    desc: 'Instant IMPS & NEFT bank settlements 24x7 with NPCI routing and auto-switch redundancy.',
    status: 'Live & Operational',
    uptime: '99.98%',
    commission: 'Up to ₹ 45 / tx',
    speed: 'Instant (< 1.2s)'
  },
  {
    id: 'aeps',
    title: 'Aadhaar Enabled Payment System (AEPS 2.0)',
    desc: 'Cash Withdrawal, Balance Enquiry, Mini Statement & Aadhaar Pay with multi-device biometric support.',
    status: 'Live & Operational',
    uptime: '99.94%',
    commission: 'Up to ₹ 13.50 / tx',
    speed: 'Sub-second NPCI Auth'
  },
  {
    id: 'bbps',
    title: 'Bharat Bill Payment System (BBPS Bharat Connect)',
    desc: 'Official NPCI Bharat Connect portal: Electricity, Water, Gas, Mobile Postpaid, Broadband, Loan EMI.',
    status: 'Live & Operational',
    uptime: '100.0%',
    commission: 'Assured Slab Commission',
    speed: 'Real-time Biller Fetch'
  },
  {
    id: 'matm',
    title: 'Micro-ATM (M-ATM Cash Out)',
    desc: 'EMV Chip & PIN RuPay/Visa/Mastercard debit card swipe cash withdrawals with Bluetooth POS.',
    status: 'Live & Operational',
    uptime: '99.85%',
    commission: 'Up to ₹ 12.00 / tx',
    speed: 'Bank Host Switch'
  },
  {
    id: 'cms',
    title: 'Cash Management Services (CMS)',
    desc: 'Cash collection agent desk for 120+ NBFCs, Swiggy, Zomato, Flipkart, Amazon, and micro-finance firms.',
    status: 'Live & Operational',
    uptime: '99.90%',
    commission: '0.18% Flat Payout',
    speed: 'Instant OTP Verify'
  },
  {
    id: 'nepal',
    title: 'Indo-Nepal Money Remittance',
    desc: 'Cross-border remittances straight to Prabhu Bank, Nepal SBI, and Everest Bank branches.',
    status: 'Live & Operational',
    uptime: '99.70%',
    commission: '₹ 75 Flat Slab',
    speed: 'T+0 Settlement'
  },
  {
    id: 'fastag',
    title: 'FASTag Recharge & Issuance',
    desc: 'Instant NETC FASTag toll wallet recharge across all 34 bank issuers with instant barcode scan.',
    status: 'Live & Operational',
    uptime: '99.99%',
    commission: '0.25% Cashback',
    speed: 'Instant NPCI Ping'
  },
  {
    id: 'insurance',
    title: 'General & Motor Insurance',
    desc: 'Paperless Two-Wheeler, Commercial, and Health insurance policy issuance within 2 minutes.',
    status: 'Live & Operational',
    uptime: '99.92%',
    commission: 'Up to 22% Payout',
    speed: 'Instant Policy PDF'
  }
];

// ============================================================================
// 2. MAIN BANKING PORTAL COMPONENT
// ============================================================================

export default function BankingPanel() {
  // Navigation & View state
  const [activeMenu, setActiveMenu] = useState('lead-list'); // default is lead-list
  const [openSubmenus, setOpenSubmenus] = useState({
    lead: true,
    role: false,
    aeps: false,
    matm: false,
    pan: false
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Leads Data state
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [showEmptyState, setShowEmptyState] = useState(false);

  // Leads Filters state
  const [filterSearch, setFilterSearch] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterStatus, setFilterStatus] = useState('All Lead Status');
  const [filterPriority, setFilterPriority] = useState('All Priorities');
  const [filterFollowupType, setFilterFollowupType] = useState('All Followup Types');
  const [filterFollowupStatus, setFilterFollowupStatus] = useState('All Followup Status');
  const [tableSearch, setTableSearch] = useState('');

  // Pagination state
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLeadDetails, setSelectedLeadDetails] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Quick User state
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [agentSearch, setAgentSearch] = useState('');
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false);
  const [newAgentForm, setNewAgentForm] = useState({ name: '', shop: '', mobile: '', location: '', wallet: 5000 });

  // Disputes state
  const [disputes, setDisputes] = useState(INITIAL_DISPUTES);
  const [disputeSearch, setDisputeSearch] = useState('');
  const [isRaiseDisputeOpen, setIsRaiseDisputeOpen] = useState(false);
  const [newDisputeForm, setNewDisputeForm] = useState({ utr: '', customer: '', agent: 'Verma Digital Kendra', service: 'AEPS Cash Out', amount: '', bank: 'State Bank of India' });

  // AEPS Terminal simulator state
  const [aepsTab, setAepsTab] = useState('cash'); // 'cash', 'balance', 'statement', 'aadhaar-pay'
  const [aepsDevice, setAepsDevice] = useState('Mantra MFS100');
  const [aepsAadhaar, setAepsAadhaar] = useState('5481-9920-3341');
  const [aepsBank, setAepsBank] = useState('State Bank of India');
  const [aepsMobile, setAepsMobile] = useState('9876543210');
  const [aepsAmount, setAepsAmount] = useState('2000');
  const [aepsScanning, setAepsScanning] = useState(false);
  const [aepsReceipt, setAepsReceipt] = useState(null);

  // Payout request modal state
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('15000');

  // New Lead Form state
  const [newLeadForm, setNewLeadForm] = useState({
    name: '',
    phone: '',
    email: '',
    type: 'Retailer',
    priority: 'Medium',
    leadStatus: 'New',
    followupType: 'Phone Call',
    followupStatus: 'Pending',
    followupDate: '2026-10-23 11:00 AM',
    location: '',
    notes: ''
  });

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter leads based on selections
  const filteredLeads = useMemo(() => {
    if (showEmptyState) return [];

    return leads.filter((lead) => {
      if (filterSearch.trim()) {
        const query = filterSearch.toLowerCase();
        const matchesName = lead.name.toLowerCase().includes(query);
        const matchesPhone = lead.phone.toLowerCase().includes(query);
        const matchesEmail = lead.email.toLowerCase().includes(query);
        const matchesId = lead.id.toLowerCase().includes(query);
        if (!matchesName && !matchesPhone && !matchesEmail && !matchesId) return false;
      }

      if (tableSearch.trim()) {
        const query = tableSearch.toLowerCase();
        const matches =
          lead.name.toLowerCase().includes(query) ||
          lead.phone.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.id.toLowerCase().includes(query) ||
          lead.type.toLowerCase().includes(query);
        if (!matches) return false;
      }

      if (filterType !== 'All Types' && lead.type !== filterType) return false;
      if (filterStatus !== 'All Lead Status' && lead.leadStatus !== filterStatus) return false;
      if (filterPriority !== 'All Priorities' && lead.priority !== filterPriority) return false;
      if (filterFollowupType !== 'All Followup Types' && lead.followupType !== filterFollowupType) return false;
      if (filterFollowupStatus !== 'All Followup Status' && lead.followupStatus !== filterFollowupStatus) return false;

      return true;
    });
  }, [leads, showEmptyState, filterSearch, tableSearch, filterType, filterStatus, filterPriority, filterFollowupType, filterFollowupStatus]);

  // Paginated leads
  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / pageSize));
  const displayedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLeads.slice(start, start + pageSize);
  }, [filteredLeads, currentPage, pageSize]);

  // Reset Filters
  const handleResetFilters = () => {
    setFilterSearch('');
    setTableSearch('');
    setFilterType('All Types');
    setFilterStatus('All Lead Status');
    setFilterPriority('All Priorities');
    setFilterFollowupType('All Followup Types');
    setFilterFollowupStatus('All Followup Status');
    setCurrentPage(1);
    showToast('Filters refreshed to default view.');
  };

  // Add New Lead submit
  const handleAddLeadSubmit = (e) => {
    e.preventDefault();
    if (!newLeadForm.name || !newLeadForm.phone) {
      showToast('Please provide lead name and phone number', 'error');
      return;
    }

    const nextIdNum = 1083 + leads.length;
    const newEntry = {
      id: `LD-${nextIdNum}`,
      ...newLeadForm
    };

    setLeads([newEntry, ...leads]);
    setShowEmptyState(false);
    setIsAddModalOpen(false);
    setActiveMenu('lead-list');
    showToast(`Lead ${newEntry.id} created successfully!`);

    setNewLeadForm({
      name: '',
      phone: '',
      email: '',
      type: 'Retailer',
      priority: 'Medium',
      leadStatus: 'New',
      followupType: 'Phone Call',
      followupStatus: 'Pending',
      followupDate: '2026-10-23 11:00 AM',
      location: '',
      notes: ''
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      showToast('No leads available to export', 'error');
      return;
    }

    const headers = ['ID', 'Name', 'Phone', 'Email', 'Type', 'Priority', 'Lead Status', 'Followup Type', 'Followup Status', 'Followup Date', 'Notes'];
    const rows = filteredLeads.map(l => [
      `"${l.id}"`,
      `"${l.name}"`,
      `"${l.phone}"`,
      `"${l.email}"`,
      `"${l.type}"`,
      `"${l.priority}"`,
      `"${l.leadStatus}"`,
      `"${l.followupType}"`,
      `"${l.followupStatus}"`,
      `"${l.followupDate}"`,
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `enexa_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${filteredLeads.length} leads as CSV`);
  };

  const handlePrint = () => {
    window.print();
  };

  // Add agent submit
  const handleAddAgent = (e) => {
    e.preventDefault();
    if (!newAgentForm.name || !newAgentForm.mobile) return;
    const newAg = {
      id: `BC-${8892 + agents.length}`,
      ...newAgentForm,
      kyc: 'Verified',
      status: 'Active',
      terminal: 'Mantra MFS100'
    };
    setAgents([newAg, ...agents]);
    setIsAddAgentOpen(false);
    showToast(`Agent ${newAg.id} onboarded successfully!`);
  };

  // Raise dispute submit
  const handleRaiseDispute = (e) => {
    e.preventDefault();
    if (!newDisputeForm.utr || !newDisputeForm.amount) return;
    const newDsp = {
      id: `DSP-${4092 + disputes.length}`,
      ...newDisputeForm,
      status: 'Open',
      date: 'Just now'
    };
    setDisputes([newDsp, ...disputes]);
    setIsRaiseDisputeOpen(false);
    showToast(`Dispute ticket ${newDsp.id} registered!`);
  };

  // Execute AEPS Scan Simulation
  const handleAepsScan = () => {
    if (!aepsAadhaar || !aepsAmount) {
      showToast('Please enter customer Aadhaar and Amount', 'error');
      return;
    }
    setAepsScanning(true);
    showToast(`Connecting to ${aepsDevice} biometric scanner...`);
    setTimeout(() => {
      setAepsScanning(false);
      const rrn = 'RRN' + Math.floor(100000000000 + Math.random() * 900000000000);
      setAepsReceipt({
        status: 'SUCCESS',
        txnId: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
        rrn,
        stan: String(Math.floor(100000 + Math.random() * 900000)),
        aadhaarMasked: 'XXXX-XXXX-' + aepsAadhaar.slice(-4),
        bank: aepsBank,
        amount: aepsAmount,
        type: aepsTab === 'cash' ? 'Cash Withdrawal' : aepsTab === 'balance' ? 'Balance Enquiry' : 'Mini Statement',
        balanceRemaining: '₹ 14,890.50',
        timestamp: new Date().toLocaleString()
      });
      showToast('Transaction approved by NPCI Switch!');
    }, 2200);
  };

  // Priority badge styling
  const renderPriorityBadge = (priority) => {
    switch (priority) {
      case 'High':
      case 'Urgent':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">{priority}</span>;
      case 'Medium':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">{priority}</span>;
      case 'Low':
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{priority}</span>;
    }
  };

  // Status badge styling
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Converted':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Converted</span>;
      case 'In Progress':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200"><Clock className="w-3 h-3" /> In Progress</span>;
      case 'Contacted':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">Contacted</span>;
      case 'Qualified':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">Qualified</span>;
      case 'New':
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
  };

  // ============================================================================
  // 3. SIDEBAR NAVIGATION MENU DEFINITION
  // ============================================================================

  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      section: 'Menu',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: '8+'
    },
    {
      id: 'financial-service',
      label: 'Financial Service',
      section: 'Services',
      icon: <Building2 className="w-4 h-4" />
    },
    {
      id: 'api-docs',
      label: 'API Documentation',
      section: 'Services',
      icon: <FileCode2 className="w-4 h-4" />
    },
    {
      id: 'commission',
      label: 'My Commission',
      section: 'Services',
      icon: <Receipt className="w-4 h-4" />
    },
    {
      id: 'disputes',
      label: 'Dispute & Complaints',
      section: 'Services',
      icon: <HelpCircle className="w-4 h-4" />
    },
    {
      id: 'quick-user',
      label: 'Quick User',
      section: 'Services',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'operations-report',
      label: 'Operations Report',
      section: 'Services',
      icon: <CalendarDays className="w-4 h-4" />
    },
    {
      id: 'role',
      label: 'Role & Permission',
      section: 'Services',
      icon: (
        <div className="relative flex items-center w-5 h-5 shrink-0 justify-center">
          <Settings className="w-4 h-4" />
          <Settings className="w-2.5 h-2.5 absolute -bottom-0.5 -right-0.5" />
        </div>
      ),
      subItems: [
        { id: 'roles', label: 'Admin Roles' },
        { id: 'permissions', label: 'Staff Permissions' }
      ]
    },
    {
      id: 'lead',
      label: 'Lead Manager',
      section: 'Services',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="9" y1="6" x2="20" y2="6" />
          <line x1="9" y1="12" x2="20" y2="12" />
          <line x1="9" y1="18" x2="20" y2="18" />
          <circle cx="4" cy="6" r="1.5" fill="currentColor" />
          <circle cx="4" cy="12" r="1.5" fill="currentColor" />
          <circle cx="4" cy="18" r="1.5" fill="currentColor" />
        </svg>
      ),
      subItems: [
        { id: 'lead-list', label: 'Lead List' },
        { id: 'create-lead', label: 'Create Lead' }
      ]
    },
    {
      id: 'aeps',
      label: 'AEPS Service',
      section: 'Services',
      icon: <Fingerprint className="w-4 h-4" />,
      subItems: [
        { id: 'aeps-cash', label: 'Cash Withdrawal' },
        { id: 'aeps-balance', label: 'Balance Enquiry' },
        { id: 'aeps-statement', label: 'Mini Statement' }
      ]
    },
    {
      id: 'matm',
      label: 'M-ATM',
      section: 'Services',
      icon: <CreditCard className="w-4 h-4" />,
      subItems: [
        { id: 'matm-terminal', label: 'Terminal Devices' },
        { id: 'matm-transactions', label: 'ATM History' }
      ]
    },
    {
      id: 'dsa',
      label: 'DSA Service',
      section: 'Services',
      icon: <Building className="w-4 h-4" />
    },
    {
      id: 'pan',
      label: 'PAN Card Service',
      section: 'Services',
      icon: <IdCard className="w-4 h-4" />,
      subItems: [
        { id: 'pan-uti', label: 'UTI PAN Portal' },
        { id: 'pan-nsdl', label: 'NSDL E-PAN API' }
      ]
    }
  ];

  // Helper to determine if a parent menu item is currently active
  const isItemActive = (item) => {
    if (activeMenu === item.id) return true;
    if (item.subItems && item.subItems.some(sub => sub.id === activeMenu)) return true;
    return false;
  };

  // Handle clicking a parent sidebar item
  const handleItemClick = (item) => {
    if (item.subItems && item.subItems.length > 0) {
      const currentlyActive = isItemActive(item);
      if (currentlyActive) {
        // Toggle submenu open/closed
        setOpenSubmenus(prev => ({ ...prev, [item.id]: !prev[item.id] }));
      } else {
        // Activate this menu and its first sub-item, open submenu
        setOpenSubmenus(prev => ({ ...prev, [item.id]: true }));
        setActiveMenu(item.subItems[0].id);
        setMobileSidebarOpen(false);
      }
    } else {
      setActiveMenu(item.id);
      setMobileSidebarOpen(false);
    }
  };

  // Helper to render any sidebar item with dynamic scooped white tab
  const renderSidebarItem = (item) => {
    const active = isItemActive(item);
    const isOpen = openSubmenus[item.id];

    return (
      <div key={item.id} className="w-full">
        {active ? (
          /* ======================================================== */
          /* ACTIVE ITEM: SCOOPED WHITE TAB WITH TOP/BOTTOM CORNERS */
          /* ======================================================== */
          <div className="relative my-0.5 w-full">
            {/* Top Concave Corner SVG (Flushes with right edge) */}
            <div className="absolute -top-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
              <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                <path d="M 0,16 Q 16,16 16,0 L 16,16 Z" fill={isDarkMode ? '#0f172a' : '#f4f7fa'} />
              </svg>
            </div>

            {/* Active Tab Body extending flush to right-0 */}
            <div
              onClick={() => handleItemClick(item)}
              className={`cursor-pointer relative z-10 ml-1.5 mr-0 pl-1.5 pr-4 py-2 rounded-l-full flex items-center justify-between transition select-none ${
                isDarkMode ? 'bg-slate-900 text-cyan-400' : 'bg-[#f4f7fa] text-[#00a2c7]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {/* Cyan Circular Icon Button */}
                <div className="w-8 h-8 rounded-full bg-[#00a2c7] text-white flex items-center justify-center shadow-xs shadow-cyan-500/30 shrink-0">
                  {item.icon}
                </div>

                {/* Cyan Bold Label */}
                <span className="text-[13.5px] font-bold tracking-tight text-[#00a2c7] dark:text-cyan-400">
                  {item.label}
                </span>
              </div>

              {/* Right: Badge or Submenu Chevron */}
              {item.badge && (
                <span className="bg-[#00c988] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {item.badge}
                </span>
              )}
              {item.subItems && (
                <ChevronDown className={`w-3.5 h-3.5 text-[#00a2c7] dark:text-cyan-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              )}
            </div>

            {/* Bottom Concave Corner SVG (Flushes with right edge) */}
            <div className="absolute -bottom-4 right-0 w-4 h-4 overflow-hidden pointer-events-none z-20">
              <svg className="w-4 h-4 block" viewBox="0 0 16 16" fill="none">
                <path d="M 0,0 Q 16,0 16,16 L 16,0 Z" fill={isDarkMode ? '#0f172a' : '#f4f7fa'} />
              </svg>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* INACTIVE ITEM: CLEAN BLUE-GRAY BUTTON WITH 12PX MR */
          /* ======================================================== */
          <div className="mr-3">
            <button
              onClick={() => handleItemClick(item)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-[#8fa3bf] hover:bg-[#283a4e]/70 hover:text-white transition group select-none"
            >
              <div className="flex items-center gap-3">
                <span className="text-[#8fa3bf] group-hover:text-white transition-colors">
                  {item.icon}
                </span>
                <span className="text-[13px] font-medium text-[#8fa3bf] group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </div>

              {item.badge && (
                <span className="bg-[#00c988] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                  {item.badge}
                </span>
              )}
              {item.subItems && (
                <ChevronDown className={`w-3.5 h-3.5 text-[#8fa3bf] group-hover:text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              )}
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* SUBMENU ITEMS (Solid dark navy #202f40 to right-0) */}
        {/* ======================================================== */}
        {item.subItems && isOpen && (
          <div className="pt-2 pb-2 pl-8 pr-3 space-y-2 bg-[#202f40] w-full">
            {item.subItems.map((sub) => {
              const isSubActive = activeMenu === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveMenu(sub.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`flex items-center gap-2 text-left w-full group transition select-none ${isSubActive ? '' : 'pl-[11px]'}`}
                >
                  {isSubActive && <span className="w-[3px] h-4 bg-white rounded-full shadow-xs shrink-0" />}
                  <span className={`text-[13px] tracking-tight transition-colors ${
                    isSubActive ? 'font-bold text-[#00a2c7] dark:text-cyan-400' : 'font-medium text-[#8fa3bf] hover:text-white'
                  }`}>
                    {sub.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Dynamic Breadcrumb Label
  const getBreadcrumbTitle = () => {
    switch (activeMenu) {
      case 'dashboard': return '> Overview > Dashboard';
      case 'financial-service': return '> Services > Financial Service';
      case 'api-docs': return '> Developer > API Documentation';
      case 'commission': return '> Finance > My Commission';
      case 'disputes': return '> Support > Dispute & Complaints';
      case 'quick-user': return '> Management > Quick User';
      case 'operations-report': return '> Analytics > Operations Report';
      case 'role':
      case 'roles':
      case 'permissions': return '> Administration > Role & Permission';
      case 'lead-list': return '> CRM > Lead List';
      case 'create-lead': return '> CRM > Create Lead';
      case 'aeps':
      case 'aeps-cash': return '> Banking > AEPS Cash Withdrawal';
      case 'aeps-balance': return '> Banking > AEPS Balance Enquiry';
      case 'aeps-statement': return '> Banking > AEPS Mini Statement';
      case 'matm':
      case 'matm-terminal': return '> Hardware > M-ATM Terminal Devices';
      case 'matm-transactions': return '> Hardware > M-ATM History';
      case 'dsa': return '> Credit > DSA Loans & Cards';
      case 'pan':
      case 'pan-uti': return '> Citizen Services > UTI PAN Portal';
      case 'pan-nsdl': return '> Citizen Services > NSDL E-PAN API';
      default: return '> CRM';
    }
  };

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#f4f7fa] text-slate-800'}`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 text-white shadow-2xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage.msg}</span>
        </div>
      )}

      {/* MOBILE OVERLAY */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR (Dark Navy #202f40 matching image) */}
      {/* ========================================================= */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-[#202f40] text-[#8fa3bf] flex flex-col transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Logo Box Header */}
        <div className="p-4 border-b border-[#1a2634]/80 flex items-center justify-between">
          <div className="w-full bg-white rounded-xl p-2.5 shadow-sm flex items-center gap-3 border border-slate-200/50">
            {/* Logo Badge Icon */}
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#008ba3] via-[#00a8cc] to-[#10b981] flex items-center justify-center text-white shadow-sm shrink-0">
              <Building2 className="w-5 h-5" />
            </div>
            {/* Logo Text */}
            <div className="leading-none">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">Enexa</span>
                <span className="text-[11px] font-black uppercase text-[#00a2c7] tracking-wider">BANKING</span>
              </div>
              <p className="text-[8px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                A Unit of Enexa IT
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items (Scrollable, pl-3 pr-0 so active tab reaches right boundary 0px) */}
        <div className="flex-1 overflow-y-auto pl-3 pr-0 py-3 space-y-3.5 text-sm font-medium select-none custom-scrollbar">
          
          {/* MENU SECTION */}
          <div>
            <div className="px-3 pb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-3">
              Menu
            </div>
            {NAV_ITEMS.filter(i => i.section === 'Menu').map(renderSidebarItem)}
          </div>

          {/* SERVICES SECTION */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-3">
              Services
            </div>
            {NAV_ITEMS.filter(i => i.section === 'Services').map(renderSidebarItem)}
          </div>

          {/* Quick Cross-Portal Switcher links */}
          <div className="pt-3 border-t border-slate-800/80 mr-3">
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              System Portals
            </div>
            <div className="space-y-1 text-xs">
              <a href="/shop-admin" className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40">
                <span>Shop Admin ERP</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a href="/central-admin" className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40">
                <span>Central SaaS Admin</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
              <a href="/pos" className="flex items-center justify-between px-3 py-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800/40">
                <span>POS Billing Terminal</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>

        </div>

        {/* Sidebar Footer Profile Snippet */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0d1624]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              EI
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">Enexa IT Admin</p>
              <p className="text-[10px] text-slate-400 truncate">admin@enexa.in</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN APPLICATION WORKSPACE AREA */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* Top Header Bar */}
        <header className={`sticky top-0 z-30 px-6 py-3 border-b flex items-center justify-between shadow-xs transition-colors ${
          isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
        }`}>
          {/* Left: Mobile hamburger + Grid App Launcher + "Banking" title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Grid2X2 className="w-5 h-5" />
            </button>

            <button 
              title="Portal Switcher" 
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <Grid2X2 className="w-5 h-5" />
            </button>

            <h1 className="text-base font-semibold text-slate-800 dark:text-white tracking-tight">
              Banking
            </h1>
          </div>

          {/* Right: Theme Toggle + Bell Notification Badge (8) + Profile Avatar */}
          <div className="flex items-center gap-4">
            
            {/* Theme Toggle (Moon / Sun) */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Notification Bell with Badge (8) */}
            <div className="relative">
              <button 
                onClick={() => showToast('8 new lead and banking notifications pending review')}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-rose-500 rounded-full px-1 shadow-sm">
                  8
                </span>
              </button>
            </div>

            {/* User Profile Avatar */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-cyan-500/80 shadow-xs flex items-center justify-center bg-slate-200 font-bold text-slate-700 text-xs">
                <img 
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Subheader / Breadcrumbs row (Circular back button + Dynamic Breadcrumb + Bharat Connect) */}
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Back Circular Button */}
          <button 
            onClick={() => setActiveMenu('dashboard')}
            title="Go to Dashboard"
            className="w-9 h-9 rounded-full border border-cyan-500/70 text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 flex items-center justify-center transition shadow-xs"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Breadcrumb + Bharat Connect Brand */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">
              {getBreadcrumbTitle()}
            </span>

            {/* Bharat Connect Official Logo Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="w-4 h-4 rounded-xs bg-[#0b2447] flex items-center justify-center text-white text-[9px] font-black">
                B
              </div>
              <div className="leading-none text-left">
                <span className="text-xs font-extrabold text-[#0b2447] dark:text-white">Bharat</span>
                <span className="text-xs font-extrabold text-[#ff7800]">Connect</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. MAIN WORKSPACE CONTENT ROUTER */}
        {/* ========================================================= */}
        <main className="px-6 pb-12 flex-1">
          
          {/* ========================================================= */}
          {/* VIEW 1: LEAD LIST (EXACT FROM USER SCREENSHOT) */}
          {/* ========================================================= */}
          {activeMenu === 'lead-list' && (
            <div className={`rounded-xl border shadow-xs p-6 transition-colors ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
            }`}>
              
              {/* Card Header: Leads List + Add New Lead Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight font-heading">
                    Leads List
                  </h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {filteredLeads.length} Total
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Quick Toggle for Screenshot Simulation */}
                  <button
                    onClick={() => {
                      setShowEmptyState(!showEmptyState);
                      showToast(showEmptyState ? 'Restored lead records' : 'Switched to empty state (No data found.)');
                    }}
                    title="Toggle between Empty State and Populated Leads"
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    {showEmptyState ? 'Show Populated Data' : 'Preview Empty State ("No data found.")'}
                  </button>

                  {/* + Add New Lead Button */}
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#00a8cc] hover:bg-[#0092b3] text-white text-xs font-bold shadow-xs transition active:scale-98"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Add New Lead</span>
                  </button>
                </div>
              </div>

              {/* FILTERS SECTION (Row 1 & Row 2 exactly matching screenshot) */}
              <div className="pt-5 pb-5 space-y-3.5">
                
                {/* Filter Row 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search leads..."
                      value={filterSearch}
                      onChange={(e) => { setFilterSearch(e.target.value); setCurrentPage(1); }}
                      className={`w-full px-3.5 py-2 text-xs rounded-lg border outline-none transition focus:border-cyan-500 ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <select
                      value={filterType}
                      onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}
                      className={`w-full px-3 py-2 text-xs rounded-lg border outline-none transition focus:border-cyan-500 ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <option>All Types</option>
                      <option>Retailer</option>
                      <option>Distributor</option>
                      <option>Merchant</option>
                      <option>Customer</option>
                      <option>Agent</option>
                      <option>White Label Partner</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={filterStatus}
                      onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                      className={`w-full px-3 py-2 text-xs rounded-lg border outline-none transition focus:border-cyan-500 ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <option>All Lead Status</option>
                      <option>New</option>
                      <option>In Progress</option>
                      <option>Contacted</option>
                      <option>Qualified</option>
                      <option>Converted</option>
                      <option>Lost/Rejected</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={filterPriority}
                      onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }}
                      className={`w-full px-3 py-2 text-xs rounded-lg border outline-none transition focus:border-cyan-500 ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <option>All Priorities</option>
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                      <option>Urgent</option>
                    </select>
                  </div>

                  <div>
                    <button
                      onClick={handleResetFilters}
                      className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#334155] hover:bg-[#1e293b] text-white text-xs font-semibold shadow-xs transition"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>
                </div>

                {/* Filter Row 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <select
                      value={filterFollowupType}
                      onChange={(e) => { setFilterFollowupType(e.target.value); setCurrentPage(1); }}
                      className={`w-full px-3 py-2 text-xs rounded-lg border outline-none transition focus:border-cyan-500 ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <option>All Followup Types</option>
                      <option>Phone Call</option>
                      <option>WhatsApp</option>
                      <option>Email</option>
                      <option>Physical Visit</option>
                      <option>Video Demo</option>
                    </select>
                  </div>

                  <div>
                    <select
                      value={filterFollowupStatus}
                      onChange={(e) => { setFilterFollowupStatus(e.target.value); setCurrentPage(1); }}
                      className={`w-full px-3 py-2 text-xs rounded-lg border outline-none transition focus:border-cyan-500 ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <option>All Followup Status</option>
                      <option>Pending</option>
                      <option>Completed</option>
                      <option>Rescheduled</option>
                      <option>Missed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* TABLE CONTROLS BAR: Left Search + Right Export Buttons */}
              <div className="pt-2 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={tableSearch}
                    onChange={(e) => { setTableSearch(e.target.value); setCurrentPage(1); }}
                    className={`w-64 px-3 py-1.5 text-xs rounded-lg border outline-none transition focus:border-cyan-500 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1 px-3 py-1.5 rounded border border-[#00a8cc] text-[#00a8cc] hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-xs font-semibold transition"
                  >
                    <span>CSV Export</span>
                  </button>

                  <button
                    onClick={() => {
                      showToast('Opening print dialog for PDF export...');
                      setTimeout(() => window.print(), 300);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded border border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold transition"
                  >
                    <span>PDF Export</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="flex items-center gap-1 px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition"
                  >
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* DATA TABLE */}
              <div className="overflow-x-auto rounded-lg border border-slate-200/70 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#edf2fa] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px] tracking-wider">
                      <th className="py-3 px-3.5 border-b border-slate-200/80 dark:border-slate-700">ID</th>
                      <th className="py-3 px-3.5 border-b border-slate-200/80 dark:border-slate-700">Name</th>
                      <th className="py-3 px-3.5 border-b border-slate-200/80 dark:border-slate-700">Phone</th>
                      <th className="py-3 px-3.5 border-b border-slate-200/80 dark:border-slate-700">Email</th>
                      <th className="py-3 px-3.5 border-b border-slate-200/80 dark:border-slate-700">Type</th>
                      <th className="py-3 px-3.5 border-b border-slate-200/80 dark:border-slate-700">Priority</th>
                      <th className="py-3 px-3.5 border-b border-slate-200/80 dark:border-slate-700">Lead Status</th>
                      <th className="py-3 px-3.5 border-b border-slate-200/80 dark:border-slate-700">Follow-up Type</th>
                      <th className="py-3 px-3.5 border-b border-slate-200/80 dark:border-slate-700">Follow-up Status</th>
                      <th className="py-3 px-3.5 border-b border-slate-200/80 dark:border-slate-700">Follow-up Date</th>
                      <th className="py-3 px-3.5 border-b border-slate-200/80 dark:border-slate-700 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-normal">
                    {displayedLeads.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="py-8 px-4 text-center text-slate-500 dark:text-slate-400 font-medium">
                          No data found.
                        </td>
                      </tr>
                    ) : (
                      displayedLeads.map((lead) => (
                        <tr 
                          key={lead.id}
                          className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="py-3 px-3.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                            {lead.id}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{lead.name}</span>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap font-mono text-slate-600 dark:text-slate-400">
                            {lead.phone}
                          </td>
                          <td className="py-3 px-3.5 text-slate-600 dark:text-slate-400 truncate max-w-[140px]">
                            {lead.email}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {lead.type}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {renderPriorityBadge(lead.priority)}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {renderStatusBadge(lead.leadStatus)}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap text-slate-700 dark:text-slate-300">
                            {lead.followupType}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              lead.followupStatus === 'Completed' 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : lead.followupStatus === 'Rescheduled'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {lead.followupStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400">
                            {lead.followupDate}
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setSelectedLeadDetails(lead)}
                                title="View Details"
                                className="p-1 rounded text-cyan-600 hover:bg-cyan-50 dark:hover:bg-slate-800"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedLeadDetails(lead)}
                                title="Edit Lead"
                                className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION FOOTER */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                    className={`px-2.5 py-1 rounded border text-xs outline-none ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1 || displayedLeads.length === 0}
                    className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 font-mono"
                  >
                    &lt;&lt;
                  </button>

                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || displayedLeads.length === 0}
                    className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 font-mono"
                  >
                    &lt;
                  </button>

                  <span className="px-3 py-1 font-medium text-slate-700 dark:text-slate-300">
                    Page {displayedLeads.length === 0 ? 0 : currentPage} of {displayedLeads.length === 0 ? 0 : totalPages}
                  </span>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || displayedLeads.length === 0}
                    className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 font-mono"
                  >
                    &gt;
                  </button>

                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages || displayedLeads.length === 0}
                    className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 font-mono"
                  >
                    &gt;&gt;
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 2: CREATE LEAD FORM */}
          {/* ========================================================= */}
          {activeMenu === 'create-lead' && (
            <div className={`max-w-4xl rounded-xl border shadow-xs p-6 ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'
            }`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">
                    Create New Retailer / Partner Lead
                  </h2>
                  <p className="text-xs text-slate-500">
                    Onboard new banking agents, merchant shops, and distributors.
                  </p>
                </div>
                <button
                  onClick={() => setActiveMenu('lead-list')}
                  className="text-xs text-cyan-600 font-semibold hover:underline"
                >
                  &larr; Back to Leads List
                </button>
              </div>

              <form onSubmit={handleAddLeadSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={newLeadForm.name}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      value={newLeadForm.phone}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="agent@example.com"
                      value={newLeadForm.email}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Lead Type
                    </label>
                    <select
                      value={newLeadForm.type}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, type: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                    >
                      <option>Retailer</option>
                      <option>Distributor</option>
                      <option>Merchant</option>
                      <option>Customer</option>
                      <option>Agent</option>
                      <option>White Label Partner</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={newLeadForm.priority}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, priority: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                    >
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                      <option>Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Lead Status
                    </label>
                    <select
                      value={newLeadForm.leadStatus}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, leadStatus: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                    >
                      <option>New</option>
                      <option>In Progress</option>
                      <option>Contacted</option>
                      <option>Qualified</option>
                      <option>Converted</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Follow-up Type
                    </label>
                    <select
                      value={newLeadForm.followupType}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, followupType: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                    >
                      <option>Phone Call</option>
                      <option>WhatsApp</option>
                      <option>Email</option>
                      <option>Physical Visit</option>
                      <option>Video Demo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Follow-up Date & Time
                    </label>
                    <input
                      type="text"
                      placeholder="2026-10-23 11:00 AM"
                      value={newLeadForm.followupDate}
                      onChange={(e) => setNewLeadForm({ ...newLeadForm, followupDate: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lucknow, Uttar Pradesh"
                    value={newLeadForm.location}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Requirements & Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter agent requirements, devices needed, etc."
                    value={newLeadForm.notes}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveMenu('lead-list')}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00a8cc] hover:bg-[#0092b3] text-white shadow-xs"
                  >
                    Save & Create Lead
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 3: DASHBOARD OVERVIEW */}
          {/* ========================================================= */}
          {activeMenu === 'dashboard' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className={`p-5 rounded-xl border shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                    <span>AEPS & DMT Volume</span>
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black mt-2 text-slate-900 dark:text-white">₹ 4,82,900</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">▲ 14.8% from yesterday</div>
                </div>

                <div className={`p-5 rounded-xl border shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                    <span>Total Active Leads</span>
                    <FolderKanban className="w-4 h-4 text-[#00a2c7]" />
                  </div>
                  <div className="text-2xl font-black mt-2 text-slate-900 dark:text-white">{leads.length}</div>
                  <div className="text-[11px] text-cyan-600 font-semibold mt-1">4 high priority today</div>
                </div>

                <div className={`p-5 rounded-xl border shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                    <span>Commission Wallet</span>
                    <Receipt className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="text-2xl font-black mt-2 text-slate-900 dark:text-white">₹ 38,450.00</div>
                  <div className="text-[11px] text-slate-500 mt-1">Instant bank settlement ready</div>
                </div>

                <div className={`p-5 rounded-xl border shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
                    <span>Active Retailers</span>
                    <Users className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black mt-2 text-slate-900 dark:text-white">128</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-1">98.2% terminal uptime</div>
                </div>
              </div>

              {/* Quick Actions & Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className={`p-6 rounded-xl border shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Quick Banking Services</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setActiveMenu('aeps-cash'); setOpenSubmenus(p => ({ ...p, aeps: true })); }} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-left hover:border-cyan-500 transition">
                      <Fingerprint className="w-5 h-5 text-cyan-600 mb-1" />
                      <div className="text-xs font-bold text-slate-800 dark:text-white">AEPS Cash Out</div>
                      <div className="text-[10px] text-slate-400">Biometric Aadhaar withdrawal</div>
                    </button>
                    <button onClick={() => setActiveMenu('commission')} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-left hover:border-cyan-500 transition">
                      <Receipt className="w-5 h-5 text-emerald-600 mb-1" />
                      <div className="text-xs font-bold text-slate-800 dark:text-white">Agent Payouts</div>
                      <div className="text-[10px] text-slate-400">Settle commissions to bank</div>
                    </button>
                    <button onClick={() => { setActiveMenu('lead-list'); setOpenSubmenus(p => ({ ...p, lead: true })); }} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-left hover:border-cyan-500 transition">
                      <FolderKanban className="w-5 h-5 text-indigo-600 mb-1" />
                      <div className="text-xs font-bold text-slate-800 dark:text-white">Lead Manager</div>
                      <div className="text-[10px] text-slate-400">View CRM follow-ups</div>
                    </button>
                    <button onClick={() => setActiveMenu('dsa')} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-left hover:border-cyan-500 transition">
                      <Building className="w-5 h-5 text-amber-600 mb-1" />
                      <div className="text-xs font-bold text-slate-800 dark:text-white">DSA Loans & Cards</div>
                      <div className="text-[10px] text-slate-400">Credit card & personal loans</div>
                    </button>
                  </div>
                </div>

                <div className={`p-6 rounded-xl border shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-3">Pending Follow-ups Today</h3>
                  <div className="space-y-3">
                    {leads.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-white">{item.name}</div>
                          <div className="text-[10px] text-slate-500">{item.phone} &bull; {item.type}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-semibold text-cyan-600 block">{item.followupType}</span>
                          <span className="text-[10px] text-slate-400">{item.followupDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 4: FINANCIAL SERVICE HUB */}
          {/* ========================================================= */}
          {activeMenu === 'financial-service' && (
            <div className="space-y-6">
              <div className={`p-6 rounded-xl border shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">
                      Financial Services Switch & Products
                    </h2>
                    <p className="text-xs text-slate-500">
                      Real-time NPCI Bharat Connect, AEPS, DMT 2.0 & Indo-Nepal Remittance status.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Core Banking Switch Operational
                    </span>
                  </div>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                  {FINANCIAL_SERVICES_CATALOG.map((svc) => (
                    <div 
                      key={svc.id}
                      className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 hover:border-cyan-500 transition group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 dark:bg-slate-800 dark:text-cyan-400 border border-cyan-100 dark:border-slate-700">
                            {svc.uptime} Uptime
                          </span>
                          <span className="text-[10px] text-emerald-600 font-semibold">{svc.speed}</span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-[#00a2c7] transition-colors">
                          {svc.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {svc.desc}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{svc.commission}</span>
                        <button
                          onClick={() => {
                            if (svc.id === 'aeps') {
                              setActiveMenu('aeps-cash');
                              setOpenSubmenus(p => ({ ...p, aeps: true }));
                            } else if (svc.id === 'matm') {
                              setActiveMenu('matm-terminal');
                              setOpenSubmenus(p => ({ ...p, matm: true }));
                            } else {
                              showToast(`Launching ${svc.title} terminal switch...`);
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-[#00a8cc] hover:bg-[#0092b3] text-white text-[11px] font-bold transition"
                        >
                          Launch
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 5: API DOCUMENTATION & SANDBOX */}
          {/* ========================================================= */}
          {activeMenu === 'api-docs' && (
            <div className={`rounded-xl border shadow-xs p-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">
                    Developer API Documentation & Integration Hub
                  </h2>
                  <p className="text-xs text-slate-500">
                    Direct REST & Webhook endpoints for DMT, AEPS, BBPS Bharat Connect, and PAN API.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-slate-600 dark:text-slate-300">
                    API Version: v2.4-stable
                  </span>
                </div>
              </div>

              {/* API Credentials Box */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 mb-6 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Your API Credentials (Sandbox / Production)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Client ID</span>
                      <span className="font-mono text-xs font-semibold text-slate-800 dark:text-white">enx_live_99a8b1c4</span>
                    </div>
                    <button 
                      onClick={() => showToast('Client ID copied to clipboard')}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Secret Token</span>
                      <span className="font-mono text-xs font-semibold text-slate-800 dark:text-white">sk_live_••••••••••••••••38f1</span>
                    </div>
                    <button 
                      onClick={() => showToast('Secret token copied')}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* API Endpoints & Code Snippets */}
              <div className="space-y-4">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded font-bold bg-emerald-600 text-white">POST</span>
                      <span className="font-bold text-slate-800 dark:text-white">/api/v2/aeps/auth-biometric</span>
                    </div>
                    <span className="text-xs text-slate-500">Biometric Cash Out Auth</span>
                  </div>
                  <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto">
                    <pre>{`curl -X POST https://api.enexa.in/v2/aeps/auth-biometric \\
  -H "Authorization: Bearer sk_live_99a8b1c4..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "terminal_id": "BC-8891",
    "aadhaar_number": "548199203341",
    "iin": "607152", // State Bank of India
    "amount": 2000,
    "pid_data": "<PidData>...</PidData>"
  }'`}</pre>
                  </div>
                </div>

                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="px-2 py-0.5 rounded font-bold bg-blue-600 text-white">POST</span>
                      <span className="font-bold text-slate-800 dark:text-white">/api/v2/dmt/transfer-imps</span>
                    </div>
                    <span className="text-xs text-slate-500">Instant IMPS Payout</span>
                  </div>
                  <div className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto">
                    <pre>{`curl -X POST https://api.enexa.in/v2/dmt/transfer-imps \\
  -H "Authorization: Bearer sk_live_99a8b1c4..." \\
  -d '{
    "beneficiary_account": "918239019283",
    "beneficiary_ifsc": "SBIN0001234",
    "amount": 5000,
    "client_ref_id": "REF-9921820"
  }'`}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 6: MY COMMISSION & AGENT SETTLEMENTS */}
          {/* ========================================================= */}
          {activeMenu === 'commission' && (
            <div className={`rounded-xl border shadow-xs p-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">
                    My Commission & Agent Settlements
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time commission ledger linked with instant bank settlement.
                  </p>
                </div>
                <button
                  onClick={() => setIsPayoutModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition"
                >
                  Request Payout
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Total Earned</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1">₹ 1,42,850.00</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Pending Settlement</div>
                  <div className="text-xl font-black text-amber-600 mt-1">₹ 38,450.00</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Settled to Bank</div>
                  <div className="text-xl font-black text-emerald-600 mt-1">₹ 1,04,400.00</div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200/70 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#edf2fa] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Service</th>
                      <th className="p-3">Shop / Agent</th>
                      <th className="p-3">Gross Amount</th>
                      <th className="p-3">Commission</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="p-3 font-mono font-semibold">COMM-4910</td>
                      <td className="p-3">Shop SaaS Subscription</td>
                      <td className="p-3">Ramesh Fashion Store (SHP-A4IFYK)</td>
                      <td className="p-3">₹ 4,999.00</td>
                      <td className="p-3 font-bold text-emerald-600">+ ₹ 999.80</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">Processed</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold">COMM-4909</td>
                      <td className="p-3">AEPS Cash Out Payout</td>
                      <td className="p-3">Verma Mobile Point</td>
                      <td className="p-3">₹ 10,000.00</td>
                      <td className="p-3 font-bold text-emerald-600">+ ₹ 18.00</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">Pending</span></td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-semibold">COMM-4908</td>
                      <td className="p-3">BBPS Bharat Connect Utility</td>
                      <td className="p-3">Gupta Kiosk Kendra</td>
                      <td className="p-3">₹ 3,450.00</td>
                      <td className="p-3 font-bold text-emerald-600">+ ₹ 6.50</td>
                      <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">Processed</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 7: DISPUTES & COMPLAINTS */}
          {/* ========================================================= */}
          {activeMenu === 'disputes' && (
            <div className={`rounded-xl border shadow-xs p-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">
                    Dispute & Complaints Management
                  </h2>
                  <p className="text-xs text-slate-500">
                    Handle failed AEPS transactions, NPCI chargebacks, and refund escalations.
                  </p>
                </div>
                <button
                  onClick={() => setIsRaiseDisputeOpen(true)}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-xs transition"
                >
                  + Raise New Dispute
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200/70 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#edf2fa] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Ticket ID</th>
                      <th className="p-3">UTR / Ref</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Service</th>
                      <th className="p-3">Bank</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {disputes.map(d => (
                      <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-[#00a2c7]">{d.id}</td>
                        <td className="p-3 font-mono">{d.utr}</td>
                        <td className="p-3 font-semibold">{d.customer}</td>
                        <td className="p-3">{d.service}</td>
                        <td className="p-3">{d.bank}</td>
                        <td className="p-3 font-bold">{d.amount}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            d.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700' :
                            d.status === 'In Investigation' ? 'bg-amber-50 text-amber-700' :
                            'bg-rose-50 text-rose-700'
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{d.date}</td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => showToast(`Ticket ${d.id} details open for investigation`)}
                            className="text-xs text-cyan-600 font-semibold hover:underline"
                          >
                            Resolve
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 8: QUICK USER / RETAILER MANAGEMENT */}
          {/* ========================================================= */}
          {activeMenu === 'quick-user' && (
            <div className={`rounded-xl border shadow-xs p-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">
                    Quick User / Banking Agent Directory
                  </h2>
                  <p className="text-xs text-slate-500">
                    Manage retailers, distributors, terminal assignments, and wallet balances.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddAgentOpen(true)}
                  className="px-4 py-2 rounded-lg bg-[#00a8cc] hover:bg-[#0092b3] text-white text-xs font-bold shadow-xs transition"
                >
                  + Add New Retailer
                </button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-200/70 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#edf2fa] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase text-[11px]">
                    <tr>
                      <th className="p-3">Agent Code</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Shop Name</th>
                      <th className="p-3">Mobile</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Wallet</th>
                      <th className="p-3">KYC Status</th>
                      <th className="p-3">Assigned Device</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {agents.map(a => (
                      <tr key={a.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold">{a.id}</td>
                        <td className="p-3 font-semibold">{a.name}</td>
                        <td className="p-3">{a.shop}</td>
                        <td className="p-3 font-mono">{a.mobile}</td>
                        <td className="p-3">{a.location}</td>
                        <td className="p-3 font-bold text-emerald-600">₹ {a.wallet.toLocaleString()}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${a.kyc === 'Verified' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {a.kyc}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{a.terminal}</td>
                        <td className="p-3 text-center">
                          <button 
                            onClick={() => showToast(`Wallet top-up initiated for ${a.name}`)}
                            className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold"
                          >
                            + Top-up
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 9: OPERATIONS REPORT */}
          {/* ========================================================= */}
          {activeMenu === 'operations-report' && (
            <div className={`rounded-xl border shadow-xs p-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">
                    Operations & Settlement Audit Report
                  </h2>
                  <p className="text-xs text-slate-500">
                    Daily transaction logs, switch latency, and NPCI audit statements.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => showToast('Report exported as Excel')} className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                    Export XLSX
                  </button>
                  <button onClick={() => showToast('Audit statement PDF generated')} className="px-3 py-1.5 rounded-lg bg-[#00a8cc] text-white text-xs font-bold">
                    Download PDF
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Today's Transactions</span>
                  <div className="text-xl font-black mt-1">1,842 Count</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Gross Volume</span>
                  <div className="text-xl font-black text-emerald-600 mt-1">₹ 28,40,920</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Success Ratio</span>
                  <div className="text-xl font-black text-cyan-600 mt-1">99.42%</div>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Avg NPCI Ping</span>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-1">420 ms</div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 10: ROLE & PERMISSION MATRIX */}
          {/* ========================================================= */}
          {(activeMenu === 'role' || activeMenu === 'roles' || activeMenu === 'permissions') && (
            <div className={`rounded-xl border shadow-xs p-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">
                    Enterprise Role & Permission Management (RBAC)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Define operational roles for Super Admins, Operations Managers, and Support Executives.
                  </p>
                </div>
                <button onClick={() => showToast('Custom role dialog open')} className="px-4 py-2 rounded-lg bg-[#00a8cc] text-white text-xs font-bold">
                  + Add Custom Role
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {['Super Administrator', 'Banking Operations Manager', 'Customer Support Executive'].map((role, idx) => (
                  <div key={role} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-800 dark:text-white">{role}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 dark:bg-slate-700 dark:text-cyan-400">
                        {idx === 0 ? 'Full Access' : idx === 1 ? '14 Permissions' : '6 Permissions'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {idx === 0 ? 'Full root authority over wallets, payouts, API keys and switch routing.' :
                       idx === 1 ? 'Can audit transactions, approve KYC, and handle daily settlements.' :
                       'Can view transactions and register customer disputes.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 11: AEPS SERVICE TERMINAL */}
          {/* ========================================================= */}
          {(activeMenu === 'aeps' || activeMenu === 'aeps-cash' || activeMenu === 'aeps-balance' || activeMenu === 'aeps-statement') && (
            <div className="max-w-4xl space-y-6">
              <div className={`p-6 rounded-xl border shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">
                      AEPS 2.0 Biometric Cash Withdrawal & Balance Station
                    </h2>
                    <p className="text-xs text-slate-500">
                      Connected to NPCI Central Biometric Switch via Aadhaar Data Vault.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Scanner Ready: {aepsDevice}
                    </span>
                  </div>
                </div>

                {/* Sub-tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-800 mb-6">
                  {[
                    { id: 'cash', label: 'Cash Withdrawal' },
                    { id: 'balance', label: 'Balance Enquiry' },
                    { id: 'statement', label: 'Mini Statement' },
                    { id: 'aadhaar-pay', label: 'Aadhaar Pay' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setAepsTab(tab.id)}
                      className={`px-4 py-2 text-xs font-bold border-b-2 transition ${
                        aepsTab === tab.id ? 'border-[#00a2c7] text-[#00a2c7]' : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* AEPS Form */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Customer Aadhaar Number *</label>
                      <input
                        type="text"
                        value={aepsAadhaar}
                        onChange={(e) => setAepsAadhaar(e.target.value)}
                        placeholder="12-digit Aadhaar Number"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Customer Mobile *</label>
                      <input
                        type="text"
                        value={aepsMobile}
                        onChange={(e) => setAepsMobile(e.target.value)}
                        placeholder="10-digit Mobile"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Select Bank *</label>
                      <select
                        value={aepsBank}
                        onChange={(e) => setAepsBank(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-cyan-500"
                      >
                        <option>State Bank of India</option>
                        <option>Punjab National Bank</option>
                        <option>Bank of Baroda</option>
                        <option>Canara Bank</option>
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>Union Bank of India</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold mb-1">Biometric Scanner Device</label>
                      <select
                        value={aepsDevice}
                        onChange={(e) => setAepsDevice(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none focus:border-cyan-500"
                      >
                        <option>Mantra MFS100</option>
                        <option>Morpho MSO1300 E3</option>
                        <option>Startek FM220</option>
                        <option>SecuGen Hamster Pro 20</option>
                      </select>
                    </div>
                  </div>

                  {aepsTab === 'cash' && (
                    <div>
                      <label className="block text-xs font-semibold mb-1">Withdrawal Amount (₹)</label>
                      <input
                        type="number"
                        value={aepsAmount}
                        onChange={(e) => setAepsAmount(e.target.value)}
                        className="w-full px-3 py-2 text-sm font-bold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono outline-none focus:border-cyan-500"
                      />
                      <div className="flex gap-2 mt-2">
                        {['500', '1000', '2000', '3000', '5000', '10000'].map(amt => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setAepsAmount(amt)}
                            className="px-2.5 py-1 text-xs rounded border border-slate-200 dark:border-slate-700 hover:border-cyan-500 font-medium"
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scan Fingerprint CTA Button */}
                  <div className="pt-4">
                    <button
                      onClick={handleAepsScan}
                      disabled={aepsScanning}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#008ba3] via-[#00a8cc] to-[#10b981] hover:opacity-95 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                    >
                      <Fingerprint className={`w-5 h-5 ${aepsScanning ? 'animate-bounce text-amber-200' : ''}`} />
                      <span>{aepsScanning ? 'Scanning Customer Biometric on Device...' : 'Capture Fingerprint & Authorize'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 12: M-ATM (MICRO-ATM) TERMINAL */}
          {/* ========================================================= */}
          {(activeMenu === 'matm' || activeMenu === 'matm-terminal' || activeMenu === 'matm-transactions') && (
            <div className="max-w-4xl space-y-6">
              <div className={`p-6 rounded-xl border shadow-xs ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">
                      Micro-ATM (M-ATM) Terminal Station
                    </h2>
                    <p className="text-xs text-slate-500">
                      EMV Chip & PIN Card reader interface with instant settlement.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Bluetooth POS: Pax D180 Connected (94% Battery)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-3">POS Terminal Status</h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Device Model</span>
                        <span className="font-semibold">Pax D180 Bluetooth</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Serial Number</span>
                        <span className="font-mono font-semibold">#PATM-88190</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Firmware</span>
                        <span className="font-mono">v3.8.1-NPCI-CERT</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Key Injection</span>
                        <span className="text-emerald-600 font-semibold">Master Key Injected</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-2">Simulate Card Withdrawal</h4>
                      <p className="text-xs text-slate-500">
                        Prompt the customer to insert their RuPay / Visa / MasterCard debit card into the terminal.
                      </p>
                    </div>
                    <button 
                      onClick={() => showToast('Card insertion signal sent to Pax D180 terminal...')}
                      className="w-full mt-4 py-2.5 rounded-lg bg-[#00a8cc] hover:bg-[#0092b3] text-white text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Initiate Card Swipe</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 13: DSA SERVICE (LOANS & CARDS) */}
          {/* ========================================================= */}
          {activeMenu === 'dsa' && (
            <div className={`rounded-xl border shadow-xs p-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">
                    Direct Selling Agent (DSA) — Loans & Credit Cards Hub
                  </h2>
                  <p className="text-xs text-slate-500">
                    Lead generation, loan processing, and credit card disbursals with 18+ partner banks.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Payouts up to 2.5% on Disbursals
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Personal Loan</h4>
                  <div className="text-lg font-black mt-1">10.49% ROI</div>
                  <p className="text-[10px] text-slate-400 mt-0.5">HDFC, Axis, Kotak, ICICI</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Business Loan</h4>
                  <div className="text-lg font-black mt-1">Up to ₹ 50 Lakhs</div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Collateral-free for MSMEs</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Home Loan</h4>
                  <div className="text-lg font-black mt-1">8.40% ROI</div>
                  <p className="text-[10px] text-slate-400 mt-0.5">SBI, LIC HFL, PNB Housing</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-500 uppercase">Credit Cards</h4>
                  <div className="text-lg font-black mt-1">₹ 2,200 Payout</div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Per approved credit card</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VIEW 14: PAN CARD SERVICE */}
          {/* ========================================================= */}
          {(activeMenu === 'pan' || activeMenu === 'pan-uti' || activeMenu === 'pan-nsdl') && (
            <div className={`rounded-xl border shadow-xs p-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white font-heading">
                    UTIITSL & NSDL PAN Card Center
                  </h2>
                  <p className="text-xs text-slate-500">
                    Instant biometric e-KYC PAN card application and coupon token wallet.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                    Available Coupons: 42 Tokens
                  </span>
                  <button onClick={() => showToast('Coupon purchase window open')} className="px-3 py-1 rounded bg-[#00a8cc] text-white text-xs font-bold">
                    Buy Coupons
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Instant E-PAN (Paperless Biometric)</h4>
                  <p className="text-xs text-slate-500 mb-4">Aadhaar OTP / Fingerprint authenticated. E-PAN generated within 2 hours.</p>
                  <button onClick={() => showToast('Launching E-PAN application modal...')} className="px-4 py-2 rounded-lg bg-[#00a8cc] text-white text-xs font-bold">
                    Apply E-PAN Card
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-1">Physical PVC PAN Card</h4>
                  <p className="text-xs text-slate-500 mb-4">Printed PVC card delivered to customer home address by Speed Post.</p>
                  <button onClick={() => showToast('Launching Physical PAN portal...')} className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold">
                    Apply Physical PAN
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ========================================================= */}
      {/* 4. MODALS */}
      {/* ========================================================= */}

      {/* MODAL: ADD NEW LEAD DIALOG */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-xl rounded-2xl border shadow-2xl p-6 relative animate-in fade-in zoom-in-95 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-slate-800 text-[#00a8cc] flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white font-heading">
                  Add New Lead
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLeadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Verma"
                    value={newLeadForm.name}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Type
                  </label>
                  <select
                    value={newLeadForm.type}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                  >
                    <option>Retailer</option>
                    <option>Distributor</option>
                    <option>Merchant</option>
                    <option>Customer</option>
                    <option>Agent</option>
                    <option>White Label Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={newLeadForm.priority}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, priority: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                    <option>Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lead Status
                  </label>
                  <select
                    value={newLeadForm.leadStatus}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, leadStatus: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                  >
                    <option>New</option>
                    <option>In Progress</option>
                    <option>Contacted</option>
                    <option>Qualified</option>
                    <option>Converted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Follow-up Type
                  </label>
                  <select
                    value={newLeadForm.followupType}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, followupType: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                  >
                    <option>Phone Call</option>
                    <option>WhatsApp</option>
                    <option>Email</option>
                    <option>Physical Visit</option>
                    <option>Video Demo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.followupDate}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, followupDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter details about this lead inquiry..."
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:border-cyan-500 outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-lg bg-[#00a8cc] hover:bg-[#0092b3] text-white shadow-xs"
                >
                  Add Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LEAD DETAILS & STATUS UPDATE */}
      {selectedLeadDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 relative animate-in fade-in zoom-in-95 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
                  {selectedLeadDetails.id}
                </span>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  {selectedLeadDetails.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLeadDetails(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Phone Number</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{selectedLeadDetails.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Email</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{selectedLeadDetails.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Lead Type</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{selectedLeadDetails.type}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{selectedLeadDetails.location || 'N/A'}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-[10px] uppercase font-bold mb-1">
                  Update Lead Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {['New', 'In Progress', 'Contacted', 'Qualified', 'Converted'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => {
                        setLeads(leads.map(l => l.id === selectedLeadDetails.id ? { ...l, leadStatus: st } : l));
                        setSelectedLeadDetails({ ...selectedLeadDetails, leadStatus: st });
                        showToast(`Lead status updated to ${st}`);
                      }}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition border ${
                        selectedLeadDetails.leadStatus === st
                          ? 'bg-[#00a8cc] border-[#00a8cc] text-white shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold mb-1">Notes & Details</span>
                <p className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  {selectedLeadDetails.notes || 'No notes entered.'}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setLeads(leads.filter(l => l.id !== selectedLeadDetails.id));
                  setSelectedLeadDetails(null);
                  showToast('Lead deleted successfully');
                }}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Lead</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedLeadDetails(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-white text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: AEPS RECEIPT SLIP */}
      {aepsReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white text-slate-800 p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-2">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900">Enexa Banking Switch</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">NPCI Bharat Connect AEPS 2.0</p>
            </div>

            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Status:</span>
                <span className="font-bold text-emerald-600">SUCCESS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">RRN Number:</span>
                <span className="font-mono font-bold text-slate-800">{aepsReceipt.rrn}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank:</span>
                <span className="font-semibold">{aepsReceipt.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Aadhaar (Masked):</span>
                <span className="font-mono">{aepsReceipt.aadhaarMasked}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction Type:</span>
                <span className="font-semibold">{aepsReceipt.type}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-bold text-slate-700">Amount:</span>
                <span className="font-black text-slate-900">₹ {Number(aepsReceipt.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Account Balance:</span>
                <span className="font-bold text-emerald-700">{aepsReceipt.balanceRemaining}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-dashed border-slate-300 flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-lg border border-slate-300 text-xs font-bold hover:bg-slate-50 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => setAepsReceipt(null)}
                className="flex-1 py-2 rounded-lg bg-[#00a8cc] hover:bg-[#0092b3] text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REQUEST PAYOUT */}
      {isPayoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl relative animate-in fade-in zoom-in-95 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold">Instant Commission Settlement to Bank</h3>
              <button onClick={() => setIsPayoutModalOpen(false)} className="p-1 rounded-lg text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-800 dark:text-emerald-300">
                <span className="font-bold block">Available Wallet Balance: ₹ 38,450.00</span>
                <span>Payout will be credited via IMPS within 60 seconds.</span>
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Enter Amount to Settle (₹)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Settlement Bank Account</label>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                  <p className="font-bold">State Bank of India — A/c 389201928301</p>
                  <p className="text-[10px] text-slate-400 font-mono">IFSC: SBIN0001234 &bull; ENEXA IT SOLUTIONS</p>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button onClick={() => setIsPayoutModalOpen(false)} className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                Cancel
              </button>
              <button 
                onClick={() => {
                  setIsPayoutModalOpen(false);
                  showToast(`Payout request of ₹ ${Number(payoutAmount).toLocaleString()} processed successfully!`);
                }}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD AGENT */}
      {isAddAgentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl relative ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold">Onboard New Retailer / Agent</h3>
              <button onClick={() => setIsAddAgentOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAgent} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Agent Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Sharma"
                  value={newAgentForm.name}
                  onChange={(e) => setNewAgentForm({ ...newAgentForm, name: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Shop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Digital Seva"
                  value={newAgentForm.shop}
                  onChange={(e) => setNewAgentForm({ ...newAgentForm, shop: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Mobile Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98765 00000"
                  value={newAgentForm.mobile}
                  onChange={(e) => setNewAgentForm({ ...newAgentForm, mobile: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">City / District</label>
                <input
                  type="text"
                  placeholder="e.g. Varanasi, UP"
                  value={newAgentForm.location}
                  onChange={(e) => setNewAgentForm({ ...newAgentForm, location: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddAgentOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-[#00a8cc] text-white rounded-lg font-bold">Onboard Agent</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RAISE DISPUTE */}
      {isRaiseDisputeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className={`w-full max-w-md rounded-2xl p-6 border shadow-2xl relative ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <h3 className="text-base font-bold">Register Failed Transaction Dispute</h3>
              <button onClick={() => setIsRaiseDisputeOpen(false)} className="p-1 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRaiseDispute} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Transaction UTR / RRN *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UTR998244199"
                  value={newDisputeForm.utr}
                  onChange={(e) => setNewDisputeForm({ ...newDisputeForm, utr: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sunil Kumar"
                  value={newDisputeForm.customer}
                  onChange={(e) => setNewDisputeForm({ ...newDisputeForm, customer: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Amount (₹) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5000"
                  value={newDisputeForm.amount}
                  onChange={(e) => setNewDisputeForm({ ...newDisputeForm, amount: `₹ ${e.target.value}` })}
                  className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 outline-none"
                />
              </div>
              <div className="pt-3 flex justify-end gap-2">
                <button type="button" onClick={() => setIsRaiseDisputeOpen(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-rose-600 text-white rounded-lg font-bold">Submit Dispute</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Mount to DOM
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<BankingPanel />);
}

import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  TrendingUp,
  Search,
  Filter,
  CheckCircle,
  FileText,
  AlertCircle,
  X,
  Plus,
  ArrowRight,
  MessageSquare,
  Building,
  DollarSign,
  ChevronRight,
  PhoneCall
} from 'lucide-react';

export const LEAD_SOURCES = [
  'Website Inquiry',
  'Walk-in Store',
  'Phone Call',
  'WhatsApp',
  'Referral',
  'Trade Expo / Exhibition',
  'Social Media (Instagram/FB)'
];

export const LEAD_STATUSES = [
  { label: 'New Lead', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { label: 'Contacted', color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  { label: 'Follow-up Scheduled', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800' },
  { label: 'Proposal Sent', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' },
  { label: 'Won / Converted', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  { label: 'Lost', color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800' }
];

export default function LeadsManager() {
  const navigate = useNavigate();
  const { leads, addLead, updateLead, deleteLead, addLeadFollowUp } = useErp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLeadForFollowUp, setSelectedLeadForFollowUp] = useState(null);
  const [viewHistoryLead, setViewHistoryLead] = useState(null);

  // Form State for New Lead
  const [newLeadForm, setNewLeadForm] = useState({
    clientName: '',
    contactPerson: '',
    phone: '',
    email: '',
    city: 'Jaipur, RJ',
    source: 'Website Inquiry',
    status: 'New Lead',
    expectedValue: '',
    notes: '',
    nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    nextFollowUpTime: '11:00'
  });

  // Follow-up Form
  const [followUpForm, setFollowUpForm] = useState({
    remarks: '',
    nextAction: '',
    status: 'Follow-up Scheduled',
    nextFollowUpDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    nextFollowUpTime: '14:00',
    recordedBy: 'Store Manager'
  });

  // KPI Metrics
  const totalLeadsCount = leads.length;
  const convertedLeadsCount = leads.filter((l) => l.status === 'Won / Converted').length;
  const activePipelineValue = leads
    .filter((l) => l.status !== 'Lost' && l.status !== 'Won / Converted')
    .reduce((acc, l) => acc + (parseFloat(l.expectedValue) || 0), 0);
  const pendingFollowUpsToday = leads.filter((l) => {
    const today = new Date().toISOString().split('T')[0];
    return l.nextFollowUpDate === today && l.status !== 'Won / Converted' && l.status !== 'Lost';
  }).length;

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      (lead.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.contactPerson || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.phone || '').includes(searchTerm) ||
      (lead.id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'ALL' || lead.source === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  const handleCreateLead = (e) => {
    e.preventDefault();
    if (!newLeadForm.clientName || !newLeadForm.phone) {
      alert('Please enter Client Name and Phone number');
      return;
    }

    addLead({
      ...newLeadForm,
      expectedValue: parseFloat(newLeadForm.expectedValue || 0)
    });

    setIsAddModalOpen(false);
    setNewLeadForm({
      clientName: '',
      contactPerson: '',
      phone: '',
      email: '',
      city: 'Jaipur, RJ',
      source: 'Website Inquiry',
      status: 'New Lead',
      expectedValue: '',
      notes: '',
      nextFollowUpDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      nextFollowUpTime: '11:00'
    });
  };

  const handleSaveFollowUp = (e) => {
    e.preventDefault();
    if (!selectedLeadForFollowUp) return;

    addLeadFollowUp(selectedLeadForFollowUp.id, followUpForm);
    setSelectedLeadForFollowUp(null);
    setFollowUpForm({
      remarks: '',
      nextAction: '',
      status: 'Follow-up Scheduled',
      nextFollowUpDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      nextFollowUpTime: '14:00',
      recordedBy: 'Store Manager'
    });
  };

  const getStatusBadge = (statusName) => {
    const found = LEAD_STATUSES.find((s) => s.label === statusName);
    const colorClass = found ? found.color : 'bg-slate-100 text-slate-800 border-slate-200';
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClass}`}>
        {statusName}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Users className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              CRM Leads & Follow-up Desk
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate retail & bulk inquiries, schedule client follow-up calls, and convert leads into Quotations & Sales.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/shop-admin/crm/quotations')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-slate-300 dark:border-slate-700"
          >
            <FileText className="w-4 h-4 text-indigo-500" />
            View Quotations Desk
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/25 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            + Generate New Lead
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Leads Inquired</span>
            <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalLeadsCount}</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">All retail & corporate inquiries</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Follow-ups Due Today</span>
            <span className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{pendingFollowUpsToday}</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">Scheduled for priority call</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Pipeline Value</span>
            <span className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ₹{activePipelineValue.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 font-medium">Estimated potential turnover</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Won & Converted</span>
            <span className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{convertedLeadsCount}</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Successfully converted to sales</p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by client, contact person, phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            >
              <option value="ALL">All Statuses</option>
              {LEAD_STATUSES.map((s) => (
                <option key={s.label} value={s.label}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          >
            <option value="ALL">All Inquiry Sources</option>
            {LEAD_SOURCES.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Lead ID & Client</th>
                <th className="py-3.5 px-4">Contact Details</th>
                <th className="py-3.5 px-4">Inquiry Source</th>
                <th className="py-3.5 px-4">Est. Value (₹)</th>
                <th className="py-3.5 px-4">Current Status</th>
                <th className="py-3.5 px-4">Next Follow-up</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No leads found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                          {lead.id}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{lead.clientName}</p>
                          {lead.contactPerson && (
                            <p className="text-xs text-slate-500 dark:text-slate-400">Attn: {lead.contactPerson}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-mono">{lead.phone}</span>
                        </div>
                        {lead.email && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{lead.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                        {lead.source || 'Direct'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      ₹{parseFloat(lead.expectedValue || 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(lead.status)}</td>

                    <td className="py-3.5 px-4">
                      {lead.nextFollowUpDate ? (
                        <div className="text-xs">
                          <div className="flex items-center gap-1 text-slate-800 dark:text-slate-200 font-medium">
                            <Calendar className="w-3 h-3 text-indigo-500" />
                            <span>{lead.nextFollowUpDate}</span>
                            {lead.nextFollowUpTime && (
                              <span className="text-slate-400">@{lead.nextFollowUpTime}</span>
                            )}
                          </div>
                          {lead.followUps && lead.followUps.length > 0 && (
                            <button
                              onClick={() => setViewHistoryLead(lead)}
                              className="text-[11px] text-indigo-600 hover:underline dark:text-indigo-400 mt-0.5 block"
                            >
                              {lead.followUps.length} follow-up logs
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Not scheduled</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Quick Follow-up button */}
                        <button
                          onClick={() => {
                            setSelectedLeadForFollowUp(lead);
                            setFollowUpForm((prev) => ({
                              ...prev,
                              status: lead.status
                            }));
                          }}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
                          title="Record Follow-up Call"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          Follow-up
                        </button>

                        {/* Create Quotation from this lead */}
                        <button
                          onClick={() => {
                            navigate('/shop-admin/crm/quotations', {
                              state: {
                                fromLead: {
                                  leadId: lead.id,
                                  customerName: lead.clientName,
                                  contactPerson: lead.contactPerson,
                                  phone: lead.phone,
                                  email: lead.email,
                                  city: lead.city,
                                  notes: lead.notes
                                }
                              }
                            });
                          }}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                          title="Generate Quotation"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          + Quote
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Lead */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create New Business Lead</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Client / Company / Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.clientName}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, clientName: e.target.value })}
                    placeholder="e.g. Apex Infotech Ltd or Ramesh Kumar"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person Name
                  </label>
                  <input
                    type="text"
                    value={newLeadForm.contactPerson}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, contactPerson: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    placeholder="e.g. 9829011223"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newLeadForm.email}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    placeholder="e.g. purchase@company.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Inquiry Source
                  </label>
                  <select
                    value={newLeadForm.source}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  >
                    {LEAD_SOURCES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newLeadForm.status}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  >
                    {LEAD_STATUSES.map((st) => (
                      <option key={st.label} value={st.label}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expected Deal Value (₹)
                  </label>
                  <input
                    type="number"
                    value={newLeadForm.expectedValue}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, expectedValue: e.target.value })}
                    placeholder="e.g. 50000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={newLeadForm.nextFollowUpDate}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, nextFollowUpDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Follow-up Time
                  </label>
                  <input
                    type="time"
                    value={newLeadForm.nextFollowUpTime}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, nextFollowUpTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Lead Requirement & Notes
                </label>
                <textarea
                  rows={3}
                  value={newLeadForm.notes}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  placeholder="e.g. Inquired about bulk purchase of 100 shirts with custom embroidery logo for company delegates..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20"
                >
                  Save & Register Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Record Follow-Up */}
      {selectedLeadForFollowUp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Record Follow-up Call</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Client: <strong className="text-slate-800 dark:text-slate-200">{selectedLeadForFollowUp.clientName}</strong> ({selectedLeadForFollowUp.phone})
                </p>
              </div>
              <button
                onClick={() => setSelectedLeadForFollowUp(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFollowUp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Call / Meeting Remarks & Feedback *
                </label>
                <textarea
                  required
                  rows={3}
                  value={followUpForm.remarks}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, remarks: e.target.value })}
                  placeholder="e.g. Discussed quotation terms with client. They liked the fabric samples and requested 5% extra discount..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Next Planned Action
                </label>
                <input
                  type="text"
                  value={followUpForm.nextAction}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, nextAction: e.target.value })}
                  placeholder="e.g. Send revised formal quotation & payment terms"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Update Lead Status
                  </label>
                  <select
                    value={followUpForm.status}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  >
                    {LEAD_STATUSES.map((st) => (
                      <option key={st.label} value={st.label}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    value={followUpForm.nextFollowUpDate}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, nextFollowUpDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={followUpForm.nextFollowUpTime}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, nextFollowUpTime: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedLeadForFollowUp(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-amber-500/20"
                >
                  Save Follow-up Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Follow-Up History Timeline */}
      {viewHistoryLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Follow-up Communication Timeline</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Client: <strong className="text-slate-800 dark:text-slate-200">{viewHistoryLead.clientName}</strong> ({viewHistoryLead.id})
                </p>
              </div>
              <button
                onClick={() => setViewHistoryLead(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
              {(!viewHistoryLead.followUps || viewHistoryLead.followUps.length === 0) ? (
                <p className="text-sm text-slate-400 text-center py-6">No previous follow-up records found.</p>
              ) : (
                viewHistoryLead.followUps.map((log, idx) => (
                  <div key={log.id || idx} className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-500" />
                        {log.date}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Logged by: {log.recordedBy || 'Manager'}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      "{log.remarks}"
                    </p>
                    {log.nextAction && (
                      <p className="text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold">
                        <ArrowRight className="w-3 h-3" />
                        Next Action: {log.nextAction}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setViewHistoryLead(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

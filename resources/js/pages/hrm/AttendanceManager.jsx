import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  Clock,
  UserCheck,
  UserX,
  Users,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Check,
  X,
  FileText,
  CalendarCheck,
  ChevronRight
} from 'lucide-react';

export default function AttendanceManager() {
  const navigate = useNavigate();
  const { employees, attendance, markAttendance, bulkMarkAttendance, leaves, applyLeave, updateLeaveStatus } = useErp();

  const [activeTab, setActiveTab] = useState('attendance'); // 'attendance' | 'leaves'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Leave Form Modal
  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    employeeId: employees[0]?.id || '',
    leaveType: 'Casual Leave',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    days: 1,
    reason: ''
  });

  // Calculate today's stats
  const totalStaff = employees.length;
  const attendanceForSelectedDate = attendance.filter((a) => a.date === selectedDate);
  const presentCount = attendanceForSelectedDate.filter((a) => a.status === 'Present').length;
  const halfDayCount = attendanceForSelectedDate.filter((a) => a.status === 'Half Day').length;
  const leaveCount = attendanceForSelectedDate.filter((a) => a.status === 'Paid Leave').length;
  const absentCount = attendanceForSelectedDate.filter((a) => a.status === 'Absent').length;
  const unmarkedCount = Math.max(0, totalStaff - attendanceForSelectedDate.length);

  // Quick Mark All Present
  const handleMarkAllPresent = () => {
    const records = employees.map((emp) => ({
      id: `ATT-${emp.id}-${selectedDate}`,
      date: selectedDate,
      employeeId: emp.id,
      employeeName: emp.name,
      status: 'Present',
      inTime: '09:30 AM',
      outTime: '07:30 PM',
      shift: 'General Store Shift',
      notes: 'Auto marked all present'
    }));
    bulkMarkAttendance(records);
  };

  // Mark single employee
  const handleSetStatus = (emp, status) => {
    markAttendance({
      id: `ATT-${emp.id}-${selectedDate}`,
      date: selectedDate,
      employeeId: emp.id,
      employeeName: emp.name,
      status,
      inTime: status === 'Present' || status === 'Half Day' ? '09:30 AM' : '-',
      outTime: status === 'Present' ? '07:30 PM' : (status === 'Half Day' ? '02:00 PM' : '-'),
      shift: 'General Store Shift',
      notes: `Marked as ${status}`
    });
  };

  // Submit Leave
  const handleApplyLeaveSubmit = (e) => {
    e.preventDefault();
    const emp = employees.find((e) => e.id === leaveForm.employeeId);
    if (!emp) return;

    applyLeave({
      ...leaveForm,
      employeeName: emp.name,
      days: parseInt(leaveForm.days) || 1
    });

    setIsApplyLeaveModalOpen(false);
    setLeaveForm({
      employeeId: employees[0]?.id || '',
      leaveType: 'Casual Leave',
      fromDate: new Date().toISOString().split('T')[0],
      toDate: new Date().toISOString().split('T')[0],
      days: 1,
      reason: ''
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <CalendarCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              HRM — Attendance & Leaves Management
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Daily staff punch register, shift timings, leave applications, and holiday approvals.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsApplyLeaveModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-amber-500/25 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Apply Staff Leave
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'attendance'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          Daily Attendance Sheet
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'leaves'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          Leave Requests & Approvals ({leaves.length})
        </button>
      </div>

      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Date Picker & Quick Actions Bar */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Attendance Date:
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleMarkAllPresent}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-600" />
                Mark All Present Today
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <span className="text-xs text-slate-500">Total Staff</span>
              <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{totalStaff}</p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Present</span>
              <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{presentCount}</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/40 p-4 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
              <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Half Day</span>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1">{halfDayCount}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
              <span className="text-xs text-blue-700 dark:text-blue-400 font-semibold">Paid Leave</span>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-1">{leaveCount}</p>
            </div>
            <div className="bg-rose-50 dark:bg-rose-950/40 p-4 rounded-xl border border-rose-200 dark:border-rose-800 text-center">
              <span className="text-xs text-rose-700 dark:text-rose-400 font-semibold">Absent</span>
              <p className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-1">{absentCount}</p>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Staff Member</th>
                    <th className="py-3.5 px-4">Department & Role</th>
                    <th className="py-3.5 px-4">Punch Status</th>
                    <th className="py-3.5 px-4">Shift In / Out</th>
                    <th className="py-3.5 px-4 text-right">Quick Mark Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  {employees.map((emp) => {
                    const record = attendanceForSelectedDate.find((a) => a.employeeId === emp.id);
                    const currentStatus = record ? record.status : 'Unmarked';

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{emp.name}</p>
                            <span className="font-mono text-xs text-slate-400">{emp.id}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{emp.designation}</p>
                          <span className="text-[11px] text-slate-500">{emp.department}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : currentStatus === 'Half Day'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : currentStatus === 'Paid Leave'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                : currentStatus === 'Absent'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {currentStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-xs font-mono text-slate-600 dark:text-slate-300">
                          {record ? `${record.inTime} - ${record.outTime}` : 'Pending punch'}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSetStatus(emp, 'Present')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                currentStatus === 'Present'
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 dark:bg-slate-800'
                              }`}
                            >
                              Present
                            </button>

                            <button
                              onClick={() => handleSetStatus(emp, 'Half Day')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                currentStatus === 'Half Day'
                                  ? 'bg-amber-600 text-white'
                                  : 'bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-700 dark:bg-slate-800'
                              }`}
                            >
                              Half Day
                            </button>

                            <button
                              onClick={() => handleSetStatus(emp, 'Paid Leave')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                currentStatus === 'Paid Leave'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 dark:bg-slate-800'
                              }`}
                            >
                              Leave
                            </button>

                            <button
                              onClick={() => handleSetStatus(emp, 'Absent')}
                              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                                currentStatus === 'Absent'
                                  ? 'bg-rose-600 text-white'
                                  : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 dark:bg-slate-800'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Leaves Tab */}
      {activeTab === 'leaves' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Leave Type</th>
                  <th className="py-3.5 px-4">Duration & Dates</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Approval Status</th>
                  <th className="py-3.5 px-4 text-right">Approve / Reject</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No leave requests recorded.
                    </td>
                  </tr>
                ) : (
                  leaves.map((lv) => (
                    <tr key={lv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">{lv.employeeName}</p>
                        <span className="font-mono text-xs text-slate-400">{lv.employeeId}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {lv.leaveType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs font-medium text-slate-800 dark:text-slate-200">
                        {lv.fromDate} to {lv.toDate} ({lv.days} day{lv.days > 1 ? 's' : ''})
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        "{lv.reason || 'Personal work'}"
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            lv.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : lv.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {lv.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {lv.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => updateLeaveStatus(lv.id, 'Approved')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateLeaveStatus(lv.id, 'Rejected')}
                              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Apply Leave */}
      {isApplyLeaveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Apply Leave for Staff Member</h3>
              <button
                onClick={() => setIsApplyLeaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeaveSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Staff Employee
                </label>
                <select
                  value={leaveForm.employeeId}
                  onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Leave Type
                </label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                >
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Sick Leave">Sick Leave (Medical)</option>
                  <option value="Earned Leave">Earned Leave (Annual)</option>
                  <option value="Emergency Leave">Emergency Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    From Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.fromDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, fromDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    To Date
                  </label>
                  <input
                    type="date"
                    required
                    value={leaveForm.toDate}
                    onChange={(e) => setLeaveForm({ ...leaveForm, toDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Days Count
                </label>
                <input
                  type="number"
                  min="1"
                  value={leaveForm.days}
                  onChange={(e) => setLeaveForm({ ...leaveForm, days: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reason / Purpose
                </label>
                <textarea
                  rows={2}
                  required
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  placeholder="e.g. Attending sister's wedding ceremony in Jaipur..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsApplyLeaveModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-amber-500/20"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

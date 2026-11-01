import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  Calendar,
  CheckCircle,
  Clock,
  Printer,
  X,
  CreditCard,
  Building,
  Check,
  Search,
  Filter,
  FileText,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function PayrollManager() {
  const navigate = useNavigate();
  const { employees, payroll, processSalaryPayment, hasPermission } = useErp();

  const [selectedMonth, setSelectedMonth] = useState('October');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Modals
  const [payModalEmployee, setPayModalEmployee] = useState(null);
  const [viewPayslipModal, setViewPayslipModal] = useState(null);

  // Pay Form
  const [payForm, setPayForm] = useState({
    bonus: 0,
    deductions: 0,
    paymentMode: 'Bank Transfer (NEFT)',
    refNumber: '',
    notes: ''
  });

  // Calculate stats for selected month
  const totalEmployeesCount = employees.length;

  const paidRecordsThisMonth = payroll.filter(
    (p) => p.month === selectedMonth && p.year === selectedYear && p.status === 'Paid'
  );

  const totalPaidAmount = paidRecordsThisMonth.reduce((acc, p) => acc + (parseFloat(p.netSalary || p.paidAmount) || 0), 0);
  const totalWorkforcePayroll = employees.reduce((acc, e) => acc + (parseFloat(e.netSalary) || 0), 0);
  const pendingPayoutsAmount = Math.max(0, totalWorkforcePayroll - totalPaidAmount);

  // Open Pay Modal
  const handleOpenPayModal = (emp) => {
    setPayModalEmployee(emp);
    setPayForm({
      bonus: 0,
      deductions: (parseFloat(emp.pfDeduction) || 0) + (parseFloat(emp.esiDeduction) || 0),
      paymentMode: 'Bank Transfer (NEFT)',
      refNumber: `NEFT-SAL-${emp.id}-${selectedMonth.slice(0, 3).toUpperCase()}`,
      notes: `Salary for ${selectedMonth} ${selectedYear}`
    });
  };

  // Submit Salary Payment
  const handleConfirmSalaryPayment = (e) => {
    e.preventDefault();
    if (!payModalEmployee) return;

    const base = parseFloat(payModalEmployee.basicSalary) || 0;
    const hra = parseFloat(payModalEmployee.hra) || 0;
    const allowances = parseFloat(payModalEmployee.allowances) || 0;
    const bonus = parseFloat(payForm.bonus) || 0;
    const deductions = parseFloat(payForm.deductions) || 0;
    const netSalary = Math.max(0, base + hra + allowances + bonus - deductions);

    processSalaryPayment({
      employeeId: payModalEmployee.id,
      employeeName: payModalEmployee.name,
      month: selectedMonth,
      year: selectedYear,
      basicSalary: base,
      hra,
      allowances,
      bonus,
      deductions,
      netSalary,
      paidAmount: netSalary,
      paymentMode: payForm.paymentMode,
      refNumber: payForm.refNumber || `SAL-${Date.now().toString().slice(-6)}`,
      notes: payForm.notes
    });

    setPayModalEmployee(null);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <IndianRupee className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              HRM — Payroll Processing & Salary Payouts
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Compute monthly employee wages, process bank payouts with UTR references, generate payslips, and auto-log to company expenses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/shop-admin/expenses')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-slate-300 dark:border-slate-700"
          >
            <CreditCard className="w-4 h-4 text-violet-500" />
            View Expense Ledger
          </button>
        </div>
      </div>

      {/* Month & Year Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Payroll Cycle:
          </span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold dark:text-white"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold dark:text-white"
          >
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Showing payroll for <strong>{selectedMonth} {selectedYear}</strong>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Month Wage Bill</span>
            <span className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl">
              <Building className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ₹{totalWorkforcePayroll.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">Across all {totalEmployeesCount} onboarded employees</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Salaries Disbursed</span>
            <span className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
            ₹{totalPaidAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
            {paidRecordsThisMonth.length} of {totalEmployeesCount} salaries paid
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Wage Payouts</span>
            <span className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            ₹{pendingPayoutsAmount.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium">
            {totalEmployeesCount - paidRecordsThisMonth.length} pending payouts
          </p>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Role & Dept</th>
                <th className="py-3.5 px-4">Earnings (Basic + Allowances)</th>
                <th className="py-3.5 px-4">Deductions</th>
                <th className="py-3.5 px-4">Net Monthly Payable</th>
                <th className="py-3.5 px-4">Payout Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {employees.map((emp) => {
                const existingPaid = payroll.find(
                  (p) => p.employeeId === emp.id && p.month === selectedMonth && p.year === selectedYear && p.status === 'Paid'
                );

                const isPaid = !!existingPaid;
                const netPayable = existingPaid
                  ? parseFloat(existingPaid.netSalary || existingPaid.paidAmount)
                  : parseFloat(emp.netSalary || 0);

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

                    <td className="py-3.5 px-4 text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        ₹{((parseFloat(emp.basicSalary) || 0) + (parseFloat(emp.hra) || 0) + (parseFloat(emp.allowances) || 0)).toLocaleString('en-IN')}
                      </span>
                      <p className="text-[10px] text-slate-400">
                        Basic ₹{emp.basicSalary} + HRA ₹{emp.hra || 0}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-xs font-semibold text-rose-600 dark:text-rose-400">
                      -₹{((parseFloat(emp.pfDeduction) || 0) + (parseFloat(emp.esiDeduction) || 0)).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        ₹{netPayable.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Paid on {existingPaid.paidDate || 'Auto'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Pending Payout
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isPaid ? (
                        hasPermission('hrm.print_payslip') ? (
                          <button
                            onClick={() => setViewPayslipModal({ emp, payRecord: existingPaid })}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 ml-auto border border-slate-300 dark:border-slate-700"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            Payslip
                          </button>
                        ) : null
                      ) : (
                        hasPermission('hrm.salary_pay') ? (
                          <button
                            onClick={() => handleOpenPayModal(emp)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-1.5 ml-auto"
                          >
                            <IndianRupee className="w-3.5 h-3.5" />
                            Pay Salary
                          </button>
                        ) : null
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Process Salary Payment */}
      {payModalEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Process Salary Payout</h3>
                <p className="text-xs text-slate-500">
                  Employee: <strong className="text-slate-800 dark:text-slate-200">{payModalEmployee.name}</strong> ({payModalEmployee.id})
                </p>
              </div>
              <button
                onClick={() => setPayModalEmployee(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSalaryPayment} className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-emerald-800 dark:text-emerald-300 font-bold">Month & Year:</span>
                  <p className="text-sm font-extrabold text-emerald-950 dark:text-emerald-200">
                    {selectedMonth} {selectedYear}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-emerald-800 dark:text-emerald-300 font-bold">Target Net Salary:</span>
                  <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                    ₹{parseFloat(payModalEmployee.netSalary || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sales Bonus / Incentive (₹)
                  </label>
                  <input
                    type="number"
                    value={payForm.bonus}
                    onChange={(e) => setPayForm({ ...payForm, bonus: parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Deductions (PF / ESI) (₹)
                  </label>
                  <input
                    type="number"
                    value={payForm.deductions}
                    onChange={(e) => setPayForm({ ...payForm, deductions: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Mode
                </label>
                <select
                  value={payForm.paymentMode}
                  onChange={(e) => setPayForm({ ...payForm, paymentMode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                >
                  <option value="Bank Transfer (NEFT)">Bank Transfer (NEFT / RTGS)</option>
                  <option value="PhonePe / UPI">PhonePe / UPI</option>
                  <option value="Cash">Cash Voucher</option>
                  <option value="Cheque">Bank Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction UTR / Reference No *
                </label>
                <input
                  type="text"
                  required
                  value={payForm.refNumber}
                  onChange={(e) => setPayForm({ ...payForm, refNumber: e.target.value })}
                  placeholder="e.g. NEFT-HDFC-991823-SAL"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono dark:text-white"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-xs text-amber-900 dark:text-amber-300">
                ⚡ <strong>Auto-Ledger Note:</strong> Paying this salary will automatically create an entry in the <strong>Company Expenses</strong> module under category <em>"Staff Salary & Wages"</em> and update P&L statements.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setPayModalEmployee(null)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Disburse & Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View / Print Pay Slip */}
      {viewPayslipModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Staff Salary Payslip</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  onClick={() => setViewPayslipModal(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Payslip Sheet */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4 text-xs">
              <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-3">
                <h2 className="text-base font-black text-slate-900 dark:text-white tracking-wide">
                  RAMESH FASHION ERP
                </h2>
                <p className="text-[11px] text-slate-500">Showroom #42, M.I. Road, Jaipur, Rajasthan - 302001</p>
                <p className="text-xs font-bold text-emerald-600 mt-1 uppercase">
                  PAYSLIP FOR {viewPayslipModal.payRecord.month.toUpperCase()} {viewPayslipModal.payRecord.year}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <p className="text-slate-500">Employee Name:</p>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{viewPayslipModal.emp.name}</p>
                  <p className="font-mono text-slate-400">ID: {viewPayslipModal.emp.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Designation / Role:</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{viewPayslipModal.emp.designation}</p>
                  <p className="text-slate-400">{viewPayslipModal.emp.department}</p>
                </div>
              </div>

              {/* Earnings vs Deductions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 border-r border-slate-200 dark:border-slate-700 pr-3">
                  <p className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px]">Earnings (₹)</p>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Basic Salary:</span>
                    <span className="font-medium">₹{viewPayslipModal.emp.basicSalary}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">HRA Allowance:</span>
                    <span className="font-medium">₹{viewPayslipModal.emp.hra || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Special Allowances:</span>
                    <span className="font-medium">₹{viewPayslipModal.emp.allowances || 0}</span>
                  </div>
                  {viewPayslipModal.payRecord.bonus > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Performance Bonus:</span>
                      <span>+₹{viewPayslipModal.payRecord.bonus}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 pl-1">
                  <p className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[10px]">Deductions (₹)</p>
                  <div className="flex justify-between text-rose-600">
                    <span>Provident Fund (PF):</span>
                    <span>-₹{viewPayslipModal.emp.pfDeduction || 0}</span>
                  </div>
                  <div className="flex justify-between text-rose-600">
                    <span>ESI / Health:</span>
                    <span>-₹{viewPayslipModal.emp.esiDeduction || 0}</span>
                  </div>
                </div>
              </div>

              {/* Net Salary Row */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-bold bg-white dark:bg-slate-800 p-3 rounded-lg">
                <span>Net Salary Disbursed:</span>
                <span className="text-base text-emerald-600 dark:text-emerald-400">
                  ₹{parseFloat(viewPayslipModal.payRecord.netSalary || viewPayslipModal.payRecord.paidAmount).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="text-[11px] text-slate-500 space-y-0.5">
                <p>Payment Mode: <strong>{viewPayslipModal.payRecord.paymentMode}</strong></p>
                <p className="font-mono">Transaction Ref: {viewPayslipModal.payRecord.refNumber}</p>
                <p>Disbursed on: {viewPayslipModal.payRecord.paidDate}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewPayslipModal(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold"
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

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
  Building,
  CreditCard,
  Search,
  Filter,
  CheckCircle,
  X,
  Edit2,
  Trash2,
  DollarSign,
  ShieldCheck,
  Briefcase,
  IndianRupee,
  Clock
} from 'lucide-react';

export const DEPARTMENTS = [
  'Operations',
  'Sales & Retail',
  'Accounts & Billing',
  'Inventory & Warehouse',
  'Production & Alterations',
  'Management'
];

export default function EmployeesManager() {
  const navigate = useNavigate();
  const { employees, addEmployee, updateEmployee, deleteEmployee, roles, hasPermission } = useErp();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewEmployeeModal, setViewEmployeeModal] = useState(null);

  // Form State
  const [empForm, setEmpForm] = useState({
    name: '',
    designation: '',
    department: 'Sales & Retail',
    roleId: 'role-cashier',
    phone: '',
    email: '',
    joiningDate: new Date().toISOString().split('T')[0],
    basicSalary: '',
    hra: '',
    allowances: '',
    pfDeduction: '',
    esiDeduction: '',
    status: 'Active',
    bankName: 'HDFC Bank',
    accountNo: '',
    ifsc: '',
    panNo: '',
    aadhaarNo: '',
    address: 'Jaipur, RJ'
  });

  // Calculate Net Salary from components
  const computeNetSalary = (form) => {
    const basic = parseFloat(form.basicSalary) || 0;
    const hra = parseFloat(form.hra) || 0;
    const allowances = parseFloat(form.allowances) || 0;
    const pf = parseFloat(form.pfDeduction) || 0;
    const esi = parseFloat(form.esiDeduction) || 0;
    const gross = basic + hra + allowances;
    const deductions = pf + esi;
    return Math.max(0, gross - deductions);
  };

  // KPIs
  const totalEmployeesCount = employees.length;
  const activeEmployeesCount = employees.filter((e) => e.status === 'Active').length;
  const totalMonthlyPayroll = employees.reduce((acc, e) => acc + (parseFloat(e.netSalary) || 0), 0);

  // Filtered employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      (emp.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.designation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.phone || '').includes(searchTerm);

    const matchesDept = departmentFilter === 'ALL' || emp.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setEmpForm({
      name: '',
      designation: '',
      department: 'Sales & Retail',
      roleId: 'role-cashier',
      phone: '',
      email: '',
      joiningDate: new Date().toISOString().split('T')[0],
      basicSalary: 20000,
      hra: 4000,
      allowances: 1500,
      pfDeduction: 1200,
      esiDeduction: 500,
      status: 'Active',
      bankName: 'State Bank of India',
      accountNo: '',
      ifsc: '',
      panNo: '',
      aadhaarNo: '',
      address: 'Jaipur, RJ'
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setEmpForm({
      name: emp.name || '',
      designation: emp.designation || '',
      department: emp.department || 'Sales & Retail',
      roleId: emp.roleId || 'role-cashier',
      phone: emp.phone || '',
      email: emp.email || '',
      joiningDate: emp.joiningDate || '',
      basicSalary: emp.basicSalary || '',
      hra: emp.hra || '',
      allowances: emp.allowances || '',
      pfDeduction: emp.pfDeduction || '',
      esiDeduction: emp.esiDeduction || '',
      status: emp.status || 'Active',
      bankName: emp.bankName || '',
      accountNo: emp.accountNo || '',
      ifsc: emp.ifsc || '',
      panNo: emp.panNo || '',
      aadhaarNo: emp.aadhaarNo || '',
      address: emp.address || ''
    });
    setIsAddModalOpen(true);
  };

  const handleSaveEmployee = (e) => {
    e.preventDefault();
    if (!empForm.name || !empForm.phone) {
      alert('Please fill Name and Mobile Phone');
      return;
    }

    const netSalary = computeNetSalary(empForm);

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, {
        ...empForm,
        roleId: empForm.roleId || 'role-cashier',
        basicSalary: parseFloat(empForm.basicSalary) || 0,
        hra: parseFloat(empForm.hra) || 0,
        allowances: parseFloat(empForm.allowances) || 0,
        pfDeduction: parseFloat(empForm.pfDeduction) || 0,
        esiDeduction: parseFloat(empForm.esiDeduction) || 0,
        netSalary
      });
    } else {
      addEmployee({
        ...empForm,
        roleId: empForm.roleId || 'role-cashier',
        extraPermissions: [],
        basicSalary: parseFloat(empForm.basicSalary) || 0,
        hra: parseFloat(empForm.hra) || 0,
        allowances: parseFloat(empForm.allowances) || 0,
        pfDeduction: parseFloat(empForm.pfDeduction) || 0,
        esiDeduction: parseFloat(empForm.esiDeduction) || 0,
        netSalary
      });
    }

    setIsAddModalOpen(false);
  };

  const formNetSalaryPreview = computeNetSalary(empForm);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Users className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Human Resource (HRM) — Staff Directory
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage store team members, salary compensation structures, department designations, and employee records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/shop-admin/hrm/attendance')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-slate-300 dark:border-slate-700"
          >
            <Clock className="w-4 h-4 text-amber-500" />
            Attendance & Leaves
          </button>
          <button
            onClick={() => navigate('/shop-admin/hrm/payroll')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border border-slate-300 dark:border-slate-700"
          >
            <IndianRupee className="w-4 h-4 text-emerald-500" />
            Payroll Payouts
          </button>
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/25 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            + Onboard Employee
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Workforce</span>
            <span className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{totalEmployeesCount} Staff</p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">{activeEmployeesCount} Active across departments</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Monthly Payroll</span>
            <span className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <IndianRupee className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
            ₹{totalMonthlyPayroll.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-slate-500 mt-1">Total defined monthly take-home salary</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Store Departments</span>
            <span className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Building className="w-5 h-5" />
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{DEPARTMENTS.length} Teams</p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">Retail, Accounts, Inventory, Tailoring</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employee name, role, ID, mobile..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
          >
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employees Directory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Employee ID & Name</th>
                <th className="py-3.5 px-4">Designation & Department</th>
                <th className="py-3.5 px-4">Role & Access</th>
                <th className="py-3.5 px-4">Mobile & Email</th>
                <th className="py-3.5 px-4">Defined Net Salary</th>
                <th className="py-3.5 px-4">Bank Details</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No employees found. Click "+ Onboard Employee" to add your team.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                          {emp.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">{emp.name}</p>
                          <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-medium">
                            {emp.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{emp.designation}</p>
                      <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {emp.department}
                      </span>
                    </td>

                    {/* Role & Permissions Badge */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                          {roles.find((r) => r.id === emp.roleId)?.name || 'POS Cashier'}
                        </span>
                        {(emp.extraPermissions || []).length > 0 && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                            +{emp.extraPermissions.length} Extra Granted
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-mono">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{emp.phone}</span>
                        </div>
                        {emp.email && (
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>{emp.email}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          ₹{parseFloat(emp.netSalary || 0).toLocaleString('en-IN')}/mo
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Basic: ₹{emp.basicSalary} | HRA: ₹{emp.hra || 0}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{emp.bankName || 'Bank N/A'}</p>
                        <p className="font-mono text-[11px] text-slate-500">
                          {emp.accountNo ? `A/C: ••••${emp.accountNo.slice(-4)}` : 'A/C N/A'}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          emp.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {emp.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate('/shop-admin/roles-permissions')}
                          className="p-1.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 rounded-lg transition"
                          title="Configure Staff Role & Custom Extra Permissions"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewEmployeeModal(emp)}
                          className="p-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg"
                          title="View Profile"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(emp)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 rounded-lg"
                          title="Edit Employee"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove employee ${emp.name}?`)) {
                              deleteEmployee(emp.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/40 rounded-lg"
                          title="Delete Employee"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Modal: Add / Edit Employee */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editingEmployee ? `Edit Employee (${editingEmployee.id})` : 'Onboard New Staff Employee'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="space-y-4">
              {/* Personal & Job Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={empForm.name}
                    onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Verma"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Designation / Job Role *
                  </label>
                  <input
                    type="text"
                    required
                    value={empForm.designation}
                    onChange={(e) => setEmpForm({ ...empForm, designation: e.target.value })}
                    placeholder="e.g. Store Manager or Billing Cashier"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Department
                  </label>
                  <select
                    value={empForm.department}
                    onChange={(e) => setEmpForm({ ...empForm, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  >
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                    ERP Role & Access *
                  </label>
                  <select
                    value={empForm.roleId || 'role-cashier'}
                    onChange={(e) => setEmpForm({ ...empForm, roleId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white font-medium"
                  >
                    {roles.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.permissions?.includes('*') ? 'All Access' : `${r.permissions?.length || 0} perms`})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={empForm.phone}
                    onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                    placeholder="e.g. 9829044551"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Joining Date
                  </label>
                  <input
                    type="date"
                    value={empForm.joiningDate}
                    onChange={(e) => setEmpForm({ ...empForm, joiningDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>

              {/* Salary Structure Section */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Monthly Salary Compensation Structure
                  </h4>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">Calculated Net Salary: </span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{formNetSalaryPreview.toLocaleString('en-IN')}/month
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Basic Salary (₹) *
                    </label>
                    <input
                      type="number"
                      required
                      value={empForm.basicSalary}
                      onChange={(e) => setEmpForm({ ...empForm, basicSalary: e.target.value })}
                      placeholder="e.g. 25000"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      HRA (₹)
                    </label>
                    <input
                      type="number"
                      value={empForm.hra}
                      onChange={(e) => setEmpForm({ ...empForm, hra: e.target.value })}
                      placeholder="e.g. 5000"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Special Allowances (₹)
                    </label>
                    <input
                      type="number"
                      value={empForm.allowances}
                      onChange={(e) => setEmpForm({ ...empForm, allowances: e.target.value })}
                      placeholder="e.g. 2000"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400 mb-1">
                      PF Deduction (₹)
                    </label>
                    <input
                      type="number"
                      value={empForm.pfDeduction}
                      onChange={(e) => setEmpForm({ ...empForm, pfDeduction: e.target.value })}
                      placeholder="e.g. 1800"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-rose-600 dark:text-rose-400 mb-1">
                      ESI / Medical Deduction (₹)
                    </label>
                    <input
                      type="number"
                      value={empForm.esiDeduction}
                      onChange={(e) => setEmpForm({ ...empForm, esiDeduction: e.target.value })}
                      placeholder="e.g. 600"
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Employment Status
                    </label>
                    <select
                      value={empForm.status}
                      onChange={(e) => setEmpForm({ ...empForm, status: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:text-white"
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Resigned">Resigned / Exited</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bank & Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={empForm.bankName}
                    onChange={(e) => setEmpForm({ ...empForm, bankName: e.target.value })}
                    placeholder="e.g. HDFC Bank"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={empForm.accountNo}
                    onChange={(e) => setEmpForm({ ...empForm, accountNo: e.target.value })}
                    placeholder="e.g. 5010049281923"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    IFSC Code
                  </label>
                  <input
                    type="text"
                    value={empForm.ifsc}
                    onChange={(e) => setEmpForm({ ...empForm, ifsc: e.target.value })}
                    placeholder="e.g. HDFC0001234"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono uppercase dark:text-white"
                  />
                </div>
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20"
                >
                  {editingEmployee ? 'Update Profile' : 'Save & Onboard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Employee Profile Card */}
      {viewEmployeeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Staff Member Profile</h3>
              <button
                onClick={() => setViewEmployeeModal(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-lg">
                {viewEmployeeModal.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white">{viewEmployeeModal.name}</h4>
                <p className="text-xs text-blue-600 font-semibold">{viewEmployeeModal.designation}</p>
                <span className="text-[11px] text-slate-500 font-mono">ID: {viewEmployeeModal.id}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{viewEmployeeModal.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Phone:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">{viewEmployeeModal.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Joining Date:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{viewEmployeeModal.joiningDate}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500">Monthly Net Salary:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ₹{parseFloat(viewEmployeeModal.netSalary || 0).toLocaleString('en-IN')}/mo
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bank Account:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  {viewEmployeeModal.bankName} ({viewEmployeeModal.accountNo || 'N/A'})
                </span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewEmployeeModal(null)}
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

import React, { useState } from 'react';
import { useErp, PERMISSION_MODULES, ALL_PERMISSION_KEYS } from '../../context/ErpContext';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Shield,
  Users,
  UserCheck,
  Plus,
  Search,
  CheckCircle,
  X,
  Edit2,
  Trash2,
  Check,
  Lock,
  Unlock,
  AlertCircle,
  HelpCircle,
  Sliders,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function RolesPermissionsManager() {
  const navigate = useNavigate();
  const {
    roles,
    addRole,
    updateRole,
    deleteRole,
    employees,
    assignEmployeeRoleAndPermissions,
    currentUser,
    switchUser,
    hasPermission
  } = useErp();

  const [activeTab, setActiveTab] = useState('roles'); // 'roles' | 'users'
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: []
  });

  // User Custom Permissions Modal
  const [customizingEmployee, setCustomizingEmployee] = useState(null);
  const [employeeRoleSelection, setEmployeeRoleSelection] = useState('');
  const [employeeExtraPermissions, setEmployeeExtraPermissions] = useState([]);

  // Open Create Role Modal
  const handleOpenCreateRole = () => {
    setEditingRole(null);
    setRoleForm({
      name: '',
      description: '',
      permissions: []
    });
    setIsRoleModalOpen(true);
  };

  // Open Edit Role Modal
  const handleOpenEditRole = (role) => {
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions || []
    });
    setIsRoleModalOpen(true);
  };

  // Toggle single permission for Role
  const handleToggleRolePermission = (key) => {
    setRoleForm((prev) => {
      const exists = prev.permissions.includes(key);
      if (exists) {
        return { ...prev, permissions: prev.permissions.filter((k) => k !== key) };
      } else {
        return { ...prev, permissions: [...prev.permissions, key] };
      }
    });
  };

  // Toggle all permissions in a specific module
  const handleToggleModulePermissions = (modulePermissions) => {
    const keysInModule = modulePermissions.map((p) => p.key);
    const allSelected = keysInModule.every((k) => roleForm.permissions.includes(k));

    setRoleForm((prev) => {
      if (allSelected) {
        // remove all in module
        return {
          ...prev,
          permissions: prev.permissions.filter((k) => !keysInModule.includes(k))
        };
      } else {
        // add all in module
        const combined = new Set([...prev.permissions, ...keysInModule]);
        return { ...prev, permissions: Array.from(combined) };
      }
    });
  };

  // Select / Deselect All permissions
  const handleSelectAllRolePermissions = () => {
    setRoleForm((prev) => ({ ...prev, permissions: [...ALL_PERMISSION_KEYS] }));
  };

  const handleDeselectAllRolePermissions = () => {
    setRoleForm((prev) => ({ ...prev, permissions: [] }));
  };

  // Submit Role
  const handleSaveRole = (e) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      alert('Please enter a Role name');
      return;
    }

    if (editingRole) {
      updateRole(editingRole.id, {
        name: roleForm.name,
        description: roleForm.description,
        permissions: roleForm.permissions
      });
    } else {
      addRole({
        name: roleForm.name,
        description: roleForm.description,
        permissions: roleForm.permissions
      });
    }

    setIsRoleModalOpen(false);
  };

  // Open User Custom Permissions Modal
  const handleOpenUserCustomize = (emp) => {
    setCustomizingEmployee(emp);
    const assignedRoleId = emp.roleId || 'role-cashier';
    setEmployeeRoleSelection(assignedRoleId);
    setEmployeeExtraPermissions(emp.extraPermissions || []);
  };

  // Toggle Extra Permission for Employee
  const handleToggleUserExtraPermission = (key, isInheritedFromRole) => {
    if (isInheritedFromRole) return; // cannot toggle extra if already granted by role!

    setEmployeeExtraPermissions((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      } else {
        return [...prev, key];
      }
    });
  };

  // Save User Permissions
  const handleSaveUserPermissions = () => {
    if (!customizingEmployee) return;

    assignEmployeeRoleAndPermissions(customizingEmployee.id, {
      roleId: employeeRoleSelection,
      extraPermissions: employeeExtraPermissions
    });

    setCustomizingEmployee(null);
  };

  // Selected Role object in user customize modal
  const selectedRoleInUserModal = roles.find((r) => r.id === employeeRoleSelection) || roles[0];
  const isSuperInUserModal = selectedRoleInUserModal?.id === 'role-superadmin' || selectedRoleInUserModal?.permissions?.includes('*');
  const inheritedKeysInUserModal = isSuperInUserModal ? ALL_PERMISSION_KEYS : (selectedRoleInUserModal?.permissions || []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Roles & Granular Permissions (RBAC)
            </h1>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Define module-wise permissions, create custom roles, assign roles to staff employees, and configure user-specific extra permission overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateRole}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/25 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            + Create New Role
          </button>
        </div>
      </div>

      {/* Active User Switcher / Live Permission Simulator Banner */}
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Active Logged-in Persona:
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-extrabold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300">
                {currentUser?.roleName || currentUser?.roleId}
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {currentUser?.name || 'Super Admin'}
            </h3>
            <p className="text-xs text-slate-500">
              {currentUser?.roleId === 'role-superadmin'
                ? 'Unrestricted access to all pages, buttons, and settings.'
                : `Active permissions controlled by role "${currentUser?.roleName}" + custom overrides.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 whitespace-nowrap">
            Switch Persona to test:
          </label>
          <select
            value={currentUser?.id}
            onChange={(e) => {
              const selectedId = e.target.value;
              if (selectedId === 'usr-admin') {
                switchUser({
                  id: 'usr-admin',
                  name: 'Super Admin (Store Owner)',
                  roleId: 'role-superadmin',
                  roleName: 'Super Admin',
                  isSuperAdmin: true,
                  extraPermissions: []
                });
              } else {
                const emp = employees.find((em) => em.id === selectedId);
                if (emp) {
                  const role = roles.find((r) => r.id === emp.roleId);
                  switchUser({
                    id: emp.id,
                    name: emp.name,
                    roleId: emp.roleId || 'role-cashier',
                    roleName: role?.name || 'Staff',
                    isSuperAdmin: emp.roleId === 'role-superadmin',
                    extraPermissions: emp.extraPermissions || []
                  });
                }
              }
            }}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="usr-admin">👑 Super Admin (Store Owner) — Full Access</option>
            {employees.map((emp) => {
              const role = roles.find((r) => r.id === emp.roleId);
              return (
                <option key={emp.id} value={emp.id}>
                  👤 {emp.name} ({role?.name || 'Staff'})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'roles'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4" />
          System Roles Master ({roles.length})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'users'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Staff User Role & Custom Permission Overrides ({employees.length})
        </button>
      </div>

      {/* TAB 1: ROLES MASTER */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const isSuper = role.id === 'role-superadmin' || role.permissions.includes('*');
            const grantedCount = isSuper ? ALL_PERMISSION_KEYS.length : (role.permissions || []).length;
            const assignedStaffCount = employees.filter((e) => e.roleId === role.id).length;

            return (
              <div
                key={role.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-indigo-500/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${role.badgeColor || 'bg-slate-100 text-slate-800'}`}>
                        {role.name}
                      </span>
                      {role.isSystem && (
                        <span className="ml-2 text-[10px] font-mono text-slate-400 uppercase">
                          System Defined
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditRole(role)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                        title="Edit Role Permissions"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!role.isSystem && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete role "${role.name}"?`)) {
                              deleteRole(role.id);
                            }
                          }}
                          className="p-1.5 text-slate-500 hover:text-rose-600 bg-slate-100 dark:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed min-h-[36px]">
                    {role.description || 'Custom role with tailored permissions.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Permissions</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {isSuper ? 'All (Wildcard *)' : `${grantedCount} of ${ALL_PERMISSION_KEYS.length}`}
                      </span>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
                      <span className="text-[10px] text-slate-400 block font-semibold">Staff Assigned</span>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {assignedStaffCount} Employees
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEditRole(role)}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-200 dark:border-slate-700"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  Configure Module Permissions
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: USER ROLE & CUSTOM PERMISSIONS OVERRIDES */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Staff Employee Roles & Extra Custom Permissions
              </h3>
              <p className="text-xs text-slate-500">
                Staff members inherit permissions from their role, plus any custom extra permissions assigned individually.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total {employees.length} Staff
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Extra Custom Permissions</th>
                  <th className="py-3.5 px-4">Effective Permissions</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {employees.map((emp) => {
                  const assignedRole = roles.find((r) => r.id === (emp.roleId || 'role-cashier')) || roles[0];
                  const extraCount = (emp.extraPermissions || []).length;
                  const isSuper = assignedRole.id === 'role-superadmin' || assignedRole.permissions.includes('*');
                  const totalEffective = isSuper ? ALL_PERMISSION_KEYS.length : (assignedRole.permissions || []).length + extraCount;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xs flex items-center justify-center">
                            {emp.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-white">{emp.name}</p>
                            <span className="font-mono text-xs text-slate-400">{emp.id} • {emp.designation}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                          {emp.department}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${assignedRole.badgeColor || 'bg-slate-100 text-slate-800'}`}>
                          {assignedRole.name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {extraCount > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              +{extraCount} Extra Overrides
                            </span>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {(emp.extraPermissions || []).join(', ')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">None (Pure Role)</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                          {isSuper ? 'Full Super Admin Access (*)' : `${totalEffective} Permissions Active`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenUserCustomize(emp)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ml-auto"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          Customize Permissions
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Create / Edit Role with Checkboxes Grouped by Module */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {editingRole ? `Edit Role: ${editingRole.name}` : 'Create New System Role'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select permissions below. Changes take effect across all staff members assigned to this role.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-5">
              {/* Role Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                    placeholder="e.g. Senior Billing Executive"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Role Description
                  </label>
                  <input
                    type="text"
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({ ...roleForm, description: e.target.value })}
                    placeholder="e.g. Authorized to punch bills and print invoices"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </div>

              {/* Master Bulk Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  Selected: <strong className="text-indigo-600 dark:text-indigo-400">{roleForm.permissions.length}</strong> of {ALL_PERMISSION_KEYS.length} permissions
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllRolePermissions}
                    className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold"
                  >
                    Select All Permissions
                  </button>
                  <button
                    type="button"
                    onClick={handleDeselectAllRolePermissions}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              {/* Module-Grouped Permissions Checkbox List */}
              <div className="space-y-4">
                {PERMISSION_MODULES.map((mod) => {
                  const keysInMod = mod.permissions.map((p) => p.key);
                  const selectedInModCount = keysInMod.filter((k) => roleForm.permissions.includes(k)).length;
                  const isAllInModSelected = selectedInModCount === keysInMod.length;

                  return (
                    <div
                      key={mod.moduleId}
                      className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/70 p-4 space-y-3"
                    >
                      {/* Module Header with Select All in Module Checkbox */}
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isAllInModSelected}
                            onChange={() => handleToggleModulePermissions(mod.permissions)}
                            className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                          />
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {mod.moduleName}
                          </span>
                        </label>

                        <span className="text-xs font-semibold text-slate-500">
                          {selectedInModCount} / {keysInMod.length} selected
                        </span>
                      </div>

                      {/* Individual Activity Checkboxes in this module */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {mod.permissions.map((perm) => {
                          const isChecked = roleForm.permissions.includes(perm.key);
                          return (
                            <label
                              key={perm.key}
                              className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-slate-900 dark:text-white'
                                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100/50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleRolePermission(perm.key)}
                                className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                              />
                              <div className="text-xs">
                                <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                                  {perm.label}
                                </p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  {perm.description}
                                </p>
                                <span className="font-mono text-[10px] text-slate-400 mt-1 block">
                                  {perm.key}
                                </span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20"
                >
                  {editingRole ? 'Update Role Permissions' : 'Save New Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Customize Individual User Role & Extra Permissions */}
      {customizingEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-indigo-500/30 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 rounded-xl">
                  <Sliders className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Customize Permissions for {customizingEmployee.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    ID: <strong>{customizingEmployee.id}</strong> • Role: <strong>{customizingEmployee.designation}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setCustomizingEmployee(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role Selector Card */}
            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 mb-1">
                  Primary Role Assigned to Employee:
                </label>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Changing the role automatically grants all its base permissions. You can then toggle additional extra permissions below.
                </p>
              </div>

              <select
                value={employeeRoleSelection}
                onChange={(e) => setEmployeeRoleSelection(e.target.value)}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-xl text-sm font-bold text-indigo-900 dark:text-indigo-200 shadow-sm"
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Explanation Banner */}
            <div className="flex items-center gap-4 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Inherited from Role ({inheritedKeysInUserModal.length})
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  Extra Custom Assigned (+{employeeExtraPermissions.length})
                </span>
              </div>
            </div>

            {/* Module Checklist for User */}
            <div className="space-y-4">
              {PERMISSION_MODULES.map((mod) => (
                <div
                  key={mod.moduleId}
                  className="bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/70 p-4 space-y-3"
                >
                  <div className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    {mod.moduleName}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {mod.permissions.map((perm) => {
                      const isInherited = inheritedKeysInUserModal.includes(perm.key);
                      const isExtra = employeeExtraPermissions.includes(perm.key);
                      const isChecked = isInherited || isExtra;

                      return (
                        <label
                          key={perm.key}
                          onClick={() => handleToggleUserExtraPermission(perm.key, isInherited)}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border transition-all ${
                            isInherited
                              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 cursor-not-allowed opacity-90'
                              : isExtra
                              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-700 cursor-pointer shadow-sm'
                              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isInherited}
                            onChange={() => {}}
                            className="w-4 h-4 mt-0.5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 disabled:opacity-80"
                          />

                          <div className="text-xs">
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900 dark:text-white leading-tight">
                                {perm.label}
                              </p>
                              {isInherited && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-300">
                                  ✓ In Role
                                </span>
                              )}
                              {isExtra && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                                  + Extra
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {perm.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCustomizingEmployee(null)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveUserPermissions}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-500/20"
              >
                Save & Apply to Staff Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

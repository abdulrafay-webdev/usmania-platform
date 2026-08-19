'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Role,
  PermissionDTO,
  getUsers,
  createUser,
  updateUser,
  triggerUserPasswordReset,
  getRoles,
  createRole,
  updateRole,
  updateRolePermissions,
  deleteRole
} from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  Shield,
  Plus,
  Pencil,
  Trash2,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  Search,
  Check,
  X,
  Lock,
  Mail,
  UserCheck,
  UserX,
  Layers,
  Settings2,
  Info
} from 'lucide-react';

const MODULE_LABELS: Record<string, { label: string; desc: string; iconBg: string }> = {
  students: {
    label: 'Students Records (طالب علم)',
    desc: 'Student admission forms, profiles, roll numbers, ID cards, PDF export',
    iconBg: 'bg-emerald-50 text-emerald-700'
  },
  teachers: {
    label: 'Teachers Records (اساتذہ کرام)',
    desc: 'Teacher registration, subjects taught, agreements, ID cards',
    iconBg: 'bg-blue-50 text-blue-700'
  },
  staff: {
    label: 'Staff Records (ملازمین و غیر تدریسی عملہ)',
    desc: 'Staff registration, designations/roles, employment contracts, ID cards, PDF export',
    iconBg: 'bg-purple-50 text-purple-700'
  },
  finance_dashboard: {
    label: 'Finance Dashboard & Balances (مالیاتی خلاصہ)',
    desc: 'Grand total, Cash/JazzCash/Easypaisa/Meezan account balances, analytics charts',
    iconBg: 'bg-amber-50 text-amber-700'
  },
  finance_received: {
    label: 'Finance Received / Donations (آمدنی و عطیات)',
    desc: 'Income & donation entries, receipt vouchers, donor records',
    iconBg: 'bg-emerald-50 text-emerald-700'
  },
  finance_debit: {
    label: 'Finance Debit / Expenses (اخراجات و مصارف)',
    desc: 'Daily madrasa debits, utility bills, maintenance, salary payments',
    iconBg: 'bg-red-50 text-red-700'
  },
  finance_kind_donation: {
    label: 'In-Kind Donations (اشیاء برائے عطیہ)',
    desc: 'Furniture, food sacks, books, clothing inventory & estimated values',
    iconBg: 'bg-purple-50 text-purple-700'
  },
  finance_loan: {
    label: 'Loans & Repayments (قرض حسنہ و ادائیگیاں)',
    desc: 'Loans taken, lenders list, partial repayments, balance tracking',
    iconBg: 'bg-indigo-50 text-indigo-700'
  },
  finance_liability: {
    label: 'Liabilities & Payables (واجبات، بلز و ادائیگیاں)',
    desc: 'Pending utility bills, vendor/ration payables, contractor dues, partial payments',
    iconBg: 'bg-rose-50 text-rose-700'
  },
  settings_users: {
    label: 'Settings → Users & Roles (صارفین و اختیارات)',
    desc: 'Create accounts, assign roles, configure granular permission matrix',
    iconBg: 'bg-gray-100 text-gray-800'
  }
};

export default function UserSettings() {
  const { currentUser, hasPermission, refreshAuth } = useAuth();

  const [activeTab, setActiveTab] = useState<'users' | 'roles'>('users');

  // Users State
  const [usersList, setUsersList] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [userSearch, setUserSearch] = useState<string>('');

  // Roles State
  const [rolesList, setRolesList] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState<boolean>(true);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');

  // Notifications
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Add/Edit User Modal
  const [showUserModal, setShowUserModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    password: '',
    role_id: '',
    is_active: true
  });
  const [savingUser, setSavingUser] = useState<boolean>(false);

  // Add Custom Role Modal
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [newRoleName, setNewRoleName] = useState<string>('');
  const [newRoleDesc, setNewRoleDesc] = useState<string>('');
  const [savingRole, setSavingRole] = useState<boolean>(false);

  // Permissions Matrix in edit state
  const [matrixPermissions, setMatrixPermissions] = useState<Record<string, PermissionDTO>>({});
  const [savingPermissions, setSavingPermissions] = useState<boolean>(false);

  const canEditUsers = hasPermission('settings_users', 'edit');
  const canCreateUsers = hasPermission('settings_users', 'create');
  const canDeleteUsers = hasPermission('settings_users', 'delete');

  const loadData = async () => {
    setLoadingUsers(true);
    setLoadingRoles(true);
    try {
      const [uData, rData] = await Promise.all([getUsers(), getRoles()]);
      setUsersList(uData);
      setRolesList(rData);

      if (rData.length > 0 && !selectedRoleId) {
        setSelectedRoleId(rData[0].id);
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load user and role data.' });
    } finally {
      setLoadingUsers(false);
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update Matrix state when selected role changes
  useEffect(() => {
    if (!selectedRoleId) return;
    const currentRole = rolesList.find((r) => r.id === selectedRoleId);
    if (!currentRole) return;

    const pMap: Record<string, PermissionDTO> = {};
    Object.keys(MODULE_LABELS).forEach((mod) => {
      const found = currentRole.permissions?.find((p) => p.module === mod);
      pMap[mod] = found || {
        module: mod,
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false
      };
    });
    setMatrixPermissions(pMap);
  }, [selectedRoleId, rolesList]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  // ----------------- USER ACTIONS -----------------
  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserFormData({
      name: '',
      email: '',
      password: '',
      role_id: rolesList[0]?.id || '',
      is_active: true
    });
    setShowUserModal(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      email: user.email,
      password: '',
      role_id: user.role_id,
      is_active: user.is_active
    });
    setShowUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.email.trim()) {
      showNotification('error', 'Name and email are required.');
      return;
    }

    setSavingUser(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          name: userFormData.name.trim(),
          email: userFormData.email.trim(),
          role_id: userFormData.role_id,
          is_active: userFormData.is_active,
          password: userFormData.password.trim() || undefined
        });
        showNotification('success', `User '${userFormData.name}' updated successfully.`);
      } else {
        if (!userFormData.password || userFormData.password.length < 6) {
          showNotification('error', 'Password must be at least 6 characters.');
          setSavingUser(false);
          return;
        }
        await createUser({
          name: userFormData.name.trim(),
          email: userFormData.email.trim(),
          password: userFormData.password.trim(),
          role_id: userFormData.role_id,
          is_active: userFormData.is_active
        });
        showNotification('success', `User '${userFormData.name}' created successfully.`);
      }
      setShowUserModal(false);
      await loadData();
      refreshAuth();
    } catch (err: any) {
      showNotification('error', err.message || 'Error saving user.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleTriggerReset = async (user: User) => {
    if (!confirm(`Send password reset email to ${user.email}?`)) return;
    try {
      const res = await triggerUserPasswordReset(user.id);
      showNotification('success', res.message || `Reset email sent to ${user.email}.`);
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to send reset email.');
    }
  };

  // ----------------- ROLE & PERMISSION ACTIONS -----------------
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      showNotification('error', 'Role name is required.');
      return;
    }

    setSavingRole(true);
    try {
      const role = await createRole({
        name: newRoleName.trim(),
        description: newRoleDesc.trim()
      });
      showNotification('success', `Role '${role.name}' created.`);
      setShowRoleModal(false);
      setNewRoleName('');
      setNewRoleDesc('');
      await loadData();
      setSelectedRoleId(role.id);
    } catch (err: any) {
      showNotification('error', err.message || 'Error creating role.');
    } finally {
      setSavingRole(false);
    }
  };

  const handleDeleteRole = async (role: Role) => {
    if (role.is_system_role) {
      showNotification('error', 'System default roles cannot be deleted.');
      return;
    }
    if (!confirm(`Are you sure you want to delete role '${role.name}'?`)) return;

    try {
      await deleteRole(role.id);
      showNotification('success', `Role '${role.name}' deleted.`);
      const remaining = rolesList.filter((r) => r.id !== role.id);
      setRolesList(remaining);
      if (selectedRoleId === role.id && remaining.length > 0) {
        setSelectedRoleId(remaining[0].id);
      }
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete role.');
    }
  };

  const handleTogglePermission = (
    module: string,
    action: 'can_view' | 'can_create' | 'can_edit' | 'can_delete'
  ) => {
    setMatrixPermissions((prev) => {
      const current = prev[module] || {
        module,
        can_view: false,
        can_create: false,
        can_edit: false,
        can_delete: false
      };
      return {
        ...prev,
        [module]: {
          ...current,
          [action]: !current[action]
        }
      };
    });
  };

  const handleToggleRow = (module: string, setAll: boolean) => {
    setMatrixPermissions((prev) => ({
      ...prev,
      [module]: {
        module,
        can_view: setAll,
        can_create: setAll,
        can_edit: setAll,
        can_delete: setAll
      }
    }));
  };

  const handleSavePermissions = async () => {
    if (!selectedRoleId) return;
    setSavingPermissions(true);
    try {
      const permsArray = Object.values(matrixPermissions);
      await updateRolePermissions(selectedRoleId, permsArray);
      showNotification('success', 'Role permissions saved and updated for all users.');
      await loadData();
      refreshAuth();
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to save permissions.');
    } finally {
      setSavingPermissions(false);
    }
  };

  const filteredUsers = usersList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.role_name && u.role_name.toLowerCase().includes(userSearch.toLowerCase()))
  );

  const currentSelectedRole = rolesList.find((r) => r.id === selectedRoleId);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#145A32]/10 flex items-center justify-center text-[#145A32]">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 font-serif">
                User Management & Access Control (RBAC)
              </h1>
              <p className="text-xs text-gray-500">
                Manage portal user accounts, custom roles, and granular module permissions
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-white text-[#145A32] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Users Directory ({usersList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'roles'
                ? 'bg-white text-[#145A32] shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Roles & Permissions ({rolesList.length})</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fadeIn ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-gray-400 hover:text-gray-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: USERS DIRECTORY                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name, email, role..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
              />
            </div>

            {canCreateUsers && (
              <button
                onClick={handleOpenAddUser}
                className="w-full sm:w-auto px-4 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New User</span>
              </button>
            )}
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF5EA] text-[#145A32] font-bold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3">User Name & Email</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Account Status</th>
                  <th className="px-4 py-3">Last Active</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400">
                      <div className="w-6 h-6 border-2 border-[#145A32] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Loading user accounts...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400">
                      No user accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#145A32]/10 text-[#145A32] font-bold flex items-center justify-center text-xs shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div>{u.name}</div>
                            <div className="text-[11px] text-gray-400 font-normal">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            u.role_name === 'Super Admin'
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : u.role_name === 'Finance Manager'
                              ? 'bg-blue-100 text-blue-900'
                              : u.role_name === 'Academic Manager'
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {u.role_name || 'No Role'}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {u.is_active ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-600 font-semibold text-xs">
                            <UserX className="w-3.5 h-3.5" /> Deactivated
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-gray-500 font-mono text-[11px]">
                        {u.last_login_at
                          ? new Date(u.last_login_at).toLocaleString('en-PK', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })
                          : 'Never'}
                      </td>

                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {canEditUsers && (
                            <>
                              <button
                                onClick={() => handleTriggerReset(u)}
                                title="Send Password Reset Email"
                                className="p-1.5 bg-gray-100 hover:bg-amber-50 text-gray-600 hover:text-amber-700 rounded-lg transition-colors"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenEditUser(u)}
                                title="Edit User & Role"
                                className="p-1.5 bg-gray-100 hover:bg-[#145A32]/10 text-gray-600 hover:text-[#145A32] rounded-lg transition-colors"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ROLES & GRANULAR PERMISSIONS MATRIX                                */}
      {/* ========================================================================= */}
      {activeTab === 'roles' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Roles Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Platform Roles
                </span>
                {canCreateUsers && (
                  <button
                    onClick={() => setShowRoleModal(true)}
                    className="p-1 text-[#145A32] hover:bg-[#145A32]/10 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Role</span>
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {rolesList.map((r) => {
                  const isSelected = r.id === selectedRoleId;
                  return (
                    <div
                      key={r.id}
                      onClick={() => setSelectedRoleId(r.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#145A32] text-white border-[#145A32] shadow-xs'
                          : 'bg-gray-50/50 hover:bg-gray-100 border-gray-200 text-gray-900'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>{r.name}</span>
                          {r.is_system_role && (
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                                isSelected ? 'bg-white/20 text-[#FDF6E3]' : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              System
                            </span>
                          )}
                        </div>
                        {r.description && (
                          <p
                            className={`text-[10px] line-clamp-1 ${
                              isSelected ? 'text-white/80' : 'text-gray-500'
                            }`}
                          >
                            {r.description}
                          </p>
                        )}
                      </div>

                      {!r.is_system_role && canDeleteUsers && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRole(r);
                          }}
                          className={`p-1 rounded hover:bg-red-500 hover:text-white ${
                            isSelected ? 'text-white/60' : 'text-gray-400'
                          }`}
                          title="Delete Custom Role"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hint Box */}
            <div className="bg-[#FDF6E3]/70 border border-amber-200 rounded-xl p-4 text-xs space-y-2 text-amber-900">
              <div className="font-bold flex items-center gap-1.5 text-[#145A32]">
                <Info className="w-4 h-4" />
                <span>Independent Create-Only Logic</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                If <strong>View = ❌</strong> and <strong>Create = ✅</strong> (e.g. Data Entry Operator), the user can only submit new entries directly through the form. Historical records and dashboards remain completely hidden from them.
              </p>
            </div>
          </div>

          {/* Right Column: Permission Matrix Table */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              {/* Role Header Info */}
              <div className="p-4 sm:p-5 bg-[#FAF5EA] border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[#145A32]" />
                    <h2 className="text-base font-bold text-gray-900 font-serif">
                      {currentSelectedRole?.name} — Permission Matrix
                    </h2>
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {currentSelectedRole?.description || 'Custom role permissions configuration'}
                  </p>
                </div>

                {canEditUsers && (
                  <button
                    onClick={handleSavePermissions}
                    disabled={savingPermissions}
                    className="px-5 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer self-start sm:self-auto"
                  >
                    {savingPermissions ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save Permissions</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Matrix Grid */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100/70 text-gray-700 font-bold uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3">Module Name</th>
                      <th className="px-3 py-3 text-center w-20">View</th>
                      <th className="px-3 py-3 text-center w-20">Create</th>
                      <th className="px-3 py-3 text-center w-20">Edit</th>
                      <th className="px-3 py-3 text-center w-20">Delete</th>
                      <th className="px-3 py-3 text-center w-24">Quick</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {Object.entries(MODULE_LABELS).map(([modKey, modInfo]) => {
                      const p = matrixPermissions[modKey] || {
                        module: modKey,
                        can_view: false,
                        can_create: false,
                        can_edit: false,
                        can_delete: false
                      };
                      const allChecked = p.can_view && p.can_create && p.can_edit && p.can_delete;

                      return (
                        <tr key={modKey} className="hover:bg-gray-50/70 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-bold text-gray-900">{modInfo.label}</div>
                            <div className="text-[11px] text-gray-500">{modInfo.desc}</div>
                          </td>

                          {/* View Checkbox */}
                          <td className="px-3 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={p.can_view}
                              onChange={() => handleTogglePermission(modKey, 'can_view')}
                              disabled={!canEditUsers}
                              className="w-4 h-4 text-[#145A32] rounded border-gray-300 focus:ring-[#145A32] cursor-pointer disabled:opacity-50"
                            />
                          </td>

                          {/* Create Checkbox */}
                          <td className="px-3 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={p.can_create}
                              onChange={() => handleTogglePermission(modKey, 'can_create')}
                              disabled={!canEditUsers}
                              className="w-4 h-4 text-[#145A32] rounded border-gray-300 focus:ring-[#145A32] cursor-pointer disabled:opacity-50"
                            />
                          </td>

                          {/* Edit Checkbox */}
                          <td className="px-3 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={p.can_edit}
                              onChange={() => handleTogglePermission(modKey, 'can_edit')}
                              disabled={!canEditUsers}
                              className="w-4 h-4 text-[#145A32] rounded border-gray-300 focus:ring-[#145A32] cursor-pointer disabled:opacity-50"
                            />
                          </td>

                          {/* Delete Checkbox */}
                          <td className="px-3 py-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={p.can_delete}
                              onChange={() => handleTogglePermission(modKey, 'can_delete')}
                              disabled={!canEditUsers}
                              className="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500 cursor-pointer disabled:opacity-50"
                            />
                          </td>

                          {/* Row Quick Action Toggle */}
                          <td className="px-3 py-3.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleRow(modKey, !allChecked)}
                              disabled={!canEditUsers}
                              className={`text-[10px] px-2 py-0.5 rounded font-bold transition-colors ${
                                allChecked
                                  ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                              }`}
                            >
                              {allChecked ? 'Clear' : 'All'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT USER                                                    */}
      {/* ========================================================================= */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="bg-[#145A32] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#FDF6E3]" />
                <h3 className="font-bold text-sm sm:text-base font-serif">
                  {editingUser ? `Edit User: ${editingUser.name}` : 'Create New User Account'}
                </h3>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Full Name (صارف کا نام) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                  placeholder="e.g. Qari Muhammad Tariq"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Email Address (ای میل برائے لاگ ان) <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  placeholder="e.g. tariq@jamiausmania.edu.pk"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Assigned Role (اختیارات کا عہدہ) <span className="text-red-500">*</span>
                </label>
                <select
                  disabled={editingUser?.email === 'usmaniatrust@gmail.com'}
                  value={userFormData.role_id}
                  onChange={(e) => setUserFormData({ ...userFormData, role_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32] disabled:bg-gray-100 disabled:text-gray-500"
                >
                  {rolesList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.is_system_role ? '(System Default)' : ''}
                    </option>
                  ))}
                </select>
                {editingUser?.email === 'usmaniatrust@gmail.com' && (
                  <p className="text-[11px] text-amber-700 mt-1 font-medium">
                    Primary Super Administrator account cannot be reassigned or demoted.
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  {editingUser ? 'Reset Password (Optional - leave blank to keep unchanged)' : 'Initial Password'}
                  {!editingUser && <span className="text-red-500"> *</span>}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={userFormData.password}
                  onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  placeholder={editingUser ? 'Leave blank to keep unchanged' : '•••••••• (min 6 characters)'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="user_active"
                  disabled={editingUser?.email === 'usmaniatrust@gmail.com'}
                  checked={userFormData.is_active}
                  onChange={(e) => setUserFormData({ ...userFormData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-[#145A32] focus:ring-[#145A32] disabled:opacity-50"
                />
                <label htmlFor="user_active" className="font-bold text-gray-700 cursor-pointer">
                  Account Active (لاگ ان کی اجازت ہے)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingUser}
                  className="px-5 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {savingUser ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD CUSTOM ROLE                                                    */}
      {/* ========================================================================= */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-[#145A32] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#FDF6E3]" />
                <h3 className="font-bold text-sm sm:text-base font-serif">Create Custom Role</h3>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Role Name (عہدے کا نام) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="e.g. Hostel Warden / Donation Collector"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  Description / Responsibilities
                </label>
                <textarea
                  rows={3}
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  placeholder="Describe what access this role provides..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingRole}
                  className="px-5 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white font-bold rounded-lg shadow-sm disabled:opacity-50"
                >
                  {savingRole ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

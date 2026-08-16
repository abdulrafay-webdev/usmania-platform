'use client';

import React, { useState } from 'react';
import TrustLogo from './TrustLogo';
import { useAuth } from '@/context/AuthContext';
import {
  Users,
  GraduationCap,
  UserPlus,
  Building2,
  LogOut,
  DollarSign,
  LayoutDashboard,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  Landmark,
  Receipt,
  ChevronDown,
  ChevronRight,
  Heart,
  Settings,
  Shield,
  X
} from 'lucide-react';

export type MainTabType =
  | 'students'
  | 'teachers'
  | 'donors'
  | 'finance-dashboard'
  | 'finance-received'
  | 'finance-debit'
  | 'finance-kind-donation'
  | 'finance-loan'
  | 'finance-liability'
  | 'settings-users';

interface SidebarProps {
  activeTab: MainTabType;
  onTabChange: (tab: MainTabType) => void;
  onOpenAdmissionModal: (type?: 'student' | 'teacher') => void;
  onLogout: () => void;
  studentCount?: number;
  teacherCount?: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  onOpenAdmissionModal,
  onLogout,
  studentCount = 0,
  teacherCount = 0,
  isOpen = false,
  onClose
}: SidebarProps) {
  const { currentUser, currentRole, hasPermission, canAccessModule } = useAuth();

  const isFinanceActive = activeTab.startsWith('finance') || activeTab === 'donors';
  const [financeExpanded, setFinanceExpanded] = useState(true);

  // Granular Permission Visibility
  const showStudents = canAccessModule('students');
  const showTeachers = canAccessModule('teachers');
  const showDonors = hasPermission('finance_received', 'view');
  const showFinanceDashboard = hasPermission('finance_dashboard', 'view');
  const showFinanceReceived = canAccessModule('finance_received');
  const showFinanceDebit = canAccessModule('finance_debit');
  const showFinanceKind = canAccessModule('finance_kind_donation');
  const showFinanceLoan = canAccessModule('finance_loan');
  const showFinanceLiability = canAccessModule('finance_liability');
  const showFinanceGroup =
    showFinanceDashboard ||
    showFinanceReceived ||
    showFinanceDebit ||
    showFinanceKind ||
    showFinanceLoan ||
    showFinanceLiability ||
    showDonors;
  const showSettings = canAccessModule('settings_users');

  const canCreateAdmission = hasPermission('students', 'create') || hasPermission('teachers', 'create');

  const handleSelectTab = (tab: MainTabType) => {
    onTabChange(tab);
    if (onClose) onClose(); // Auto close sidebar on mobile tap
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col justify-between z-50 shadow-md md:shadow-xs overflow-y-auto transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Top Header with Logo & Mobile Close Button */}
          <div className="p-4 sm:p-5 border-b border-gray-100 bg-[#FAF5EA]/50 flex items-center justify-between">
            <TrustLogo />
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-200/60 rounded-lg transition-colors"
                title="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* New Admission Quick Action Button */}
          {canCreateAdmission && (
            <div className="p-4">
              <button
                onClick={() => {
                  const targetRole =
                    activeTab === 'teachers' && hasPermission('teachers', 'create')
                      ? 'teacher'
                      : hasPermission('students', 'create')
                      ? 'student'
                      : 'teacher';
                  onOpenAdmissionModal(targetRole);
                  if (onClose) onClose();
                }}
                className="w-full py-2.5 px-4 bg-[#145A32] hover:bg-[#0E4124] text-white font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-[0.98] text-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ New Admission</span>
              </button>
            </div>
          )}

          {/* Navigation Tabs */}
          <nav className="px-3 space-y-1">
            {/* Students Tab */}
            {showStudents && (
              <button
                onClick={() => handleSelectTab('students')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                  activeTab === 'students'
                    ? 'bg-[#145A32] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className={`w-4 h-4 ${activeTab === 'students' ? 'text-white' : 'text-[#145A32]'}`} />
                  <span>Students</span>
                </div>
                {hasPermission('students', 'view') && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      activeTab === 'students'
                        ? 'bg-white/20 text-white'
                        : 'bg-[#FDF6E3] text-[#145A32] border border-[#145A32]/20'
                    }`}
                  >
                    {studentCount}
                  </span>
                )}
              </button>
            )}

            {/* Teachers Tab */}
            {showTeachers && (
              <button
                onClick={() => handleSelectTab('teachers')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                  activeTab === 'teachers'
                    ? 'bg-[#145A32] text-white shadow-xs'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className={`w-4 h-4 ${activeTab === 'teachers' ? 'text-white' : 'text-[#145A32]'}`} />
                  <span>Teachers</span>
                </div>
                {hasPermission('teachers', 'view') && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      activeTab === 'teachers'
                        ? 'bg-white/20 text-white'
                        : 'bg-[#FDF6E3] text-[#145A32] border border-[#145A32]/20'
                    }`}
                  >
                    {teacherCount}
                  </span>
                )}
              </button>
            )}

            {/* Finance Top-Level Section */}
            {showFinanceGroup && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    setFinanceExpanded(!financeExpanded);
                    if (!isFinanceActive) {
                      if (showFinanceDashboard) onTabChange('finance-dashboard');
                      else if (showFinanceReceived) onTabChange('finance-received');
                      else if (showFinanceDebit) onTabChange('finance-debit');
                      else if (showFinanceKind) onTabChange('finance-kind-donation');
                      else if (showFinanceLoan) onTabChange('finance-loan');
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                    isFinanceActive
                      ? 'bg-[#145A32] text-white shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <DollarSign className={`w-4 h-4 ${isFinanceActive ? 'text-white' : 'text-[#145A32]'}`} />
                    <span className="font-bold">Finance Module</span>
                  </div>
                  {financeExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {/* Sub-links */}
                {financeExpanded && (
                  <div className="mt-1 ml-3 pl-3 border-l-2 border-[#145A32]/20 space-y-1">
                    {showFinanceDashboard && (
                      <button
                        onClick={() => handleSelectTab('finance-dashboard')}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          activeTab === 'finance-dashboard'
                            ? 'bg-[#FDF6E3] text-[#145A32] font-bold border border-[#145A32]/30'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Dashboard</span>
                      </button>
                    )}

                    {showFinanceReceived && (
                      <button
                        onClick={() => handleSelectTab('finance-received')}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          activeTab === 'finance-received'
                            ? 'bg-[#FDF6E3] text-[#145A32] font-bold border border-[#145A32]/30'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Received</span>
                      </button>
                    )}

                    {showFinanceDebit && (
                      <button
                        onClick={() => handleSelectTab('finance-debit')}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          activeTab === 'finance-debit'
                            ? 'bg-[#FDF6E3] text-[#145A32] font-bold border border-[#145A32]/30'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />
                        <span>Debit</span>
                      </button>
                    )}

                    {showFinanceKind && (
                      <button
                        onClick={() => handleSelectTab('finance-kind-donation')}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          activeTab === 'finance-kind-donation'
                            ? 'bg-[#FDF6E3] text-[#145A32] font-bold border border-[#145A32]/30'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Gift className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Kind Donation</span>
                      </button>
                    )}

                    {showFinanceLoan && (
                      <button
                        onClick={() => handleSelectTab('finance-loan')}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          activeTab === 'finance-loan'
                            ? 'bg-[#FDF6E3] text-[#145A32] font-bold border border-[#145A32]/30'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Landmark className="w-3.5 h-3.5 text-amber-700" />
                        <span>Loan (Qarz)</span>
                      </button>
                    )}

                    {showFinanceLiability && (
                      <button
                        onClick={() => handleSelectTab('finance-liability')}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          activeTab === 'finance-liability'
                            ? 'bg-[#FDF6E3] text-[#145A32] font-bold border border-[#145A32]/30'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Receipt className="w-3.5 h-3.5 text-rose-600" />
                        <span>Liabilities & Bills</span>
                      </button>
                    )}

                    {showDonors && (
                      <button
                        onClick={() => handleSelectTab('donors')}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                          activeTab === 'donors'
                            ? 'bg-[#FDF6E3] text-[#145A32] font-bold border border-[#145A32]/30'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 text-pink-600" />
                        <span>Donors Directory</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Settings → Users & Roles Section */}
            {showSettings && (
              <div className="pt-3 border-t border-gray-100 mt-2">
                <button
                  onClick={() => handleSelectTab('settings-users')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all cursor-pointer ${
                    activeTab === 'settings-users'
                      ? 'bg-[#145A32] text-white shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Settings className={`w-4 h-4 ${activeTab === 'settings-users' ? 'text-white' : 'text-[#145A32]'}`} />
                    <span>Settings & Users</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 text-amber-900 font-bold rounded">
                    RBAC
                  </span>
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Footer Profile Box & Logout */}
        <div className="p-4 border-t border-gray-100 bg-[#FDF6E3]/40 space-y-3">
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#145A32] text-[#FDF6E3] font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="truncate">
                <p className="font-bold text-gray-800 truncate">{currentUser?.name || 'User'}</p>
                <span className="inline-block text-[10px] text-[#145A32] font-semibold">
                  {currentRole?.name || 'Authorized User'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              onLogout();
              if (onClose) onClose();
            }}
            className="w-full py-2 px-3 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

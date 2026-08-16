'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar, { MainTabType } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import StudentTable from '@/components/StudentTable';
import TeacherTable from '@/components/TeacherTable';
import AdmissionModal from '@/components/AdmissionModal';
import RecordDetailModal from '@/components/RecordDetailModal';
import IdCardModal from '@/components/IdCardModal';
import BulkActionBar from '@/components/BulkActionBar';
import LoginPage from '@/components/LoginPage';
import DonorDirectory from '@/components/DonorDirectory';
import UserSettings from '@/components/UserSettings';

// Finance Components
import FinanceDashboard from '@/components/finance/FinanceDashboard';
import FinanceReceived from '@/components/finance/FinanceReceived';
import FinanceDebit from '@/components/finance/FinanceDebit';
import FinanceKindDonation from '@/components/finance/FinanceKindDonation';
import FinanceLoan from '@/components/finance/FinanceLoan';
import FinanceLiability from '@/components/finance/FinanceLiability';

import { useAuth } from '@/context/AuthContext';
import {
  Student,
  Teacher,
  getStudents,
  getTeachers,
  deleteStudent,
  deleteTeacher,
  exportSelectedExcel
} from '@/lib/api';
import { GraduationCap, Users, UserPlus, RefreshCw, Plus, CheckCircle2 } from 'lucide-react';

export default function DashboardPage() {
  const {
    currentUser,
    currentRole,
    loading: authLoading,
    isAuthenticated,
    logout,
    hasPermission,
    canAccessModule,
    isCreateOnly
  } = useAuth();

  const [activeTab, setActiveTab] = useState<MainTabType>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);

  // Selection states
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  // Modals
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [admissionRole, setAdmissionRole] = useState<'student' | 'teacher'>('student');
  const [editRecord, setEditRecord] = useState<Student | Teacher | null>(null);

  const [detailRecord, setDetailRecord] = useState<Student | Teacher | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // ID Card Modal
  const [idCardRecord, setIdCardRecord] = useState<Student | Teacher | null>(null);
  const [idCardType, setIdCardType] = useState<'student' | 'teacher'>('student');
  const [idCardModalOpen, setIdCardModalOpen] = useState(false);

  const [isExporting, setIsExporting] = useState(false);

  // Calculate default valid tab when user logs in or role changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const allowedTabs: MainTabType[] = [];
    if (canAccessModule('students')) allowedTabs.push('students');
    if (canAccessModule('teachers')) allowedTabs.push('teachers');
    if (hasPermission('finance_dashboard', 'view')) allowedTabs.push('finance-dashboard');
    if (canAccessModule('finance_received')) allowedTabs.push('finance-received');
    if (canAccessModule('finance_debit')) allowedTabs.push('finance-debit');
    if (canAccessModule('finance_kind_donation')) allowedTabs.push('finance-kind-donation');
    if (canAccessModule('finance_loan')) allowedTabs.push('finance-loan');
    if (canAccessModule('finance_liability')) allowedTabs.push('finance-liability');
    if (hasPermission('finance_received', 'view')) allowedTabs.push('donors');
    if (canAccessModule('settings_users')) allowedTabs.push('settings-users');

    if (allowedTabs.length > 0 && !allowedTabs.includes(activeTab)) {
      setActiveTab(allowedTabs[0]);
    }
  }, [isAuthenticated, currentRole]);

  // Fetch Data Function for Students / Teachers
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    if (activeTab.startsWith('finance') || activeTab === 'donors' || activeTab === 'settings-users') return;

    if (activeTab === 'students' && !hasPermission('students', 'view')) return;
    if (activeTab === 'teachers' && !hasPermission('teachers', 'view')) return;

    setLoading(true);
    try {
      if (activeTab === 'students') {
        const data = await getStudents(searchQuery);
        setStudents(data);
      } else if (activeTab === 'teachers') {
        const data = await getTeachers(searchQuery);
        setTeachers(data);
      }
    } catch (err) {
      console.error('Failed to load records', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, isAuthenticated, hasPermission]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [loadData, isAuthenticated]);

  // Handlers for Student Selection
  const handleToggleSelectStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(students.map((s) => s.id));
    }
  };

  // Handlers for Teacher Selection
  const handleToggleSelectTeacher = (id: string) => {
    setSelectedTeacherIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllTeachers = () => {
    if (selectedTeacherIds.length === teachers.length) {
      setSelectedTeacherIds([]);
    } else {
      setSelectedTeacherIds(teachers.map((t) => t.id));
    }
  };

  // Open New Admission Modal
  const handleOpenAdmissionModal = (type: 'student' | 'teacher' = activeTab === 'teachers' ? 'teacher' : 'student') => {
    setAdmissionRole(type);
    setEditRecord(null);
    setAdmissionModalOpen(true);
  };

  // Open Edit Modal
  const handleEditRecord = (record: Student | Teacher) => {
    const isStud = 'student_class' in record;
    if (isStud && !hasPermission('students', 'edit')) return;
    if (!isStud && !hasPermission('teachers', 'edit')) return;

    setAdmissionRole(isStud ? 'student' : 'teacher');
    setEditRecord(record);
    setAdmissionModalOpen(true);
  };

  // Handle Delete Record
  const handleDeleteRecord = async (record: Student | Teacher) => {
    const isStud = 'student_class' in record;
    if (isStud && !hasPermission('students', 'delete')) return;
    if (!isStud && !hasPermission('teachers', 'delete')) return;

    const confirmText = `Are you sure you want to delete ${record.name} (${record.roll_no})? This action cannot be undone.`;

    if (window.confirm(confirmText)) {
      try {
        if (isStud) {
          await deleteStudent(record.id);
          setSelectedStudentIds((prev) => prev.filter((id) => id !== record.id));
        } else {
          await deleteTeacher(record.id);
          setSelectedTeacherIds((prev) => prev.filter((id) => id !== record.id));
        }
        loadData();
      } catch (err: any) {
        alert(err.message || 'Failed to delete record.');
      }
    }
  };

  // View Record Detail
  const handleViewDetail = (record: Student | Teacher) => {
    setDetailRecord(record);
    setDetailModalOpen(true);
  };

  // View ID Card
  const handleViewIdCard = (record: Student | Teacher) => {
    const isStud = 'student_class' in record;
    setIdCardRecord(record);
    setIdCardType(isStud ? 'student' : 'teacher');
    setIdCardModalOpen(true);
  };

  // Export Selected to Excel
  const handleExportSelected = async () => {
    if (activeTab !== 'students' && activeTab !== 'teachers') return;
    const ids = activeTab === 'students' ? selectedStudentIds : selectedTeacherIds;
    if (ids.length === 0) return;

    setIsExporting(true);
    try {
      await exportSelectedExcel(activeTab, ids);
    } catch (err) {
      alert('Failed to export selected records to Excel.');
    } finally {
      setIsExporting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#145A32] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#FDF6E3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Render Login Page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const currentSelectedCount =
    activeTab === 'students' ? selectedStudentIds.length : activeTab === 'teachers' ? selectedTeacherIds.length : 0;

  const canCreateCurrent =
    activeTab === 'students' ? hasPermission('students', 'create') : hasPermission('teachers', 'create');

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Sidebar with Mobile Drawer */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
        }}
        onOpenAdmissionModal={handleOpenAdmissionModal}
        onLogout={logout}
        studentCount={students.length}
        teacherCount={teachers.length}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Top Bar with Hamburger */}
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        onLogout={logout}
        onMenuClick={() => setMobileMenuOpen(true)}
      />

      {/* Main Content Area */}
      <main className="ml-0 md:ml-64 pt-16 p-3 sm:p-5 md:p-8 min-h-[calc(100vh-4rem)] transition-all">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
          {/* Header Bar for Students / Teachers (when view permission exists) */}
          {(activeTab === 'students' || activeTab === 'teachers') && hasPermission(activeTab, 'view') && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FDF6E3] text-[#145A32] flex items-center justify-center border border-[#145A32]/20 shadow-2xs shrink-0">
                  {activeTab === 'students' ? (
                    <GraduationCap className="w-5 h-5" />
                  ) : (
                    <Users className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h1 className="text-base sm:text-xl font-bold font-serif text-[#145A32] tracking-tight">
                    {activeTab === 'students' ? 'Student Admissions Registry' : 'Faculty & Teachers Directory'}
                  </h1>
                  <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
                    {activeTab === 'students'
                      ? 'Manage student records, class enrollments, Hijri dates, PDF & ID Card exports'
                      : 'Manage teacher profiles, subject assignments, registration, PDF & ID Card exports'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={loadData}
                  className="p-2 sm:p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                  title="Refresh Table"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                {canCreateCurrent && (
                  <button
                    onClick={() => handleOpenAdmissionModal(activeTab === 'students' ? 'student' : 'teacher')}
                    className="px-3.5 sm:px-4 py-2 bg-[#145A32] hover:bg-[#0E4124] text-[#FDF6E3] text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-initial justify-center cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>+ New {activeTab === 'students' ? 'Student' : 'Teacher'}</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Render Active View */}
          {activeTab === 'students' && (
            isCreateOnly('students') ? (
              <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#FDF6E3] text-[#145A32] mx-auto flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold font-serif text-gray-900">Student Admission Entry</h2>
                <p className="text-xs text-gray-500">
                  You have permission to register new students. Click below to open the admission form.
                </p>
                <button
                  onClick={() => handleOpenAdmissionModal('student')}
                  className="px-6 py-2.5 bg-[#145A32] text-white text-xs font-bold rounded-xl hover:bg-[#0E4124] shadow-sm flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Open Student Admission Form</span>
                </button>
              </div>
            ) : (
              <StudentTable
                students={students}
                selectedIds={selectedStudentIds}
                onToggleSelect={handleToggleSelectStudent}
                onToggleSelectAll={handleToggleSelectAllStudents}
                onViewProfile={handleViewDetail}
                onViewIdCard={handleViewIdCard}
                onEditStudent={handleEditRecord}
                onDeleteStudent={handleDeleteRecord}
                isLoading={loading}
              />
            )
          )}

          {activeTab === 'teachers' && (
            isCreateOnly('teachers') ? (
              <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl border border-gray-200 shadow-sm text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#FDF6E3] text-[#145A32] mx-auto flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold font-serif text-gray-900">Teacher Registration Entry</h2>
                <p className="text-xs text-gray-500">
                  You have permission to register new faculty members. Click below to open the registration form.
                </p>
                <button
                  onClick={() => handleOpenAdmissionModal('teacher')}
                  className="px-6 py-2.5 bg-[#145A32] text-white text-xs font-bold rounded-xl hover:bg-[#0E4124] shadow-sm flex items-center gap-2 mx-auto cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Open Teacher Registration Form</span>
                </button>
              </div>
            ) : (
              <TeacherTable
                teachers={teachers}
                selectedIds={selectedTeacherIds}
                onToggleSelect={handleToggleSelectTeacher}
                onToggleSelectAll={handleToggleSelectAllTeachers}
                onViewProfile={handleViewDetail}
                onViewIdCard={handleViewIdCard}
                onEditTeacher={handleEditRecord}
                onDeleteTeacher={handleDeleteRecord}
                isLoading={loading}
              />
            )
          )}

          {activeTab === 'donors' && <DonorDirectory />}

          {activeTab === 'finance-dashboard' && <FinanceDashboard />}
          {activeTab === 'finance-received' && <FinanceReceived />}
          {activeTab === 'finance-debit' && <FinanceDebit />}
          {activeTab === 'finance-kind-donation' && <FinanceKindDonation />}
          {activeTab === 'finance-loan' && <FinanceLoan />}
          {activeTab === 'finance-liability' && <FinanceLiability />}

          {activeTab === 'settings-users' && <UserSettings />}
        </div>
      </main>

      {/* Floating Bulk Action Bar (for Students & Teachers) */}
      {(activeTab === 'students' || activeTab === 'teachers') && hasPermission(activeTab, 'view') && (
        <BulkActionBar
          selectedCount={currentSelectedCount}
          onExportExcel={handleExportSelected}
          onClearSelection={() => {
            if (activeTab === 'students') setSelectedStudentIds([]);
            else setSelectedTeacherIds([]);
          }}
          isExporting={isExporting}
        />
      )}

      {/* Admission / Edit Modal */}
      <AdmissionModal
        isOpen={admissionModalOpen}
        onClose={() => {
          setAdmissionModalOpen(false);
          setEditRecord(null);
        }}
        onSuccess={loadData}
        initialRole={admissionRole}
        editRecord={editRecord}
      />

      {/* Record Detail Profile View Modal */}
      <RecordDetailModal
        record={detailRecord}
        type={activeTab === 'students' ? 'student' : 'teacher'}
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setDetailRecord(null);
        }}
        onViewIdCard={handleViewIdCard}
        onEdit={handleEditRecord}
        onDelete={handleDeleteRecord}
      />

      {/* Official ID Card Preview & Print Modal */}
      <IdCardModal
        record={idCardRecord}
        type={idCardType}
        isOpen={idCardModalOpen}
        onClose={() => {
          setIdCardModalOpen(false);
          setIdCardRecord(null);
        }}
      />
    </div>
  );
}

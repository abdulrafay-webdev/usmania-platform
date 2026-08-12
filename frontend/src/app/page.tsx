'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar, { MainTabType } from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import StudentTable from '@/components/StudentTable';
import TeacherTable from '@/components/TeacherTable';
import AdmissionModal from '@/components/AdmissionModal';
import RecordDetailModal from '@/components/RecordDetailModal';
import BulkActionBar from '@/components/BulkActionBar';
import LoginScreen from '@/components/LoginScreen';

// Finance Components
import FinanceDashboard from '@/components/finance/FinanceDashboard';
import FinanceReceived from '@/components/finance/FinanceReceived';
import FinanceDebit from '@/components/finance/FinanceDebit';
import FinanceKindDonation from '@/components/finance/FinanceKindDonation';
import FinanceLoan from '@/components/finance/FinanceLoan';

import {
  Student,
  Teacher,
  getStudents,
  getTeachers,
  deleteStudent,
  deleteTeacher,
  exportSelectedExcel
} from '@/lib/api';
import { GraduationCap, Users, UserPlus, RefreshCw, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>('usmaniatrust@gmail.com');

  const [activeTab, setActiveTab] = useState<MainTabType>('students');
  const [searchQuery, setSearchQuery] = useState('');

  // Data states
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection states
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  // Modals
  const [admissionModalOpen, setAdmissionModalOpen] = useState(false);
  const [admissionRole, setAdmissionRole] = useState<'student' | 'teacher'>('student');
  const [editRecord, setEditRecord] = useState<Student | Teacher | null>(null);

  const [detailRecord, setDetailRecord] = useState<Student | Teacher | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const [isExporting, setIsExporting] = useState(false);

  // Check login session on mount
  useEffect(() => {
    const token = localStorage.getItem('jut_token');
    const savedUser = localStorage.getItem('jut_user');
    if (token) {
      setIsAuthenticated(true);
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          if (parsed.email) setUserEmail(parsed.email);
        } catch (e) {}
      }
    }
    setAuthChecking(false);
  }, []);

  // Fetch Data Function for Students / Teachers
  const loadData = useCallback(async () => {
    if (!isAuthenticated) return;
    if (activeTab.startsWith('finance')) return; // Finance tabs load their own data internally

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
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [loadData, isAuthenticated]);

  // Auth Handlers
  const handleLoginSuccess = (user: any) => {
    setIsAuthenticated(true);
    if (user?.email) setUserEmail(user.email);
  };

  const handleLogout = () => {
    localStorage.removeItem('jut_token');
    localStorage.removeItem('jut_user');
    setIsAuthenticated(false);
    setSelectedStudentIds([]);
    setSelectedTeacherIds([]);
  };

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
    setAdmissionRole(isStud ? 'student' : 'teacher');
    setEditRecord(record);
    setAdmissionModalOpen(true);
  };

  // Handle Delete Record
  const handleDeleteRecord = async (record: Student | Teacher) => {
    const isStud = 'student_class' in record;
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

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#145A32] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Render Login Page if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const currentSelectedCount =
    activeTab === 'students' ? selectedStudentIds.length : activeTab === 'teachers' ? selectedTeacherIds.length : 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Fixed Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
        }}
        onOpenAdmissionModal={handleOpenAdmissionModal}
        onLogout={handleLogout}
        studentCount={students.length}
        teacherCount={teachers.length}
        userEmail={userEmail}
      />

      {/* Fixed Top Bar */}
      <TopBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeTab={activeTab}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="ml-64 pt-16 p-8 min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Bar for Students / Teachers */}
          {(activeTab === 'students' || activeTab === 'teachers') && (
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#FDF6E3] text-[#145A32] flex items-center justify-center border border-[#145A32]/20 shadow-2xs">
                  {activeTab === 'students' ? (
                    <GraduationCap className="w-5 h-5" />
                  ) : (
                    <Users className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h1 className="text-xl font-bold font-serif text-[#145A32] tracking-tight">
                    {activeTab === 'students' ? 'Student Admissions Registry' : 'Faculty & Teachers Directory'}
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">
                    {activeTab === 'students'
                      ? 'Manage student records, class enrollments, Hijri dates, PDF & ID Card exports'
                      : 'Manage teacher profiles, subject assignments, registration, PDF & ID Card exports'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={loadData}
                  className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-xs font-medium flex items-center gap-1.5"
                  title="Refresh Table"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  onClick={() => handleOpenAdmissionModal(activeTab === 'students' ? 'student' : 'teacher')}
                  className="px-4 py-2 bg-[#145A32] hover:bg-[#0E4124] text-[#FDF6E3] text-xs font-semibold rounded-lg shadow-sm transition-all duration-150 flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ New {activeTab === 'students' ? 'Student' : 'Teacher'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Render Active View */}
          {activeTab === 'students' && (
            <StudentTable
              students={students}
              selectedIds={selectedStudentIds}
              onToggleSelect={handleToggleSelectStudent}
              onToggleSelectAll={handleToggleSelectAllStudents}
              onViewProfile={handleViewDetail}
              onEditStudent={handleEditRecord}
              onDeleteStudent={handleDeleteRecord}
              isLoading={loading}
            />
          )}

          {activeTab === 'teachers' && (
            <TeacherTable
              teachers={teachers}
              selectedIds={selectedTeacherIds}
              onToggleSelect={handleToggleSelectTeacher}
              onToggleSelectAll={handleToggleSelectAllTeachers}
              onViewProfile={handleViewDetail}
              onEditTeacher={handleEditRecord}
              onDeleteTeacher={handleDeleteRecord}
              isLoading={loading}
            />
          )}

          {activeTab === 'finance-dashboard' && <FinanceDashboard />}
          {activeTab === 'finance-received' && <FinanceReceived />}
          {activeTab === 'finance-debit' && <FinanceDebit />}
          {activeTab === 'finance-kind-donation' && <FinanceKindDonation />}
          {activeTab === 'finance-loan' && <FinanceLoan />}
        </div>
      </main>

      {/* Floating Bulk Action Bar (for Students & Teachers) */}
      {(activeTab === 'students' || activeTab === 'teachers') && (
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
        onEdit={handleEditRecord}
        onDelete={handleDeleteRecord}
      />
    </div>
  );
}

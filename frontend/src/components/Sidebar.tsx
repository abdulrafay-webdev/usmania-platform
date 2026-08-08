'use client';

import React from 'react';
import TrustLogo from './TrustLogo';
import { Users, GraduationCap, UserPlus, Building2, LogOut } from 'lucide-react';

interface SidebarProps {
  activeTab: 'students' | 'teachers';
  onTabChange: (tab: 'students' | 'teachers') => void;
  onOpenAdmissionModal: (type?: 'student' | 'teacher') => void;
  onLogout: () => void;
  studentCount?: number;
  teacherCount?: number;
  userEmail?: string;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  onOpenAdmissionModal,
  onLogout,
  studentCount = 0,
  teacherCount = 0,
  userEmail = 'usmaniatrust@gmail.com'
}: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col justify-between z-30 shadow-xs">
      <div>
        {/* Top Header */}
        <div className="p-5 border-b border-gray-100 bg-[#FAF5EA]/50">
          <TrustLogo />
        </div>

        {/* Action Button */}
        <div className="p-4">
          <button
            onClick={() => onOpenAdmissionModal(activeTab === 'students' ? 'student' : 'teacher')}
            className="w-full py-2.5 px-4 bg-[#145A32] hover:bg-[#0E4124] text-white font-medium rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all duration-150 active:scale-[0.98] text-sm"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ New Admission</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="px-3 space-y-1">
          <button
            onClick={() => onTabChange('students')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'students'
                ? 'bg-[#145A32] text-white shadow-xs'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <GraduationCap className={`w-4 h-4 ${activeTab === 'students' ? 'text-white' : 'text-[#145A32]'}`} />
              <span>Students</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === 'students'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#FDF6E3] text-[#145A32] border border-[#145A32]/20'
              }`}
            >
              {studentCount}
            </span>
          </button>

          <button
            onClick={() => onTabChange('teachers')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'teachers'
                ? 'bg-[#145A32] text-white shadow-xs'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className={`w-4 h-4 ${activeTab === 'teachers' ? 'text-white' : 'text-[#145A32]'}`} />
              <span>Teachers</span>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                activeTab === 'teachers'
                  ? 'bg-white/20 text-white'
                  : 'bg-[#FDF6E3] text-[#145A32] border border-[#145A32]/20'
              }`}
            >
              {teacherCount}
            </span>
          </button>
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="p-4 border-t border-gray-100 bg-[#FDF6E3]/40 space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <Building2 className="w-4 h-4 text-[#145A32] shrink-0" />
            <div className="truncate">
              <p className="font-bold text-gray-800 truncate">{userEmail}</p>
              <p className="text-[10px] text-gray-500">Jamia Usmania Admin</p>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full py-1.5 px-3 border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

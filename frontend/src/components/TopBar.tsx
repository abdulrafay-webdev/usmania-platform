'use client';

import React from 'react';
import { Search, Calendar, ShieldCheck, LogOut, Menu, UserCheck } from 'lucide-react';
import { MainTabType } from './Sidebar';
import { useAuth } from '@/context/AuthContext';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: MainTabType;
  onLogout?: () => void;
  onMenuClick?: () => void;
}

export default function TopBar({
  searchQuery,
  onSearchChange,
  activeTab,
  onLogout,
  onMenuClick
}: TopBarProps) {
  const { currentUser, currentRole } = useAuth();

  const todayGregorian = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const getPlaceholder = () => {
    if (activeTab === 'academic-dashboard') return 'Search academic records, class, teacher...';
    if (activeTab === 'students') return 'Search students by name, roll no...';
    if (activeTab === 'teachers') return 'Search teachers by name, roll no...';
    if (activeTab === 'staff') return 'Search staff by name, roll no, designation...';
    if (activeTab === 'donors') return 'Search donors...';
    if (activeTab === 'finance-dashboard') return 'Search financial metrics...';
    if (activeTab === 'finance-received') return 'Search received donations...';
    if (activeTab === 'finance-debit') return 'Search debits and expenses...';
    if (activeTab === 'finance-kind-donation') return 'Search in-kind items...';
    if (activeTab === 'finance-loan') return 'Search loans & lenders...';
    if (activeTab === 'finance-liability') return 'Search bills & liabilities...';
    if (activeTab === 'settings-users') return 'Search users & roles...';
    return 'Search records...';
  };

  const initials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'JU';

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-0 md:left-64 z-30 flex items-center justify-between px-3 sm:px-6 shadow-xs gap-2 sm:gap-4">
      {/* Left: Mobile Hamburger & Search Input */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-md">
        {/* Mobile Hamburger Button */}
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 text-gray-700 hover:text-[#145A32] hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            title="Open Navigation Menu"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={getPlaceholder()}
            className="w-full pl-9 pr-4 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#145A32]/30 focus:border-[#145A32] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {/* Date Display */}
        <div className="hidden lg:flex items-center gap-2 bg-[#FDF6E3] px-3 py-1.5 rounded-lg border border-[#145A32]/20 text-xs font-medium text-[#145A32]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{todayGregorian}</span>
        </div>

        {/* User / Role Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 border-l border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#145A32] text-[#FDF6E3] flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              {initials}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                {currentUser?.name || 'User'}
                <ShieldCheck className="w-3.5 h-3.5 text-[#145A32]" />
              </span>
              <span className="text-[10px] text-gray-500 max-w-[120px] md:max-w-[140px] truncate">
                {currentRole?.name || currentUser?.email || 'Authorized'}
              </span>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

'use client';

import React from 'react';
import { Search, Calendar, ShieldCheck, LogOut } from 'lucide-react';
import { MainTabType } from './Sidebar';

interface TopBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: MainTabType;
  userEmail?: string;
  onLogout?: () => void;
}

export default function TopBar({
  searchQuery,
  onSearchChange,
  activeTab,
  userEmail = 'usmaniatrust@gmail.com',
  onLogout
}: TopBarProps) {
  const todayGregorian = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const getPlaceholder = () => {
    if (activeTab === 'students') return 'Search students by name, roll no, CNIC...';
    if (activeTab === 'teachers') return 'Search teachers by name, roll no, subject...';
    if (activeTab === 'donors') return 'Search donors by name, phone, email, city...';
    if (activeTab === 'finance-received') return 'Search received entries by payer name, note...';
    if (activeTab === 'finance-debit') return 'Search debits by paid to, purpose...';
    if (activeTab === 'finance-kind-donation') return 'Search in-kind items, donor name...';
    if (activeTab === 'finance-loan') return 'Search loans by lender name...';
    return 'Search Finance records...';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-20 flex items-center justify-between px-6 shadow-xs">
      {/* Search Input */}
      <div className="relative w-96">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={getPlaceholder()}
          className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#145A32]/30 focus:border-[#145A32] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Date Display */}
        <div className="flex items-center gap-2 bg-[#FDF6E3] px-3 py-1.5 rounded-lg border border-[#145A32]/20 text-xs font-medium text-[#145A32]">
          <Calendar className="w-3.5 h-3.5" />
          <span>{todayGregorian}</span>
        </div>

        {/* User / Admin Indicator */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#145A32] text-[#FDF6E3] flex items-center justify-center font-bold text-xs shadow-xs">
              JU
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                Admin Portal
                <ShieldCheck className="w-3 h-3 text-[#145A32]" />
              </span>
              <span className="text-[10px] text-gray-500 max-w-[140px] truncate">{userEmail}</span>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

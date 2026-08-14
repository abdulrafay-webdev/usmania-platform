'use client';

import React from 'react';
import { FileSpreadsheet, XCircle } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  onExportExcel: () => void;
  onClearSelection: () => void;
  isExporting?: boolean;
}

export default function BulkActionBar({
  selectedCount,
  onExportExcel,
  onClearSelection,
  isExporting = false
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 z-40 bg-[#145A32] text-white px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-2xl border border-white/20 flex items-center justify-between sm:justify-start gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2 border-r border-white/20 pr-3 sm:pr-4">
        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#FDF6E3] text-[#145A32] flex items-center justify-center font-bold text-xs">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold tracking-wide truncate">
          {selectedCount === 1 ? '1 Selected' : `${selectedCount} Selected`}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExportExcel}
          disabled={isExporting}
          className="px-3 py-1.5 sm:px-3.5 sm:py-1.5 bg-[#FDF6E3] hover:bg-white text-[#145A32] font-bold text-xs rounded-lg transition-all flex items-center gap-1.5 sm:gap-2 shadow-xs disabled:opacity-50"
        >
          {isExporting ? (
            <div className="w-3.5 h-3.5 border-2 border-[#145A32] border-t-transparent rounded-full animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4 text-[#145A32]" />
          )}
          <span className="hidden xs:inline">Export Excel</span>
          <span className="xs:hidden">Excel</span>
        </button>

        <button
          onClick={onClearSelection}
          className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Clear selection"
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

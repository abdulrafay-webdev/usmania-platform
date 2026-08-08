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
    <div className="fixed bottom-6 right-8 z-40 bg-[#145A32] text-white px-5 py-3 rounded-xl shadow-2xl border border-white/20 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2 border-r border-white/20 pr-4">
        <span className="w-6 h-6 rounded-full bg-[#FDF6E3] text-[#145A32] flex items-center justify-center font-bold text-xs">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold tracking-wide">
          {selectedCount === 1 ? 'Record Selected' : 'Records Selected'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onExportExcel}
          disabled={isExporting}
          className="px-3.5 py-1.5 bg-[#FDF6E3] hover:bg-white text-[#145A32] font-bold text-xs rounded-lg transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          {isExporting ? (
            <div className="w-3.5 h-3.5 border-2 border-[#145A32] border-t-transparent rounded-full animate-spin" />
          ) : (
            <FileSpreadsheet className="w-4 h-4 text-[#145A32]" />
          )}
          <span>Export Selected to Excel</span>
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

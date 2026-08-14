'use client';

import React, { useState } from 'react';
import { exportFinanceExcel } from '@/lib/api';
import {
  X,
  FileSpreadsheet,
  Calendar,
  Download,
  CheckCircle2,
  AlertCircle,
  Layers,
  Sparkles
} from 'lucide-react';

interface FinanceExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DurationPreset = 'all' | 'today' | 'this-month' | 'last-30' | 'this-year' | 'custom';

export default function FinanceExcelExportModal({
  isOpen,
  onClose
}: FinanceExcelExportModalProps) {
  const [preset, setPreset] = useState<DurationPreset>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handlePresetSelect = (selectedPreset: DurationPreset) => {
    setPreset(selectedPreset);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (selectedPreset === 'all') {
      setDateFrom('');
      setDateTo('');
    } else if (selectedPreset === 'today') {
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (selectedPreset === 'this-month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      setDateFrom(firstDay);
      setDateTo(todayStr);
    } else if (selectedPreset === 'last-30') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setDateFrom(thirtyDaysAgo);
      setDateTo(todayStr);
    } else if (selectedPreset === 'this-year') {
      const firstDayYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      setDateFrom(firstDayYear);
      setDateTo(todayStr);
    }
  };

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setDownloading(true);
    setErrorMsg('');

    try {
      await exportFinanceExcel(
        dateFrom || undefined,
        dateTo || undefined
      );
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to download Excel report');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-lg overflow-hidden my-8 animate-fadeIn">
        {/* Header */}
        <div className="bg-[#145A32] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <FileSpreadsheet className="w-5 h-5 text-[#FDF6E3]" />
            </div>
            <div>
              <h3 className="text-base font-bold font-serif">
                Download Finance Excel Report
              </h3>
              <p className="text-[11px] text-[#FDF6E3]/80">
                مکمل فنانشل ریکارڈ ایکسل میں ڈاؤن لوڈ کریں
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleDownload} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Duration Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              Select Duration / Time Period (مدت منتخب کریں)
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'All Time (مکمل ریکارڈ)', sub: 'From beginning' },
                { id: 'today', label: 'Today (آج کا دن)', sub: 'Single day' },
                { id: 'this-month', label: 'This Month (اس ماہ)', sub: 'Current month' },
                { id: 'last-30', label: 'Last 30 Days', sub: 'Past 1 month' },
                { id: 'this-year', label: 'This Year (اس سال)', sub: 'Year to date' },
                { id: 'custom', label: 'Custom Range (اپنی مرضی)', sub: 'Pick dates' }
              ].map((p) => {
                const isSelected = preset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePresetSelect(p.id as DurationPreset)}
                    className={`p-2.5 text-left rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#145A32] text-white border-[#145A32] shadow-xs'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-800 border-gray-200'
                    }`}
                  >
                    <div className="text-xs font-bold leading-tight">{p.label}</div>
                    <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                      {p.sub}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range Inputs */}
          <div className="p-3.5 bg-[#FAF5EA]/80 rounded-xl border border-[#145A32]/20 space-y-3">
            <div className="text-xs font-bold text-[#145A32] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>Report Date Range:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  From Date (شروع کی تاریخ)
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPreset('custom');
                  }}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">
                  To Date (آخری تاریخ)
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPreset('custom');
                  }}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>
            </div>
          </div>

          {/* Included Sheets Information */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-600 space-y-1.5">
            <div className="font-bold text-gray-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#145A32]" />
              <span>Multi-Sheet Comprehensive Excel Workbook Includes:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-gray-500 pl-1">
              <li><b>Summary & Balances:</b> Grand total, Cash, JazzCash, Easypaisa, Meezan Bank</li>
              <li><b>Received Ledger:</b> Income & Donations with donor contact & purpose</li>
              <li><b>Debit Ledger:</b> Expenses & payments with recipient details</li>
              <li><b>In-Kind Donations:</b> Physical items, categories & estimated values</li>
              <li><b>Loans (Qarz):</b> Active loans, repayments, and remaining balances</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-xs font-semibold hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={downloading}
              className="px-5 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Generating Excel...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Excel Report (.xlsx)</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

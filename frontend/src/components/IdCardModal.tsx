'use client';

import React, { useState } from 'react';
import { Student, Teacher, getStudentIdCardDownloadUrl, getTeacherIdCardDownloadUrl } from '@/lib/api';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Building2,
  Calendar,
  Phone,
  CreditCard,
  Sparkles,
  Layers,
  Award
} from 'lucide-react';
import Image from 'next/image';

interface IdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: Student | Teacher | null;
  type: 'student' | 'teacher';
}

export default function IdCardModal({
  isOpen,
  onClose,
  record,
  type
}: IdCardModalProps) {
  const [activeSide, setActiveSide] = useState<'both' | 'front' | 'back'>('both');

  if (!isOpen || !record) return null;

  const isStudent = type === 'student';
  const student = isStudent ? (record as Student) : null;
  const teacher = !isStudent ? (record as Teacher) : null;

  const downloadUrl = isStudent
    ? getStudentIdCardDownloadUrl(record.id)
    : getTeacherIdCardDownloadUrl(record.id);

  const fatherName = isStudent
    ? student?.father_name || student?.father_guardian_name || 'N/A'
    : teacher?.father_guardian_name || 'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-4xl overflow-hidden my-6 sm:my-8 animate-fadeIn">
        {/* Header */}
        <div className="bg-[#145A32] text-white px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-[#FDF6E3]" />
            </div>
            <div className="overflow-hidden">
              <h3 className="text-sm sm:text-base font-bold font-serif truncate">
                {record.name} — Official ID Card
              </h3>
              <p className="text-[10px] sm:text-[11px] text-[#FDF6E3]/80 truncate">
                CR80 Standard PVC Card Format (85.6mm × 54mm)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Direct PDF Download Link */}
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 sm:px-3.5 py-1.5 bg-[#FDF6E3] hover:bg-white text-[#145A32] rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download PDF</span>
            </a>

            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
          <span className="text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
            Card Preview
          </span>

          <div className="flex items-center gap-1 bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => setActiveSide('both')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeSide === 'both' ? 'bg-white text-[#145A32] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Both Sides
            </button>
            <button
              onClick={() => setActiveSide('front')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeSide === 'front' ? 'bg-white text-[#145A32] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Front Side
            </button>
            <button
              onClick={() => setActiveSide('back')}
              className={`px-2.5 sm:px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeSide === 'back' ? 'bg-white text-[#145A32] shadow-xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Back Side
            </button>
          </div>
        </div>

        {/* Card Stage / Display Area */}
        <div className="p-4 sm:p-8 bg-[#F4F6F8] flex flex-wrap items-center justify-center gap-6 sm:gap-8 min-h-[300px] overflow-x-auto">
          {/* ================= FRONT SIDE CARD ================= */}
          {(activeSide === 'both' || activeSide === 'front') && (
            <div className="w-full max-w-[340px] sm:w-[360px] h-[228px] bg-white rounded-xl shadow-xl border border-gray-300 overflow-hidden flex flex-col justify-between relative transform hover:scale-[1.02] transition-transform duration-200 shrink-0">
              {/* Front Header */}
              <div className="bg-[#145A32] text-white px-3 py-2 flex items-center gap-2.5 border-b border-emerald-900">
                <div className="w-8 h-8 rounded-full bg-white p-0.5 shadow-xs flex items-center justify-center shrink-0 border border-emerald-700">
                  <img
                    src="/images/logo.png"
                    alt="Jamia Usmania Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="leading-none overflow-hidden">
                  <h4 className="text-xs font-extrabold font-serif tracking-wide text-white truncate">
                    JAMIA USMANIA TRUST
                  </h4>
                  <p className="text-[9px] font-bold text-[#FDF6E3] mt-0.5 tracking-wider uppercase truncate">
                    OFFICIAL {isStudent ? 'STUDENT' : 'FACULTY'} IDENTITY CARD
                  </p>
                </div>
              </div>

              {/* Front Body */}
              <div className="p-3 flex gap-3 flex-1 items-center bg-white">
                {/* Left Photo Column */}
                <div className="flex flex-col items-center shrink-0 w-20">
                  <div className="w-20 h-24 bg-gray-100 rounded-md border border-[#145A32] overflow-hidden flex items-center justify-center shadow-2xs">
                    {record.picture ? (
                      <img
                        src={record.picture}
                        alt={record.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-[9px] font-bold text-gray-400 text-center">NO PHOTO</div>
                    )}
                  </div>
                  <div className="mt-1 w-full bg-[#145A32] text-white text-[9px] font-mono font-bold text-center py-0.5 rounded shadow-2xs truncate px-1">
                    {record.roll_no}
                  </div>
                </div>

                {/* Right Info Column */}
                <div className="flex-1 space-y-0.5 text-[11px] overflow-hidden">
                  <div className="font-extrabold text-[#145A32] text-xs leading-tight truncate">
                    {record.name}
                  </div>
                  <div className="text-gray-700 flex items-center gap-1 truncate text-[10px]">
                    <span className="font-bold text-[#145A32]">Father:</span>
                    <span className="truncate">{fatherName}</span>
                  </div>

                  {isStudent ? (
                    <>
                      <div className="text-gray-700 flex items-center gap-1 truncate text-[10px]">
                        <span className="font-bold text-[#145A32]">Class:</span>
                        <span className="font-semibold text-gray-900 truncate">{student?.student_class || 'N/A'}</span>
                      </div>
                      {student?.assigned_teacher_name && (
                        <div className="text-gray-700 flex items-center gap-1 truncate text-[10px]">
                          <span className="font-bold text-[#145A32]">Ustad:</span>
                          <span className="text-[#145A32] font-semibold truncate">{student.assigned_teacher_name}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-700 flex items-center gap-1 truncate text-[10px]">
                      <span className="font-bold text-[#145A32]">Subject:</span>
                      <span className="font-semibold text-gray-900 truncate">{teacher?.subject || 'N/A'}</span>
                    </div>
                  )}

                  <div className="text-gray-700 flex items-center gap-1 truncate text-[10px]">
                    <span className="font-bold text-[#145A32]">CNIC:</span>
                    <span className="font-mono text-gray-800">{record.nic || 'N/A'}</span>
                  </div>

                  <div className="text-gray-700 flex items-center gap-1 truncate text-[10px]">
                    <span className="font-bold text-[#145A32]">Phone:</span>
                    <span className="font-mono text-gray-800">{record.contact || 'N/A'}</span>
                  </div>

                  <div className="text-gray-500 flex items-center gap-1 truncate text-[9px]">
                    <span className="font-bold text-[#145A32]">Hijri:</span>
                    <span>{record.islamic_date || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Front Footer Strip */}
              <div className="bg-gray-50 border-t border-[#145A32]/30 px-3 py-1 flex items-center justify-between text-[9px] text-[#145A32] font-semibold">
                <span>www.usmaniatrust.org</span>
                <span className="text-gray-500">Valid: 2026–2027</span>
              </div>
            </div>
          )}

          {/* ================= BACK SIDE CARD ================= */}
          {(activeSide === 'both' || activeSide === 'back') && (
            <div className="w-full max-w-[340px] sm:w-[360px] h-[228px] bg-[#FAF5EA] rounded-xl shadow-xl border border-gray-300 overflow-hidden flex flex-col justify-between relative transform hover:scale-[1.02] transition-transform duration-200 shrink-0">
              {/* Back Header */}
              <div className="bg-[#145A32] text-white px-3 py-2 flex items-center gap-2.5 border-b border-emerald-900">
                <div className="w-8 h-8 rounded-full bg-white p-0.5 shadow-xs flex items-center justify-center shrink-0 border border-emerald-700">
                  <img
                    src="/images/logo.png"
                    alt="Jamia Usmania Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="leading-none overflow-hidden">
                  <h4 className="text-xs font-extrabold font-serif tracking-wide text-white truncate">
                    JAMIA USMANIA TRUST
                  </h4>
                  <p className="text-[9px] font-bold text-[#FDF6E3] mt-0.5 tracking-wider uppercase truncate">
                    CAMPUS RULES & INSTRUCTIONS
                  </p>
                </div>
              </div>

              {/* Back Body */}
              <div className="p-3.5 space-y-1.5 flex-1 text-[10px] text-gray-700 leading-snug">
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-[#145A32]">1.</span>
                  <span>This card must be worn and displayed inside campus premises at all times.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-[#145A32]">2.</span>
                  <span>Non-transferable. Property of Jamia Usmania Trust.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-[#145A32]">3.</span>
                  <span>Report lost cards immediately to the administration office.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="font-bold text-[#145A32]">4.</span>
                  <span>Helpline: +92 300 1234567 | info@jamiausmania.edu.pk</span>
                </div>

                {/* Signature Box */}
                <div className="pt-2 mt-2 border-t border-[#145A32]/20 flex items-center justify-between">
                  <div className="text-[9px] text-gray-500">
                    <div>Issued: {record.admission_date || '2026-01-01'}</div>
                    <div>Karachi, Pakistan</div>
                  </div>

                  <div className="text-center">
                    <div className="w-28 border-b border-gray-400 mb-0.5" />
                    <span className="text-[8.5px] font-bold text-[#145A32] block">
                      Authorized Trustee Seal
                    </span>
                  </div>
                </div>
              </div>

              {/* Back Footer */}
              <div className="bg-[#145A32] text-white text-[8px] text-center py-0.5 font-medium tracking-wide">
                Jamia Usmania Trust • Islamic Education & Welfare Platform
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-1.5 text-center sm:text-left">
            <Sparkles className="w-4 h-4 text-[#145A32] shrink-0" />
            <span>Standard CR80 size ready for PVC plastic card or paper printing</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors flex-1 sm:flex-initial"
            >
              Close
            </button>

            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 sm:px-5 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 flex-1 sm:flex-initial"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

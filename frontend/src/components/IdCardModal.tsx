'use client';

import React, { useState } from 'react';
import { Student, Teacher, getStudentIdCardDownloadUrl, getTeacherIdCardDownloadUrl } from '@/lib/api';
import {
  X,
  Printer,
  Download,
  CreditCard,
  Sparkles,
  Globe,
  Mail,
  Phone
} from 'lucide-react';

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
        {/* Modal Window Header */}
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
                Standard CR80 PVC Format (85.6mm × 54mm) • White Header Edition
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
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
            Interactive Visual Card Preview
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
        <div className="p-4 sm:p-8 bg-[#F4F6F8] flex flex-wrap items-center justify-center gap-6 sm:gap-8 min-h-[340px] overflow-x-auto">
          {/* ================= FRONT SIDE CARD (WHITE HEADER & BIGGER LOGO) ================= */}
          {(activeSide === 'both' || activeSide === 'front') && (
            <div className="w-full max-w-[340px] sm:w-[360px] h-[235px] bg-white rounded-xl shadow-xl border border-gray-300 overflow-hidden flex flex-col justify-between relative transform hover:scale-[1.02] transition-transform duration-200 shrink-0">
              {/* Front Header: Clean White Background with Big Logo */}
              <div className="bg-white px-3 py-2 flex items-center gap-2.5 border-b-2 border-[#145A32]">
                <div className="w-11 h-11 flex items-center justify-center shrink-0">
                  <img
                    src="/images/logo.png"
                    alt="Jamia Usmania Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="leading-tight overflow-hidden">
                  <h4 className="text-[13px] font-extrabold font-serif tracking-tight text-[#145A32] truncate">
                    JAMIA USMANIA TRUST
                  </h4>
                  <p className="text-[9px] font-bold text-amber-700 tracking-wider uppercase truncate">
                    OFFICIAL {isStudent ? 'STUDENT' : 'FACULTY'} IDENTITY CARD
                  </p>
                  <p className="text-[8px] font-semibold text-[#145A32] tracking-wide truncate">
                    www.usmaniatrust.org
                  </p>
                </div>
              </div>

              {/* Front Body */}
              <div className="p-3 flex gap-3 flex-1 items-center bg-white">
                {/* Left Photo Column */}
                <div className="flex flex-col items-center shrink-0 w-20">
                  <div className="w-20 h-24 bg-gray-50 rounded-md border border-[#145A32] overflow-hidden flex items-center justify-center shadow-2xs">
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
              <div className="bg-[#FAF5EA]/80 border-t border-[#145A32]/20 px-3 py-1 flex items-center justify-between text-[9px] text-[#145A32] font-semibold">
                <span className="flex items-center gap-1">
                  <Globe className="w-2.5 h-2.5" /> www.usmaniatrust.org
                </span>
                <span className="text-gray-500">Valid: 2026–2027</span>
              </div>
            </div>
          )}

          {/* ================= BACK SIDE CARD (LOGO WATERMARK & SPACIOUS SIGNATURE) ================= */}
          {(activeSide === 'both' || activeSide === 'back') && (
            <div className="w-full max-w-[340px] sm:w-[360px] h-[235px] bg-[#FAFCF8] rounded-xl shadow-xl border border-gray-300 overflow-hidden flex flex-col justify-between relative transform hover:scale-[1.02] transition-transform duration-200 shrink-0">
              {/* Back Background Watermark */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none z-0">
                <img
                  src="/images/logo.png"
                  alt="Watermark"
                  className="w-36 h-36 object-contain"
                />
              </div>

              {/* Back Header: Clean White Background with Logo */}
              <div className="bg-white px-3 py-1.5 flex items-center gap-2 border-b-2 border-[#145A32] relative z-10">
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  <img
                    src="/images/logo.png"
                    alt="Jamia Usmania Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="leading-tight overflow-hidden">
                  <h4 className="text-xs font-extrabold font-serif tracking-tight text-[#145A32] truncate">
                    JAMIA USMANIA TRUST
                  </h4>
                  <p className="text-[8.5px] font-bold text-amber-700 tracking-wider uppercase truncate">
                    CAMPUS RULES & INSTRUCTIONS
                  </p>
                </div>
              </div>

              {/* Back Body: Rules */}
              <div className="p-3 space-y-1 flex-1 text-[9.5px] text-gray-700 leading-tight relative z-10">
                <div className="flex items-start gap-1">
                  <span className="font-bold text-[#145A32]">1.</span>
                  <span>This card must be displayed inside campus premises at all times.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="font-bold text-[#145A32]">2.</span>
                  <span>Non-transferable. Official property of Jamia Usmania Trust.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="font-bold text-[#145A32]">3.</span>
                  <span>Report lost cards immediately to the administration office.</span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="font-bold text-[#145A32]">4.</span>
                  <span>
                    Helpline: +92 300 1234567 | Email:{' '}
                    <span className="font-bold text-[#145A32]">jamiausmaniatrust1994@gmail.com</span>
                  </span>
                </div>
                <div className="flex items-start gap-1">
                  <span className="font-bold text-[#145A32]">5.</span>
                  <span>Official Website: www.usmaniatrust.org</span>
                </div>

                {/* Spacious Signature Area */}
                <div className="pt-2 mt-1 border-t border-gray-300/80 flex items-end justify-between">
                  <div className="text-[8.5px] text-gray-500 pb-0.5">
                    <div>Issued: {record.admission_date || '2026–2027'}</div>
                    <div>Karachi, Pakistan</div>
                  </div>

                  <div className="text-center pt-2">
                    <div className="w-32 border-b-2 border-gray-500 mb-1" />
                    <span className="text-[8.5px] font-bold text-[#145A32] block">
                      Authorized Officer / Trustee Seal
                    </span>
                  </div>
                </div>
              </div>

              {/* Back Footer */}
              <div className="bg-[#145A32] text-white text-[8px] text-center py-0.5 font-medium tracking-wide relative z-10">
                Jamia Usmania Trust • Islamic Education & Welfare Platform
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] sm:text-xs text-gray-500 flex items-center gap-1.5 text-center sm:text-left">
            <Sparkles className="w-4 h-4 text-[#145A32]" />
            <span>Standard CR80 Printable PDF with White Header & Watermark</span>
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
              <span>Print / Download Printable PDF</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

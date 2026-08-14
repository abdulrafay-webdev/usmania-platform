'use client';

import React from 'react';
import {
  Student,
  Teacher,
  getStudentPdfDownloadUrl,
  getTeacherPdfDownloadUrl,
  getStudentIdCardDownloadUrl,
  getTeacherIdCardDownloadUrl
} from '@/lib/api';
import { X, FileDown, Building2, Calendar, MapPin, Mail, Phone, Home, Sparkles, Contact, UserCheck, Pencil, Trash2, HeartHandshake, School, BedDouble } from 'lucide-react';

interface RecordDetailModalProps {
  record: Student | Teacher | null;
  type: 'student' | 'teacher';
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (record: Student | Teacher) => void;
  onDelete?: (record: Student | Teacher) => void;
}

export default function RecordDetailModal({
  record,
  type,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: RecordDetailModalProps) {
  if (!isOpen || !record) return null;

  const isStudent = type === 'student';
  const studentRec = record as Student;
  const teacherRec = record as Teacher;

  const pdfUrl = isStudent
    ? getStudentPdfDownloadUrl(record.id)
    : getTeacherPdfDownloadUrl(record.id);

  const idCardUrl = isStudent
    ? getStudentIdCardDownloadUrl(record.id)
    : getTeacherIdCardDownloadUrl(record.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Header Header */}
        <div className="bg-[#145A32] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            {/* Photo */}
            <div className="w-20 h-24 rounded-xl bg-white p-1 shadow-md shrink-0">
              <div className="w-full h-full rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center text-2xl font-bold text-[#145A32]">
                {record.picture ? (
                  <img
                    src={record.picture}
                    alt={record.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <span>{record.name.charAt(0)}</span>
                )}
              </div>
            </div>

            <div>
              <span className="inline-block px-2.5 py-0.5 bg-[#FDF6E3] text-[#145A32] font-mono text-xs font-bold rounded border border-white/20 mb-1">
                {record.roll_no}
              </span>
              <h2 className="text-xl font-bold font-serif leading-tight">
                {record.name}
              </h2>
              <p className="text-xs text-[#FDF6E3] mt-1 font-medium">
                {isStudent
                  ? `Class: ${studentRec.student_class} ${studentRec.subject ? `• ${studentRec.subject}` : ''}`
                  : `Subject Taught: ${teacherRec.subject}`}
              </p>
            </div>
          </div>
        </div>

        {/* Hijri & Gregorian Admission Dates Bar */}
        <div className="bg-[#FDF6E3] px-6 py-3 border-b border-[#145A32]/20 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#145A32]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#145A32]" />
            <span>Admission Date: {record.admission_date}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded border border-[#145A32]/30 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#145A32]" />
            <span>Hijri Date: {record.islamic_date || 'N/A'}</span>
          </div>
        </div>

        {/* Content Details */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Key Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Father / Guardian
              </span>
              <span className="text-sm font-semibold text-gray-900 mt-0.5 block">
                {record.father_guardian_name || '—'}
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                CNIC / B-Form Number
              </span>
              <span className="text-sm font-mono font-semibold text-gray-900 mt-0.5 block">
                {record.nic || '—'}
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Gender & Date of Birth
              </span>
              <span className="text-sm font-semibold text-gray-900 mt-0.5 block">
                {record.gender} • {record.dob}
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Contact Phone & Email
              </span>
              <div className="text-xs text-gray-900 mt-0.5 space-y-0.5">
                <div className="flex items-center gap-1.5 font-semibold">
                  <Phone className="w-3 h-3 text-[#145A32]" /> {record.contact}
                </div>
                <div className="flex items-center gap-1.5 text-gray-600">
                  <Mail className="w-3 h-3 text-gray-400" /> {record.email}
                </div>
              </div>
            </div>

            {isStudent && (
              <>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Assigned Teacher / Ustad
                  </span>
                  <span className="text-sm font-semibold text-gray-900 mt-0.5 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-[#145A32]" />
                    {studentRec.assigned_teacher_name || 'Not assigned'}
                  </span>
                </div>

                {/* Boarding + Room/Bed Details */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Boarding / Hostel Status
                  </span>
                  <span className="text-sm font-semibold text-gray-900 mt-0.5 flex items-center gap-1.5">
                    <Home className="w-4 h-4 text-[#145A32]" />
                    {studentRec.boarding ? (
                      <span className="text-[#145A32] font-bold">
                        Hostel Boarder {studentRec.hostel_room_no ? `(Room ${studentRec.hostel_room_no})` : ''} {studentRec.hostel_bed_no ? `• Bed ${studentRec.hostel_bed_no}` : ''}
                      </span>
                    ) : (
                      <span className="text-gray-600">Day Scholar</span>
                    )}
                  </span>
                </div>

                {/* Zakat + Syed Status */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Zakat Eligibility & Syed Status
                  </span>
                  <span className="text-sm font-semibold text-gray-900 mt-0.5 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-amber-600" />
                    {studentRec.is_zakat_eligible ? (
                      <span className="text-amber-800 font-bold">
                        Eligible for Zakat ({studentRec.zakat_syed_status || 'Non-Syed'})
                      </span>
                    ) : (
                      <span className="text-gray-500">Not Zakat Eligible</span>
                    )}
                  </span>
                </div>

                {/* Usmania Academy + Class */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    Usmania Academy School
                  </span>
                  <span className="text-sm font-semibold text-gray-900 mt-0.5 flex items-center gap-1.5">
                    <School className="w-4 h-4 text-blue-600" />
                    {studentRec.is_academy_student ? (
                      <span className="text-blue-900 font-bold">
                        Enrolled ({studentRec.academy_class || 'Class 1'})
                      </span>
                    ) : (
                      <span className="text-gray-500">Not Enrolled</span>
                    )}
                  </span>
                </div>
              </>
            )}

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                Institution Branch
              </span>
              <span className="text-sm font-semibold text-gray-900 mt-0.5 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#145A32]" />
                {record.institution || 'Jamia Usmania'}
              </span>
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-3 pt-2 border-t border-gray-200">
            <div>
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1 mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#145A32]" /> Current Address
              </span>
              <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                {record.current_address || 'Not specified'} ({record.city}, {record.country})
              </p>
            </div>

            {record.permanent_address && (
              <div>
                <span className="text-xs font-bold text-gray-700 block mb-1">
                  Permanent Address
                </span>
                <p className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  {record.permanent_address}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(record);
                }}
                className="px-3 py-1.5 bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Pencil className="w-3.5 h-3.5 text-[#145A32]" />
                <span>Edit Record</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={() => {
                  onClose();
                  onDelete(record);
                }}
                className="px-3 py-1.5 bg-white hover:bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <a
              href={idCardUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-[#FDF6E3] hover:bg-white text-[#145A32] border border-[#145A32]/30 text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5"
            >
              <Contact className="w-4 h-4 text-[#145A32]" />
              <span>ID Card</span>
            </a>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-[#145A32] hover:bg-[#0E4124] text-white text-xs font-bold rounded-lg shadow-sm transition-all duration-150 flex items-center gap-1.5"
            >
              <FileDown className="w-4 h-4" />
              <span>Full Record PDF</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

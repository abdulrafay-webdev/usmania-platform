'use client';

import React, { useState, useEffect } from 'react';
import {
  Student,
  Teacher,
  Staff,
  getStudentById,
  getTeacherById,
  getStaffById,
  getStudentPdfDownloadUrl,
  getTeacherPdfDownloadUrl,
  getStaffPdfDownloadUrl,
  getStudentIdCardDownloadUrl,
  getTeacherIdCardDownloadUrl,
  getStaffIdCardDownloadUrl
} from '@/lib/api';
import {
  X,
  FileDown,
  Building2,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Home,
  Sparkles,
  Contact,
  UserCheck,
  Pencil,
  Trash2,
  HeartHandshake,
  School,
  User,
  Users,
  FileText,
  BookOpen,
  Receipt,
  CreditCard,
  ExternalLink,
  Eye,
  FileCheck,
  Briefcase
} from 'lucide-react';

interface RecordDetailModalProps {
  record: Student | Teacher | Staff | null;
  type: 'student' | 'teacher' | 'staff';
  isOpen: boolean;
  onClose: () => void;
  onViewIdCard?: (record: any) => void;
  onEdit?: (record: any) => void;
  onDelete?: (record: any) => void;
}

export default function RecordDetailModal({
  record,
  type,
  isOpen,
  onClose,
  onViewIdCard,
  onEdit,
  onDelete
}: RecordDetailModalProps) {
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);
  const [fullRecord, setFullRecord] = useState<Student | Teacher | Staff | null>(record);

  useEffect(() => {
    setFullRecord(record);
    if (!isOpen || !record?.id) return;

    let isMounted = true;
    const fetchFull = async () => {
      try {
        let fullData: Student | Teacher | Staff;
        if (type === 'student') {
          fullData = await getStudentById(record.id);
        } else if (type === 'staff') {
          fullData = await getStaffById(record.id);
        } else {
          fullData = await getTeacherById(record.id);
        }
        if (isMounted) {
          setFullRecord(fullData);
        }
      } catch (err) {
        // Fall back gracefully to the already loaded summary record
      }
    };
    fetchFull();

    return () => {
      isMounted = false;
    };
  }, [isOpen, record?.id, type]);

  if (!isOpen || !record) return null;

  const currentRecord = fullRecord || record;
  const isStudent = type === 'student';
  const isStaff = type === 'staff';
  const studentRec = currentRecord as Student;
  const teacherRec = currentRecord as Teacher;
  const staffRec = currentRecord as Staff;

  const pdfUrl = isStudent
    ? getStudentPdfDownloadUrl(currentRecord.id)
    : isStaff
    ? getStaffPdfDownloadUrl(currentRecord.id)
    : getTeacherPdfDownloadUrl(currentRecord.id);

  const idCardUrl = isStudent
    ? getStudentIdCardDownloadUrl(currentRecord.id)
    : isStaff
    ? getStaffIdCardDownloadUrl(currentRecord.id)
    : getTeacherIdCardDownloadUrl(currentRecord.id);

  const fatherName = isStudent
    ? studentRec.father_name || studentRec.father_guardian_name || '—'
    : currentRecord.father_guardian_name || '—';

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-2xl overflow-hidden my-6 sm:my-8 animate-fadeIn">
          {/* Header Header */}
          <div className="bg-[#145A32] text-white p-5 sm:p-6 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              {/* Photo */}
              <div className="w-18 h-22 sm:w-20 sm:h-24 rounded-xl bg-white p-1 shadow-md shrink-0">
                <div className="w-full h-full rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center text-2xl font-bold text-[#145A32]">
                  {record.picture ? (
                    <img
                      src={record.picture}
                      alt={record.name}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setLightboxImage({ url: record.picture, title: `${record.name} — Profile Photo` })}
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
                <h2 className="text-lg sm:text-xl font-bold font-serif leading-tight">
                  {record.name}
                </h2>
                <p className="text-xs text-[#FDF6E3] mt-1 font-medium">
                  {isStudent
                    ? `Class: ${studentRec.student_class} ${studentRec.subject ? `• ${studentRec.subject}` : ''}`
                    : isStaff
                    ? `Designation / Role: ${staffRec.designation || 'Staff'}`
                    : `Subject Taught: ${teacherRec.subject}`}
                </p>
              </div>
            </div>
          </div>

          {/* Hijri & Gregorian Admission Dates Bar */}
          <div className="bg-[#FDF6E3] px-5 sm:px-6 py-2.5 sm:py-3 border-b border-[#145A32]/20 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#145A32]">
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
          <div className="p-4 sm:p-6 space-y-6 max-h-[60vh] overflow-y-auto text-xs">
            {/* Key Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Father's Name */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-[#145A32]" /> Father Name (والد کا نام)
                </span>
                <span className="text-sm font-semibold text-gray-900 mt-1 block">
                  {fatherName}
                </span>
              </div>

              {/* Guardian Name & Phone if Student */}
              {isStudent ? (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#145A32]" /> Guardian Details (سرپرست)
                  </span>
                  <div className="text-xs text-gray-900 mt-1">
                    <span className="font-semibold block text-sm">
                      {studentRec.guardian_name || 'Same as father'}
                    </span>
                    {studentRec.guardian_contact && (
                      <span className="text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#145A32]" /> {studentRec.guardian_contact}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
                    CNIC Number
                  </span>
                  <span className="text-sm font-mono font-semibold text-gray-900 mt-0.5 block">
                    {record.nic || '—'}
                  </span>
                </div>
              )}

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
                  Phone & Email
                </span>
                <div className="text-xs text-gray-900 mt-0.5 space-y-0.5">
                  <div className="flex items-center gap-1.5 font-semibold">
                    <Phone className="w-3 h-3 text-[#145A32]" /> {record.contact}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Mail className="w-3 h-3 text-gray-400" /> {record.email || 'None'}
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

            {/* ========================================================================= */}
            {/* ATTACHED DOCUMENTS GALLERY (3 FOR STUDENTS / 3 FOR TEACHERS)              */}
            {/* ========================================================================= */}
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#145A32] uppercase tracking-wider flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-[#145A32]" />
                  {isStudent ? 'Attached Student Documents' : 'Attached Teacher Documents'}
                </span>
              </div>

              {isStudent && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Zakat Doc */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                      <HeartHandshake className="w-3.5 h-3.5 text-amber-600" /> Zakat Document
                    </span>
                    {studentRec.doc_zakat ? (
                      <div
                        onClick={() => setLightboxImage({ url: studentRec.doc_zakat!, title: 'Zakat Document / Affidavit' })}
                        className="group relative h-24 rounded-lg overflow-hidden border border-amber-200 bg-white cursor-pointer shadow-2xs flex items-center justify-center"
                      >
                        <img src={studentRec.doc_zakat} alt="Zakat Doc" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-[11px] font-bold">
                          <Eye className="w-4 h-4" /> View Full
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg border border-dashed border-gray-300 bg-white flex items-center justify-center text-[10px] text-gray-400 text-center p-2">
                        Not uploaded
                      </div>
                    )}
                  </div>

                  {/* 2. Birth Cert */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-blue-600" /> Birth Certificate
                    </span>
                    {studentRec.doc_birth_certificate ? (
                      <div
                        onClick={() => setLightboxImage({ url: studentRec.doc_birth_certificate!, title: 'Birth Certificate / B-Form' })}
                        className="group relative h-24 rounded-lg overflow-hidden border border-blue-200 bg-white cursor-pointer shadow-2xs flex items-center justify-center"
                      >
                        <img src={studentRec.doc_birth_certificate} alt="Birth Cert" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-[11px] font-bold">
                          <Eye className="w-4 h-4" /> View Full
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg border border-dashed border-gray-300 bg-white flex items-center justify-center text-[10px] text-gray-400 text-center p-2">
                        Not uploaded
                      </div>
                    )}
                  </div>

                  {/* 3. Activity Diary */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-700" /> Activity Diary
                    </span>
                    {studentRec.doc_activity_diary ? (
                      <div
                        onClick={() => setLightboxImage({ url: studentRec.doc_activity_diary!, title: 'Activity Diary / Performance Report' })}
                        className="group relative h-24 rounded-lg overflow-hidden border border-emerald-200 bg-white cursor-pointer shadow-2xs flex items-center justify-center"
                      >
                        <img src={studentRec.doc_activity_diary} alt="Activity Diary" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-[11px] font-bold">
                          <Eye className="w-4 h-4" /> View Full
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg border border-dashed border-gray-300 bg-white flex items-center justify-center text-[10px] text-gray-400 text-center p-2">
                        Not uploaded
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!isStudent && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Contract */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#145A32]" />
                      {isStaff ? 'Staff Contract Agreement' : 'Teacher Contract Agreement'}
                    </span>
                    {(isStaff ? staffRec.doc_contract : teacherRec.doc_contract) ? (
                      <div
                        onClick={() =>
                          setLightboxImage({
                            url: (isStaff ? staffRec.doc_contract : teacherRec.doc_contract)!,
                            title: isStaff ? 'Staff Contract / Agreement' : 'Teacher Contract / Agreement'
                          })
                        }
                        className="group relative h-24 rounded-lg overflow-hidden border border-[#145A32]/30 bg-white cursor-pointer shadow-2xs flex items-center justify-center"
                      >
                        <img
                          src={isStaff ? staffRec.doc_contract : teacherRec.doc_contract}
                          alt="Contract"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-[11px] font-bold">
                          <Eye className="w-4 h-4" /> View Full
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg border border-dashed border-gray-300 bg-white flex items-center justify-center text-[10px] text-gray-400 text-center p-2">
                        Not uploaded
                      </div>
                    )}
                  </div>

                  {/* 2. Payslip */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5 text-blue-600" /> Payslip / Salary
                    </span>
                    {(isStaff ? staffRec.doc_payslip : teacherRec.doc_payslip) ? (
                      <div
                        onClick={() =>
                          setLightboxImage({
                            url: (isStaff ? staffRec.doc_payslip : teacherRec.doc_payslip)!,
                            title: 'Payslip / Salary Voucher'
                          })
                        }
                        className="group relative h-24 rounded-lg overflow-hidden border border-blue-200 bg-white cursor-pointer shadow-2xs flex items-center justify-center"
                      >
                        <img
                          src={isStaff ? staffRec.doc_payslip : teacherRec.doc_payslip}
                          alt="Payslip"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-[11px] font-bold">
                          <Eye className="w-4 h-4" /> View Full
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg border border-dashed border-gray-300 bg-white flex items-center justify-center text-[10px] text-gray-400 text-center p-2">
                        Not uploaded
                      </div>
                    )}
                  </div>

                  {/* 3. CNIC */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-amber-700" /> CNIC Copy
                    </span>
                    {(isStaff ? staffRec.doc_cnic : teacherRec.doc_cnic) ? (
                      <div
                        onClick={() =>
                          setLightboxImage({
                            url: (isStaff ? staffRec.doc_cnic : teacherRec.doc_cnic)!,
                            title: isStaff ? 'Staff CNIC Copy' : 'Teacher CNIC Copy'
                          })
                        }
                        className="group relative h-24 rounded-lg overflow-hidden border border-amber-200 bg-white cursor-pointer shadow-2xs flex items-center justify-center"
                      >
                        <img
                          src={isStaff ? staffRec.doc_cnic : teacherRec.doc_cnic}
                          alt="CNIC"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 text-[11px] font-bold">
                          <Eye className="w-4 h-4" /> View Full
                        </div>
                      </div>
                    ) : (
                      <div className="h-24 rounded-lg border border-dashed border-gray-300 bg-white flex items-center justify-center text-[10px] text-gray-400 text-center p-2">
                        Not uploaded
                      </div>
                    )}
                  </div>
                </div>
              )}
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
              {onViewIdCard ? (
                <button
                  onClick={() => {
                    onClose();
                    onViewIdCard(record);
                  }}
                  className="px-3.5 py-2 bg-[#FDF6E3] hover:bg-white text-[#145A32] border border-[#145A32]/30 text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Contact className="w-4 h-4 text-[#145A32]" />
                  <span>View ID Card</span>
                </button>
              ) : (
                <a
                  href={idCardUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 bg-[#FDF6E3] hover:bg-white text-[#145A32] border border-[#145A32]/30 text-xs font-bold rounded-lg shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Contact className="w-4 h-4 text-[#145A32]" />
                  <span>ID Card</span>
                </a>
              )}

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

      {/* Lightbox / Full Size Document Viewer Modal */}
      {lightboxImage && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl overflow-hidden max-w-3xl w-full shadow-2xl border border-gray-700">
            <div className="bg-[#145A32] text-white p-3.5 px-5 flex items-center justify-between">
              <span className="font-bold text-sm font-serif">{lightboxImage.title}</span>
              <button
                onClick={() => setLightboxImage(null)}
                className="text-white/80 hover:text-white p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 bg-gray-900 flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-auto">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-h-[65vh] max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>
            <div className="p-3 bg-gray-100 flex items-center justify-between px-5">
              <a
                href={lightboxImage.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-[#145A32] hover:underline font-bold flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
              </a>
              <button
                onClick={() => setLightboxImage(null)}
                className="px-4 py-1.5 bg-[#145A32] text-white text-xs font-bold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

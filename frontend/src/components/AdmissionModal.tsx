'use client';

import React, { useState, useEffect } from 'react';
import {
  createStudent,
  updateStudent,
  createTeacher,
  updateTeacher,
  uploadPicture,
  getTeachers,
  Student,
  Teacher
} from '@/lib/api';
import { compressImageFile } from '@/lib/imageCompressor';
import {
  X,
  Upload,
  CheckCircle2,
  UserCheck,
  AlertCircle,
  Sparkles,
  Pencil,
  HeartHandshake,
  School,
  Home,
  FileText,
  BookOpen,
  Receipt,
  CreditCard,
  Trash2,
  FileCheck
} from 'lucide-react';

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialRole?: 'student' | 'teacher';
  editRecord?: Student | Teacher | null;
}

export default function AdmissionModal({
  isOpen,
  onClose,
  onSuccess,
  initialRole = 'student',
  editRecord = null
}: AdmissionModalProps) {
  const isEditing = !!editRecord;
  const [role, setRole] = useState<'student' | 'teacher'>(initialRole);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Primary Photograph
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Student Optional Documents (3 documents)
  const [docZakatPreview, setDocZakatPreview] = useState<string>('');
  const [docZakatFile, setDocZakatFile] = useState<File | null>(null);

  const [docBirthCertPreview, setDocBirthCertPreview] = useState<string>('');
  const [docBirthCertFile, setDocBirthCertFile] = useState<File | null>(null);

  const [docActivityDiaryPreview, setDocActivityDiaryPreview] = useState<string>('');
  const [docActivityDiaryFile, setDocActivityDiaryFile] = useState<File | null>(null);

  // Teacher Optional Documents (3 documents)
  const [docContractPreview, setDocContractPreview] = useState<string>('');
  const [docContractFile, setDocContractFile] = useState<File | null>(null);

  const [docPayslipPreview, setDocPayslipPreview] = useState<string>('');
  const [docPayslipFile, setDocPayslipFile] = useState<File | null>(null);

  const [docCnicPreview, setDocCnicPreview] = useState<string>('');
  const [docCnicFile, setDocCnicFile] = useState<File | null>(null);

  // Registered Teachers list for dropdown assignment
  const [registeredTeachers, setRegisteredTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    father_name: '',
    guardian_name: '',
    guardian_contact: '',
    father_guardian_name: '',
    email: '',
    nic: '',
    dob: '',
    gender: 'Male',
    contact: '',
    current_address: '',
    permanent_address: '',
    city: 'Karachi',
    country: 'Pakistan',
    institution: 'Jamia Usmania Main Campus',
    previous_institute: '',
    student_class: 'Hifz-ul-Quran',
    subject: 'Tajweed & Qirat',
    admission_date: new Date().toISOString().split('T')[0],
    assigned_teacher_id: '',
    assigned_teacher_name: '',

    // Boarding & Room/Bed
    boarding: false,
    hostel_room_no: '',
    hostel_bed_no: '',

    // Zakat & Syed Status
    is_zakat_eligible: false,
    zakat_syed_status: 'Non-Syed' as 'Non-Syed' | 'Syed',

    // Usmania Academy & Class
    is_academy_student: false,
    academy_class: 'Class 1'
  });

  // Load edit record data into form
  useEffect(() => {
    if (isOpen) {
      setLoadingTeachers(true);
      getTeachers()
        .then((data) => setRegisteredTeachers(data))
        .catch(() => setRegisteredTeachers([]))
        .finally(() => setLoadingTeachers(false));

      if (editRecord) {
        const isStud = 'student_class' in editRecord;
        setRole(isStud ? 'student' : 'teacher');
        setImagePreview(editRecord.picture || '');
        setSelectedFile(null);

        const stud = editRecord as Student;
        const teach = editRecord as Teacher;

        if (isStud) {
          setDocZakatPreview(stud.doc_zakat || '');
          setDocBirthCertPreview(stud.doc_birth_certificate || '');
          setDocActivityDiaryPreview(stud.doc_activity_diary || '');
          setDocZakatFile(null);
          setDocBirthCertFile(null);
          setDocActivityDiaryFile(null);
        } else {
          setDocContractPreview(teach.doc_contract || '');
          setDocPayslipPreview(teach.doc_payslip || '');
          setDocCnicPreview(teach.doc_cnic || '');
          setDocContractFile(null);
          setDocPayslipFile(null);
          setDocCnicFile(null);
        }

        setFormData({
          name: editRecord.name || '',
          father_name: stud.father_name || editRecord.father_guardian_name || '',
          guardian_name: stud.guardian_name || '',
          guardian_contact: stud.guardian_contact || '',
          father_guardian_name: editRecord.father_guardian_name || '',
          email: editRecord.email || '',
          nic: editRecord.nic || '',
          dob: editRecord.dob || '',
          gender: editRecord.gender || 'Male',
          contact: editRecord.contact || '',
          current_address: editRecord.current_address || '',
          permanent_address: editRecord.permanent_address || '',
          city: editRecord.city || 'Karachi',
          country: editRecord.country || 'Pakistan',
          institution: editRecord.institution || 'Jamia Usmania Main Campus',
          previous_institute: editRecord.previous_institute || '',
          student_class: stud.student_class || 'Hifz-ul-Quran',
          subject: editRecord.subject || 'Tajweed & Qirat',
          admission_date: editRecord.admission_date || new Date().toISOString().split('T')[0],
          assigned_teacher_id: stud.assigned_teacher_id || '',
          assigned_teacher_name: stud.assigned_teacher_name || '',

          boarding: stud.boarding || false,
          hostel_room_no: stud.hostel_room_no || '',
          hostel_bed_no: stud.hostel_bed_no || '',

          is_zakat_eligible: stud.is_zakat_eligible || false,
          zakat_syed_status: (stud.zakat_syed_status as any) || 'Non-Syed',

          is_academy_student: stud.is_academy_student || false,
          academy_class: stud.academy_class || 'Class 1'
        });
      } else {
        setRole(initialRole);
        setImagePreview('');
        setSelectedFile(null);

        // Reset document files
        setDocZakatPreview('');
        setDocZakatFile(null);
        setDocBirthCertPreview('');
        setDocBirthCertFile(null);
        setDocActivityDiaryPreview('');
        setDocActivityDiaryFile(null);

        setDocContractPreview('');
        setDocContractFile(null);
        setDocPayslipPreview('');
        setDocPayslipFile(null);
        setDocCnicPreview('');
        setDocCnicFile(null);

        setFormData({
          name: '',
          father_name: '',
          guardian_name: '',
          guardian_contact: '',
          father_guardian_name: '',
          email: '',
          nic: '',
          dob: '',
          gender: 'Male',
          contact: '',
          current_address: '',
          permanent_address: '',
          city: 'Karachi',
          country: 'Pakistan',
          institution: 'Jamia Usmania Main Campus',
          previous_institute: '',
          student_class: 'Hifz-ul-Quran',
          subject: 'Tajweed & Qirat',
          admission_date: new Date().toISOString().split('T')[0],
          assigned_teacher_id: '',
          assigned_teacher_name: '',

          boarding: false,
          hostel_room_no: '',
          hostel_bed_no: '',

          is_zakat_eligible: false,
          zakat_syed_status: 'Non-Syed',

          is_academy_student: false,
          academy_class: 'Class 1'
        });
      }
    }
  }, [isOpen, editRecord, initialRole]);

  if (!isOpen) return null;

  const handleCNICChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // strip non-digits
    if (val.length > 13) val = val.substring(0, 13);

    let formatted = val;
    if (val.length > 5 && val.length <= 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
    } else if (val.length > 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12)}`;
    }

    setFormData((prev) => ({ ...prev, nic: formatted }));
  };

  // Primary Photo change with auto-compression
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 1000, 0.80);
        setSelectedFile(compressed);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        setSelectedFile(file);
      }
    }
  };

  // Generic document file picker with auto-compression
  const handleDocFileChange = async (
    file: File | undefined,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setPreview: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (file) {
      try {
        const compressed = await compressImageFile(file, 1200, 0.80);
        setFile(compressed);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(compressed);
      } catch (err) {
        setFile(file);
      }
    }
  };

  const handleTeacherSelect = (teacherId: string) => {
    const selected = registeredTeachers.find((t) => t.id === teacherId);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        assigned_teacher_id: selected.id,
        assigned_teacher_name: `${selected.name} (${selected.roll_no})`
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        assigned_teacher_id: '',
        assigned_teacher_name: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Upload main profile photo if changed
      let pictureUrl = imagePreview;
      if (selectedFile) {
        pictureUrl = await uploadPicture(selectedFile);
      }

      if (role === 'student') {
        // 2. Upload optional student documents
        let zakatUrl = docZakatPreview;
        if (docZakatFile) {
          zakatUrl = await uploadPicture(docZakatFile);
        }

        let birthCertUrl = docBirthCertPreview;
        if (docBirthCertFile) {
          birthCertUrl = await uploadPicture(docBirthCertFile);
        }

        let activityDiaryUrl = docActivityDiaryPreview;
        if (docActivityDiaryFile) {
          activityDiaryUrl = await uploadPicture(docActivityDiaryFile);
        }

        const payload = {
          ...formData,
          father_guardian_name: formData.father_name || formData.guardian_name || '',
          picture: pictureUrl,
          doc_zakat: zakatUrl,
          doc_birth_certificate: birthCertUrl,
          doc_activity_diary: activityDiaryUrl
        };

        if (isEditing && editRecord) {
          await updateStudent(editRecord.id, payload);
        } else {
          await createStudent({
            ...payload,
            admission_date: formData.admission_date
          });
        }
      } else {
        // 3. Upload optional teacher documents
        let contractUrl = docContractPreview;
        if (docContractFile) {
          contractUrl = await uploadPicture(docContractFile);
        }

        let payslipUrl = docPayslipPreview;
        if (docPayslipFile) {
          payslipUrl = await uploadPicture(docPayslipFile);
        }

        let cnicDocUrl = docCnicPreview;
        if (docCnicFile) {
          cnicDocUrl = await uploadPicture(docCnicFile);
        }

        const payload = {
          name: formData.name,
          father_guardian_name: formData.father_guardian_name,
          email: formData.email,
          nic: formData.nic,
          dob: formData.dob,
          gender: formData.gender,
          contact: formData.contact,
          current_address: formData.current_address,
          permanent_address: formData.permanent_address,
          city: formData.city,
          country: formData.country,
          institution: formData.institution,
          previous_institute: formData.previous_institute,
          subject: formData.subject,
          picture: pictureUrl,
          doc_contract: contractUrl,
          doc_payslip: payslipUrl,
          doc_cnic: cnicDocUrl
        };

        if (isEditing && editRecord) {
          await updateTeacher(editRecord.id, payload);
        } else {
          await createTeacher({
            ...payload,
            admission_date: formData.admission_date
          });
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-3xl my-6 sm:my-8 overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="bg-[#145A32] text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isEditing ? (
              <Pencil className="w-5 h-5 text-[#FDF6E3]" />
            ) : (
              <UserCheck className="w-5 h-5 text-[#FDF6E3]" />
            )}
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif tracking-wide">
                {isEditing
                  ? `Edit ${role === 'student' ? 'Student' : 'Teacher'} Record (${editRecord?.roll_no})`
                  : role === 'student' ? 'Student Admission Form' : 'Teacher Registration Form'}
              </h2>
              <p className="text-[11px] text-[#FDF6E3]/80">
                Jamia Usmania Official Platform Database
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

        {/* Role Switcher Tabs */}
        {!isEditing && (
          <div className="bg-[#FAF5EA] px-4 sm:px-6 py-2.5 sm:py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-xs">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`px-3 sm:px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  role === 'student'
                    ? 'bg-[#145A32] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Student Record
              </button>
              <button
                type="button"
                onClick={() => setRole('teacher')}
                className={`px-3 sm:px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  role === 'teacher'
                    ? 'bg-[#145A32] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Teacher Record
              </button>
            </div>

            <span className="text-xs text-gray-500 font-medium hidden sm:inline">
              Official Registration
            </span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Admission Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Photo Upload Box */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="w-20 h-24 rounded-lg bg-gray-200 border border-gray-300 overflow-hidden flex items-center justify-center relative shrink-0 shadow-2xs">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400 font-medium text-center px-1">
                  Photo Preview
                </span>
              )}
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <label className="block text-xs font-bold text-gray-700">
                Candidate Photograph (تصویر برائے شناختی کارڈ و ریکارڈ)
              </label>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 hover:border-[#145A32] text-gray-700 hover:text-[#145A32] text-xs font-semibold rounded-lg transition-all shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-[#145A32]" />
                  {isEditing ? 'Change Photograph' : 'Choose Photograph'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {selectedFile && (
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {(selectedFile.size / 1024).toFixed(0)} KB (Auto-compressed)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                Auto-compressed to fast Web format. Supported: JPG, PNG, WEBP.
              </p>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {role === 'student' ? 'Student Full Name' : 'Teacher Full Name'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Muhammad Ali"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
              />
            </div>

            {/* If Student: Separate Father Name, Guardian Name, Guardian Contact */}
            {role === 'student' ? (
              <>
                {/* Father Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Father Name (والد کا نام) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.father_name}
                    onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                    placeholder="Tariq Mahmood"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                {/* Guardian Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Guardian Name (سرپرست کا نام - اگر والد کے علاوہ ہو)
                  </label>
                  <input
                    type="text"
                    value={formData.guardian_name}
                    onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                    placeholder="e.g. Abdul Rehman (Uncle / Relative)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                {/* Guardian Contact Phone */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Guardian Phone (سرپرست کا رابطہ نمبر)
                  </label>
                  <input
                    type="text"
                    value={formData.guardian_contact}
                    onChange={(e) => setFormData({ ...formData, guardian_contact: e.target.value })}
                    placeholder="0300-9876543"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>
              </>
            ) : (
              /* Teacher Father / Guardian Name */
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Father / Guardian Name (والد / سرپرست کا نام)
                </label>
                <input
                  type="text"
                  value={formData.father_guardian_name}
                  onChange={(e) => setFormData({ ...formData, father_guardian_name: e.target.value })}
                  placeholder="Tariq Mahmood"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>
            )}

            {/* CNIC / B-Form */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                CNIC / B-Form Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.nic}
                onChange={handleCNICChange}
                placeholder="42101-1234567-1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
              />
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email Address <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="candidate@jamiausmania.edu.pk"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
              />
            </div>

            {/* DOB */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Primary Contact Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                placeholder="0300-1234567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
              />
            </div>

            {/* Admission Date */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Admission / Registration Date
              </label>
              <input
                type="date"
                value={formData.admission_date}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
              />
              <p className="text-[11px] text-[#145A32] font-semibold mt-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#145A32]" />
                Hijri date auto-calculates on submit!
              </p>
            </div>

            {/* Role Specific Fields */}
            {role === 'student' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Class / Grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.student_class}
                    onChange={(e) => setFormData({ ...formData, student_class: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  >
                    <option value="Nazra Quran">Nazra Quran</option>
                    <option value="Hifz-ul-Quran">Hifz-ul-Quran</option>
                    <option value="Tajweed & Qirat">Tajweed & Qirat</option>
                    <option value="Darse Nizami (Alim)">Darse Nizami (Alim)</option>
                    <option value="Tafseer & Hadith">Tafseer & Hadith</option>
                    <option value="Grade 1">Grade 1</option>
                    <option value="Grade 2">Grade 2</option>
                    <option value="Grade 3">Grade 3</option>
                    <option value="Grade 4">Grade 4</option>
                    <option value="Grade 5">Grade 5</option>
                  </select>
                </div>

                {/* Assigned Teacher Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Assign Teacher / Ustad
                  </label>
                  <select
                    value={formData.assigned_teacher_id}
                    onChange={(e) => handleTeacherSelect(e.target.value)}
                    disabled={loadingTeachers}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  >
                    <option value="">-- Select Registered Teacher (Optional) --</option>
                    {registeredTeachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.roll_no}) — {t.subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Subject Enrolled (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Arabic Grammar, Fiqh"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                  />
                </div>

                {/* Additional Student Status Checkboxes with Dynamic Dropdowns / Inputs */}
                <div className="sm:col-span-2 space-y-3 p-4 bg-[#FDF6E3]/60 rounded-xl border border-[#145A32]/25">
                  <div className="text-xs font-bold text-[#145A32] uppercase tracking-wider">
                    Student Category & Facilities
                  </div>

                  {/* 1. Boarding Checkbox & Dynamic Room / Bed Sub-inputs */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="boarding"
                        checked={formData.boarding}
                        onChange={(e) => setFormData({ ...formData, boarding: e.target.checked })}
                        className="rounded border-gray-300 text-[#145A32] focus:ring-[#145A32] w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="boarding" className="text-xs font-bold text-gray-800 cursor-pointer flex items-center gap-1.5">
                        <Home className="w-3.5 h-3.5 text-[#145A32]" />
                        Hostel Boarder (رہائشی طالب علم)
                      </label>
                    </div>

                    {formData.boarding && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 pl-6 border-t border-gray-100 animate-fadeIn">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Room Number (کمرہ نمبر)
                          </label>
                          <input
                            type="text"
                            value={formData.hostel_room_no}
                            onChange={(e) => setFormData({ ...formData, hostel_room_no: e.target.value })}
                            placeholder="e.g. Room 101 / Room 4"
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 mb-1">
                            Bed Number (بیڈ نمبر)
                          </label>
                          <input
                            type="text"
                            value={formData.hostel_bed_no}
                            onChange={(e) => setFormData({ ...formData, hostel_bed_no: e.target.value })}
                            placeholder="e.g. Bed A / Bed 2"
                            className="w-full px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Zakat Eligible Checkbox & Dynamic Syed / Non-Syed Option */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="zakat_eligible"
                        checked={formData.is_zakat_eligible}
                        onChange={(e) => setFormData({ ...formData, is_zakat_eligible: e.target.checked })}
                        className="rounded border-gray-300 text-[#145A32] focus:ring-[#145A32] w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="zakat_eligible" className="text-xs font-bold text-[#145A32] cursor-pointer flex items-center gap-1.5">
                        <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                        Zakat Eligible (مستحق زکوۃ)
                      </label>
                    </div>

                    {formData.is_zakat_eligible && (
                      <div className="pt-2 pl-6 border-t border-gray-100 animate-fadeIn">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                          Syed / Non-Syed Status (سید / غیر سید)
                        </label>
                        <div className="flex items-center gap-6">
                          <label className="inline-flex items-center gap-2 text-xs text-gray-800 cursor-pointer font-medium">
                            <input
                              type="radio"
                              name="zakat_syed_status"
                              value="Non-Syed"
                              checked={formData.zakat_syed_status === 'Non-Syed'}
                              onChange={() => setFormData({ ...formData, zakat_syed_status: 'Non-Syed' })}
                              className="text-[#145A32] focus:ring-[#145A32]"
                            />
                            <span>Non-Syed (غیر سید - زکوۃ مستحق)</span>
                          </label>

                          <label className="inline-flex items-center gap-2 text-xs text-amber-900 cursor-pointer font-bold">
                            <input
                              type="radio"
                              name="zakat_syed_status"
                              value="Syed"
                              checked={formData.zakat_syed_status === 'Syed'}
                              onChange={() => setFormData({ ...formData, zakat_syed_status: 'Syed' })}
                              className="text-[#145A32] focus:ring-[#145A32]"
                            />
                            <span>Syed (سید - امداد برائے سادات / عطیات)</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3. Usmania Academy Checkbox & Dynamic Class Dropdown (Montessori to Matric) */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 space-y-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="academy_student"
                        checked={formData.is_academy_student}
                        onChange={(e) => setFormData({ ...formData, is_academy_student: e.target.checked })}
                        className="rounded border-gray-300 text-[#145A32] focus:ring-[#145A32] w-4 h-4 cursor-pointer"
                      />
                      <label htmlFor="academy_student" className="text-xs font-bold text-blue-900 cursor-pointer flex items-center gap-1.5">
                        <School className="w-3.5 h-3.5 text-blue-600" />
                        Usmania Academy School Student (سکول کے طالب علم)
                      </label>
                    </div>

                    {formData.is_academy_student && (
                      <div className="pt-2 pl-6 border-t border-gray-100 animate-fadeIn">
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Select School Class (Montessori to Matric)
                        </label>
                        <select
                          value={formData.academy_class}
                          onChange={(e) => setFormData({ ...formData, academy_class: e.target.value })}
                          className="w-full sm:w-72 px-2.5 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                        >
                          <option value="Montessori">Montessori</option>
                          <option value="Playgroup">Playgroup</option>
                          <option value="Nursery">Nursery</option>
                          <option value="KG / Prep">KG / Prep</option>
                          <option value="Class 1">Class 1</option>
                          <option value="Class 2">Class 2</option>
                          <option value="Class 3">Class 3</option>
                          <option value="Class 4">Class 4</option>
                          <option value="Class 5">Class 5</option>
                          <option value="Class 6">Class 6</option>
                          <option value="Class 7">Class 7</option>
                          <option value="Class 8">Class 8</option>
                          <option value="Class 9 (Matric Part-I)">Class 9 (Matric Part-I)</option>
                          <option value="Class 10 (Matric Part-II)">Class 10 (Matric Part-II)</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Subject(s) Taught <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Hadith, Fiqh, Arabic Language"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
                />
              </div>
            )}

            {/* ========================================================================= */}
            {/* OPTIONAL DOCUMENT UPLOADS SECTION (3 FOR STUDENTS / 3 FOR TEACHERS)       */}
            {/* ========================================================================= */}
            <div className="sm:col-span-2 space-y-3 pt-2">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-[#145A32] uppercase tracking-wider">
                  <FileCheck className="w-4 h-4 text-[#145A32]" />
                  <span>
                    {role === 'student' ? 'Optional Student Documents' : 'Optional Teacher Documents'}
                  </span>
                </div>
                <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                  All 3 Optional (اختیاری)
                </span>
              </div>

              {/* Student 3 Documents */}
              {role === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Zakat Document */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                        <HeartHandshake className="w-3.5 h-3.5 text-amber-600" />
                        Zakat Document / Affidavit
                      </span>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        مستحق زکوۃ دستاویز / بیان حلفی
                      </p>
                    </div>

                    {docZakatPreview ? (
                      <div className="relative rounded-lg overflow-hidden border border-amber-300 bg-white h-24 flex items-center justify-center">
                        <img
                          src={docZakatPreview}
                          alt="Zakat Document"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDocZakatPreview('');
                            setDocZakatFile(null);
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-xs"
                          title="Remove document"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#145A32] bg-white rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all h-24">
                        <Upload className="w-4 h-4 text-[#145A32] mb-1" />
                        <span className="text-[11px] font-bold text-gray-700">Upload Zakat Doc</span>
                        <span className="text-[9px] text-gray-400">Auto-compressed</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleDocFileChange(
                              e.target.files?.[0],
                              setDocZakatFile,
                              setDocZakatPreview
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* 2. Birth Certificate */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        Birth Certificate / B-Form
                      </span>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        پیدائشی سرٹیفکیٹ / ب فارم
                      </p>
                    </div>

                    {docBirthCertPreview ? (
                      <div className="relative rounded-lg overflow-hidden border border-blue-300 bg-white h-24 flex items-center justify-center">
                        <img
                          src={docBirthCertPreview}
                          alt="Birth Certificate"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDocBirthCertPreview('');
                            setDocBirthCertFile(null);
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-xs"
                          title="Remove document"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#145A32] bg-white rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all h-24">
                        <Upload className="w-4 h-4 text-[#145A32] mb-1" />
                        <span className="text-[11px] font-bold text-gray-700">Upload Birth Cert</span>
                        <span className="text-[9px] text-gray-400">Auto-compressed</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleDocFileChange(
                              e.target.files?.[0],
                              setDocBirthCertFile,
                              setDocBirthCertPreview
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* 3. Activity Diary */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-700" />
                        Activity Diary / Report
                      </span>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        کارکردگی ڈائری / تعلیمی ریکارڈ
                      </p>
                    </div>

                    {docActivityDiaryPreview ? (
                      <div className="relative rounded-lg overflow-hidden border border-emerald-300 bg-white h-24 flex items-center justify-center">
                        <img
                          src={docActivityDiaryPreview}
                          alt="Activity Diary"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDocActivityDiaryPreview('');
                            setDocActivityDiaryFile(null);
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-xs"
                          title="Remove document"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#145A32] bg-white rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all h-24">
                        <Upload className="w-4 h-4 text-[#145A32] mb-1" />
                        <span className="text-[11px] font-bold text-gray-700">Upload Diary / Report</span>
                        <span className="text-[9px] text-gray-400">Auto-compressed</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleDocFileChange(
                              e.target.files?.[0],
                              setDocActivityDiaryFile,
                              setDocActivityDiaryPreview
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}

              {/* Teacher 3 Documents */}
              {role === 'teacher' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* 1. Teacher Contract */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#145A32]" />
                        Teacher Contract / Agreement
                      </span>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        معاہدہ تدریس / ایگریمنٹ
                      </p>
                    </div>

                    {docContractPreview ? (
                      <div className="relative rounded-lg overflow-hidden border border-[#145A32]/40 bg-white h-24 flex items-center justify-center">
                        <img
                          src={docContractPreview}
                          alt="Contract"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDocContractPreview('');
                            setDocContractFile(null);
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-xs"
                          title="Remove document"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#145A32] bg-white rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all h-24">
                        <Upload className="w-4 h-4 text-[#145A32] mb-1" />
                        <span className="text-[11px] font-bold text-gray-700">Upload Contract</span>
                        <span className="text-[9px] text-gray-400">Auto-compressed</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleDocFileChange(
                              e.target.files?.[0],
                              setDocContractFile,
                              setDocContractPreview
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* 2. Payslip */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                        <Receipt className="w-3.5 h-3.5 text-blue-600" />
                        Payslip / Salary Voucher
                      </span>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        تنخواہ سلپ / بینک واؤچر
                      </p>
                    </div>

                    {docPayslipPreview ? (
                      <div className="relative rounded-lg overflow-hidden border border-blue-300 bg-white h-24 flex items-center justify-center">
                        <img
                          src={docPayslipPreview}
                          alt="Payslip"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDocPayslipPreview('');
                            setDocPayslipFile(null);
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-xs"
                          title="Remove document"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#145A32] bg-white rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all h-24">
                        <Upload className="w-4 h-4 text-[#145A32] mb-1" />
                        <span className="text-[11px] font-bold text-gray-700">Upload Payslip</span>
                        <span className="text-[9px] text-gray-400">Auto-compressed</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleDocFileChange(
                              e.target.files?.[0],
                              setDocPayslipFile,
                              setDocPayslipPreview
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* 3. CNIC Document */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex flex-col justify-between space-y-2">
                    <div>
                      <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-amber-700" />
                        CNIC Copy (Front / Back)
                      </span>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        قومی شناختی کارڈ کی کاپی
                      </p>
                    </div>

                    {docCnicPreview ? (
                      <div className="relative rounded-lg overflow-hidden border border-amber-300 bg-white h-24 flex items-center justify-center">
                        <img
                          src={docCnicPreview}
                          alt="CNIC Copy"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setDocCnicPreview('');
                            setDocCnicFile(null);
                          }}
                          className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow-xs"
                          title="Remove document"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer border-2 border-dashed border-gray-300 hover:border-[#145A32] bg-white rounded-lg p-3 flex flex-col items-center justify-center text-center transition-all h-24">
                        <Upload className="w-4 h-4 text-[#145A32] mb-1" />
                        <span className="text-[11px] font-bold text-gray-700">Upload CNIC Copy</span>
                        <span className="text-[9px] text-gray-400">Auto-compressed</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleDocFileChange(
                              e.target.files?.[0],
                              setDocCnicFile,
                              setDocCnicPreview
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Address fields */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Current Residential Address
              </label>
              <textarea
                rows={2}
                value={formData.current_address}
                onChange={(e) => setFormData({ ...formData, current_address: e.target.value })}
                placeholder="Street address, sector..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Permanent Address
              </label>
              <textarea
                rows={2}
                value={formData.permanent_address}
                onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
                placeholder="Permanent home location..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Country</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#145A32] hover:bg-[#0E4124] text-[#FDF6E3] text-sm font-semibold rounded-lg shadow-sm transition-all duration-150 flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>{isEditing ? 'Updating...' : 'Saving Record...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Update Record' : 'Submit Admission'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
import { X, Upload, CheckCircle2, UserCheck, AlertCircle, Sparkles, Pencil, HeartHandshake, School, Home, BedDouble, ShieldAlert } from 'lucide-react';

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
  const [imagePreview, setImagePreview] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Registered Teachers list for dropdown assignment
  const [registeredTeachers, setRegisteredTeachers] = useState<Teacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
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
        setFormData({
          name: editRecord.name || '',
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
        setFormData({
          name: '',
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

    // Format as 42101-1234567-1
    let formatted = val;
    if (val.length > 5 && val.length <= 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5)}`;
    } else if (val.length > 12) {
      formatted = `${val.slice(0, 5)}-${val.slice(5, 12)}-${val.slice(12)}`;
    }

    setFormData((prev) => ({ ...prev, nic: formatted }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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
      let pictureUrl = imagePreview;
      if (selectedFile) {
        pictureUrl = await uploadPicture(selectedFile);
      }

      if (role === 'student') {
        if (isEditing && editRecord) {
          await updateStudent(editRecord.id, {
            ...formData,
            picture: pictureUrl
          });
        } else {
          await createStudent({
            ...formData,
            picture: pictureUrl,
            admission_date: formData.admission_date
          });
        }
      } else {
        if (isEditing && editRecord) {
          await updateTeacher(editRecord.id, {
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
            picture: pictureUrl
          });
        } else {
          await createTeacher({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl w-full max-w-3xl my-8 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#145A32] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isEditing ? <Pencil className="w-5 h-5 text-[#FDF6E3]" /> : <UserCheck className="w-5 h-5 text-[#FDF6E3]" />}
            <h2 className="text-lg font-bold font-serif tracking-wide">
              {isEditing
                ? `Edit ${role === 'student' ? 'Student' : 'Teacher'} Record (${editRecord?.roll_no})`
                : role === 'student' ? 'Student Admission Form' : 'Teacher Registration Form'}
            </h2>
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
          <div className="bg-[#FAF5EA] px-6 py-3 border-b border-gray-200 flex items-center justify-between">
            <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-xs">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
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
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  role === 'teacher'
                    ? 'bg-[#145A32] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Teacher Record
              </button>
            </div>

            <span className="text-xs text-gray-500 font-medium hidden sm:inline">
              Jamia Usmania Registration Portal
            </span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Admission Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Photo Upload Box */}
          <div className="flex items-center gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div className="w-20 h-24 rounded-lg bg-gray-200 border border-gray-300 overflow-hidden flex items-center justify-center relative shrink-0">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-gray-400 font-medium text-center px-1">
                  Photo Preview
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Photograph (ImageKit Proxy)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 hover:border-[#145A32] text-gray-700 hover:text-[#145A32] text-xs font-semibold rounded-lg transition-all shadow-xs">
                  <Upload className="w-3.5 h-3.5 text-[#145A32]" />
                  {isEditing ? 'Change Photograph' : 'Choose File'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {selectedFile && (
                  <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {selectedFile.name}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-400">
                Supported formats: JPG, PNG, WEBP. Max size: 10MB.
              </p>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
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

            {/* Father / Guardian Name */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Father / Guardian Name {role === 'student' && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                required={role === 'student'}
                value={formData.father_guardian_name}
                onChange={(e) => setFormData({ ...formData, father_guardian_name: e.target.value })}
                placeholder="Tariq Mahmood"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
              />
            </div>

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

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
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
                Contact Phone <span className="text-red-500">*</span>
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

            {/* Address fields */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Current Address
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

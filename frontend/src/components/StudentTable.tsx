'use client';

import React from 'react';
import { Student, getStudentPdfDownloadUrl, getStudentIdCardDownloadUrl } from '@/lib/api';
import { Eye, FileDown, Home, BookOpen, UserCheck, Pencil, Trash2, HeartHandshake, School } from 'lucide-react';

interface StudentTableProps {
  students: Student[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewProfile: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (student: Student) => void;
  isLoading?: boolean;
}

export default function StudentTable({
  students,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewProfile,
  onEditStudent,
  onDeleteStudent,
  isLoading = false
}: StudentTableProps) {
  const isAllSelected = students.length > 0 && selectedIds.length === students.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < students.length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#145A32] border-t-transparent mb-3" />
        <p className="text-gray-500 text-sm">Loading student records...</p>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#FDF6E3] text-[#145A32] flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-800">No Student Records Found</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mt-1">
          No student records match your query. Add a new admission or modify your search query.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAF5EA]/80 border-b border-gray-200 text-xs font-semibold text-[#145A32]">
              <th className="py-3.5 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = isSomeSelected;
                  }}
                  onChange={onToggleSelectAll}
                  className="rounded border-gray-300 text-[#145A32] focus:ring-[#145A32] w-4 h-4 cursor-pointer"
                />
              </th>
              <th className="py-3.5 px-3">Photo</th>
              <th className="py-3.5 px-3">Roll No</th>
              <th className="py-3.5 px-4">Student Name</th>
              <th className="py-3.5 px-4">Father / Guardian</th>
              <th className="py-3.5 px-3">Class</th>
              <th className="py-3.5 px-4">Assigned Teacher</th>
              <th className="py-3.5 px-3">Status Badges</th>
              <th className="py-3.5 px-4">Hijri Admission Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {students.map((student) => {
              const isSelected = selectedIds.includes(student.id);
              return (
                <tr
                  key={student.id}
                  className={`hover:bg-gray-50/80 transition-colors ${
                    isSelected ? 'bg-[#FDF6E3]/30' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(student.id)}
                      className="rounded border-gray-300 text-[#145A32] focus:ring-[#145A32] w-4 h-4 cursor-pointer"
                    />
                  </td>

                  {/* Photo Thumbnail */}
                  <td className="py-3 px-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-xs font-semibold text-[#145A32]">
                      {student.picture ? (
                        <img
                          src={student.picture}
                          alt={student.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{student.name.charAt(0)}</span>
                      )}
                    </div>
                  </td>

                  {/* Roll No */}
                  <td className="py-3 px-3">
                    <span className="inline-block px-2.5 py-1 bg-[#FDF6E3] text-[#145A32] font-mono text-xs font-bold rounded-md border border-[#145A32]/20">
                      {student.roll_no}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.contact}</div>
                  </td>

                  {/* Father / Guardian */}
                  <td className="py-3 px-4 text-gray-700 font-medium">
                    {student.father_guardian_name || '—'}
                  </td>

                  {/* Class */}
                  <td className="py-3 px-3">
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                      {student.student_class}
                    </span>
                  </td>

                  {/* Assigned Teacher */}
                  <td className="py-3 px-4">
                    {student.assigned_teacher_name ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded border border-emerald-200">
                        <UserCheck className="w-3 h-3 text-[#145A32]" />
                        {student.assigned_teacher_name}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Not assigned</span>
                    )}
                  </td>

                  {/* Status Badges: Boarder, Zakat Eligible, Usmania Academy */}
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1 items-center">
                      {student.boarding ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded border border-emerald-200" title="Hostel Boarder">
                          <Home className="w-3 h-3" /> Boarder
                        </span>
                      ) : (
                        <span className="inline-block px-1.5 py-0.5 bg-gray-50 text-gray-500 text-[11px] font-medium rounded border border-gray-200">
                          Day Scholar
                        </span>
                      )}

                      {student.is_zakat_eligible && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 text-amber-800 text-[11px] font-bold rounded border border-amber-300" title="Eligible for Zakat (Mustahiq Zakat)">
                          <HeartHandshake className="w-3 h-3 text-amber-600" /> Zakat
                        </span>
                      )}

                      {student.is_academy_student && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-800 text-[11px] font-bold rounded border border-blue-200" title="Enrolled in Usmania Academy School">
                          <School className="w-3 h-3 text-blue-600" /> Academy
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Hijri Date */}
                  <td className="py-3 px-4">
                    <div className="text-xs font-semibold text-[#145A32]">
                      {student.islamic_date || '—'}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {student.admission_date}
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewProfile(student)}
                        className="p-1.5 text-gray-600 hover:text-[#145A32] hover:bg-[#FDF6E3] rounded-lg transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onEditStudent(student)}
                        className="p-1.5 text-gray-600 hover:text-[#145A32] hover:bg-[#FDF6E3] rounded-lg transition-colors"
                        title="Edit Record"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <a
                        href={getStudentIdCardDownloadUrl(student.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-gray-600 hover:text-[#145A32] hover:bg-[#FDF6E3] rounded-lg transition-colors"
                        title="Download Printable ID Card (Front & Back)"
                      >
                        <FileDown className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => onDeleteStudent(student)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

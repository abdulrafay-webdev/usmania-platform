'use client';

import React from 'react';
import { Teacher, getTeacherPdfDownloadUrl, getTeacherIdCardDownloadUrl } from '@/lib/api';
import { Eye, FileDown, Users, Contact, Pencil, Trash2 } from 'lucide-react';

interface TeacherTableProps {
  teachers: Teacher[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewProfile: (teacher: Teacher) => void;
  onViewIdCard?: (teacher: Teacher) => void;
  onEditTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacher: Teacher) => void;
  isLoading?: boolean;
}

export default function TeacherTable({
  teachers,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewProfile,
  onViewIdCard,
  onEditTeacher,
  onDeleteTeacher,
  isLoading = false
}: TeacherTableProps) {
  const isAllSelected = teachers.length > 0 && selectedIds.length === teachers.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < teachers.length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#145A32] border-t-transparent mb-3" />
        <p className="text-gray-500 text-sm">Loading teacher records...</p>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#FDF6E3] text-[#145A32] flex items-center justify-center mx-auto mb-3">
          <Users className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-800">No Teacher Records Found</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mt-1">
          No teacher records match your query. Register a new teacher or modify your search query.
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
              <th className="py-3.5 px-4">Teacher Name</th>
              <th className="py-3.5 px-4">Subject(s) Taught</th>
              <th className="py-3.5 px-4">Father / Guardian</th>
              <th className="py-3.5 px-4">Hijri Registration Date</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {teachers.map((teacher) => {
              const isSelected = selectedIds.includes(teacher.id);
              return (
                <tr
                  key={teacher.id}
                  className={`hover:bg-gray-50/80 transition-colors ${
                    isSelected ? 'bg-[#FDF6E3]/30' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(teacher.id)}
                      className="rounded border-gray-300 text-[#145A32] focus:ring-[#145A32] w-4 h-4 cursor-pointer"
                    />
                  </td>

                  {/* Photo Thumbnail */}
                  <td className="py-3 px-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-xs font-semibold text-[#145A32]">
                      {teacher.picture ? (
                        <img
                          src={teacher.picture}
                          alt={teacher.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{teacher.name.charAt(0)}</span>
                      )}
                    </div>
                  </td>

                  {/* Roll No */}
                  <td className="py-3 px-3">
                    <span className="inline-block px-2.5 py-1 bg-[#FDF6E3] text-[#145A32] font-mono text-xs font-bold rounded-md border border-[#145A32]/20">
                      {teacher.roll_no}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{teacher.name}</div>
                    <div className="text-xs text-gray-500">{teacher.contact}</div>
                  </td>

                  {/* Subject Taught */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-800 font-medium text-xs rounded border border-emerald-200">
                      {teacher.subject}
                    </span>
                  </td>

                  {/* Father / Guardian */}
                  <td className="py-3 px-4 text-gray-700 font-medium">
                    {teacher.father_guardian_name || '—'}
                  </td>

                  {/* Hijri Date */}
                  <td className="py-3 px-4">
                    <div className="text-xs font-semibold text-[#145A32]">
                      {teacher.islamic_date || '—'}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {teacher.admission_date}
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewProfile(teacher)}
                        className="p-1.5 text-gray-600 hover:text-[#145A32] hover:bg-[#FDF6E3] rounded-lg transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {onViewIdCard ? (
                        <button
                          onClick={() => onViewIdCard(teacher)}
                          className="p-1.5 text-[#145A32] hover:text-[#0E4124] hover:bg-[#FDF6E3] rounded-lg transition-colors"
                          title="View & Print Official ID Card"
                        >
                          <Contact className="w-4 h-4" />
                        </button>
                      ) : (
                        <a
                          href={getTeacherIdCardDownloadUrl(teacher.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-[#145A32] hover:text-[#0E4124] hover:bg-[#FDF6E3] rounded-lg transition-colors"
                          title="Download Printable ID Card (Front & Back)"
                        >
                          <Contact className="w-4 h-4" />
                        </a>
                      )}

                      <a
                        href={getTeacherPdfDownloadUrl(teacher.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Download Full Profile PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => onEditTeacher(teacher)}
                        className="p-1.5 text-gray-600 hover:text-[#145A32] hover:bg-[#FDF6E3] rounded-lg transition-colors"
                        title="Edit Record"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteTeacher(teacher)}
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

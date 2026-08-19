'use client';

import React from 'react';
import { Staff, getStaffPdfDownloadUrl, getStaffIdCardDownloadUrl } from '@/lib/api';
import { Eye, FileDown, Briefcase, Contact, Pencil, Trash2 } from 'lucide-react';

interface StaffTableProps {
  staffList: Staff[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onViewProfile: (staff: Staff) => void;
  onViewIdCard?: (staff: Staff) => void;
  onEditStaff: (staff: Staff) => void;
  onDeleteStaff: (staff: Staff) => void;
  isLoading?: boolean;
}

export default function StaffTable({
  staffList,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onViewProfile,
  onViewIdCard,
  onEditStaff,
  onDeleteStaff,
  isLoading = false
}: StaffTableProps) {
  const isAllSelected = staffList.length > 0 && selectedIds.length === staffList.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < staffList.length;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#145A32] border-t-transparent mb-3" />
        <p className="text-gray-500 text-sm">Loading staff records...</p>
      </div>
    );
  }

  if (staffList.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-full bg-[#FDF6E3] text-[#145A32] flex items-center justify-center mx-auto mb-3">
          <Briefcase className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-800">No Staff Records Found</h3>
        <p className="text-gray-500 text-sm max-w-sm mx-auto mt-1">
          No staff records match your query. Register a new staff member or modify your search query.
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
              <th className="py-3.5 px-3">Staff ID</th>
              <th className="py-3.5 px-4">Staff Name</th>
              <th className="py-3.5 px-4">Designation / Role</th>
              <th className="py-3.5 px-4">Father / Guardian</th>
              <th className="py-3.5 px-4">Joining Date (Hijri)</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {staffList.map((staff) => {
              const isSelected = selectedIds.includes(staff.id);
              return (
                <tr
                  key={staff.id}
                  className={`hover:bg-gray-50/80 transition-colors ${
                    isSelected ? 'bg-[#FDF6E3]/30' : ''
                  }`}
                >
                  <td className="py-3 px-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelect(staff.id)}
                      className="rounded border-gray-300 text-[#145A32] focus:ring-[#145A32] w-4 h-4 cursor-pointer"
                    />
                  </td>

                  {/* Photo Thumbnail */}
                  <td className="py-3 px-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-xs font-semibold text-[#145A32]">
                      {staff.picture ? (
                        <img
                          src={staff.picture}
                          alt={staff.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <span>{staff.name.charAt(0)}</span>
                      )}
                    </div>
                  </td>

                  {/* Roll No */}
                  <td className="py-3 px-3">
                    <span className="inline-block px-2.5 py-1 bg-[#FDF6E3] text-[#145A32] font-mono text-xs font-bold rounded-md border border-[#145A32]/20">
                      {staff.roll_no}
                    </span>
                  </td>

                  {/* Name */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{staff.name}</div>
                    <div className="text-xs text-gray-500">{staff.contact}</div>
                  </td>

                  {/* Designation / Role */}
                  <td className="py-3 px-4">
                    <span className="inline-block px-2.5 py-1 bg-purple-50 text-purple-800 font-bold text-xs rounded border border-purple-200">
                      {staff.designation || 'Staff'}
                    </span>
                  </td>

                  {/* Father / Guardian */}
                  <td className="py-3 px-4 text-gray-700 font-medium">
                    {staff.father_guardian_name || '—'}
                  </td>

                  {/* Hijri Date */}
                  <td className="py-3 px-4">
                    <div className="text-xs font-semibold text-[#145A32]">
                      {staff.islamic_date || '—'}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {staff.admission_date}
                    </div>
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onViewProfile(staff)}
                        className="p-1.5 text-gray-600 hover:text-[#145A32] hover:bg-[#FDF6E3] rounded-lg transition-colors cursor-pointer"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {onViewIdCard ? (
                        <button
                          onClick={() => onViewIdCard(staff)}
                          className="p-1.5 text-[#145A32] hover:text-[#0E4124] hover:bg-[#FDF6E3] rounded-lg transition-colors cursor-pointer"
                          title="View & Print Official ID Card"
                        >
                          <Contact className="w-4 h-4" />
                        </button>
                      ) : (
                        <a
                          href={getStaffIdCardDownloadUrl(staff.id)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-[#145A32] hover:text-[#0E4124] hover:bg-[#FDF6E3] rounded-lg transition-colors cursor-pointer"
                          title="Download Printable ID Card (Front & Back)"
                        >
                          <Contact className="w-4 h-4" />
                        </a>
                      )}

                      <a
                        href={getStaffPdfDownloadUrl(staff.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Download Full Profile PDF"
                      >
                        <FileDown className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => onEditStaff(staff)}
                        className="p-1.5 text-gray-600 hover:text-[#145A32] hover:bg-[#FDF6E3] rounded-lg transition-colors cursor-pointer"
                        title="Edit Record"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDeleteStaff(staff)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

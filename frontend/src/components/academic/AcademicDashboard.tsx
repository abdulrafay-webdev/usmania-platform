'use client';

import React, { useState, useMemo } from 'react';
import { Student, Teacher, Staff } from '@/lib/api';
import {
  GraduationCap,
  Users,
  Briefcase,
  Home,
  HeartHandshake,
  School,
  BookOpen,
  UserCheck,
  AlertTriangle,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  ExternalLink,
  Layers,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  CheckCircle2,
  Calendar,
  Phone,
  Eye,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';

interface AcademicDashboardProps {
  students: Student[];
  teachers: Teacher[];
  staffList: Staff[];
  onNavigateToStudents?: (filterClass?: string) => void;
  onNavigateToTeachers?: () => void;
  onNavigateToStaff?: () => void;
  onViewStudent?: (student: Student) => void;
  onViewTeacher?: (teacher: Teacher) => void;
}

const CLASS_COLORS = [
  '#145A32', // Emerald
  '#0284C7', // Sky Blue
  '#7C3AED', // Purple
  '#D97706', // Amber
  '#DC2626', // Red
  '#059669', // Mint Green
  '#4F46E5', // Indigo
  '#EA580C', // Orange
  '#0D9488', // Teal
  '#64748B'  // Slate
];

export default function AcademicDashboard({
  students,
  teachers,
  staffList,
  onNavigateToStudents,
  onNavigateToTeachers,
  onNavigateToStaff,
  onViewStudent,
  onViewTeacher
}: AcademicDashboardProps) {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [showUnassignedOnly, setShowUnassignedOnly] = useState(false);

  // 1. Core KPIs
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalStaff = staffList.length;

  const boarderCount = useMemo(() => students.filter((s) => s.boarding).length, [students]);
  const dayScholarCount = totalStudents - boarderCount;
  const zakatCount = useMemo(() => students.filter((s) => s.is_zakat_eligible).length, [students]);
  const zakatSyedCount = useMemo(
    () => students.filter((s) => s.is_zakat_eligible && s.zakat_syed_status === 'Syed').length,
    [students]
  );
  const zakatNonSyedCount = zakatCount - zakatSyedCount;
  const academyCount = useMemo(() => students.filter((s) => s.is_academy_student).length, [students]);

  // 2. Class Breakdown Calculations
  const classBreakdown = useMemo(() => {
    const map: Record<
      string,
      {
        className: string;
        count: number;
        boarders: number;
        zakat: number;
        students: Student[];
      }
    > = {};

    students.forEach((s) => {
      const c = s.student_class || 'Unassigned Class';
      if (!map[c]) {
        map[c] = {
          className: c,
          count: 0,
          boarders: 0,
          zakat: 0,
          students: []
        };
      }
      map[c].count += 1;
      if (s.boarding) map[c].boarders += 1;
      if (s.is_zakat_eligible) map[c].zakat += 1;
      map[c].students.push(s);
    });

    // Convert to sorted array
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [students]);

  // 3. Teacher Workload & Student Allocation Calculations
  const teacherAllocation = useMemo(() => {
    const list = teachers.map((t) => {
      // Find students assigned to this teacher by ID or matching roll/name
      const assignedStudents = students.filter(
        (s) => s.assigned_teacher_id === t.id || (s.assigned_teacher_name && s.assigned_teacher_name.includes(t.roll_no))
      );

      // Class distribution for this teacher
      const classMap: Record<string, number> = {};
      assignedStudents.forEach((s) => {
        const c = s.student_class || 'General';
        classMap[c] = (classMap[c] || 0) + 1;
      });

      return {
        teacher: t,
        studentCount: assignedStudents.length,
        students: assignedStudents,
        classDistribution: classMap,
        boarderCount: assignedStudents.filter((s) => s.boarding).length
      };
    });

    return list.sort((a, b) => b.studentCount - a.studentCount);
  }, [teachers, students]);

  // 4. Unassigned Students
  const unassignedStudents = useMemo(() => {
    return students.filter(
      (s) => !s.assigned_teacher_id && (!s.assigned_teacher_name || s.assigned_teacher_name.trim() === '')
    );
  }, [students]);

  // 5. Hostel Room Breakdown
  const roomBreakdown = useMemo(() => {
    const map: Record<string, { roomNo: string; count: number; students: Student[] }> = {};
    students
      .filter((s) => s.boarding && s.hostel_room_no)
      .forEach((s) => {
        const r = s.hostel_room_no!.trim();
        if (!map[r]) {
          map[r] = { roomNo: r, count: 0, students: [] };
        }
        map[r].count += 1;
        map[r].students.push(s);
      });

    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [students]);

  // Filtered teachers for display
  const filteredTeacherAllocations = useMemo(() => {
    if (!teacherSearch.trim()) return teacherAllocation;
    const q = teacherSearch.toLowerCase();
    return teacherAllocation.filter(
      (item) =>
        item.teacher.name.toLowerCase().includes(q) ||
        item.teacher.roll_no.toLowerCase().includes(q) ||
        (item.teacher.subject && item.teacher.subject.toLowerCase().includes(q))
    );
  }, [teacherAllocation, teacherSearch]);

  // Chart Data for Class Enrollment
  const classChartData = useMemo(() => {
    return classBreakdown.map((item) => ({
      name: item.className,
      Students: item.count,
      Boarders: item.boarders,
      Zakat: item.zakat
    }));
  }, [classBreakdown]);

  // Chart Data for Residence Split
  const residencePieData = useMemo(() => {
    return [
      { name: 'Hostel Boarders (رہائشی)', value: boarderCount, color: '#145A32' },
      { name: 'Day Scholars (غیر رہائشی)', value: dayScholarCount, color: '#0284C7' }
    ];
  }, [boarderCount, dayScholarCount]);

  // Chart Data for Zakat Split
  const zakatPieData = useMemo(() => {
    return [
      { name: 'Non-Syed (زکوۃ)', value: zakatNonSyedCount, color: '#D97706' },
      { name: 'Syed (عطیات/امداد)', value: zakatSyedCount, color: '#7C3AED' },
      { name: 'Self-Funded (دیگر)', value: totalStudents - zakatCount, color: '#E2E8F0' }
    ];
  }, [zakatNonSyedCount, zakatSyedCount, totalStudents, zakatCount]);

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#FDF6E3] text-[#145A32] flex items-center justify-center border border-[#145A32]/20 shadow-2xs shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold font-serif text-[#145A32] tracking-tight">
                Academic & Faculty Dashboard
              </h1>
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                Realtime Stats
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              جامعہ عثمانیہ — تعلیمی شعبہ، کلاس وار تعداد اور اساتذہ کے زیرِ نگرانی طلباء کا مکمل خلاصہ
            </p>
          </div>
        </div>

        {/* Quick Jump Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToStudents && (
            <button
              onClick={() => onNavigateToStudents()}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#145A32] text-xs font-bold rounded-lg border border-emerald-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Students ({totalStudents})</span>
            </button>
          )}
          {onNavigateToTeachers && (
            <button
              onClick={onNavigateToTeachers}
              className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold rounded-lg border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Teachers ({totalTeachers})</span>
            </button>
          )}
          {onNavigateToStaff && (
            <button
              onClick={onNavigateToStaff}
              className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold rounded-lg border border-purple-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Staff ({totalStaff})</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Top Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigateToStudents && onNavigateToStudents()}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs hover:border-[#145A32] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Total Students</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-[#145A32] flex items-center justify-center group-hover:scale-110 transition-transform">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#145A32]">{totalStudents}</div>
          <div className="text-[10px] text-gray-400 mt-1 font-medium flex items-center gap-1">
            <span>کل رجسٹرڈ طلباء</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Total Teachers */}
        <div
          onClick={onNavigateToTeachers}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs hover:border-blue-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Faculty / Ustads</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-700">{totalTeachers}</div>
          <div className="text-[10px] text-gray-400 mt-1 font-medium flex items-center gap-1">
            <span>اساتذہ کرام</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Total Staff */}
        <div
          onClick={onNavigateToStaff}
          className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs hover:border-purple-500 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Staff Members</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-700">{totalStaff}</div>
          <div className="text-[10px] text-gray-400 mt-1 font-medium flex items-center gap-1">
            <span>غیر تدریسی ملازمین</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Hostel Boarders */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Hostel Boarders</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-teal-800">{boarderCount}</div>
          <div className="text-[10px] text-gray-500 mt-1 font-medium">
            {totalStudents > 0 ? ((boarderCount / totalStudents) * 100).toFixed(0) : 0}% رہائشی طلباء
          </div>
        </div>

        {/* Zakat Eligible */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">Zakat Eligible</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <HeartHandshake className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-700">{zakatCount}</div>
          <div className="text-[10px] text-gray-500 mt-1 font-medium">
            {zakatNonSyedCount} غیر سید • {zakatSyedCount} سادات
          </div>
        </div>

        {/* Usmania Academy */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">School Academy</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <School className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-indigo-700">{academyCount}</div>
          <div className="text-[10px] text-gray-500 mt-1 font-medium">عثمانیہ اکیڈمی اسکول</div>
        </div>
      </div>

      {/* Unassigned Students Alert (If any) */}
      {unassignedStudents.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-200 text-amber-900 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-950">
                {unassignedStudents.length} Students Without Assigned Teacher
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                ان طلباء کے لیے کوئی استاد / نگراں منتخب نہیں کیا گیا ہے۔ طالب علم ایڈٹ کر کے استاد مقرر فرمائیں۔
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowUnassignedOnly(!showUnassignedOnly)}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            {showUnassignedOnly ? 'Hide Unassigned List' : 'View Unassigned Students'}
          </button>
        </div>
      )}

      {/* Unassigned Students Drawer/Table when toggled */}
      {showUnassignedOnly && unassignedStudents.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 p-4 shadow-sm space-y-3 animate-fadeIn">
          <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-amber-700" />
            List of Students Needing Teacher Assignment ({unassignedStudents.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto">
            {unassignedStudents.map((s) => (
              <div
                key={s.id}
                onClick={() => onViewStudent && onViewStudent(s)}
                className="p-2.5 bg-gray-50 hover:bg-amber-50/50 rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-bold text-xs text-gray-900">{s.name}</div>
                  <div className="text-[11px] text-gray-500">
                    <span className="font-mono text-[#145A32] font-semibold">{s.roll_no}</span> • {s.student_class}
                  </div>
                </div>
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-[#145A32] rounded"
                  title="View Profile"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: CLASS-WISE ENROLLMENT BREAKDOWN                                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-serif text-[#145A32] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#145A32]" />
              Class-wise Student Enrollment (کلاس وار طلباء کی تفصیل)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              ہر کلاس میں داخل طلباء، ہاسٹل رہائش اور زکوۃ کی تفصیلات
            </p>
          </div>
          <span className="text-xs bg-[#FAF5EA] text-[#145A32] px-3 py-1 rounded-full font-bold border border-[#145A32]/20">
            {classBreakdown.length} Active Classes
          </span>
        </div>

        {/* Class Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {classBreakdown.map((item, idx) => {
            const percentage = totalStudents > 0 ? ((item.count / totalStudents) * 100).toFixed(1) : '0';
            const color = CLASS_COLORS[idx % CLASS_COLORS.length];

            return (
              <div
                key={item.className}
                className="bg-gray-50/70 hover:bg-white rounded-xl border border-gray-200 hover:border-[#145A32]/50 p-4 transition-all duration-200 shadow-2xs hover:shadow-sm space-y-3 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#145A32] transition-colors">
                      {item.className}
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-2xs shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      {item.count}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 h-2 rounded-full mt-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%`, backgroundColor: color }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400 mt-1 font-medium">
                    <span>{percentage}% of all students</span>
                    <span>{item.count} طلباء</span>
                  </div>
                </div>

                {/* Sub Attributes */}
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-gray-200/80 text-[11px]">
                  <div className="bg-white px-2 py-1 rounded border border-gray-200/70 text-gray-700 flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Home className="w-3 h-3 text-teal-600" /> Hostel:
                    </span>
                    <span className="font-bold text-teal-800">{item.boarders}</span>
                  </div>

                  <div className="bg-white px-2 py-1 rounded border border-gray-200/70 text-gray-700 flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <HeartHandshake className="w-3 h-3 text-amber-600" /> Zakat:
                    </span>
                    <span className="font-bold text-amber-700">{item.zakat}</span>
                  </div>
                </div>

                {/* Quick Link to filter table */}
                {onNavigateToStudents && (
                  <button
                    onClick={() => onNavigateToStudents(item.className)}
                    className="w-full py-1.5 bg-white hover:bg-[#FAF5EA] text-[#145A32] border border-gray-200 hover:border-[#145A32]/30 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <span>View Class Students</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Visual Chart for Class Comparison */}
        {classChartData.length > 0 && (
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-[#145A32]" />
              Class Strength Comparison Chart
            </h3>
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classChartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Students" fill="#145A32" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Boarders" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Zakat" fill="#D97706" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: TEACHER-WISE STUDENT ALLOCATION & WORKLOAD                     */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold font-serif text-[#145A32] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#145A32]" />
              Teacher-wise Student Allocation (اساتذہ کے زیرِ نگرانی طلباء)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              ہر استاد کے پاس زیرِ تعلیم طلباء کی تعداد، متعلقہ کلاسز اور مکمل فہرست
            </p>
          </div>

          {/* Search Teacher */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search teacher by name or roll..."
              value={teacherSearch}
              onChange={(e) => setTeacherSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#145A32]/20 focus:border-[#145A32]"
            />
          </div>
        </div>

        {/* Teacher Cards / Accordion */}
        <div className="space-y-3">
          {filteredTeacherAllocations.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              No faculty records match your search query.
            </div>
          ) : (
            filteredTeacherAllocations.map((item) => {
              const isExpanded = expandedTeacherId === item.teacher.id;
              const { teacher, studentCount, students: assignedStuds, classDistribution, boarderCount: tBoarders } = item;

              return (
                <div
                  key={teacher.id}
                  className={`rounded-xl border transition-all ${
                    isExpanded
                      ? 'border-[#145A32] bg-[#FAF5EA]/30 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => setExpandedTeacherId(isExpanded ? null : teacher.id)}
                    className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      {/* Teacher Photo */}
                      <div className="w-11 h-11 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center text-xs font-bold text-[#145A32] shrink-0">
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

                      {/* Teacher Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-900">{teacher.name}</span>
                          <span className="font-mono text-[10px] bg-[#FDF6E3] text-[#145A32] font-bold px-1.5 py-0.5 rounded border border-[#145A32]/20">
                            {teacher.roll_no}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200 text-[11px]">
                            {teacher.subject}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-gray-400" /> {teacher.contact}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right Stats & Badge */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      {/* Student Count Badge */}
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-[#145A32]">
                            {studentCount} Students
                          </div>
                          <div className="text-[10px] text-gray-400">
                            {tBoarders} Hostel Boarders
                          </div>
                        </div>

                        <span
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-2xs ${
                            studentCount > 0
                              ? 'bg-[#145A32] text-white'
                              : 'bg-gray-100 text-gray-400 border border-gray-200'
                          }`}
                        >
                          {studentCount}
                        </span>
                      </div>

                      {/* Expand / Collapse Icon */}
                      <div className="p-1 text-gray-400 hover:text-gray-700">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Students List */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-[#145A32]/20 space-y-3 animate-fadeIn">
                      {/* Class Distribution Tags */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold text-gray-600 text-[11px]">Enrolled Classes:</span>
                        {Object.entries(classDistribution).map(([cls, count]) => (
                          <span
                            key={cls}
                            className="bg-white text-gray-800 px-2.5 py-1 rounded-md text-xs font-semibold border border-gray-200 shadow-2xs flex items-center gap-1.5"
                          >
                            <span>{cls}</span>
                            <span className="bg-[#145A32] text-white text-[10px] font-bold px-1.5 rounded-full">
                              {count}
                            </span>
                          </span>
                        ))}
                      </div>

                      {/* Students Table / Grid */}
                      {studentCount === 0 ? (
                        <div className="p-4 bg-white rounded-lg border border-gray-200 text-center text-xs text-gray-500">
                          No students currently assigned to this teacher. Select this teacher in the Student Admission / Edit Form to assign.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto">
                          {assignedStuds.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => onViewStudent && onViewStudent(s)}
                              className="p-2.5 bg-white hover:bg-emerald-50/50 rounded-lg border border-gray-200 hover:border-[#145A32]/30 transition-all flex items-center justify-between gap-2 cursor-pointer shadow-2xs group"
                            >
                              <div className="overflow-hidden">
                                <div className="font-bold text-xs text-gray-900 group-hover:text-[#145A32] truncate">
                                  {s.name}
                                </div>
                                <div className="text-[11px] text-gray-500 flex items-center gap-1.5 mt-0.5 truncate">
                                  <span className="font-mono text-[#145A32] font-semibold">{s.roll_no}</span>
                                  <span>•</span>
                                  <span className="truncate">{s.student_class}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {s.boarding && (
                                  <span
                                    title={`Hostel Boarder ${s.hostel_room_no ? `(${s.hostel_room_no})` : ''}`}
                                    className="p-1 bg-teal-50 text-teal-700 rounded text-[10px] font-bold"
                                  >
                                    <Home className="w-3 h-3" />
                                  </span>
                                )}
                                <button
                                  type="button"
                                  className="p-1 text-gray-400 group-hover:text-[#145A32] rounded"
                                  title="View Student Profile"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 3: RESIDENTIAL & WELFARE DISTRIBUTION CHARTS                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hostel / Boarding Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold font-serif text-sm sm:text-base text-[#145A32] flex items-center gap-2">
              <Home className="w-4 h-4 text-teal-600" />
              Boarding vs Day Scholars (رہائشی و غیر رہائشی)
            </h3>
            <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {boarderCount} Hostel Boarders
            </span>
          </div>

          <div className="h-48 sm:h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={residencePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {residencePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Room Allocation Summary */}
          {roomBreakdown.length > 0 && (
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block">
                Hostel Rooms Occupancy ({roomBreakdown.length} Rooms Recorded):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {roomBreakdown.slice(0, 10).map((r) => (
                  <span
                    key={r.roomNo}
                    className="bg-gray-50 border border-gray-200 text-gray-800 text-[11px] px-2 py-1 rounded-md flex items-center gap-1 font-medium"
                  >
                    <span>{r.roomNo}:</span>
                    <strong className="text-teal-700">{r.count} students</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Zakat & Welfare Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold font-serif text-sm sm:text-base text-[#145A32] flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-amber-600" />
              Zakat & Syed Welfare Eligibility (مستحق زکوۃ و سادات)
            </h3>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {zakatCount} Eligible
            </span>
          </div>

          <div className="h-48 sm:h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={zakatPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {zakatPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
            <div className="bg-amber-50/60 p-2 rounded-lg border border-amber-200/70">
              <div className="text-[11px] text-amber-900 font-bold">Non-Syed (زکوۃ مستحق)</div>
              <div className="text-base font-extrabold text-amber-800 mt-0.5">{zakatNonSyedCount}</div>
            </div>
            <div className="bg-purple-50/60 p-2 rounded-lg border border-purple-200/70">
              <div className="text-[11px] text-purple-900 font-bold">Syed (سادات امدادی فنڈ)</div>
              <div className="text-base font-extrabold text-purple-800 mt-0.5">{zakatSyedCount}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

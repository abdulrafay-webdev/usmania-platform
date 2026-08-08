const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export interface Student {
  id: string;
  roll_no: string;
  name: string;
  picture: string;
  email: string;
  nic: string;
  dob: string;
  gender: 'Male' | 'Female' | string;
  contact: string;
  current_address: string;
  permanent_address: string;
  city: string;
  country: string;
  institution: string;
  previous_institute?: string;
  admission_date: string;
  islamic_date: string;
  student_class: string;
  subject?: string;
  boarding: boolean;
  father_guardian_name: string;
  assigned_teacher_id?: string;
  assigned_teacher_name?: string;
}

export interface Teacher {
  id: string;
  roll_no: string;
  name: string;
  picture: string;
  email: string;
  nic: string;
  dob: string;
  gender: 'Male' | 'Female' | string;
  contact: string;
  current_address: string;
  permanent_address: string;
  city: string;
  country: string;
  institution: string;
  previous_institute?: string;
  admission_date: string;
  islamic_date: string;
  subject: string;
  father_guardian_name?: string;
}

export type StudentCreatePayload = Omit<Student, 'id' | 'roll_no' | 'islamic_date'>;
export type TeacherCreatePayload = Omit<Teacher, 'id' | 'roll_no' | 'islamic_date'>;

// Auth API
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Invalid email or password');
  }

  return res.json();
}

// Fetch All / Search Students
export async function getStudents(query: string = ''): Promise<Student[]> {
  const endpoint = query.trim() 
    ? `${API_BASE_URL}/api/students/search?q=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/api/students`;
  const res = await fetch(endpoint, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

// Fetch All / Search Teachers
export async function getTeachers(query: string = ''): Promise<Teacher[]> {
  const endpoint = query.trim()
    ? `${API_BASE_URL}/api/teachers/search?q=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/api/teachers`;
  const res = await fetch(endpoint, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch teachers');
  return res.json();
}

// Get Single Student
export async function getStudentById(id: string): Promise<Student> {
  const res = await fetch(`${API_BASE_URL}/api/students/${id}`);
  if (!res.ok) throw new Error('Failed to fetch student profile');
  return res.json();
}

// Get Single Teacher
export async function getTeacherById(id: string): Promise<Teacher> {
  const res = await fetch(`${API_BASE_URL}/api/teachers/${id}`);
  if (!res.ok) throw new Error('Failed to fetch teacher profile');
  return res.json();
}

// Create Student
export async function createStudent(payload: Partial<Student>): Promise<Student> {
  const res = await fetch(`${API_BASE_URL}/api/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit student admission');
  }
  return res.json();
}

// Update Student
export async function updateStudent(id: string, payload: Partial<Student>): Promise<Student> {
  const res = await fetch(`${API_BASE_URL}/api/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update student record');
  }
  return res.json();
}

// Delete Student
export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/students/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete student record');
  }
}

// Create Teacher
export async function createTeacher(payload: Partial<Teacher>): Promise<Teacher> {
  const res = await fetch(`${API_BASE_URL}/api/teachers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit teacher registration');
  }
  return res.json();
}

// Update Teacher
export async function updateTeacher(id: string, payload: Partial<Teacher>): Promise<Teacher> {
  const res = await fetch(`${API_BASE_URL}/api/teachers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update teacher record');
  }
  return res.json();
}

// Delete Teacher
export async function deleteTeacher(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/teachers/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete teacher record');
  }
}

// Upload Picture
export async function uploadPicture(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/api/upload-image`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Image upload failed');
  const data = await res.json();
  return data.url;
}

// Full PDF Profile Download URLs
export function getStudentPdfDownloadUrl(id: string): string {
  return `${API_BASE_URL}/api/students/${id}/pdf`;
}

export function getTeacherPdfDownloadUrl(id: string): string {
  return `${API_BASE_URL}/api/teachers/${id}/pdf`;
}

// Printable ID Card Download URLs
export function getStudentIdCardDownloadUrl(id: string): string {
  return `${API_BASE_URL}/api/students/${id}/id-card`;
}

export function getTeacherIdCardDownloadUrl(id: string): string {
  return `${API_BASE_URL}/api/teachers/${id}/id-card`;
}

// Bulk Excel Export Trigger
export async function exportSelectedExcel(type: 'students' | 'teachers', ids: string[]) {
  const endpoint = `${API_BASE_URL}/api/${type}/export`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  });

  if (!res.ok) throw new Error('Excel export failed');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Jamia_Usmania_${type.toUpperCase()}_Export.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

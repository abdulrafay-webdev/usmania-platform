const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

export interface Student {
  id: string;
  roll_no: string;
  name: string;
  picture: string;
  email?: string;
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
  father_name?: string;
  guardian_name?: string;
  guardian_contact?: string;
  father_guardian_name: string;
  assigned_teacher_id?: string;
  assigned_teacher_name?: string;
  is_zakat_eligible?: boolean;
  zakat_syed_status?: 'Syed' | 'Non-Syed' | string;
  is_academy_student?: boolean;
  academy_class?: string;
  hostel_room_no?: string;
  hostel_bed_no?: string;
}

export interface Teacher {
  id: string;
  roll_no: string;
  name: string;
  picture: string;
  email?: string;
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

// ----------------- FINANCE INTERFACES -----------------
export interface ReceivedEntry {
  id: string;
  date: string;
  entry_type: 'Income' | 'Donation' | string;
  mode: 'Cash' | 'Online' | string;
  account: 'Cash' | 'JazzCash' | 'Easypaisa' | 'Meezan Bank' | string;
  amount: number;
  payer_name: string;
  payer_contact?: string;
  payer_address?: string;
  purpose_note?: string;
  created_at: string;
}

export interface DebitEntry {
  id: string;
  date: string;
  account: 'Cash' | 'JazzCash' | 'Easypaisa' | 'Meezan Bank' | string;
  amount: number;
  paid_to: string;
  purpose: string;
  created_at: string;
}

export interface KindDonation {
  id: string;
  date: string;
  item_name: string;
  category: 'Furniture' | 'Food' | 'Clothing' | 'Books' | 'Other' | string;
  quantity: number;
  estimated_value?: number;
  donor_name: string;
  donor_contact?: string;
  condition?: 'New' | 'Used' | string;
  notes?: string;
  created_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  amount_paid: number;
  date_paid: string;
  paid_from_account: string;
  notes?: string;
  created_at: string;
}

export interface Loan {
  id: string;
  lender_name: string;
  amount_taken: number;
  date_taken: string;
  received_in_account?: string;
  purpose: string;
  status: 'Active' | 'Fully Paid' | string;
  notes?: string;
  total_paid?: number;
  remaining_balance?: number;
  payments?: LoanPayment[];
  created_at: string;
}

export interface AccountBalancesResponse {
  accounts: {
    Cash: number;
    JazzCash: number;
    Easypaisa: number;
    'Meezan Bank': number;
  };
  grand_total: number;
}

export interface DashboardSummaryResponse {
  grand_total_balance: number;
  account_balances: {
    Cash: number;
    JazzCash: number;
    Easypaisa: number;
    'Meezan Bank': number;
  };
  today_received: number;
  today_debit: number;
  today_net: number;
  active_loan_remaining: number;
  chart_income_vs_expense: Array<{ date: string; Income: number; Expense: number }>;
  chart_account_pie: Array<{ name: string; value: number }>;
  chart_received_split: Array<{ type: string; amount: number }>;
  chart_debit_categories: Array<{ category: string; amount: number }>;
  chart_kind_donations: Array<{ category: string; count: number; value: number }>;
  loan_overviews: Array<{
    lender_name: string;
    amount_taken: number;
    total_paid: number;
    remaining: number;
    status: string;
  }>;
  recent_transactions: Array<{
    id: string;
    type: 'Received' | 'Debit' | 'Kind' | string;
    title: string;
    sub: string;
    amount: number;
    date: string;
    created_at: string;
    color: string;
  }>;
}

// ----------------- DONOR INTERFACES -----------------
export interface DonorListItem {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  city: string;
  country: string;
  category: 'Individual' | 'Corporate' | 'Foundation' | 'Regular' | string;
  notes: string;
  created_at: string;
  total_cash_donated: number;
  donations_count: number;
  total_kind_donations: number;
  total_kind_value: number;
  latest_donation_date?: string | null;
  comments_count: number;
}

export interface DonorComment {
  id: string;
  donor_id: string;
  donor_name?: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface DonorDetailResponse {
  donor: DonorListItem;
  total_cash_donated: number;
  total_kind_value: number;
  donations_count: number;
  kind_count: number;
  cash_donations: ReceivedEntry[];
  kind_donations: KindDonation[];
  comments: DonorComment[];
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

// ----------------- FINANCE API FUNCTIONS -----------------

// 1. Received Entries
export async function getFinanceReceived(filters?: {
  date_from?: string;
  date_to?: string;
  entry_type?: string;
  account?: string;
  q?: string;
}): Promise<ReceivedEntry[]> {
  const params = new URLSearchParams();
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.entry_type) params.append('entry_type', filters.entry_type);
  if (filters?.account) params.append('account', filters.account);
  if (filters?.q) params.append('q', filters.q);

  const res = await fetch(`${API_BASE_URL}/api/finance/received?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch received entries');
  return res.json();
}

export async function createFinanceReceived(payload: Partial<ReceivedEntry>): Promise<ReceivedEntry> {
  const res = await fetch(`${API_BASE_URL}/api/finance/received`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create received entry');
  }
  return res.json();
}

// 2. Debit Entries
export async function getFinanceDebit(filters?: {
  date_from?: string;
  date_to?: string;
  account?: string;
  q?: string;
}): Promise<DebitEntry[]> {
  const params = new URLSearchParams();
  if (filters?.date_from) params.append('date_from', filters.date_from);
  if (filters?.date_to) params.append('date_to', filters.date_to);
  if (filters?.account) params.append('account', filters.account);
  if (filters?.q) params.append('q', filters.q);

  const res = await fetch(`${API_BASE_URL}/api/finance/debit?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch debit entries');
  return res.json();
}

export async function createFinanceDebit(payload: Partial<DebitEntry>): Promise<DebitEntry> {
  const res = await fetch(`${API_BASE_URL}/api/finance/debit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create debit entry');
  }
  return res.json();
}

// 3. Kind Donations
export async function getFinanceKindDonations(filters?: {
  category?: string;
  q?: string;
}): Promise<KindDonation[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.q) params.append('q', filters.q);

  const res = await fetch(`${API_BASE_URL}/api/finance/kind-donation?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch in-kind donations');
  return res.json();
}

export async function createFinanceKindDonation(payload: Partial<KindDonation>): Promise<KindDonation> {
  const res = await fetch(`${API_BASE_URL}/api/finance/kind-donation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create in-kind donation');
  }
  return res.json();
}

// 4. Loans & Payments
export async function getFinanceLoans(): Promise<Loan[]> {
  const res = await fetch(`${API_BASE_URL}/api/finance/loans`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch loans');
  return res.json();
}

export async function createFinanceLoan(payload: Partial<Loan>): Promise<Loan> {
  const res = await fetch(`${API_BASE_URL}/api/finance/loans`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create loan record');
  }
  return res.json();
}

export async function getFinanceLoanDetail(loanId: string): Promise<Loan> {
  const res = await fetch(`${API_BASE_URL}/api/finance/loans/${loanId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch loan detail');
  return res.json();
}

export async function addFinanceLoanPayment(loanId: string, payload: Partial<LoanPayment>): Promise<LoanPayment> {
  const res = await fetch(`${API_BASE_URL}/api/finance/loans/${loanId}/payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to record loan payment');
  }
  return res.json();
}

// 5. Account Balances & Dashboard
export async function getFinanceAccountBalances(): Promise<AccountBalancesResponse> {
  const res = await fetch(`${API_BASE_URL}/api/finance/accounts/balances`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch account balances');
  return res.json();
}

export async function getFinanceDashboardSummary(): Promise<DashboardSummaryResponse> {
  const res = await fetch(`${API_BASE_URL}/api/finance/dashboard/summary`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch finance dashboard summary');
  return res.json();
}

// 6. Comprehensive Finance Excel Export
export async function exportFinanceExcel(date_from?: string, date_to?: string) {
  const params = new URLSearchParams();
  if (date_from) params.append('date_from', date_from);
  if (date_to) params.append('date_to', date_to);

  const endpoint = `${API_BASE_URL}/api/finance/export/excel?${params.toString()}`;
  const res = await fetch(endpoint);
  if (!res.ok) throw new Error('Failed to generate Finance Excel report');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  let periodLabel = 'All_Time';
  if (date_from && date_to) periodLabel = `${date_from}_to_${date_to}`;
  else if (date_from) periodLabel = `from_${date_from}`;
  else if (date_to) periodLabel = `up_to_${date_to}`;

  a.download = `Jamia_Usmania_Finance_Report_${periodLabel}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

// ----------------- DONORS & COMMENTS API -----------------
export async function getDonors(query?: string): Promise<DonorListItem[]> {
  const endpoint = query?.trim()
    ? `${API_BASE_URL}/api/donors?q=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/api/donors`;
  const res = await fetch(endpoint, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch donors list');
  return res.json();
}

export async function getDonorDetail(donorId: string): Promise<DonorDetailResponse> {
  const res = await fetch(`${API_BASE_URL}/api/donors/${donorId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch donor details');
  return res.json();
}

export async function createDonor(payload: Partial<DonorListItem>): Promise<DonorListItem> {
  const res = await fetch(`${API_BASE_URL}/api/donors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to register donor');
  }
  return res.json();
}

export async function updateDonor(donorId: string, payload: Partial<DonorListItem>): Promise<DonorListItem> {
  const res = await fetch(`${API_BASE_URL}/api/donors/${donorId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update donor');
  }
  return res.json();
}

export async function deleteDonor(donorId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/donors/${donorId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete donor');
  }
}

export async function addDonorComment(
  donorId: string,
  payload: { author_name: string; content: string }
): Promise<DonorComment> {
  const res = await fetch(`${API_BASE_URL}/api/donors/${donorId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to post comment');
  }
  return res.json();
}

export async function deleteDonorComment(donorId: string, commentId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/donors/${donorId}/comments/${commentId}`, {
    method: 'DELETE'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete comment');
  }
}

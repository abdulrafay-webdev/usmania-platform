const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '');

// ----------------- RBAC & AUTH INTERFACES -----------------
export interface User {
  id: string;
  name: string;
  email: string;
  role_id: string;
  role_name?: string;
  is_active: boolean;
  created_at: string;
  last_login_at?: string | null;
}

export interface PermissionDTO {
  module: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  is_system_role: boolean;
  created_at: string;
  permissions: PermissionDTO[];
}

export interface AuthMeResponse {
  user: User;
  role: Role;
  permissions: Record<string, { can_view: boolean; can_create: boolean; can_edit: boolean; can_delete: boolean }>;
}

export interface UserCreatePayload {
  name: string;
  email: string;
  password: string;
  role_id: string;
  is_active?: boolean;
}

export interface UserUpdatePayload {
  name?: string;
  email?: string;
  role_id?: string;
  is_active?: boolean;
  password?: string;
}

export interface RoleCreatePayload {
  name: string;
  description?: string;
  permissions?: PermissionDTO[];
}

export interface RoleUpdatePayload {
  name?: string;
  description?: string;
}

// ----------------- STUDENT & TEACHER INTERFACES -----------------
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

  // Optional Documents / Images
  doc_zakat?: string;
  doc_birth_certificate?: string;
  doc_activity_diary?: string;
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
  father_guardian_name: string;

  // Optional Documents / Images
  doc_contract?: string;
  doc_payslip?: string;
  doc_cnic?: string;
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

// ----------------- LIABILITY INTERFACES -----------------
export interface LiabilityPayment {
  id: string;
  liability_id: string;
  amount_paid: number;
  date_paid: string;
  paid_from_account: string;
  notes?: string;
  created_at: string;
}

export interface Liability {
  id: string;
  title: string;
  category: 'Utility Bill' | 'Vendor / Supplier' | 'Maintenance / Construction' | 'Salary / Honorarium' | 'Other' | string;
  amount_total: number;
  total_paid: number;
  remaining_balance: number;
  date_incurred: string;
  due_date?: string | null;
  status: 'Pending' | 'Partially Paid' | 'Fully Paid' | string;
  notes?: string;
  created_at: string;
}

export interface LiabilityDetailResponse {
  liability: Liability;
  total_paid: number;
  remaining_balance: number;
  payments: LiabilityPayment[];
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
  active_liabilities_remaining?: number;
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
  liabilities_overviews?: Array<{
    id: string;
    title: string;
    category: string;
    amount_total: number;
    total_paid: number;
    remaining: number;
    due_date?: string | null;
    status: string;
  }>;
  recent_transactions: Array<{
    id: string;
    type: 'Received' | 'Debit' | 'Kind';
    title: string;
    sub: string;
    amount: number;
    date: string;
    created_at: string;
    color: 'green' | 'red' | 'blue';
  }>;
}

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

// Helper to include Bearer token if stored locally
function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extraHeaders };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  return headers;
}

// ----------------- AUTHENTICATION API -----------------
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Invalid email or password');
  }

  const data = await res.json();
  if (typeof window !== 'undefined' && data.access_token) {
    localStorage.setItem('jwt_token', data.access_token);
  }
  return data;
}

export async function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt_token');
  }
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (e) {
    // Ignore logout error
  }
}

export async function getMe(): Promise<AuthMeResponse> {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) {
    throw new Error('Not authenticated');
  }
  return res.json();
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return res.json();
}

export async function resetPassword(token: string, new_password: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, new_password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to reset password');
  }
  return res.json();
}


// ----------------- USERS MANAGEMENT API -----------------
export async function getUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch users list');
  return res.json();
}

export async function createUser(payload: UserCreatePayload): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/users`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create user');
  }
  return res.json();
}

export async function updateUser(id: string, payload: UserUpdatePayload): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update user');
  }
  return res.json();
}

export async function triggerUserPasswordReset(id: string): Promise<{ message: string }> {
  const res = await fetch(`${API_BASE_URL}/api/users/${id}/reset-password`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to trigger password reset');
  }
  return res.json();
}


// ----------------- ROLES MANAGEMENT API -----------------
export async function getRoles(): Promise<Role[]> {
  const res = await fetch(`${API_BASE_URL}/api/roles`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch roles');
  return res.json();
}

export async function createRole(payload: RoleCreatePayload): Promise<Role> {
  const res = await fetch(`${API_BASE_URL}/api/roles`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create role');
  }
  return res.json();
}

export async function updateRole(id: string, payload: RoleUpdatePayload): Promise<Role> {
  const res = await fetch(`${API_BASE_URL}/api/roles/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update role');
  }
  return res.json();
}

export async function updateRolePermissions(id: string, permissions: PermissionDTO[]): Promise<Role> {
  const res = await fetch(`${API_BASE_URL}/api/roles/${id}/permissions`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ permissions })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update role permissions');
  }
  return res.json();
}

export async function deleteRole(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/roles/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete role');
  }
}


// ----------------- STUDENTS API -----------------
export async function getStudents(query: string = ''): Promise<Student[]> {
  const endpoint = query.trim() 
    ? `${API_BASE_URL}/api/students/search?q=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/api/students`;
  const res = await fetch(endpoint, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch students');
  return res.json();
}

export async function getStudentById(id: string): Promise<Student> {
  const res = await fetch(`${API_BASE_URL}/api/students/${id}`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch student profile');
  return res.json();
}

export async function createStudent(payload: Partial<Student>): Promise<Student> {
  const res = await fetch(`${API_BASE_URL}/api/students`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit student admission');
  }
  return res.json();
}

export async function updateStudent(id: string, payload: Partial<Student>): Promise<Student> {
  const res = await fetch(`${API_BASE_URL}/api/students/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update student record');
  }
  return res.json();
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/students/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete student record');
  }
}


// ----------------- TEACHERS API -----------------
export async function getTeachers(query: string = ''): Promise<Teacher[]> {
  const endpoint = query.trim()
    ? `${API_BASE_URL}/api/teachers/search?q=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/api/teachers`;
  const res = await fetch(endpoint, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch teachers');
  return res.json();
}

export async function getTeacherById(id: string): Promise<Teacher> {
  const res = await fetch(`${API_BASE_URL}/api/teachers/${id}`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to fetch teacher profile');
  return res.json();
}

export async function createTeacher(payload: Partial<Teacher>): Promise<Teacher> {
  const res = await fetch(`${API_BASE_URL}/api/teachers`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to submit teacher registration');
  }
  return res.json();
}

export async function updateTeacher(id: string, payload: Partial<Teacher>): Promise<Teacher> {
  const res = await fetch(`${API_BASE_URL}/api/teachers/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update teacher record');
  }
  return res.json();
}

export async function deleteTeacher(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/teachers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to delete teacher record');
  }
}


// ----------------- IMAGE UPLOAD -----------------
export async function uploadPicture(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/api/upload-image`, {
    method: 'POST',
    headers: getAuthHeaders(),
    credentials: 'include',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Image upload failed');
  }
  const data = await res.json();
  return data.url;
}


// ----------------- FINANCE API -----------------
export async function getReceivedEntries(filters?: {
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

  const res = await fetch(`${API_BASE_URL}/api/finance/received?${params.toString()}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch received entries');
  return res.json();
}

export async function createReceivedEntry(payload: Omit<ReceivedEntry, 'id' | 'created_at'>): Promise<ReceivedEntry> {
  const res = await fetch(`${API_BASE_URL}/api/finance/received`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create received entry');
  }
  return res.json();
}

export async function deleteReceivedEntry(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/finance/received/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete received entry');
}

export async function getDebitEntries(filters?: {
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

  const res = await fetch(`${API_BASE_URL}/api/finance/debit?${params.toString()}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch debit entries');
  return res.json();
}

export async function createDebitEntry(payload: Omit<DebitEntry, 'id' | 'created_at'>): Promise<DebitEntry> {
  const res = await fetch(`${API_BASE_URL}/api/finance/debit`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create debit entry');
  }
  return res.json();
}

export async function deleteDebitEntry(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/finance/debit/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete debit entry');
}

export async function getKindDonations(filters?: {
  category?: string;
  q?: string;
}): Promise<KindDonation[]> {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.q) params.append('q', filters.q);

  const res = await fetch(`${API_BASE_URL}/api/finance/kind-donation?${params.toString()}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch in-kind donations');
  return res.json();
}

export async function createKindDonation(payload: Omit<KindDonation, 'id' | 'created_at'>): Promise<KindDonation> {
  const res = await fetch(`${API_BASE_URL}/api/finance/kind-donation`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create kind donation');
  }
  return res.json();
}

export async function deleteKindDonation(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/finance/kind-donation/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete kind donation');
}

export async function getLoans(): Promise<Loan[]> {
  const res = await fetch(`${API_BASE_URL}/api/finance/loans`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch loans');
  return res.json();
}

export async function getLoanDetail(id: string): Promise<Loan> {
  const res = await fetch(`${API_BASE_URL}/api/finance/loans/${id}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch loan details');
  return res.json();
}

export async function createLoan(payload: Omit<Loan, 'id' | 'status' | 'created_at' | 'total_paid' | 'remaining_balance' | 'payments'>): Promise<Loan> {
  const res = await fetch(`${API_BASE_URL}/api/finance/loans`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create loan');
  }
  return res.json();
}

export async function addLoanPayment(loanId: string, payload: { amount_paid: number; date_paid?: string; paid_from_account: string; notes?: string }): Promise<LoanPayment> {
  const res = await fetch(`${API_BASE_URL}/api/finance/loans/${loanId}/payments`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to record loan repayment');
  }
  return res.json();
}

export async function deleteLoan(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/finance/loans/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete loan');
}

// ----------------- LIABILITIES API -----------------
export async function getLiabilities(params?: { status?: string; category?: string; search?: string }): Promise<Liability[]> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.category) query.append('category', params.category);
  if (params?.search) query.append('search', params.search);

  const res = await fetch(`${API_BASE_URL}/api/finance/liabilities?${query.toString()}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch liabilities');
  return res.json();
}

export async function getLiabilityDetail(id: string): Promise<LiabilityDetailResponse> {
  const res = await fetch(`${API_BASE_URL}/api/finance/liabilities/${id}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch liability details');
  return res.json();
}

export async function createLiability(payload: {
  title: string;
  category?: string;
  amount_total: number;
  date_incurred?: string;
  due_date?: string;
  notes?: string;
}): Promise<Liability> {
  const res = await fetch(`${API_BASE_URL}/api/finance/liabilities`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to create liability');
  }
  return res.json();
}

export async function updateLiability(id: string, payload: {
  title?: string;
  category?: string;
  amount_total?: number;
  date_incurred?: string;
  due_date?: string;
  notes?: string;
}): Promise<Liability> {
  const res = await fetch(`${API_BASE_URL}/api/finance/liabilities/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to update liability');
  }
  return res.json();
}

export async function addLiabilityPayment(liabilityId: string, payload: {
  amount_paid: number;
  date_paid?: string;
  paid_from_account: string;
  notes?: string;
}): Promise<LiabilityPayment> {
  const res = await fetch(`${API_BASE_URL}/api/finance/liabilities/${liabilityId}/payments`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to record liability payment');
  }
  return res.json();
}

export async function getLiabilityPayments(liabilityId: string): Promise<LiabilityPayment[]> {
  const res = await fetch(`${API_BASE_URL}/api/finance/liabilities/${liabilityId}/payments`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch liability payments');
  return res.json();
}

export async function deleteLiability(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/finance/liabilities/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete liability');
}

export async function getAccountBalances(): Promise<AccountBalancesResponse> {
  const res = await fetch(`${API_BASE_URL}/api/finance/accounts/balances`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch account balances');
  return res.json();
}

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  const res = await fetch(`${API_BASE_URL}/api/finance/dashboard/summary`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}


// ----------------- DONORS DIRECTORY API -----------------
export async function getDonors(query?: string): Promise<DonorListItem[]> {
  const params = query ? `?q=${encodeURIComponent(query)}` : '';
  const res = await fetch(`${API_BASE_URL}/api/donors${params}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch donors list');
  return res.json();
}

export async function getDonorDetail(id: string): Promise<DonorDetailResponse> {
  const res = await fetch(`${API_BASE_URL}/api/donors/${id}`, {
    headers: getAuthHeaders(),
    credentials: 'include',
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch donor profile');
  return res.json();
}

export async function addDonorComment(
  donorId: string,
  payloadOrAuthor: { author_name: string; content: string } | string,
  maybeContent?: string
): Promise<DonorComment> {
  const author = typeof payloadOrAuthor === 'object' ? payloadOrAuthor.author_name : payloadOrAuthor;
  const content = typeof payloadOrAuthor === 'object' ? payloadOrAuthor.content : maybeContent || '';

  const res = await fetch(`${API_BASE_URL}/api/donors/${donorId}/comments`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ author_name: author, content })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to add comment');
  }
  return res.json();
}

export async function deleteDonorComment(donorId: string, commentId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/donors/${donorId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete comment');
}


// ----------------- PDF & EXCEL EXPORTS -----------------
function getAuthTokenParam(): string {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt_token');
    if (token) return `token=${encodeURIComponent(token)}`;
  }
  return '';
}

export function getStudentPdfDownloadUrl(id: string): string {
  const tokenParam = getAuthTokenParam();
  return `${API_BASE_URL}/api/students/${id}/pdf${tokenParam ? `?${tokenParam}` : ''}`;
}

export function getTeacherPdfDownloadUrl(id: string): string {
  const tokenParam = getAuthTokenParam();
  return `${API_BASE_URL}/api/teachers/${id}/pdf${tokenParam ? `?${tokenParam}` : ''}`;
}

export function getStudentIdCardDownloadUrl(id: string): string {
  const tokenParam = getAuthTokenParam();
  return `${API_BASE_URL}/api/students/${id}/id-card${tokenParam ? `?${tokenParam}` : ''}`;
}

export function getTeacherIdCardDownloadUrl(id: string): string {
  const tokenParam = getAuthTokenParam();
  return `${API_BASE_URL}/api/teachers/${id}/id-card${tokenParam ? `?${tokenParam}` : ''}`;
}

export function getFinanceExcelDownloadUrl(dateFrom?: string, dateTo?: string): string {
  const params = new URLSearchParams();
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt_token');
    if (token) params.append('token', token);
  }
  return `${API_BASE_URL}/api/finance/export/excel?${params.toString()}`;
}

export async function downloadTeacherPdf(id: string, teacherName: string = 'Teacher'): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/teachers/${id}/pdf`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to download Teacher PDF');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Jamia_Usmania_Teacher_${teacherName.replace(/\s+/g, '_')}_Profile.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function downloadStudentPdf(id: string, studentName: string = 'Student'): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/students/${id}/pdf`, {
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to download Student PDF');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Jamia_Usmania_Student_${studentName.replace(/\s+/g, '_')}_Profile.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function exportBulkStudentsExcel(ids: string[]): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/api/students/export`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ ids })
  });
  if (!res.ok) throw new Error('Failed to export students excel');
  return res.blob();
}

export async function exportBulkTeachersExcel(ids: string[]): Promise<Blob> {
  const res = await fetch(`${API_BASE_URL}/api/teachers/export`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify({ ids })
  });
  if (!res.ok) throw new Error('Failed to export teachers excel');
  return res.blob();
}

// Backward-compatibility aliases for Finance components
export const getFinanceReceived = getReceivedEntries;
export const createFinanceReceived = createReceivedEntry;
export const deleteFinanceReceived = deleteReceivedEntry;

export const getFinanceDebit = getDebitEntries;
export const createFinanceDebit = createDebitEntry;
export const deleteFinanceDebit = deleteDebitEntry;

export const getFinanceKindDonations = getKindDonations;
export const createFinanceKindDonation = createKindDonation;
export const deleteFinanceKindDonation = deleteKindDonation;

export const getFinanceLoans = getLoans;
export const getFinanceLoanDetail = getLoanDetail;
export const createFinanceLoan = createLoan;
export const addFinanceLoanPayment = addLoanPayment;
export const deleteFinanceLoan = deleteLoan;

export const getFinanceLiabilities = getLiabilities;
export const getFinanceLiabilityDetail = getLiabilityDetail;
export const createFinanceLiability = createLiability;
export const updateFinanceLiability = updateLiability;
export const addFinanceLiabilityPayment = addLiabilityPayment;
export const deleteFinanceLiability = deleteLiability;

export const getFinanceAccountBalances = getAccountBalances;
export const getFinanceDashboardSummary = getDashboardSummary;

export async function exportSelectedExcel(type: 'students' | 'teachers', ids: string[]) {
  const blob = type === 'students' ? await exportBulkStudentsExcel(ids) : await exportBulkTeachersExcel(ids);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Jamia_Usmania_${type === 'students' ? 'Students' : 'Teachers'}_Export.xlsx`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function createDonor(payload: any): Promise<DonorListItem> {
  const res = await fetch(`${API_BASE_URL}/api/donors`, {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to create donor');
  return res.json();
}

export async function updateDonor(id: string, payload: any): Promise<DonorListItem> {
  const res = await fetch(`${API_BASE_URL}/api/donors/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error('Failed to update donor');
  return res.json();
}

export async function deleteDonor(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/donors/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Failed to delete donor');
}

export async function exportFinanceExcel(dateFrom?: string, dateTo?: string) {
  const url = getFinanceExcelDownloadUrl(dateFrom, dateTo);
  window.open(url, '_blank');
}



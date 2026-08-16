import uuid
from datetime import date as date_type, datetime as datetime_type
from typing import Optional, List, Dict
from enum import Enum
from sqlmodel import SQLModel, Field, Column, String, Text, Float

# ----------------- ENUMS -----------------
class GenderEnum(str, Enum):
    MALE = "Male"
    FEMALE = "Female"

class AccountEnum(str, Enum):
    CASH = "Cash"
    JAZZCASH = "JazzCash"
    EASYPAISA = "Easypaisa"
    MEEZAN_BANK = "Meezan Bank"

class EntryTypeEnum(str, Enum):
    INCOME = "Income"
    DONATION = "Donation"

class PaymentModeEnum(str, Enum):
    CASH = "Cash"
    ONLINE = "Online"

class ItemConditionEnum(str, Enum):
    NEW = "New"
    USED = "Used"

class LoanStatusEnum(str, Enum):
    ACTIVE = "Active"
    FULLY_PAID = "Fully Paid"

class SyedStatusEnum(str, Enum):
    SYED = "Syed"
    NON_SYED = "Non-Syed"

class ModuleEnum(str, Enum):
    STUDENTS = "students"
    TEACHERS = "teachers"
    FINANCE_DASHBOARD = "finance_dashboard"
    FINANCE_RECEIVED = "finance_received"
    FINANCE_DEBIT = "finance_debit"
    FINANCE_KIND_DONATION = "finance_kind_donation"
    FINANCE_LOAN = "finance_loan"
    FINANCE_LIABILITY = "finance_liability"
    SETTINGS_USERS = "settings_users"

ALL_MODULES = [
    ModuleEnum.STUDENTS.value,
    ModuleEnum.TEACHERS.value,
    ModuleEnum.FINANCE_DASHBOARD.value,
    ModuleEnum.FINANCE_RECEIVED.value,
    ModuleEnum.FINANCE_DEBIT.value,
    ModuleEnum.FINANCE_KIND_DONATION.value,
    ModuleEnum.FINANCE_LOAN.value,
    ModuleEnum.FINANCE_LIABILITY.value,
    ModuleEnum.SETTINGS_USERS.value
]


# ----------------- RBAC DATA MODELS -----------------

class Role(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = Field(default="")
    is_system_role: bool = Field(default=False, description="Protect default system roles from deletion")
    created_at: datetime_type = Field(default_factory=datetime_type.now)


class Permission(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    role_id: str = Field(index=True, foreign_key="role.id")
    module: str = Field(index=True, description="students, teachers, finance_dashboard, etc.")
    can_view: bool = Field(default=False)
    can_create: bool = Field(default=False)
    can_edit: bool = Field(default=False)
    can_delete: bool = Field(default=False)


class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(index=True)
    email: str = Field(index=True, unique=True)
    password_hash: str
    role_id: str = Field(index=True, foreign_key="role.id")
    is_active: bool = Field(default=True)
    token_version: int = Field(default=1, description="Incremented to invalidate previous JWT sessions")
    created_at: datetime_type = Field(default_factory=datetime_type.now)
    last_login_at: Optional[datetime_type] = Field(default=None)


class PasswordResetToken(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    user_id: str = Field(index=True, foreign_key="user.id")
    token_hash: str = Field(index=True)
    expires_at: datetime_type
    used: bool = Field(default=False)
    created_at: datetime_type = Field(default_factory=datetime_type.now)


# ----------------- RBAC DTO SCHEMAS -----------------

class PermissionDTO(SQLModel):
    module: str
    can_view: bool = False
    can_create: bool = False
    can_edit: bool = False
    can_delete: bool = False

class RoleCreate(SQLModel):
    name: str
    description: Optional[str] = ""
    permissions: Optional[List[PermissionDTO]] = []

class RoleUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None

class RolePermissionsUpdate(SQLModel):
    permissions: List[PermissionDTO]

class RoleResponse(SQLModel):
    id: str
    name: str
    description: Optional[str] = ""
    is_system_role: bool = False
    created_at: datetime_type
    permissions: List[PermissionDTO] = []

class UserCreate(SQLModel):
    name: str
    email: str
    password: str
    role_id: str
    is_active: bool = True

class UserUpdate(SQLModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role_id: Optional[str] = None
    is_active: Optional[bool] = None
    password: Optional[str] = None

class UserResponse(SQLModel):
    id: str
    name: str
    email: str
    role_id: str
    role_name: Optional[str] = ""
    is_active: bool
    created_at: datetime_type
    last_login_at: Optional[datetime_type] = None

class LoginRequest(SQLModel):
    email: str
    password: str

class ForgotPasswordRequest(SQLModel):
    email: str

class ResetPasswordRequest(SQLModel):
    token: str
    new_password: str

class AuthMeResponse(SQLModel):
    user: UserResponse
    role: RoleResponse
    permissions: Dict[str, Dict[str, bool]]


# ----------------- STUDENT SQLMODEL -----------------
class Student(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    roll_no: str = Field(index=True, unique=True)
    name: str = Field(index=True)
    picture: str = Field(default="")
    email: Optional[str] = Field(default="")
    nic: str = Field(default="")
    dob: date_type
    gender: str = Field(default="Male")
    contact: str = Field(default="")
    current_address: str = Field(sa_column=Column(Text, default=""))
    permanent_address: str = Field(sa_column=Column(Text, default=""))
    city: str = Field(default="")
    country: str = Field(default="Pakistan")
    institution: str = Field(default="Jamia Usmania")
    previous_institute: Optional[str] = Field(default="")
    admission_date: date_type = Field(default_factory=date_type.today)
    islamic_date: str = Field(default="")

    # Student specific
    student_class: str = Field(default="Grade 1", description="Class or Grade e.g. Hifz, Tajweed, Alim")
    subject: Optional[str] = Field(default="")
    boarding: bool = Field(default=False)
    
    # Parent & Guardian Details
    father_name: Optional[str] = Field(default="", description="Father's Name")
    guardian_name: Optional[str] = Field(default="", description="Guardian's Name")
    guardian_contact: Optional[str] = Field(default="", description="Guardian's Phone Number")
    father_guardian_name: Optional[str] = Field(default="")

    # Assigned Teacher link
    assigned_teacher_id: Optional[str] = Field(default=None)
    assigned_teacher_name: Optional[str] = Field(default="")

    # Checkbox Flags & Dynamic Sub-options
    is_zakat_eligible: bool = Field(default=False, description="Is student eligible for Zakat / Mustahiq Zakat")
    zakat_syed_status: Optional[str] = Field(default="Non-Syed", description="Syed or Non-Syed")

    is_academy_student: bool = Field(default=False, description="Is student also enrolled in Usmania Academy School")
    academy_class: Optional[str] = Field(default="", description="Class in Usmania Academy School (Montessori to Matric)")

    # Boarding Details
    hostel_room_no: Optional[str] = Field(default="", description="Hostel Room Number")
    hostel_bed_no: Optional[str] = Field(default="", description="Hostel Bed Number")

    # Optional Student Documents / Images
    doc_zakat: Optional[str] = Field(default="", description="Zakat Document / Proof Image URL")
    doc_birth_certificate: Optional[str] = Field(default="", description="Birth Certificate / B-Form Image URL")
    doc_activity_diary: Optional[str] = Field(default="", description="Activity Diary / Progress Report Image URL")


class StudentCreate(SQLModel):
    name: str
    picture: Optional[str] = ""
    email: Optional[str] = ""
    nic: str
    dob: date_type
    gender: str = "Male"
    contact: str
    current_address: str
    permanent_address: str
    city: str
    country: str = "Pakistan"
    institution: str = "Jamia Usmania"
    previous_institute: Optional[str] = ""
    admission_date: Optional[date_type] = None
    
    student_class: str
    subject: Optional[str] = ""
    boarding: bool = False
    
    father_name: Optional[str] = ""
    guardian_name: Optional[str] = ""
    guardian_contact: Optional[str] = ""
    father_guardian_name: Optional[str] = ""

    assigned_teacher_id: Optional[str] = None
    assigned_teacher_name: Optional[str] = ""

    is_zakat_eligible: bool = False
    zakat_syed_status: Optional[str] = "Non-Syed"

    is_academy_student: bool = False
    academy_class: Optional[str] = ""

    hostel_room_no: Optional[str] = ""
    hostel_bed_no: Optional[str] = ""

    # Optional Documents
    doc_zakat: Optional[str] = ""
    doc_birth_certificate: Optional[str] = ""
    doc_activity_diary: Optional[str] = ""


class StudentUpdate(SQLModel):
    name: Optional[str] = None
    picture: Optional[str] = None
    email: Optional[str] = None
    nic: Optional[str] = None
    dob: Optional[date_type] = None
    gender: Optional[str] = None
    contact: Optional[str] = None
    current_address: Optional[str] = None
    permanent_address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    institution: Optional[str] = None
    previous_institute: Optional[str] = None
    student_class: Optional[str] = None
    subject: Optional[str] = None
    boarding: Optional[bool] = None
    
    father_name: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_contact: Optional[str] = None
    father_guardian_name: Optional[str] = None

    assigned_teacher_id: Optional[str] = None
    assigned_teacher_name: Optional[str] = None

    is_zakat_eligible: Optional[bool] = None
    zakat_syed_status: Optional[str] = None

    is_academy_student: Optional[bool] = None
    academy_class: Optional[str] = None

    hostel_room_no: Optional[str] = None
    hostel_bed_no: Optional[str] = None

    # Optional Documents
    doc_zakat: Optional[str] = None
    doc_birth_certificate: Optional[str] = None
    doc_activity_diary: Optional[str] = None


# ----------------- TEACHER SQLMODEL -----------------
class Teacher(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    roll_no: str = Field(index=True, unique=True)
    name: str = Field(index=True)
    picture: str = Field(default="")
    email: Optional[str] = Field(default="")
    nic: str = Field(default="")
    dob: date_type
    gender: str = Field(default="Male")
    contact: str = Field(default="")
    current_address: str = Field(sa_column=Column(Text, default=""))
    permanent_address: str = Field(sa_column=Column(Text, default=""))
    city: str = Field(default="")
    country: str = Field(default="Pakistan")
    institution: str = Field(default="Jamia Usmania")
    previous_institute: Optional[str] = Field(default="")
    admission_date: date_type = Field(default_factory=date_type.today)
    islamic_date: str = Field(default="")

    # Teacher specific
    subject: str = Field(default="", description="Subject(s) taught")
    father_guardian_name: Optional[str] = Field(default="")

    # Optional Teacher Documents / Images
    doc_contract: Optional[str] = Field(default="", description="Teacher Contract / Agreement Document URL")
    doc_payslip: Optional[str] = Field(default="", description="Payslip / Salary Voucher Image URL")
    doc_cnic: Optional[str] = Field(default="", description="Teacher CNIC Copy Image URL")


class TeacherCreate(SQLModel):
    name: str
    picture: Optional[str] = ""
    email: Optional[str] = ""
    nic: str
    dob: date_type
    gender: str = "Male"
    contact: str
    current_address: str
    permanent_address: str
    city: str
    country: str = "Pakistan"
    institution: str = "Jamia Usmania"
    previous_institute: Optional[str] = ""
    admission_date: Optional[date_type] = None
    
    subject: str
    father_guardian_name: Optional[str] = ""

    # Optional Documents
    doc_contract: Optional[str] = ""
    doc_payslip: Optional[str] = ""
    doc_cnic: Optional[str] = ""


class TeacherUpdate(SQLModel):
    name: Optional[str] = None
    picture: Optional[str] = None
    email: Optional[str] = None
    nic: Optional[str] = None
    dob: Optional[date_type] = None
    gender: Optional[str] = None
    contact: Optional[str] = None
    current_address: Optional[str] = None
    permanent_address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    institution: Optional[str] = None
    previous_institute: Optional[str] = None
    subject: Optional[str] = None
    father_guardian_name: Optional[str] = None

    # Optional Documents
    doc_contract: Optional[str] = None
    doc_payslip: Optional[str] = None
    doc_cnic: Optional[str] = None


class BulkExportRequest(SQLModel):
    ids: List[str]


# ----------------- FINANCE SQLMODELS -----------------

# 1. ReceivedEntry
class ReceivedEntry(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    date: date_type = Field(default_factory=date_type.today)
    entry_type: str = Field(description="Income or Donation")
    mode: str = Field(description="Cash or Online")
    account: str = Field(description="Cash, JazzCash, Easypaisa, Meezan Bank")
    amount: float = Field(default=0.0)
    payer_name: str = Field(default="")
    payer_contact: str = Field(default="")
    payer_address: Optional[str] = Field(default="")
    purpose_note: Optional[str] = Field(default="")
    created_at: datetime_type = Field(default_factory=datetime_type.now)

class ReceivedEntryCreate(SQLModel):
    date: Optional[date_type] = None
    entry_type: str  # Income / Donation
    mode: str        # Cash / Online
    account: str     # Cash / JazzCash / Easypaisa / Meezan Bank
    amount: float
    payer_name: str
    payer_contact: Optional[str] = ""
    payer_address: Optional[str] = ""
    purpose_note: Optional[str] = ""


# 2. DebitEntry
class DebitEntry(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    date: date_type = Field(default_factory=date_type.today)
    account: str = Field(description="Cash, JazzCash, Easypaisa, Meezan Bank")
    amount: float = Field(default=0.0)
    paid_to: str = Field(default="")
    purpose: str = Field(default="")
    created_at: datetime_type = Field(default_factory=datetime_type.now)

class DebitEntryCreate(SQLModel):
    date: Optional[date_type] = None
    account: str
    amount: float
    paid_to: str
    purpose: str


# 3. KindDonation
class KindDonation(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    date: date_type = Field(default_factory=date_type.today)
    item_name: str = Field(default="")
    category: str = Field(default="Other", description="Furniture, Food, Clothing, Books, Other")
    quantity: int = Field(default=1)
    estimated_value: Optional[float] = Field(default=0.0)
    donor_name: str = Field(default="")
    donor_contact: Optional[str] = Field(default="")
    condition: Optional[str] = Field(default="New", description="New or Used")
    notes: Optional[str] = Field(default="")
    created_at: datetime_type = Field(default_factory=datetime_type.now)

class KindDonationCreate(SQLModel):
    date: Optional[date_type] = None
    item_name: str
    category: str = "Other"
    quantity: int = 1
    estimated_value: Optional[float] = 0.0
    donor_name: str
    donor_contact: Optional[str] = ""
    condition: Optional[str] = "New"
    notes: Optional[str] = ""


# 4. Loan
class Loan(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    lender_name: str = Field(default="")
    amount_taken: float = Field(default=0.0)
    date_taken: date_type = Field(default_factory=date_type.today)
    received_in_account: str = Field(default="Cash", description="Cash, JazzCash, Easypaisa, Meezan Bank")
    purpose: str = Field(default="")
    status: str = Field(default="Active", description="Active or Fully Paid")
    notes: Optional[str] = Field(default="")
    created_at: datetime_type = Field(default_factory=datetime_type.now)

class LoanCreate(SQLModel):
    lender_name: str
    amount_taken: float
    date_taken: Optional[date_type] = None
    received_in_account: str = "Cash"
    purpose: str = ""
    notes: Optional[str] = ""


# 5. LoanPayment
class LoanPayment(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    loan_id: str = Field(index=True, foreign_key="loan.id")
    amount_paid: float = Field(default=0.0)
    date_paid: date_type = Field(default_factory=date_type.today)
    paid_from_account: str = Field(description="Cash, JazzCash, Easypaisa, Meezan Bank")
    notes: Optional[str] = Field(default="")
    created_at: datetime_type = Field(default_factory=datetime_type.now)

class LoanPaymentCreate(SQLModel):
    amount_paid: float
    date_paid: Optional[date_type] = None
    paid_from_account: str
    notes: Optional[str] = ""


# 6. Liability (واجبات / ادائیگیاں / بلز)
class Liability(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    title: str = Field(index=True, description="Title/Name of liability e.g. K-Electric Bill Jan 2026, Ration Supplier")
    category: str = Field(default="Utility Bill", description="Utility Bill, Vendor / Supplier, Maintenance, Salary, Other")
    amount_total: float = Field(default=0.0, description="Total amount due/payable")
    date_incurred: date_type = Field(default_factory=date_type.today, description="Bill/Invoice issue date")
    due_date: Optional[date_type] = Field(default=None, description="Due date for payment")
    status: str = Field(default="Pending", description="Pending, Partially Paid, Fully Paid")
    notes: Optional[str] = Field(default="", description="Invoice number, vendor contact, remarks")
    created_at: datetime_type = Field(default_factory=datetime_type.now)

class LiabilityCreate(SQLModel):
    title: str
    category: str = "Utility Bill"
    amount_total: float
    date_incurred: Optional[date_type] = None
    due_date: Optional[date_type] = None
    notes: Optional[str] = ""

class LiabilityUpdate(SQLModel):
    title: Optional[str] = None
    category: Optional[str] = None
    amount_total: Optional[float] = None
    date_incurred: Optional[date_type] = None
    due_date: Optional[date_type] = None
    notes: Optional[str] = None

# 7. LiabilityPayment (واجبات کی جزوی / مکمل ادائیگی)
class LiabilityPayment(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    liability_id: str = Field(index=True, foreign_key="liability.id")
    amount_paid: float = Field(default=0.0)
    date_paid: date_type = Field(default_factory=date_type.today)
    paid_from_account: str = Field(description="Cash, JazzCash, Easypaisa, Meezan Bank")
    notes: Optional[str] = Field(default="")
    created_at: datetime_type = Field(default_factory=datetime_type.now)

class LiabilityPaymentCreate(SQLModel):
    amount_paid: float
    date_paid: Optional[date_type] = None
    paid_from_account: str
    notes: Optional[str] = ""


# ----------------- DONOR & DONOR COMMENTS -----------------
class Donor(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    name: str = Field(index=True)
    contact: Optional[str] = Field(default="", index=True)
    email: Optional[str] = Field(default="")
    address: Optional[str] = Field(sa_column=Column(Text, default=""))
    city: Optional[str] = Field(default="")
    country: Optional[str] = Field(default="Pakistan")
    category: Optional[str] = Field(default="Individual", description="Individual, Corporate, Foundation, Regular")
    notes: Optional[str] = Field(default="")
    created_at: datetime_type = Field(default_factory=datetime_type.now)

class DonorCreate(SQLModel):
    name: str
    contact: Optional[str] = ""
    email: Optional[str] = ""
    address: Optional[str] = ""
    city: Optional[str] = ""
    country: Optional[str] = "Pakistan"
    category: Optional[str] = "Individual"
    notes: Optional[str] = ""

class DonorUpdate(SQLModel):
    name: Optional[str] = None
    contact: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None

class DonorComment(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    donor_id: str = Field(index=True)
    donor_name: Optional[str] = Field(default="")
    author_name: str = Field(description="Name of the person/admin/trustee who added the comment")
    content: str = Field(description="Comment or follow-up remark")
    created_at: datetime_type = Field(default_factory=datetime_type.now)

class DonorCommentCreate(SQLModel):
    author_name: str
    content: str

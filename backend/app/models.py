import uuid
from datetime import date as date_type, datetime as datetime_type
from typing import Optional, List
from enum import Enum
from sqlmodel import SQLModel, Field, Column, String, Text, Float

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


# ----------------- STUDENT SQLMODEL -----------------
class Student(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    roll_no: str = Field(index=True, unique=True)
    name: str = Field(index=True)
    picture: str = Field(default="")
    email: str = Field(default="")
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
    father_guardian_name: str = Field(default="")

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


class StudentCreate(SQLModel):
    name: str
    picture: Optional[str] = ""
    email: str
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
    father_guardian_name: str

    assigned_teacher_id: Optional[str] = None
    assigned_teacher_name: Optional[str] = ""

    is_zakat_eligible: bool = False
    zakat_syed_status: Optional[str] = "Non-Syed"

    is_academy_student: bool = False
    academy_class: Optional[str] = ""

    hostel_room_no: Optional[str] = ""
    hostel_bed_no: Optional[str] = ""


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
    father_guardian_name: Optional[str] = None
    assigned_teacher_id: Optional[str] = None
    assigned_teacher_name: Optional[str] = None

    is_zakat_eligible: Optional[bool] = None
    zakat_syed_status: Optional[str] = None

    is_academy_student: Optional[bool] = None
    academy_class: Optional[str] = None

    hostel_room_no: Optional[str] = None
    hostel_bed_no: Optional[str] = None


# ----------------- TEACHER SQLMODEL -----------------
class Teacher(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    roll_no: str = Field(index=True, unique=True)
    name: str = Field(index=True)
    picture: str = Field(default="")
    email: str = Field(default="")
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


class TeacherCreate(SQLModel):
    name: str
    picture: Optional[str] = ""
    email: str
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

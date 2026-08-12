import uuid
from datetime import date
from typing import Optional, List
from enum import Enum
from sqlmodel import SQLModel, Field, Column, String, Text

class GenderEnum(str, Enum):
    MALE = "Male"
    FEMALE = "Female"

# ----------------- STUDENT SQLMODEL -----------------
class Student(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    roll_no: str = Field(index=True, unique=True)
    name: str = Field(index=True)
    picture: str = Field(default="")
    email: str = Field(default="")
    nic: str = Field(default="")
    dob: date
    gender: str = Field(default="Male")
    contact: str = Field(default="")
    current_address: str = Field(sa_column=Column(Text, default=""))
    permanent_address: str = Field(sa_column=Column(Text, default=""))
    city: str = Field(default="")
    country: str = Field(default="Pakistan")
    institution: str = Field(default="Jamia Usmania")
    previous_institute: Optional[str] = Field(default="")
    admission_date: date = Field(default_factory=date.today)
    islamic_date: str = Field(default="")

    # Student specific
    student_class: str = Field(default="Grade 1", description="Class or Grade e.g. Hifz, Tajweed, Alim")
    subject: Optional[str] = Field(default="")
    boarding: bool = Field(default=False)
    father_guardian_name: str = Field(default="")

    # Assigned Teacher link
    assigned_teacher_id: Optional[str] = Field(default=None)
    assigned_teacher_name: Optional[str] = Field(default="")

    # New Checkbox Flags
    is_zakat_eligible: bool = Field(default=False, description="Is student eligible for Zakat / Mustahiq Zakat")
    is_academy_student: bool = Field(default=False, description="Is student also enrolled in Usmania Academy School")


class StudentCreate(SQLModel):
    name: str
    picture: Optional[str] = ""
    email: str
    nic: str
    dob: date
    gender: str = "Male"
    contact: str
    current_address: str
    permanent_address: str
    city: str
    country: str = "Pakistan"
    institution: str = "Jamia Usmania"
    previous_institute: Optional[str] = ""
    admission_date: Optional[date] = None
    
    student_class: str
    subject: Optional[str] = ""
    boarding: bool = False
    father_guardian_name: str

    assigned_teacher_id: Optional[str] = None
    assigned_teacher_name: Optional[str] = ""

    is_zakat_eligible: bool = False
    is_academy_student: bool = False


class StudentUpdate(SQLModel):
    name: Optional[str] = None
    picture: Optional[str] = None
    email: Optional[str] = None
    nic: Optional[str] = None
    dob: Optional[date] = None
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
    is_academy_student: Optional[bool] = None


# ----------------- TEACHER SQLMODEL -----------------
class Teacher(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    roll_no: str = Field(index=True, unique=True)
    name: str = Field(index=True)
    picture: str = Field(default="")
    email: str = Field(default="")
    nic: str = Field(default="")
    dob: date
    gender: str = Field(default="Male")
    contact: str = Field(default="")
    current_address: str = Field(sa_column=Column(Text, default=""))
    permanent_address: str = Field(sa_column=Column(Text, default=""))
    city: str = Field(default="")
    country: str = Field(default="Pakistan")
    institution: str = Field(default="Jamia Usmania")
    previous_institute: Optional[str] = Field(default="")
    admission_date: date = Field(default_factory=date.today)
    islamic_date: str = Field(default="")

    # Teacher specific
    subject: str = Field(default="", description="Subject(s) taught")
    father_guardian_name: Optional[str] = Field(default="")


class TeacherCreate(SQLModel):
    name: str
    picture: Optional[str] = ""
    email: str
    nic: str
    dob: date
    gender: str = "Male"
    contact: str
    current_address: str
    permanent_address: str
    city: str
    country: str = "Pakistan"
    institution: str = "Jamia Usmania"
    previous_institute: Optional[str] = ""
    admission_date: Optional[date] = None
    
    subject: str
    father_guardian_name: Optional[str] = ""


class TeacherUpdate(SQLModel):
    name: Optional[str] = None
    picture: Optional[str] = None
    email: Optional[str] = None
    nic: Optional[str] = None
    dob: Optional[date] = None
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

from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlmodel import Session, select, or_
from sqlalchemy.orm import defer

from app.db import get_session
from app.models import Student, StudentCreate, StudentUpdate, Teacher, BulkExportRequest, User
from app.services.hijri_util import convert_gregorian_to_hijri
from app.services.pdf_generator import generate_record_pdf
from app.services.id_card_generator import generate_id_card_pdf
from app.services.excel_generator import generate_records_excel
from app.dependencies import require_permission

router = APIRouter(prefix="/api/students", tags=["Students"])

def generate_next_roll_no(session: Session) -> str:
    # Query only roll_no column to prevent loading heavy rows/images into memory
    statement = select(Student.roll_no)
    roll_numbers = set(session.exec(statement).all())
    max_num = 0
    for r in roll_numbers:
        if r and r.startswith("JUT-STU-"):
            try:
                num = int(r.replace("JUT-STU-", "").split("-")[0])
                if num > max_num:
                    max_num = num
            except (ValueError, IndexError):
                pass
    next_num = max_num + 1
    # Check to guarantee no unique constraint collisions
    while f"JUT-STU-{next_num:04d}" in roll_numbers:
        next_num += 1
    return f"JUT-STU-{next_num:04d}"

@router.post("", response_model=Student, status_code=201)
def create_student(
    payload: StudentCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("students", "create"))
):
    admission_dt = payload.admission_date or date.today()
    islamic_dt = convert_gregorian_to_hijri(admission_dt)
    roll_no = generate_next_roll_no(session)

    # Fetch assigned teacher name if ID provided
    teacher_name = payload.assigned_teacher_name or ""
    if payload.assigned_teacher_id:
        teacher = session.get(Teacher, payload.assigned_teacher_id)
        if teacher:
            teacher_name = f"{teacher.name} ({teacher.roll_no})"

    db_student = Student.model_validate(
        payload,
        update={
            "roll_no": roll_no,
            "admission_date": admission_dt,
            "islamic_date": islamic_dt,
            "assigned_teacher_name": teacher_name
        }
    )
    session.add(db_student)
    session.commit()
    session.refresh(db_student)
    return db_student

@router.get("", response_model=List[Student])
def list_students(
    skip: int = 0,
    limit: int = 200,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("students", "view"))
):
    # Defer heavy documents to reduce network transfer by 80-90%
    statement = (
        select(Student)
        .options(
            defer(Student.doc_zakat),
            defer(Student.doc_birth_certificate),
            defer(Student.doc_activity_diary)
        )
        .offset(skip)
        .limit(limit)
        .order_by(Student.admission_date.desc())
    )
    return session.exec(statement).all()

@router.get("/search", response_model=List[Student])
def search_students(
    q: str = Query("", min_length=0),
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("students", "view"))
):
    base_options = (
        defer(Student.doc_zakat),
        defer(Student.doc_birth_certificate),
        defer(Student.doc_activity_diary)
    )
    if not q or not q.strip():
        return session.exec(select(Student).options(*base_options).order_by(Student.admission_date.desc())).all()
    
    term = f"%{q.strip()}%"
    statement = select(Student).options(*base_options).where(
        or_(
            Student.name.ilike(term),
            Student.roll_no.ilike(term),
            Student.student_class.ilike(term),
            Student.nic.ilike(term),
            Student.father_guardian_name.ilike(term),
            Student.assigned_teacher_name.ilike(term)
        )
    )
    return session.exec(statement).all()

@router.get("/{student_id}", response_model=Student)
def get_student(
    student_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("students", "view"))
):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.put("/{student_id}", response_model=Student)
def update_student(
    student_id: str,
    payload: StudentUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("students", "edit"))
):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    student_data = payload.model_dump(exclude_unset=True)

    # Recalculate Hijri date if admission date was updated
    if "admission_date" in student_data and student_data["admission_date"]:
        student.admission_date = student_data["admission_date"]
        student.islamic_date = convert_gregorian_to_hijri(student_data["admission_date"])

    # Recalculate teacher name if assigned teacher changed
    if "assigned_teacher_id" in student_data:
        t_id = student_data["assigned_teacher_id"]
        if t_id:
            teacher = session.get(Teacher, t_id)
            if teacher:
                student.assigned_teacher_name = f"{teacher.name} ({teacher.roll_no})"
            else:
                student.assigned_teacher_name = ""
        else:
            student.assigned_teacher_name = ""

    for key, value in student_data.items():
        if key not in ["admission_date", "islamic_date", "assigned_teacher_name"]:
            setattr(student, key, value)

    session.add(student)
    session.commit()
    session.refresh(student)
    return student

@router.delete("/{student_id}")
def delete_student(
    student_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("students", "delete"))
):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")

    session.delete(student)
    session.commit()
    return {"message": "Student record deleted successfully", "id": student_id}

@router.get("/{student_id}/pdf")
def get_student_pdf(
    student_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("students", "view"))
):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    pdf_bytes = generate_record_pdf(student.model_dump(), record_type="Student")
    filename = f"Student_Record_{student.roll_no}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{student_id}/id-card")
def get_student_id_card(
    student_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("students", "view"))
):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    pdf_bytes = generate_id_card_pdf(student.model_dump(), record_type="Student")
    filename = f"Student_ID_Card_{student.roll_no}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/export")
def export_students_excel(
    body: BulkExportRequest,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("students", "view"))
):
    if not body.ids:
        raise HTTPException(status_code=400, detail="No student IDs provided for export")

    statement = select(Student).where(Student.id.in_(body.ids))
    students = session.exec(statement).all()
    student_dicts = [s.model_dump() for s in students]

    excel_bytes = generate_records_excel(student_dicts, record_type="Student")
    filename = f"Jamia_Usmania_Students_Export.xlsx"

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlmodel import Session, select, or_

from app.db import get_session
from app.models import Teacher, TeacherCreate, TeacherUpdate, BulkExportRequest
from app.services.hijri_util import convert_gregorian_to_hijri
from app.services.pdf_generator import generate_record_pdf
from app.services.id_card_generator import generate_id_card_pdf
from app.services.excel_generator import generate_records_excel

router = APIRouter(prefix="/api/teachers", tags=["Teachers"])

def generate_next_teacher_roll_no(session: Session) -> str:
    statement = select(Teacher)
    teachers = session.exec(statement).all()
    count = len(teachers) + 1
    return f"JUT-TCH-{count:04d}"

@router.post("", response_model=Teacher, status_code=201)
def create_teacher(payload: TeacherCreate, session: Session = Depends(get_session)):
    admission_dt = payload.admission_date or date.today()
    islamic_dt = convert_gregorian_to_hijri(admission_dt)
    roll_no = generate_next_teacher_roll_no(session)

    db_teacher = Teacher.model_validate(
        payload,
        update={
            "roll_no": roll_no,
            "admission_date": admission_dt,
            "islamic_date": islamic_dt
        }
    )
    session.add(db_teacher)
    session.commit()
    session.refresh(db_teacher)
    return db_teacher

@router.get("", response_model=List[Teacher])
def list_teachers(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    statement = select(Teacher).offset(skip).limit(limit).order_by(Teacher.admission_date.desc())
    return session.exec(statement).all()

@router.get("/search", response_model=List[Teacher])
def search_teachers(
    q: str = Query("", min_length=0),
    session: Session = Depends(get_session)
):
    if not q or not q.strip():
        return session.exec(select(Teacher).order_by(Teacher.admission_date.desc())).all()
    
    term = f"%{q.strip()}%"
    statement = select(Teacher).where(
        or_(
            Teacher.name.ilike(term),
            Teacher.roll_no.ilike(term),
            Teacher.subject.ilike(term),
            Teacher.nic.ilike(term),
            Teacher.father_guardian_name.ilike(term)
        )
    )
    return session.exec(statement).all()

@router.get("/{teacher_id}", response_model=Teacher)
def get_teacher(teacher_id: str, session: Session = Depends(get_session)):
    teacher = session.get(Teacher, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return teacher

@router.put("/{teacher_id}", response_model=Teacher)
def update_teacher(teacher_id: str, payload: TeacherUpdate, session: Session = Depends(get_session)):
    teacher = session.get(Teacher, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher record not found")

    teacher_data = payload.model_dump(exclude_unset=True)

    if "admission_date" in teacher_data and teacher_data["admission_date"]:
        teacher.admission_date = teacher_data["admission_date"]
        teacher.islamic_date = convert_gregorian_to_hijri(teacher_data["admission_date"])

    for key, value in teacher_data.items():
        if key not in ["admission_date", "islamic_date"]:
            setattr(teacher, key, value)

    session.add(teacher)
    session.commit()
    session.refresh(teacher)
    return teacher

@router.delete("/{teacher_id}")
def delete_teacher(teacher_id: str, session: Session = Depends(get_session)):
    teacher = session.get(Teacher, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher record not found")

    session.delete(teacher)
    session.commit()
    return {"message": "Teacher record deleted successfully", "id": teacher_id}

@router.get("/{teacher_id}/pdf")
def get_teacher_pdf(teacher_id: str, session: Session = Depends(get_session)):
    teacher = session.get(Teacher, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    pdf_bytes = generate_record_pdf(teacher.model_dump(), record_type="Teacher")
    filename = f"Teacher_Record_{teacher.roll_no}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{teacher_id}/id-card")
def get_teacher_id_card(teacher_id: str, session: Session = Depends(get_session)):
    teacher = session.get(Teacher, teacher_id)
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")

    pdf_bytes = generate_id_card_pdf(teacher.model_dump(), record_type="Teacher")
    filename = f"Teacher_ID_Card_{teacher.roll_no}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/export")
def export_teachers_excel(body: BulkExportRequest, session: Session = Depends(get_session)):
    if not body.ids:
        raise HTTPException(status_code=400, detail="No teacher IDs provided for export")

    statement = select(Teacher).where(Teacher.id.in_(body.ids))
    teachers = session.exec(statement).all()
    teacher_dicts = [t.model_dump() for t in teachers]

    excel_bytes = generate_records_excel(teacher_dicts, record_type="Teacher")
    filename = f"Jamia_Usmania_Teachers_Export.xlsx"

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

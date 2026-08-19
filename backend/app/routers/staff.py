from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlmodel import Session, select, or_

from app.db import get_session
from app.models import Staff, StaffCreate, StaffUpdate, BulkExportRequest, User
from app.services.hijri_util import convert_gregorian_to_hijri
from app.services.pdf_generator import generate_record_pdf
from app.services.id_card_generator import generate_id_card_pdf
from app.services.excel_generator import generate_records_excel
from app.dependencies import require_permission

router = APIRouter(prefix="/api/staff", tags=["Staff Management"])

def generate_next_staff_roll_no(session: Session) -> str:
    statement = select(Staff)
    staff_members = session.exec(statement).all()
    count = len(staff_members) + 1
    return f"JUT-STF-{count:04d}"

@router.post("", response_model=Staff, status_code=201)
def create_staff(
    payload: StaffCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("staff", "create"))
):
    admission_dt = payload.admission_date or date.today()
    islamic_dt = convert_gregorian_to_hijri(admission_dt)
    roll_no = generate_next_staff_roll_no(session)

    db_staff = Staff.model_validate(
        payload,
        update={
            "roll_no": roll_no,
            "admission_date": admission_dt,
            "islamic_date": islamic_dt
        }
    )
    session.add(db_staff)
    session.commit()
    session.refresh(db_staff)
    return db_staff

@router.get("", response_model=List[Staff])
def list_staff(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("staff", "view"))
):
    statement = select(Staff).offset(skip).limit(limit).order_by(Staff.admission_date.desc())
    return session.exec(statement).all()

@router.get("/search", response_model=List[Staff])
def search_staff(
    q: str = Query("", min_length=0),
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("staff", "view"))
):
    if not q or not q.strip():
        return session.exec(select(Staff).order_by(Staff.admission_date.desc())).all()
    
    term = f"%{q.strip()}%"
    statement = select(Staff).where(
        or_(
            Staff.name.ilike(term),
            Staff.roll_no.ilike(term),
            Staff.designation.ilike(term),
            Staff.nic.ilike(term),
            Staff.contact.ilike(term),
            Staff.father_guardian_name.ilike(term)
        )
    )
    return session.exec(statement).all()

@router.get("/{staff_id}", response_model=Staff)
def get_staff_member(
    staff_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("staff", "view"))
):
    staff = session.get(Staff, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return staff

@router.put("/{staff_id}", response_model=Staff)
def update_staff_member(
    staff_id: str,
    payload: StaffUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("staff", "edit"))
):
    staff = session.get(Staff, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member record not found")

    staff_data = payload.model_dump(exclude_unset=True)

    if "admission_date" in staff_data and staff_data["admission_date"]:
        staff.admission_date = staff_data["admission_date"]
        staff.islamic_date = convert_gregorian_to_hijri(staff_data["admission_date"])

    for key, value in staff_data.items():
        if key not in ["admission_date", "islamic_date"]:
            setattr(staff, key, value)

    session.add(staff)
    session.commit()
    session.refresh(staff)
    return staff

@router.delete("/{staff_id}")
def delete_staff_member(
    staff_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("staff", "delete"))
):
    staff = session.get(Staff, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member record not found")

    session.delete(staff)
    session.commit()
    return {"message": "Staff record deleted successfully", "id": staff_id}

@router.get("/{staff_id}/pdf")
def get_staff_pdf(
    staff_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("staff", "view"))
):
    staff = session.get(Staff, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")

    pdf_bytes = generate_record_pdf(staff.model_dump(), record_type="Staff")
    filename = f"Staff_Record_{staff.roll_no}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/{staff_id}/id-card")
def get_staff_id_card(
    staff_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("staff", "view"))
):
    staff = session.get(Staff, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff member not found")

    pdf_bytes = generate_id_card_pdf(staff.model_dump(), record_type="Staff")
    filename = f"Staff_ID_Card_{staff.roll_no}.pdf"
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.post("/export")
def export_staff_excel(
    body: BulkExportRequest,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("staff", "view"))
):
    if not body.ids:
        raise HTTPException(status_code=400, detail="No staff IDs provided for export")

    statement = select(Staff).where(Staff.id.in_(body.ids))
    staff_members = session.exec(statement).all()
    staff_dicts = [s.model_dump() for s in staff_members]

    excel_bytes = generate_records_excel(staff_dicts, record_type="Staff")
    filename = f"Jamia_Usmania_Staff_Export.xlsx"

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

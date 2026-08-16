from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func
from typing import List, Optional
from datetime import datetime, date
import uuid

from app.db import get_session
from app.models import (
    Donor, DonorCreate, DonorUpdate,
    DonorComment, DonorCommentCreate,
    ReceivedEntry, KindDonation, User
)
from app.dependencies import require_permission

router = APIRouter(prefix="/api/donors", tags=["donors"])

@router.get("")
def list_donors(
    q: Optional[str] = Query(None, description="Search donor name or contact"),
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_received", "view"))
):
    # 1. Fetch all explicit Donors in DB
    donors = session.exec(select(Donor)).all()
    donor_map = {d.name.strip().lower(): d for d in donors}

    # 2. Also fetch all distinct donors from ReceivedEntry (where entry_type == 'Donation')
    received_donations = session.exec(
        select(ReceivedEntry).where(ReceivedEntry.entry_type == "Donation")
    ).all()

    for rec in received_donations:
        p_name = rec.payer_name.strip()
        if p_name and p_name.lower() not in donor_map:
            # Auto-register this donor in table so they have an ID and can receive comments
            new_donor = Donor(
                id=str(uuid.uuid4()),
                name=p_name,
                contact=rec.payer_contact or "",
                address=rec.payer_address or "",
                category="Individual",
                created_at=datetime.now()
            )
            session.add(new_donor)
            session.commit()
            session.refresh(new_donor)
            donor_map[p_name.lower()] = new_donor

    # 3. Also fetch all distinct donors from KindDonation
    kind_donations = session.exec(select(KindDonation)).all()
    for kd in kind_donations:
        d_name = kd.donor_name.strip()
        if d_name and d_name.lower() not in donor_map:
            new_donor = Donor(
                id=str(uuid.uuid4()),
                name=d_name,
                contact=kd.donor_contact or "",
                category="Individual",
                created_at=datetime.now()
            )
            session.add(new_donor)
            session.commit()
            session.refresh(new_donor)
            donor_map[d_name.lower()] = new_donor

    # Re-fetch all registered donors
    all_donors = session.exec(select(Donor).order_by(Donor.created_at.desc())).all()

    # Pre-fetch all comments to map counts
    all_comments = session.exec(select(DonorComment)).all()
    comment_count_map = {}
    for c in all_comments:
        comment_count_map[c.donor_id] = comment_count_map.get(c.donor_id, 0) + 1

    results = []
    for d in all_donors:
        d_name_clean = d.name.strip().lower()
        d_contact_clean = (d.contact or "").strip()

        matched_cash = [
            r for r in received_donations
            if r.payer_name.strip().lower() == d_name_clean or (d_contact_clean and r.payer_contact and r.payer_contact.strip() == d_contact_clean)
        ]
        total_cash = sum(r.amount for r in matched_cash)

        matched_kind = [
            k for k in kind_donations
            if k.donor_name.strip().lower() == d_name_clean or (d_contact_clean and k.donor_contact and k.donor_contact.strip() == d_contact_clean)
        ]
        total_kind_count = len(matched_kind)
        total_kind_val = sum(k.estimated_value or 0 for k in matched_kind)

        dates = [r.date for r in matched_cash] + [k.date for k in matched_kind]
        latest_date = max(dates).strftime("%Y-%m-%d") if dates else None

        if q:
            q_clean = q.strip().lower()
            if q_clean not in d_name_clean and q_clean not in d_contact_clean.lower() and q_clean not in (d.email or '').lower():
                continue

        results.append({
            "id": d.id,
            "name": d.name,
            "contact": d.contact or "",
            "email": d.email or "",
            "address": d.address or "",
            "city": d.city or "",
            "country": d.country or "Pakistan",
            "category": d.category or "Individual",
            "notes": d.notes or "",
            "created_at": d.created_at.strftime("%Y-%m-%d %H:%M"),
            "total_cash_donated": total_cash,
            "donations_count": len(matched_cash),
            "total_kind_donations": total_kind_count,
            "total_kind_value": total_kind_val,
            "latest_donation_date": latest_date,
            "comments_count": comment_count_map.get(d.id, 0)
        })

    return results


@router.get("/{donor_id}")
def get_donor_detail(
    donor_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_received", "view"))
):
    donor = session.get(Donor, donor_id)
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    d_name_clean = donor.name.strip().lower()
    d_contact_clean = (donor.contact or "").strip()

    received_donations = session.exec(
        select(ReceivedEntry).where(ReceivedEntry.entry_type == "Donation")
    ).all()
    matched_cash = [
        r for r in received_donations
        if r.payer_name.strip().lower() == d_name_clean or (d_contact_clean and r.payer_contact and r.payer_contact.strip() == d_contact_clean)
    ]
    matched_cash.sort(key=lambda x: x.date, reverse=True)

    kind_donations = session.exec(select(KindDonation)).all()
    matched_kind = [
        k for k in kind_donations
        if k.donor_name.strip().lower() == d_name_clean or (d_contact_clean and k.donor_contact and k.donor_contact.strip() == d_contact_clean)
    ]
    matched_kind.sort(key=lambda x: x.date, reverse=True)

    comments = session.exec(
        select(DonorComment).where(DonorComment.donor_id == donor_id).order_by(DonorComment.created_at.desc())
    ).all()

    total_cash = sum(r.amount for r in matched_cash)
    total_kind_val = sum(k.estimated_value or 0 for k in matched_kind)

    return {
        "donor": donor,
        "total_cash_donated": total_cash,
        "total_kind_value": total_kind_val,
        "donations_count": len(matched_cash),
        "kind_count": len(matched_kind),
        "cash_donations": matched_cash,
        "kind_donations": matched_kind,
        "comments": comments
    }


@router.post("", response_model=Donor)
def create_donor(
    payload: DonorCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_received", "create"))
):
    donor = Donor.model_validate(payload)
    session.add(donor)
    session.commit()
    session.refresh(donor)
    return donor


@router.put("/{donor_id}", response_model=Donor)
def update_donor(
    donor_id: str,
    payload: DonorUpdate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_received", "edit"))
):
    donor = session.get(Donor, donor_id)
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    update_data = payload.model_dump(exclude_unset=True)
    for k, v in update_data.items():
        setattr(donor, k, v)

    session.add(donor)
    session.commit()
    session.refresh(donor)
    return donor


@router.delete("/{donor_id}")
def delete_donor(
    donor_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_received", "delete"))
):
    donor = session.get(Donor, donor_id)
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    comments = session.exec(select(DonorComment).where(DonorComment.donor_id == donor_id)).all()
    for c in comments:
        session.delete(c)

    session.delete(donor)
    session.commit()
    return {"message": "Donor deleted successfully"}


# ----------------- DONOR COMMENTS -----------------

@router.get("/{donor_id}/comments", response_model=List[DonorComment])
def get_donor_comments(
    donor_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_received", "view"))
):
    donor = session.get(Donor, donor_id)
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    comments = session.exec(
        select(DonorComment).where(DonorComment.donor_id == donor_id).order_by(DonorComment.created_at.desc())
    ).all()
    return comments


@router.post("/{donor_id}/comments", response_model=DonorComment)
def add_donor_comment(
    donor_id: str,
    payload: DonorCommentCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_received", "create"))
):
    donor = session.get(Donor, donor_id)
    if not donor:
        raise HTTPException(status_code=404, detail="Donor not found")

    if not payload.author_name.strip():
        raise HTTPException(status_code=400, detail="Author name is required (comment kis person nay add kiya)")

    if not payload.content.strip():
        raise HTTPException(status_code=400, detail="Comment content cannot be empty")

    comment = DonorComment(
        id=str(uuid.uuid4()),
        donor_id=donor_id,
        donor_name=donor.name,
        author_name=payload.author_name.strip(),
        content=payload.content.strip(),
        created_at=datetime.now()
    )
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return comment


@router.delete("/{donor_id}/comments/{comment_id}")
def delete_donor_comment(
    donor_id: str,
    comment_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_received", "delete"))
):
    comment = session.get(DonorComment, comment_id)
    if not comment or comment.donor_id != donor_id:
        raise HTTPException(status_code=404, detail="Comment not found")

    session.delete(comment)
    session.commit()
    return {"message": "Comment deleted successfully"}

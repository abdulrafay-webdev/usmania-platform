from datetime import date, datetime, timedelta
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlmodel import Session, select, func, or_

from app.db import get_session
from app.models import (
    ReceivedEntry, ReceivedEntryCreate,
    DebitEntry, DebitEntryCreate,
    KindDonation, KindDonationCreate,
    Loan, LoanCreate,
    LoanPayment, LoanPaymentCreate,
    User
)
from app.services.excel_generator import generate_finance_excel
from app.dependencies import require_permission

router = APIRouter(prefix="/api/finance", tags=["Finance"])

ACCOUNTS = ["Cash", "JazzCash", "Easypaisa", "Meezan Bank"]

def calculate_account_balances(session: Session) -> Dict[str, Any]:
    balances = {acct: 0.0 for acct in ACCOUNTS}
    
    # Sum Received
    rec_statement = select(ReceivedEntry.account, func.sum(ReceivedEntry.amount)).group_by(ReceivedEntry.account)
    for acct, total in session.exec(rec_statement).all():
        if acct in balances:
            balances[acct] += (total or 0.0)

    # Subtract Debit
    deb_statement = select(DebitEntry.account, func.sum(DebitEntry.amount)).group_by(DebitEntry.account)
    for acct, total in session.exec(deb_statement).all():
        if acct in balances:
            balances[acct] -= (total or 0.0)

    grand_total = sum(balances.values())
    return {
        "accounts": balances,
        "grand_total": round(grand_total, 2)
    }


# ----------------- 1. RECEIVED ENDPOINTS -----------------
@router.post("/received", response_model=ReceivedEntry, status_code=201)
def create_received_entry(
    payload: ReceivedEntryCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_received", "create"))
):
    rec_date = payload.date or date.today()
    account = "Cash" if payload.mode == "Cash" else payload.account

    entry = ReceivedEntry(
        date=rec_date,
        entry_type=payload.entry_type,
        mode=payload.mode,
        account=account,
        amount=payload.amount,
        payer_name=payload.payer_name,
        payer_contact=payload.payer_contact or "",
        payer_address=payload.payer_address or "",
        purpose_note=payload.purpose_note or ""
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry

@router.get("/received", response_model=List[ReceivedEntry])
def list_received_entries(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    entry_type: Optional[str] = None,
    account: Optional[str] = None,
    q: Optional[str] = None,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_received", "view"))
):
    statement = select(ReceivedEntry).order_by(ReceivedEntry.date.desc(), ReceivedEntry.created_at.desc())

    if date_from:
        statement = statement.where(ReceivedEntry.date >= date_from)
    if date_to:
        statement = statement.where(ReceivedEntry.date <= date_to)
    if entry_type and entry_type.strip():
        statement = statement.where(ReceivedEntry.entry_type == entry_type.strip())
    if account and account.strip():
        statement = statement.where(ReceivedEntry.account == account.strip())
    if q and q.strip():
        term = f"%{q.strip()}%"
        statement = statement.where(
            or_(
                ReceivedEntry.payer_name.ilike(term),
                ReceivedEntry.purpose_note.ilike(term),
                ReceivedEntry.payer_contact.ilike(term)
            )
        )

    return session.exec(statement).all()

@router.get("/received/{entry_id}", response_model=ReceivedEntry)
def get_received_entry(
    entry_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_received", "view"))
):
    entry = session.get(ReceivedEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Received entry not found")
    return entry

@router.delete("/received/{entry_id}")
def delete_received_entry(
    entry_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_received", "delete"))
):
    entry = session.get(ReceivedEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Received entry not found")
    session.delete(entry)
    session.commit()
    return {"message": "Received entry deleted successfully", "id": entry_id}


# ----------------- 2. DEBIT ENDPOINTS -----------------
@router.post("/debit", response_model=DebitEntry, status_code=201)
def create_debit_entry(
    payload: DebitEntryCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_debit", "create"))
):
    deb_date = payload.date or date.today()

    entry = DebitEntry(
        date=deb_date,
        account=payload.account,
        amount=payload.amount,
        paid_to=payload.paid_to,
        purpose=payload.purpose
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry

@router.get("/debit", response_model=List[DebitEntry])
def list_debit_entries(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    account: Optional[str] = None,
    q: Optional[str] = None,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_debit", "view"))
):
    statement = select(DebitEntry).order_by(DebitEntry.date.desc(), DebitEntry.created_at.desc())

    if date_from:
        statement = statement.where(DebitEntry.date >= date_from)
    if date_to:
        statement = statement.where(DebitEntry.date <= date_to)
    if account and account.strip():
        statement = statement.where(DebitEntry.account == account.strip())
    if q and q.strip():
        term = f"%{q.strip()}%"
        statement = statement.where(
            or_(
                DebitEntry.paid_to.ilike(term),
                DebitEntry.purpose.ilike(term)
            )
        )

    return session.exec(statement).all()

@router.get("/debit/{entry_id}", response_model=DebitEntry)
def get_debit_entry(
    entry_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_debit", "view"))
):
    entry = session.get(DebitEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Debit entry not found")
    return entry

@router.delete("/debit/{entry_id}")
def delete_debit_entry(
    entry_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_debit", "delete"))
):
    entry = session.get(DebitEntry, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Debit entry not found")
    session.delete(entry)
    session.commit()
    return {"message": "Debit entry deleted successfully", "id": entry_id}


# ----------------- 3. KIND DONATION ENDPOINTS -----------------
@router.post("/kind-donation", response_model=KindDonation, status_code=201)
def create_kind_donation(
    payload: KindDonationCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_kind_donation", "create"))
):
    don_date = payload.date or date.today()

    donation = KindDonation(
        date=don_date,
        item_name=payload.item_name,
        category=payload.category or "Other",
        quantity=payload.quantity or 1,
        estimated_value=payload.estimated_value or 0.0,
        donor_name=payload.donor_name,
        donor_contact=payload.donor_contact or "",
        condition=payload.condition or "New",
        notes=payload.notes or ""
    )
    session.add(donation)
    session.commit()
    session.refresh(donation)
    return donation

@router.get("/kind-donation", response_model=List[KindDonation])
def list_kind_donations(
    category: Optional[str] = None,
    q: Optional[str] = None,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_kind_donation", "view"))
):
    statement = select(KindDonation).order_by(KindDonation.date.desc(), KindDonation.created_at.desc())

    if category and category.strip():
        statement = statement.where(KindDonation.category == category.strip())
    if q and q.strip():
        term = f"%{q.strip()}%"
        statement = statement.where(
            or_(
                KindDonation.item_name.ilike(term),
                KindDonation.donor_name.ilike(term),
                KindDonation.notes.ilike(term)
            )
        )

    return session.exec(statement).all()

@router.get("/kind-donation/{donation_id}", response_model=KindDonation)
def get_kind_donation(
    donation_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_kind_donation", "view"))
):
    donation = session.get(KindDonation, donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Kind donation not found")
    return donation

@router.delete("/kind-donation/{donation_id}")
def delete_kind_donation(
    donation_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_kind_donation", "delete"))
):
    donation = session.get(KindDonation, donation_id)
    if not donation:
        raise HTTPException(status_code=404, detail="Kind donation not found")
    session.delete(donation)
    session.commit()
    return {"message": "Kind donation deleted successfully", "id": donation_id}


# ----------------- 4. LOAN ENDPOINTS -----------------
@router.post("/loans", response_model=Loan, status_code=201)
def create_loan(
    payload: LoanCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_loan", "create"))
):
    l_date = payload.date_taken or date.today()
    recv_acct = payload.received_in_account or "Cash"

    loan = Loan(
        lender_name=payload.lender_name,
        amount_taken=payload.amount_taken,
        date_taken=l_date,
        received_in_account=recv_acct,
        purpose=payload.purpose or "",
        status="Active",
        notes=payload.notes or ""
    )
    session.add(loan)

    # Auto-create corresponding ReceivedEntry so account balance and grand total increase
    received = ReceivedEntry(
        date=l_date,
        entry_type="Income",
        mode="Cash" if recv_acct == "Cash" else "Online",
        account=recv_acct,
        amount=payload.amount_taken,
        payer_name=f"Loan from {payload.lender_name}",
        purpose_note=f"Loan taken for {payload.purpose}" if payload.purpose else f"Loan taken from {payload.lender_name}"
    )
    session.add(received)
    session.commit()
    session.refresh(loan)
    return loan

@router.get("/loans")
def list_loans(
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_loan", "view"))
):
    loans = session.exec(select(Loan).order_by(Loan.date_taken.desc())).all()
    result = []

    for l in loans:
        pmt_stmt = select(func.sum(LoanPayment.amount_paid)).where(LoanPayment.loan_id == l.id)
        total_paid = session.exec(pmt_stmt).first() or 0.0
        remaining = max(0.0, l.amount_taken - total_paid)

        if remaining <= 0 and l.status != "Fully Paid":
            l.status = "Fully Paid"
            session.add(l)
            session.commit()
            session.refresh(l)

        l_dict = l.model_dump()
        l_dict["total_paid"] = round(total_paid, 2)
        l_dict["remaining_balance"] = round(remaining, 2)
        result.append(l_dict)

    return result

@router.get("/loans/{loan_id}")
def get_loan_detail(
    loan_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_loan", "view"))
):
    loan = session.get(Loan, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found")

    pmt_stmt = select(func.sum(LoanPayment.amount_paid)).where(LoanPayment.loan_id == loan.id)
    total_paid = session.exec(pmt_stmt).first() or 0.0
    remaining = max(0.0, loan.amount_taken - total_paid)

    payments = session.exec(
        select(LoanPayment).where(LoanPayment.loan_id == loan.id).order_by(LoanPayment.date_paid.desc())
    ).all()

    l_dict = loan.model_dump()
    l_dict["total_paid"] = round(total_paid, 2)
    l_dict["remaining_balance"] = round(remaining, 2)
    l_dict["payments"] = payments
    return l_dict

@router.post("/loans/{loan_id}/payments", response_model=LoanPayment, status_code=201)
def add_loan_payment(
    loan_id: str,
    payload: LoanPaymentCreate,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_loan", "create"))
):
    loan = session.get(Loan, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found")

    pay_date = payload.date_paid or date.today()

    payment = LoanPayment(
        loan_id=loan.id,
        amount_paid=payload.amount_paid,
        date_paid=pay_date,
        paid_from_account=payload.paid_from_account,
        notes=payload.notes or ""
    )
    session.add(payment)

    # Auto-create corresponding DebitEntry so account balance reduces
    debit = DebitEntry(
        date=pay_date,
        account=payload.paid_from_account,
        amount=payload.amount_paid,
        paid_to=loan.lender_name,
        purpose=f"Loan repayment to {loan.lender_name}"
    )
    session.add(debit)
    session.commit()
    session.refresh(payment)

    pmt_stmt = select(func.sum(LoanPayment.amount_paid)).where(LoanPayment.loan_id == loan.id)
    total_paid = session.exec(pmt_stmt).first() or 0.0
    if total_paid >= loan.amount_taken:
        loan.status = "Fully Paid"
        session.add(loan)
        session.commit()

    return payment

@router.get("/loans/{loan_id}/payments", response_model=List[LoanPayment])
def get_loan_payments(
    loan_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_loan", "view"))
):
    return session.exec(
        select(LoanPayment).where(LoanPayment.loan_id == loan_id).order_by(LoanPayment.date_paid.desc())
    ).all()

@router.delete("/loans/{loan_id}")
def delete_loan(
    loan_id: str,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_loan", "delete"))
):
    loan = session.get(Loan, loan_id)
    if not loan:
        raise HTTPException(status_code=404, detail="Loan record not found")
    
    # Delete attached payments
    payments = session.exec(select(LoanPayment).where(LoanPayment.loan_id == loan_id)).all()
    for p in payments:
        session.delete(p)

    session.delete(loan)
    session.commit()
    return {"message": "Loan record deleted successfully", "id": loan_id}


# ----------------- 5. ACCOUNT BALANCES & DASHBOARD -----------------
@router.get("/accounts/balances")
def get_account_balances_endpoint(
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_dashboard", "view"))
):
    return calculate_account_balances(session)

@router.get("/dashboard/summary")
def get_dashboard_summary(
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_dashboard", "view"))
):
    balances_data = calculate_account_balances(session)
    today = date.today()
    
    today_rec_stmt = select(func.sum(ReceivedEntry.amount)).where(ReceivedEntry.date == today)
    today_rec = session.exec(today_rec_stmt).first() or 0.0

    today_deb_stmt = select(func.sum(DebitEntry.amount)).where(DebitEntry.date == today)
    today_deb = session.exec(today_deb_stmt).first() or 0.0

    today_net = today_rec - today_deb

    loans = session.exec(select(Loan)).all()
    active_loan_remaining = 0.0
    loan_overviews = []

    for l in loans:
        pmt_stmt = select(func.sum(LoanPayment.amount_paid)).where(LoanPayment.loan_id == l.id)
        total_paid = session.exec(pmt_stmt).first() or 0.0
        rem = max(0.0, l.amount_taken - total_paid)
        if rem > 0:
            active_loan_remaining += rem
        loan_overviews.append({
            "lender_name": l.lender_name,
            "amount_taken": l.amount_taken,
            "total_paid": round(total_paid, 2),
            "remaining": round(rem, 2),
            "status": l.status
        })

    thirty_days_ago = today - timedelta(days=29)
    date_map = {}
    curr = thirty_days_ago
    while curr <= today:
        date_str = curr.strftime("%b %d")
        date_map[curr] = {"date": date_str, "income": 0.0, "expense": 0.0}
        curr += timedelta(days=1)

    rec_list = session.exec(select(ReceivedEntry).where(ReceivedEntry.date >= thirty_days_ago)).all()
    for r in rec_list:
        if r.date in date_map:
            date_map[r.date]["income"] += r.amount

    deb_list = session.exec(select(DebitEntry).where(DebitEntry.date >= thirty_days_ago)).all()
    for d in deb_list:
        if d.date in date_map:
            date_map[d.date]["expense"] += d.amount

    chart_income_vs_expense = [
        {
            "date": v["date"],
            "Income": round(v["income"], 2),
            "Expense": round(v["expense"], 2)
        }
        for v in date_map.values()
    ]

    chart_account_pie = [
        {"name": acct, "value": max(0.0, amt)}
        for acct, amt in balances_data["accounts"].items()
    ]

    inc_stmt = select(func.sum(ReceivedEntry.amount)).where(ReceivedEntry.entry_type == "Income")
    total_income = session.exec(inc_stmt).first() or 0.0

    don_stmt = select(func.sum(ReceivedEntry.amount)).where(ReceivedEntry.entry_type == "Donation")
    total_donation = session.exec(don_stmt).first() or 0.0

    chart_received_split = [
        {"type": "Income", "amount": round(total_income, 2)},
        {"type": "Donation", "amount": round(total_donation, 2)}
    ]

    deb_by_purpose_stmt = select(DebitEntry.purpose, func.sum(DebitEntry.amount)).group_by(DebitEntry.purpose)
    deb_categories = session.exec(deb_by_purpose_stmt).all()
    chart_debit_categories = [
        {"category": purpose[:20] if purpose else "Uncategorized", "amount": round(total, 2)}
        for purpose, total in sorted(deb_categories, key=lambda x: x[1] or 0.0, reverse=True)[:6]
    ]

    kind_stmt = select(KindDonation.category, func.count(KindDonation.id), func.sum(KindDonation.estimated_value)).group_by(KindDonation.category)
    kind_cat_list = session.exec(kind_stmt).all()
    chart_kind_donations = [
        {"category": cat, "count": count, "value": round(val or 0.0, 2)}
        for cat, count, val in kind_cat_list
    ]

    recent_transactions = []
    
    recent_recs = session.exec(select(ReceivedEntry).order_by(ReceivedEntry.created_at.desc()).limit(10)).all()
    for r in recent_recs:
        recent_transactions.append({
            "id": r.id,
            "type": "Received",
            "title": f"Received from {r.payer_name}",
            "sub": f"{r.entry_type} via {r.account}",
            "amount": r.amount,
            "date": str(r.date),
            "created_at": r.created_at.isoformat(),
            "color": "green"
        })

    recent_debs = session.exec(select(DebitEntry).order_by(DebitEntry.created_at.desc()).limit(10)).all()
    for d in recent_debs:
        recent_transactions.append({
            "id": d.id,
            "type": "Debit",
            "title": f"Paid to {d.paid_to}",
            "sub": f"{d.purpose} from {d.account}",
            "amount": d.amount,
            "date": str(d.date),
            "created_at": d.created_at.isoformat(),
            "color": "red"
        })

    recent_kinds = session.exec(select(KindDonation).order_by(KindDonation.created_at.desc()).limit(5)).all()
    for k in recent_kinds:
        recent_transactions.append({
            "id": k.id,
            "type": "Kind",
            "title": f"In-Kind: {k.item_name} ({k.quantity}x)",
            "sub": f"Donor: {k.donor_name} ({k.category})",
            "amount": k.estimated_value or 0.0,
            "date": str(k.date),
            "created_at": k.created_at.isoformat(),
            "color": "blue"
        })

    recent_transactions.sort(key=lambda x: x["created_at"], reverse=True)
    recent_transactions = recent_transactions[:10]

    return {
        "grand_total_balance": balances_data["grand_total"],
        "account_balances": balances_data["accounts"],
        "today_received": round(today_rec, 2),
        "today_debit": round(today_deb, 2),
        "today_net": round(today_net, 2),
        "active_loan_remaining": round(active_loan_remaining, 2),
        "chart_income_vs_expense": chart_income_vs_expense,
        "chart_account_pie": chart_account_pie,
        "chart_received_split": chart_received_split,
        "chart_debit_categories": chart_debit_categories,
        "chart_kind_donations": chart_kind_donations,
        "loan_overviews": loan_overviews,
        "recent_transactions": recent_transactions
    }


# ----------------- 6. COMPREHENSIVE FINANCE EXCEL EXPORT -----------------
@router.get("/export/excel")
def export_finance_excel(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    session: Session = Depends(get_session),
    _: User = Depends(require_permission("finance_dashboard", "view"))
):
    rec_stmt = select(ReceivedEntry).order_by(ReceivedEntry.date.desc())
    if date_from:
        rec_stmt = rec_stmt.where(ReceivedEntry.date >= date_from)
    if date_to:
        rec_stmt = rec_stmt.where(ReceivedEntry.date <= date_to)
    received_entries = session.exec(rec_stmt).all()

    deb_stmt = select(DebitEntry).order_by(DebitEntry.date.desc())
    if date_from:
        deb_stmt = deb_stmt.where(DebitEntry.date >= date_from)
    if date_to:
        deb_stmt = deb_stmt.where(DebitEntry.date <= date_to)
    debit_entries = session.exec(deb_stmt).all()

    knd_stmt = select(KindDonation).order_by(KindDonation.date.desc())
    if date_from:
        knd_stmt = knd_stmt.where(KindDonation.date >= date_from)
    if date_to:
        knd_stmt = knd_stmt.where(KindDonation.date <= date_to)
    kind_donations = session.exec(knd_stmt).all()

    loans_all = session.exec(select(Loan).order_by(Loan.date_taken.desc())).all()
    loans_data = []
    for l in loans_all:
        pmt_stmt = select(func.sum(LoanPayment.amount_paid)).where(LoanPayment.loan_id == l.id)
        if date_from:
            pmt_stmt = pmt_stmt.where(LoanPayment.date_paid >= date_from)
        if date_to:
            pmt_stmt = pmt_stmt.where(LoanPayment.date_paid <= date_to)
        total_paid = session.exec(pmt_stmt).first() or 0.0
        rem = max(0.0, l.amount_taken - total_paid)
        loans_data.append({
            "lender_name": l.lender_name,
            "date_taken": l.date_taken,
            "received_in_account": l.received_in_account,
            "amount_taken": l.amount_taken,
            "total_paid": round(total_paid, 2),
            "remaining_balance": round(rem, 2),
            "status": l.status,
            "purpose": l.purpose,
            "notes": l.notes
        })

    balances = calculate_account_balances(session)

    excel_bytes = generate_finance_excel(
        date_from=date_from,
        date_to=date_to,
        received_entries=received_entries,
        debit_entries=debit_entries,
        kind_donations=kind_donations,
        loans=loans_data,
        balances=balances
    )

    period_filename = "all_time"
    if date_from and date_to:
        period_filename = f"{date_from}_to_{date_to}"
    elif date_from:
        period_filename = f"from_{date_from}"
    elif date_to:
        period_filename = f"up_to_{date_to}"

    filename = f"Jamia_Usmania_Finance_Report_{period_filename}.xlsx"

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

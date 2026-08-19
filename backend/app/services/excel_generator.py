import io
from datetime import date
from typing import Optional, List, Dict
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

def generate_records_excel(records: list[dict], record_type: str = "Student") -> bytes:
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = f"{record_type} Records"
    ws.views.sheetView[0].showGridLines = True

    if not records:
        ws.append(["No records selected."])
        buffer = io.BytesIO()
        wb.save(buffer)
        buffer.seek(0)
        return buffer.getvalue()

    # Define headers based on record type
    if record_type == "Student":
        headers = [
            "Roll No", "Full Name", "Father Name", "Guardian Name", "Guardian Phone",
            "Class / Grade", "Subject Enrolled", "Boarding", "Room No", "Bed No",
            "Zakat Eligible", "Zakat Syed Status", "Usmania Academy School", "Academy Class",
            "Assigned Teacher", "CNIC / B-Form", "Email", "Student Contact",
            "Gender", "Date of Birth", "Admission Date", "Islamic (Hijri) Date",
            "Current Address", "Permanent Address", "City", "Country", "Institution", "Previous Institute"
        ]
        keys = [
            "roll_no", "name", "father_name", "guardian_name", "guardian_contact",
            "student_class", "subject", "boarding", "hostel_room_no", "hostel_bed_no",
            "is_zakat_eligible", "zakat_syed_status", "is_academy_student", "academy_class",
            "assigned_teacher_name", "nic", "email", "contact",
            "gender", "dob", "admission_date", "islamic_date",
            "current_address", "permanent_address", "city", "country", "institution", "previous_institute"
        ]
    elif record_type == "Staff":
        headers = [
            "Staff ID / Roll No", "Full Name", "Father / Guardian", "Designation / Role",
            "CNIC / B-Form", "Email", "Contact",
            "Gender", "Date of Birth", "Joining Date", "Islamic (Hijri) Date",
            "Current Address", "Permanent Address", "City", "Country", "Institution", "Previous Institute"
        ]
        keys = [
            "roll_no", "name", "father_guardian_name", "designation",
            "nic", "email", "contact",
            "gender", "dob", "admission_date", "islamic_date",
            "current_address", "permanent_address", "city", "country", "institution", "previous_institute"
        ]
    else:
        headers = [
            "Roll No", "Full Name", "Father / Guardian", "Subject Taught",
            "CNIC / B-Form", "Email", "Contact",
            "Gender", "Date of Birth", "Admission Date", "Islamic (Hijri) Date",
            "Current Address", "Permanent Address", "City", "Country", "Institution", "Previous Institute"
        ]
        keys = [
            "roll_no", "name", "father_guardian_name", "subject",
            "nic", "email", "contact",
            "gender", "dob", "admission_date", "islamic_date",
            "current_address", "permanent_address", "city", "country", "institution", "previous_institute"
        ]

    # Header styling
    header_fill = PatternFill(start_color="145A32", end_color="145A32", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )
    zebra_fill = PatternFill(start_color="F9FAFB", end_color="F9FAFB", fill_type="solid")

    # Title Row
    ws.append([f"JAMIA USMANIA TRUST — {record_type.upper()} RECORDS EXPORT"])
    title_cell = ws.cell(row=1, column=1)
    title_cell.font = Font(name="Calibri", size=14, bold=True, color="145A32")
    ws.append([]) # Blank row

    # Header Row
    ws.append(headers)
    header_row_idx = 3

    for col_num in range(1, len(headers) + 1):
        cell = ws.cell(row=header_row_idx, column=col_num)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    # Data Rows
    for row_num, rec in enumerate(records, start=header_row_idx + 1):
        row_data = []
        for k in keys:
            val = rec.get(k, "")
            # Fallback for father_name if empty but father_guardian_name is populated
            if k == "father_name" and not val:
                val = rec.get("father_guardian_name", "")
            if isinstance(val, bool):
                val = "Yes" if val else "No"
            row_data.append(str(val) if val is not None else "")
        ws.append(row_data)

        # Style data row
        for col_num in range(1, len(headers) + 1):
            cell = ws.cell(row=row_num, column=col_num)
            cell.font = Font(name="Calibri", size=10)
            cell.border = thin_border
            if row_num % 2 == 0:
                cell.fill = zebra_fill
            if k in ["roll_no", "dob", "admission_date", "gender", "boarding", "is_zakat_eligible", "is_academy_student"]:
                cell.alignment = Alignment(horizontal="center", vertical="center")

    # Auto-fit column widths
    for col in ws.columns:
        max_len = 0
        col_letter = get_column_letter(col[0].column)
        for cell in col:
            # Skip title line for length calc
            if cell.row == 1:
                continue
            if cell.value:
                max_len = max(max_len, len(str(cell.value)))
        ws.column_dimensions[col_letter].width = max(max_len + 4, 12)

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()


# ----------------- COMPREHENSIVE FINANCE EXCEL REPORT -----------------
def generate_finance_excel(
    date_from: Optional[date],
    date_to: Optional[date],
    received_entries: list,
    debit_entries: list,
    kind_donations: list,
    loans: list,
    balances: dict,
    liabilities: list = []
) -> bytes:
    wb = openpyxl.Workbook()
    
    # Common styles
    header_fill = PatternFill(start_color="145A32", end_color="145A32", fill_type="solid")
    header_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
    subhead_fill = PatternFill(start_color="FDF6E3", end_color="FDF6E3", fill_type="solid")
    subhead_font = Font(name="Calibri", size=11, bold=True, color="145A32")
    zebra_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
    bold_font = Font(name="Calibri", size=11, bold=True)
    total_fill = PatternFill(start_color="E2E8F0", end_color="E2E8F0", fill_type="solid")
    
    thin_border = Border(
        left=Side(style='thin', color='CBD5E1'),
        right=Side(style='thin', color='CBD5E1'),
        top=Side(style='thin', color='CBD5E1'),
        bottom=Side(style='thin', color='CBD5E1')
    )

    period_str = "All Time (Complete History)"
    if date_from and date_to:
        period_str = f"From: {date_from} To: {date_to}"
    elif date_from:
        period_str = f"From: {date_from} Onwards"
    elif date_to:
        period_str = f"Up to: {date_to}"

    # ---------------- 1. SHEET: EXECUTIVE SUMMARY ----------------
    ws_sum = wb.active
    ws_sum.title = "Finance Summary"
    ws_sum.views.sheetView[0].showGridLines = True

    ws_sum.append(["JAMIA USMANIA TRUST — COMPREHENSIVE FINANCIAL STATEMENT"])
    ws_sum.cell(row=1, column=1).font = Font(name="Calibri", size=15, bold=True, color="145A32")
    ws_sum.append([f"Reporting Period: {period_str}"])
    ws_sum.cell(row=2, column=1).font = Font(name="Calibri", size=11, italic=True, color="475569")
    ws_sum.append([])

    # Key Totals in Period
    tot_received = sum(r.amount for r in received_entries)
    tot_debit = sum(d.amount for d in debit_entries)
    net_flow = tot_received - tot_debit
    tot_kind_val = sum(k.estimated_value or 0 for k in kind_donations)

    ws_sum.append(["PERIOD TRANSACTIONS SUMMARY", ""])
    ws_sum.cell(row=4, column=1).fill = subhead_fill
    ws_sum.cell(row=4, column=1).font = subhead_font
    ws_sum.cell(row=4, column=2).fill = subhead_fill

    ws_sum.append(["Total Income & Donations Received (PKR)", tot_received])
    ws_sum.append(["Total Expenses & Debits Paid (PKR)", tot_debit])
    ws_sum.append(["Net Surplus / (Deficit) in Period (PKR)", net_flow])
    ws_sum.append(["Total In-Kind Physical Donations (Est. PKR)", tot_kind_val])
    ws_sum.append([])

    # Account Balances Table
    ws_sum.append(["RUNNING ACCOUNT BALANCES", "CURRENT BALANCE (PKR)"])
    bal_header_row = 11
    ws_sum.cell(row=bal_header_row, column=1).fill = header_fill
    ws_sum.cell(row=bal_header_row, column=1).font = header_font
    ws_sum.cell(row=bal_header_row, column=2).fill = header_fill
    ws_sum.cell(row=bal_header_row, column=2).font = header_font

    acc_map = balances.get("accounts", {})
    r_idx = bal_header_row + 1
    for acc_name in ["Cash", "JazzCash", "Easypaisa", "Meezan Bank"]:
        ws_sum.append([f"{acc_name} Account", acc_map.get(acc_name, 0.0)])
        ws_sum.cell(row=r_idx, column=1).border = thin_border
        ws_sum.cell(row=r_idx, column=2).border = thin_border
        ws_sum.cell(row=r_idx, column=2).number_format = '#,##0.00'
        r_idx += 1

    ws_sum.append(["GRAND TOTAL ALL ACCOUNTS (PKR)", balances.get("grand_total", 0.0)])
    ws_sum.cell(row=r_idx, column=1).font = bold_font
    ws_sum.cell(row=r_idx, column=1).fill = total_fill
    ws_sum.cell(row=r_idx, column=1).border = thin_border
    ws_sum.cell(row=r_idx, column=2).font = bold_font
    ws_sum.cell(row=r_idx, column=2).fill = total_fill
    ws_sum.cell(row=r_idx, column=2).border = thin_border
    ws_sum.cell(row=r_idx, column=2).number_format = '#,##0.00'

    ws_sum.column_dimensions['A'].width = 45
    ws_sum.column_dimensions['B'].width = 25

    # ---------------- 2. SHEET: RECEIVED & DONATIONS ----------------
    ws_rec = wb.create_sheet(title="Received Ledger")
    ws_rec.views.sheetView[0].showGridLines = True
    rec_headers = [
        "Receipt Date", "Entry Type", "Payment Mode", "Account Credited",
        "Amount (PKR)", "Payer / Donor Name", "Contact Phone", "Address", "Purpose / Notes"
    ]
    ws_rec.append(["JAMIA USMANIA TRUST — RECEIVED & DONATION ENTRIES"])
    ws_rec.cell(row=1, column=1).font = Font(name="Calibri", size=13, bold=True, color="145A32")
    ws_rec.append([f"Period: {period_str} | Total Entries: {len(received_entries)}"])
    ws_rec.append([])
    ws_rec.append(rec_headers)
    
    for c_idx in range(1, len(rec_headers) + 1):
        cell = ws_rec.cell(row=4, column=c_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    curr_row = 5
    for r in received_entries:
        ws_rec.append([
            str(r.date), r.entry_type, r.mode, r.account,
            r.amount, r.payer_name, r.payer_contact or "", r.payer_address or "", r.purpose_note or ""
        ])
        for c_idx in range(1, len(rec_headers) + 1):
            cell = ws_rec.cell(row=curr_row, column=c_idx)
            cell.border = thin_border
            if curr_row % 2 == 0:
                cell.fill = zebra_fill
            if c_idx == 5:
                cell.number_format = '#,##0.00'
                cell.font = bold_font
        curr_row += 1

    # Total row
    ws_rec.append(["TOTAL RECEIVED", "", "", "", tot_received, "", "", "", ""])
    for c_idx in range(1, len(rec_headers) + 1):
        cell = ws_rec.cell(row=curr_row, column=c_idx)
        cell.fill = total_fill
        cell.font = bold_font
        cell.border = thin_border
        if c_idx == 5:
            cell.number_format = '#,##0.00'

    for col in ws_rec.columns:
        max_l = max(len(str(cell.value or '')) for cell in col if cell.row > 2)
        col_letter = get_column_letter(col[0].column)
        ws_rec.column_dimensions[col_letter].width = max(max_l + 3, 14)

    # ---------------- 3. SHEET: DEBIT & EXPENSES ----------------
    ws_deb = wb.create_sheet(title="Debit Expenses Ledger")
    ws_deb.views.sheetView[0].showGridLines = True
    deb_headers = [
        "Expense Date", "Account Debited", "Amount (PKR)", "Paid To / Payee", "Purpose / Expense Description"
    ]
    ws_deb.append(["JAMIA USMANIA TRUST — DEBIT & EXPENSE ENTRIES"])
    ws_deb.cell(row=1, column=1).font = Font(name="Calibri", size=13, bold=True, color="145A32")
    ws_deb.append([f"Period: {period_str} | Total Entries: {len(debit_entries)}"])
    ws_deb.append([])
    ws_deb.append(deb_headers)

    for c_idx in range(1, len(deb_headers) + 1):
        cell = ws_deb.cell(row=4, column=c_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    curr_row = 5
    for d in debit_entries:
        ws_deb.append([
            str(d.date), d.account, d.amount, d.paid_to, d.purpose
        ])
        for c_idx in range(1, len(deb_headers) + 1):
            cell = ws_deb.cell(row=curr_row, column=c_idx)
            cell.border = thin_border
            if curr_row % 2 == 0:
                cell.fill = zebra_fill
            if c_idx == 3:
                cell.number_format = '#,##0.00'
                cell.font = bold_font
        curr_row += 1

    # Total row
    ws_deb.append(["TOTAL DEBIT EXPENSES", "", tot_debit, "", ""])
    for c_idx in range(1, len(deb_headers) + 1):
        cell = ws_deb.cell(row=curr_row, column=c_idx)
        cell.fill = total_fill
        cell.font = bold_font
        cell.border = thin_border
        if c_idx == 3:
            cell.number_format = '#,##0.00'

    for col in ws_deb.columns:
        max_l = max(len(str(cell.value or '')) for cell in col if cell.row > 2)
        col_letter = get_column_letter(col[0].column)
        ws_deb.column_dimensions[col_letter].width = max(max_l + 4, 16)

    # ---------------- 4. SHEET: IN-KIND DONATIONS ----------------
    ws_knd = wb.create_sheet(title="In-Kind Donations")
    ws_knd.views.sheetView[0].showGridLines = True
    knd_headers = [
        "Date", "Item Name / Description", "Category", "Quantity", "Estimated Value (PKR)",
        "Donor Name", "Contact", "Condition", "Notes"
    ]
    ws_knd.append(["JAMIA USMANIA TRUST — IN-KIND PHYSICAL DONATIONS"])
    ws_knd.cell(row=1, column=1).font = Font(name="Calibri", size=13, bold=True, color="145A32")
    ws_knd.append([f"Period: {period_str} | Total Items: {len(kind_donations)}"])
    ws_knd.append([])
    ws_knd.append(knd_headers)

    for c_idx in range(1, len(knd_headers) + 1):
        cell = ws_knd.cell(row=4, column=c_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    curr_row = 5
    for k in kind_donations:
        ws_knd.append([
            str(k.date), k.item_name, k.category, k.quantity, k.estimated_value or 0,
            k.donor_name, k.donor_contact or "", k.condition or "New", k.notes or ""
        ])
        for c_idx in range(1, len(knd_headers) + 1):
            cell = ws_knd.cell(row=curr_row, column=c_idx)
            cell.border = thin_border
            if curr_row % 2 == 0:
                cell.fill = zebra_fill
            if c_idx == 5:
                cell.number_format = '#,##0.00'
        curr_row += 1

    # Total row
    ws_knd.append(["TOTAL IN-KIND VALUE", "", "", sum(k.quantity for k in kind_donations), tot_kind_val, "", "", "", ""])
    for c_idx in range(1, len(knd_headers) + 1):
        cell = ws_knd.cell(row=curr_row, column=c_idx)
        cell.fill = total_fill
        cell.font = bold_font
        cell.border = thin_border
        if c_idx == 5:
            cell.number_format = '#,##0.00'

    for col in ws_knd.columns:
        max_l = max(len(str(cell.value or '')) for cell in col if cell.row > 2)
        col_letter = get_column_letter(col[0].column)
        ws_knd.column_dimensions[col_letter].width = max(max_l + 4, 16)

    # ---------------- 5. SHEET: LOANS & REPAYMENTS ----------------
    ws_loan = wb.create_sheet(title="Loans & Repayments")
    ws_loan.views.sheetView[0].showGridLines = True
    loan_headers = [
        "Lender Name", "Date Taken", "Received In Account", "Amount Taken (PKR)",
        "Total Paid (PKR)", "Remaining Balance (PKR)", "Status", "Purpose", "Notes"
    ]
    ws_loan.append(["JAMIA USMANIA TRUST — LOANS (QARZ) & REPAYMENT SCHEDULE"])
    ws_loan.cell(row=1, column=1).font = Font(name="Calibri", size=13, bold=True, color="145A32")
    ws_loan.append([f"Period: {period_str} | Total Loans: {len(loans)}"])
    ws_loan.append([])
    ws_loan.append(loan_headers)

    for c_idx in range(1, len(loan_headers) + 1):
        cell = ws_loan.cell(row=4, column=c_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    curr_row = 5
    tot_loan_taken = 0.0
    tot_loan_paid = 0.0
    tot_loan_rem = 0.0

    for l in loans:
        taken = l.get("amount_taken", 0.0) if isinstance(l, dict) else l.amount_taken
        paid = l.get("total_paid", 0.0) if isinstance(l, dict) else getattr(l, "total_paid", 0.0)
        rem = l.get("remaining_balance", taken - paid) if isinstance(l, dict) else getattr(l, "remaining_balance", taken - paid)
        l_name = l.get("lender_name", "") if isinstance(l, dict) else l.lender_name
        d_taken = l.get("date_taken", "") if isinstance(l, dict) else l.date_taken
        acc = l.get("received_in_account", "Cash") if isinstance(l, dict) else getattr(l, "received_in_account", "Cash")
        status = l.get("status", "Active") if isinstance(l, dict) else l.status
        purpose = l.get("purpose", "") if isinstance(l, dict) else l.purpose
        notes = l.get("notes", "") if isinstance(l, dict) else l.notes

        tot_loan_taken += taken
        tot_loan_paid += paid
        tot_loan_rem += rem

        ws_loan.append([
            l_name, str(d_taken), acc, taken, paid, rem, status, purpose, notes or ""
        ])
        for c_idx in range(1, len(loan_headers) + 1):
            cell = ws_loan.cell(row=curr_row, column=c_idx)
            cell.border = thin_border
            if curr_row % 2 == 0:
                cell.fill = zebra_fill
            if c_idx in [4, 5, 6]:
                cell.number_format = '#,##0.00'
        curr_row += 1

    # Total row
    ws_loan.append(["TOTAL ACTIVE & SETTLED LOANS", "", "", tot_loan_taken, tot_loan_paid, tot_loan_rem, "", "", ""])
    for c_idx in range(1, len(loan_headers) + 1):
        cell = ws_loan.cell(row=curr_row, column=c_idx)
        cell.fill = total_fill
        cell.font = bold_font
        cell.border = thin_border
        if c_idx in [4, 5, 6]:
            cell.number_format = '#,##0.00'

    for col in ws_loan.columns:
        max_l = max(len(str(cell.value or '')) for cell in col if cell.row > 2)
        col_letter = get_column_letter(col[0].column)
        ws_loan.column_dimensions[col_letter].width = max(max_l + 4, 16)

    # ---------------- 6. SHEET: LIABILITIES & PAYABLES (واجبات و بلز) ----------------
    ws_liab = wb.create_sheet(title="Liabilities & Payables")
    ws_liab.views.sheetView[0].showGridLines = True
    liab_headers = [
        "Title / Payable Details", "Category", "Bill / Incurred Date", "Due Date",
        "Total Payable (PKR)", "Total Paid (PKR)", "Remaining Balance (PKR)", "Status", "Notes / Remarks"
    ]
    ws_liab.append(["JAMIA USMANIA TRUST — LIABILITIES, UTILITY BILLS & VENDOR PAYABLES"])
    ws_liab.cell(row=1, column=1).font = Font(name="Calibri", size=13, bold=True, color="145A32")
    ws_liab.append([f"Period: {period_str} | Total Liabilities: {len(liabilities)}"])
    ws_liab.append([])
    ws_liab.append(liab_headers)

    for c_idx in range(1, len(liab_headers) + 1):
        cell = ws_liab.cell(row=4, column=c_idx)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = thin_border

    curr_row = 5
    tot_liab_amount = 0.0
    tot_liab_paid = 0.0
    tot_liab_rem = 0.0

    for lb in liabilities:
        t_amt = lb.get("amount_total", 0.0) if isinstance(lb, dict) else lb.amount_total
        p_amt = lb.get("total_paid", 0.0) if isinstance(lb, dict) else getattr(lb, "total_paid", 0.0)
        r_amt = lb.get("remaining_balance", t_amt - p_amt) if isinstance(lb, dict) else getattr(lb, "remaining_balance", t_amt - p_amt)
        title = lb.get("title", "") if isinstance(lb, dict) else lb.title
        cat = lb.get("category", "") if isinstance(lb, dict) else lb.category
        d_inc = lb.get("date_incurred", "") if isinstance(lb, dict) else lb.date_incurred
        d_due = lb.get("due_date", "") if isinstance(lb, dict) else getattr(lb, "due_date", "")
        status = lb.get("status", "Pending") if isinstance(lb, dict) else lb.status
        notes = lb.get("notes", "") if isinstance(lb, dict) else getattr(lb, "notes", "")

        tot_liab_amount += t_amt
        tot_liab_paid += p_amt
        tot_liab_rem += r_amt

        ws_liab.append([
            title, cat, str(d_inc), str(d_due) if d_due else "—",
            t_amt, p_amt, r_amt, status, notes or ""
        ])
        for c_idx in range(1, len(liab_headers) + 1):
            cell = ws_liab.cell(row=curr_row, column=c_idx)
            cell.border = thin_border
            if curr_row % 2 == 0:
                cell.fill = zebra_fill
            if c_idx in [5, 6, 7]:
                cell.number_format = '#,##0.00'
        curr_row += 1

    # Total row
    ws_liab.append(["TOTAL LIABILITIES & PAYABLES", "", "", "", tot_liab_amount, tot_liab_paid, tot_liab_rem, "", ""])
    for c_idx in range(1, len(liab_headers) + 1):
        cell = ws_liab.cell(row=curr_row, column=c_idx)
        cell.fill = total_fill
        cell.font = bold_font
        cell.border = thin_border
        if c_idx in [5, 6, 7]:
            cell.number_format = '#,##0.00'

    for col in ws_liab.columns:
        max_l = max(len(str(cell.value or '')) for cell in col if cell.row > 2)
        col_letter = get_column_letter(col[0].column)
        ws_liab.column_dimensions[col_letter].width = max(max_l + 4, 16)

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer.getvalue()


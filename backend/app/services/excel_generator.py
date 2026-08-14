import io
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

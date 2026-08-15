import io
import os
import base64
import urllib.request
from PIL import Image as PILImage
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def fetch_image_flowable(image_url: str, max_width=1.3*inch, max_height=1.6*inch):
    """Downloads or decodes image URL/data-uri for ReportLab canvas thumbnail."""
    if not image_url:
        return None
    try:
        if image_url.startswith("data:image"):
            header, b64 = image_url.split(",", 1)
            img_bytes = base64.b64decode(b64)
            img_io = io.BytesIO(img_bytes)
            img = Image(img_io)
        elif image_url.startswith("http://") or image_url.startswith("https://"):
            req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=6) as response:
                img_data = response.read()
            img_io = io.BytesIO(img_data)
            img = Image(img_io)
        else:
            return None

        # Maintain aspect ratio scaling
        img.drawWidth = max_width
        img.drawHeight = max_height
        return img
    except Exception:
        return None

def fetch_large_document_flowable(image_url: str, max_width=7.0*inch, max_height=8.2*inch):
    """
    Downloads document image and calculates proportional dimensions to fit
    a full standalone Letter page nicely with clear margins.
    """
    if not image_url:
        return None
    try:
        if image_url.startswith("data:image"):
            header, b64 = image_url.split(",", 1)
            img_bytes = base64.b64decode(b64)
        elif image_url.startswith("http://") or image_url.startswith("https://"):
            req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=8) as response:
                img_bytes = response.read()
        else:
            return None

        # Check dimensions using PIL
        pil_im = PILImage.open(io.BytesIO(img_bytes))
        orig_w, orig_h = pil_im.size
        if orig_w <= 0 or orig_h <= 0:
            return None

        aspect = orig_w / float(orig_h)

        # Scale proportionally to fit within max_width and max_height
        target_w = max_width
        target_h = target_w / aspect

        if target_h > max_height:
            target_h = max_height
            target_w = target_h * aspect

        img_io = io.BytesIO(img_bytes)
        doc_img = Image(img_io, width=target_w, height=target_h)
        return doc_img
    except Exception:
        return None

def generate_record_pdf(record_data: dict, record_type: str = "Student") -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.4 * inch,
        bottomMargin=0.4 * inch
    )

    styles = getSampleStyleSheet()

    # Brand Colors
    PRIMARY_GREEN = colors.HexColor("#145A32")
    ACCENT_CREAM = colors.HexColor("#FDF6E3")
    DARK_TEXT = colors.HexColor("#1F2937")
    LIGHT_GRAY = colors.HexColor("#F3F4F6")
    BORDER_COLOR = colors.HexColor("#CBD5E1")

    # Custom Styles
    title_style = ParagraphStyle(
        'HeaderTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        textColor=colors.white,
        alignment=1, # Center
        leading=24
    )

    subtitle_style = ParagraphStyle(
        'HeaderSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        textColor=ACCENT_CREAM,
        alignment=1,
        leading=14
    )

    badge_style = ParagraphStyle(
        'BadgeStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        textColor=PRIMARY_GREEN,
        alignment=1,
        leading=16
    )

    label_style = ParagraphStyle(
        'LabelStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        textColor=PRIMARY_GREEN,
        leading=12
    )

    value_style = ParagraphStyle(
        'ValueStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        textColor=DARK_TEXT,
        leading=12
    )

    story = []

    # =========================================================================
    # PAGE 1: OFFICIAL PROFILE & ADMISSION RECORD
    # =========================================================================

    # 1. Header Banner Table
    header_data = [
        [Paragraph("JAMIA USMANIA TRUST", title_style)],
        [Paragraph(f"OFFICIAL {record_type.upper()} PROFILE & ADMISSION RECORD", subtitle_style)],
        [Paragraph("Regd. Madrasa Management System • Govt. & Trust Certified", ParagraphStyle('Sub', parent=subtitle_style, fontSize=8, fontName='Helvetica'))]
    ]

    header_table = Table(header_data, colWidths=[7.5 * inch])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY_GREEN),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 0.15 * inch))

    # 2. Roll No & Admission Dates Bar
    dates_data = [
        [
            Paragraph(f"<b>Roll No:</b> {record_data.get('roll_no', 'N/A')}", ParagraphStyle('R', parent=value_style, fontSize=11, fontName='Helvetica-Bold', textColor=PRIMARY_GREEN)),
            Paragraph(f"<b>Gregorian Date:</b> {record_data.get('admission_date', 'N/A')}", value_style),
            Paragraph(f"<b>Hijri Date:</b> {record_data.get('islamic_date', 'N/A')}", ParagraphStyle('H', parent=value_style, fontName='Helvetica-Bold'))
        ]
    ]
    dates_table = Table(dates_data, colWidths=[2.5 * inch, 2.5 * inch, 2.5 * inch])
    dates_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), ACCENT_CREAM),
        ('BOX', (0, 0), (-1, -1), 1, PRIMARY_GREEN),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(dates_table)
    story.append(Spacer(1, 0.15 * inch))

    # 3. Main Info Section: Photo on right, Key Details on Left
    photo_img = fetch_image_flowable(record_data.get('picture', ''))
    if not photo_img:
        photo_cell = Paragraph("<b>[ PHOTO ]</b><br/><font size=7 color=gray>No Image Uploaded</font>", ParagraphStyle('P', parent=badge_style, alignment=1))
    else:
        photo_cell = photo_img

    # Form Fields Table
    def fmt(label, key, default="N/A"):
        val = record_data.get(key, default)
        if isinstance(val, bool):
            val = "Yes" if val else "No"
        return [Paragraph(f"{label}:", label_style), Paragraph(str(val or 'N/A'), value_style)]

    info_rows = []
    info_rows.append(fmt("Full Name", "name"))
    
    if record_type == "Student":
        father_val = record_data.get("father_name") or record_data.get("father_guardian_name") or "N/A"
        info_rows.append([Paragraph("Father Name:", label_style), Paragraph(str(father_val), value_style)])
        if record_data.get("guardian_name") or record_data.get("guardian_contact"):
            g_desc = f"{record_data.get('guardian_name', '—')}"
            if record_data.get("guardian_contact"):
                g_desc += f" (Phone: {record_data.get('guardian_contact')})"
            info_rows.append([Paragraph("Guardian Details:", label_style), Paragraph(g_desc, value_style)])
    else:
        info_rows.append(fmt("Father / Guardian Name", "father_guardian_name"))

    info_rows.append(fmt("CNIC / B-Form", "nic"))
    info_rows.append(fmt("Gender", "gender"))
    info_rows.append(fmt("Date of Birth", "dob"))
    info_rows.append(fmt("Student Contact", "contact"))
    info_rows.append(fmt("Email Address", "email"))

    if record_type == "Student":
        info_rows.append(fmt("Class / Grade", "student_class"))
        info_rows.append(fmt("Subject Enrolled", "subject"))
        
        # Boarding with Room & Bed
        is_boarder = record_data.get("boarding", False)
        if is_boarder:
            room_no = record_data.get("hostel_room_no", "")
            bed_no = record_data.get("hostel_bed_no", "")
            board_desc = "Yes"
            if room_no or bed_no:
                board_desc += f" (Room: {room_no or 'N/A'}, Bed: {bed_no or 'N/A'})"
            info_rows.append([Paragraph("Boarding / Hostel:", label_style), Paragraph(board_desc, value_style)])
        else:
            info_rows.append(fmt("Boarding / Hostel", "boarding"))

        # Zakat Eligible with Syed status
        is_zakat = record_data.get("is_zakat_eligible", False)
        if is_zakat:
            syed_status = record_data.get("zakat_syed_status", "Non-Syed")
            info_rows.append([Paragraph("Zakat Eligible:", label_style), Paragraph(f"Yes ({syed_status})", value_style)])
        else:
            info_rows.append(fmt("Zakat Eligible Status", "is_zakat_eligible"))

        # Usmania Academy with Class
        is_academy = record_data.get("is_academy_student", False)
        if is_academy:
            acad_cls = record_data.get("academy_class", "")
            acad_desc = f"Yes ({acad_cls})" if acad_cls else "Yes"
            info_rows.append([Paragraph("Usmania Academy School:", label_style), Paragraph(acad_desc, value_style)])
        else:
            info_rows.append(fmt("Usmania Academy School", "is_academy_student"))

        if record_data.get("assigned_teacher_name"):
            info_rows.append([Paragraph("Assigned Teacher:", label_style), Paragraph(str(record_data.get("assigned_teacher_name")), ParagraphStyle('UT', parent=value_style, fontName='Helvetica-Bold', textColor=PRIMARY_GREEN))])
    else:
        info_rows.append(fmt("Subject Taught", "subject"))

    info_table = Table(info_rows, colWidths=[1.8 * inch, 3.8 * inch])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, LIGHT_GRAY),
    ]))

    # Photo Wrapper Table
    photo_table = Table([[photo_cell]], colWidths=[1.6 * inch])
    photo_table.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))

    main_grid = Table([[info_table, photo_table]], colWidths=[5.7 * inch, 1.8 * inch])
    main_grid.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    story.append(main_grid)
    story.append(Spacer(1, 0.10 * inch))

    # 4. Institutional, Address & Attached Documents Box
    add_rows = [
        [Paragraph("Current Address", label_style), Paragraph(str(record_data.get('current_address', 'N/A')), value_style)],
        [Paragraph("Permanent Address", label_style), Paragraph(str(record_data.get('permanent_address', 'N/A')), value_style)],
        [Paragraph("City / District", label_style), Paragraph(str(record_data.get('city', 'N/A')), value_style)],
        [Paragraph("Country", label_style), Paragraph(str(record_data.get('country', 'Pakistan')), value_style)],
        [Paragraph("Current Institution", label_style), Paragraph(str(record_data.get('institution', 'Jamia Usmania')), value_style)],
        [Paragraph("Previous Institute", label_style), Paragraph(str(record_data.get('previous_institute', 'N/A')), value_style)],
    ]

    # Collect attached documents for summary and subsequent pages
    attached_documents = [] # List of tuples: (doc_title, doc_subtitle, doc_url)

    if record_type == "Student":
        doc_list = []
        if record_data.get('doc_zakat'):
            doc_list.append("Zakat Document (Attached on Page 2)")
            attached_documents.append(("ZAKAT DOCUMENT / AFFIDAVIT", "مستحق زکوۃ دستاویز / بیان حلفی", record_data.get('doc_zakat')))
        if record_data.get('doc_birth_certificate'):
            doc_list.append("Birth Certificate (Attached)")
            attached_documents.append(("BIRTH CERTIFICATE / B-FORM", "پیدائشی سرٹیفکیٹ / ب فارم", record_data.get('doc_birth_certificate')))
        if record_data.get('doc_activity_diary'):
            doc_list.append("Activity Diary (Attached)")
            attached_documents.append(("ACTIVITY DIARY / PERFORMANCE REPORT", "کارکردگی ڈائری / تعلیمی ریکارڈ", record_data.get('doc_activity_diary')))
        doc_str = ", ".join(doc_list) if doc_list else "None uploaded (Optional)"
        add_rows.append([Paragraph("Attached Documents", label_style), Paragraph(doc_str, value_style)])
    else:
        doc_list = []
        if record_data.get('doc_contract'):
            doc_list.append("Teacher Contract (Attached)")
            attached_documents.append(("TEACHER CONTRACT / AGREEMENT", "معاہدہ تدریس / ایگریمنٹ", record_data.get('doc_contract')))
        if record_data.get('doc_payslip'):
            doc_list.append("Payslip Voucher (Attached)")
            attached_documents.append(("PAYSLIP / SALARY VOUCHER", "تنخواہ سلپ / بینک واؤچر", record_data.get('doc_payslip')))
        if record_data.get('doc_cnic'):
            doc_list.append("CNIC Copy (Attached)")
            attached_documents.append(("CNIC COPY (FRONT / BACK)", "قومی شناختی کارڈ کی کاپی", record_data.get('doc_cnic')))
        doc_str = ", ".join(doc_list) if doc_list else "None uploaded (Optional)"
        add_rows.append([Paragraph("Attached Documents", label_style), Paragraph(doc_str, value_style)])

    add_table = Table(add_rows, colWidths=[1.8 * inch, 5.7 * inch])
    add_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 3),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.white),
    ]))
    story.append(add_table)
    story.append(Spacer(1, 0.20 * inch))

    # 5. Authorization & Verification Section
    sig_data = [
        [
            Paragraph("________________________<br/><b>Candidate / Parent Signature</b>", ParagraphStyle('S1', parent=value_style, alignment=1)),
            Paragraph("________________________<br/><b>Verified by Office Incharge</b>", ParagraphStyle('S2', parent=value_style, alignment=1)),
            Paragraph("________________________<br/><b>Principal / Trustee Seal</b>", ParagraphStyle('S3', parent=value_style, alignment=1))
        ]
    ]
    sig_table = Table(sig_data, colWidths=[2.5 * inch, 2.5 * inch, 2.5 * inch])
    sig_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    story.append(sig_table)
    story.append(Spacer(1, 0.10 * inch))

    # Footer note on Page 1
    footer_text = Paragraph(
        "<i>This document is an electronically generated official record of Jamia Usmania Trust. For verification or updates, contact the Trust Administration Office.</i>",
        ParagraphStyle('F', parent=styles['Normal'], fontSize=7.5, textColor=colors.gray, alignment=1)
    )
    story.append(footer_text)

    # =========================================================================
    # SUBSEQUENT PAGES: 1 DEDICATED FULL PAGE PER ATTACHED IMAGE
    # =========================================================================
    for idx, (doc_title, doc_sub, doc_url) in enumerate(attached_documents):
        doc_img = fetch_large_document_flowable(doc_url, max_width=7.2*inch, max_height=8.0*inch)
        if not doc_img:
            continue

        # Create new page
        story.append(PageBreak())

        # Document Header Banner
        doc_header_data = [
            [Paragraph("JAMIA USMANIA TRUST — ATTACHED DOCUMENT", title_style)],
            [Paragraph(f"{doc_title} ({doc_sub})", subtitle_style)],
            [
                Paragraph(
                    f"Candidate: <b>{record_data.get('name', 'N/A')}</b> &nbsp;|&nbsp; Roll No: <b>{record_data.get('roll_no', 'N/A')}</b> &nbsp;|&nbsp; Attachment #{idx+1}",
                    ParagraphStyle('DocInfo', parent=subtitle_style, fontSize=9, fontName='Helvetica')
                )
            ]
        ]
        doc_header_table = Table(doc_header_data, colWidths=[7.5 * inch])
        doc_header_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), PRIMARY_GREEN),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(doc_header_table)
        story.append(Spacer(1, 0.15 * inch))

        # Full Document Image in framed container
        img_table = Table([[doc_img]], colWidths=[7.5 * inch])
        img_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOX', (0, 0), (-1, -1), 1, BORDER_COLOR),
            ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
            ('PADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(img_table)
        story.append(Spacer(1, 0.12 * inch))

        # Document Page Footer
        doc_footer = Paragraph(
            f"<i>Official Attachment ({doc_title}) for {record_data.get('name', 'Record')} • Jamia Usmania Official Platform</i>",
            ParagraphStyle('DocFoot', parent=styles['Normal'], fontSize=8, textColor=colors.gray, alignment=1)
        )
        story.append(doc_footer)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

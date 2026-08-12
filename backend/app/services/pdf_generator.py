import io
import os
import base64
import urllib.request
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

def fetch_image_flowable(image_url: str, max_width=1.3*inch, max_height=1.6*inch):
    """Downloads or decodes image URL/data-uri for ReportLab canvas."""
    if not image_url:
        return None
    try:
        if image_url.startswith("data:image"):
            # Base64 string
            header, b64 = image_url.split(",", 1)
            img_bytes = base64.b64decode(b64)
            img_io = io.BytesIO(img_bytes)
            img = Image(img_io)
        elif image_url.startswith("http://") or image_url.startswith("https://"):
            req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                img_data = response.read()
            img_io = io.BytesIO(img_data)
            img = Image(img_io)
        else:
            return None

        # Maintain aspect ratio scaling
        img.drawWidth = max_width
        img.drawHeight = max_height
        return img
    except Exception as e:
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
        # Placeholder text box
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
    info_rows.append(fmt("Father / Guardian Name", "father_guardian_name"))
    info_rows.append(fmt("CNIC / B-Form", "nic"))
    info_rows.append(fmt("Gender", "gender"))
    info_rows.append(fmt("Date of Birth", "dob"))
    info_rows.append(fmt("Contact Phone", "contact"))
    info_rows.append(fmt("Email Address", "email"))

    if record_type == "Student":
        info_rows.append(fmt("Class / Grade", "student_class"))
        info_rows.append(fmt("Subject Enrolled", "subject"))
        info_rows.append(fmt("Boarding / Hostel", "boarding"))
        info_rows.append(fmt("Zakat Eligible Status", "is_zakat_eligible"))
        info_rows.append(fmt("Usmania Academy School", "is_academy_student"))
        if record_data.get("assigned_teacher_name"):
            info_rows.append([Paragraph("Assigned Teacher:", label_style), Paragraph(str(record_data.get("assigned_teacher_name")), ParagraphStyle('UT', parent=value_style, fontName='Helvetica-Bold', textColor=PRIMARY_GREEN))])
    else:
        info_rows.append(fmt("Subject Taught", "subject"))

    info_table = Table(info_rows, colWidths=[1.8 * inch, 3.8 * inch])
    info_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
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
    story.append(Spacer(1, 0.15 * inch))

    # 4. Institutional & Address Box
    add_rows = [
        [Paragraph("Current Address", label_style), Paragraph(str(record_data.get('current_address', 'N/A')), value_style)],
        [Paragraph("Permanent Address", label_style), Paragraph(str(record_data.get('permanent_address', 'N/A')), value_style)],
        [Paragraph("City / District", label_style), Paragraph(str(record_data.get('city', 'N/A')), value_style)],
        [Paragraph("Country", label_style), Paragraph(str(record_data.get('country', 'Pakistan')), value_style)],
        [Paragraph("Current Institution", label_style), Paragraph(str(record_data.get('institution', 'Jamia Usmania')), value_style)],
        [Paragraph("Previous Institute", label_style), Paragraph(str(record_data.get('previous_institute', 'N/A')), value_style)],
    ]
    add_table = Table(add_rows, colWidths=[1.8 * inch, 5.7 * inch])
    add_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 5),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.white),
    ]))
    story.append(add_table)
    story.append(Spacer(1, 0.35 * inch))

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
    story.append(Spacer(1, 0.2 * inch))

    # Footer note
    footer_text = Paragraph(
        "<i>This document is an electronically generated official record of Jamia Usmania Trust. For verification or updates, contact the Trust Administration Office.</i>",
        ParagraphStyle('F', parent=styles['Normal'], fontSize=7.5, textColor=colors.gray, alignment=1)
    )
    story.append(footer_text)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

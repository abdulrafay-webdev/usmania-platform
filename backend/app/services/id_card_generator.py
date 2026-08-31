import io
import os
import base64
import urllib.request
from PIL import Image as PILImage
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# ==================== 1. SHARED CONSTANTS & EXACT CR80 DIMENSIONS ====================
# Standard CR80 Card Dimensions: 3.375 in x 2.125 in (85.6mm x 54mm = 243pt x 153pt)
CARD_WIDTH = 3.375 * inch
CARD_HEIGHT = 2.125 * inch
HEADER_HEIGHT = 0.48 * inch
BODY_HEIGHT = CARD_HEIGHT - HEADER_HEIGHT  # 1.645 inch

# Brand Palette
PRIMARY_GREEN = colors.HexColor("#145A32")
ACCENT_CREAM = colors.HexColor("#FDF6E3")
DARK_TEXT = colors.HexColor("#1F2937")
MUTED_GRAY = colors.HexColor("#64748B")
LIGHT_BG = colors.HexColor("#FAFCF8")
BORDER_COLOR = colors.HexColor("#145A32")
GOLD_ACCENT = colors.HexColor("#B45309")
BORDER_SUBTLE = colors.HexColor("#CBD5E1")

styles = getSampleStyleSheet()

doc_title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=13,
    textColor=PRIMARY_GREEN,
    alignment=1,
    leading=16
)

# Header Styles (White Header with Green & Gold typography)
header_title_style = ParagraphStyle(
    'CardHeaderTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=9.2,
    textColor=PRIMARY_GREEN,
    leading=10.5
)

header_subtitle_style = ParagraphStyle(
    'CardHeaderSub',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=5.8,
    textColor=GOLD_ACCENT,
    leading=7.0
)

card_name_style = ParagraphStyle(
    'CardName',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=8.6,
    textColor=PRIMARY_GREEN,
    leading=9.5
)

label_style = ParagraphStyle(
    'CardLabel',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=6.2,
    textColor=PRIMARY_GREEN,
    leading=7.5
)

value_style = ParagraphStyle(
    'CardValue',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=6.2,
    textColor=DARK_TEXT,
    leading=7.5
)

rule_style = ParagraphStyle(
    'CardRule',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=5.6,
    textColor=DARK_TEXT,
    leading=7.5
)

website_tagline_style = ParagraphStyle(
    'WebTag',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=5.8,
    textColor=PRIMARY_GREEN,
    leading=6.8
)

valid_thru_style = ParagraphStyle(
    'ValidThru',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=5.6,
    textColor=MUTED_GRAY,
    alignment=2,
    leading=6.8
)

def truncate_text(text: str, max_chars: int = 25) -> str:
    """Safety helper to prevent long text from overflowing fixed CR80 card dimensions."""
    if not text:
        return ""
    text_str = str(text).strip()
    if len(text_str) > max_chars:
        return text_str[:max_chars - 2] + ".."
    return text_str

def get_logo_path() -> str:
    """Finds the logo path from multiple possible locations."""
    possible_paths = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "logo.png")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "logo.png")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "public", "images", "logo.png")),
        os.path.abspath("D:/jamia usmania/platform/frontend/public/images/logo.png"),
        os.path.abspath("frontend/public/images/logo.png"),
        os.path.abspath("public/images/logo.png"),
    ]
    for p in possible_paths:
        if os.path.exists(p):
            return p
    return ""

def get_logo_flowable(width=0.42*inch, height=0.42*inch):
    """Loads larger, high-resolution trust logo image on clean white background."""
    logo_path = get_logo_path()
    if logo_path:
        try:
            return Image(logo_path, width=width, height=height)
        except Exception:
            pass
    return None

def get_watermark_flowable(width=1.35*inch, height=1.35*inch, opacity=0.12):
    """Generates a subtle, low-opacity watermark of the trust emblem for the card back."""
    logo_path = get_logo_path()
    if not logo_path:
        return None
    try:
        im = PILImage.open(logo_path).convert('RGBA')
        r, g, b, a = im.split()
        a = a.point(lambda p: int(p * opacity))
        im_watermark = PILImage.merge('RGBA', (r, g, b, a))
        buf = io.BytesIO()
        im_watermark.save(buf, format='PNG')
        buf.seek(0)
        return Image(buf, width=width, height=height)
    except Exception:
        return None

def fetch_photo_flowable(image_url: str, width=0.74*inch, height=0.88*inch):
    """Downloads or decodes candidate photo for ReportLab."""
    if not image_url:
        return None
    try:
        if image_url.startswith("data:image"):
            header, b64 = image_url.split(",", 1)
            img_bytes = base64.b64decode(b64)
            img_io = io.BytesIO(img_bytes)
            return Image(img_io, width=width, height=height)
        elif image_url.startswith("http://") or image_url.startswith("https://"):
            req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=4) as response:
                img_data = response.read()
            img_io = io.BytesIO(img_data)
            return Image(img_io, width=width, height=height)
        elif os.path.exists(image_url):
            return Image(image_url, width=width, height=height)
    except Exception:
        pass
    return None

def build_white_card_header(subtitle_text: str) -> Table:
    """
    Builds a modern, crisp WHITE background header with a large logo,
    rich green/gold typography, and dark green bottom accent divider.
    """
    logo_flow = get_logo_flowable(0.42 * inch, 0.42 * inch)

    h_text = Table([
        [Paragraph("JAMIA USMANIA TRUST", header_title_style)],
        [Paragraph(subtitle_text, header_subtitle_style)],
        [Paragraph("www.usmaniatrust.org", ParagraphStyle('HWeb', parent=header_subtitle_style, fontSize=5.0, textColor=PRIMARY_GREEN))]
    ], colWidths=[2.75 * inch], rowHeights=[0.18 * inch, 0.13 * inch, 0.11 * inch])
    h_text.setStyle(TableStyle([
        ('PADDING', (0, 0), (-1, -1), 0),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    if logo_flow:
        hdr_table = Table([[logo_flow, h_text]], colWidths=[0.48 * inch, 2.895 * inch], rowHeights=[HEADER_HEIGHT])
    else:
        hdr_table = Table([[h_text]], colWidths=[CARD_WIDTH], rowHeights=[HEADER_HEIGHT])

    hdr_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('LINEBELOW', (0, 0), (-1, -1), 1.2, PRIMARY_GREEN),
    ]))
    return hdr_table

def build_front_card(record_data: dict, record_type: str) -> Table:
    """Builds Front ID Card locked to EXACT CR80 size (3.375 in x 2.125 in)."""
    hdr_table = build_white_card_header(f"OFFICIAL {record_type.upper()} IDENTITY CARD")

    # Photo Frame + Roll No Underneath
    photo_obj = fetch_photo_flowable(record_data.get('picture', ''), 0.74 * inch, 0.86 * inch)
    if not photo_obj:
        photo_cell = Paragraph("<b>[ PHOTO ]</b>", ParagraphStyle('P', parent=label_style, alignment=1, fontSize=5.5))
    else:
        photo_cell = photo_obj

    photo_box = Table([[photo_cell]], colWidths=[0.76 * inch], rowHeights=[0.88 * inch])
    photo_box.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1.0, PRIMARY_GREEN),
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 1),
    ]))

    # Roll No pill badge under photo
    r_no_str = record_data.get('roll_no', 'N/A')
    roll_badge = Table([[
        Paragraph(f"<b>{truncate_text(r_no_str, 13)}</b>", ParagraphStyle('RB', parent=value_style, fontName='Helvetica-Bold', fontSize=5.5, textColor=colors.white, alignment=1))
    ]], colWidths=[0.76 * inch], rowHeights=[0.16 * inch])
    roll_badge.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY_GREEN),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 0),
    ]))

    photo_column = Table([[photo_box], [roll_badge]], colWidths=[0.78 * inch], rowHeights=[0.90 * inch, 0.18 * inch])
    photo_column.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 0),
    ]))

    # Front Key-Value Rows
    name = truncate_text(record_data.get('name', 'N/A'), 20)
    father = truncate_text(record_data.get('father_name') or record_data.get('father_guardian_name', 'N/A'), 22)
    cnic = truncate_text(record_data.get('nic', 'N/A'), 17)
    phone = truncate_text(record_data.get('contact', 'N/A'), 15)
    hijri = truncate_text(record_data.get('islamic_date', 'N/A'), 20)

    fields = [
        [Paragraph("Name:", label_style), Paragraph(name, card_name_style)],
        [Paragraph("Father:", label_style), Paragraph(father, value_style)],
    ]

    if record_type == "Student":
        st_class = truncate_text(record_data.get('student_class', 'N/A'), 32)
        fields.append([Paragraph("Class:", label_style), Paragraph(st_class, value_style)])
        if record_data.get('assigned_teacher_name'):
            u_teacher = truncate_text(record_data.get('assigned_teacher_name'), 20)
            fields.append([Paragraph("Teacher:", label_style), Paragraph(u_teacher, ParagraphStyle('UT', parent=value_style, fontName='Helvetica-Bold', textColor=PRIMARY_GREEN))])
    elif record_type == "Staff":
        desig = truncate_text(record_data.get('designation', 'Staff'), 18)
        fields.append([Paragraph("Role / Desig:", label_style), Paragraph(desig, value_style)])
    else:
        subj = truncate_text(record_data.get('subject', 'N/A'), 18)
        fields.append([Paragraph("Subject:", label_style), Paragraph(subj, value_style)])

    fields.append([Paragraph("CNIC:", label_style), Paragraph(cnic, value_style)])
    fields.append([Paragraph("Phone:", label_style), Paragraph(phone, value_style)])
    fields.append([Paragraph("Hijri Date:", label_style), Paragraph(hijri, value_style)])

    t_fields = Table(fields, colWidths=[0.58 * inch, 1.85 * inch])
    t_fields.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0.5),
        ('TOPPADDING', (0, 0), (-1, -1), 0.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 1),
        ('RIGHTPADDING', (0, 0), (-1, -1), 1),
    ]))

    info_row_block = Table([[photo_column, t_fields]], colWidths=[0.82 * inch, 2.535 * inch], rowHeights=[1.22 * inch])
    info_row_block.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
    ]))

    # Divider Line
    divider = Table([[""]], colWidths=[CARD_WIDTH], rowHeights=[0.02 * inch])
    divider.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY_GREEN),
        ('PADDING', (0, 0), (-1, -1), 0),
    ]))

    # Footer Strip: Left Website URL, Right Valid Thru
    footer_strip = Table([
        [
            Paragraph("🌐 www.usmaniatrust.org", website_tagline_style),
            Paragraph("Valid Thru: 2026–2027", valid_thru_style)
        ]
    ], colWidths=[1.80 * inch, 1.575 * inch], rowHeights=[0.16 * inch])
    footer_strip.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 1),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))

    front_body = Table([[info_row_block], [divider], [footer_strip]], colWidths=[CARD_WIDTH], rowHeights=[1.24 * inch, 0.03 * inch, 0.17 * inch])
    front_body.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 0),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))

    front_card = Table([[hdr_table], [front_body]], colWidths=[CARD_WIDTH], rowHeights=[HEADER_HEIGHT, BODY_HEIGHT])
    front_card.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1.2, PRIMARY_GREEN),
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('PADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    return front_card

def build_back_card() -> Table:
    """
    Builds Back ID Card locked to EXACT CR80 size (3.375 in x 2.125 in)
    with a subtle central logo watermark, official rules, helpline,
    website, and a generous signature space for physical signing & stamping.
    """
    hdr_table = build_white_card_header("CAMPUS RULES & OFFICIAL INSTRUCTIONS")

    # Watermark background image
    watermark_img = get_watermark_flowable(1.20 * inch, 1.20 * inch, opacity=0.10)

    rules_content = [
        [Paragraph("<b>1. Card Mandate:</b> Must be displayed inside campus at all times.", rule_style)],
        [Paragraph("<b>2. Non-Transferable:</b> Property of Jamia Usmania Trust.", rule_style)],
        [Paragraph("<b>3. Loss Report:</b> Report lost cards immediately to admin office.", rule_style)],
        [Paragraph("<b>4. Helpline & Email:</b> +92 300 1234567 | <b>jamiausmaniatrust1994@gmail.com</b>", rule_style)],
        [Paragraph("<b>5. Official Website:</b> www.usmaniatrust.org", rule_style)],
    ]

    t_rules = Table(rules_content, colWidths=[3.25 * inch], rowHeights=[0.17 * inch, 0.17 * inch, 0.17 * inch, 0.18 * inch, 0.16 * inch])
    t_rules.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 1.0),
    ]))

    # Generous Space for Signature & Trustee Seal (0.55 inch height)
    sig_content = [
        [
            Paragraph("<font size=5.5 color='#64748B'>Issued: 2026–2027<br/>Karachi, Pakistan</font>", ParagraphStyle('LeftDate', parent=value_style, fontSize=5.5)),
            Paragraph("<br/><br/>___________________________<br/><b>Authorized Officer / Trustee Seal</b>", ParagraphStyle('Sig', parent=value_style, alignment=1, fontSize=5.8, textColor=PRIMARY_GREEN))
        ]
    ]

    sig_box = Table(sig_content, colWidths=[1.35 * inch, 1.90 * inch], rowHeights=[0.55 * inch])
    sig_box.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'BOTTOM'),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('LINEABOVE', (0, 0), (-1, -1), 0.5, BORDER_SUBTLE),
    ]))

    back_body = Table([[t_rules], [sig_box]], colWidths=[CARD_WIDTH], rowHeights=[0.90 * inch, 0.55 * inch])
    back_body.setStyle(TableStyle([
        ('PADDING', (0, 0), (-1, -1), 2),
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 3),
        ('RIGHTPADDING', (0, 0), (-1, -1), 3),
    ]))

    back_card = Table([[hdr_table], [back_body]], colWidths=[CARD_WIDTH], rowHeights=[HEADER_HEIGHT, BODY_HEIGHT])
    back_card.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1.2, PRIMARY_GREEN),
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('PADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
    ]))
    return back_card

def generate_id_card_pdf(record_data: dict, record_type: str = "Student") -> bytes:
    """
    Generates a Single-Page printable document rendering BOTH Front and Back ID Cards
    side-by-side with locked, pixel-identical CR80 dimensions (3.375 in x 2.125 in).
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.35 * inch,
        leftMargin=0.35 * inch,
        topMargin=0.40 * inch,
        bottomMargin=0.40 * inch
    )

    story = []

    # Document Header Title
    story.append(Paragraph("<b>JAMIA USMANIA TRUST — OFFICIAL IDENTITY CARD</b>", doc_title_style))
    story.append(Paragraph("<font size=7.5 color='#64748B'>Printable Card Sheet • Locked CR80 Standard Size (3.375 in x 2.125 in) • 85.6mm × 54mm</font>", ParagraphStyle('Sub', parent=doc_title_style, alignment=1, fontSize=7.5)))
    story.append(Spacer(1, 0.20 * inch))

    # Build Front and Back Cards
    front_card = build_front_card(record_data, record_type)
    back_card = build_back_card()

    # Shared Labels for Front & Back
    card_label_style = ParagraphStyle('L', parent=header_title_style, textColor=PRIMARY_GREEN, alignment=1, fontSize=9.5)

    master_grid = Table([
        [
            Paragraph("<b>FRONT SIDE</b>", card_label_style),
            Paragraph("", ParagraphStyle('Gap')),
            Paragraph("<b>BACK SIDE</b>", card_label_style)
        ],
        [
            front_card,
            Paragraph("", ParagraphStyle('Gap')),
            back_card
        ]
    ], colWidths=[CARD_WIDTH, 0.35 * inch, CARD_WIDTH], rowHeights=[0.25 * inch, CARD_HEIGHT])

    master_grid.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 0),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))

    story.append(master_grid)

    doc.build(story)
    buffer.seek(0)
    return buffer.getvalue()

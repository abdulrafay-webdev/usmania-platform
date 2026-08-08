import io
import os
import base64
import urllib.request
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

# ==================== 1. SHARED CONSTANTS & EXACT CR80 DIMENSIONS ====================
# Standard CR80 Card Dimensions: 3.375 in x 2.125 in (85.6mm x 54mm = 243pt x 153pt)
CARD_WIDTH = 3.375 * inch
CARD_HEIGHT = 2.125 * inch
HEADER_HEIGHT = 0.42 * inch
BODY_HEIGHT = CARD_HEIGHT - HEADER_HEIGHT  # 1.705 inch

# Brand Palette (Strict Color Consistency)
PRIMARY_GREEN = colors.HexColor("#145A32")
ACCENT_CREAM = colors.HexColor("#FDF6E3")
DARK_TEXT = colors.HexColor("#1F2937")
MUTED_GRAY = colors.HexColor("#64748B")
LIGHT_BG = colors.HexColor("#FAF5EA")
BORDER_COLOR = colors.HexColor("#145A32")

# Font Sizes & Styles
FONT_TITLE_SIZE = 8.5
FONT_SUBTITLE_SIZE = 5.8
FONT_NAME_SIZE = 8.2
FONT_LABEL_SIZE = 6.2
FONT_VALUE_SIZE = 6.2
FONT_RULE_SIZE = 5.8

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

header_title_style = ParagraphStyle(
    'CardHeaderTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=FONT_TITLE_SIZE,
    textColor=colors.white,
    leading=9.5
)

header_subtitle_style = ParagraphStyle(
    'CardHeaderSub',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=FONT_SUBTITLE_SIZE,
    textColor=ACCENT_CREAM,
    leading=7.0
)

card_name_style = ParagraphStyle(
    'CardName',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=FONT_NAME_SIZE,
    textColor=PRIMARY_GREEN,
    leading=9.0
)

label_style = ParagraphStyle(
    'CardLabel',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=FONT_LABEL_SIZE,
    textColor=PRIMARY_GREEN,
    leading=7.5
)

value_style = ParagraphStyle(
    'CardValue',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=FONT_VALUE_SIZE,
    textColor=DARK_TEXT,
    leading=7.5
)

rule_style = ParagraphStyle(
    'CardRule',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=FONT_RULE_SIZE,
    textColor=DARK_TEXT,
    leading=8.0
)

website_tagline_style = ParagraphStyle(
    'WebTag',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=6.0,
    textColor=PRIMARY_GREEN,
    leading=7.0
)

valid_thru_style = ParagraphStyle(
    'ValidThru',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=5.8,
    textColor=MUTED_GRAY,
    alignment=2, # Right aligned
    leading=7.0
)

def truncate_text(text: str, max_chars: int = 24) -> str:
    """Safety helper to prevent long text from overflowing fixed CR80 card dimensions."""
    if not text:
        return ""
    text_str = str(text).strip()
    if len(text_str) > max_chars:
        return text_str[:max_chars - 2] + ".."
    return text_str

def get_logo_flowable(width=0.30*inch, height=0.30*inch):
    """Loads trust logo image from frontend/public/images/logo.png or fallback."""
    possible_paths = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "frontend", "public", "images", "logo.png")),
        os.path.abspath("D:/jamia usmania/platform/frontend/public/images/logo.png"),
        os.path.abspath("../frontend/public/images/logo.png"),
    ]

    for p in possible_paths:
        if os.path.exists(p):
            try:
                return Image(p, width=width, height=height)
            except Exception:
                pass
    return None

def get_logo_badge(size=0.28*inch):
    """Wraps logo in a white circular/rounded box with border for high contrast against green header."""
    logo_img = get_logo_flowable(size, size)
    if not logo_img:
        return None

    badge = Table([[logo_img]], colWidths=[size + 0.04*inch], rowHeights=[size + 0.04*inch])
    badge.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('BOX', (0, 0), (-1, -1), 0.8, PRIMARY_GREEN),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 1),
    ]))
    return badge

def fetch_photo_flowable(image_url: str, width=0.75*inch, height=0.95*inch):
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

def build_card_header(subtitle_text: str) -> Table:
    """Builds a locked header table matching exact CARD_WIDTH (3.375 in) & HEADER_HEIGHT (0.42 in)."""
    h_text = Table([
        [Paragraph("JAMIA USMANIA TRUST", header_title_style)],
        [Paragraph(subtitle_text, header_subtitle_style)]
    ], colWidths=[2.85 * inch], rowHeights=[0.19 * inch, 0.14 * inch])
    h_text.setStyle(TableStyle([
        ('PADDING', (0, 0), (-1, -1), 0),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))

    badge = get_logo_badge(0.28 * inch)
    if badge:
        hdr_table = Table([[badge, h_text]], colWidths=[0.42 * inch, 2.955 * inch], rowHeights=[HEADER_HEIGHT])
    else:
        hdr_table = Table([[h_text]], colWidths=[CARD_WIDTH], rowHeights=[HEADER_HEIGHT])

    hdr_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY_GREEN),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ]))
    return hdr_table

def build_front_card(record_data: dict, record_type: str) -> Table:
    """Builds Front ID Card locked to EXACT CR80 size (3.375 in x 2.125 in) spanning full width."""
    hdr_table = build_card_header(f"OFFICIAL {record_type.upper()} IDENTITY CARD")

    # Photo Frame
    photo_obj = fetch_photo_flowable(record_data.get('picture', ''), 0.75 * inch, 0.95 * inch)
    if not photo_obj:
        photo_cell = Paragraph("<b>[ PHOTO ]</b>", ParagraphStyle('P', parent=label_style, alignment=1, fontSize=5.5))
    else:
        photo_cell = photo_obj

    photo_box = Table([[photo_cell]], colWidths=[0.78 * inch], rowHeights=[0.98 * inch])
    photo_box.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 1.0, PRIMARY_GREEN),
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 1),
    ]))

    # Front Key-Value Rows (Strict 2-Column Alignment spanning full width)
    r_no = truncate_text(record_data.get('roll_no', 'N/A'), 15)
    name = truncate_text(record_data.get('name', 'N/A'), 20)
    father = truncate_text(record_data.get('father_guardian_name', 'N/A'), 22)
    cnic = truncate_text(record_data.get('nic', 'N/A'), 17)
    phone = truncate_text(record_data.get('contact', 'N/A'), 15)
    hijri = truncate_text(record_data.get('islamic_date', 'N/A'), 20)

    fields = [
        [Paragraph("Roll No:", label_style), Paragraph(f"<b>{r_no}</b>", ParagraphStyle('R', parent=value_style, fontName='Helvetica-Bold', textColor=PRIMARY_GREEN))],
        [Paragraph("Name:", label_style), Paragraph(name, card_name_style)],
        [Paragraph("Father:", label_style), Paragraph(father, value_style)],
    ]

    if record_type == "Student":
        st_class = truncate_text(record_data.get('student_class', 'N/A'), 18)
        fields.append([Paragraph("Class:", label_style), Paragraph(st_class, value_style)])
        if record_data.get('assigned_teacher_name'):
            u_teacher = truncate_text(record_data.get('assigned_teacher_name'), 20)
            fields.append([Paragraph("Teacher:", label_style), Paragraph(u_teacher, ParagraphStyle('UT', parent=value_style, fontName='Helvetica-Bold', textColor=PRIMARY_GREEN))])
    else:
        subj = truncate_text(record_data.get('subject', 'N/A'), 18)
        fields.append([Paragraph("Subject:", label_style), Paragraph(subj, value_style)])

    fields.append([Paragraph("CNIC:", label_style), Paragraph(cnic, value_style)])
    fields.append([Paragraph("Phone:", label_style), Paragraph(phone, value_style)])
    fields.append([Paragraph("Hijri Date:", label_style), Paragraph(hijri, value_style)])

    t_fields = Table(fields, colWidths=[0.60 * inch, 1.85 * inch])
    t_fields.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0.5),
        ('TOPPADDING', (0, 0), (-1, -1), 0.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 1),
        ('RIGHTPADDING', (0, 0), (-1, -1), 1),
    ]))

    info_row_block = Table([[photo_box, t_fields]], colWidths=[0.85 * inch, 2.525 * inch], rowHeights=[1.25 * inch])
    info_row_block.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 2),
        ('RIGHTPADDING', (0, 0), (-1, -1), 2),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2),
        ('BACKGROUND', (0, 0), (-1, -1), colors.white),
    ]))

    # Thin Dark Green Divider Line (Spanning Full Width 3.375 in)
    divider = Table([[""]], colWidths=[CARD_WIDTH], rowHeights=[0.02 * inch])
    divider.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), PRIMARY_GREEN),
        ('PADDING', (0, 0), (-1, -1), 0),
    ]))

    # Footer Strip: Left Website URL, Right Valid Thru (Spanning Full Width 3.375 in)
    footer_strip = Table([
        [
            Paragraph("www.usmaniatrust.org", website_tagline_style),
            Paragraph("Valid Thru: 2026-2027", valid_thru_style)
        ]
    ], colWidths=[1.80 * inch, 1.575 * inch], rowHeights=[0.18 * inch])
    footer_strip.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 1),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))

    front_body = Table([[info_row_block], [divider], [footer_strip]], colWidths=[CARD_WIDTH], rowHeights=[1.30 * inch, 0.03 * inch, 0.22 * inch])
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
    """Builds Back ID Card locked to EXACT CR80 size (3.375 in x 2.125 in) spanning full width."""
    hdr_table = build_card_header("CAMPUS RULES & INSTRUCTIONS")

    rules_content = [
        [Paragraph("<b>1. Card Mandate:</b> Must be displayed inside campus at all times.", rule_style)],
        [Paragraph("<b>2. Non-Transferable:</b> Property of Jamia Usmania Trust.", rule_style)],
        [Paragraph("<b>3. Loss Report:</b> Report lost cards immediately to admin office.", rule_style)],
        [Paragraph("<b>4. Emergency:</b> Phone: +92 300 1234567 | usmaniatrust@gmail.com", rule_style)],
    ]

    t_rules = Table(rules_content, colWidths=[3.25 * inch], rowHeights=[0.24 * inch, 0.24 * inch, 0.24 * inch, 0.24 * inch])
    t_rules.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 1.5),
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, BORDER_COLOR),
    ]))

    sig_box = Table([
        [Paragraph("___________________________<br/><b>Authorized Officer / Trustee Seal</b>", ParagraphStyle('S', parent=value_style, alignment=1, fontSize=5.8))]
    ], colWidths=[3.25 * inch], rowHeights=[0.45 * inch])
    sig_box.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))

    back_body = Table([[t_rules], [sig_box]], colWidths=[CARD_WIDTH], rowHeights=[1.10 * inch, 0.50 * inch])
    back_body.setStyle(TableStyle([
        ('PADDING', (0, 0), (-1, -1), 2),
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_BG),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
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
    story.append(Paragraph("<font size=7.5 color='#64748B'>Printable Card Sheet • Locked CR80 Standard Size (3.375 in x 2.125 in)</font>", ParagraphStyle('Sub', parent=doc_title_style, alignment=1, fontSize=7.5)))
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

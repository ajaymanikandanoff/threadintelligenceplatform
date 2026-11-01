"""
Threat Intelligence PDF Report Generator
Generates an official, publication-grade SOC Cyber Threat Intelligence Dossier (PDF)
from analyzed threat reports, IOC extractions, and MITRE ATT&CK mappings using ReportLab.
"""

import io
from datetime import datetime, timezone
from typing import Dict, Any, List

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

# --- COLOR DEFINITIONS ---
CLR_DARK_BG   = colors.HexColor('#0B111E')
CLR_NAVY      = colors.HexColor('#0F172A')
CLR_CYAN      = colors.HexColor('#0284C7')
CLR_CYAN_LGT  = colors.HexColor('#00E5FF')
CLR_RED       = colors.HexColor('#E11D48')
CLR_AMBER     = colors.HexColor('#D97706')
CLR_GREEN     = colors.HexColor('#059669')
CLR_TEXT_DARK = colors.HexColor('#1E293B')
CLR_MUTED     = colors.HexColor('#64748B')
CLR_LIGHT_BG  = colors.HexColor('#F8FAFC')
CLR_BORDER    = colors.HexColor('#E2E8F0')

class NumberedCanvas(canvas.Canvas):
    """Two-pass canvas to dynamically compute and draw total page count and footer."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_decorations(self, page_count):
        self.saveState()
        # Top running header
        self.setFont('Helvetica-Bold', 7)
        self.setFillColor(CLR_CYAN)
        self.drawString(36, 762, 'THREATLENS CYBER THREAT INTELLIGENCE PLATFORM')
        self.setFont('Helvetica', 7)
        self.setFillColor(CLR_MUTED)
        self.drawRightString(576, 762, 'TLP:AMBER // RESTRICTED DISTRIBUTION')
        
        # Header separator line
        self.setStrokeColor(CLR_BORDER)
        self.setLineWidth(0.5)
        self.line(36, 756, 576, 756)

        # Bottom footer
        self.line(36, 32, 576, 32)
        self.setFont('Helvetica', 7.5)
        self.setFillColor(CLR_MUTED)
        self.drawString(36, 22, 'CONFIDENTIAL // PRODUCED BY THREATLENS CTI & TTPMAPPER ENGINE')
        self.drawRightString(576, 22, f'Page {self._pageNumber} of {page_count}')
        self.restoreState()


def generate_pdf_report(data: Dict[str, Any]) -> bytes:
    """
    Builds a professional multi-page Threat Intelligence Dossier (PDF).
    Returns PDF content as raw binary bytes.
    """
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=46,
        bottomMargin=46
    )

    base_styles = getSampleStyleSheet()

    # Custom Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=base_styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=CLR_NAVY
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=base_styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=CLR_MUTED
    )
    h1_style = ParagraphStyle(
        'SectionH1',
        parent=base_styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=15,
        textColor=CLR_NAVY,
        spaceBefore=14,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'BodyDark',
        parent=base_styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=CLR_TEXT_DARK
    )
    evidence_style = ParagraphStyle(
        'EvidenceSnippet',
        parent=base_styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#334155')
    )
    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=base_styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.white
    )
    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=base_styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=CLR_TEXT_DARK
    )
    table_mono_style = ParagraphStyle(
        'TableMono',
        parent=base_styles['Normal'],
        fontName='Courier',
        fontSize=7.5,
        leading=10,
        textColor=CLR_TEXT_DARK
    )

    story = []

    filename = data.get("filename") or data.get("target") or "Threat_Intelligence_Advisory.pdf"
    risk_score = data.get("risk_score", 0)
    severity = data.get("severity", "Medium severity")
    now_str = datetime.now(timezone.utc).strftime("%d %B %Y %H:%M:%S UTC")

    # Determine risk badge color
    score_color = CLR_RED if risk_score >= 80 else (CLR_AMBER if risk_score >= 50 else CLR_GREEN)

    # ─── 1. COVER HEADER & METADATA TABLE ───
    story.append(Paragraph("CYBER THREAT INTELLIGENCE ADVISORY DOSSIER", title_style))
    story.append(Spacer(1, 3))
    story.append(Paragraph(f"Official Adversary Attribution & MITRE ATT&CK Technical Analysis // Target: <b>{filename}</b>", subtitle_style))
    story.append(Spacer(1, 10))

    meta_data = [
        [
            Paragraph("<b>Target Document:</b>", body_style),
            Paragraph(filename, body_style),
            Paragraph("<b>Threat Classification:</b>", body_style),
            Paragraph(f"<font color='{score_color.hexval()}'><b>{severity.upper()} ({risk_score}/100)</b></font>", body_style)
        ],
        [
            Paragraph("<b>Published Date:</b>", body_style),
            Paragraph(now_str, body_style),
            Paragraph("<b>Distribution Tag:</b>", body_style),
            Paragraph("<font color='#D97706'><b>TLP:AMBER+STRICT // RESTRICTED</b></font>", body_style)
        ],
        [
            Paragraph("<b>Analysis Pipeline:</b>", body_style),
            Paragraph("TTPMapper MITRE v15 Engine", body_style),
            Paragraph("<b>Document Scope:</b>", body_style),
            Paragraph(f"{data.get('total_pages', 1)} Page(s) • {data.get('total_characters', 0):,} Characters", body_style)
        ]
    ]

    t_meta = Table(meta_data, colWidths=[100, 170, 110, 160])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), CLR_LIGHT_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, CLR_BORDER),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, CLR_BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 12))

    # ─── 2. EXECUTIVE SUMMARY ───
    story.append(Paragraph("1. Executive Intelligence Summary", h1_style))
    summary_text = data.get("executive_summary") or "Comprehensive threat assessment generated from structured telemetry."
    story.append(Paragraph(summary_text, body_style))
    story.append(Spacer(1, 10))

    # ─── 3. THREAT ACTORS & MALWARE ───
    actors = data.get("threat_actors", [])
    malware = data.get("malware_families", [])

    if actors or malware:
        story.append(Paragraph("2. Threat Actor Attribution & Tooling", h1_style))

        if actors:
            actor_rows = [[
                Paragraph("Adversary Name", table_header_style),
                Paragraph("Origin", table_header_style),
                Paragraph("Targeted Sectors", table_header_style),
                Paragraph("Confidence", table_header_style)
            ]]
            for a in actors:
                actor_rows.append([
                    Paragraph(f"<b>{a.get('name', 'Unknown')}</b>", table_cell_style),
                    Paragraph(a.get("origin", "Undetermined"), table_cell_style),
                    Paragraph(", ".join(a.get("target_sectors", [])) or "Cross-industry", table_cell_style),
                    Paragraph(f"<b>{a.get('confidence', 90)}%</b>", table_cell_style)
                ])

            t_actors = Table(actor_rows, colWidths=[120, 90, 250, 80])
            t_actors.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), CLR_NAVY),
                ('BOX', (0, 0), (-1, -1), 0.5, CLR_BORDER),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, CLR_LIGHT_BG]),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(t_actors)
            story.append(Spacer(1, 8))

        if malware:
            mal_rows = [[
                Paragraph("Malware / Tool", table_header_style),
                Paragraph("Category", table_header_style),
                Paragraph("Operational Description", table_header_style)
            ]]
            for m in malware:
                mal_rows.append([
                    Paragraph(f"<b>{m.get('name')}</b>", table_cell_style),
                    Paragraph(m.get("category", "General"), table_cell_style),
                    Paragraph(m.get("description", ""), table_cell_style)
                ])
            t_mal = Table(mal_rows, colWidths=[110, 110, 320])
            t_mal.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1E293B')),
                ('BOX', (0, 0), (-1, -1), 0.5, CLR_BORDER),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, CLR_LIGHT_BG]),
                ('TOPPADDING', (0, 0), (-1, -1), 4),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ]))
            story.append(t_mal)
            story.append(Spacer(1, 10))

    # ─── 4. MITRE ATT&CK ENTERPRISE MATRIX MAPPINGS ───
    mitre_list = data.get("mitre_mappings") or data.get("mitre_techniques") or []
    if mitre_list:
        story.append(Paragraph("3. MITRE ATT&CK Behavioral Technique Mapping", h1_style))
        story.append(Paragraph(
            "Techniques verified against MITRE Enterprise Matrix v15. Mappings distinguish between explicit document facts and behavioral inferences.",
            subtitle_style
        ))
        story.append(Spacer(1, 6))

        mitre_rows = [[
            Paragraph("TID", table_header_style),
            Paragraph("Technique Name", table_header_style),
            Paragraph("Tactic", table_header_style),
            Paragraph("Evidence Type", table_header_style),
            Paragraph("Conf.", table_header_style)
        ]]

        for t in mitre_list:
            is_fact = t.get("type") == "Explicit Report Fact"
            type_color = CLR_GREEN if is_fact else CLR_AMBER

            mitre_rows.append([
                Paragraph(f"<b>{t.get('id')}</b>", table_mono_style),
                Paragraph(t.get("name", ""), table_cell_style),
                Paragraph(t.get("tactic", ""), table_cell_style),
                Paragraph(f"<font color='{type_color.hexval()}'><b>{t.get('type', 'Inference')}</b></font>", table_cell_style),
                Paragraph(f"{t.get('confidence', 80)}%", table_cell_style)
            ])

        t_mitre = Table(mitre_rows, colWidths=[65, 175, 130, 120, 50])
        t_mitre.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), CLR_NAVY),
            ('BOX', (0, 0), (-1, -1), 0.5, CLR_BORDER),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, CLR_LIGHT_BG]),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ]))
        story.append(t_mitre)
        story.append(Spacer(1, 10))

    # ─── 5. EXTRACTED INDICATORS OF COMPROMISE (IOCs) ───
    iocs = data.get("iocs", {})
    ipv4_list = iocs.get("ipv4", []) if isinstance(iocs, dict) else []
    dom_list = iocs.get("domains", []) if isinstance(iocs, dict) else []
    url_list = iocs.get("urls", []) if isinstance(iocs, dict) else []
    sha256_list = (iocs.get("hashes", {}).get("sha256", []) if isinstance(iocs, dict) and isinstance(iocs.get("hashes"), dict) else [])
    cve_list = iocs.get("cves", []) if isinstance(iocs, dict) else []

    has_iocs = bool(ipv4_list or dom_list or url_list or sha256_list or cve_list)

    if has_iocs:
        story.append(Paragraph("4. Extracted Indicators of Compromise (IoCs)", h1_style))
        story.append(Paragraph(
            "Cryptographically defanged and correlated against available threat feeds with page-level attribution.",
            subtitle_style
        ))
        story.append(Spacer(1, 6))

        ioc_rows = [[
            Paragraph("Type", table_header_style),
            Paragraph("Indicator Value", table_header_style),
            Paragraph("Source Page", table_header_style),
            Paragraph("Confidence", table_header_style)
        ]]

        for ip in ipv4_list[:12]:
            ioc_rows.append([
                Paragraph("<b>IPv4 Address</b>", table_cell_style),
                Paragraph(ip.get("value", ""), table_mono_style),
                Paragraph(f"Page {ip.get('page', 1)}", table_cell_style),
                Paragraph(f"{ip.get('confidence', 95)}%", table_cell_style)
            ])

        for d in dom_list[:10]:
            ioc_rows.append([
                Paragraph("<b>Domain FQDN</b>", table_cell_style),
                Paragraph(d.get("value", ""), table_mono_style),
                Paragraph(f"Page {d.get('page', 1)}", table_cell_style),
                Paragraph(f"{d.get('confidence', 95)}%", table_cell_style)
            ])

        for u in url_list[:8]:
            ioc_rows.append([
                Paragraph("<b>URL</b>", table_cell_style),
                Paragraph(u.get("value", "")[:55], table_mono_style),
                Paragraph(f"Page {u.get('page', 1)}", table_cell_style),
                Paragraph(f"{u.get('confidence', 90)}%", table_cell_style)
            ])

        for h in sha256_list[:6]:
            ioc_rows.append([
                Paragraph("<b>SHA-256 Hash</b>", table_cell_style),
                Paragraph(h.get("value", ""), table_mono_style),
                Paragraph(f"Page {h.get('page', 1)}", table_cell_style),
                Paragraph(f"{h.get('confidence', 99)}%", table_cell_style)
            ])

        for c in cve_list[:8]:
            ioc_rows.append([
                Paragraph("<b>CVE Flaw</b>", table_cell_style),
                Paragraph(c.get("value", ""), table_mono_style),
                Paragraph(f"Page {c.get('page', 1)}", table_cell_style),
                Paragraph(f"{c.get('confidence', 98)}%", table_cell_style)
            ])

        t_iocs = Table(ioc_rows, colWidths=[90, 290, 80, 80])
        t_iocs.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0284C7')),
            ('BOX', (0, 0), (-1, -1), 0.5, CLR_BORDER),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, CLR_LIGHT_BG]),
            ('TOPPADDING', (0, 0), (-1, -1), 3.5),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 3.5),
        ]))
        story.append(t_iocs)
        story.append(Spacer(1, 10))

    # ─── 6. STRATEGIC CONTAINMENT & DEFENSIVE ACTIONS ───
    rec_actions = data.get("recommended_actions", [])
    if rec_actions:
        story.append(Paragraph("5. Strategic Containment & Defensive Actions", h1_style))
        for idx, action in enumerate(rec_actions, 1):
            story.append(Paragraph(f"<b>[{idx}]</b> {action}", body_style))
            story.append(Spacer(1, 3))
        story.append(Spacer(1, 8))

    # Build the document with our NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    return buf.getvalue()


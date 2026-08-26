"""Generates the one-page HoneyChain concept note PDF.
Edit TEXT below and re-run: python gen_conceptnote.py"""
from fpdf import FPDF

AMBER = (180, 83, 9)
DARK  = (69, 42, 7)
CREAM = (255, 251, 235)
GREY  = (95, 85, 75)
LINE  = (230, 215, 190)
INK   = (40, 35, 30)

CONTACT_PHONE = "+91-877864603"
CONTACT_MAIL  = "nethajiramesh25@gmail.com"

class PDF(FPDF):
    def footer(self):
        self.set_y(-7)
        self.set_font("Helvetica", "I", 6.8)
        self.set_text_color(*GREY)
        self.cell(0, 4, "Team Vibranium - SIH 2026 - PS SIH26021 - Concept Note v1.2 - draft shared for expert review", align="C")

pdf = PDF("P", "mm", "A4")
pdf.set_auto_page_break(True, margin=11)
pdf.add_page()
W = pdf.w - pdf.l_margin - pdf.r_margin

# ---------- HEADER BAND ----------
pdf.set_fill_color(*DARK)
pdf.rect(pdf.l_margin, 8, W, 23, "F")
pdf.set_xy(pdf.l_margin + 4, 10.5)
pdf.set_font("Helvetica", "B", 19)
pdf.set_text_color(255, 243, 205)
pdf.cell(W - 8, 8, "HONEYCHAIN")
pdf.set_xy(pdf.l_margin + 4, 17.5)
pdf.set_font("Helvetica", "", 9)
pdf.set_text_color(255, 255, 255)
pdf.cell(W - 8, 5, "Farm-to-Jar Blockchain Traceability & Smart Beekeeping Platform")
pdf.set_xy(pdf.l_margin + 4, 23)
pdf.set_font("Helvetica", "B", 7.6)
pdf.cell(W - 8, 4,
    "Smart India Hackathon 2026  |  PS SIH26021  |  Ministry of MSME  |  Theme: Smart Automation  |  Software  |  Team Vibranium - SRM IST Chennai")

def section(title):
    pdf.ln(2.4)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*AMBER)
    pdf.set_draw_color(*AMBER); pdf.set_line_width(0.5)
    pdf.cell(0, 5, "  " + title, new_x="LMARGIN", new_y="NEXT", border="B")
    pdf.ln(1.1)

def bullet_in_col(x, y, w, lead, txt, size=8.0, lh=3.9):
    """Write '- <b>lead</b> txt' wrapped strictly inside column width w."""
    pdf.set_xy(x, y)
    pdf.set_font("Helvetica", "B", size); pdf.set_text_color(*INK)
    pdf.write(lh, "- " + lead + " ")
    pdf.set_font("Helvetica", "", size)
    # remaining width on current line
    used = pdf.get_x() - x
    rem_first = w - used
    pdf.multi_cell(w - used if rem_first > 10 else w, lh, txt, align="L")  # left-align: no justify rivers
    return pdf.get_y()

# move cursor clearly below the header band before first section
pdf.set_y(34)

# ---------- ROW 1: PROBLEM (left) + GAP TABLE (right) ----------
section("THE PROBLEM  -  INDIA'S HONEY TRUST DEFICIT")
col_gap = 6
col_w_l = W * 0.53
col_w_r = W - col_w_l - col_gap
xL, xR = pdf.l_margin, pdf.l_margin + col_w_l + col_gap
y_start = pdf.get_y()

problems = [
    ("World #2 honey exporter:", "USD 206 M exports FY25 (APEDA) - yet trade runs on distrust."),
    ("Purity crisis:", "CSE 2020 probe found top brands failing NMR tests; syrup blending is systemic."),
    ("Honest beekeepers lose:", "no provenance = commodity prices; export lots rejected abroad."),
    ("Gap today:", "Madhukranti registers beekeepers (24.9 lakh colonies) but cannot verify a retail jar."),
]
yy = y_start
for lead, txt in problems:
    yy = bullet_in_col(xL, yy, col_w_l, lead, txt) + 1.2
y_end_L = yy

# gap table (right column)
rows = [
    ("Capability", "Madhukranti", "Ours"),
    ("Registration & IDs", "Yes", "Integrates"),
    ("Tamper-proof custody", "No", "YES"),
    ("Consumer jar-QR check", "No", "YES"),
    ("Smart hive app", "No", "YES"),
    ("AI adulteration flags", "No", "YES"),
]
cw = [col_w_r * 0.52, col_w_r * 0.24, col_w_r * 0.24]
rh = 6.2
for r, row in enumerate(rows):
    ry = y_start + r * rh          # explicit row y -> rows never overlap
    for c, val in enumerate(row):
        pdf.set_xy(xR + sum(cw[:c]), ry)
        pdf.set_draw_color(*LINE); pdf.set_line_width(0.25)
        pdf.set_fill_color(*CREAM)
        style = "B" if (r == 0 or c == 2) else ""
        pdf.set_font("Helvetica", style, 7.6)
        pdf.set_text_color(*(AMBER if r == 0 else INK))
        pdf.cell(cw[c], rh, " " + val, border=1, fill=(r == 0), align="L")
y_end_R = y_start + len(rows) * rh
pdf.set_y(max(y_end_L, y_end_R))

# ---------- SOLUTION ----------
section("OUR SOLUTION")
pdf.set_font("Helvetica", "BI", 9)
pdf.set_text_color(*INK)
pdf.multi_cell(W, 4.6, '"Every honey jar carries a tamper-proof digital identity from apiary to shelf - verifiable by anyone with a single QR scan."')
pdf.ln(0.6)
modules = [
    ("1. Beekeeper App (Flutter)", "offline-first, Hindi/Tamil voice UI, GPS + photo harvest logs"),
    ("2. Blockchain Chain-of-Custody (Hyperledger Fabric)", "each handover signed by a different org key; immutable trail"),
    ("3. AI Anomaly Engine", "weight-physics checks expose syrup addition; disease + yield alerts"),
    ("4. FPO / Processor Console", "batch aggregation, payout transparency, compliance exports"),
    ("5. Consumer Trust Portal", "scan jar QR -> farm map, farmer profile, lab certificate, journey"),
]
for t, d in modules:
    pdf.set_font("Helvetica", "B", 8.1); pdf.write(3.9, t + " - ")
    pdf.set_font("Helvetica", "", 8.1); pdf.write(3.9, d + "\n")
pdf.ln(0.6)

# ---------- HOW IT WORKS ----------
section("HOW IT WORKS  -  ONE BATCH'S JOURNEY")
steps = [
    "Ravi harvests 42 kg mustard honey -> app creates Batch B-1042 with GPS, photo, date (works offline).",
    "Collection center weighs 42 kg, matches manifest, signs custody -> transaction locked forever.",
    "Processor shows 55 kg output -> AI physics check flags impossible gain = syrup added.",
    "NMR lab certificate attaches to batch lineage via the laboratory's own key.",
    "Buyer scans jar QR: farm map, Ravi's story, certificates, every hop dated. Trust the jar, not the label.",
]
for i, s in enumerate(steps, 1):
    pdf.set_font("Helvetica", "B", 8.1); pdf.write(3.9, f"{i}. ")
    pdf.set_font("Helvetica", "", 8.1); pdf.write(3.9, s + "\n")
pdf.ln(0.6)
pdf.set_font("Helvetica", "I", 7.8); pdf.set_text_color(*GREY)
pdf.multi_cell(W, 3.7, "Why blockchain? A database is editable by its owner. Here every hop is signed by a different organisation's key - nobody, not even we or an FPO, can rewrite history.")

# ---------- IMPACT BOXES ----------
section("IMPACT AT SCALE")
stats = [
    ("Rs 700 Cr+", "premium value unlocked per year at national scale"),
    ("+15-25%", "income uplift per beekeeping household"),
    ("24.9 Lakh", "colonies reachable via Madhukranti integration"),
]
bw = (W - 8) / 3
x0, y0 = pdf.l_margin, pdf.get_y() + 0.5
for i, (n, d) in enumerate(stats):
    bx = x0 + i * (bw + 4)
    pdf.set_fill_color(*CREAM); pdf.set_draw_color(*LINE); pdf.set_line_width(0.25)
    pdf.rect(bx, y0, bw, 13, "DF")
    pdf.set_xy(bx, y0 + 1)
    pdf.set_font("Helvetica", "B", 12); pdf.set_text_color(*AMBER)
    pdf.cell(bw, 5.2, n, align="C")
    pdf.set_xy(bx + 2, y0 + 6.6)
    pdf.set_font("Helvetica", "", 7.2); pdf.set_text_color(*GREY)
    pdf.multi_cell(bw - 4, 3.1, d, align="C")
pdf.set_y(y0 + 14.5)

# ---------- ALIGNMENT + ASK ----------
section("GOVERNMENT ALIGNMENT  &  WHAT WE ASK OF YOU")
asks = [
    ("Policy fit:", "executes NBHM objective (d) - blockchain traceability of honey sources - extends Madhukranti, complements KVIC Honey Mission."),
    ("Our ask:", "(1) a line of expert review we may cite; (2) validation of field-workflow assumptions; (3) guidance to pilot with one TN beekeeper society/FPO."),
]
yy = pdf.get_y()
for lead, txt in asks:
    yy = bullet_in_col(pdf.l_margin, yy, W, lead, txt) + 0.8

# ---------- CONTACT STRIP ----------
y0 = min(pdf.get_y() + 3.5, 276)   # right after content - no dead gap
pdf.set_fill_color(*DARK)
pdf.rect(pdf.l_margin, y0, W, 10.5, "F")
pdf.set_xy(pdf.l_margin + 3, y0 + 1.5)
pdf.set_font("Helvetica", "B", 8.2)
pdf.set_text_color(255, 243, 205)
pdf.cell(W - 6, 4, "Team Vibranium (6 members): AI/Full-stack  ·  Mobile Development  ·  Research, Documentation & Pitch", align="C")
pdf.set_xy(pdf.l_margin + 3, y0 + 5.6)
pdf.set_font("Helvetica", "", 8.2)
pdf.cell(W - 6, 4, "R. Nethaji - Team Leader   |   " + CONTACT_PHONE + "   |   " + CONTACT_MAIL, align="C")

out = r"C:\Users\R.NETHAJI\Downloads\SIH2026\teamvibranium2026\PS1_SIH26021_HoneyChain\HoneyChain_ConceptNote.pdf"
pdf.output(out)
print("Saved:", out, "| final page count:", pdf.page_no())

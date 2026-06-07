import docx
import re
from docx.oxml.ns import qn

file_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT CONS\RAPPORT DE CONSULTATION CMF.docx"
doc = docx.Document(file_path)

tb_texts = []
root = doc.element
for el in root.iter():
    if el.tag.endswith('txbxContent'):
        for p in el.findall(qn('w:p')):
            p_obj = docx.text.paragraph.Paragraph(p, doc)
            text = p_obj.text.strip()
            if text:
                tb_texts.append(text)

raw_reports = []
current_report = []
for text in tb_texts:
    if text.lower().startswith("patient") and ":" in text:
        if current_report:
            raw_reports.append(current_report)
        current_report = [text]
    else:
        current_report.append(text)
if current_report:
    raw_reports.append(current_report)

formats = {}
for report in raw_reports:
    # Look for titles (e.g. RAPPORT DE CONSULTATION, RAPPORT MEDICAL, etc.) in the first 3 lines
    for line in report[1:4]:
        line_clean = line.strip().upper()
        if "RAPPORT" in line_clean or "CERTIFICAT" in line_clean or "COMPTE-RENDU" in line_clean or "COMPTE RENDU" in line_clean:
            formats[line_clean] = formats.get(line_clean, 0) + 1

print("Report formats found in document:")
for fmt, count in formats.items():
    print(f"  Format: {fmt} (Count: {count})")

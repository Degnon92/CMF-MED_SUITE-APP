import docx
import re
from docx.oxml.ns import qn

file_path = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT CONS\RAPPORT DE CONSULTATION CMF.docx"
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

names = set()
for report in raw_reports:
    header = report[0]
    header_match = re.match(r"patient\s*:\s*(.*)", header, re.IGNORECASE)
    if header_match:
        names.add(header_match.group(1).strip())

print("List of all 96 patient names:")
sorted_names = sorted(list(names))
for idx, name in enumerate(sorted_names):
    print(f"{idx+1:02d}: {name}")

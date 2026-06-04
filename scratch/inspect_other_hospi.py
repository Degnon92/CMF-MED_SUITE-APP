import docx
import re
from docx.oxml.ns import qn

file_path = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT HOSPI CMF\RAPPORT D'HOSPI CMF.docx"
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

sidebar_doctors = ["Dr DAH", "Dr BACHAROU", "Dr HAZOUME", "Dr LASSISSI", "Dr MEDENOU", "Dr SESSINOU", "Dr CHOBLI", "Dr AGAVOEDO", "Dr DJEDOU", "Dr JACQUET", "Dr SOUMANOU", "Dr ELEGBEDE", "Dr KASSEIN", "Dr AKPAKPO", "Collaborateurs", "Médecine générale", "Pédiatrie", "Cardiologie", "Endocrinologie", "Neurologie", "Anesthésie", "Traumatologie", "Urologie", "Radiologie", "Laboratoire"]

unique_reports = {}
for r in raw_reports:
    header = r[0]
    header_match = re.match(r"patient\s*:\s*(.*)", header, re.IGNORECASE)
    if not header_match:
        continue
    raw_name = header_match.group(1).strip()
    
    clean_lines = []
    for line in r[1:]:
        if any(doc_name in line for doc_name in sidebar_doctors):
            continue
        clean_lines.append(line.strip())
    
    full_text = "\n".join(clean_lines).strip()
    
    key = (raw_name, full_text)
    if key not in unique_reports:
        unique_reports[key] = {
            "name": raw_name,
            "text": full_text
        }

print("Displaying non-hospitalisation unique reports:")
for k, v in unique_reports.items():
    text = v["text"]
    is_hospi = False
    for line in text.split("\n")[:4]:
        if "HOSPITALISATION" in line.upper():
            is_hospi = True
            break
    if not is_hospi:
        print(f"=====================================")
        print(f"REPORT (Patient: {v['name']})")
        print(f"=====================================")
        print(text)

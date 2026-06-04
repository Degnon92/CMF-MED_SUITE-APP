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

print(f"Total reports: {len(raw_reports)}")

patients = {}
no_first_name = []

for idx, report in enumerate(raw_reports):
    header = report[0]
    header_match = re.match(r"patient\s*:\s*(.*)", header, re.IGNORECASE)
    if not header_match:
        continue
    raw_name = header_match.group(1).strip()
    
    # Clean the name of inline AGE information
    clean_name = raw_name
    age_in_name = None
    if "age" in clean_name.lower():
        # E.g. "DANSOU AIME				AGE : 21 ans"
        parts = re.split(r"(?:age|age\s*:)\s*(\d+\s*(?:ans|mois)?)", clean_name, flags=re.IGNORECASE)
        clean_name = parts[0].strip()
        if len(parts) > 1:
            age_in_name = parts[1].strip()
            
    # Clean tab characters, double spaces, etc.
    clean_name = re.sub(r"\s+", " ", clean_name).strip()
    
    # Check words count
    words = clean_name.split()
    if len(words) < 2:
        no_first_name.append((raw_name, clean_name))
    
    if clean_name not in patients:
        patients[clean_name] = {
            "raw_name": raw_name,
            "clean_name": clean_name,
            "age_in_name": age_in_name,
            "paragraphs": []
        }
    
    clean_lines = []
    for line in report[1:]:
        if any(doc_name in line for doc_name in ["Dr DAH", "Dr BACHAROU", "Dr HAZOUME", "Dr LASSISSI", "Dr MEDENOU", "Dr SESSINOU", "Dr CHOBLI", "Dr AGAVOEDO", "Dr DJEDOU", "Dr JACQUET", "Dr SOUMANOU", "Dr ELEGBEDE", "Dr KASSEIN", "Dr AKPAKPO", "Collaborateurs", "Médecine générale", "Pédiatrie", "Cardiologie", "Endocrinologie", "Neurologie", "Anesthésie", "Traumatologie", "Urologie", "Radiologie", "Laboratoire"]):
            continue
        clean_lines.append(line)
    patients[clean_name]["paragraphs"].extend(clean_lines)

print(f"Unique clean patients: {len(patients)}")
print(f"Patients without first name: {len(no_first_name)}")
for raw, clean in no_first_name:
    print(f"  Raw: {raw} -> Clean: {clean}")

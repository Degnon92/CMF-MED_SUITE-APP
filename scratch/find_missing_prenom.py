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

patients_data = {}
for idx, report in enumerate(raw_reports):
    header = report[0]
    header_match = re.match(r"patient\s*:\s*(.*)", header, re.IGNORECASE)
    if not header_match:
        continue
    raw_name = header_match.group(1).strip()
    
    if raw_name not in patients_data:
        patients_data[raw_name] = {
            "name": raw_name,
            "paragraphs": []
        }
    
    clean_lines = []
    for line in report[1:]:
        if any(doc_name in line for doc_name in ["Dr DAH", "Dr BACHAROU", "Dr HAZOUME", "Dr LASSISSI", "Dr MEDENOU", "Dr SESSINOU", "Dr CHOBLI", "Dr AGAVOEDO", "Dr DJEDOU", "Dr JACQUET", "Dr SOUMANOU", "Dr ELEGBEDE", "Dr KASSEIN", "Dr AKPAKPO", "Collaborateurs", "Médecine générale", "Pédiatrie", "Cardiologie", "Endocrinologie", "Neurologie", "Anesthésie", "Traumatologie", "Urologie", "Radiologie", "Laboratoire"]):
            continue
        clean_lines.append(line)
    patients_data[raw_name]["paragraphs"].extend(clean_lines)

# Now inspect first names and print statistics
no_first_name = []
valid_patients = []

for name, data in patients_data.items():
    # Clean the name of special characters or extra spaces
    cleaned_name = name.strip()
    
    # Split by spaces
    words = cleaned_name.split()
    
    # If the name is only 1 word, it means it lacks a first name
    if len(words) < 2:
        no_first_name.append(cleaned_name)
    else:
        # Check if there is an age and diagnosis in the text
        full_text = "\n".join(data["paragraphs"])
        
        # Age extraction
        age = "N/A"
        age_match = re.search(r"g\s+de\s+(\d+\s*(?:ans|mois))|ge\s+de\s+(\d+\s*(?:ans|mois))|g\s+(\d+\s*(?:ans|mois))|ge\s+(\d+\s*(?:ans|mois))|(\d+)\s*ans", full_text, re.IGNORECASE)
        if age_match:
            age = next(g for g in age_match.groups() if g is not None).strip()
            if not age.endswith("ans") and not age.endswith("mois"):
                age = age + " ans"
        
        # Diagnosis extraction
        diagnosis = "Bilan clinique"
        diag_match = re.search(r"(?:objectiv|mis\s+en\s+vidence|diagnostic\s+de)\s+([^.\n]+)", full_text, re.IGNORECASE)
        if diag_match:
            diagnosis = diag_match.group(1).strip()
        else:
            diag_patterns = [
                r"tendinite\s+[^.\n]+",
                r"rupture\s+[^.\n]+",
                r"syndrome\s+[^.\n]+",
                r"fracture\s+[^.\n]+",
                r"entorse\s+[^.\n]+"
            ]
            for pattern in diag_patterns:
                m = re.search(pattern, full_text, re.IGNORECASE)
                if m:
                    diagnosis = m.group(0).strip()
                    break
        
        # Insurance check: check for words indicating insurance or specific mutuelle names
        # Mutuelle words: "mutuelle", "prise en charge", "assurance", "sinistre", "bon", "sinistre automobile", etc.
        has_insurance = "PRIVE"
        insurer_patterns = [
            r"assurance", r"mutuelle", r"prise\s+en\s+charge", r"saham", r"nsia", r"allianz", r"axa", r"sunu", r"ogb", r"ascoma", r"gras\s+savoye"
        ]
        if any(re.search(pat, full_text, re.IGNORECASE) for pat in insurer_patterns):
            has_insurance = "ASSURÉ"
            
        valid_patients.append({
            "name": cleaned_name,
            "first_name": " ".join(words[1:]),
            "last_name": words[0],
            "age": age,
            "diagnosis": diagnosis,
            "insurance": has_insurance,
            "text": full_text
        })

print(f"Total Unique Patients: {len(patients_data)}")
print(f"Patients WITH first name: {len(valid_patients)}")
print(f"Patients WITHOUT first name: {len(no_first_name)}")
if no_first_name:
    print("List of patients without first name:")
    for name in no_first_name:
        print(f"  - {name}")
else:
    print("All patients have a first name!")

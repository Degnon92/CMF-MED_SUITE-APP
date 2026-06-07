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

# Let's group textbox texts by patient header
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

print(f"Total raw textbox segments found: {len(raw_reports)}")

# Process each report to extract:
# - Patient Name
# - Patient Age
# - Diagnosis
# - Insurance details if present
# - Format of report
patients_data = {}

for idx, report in enumerate(raw_reports):
    header = report[0]
    # Extract name from header: "Patient : DZASSI Maurice" or similar
    header_match = re.match(r"patient\s*:\s*(.*)", header, re.IGNORECASE)
    if not header_match:
        continue
    raw_name = header_match.group(1).strip()
    
    # Let's clean name (remove any non-alphabetic residuals if needed, but keep names)
    # Check if we already processed this name or if we need to extract details
    if raw_name not in patients_data:
        patients_data[raw_name] = {
            "name": raw_name,
            "age": None,
            "diagnosis": None,
            "insurance": "PRIVE", # Default
            "texts": [],
            "report_index": idx
        }
    
    # Store clean paragraphs (excluding the sidebar/doctor list)
    clean_lines = []
    for line in report[1:]:
        # Skip sidebar lines containing doctor names to get the clean report format
        if any(doc_name in line for doc_name in ["Dr DAH", "Dr BACHAROU", "Dr HAZOUME", "Dr LASSISSI", "Dr MEDENOU", "Dr SESSINOU", "Dr CHOBLI", "Dr AGAVOEDO", "Dr DJEDOU", "Dr JACQUET", "Dr SOUMANOU", "Dr ELEGBEDE", "Dr KASSEIN", "Dr AKPAKPO", "Collaborateurs", "Médecine générale", "Pédiatrie", "Cardiologie", "Endocrinologie", "Neurologie", "Anesthésie", "Traumatologie", "Urologie", "Radiologie", "Laboratoire"]):
            continue
        clean_lines.append(line)
        
    patients_data[raw_name]["texts"].append(clean_lines)

print(f"Unique patient names extracted: {len(patients_data)}")

# Let's analyze details for each unique patient
for name, data in patients_data.items():
    # Find age and diagnosis from the accumulated texts
    age = None
    diagnosis = None
    insurance = "PRIVE"
    
    # We look through all textboxes for this patient to find details
    full_text = "\n".join(["\n".join(t) for t in data["texts"]])
    
    # Age extraction: "âgé de 23 ans", "âgée de 45 ans", etc.
    age_match = re.search(r"g\s+de\s+(\d+\s*(?:ans|mois))|ge\s+de\s+(\d+\s*(?:ans|mois))|g\s+(\d+\s*(?:ans|mois))|ge\s+(\d+\s*(?:ans|mois))|(\d+)\s*ans", full_text, re.IGNORECASE)
    if age_match:
        age = next(g for g in age_match.groups() if g is not None).strip()
        if not age.endswith("ans") and not age.endswith("mois"):
            age = age + " ans"
    
    # Diagnosis extraction
    # Often in paragraphs: "L'examen clinique a permis de mettre en évidence..." or "L'examen clinique réalisé ce jour a objectivé..."
    # Or "syndrome douloureux...", "tendinite..."
    # Let's search for "mis en évidence", "objectivé", "décrit", "diagnostic de", "souffrant de"
    diag_match = re.search(r"(?:objectiv|mis\s+en\s+vidence|diagnostic\s+de)\s+([^.\n]+)", full_text, re.IGNORECASE)
    if diag_match:
        diagnosis = diag_match.group(1).strip()
    else:
        # Fallback search for common clinical diagnoses patterns
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
                
    # Insurance extraction: check for words like insurance, mutual, or specific names
    insurance_match = re.search(r"assurance|mutuelle|prise\s+en\s+charge|tiers\s*-\s*payant", full_text, re.IGNORECASE)
    if insurance_match:
        # Check if we can identify specific insurers from the clinic list
        # E.g. NSIA, Saham, UAT, etc.
        # For now, let's flag as "ASSURÉ" or default if not found
        insurance = "ASSURÉ"
    else:
        insurance = "PRIVE"
        
    data["age"] = age or "N/A"
    data["diagnosis"] = diagnosis or "Bilan clinique"
    data["insurance"] = insurance

# Display results of unique patients
print("\nUnique Patients Summary:")
for name, data in list(patients_data.items())[:15]:
    print(f"Patient: {name} | Age: {data['age']} | Insured: {data['insurance']} | Diag: {data['diagnosis']}")

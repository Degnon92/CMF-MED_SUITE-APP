import docx
import re
import json
import os
from docx.oxml.ns import qn

# File paths
docx_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT CONS\RAPPORT DE CONSULTATION CMF.docx"
patients_db_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\patients_db.json"
documents_db_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\documents_db.json"

print(f"Loading DOCX from {docx_path}...")
doc = docx.Document(docx_path)

# Extract textbox text
tb_texts = []
root = doc.element
for el in root.iter():
    if el.tag.endswith('txbxContent'):
        for p in el.findall(qn('w:p')):
            p_obj = docx.text.paragraph.Paragraph(p, doc)
            text = p_obj.text.strip()
            if text:
                tb_texts.append(text)

# Group textboxes into reports
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

print(f"Total raw reports found: {len(raw_reports)}")

# French month parsing map
months_map = {
    "janvier": "01", "fevrier": "02", "février": "02", "mars": "03", "avril": "04",
    "mai": "05", "juin": "06", "juillet": "07", "aout": "08", "août": "08",
    "septembre": "09", "octobre": "10", "novembre": "11", "decembre": "12", "décembre": "12"
}

def parse_french_date(text):
    # Match: "le 15/01/2025" or "15-01-2025"
    m_slashes = re.search(r"(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})", text)
    if m_slashes:
        day = f"{int(m_slashes.group(1)):02d}"
        month = f"{int(m_slashes.group(2)):02d}"
        year = m_slashes.group(3)
        return f"{year}-{month}-{day}"
    
    # Match: "le 15 janvier 2025"
    m_words = re.search(r"le\s+(\d{1,2})\s+([a-zA-Zéûûôâêîñéèàç]+)\s+(\d{4})", text, re.IGNORECASE)
    if m_words:
        day = f"{int(m_words.group(1)):02d}"
        month_name = m_words.group(2).lower()
        year = m_words.group(3)
        month = months_map.get(month_name, "02")
        return f"{year}-{month}-{day}"
    
    return None

patients = {}
all_diagnoses = set()
all_interventions = set()
extracted_docs = []

# List of doctors/departments to clean from textbox sidebars
sidebar_doctors = [
    "Dr DAH", "Dr BACHAROU", "Dr HAZOUME", "Dr LASSISSI", "Dr MEDENOU", 
    "Dr SESSINOU", "Dr CHOBLI", "Dr AGAVOEDO", "Dr DJEDOU", "Dr JACQUET", 
    "Dr SOUMANOU", "Dr ELEGBEDE", "Dr KASSEIN", "Dr AKPAKPO", 
    "Collaborateurs", "Médecine générale", "Pédiatrie", "Cardiologie", 
    "Endocrinologie", "Neurologie", "Anesthésie", "Traumatologie", 
    "Urologie", "Radiologie", "Laboratoire"
]

import_count = 0
skip_count = 0

for idx, report in enumerate(raw_reports):
    header = report[0]
    header_match = re.match(r"patient\s*:\s*(.*)", header, re.IGNORECASE)
    if not header_match:
        continue
    raw_name = header_match.group(1).strip()
    
    # Clean the name of inline age
    clean_name = raw_name
    age_in_name = None
    if "age" in clean_name.lower():
        parts = re.split(r"(?:age|age\s*:)\s*(\d+\s*(?:ans|mois)?)", clean_name, flags=re.IGNORECASE)
        clean_name = parts[0].strip()
        if len(parts) > 1:
            age_in_name = parts[1].strip()
            
    clean_name = re.sub(r"\s+", " ", clean_name).strip()
    
    # Split name into first and last name
    words = clean_name.split()
    if len(words) < 2:
        # Lacks a first name, skip
        continue
        
    last_name = words[0].upper()
    first_name = " ".join(words[1:])
    
    # Filter report text lines
    clean_lines = []
    is_hospitalization = False
    for line in report[1:]:
        line_upper = line.upper()
        # Detect hospitalization
        if "COMPTE RENDU D'HOSPITALISATION" in line_upper or "COMPTE-RENDU D'HOSPITALISATION" in line_upper or "COMPTE RENDU D’HOSPITALISATION" in line_upper:
            is_hospitalization = True
        if any(doc_name in line for doc_name in sidebar_doctors):
            continue
        clean_lines.append(line)
        
    if is_hospitalization:
        # Exclude hospitalization reports per instructions
        skip_count += 1
        continue
        
    full_text = "\n".join(clean_lines).strip()
    
    # Extract age
    age = "N/A"
    if age_in_name:
        age = age_in_name
    else:
        age_match = re.search(r"g\s+de\s+(\d+\s*(?:ans|mois))|ge\s+de\s+(\d+\s*(?:ans|mois))|g\s+(\d+\s*(?:ans|mois))|ge\s+(\d+\s*(?:ans|mois))|(\d+)\s*ans", full_text, re.IGNORECASE)
        if age_match:
            age = next(g for g in age_match.groups() if g is not None).strip()
            if not age.endswith("ans") and not age.endswith("mois"):
                age = age + " ans"
                
    # Extract diagnosis
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
                
    diagnosis = re.sub(r"[\s\-\.\,\:\_]+$", "", diagnosis).strip()
    if len(diagnosis) > 100:
        diagnosis = diagnosis[:97] + "..."
    all_diagnoses.add(diagnosis)
    
    # Check insurance
    insurer = "PRIVE"
    prise_en_charge = 0
    insurer_map = {
        "ascoma": "ASCOMA",
        "sunu": "SUNU",
        "nsia": "NSIA",
        "allianz": "ALLIANZ",
        "saham": "SANLAM",
        "sanlam": "SANLAM",
        "axa": "PRIVE",
        "lotto": "LOTTO_FOOTBALL_CLUB",
        "coton": "COTON_SPORT",
        "energie": "ENERGIE_BASKET_BALL"
    }
    
    has_insurance = False
    for keyword, partner_id in insurer_map.items():
        if re.search(keyword, full_text, re.IGNORECASE) or re.search(keyword, clean_name, re.IGNORECASE):
            insurer = partner_id
            has_insurance = True
            if partner_id != "PRIVE":
                prise_en_charge = 80 if partner_id not in ["LOTTO_FOOTBALL_CLUB", "COTON_SPORT", "ENERGIE_BASKET_BALL"] else 100
            break
            
    if not has_insurance:
        if any(w in full_text.lower() for w in ["assurance", "mutuelle", "prise en charge", "sinistre", "bon"]):
            insurer = "ASCOMA"
            prise_en_charge = 80
            
    # Extract intervention/nomenclature code
    intervention = ""
    k_code = ""
    interv_patterns = [
        (r"ligamentoplastie\s+du\s+lca|didt", "Ligamentoplastie du LCA par DIDT", "LCA"),
        (r"prothèse\s+totale\s+du\s+genou|ptg", "Prothèse Totale du Genou (PTG)", "PTG"),
        (r"prothèse\s+totale\s+de\s+la\s+hanche|pth", "Prothèse Totale de la Hanche (PTH)", "PTH"),
        (r"ostéosynthèse\s+de\s+la\s+clavicule", "Ostéosynthèse de la clavicule", "CLAVICULE"),
        (r"ostéosynthèse\s+de\s+l'humérus", "Ostéosynthèse de l'humérus / radius / cubitus", "HUMERUS"),
        (r"ostéosynthèse\s+du\s+radius|ostéosynthèse\s+de\s+radius", "Ostéosynthèse de l'humérus / radius / cubitus", "HUMERUS"),
        (r"ostéosynthèse\s+du\s+tibia|ostéosynthèse\s+de\s+tibia|ostéosynthèse\s+du\s+fémur|ostéosynthèse\s+de\s+fémur", "Ostéosynthèse du tibia ou du fémur", "TIBIA"),
        (r"ablation\s+de\s+matériel|amos", "Ablation de matériel d'ostéosynthèse (AMOS)", "AMOS_CLE"),
        (r"arthroscopie\s+diagnostique", "Arthroscopie diagnostique & debridement du genou", "ARTHRO_DIAG"),
        (r"réduction\s+orthopédique\s+de\s+luxation", "Réduction orthopédique de luxation de membre", "LUXATION_CMF"),
        (r"ostéosynthèse\s+de\s+fracture\s+symphysaire|symphysaire", "Ostéosynthèse de fracture symphysaire mandibulaire par mini-plaques", "FX_MANDIBULE"),
        (r"résection\s+transurétrale|rtup", "Résection Transurétrale de la Prostate (RTUP)", "RTUP"),
        (r"pose\s+de\s+sonde\s+double\s+j|pose\s+de\s+sonde\s+jj", "Pose ou descente de Sonde Double J (JJ)", "SONDE_JJ_POSE"),
        (r"ablation\s+de\s+sonde\s+double\s+j|ablation\s+de\s+sonde\s+jj", "Ablation de Sonde double J par urétéroscopie", "SONDE_JJ_ABLATION"),
        (r"cure\s+d'hydrocèle|varicocèle", "Cure d'hydrocèle ou de varicocèle", "HYDROCELE")
    ]
    
    for pat, label, code in interv_patterns:
        if re.search(pat, full_text, re.IGNORECASE):
            intervention = label
            k_code = code
            all_interventions.add(label)
            break

    # Format Date
    report_date = parse_french_date(full_text)
    if not report_date:
        report_date = "2025-02-15"

    # Category and title determination
    template_id = "rapport_cs_simple"
    doc_title = "RAPPORT DE CONSULTATION"
    doc_category = "Rapport CS"
    
    for line in clean_lines[:4]:
        line_upper = line.upper()
        if "CERTIFICAT DE REPOS" in line_upper:
            template_id = "certif_repos"
            doc_title = "CERTIFICAT DE REPOS MEDICAL"
            doc_category = "Certificat"
            break
        elif "CERTIFICAT MEDICAL INITIAL" in line_upper:
            template_id = "rapport_cs_simple"
            doc_title = "CERTIFICAT MEDICAL INITIAL"
            doc_category = "Rapport CS"
            break
        elif "CERTIFICAT MEDICAL DE L'ETAT ACTUEL" in line_upper or "CERTIFICAT MEDICAL DE L’ETAT ACTUEL" in line_upper:
            template_id = "rapport_cs_simple"
            doc_title = "CERTIFICAT MEDICAL DE L'ETAT ACTUEL"
            doc_category = "Rapport CS"
            break
        elif "CERTIFICAT MEDICAL" in line_upper:
            template_id = "rapport_cs_simple"
            doc_title = "CERTIFICAT MEDICAL"
            doc_category = "Rapport CS"
            break
        elif "CERTIFICAT DE VOYAGE" in line_upper:
            template_id = "rapport_cs_simple"
            doc_title = "CERTIFICAT DE VOYAGE"
            doc_category = "Rapport CS"
            break

    # Create/update unique patient
    if clean_name not in patients:
        patients[clean_name] = {
            "name": clean_name,
            "diagnosis": diagnosis,
            "intervention": intervention,
            "kCode": k_code,
            "age": age,
            "matricule": "",
            "insurer": insurer,
            "priseEnCharge": prise_en_charge
        }
    else:
        p = patients[clean_name]
        if not p["intervention"] and intervention:
            p["intervention"] = intervention
            p["kCode"] = k_code
        if p["diagnosis"] == "Bilan clinique" and diagnosis != "Bilan clinique":
            p["diagnosis"] = diagnosis
            
    # Add clinical document
    doc_id = f"DOC-CMF-{import_count+1:03d}"
    extracted_docs.append({
        "id": doc_id,
        "type": "DOC",
        "category": doc_category,
        "title": doc_title,
        "templateId": template_id,
        "patientNom": last_name,
        "patientPrenom": first_name,
        "patientAge": age,
        "date": report_date,
        "diagnosis": diagnosis,
        "content": full_text,
        "text": full_text,
        "savedAt": "2026-06-02T17:40:00.000Z"
    })
    import_count += 1

print(f"Skipped hospitalization reports: {skip_count}")
print(f"Imported consultation reports: {import_count}")
print(f"Total clean patients: {len(patients)}")

# Save cleanly to target db files
with open(patients_db_path, "w", encoding="utf-8") as f:
    json.dump(list(patients.values()), f, ensure_ascii=False, indent=4)

with open(documents_db_path, "w", encoding="utf-8") as f:
    json.dump(extracted_docs, f, ensure_ascii=False, indent=4)

print("Clinical database updated successfully!")

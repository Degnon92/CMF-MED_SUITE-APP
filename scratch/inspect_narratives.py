import json
import os
import re

workspace_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
patients_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "patients_db.json")

with open(patients_db_path, "r", encoding="utf-8") as f:
    patients = json.load(f)

print("Patients with narrative interventions/diagnoses:")
for p in patients:
    name = p.get("name", "")
    diag = p.get("diagnosis", "")
    interv = p.get("intervention", "")
    
    # Check if either matches any of the narrative pattern prefixes
    narrative_patterns = [
        r"^(?:il|elle)\b",
        r"\bconsulte pour\b",
        r"\breçu pour\b",
        r"\bhospitalisé pour\b",
        r"\badmis pour\b",
        r"\bbénéficié\b",
        r"\bindiqué\b",
        r"\bopéré\b"
    ]
    
    is_narrative = False
    for pat in narrative_patterns:
        if re.search(pat, diag, re.IGNORECASE) or re.search(pat, interv, re.IGNORECASE):
            is_narrative = True
            break
            
    if is_narrative:
        print(f"\nPatient: {name}")
        print(f"  Diag:   {diag}")
        print(f"  Interv: {interv}")

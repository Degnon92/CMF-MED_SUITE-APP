import json
import os

workspace_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
patients_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "patients_db.json")

with open(patients_db_path, "r", encoding="utf-8") as f:
    patients = json.load(f)

test_names = [
    "DOUKPON J. ANNE", "DOUKPON ANNE",
    "ADANHOHEGBE AZONGNISOU", "ADANHOEGBE AZONGNISSOU", "ADANHOHEGBE AZONGNISSOU",
    "ZOMAHOUN FALONNE VANESSA", "ZOMAHOUN FALONNE VANESSA (AA)",
    "GNONLONFOUN S. ROSELYNE", "GNONLONFOUN ROSELYNE",
    "BESSANVI GILDAS T.", "BESSANVI GILDAS",
    "ASSOGBA BRIGITTE P.", "ASSOGBA BRIGITTE P",
    "SEDJAME T. Fréjus", "SEDJAME FREJUS", "SEDJAME T. Frjus",
    "ANANI Damien C", "ANANI DAMIEN"
]

print("Patient records details for similar names:")
for name in test_names:
    found = [p for p in patients if p["name"].upper() == name.upper() or p["name"].upper().replace("", "É") == name.upper()]
    if found:
        for f in found:
            print(f"Name: '{f['name']}' | Age: '{f.get('age')}' | Insurer: '{f.get('insurer')}' | Diag: '{f.get('diagnosis')}' | Interv: '{f.get('intervention')}'")

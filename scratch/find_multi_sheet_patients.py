import json, openpyxl, os, re
from collections import Counter

workspace_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
excel_path = os.path.join(workspace_dir, "EXEMPLAIRE PROFORMA.xlsx")
wb = openpyxl.load_workbook(excel_path, read_only=True)

from reimport_bills_from_excel import clean_patient_name

sheet_names = wb.sheetnames
cleaned_sheet_to_raw = {}
for name in sheet_names:
    cleaned = clean_patient_name(name)
    if cleaned:
        cleaned_sheet_to_raw.setdefault(cleaned, []).append(name)

with open('bills_db.json', encoding='utf-8') as f:
    bills = json.load(f)

# Group database bills by cleaned patient name
db_patient_bills = {}
for b in bills:
    fullname = f"{b.get('patientNom','')} {b.get('patientPrenom','')}"
    cleaned = clean_patient_name(fullname)
    if cleaned:
        db_patient_bills.setdefault(cleaned, []).append(b)

print("=== PATIENTS WITH MULTIPLE SHEETS ===")
for cleaned, sheets in sorted(cleaned_sheet_to_raw.items()):
    if len(sheets) > 1:
        db_bills = db_patient_bills.get(cleaned, [])
        print(f"Patient: '{cleaned}'")
        print(f"  Excel sheets ({len(sheets)}): {sheets}")
        print(f"  DB bills     ({len(db_bills)}): {[(b['id'], b['type'], b.get('date'), b.get('grossTotal')) for b in db_bills]}")
        print("-" * 50)

import os
import json
import openpyxl

workspace_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
patients_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "patients_db.json")
excel_path = os.path.join(workspace_dir, "EXEMPLAIRE PROFORMA.xlsx")

with open(patients_db_path, "r", encoding="utf-8") as f:
    patients = json.load(f)

db_names = {p["name"].strip().upper() for p in patients}

wb = openpyxl.load_workbook(excel_path, read_only=True)
sheet_names = wb.sheetnames

print(f"Total sheets: {len(sheet_names)}")
print(f"Total DB patients: {len(patients)}")

missing = []
for name in sheet_names:
    clean_name = name.strip().upper()
    # Simple cleanups
    if clean_name in ["TARIFS BLOC", "ASSURANCES", "TARIFAIRE", "GRILLE", "INDEX", "FEUIL1", "SHEET1"]:
        continue
    if clean_name not in db_names:
        missing.append(name)

print(f"\nMissing sheets count: {len(missing)}")
for m in missing:
    print(f"- {m}")

import json
import os

workspace_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
bills_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "bills_db.json")

with open(bills_db_path, "r", encoding="utf-8") as f:
    bills = json.load(f)

print(f"Total bills: {len(bills)}")
for b in bills[:10]:
    print(f"ID: {b['id']} | Ref: {b['reference']} | Patient: {b['patientNom']} {b['patientPrenom']} | Insurance: {b['insurance']} | Date: {b['date']}")

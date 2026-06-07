import json
import os

app_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"

with open(os.path.join(app_dir, "bills_db.json"), "r", encoding="utf-8") as f:
    bills = json.load(f)

print("Searching for ref MF-PRO-2026-087 or similar:")
for b in bills:
    if "087" in b.get("reference", "") or "NOM" in b.get("patientNom", "").upper() or "." in b.get("patientNom", ""):
        print(json.dumps(b, indent=2))

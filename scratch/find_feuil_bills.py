import json

with open("bills_db.json", "r", encoding="utf-8") as f:
    bills = json.load(f)

for b in bills:
    fullname = f"{b['patientNom']} {b['patientPrenom']}".strip()
    if "FEUIL" in fullname.upper():
        print(f"Bill ID: {b['id']} | patientNom: '{b['patientNom']}' | patientPrenom: '{b['patientPrenom']}' | date: {b['date']}")

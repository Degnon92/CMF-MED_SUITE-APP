import json
bills_db_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\bills_db.json"

with open(bills_db_path, "r", encoding="utf-8") as f:
    bills = json.load(f)

for b in bills:
    if "KELLY" in b.get("patientNom", "").upper():
        print(f"ID: {b['id']} | Ref: {b['reference']} | Date: {b['date']}")
        print(json.dumps(b, indent=2, ensure_ascii=False))

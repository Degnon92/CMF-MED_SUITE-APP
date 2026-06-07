import json
import os
from collections import Counter

bills_db_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\bills_db.json"

with open(bills_db_path, "r", encoding="utf-8") as f:
    bills = json.load(f)

dates = [b.get("date") for b in bills]
counter = Counter(dates)
print("Top 20 dates:")
for d, count in counter.most_common(20):
    print(f"Date: {d} | Count: {count}")

print("\nBills with date 2026-06-01:")
recent_bills = [b for b in bills if b.get("date") == "2026-06-01"]
print(f"Total: {len(recent_bills)}")
for b in recent_bills[:10]:
    print(f"ID: {b['id']} | Ref: {b['reference']} | Patient: {b['patientNom']} {b['patientPrenom']} | Insurance: {b['insurance']}")

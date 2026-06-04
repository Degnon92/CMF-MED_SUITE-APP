import json, os, re

with open('bills_db.json', encoding='utf-8') as f:
    bills = json.load(f)

print("=== UNMATCHED DETAIL_ASSUR BILLS ===")
count_det = 0
for b in bills:
    if b.get('type') == 'DETAIL_ASSUR' and not b.get('useSplit'):
        count_det += 1
        print(f"ID: {b['id']} | Ref: {b.get('reference')} | Patient: {b.get('patientNom')} {b.get('patientPrenom')} | Date: {b.get('date')} | grossTotal: {b.get('grossTotal')}")

print(f"\nTotal unmatched DETAIL_ASSUR: {count_det}")

print("\n=== UNMATCHED DEFINITIF BILLS ===")
count_def = 0
for b in bills:
    if b.get('type') == 'DEFINITIF' and not b.get('useSplit'):
        count_def += 1
        # only print first 20 to avoid spam, but count all
        if count_def <= 25:
            print(f"ID: {b['id']} | Ref: {b.get('reference')} | Patient: {b.get('patientNom')} {b.get('patientPrenom')} | Date: {b.get('date')} | grossTotal: {b.get('grossTotal')}")
        elif count_def == 26:
            print("...")

print(f"\nTotal unmatched DEFINITIF: {count_def}")

import json

with open('bills_db.json', encoding='utf-8') as f:
    bills = json.load(f)

kpek_bills = [b for b in bills if 'KPEK' in str(b.get('patientNom',''))]
for b in kpek_bills:
    print(f"ID: {b['id']} | Type: {b['type']} | Ins: {b['insurance']} | Cov: {b['coverage']} | grossTotal: {b['grossTotal']} | partAss: {b['partAssurance']} | partPat: {b['partPatient']} | useSplit: {b.get('useSplit')}")
    print("Items:")
    for item in b.get('items', []):
        print(f"  - {item.get('name')}: price={item.get('price')}, qty={item.get('qty')}, subtotal={item.get('subtotal')}, partAss={item.get('partAssurance')}, partPat={item.get('partPatient')}, splitLimit={item.get('splitLimit')}, splitRate={item.get('splitRate')}")
    print("=" * 60)

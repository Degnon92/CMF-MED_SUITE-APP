import json

bills = json.load(open('bills_db.json', encoding='utf-8'))

# Inspecter les 3 factures KPEKPASSI en detail
kpek = [b for b in bills if 'KPEK' in str(b.get('patientNom', ''))]

for b in kpek:
    print(f"=== {b.get('id')} - {b.get('type')} ===")
    for k, v in b.items():
        if k != 'items':
            print(f"  {k}: {repr(v)}")
    print(f"  items count: {len(b.get('items', []))}")
    if b.get('items'):
        for item in b['items'][:3]:
            print(f"    item: {item}")
    print()

# Stats sur les factures DETAIL_ASSUR
det_ass = [b for b in bills if b.get('type') == 'DETAIL_ASSUR']
print(f"\n=== DETAIL_ASSUR ({len(det_ass)} factures) ===")
for b in det_ass[:2]:
    print(f"  id={b.get('id')} | insurance={b.get('insurance')} | coverage={b.get('coverage')} | partAss={b.get('partAssurance')} | grossTotal={b.get('grossTotal')}")
    if b.get('items'):
        for item in b['items'][:2]:
            print(f"    item: {item}")

# Stats sur les factures DEFINITIF
defs = [b for b in bills if b.get('type') == 'DEFINITIF']
print(f"\n=== DEFINITIF ({len(defs)} factures) ===")
for b in defs[:2]:
    print(f"  id={b.get('id')} | insurance={b.get('insurance')} | coverage={b.get('coverage')} | partAss={b.get('partAssurance')} | grossTotal={b.get('grossTotal')}")
    if b.get('items'):
        for item in b['items'][:2]:
            print(f"    item: {item}")

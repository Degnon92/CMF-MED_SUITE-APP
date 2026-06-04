import json

with open('bills_db_backup_before_reimport.json', encoding='utf-8') as f:
    bills = json.load(f)

for b in bills:
    if b['id'] == 'BILL-REAL-AUTO-228':
        print(f"ID: {b['id']}")
        for item in b.get('items', []):
            print(f"  - {item.get('name')}: price={item.get('price')}, qty={item.get('qty')}, subtotal={item.get('subtotal')}, partAss={item.get('partAssurance')}, partPat={item.get('partPatient')}")

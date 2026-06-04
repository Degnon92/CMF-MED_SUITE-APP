import json
from pathlib import Path

docs = json.load(open('documents_db.json', encoding='utf-8'))
real = [d for d in docs if str(d.get('id','')).startswith('DOC-REAL-')]
user = [d for d in docs if not str(d.get('id','')).startswith('DOC-REAL-')]

print(f"Total docs dans documents_db.json : {len(docs)}")
print(f"  DOC-REAL-* : {len(real)}")
print(f"  Docs utilisateur (BILL, DOC, etc.) : {len(user)}")
if user:
    print("Exemples de docs utilisateur :")
    for d in user[:5]:
        nom = d.get('patientNom', '')
        pid = d.get('id', '')
        date = d.get('date', '')
        print(f"  id={pid} | nom={nom} | date={date}")

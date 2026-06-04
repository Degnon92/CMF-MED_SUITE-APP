import json
import re

db_path = 'bills_db.json'
with open(db_path, encoding='utf-8') as f:
    db = json.load(f)

count = 0
for b in db:
    nom = b.get('patientNom', '')
    prenom = b.get('patientPrenom', '')
    
    # Remove anything starting with parenthesis in either field
    new_nom = re.sub(r'\(.*', '', nom).strip()
    new_prenom = re.sub(r'\(.*', '', prenom).strip()
    
    # Also strip any stray parentheses
    new_nom = new_nom.replace('(', '').replace(')', '').strip()
    new_prenom = new_prenom.replace('(', '').replace(')', '').strip()
    
    if new_nom != nom or new_prenom != prenom:
        b['patientNom'] = new_nom
        b['patientPrenom'] = new_prenom
        count += 1
        print(f"Cleaned {b['id']}: '{nom} {prenom}' -> '{new_nom} {new_prenom}'")

if count > 0:
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(db, f, ensure_ascii=False, indent=2)
    print(f"Successfully cleaned {count} records in database.")
else:
    print("No records required cleaning.")

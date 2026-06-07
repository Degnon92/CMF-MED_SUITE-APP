import json

with open("bills_db.json", "r", encoding="utf-8") as f:
    bills = json.load(f)

print("--- BILLS WITH EMPTY PRENOM OR FEUIL NAMES ---")
count = 0
for b in bills:
    nom = b.get("patientNom", "")
    prenom = b.get("patientPrenom", "")
    fullname = f"{nom} {prenom}".strip()
    if not prenom or "FEUIL" in nom.upper():
        print(f"Bill ID: {b['id']} | Nom: '{nom}' | Prenom: '{prenom}' | Reference: {b.get('reference')}")
        count += 1
        if count >= 20:
            print("... and more ...")
            break

with open("documents_db.json", "r", encoding="utf-8") as f:
    docs = json.load(f)

print("\n--- DOCUMENTS WITH EMPTY PRENOM OR FEUIL NAMES ---")
count = 0
for d in docs:
    nom = d.get("patientNom", "")
    prenom = d.get("patientPrenom", "")
    fullname = f"{nom} {prenom}".strip()
    if not prenom or "FEUIL" in nom.upper():
        print(f"Doc ID: {d['id']} | Nom: '{nom}' | Prenom: '{prenom}' | Title: {d.get('title')}")
        count += 1
        if count >= 20:
            print("... and more ...")
            break

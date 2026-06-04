import json
import os

desktop_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
bills_path = os.path.join(desktop_dir, "bills_db.json")

if not os.path.exists(bills_path):
    print("bills_db.json not found!")
    exit(0)

with open(bills_path, "r", encoding="utf-8") as f:
    bills = json.load(f)

print(f"Loaded {len(bills)} bills from bills_db.json")

corrupted_bills = []
for b in bills:
    nom = b.get("patientNom", "")
    prenom = b.get("patientPrenom", "")
    age = b.get("patientAge", "")
    
    if nom in ["D'", "DE", "Dr", "DR", "DR GIPSY"] or prenom in ["D'", "Dr", "DR"]:
        corrupted_bills.append(b)

print(f"Found {len(corrupted_bills)} bills with corrupted names in bills_db.json:")
for cb in corrupted_bills[:10]:
    print(f"  ID: {cb['id']} | Nom: '{cb.get('patientNom')}' | Prenom: '{cb.get('patientPrenom')}' | Age: '{cb.get('patientAge')}' | Date: {cb.get('date')}")

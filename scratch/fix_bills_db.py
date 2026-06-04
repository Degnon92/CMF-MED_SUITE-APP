import json
import os

desktop_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
bills_path = os.path.join(desktop_dir, "bills_db.json")

with open(bills_path, "r", encoding="utf-8") as f:
    bills = json.load(f)

fixed_count = 0
for b in bills:
    nom = b.get("patientNom", "")
    prenom = b.get("patientPrenom", "")
    
    # Check for DE SOUZA MONIQUE
    if nom == "DE" and prenom == "SOUZA MONIQUE":
        b["patientNom"] = "DE SOUZA"
        b["patientPrenom"] = "MONIQUE"
        fixed_count += 1
    # Check for DR AGOUNKPE
    elif nom == "DR" and prenom == "AGOUNKPE":
        # We can keep it or if we find a better name, e.g. AGOUNKPE
        b["patientNom"] = "AGOUNKPE"
        b["patientPrenom"] = ""
        fixed_count += 1
    # Check for DR DJEDOU
    elif nom == "DR" and prenom == "DJEDOU":
        b["patientNom"] = "DJEDOU"
        b["patientPrenom"] = ""
        fixed_count += 1

print(f"Repaired {fixed_count} bills in bills_db.json.")

with open(bills_path, "w", encoding="utf-8") as f:
    json.dump(bills, f, ensure_ascii=False, indent=4)
print("Saved bills_db.json.")

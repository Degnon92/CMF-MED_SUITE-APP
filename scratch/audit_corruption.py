import json
import os
import re

desktop_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
docs_path = os.path.join(desktop_dir, "documents_db.json")
real_data_path = os.path.join(desktop_dir, "real_data.js")

if not os.path.exists(docs_path):
    print("documents_db.json not found!")
    exit(1)

with open(docs_path, "r", encoding="utf-8") as f:
    docs = json.load(f)

print(f"Loaded {len(docs)} documents from documents_db.json")

# Let's inspect some of the fields in documents_db.json
corrupted_nom = []
corrupted_age = []
for d in docs:
    nom = d.get("patientNom", "")
    prenom = d.get("patientPrenom", "")
    age = d.get("patientAge", "")
    content = d.get("content", "")
    
    # Check for known corruption patterns
    # 1. Names like "D'", "DR", etc.
    if nom in ["D'", "Dr", "DR", "DR GIPSY"] or prenom in ["D'", "Dr", "DR"]:
        corrupted_nom.append(d)
        continue
        
    # 2. Names containing parentheses, headers, or dates
    if any(p in nom.upper() or p in prenom.upper() for p in ["RAPPORT", "HOSPITALISATION", "CONSULTATION", "CERTIFICAT"]):
        corrupted_nom.append(d)
        continue
        
    # 3. Ages that are not matched by text
    # e.g., age is "35 ans" but text says "38 ans" or "40 ans"
    age_in_text = re.findall(r"(?:âgé|âgée|age|âge)\s+de\s+(\d+)\s*(?:ans|g|mois)", content, re.IGNORECASE)
    if age_in_text and age:
        text_age = age_in_text[0]
        # Match only digits
        db_age_digits = "".join(filter(str.isdigit, str(age)))
        if db_age_digits and text_age != db_age_digits:
            corrupted_age.append((d, text_age, age))

print(f"Found {len(corrupted_nom)} documents with corrupted names in documents_db.json:")
for d in corrupted_nom[:10]:
    print(f"  ID: {d['id']} | Nom: '{d.get('patientNom')}' | Prenom: '{d.get('patientPrenom')}' | Date: {d.get('date')}")
    # Print first line of content
    content_lines = d.get("content", "").split("\n")
    print(f"    Text: {content_lines[0] if content_lines else ''}")

print(f"\nFound {len(corrupted_age)} documents with mismatched age in documents_db.json:")
for d, text_age, db_age in corrupted_age[:10]:
    print(f"  ID: {d['id']} | Patient: '{d.get('patientNom')} {d.get('patientPrenom')}' | DB Age: '{db_age}' | Text says: '{text_age}'")

# Let's read real_data.js. It's a JS file. Let's read it and extract the array using regex or simple parsing
if os.path.exists(real_data_path):
    with open(real_data_path, "r", encoding="utf-8") as f:
        js_content = f.read()
    
    # We can parse the array of objects in window.MercyFiatRealDocs
    # A simple way is to find window.MercyFiatRealDocs = [ ... ]
    # and load it as JSON by turning it into a valid json
    match = re.search(r"window\.MercyFiatRealDocs\s*=\s*(\[[\s\S]*?\]);?\s*$", js_content)
    if match:
        try:
            real_docs = json.loads(match.group(1))
            print(f"\nLoaded {len(real_docs)} documents from real_data.js")
            
            real_corrupted_nom = []
            real_corrupted_age = []
            for d in real_docs:
                nom = d.get("patientNom", "")
                prenom = d.get("patientPrenom", "")
                age = d.get("patientAge", "")
                content = d.get("content", "")
                
                if nom in ["D'", "Dr", "DR", "DR GIPSY"] or prenom in ["D'", "Dr", "DR"]:
                    real_corrupted_nom.append(d)
                    continue
                if any(p in nom.upper() or p in prenom.upper() for p in ["RAPPORT", "HOSPITALISATION", "CONSULTATION", "CERTIFICAT"]):
                    real_corrupted_nom.append(d)
                    continue
                
                age_in_text = re.findall(r"(?:âgé|âgée|age|âge)\s+de\s+(\d+)\s*(?:ans|g|mois)", content, re.IGNORECASE)
                if age_in_text and age:
                    text_age = age_in_text[0]
                    db_age_digits = "".join(filter(str.isdigit, str(age)))
                    if db_age_digits and text_age != db_age_digits:
                        real_corrupted_age.append((d, text_age, age))
            
            print(f"Found {len(real_corrupted_nom)} corrupted names in real_data.js:")
            for d in real_corrupted_nom[:10]:
                print(f"  ID: {d['id']} | Nom: '{d.get('patientNom')}' | Prenom: '{d.get('patientPrenom')}' | Date: {d.get('date')}")
            
            print(f"Found {len(real_corrupted_age)} mismatched ages in real_data.js:")
            for d, text_age, db_age in real_corrupted_age[:10]:
                print(f"  ID: {d['id']} | Patient: '{d.get('patientNom')} {d.get('patientPrenom')}' | DB Age: '{db_age}' | Text says: '{text_age}'")
                
        except Exception as e:
            print(f"Could not parse real_data.js json: {e}")
    else:
        print("Could not find window.MercyFiatRealDocs array in real_data.js")

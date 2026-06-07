import json
import os
import re

desktop_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
real_data_path = os.path.join(desktop_dir, "real_data.js")

with open(real_data_path, "r", encoding="utf-8") as f:
    js_content = f.read()

match = re.search(r"window\.MercyFiatRealDocs\s*=\s*(\[[\s\S]*?\]);?\s*$", js_content)
if match:
    real_docs = json.loads(match.group(1))
    print(f"Loaded {len(real_docs)} documents.")
    
    # Print the text of the first few records that have mismatching or normal records
    for i in range(10):
        d = real_docs[i]
        print(f"\n--- RECORD {i+1} (ID: {d['id']}) ---")
        print(f"Metadata: Nom='{d.get('patientNom')}', Prenom='{d.get('patientPrenom')}', Age='{d.get('patientAge')}', Date='{d.get('date')}'")
        print("Content:")
        print(d.get("content", ""))
else:
    print("No match")

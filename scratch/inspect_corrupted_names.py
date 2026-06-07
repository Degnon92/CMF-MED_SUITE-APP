import json
import os
import re

desktop_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
docs_path = os.path.join(desktop_dir, "documents_db.json")

with open(docs_path, "r", encoding="utf-8") as f:
    docs = json.load(f)

corrupted_ids = ["DOC-REAL-AUTO-183", "DOC-REAL-AUTO-184", "DOC-REAL-AUTO-190", "DOC-REAL-AUTO-191", "DOC-REAL-AUTO-192", "DOC-REAL-AUTO-195", "DOC-REAL-AUTO-196", "DOC-REAL-AUTO-197", "DOC-REAL-AUTO-198", "DOC-REAL-AUTO-199"]

for d in docs:
    if d["id"] in corrupted_ids or d.get("patientNom") in ["D'", "DE", "Dr"]:
        print(f"\n--- {d['id']} ---")
        print(f"Current Metadata: Nom='{d.get('patientNom')}', Prenom='{d.get('patientPrenom')}', Age='{d.get('patientAge')}'")
        print("Lines of Content:")
        for line in d.get("content", "").split("\n")[:10]:
            print(f"  {repr(line)}")

import json
import os

db_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\documents_db.json"

if os.path.exists(db_path):
    with open(db_path, "r", encoding="utf-8") as f:
        docs = json.load(f)
        
    target_ids = ["DOC-REAL-AUTO-247", "DOC-REAL-AUTO-248", "DOC-REAL-AUTO-251", "DOC-REAL-AUTO-514", "DOC-REAL-AUTO-645", "DOC-REAL-AUTO-646"]
    
    for doc in docs:
        if doc.get("id") in target_ids or any(tid in doc.get("id", "") for tid in target_ids):
            print(f"\n========================================")
            print(f"ID: {doc.get('id')} | Patient: {doc.get('patientNom')} {doc.get('patientPrenom')} | Category: {doc.get('category')} | Date: {doc.get('date')}")
            print(f"Title: {doc.get('title')}")
            print(f"Diagnosis: {doc.get('diagnosis')}")
            print(f"Intervention: {doc.get('intervention')}")
            content = doc.get("content", "")
            print(f"Content length: {len(content)}")
            print("Content Preview (first 300 chars):")
            print(content[:300])
else:
    print("documents_db.json not found")

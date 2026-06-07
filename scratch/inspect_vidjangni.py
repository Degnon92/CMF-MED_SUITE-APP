import json
import os

bills_db_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\bills_db.json"
docs_db_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\documents_db.json"

if os.path.exists(bills_db_path):
    with open(bills_db_path, "r", encoding="utf-8") as f:
        bills = json.load(f)
    print(f"Bills matching 'VIDJANGNI':")
    for b in bills:
        if "VIDJANGNI" in f"{b.get('patientNom','')} {b.get('patientPrenom','')}".upper():
            print(f"Bill: ID={b['id']} | Ref={b.get('reference')} | Date={b.get('date')} | Patient={b.get('patientNom')} {b.get('patientPrenom')}")

if os.path.exists(docs_db_path):
    with open(docs_db_path, "r", encoding="utf-8") as f:
        docs = json.load(f)
    print(f"\nDocs matching 'VIDJANGNI':")
    for d in docs:
        if "VIDJANGNI" in f"{d.get('patientNom','')} {d.get('patientPrenom','')}".upper():
            print(f"Doc: ID={d['id']} | Date={d.get('date')} | Patient={d.get('patientNom')} {d.get('patientPrenom')}")

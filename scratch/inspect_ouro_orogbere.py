import json
import os

workspace_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
documents_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "documents_db.json")
bills_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "bills_db.json")

with open(documents_db_path, "r", encoding="utf-8") as f:
    docs = json.load(f)
with open(bills_db_path, "r", encoding="utf-8") as f:
    bills = json.load(f)

def show_info(name):
    print(f"\nDetails for: {name}")
    norm = name.upper()
    for d in docs:
        if f"{d['patientNom']} {d['patientPrenom']}".upper() == norm:
            print(f"  Doc ID: {d['id']} | Date: {d.get('date')} | Title: {d.get('title')} | Diagnosis: {d.get('diagnosis')}")
    for b in bills:
        if f"{b['patientNom']} {b['patientPrenom']}".upper() == norm:
            print(f"  Bill ID: {b['id']} | Date: {b.get('date')} | Type: {b.get('type')} | Gross: {b.get('grossTotal')} | Intervention: {b.get('intervention')}")

show_info("OURO GBELE ADIYATOU")
show_info("OROGBERE HADIATOU")

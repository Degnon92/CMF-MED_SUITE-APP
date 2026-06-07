import json
import os

workspace_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
bills_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "bills_db.json")

with open(bills_db_path, "r", encoding="utf-8") as f:
    bills = json.load(f)

# Group bills by patient key
grouped = {}
for b in bills:
    key = (b["patientNom"], b["patientPrenom"])
    grouped.setdefault(key, []).append(b)

for key, patient_bills in grouped.items():
    if len(patient_bills) > 1:
        # Check if there is a DETAIL_ASSUR and a PROFORMA with the same grossTotal
        details = [b for b in patient_bills if b["type"] == "DETAIL_ASSUR"]
        proformas = [b for b in patient_bills if b["type"] == "PROFORMA"]
        
        for d in details:
            for p in proformas:
                if d["grossTotal"] == p["grossTotal"]:
                    print(f"Match found for patient {key[0]} {key[1]} (Total: {d['grossTotal']}):")
                    print(f"  Detail bill : {d['id']} ({d['reference']}) | useSplit={d.get('useSplit')} | partAssur={d['partAssurance']} | partPat={d['partPatient']}")
                    print(f"  Proforma bill: {p['id']} ({p['reference']}) | useSplit={p.get('useSplit')} | partAssur={p['partAssurance']} | partPat={p['partPatient']}")
                    print("-" * 50)

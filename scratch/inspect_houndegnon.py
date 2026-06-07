import json

with open("documents_db.json", "r", encoding="utf-8") as f:
    docs = json.load(f)

for d in docs:
    if "HOUNDEGNON" in d.get("patientNom", "").upper():
        print(f"ID: {d['id']} | Nom: {d['patientNom']} {d['patientPrenom']}")
        print("Content length:", len(d.get("content", "")))
        print("Content preview:")
        print(d.get("content", "")[:600])
        print("...")
        print(d.get("content", "")[-600:])

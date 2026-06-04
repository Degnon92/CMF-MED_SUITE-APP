import json
import os

workspace_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
patients_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "patients_db.json")
bills_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "bills_db.json")
documents_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "documents_db.json")

def search_file(path, query):
    if not os.path.exists(path):
        print(f"{os.path.basename(path)} not found")
        return
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    matches = []
    # If list
    if isinstance(data, list):
        for idx, item in enumerate(data):
            # serialize item to search
            item_str = json.dumps(item, ensure_ascii=False)
            if query.upper() in item_str.upper():
                matches.append((idx, item))
    elif isinstance(data, dict):
        for k, v in data.items():
            item_str = json.dumps(v, ensure_ascii=False)
            if query.upper() in k.upper() or query.upper() in item_str.upper():
                matches.append((k, v))
    print(f"Found {len(matches)} matches in {os.path.basename(path)}:")
    for m in matches[:10]:
        print(m)

search_file(patients_db_path, "TOSSOU")
search_file(documents_db_path, "TOSSOU")
search_file(bills_db_path, "TOSSOU")

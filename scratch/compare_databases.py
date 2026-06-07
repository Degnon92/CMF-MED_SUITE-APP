import json
import os

workspace_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
app_dir = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop")

files = {
    "patients": ("patients_db.json", "patients_db.backup.json"),
    "bills": ("bills_db.json", "bills_db_backup_before_reimport.json"),
    "docs": ("documents_db.json", "documents_db.BACKUP_PRE_PURGE.json")
}

for name, (curr, bk) in files.items():
    curr_path = os.path.join(app_dir, curr)
    bk_path = os.path.join(app_dir, bk)
    
    print(f"\n=== COMPARISON FOR {name.upper()} ===")
    
    if os.path.exists(curr_path):
        with open(curr_path, "r", encoding="utf-8") as f:
            curr_data = json.load(f)
        print(f"Current database: {len(curr_data)} entries")
    else:
        print("Current database not found")
        curr_data = []
        
    if os.path.exists(bk_path):
        with open(bk_path, "r", encoding="utf-8") as f:
            bk_data = json.load(f)
        print(f"Backup database: {len(bk_data)} entries")
    else:
        print("Backup database not found")
        bk_data = []

    # Search for CMC in both
    print("--- SEARCH FOR 'CMC' ---")
    curr_cmc = []
    for item in curr_data:
        str_val = json.dumps(item).upper()
        if "CMC" in str_val:
            curr_cmc.append(item)
    print(f"Current CMC matches: {len(curr_cmc)}")
    if curr_cmc:
        print("Examples in Current:")
        for item in curr_cmc[:3]:
            if isinstance(item, dict):
                print(f"  - {item.get('name') or item.get('patientNom') or item.get('id')}")
            else:
                print(f"  - {item}")
                
    bk_cmc = []
    for item in bk_data:
        str_val = json.dumps(item).upper()
        if "CMC" in str_val:
            bk_cmc.append(item)
    print(f"Backup CMC matches: {len(bk_cmc)}")
    if bk_cmc:
        print("Examples in Backup:")
        for item in bk_cmc[:3]:
            if isinstance(item, dict):
                print(f"  - {item.get('name') or item.get('patientNom') or item.get('id')}")
            else:
                print(f"  - {item}")
                
    # Search for 'NOM.' or 'NOM..' or 'NOM...' in both
    print("--- SEARCH FOR 'NOM...' ---")
    curr_nom_dots = [item for item in curr_data if "NOM..." in json.dumps(item).upper() or "NOM." in json.dumps(item).upper()]
    bk_nom_dots = [item for item in bk_data if "NOM..." in json.dumps(item).upper() or "NOM." in json.dumps(item).upper()]
    print(f"Current 'NOM...' matches: {len(curr_nom_dots)}")
    print(f"Backup 'NOM...' matches: {len(bk_nom_dots)}")

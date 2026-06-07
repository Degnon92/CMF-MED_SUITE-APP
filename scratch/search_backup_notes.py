import json
import os

app_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
bk_path = os.path.join(app_dir, "bills_db_backup_before_reimport.json")

if os.path.exists(bk_path):
    with open(bk_path, "r", encoding="utf-8") as f:
        bills = json.load(f)
    
    print("Inspecting backup bills keys and notes:")
    found_keys = set()
    sample_notes = []
    
    for b in bills:
        for k in b.keys():
            found_keys.add(k)
        # Search for any fields that contain text about notes
        for k, v in b.items():
            if "note" in k.lower() or "comment" in k.lower():
                if v:
                    sample_notes.append((k, v))
                    
    print(f"All keys in backup bills: {found_keys}")
    print(f"Total notes found: {len(sample_notes)}")
    if sample_notes:
        print("Sample notes:")
        for k, v in sample_notes[:5]:
            print(f"  {k}: {v}")
else:
    print("Backup bills not found")

import json
import os

app_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
bk_path = os.path.join(app_dir, "bills_db_backup_before_reimport.json")

if os.path.exists(bk_path):
    with open(bk_path, "r", encoding="utf-8") as f:
        bills = json.load(f)
    
    sig_cachet_counts = {}
    for b in bills:
        sig = b.get("showSig")
        cachet = b.get("showCachet")
        key = (sig, cachet)
        sig_cachet_counts[key] = sig_cachet_counts.get(key, 0) + 1
        
    print("Sigs and cachet combinations in backup:")
    for (sig, cachet), count in sig_cachet_counts.items():
        print(f"  showSig: {sig}, showCachet: {cachet} -> {count} bills")
else:
    print("Backup bills not found")

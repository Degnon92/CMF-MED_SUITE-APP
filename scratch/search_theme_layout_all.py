import re
import glob

keywords = ["setTheme", "setEditorLayout", "new-patient-type", "bill-patient-type", "handleBillPriseEnChargeChange", "priseEnCharge"]

for file_path in glob.glob("*.js"):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    print(f"=== File: {file_path} ===")
    for kw in keywords:
        matches = [m.start() for m in re.finditer(kw, content)]
        if matches:
            print(f"  Keyword: {kw} -> Matches at: {matches}")
            for m in matches:
                line_num = content.count('\n', 0, m) + 1
                line = content.split('\n')[line_num - 1]
                print(f"    Line {line_num}: {line[:120].strip()}")

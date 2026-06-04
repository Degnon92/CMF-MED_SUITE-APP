import re

with open("app.js", "r", encoding="utf-8") as f:
    content = f.read()

keywords = ["setTheme", "setEditorLayout", "new-patient-type", "bill-patient-type", "handleBillPriseEnChargeChange"]

for kw in keywords:
    matches = [m.start() for m in re.finditer(kw, content)]
    print(f"Keyword: {kw} -> Matches at positions: {matches}")
    for m in matches:
        # get line number
        line_num = content.count('\n', 0, m) + 1
        line = content.split('\n')[line_num - 1]
        print(f"  Line {line_num}: {line[:120]}")

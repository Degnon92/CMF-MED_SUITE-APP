with open("exports.js", "r", encoding="utf-8") as f:
    content = f.read()

import re
keywords = ["matricule", "insurance", "insurer", "priseEnCharge", "excel", "xlsx", "exportSingleBillToExcel", "exportFullRegisterToExcel"]
for kw in keywords:
    matches = [m.start() for m in re.finditer(kw, content, re.IGNORECASE)]
    print(f"Keyword '{kw}': {len(matches)} matches")
    for m in matches[:5]:
        line_num = content.count('\n', 0, m) + 1
        line = content.split('\n')[line_num - 1]
        print(f"  Line {line_num}: {line[:120].strip()}")

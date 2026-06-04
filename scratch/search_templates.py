with open("documents.js", "r", encoding="utf-8") as f:
    content = f.read()

import re
match = re.search(r'const MEDICAL_TEMPLATES', content)
if match:
    idx = match.start()
    line_num = content.count('\n', 0, idx) + 1
    print(f"Found MEDICAL_TEMPLATES starting at line {line_num}")
    lines = content.split('\n')
    for idx2 in range(line_num - 1, line_num + 150):
        if idx2 < len(lines):
            print(f"{idx2+1}: {lines[idx2][:120]}")

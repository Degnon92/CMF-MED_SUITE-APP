with open("documents.js", "r", encoding="utf-8") as f:
    content = f.read()

import re
match = re.search(r'function updateDocPreview', content)
if match:
    idx = match.start()
    line_num = content.count('\n', 0, idx) + 1
    print(f"Found updateDocPreview starting at line {line_num}")
    lines = content.split('\n')
    for idx2 in range(line_num - 1, min(line_num + 100, len(lines))):
        print(f"{idx2+1}: {lines[idx2][:120]}")

with open("styles.css", "r", encoding="utf-8") as f:
    content = f.read()

import re
matches = [m.start() for m in re.finditer("emerald", content, re.IGNORECASE)]
print(f"Total 'emerald' matches: {len(matches)}")
for m in matches[:10]:
    line_num = content.count('\n', 0, m) + 1
    line = content.split('\n')[line_num - 1]
    print(f"Line {line_num}: {line.strip()}")

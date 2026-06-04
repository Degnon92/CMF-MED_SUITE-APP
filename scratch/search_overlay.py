with open("styles.css", "r", encoding="utf-8") as f:
    content = f.read()

import re
matches = [m.start() for m in re.finditer("modal-overlay", content)]
print(f"Total 'modal-overlay' matches: {len(matches)}")
for m in matches:
    line_num = content.count('\n', 0, m) + 1
    # print lines around line_num
    for idx in range(line_num - 2, line_num + 30):
        if idx < len(content.split('\n')):
            print(f"{idx+1}: {content.split('\n')[idx]}")

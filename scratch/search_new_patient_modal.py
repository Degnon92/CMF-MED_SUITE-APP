with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

import re
match = re.search(r'id="new-patient-modal"', content)
if match:
    idx = match.start()
    line_num = content.count('\n', 0, idx) + 1
    # print lines around line_num
    print("Found #new-patient-modal:")
    for idx2 in range(line_num - 2, line_num + 35):
        if idx2 < len(content.split('\n')):
            print(f"{idx2+1}: {content.split('\n')[idx2]}")

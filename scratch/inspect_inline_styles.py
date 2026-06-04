import re
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

with open("index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Find inline styles with white backgrounds
matches = [m.start() for m in re.finditer(r'style="[^"]*(background-color|background|color)\s*:[^"]*(white|#fff|#2d3748|#1a202c|#2d3748|#4a5568)[^"]*"', content)]
print(f"Total matching inline style elements: {len(matches)}")
for m in matches:
    line_num = content.count('\n', 0, m) + 1
    line = content.split('\n')[line_num - 1]
    print(f"Line {line_num}: {line.strip()[:140]}")

import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('../styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

import re

for selector in ['aside', 'main', 'app-container']:
    print(f"=== Matches for {selector} ===")
    pattern = re.compile(r'(body\.[^{]*|)?\b' + re.escape(selector) + r'\b[^{]*\{[^}]*\}', re.DOTALL)
    for m in pattern.finditer(content):
        print(m.group(0))
        print("-" * 40)

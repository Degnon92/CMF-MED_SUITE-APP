import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

buttons = re.findall(r'<button[^>]*>.*?</button>', content, re.DOTALL)
for btn in buttons:
    # remove unicode/non-ascii for safe console printing
    clean_btn = btn.encode('ascii', errors='ignore').decode('ascii')
    # only print if contains significant keywords
    if any(k in clean_btn.lower() for k in ['save', 'print', 'pdf', 'enregistrer', 'modifier', 'casser', 'supprimer', 'delete']):
        print(clean_btn)

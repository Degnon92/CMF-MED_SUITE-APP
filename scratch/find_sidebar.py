import sys
sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\styles.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()
for i, line in enumerate(lines):
    if 'sidebar' in line.lower() or 'doc-' in line.lower():
        print(f'{i+1}: {line.strip()}')

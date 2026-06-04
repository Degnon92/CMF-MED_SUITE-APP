import os

base_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
index_path = os.path.join(base_dir, "index.html")

with open(index_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'id="bill-diagnostic"' in line or 'id="bill-intervention"' in line or 'id="bill-show-diag"' in line or 'id="bill-show-interv"' in line:
        print(f"{i+1}: {line.strip()}")

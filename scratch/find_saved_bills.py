import os

base_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"

for f in ['app.js', 'billing.js']:
    path = os.path.join(base_dir, f)
    if os.path.exists(path):
        print(f"=== {f} ===")
        with open(path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            for i, line in enumerate(lines):
                if 'savedbills' in line.lower() and ('=' in line or 'push' in line or 'unshift' in line or 'splice' in line or 'find' in line):
                    print(f"{i+1}: {line.strip()[:120]}")

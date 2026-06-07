import os

base_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"

for f in ['app.js', 'billing.js']:
    path = os.path.join(base_dir, f)
    if os.path.exists(path):
        print(f"=== {f} ===")
        with open(path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            for i, line in enumerate(lines):
                if ('bill-diagnostic' in line or 'bill-intervention' in line) and '.value' in line and '=' in line and not '||' in line.split('=')[0]:
                    print(f"{i+1}: {line.strip()}")

import os

base_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"

for f in ['app.js', 'billing.js', 'index.html', 'exports.js']:
    path = os.path.join(base_dir, f)
    if os.path.exists(path):
        print(f"=== {f} ===")
        with open(path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
            for i, line in enumerate(lines):
                if 'medecine generale' in line.lower() or 'cardiologie' in line.lower():
                    print(f"{i+1}: {line.strip()[:140]}")

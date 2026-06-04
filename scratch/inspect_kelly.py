import os
import json

base_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"

# Let's search in app.js or database.js for KELLY
for f in ['app.js', 'database.js', 'billing.js']:
    path = os.path.join(base_dir, f)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as file:
            content = file.read()
            if 'kelly' in content.lower():
                print(f"Found KELLY in {f}")

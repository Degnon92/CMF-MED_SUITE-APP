import os

base_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
billing_path = os.path.join(base_dir, "billing.js")

with open(billing_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "function updateBillPreview" in line:
        print(f"Starts at: {i+1}")
    if "function " in line and i > 350 and i < 900:
        # Just to see adjacent functions
        print(f"Other function at {i+1}: {line.strip()}")

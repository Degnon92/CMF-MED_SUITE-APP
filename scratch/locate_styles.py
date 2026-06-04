import os

base_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
styles_path = os.path.join(base_dir, "styles.css")

with open(styles_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if ".print-footer" in line:
        print(f"print-footer at: {i+1}: {line.strip()}")
    if "signature-seal-container" in line:
        print(f"signature-seal-container at: {i+1}: {line.strip()}")

import os

base_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
app_path = os.path.join(base_dir, "app.js")

with open(app_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "function dynamicallyLearnNewData" in line:
        print(f"Starts at: {i+1}: {line.strip()[:140]}")

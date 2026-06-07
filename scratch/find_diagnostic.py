import os
import sys

files = ['app.js', 'billing.js', 'index.html', 'styles.css', 'exports.js']
base_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"

out_path = os.path.join(base_dir, "scratch", "search_results.txt")

with open(out_path, 'w', encoding='utf-8') as out_f:
    for f in files:
        path = os.path.join(base_dir, f)
        if os.path.exists(path):
            out_f.write(f"\n=== {f} ===\n")
            with open(path, 'r', encoding='utf-8') as file:
                lines = file.readlines()
                for i, line in enumerate(lines):
                    if any(x in line.lower() for x in ['diag', 'intervention', 'showinterv', 'k-code', 'kcode', 'print', 'pdf', 'proforma']):
                        out_f.write(f"{i+1}: {line.strip()[:150]}\n")

print("Done searching.")

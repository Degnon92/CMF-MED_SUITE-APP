import os
import glob

workspace = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"

print("--- ALL DOCX FILES IN WORKSPACE (EXCEPT APP DIR) ---")
docx_files = []
for r, d, f in os.walk(workspace):
    if "MercyFiatMedSuite" in r or "node_modules" in r or ".git" in r:
        continue
    for file in f:
        if file.endswith(".docx") and not file.startswith("~$"):
            docx_files.append(os.path.join(r, file))

print(f"Total docx files found: {len(docx_files)}")
# Group by directory
dirs = {}
for f in docx_files:
    parent = os.path.dirname(f)
    dirs[parent] = dirs.get(parent, 0) + 1

for d, count in sorted(dirs.items()):
    print(f"  {d}: {count} files")

print("\n--- ALL XLSX FILES IN WORKSPACE (EXCEPT APP DIR) ---")
xlsx_files = []
for r, d, f in os.walk(workspace):
    if "MercyFiatMedSuite" in r or "node_modules" in r or ".git" in r:
        continue
    for file in f:
        if file.endswith(".xlsx") and not file.startswith("~$"):
            xlsx_files.append(os.path.join(r, file))

print(f"Total xlsx files found: {len(xlsx_files)}")
dirs_xlsx = {}
for f in xlsx_files:
    parent = os.path.dirname(f)
    dirs_xlsx[parent] = dirs_xlsx.get(parent, 0) + 1

for d, count in sorted(dirs_xlsx.items()):
    print(f"  {d}: {count} files")

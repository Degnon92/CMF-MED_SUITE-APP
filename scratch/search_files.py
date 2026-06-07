import os

workspace_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"

dirs = ["RAPPORT CONS", "RAPPORT HOSPI CMF", "1. Document PC DR GIPSY"]

print("Searching filenames containing 'CMC' or 'CMF':")
for d in dirs:
    d_path = os.path.join(workspace_dir, d)
    if os.path.exists(d_path):
        for root, _, files in os.walk(d_path):
            for f in files:
                f_upper = f.upper()
                if "CMC" in f_upper or "CMF" in f_upper:
                    rel_path = os.path.relpath(os.path.join(root, f), workspace_dir)
                    print(f"  - {rel_path}")

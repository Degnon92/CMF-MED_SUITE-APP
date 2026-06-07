import os
import glob

workspace_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
scratch_dir = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "scratch")

print(f"Scanning files in {scratch_dir}...")
files_to_fix = glob.glob(os.path.join(scratch_dir, "**", "*.py"), recursive=True) + \
               glob.glob(os.path.join(scratch_dir, "**", "*.bat"), recursive=True)

fixed_count = 0
for filepath in files_to_fix:
    if os.path.basename(filepath) == "fix_paths.py":
        continue
    try:
        with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
        
        # Check both lower and upper variations of Degnon
        new_content = content.replace("Degnon", "Farus")
        
        if new_content != content:
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(new_content)
            print(f"Fixed paths in: {filepath}")
            fixed_count += 1
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

print(f"Finished. Fixed paths in {fixed_count} files.")

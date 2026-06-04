import glob

for fp in glob.glob("*.js"):
    with open(fp, "r", encoding="utf-8") as f:
        content = f.read()
    if "injectAIExtraction" in content:
        print(f"Found in {fp}")
        lines = content.split('\n')
        for i, l in enumerate(lines):
            if "function injectAIExtraction" in l:
                print(f"  Line {i+1}: {l}")
                for j in range(i, min(i + 50, len(lines))):
                    print(f"    {j+1}: {lines[j]}")
                break

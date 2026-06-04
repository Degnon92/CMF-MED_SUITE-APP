import glob

for fp in glob.glob("*.js"):
    with open(fp, "r", encoding="utf-8") as f:
        content = f.read()
    if "function renderRegisterTable" in content:
        print(f"Found in {fp}")
        # print the lines of the function definition
        lines = content.split('\n')
        for i, l in enumerate(lines):
            if "function renderRegisterTable" in l:
                print(f"  Line {i+1}: {l}")
                for j in range(i, i + 35):
                    print(f"    {j+1}: {lines[j]}")
                break

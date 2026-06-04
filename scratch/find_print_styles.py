import os

base_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
styles_path = os.path.join(base_dir, "styles.css")
out_path = os.path.join(base_dir, "scratch", "print_styles.txt")

with open(styles_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

in_print = False
print_lines = []
for i, line in enumerate(lines):
    if "@media print" in line:
        in_print = True
    if in_print:
        print_lines.append(f"{i+1}: {line}")
        if len(print_lines) > 200:
            break

with open(out_path, 'w', encoding='utf-8') as out_f:
    out_f.write("".join(print_lines))

print("Done writing print styles.")

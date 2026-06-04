import sys
sys.stdout.reconfigure(encoding='utf-8')

with open('../styles.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    line_lower = line.lower()
    if 'sidebar' in line_lower or 'main-content' in line_lower or 'app-container' in line_lower or 'position:' in line_lower:
        print(f"Line {i+1}: {line.strip()}")

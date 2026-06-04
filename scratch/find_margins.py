with open('../styles.css', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'margin' in line.lower() and ('left' in line.lower() or 'right' in line.lower() or '-' in line.lower()):
        print(f"Line {i+1}: {line.strip()}")

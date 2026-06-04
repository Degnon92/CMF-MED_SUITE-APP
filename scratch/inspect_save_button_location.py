with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
for idx, line in enumerate(lines):
    if 'saveActiveBill()' in line:
        print(f"Around line {idx+1}:")
        start = max(0, idx - 10)
        end = min(len(lines), idx + 10)
        for i in range(start, end):
            print(f"{i+1}: {lines[i]}")

with open('../styles.css', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's count open/close braces
open_braces = 0
in_comment = False
in_string = None
lines = content.split('\n')

for i, line in enumerate(lines):
    j = 0
    while j < len(line):
        if not in_comment and line[j:j+2] == '/*':
            in_comment = True
            j += 2
            continue
        if in_comment and line[j:j+2] == '*/':
            in_comment = False
            j += 2
            continue
        if in_comment:
            j += 1
            continue
        
        char = line[j]
        if char == '{':
            open_braces += 1
        elif char == '}':
            open_braces -= 1
            if open_braces < 0:
                print(f"Error: Unmatched closing brace at line {i+1}")
                open_braces = 0 # reset
        j += 1

if open_braces > 0:
    print(f"Error: Unmatched opening braces. Total remaining open: {open_braces}")
else:
    print("All braces match perfectly!")

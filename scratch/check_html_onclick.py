import re
import os
import glob

# 1. Parse index.html to find all onclick attributes
with open("index.html", "r", encoding="utf-8") as f:
    html_content = f.read()

# Find occurrences of onclick="..."
onclick_matches = re.findall(r'onclick=["\']([^"\']+)["\']', html_content)

onclick_calls = set()
for match in onclick_matches:
    # Match function name (e.g. switchSection('dashboard') -> switchSection)
    func_match = re.match(r'^\s*([a-zA-Z0-9_]+)\s*\(', match)
    if func_match:
        onclick_calls.add(func_match.group(1))
    else:
        # Check inline JS that might call multiple statements
        statements = match.split(';')
        for stmt in statements:
            func_stmt = re.search(r'([a-zA-Z0-9_]+)\s*\(', stmt)
            if func_stmt:
                onclick_calls.add(func_stmt.group(1))

print(f"Found {len(onclick_calls)} unique functions called by onclick in index.html:")
for func in sorted(onclick_calls):
    print(f" - {func}")

# 2. Parse all javascript files in the root folder to find function declarations and window exports
declared_funcs = set()
js_files = glob.glob("*.js")

# Add some common built-in or electron/node functions
declared_funcs.update(["confirm", "alert", "prompt", "window.print", "print"])

for js_file in js_files:
    with open(js_file, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Match standard function declarations
    funcs1 = re.findall(r'function\s+([a-zA-Z0-9_]+)\s*\(', content)
    declared_funcs.update(funcs1)
    
    # Match window exports (e.g., window.foo = foo)
    funcs2 = re.findall(r'window\.([a-zA-Z0-9_]+)\s*=', content)
    declared_funcs.update(funcs2)
    
    # Match object declarations (like window.MercyFiatCalculations = { foo: function... })
    # We will also add those manually or dynamically if needed, but let's check
    funcs3 = re.findall(r'([a-zA-Z0-9_]+):\s*function', content)
    declared_funcs.update(funcs3)

# Also check functions declared inside register_ui.js (dynamic HTML)
with open("register_ui.js", "r", encoding="utf-8") as f:
    reg_content = f.read()
# Match onclick calls in template strings
dynamic_onclicks = re.findall(r'onclick=["\']([a-zA-Z0-9_]+)\s*\(', reg_content)
print(f"\nFound {len(set(dynamic_onclicks))} unique functions called dynamically in register_ui.js:")
for func in sorted(set(dynamic_onclicks)):
    print(f" - {func}")

all_required_funcs = onclick_calls.union(dynamic_onclicks)

# 3. Compare and find missing
missing_funcs = []
for func in all_required_funcs:
    if func not in declared_funcs:
        # Check if it's an inline assignment or toggle
        if func in ["event", "toggle", "preventDefault", "stopPropagation"]:
            continue
        missing_funcs.append(func)

print("\n--- RESULTS OF BUTTON AUDIT ---")
if missing_funcs:
    print(f"WARNING: Found {len(missing_funcs)} missing functions:")
    for func in missing_funcs:
        print(f" [MISSING] {func} is called in HTML/Templates but not found in JS!")
else:
    print("SUCCESS: All buttons and menu triggers have corresponding JavaScript functions.")

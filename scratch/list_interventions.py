import re
import os

database_path = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\database.js"

with open(database_path, "r", encoding="utf-8") as f:
    content = f.read()

start_match = re.search(r'INTERVENTIONS:\s*\[', content)
if start_match:
    start_idx = start_match.start()
    brackets = 1
    end_idx = start_match.end()
    while brackets > 0 and end_idx < len(content):
        char = content[end_idx]
        if char == '[':
            brackets += 1
        elif char == ']':
            brackets -= 1
        end_idx += 1
    
    interventions_block = content[start_idx:end_idx]
    raw_items = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', interventions_block)
    print(f"There are {len(raw_items)} items. The first 150 items are:")
    for item in sorted(raw_items)[:150]:
        print("-", item)
    print("\n...\n")
    print("The last 50 items are:")
    for item in sorted(raw_items)[-50:]:
        print("-", item)

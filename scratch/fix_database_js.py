import os
import re

database_js_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\database.js"

if not os.path.exists(database_js_path):
    print("database.js not found!")
    exit(1)

with open(database_js_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

output_lines = []
in_diagnoses = False
in_interventions = False

diagnoses_items = []
interventions_items = []

for line in lines:
    line_str = line.strip()
    
    if "DIAGNOSES: [" in line:
        in_diagnoses = True
        output_lines.append("DIAGNOSES: [\n")
        continue
    elif "INTERVENTIONS: [" in line:
        in_interventions = True
        output_lines.append("INTERVENTIONS: [\n")
        continue
    
    if in_diagnoses:
        if line_str == "]" or line_str == "]," or line_str.startswith("};"):
            in_diagnoses = False
            # Clean and write all diagnoses
            for idx, item in enumerate(diagnoses_items):
                escaped = item.replace('"', '\\"')
                comma = "," if idx < len(diagnoses_items) - 1 else ""
                output_lines.append(f'        "{escaped}"{comma}\n')
            output_lines.append("    ],\n" if line_str == "]," else "    ]\n")
            continue
        else:
            # Strip leading space, leading quote, trailing quote and comma
            m = re.match(r'^\s*"(.*)"\s*,?\s*$', line)
            if m:
                diagnoses_items.append(m.group(1))
            else:
                # Fallback if unescaped quote broke it
                content = line.strip()
                if content.startswith('"'):
                    content = content[1:]
                if content.endswith(','):
                    content = content[:-1]
                if content.endswith('"'):
                    content = content[:-1]
                diagnoses_items.append(content)
            continue
            
    if in_interventions:
        if line_str == "]" or line_str == "]," or line_str.startswith("};"):
            in_interventions = False
            # Clean and write all interventions
            for idx, item in enumerate(interventions_items):
                escaped = item.replace('"', '\\"')
                comma = "," if idx < len(interventions_items) - 1 else ""
                output_lines.append(f'        "{escaped}"{comma}\n')
            output_lines.append("    ],\n" if line_str == "]," else "    ]\n")
            continue
        else:
            m = re.match(r'^\s*"(.*)"\s*,?\s*$', line)
            if m:
                interventions_items.append(m.group(1))
            else:
                content = line.strip()
                if content.startswith('"'):
                    content = content[1:]
                if content.endswith(','):
                    content = content[:-1]
                if content.endswith('"'):
                    content = content[:-1]
                interventions_items.append(content)
            continue

    output_lines.append(line)

with open(database_js_path, "w", encoding="utf-8") as f:
    f.writelines(output_lines)

print("database.js syntax fixed successfully!")

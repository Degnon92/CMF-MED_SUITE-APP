import re

with open("documents.js", "r", encoding="utf-8") as f:
    text = f.read()

# Find the MEDICAL_TEMPLATES block
templates_match = re.search(r"const MEDICAL_TEMPLATES = \{(.*?)\};", text, re.DOTALL)
if not templates_match:
    print("Could not find MEDICAL_TEMPLATES block.")
    exit(1)

templates_block = templates_match.group(1)

# Find all templates
# A template is like: template_id: { ... text: `...` }
templates = re.findall(r"([a-z0-9_]+):\s*\{.*?text:\s*`([^`]*)`", templates_block, re.DOTALL)

print(f"Found {len(templates)} templates:")
for t_id, t_text in templates:
    has_patient = "Patient :" in t_text or "PATIENT :" in t_text
    has_title = t_id.upper().replace("_", " ") in t_text
    print(f"Template '{t_id}':")
    print(f"  Starts with: {repr(t_text[:120])}")
    print(f"  Has Patient: {has_patient}, Has Title-like: {has_title}")

import json, os, sys, re
sys.stdout.reconfigure(encoding="utf-8")
desktop = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"

# ── Fix documents_db.json ─────────────────────────────────────────────────
docs_path = os.path.join(desktop, "documents_db.json")
with open(docs_path, "r", encoding="utf-8") as f:
    docs = json.load(f)

fixes = {
    "DOC-REAL-AUTO-196": {
        "patientNom": "SOBAKPO",
        "patientPrenom": "Iréné",
        "patientAge": "51 ans",  # from the text: "âgé de 51 ans"
    },
    "DOC-REAL-AUTO-199": {
        "patientNom": "TOSSOU",
        "patientPrenom": "Vivien",
        "patientAge": "33 ans",  # from the text: "âgé de 33 ans"
    },
    # DOC-REAL-AUTO-590 is a mission report, mark clearly
    "DOC-REAL-AUTO-590": {
        "patientNom": "MISSION VASCULAIRE",
        "patientPrenom": "2023",
        "patientAge": "",
    },
}

count_fixed = 0
for doc in docs:
    doc_id = doc.get("id")
    if doc_id in fixes:
        for k, v in fixes[doc_id].items():
            doc[k] = v
        count_fixed += 1
        print(f"Fixed {doc_id}: {fixes[doc_id]}")

with open(docs_path, "w", encoding="utf-8") as f:
    json.dump(docs, f, ensure_ascii=False, indent=2)

print(f"\nFixed {count_fixed} documents in documents_db.json")

# ── Now fix real_data.js similarly ───────────────────────────────────────
real_path = os.path.join(desktop, "real_data.js")
with open(real_path, "r", encoding="utf-8") as f:
    raw = f.read()

# Find and fix each corrupted entry in real_data.js by ID
for doc_id, fix_data in fixes.items():
    # Pattern: find the block containing this ID and replace the corrupted fields
    # We'll do targeted regex replacements for each field
    for field, new_val in fix_data.items():
        if not new_val:
            continue
        # Find occurrences of this field near this ID
        # Strategy: find id then replace next occurrence of the field within ~500 chars
        id_pos = raw.find(f'"id": "{doc_id}"')
        if id_pos == -1:
            id_pos = raw.find(f'"id":"{doc_id}"')
        if id_pos == -1:
            continue
        
        # Look ahead for the field within 800 chars
        window = raw[id_pos:id_pos+800]
        
        # Replace in window only
        pattern = rf'"{field}"\s*:\s*"[^"]*"'
        replacement = f'"{field}": "{new_val}"'
        new_window = re.sub(pattern, replacement, window, count=1)
        
        if new_window != window:
            raw = raw[:id_pos] + new_window + raw[id_pos+800:]
            print(f"Fixed {field} in real_data.js for {doc_id}")

with open(real_path, "w", encoding="utf-8") as f:
    f.write(raw)

print("\nAll fixes applied to real_data.js")
print("\nDone!")

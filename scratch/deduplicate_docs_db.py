import json
import os

db_path = 'documents_db.json'
if not os.path.exists(db_path):
    print("documents_db.json not found!")
    exit(1)

with open(db_path, 'r', encoding='utf-8') as f:
    docs = json.load(f)

print(f"Loaded {len(docs)} documents.")

# Deduplicate by ID
seen_ids = set()
unique_docs = []
duplicates_removed = 0

for d in docs:
    doc_id = d.get('id')
    if not doc_id:
        unique_docs.append(d)
        continue
    
    if doc_id in seen_ids:
        duplicates_removed += 1
    else:
        seen_ids.add(doc_id)
        unique_docs.append(d)

print(f"Found and removed {duplicates_removed} duplicate records by ID.")

# Also de-duplicate by content/metadata (patient, date, title, category) to be safe
seen_keys = set()
final_docs = []
metadata_duplicates_removed = 0

for d in unique_docs:
    nom = (d.get('patientNom') or '').upper().strip()
    prenom = (d.get('patientPrenom') or '').upper().strip()
    date = d.get('date', '').strip()
    category = (d.get('category') or '').upper().strip()
    title = (d.get('title') or '').upper().strip()
    
    key = f"{nom}||{prenom}||{date}||{category}||{title}"
    if key in seen_keys:
        metadata_duplicates_removed += 1
    else:
        seen_keys.add(key)
        final_docs.append(d)

print(f"Found and removed {metadata_duplicates_removed} duplicate records by metadata key (patient, date, type).")
print(f"Final document count: {len(final_docs)}")

with open(db_path, 'w', encoding='utf-8') as f:
    json.dump(final_docs, f, ensure_ascii=False, indent=2)

print("Database successfully saved.")

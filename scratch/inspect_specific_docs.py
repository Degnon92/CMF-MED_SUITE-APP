import json
import os

desktop_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
docs_path = os.path.join(desktop_dir, "documents_db.json")

with open(docs_path, "r", encoding="utf-8") as f:
    docs = json.load(f)

for doc_id in ["DOC-REAL-AUTO-183", "DOC-REAL-AUTO-184"]:
    d = [doc for doc in docs if doc["id"] == doc_id][0]
    print(f"\n=== {doc_id} ===")
    print(d["content"])

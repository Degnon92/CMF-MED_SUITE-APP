import json
import os
import re

desktop_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
docs_path = os.path.join(desktop_dir, "documents_db.json")

with open(docs_path, "r", encoding="utf-8") as f:
    docs = json.load(f)

d = [doc for doc in docs if doc["id"] == "DOC-REAL-AUTO-183"][0]
print("=== DOC-REAL-AUTO-183 Patient lines ===")
lines = d["content"].split("\n")
for idx, line in enumerate(lines):
    if "patient" in line.lower() or "je soussign" in line.lower() or "certifie" in line.lower():
        print(f"Line {idx}: {repr(line)}")

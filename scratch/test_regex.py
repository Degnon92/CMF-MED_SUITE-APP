import json
import os
import re

desktop_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
docs_path = os.path.join(desktop_dir, "documents_db.json")

with open(docs_path, "r", encoding="utf-8") as f:
    docs = json.load(f)

# Find Record 1
doc = [d for d in docs if d["id"] == "DOC-REAL-AUTO-1"][0]
content = doc["content"]

# Let's test a very flexible regex with no comma before the name
certif_pattern = r"(?:certifie|certifions)\s+avoir\s+(?:consult|examin|hospitalis|reç|admi|re)[^\s]*\s+(?:ce\s+jour\s+)?(?:depuis\s+le\s+[^,]+?)?\s*(?:M\.|Mr|Monsieur|Mme|Madame|l['’]enfant|le\s+nomm[^\s]*|la\s+nomm[^\s]*|le\s+nomm)?\s*([A-Za-z\s’'\-]{2,40}?[A-Za-z\s’'\-]+?)\s*,\s*[^\s]*g[^\s]*\s+de"

print("Trying to match...")
match = re.search(certif_pattern, content)
if match:
    print("MATCH FOUND!")
    print(f"Group 1: {repr(match.group(1))}")
else:
    print("NO MATCH FOUND.")

import json
import re

with open("documents_db.json", "r", encoding="utf-8") as f:
    docs = json.load(f)

for d in docs:
    content = d.get("content", "")
    # Check if the text is repeated twice
    # We can split the content by newlines or lines, or just check if it contains the same block twice
    half = len(content) // 2
    if half > 100:
        first_half = content[:half].strip()
        second_half = content[half:].strip()
        # Clean whitespaces
        fh_clean = re.sub(r'\s+', ' ', first_half)
        sh_clean = re.sub(r'\s+', ' ', second_half)
        if fh_clean == sh_clean or sh_clean.startswith(fh_clean[:100]) and difflib_like_ratio(fh_clean, sh_clean) > 0.9:
            print(f"Doc ID: {d['id']} | Patient: {d['patientNom']} {d['patientPrenom']} | Content length: {len(content)} | Repetition detected!")
            
def difflib_like_ratio(s1, s2):
    import difflib
    return difflib.SequenceMatcher(None, s1, s2).ratio()

# Print first 3 documents content to inspect
print("\n--- FIRST 3 DOCS PREVIEW ---")
for i, d in enumerate(docs[:3]):
    print(f"\nID: {d['id']} | Title: {d['title']}")
    content_lines = d.get('content', '').split('\n')
    print("Preview (first 10 lines):")
    for line in content_lines[:10]:
        print("  ", line)

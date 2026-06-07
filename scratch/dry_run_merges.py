import json
import os
import re
import difflib

workspace_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
patients_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "patients_db.json")

with open(patients_db_path, "r", encoding="utf-8") as f:
    patients = json.load(f)

# Accents removal mapping
import unicodedata
def strip_accents(text):
    try:
        text = unicode(text, 'utf-8')
    except NameError:
        pass
    text = unicodedata.normalize('NFD', text)
    text = text.encode('ascii', 'ignore')
    return text.decode("utf-8")

def normalize_name(name):
    if not name:
        return ""
    # Convert to uppercase & strip accents
    s = strip_accents(name.upper())
    # Remove administrative suffixes like (AA), (13 ANS), etc.
    s = re.sub(r'\(.*?\)', '', s)
    s = re.sub(r'\b(?:OK|COPIE|POINT|DETAILS|ASSUR|URO|CHIPED|FGA|AVOIR)\b', '', s)
    # Remove middle initials: single characters optionally followed by dot
    # e.g., " J. ", " T. ", " P ", " S. "
    s = re.sub(r'\b[A-Z]\.?\b', ' ', s)
    # Keep only letters
    s = re.sub(r'[^A-Z]', ' ', s)
    # Normalize spaces
    s = " ".join(s.split())
    return s

# Group patients
grouped = []
visited = set()

for i, p1 in enumerate(patients):
    if i in visited:
        continue
    
    group = [p1]
    visited.add(i)
    norm1 = normalize_name(p1["name"])
    if not norm1:
        continue
        
    for j, p2 in enumerate(patients):
        if j in visited:
            continue
        norm2 = normalize_name(p2["name"])
        if not norm2:
            continue
            
        # Determine matching
        matched = False
        if norm1 == norm2:
            matched = True
        else:
            # Check SequenceMatcher
            ratio = difflib.SequenceMatcher(None, norm1.replace(" ", ""), norm2.replace(" ", "")).ratio()
            if ratio >= 0.90:
                # Extra check: make sure the first word (Nom) is highly similar
                w1 = norm1.split()[0] if norm1.split() else ""
                w2 = norm2.split()[0] if norm2.split() else ""
                w_ratio = difflib.SequenceMatcher(None, w1, w2).ratio()
                if w_ratio >= 0.85:
                    matched = True
                    
        if matched:
            group.append(p2)
            visited.add(j)
            
    if len(group) > 1:
        grouped.append(group)

print(f"Total groups of duplicates found: {len(grouped)}")
print("\nProposed Merges details:")
for g in grouped[:40]:
    print(f"\nGroup (Canonical Suggestion: '{max(g, key=lambda x: len(x['name']))['name']}'):")
    for member in g:
        print(f"  - '{member['name']}' | Age: '{member.get('age')}' | Insurer: '{member.get('insurer')}' | Diag: '{member.get('diagnosis')}' | Interv: '{member.get('intervention')}'")

import json
import os
import difflib
import re
import unicodedata

workspace_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
patients_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "patients_db.json")

with open(patients_db_path, "r", encoding="utf-8") as f:
    patients = json.load(f)

def strip_accents(text):
    text = unicodedata.normalize('NFD', text)
    text = text.encode('ascii', 'ignore')
    return text.decode("utf-8")

def normalize_name(name):
    if not name:
        return ""
    s = strip_accents(name.upper())
    s = re.sub(r'\(.*?\)', '', s)
    s = re.sub(r'\b(?:OK|COPIE|POINT|DETAILS|ASSUR|URO|CHIPED|FGA|AVOIR|POINT DEF|POINT JR|DETAILS ASSUR)\b', '', s)
    s = re.sub(r'\b[A-Z]\.?\b', ' ', s)
    s = re.sub(r'[^A-Z]', ' ', s)
    return " ".join(s.split())

names = [p["name"] for p in patients]
norm_names = [normalize_name(n) for n in names]

potential_dups = []
for i, n1 in enumerate(names):
    norm1 = norm_names[i]
    if not norm1:
        continue
    for j in range(i+1, len(names)):
        n2 = names[j]
        norm2 = norm_names[j]
        if not norm2:
            continue
            
        ratio = difflib.SequenceMatcher(None, norm1.replace(" ", ""), norm2.replace(" ", "")).ratio()
        if ratio >= 0.80:
            potential_dups.append((n1, n2, ratio))

potential_dups.sort(key=lambda x: x[2], reverse=True)
print(f"Total potential similar pairs at >= 80% threshold: {len(potential_dups)}")
for p in potential_dups[:30]:
    print(f"  - '{p[0]}' vs '{p[1]}' (Similarity: {p[2]:.2f})")

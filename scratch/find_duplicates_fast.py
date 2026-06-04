import json
import os
import re
import unicodedata

workspace_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
patients_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "patients_db.json")

def strip_accents(text):
    text = unicodedata.normalize('NFD', text)
    text = text.encode('ascii', 'ignore')
    return text.decode("utf-8")

def normalize_words(name):
    if not name:
        return ""
    # strip accents, uppercase, keep only letters and numbers
    s = strip_accents(name.upper())
    # remove special suffix indicators if any (like OK, COPIE, etc.)
    s = re.sub(r'\(.*?\)', '', s)
    s = re.sub(r'\b(?:OK|COPIE|POINT|DETAILS|ASSUR|URO|CHIPED|FGA|AVOIR|POINT DEF|POINT JR|DETAILS ASSUR)\b', '', s)
    # keep only A-Z and spaces
    s = re.sub(r'[^A-Z\s]', ' ', s)
    words = s.split()
    # sort the words so order doesn't matter (e.g. 'TOSSOU VIVIEN' == 'VIVIEN TOSSOU')
    words.sort()
    return " ".join(words)

with open(patients_db_path, "r", encoding="utf-8") as f:
    patients = json.load(f)

# Group by normalized words
groups = {}
for p in patients:
    orig_name = p["name"]
    norm = normalize_words(orig_name)
    if not norm:
        continue
    if norm not in groups:
        groups[norm] = []
    groups[norm].append(p)

print("--- DUPLICATES BY WORD-SORTED EXACT MATCH ---")
exact_duplicates_count = 0
for norm, pts in groups.items():
    if len(pts) > 1:
        # Check if they are actually different strings in the DB
        unique_names = set(p["name"] for p in pts)
        print(f"Normalized: '{norm}'")
        for p in pts:
            print(f"  - '{p['name']}' (Age: {p.get('age')}, Diag: {p.get('diagnosis')}, Insurer: {p.get('insurer')})")
        exact_duplicates_count += 1

print(f"\nFound {exact_duplicates_count} groups of word-sorted exact duplicates.")

# Now find highly similar normalized names (Levenshtein distance <= 2)
# Since we have only 1053 names, comparing normalized keys is fast (1053 keys max)
norm_keys = list(groups.keys())
similar_groups = []

def levenshtein_distance(s1, s2):
    if len(s1) > len(s2):
        s1, s2 = s2, s1
    distances = range(len(s1) + 1)
    for i2, c2 in enumerate(s2):
        distances_ = [i2+1]
        for i1, c1 in enumerate(s1):
            if c1 == c2:
                distances_.append(distances[i1])
            else:
                distances_.append(1 + min((distances[i1], distances[i1 + 1], distances_[-1])))
        distances = distances_
    return distances[-1]

for i in range(len(norm_keys)):
    k1 = norm_keys[i]
    for j in range(i+1, len(norm_keys)):
        k2 = norm_keys[j]
        # skip if too different in length
        if abs(len(k1) - len(k2)) > 3:
            continue
        dist = levenshtein_distance(k1, k2)
        if dist <= 2:
            similar_groups.append((k1, k2, dist))

print("\n--- SIMILAR NAMES (Levenshtein distance <= 2) ---")
for k1, k2, dist in similar_groups[:50]:
    names1 = [p["name"] for p in groups[k1]]
    names2 = [p["name"] for p in groups[k2]]
    print(f"Distance {dist}: '{k1}' ({names1}) vs '{k2}' ({names2})")

print(f"\nFound {len(similar_groups)} similar pairs of normalized names.")

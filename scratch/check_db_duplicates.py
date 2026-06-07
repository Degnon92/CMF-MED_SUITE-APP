import json
import os
import re

workspace_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
patients_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "patients_db.json")
bills_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "bills_db.json")
documents_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "documents_db.json")

print("Checking JSON database files...")

if not os.path.exists(patients_db_path):
    print("patients_db.json not found!")
    exit(1)

with open(patients_db_path, "r", encoding="utf-8") as f:
    patients = json.load(f)

with open(bills_db_path, "r", encoding="utf-8") as f:
    bills = json.load(f)

with open(documents_db_path, "r", encoding="utf-8") as f:
    docs = json.load(f)

print(f"Loaded {len(patients)} patients from database.")
print(f"Loaded {len(bills)} bills from database.")
print(f"Loaded {len(docs)} documents from database.")

# Check for exact duplicate names
names = [p["name"].strip() for p in patients]
upper_names = [n.upper() for n in names]

duplicates = {}
for name in names:
    uname = name.upper()
    if upper_names.count(uname) > 1:
        duplicates[uname] = duplicates.get(uname, 0) + 1

if duplicates:
    print(f"\nFound {len(duplicates)} duplicate patient names in patients_db.json (case-insensitive):")
    for uname, count in duplicates.items():
        matching = [p for p in patients if p["name"].upper() == uname]
        print(f"  - '{uname}' (found {count} times):")
        for m in matching:
            print(f"    Age: {m.get('age')}, Insurer: {m.get('insurer')}, Diag: {m.get('diagnosis')}, Interv: {m.get('intervention')}")
else:
    print("\nNo exact duplicate patient names (case-insensitive) found in patients_db.json. Perfect!")

# Let's check for similar names (e.g. spelling variations or missing spaces)
# We can compute a basic distance or check if one name is a subset of another, or has the same letters.
from collections import Counter
def clean_chars(s):
    return re.sub(r'[^A-Z]', '', s.upper())

cleaned_names = [clean_chars(n) for n in names]
similar_groups = {}
for i, n1 in enumerate(names):
    cn1 = cleaned_names[i]
    for j in range(i+1, len(names)):
        n2 = names[j]
        cn2 = cleaned_names[j]
        # Check if they are very similar (e.g. cn1 == cn2, or one contains the other and they share a last name)
        if cn1 == cn2:
            similar_groups[(n1, n2)] = "Same letters when removing non-alpha"
        elif len(cn1) > 4 and len(cn2) > 4:
            # check distance
            import difflib
            ratio = difflib.SequenceMatcher(None, cn1, cn2).ratio()
            if ratio > 0.88 and ratio < 1.0:
                similar_groups[(n1, n2)] = f"Similarity ratio: {ratio:.2f}"

if similar_groups:
    print(f"\nFound {len(similar_groups)} highly similar patient names:")
    for (n1, n2), reason in list(similar_groups.items())[:20]:
        print(f"  - '{n1}' vs '{n2}' ({reason})")
else:
    print("\nNo highly similar names found.")

# Let's inspect the bills to make sure they are linked to existing patients
unlinked_bills = []
for b in bills:
    patient_full = f"{b['patientNom']} {b['patientPrenom']}".strip().upper()
    # Also try reverse
    patient_full_rev = f"{b['patientPrenom']} {b['patientNom']}".strip().upper()
    
    found = False
    for p in patients:
        p_name_upper = p["name"].strip().upper()
        if p_name_upper == patient_full or p_name_upper == patient_full_rev:
            found = True
            break
        # Check if last name and first name words are subset
        p_words = set(p_name_upper.split())
        b_words = set((b['patientNom'].upper() + " " + b['patientPrenom'].upper()).split())
        if p_words == b_words:
            found = True
            break
            
    if not found:
        unlinked_bills.append(b)

print(f"\nUnlinked bills: {len(unlinked_bills)}")
if unlinked_bills:
    print("Some unlinked bills sample:")
    for ub in unlinked_bills[:10]:
        print(f"  Bill ID: {ub['id']}, Patient: {ub['patientNom']} {ub['patientPrenom']}, Insurance: {ub['insurance']}")

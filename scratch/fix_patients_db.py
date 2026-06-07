import json
import os
import re
import difflib

desktop_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
patients_path = os.path.join(desktop_dir, "patients_db.json")

with open(patients_path, "r", encoding="utf-8") as f:
    patients = json.load(f)

print(f"Loaded {len(patients)} patients from patients_db.json.")

# Accents removal mapping
import unicodedata
def strip_accents(text):
    text = unicodedata.normalize('NFD', text)
    return "".join(c for c in text if unicodedata.category(c) != 'Mn')

def normalize_name(name):
    if not name:
        return ""
    s = strip_accents(name.upper())
    # Remove administrative suffixes like (AA), (13 ANS), etc.
    s = re.sub(r'\(.*?\)', '', s)
    s = re.sub(r'\b(?:OK|COPIE|POINT|DETAILS|ASSUR|URO|CHIPED|FGA|AVOIR)\b', '', s)
    # Remove single middle initials
    s = re.sub(r'\b[A-Z]\.?\b', ' ', s)
    # Keep only letters
    s = re.sub(r'[^A-Z]', ' ', s)
    s = " ".join(s.split())
    return s

def clean_patient_name_final(name):
    name = re.sub(r"^(?:M\.|Mr|Monsieur|Mme|Madame|l['’]enfant|le\s+nommé|la\s+nommée|patient(?:e)?)\s+", "", name, flags=re.IGNORECASE)
    # remove trailing punctuations
    name = re.sub(r"[\s\-\.\,\:\_]+$", "", name).strip()
    name = re.sub(r"\b(?:age|âge|ans|le)\b.*$", "", name, flags=re.IGNORECASE)
    name = name.replace("", "")
    return re.sub(r"\s+", " ", name).strip()

# Clean all names first
for p in patients:
    p["name"] = clean_patient_name_final(p["name"])

# Group similar/exact patients
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
            
        matched = False
        if norm1 == norm2:
            matched = True
        else:
            # Check similarity ratio
            ratio = difflib.SequenceMatcher(None, norm1.replace(" ", ""), norm2.replace(" ", "")).ratio()
            if ratio >= 0.90:
                # verify first word (family name)
                w1 = norm1.split()[0] if norm1.split() else ""
                w2 = norm2.split()[0] if norm2.split() else ""
                w_ratio = difflib.SequenceMatcher(None, w1, w2).ratio()
                if w_ratio >= 0.85:
                    matched = True
                    
        if matched:
            group.append(p2)
            visited.add(j)
            
    grouped.append(group)

# Merge groups
merged_patients = []
for g in grouped:
    if len(g) == 1:
        # Check if single patient name is clean and keep it
        p = g[0]
        if len(p["name"]) > 2 and not p["name"].upper() in ["D'", "DE", "DR", "DR GIPSY", "DE CONSULTATION TRAUMATO LOTO FC", "AVRIL", "DEC", "DECEMBRE", "FEV", "JUILLET", "NOV", "OCT", "SEPTEMBRE"]:
            merged_patients.append(p)
        continue
        
    # Merge rules for group
    # 1. Best name: not containing test suffixes, correctly capitalized, longest
    best_name = g[0]["name"]
    for m in g:
        # prefer name without digits or special characters and longest
        if not any(c.isdigit() for c in m["name"]) and len(m["name"]) > len(best_name):
            best_name = m["name"]
            
    # 2. Best age: not "35 ans" or "35", if there is a better one
    best_age = "35 ans"
    for m in g:
        age = m.get("age", "")
        if age:
            digits = "".join(filter(str.isdigit, str(age)))
            if digits and digits != "35":
                best_age = age
                break
            elif age:
                best_age = age
                
    # 3. Best diagnosis: not "Bilan clinique" or "Bilan clinique", if there is another
    best_diag = "Bilan clinique"
    for m in g:
        diag = m.get("diagnosis", "")
        if diag and diag.strip() and "Bilan clinique" not in diag:
            best_diag = diag.strip()
            break
            
    # 4. Best insurer: not "PRIVE", if there is another
    best_insurer = "PRIVE"
    for m in g:
        ins = m.get("insurer", "")
        if ins and ins != "PRIVE":
            best_insurer = ins
            break
            
    # 5. Best intervention: non-empty
    best_interv = ""
    best_k_code = ""
    for m in g:
        interv = m.get("intervention", "")
        if interv and interv.strip():
            best_interv = interv.strip()
            best_k_code = m.get("kCode", "")
            break
            
    # 6. Prise en charge: max
    best_pec = max([m.get("priseEnCharge", 0) for m in g])
    
    # 7. Matricule: non-empty
    best_mat = ""
    for m in g:
        mat = m.get("matricule", "")
        if mat and mat.strip():
            best_mat = mat.strip()
            break
            
    # Combine into a single record
    merged_p = {
        "name": best_name,
        "diagnosis": best_diag,
        "intervention": best_interv,
        "kCode": best_k_code,
        "age": best_age,
        "matricule": best_mat,
        "insurer": best_insurer,
        "priseEnCharge": best_pec
    }
    
    # Check if name is not corrupted/admin keyword
    if len(best_name) > 2 and not best_name.upper() in ["D'", "DE", "DR", "DR GIPSY", "DE CONSULTATION TRAUMATO LOTO FC", "AVRIL", "DEC", "DECEMBRE", "FEV", "JUILLET", "NOV", "OCT", "SEPTEMBRE"]:
        merged_patients.append(merged_p)

print(f"Deduplicated patients count: {len(merged_patients)} (removed {len(patients) - len(merged_patients)} duplicates).")

# Save patients_db.json
with open(patients_path, "w", encoding="utf-8") as f:
    json.dump(merged_patients, f, ensure_ascii=False, indent=4)
print("Saved patients_db.json.")

import json
import os
import re
import unicodedata

workspace_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
app_dir = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop")

patients_db_path = os.path.join(app_dir, "patients_db.json")
documents_db_path = os.path.join(app_dir, "documents_db.json")
bills_db_path = os.path.join(app_dir, "bills_db.json")
real_data_js_path = os.path.join(app_dir, "real_data.js")
database_js_path = os.path.join(app_dir, "database.js")

# Helper to normalize for lookup matching
def strip_accents(text):
    text = unicodedata.normalize('NFD', text)
    text = text.encode('ascii', 'ignore')
    return text.decode("utf-8")

def normalize(name):
    if not name:
        return ""
    s = strip_accents(name.upper())
    s = re.sub(r'[^A-Z]', '', s)
    return s

def split_nom_prenom(full_name):
    parts = full_name.strip().split(' ')
    if len(parts) == 1:
        return full_name.upper(), ""
    nom_parts = []
    prenom_parts = []
    for part in parts:
        if part.isupper() and len(part) > 1:
            nom_parts.append(part)
        else:
            prenom_parts.append(part)
    if not nom_parts:
        nom = parts[0].upper()
        prenom = " ".join(parts[1:])
    else:
        nom = " ".join(nom_parts).upper()
        prenom = " ".join(prenom_parts)
    if not prenom and len(parts) > 1:
        nom = parts[0].upper()
        prenom = " ".join(parts[1:])
    return nom.strip(), prenom.strip()

# Definitions of groups to merge
groups_definition = [
    {
        "canonical": "ADEOSSI Anne-Véronique",
        "matches": ["ADEOSSI VERONIQUE", "ADEOSSI ANNEVERONIQUE", "ADEOSSIANNEVERONIQUE", "ADEOSSIVERONIQUE"]
    },
    {
        "canonical": "YARARISSOUNON Malick",
        "matches": ["YARARISSOUNON MALICK", "YARAKISSINON MALICK", "YARARISSOUNONMALICK", "YARAKISSINONMALICK"]
    },
    {
        "canonical": "AKO Jean-Jacques",
        "matches": ["AKO JACQUES", "AKO JEAN JACQUES", "AKO JEANJACQUES", "AKOJEANJACQUES", "AKOJACQUES"]
    }
]

print("Loading databases...")
with open(patients_db_path, "r", encoding="utf-8") as f:
    patients = json.load(f)
with open(documents_db_path, "r", encoding="utf-8") as f:
    docs = json.load(f)
with open(bills_db_path, "r", encoding="utf-8") as f:
    bills = json.load(f)

# Helper to check if a name belongs to a group
def get_matching_group_index(name):
    norm_name = normalize(name)
    for idx, group in enumerate(groups_definition):
        # check if it matches canonical or any of the match patterns
        if norm_name == normalize(group["canonical"]) or any(norm_name == normalize(m) for m in group["matches"]):
            return idx
    return -1

# Group current patient records
grouped_patients = {0: [], 1: [], 2: []}
other_patients = []

for p in patients:
    g_idx = get_matching_group_index(p["name"])
    if g_idx != -1:
        grouped_patients[g_idx].append(p)
    else:
        other_patients.append(p)

# Merge each group
merged_patients = []
for idx, group_def in enumerate(groups_definition):
    members = grouped_patients[idx]
    if not members:
        print(f"No patients found for group: {group_def['canonical']}")
        continue
        
    print(f"Merging {len(members)} patient records into '{group_def['canonical']}':")
    for m in members:
        print(f"  - '{m['name']}' | Age: '{m.get('age')}' | Insurer: '{m.get('insurer')}' | Diag: '{m.get('diagnosis')}' | Interv: '{m.get('intervention')}'")
        
    # Merge details
    ages = [m.get("age") for m in members]
    specific_ages = [a for a in ages if a and a != "N/A" and a != "45 ans" and a != "35 ans"]
    best_age = specific_ages[0] if specific_ages else (ages[0] if ages else "N/A")
    if not best_age or best_age == "N/A":
        valid_ages = [a for a in ages if a and a != "N/A"]
        best_age = valid_ages[0] if valid_ages else "N/A"
        
    diagnoses = [m.get("diagnosis") for m in members]
    specific_diag = [d for d in diagnoses if d and d != "Bilan clinique" and len(d) > 3]
    best_diag = max(specific_diag, key=len) if specific_diag else "Bilan clinique"
    
    interventions = [(m.get("intervention"), m.get("kCode")) for m in members]
    specific_interv = [t for t in interventions if t[0] and len(t[0]) > 3]
    best_interv, best_kcode = max(specific_interv, key=lambda x: len(x[0])) if specific_interv else ("", "")
    
    insurers = [(m.get("insurer"), m.get("priseEnCharge", 0)) for m in members]
    specific_insurer = [t for t in insurers if t[0] and t[0] != "PRIVE"]
    best_insurer, best_coverage = specific_insurer[0] if specific_insurer else ("PRIVE", 0)
    
    matricules = [m.get("matricule") for m in members]
    specific_mat = [m for m in matricules if m and m != "N/A" and len(m) > 1]
    best_matricule = specific_mat[0] if specific_mat else ""
    
    merged_pat = {
        "name": group_def["canonical"],
        "diagnosis": best_diag,
        "intervention": best_interv,
        "kCode": best_kcode,
        "age": best_age,
        "matricule": best_matricule,
        "insurer": best_insurer,
        "priseEnCharge": best_coverage
    }
    merged_patients.append(merged_pat)

final_patients = other_patients + merged_patients
print(f"New total patients in database: {len(final_patients)} (originally {len(patients)})")

# Update name references in bills and documents
def update_name_in_record(record):
    nom = record.get("patientNom", "")
    prenom = record.get("patientPrenom", "")
    full_name = f"{nom} {prenom}".strip()
    
    g_idx = get_matching_group_index(full_name)
    if g_idx != -1:
        canon_name = groups_definition[g_idx]["canonical"]
        canon_nom, canon_prenom = split_nom_prenom(canon_name)
        record["patientNom"] = canon_nom
        record["patientPrenom"] = canon_prenom
        
        # Merge diagnostic and intervention for bills if applicable
        if "grossTotal" in record: # it's a bill
            if g_idx == 0: # ADEOSSI
                record["intervention"] = "Cure Hernie Ombilicale"
                record["showInterv"] = True
            elif g_idx == 1: # YARARISSOUNON
                record["diagnostic"] = "rupture du ménisque médial droit"
                record["intervention"] = "Arthroscopie diagnostique et therapeutique du genou Droit"
                record["showInterv"] = True
            elif g_idx == 2: # AKO
                record["diagnostic"] = "rupture complète du ligament croisé antérieur et fissure du ménisque médial"
                record["intervention"] = "Arthroscopie diagnostique reconstruction LCA et Ménisectomie"
                record["showInterv"] = True

# Update all documents
for d in docs:
    update_name_in_record(d)
    
# Update all bills
for b in bills:
    update_name_in_record(b)

# Write back database files
with open(patients_db_path, "w", encoding="utf-8") as f:
    json.dump(final_patients, f, indent=4, ensure_ascii=False)

with open(documents_db_path, "w", encoding="utf-8") as f:
    json.dump(docs, f, indent=4, ensure_ascii=False)

with open(bills_db_path, "w", encoding="utf-8") as f:
    json.dump(bills, f, indent=4, ensure_ascii=False)

# Update real_data.js
js_content = f"""/* ==========================================
   real_data.js - Vrais Rapports Médicaux Clinique Mercy Fiat
   ========================================== */

window.MercyFiatRealDocs = {json.dumps(docs, indent=4, ensure_ascii=False)};
"""
with open(real_data_js_path, "w", encoding="utf-8") as f:
    f.write(js_content)

print("Database files saved successfully.")

# Update autocomplete in database.js
diagnoses_set = set()
interventions_set = set()

for p in final_patients:
    if p.get("diagnosis") and p["diagnosis"] != "Bilan clinique":
        diagnoses_set.add(p["diagnosis"])
    if p.get("intervention"):
        interventions_set.add(p["intervention"])

for d in docs:
    if d.get("diagnosis") and d["diagnosis"] != "Bilan clinique":
        diagnoses_set.add(d["diagnosis"])
    if d.get("intervention"):
        interventions_set.add(d["intervention"])

for b in bills:
    if b.get("diagnostic") and b["diagnostic"] != "Bilan clinique":
        diagnoses_set.add(b["diagnostic"])
    if b.get("intervention"):
        interventions_set.add(b["intervention"])

with open(database_js_path, "r", encoding="utf-8") as f:
    db_content = f.read()

clean_diagnoses = sorted([diag.replace('"', '\\"') for diag in diagnoses_set if diag and len(diag) > 4 and len(diag) < 120])
clean_interventions = sorted([inter.replace('"', '\\"') for inter in interventions_set if inter and len(inter) > 4 and len(inter) < 120])

diag_regex = re.compile(r'DIAGNOSES:\s*\[[\s\S]*?\s*\]', re.MULTILINE)
new_diags_str = f"DIAGNOSES: [\n" + ",\n".join(f'        "{d}"' for d in clean_diagnoses) + "\n    ]"
db_content = diag_regex.sub(new_diags_str, db_content)

interv_regex = re.compile(r'INTERVENTIONS:\s*\[[\s\S]*?\s*\]', re.MULTILINE)
new_intervs_str = f"INTERVENTIONS: [\n" + ",\n".join(f'        "{i}"' for i in clean_interventions) + "\n    ]"
db_content = interv_regex.sub(new_intervs_str, db_content)

with open(database_js_path, "w", encoding="utf-8") as f:
    f.write(db_content)

print(f"Updated database.js with {len(clean_diagnoses)} unique diagnoses and {len(clean_interventions)} unique interventions.")
print("Merge completed successfully!")

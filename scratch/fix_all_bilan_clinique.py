import os
import json
import re

workspace_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
patients_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "patients_db.json")
bills_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "bills_db.json")
docs_extracted_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "scratch", "docs_extracted.json")
real_data_js_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "real_data.js")

# 1. Load real_data.js docs
real_docs = []
try:
    with open(real_data_js_path, "r", encoding="utf-8") as f:
        js_content = f.read()
    # Find window.MercyFiatRealDocs = [ ... ]
    # A simple regex to find all json-like structures
    # Since it's valid JS, we can extract the JSON array.
    m = re.search(r"window\.MercyFiatRealDocs\s*=\s*(\[.*?\]);", js_content, re.DOTALL)
    if m:
        # Simple cleanups to make it valid JSON (remove trailing commas, etc. if any)
        # Or parse it using a simple json parser after removing JS comments
        clean_js = re.sub(r"//.*?\n", "\n", m.group(1))
        # Remove trailing commas before closing braces/brackets
        clean_js = re.sub(r",\s*(\]|\})", r"\1", clean_js)
        real_docs = json.loads(clean_js)
except Exception as e:
    print(f"Error parsing real_docs from real_data.js: {e}")

# 2. Load docs_extracted.json
extracted_docs = []
if os.path.exists(docs_extracted_path):
    try:
        with open(docs_extracted_path, "r", encoding="utf-8") as f:
            extracted_docs = json.load(f)
    except Exception as e:
        print(f"Error loading docs_extracted: {e}")

# Merge all source docs
all_source_docs = real_docs + extracted_docs
print(f"Loaded {len(all_source_docs)} source reports/documents.")

# Helper to normalize names
def normalize_name(name):
    if not name:
        return ""
    # Remove accents, keep letters and spaces
    name = name.lower()
    name = re.sub(r"[éèêëàâäîïôöûüçù]", lambda m: {"é":"e", "è":"e", "ê":"e", "ë":"e", "à":"a", "â":"a", "ä":"a", "î":"i", "ï":"i", "ô":"o", "ö":"o", "û":"u", "ü":"u", "ç":"c", "ù":"u"}[m.group(0)], name)
    # Remove non-alphanumeric, split by spaces
    parts = re.findall(r"[a-z]+", name)
    return " ".join(parts)

# Create lookup map for docs: normalized name -> doc details
doc_lookup = {}
for d in all_source_docs:
    p_nom = d.get("patientNom") or d.get("patientName") or ""
    p_prenom = d.get("patientPrenom") or ""
    full_name = f"{p_nom} {p_prenom}".strip()
    norm = normalize_name(full_name)
    if not norm:
        continue
    
    diag = d.get("diagnosis") or d.get("diagnostic") or ""
    interv = d.get("intervention") or ""
    k_code = d.get("kCode") or d.get("kcode") or ""
    age = d.get("patientAge") or d.get("age") or ""
    insurer = d.get("insurer") or d.get("insurance") or ""
    matricule = d.get("matricule") or ""
    
    # We want docs that have real diagnosis or intervention
    if norm not in doc_lookup:
        doc_lookup[norm] = []
    doc_lookup[norm].append({
        "diagnosis": diag,
        "intervention": interv,
        "kCode": k_code,
        "age": age,
        "insurer": insurer,
        "matricule": matricule,
        "content": d.get("content", "")
    })

# Load patients_db.json
with open(patients_db_path, "r", encoding="utf-8") as f:
    patients = json.load(f)

# Load bills_db.json
with open(bills_db_path, "r", encoding="utf-8") as f:
    bills = json.load(f)

# Function to search matches in doc_lookup
def find_doc_match(full_name):
    norm = normalize_name(full_name)
    if not norm:
        return None
    # 1. Exact match
    if norm in doc_lookup:
        return doc_lookup[norm]
    # 2. Try match if all parts of norm are in doc_lookup key or vice versa
    norm_parts = set(norm.split())
    if len(norm_parts) >= 2:
        for k, v in doc_lookup.items():
            k_parts = set(k.split())
            if len(k_parts) >= 2 and (norm_parts.issubset(k_parts) or k_parts.issubset(norm_parts)):
                return v
    return None

# Fix patients
fixed_patients_count = 0
for p in patients:
    name = p["name"]
    # Check if we have Bilan clinique or empty intervention
    is_default_diag = p.get("diagnosis") in ["Bilan clinique", "Bilan Clinique", "", None]
    is_empty_interv = p.get("intervention") in ["", None]
    
    # Special override for NOUKPOZOUNKOU BIENVENU
    if "NOUKPOZOUNKOU" in name.upper():
        p["diagnosis"] = "Séquelles de fractures multiples / Ablation de matériel d'ostéosynthèse multi-sites"
        p["intervention"] = "Ablation des matériels d'ostéosynthèse des deux fémurs, du tibia gauche et de la cheville gauche"
        p["kCode"] = "K348"
        p["age"] = "44 ans"
        p["insurer"] = "AFRICAINE_SINISTRE"
        p["priseEnCharge"] = 100
        p["matricule"] = "2018/0141"
        fixed_patients_count += 1
        print(f"Fixed specific patient: {name}")
        continue
        
    if is_default_diag or is_empty_interv:
        docs = find_doc_match(name)
        if docs:
            # Sort to find the one with best diagnostic/intervention
            best_doc = None
            for d in docs:
                if d["diagnosis"] and d["diagnosis"] != "Bilan clinique":
                    best_doc = d
                    break
            if not best_doc:
                best_doc = docs[0]
            
            updated = False
            if is_default_diag and best_doc["diagnosis"] and best_doc["diagnosis"] != "Bilan clinique":
                p["diagnosis"] = best_doc["diagnosis"]
                updated = True
            if is_empty_interv and best_doc["intervention"]:
                p["intervention"] = best_doc["intervention"]
                if best_doc["kCode"]:
                    p["kCode"] = best_doc["kCode"]
                updated = True
                
            if updated:
                fixed_patients_count += 1
                print(f"Updated patient '{name}' from docs -> Diag: {p['diagnosis']}, Interv: {p['intervention']}")

# Fix bills
fixed_bills_count = 0
for b in bills:
    p_nom = b.get("patientNom") or ""
    p_prenom = b.get("patientPrenom") or ""
    full_name = f"{p_nom} {p_prenom}".strip()
    
    is_default_diag = b.get("diagnostic") in ["Bilan clinique", "Bilan Clinique", "", None]
    is_empty_interv = b.get("intervention") in ["", None]
    
    # Special override for NOUKPOZOUNKOU BIENVENU
    if "NOUKPOZOUNKOU" in full_name.upper():
        b["diagnostic"] = "Séquelles de fractures multiples / Ablation de matériel d'ostéosynthèse multi-sites"
        b["intervention"] = "Ablation des matériels d'ostéosynthèse des deux fémurs, du tibia gauche et de la cheville gauche"
        b["kCode"] = "K348"
        b["insurance"] = "AFRICAINE_SINISTRE"
        b["coverage"] = 100
        b["matricule"] = "2018/0141"
        fixed_bills_count += 1
        print(f"Fixed specific bill for: {full_name}")
        continue
        
    if is_default_diag or is_empty_interv:
        docs = find_doc_match(full_name)
        if docs:
            best_doc = None
            for d in docs:
                if d["diagnosis"] and d["diagnosis"] != "Bilan clinique":
                    best_doc = d
                    break
            if not best_doc:
                best_doc = docs[0]
                
            updated = False
            if is_default_diag and best_doc["diagnosis"] and best_doc["diagnosis"] != "Bilan clinique":
                b["diagnostic"] = best_doc["diagnosis"]
                updated = True
            if is_empty_interv and best_doc["intervention"]:
                b["intervention"] = best_doc["intervention"]
                if best_doc["kCode"]:
                    b["kCode"] = best_doc["kCode"]
                updated = True
                
            if updated:
                fixed_bills_count += 1
                print(f"Updated bill for '{full_name}' from docs -> Diag: {b['diagnostic']}, Interv: {b['intervention']}")

# Save databases
with open(patients_db_path, "w", encoding="utf-8") as f:
    json.dump(patients, f, indent=4, ensure_ascii=False)
with open(bills_db_path, "w", encoding="utf-8") as f:
    json.dump(bills, f, indent=4, ensure_ascii=False)

print(f"\nDone: Fixed {fixed_patients_count} patients, {fixed_bills_count} bills.")

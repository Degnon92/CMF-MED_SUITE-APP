"""
fix_real_data_names.py
Scans real_data.js for corrupted patient names (CE jour, D', DE, etc.)
and extracts the real patient names from the report content.
Applies all fixes directly to real_data.js AND documents_db.json.
"""
import json, os, re, sys
sys.stdout.reconfigure(encoding='utf-8')

desktop = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
real_path = os.path.join(desktop, "real_data.js")
docs_path = os.path.join(desktop, "documents_db.json")

# ── Helper: extract patient name from report content ─────────────────────────
def extract_patient_from_content(content):
    """
    Try several regex patterns to extract the real patient name from a report.
    Returns (nom, prenom, age) or (None, None, None) if not found.
    """
    # Pattern 1: "certifie avoir consulté ce jour, le DD mois YYYY M./Mme LASTNAME Firstname, âgé(e) de N ans"
    p1 = re.search(
        r'(?:consulté|consulte|hospitalisé|hospitalisee|examiné|examinee|suivi)\s+(?:ce\s+jour|le\s+[\w\s]+\d{4}),?\s+(?:Monsieur|M\.|Madame|Mme|Mlle)?\s*([A-ZÁÀÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇ][A-ZÁÀÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇ\s\-\']+?),?\s+âgé[ee]?\s+de\s+(\d+)\s+ans',
        content, re.IGNORECASE
    )
    if p1:
        full = p1.group(1).strip()
        age = p1.group(2) + " ans"
        parts = full.split(None, 1)
        if parts:
            nom = parts[0].upper()
            prenom = parts[1] if len(parts) > 1 else ""
            return nom, prenom, age

    # Pattern 2: "M./Mme LASTNAME Firstname, âgé(e) de N ans" without ce jour
    p2 = re.search(
        r'(?:Monsieur|M\.|Madame|Mme|Mlle)\s+([A-ZÁÀÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇ][A-ZÁÀÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇ\s\-\']+?),?\s+âgé[ee]?\s+de\s+(\d+)\s+ans',
        content, re.IGNORECASE
    )
    if p2:
        full = p2.group(1).strip()
        age = p2.group(2) + " ans"
        parts = full.split(None, 1)
        nom = parts[0].upper()
        prenom = parts[1] if len(parts) > 1 else ""
        return nom, prenom, age

    # Pattern 3: From "AGE : N ans" line + subsequent patient mention
    p3_age = re.search(r'AGE\s*:\s*(\d+)\s*ans', content, re.IGNORECASE)
    p3_name = re.search(
        r'(?:Monsieur|M\.|Madame|Mme|Mlle)\s+([A-ZÁÀÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇ][A-ZÁÀÂÃÄÅÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÇ\s\-\']+?)(?:,|\.|âgé)',
        content, re.IGNORECASE
    )
    if p3_name:
        full = p3_name.group(1).strip()
        parts = full.split(None, 1)
        nom = parts[0].upper()
        prenom = parts[1] if len(parts) > 1 else ""
        age = p3_age.group(1) + " ans" if p3_age else ""
        return nom, prenom, age

    return None, None, None

# BAD names to fix
BAD_NAMES = {"CE", "D'", "DE", "FEUIL", "FEUILLE", "", "MISSION VASCULAIRE"}

# ── Load documents_db.json ────────────────────────────────────────────────────
with open(docs_path, "r", encoding="utf-8") as f:
    docs = json.load(f)

fixes_applied = {}  # id -> {nom, prenom, age}
total_fixed = 0

for doc in docs:
    nom = doc.get("patientNom", "").strip()
    prenom = doc.get("patientPrenom", "").strip()

    need_fix = (
        nom in BAD_NAMES or
        (nom == "CE" and "jour" in prenom.lower()) or
        (nom.upper() == "CE" and prenom.lower().startswith("jour")) or
        len(nom) < 2
    )

    if need_fix:
        content = doc.get("content", "")
        new_nom, new_prenom, new_age = extract_patient_from_content(content)
        if new_nom and len(new_nom) >= 2:
            old_nom = doc.get("patientNom", "")
            old_prenom = doc.get("patientPrenom", "")
            doc["patientNom"] = new_nom
            doc["patientPrenom"] = new_prenom if new_prenom else old_prenom
            if new_age and (not doc.get("patientAge") or doc.get("patientAge") == "35 ans"):
                doc["patientAge"] = new_age
            # Update title too
            if doc.get("title") and ("CE jour" in doc["title"] or "jour" in doc.get("title","")):
                doc["title"] = f"{doc.get('category','Rapport')} - {new_nom} {new_prenom}".strip()
            fixes_applied[doc["id"]] = {
                "old": f"{old_nom} {old_prenom}",
                "new": f"{new_nom} {new_prenom}",
                "age": new_age
            }
            total_fixed += 1
        else:
            print(f"WARNING: Could not extract name for {doc['id']} (nom='{nom}', prenom='{prenom}')")
            print(f"  Content[:200]: {content[:200]}")
            print()

print(f"Fixed {total_fixed} documents in documents_db.json")
for doc_id, fix in fixes_applied.items():
    print(f"  {doc_id}: '{fix['old']}' -> '{fix['new']}' (age: {fix['age']})")

# Save documents_db.json
with open(docs_path, "w", encoding="utf-8") as f:
    json.dump(docs, f, ensure_ascii=False, indent=2)
print(f"\nSaved documents_db.json")

# ── Now apply same fixes to real_data.js ─────────────────────────────────────
print(f"\nApplying {total_fixed} fixes to real_data.js...")
with open(real_path, "r", encoding="utf-8") as f:
    raw = f.read()

for doc_id, fix in fixes_applied.items():
    # Find the ID in real_data.js
    id_pos = raw.find(f'"id": "{doc_id}"')
    if id_pos == -1:
        id_pos = raw.find(f'"id":"{doc_id}"')
    if id_pos == -1:
        print(f"  WARNING: {doc_id} not found in real_data.js")
        continue

    # Find the next 600 chars after the id
    window_end = id_pos + 600
    window = raw[id_pos:window_end]

    changed = False
    # Fix patientNom
    new_window = re.sub(
        r'"patientNom"\s*:\s*"[^"]*"',
        f'"patientNom": "{fix["new"].split()[0]}"',
        window, count=1
    )
    if new_window != window:
        changed = True
        window = new_window

    # Fix patientPrenom
    prenom_parts = fix["new"].split(None, 1)
    new_prenom = prenom_parts[1] if len(prenom_parts) > 1 else ""
    if new_prenom:
        new_window = re.sub(
            r'"patientPrenom"\s*:\s*"[^"]*"',
            f'"patientPrenom": "{new_prenom}"',
            window, count=1
        )
        if new_window != window:
            changed = True
            window = new_window

    # Fix patientAge if we have a better one
    if fix.get("age"):
        new_window = re.sub(
            r'"patientAge"\s*:\s*"35 ans"',
            f'"patientAge": "{fix["age"]}"',
            window, count=1
        )
        if new_window != window:
            changed = True
            window = new_window

    # Fix title if it contains "CE jour"
    if 'CE jour' in window or '"CE"' in window:
        new_nom = fix["new"].split()[0]
        new_prenom_val = new_prenom or ""
        new_window = re.sub(
            r'"title"\s*:\s*"([^"]*CE jour[^"]*)"',
            lambda m: f'"title": "{m.group(1).replace("CE jour", f"{new_nom} {new_prenom_val}".strip())}"',
            window, count=1
        )
        if new_window != window:
            changed = True
            window = new_window

    if changed:
        raw = raw[:id_pos] + window + raw[window_end:]
        print(f"  Fixed {doc_id}: {fix['old']} -> {fix['new']}")
    else:
        print(f"  No change needed for {doc_id} in real_data.js")

with open(real_path, "w", encoding="utf-8") as f:
    f.write(raw)
print(f"\nSaved real_data.js")
print("\nDone!")

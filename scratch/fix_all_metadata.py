import json
import os
import re

desktop_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
docs_path = os.path.join(desktop_dir, "documents_db.json")
real_data_path = os.path.join(desktop_dir, "real_data.js")

with open(docs_path, "r", encoding="utf-8") as f:
    docs = json.load(f)

# French month parsing map
months_map = {
    "janvier": "01", "fevrier": "02", "février": "02", "mars": "03", "avril": "04",
    "mai": "05", "juin": "06", "juillet": "07", "aout": "08", "août": "08",
    "septembre": "09", "octobre": "10", "novembre": "11", "decembre": "12", "décembre": "12"
}

def parse_date_to_iso(text):
    if not text:
        return None
    # match dd/mm/yyyy or dd/mm/yy
    m = re.search(r"\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b", text)
    if m:
        d = f"{int(m.group(1)):02d}"
        m_val = f"{int(m.group(2)):02d}"
        y = m.group(3)
        if len(y) == 2:
            y = f"20{y}"
        return f"{y}-{m_val}-{d}"
    # match dd month yyyy
    m_words = re.search(r"\b(\d{1,2})\s+([a-zA-Zéûûôâêîñéèàç]+)\s+(\d{4})\b", text, re.IGNORECASE)
    if m_words:
        d = f"{int(m_words.group(1)):02d}"
        month_name = m_words.group(2).lower()
        y = m_words.group(3)
        month = months_map.get(month_name, "01")
        return f"{y}-{month}-{d}"
    return None

def clean_patient_name_part(name):
    if not name:
        return ""
    # remove leading title prefixes
    name = re.sub(r"^(?:M\.|Mr|Monsieur|Mme|Madame|l['’]enfant|le\s+nommé|la\s+nommée|patient(?:e)?)\s+", "", name, flags=re.IGNORECASE)
    # remove trailing punctuations
    name = re.sub(r"[\s\-\.\,\:\_]+$", "", name).strip()
    # remove age or date patterns inside name
    name = re.sub(r"\b(?:age|âge|ans|le)\b.*$", "", name, flags=re.IGNORECASE)
    name = re.sub(r"[\s\-\.\,\:\_]+$", "", name).strip()
    return name

def extract_metadata_from_content(content):
    if not content:
        return None, None, None
        
    lines = [line.strip() for line in content.split("\n")]
    
    # 1. Search for Patient: line
    patient_line_val = None
    for line in lines:
        m = re.match(r"^(?:patient(?:e)?|patient\(e\))\s*:\s*(.*)$", line, re.IGNORECASE)
        if m:
            patient_line_val = m.group(1).strip()
            break
            
    extracted_name = None
    if patient_line_val:
        # clean any trailing info or age
        name_part = re.split(r"\b(?:age|âge|ans)\b", patient_line_val, flags=re.IGNORECASE)[0].strip()
        extracted_name = clean_patient_name_part(name_part)
        
    # 2. Search for Age line or in-text age
    extracted_age = None
    for line in lines:
        m = re.match(r"^age\s*:\s*(.*)$", line, re.IGNORECASE)
        if m:
            extracted_age = m.group(1).strip()
            if not extracted_age.endswith("ans") and not extracted_age.endswith("mois"):
                extracted_age += " ans"
            break
            
    if not extracted_age:
        # search for âgée? de XX ans or age de XX ans or g de XX ans
        age_m = re.search(r"\b(?:âg|âgée|age|âge|g|ge)\s+de\s+(\d+\s*(?:ans|g|mois|ans\s+d['’]âge))", content, re.IGNORECASE)
        if age_m:
            extracted_age = age_m.group(1).strip()
        else:
            # check for "XX ans" in text
            age_m2 = re.search(r"\b(\d+)\s*(?:ans|g|mois)\b", content, re.IGNORECASE)
            if age_m2:
                extracted_age = age_m2.group(0).strip()
                if not extracted_age.endswith("ans") and not extracted_age.endswith("mois"):
                    extracted_age += " ans"
                    
    # Clean extracted_age
    if extracted_age:
        age_num_m = re.search(r"\d+", extracted_age)
        if age_num_m:
            num = age_num_m.group(0)
            if "mois" in extracted_age.lower():
                extracted_age = f"{num} mois"
            else:
                extracted_age = f"{num} ans"

    # 3. Search for date in content
    extracted_date = None
    date_matches = re.findall(r"\b(?:le|du|en|le\s+nommé|le\s+)\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{1,2}\s+[a-zA-Zéûûôâêîñéèàç]+\s+\d{4})\b", content, re.IGNORECASE)
    if date_matches:
        for dm in reversed(date_matches):
            iso = parse_date_to_iso(dm)
            if iso:
                extracted_date = iso
                break
                
    # 4. If name was not found by "Patient:", search by "certifie avoir examiné/hospitalisé/reçu ..."
    if not extracted_name:
        certif_pattern = r"(?:certifie|certifions)\s+avoir\s+(?:consult|examin|hospitalis|reç|admi|re)[^\s]*\s+(?:ce\s+jour\s+)?(?:depuis\s+le\s+[^,]+?)?\s*(?:M\.|Mr|Monsieur|Mme|Madame|l['’]enfant|le\s+nomm[^\s]*|la\s+nomm[^\s]*|le\s+nomm)?\s*([A-Za-z\s’'\-]{2,40}?[A-Za-z\s’'\-]+?)\s*,\s*[^\s]*g[^\s]*\s+de"
        certif_m = re.search(certif_pattern, content)
        if certif_m:
            extracted_name = clean_patient_name_part(certif_m.group(1))
            
    if not extracted_name:
        certif_pattern_fallback = r"(?:certifie|certifions)\s+avoir\s+(?:consult|examin|hospitalis|reç|admi|re)[^\s]*\s+(?:ce\s+jour\s+)?(?:depuis\s+le\s+[^,]+?)?\s*(?:M\.|Mr|Monsieur|Mme|Madame|l['’]enfant|le\s+nomm[^\s]*|la\s+nomm[^\s]*|le\s+nomm)?\s*([A-Za-z\s’'\-]{2,40}?[A-Za-z\s’'\-]+?)\s*,\s*"
        certif_m2 = re.search(certif_pattern_fallback, content)
        if certif_m2:
            extracted_name = clean_patient_name_part(certif_m2.group(1))
            
    if extracted_name:
        extracted_name = extracted_name.replace("", "")
        extracted_name = re.sub(r"\s+", " ", extracted_name).strip()
        
    return extracted_name, extracted_age, extracted_date

def split_name(full_name):
    if not full_name:
        return "", ""
    words = full_name.split()
    if not words:
        return "", ""
    if len(words) == 1:
        return words[0].upper(), ""
        
    # If all words are uppercase, split first word as last name and rest as first name
    if all(w.isupper() for w in words):
        if words[0] in ["DE", "LE", "DU", "LA"] and len(words) > 2:
            return f"{words[0]} {words[1]}", " ".join(words[2:])
        return words[0], " ".join(words[1:])
        
    # If mixed case, consecutive uppercase words at start are last name
    upper_words = []
    other_words = []
    
    for w in words:
        clean_w = re.sub(r"[^A-Za-z]", "", w)
        # short particles like D', L' or words that are uppercase are last name
        if clean_w.isupper() or w in ["D'", "L'", "DE", "LE", "DU", "LA"]:
            upper_words.append(w)
        else:
            other_words.append(w)
            
    if not upper_words:
        return words[0].upper(), " ".join(words[1:])
        
    return " ".join(upper_words).upper(), " ".join(other_words)

# Update documents list
fixed_count = 0
for d in docs:
    nom = d.get("patientNom", "")
    prenom = d.get("patientPrenom", "")
    db_name = f"{nom} {prenom}".strip()
    db_age = d.get("patientAge", "")
    db_date = d.get("date", "")
    content = d.get("content", "")
    
    ext_name, ext_age, ext_date = extract_metadata_from_content(content)
    
    changed = False
    
    # 1. Name fix
    # Overwrite name if it is currently corrupted, or if we extracted a valid name that differs
    final_name = db_name
    if ext_name:
        ext_name_clean = ext_name.replace("", "").strip()
        # If current name is corrupted or contains title keywords
        is_corrupted = nom in ["D'", "DE", "Dr", "DR", "DR GIPSY"] or any(k in db_name.upper() for k in ["RAPPORT", "CONSULTATION", "HOSPITALISATION", "CERTIFICAT"])
        if is_corrupted or (ext_name_clean.upper() != db_name.replace("", "").upper() and len(ext_name_clean) > 3):
            final_name = ext_name_clean
            
    # Split the final name
    new_nom, new_prenom = split_name(final_name)
    if new_nom != nom or new_prenom != prenom:
        d["patientNom"] = new_nom
        d["patientPrenom"] = new_prenom
        changed = True
        
    # 2. Age fix
    if ext_age:
        db_age_digits = "".join(filter(str.isdigit, str(db_age)))
        ext_age_digits = "".join(filter(str.isdigit, str(ext_age)))
        if db_age_digits != ext_age_digits:
            d["patientAge"] = ext_age
            changed = True
            
    # 3. Date fix
    if ext_date and ext_date != db_date:
        d["date"] = ext_date
        changed = True
        
    # 4. Title update to reflect corrected name
    if changed:
        fixed_count += 1
        d["title"] = f"{d.get('category', 'Rapport')} - {new_nom} {new_prenom}".strip()
        # Ensure name doesn't contain replacement character
        d["patientNom"] = d["patientNom"].replace("", "")
        d["patientPrenom"] = d["patientPrenom"].replace("", "")
        d["title"] = d["title"].replace("", "")

print(f"Repaired {fixed_count} documents in documents_db.json.")

# Save documents_db.json
with open(docs_path, "w", encoding="utf-8") as f:
    json.dump(docs, f, ensure_ascii=False, indent=4)
print("Saved documents_db.json.")

# Also update real_data.js
# To do this safely, we will generate the javascript code for the array window.MercyFiatRealDocs
js_array_elements = []
for d in docs:
    # Format each dict as formatted JS object
    # We can use json.dumps and format it nicely
    element_str = json.dumps(d, ensure_ascii=False, indent=4)
    # Indent it by 4 spaces
    indented = "\n".join("    " + line for line in element_str.splitlines())
    js_array_elements.append(indented.strip())

js_code = """/* ==========================================
   real_data.js - Vrais Rapports Médicaux Clinique Mercy Fiat
   ========================================== */

window.MercyFiatRealDocs = [
""" + ",\n".join(f"    {elem}" for elem in js_array_elements) + """
];
"""

with open(real_data_path, "w", encoding="utf-8") as f:
    f.write(js_code)
print("Saved real_data.js.")

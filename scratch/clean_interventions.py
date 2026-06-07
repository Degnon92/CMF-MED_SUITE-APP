import re
import os

workspace_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
app_dir = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop")
database_path = os.path.join(app_dir, "database.js")

def clean_clinical_term(term):
    if not term:
        return ''
    clean = term.strip()
    upper = clean.upper()
    garbage_keywords = [
        "JE SOUSSIGN", "CLINIQUE", "TEL :", "TEL:", "EMAIL:", "E-MAIL", "IFU", "RCCM", 
        "ORABANK", "SEME AGUE", "CLIENT:", "DOSSIER", "PATIENT", "HOSPITALISATION", 
        "CONSULTATION", "CERTIFICAT", "SEME AGUE", "MÉDICAUX", "CHIRURGICAUX", 
        "PERSONNELS :", "PHYSIQUE, ON NOTE", "DESCRIPTION", "SIGNATURE", "COLLABORATEURS",
        "E-MAIL", "IFU :", "RCCM-RB-COT", "COTONOU VODJE", "MÉDECINE GÉNÉRALE", "MEDECINE GENERALE"
    ]
    if any(kw in upper for kw in garbage_keywords):
        return ''
    if '.' in clean:
        parts = clean.split('.')
        if len(parts[0]) < 25 and len(parts[1].strip()) > 8:
            clean = '.'.join(parts[1:]).strip()
    
    clean = re.sub(r'[\s\-\.\,\:\_]+$', '', clean).strip()
    if len(clean) < 5 or len(clean) > 110:
        return ''
    return clean

def is_valid_surgical_intervention(name):
    if not name:
        return False
    clean = name.strip()
    if len(clean) < 5 or len(clean) > 120:
        return False
    # Dates
    if re.search(r'\b\d{1,2}[/\-\.]\d{1,2}[/\-\.]\d{2,4}\b', clean):
        return False
    if re.search(r'\b\d{2}/\d{4}\b', clean):
        return False
    # Pure codes
    if re.match(r'^[A-Z0-9\-\_]+$', clean.replace(' ', '')):
        if len(clean) > 5:
            return False
            
    lower = clean.lower()
    reject_keywords = [
        "davier", "mèche", "meche", "tournevis", "screw", "plate", "drill", "coupling", 
        "hex.", "locking", "condylar", "reconstruction", "hole", "tube", "tige", 
        "broche", "vis ", " vis", "clou ", "plaque ", "spacer", "ciment", "joint", 
        "dossier", "facture", "proforma", "définitif", "definitif", "assurance", "sinistre",
        "hébergement", "hebergement", "chambre", "séjour", "sejour", "repas", 
        "médicaments", "medicaments", "consommables", "consommable", "pharmacie", 
        "laboratoire", "analyse", "cs ", "consultation", "cardiologue", "cardio", "ecg", 
        "aide", "opérateur", "operatoire", "principal", "chirurgien", "anesthésiste", 
        "anesthesiste", "anesthésie", "anesthesie", "bloc ", "gardes", "staff", "logo", 
        "relance", "reçu", "recu", "decharge", "décharge", "contrat", "réunion", "reunion", 
        "curriculum", "ngap", "tarifs", "grille", "caisse", "payant", "cotonou", "téléphone"
    ]
    if any(kw in lower for kw in reject_keywords):
        is_ablation = "ablation" in lower and any(x in lower for x in ["matériel", "materiel", "clou", "plaque", "vis", "broche", "prothèse", "prothese"])
        if not is_ablation:
            return False
    return True

print("Reading database.js...")
with open(database_path, "r", encoding="utf-8") as f:
    content = f.read()

# Extract INTERVENTIONS block
start_match = re.search(r'INTERVENTIONS:\s*\[', content)
if not start_match:
    print("INTERVENTIONS list not found!")
    exit(1)

start_idx = start_match.start()
# Find matching closing bracket
brackets = 1
end_idx = start_match.end()
while brackets > 0 and end_idx < len(content):
    char = content[end_idx]
    if char == '[':
        brackets += 1
    elif char == ']':
        brackets -= 1
    end_idx += 1

interventions_block = content[start_idx:end_idx]
print("Extracted interventions block of length:", len(interventions_block))

# Find all strings in the block
raw_items = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', interventions_block)
print(f"Found {len(raw_items)} raw items in static list.")

cleaned = []
for item in raw_items:
    # Unescape
    item_unescaped = item.replace('\\"', '"').replace('\\\\', '\\')
    term = clean_clinical_term(item_unescaped)
    if term and is_valid_surgical_intervention(term):
        # Escape back
        item_escaped = term.replace('\\', '\\\\').replace('"', '\\"')
        cleaned.append(item_escaped)

# Deduplicate & sort
cleaned = sorted(list(set(cleaned)))
print(f"Cleaned static list has {len(cleaned)} items.")

# Format the new block
new_block = "INTERVENTIONS: [\n" + ",\n".join(f'        "{i}"' for i in cleaned) + "\n    ]"

new_content = content[:start_idx] + new_block + content[end_idx:]

with open(database_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("database.js written successfully.")

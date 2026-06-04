import re
import os

workspace_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
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
        "CONSULTATION", "CERTIFICAT", "MÉDICAUX", "CHIRURGICAUX", 
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
    if re.match(r'^\d+[\/\-\.]\d+', clean):
        return False
        
    # Pure codes / reference patterns
    if re.match(r'^[A-Z0-9\-\_]+$', clean.replace(' ', '')):
        if len(clean) > 5:
            return False
            
    # Suffixes de taille ou dosage
    dosage_patterns = [
        r'\b\d+\s*mg\b',
        r'\b\d+\s*ml\b',
        r'\b\d+\s*mcg\b',
        r'\b\d+\s*mm\b',
        r'\b\d+\s*cm\b',
        r'\b\d+\s*g\b',
        r'ø\s*\d+',
        r'\d+\s*trous\b',
        r'\d+\s*holes\b',
        r'\b\d+\s*ui\b',
        r'\b\d+\s*iu\b',
        r'\b\d+\s*amp\b',
        r'\b\d+\s*cp\b',
        r'\b\d+\s*flac\b',
        r'\b\d+\s*boite\b',
        r'\b\d+\s*sachet\b'
    ]
    lower = clean.lower()
    if any(re.search(pat, lower) for pat in dosage_patterns):
        return False
        
    # 1. Vérification Whitelist (L'intervention doit contenir un de ces mots-clés chirurgicaux)
    whitelist = [
        "ablation", "osteosynthese", "ostéosynthèse", "synthese", "synthèse", "resection", "résection", 
        "cure", "arthroscopie", "menisectomie", "ménisectomie", "meniscectomie", "méniscectomie", 
        "ligamentoplastie", "reduction", "réduction", "exerese", "exérèse", "suture", "parage", 
        "arthroplastie", "pose", "montée", "descente", "retrait", "lavage", "drainage", 
        "osteotomie", "ostéotomie", "tenorraphie", "ténorraphie", "tenoplastie", "ténoplastie", 
        "amputation", "arthrodese", "arthrodèse", "confection", "enclouage", "embrochage", 
        "cerclage", "fistule", "fistulectomie", "cystostomie", "ureteroscopie", "urétéroscopie", 
        "plastie", "recalibrage", "liberation", "libération", "decompression", "décompression", 
        "laminectomie", "discectomie", "greffe", "greff", "refection", "réfection", "tenolyse", 
        "ténolyse", "vissage", "osteoclasie", "ostéoclasie", "arthrolyse", "cesarienne", "césarienne", 
        "aspiration", "amiu", "exploration", "biopsie", "dilatation", "extraction", "depose", 
        "dépose", "reconstruction", "synovectomie", "facette", "arthrodetese", "dénervation", 
        "dénervation", "neurolyse", "reprise", "ostéoclasie", "recalibrage"
    ]
    
    if not any(w in lower for w in whitelist):
        return False
        
    # 2. Mots clés de rejet stricts (Même si whiteliste matché, rejeter si contient ces mots, sauf cas AMOS)
    reject_keywords = [
        # Matériels & consommables
        "davier", "mèche", "meche", "tournevis", "screw", "plate", "drill", "coupling", 
        "hex.", "locking", "condylar", "reconstruction", "hole", "tube", "tige", 
        "broche", "vis ", " vis", "clou ", "plaque ", "spacer", "ciment", "joint", 
        "implant", "matériel", "materiel", "prothèse", "prothese", "insert", "cupule", 
        "tête", "tete", "liner", "ancillaire", "malleolar", "pediculaire", "pedicle", 
        "lcp", "dcp", "liss", "gant", "sterile", "stérile", "compresse", "bande", 
        "sparadrap", "perfuseur", "seringue", "aiguille", "catheter", "cathéter", 
        "redon", "drain", "lame", "tubulure", "poche à urine", "poche a urine", 
        "poche de sang", "champ", "masque", "lunette", "electrodes", "blouse", 
        "calot", "surchaussures", "savon", "brosse", "rasoir", "gelée", "vaseline", 
        "formol", "alcool", "ether", "eau", "glace", "vessie", "thermometre", 
        "tensiometre", "stéthoscope", "ancillaire", "fil ", "suture nylon", 
        "suture vicryl", "suture prolene", "suture monocryl", "nylon sert", 
        "vicryl sert", "prolene sert", "monocryl sert", "decimel", "vicryl 0", 
        "vicryl 2", "vicryl 3", "vicryl 4", "nylon 2", "nylon 3", "soie ", "soie",
        "instrument", "set d'", "needle", "absorbable", "synthetic", "prescrit", 
        "système", "system",
        
        # Médicaments
        "amoxicilline", "amoxicillin", "clavulanique", "paracetamol", "paracétamol", 
        "tramadol", "perfalgan", "cefuroxime", "ceftriaxone", "quinine", "artesunate", 
        "aciclovir", "betadine", "bétadine", "xylocaine", "bupivacaine", "diclofenac", 
        "ketoprofene", "kétoprofène", "fluconazole", "metronidazole", "gentamicine", 
        "ciprofloxacine", "ranitidine", "omeprazole", "spasfon", "laxis", "furosemide", 
        "enoxaparine", "loxen", "nicardipine", "neosine", "zyloric", "allopurinol", 
        "colchicine", "plaquenil", "piascledine", "salbutamol", "aerius", "desloratadine", 
        "prednisolone", "solumedrol", "methylprednisolone", "hydrocortisone", "doliprane", 
        "efferalgan", "dafalgan", "comprimé", "comprime", "tablet", "tab", "gélule", 
        "gelule", "capsule", "ampoule", "flacon", "cp", "inj", "inject", "collyre", 
        "suppo", "sirop", "crème", "creme", "pommade", "sachet", "solution", "intrants", 
        "médicaments", "medicaments", "consommables", "consommable", "pharmacie", 
        "laboratoire", "analyse", "achat", " wifi", " wifi", "boissons", "boisson", "dépenses",
        
        # Administration & Facturation
        "dossier", "facture", "proforma", "définitif", "definitif", "assurance", "sinistre",
        "hébergement", "hebergement", "chambre", "séjour", "sejour", "repas", "restauration",
        "nourriture", "cs ", "consultation", "visite", "analyses", "bilan", "laboratoire", 
        "radio", "radiographie", "cardiologue", "cardio", "ecg", "devis", "reliquat", "solde", 
        "payer", "remise", "réduction", "reduction", "rabais", "ristourne", "cro", "hospi", 
        "billet", "certificat", "attestation", "rccm", "ifu", "orabank", "seme ague", 
        "aide op", "deuxième", "aide-op", "principal", "chirurgien", "anesthésiste", 
        "anesthésie", "bloc", "garde", "staff", "logo", "relance", "reçu", "recu", 
        "decharge", "décharge", "contrat", "réunion", "reunion", "caisse", "payant", 
        "téléphone", "telephone", "carburant", "essence", "transport", "ambulance", 
        "retour", "domicile", "client", "patient", "zannou", "agbovi", "ulrich", "albert"
    ]
    
    if any(kw in lower for kw in reject_keywords):
        # Autoriser AMOS (Ablation de matériel...)
        is_ablation = any(x in lower for x in ["ablation", "retrait", "depose", "dépose", "extraction"]) and any(x in lower for x in ["matériel", "materiel", "clou", "plaque", "vis", "broche", "prothèse", "prothese", "spacer", "ciment", "joint"])
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

raw_items = re.findall(r'"([^"\\]*(?:\\.[^"\\]*)*)"', interventions_block)
print(f"Found {len(raw_items)} raw items in static list.")

cleaned = []
for item in raw_items:
    item_unescaped = item.replace('\\"', '"').replace('\\\\', '\\')
    term = clean_clinical_term(item_unescaped)
    if term and is_valid_surgical_intervention(term):
        item_escaped = term.replace('\\', '\\\\').replace('"', '\\"')
        cleaned.append(item_escaped)

cleaned = sorted(list(set(cleaned)))
print(f"Cleaned static list has {len(cleaned)} items.")

new_block = "INTERVENTIONS: [\n" + ",\n".join(f'        "{i}"' for i in cleaned) + "\n    ]"

new_content = content[:start_idx] + new_block + content[end_idx:]

with open(database_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("database.js written successfully.")

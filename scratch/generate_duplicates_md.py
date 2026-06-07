import json
import os
import re
import unicodedata

workspace_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
patients_db_path = os.path.join(workspace_dir, "MercyFiatMedSuiteDesktop", "patients_db.json")
output_md_path = r"C:\Users\Farus\.gemini\antigravity-ide\brain\2cb7ad05-b670-4d7d-9cd6-e600fa5ea152\doublons_detectes.md"

def strip_accents(text):
    text = unicodedata.normalize('NFD', text)
    text = text.encode('ascii', 'ignore')
    return text.decode("utf-8")

def normalize_words(name):
    if not name:
        return ""
    s = strip_accents(name.upper())
    s = re.sub(r'\(.*?\)', '', s)
    s = re.sub(r'\b(?:OK|COPIE|POINT|DETAILS|ASSUR|URO|CHIPED|FGA|AVOIR|POINT DEF|POINT JR|DETAILS ASSUR)\b', '', s)
    s = re.sub(r'[^A-Z\s]', ' ', s)
    words = s.split()
    words.sort()
    return " ".join(words)

with open(patients_db_path, "r", encoding="utf-8") as f:
    patients = json.load(f)

# Group by normalized form
groups = {}
for p in patients:
    orig_name = p["name"]
    norm = normalize_words(orig_name)
    if not norm:
        continue
    if norm not in groups:
        groups[norm] = []
    groups[norm].append(p)

exact_dups = []
for norm, pts in groups.items():
    if len(pts) > 1:
        # Check if actually distinct original spellings exist
        origs = list(set(p["name"] for p in pts))
        exact_dups.append((norm, pts, origs))

# Find similar keys
norm_keys = list(groups.keys())
similar_pairs = []

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

# Fast Levenshtein comparison using first-letter filtering
for i in range(len(norm_keys)):
    k1 = norm_keys[i]
    if len(k1) < 4:
        continue
    for j in range(i+1, len(norm_keys)):
        k2 = norm_keys[j]
        if len(k2) < 4:
            continue
        # Filter by first letter to avoid slow comparing across completely different names
        if k1[0] != k2[0]:
            continue
        if abs(len(k1) - len(k2)) > 2:
            continue
        dist = levenshtein_distance(k1, k2)
        if dist <= 2:
            similar_pairs.append((k1, k2, dist))

md_lines = []
md_lines.append("# Rapports d'audit des doublons dans la base patients\n")
md_lines.append("Ce document recense les doublons potentiels détectés dans la base de données patients (`patients_db.json`).\n")

md_lines.append("## 1. Groupes de doublons exacts (après normalisation et tri des mots)\n")
md_lines.append("Ces groupes correspondent à des noms identiques ou inversés (ex: `NOM PRENOM` vs `PRENOM NOM`), ou contenant des chiffres/suffixes de test.\n")

for norm, pts, origs in sorted(exact_dups, key=lambda x: x[0]):
    # Skip test keywords if they look like dates or system flags
    if re.match(r'^(?:JANV|FEVR|MARS|AVRI|MAI|JUIN|JUIL|AOUT|SEPT|OCTO|NOVE|DECE|ANNEE|BILAN|DETAILS|COUT|CHD|CHUD|TABLE|NOUVEAU|INT|TEST)\b', norm):
        continue
    md_lines.append(f"### Groupe : **{pts[0]['name']}** (Clé normalisée : `{norm}`)")
    md_lines.append("Noms d'origine trouvés :")
    for p in pts:
        md_lines.append(f"- **{p['name']}** (Âge : {p.get('age', 'N/A')}, Diagnostic : {p.get('diagnosis', 'N/A')}, Assureur : {p.get('insurer', 'PRIVE')})")
    md_lines.append("")

md_lines.append("## 2. Groupes de doublons similaires (faibles variations de frappe, accents, ou fautes d'orthographe)\n")
md_lines.append("Ces paires présentent une différence d'une ou deux lettres maximum.\n")

# To avoid duplicates in display, group similar keys
merged_similar = {}
for k1, k2, dist in similar_pairs:
    # Skip if one of them starts with date keywords
    if re.match(r'^(?:JANV|FEVR|MARS|AVRI|MAI|JUIN|JUIL|AOUT|SEPT|OCTO|NOVE|DECE|ANNEE|BILAN|DETAILS|COUT|CHD|CHUD|TABLE|NOUVEAU|INT|TEST)\b', k1) or \
       re.match(r'^(?:JANV|FEVR|MARS|AVRI|MAI|JUIN|JUIL|AOUT|SEPT|OCTO|NOVE|DECE|ANNEE|BILAN|DETAILS|COUT|CHD|CHUD|TABLE|NOUVEAU|INT|TEST)\b', k2):
        continue
        
    found_group = None
    for leader in merged_similar:
        if k1 in merged_similar[leader] or k2 in merged_similar[leader]:
            merged_similar[leader].add(k1)
            merged_similar[leader].add(k2)
            found_group = leader
            break
    if not found_group:
        merged_similar[k1] = {k1, k2}

for leader, member_keys in sorted(merged_similar.items()):
    all_pts = []
    all_origs = []
    for k in member_keys:
        all_pts.extend(groups[k])
        all_origs.extend([p["name"] for p in groups[k]])
    
    # Skip if it is not really a duplicate (e.g. only 1 patient after all, shouldn't happen)
    if len(all_pts) <= 1:
        continue
        
    md_lines.append(f"### Groupe similaire autour de : **{all_pts[0]['name']}**")
    md_lines.append("Variations détectées :")
    for p in all_pts:
        md_lines.append(f"- **{p['name']}** (Âge : {p.get('age', 'N/A')}, Diagnostic : {p.get('diagnosis', 'N/A')}, Assureur : {p.get('insurer', 'PRIVE')})")
    md_lines.append("")

with open(output_md_path, "w", encoding="utf-8") as f:
    f.write("\n".join(md_lines))

print(f"Report generated successfully at {output_md_path}")

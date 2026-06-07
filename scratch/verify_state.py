import json
import os
import re

desktop = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"

# ── 1. documents_db.json ─────────────────────────────────────────────────────
print("=" * 60)
print("DOCUMENTS_DB.JSON")
print("=" * 60)
with open(os.path.join(desktop, "documents_db.json"), "r", encoding="utf-8") as f:
    docs = json.load(f)

total = len(docs)
age35 = sum(1 for d in docs if d.get("patientAge") == "35 ans")
age_empty = sum(1 for d in docs if not d.get("patientAge", "").strip())
bad_noms = [d for d in docs if d.get("patientNom", "").strip() in ("", "D'", "DE", "FEUIL", "FEUILLE")]
dup_check = {}
for d in docs:
    dup_check[d.get("id")] = dup_check.get(d.get("id"), 0) + 1
dup_ids = {k: v for k, v in dup_check.items() if v > 1}

print(f"Total documents : {total}")
print(f"Age = '35 ans' : {age35}  ({age35*100//total}%)")
print(f"Age vide        : {age_empty}")
print(f"Nom corrompu   : {len(bad_noms)}  (ex: D', DE, FEUIL...)")
print(f"IDs en doublon : {len(dup_ids)}")
if dup_ids:
    for k, v in list(dup_ids.items())[:5]:
        print(f"  → {k} × {v}")

# ── 2. patients_db.json ──────────────────────────────────────────────────────
print()
print("=" * 60)
print("PATIENTS_DB.JSON")
print("=" * 60)
with open(os.path.join(desktop, "patients_db.json"), "r", encoding="utf-8") as f:
    patients = json.load(f)

total_p = len(patients)
bad_p = [p for p in patients if p.get("nom", "").strip() in ("", "D'", "DE", "FEUIL", "FEUILLE") or len(p.get("nom", "")) < 2]
age_dist = {}
for p in patients:
    a = p.get("age", "?")
    age_dist[a] = age_dist.get(a, 0) + 1
top5 = sorted(age_dist.items(), key=lambda x: -x[1])[:5]

print(f"Total patients : {total_p}")
print(f"Noms corrompus : {len(bad_p)}")
if bad_p:
    for p in bad_p[:10]:
        print(f"  → nom='{p.get('nom')}' prenom='{p.get('prenom')}'")
print(f"Top 5 âges :")
for age, cnt in top5:
    print(f"  {age}: {cnt} patients")

# ── 3. bills_db.json ─────────────────────────────────────────────────────────
print()
print("=" * 60)
print("BILLS_DB.JSON")
print("=" * 60)
with open(os.path.join(desktop, "bills_db.json"), "r", encoding="utf-8") as f:
    bills = json.load(f)

total_b = len(bills)
bad_b = [b for b in bills if b.get("patientNom", "").strip() in ("", "D'", "DE", "FEUIL", "FEUILLE") or len(b.get("patientNom", "")) < 2]
print(f"Total factures : {total_b}")
print(f"Noms corrompus : {len(bad_b)}")
if bad_b:
    for b in bad_b[:5]:
        print(f"  → nom='{b.get('patientNom')}' prenom='{b.get('patientPrenom')}'")

# ── 4. real_data.js duplication check ───────────────────────────────────────
print()
print("=" * 60)
print("REAL_DATA.JS  (duplication check)")
print("=" * 60)
with open(os.path.join(desktop, "real_data.js"), "r", encoding="utf-8") as f:
    raw = f.read()

# Extract the JSON array from the JS file
match = re.search(r'const\s+realPatientData\s*=\s*(\[.*\])', raw, re.DOTALL)
if not match:
    match = re.search(r'module\.exports\s*=\s*(\[.*\])', raw, re.DOTALL)
if match:
    try:
        real_docs = json.loads(match.group(1))
        ids_real = [d.get("id") for d in real_docs]
        dup_real = {k: ids_real.count(k) for k in set(ids_real) if ids_real.count(k) > 1}
        age35_real = sum(1 for d in real_docs if d.get("patientAge") == "35 ans")
        print(f"Total entrées  : {len(real_docs)}")
        print(f"IDs en doublon : {len(dup_real)}")
        print(f"Age = '35 ans' : {age35_real}  ({age35_real*100//max(len(real_docs),1)}%)")
    except Exception as e:
        print(f"Impossible de parser real_data.js : {e}")
else:
    # Count IDs by regex
    ids = re.findall(r'"id"\s*:\s*"(DOC-[^"]+)"', raw)
    dup = {k: ids.count(k) for k in set(ids) if ids.count(k) > 1}
    age35_count = raw.count('"patientAge": "35 ans"') + raw.count('"patientAge":"35 ans"')
    print(f"Total IDs trouvés : {len(ids)}")
    print(f"IDs en doublon    : {len(dup)}")
    if dup:
        for k, v in list(dup.items())[:5]:
            print(f"  → {k} × {v}")
    print(f"Age = '35 ans'    : {age35_count}")

print()
print("✅ Vérification terminée.")

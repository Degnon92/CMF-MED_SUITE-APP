import json, os, sys, re
sys.stdout.reconfigure(encoding='utf-8')
desktop = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"

with open(os.path.join(desktop, "documents_db.json"), "r", encoding="utf-8") as f:
    docs = json.load(f)

# Check the 2 bad name docs
bad_names = {"", "D'", "DE", "FEUIL", "FEUILLE"}
bad = [d for d in docs if d.get("patientNom","").strip() in bad_names]
print("=== BAD NAME DOCS ===")
for d in bad:
    print("ID:", d.get("id"))
    print("  Nom:", repr(d.get("patientNom")))
    print("  Prenom:", repr(d.get("patientPrenom")))
    print("  Content[:300]:", d.get("content","")[:300])
    print()

# Sample the 35 ans docs
age35 = [d for d in docs if d.get("patientAge") == "35 ans"]
age_in_text = 0
diff_age_samples = []
for d in age35:
    content = d.get("content","")
    m = re.search(r"(\d+)\s*ans", content, re.IGNORECASE)
    if m and m.group(1) == "35":
        age_in_text += 1
    elif m:
        diff_age_samples.append((d.get("id"), m.group(1), d.get("patientNom"), d.get("patientPrenom"), content[:150]))

print(f"=== 35 ANS DOCS ANALYSIS ===")
print(f"Total 35 ans docs: {len(age35)}")
print(f"Text also says 35 ans: {age_in_text}")
print(f"Text says different age: {len(diff_age_samples)}")
print(f"No age found in text: {len(age35) - age_in_text - len(diff_age_samples)}")
if diff_age_samples:
    print("\nSample discrepancies (meta=35 but text says otherwise):")
    for item in diff_age_samples[:8]:
        print(f"  {item[0]}: metadata=35ans, text_age={item[1]}ans, nom={item[2]}")
        print(f"    Content: {item[4][:100]}")
        print()

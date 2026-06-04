"""
clean_docs_db.py
Purge tous les documents DOC-REAL-AUTO-* de documents_db.json.
Ces documents doivent uniquement provenir de real_data.js (window.MercyFiatRealDocs),
pas du fichier de persistance documents_db.json.
Cela élimine définitivement les doublons dans le registre.
"""
import json, os, shutil
from pathlib import Path

BASE = Path(__file__).parent.parent
DOCS_DB = BASE / 'documents_db.json'
BACKUP  = BASE / 'documents_db.BACKUP_BEFORE_CLEAN.json'

print("=== Nettoyage de documents_db.json ===\n")

# Charger le fichier
with open(DOCS_DB, 'r', encoding='utf-8') as f:
    docs = json.load(f)

print(f"Nombre total de documents avant nettoyage : {len(docs)}")

# Compter et identifier les DOC-REAL-AUTO-*
real_docs = [d for d in docs if str(d.get('id', '')).startswith('DOC-REAL-')]
user_docs = [d for d in docs if not str(d.get('id', '')).startswith('DOC-REAL-')]

print(f"  → Documents DOC-REAL-* (à retirer)     : {len(real_docs)}")
print(f"  → Documents utilisateur (à conserver)  : {len(user_docs)}")

if not real_docs:
    print("\n✅ Aucun DOC-REAL-* trouvé dans documents_db.json. Rien à faire.")
    exit(0)

# Afficher un échantillon des docs à retirer
print(f"\nExemples de DOC-REAL-* qui seront retirés :")
for d in real_docs[:5]:
    print(f"  id={d.get('id')} | nom={d.get('patientNom','')} | date={d.get('date','')}")
if len(real_docs) > 5:
    print(f"  ... et {len(real_docs) - 5} autres")

# Confirmer
print(f"\n⚠️  {len(real_docs)} documents DOC-REAL-* vont être RETIRÉS de documents_db.json.")
print("    Ils continueront d'apparaître dans l'appli via real_data.js (window.MercyFiatRealDocs).")
ans = input("\nContinuer ? (o/n) : ").strip().lower()
if ans != 'o':
    print("Annulé.")
    exit(0)

# Backup
shutil.copy2(DOCS_DB, BACKUP)
print(f"\n✅ Backup sauvegardé : {BACKUP.name}")

# Sauvegarder les docs utilisateur seulement
with open(DOCS_DB, 'w', encoding='utf-8') as f:
    json.dump(user_docs, f, ensure_ascii=False, indent=2)

print(f"✅ documents_db.json mis à jour : {len(user_docs)} documents conservés (DOC-REAL-* retirés)")
print(f"\n🎯 Résultat : Le registre n'affichera plus de doublons au prochain démarrage.")

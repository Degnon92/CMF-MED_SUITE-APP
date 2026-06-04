"""
purge_docs_db.py
documents_db.json contient UNIQUEMENT des DOC-REAL-AUTO-* (1036 docs)
qui sont DEJA presents dans real_data.js (window.MercyFiatRealDocs).

Ce script vide documents_db.json (-> []) pour que l'application ne charge
plus que depuis real_data.js, eliminant definitivement les doublons.

Les nouveaux documents crees par le medecin (non-REAL) seront toujours
sauvegardes dans documents_db.json apres creation.
"""
import json, shutil
from pathlib import Path

BASE = Path(__file__).parent.parent
DOCS_DB = BASE / 'documents_db.json'
BACKUP  = BASE / 'documents_db.BACKUP_PRE_PURGE.json'

print("=== Purge de documents_db.json ===\n")

with open(DOCS_DB, 'r', encoding='utf-8') as f:
    docs = json.load(f)

real_docs = [d for d in docs if str(d.get('id', '')).startswith('DOC-REAL-')]
user_docs = [d for d in docs if not str(d.get('id', '')).startswith('DOC-REAL-')]

print(f"Avant : {len(docs)} docs au total")
print(f"  DOC-REAL-* (a retirer) : {len(real_docs)}")
print(f"  Docs medecin (a garder) : {len(user_docs)}")

# Backup de securite
shutil.copy2(DOCS_DB, BACKUP)
print(f"\nBackup cree : {BACKUP.name}")

# Vider le fichier (ou garder uniquement les docs medecin si existants)
with open(DOCS_DB, 'w', encoding='utf-8') as f:
    json.dump(user_docs, f, ensure_ascii=False, indent=2)

print(f"\nOK - documents_db.json mis a jour : {len(user_docs)} docs conserves")
print("Les DOC-REAL-* seront charges depuis real_data.js au demarrage.")
print("\nResultat : Plus aucun doublon dans le registre !")

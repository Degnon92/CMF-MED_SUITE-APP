import json
import os
import sys

# Forcer l'encodage UTF-8 pour stdout
sys.stdout.reconfigure(encoding='utf-8')

db_path = r'c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\bills_db.json'

with open(db_path, 'r', encoding='utf-8') as f:
    bills = json.load(f)

fixed_count = 0
for b in bills:
    diag = b.get('diagnostic', '') or ''
    if diag.strip().lower() == 'bilan clinique':
        nom = b.get('patientNom', '')
        prenom = b.get('patientPrenom', '')
        interv = b.get('intervention', '')
        date_val = b.get('date', '')
        print(f"CORRIGE: {nom} {prenom} | Date: {date_val} | Interv: {interv}")
        # Vider le diagnostic (valeur par defaut inventee lors de l'import)
        b['diagnostic'] = ''
        b['showDiag'] = False
        fixed_count += 1

print(f"\nTotal corrige: {fixed_count} facture(s)")

if fixed_count > 0:
    with open(db_path, 'w', encoding='utf-8') as f:
        json.dump(bills, f, ensure_ascii=False, indent=2)
    print("Base de donnees sauvegardee avec succes.")
else:
    print("Aucune correction necessaire (deja appliquee).")

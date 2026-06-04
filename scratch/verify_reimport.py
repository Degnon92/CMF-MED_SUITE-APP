import json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

bills = json.load(open('bills_db.json', encoding='utf-8'))

# Verifier KPEKPASSI
kpek = [b for b in bills if 'KPEK' in str(b.get('patientNom',''))]
print("=== KPEKPASSI ===")
for b in kpek:
    pid = b.get('id','?')
    btype = b.get('type','?')
    ins = b.get('insurance','?')
    cov = b.get('coverage',0)
    pa = b.get('partAssurance',0)
    pp = b.get('partPatient',0)
    sp = b.get('useSplit',False)
    print(f"  [{pid}] {btype:12} | {ins:12} | {cov}% | partAss={pa:>10,} | partPat={pp:>10,} | useSplit={sp}")
    if b.get('items') and sp:
        for item in b['items'][:3]:
            print(f"    - {item.get('name','?'):35} | subtot={item.get('subtotal',0):>8,} | partAss={item.get('partAssurance',0):>8,} | partPat={item.get('partPatient',0):>8,}")

# Stats globales
updated = [b for b in bills if b.get('insurance','PRIVE') != 'PRIVE']
has_split = [b for b in bills if b.get('useSplit')]
print(f"\nTotal factures non-PRIVE : {len(updated)} / {len(bills)}")
print(f"Factures avec useSplit   : {len(has_split)}")

# Par type
from collections import Counter
for btype in ['DETAIL_ASSUR','DEFINITIF','PROFORMA']:
    subset = [b for b in bills if b.get('type') == btype]
    with_split = [b for b in subset if b.get('useSplit')]
    print(f"  {btype:15}: {len(subset):3d} total | {len(with_split):3d} avec split")

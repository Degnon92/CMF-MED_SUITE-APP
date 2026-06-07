import openpyxl, re, json, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from reimport_bills_from_excel import clean_patient_name, detect_insurer, detect_bill_type_from_sheet, parse_french_date, map_header_cols, match_score, date_diff_days

wb = openpyxl.load_workbook(r'C:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\PROFORMA CHIRURGIE\EXEMPLAIRE PROFORMA.xlsx', data_only=True)
bills = json.load(open('bills_db.json', encoding='utf-8'))

ws = wb['KPEKPASSI BOUCARI DETAILS ASSUR']
all_rows = list(ws.iter_rows(min_row=1, max_row=50, values_only=True))
rows_text = ' '.join(str(v) for row in all_rows for v in row if v)

patient_norm = clean_patient_name('KPEKPASSI BOUCARI DETAILS ASSUR')
date_val = None
for r in all_rows:
    for v in r:
        if v and isinstance(v, str):
            m_pat = re.search(r'patient\s*:\s*(.+)$', v, re.I)
            if m_pat:
                patient_norm = clean_patient_name(m_pat.group(1))
            if 'cotonou' in v.lower():
                date_val = parse_french_date(v)

print('patient_norm:', patient_norm)
print('date:', date_val)
print('bill_type:', detect_bill_type_from_sheet('KPEKPASSI BOUCARI DETAILS ASSUR', rows_text))

# Check matches
best_matches = []
for idx, bill in enumerate(bills):
    bill_fullname = f"{bill.get('patientNom','')} {bill.get('patientPrenom','')}".upper().strip()
    score = match_score({'patientNom': patient_norm.split()[0] if patient_norm.split() else '',
                         'patientPrenom': ' '.join(patient_norm.split()[1:]) if len(patient_norm.split()) > 1 else ''},
                        bill_fullname)
    if 'KPEK' in bill_fullname:
        final_score = score
        if date_val and bill.get('date'):
            days = date_diff_days(bill.get('date'), date_val)
            if days <= 7: final_score += 20
            elif days <= 30: final_score += 15
            elif days <= 60: final_score += 10
            elif days > 180: final_score -= 30
        if bill.get('type') == 'DETAIL_ASSUR':
            final_score += 10
        else:
            final_score -= 10
        print(f"  Match with {bill['id']} ({bill['type']}, date={bill.get('date')}, ins={bill.get('insurance')}): score={score}, final={final_score}")

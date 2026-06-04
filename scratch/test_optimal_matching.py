import json, openpyxl, os, re
from datetime import datetime

# Import helper functions
from reimport_bills_from_excel import parse_french_date, detect_insurer, detect_bill_type_from_sheet, clean_patient_name, date_diff_days

workspace_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
excel_path = os.path.join(workspace_dir, "EXEMPLAIRE PROFORMA.xlsx")
wb = openpyxl.load_workbook(excel_path, data_only=True)

with open('bills_db.json', encoding='utf-8') as f:
    bills = json.load(f)

# 1. Extract sheets
excel_sheets = []
for name in wb.sheetnames:
    if 'KPEK' not in name.upper():
        continue
    ws = wb[name]
    all_rows = list(ws.iter_rows(values_only=True))
    rows_text = ' '.join(str(v) for row in all_rows for v in row if v)
    bill_type = detect_bill_type_from_sheet(name, rows_text)
    
    # Date
    date_val = None
    for row in all_rows:
        row_str = ' '.join(str(v) for v in row if v)
        if "cotonou" in row_str.lower():
            for v in row:
                if v and isinstance(v, str) and "cotonou" in v.lower():
                    date_val = parse_french_date(v)
                    
    # Patient name from cells
    patient_raw = name
    patient_norm = clean_patient_name(name)
    for row in all_rows:
        for v in row:
            if v and isinstance(v, str):
                m_pat = re.search(r'patient\s*:\s*(.+)$', v, re.I)
                if m_pat:
                    extracted = m_pat.group(1).strip()
                    if len(extracted) > 2:
                        patient_norm = clean_patient_name(extracted)
                        patient_raw = extracted
                        
    # Total
    gross_total = 0
    for row in all_rows:
        if row and row[0] and 'total' in str(row[0]).lower():
            # try to find a subtotal
            vals = [v for v in row if isinstance(v, (int, float)) and v > 0]
            if len(vals) >= 1:
                gross_total = int(vals[0])
                break
                
    excel_sheets.append({
        'sheet_name': name,
        'patient_norm': patient_norm,
        'patient_raw': patient_raw,
        'bill_type': bill_type,
        'date': date_val,
        'gross_total': gross_total
    })

# 2. Get DB bills for Kpekpassi
db_bills = []
for b in bills:
    if 'KPEK' in str(b.get('patientNom','')).upper():
        db_bills.append(b)

print("Sheets extracted:")
for s in excel_sheets:
    print(f"  Name: {s['sheet_name']} | Type: {s['bill_type']} | Date: {s['date']} | Total: {s['gross_total']}")

print("\nDB bills extracted:")
for b in db_bills:
    print(f"  ID: {b['id']} | Type: {b['type']} | Date: {b['date']} | Total: {b['grossTotal']}")

# 3. Calculate scores and run optimal assignment
def name_score(n1, n2):
    n1 = n1.upper().strip()
    n2 = n2.upper().strip()
    if n1 == n2: return 100
    if n1 in n2 or n2 in n1: return 90
    w1 = set(n1.split())
    w2 = set(n2.split())
    common = w1 & w2
    if len(common) >= 2: return 70 + len(common) * 5
    return 0

pairs = []
for s in excel_sheets:
    for b in db_bills:
        b_name = f"{b['patientNom']} {b['patientPrenom']}"
        b_clean = clean_patient_name(b_name)
        n_score = name_score(s['patient_norm'], b_clean)
        
        # Type Score
        t_score = 200 if b['type'] == s['bill_type'] else -200
        
        # Total Score
        diff_total = abs(s['gross_total'] - b['grossTotal'])
        if diff_total <= 100:
            tot_score = 150
        elif diff_total <= 10000:
            tot_score = 100
        elif diff_total <= 50000:
            tot_score = 50
        else:
            tot_score = -50
            
        # Date Score
        if b.get('date') == '2026-06-01' or not s['date'] or not b.get('date'):
            date_score = 0
        else:
            diff_days = date_diff_days(b['date'], s['date'])
            if diff_days <= 7:
                date_score = 100
            elif diff_days <= 30:
                date_score = 75
            elif diff_days <= 60:
                date_score = 50
            elif diff_days > 180:
                date_score = -150
            else:
                date_score = 0
                
        total_score = n_score + t_score + tot_score + date_score
        pairs.append({
            'sheet': s['sheet_name'],
            'bill_id': b['id'],
            'score': total_score,
            'details': f"name={n_score}, type={t_score}, total={tot_score}, date={date_score}"
        })

# Greedy assignment
pairs.sort(key=lambda x: -x['score'])
assigned_sheets = set()
assigned_bills = set()
assignments = []

print("\nPossible matches sorted by score:")
for p in pairs:
    print(f"  Sheet: {p['sheet']:32} -> Bill: {p['bill_id']:18} | Score: {p['score']:4d} ({p['details']})")

for p in pairs:
    if p['sheet'] not in assigned_sheets and p['bill_id'] not in assigned_bills:
        if p['score'] >= 50:
            assigned_sheets.add(p['sheet'])
            assigned_bills.add(p['bill_id'])
            assignments.append(p)

print("\nFinal assignments:")
for a in assignments:
    print(f"  Assigned: {a['sheet']:32} -> Bill: {a['bill_id']:18} | Score: {a['score']:4d}")

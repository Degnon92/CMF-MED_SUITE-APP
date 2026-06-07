import sys, re, openpyxl, json, copy
from pathlib import Path
from datetime import datetime

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

EXCEL_FILE = Path(r"C:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\PROFORMA CHIRURGIE\EXEMPLAIRE PROFORMA.xlsx")
BILLS_FILE = Path(r"bills_db.json")

months_map = {
    "janvier": "01", "fevrier": "02", "février": "02", "mars": "03", "avril": "04",
    "mai": "05", "juin": "06", "juillet": "07", "aout": "08", "août": "08",
    "septembre": "09", "octobre": "10", "novembre": "11", "decembre": "12", "décembre": "12"
}

def parse_french_date(text):
    if not text: return None
    m_slashes = re.search(r"(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})", text)
    if m_slashes:
        day = f"{int(m_slashes.group(1)):02d}"
        month = f"{int(m_slashes.group(2)):02d}"
        year = m_slashes.group(3)
        return f"{year}-{month}-{day}"
    m_words = re.search(r"le\s+(\d{1,2})\s+([a-zA-Zéûûôâêîñéèàç]+)\s+(\d{4})", text, re.IGNORECASE)
    if m_words:
        day = f"{int(m_words.group(1)):02d}"
        month_name = m_words.group(2).lower()
        year = m_words.group(3)
        month = months_map.get(month_name, "02")
        return f"{year}-{month}-{day}"
    return None

def date_diff_days(d1_str, d2_str):
    if not d1_str or not d2_str: return 9999
    try:
        dt1 = datetime.strptime(d1_str[:10], '%Y-%m-%d')
        dt2 = datetime.strptime(d2_str[:10], '%Y-%m-%d')
        return abs((dt1 - dt2).days)
    except:
        return 9999

def clean_patient_name(name):
    if not name: return ''
    n = name.upper().strip()
    
    n = re.sub(r'\(\d+\)', '', n).strip()
    
    prefixes = [
        r'^POINT\s+DEF\.?', r'^POINT\s+FINAL', r'^POIN\s+FINAL', r'^PT\s+DEF\.?',
        r'^DETAILS?\s+ASS_?', r'^DETAILS?\s+ASS\.?', r'^DETAILS?_?', r'^DETAIL_?',
        r'^DET\.\s+ASS\._?', r'^DET\.\s+ASS\.?', r'^DET\.\s+ASS?', r'^DET_ASS\.?',
        r'^DET_ASS?', r'^DET_?', r'^DET\.?', r'^POI_?', r'^POINT_?', r'^POINT\.?',
        r'^POIN_?', r'^POIN\.?', r'^PT\.?', r'^PT\s+', r'^PT-?', r'^IMPLANT\s+',
        r'^REPRISE_?', r'^PROLONG_?', r'^PROF\s+DEF\s+', r'^PROF\s+', r'^PROFORMA\s+',
        r'^P_', r'^DETAILS?_', r'^PATIENT\s*:\s*', r'^PATIENTE\s*:\s*', r'^PATIENT\s+',
        r'^PATIENTE\s+', r'^M\.', r'^MME\s+', r'^MR\s+', r'^DR\.', r'^DR\s+',
        r'^PT-MOULERO\s+', r'^POINT-HPT-', r'^POINT\s+'
    ]
    
    changed = True
    while changed:
        old_n = n
        for pfx in prefixes:
            n = re.sub(pfx, '', n, flags=re.I).strip()
        if n == old_n:
            changed = False
            
    suffixes = [
        r'_ASCOMA$', r'_AFG$', r'_FGA$', r'_LCA$', r'_AA$', r'-SANLAM$', r'_SINISTRE$',
        r'_SIN$', r'_SINIS$', r'_SINIS\s+AA$', r'_SINIS\s+AFG$', r'_SINI$', 
        r'_SINI_AFG_ELIEZE$', r'_RTUP$', r'_SONDE_URO$', r'_URO$', r'_URO\s+LABO$',
        r'_URO_AA$', r'_URO_DRAGOUN$', r'_ARTHROS$', r'_ARTH$', r'_ARTHROS_SANLAM$',
        r'_CARDIO$', r'_NEUROCHI$', r'_CHIRPED$', r'_DR\s+DJEDOU$', r'_DR\s+DJED$',
        r'_DRQUENUM$', r'_DRQUENUM\s+HPT$', r'_DRQUE$', r'_DRQUE_AA$', r'_COTON$',
        r'_SPORT$', r'_LOTO$', r'_LOTO\s+SANLAM$', r'_DJEDOU$', r'_SINISTRE\s+AFG$',
        r'_LOTO\s+SANLAM$', r'_Sinistre ok$', r'_Sinistre$', r'_Sinistre\s+ok$',
        r'_ Sinistre$', r'_Sinistre$', r'_Sinistre ok$', r'_AA$', r'_AA$', r'_AA$',
        r'_ASK$', r'_ASK\s+\(\d+\)$', r'_ASK$', r'_ASK$', r'_ASK$', r'_ASK$',
        r'\s+\d+$', r'\s+\d+\)$', r'_1$', r'_2$', r'_3$', r'_4$', r'_5$', r'_6$', r'_7$'
    ]
    
    changed = True
    while changed:
        old_n = n
        for sfx in suffixes:
            n = re.sub(sfx, '', n, flags=re.I).strip()
        if n == old_n:
            changed = False
            
    n = re.sub(r'[^A-Z\s\-]', ' ', n)
    n = re.sub(r'\s+', ' ', n).strip()
    return n

def detect_insurer(text):
    if not text: return None
    t = text.lower().strip()
    if 'sinistre' in t or 'accident' in t or 'sini' in t:
        if 'africaine' in t or ' afg' in t or ' aa' in t or '_aa' in t:
            return 'AFRICAINE_SINISTRE'
        if 'sanlam' in t:
            return 'SANLAM_SINISTRE'
        if 'sunu' in t:
            return 'SUNU_SINISTRE_AUTO'
        if 'generale' in t or 'générale' in t or 'gab' in t:
            return 'GENERAL_ASSURANCE_SINISTRE'
        if 'fonds' in t or 'garantie' in t or 'fga' in t:
            return 'FONDS_GARANTIE_AUTO'
            
    if 'sanlam' in t or 'saham' in t:
        return 'SANLAM'
    if 'ascoma' in t or 'asco' in t:
        return 'ASCOMA'
    if 'sunu' in t:
        return 'SUNU'
    if 'nsia' in t:
        return 'NSIA'
    if 'atlantique' in t:
        return 'ATLANTIQUE'
    if 'dayo' in t:
        return 'DAYO'
    if 'nobila' in t:
        return 'NOBILA'
    if 'olea' in t:
        return 'OLEA'
    if 'transvie' in t:
        return 'TRANSVIE'
    if 'gras savoye' in t or 'gras' in t or 'savoye' in t:
        return 'GRAS SAVOYE'
    if 'coton' in t:
        return 'COTON_SPORT'
    if 'lotto' in t or 'loto' in t:
        return 'LOTTO_FOOTBALL_CLUB'
    if 'sobemap' in t:
        return 'SOBEMAP'
    if 'port' in t or 'pac' in t:
        return 'PORT_AUTONOME_COTONOU'
    if 'energie' in t:
        return 'ENERGIE_BASKET_BALL'
    if 'gab' in t or 'générale des assurances' in t or 'generale des assurances' in t:
        return 'GENERAL_ASSURANCE_SINISTRE'
    if 'africaine' in t or 'afg' in t or 'aa' in t:
        return 'AFG'
    return None

def detect_bill_type_from_sheet(sheet_name, rows_text):
    sn = sheet_name.upper()
    rt = rows_text.upper()
    if any(k in sn for k in ['DETAILS', 'DETAIL ASS', 'DET ASS', 'DETAILS ASS']):
        return 'DETAIL_ASSUR'
    if any(k in sn for k in ['POIN', 'POINT', 'DEF ', 'FINAL', 'DEFINITIF']):
        return 'DEFINITIF'
    if any(k in rt for k in ['POINT DEFINITIF', 'POINT FINAL', 'POINT DEF', 'DEFINITIF']):
        return 'DEFINITIF'
    if any(k in rt for k in ['DETAIL ASSURANCE', 'DETAILS ASSURANCE', 'DETAIL ASSU']):
        return 'DETAIL_ASSUR'
    return 'PROFORMA'

def safe(v, maxlen=100):
    if v is None: return ''
    return str(v).strip()[:maxlen]

def map_header_cols(header_row):
    cols = [str(c).strip().lower() for c in header_row]
    mapping = {
        'desig': 0, 'qty': 1, 'price': 2, 'subtotal': 3,
        'part_assurance': [], 'part_patient': None
    }
    
    for idx, c in enumerate(cols):
        if 'designation' in c or 'désignation' in c or 'actes' in c or 'prest' in c:
            mapping['desig'] = idx
            break
    for idx, c in enumerate(cols):
        if 'qt' in c or 'nbre' in c:
            mapping['qty'] = idx
            break
    for idx, c in enumerate(cols):
        if 'unit' in c or 'prix' in c or 'unitaire' in c:
            mapping['price'] = idx
            break
    for idx, c in enumerate(cols):
        if 'montant' in c or 'total' in c or 'clinique' in c:
            if 'assur' not in c and 'pat' not in c and idx > mapping['price']:
                mapping['subtotal'] = idx
                break

    insurance_keywords = [
        'assur', 'tiers', 'fga', 'sanlam', 'saham', 'nsia', 'ascoma', 'sunu', 'olea', 
        'transvie', 'atlantique', 'afg', 'lotto', 'loto', 'coton', 'sobemap', 'port', 'aa', 'gab'
    ]
    for idx, c in enumerate(cols):
        if 'part' in c and any(kw in c for kw in insurance_keywords) and 'pat' not in c:
            mapping['part_assurance'].append(idx)
            
    if not mapping['part_assurance']:
        for idx, c in enumerate(cols):
            if any(kw in c for kw in insurance_keywords) and 'pat' not in c and 'limit' not in c and 'total' not in c:
                mapping['part_assurance'].append(idx)
                
    if not mapping['part_assurance']:
        for idx, c in enumerate(cols):
            if 'assur' in c and 'pat' not in c and 'limit' not in c and 'total' not in c:
                mapping['part_assurance'].append(idx)

    for idx, c in enumerate(cols):
        if 'pat' in c and any(kw in c for kw in ['final', 'apr', 'tot', 'net']):
            mapping['part_patient'] = idx
            break
    if mapping['part_patient'] is None:
        for idx, c in enumerate(cols):
            if 'pat' in c and ('part' in c or 'tot' in c or 'net' in c):
                mapping['part_patient'] = idx
                break
    if mapping['part_patient'] is None:
        mapping['part_patient'] = len(cols) - 1
        
    # If no insurance columns found, fallback to 'limite/total assurance' if a patient column exists
    if not mapping['part_assurance'] and mapping['part_patient'] is not None:
        for idx, c in enumerate(cols):
            if ('limit' in c or 'tot' in c) and 'assur' in c and idx != mapping['part_patient']:
                mapping['part_assurance'].append(idx)
                break
                
    return mapping

def match_score(bill_name, sheet_norm):
    bn = f"{bill_name.get('patientNom','')} {bill_name.get('patientPrenom','')}".upper().strip()
    bn = re.sub(r'\s+', ' ', bn)
    sn = re.sub(r'\s+', ' ', sheet_norm.strip())
    
    if bn == sn: return 100
    if bn in sn or sn in bn: return 80
    bn_words = set(bn.split())
    sn_words = set(sn.split())
    common = bn_words & sn_words
    if len(common) >= 2: return 60 + len(common) * 5
    if len(common) == 1 and len(list(common)[0]) > 4: return 40
    return 0

print("Chargement Excel...")
wb = openpyxl.load_workbook(EXCEL_FILE, data_only=True)
print("Chargement Bills DB...")
bills = json.load(open(BILLS_FILE, encoding='utf-8'))

excel_sheets = []

for sheet_name in wb.sheetnames:
    ws = wb[sheet_name]
    sheet_data = {
        'sheet_name': sheet_name,
        'patient_norm': clean_patient_name(sheet_name),
        'patient_raw': sheet_name,
        'insurer': detect_insurer(sheet_name),
        'coverage': 0,
        'bill_type': 'PROFORMA',
        'gross_total': 0,
        'part_assurance_total': 0,
        'part_patient_total': 0,
        'items': [],
        'has_split': False,
        'rows_text': '',
        'date': None
    }
    
    all_rows = list(ws.iter_rows(min_row=1, max_row=min(50, ws.max_row), values_only=True))
    rows_text = ' '.join(safe(v) for row in all_rows for v in row if v)
    sheet_data['rows_text'] = rows_text
    sheet_data['bill_type'] = detect_bill_type_from_sheet(sheet_name, rows_text)
    
    if not sheet_data['insurer']:
        for row in all_rows:
            row_str = ' '.join(safe(v) for v in row if v)
            ins = detect_insurer(row_str)
            if ins:
                sheet_data['insurer'] = ins
                break
                
    item_start_row = None
    for r_idx, row in enumerate(all_rows, 1):
        row_str = ' '.join(safe(v) for v in row if v)
        for v in row:
            if v and isinstance(v, str):
                m_pat = re.search(r'patient\s*:\s*(.+)$', v, re.I)
                if m_pat:
                    extracted = m_pat.group(1).strip()
                    if len(extracted) > 2:
                        sheet_data['patient_norm'] = clean_patient_name(extracted)
                        sheet_data['patient_raw'] = extracted
                        
        if not sheet_data['date']:
            if "cotonou" in row_str.lower():
                for v in row:
                    if v and isinstance(v, str) and "cotonou" in v.lower():
                        date_parsed = parse_french_date(v)
                        if date_parsed:
                            sheet_data['date'] = date_parsed
                            
        m = re.search(r'(\d{2,3})\s*%', row_str)
        if m and not sheet_data['coverage']:
            cov = int(m.group(1))
            if 1 <= cov <= 100:
                sheet_data['coverage'] = cov
                
        non_empty = [v for v in row if v is not None]
        if len(non_empty) >= 5 and item_start_row is None:
            if any(k in row_str.lower() for k in ['désignation', 'designation', 'actes', 'prestations']):
                item_start_row = r_idx + 1
                col5 = safe(row[4]) if len(row) > 4 else ''
                col6 = safe(row[5]) if len(row) > 5 else ''
                if any(k in (col5+col6).lower() for k in ['assur', 'patient', 'part', 'tiers']):
                    sheet_data['has_split'] = True
                    
    if sheet_data['has_split'] and item_start_row:
        header_row_idx = item_start_row - 2
        header_row_vals = all_rows[header_row_idx] if 0 <= header_row_idx < len(all_rows) else []
        col_map = map_header_cols(header_row_vals)
        
        for r_idx, row in enumerate(all_rows, 1):
            if r_idx < item_start_row: continue
            if not row or row[0] is None: continue
            
            name = safe(row[0])
            if not name or 'total' in name.lower() or 'caisse' in name.lower():
                if 'total' in name.lower():
                    try:
                        subtotal_val = row[col_map['subtotal']]
                        part_ass_val = sum(float(row[idx]) for idx in col_map['part_assurance'] if idx < len(row) and row[idx] is not None)
                        part_pat_val = row[col_map['part_patient']]
                        
                        sheet_data['gross_total'] = int(float(subtotal_val)) if subtotal_val is not None else 0
                        sheet_data['part_assurance_total'] = int(part_ass_val)
                        sheet_data['part_patient_total'] = int(float(part_pat_val)) if part_pat_val is not None else 0
                    except:
                        vals = [v for v in row if isinstance(v, (int, float)) and v > 0]
                        if len(vals) >= 3:
                            sheet_data['gross_total'] = int(vals[0])
                            sheet_data['part_assurance_total'] = int(vals[1])
                            sheet_data['part_patient_total'] = int(vals[2])
                continue
                
            try:
                qty_raw = row[col_map['qty']] if col_map['qty'] < len(row) else 1
                qty = float(qty_raw) if qty_raw is not None else 1
                price_raw = row[col_map['price']] if col_map['price'] < len(row) else 0
                price = float(price_raw) if price_raw is not None else 0
                subtot_raw = row[col_map['subtotal']] if col_map['subtotal'] < len(row) else qty * price
                subtotal = float(subtot_raw) if subtot_raw is not None else qty * price
                
                part_ass = 0
                for idx in col_map['part_assurance']:
                    if idx < len(row) and row[idx] is not None:
                        part_ass += float(row[idx])
                part_pat_raw = row[col_map['part_patient']] if col_map['part_patient'] < len(row) else None
                part_pat = float(part_pat_raw) if part_pat_raw is not None else (subtotal - part_ass)
                
                if subtotal > 0 or price > 0:
                    sheet_data['items'].append({
                        'name': name, 'qty': int(qty), 'price': int(price), 'subtotal': int(subtotal),
                        'partAssurance': int(part_ass), 'partPatient': int(part_pat)
                    })
            except:
                pass
                
    if not sheet_data['has_split'] and sheet_data['insurer'] and sheet_data['gross_total'] > 0:
        cov = sheet_data['coverage'] or 80
        sheet_data['part_assurance_total'] = round(sheet_data['gross_total'] * cov / 100)
        sheet_data['part_patient_total'] = sheet_data['gross_total'] - sheet_data['part_assurance_total']
        
    excel_sheets.append(sheet_data)

patient_to_insurers = {}
for sheet in excel_sheets:
    pat = sheet['patient_norm']
    ins = sheet['insurer']
    if pat and ins:
        patient_to_insurers.setdefault(pat, set()).add(ins)
for sheet in excel_sheets:
    if not sheet['insurer']:
        pat = sheet['patient_norm']
        if pat in patient_to_insurers and len(patient_to_insurers[pat]) == 1:
            sheet['insurer'] = list(patient_to_insurers[pat])[0]

matches = []
not_found = []

for sheet in excel_sheets:
    if not sheet['has_split'] and not sheet['insurer']:
        continue
        
    patient_norm = sheet['patient_norm']
    best_matches = []
    
    for idx, bill in enumerate(bills):
        bill_fullname = f"{bill.get('patientNom','') or ''} {bill.get('patientPrenom','') or ''}".upper().strip()
        bill_fullname = re.sub(r'\s+', ' ', bill_fullname)
        
        score = match_score({'patientNom': patient_norm.split()[0] if patient_norm.split() else '',
                             'patientPrenom': ' '.join(patient_norm.split()[1:]) if len(patient_norm.split()) > 1 else ''},
                            bill_fullname)
                            
        if score < 60:
            p_words = set(patient_norm.split())
            b_words = set(bill_fullname.split())
            common = p_words & b_words
            if len(common) >= 2:
                score = max(score, 60 + len(common) * 5)
            elif patient_norm in bill_fullname or bill_fullname in patient_norm:
                score = max(score, 75)
            elif patient_norm == bill_fullname:
                score = max(score, 100)
                
        if score >= 60:
            final_score = score
            if sheet['date'] and bill.get('date'):
                days = date_diff_days(bill.get('date'), sheet['date'])
                if days <= 7: final_score += 20
                elif days <= 30: final_score += 15
                elif days <= 60: final_score += 10
                elif days > 180: final_score -= 30
            if bill.get('type') == sheet['bill_type']:
                final_score += 10
            else:
                final_score -= 10
            best_matches.append((final_score, idx))
            
    if best_matches:
        best_matches.sort(key=lambda x: -x[0])
        score, bill_idx = best_matches[0]
        if score >= 70:
            matches.append((sheet, bills[bill_idx], score))
        else:
            not_found.append((sheet, best_matches[0]))
    else:
        not_found.append((sheet, None))

# Print breakdown stats
split_matches = [m for m in matches if m[0]['has_split']]
print(f"\nTotal matches with split items: {len(split_matches)}")
for sheet, bill, score in split_matches:
    if 'AGBOTOU' in sheet['sheet_name']:
        print(f"Sheet '{sheet['sheet_name']}' ({sheet['bill_type']}, insurer={sheet['insurer']}) -> Bill {bill['id']} ({bill['type']})")
        print(f"  Total clinique: {sheet['gross_total']} | Total assurance: {sheet['part_assurance_total']} | Total patient: {sheet['part_patient_total']}")
        print(f"  All items:")
        for it in sheet['items']:
            print(f"    - {it['name']}: sub={it['subtotal']} | part_ass={it['partAssurance']} | part_pat={it['partPatient']}")

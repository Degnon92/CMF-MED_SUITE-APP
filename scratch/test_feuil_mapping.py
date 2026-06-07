import openpyxl
import re

excel_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\EXEMPLAIRE PROFORMA.xlsx"
wb = openpyxl.load_workbook(excel_path, data_only=True)

def extract_name_from_value(val):
    if not val or not isinstance(val, str):
        return None
    val_clean = val.strip()
    for prefix in ["patient:", "patient :", "client:", "client :", "diagnostic:", "diagnostic :", "intervention:", "intervention :"]:
        if val_clean.lower().startswith(prefix):
            return None
            
    m = re.search(r'(?:patient|client)\s*:\s*(.*)', val_clean, re.IGNORECASE)
    if m:
        return m.group(1).strip()
        
    upper = val_clean.upper()
    junk = ["CLINIQUE", "MEDECINE", "FACTURE", "PROFORMA", "ACTES", "DESIGNATIONS", "TOTAL", "COTINOU", "COTONOU", "CAISSE", "OPTION", "CHAMBRE"]
    if any(j in upper for j in junk):
        return None
        
    if re.search(r'[A-Za-z]', val_clean) and len(val_clean) > 3 and len(val_clean) < 50:
        return val_clean
        
    return None

sheet = wb["Feuil2 (98)"]
patient_name = None
diag = None
interv = None

print("Scanning Feuil2 (98) rows:")
for r in [3, 4, 5]:
    val = sheet.cell(r, 1).value
    print(f"Row {r} value: {val} (type: {type(val)})")
    if not val or not isinstance(val, str):
        continue
    val_clean = val.strip()
    
    m_pat = re.search(r'(?:patient|patiente)\s*:\s*(.*)', val_clean, re.IGNORECASE)
    if m_pat:
        patient_name = m_pat.group(1).strip()
        print(f"  Matched patient: {patient_name}")
        continue
        
    m_diag = re.search(r'diagnostic\s*:\s*(.*)', val_clean, re.IGNORECASE)
    if m_diag:
        diag = m_diag.group(1).strip()
        print(f"  Matched diag: {diag}")
        continue
        
    m_interv = re.search(r'intervention\s*:\s*(.*)', val_clean, re.IGNORECASE)
    if m_interv:
        interv = m_interv.group(1).strip()
        print(f"  Matched interv: {interv}")
        continue
        
    extracted = extract_name_from_value(val_clean)
    if extracted:
        print(f"  Extracted name from val: {extracted}")
        if not patient_name:
            patient_name = extracted
            print(f"  Assigned patient_name: {patient_name}")

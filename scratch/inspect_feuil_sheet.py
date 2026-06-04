import openpyxl
import os

workspace_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
excel_path = os.path.join(workspace_dir, "EXEMPLAIRE PROFORMA.xlsx")

wb = openpyxl.load_workbook(excel_path, data_only=True)
sheet = wb["Feuil2 (75)"]

print("Dumping cells with values from Feuil2 (75):")
for r in range(1, 40):
    row_vals = []
    for c in range(1, 10):
        val = sheet.cell(r, c).value
        if val is not None:
            row_vals.append(f"C{c}: {repr(val)}")
    if row_vals:
        print(f"Row {r:02d}: {', '.join(row_vals)}")

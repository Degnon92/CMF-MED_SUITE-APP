import openpyxl
import os

workspace_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
excel_path = os.path.join(workspace_dir, "PROFORMA CHIRURGIE", "EXEMPLAIRE PROFORMA.xlsx")
wb = openpyxl.load_workbook(excel_path, data_only=True)
ws = wb["DET. ASS_KELLY ELIAS-SANLAM"]
print("Rows in DET. ASS_KELLY ELIAS-SANLAM:")
for r in range(1, 35):
    row_vals = [ws.cell(r, c).value for c in range(1, 13)]
    if any(row_vals):
        print(f"Row {r:02d}: {row_vals}")

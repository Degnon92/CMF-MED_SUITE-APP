import openpyxl

wb_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\EXEMPLAIRE PROFORMA.xlsx"
wb = openpyxl.load_workbook(wb_path, data_only=True)
sheet = wb["KOUSSA JACQUES"]

print("KOUSSA JACQUES Sheet Contents (first 30 rows):")
for r in range(1, 35):
    row_vals = [sheet.cell(r, c).value for c in range(1, 10)]
    if any(row_vals):
        print(f"Row {r:02d}: {row_vals}")

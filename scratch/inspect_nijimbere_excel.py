import openpyxl

path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\PROFORMA CHIRURGIE\FIDELIA\EXEMPLAIRE PROFORMA2.xlsx"
wb = openpyxl.load_workbook(path, data_only=True)
sheet = "Feuil2 (2)"
ws = wb[sheet]

print(f"--- Cells in {sheet} ---")
for r_idx in range(1, 30):
    row_vals = [ws.cell(row=r_idx, column=c_idx).value for c_idx in range(1, 10)]
    # if any cell is not None
    if any(v is not None for v in row_vals):
        print(f"Row {r_idx}: {row_vals}")

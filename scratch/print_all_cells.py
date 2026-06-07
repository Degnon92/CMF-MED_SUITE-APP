import openpyxl

excel_file = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\PROFORMA CHIRURGIE\EXEMPLAIRE PROFORMA.xlsx"
wb = openpyxl.load_workbook(excel_file, data_only=True)
sheet = wb[' VIDJANGNI FREJUS MAHOUSSI']
for r in range(1, 40):
    for c in range(1, 15):
        val = sheet.cell(r, c).value
        if val is not None:
            print(f"Cell({r},{c}): {repr(val)}")

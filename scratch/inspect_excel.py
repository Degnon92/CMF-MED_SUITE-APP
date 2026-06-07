import openpyxl

wb_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\EXEMPLAIRE PROFORMA.xlsx"
wb = openpyxl.load_workbook(wb_path, read_only=True)
print("Sheets in EXEMPLAIRE PROFORMA.xlsx:")
print(wb.sheetnames)

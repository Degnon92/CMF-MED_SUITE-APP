import openpyxl
import os
import glob

print("Searching for VIDJANGNI in Excel sheets...")
for excel_file in glob.glob(r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\**\*.xlsx", recursive=True):
    try:
        wb = openpyxl.load_workbook(excel_file, read_only=True)
        for sheetname in wb.sheetnames:
            if "VIDJANGNI" in sheetname.upper():
                print(f"Found sheet '{sheetname}' in '{excel_file}'")
    except Exception as e:
        pass

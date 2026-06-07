import docx
import os

docx_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT CONS\RAPPORT CS BATIA IBRAHIM.docx"
if os.path.exists(docx_path):
    doc = docx.Document(docx_path)
    print("BATIA IBRAHIM Docx Text Content:")
    for idx, para in enumerate(doc.paragraphs[:30]):
        if para.text.strip():
            print(f"Para {idx:02d}: {para.text[:120]}")
else:
    print(f"File not found: {docx_path}")

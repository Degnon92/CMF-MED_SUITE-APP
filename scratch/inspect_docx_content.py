import docx

filepath = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\1. Document PC DR GIPSY\RAPPORT\rapport alidjinou carlos.docx"
doc = docx.Document(filepath)
print(f"Content of {filepath}:")
for idx, para in enumerate(doc.paragraphs):
    if para.text.strip():
        print(f"P {idx:02d}: {repr(para.text)}")

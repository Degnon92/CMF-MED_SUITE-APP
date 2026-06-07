import docx

file_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT HOSPI CMF\RAPPORT D'HOSPI CMF.docx"
doc = docx.Document(file_path)

non_empty_p = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
print(f"Total non-empty paragraphs: {len(non_empty_p)}")

print("\nFirst 40 non-empty paragraphs:")
for idx, text in enumerate(non_empty_p[:40]):
    print(f"  P {idx+1}: {text[:120]}")

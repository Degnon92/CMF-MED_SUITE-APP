import docx
import os
import re

file_path = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT CONS\RAPPORT DE CONSULTATION CMF.docx"

doc = docx.Document(file_path)
tb_texts = []
root = doc.element
for el in root.iter():
    if el.tag.endswith('txbxContent'):
        from docx.oxml.ns import qn
        for p in el.findall(qn('w:p')):
            p_obj = docx.text.paragraph.Paragraph(p, doc)
            if p_obj.text.strip():
                tb_texts.append(p_obj.text.strip())

# Segment by "Patient:"
documents = []
current_doc = []
for p in tb_texts:
    if p.lower().startswith("patient") and ":" in p:
        if current_doc:
            documents.append(current_doc)
        current_doc = [p]
    else:
        current_doc.append(p)
if current_doc:
    documents.append(current_doc)

print(f"Total compiled reports found: {len(documents)}")
print("Sample of first 3 reports:")
for idx, d in enumerate(documents[:3]):
    print(f"Report {idx+1}:")
    print(f"  Header: {d[0]}")
    print(f"  Lines count: {len(d)}")
    print(f"  Content snippet: {chr(10).join(d[1:4])}")
    print("-" * 50)

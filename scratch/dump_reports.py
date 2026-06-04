import docx
from docx.oxml.ns import qn

file_path = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT CONS\RAPPORT DE CONSULTATION CMF.docx"
doc = docx.Document(file_path)
tb_texts = []
root = doc.element
for el in root.iter():
    if el.tag.endswith('txbxContent'):
        for p in el.findall(qn('w:p')):
            p_obj = docx.text.paragraph.Paragraph(p, doc)
            if p_obj.text.strip():
                tb_texts.append(p_obj.text.strip())

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

print(f"Total reports: {len(documents)}")
for idx in range(min(5, len(documents))):
    print(f"\n--- REPORT {idx+1} ---")
    for line in documents[idx]:
        print(line)

import docx
import os
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

files = [
    r"c:\Users\Farus\Documents\2.MERCY HOSPITALISATION\..\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT HOSPI CMF\RAPPORT D'HOSPI CMF.docx",
    r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT CONS\RAPPORT DE CONSULTATION CMF.docx"
]

# Let's fix paths to use absolute literals
files = [
    r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT HOSPI CMF\RAPPORT D'HOSPI CMF.docx",
    r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT CONS\RAPPORT DE CONSULTATION CMF.docx"
]

def get_textbox_text(doc):
    texts = []
    root = doc.element
    for el in root.iter():
        if el.tag.endswith('txbxContent'):
            for p in el.findall(qn('w:p')):
                p_obj = docx.text.paragraph.Paragraph(p, doc)
                if p_obj.text.strip():
                    texts.append(p_obj.text.strip())
    return texts

for f in files:
    if os.path.exists(f):
        doc = docx.Document(f)
        tb_texts = get_textbox_text(doc)
        print(f"File: {os.path.basename(f)}")
        print(f"  Textbox paragraphs found: {len(tb_texts)}")
        print(f"  First 15 textbox paragraphs:")
        for idx, t in enumerate(tb_texts[:15]):
            print(f"    {idx:02d}: {t[:120]}")
    else:
        print(f"Not found: {f}")

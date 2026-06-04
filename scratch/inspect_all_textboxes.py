import docx
import os
import glob
from docx.oxml.ns import qn

workspace = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy"
proforma_dir = os.path.join(workspace, "1. Document PC DR GIPSY", "proforma")

files = glob.glob(os.path.join(proforma_dir, "*.docx"))
print(f"Total docx files: {len(files)}")

def get_textbox_paragraphs(doc):
    tb_texts = []
    root = doc.element
    for el in root.iter():
        if el.tag.endswith('txbxContent'):
            for p in el.findall(qn('w:p')):
                p_obj = docx.text.paragraph.Paragraph(p, doc)
                if p_obj.text.strip():
                    tb_texts.append(p_obj.text.strip())
    return tb_texts

for idx, f in enumerate(files[:5]):
    print(f"\n--- File: {os.path.basename(f)} ---")
    try:
        doc = docx.Document(f)
        tb_texts = get_textbox_paragraphs(doc)
        print("Textbox paragraphs count:", len(tb_texts))
        for p in tb_texts[:15]:
            print("  -", p)
    except Exception as e:
        print("Error:", e)

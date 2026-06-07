import docx
import os

file_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT HOSPI CMF\RAPPORT D'HOSPI CMF.docx"

if os.path.exists(file_path):
    doc = docx.Document(file_path)
    
    # 1. Original method
    tb_texts_orig = []
    root = doc.element
    for el in root.iter():
        if el.tag.endswith('txbxContent'):
            from docx.oxml.ns import qn
            for p in el.findall(qn('w:p')):
                p_obj = docx.text.paragraph.Paragraph(p, doc)
                if p_obj.text.strip():
                    tb_texts_orig.append(p_obj.text.strip())
                    
    # 2. Improved method with fallback check
    tb_texts_new = []
    for el in root.iter():
        if el.tag.endswith('txbxContent'):
            # Check if this txbxContent is inside a Fallback element
            parent = el.getparent()
            in_fallback = False
            while parent is not None:
                if parent.tag.endswith('Fallback'):
                    in_fallback = True
                    break
                parent = parent.getparent()
            if in_fallback:
                continue
                
            from docx.oxml.ns import qn
            for p in el.findall(qn('w:p')):
                p_obj = docx.text.paragraph.Paragraph(p, doc)
                if p_obj.text.strip():
                    tb_texts_new.append(p_obj.text.strip())
                    
    print(f"Original method: {len(tb_texts_orig)} paragraphs extracted")
    print(f"New method: {len(tb_texts_new)} paragraphs extracted")
    print("\n--- PREVIEW OF FIRST 15 PARAGRAPHS FROM NEW METHOD ---")
    for idx, text in enumerate(tb_texts_new[:15]):
        print(f"{idx:02d}: {repr(text)}")
else:
    print("File not found")

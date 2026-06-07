import docx
import os
import re

files = [
    (r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT HOSPI CMF\RAPPORT D'HOSPI CMF.docx", "Hospitalisation"),
    (r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT CONS\RAPPORT DE CONSULTATION CMF.docx", "Consultation")
]

def get_textbox_paragraphs(doc):
    tb_texts = []
    root = doc.element
    for el in root.iter():
        if el.tag.endswith('txbxContent'):
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
                    tb_texts.append(p_obj.text.strip())
    return tb_texts

for file_path, category in files:
    if os.path.exists(file_path):
        doc = docx.Document(file_path)
        tb_texts = get_textbox_paragraphs(doc)
        
        segments = []
        current_segment = []
        for p in tb_texts:
            if p.lower().startswith("patient") and ":" in p:
                if current_segment:
                    segments.append(current_segment)
                current_segment = [p]
            else:
                current_segment.append(p)
        if current_segment:
            segments.append(current_segment)
            
        print(f"\n=========================================")
        print(f"File: {os.path.basename(file_path)} ({category})")
        print(f"Total paragraphs in textboxes: {len(tb_texts)}")
        print(f"Total segments found: {len(segments)}")
        
        valid_segments = 0
        for idx, seg in enumerate(segments):
            if not seg or not seg[0].lower().startswith("patient") or ":" not in seg[0]:
                continue
            valid_segments += 1
            if valid_segments <= 3:
                print(f"\n  Segment {valid_segments}:")
                print(f"    Header: {repr(seg[0])}")
                print(f"    Length of content paragraphs: {len(seg) - 1}")
                print(f"    Preview of first 3 content lines:")
                for p in seg[1:4]:
                    print(f"      - {repr(p)}")
        print(f"Valid segments (starting with Patient:): {valid_segments}")
    else:
        print(f"Not found: {file_path}")

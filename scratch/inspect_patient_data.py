import docx
import re
from docx.oxml.ns import qn

file_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT HOSPI CMF\RAPPORT D'HOSPI CMF.docx"
doc = docx.Document(file_path)

tb_texts = []
root = doc.element
for el in root.iter():
    if el.tag.endswith('txbxContent'):
        # Avoid VML fallback duplicates
        parent = el.getparent()
        in_fallback = False
        while parent is not None:
            if parent.tag.endswith('Fallback'):
                in_fallback = True
                break
            parent = parent.getparent()
        if in_fallback:
            continue
            
        for p in el.findall(qn('w:p')):
            p_obj = docx.text.paragraph.Paragraph(p, doc)
            text = p_obj.text.strip()
            if text:
                tb_texts.append(text)

# Let's segment by Patient:
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

for seg in segments:
    if not seg:
        continue
    header = seg[0]
    if "kotto" in header.lower() or "aclinou" in header.lower():
        print("==================================================")
        print("RAW SEGMENT FOR:", header)
        print("==================================================")
        for i, line in enumerate(seg):
            print(f"{i}: {line}")

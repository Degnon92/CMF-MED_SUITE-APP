import docx
import os

files = [
    r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT HOSPI CMF\RAPPORT D'HOSPI CMF.docx",
    r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\RAPPORT CONS\RAPPORT DE CONSULTATION CMF.docx"
]

for f in files:
    if os.path.exists(f):
        doc = docx.Document(f)
        inline_shapes = doc.inline_shapes
        print(f"File: {os.path.basename(f)}")
        print(f"  Inline shapes (images): {len(inline_shapes)}")
    else:
        print(f"Not found: {f}")

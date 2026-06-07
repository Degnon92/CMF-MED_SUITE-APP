import os
import numpy as np
from PIL import Image

def compare_mary_centers():
    brain_dir = r"C:\Users\Farus\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a"
    assets_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\assets"
    
    p_ref_cropped = os.path.join(brain_dir, "cropped_ref_center.png")
    p_cachet_cropped = os.path.join(brain_dir, "cropped_cachet_center.png")
    p_real_mary = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\scratch\extracted_mary.png"
    
    img_ref = Image.open(p_ref_cropped).convert("RGBA")
    img_cachet = Image.open(p_cachet_cropped).convert("RGBA")
    img_real = Image.open(p_real_mary).convert("RGBA")
    
    # Check sizes
    print("img_ref size:", img_ref.size)
    print("img_cachet size:", img_cachet.size)
    print("img_real size:", img_real.size)

if __name__ == "__main__":
    compare_mary_centers()

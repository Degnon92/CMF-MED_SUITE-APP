import os
import numpy as np
from PIL import Image

def process_stamp_fixed():
    # Paths
    ref_path = r"C:\Users\Farus\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a\media__1780516168149.png"
    mary_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\scratch\extracted_mary.png"
    dest_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\assets\cachet_centre.png"
    
    print("Loading stamp outline...")
    stamp_img = Image.open(ref_path).convert("RGBA")
    stamp_arr = np.array(stamp_img)
    h, w = stamp_arr.shape[:2]
    
    # Exact circle center and radius
    cx_c, cy_c = 185.5, 172.0
    r_inner = 78.5
    
    y, x = np.ogrid[:h, :w]
    r_c = np.sqrt((x - cx_c)**2 + (y - cy_c)**2)
    
    # 1. Clear the center of the stamp (inside r_c < r_inner)
    stamp_arr[r_c < r_inner] = [255, 255, 255, 0]
    
    # 2. Recolor the outer ring to rich navy blue: #1B3A8C (27, 58, 140)
    gray_stamp = stamp_img.convert("L")
    gray_arr = np.array(gray_stamp)
    
    # Process outer ring
    for i in range(h):
        for j in range(w):
            if r_c[i, j] >= r_inner:
                val = gray_arr[i, j]
                if val < 240:
                    # Ink pixel
                    alpha = int((255 - val) * 1.1)  # Scale contrast slightly
                    alpha = max(0, min(255, alpha))
                    stamp_arr[i, j] = [27, 58, 140, alpha]
                else:
                    # Background pixel
                    stamp_arr[i, j] = [255, 255, 255, 0]
                    
    # 3. Process the Virgin Mary logo
    print("Loading Virgin Mary logo...")
    mary_img = Image.open(mary_path).convert("RGBA")
    mary_arr = np.array(mary_img)
    mh, mw = mary_arr.shape[:2]
    
    # Recolor Virgin Mary to rich navy blue: #1B3A8C (27, 58, 140)
    for i in range(mh):
        for j in range(mw):
            a = mary_arr[i, j, 3]
            if a > 0:
                mary_arr[i, j] = [27, 58, 140, a]
                
    mary_blue = Image.fromarray(mary_arr)
    
    # Resize Virgin Mary to fit in the center circle
    target_h = 125
    target_w = int(mw * (target_h / mh))
    mary_resized = mary_blue.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # 4. Paste the Virgin Mary in the center of the stamp (relative to circle center)
    final_stamp = Image.fromarray(stamp_arr)
    px = int(cx_c - target_w / 2)
    py = int(cy_c - target_h / 2)
    final_stamp.paste(mary_resized, (px, py), mary_resized)
    
    # Save the final transparent PNG stamp
    final_stamp.save(dest_path, "PNG")
    print(f"Successfully processed stamp saved to {dest_path}")
    
    # Also save to the brain folder so we can copy it/inspect it easily
    brain_dest = r"C:\Users\Farus\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a\cachet_centre_fixed.png"
    final_stamp.save(brain_dest, "PNG")
    print(f"Saved to brain folder: {brain_dest}")

if __name__ == "__main__":
    process_stamp_fixed()

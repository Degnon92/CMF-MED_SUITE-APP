import os
import numpy as np
from PIL import Image

def process_stamp():
    ref_path = r"C:\Users\Farus\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a\media__1780516168149.png"
    mary_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\scratch\clean_mary.png"
    dest_path = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\assets\cachet_centre.png"
    
    print("Loading stamp outline...")
    stamp_img = Image.open(ref_path).convert("RGBA")
    stamp_arr = np.array(stamp_img)
    h, w = stamp_arr.shape[:2]
    cy, cx = h / 2, w / 2
    
    y, x = np.ogrid[:h, :w]
    r = np.sqrt((x - cx)**2 + (y - cy)**2)
    
    # 1. Clear the center of the stamp (inside r < 80)
    stamp_arr[r < 80] = [255, 255, 255, 0]
    
    # 2. Recolor the outer ring to rich navy blue: #1B3A8C (27, 58, 140)
    # We want to keep the drawing but change its color.
    # The original pixels have white background and slate blue ink.
    # Let's convert grayscale intensity to alpha for the navy blue ink!
    gray_stamp = stamp_img.convert("L")
    gray_arr = np.array(gray_stamp)
    
    # For pixels in the outer ring (r >= 80)
    # If the gray value is less than 240 (ink), we set its color to navy blue
    # and calculate its alpha based on the darkness (darker = more opaque)
    for i in range(h):
        for j in range(w):
            if r[i, j] >= 80:
                val = gray_arr[i, j]
                if val < 240:
                    # Ink pixel
                    alpha = int((255 - val) * 1.1)  # Scale contrast slightly
                    alpha = max(0, min(255, alpha))
                    stamp_arr[i, j] = [27, 58, 140, alpha]
                else:
                    # Background pixel
                    stamp_arr[i, j] = [255, 255, 255, 0]
                    
    # 3. Process the gold Virgin Mary logo
    print("Loading Virgin Mary logo...")
    mary_img = Image.open(mary_path).convert("RGBA")
    mary_arr = np.array(mary_img)
    mh, mw = mary_arr.shape[:2]
    
    # Recolor Virgin Mary to rich navy blue: #1B3A8C (27, 58, 140)
    # The gold pixels are already isolated, we just change their RGB while keeping alpha
    for i in range(mh):
        for j in range(mw):
            a = mary_arr[i, j, 3]
            if a > 0:
                # Set color to navy blue and scale alpha for smooth edges
                mary_arr[i, j] = [27, 58, 140, a]
                
    mary_blue = Image.fromarray(mary_arr)
    
    # Resize Virgin Mary to fit in the center circle (diameter 160px)
    # Let's set the height to 125px to keep it nicely centered and spaced
    target_h = 125
    target_w = int(mw * (target_h / mh))
    mary_resized = mary_blue.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # 4. Paste the Virgin Mary in the center of the stamp
    final_stamp = Image.fromarray(stamp_arr)
    px = int(cx - target_w / 2)
    py = int(cy - target_h / 2)
    final_stamp.paste(mary_resized, (px, py), mary_resized)
    
    # Save the final transparent PNG stamp
    final_stamp.save(dest_path, "PNG")
    print(f"Successfully processed stamp saved to {dest_path}")

if __name__ == "__main__":
    process_stamp()

import os
import numpy as np
from PIL import Image

def verify_alignment():
    p = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\assets\cachet_centre.png"
    if not os.path.exists(p):
        print("assets/cachet_centre.png does not exist!")
        return
        
    img = Image.open(p).convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]
    cx_c, cy_c = 185.5, 172.0
    r_inner = 79.0
    
    y, x = np.ogrid[:h, :w]
    r = np.sqrt((x - cx_c)**2 + (y - cy_c)**2)
    
    # Draw red circle on inner border (radius 79.0)
    # Draw green circle around the Virgin Mary boundary (radius 62.5, since height of Mary is 125)
    vis = arr.copy()
    for i in range(h):
        for j in range(w):
            if abs(r[i, j] - r_inner) < 1.0:
                vis[i, j] = [255, 0, 0, 255] # Red
            elif abs(r[i, j] - 62.5) < 1.0:
                vis[i, j] = [0, 255, 0, 255] # Green
                
    Image.fromarray(vis).save(r"C:\Users\Degnon\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a\check_alignment.png")
    print("Saved check_alignment.png to brain artifacts directory")

if __name__ == "__main__":
    verify_alignment()

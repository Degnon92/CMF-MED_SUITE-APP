import os
import numpy as np
from PIL import Image

def inspect_ref():
    p = r"C:\Users\Farus\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a\media__1780516168149.png"
    img = Image.open(p).convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]
    cy, cx = h / 2, w / 2
    print(f"Ref Stamp dimensions: {w}x{h}, center: ({cx}, {cy})")
    
    # Let's find ink pixels (gray value < 240)
    gray = img.convert("L")
    gray_arr = np.array(gray)
    
    y, x = np.ogrid[:h, :w]
    r = np.sqrt((x - cx)**2 + (y - cy)**2)
    
    # Let's see the ink distribution by radius
    for rad in range(0, 180, 10):
        mask = (r >= rad) & (r < rad + 10) & (gray_arr < 240)
        print(f"Radius {rad}-{rad+10}: {np.sum(mask)} ink pixels")

if __name__ == "__main__":
    inspect_ref()

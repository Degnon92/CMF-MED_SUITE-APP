import os
import numpy as np
from PIL import Image

def find_exact_circle():
    p = r"C:\Users\Farus\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a\media__1780516168149.png"
    img = Image.open(p).convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]
    
    gray = img.convert("L")
    gray_arr = np.array(gray)
    
    # We know the inner circle is around radius 75-85.
    # Let's find all ink pixels (gray < 240) and search for the circle parameters (cx, cy, r)
    # that maximize the overlap with the ink pixels.
    # Let's search cx in [170, 195], cy in [160, 180], r in [75, 85]
    best_overlap = 0
    best_cx, best_cy, best_r = 0, 0, 0
    
    # Pre-calculate coordinates of ink pixels
    y_ink, x_ink = np.where(gray_arr < 240)
    
    for cx_candidate in np.arange(175, 190, 0.5):
        for cy_candidate in np.arange(165, 175, 0.5):
            for r_candidate in np.arange(76, 82, 0.5):
                # Calculate how many ink pixels lie exactly on this circle (with width 1.5 pixels)
                dists = np.sqrt((x_ink - cx_candidate)**2 + (y_ink - cy_candidate)**2)
                overlap = np.sum(np.abs(dists - r_candidate) < 1.0)
                if overlap > best_overlap:
                    best_overlap = overlap
                    best_cx, best_cy, best_r = cx_candidate, cy_candidate, r_candidate
                    
    print(f"Best circle: center=({best_cx}, {best_cy}), radius={best_r}, overlap={best_overlap}")

if __name__ == "__main__":
    find_exact_circle()

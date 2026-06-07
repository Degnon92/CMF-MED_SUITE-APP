import os
import numpy as np
from PIL import Image

def analyze_stamp_lines():
    p = r"C:\Users\Farus\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a\media__1780516168149.png"
    img = Image.open(p).convert("L")
    arr = np.array(img)
    h, w = arr.shape
    cy, cx = h // 2, w // 2
    
    print(f"Stamp center: ({cx}, {cy})")
    
    # Let's inspect values along the horizontal line crossing the center
    # Ink pixels have values < 240.
    center_row = arr[cy, :]
    center_col = arr[:, cx]
    
    print("Horizontal ink pixel X-coordinates relative to center:")
    for x in range(w):
        if center_row[x] < 240:
            print(f"  x={x - cx} (value={center_row[x]})")
            
    print("Vertical ink pixel Y-coordinates relative to center:")
    for y in range(h):
        if center_col[y] < 240:
            print(f"  y={y - cy} (value={center_col[y]})")

if __name__ == "__main__":
    analyze_stamp_lines()

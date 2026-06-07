import os
import numpy as np
from PIL import Image

def analyze_ref_center():
    p = r"C:\Users\Farus\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a\media__1780516168149.png"
    img = Image.open(p).convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]
    cy, cx = h / 2, w / 2
    
    gray = img.convert("L")
    gray_arr = np.array(gray)
    
    # Let's find all ink pixels (gray < 240) in the central area
    ink_y, ink_x = np.where(gray_arr < 240)
    
    # Calculate distance from center for each ink pixel
    dist = np.sqrt((ink_x - cx)**2 + (ink_y - cy)**2)
    
    # Print the ink pixels coordinates and distance
    print("Total ink pixels:", len(ink_x))
    print("Ink pixels inside r < 70:", np.sum(dist < 70))
    print("Ink pixels between 70 <= r < 100:", np.sum((dist >= 70) & (dist < 100)))
    print("Ink pixels between 100 <= r < 120:", np.sum((dist >= 100) & (dist < 120)))
    
    # Let's save a visualization where we mark the cleared region
    vis = arr.copy()
    y, x = np.ogrid[:h, :w]
    r = np.sqrt((x - cx)**2 + (y - cy)**2)
    
    # Draw a red circle of radius 80, 100, 120 to see where the inner stamp lines are
    for i in range(h):
        for j in range(w):
            if abs(r[i, j] - 80) < 1.0:
                vis[i, j] = [255, 0, 0, 255]
            elif abs(r[i, j] - 100) < 1.0:
                vis[i, j] = [0, 255, 0, 255]
            elif abs(r[i, j] - 120) < 1.0:
                vis[i, j] = [0, 0, 255, 255]
                
    Image.fromarray(vis).save(r"C:\Users\Farus\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a\ref_stamp_circles.png")
    print("Saved ref_stamp_circles.png with circles at r=80 (red), r=100 (green), r=120 (blue)")

if __name__ == "__main__":
    analyze_ref_center()

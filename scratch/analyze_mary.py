import os
import numpy as np
from PIL import Image

def analyze_mary():
    p = r"C:\Users\Farus\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a\media__1780517416594.png"
    img = Image.open(p).convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]
    
    # Let's count how many pixels are in different color ranges
    # Background is white (R,G,B close to 255)
    # Red cross is red (R > 200, G < 100, B < 100)
    # Gold is gold (R > 100, G > 100, B < 150)
    
    white_mask = (arr[:, :, 0] > 240) & (arr[:, :, 1] > 240) & (arr[:, :, 2] > 240)
    red_mask = (arr[:, :, 0] > 180) & (arr[:, :, 1] < 100) & (arr[:, :, 2] < 100)
    
    # Gold is anything that is not white and not red, and has some color
    # Let's see
    gold_mask = ~white_mask & ~red_mask & (arr[:, :, 3] > 10)
    
    print(f"Image size: {w}x{h}")
    print(f"White pixels: {np.sum(white_mask)}")
    print(f"Red pixels: {np.sum(red_mask)}")
    print(f"Gold/Other pixels: {np.sum(gold_mask)}")
    
    # Find bounding box of gold pixels
    y_indices, x_indices = np.where(gold_mask)
    if len(y_indices) > 0:
        min_y, max_y = np.min(y_indices), np.max(y_indices)
        min_x, max_x = np.min(x_indices), np.max(x_indices)
        print(f"Gold bounding box: x in [{min_x}, {max_x}], y in [{min_y}, {max_y}]")
        
        # Save gold pixels only with transparent background
        gold_arr = np.zeros((h, w, 4), dtype=np.uint8)
        gold_arr[gold_mask] = arr[gold_mask]
        # Set alpha to 255 for gold, 0 for others
        gold_arr[:, :, 3] = np.where(gold_mask, 255, 0)
        
        # Crop to bounding box
        cropped = Image.fromarray(gold_arr).crop((min_x, min_y, max_x + 1, max_y + 1))
        cropped.save(r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\scratch\extracted_mary.png")
        print("Saved extracted_mary.png")
    else:
        print("No gold pixels found!")

if __name__ == "__main__":
    analyze_mary()

import os
from PIL import Image
import numpy as np

def check_stamp():
    brain_dir = r"C:\Users\Degnon\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a"
    assets_dir = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\assets"
    
    # Let's see if cachet_centre.png has the Virgin Mary in the center
    cachet_path = os.path.join(assets_dir, "cachet_centre.png")
    img = Image.open(cachet_path).convert("RGBA")
    w, h = img.size
    cx, cy = w // 2, h // 2
    
    # Check if there are non-transparent blue pixels in the center area
    arr = np.array(img)
    center_area = arr[cy-50:cy+50, cx-50:cx+50]
    # Check number of pixels with alpha > 10 and blue color predominant
    blue_mask = (center_area[:, :, 2] > center_area[:, :, 0]) & (center_area[:, :, 3] > 10)
    num_blue_pixels = np.sum(blue_mask)
    print("Number of blue pixels in center area (100x100):", num_blue_pixels)
    
    # Check if there are any pixels in media__1780516168149.png center area
    ref_path = os.path.join(brain_dir, "media__1780516168149.png")
    img_ref = Image.open(ref_path).convert("RGBA")
    arr_ref = np.array(img_ref)
    center_ref = arr_ref[cy-50:cy+50, cx-50:cx+50]
    # Check how many dark pixels are in the center of the ref image (ink pixels, e.g. < 240 gray)
    gray_ref = img_ref.convert("L")
    arr_gray = np.array(gray_ref)
    center_gray = arr_gray[cy-50:cy+50, cx-50:cx+50]
    ink_pixels = np.sum(center_gray < 240)
    print("Number of ink pixels in reference image center area (100x100):", ink_pixels)

if __name__ == "__main__":
    check_stamp()

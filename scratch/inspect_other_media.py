import os
from PIL import Image
import numpy as np

def inspect_others():
    brain_dir = r"C:\Users\Degnon\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a"
    for fn in ["media__1780516233833.png", "media__1780515659220.png", "media__1780515749271.png"]:
        p = os.path.join(brain_dir, fn)
        if os.path.exists(p):
            img = Image.open(p)
            print(f"{fn}: size={img.size}, mode={img.mode}")
            # check number of distinct colors
            arr = np.array(img.convert("RGB"))
            colors = np.unique(arr.reshape(-1, 3), axis=0)
            print(f"  Distinct colors: {len(colors)}")
            # check non-transparent pixels if RGBA
            if img.mode == "RGBA":
                alpha = np.array(img)[:, :, 3]
                print(f"  Non-transparent: {np.sum(alpha > 10)}")

if __name__ == "__main__":
    inspect_others()

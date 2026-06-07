import os
import glob
from PIL import Image
import numpy as np

def inspect_images():
    brain_dir = r"C:\Users\Farus\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a"
    assets_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\assets"
    scratch_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\scratch"
    
    # Let's inspect some key files
    files = {
        "assets/cachet_centre.png": os.path.join(assets_dir, "cachet_centre.png"),
        "scratch/clean_mary.png": os.path.join(scratch_dir, "clean_mary.png"),
        "media__1780516168149.png": os.path.join(brain_dir, "media__1780516168149.png"),
        "media__1780517416594.png": os.path.join(brain_dir, "media__1780517416594.png"),
        "media__1780516233833.png": os.path.join(brain_dir, "media__1780516233833.png"),
    }
    
    for name, path in files.items():
        if os.path.exists(path):
            img = Image.open(path)
            arr = np.array(img)
            # Find non-transparent pixels (alpha > 0)
            if arr.ndim == 3 and arr.shape[2] == 4:
                alpha = arr[:, :, 3]
                non_transparent = np.sum(alpha > 10)
                mean_color = np.mean(arr[alpha > 10, :3], axis=0) if non_transparent > 0 else [0,0,0]
            else:
                non_transparent = img.size[0] * img.size[1]
                mean_color = np.mean(arr)
            print(f"{name}: size={img.size}, mode={img.mode}, non_transparent={non_transparent}, mean_color={mean_color}")
        else:
            print(f"{name}: DOES NOT EXIST")

if __name__ == "__main__":
    inspect_images()

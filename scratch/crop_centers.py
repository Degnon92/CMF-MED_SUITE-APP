import os
from PIL import Image

def crop_centers():
    brain_dir = r"C:\Users\Farus\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a"
    assets_dir = r"c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\assets"
    
    p1 = os.path.join(brain_dir, "media__1780516168149.png")
    p2 = os.path.join(assets_dir, "cachet_centre.png")
    
    if os.path.exists(p1):
        img1 = Image.open(p1).convert("RGBA")
        w, h = img1.size
        # crop center
        c1 = img1.crop((w//2 - 100, h//2 - 100, w//2 + 100, h//2 + 100))
        c1.save(os.path.join(brain_dir, "cropped_ref_center.png"))
        print("Saved cropped_ref_center.png")
        
    if os.path.exists(p2):
        img2 = Image.open(p2).convert("RGBA")
        w, h = img2.size
        c2 = img2.crop((w//2 - 100, h//2 - 100, w//2 + 100, h//2 + 100))
        c2.save(os.path.join(brain_dir, "cropped_cachet_center.png"))
        print("Saved cropped_cachet_center.png")

if __name__ == "__main__":
    crop_centers()

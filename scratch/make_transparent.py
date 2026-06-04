import os
from PIL import Image

def make_transparent(input_path, output_path):
    print(f"Loading image from {input_path}")
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    for item in datas:
        r, g, b, a = item
        # Since the background of the user's uploaded image is white,
        # we can make pixels close to white transparent.
        # Let's check if the pixel is white/light gray.
        if r > 240 and g > 240 and b > 240:
            # Completely transparent
            new_data.append((255, 255, 255, 0))
        elif r > 210 and g > 210 and b > 210:
            # Semi-transparent transition for smooth anti-aliased borders
            avg = (r + g + b) / 3.0
            # map avg in [210, 240] to alpha [255, 0]
            alpha = int(255 - (avg - 210) * 8.5)
            alpha = max(0, min(255, alpha))
            new_data.append((r, g, b, alpha))
        else:
            new_data.append((r, g, b, a))
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved transparent image to {output_path}")

if __name__ == "__main__":
    src = r"C:\Users\Degnon\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a\media__1780516168149.png"
    dest = r"c:\Users\Degnon\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\assets\cachet_centre.png"
    make_transparent(src, dest)

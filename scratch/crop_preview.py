from PIL import Image

im = Image.open(r"C:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\scratch\current_screen.png")
print("Size:", im.size)

# Let's crop the center-right part of the image where the preview is located
# The preview is usually on the right side.
w, h = im.size
# Crop right half
preview = im.crop((w // 3, 0, w, h))
preview.save(r"C:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\scratch\preview_crop.png")
print("Saved preview_crop.png")

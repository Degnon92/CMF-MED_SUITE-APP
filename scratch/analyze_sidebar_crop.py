from PIL import Image

im = Image.open(r"C:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\scratch\sidebar_crop.png")
w, h = im.size
print(f"Sidebar image size: {w}x{h}")

# Convert to grayscale
gray = im.convert("L")

# Count dark pixels (e.g. gray value < 100) per row
row_densities = []
for y in range(h):
    dark_count = 0
    for x in range(w):
        val = gray.getpixel((x, y))
        if val < 150: # Dark pixel
            dark_count += 1
    row_densities.append(dark_count)

# Find vertical spans of text
in_text = False
text_spans = []
start_y = 0

for y, density in enumerate(row_densities):
    if density > 2: # Threshold for text row
        if not in_text:
            in_text = True
            start_y = y
    else:
        if in_text:
            in_text = False
            text_spans.append((start_y, y))

print("Text vertical spans count:", len(text_spans))
for i, span in enumerate(text_spans):
    print(f"Span {i+1}: Y {span[0]} to {span[1]} (height: {span[1] - span[0]})")

from PIL import Image

im = Image.open(r"C:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\scratch\current_screen.png")
w, h = im.size
print(f"Captured screen size: {w}x{h}")

# Find pure white pixels (255, 255, 255)
min_x, min_y = w, h
max_x, max_y = 0, 0

for y in range(h):
    for x in range(w):
        p = im.getpixel((x, y))
        r, g, b = p[0], p[1], p[2]
        if r == 255 and g == 255 and b == 255:
            if x < min_x: min_x = x
            if x > max_x: max_x = x
            if y < min_y: min_y = y
            if y > max_y: max_y = y

print(f"Pure white region box: ({min_x}, {min_y}, {max_x}, {max_y})")

if max_x > min_x and max_y > min_y:
    page = im.crop((min_x, min_y, max_x, max_y))
    page.save(r"C:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\scratch\page_crop.png")
    print("Saved page_crop.png")
    
    page_w = max_x - min_x
    sidebar = page.crop((0, 0, int(page_w * 0.25), page.height))
    sidebar.save(r"C:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\scratch\sidebar_crop.png")
    print("Saved sidebar_crop.png")
else:
    print("No pure white page found")

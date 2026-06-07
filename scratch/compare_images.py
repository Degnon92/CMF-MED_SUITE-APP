from PIL import Image

img_ref = Image.open(r"C:\Users\Farus\.gemini\antigravity-ide\brain\56c8bb09-5403-4235-b646-d407a84e5431\media__1780828957536.png")
img_curr = Image.open(r"C:\Users\Farus\.gemini\antigravity-ide\brain\56c8bb09-5403-4235-b646-d407a84e5431\current_screen.png")

print("Ref size:", img_ref.size)
print("Curr size:", img_curr.size)

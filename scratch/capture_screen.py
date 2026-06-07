import ctypes
import time
from PIL import ImageGrab

def click(x, y):
    # Move mouse
    ctypes.windll.user32.SetCursorPos(x, y)
    # Press down and up
    ctypes.windll.user32.mouse_event(2, 0, 0, 0, 0) # left down
    time.sleep(0.05)
    ctypes.windll.user32.mouse_event(4, 0, 0, 0, 0) # left up

print("Moving mouse and clicking...")
# Click on the first row's Lire button (approx x=1680, y=485)
click(1680, 485)

# Wait 3 seconds for the modal / preview to open and load
time.sleep(3)

# Capture screen
im = ImageGrab.grab()
dest = r"C:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\scratch\current_screen.png"
im.save(dest)
print("New screenshot saved to", dest)

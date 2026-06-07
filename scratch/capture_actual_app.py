import ctypes
import time
from PIL import ImageGrab

# Win32 API definitions
EnumWindows = ctypes.windll.user32.EnumWindows
EnumWindowsProc = ctypes.WINFYTYPE = ctypes.WINFUNCTYPE(ctypes.c_bool, ctypes.c_int, ctypes.c_void_p)
GetWindowText = ctypes.windll.user32.GetWindowTextW
GetWindowTextLength = ctypes.windll.user32.GetWindowTextLengthW
IsWindowVisible = ctypes.windll.user32.IsWindowVisible
GetWindowRect = ctypes.windll.user32.GetWindowRect
SetForegroundWindow = ctypes.windll.user32.SetForegroundWindow
ShowWindow = ctypes.windll.user32.ShowWindow

class RECT(ctypes.Structure):
    _fields_ = [("left", ctypes.c_long),
                ("top", ctypes.c_long),
                ("right", ctypes.c_long),
                ("bottom", ctypes.c_long)]

found_hwnds = []

def callback(hwnd, extra):
    if IsWindowVisible(hwnd):
        length = GetWindowTextLength(hwnd)
        if length > 0:
            buff = ctypes.create_unicode_buffer(length + 1)
            GetWindowText(hwnd, buff, length + 1)
            title = buff.value
            if "MercyFiat" in title or "MedSuite" in title:
                found_hwnds.append((hwnd, title))
    return True

EnumWindows(EnumWindowsProc(callback), 0)

if found_hwnds:
    hwnd, title = found_hwnds[0]
    print(f"Found window: {title} (hwnd: {hwnd})")
    
    # Restore window if minimized
    ShowWindow(hwnd, 9) # SW_RESTORE
    time.sleep(0.5)
    
    # Bring to front
    SetForegroundWindow(hwnd)
    time.sleep(1)
    
    # Get rect
    rect = RECT()
    GetWindowRect(hwnd, ctypes.byref(rect))
    bbox = (rect.left, rect.top, rect.right, rect.bottom)
    print("Capturing bbox:", bbox)
    
    im = ImageGrab.grab(bbox)
    dest = r"C:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop\scratch\current_screen.png"
    im.save(dest)
    print("New screenshot saved to", dest)
else:
    print("No MercyFiat or MedSuite window found.")

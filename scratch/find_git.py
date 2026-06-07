import os

common_paths = [
    r"C:\Program Files\Git\bin\git.exe",
    r"C:\Program Files (x86)\Git\bin\git.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Programs\Git\bin\git.exe"),
    os.path.expandvars(r"%USERPROFILE%\AppData\Local\Programs\Git\bin\git.exe"),
    os.path.expandvars(r"%PROGRAMFILES%\Git\cmd\git.exe"),
]

print("Searching for git.exe...")
found = False
for path in common_paths:
    if os.path.exists(path):
        print(f"Found git at: {path}")
        found = True

if not found:
    print("git.exe not found in common paths.")

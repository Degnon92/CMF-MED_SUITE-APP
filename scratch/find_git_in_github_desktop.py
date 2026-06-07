import os
import glob

search_path = r"C:\Users\Farus\AppData\Local\GitHubDesktop\**\git.exe"
print(f"Searching in: {search_path}")
files = glob.glob(search_path, recursive=True)
for f in files:
    print(f"Found: {f}")

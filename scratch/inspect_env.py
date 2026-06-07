import os

paths = os.environ.get("PATH", "").split(os.pathpathsep if hasattr(os, "pathpathsep") else ";")
print("System PATH folders:")
for p in paths:
    print(p)

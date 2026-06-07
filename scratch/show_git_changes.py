import sys
import subprocess

sys.stdout.reconfigure(encoding='utf-8')

git_path = r"C:\Users\Farus\AppData\Local\GitHubDesktop\app-3.5.12\resources\app\git\cmd\git.exe"

def run_cmd(cmd):
    res = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8', errors='ignore')
    return res.stdout, res.stderr

print("--- DIFF OF DOCUMENTS.JS IN LAST COMMIT ---")
stdout, _ = run_cmd([git_path, "diff", "HEAD~1", "HEAD", "--", "documents.js"])
print(stdout)

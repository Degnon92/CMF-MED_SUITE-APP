import subprocess

git_path = r"C:\Users\Farus\AppData\Local\GitHubDesktop\app-3.5.12\resources\app\git\cmd\git.exe"
cmd = [git_path, "remote", "-v"]

res = subprocess.run(cmd, capture_output=True, text=True)
print("Stdout:")
print(res.stdout)
print("Stderr:")
print(res.stderr)
print("Return code:", res.returncode)

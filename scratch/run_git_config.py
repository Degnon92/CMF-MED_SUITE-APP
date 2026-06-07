import subprocess

git_path = r"C:\Users\Farus\AppData\Local\GitHubDesktop\app-3.5.12\resources\app\git\cmd\git.exe"
repo_dir = r"C:/Users/Farus/Documents/2.MERCY FIAT CLINIQUE/2. Dr Gipsy/MercyFiatMedSuiteDesktop"

cmd = [git_path, "config", "--global", "--add", "safe.directory", repo_dir]
print("Running:", cmd)
res = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", res.returncode)
print("Stdout:", res.stdout)
print("Stderr:", res.stderr)

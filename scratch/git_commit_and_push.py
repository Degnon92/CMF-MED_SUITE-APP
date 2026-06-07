import subprocess

git_path = r"C:\Users\Farus\AppData\Local\GitHubDesktop\app-3.5.12\resources\app\git\cmd\git.exe"

def run_git(args):
    cmd = [git_path] + args
    print(f"Running: {' '.join(cmd)}")
    res = subprocess.run(cmd, capture_output=True, text=True)
    print("Stdout:")
    print(res.stdout)
    print("Stderr:")
    print(res.stderr)
    print("Return code:", res.returncode)
    return res.returncode == 0

print("Step 1: Staging changes...")
if run_git(["add", "."]):
    print("\nStep 2: Committing changes...")
    commit_msg = "Fix report pagination, patient name display and add Nouveau button in clinical header"
    if run_git(["commit", "-m", commit_msg]):
        print("\nStep 3: Pushing changes...")
        run_git(["push", "origin", "main"])
    else:
        print("Commit failed or nothing to commit.")
else:
    print("Staging failed.")

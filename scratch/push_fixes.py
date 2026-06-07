import ctypes
from ctypes import wintypes
import subprocess

# Define structures to read credential
LPBYTE = ctypes.POINTER(ctypes.c_ubyte)

class FILETIME(ctypes.Structure):
    _fields_ = [("dwLowDateTime", wintypes.DWORD),
                ("dwHighDateTime", wintypes.DWORD)]

class CREDENTIALW(ctypes.Structure):
    _fields_ = [
        ("Flags", wintypes.DWORD),
        ("Type", wintypes.DWORD),
        ("TargetName", wintypes.LPWSTR),
        ("Comment", wintypes.LPWSTR),
        ("LastWritten", FILETIME),
        ("CredentialBlobSize", wintypes.DWORD),
        ("CredentialBlob", LPBYTE),
        ("Persist", wintypes.DWORD),
        ("AttributeCount", wintypes.DWORD),
        ("Attributes", ctypes.c_void_p),
        ("TargetAlias", wintypes.LPWSTR),
        ("UserName", wintypes.LPWSTR),
    ]

PCREDENTIALW = ctypes.POINTER(CREDENTIALW)

advapi32 = ctypes.windll.advapi32
CredReadW = advapi32.CredReadW
CredReadW.argtypes = [wintypes.LPWSTR, wintypes.DWORD, wintypes.DWORD, ctypes.POINTER(PCREDENTIALW)]
CredReadW.restype = wintypes.BOOL

CredFree = advapi32.CredFree
CredFree.argtypes = [ctypes.c_void_p]
CredFree.restype = None

# Get credentials
target = "GitHub - https://api.github.com/Degnon92"
cred_ptr = PCREDENTIALW()

if not CredReadW(target, 1, 0, ctypes.byref(cred_ptr)):
    print("Failed to read GitHub credentials from Credential Manager.")
    exit(1)

cred = cred_ptr.contents
blob_size = cred.CredentialBlobSize
blob = ctypes.string_at(cred.CredentialBlob, blob_size)
token = blob.decode('utf-8').strip()
CredFree(cred_ptr)

git_path = r"C:\Users\Farus\AppData\Local\GitHubDesktop\app-3.5.12\resources\app\git\cmd\git.exe"

def run_git(args, hide_token=False):
    cmd = [git_path] + args
    res = subprocess.run(cmd, capture_output=True, text=True)
    stdout = res.stdout
    stderr = res.stderr
    if hide_token:
        stdout = stdout.replace(token, "********")
        stderr = stderr.replace(token, "********")
    print("Stdout:", stdout)
    print("Stderr:", stderr)
    return res.returncode == 0

print("Staging changes...")
run_git(["add", "."])

print("Committing changes...")
commit_msg = "Fix name splitting, prefill IDs and header duplication in reports"
run_git(["commit", "-m", commit_msg])

print("Pushing changes...")
push_url = f"https://{token}@github.com/Degnon92/CMF-MED_SUITE-APP"
if run_git(["push", push_url, "main"], hide_token=True):
    print("Push succeeded!")
    print("Fetching origin to update local tracking...")
    run_git(["fetch", "origin"])
else:
    print("Push failed.")

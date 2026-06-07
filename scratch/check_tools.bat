@echo off
echo --- CHECKING DIRECT PATHS ---
if exist "C:\Program Files\nodejs\node.exe" (
    echo Node.exe found in Program Files!
    "C:\Program Files\nodejs\node.exe" --version
) else (
    echo Node.exe not found in Program Files.
)
if exist "C:\Users\Farus\AppData\Local\Programs\Python\Python312\python.exe" (
    echo Python.exe found in AppData Local!
    "C:\Users\Farus\AppData\Local\Programs\Python\Python312\python.exe" --version
) else (
    echo Python.exe not found in AppData Local.
)
if exist "C:\Program Files\Git\cmd\git.exe" (
    echo Git.exe found in Program Files!
    "C:\Program Files\Git\cmd\git.exe" --version
) else (
    echo Git.exe not found in Program Files.
)

echo --- RELOADING PATH AND TESTING GENERAL COMMANDS ---
:: Reload PATH from registry
for /f "tokens=2*" %%A in ('reg query "HKLM\System\CurrentControlSet\Control\Session Manager\Environment" /v Path') do set "SYS_PATH=%%B"
for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v Path') do set "USR_PATH=%%B"
set "PATH=%SYS_PATH%;%USR_PATH%"

echo node version:
node --version
echo python version:
python --version
echo git version:
git --version

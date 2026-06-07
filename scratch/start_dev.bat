@echo off
echo [INFO] Reloading PATH environment variables...
for /f "tokens=2*" %%A in ('reg query "HKLM\System\CurrentControlSet\Control\Session Manager\Environment" /v Path') do set "SYS_PATH=%%B"
for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v Path') do set "USR_PATH=%%B"
set "PATH=%SYS_PATH%;%USR_PATH%"

echo [INFO] Current Path reloaded. Testing Node...
node --version

echo [INFO] Starting the Electron application in dev mode...
cd /d "c:\Users\Farus\Documents\2.MERCY FIAT CLINIQUE\2. Dr Gipsy\MercyFiatMedSuiteDesktop"
npm start

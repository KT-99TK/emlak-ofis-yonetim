@echo off
setlocal
cd /d "%~dp0"

where powershell.exe >nul 2>&1
if errorlevel 1 (
  echo PowerShell bulunamadi. Windows 10/11 ile birlikte gelen PowerShell gereklidir.
  pause
  exit /b 1
)

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0WINDOWS-KURULUM.ps1"
set "EXIT_CODE=%ERRORLEVEL%"

echo.
if "%EXIT_CODE%"=="0" (
  echo Islem tamamlandi. release klasorundeki .exe dosyasini kontrol edin.
) else (
  echo Islem basarisiz oldu. Yukaridaki hata mesajini teknik sorumluya iletin.
)
pause
exit /b %EXIT_CODE%

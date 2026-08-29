@echo off
setlocal DisableDelayedExpansion
cd /d "%~dp0"

echo Global 1881 Gayrimenkul - Windows kurulum paketi hazirlayici
echo Bu betik yalniz bu klasordeki yerel kaynak kodu paketler.

if not exist "package.json" (
  echo HATA: package.json bulunamadi. ZIP dosyasini tamamen cikarin.
  pause
  exit /b 1
)

where node.exe >nul 2>&1
if errorlevel 1 (
  echo HATA: Node.js LTS bulunamadi. Node.js LTS kurulumunu tamamlayin.
  pause
  exit /b 1
)

where pnpm.cmd >nul 2>&1
if errorlevel 1 (
  echo HATA: pnpm bulunamadi. Bu betik internetten paket indirmez.
  echo Lutfen pnpm kurulumunu teknik sorumluyla birlikte tamamlayin.
  pause
  exit /b 1
)

echo Bagimliliklar kilit dosyasina gore kontrol ediliyor...
call pnpm.cmd install --frozen-lockfile
if errorlevel 1 goto :failed

echo TypeScript kontrolu yapiliyor...
call pnpm.cmd check
if errorlevel 1 goto :failed

echo Windows installer uretiliyor...
call pnpm.cmd desktop:installer
if errorlevel 1 goto :failed

set "INSTALLER=release\Global1881-Ofis-Offline-v1.0.23-FINAL.exe"
if not exist "%INSTALLER%" (
  echo HATA: Beklenen installer bulunamadi: %INSTALLER%
  pause
  exit /b 1
)

for %%I in ("%INSTALLER%") do set "SIZE=%%~zI"
if %SIZE% LSS 52428800 (
  echo HATA: Installer boyutu beklenenden kucuk. Dosyayi dagitmayin.
  pause
  exit /b 1
)

echo.
echo BASARILI: %INSTALLER%
echo Installer boyutu: %SIZE% bayt
echo Dosyayi ancak kurumsal guvenlik kontrolunden sonra kullanin.
pause
exit /b 0

:failed
echo.
echo HATA: Paketleme tamamlanmadi. Yukaridaki hata metnini teknik sorumluya iletin.
pause
exit /b 1

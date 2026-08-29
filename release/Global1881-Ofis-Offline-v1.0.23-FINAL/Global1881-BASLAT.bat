@echo off
setlocal
cd /d "%~dp0"
set "APP=Global1881-Ofis-Offline-v1.0.23-FINAL.exe"
if not exist "%APP%" (
  echo Hazir 1.0.23 EXE bu klasorde bulunamadi.
  pause
  exit /b 1
)
start "Global 1881 Ofis Yonetimi" "%APP%"
exit /b 0

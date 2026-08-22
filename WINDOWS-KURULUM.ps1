$ErrorActionPreference = "Stop"
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Stop-WithMessage([string]$message) {
  Write-Host "`nHATA: $message" -ForegroundColor Red
  Write-Host "Bu pencereyi kapatmadan önce hata metnini teknik sorumluya iletin." -ForegroundColor Yellow
  exit 1
}

Write-Host "Global 1881 Gayrimenkul - Windows kurulum paketi hazırlayıcı" -ForegroundColor DarkGreen
Write-Host "Proje klasörü aranıyor..."

$packageFile = Get-ChildItem -Path $scriptRoot -Filter "package.json" -File -Recurse |
  Where-Object { $_.FullName -notmatch "\\node_modules\\" } |
  Select-Object -First 1

if (-not $packageFile) {
  Stop-WithMessage "package.json bulunamadı. ZIP dosyasını tam olarak çıkardığınızdan emin olun."
}

$projectRoot = $packageFile.DirectoryName
Set-Location $projectRoot
Write-Host "Proje: $projectRoot" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Stop-WithMessage "Node.js bulunamadı. Önce Windows için Node.js LTS kurun, sonra bu scripti yeniden çalıştırın."
}

$useNpxPnpm = $false
if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
    Stop-WithMessage "pnpm ve npx bulunamadı. Node.js LTS kurulumunu tamamlayıp scripti yeniden çalıştırın."
  }
  $useNpxPnpm = $true
  Write-Host "pnpm sistemde bulunamadı; yönetici izni gerektirmeyen npx pnpm fallback kullanılacak." -ForegroundColor Yellow
}

function Invoke-Pnpm([string[]]$Arguments) {
  if ($useNpxPnpm) {
    & npx.cmd --yes pnpm@10.4.1 @Arguments
  } else {
    & pnpm @Arguments
  }
  if ($LASTEXITCODE -ne 0) { throw "pnpm komutu başarısız oldu: $($Arguments -join ' ')" }
}

Write-Host "Bağımlılıklar kuruluyor..." -ForegroundColor Cyan
try { Invoke-Pnpm @("install") } catch { Stop-WithMessage "Bağımlılık kurulumu başarısız oldu. $($_.Exception.Message)" }

Write-Host "TypeScript kontrolü çalışıyor..." -ForegroundColor Cyan
try { Invoke-Pnpm @("check") } catch { Stop-WithMessage "TypeScript kontrolü başarısız oldu; kurulum paketi üretilmedi. $($_.Exception.Message)" }

Write-Host "Windows kurulum paketi üretiliyor..." -ForegroundColor Cyan
try { Invoke-Pnpm @("desktop:installer") } catch { Stop-WithMessage "Electron Windows kurulum paketi üretilemedi. $($_.Exception.Message)" }

$releaseDir = Join-Path $projectRoot "release"
$installer = Get-ChildItem -Path $releaseDir -Filter "*.exe" -File -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $installer) {
  Stop-WithMessage "Build tamamlandı ancak release klasöründe .exe bulunamadı. Komut çıktısını kontrol edin."
}

Write-Host "`nBAŞARILI" -ForegroundColor Green
Write-Host "Kurulum dosyası: $($installer.FullName)" -ForegroundColor Green
Write-Host "Bu .exe dosyasını manager bilgisayarında test ettikten sonra çalışanlara gönderin." -ForegroundColor Yellow
Write-Host "Kaynak kodu, .env ve node_modules klasörlerini paylaşmayın." -ForegroundColor Yellow

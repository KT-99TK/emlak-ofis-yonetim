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

$packageJson = Get-Content -Raw -Path (Join-Path $projectRoot "package.json") | ConvertFrom-Json
$expectedVersion = "1.0.13"
if ($packageJson.version -ne $expectedVersion) {
  Stop-WithMessage "Bu klasördeki package.json sürümü $($packageJson.version). Beklenen sürüm $expectedVersion. Eski ZIP/proje klasörünü kullanmayın; güncel checkpoint ZIP’ini yeniden çıkarın."
}
Write-Host "Sürüm doğrulandı: $($packageJson.name) v$($packageJson.version)" -ForegroundColor DarkGreen

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Stop-WithMessage "Node.js bulunamadı. Önce Windows için Node.js LTS kurun, sonra bu scripti yeniden çalıştırın."
}

$useNpxPnpm = $false
$pnpmCommand = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
if (-not $pnpmCommand) {
  if (-not (Get-Command npx.cmd -ErrorAction SilentlyContinue)) {
    Stop-WithMessage "pnpm ve npx.cmd bulunamadı. Node.js LTS kurulumunu tamamlayıp scripti yeniden çalıştırın."
  }
  $useNpxPnpm = $true
  Write-Host "pnpm.cmd sistemde bulunamadı; yönetici izni gerektirmeyen npx.cmd pnpm fallback kullanılacak." -ForegroundColor Yellow
} else {
  Write-Host "pnpm.cmd bulundu; PowerShell script politikalarından etkilenmeyen komut kullanılacak." -ForegroundColor DarkGreen
}

function Invoke-Pnpm([string[]]$Arguments) {
  if ($useNpxPnpm) {
    & npx.cmd --yes pnpm@10.4.1 @Arguments
  } else {
    & pnpm.cmd @Arguments
  }
  if ($LASTEXITCODE -ne 0) { throw "pnpm komutu başarısız oldu: $($Arguments -join ' ')" }
}

Write-Host "Bağımlılıklar kuruluyor..." -ForegroundColor Cyan
try { Invoke-Pnpm @("install") } catch { Stop-WithMessage "Bağımlılık kurulumu başarısız oldu. $($_.Exception.Message)" }

Write-Host "TypeScript kontrolü çalışıyor..." -ForegroundColor Cyan
try { Invoke-Pnpm @("check") } catch { Stop-WithMessage "TypeScript kontrolü başarısız oldu; kurulum paketi üretilmedi. $($_.Exception.Message)" }

$releaseDir = Join-Path $projectRoot "release"
if (Test-Path $releaseDir) {
  Write-Host "Eski release çıktısı temizleniyor..." -ForegroundColor Yellow
  try { Remove-Item -Path $releaseDir -Recurse -Force -ErrorAction Stop } catch { Stop-WithMessage "Eski release klasörü temizlenemedi. Electron veya installer pencerelerini kapatıp tekrar deneyin." }
}

Write-Host "Windows kurulum paketi üretiliyor..." -ForegroundColor Cyan
try { Invoke-Pnpm @("desktop:installer") } catch { Stop-WithMessage "Electron Windows kurulum paketi üretilemedi. $($_.Exception.Message)" }


$installerName = "Global1881-Ofis-Offline-v$expectedVersion-FINAL.exe"
$installer = Get-Item -Path (Join-Path $releaseDir $installerName) -ErrorAction SilentlyContinue
if (-not $installer) {
  Stop-WithMessage "Build tamamlandı ancak beklenen $installerName bulunamadı. Eski sürüm installer’ı kesinlikle dağıtmayın."
}

Write-Host "`nBAŞARILI" -ForegroundColor Green
Write-Host "Kurulum dosyası: $($installer.FullName)" -ForegroundColor Green
Write-Host "Doğrulanan sürüm: $expectedVersion" -ForegroundColor Green
Write-Host "Bu .exe dosyasını manager bilgisayarında test ettikten sonra çalışanlara gönderin." -ForegroundColor Yellow
Write-Host "Kaynak kodu, .env ve node_modules klasörlerini paylaşmayın." -ForegroundColor Yellow

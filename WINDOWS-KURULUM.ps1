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

$pnpmCommand = Get-Command pnpm -ErrorAction SilentlyContinue
if (-not $pnpmCommand) {
  Write-Host "pnpm bulunamadı; Node.js Corepack etkinleştiriliyor..." -ForegroundColor Yellow
  try {
    corepack enable
    corepack prepare pnpm@10.4.1 --activate
  } catch {
    Stop-WithMessage "pnpm hazırlanamadı. PowerShell'i yönetici olarak açıp corepack enable komutunu çalıştırın veya pnpm'i kurun."
  }
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
  Stop-WithMessage "pnpm komutu hâlâ bulunamıyor. PowerShell'i kapatıp yeniden açın ve scripti tekrar çalıştırın."
}

Write-Host "Bağımlılıklar kuruluyor..." -ForegroundColor Cyan
pnpm install
if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Bağımlılık kurulumu başarısız oldu." }

Write-Host "TypeScript kontrolü çalışıyor..." -ForegroundColor Cyan
pnpm check
if ($LASTEXITCODE -ne 0) { Stop-WithMessage "TypeScript kontrolü başarısız oldu; kurulum paketi üretilmedi." }

Write-Host "Windows kurulum paketi üretiliyor..." -ForegroundColor Cyan
pnpm desktop:installer
if ($LASTEXITCODE -ne 0) { Stop-WithMessage "Electron Windows kurulum paketi üretilemedi." }

$releaseDir = Join-Path $projectRoot "release"
$installer = Get-ChildItem -Path $releaseDir -Filter "*.exe" -File -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $installer) {
  Stop-WithMessage "Build tamamlandı ancak release klasöründe .exe bulunamadı. Komut çıktısını kontrol edin."
}

Write-Host "`nBAŞARILI" -ForegroundColor Green
Write-Host "Kurulum dosyası: $($installer.FullName)" -ForegroundColor Green
Write-Host "Bu .exe dosyasını manager bilgisayarında test ettikten sonra çalışanlara gönderin." -ForegroundColor Yellow
Write-Host "Kaynak kodu, .env ve node_modules klasörlerini paylaşmayın." -ForegroundColor Yellow

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
$expectedVersion = "1.0.23"
if ($packageJson.version -ne $expectedVersion) {
  Stop-WithMessage "Bu klasördeki package.json sürümü $($packageJson.version). Beklenen sürüm $expectedVersion. Eski ZIP/proje klasörünü kullanmayın; güncel checkpoint ZIP’ini yeniden çıkarın."
}
Write-Host "Sürüm doğrulandı: $($packageJson.name) v$($packageJson.version)" -ForegroundColor DarkGreen

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Stop-WithMessage "Node.js bulunamadı. Önce Windows için Node.js LTS kurun, sonra bu scripti yeniden çalıştırın."
}

$pnpmCommand = Get-Command pnpm.cmd -ErrorAction SilentlyContinue
if (-not $pnpmCommand) {
  Stop-WithMessage "pnpm.cmd bulunamadı. Bu betik internetten paket indirmez; pnpm kurulumunu teknik sorumluyla birlikte tamamlayın."
} else {
  Write-Host "pnpm.cmd bulundu; yalnız yerel paketleme komutları kullanılacak." -ForegroundColor DarkGreen
}

function Invoke-Pnpm([string[]]$Arguments) {
  & pnpm.cmd @Arguments
  if ($LASTEXITCODE -ne 0) { throw "pnpm komutu başarısız oldu: $($Arguments -join ' ')" }
}

Write-Host "Bağımlılıklar kilit dosyasına göre ve yerel önbellek önceliğiyle kuruluyor..." -ForegroundColor Cyan
try { Invoke-Pnpm @("install", "--frozen-lockfile", "--prefer-offline") } catch { Stop-WithMessage "Bağımlılık kurulumu başarısız oldu. $($_.Exception.Message)" }

Write-Host "TypeScript kontrolü çalışıyor..." -ForegroundColor Cyan
try { Invoke-Pnpm @("check") } catch { Stop-WithMessage "TypeScript kontrolü başarısız oldu; kurulum paketi üretilmedi. $($_.Exception.Message)" }

Write-Host "Windows kurulum paketi üretiliyor..." -ForegroundColor Cyan
try { Invoke-Pnpm @("desktop:installer") } catch { Stop-WithMessage "Electron Windows kurulum paketi üretilemedi. $($_.Exception.Message)" }


$installerName = "Global1881-Ofis-Offline-v$expectedVersion-FINAL.exe"
$releaseDir = Join-Path $projectRoot "release"
$installer = Get-Item -Path (Join-Path $releaseDir $installerName) -ErrorAction SilentlyContinue
if (-not $installer) {
  Stop-WithMessage "Build tamamlandı ancak beklenen $installerName bulunamadı. Eski sürüm installer’ı kesinlikle dağıtmayın."
}

Write-Host "`nBAŞARILI" -ForegroundColor Green
Write-Host "Kurulum dosyası: $($installer.FullName)" -ForegroundColor Green
Write-Host "Doğrulanan sürüm: $expectedVersion" -ForegroundColor Green
Write-Host "Bu .exe dosyasını manager bilgisayarında test ettikten sonra çalışanlara gönderin." -ForegroundColor Yellow
Write-Host "Kaynak kodu, .env ve node_modules klasörlerini paylaşmayın." -ForegroundColor Yellow

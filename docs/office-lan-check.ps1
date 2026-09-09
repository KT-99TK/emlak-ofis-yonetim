param(
  [string]$MainPcIp,
  [int]$Port = 3000,
  [switch]$ClientTest
)

$ErrorActionPreference = "Stop"
Write-Host "Global 1881 LAN kontrolu" -ForegroundColor Cyan
Write-Host "Bilgisayar: $env:COMPUTERNAME"
Write-Host "Windows ag profilleri:"
Get-NetConnectionProfile | Select-Object Name, InterfaceAlias, NetworkCategory, IPv4Connectivity | Format-Table -AutoSize

Write-Host "Yerel IPv4 adresleri:"
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } | Select-Object InterfaceAlias, IPAddress | Format-Table -AutoSize

if (-not $ClientTest) {
  Write-Host "Dinleyen TCP portlari (3000-3019):"
  Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -ge 3000 -and $_.LocalPort -le 3019 } | Select-Object LocalAddress, LocalPort, OwningProcess | Format-Table -AutoSize
  Write-Host "Firewall icin otomatik degisiklik yapilmadi. Gerekirse yonetici PowerShell'de su komutu kullanin:"
  Write-Host "New-NetFirewallRule -DisplayName 'Global1881 LAN $Port' -Direction Inbound -Protocol TCP -LocalPort $Port -Action Allow -Profile Private -RemoteAddress LocalSubnet"
  exit 0
}

if ([string]::IsNullOrWhiteSpace($MainPcIp)) {
  throw "Istemci testi icin -MainPcIp 192.168.x.x parametresi gereklidir."
}

Write-Host "Ana PC baglanti testi: $MainPcIp`:$Port"
$result = Test-NetConnection -ComputerName $MainPcIp -Port $Port -WarningAction SilentlyContinue
$result | Select-Object ComputerName, RemotePort, TcpTestSucceeded | Format-List
if (-not $result.TcpTestSucceeded) {
  Write-Host "Baglanti basarisiz. IP, gercek port, Private ag profili, firewall ve Wi-Fi client isolation ayarlarini kontrol edin." -ForegroundColor Yellow
  exit 2
}
Write-Host "TCP baglantisi basarili. Tarayicida http://$MainPcIp`:$Port adresini acin." -ForegroundColor Green

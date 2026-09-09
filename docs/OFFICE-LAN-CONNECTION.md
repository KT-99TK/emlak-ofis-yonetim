# Global 1881 Ofis İçi LAN Bağlantı Rehberi

Bu rehber, mevcut **1.0.22 offline Electron uygulamasını değiştirmeden**, ana Windows 11 bilgisayarda çalışan merkezi web uygulamasına aynı ofis Wi‑Fi ağı üzerindeki istemcilerin tarayıcıyla bağlanması içindir. Diğer bilgisayarlara aynı offline EXE kurulup ana PC verisine bağlanılmamalıdır; bu model her bilgisayarda ayrı veri alanı oluşturur.

## Çalışma modeli

Ana PC merkezi web server’ı çalıştırır. Server, `HOST` ortam değişkeni verilmediyse `0.0.0.0` üzerinde dinler ve `PORT` değişkeni verilmediyse 3000 portunu tercih eder. Tercih edilen port doluysa 3000–3019 arasındaki ilk boş porta geçer. İstemciler, ana PC’nin gerçek IPv4 adresini ve logda görülen portu kullanır:

```text
http://ANA_PC_IPV4:3000
```

Port 3000 doluysa 3001, 3002 ve benzeri gerçek port kullanılmalıdır; istemci adresi varsayılarak yazılmamalıdır.

## Ana Windows 11 PC hazırlığı

Ana PC’de Komut İstemi açılıp şu komut çalıştırılır:

```bat
ipconfig
```

Aktif Wi‑Fi veya Ethernet bağdaştırıcısındaki `IPv4 Address` değeri not edilir; örneğin `192.168.1.25`. Yönlendiricide bu cihaza DHCP rezervasyonu verilmesi önerilir. Böylece ana PC’nin IP adresi değişmez. İnternete port yönlendirme yapılmaz.

Uygulama başlatıldıktan sonra gerçek port şu komutla kontrol edilir:

```bat
netstat -ano | findstr LISTENING | findstr ":3000 :3001 :3002 :3003"
```

Windows ağı **Özel ağ** olmalıdır. Güvenlik duvarında yalnızca Özel profil ve yerel alt ağ için gerekli TCP portu açılmalıdır. Gerçek port 3000 ise PowerShell’i yönetici olarak açıp şu kural kullanılabilir:

```powershell
New-NetFirewallRule -DisplayName "Global1881 LAN 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -Profile Private -RemoteAddress LocalSubnet
```

Port 3000 yerine logda görülen port kullanılır. Genel/Public ağ profiline geniş izin verilmemelidir.

## IP1 ve CT1 istemci testi

İstemci bilgisayarın ana PC ile aynı Wi‑Fi adına bağlı olduğu ve IP adresinin aynı yerel ağ aralığında bulunduğu kontrol edilir. İstemcide PowerShell açılır:

```powershell
Test-NetConnection 192.168.1.25 -Port 3000
```

`TcpTestSucceeded : True` bağlantının ağ katmanında açık olduğunu gösterir. Ardından Chrome veya Edge adres çubuğuna şu adres yazılır:

```text
http://192.168.1.25:3000
```

Bağlantı başarısızsa sırasıyla ana PC IP’si, gerçek port, ağ profilinin Private olması, firewall kuralı, VPN kullanımı ve yönlendiricide `AP isolation`/`Client isolation` ayarları kontrol edilir. Ana PC test sırasında uykuya geçmemelidir.

## Kabul sınırı

Bu ilk testte üç kullanıcı aynı merkezi web server’a bağlanır ve tek merkezi veritabanını kullanır. IP1, KT1 ve CT1 login/rol görünürlüğü; sözleşme numarası; komisyon; hassas veri maskesi; müşteri ve kira kayıtları kontrol edilir. Gerçek kullanıcı verisiyle kabul tamamlanmadan DNS geçişi ve yeni imzasız EXE üretimi yapılmaz.

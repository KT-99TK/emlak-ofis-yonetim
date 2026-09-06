# Global 1881 — Geçici Çok Cihazlı Test Erişimi Değerlendirmesi

**Tarih:** 4 Eylül 2026  
**Durum:** Tasarım değerlendirmesi tamamlandı; ağ, port, uzak erişim veya uygulama yapısında değişiklik yapılmadı.

## Karar özeti

Danışmanların kendi laptoplarından kullanıcının laptopundaki **offline Electron uygulamasına** bağlanması mevcut yapıda mümkün ve uygun değildir. Offline uygulama her cihazda kendi IndexedDB verisini tutan bağımsız bir veri adasıdır; ağ dinleyicisi, merkezi senkronizasyon, HTTP API veya paylaşımlı çok kullanıcı veritabanı içermez.

Danışmanların ortak veri girişi testi için doğru hedef, yayınlanmış **merkezi HTTPS web uygulamasıdır**. Her danışman kendi hesabıyla giriş yapar; rol, müşteri sahipliği ve hassas veri sınırları sunucu tarafından uygulanır. Bu kullanımda danışman cihazlarından yalnız dışarı doğru HTTPS bağlantısı kullanılır; kullanıcı laptopunda port açılması, port yönlendirme, uzak masaüstü paylaşımı veya MySQL erişimi gerekmez.

## Seçenek karşılaştırması

| Seçenek | Değerlendirme | Karar |
|---|---|---|
| Offline EXE’yi ana laptopta çalıştırıp danışmanları bağlamak | Uygulama yerel `file:` ortamında çalışır; paylaşımlı API, senkron ve ağ portu yoktur. Çok kullanıcı ve eşzamanlı yazma desteklenmez. | Uygun değil |
| Ana laptopta yerel sunucu/port açmak | TLS sertifikası, firewall, erişim kontrolü, bakım, yedekleme ve bilgisayarın açık kalması yükü doğurur. Mevcut güvenlik ve taşınabilirlik hedefiyle uyumlu değildir. | Önerilmez |
| Yayınlanmış HTTPS web uygulamasında rol hesaplarıyla test | Merkezi MySQL/TiDB ve S3 erişimi yalnız sunucu tarafında kalır. Danışmanlar tarayıcıdan HTTPS ile bağlanır; rol sınırları ve audit uygulanır. | Önerilen test yöntemi |
| Gelecekte özel bulut sunucusu | Kalıcı alan adı, yedek/PITR, özel ağ, secret manager, izleme ve insan destek SLA’sı ile planlanabilir. | Bulut sağlayıcı kararı sonrası değerlendirilir |

## Ağ ve güvenlik sınırları

Merkezi testte danışman laptoplarında yalnız standart **HTTPS/443 çıkış bağlantısı** gerekir. MySQL/TiDB portu, S3 kimlik bilgileri veya yönetim uçları danışman cihazlarına açılmaz. Web istemcisi tRPC/HTTPS üzerinden sunucuya bağlanır; veritabanı bağlantısı yalnız sunucu tarafındadır.

Kullanıcının laptopunu geçici sunucu yapmak, internete açık port, modem yönlendirmesi, dinamik IP, sertifika, Windows güvenlik duvarı ve kesintisiz çalışma yükü doğurur. Bu yaklaşım ayrıca cihaz kapanması, uykuya geçmesi, internet değişikliği ve yerel Windows güncellemeleri nedeniyle testin güvenilirliğini düşürür. Bu nedenle uygulanmamalıdır.

## Önerilen kontrollü test akışı

1. Mevcut yayın korunur; DNS veya Windows ayarında değişiklik yapılmaz.
2. Ofiste kısa bir oturumda danışmanlar kendi laptop/telefon tarayıcılarından merkezi HTTPS uygulamasına giriş yapar.
3. Her danışman yalnız kendi müşteri, sözleşme ve aktif kira kapsamını görür; broker manager merkezi görünümü kontrol eder.
4. Test verisi sınırlı ve gerçek iş akışına uygun girilir. Eşzamanlı veri girişi, rol sınırı ve audit kaydı gözlemlenir.
5. Oturum sonunda broker manager merkezi kayıtları doğrular; gerekirse şifreli yedekleme prosedürü uygulanır.

Bu yaklaşım, “veri akıyorsa sistem çalışıyor” hedefini karşılar; ancak verinin kullanıcı laptopuna değil, merkezi ve erişim kontrollü uygulamaya aktığını güvenli biçimde doğrular.

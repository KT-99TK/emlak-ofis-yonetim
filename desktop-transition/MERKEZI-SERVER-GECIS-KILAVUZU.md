# Global 1881 Gayrimenkul — Merkezi Server Geçiş Kılavuzu

## Amaç

Offline geçiş dönemi tamamlandığında sistemin tek doğruluk kaynağı, broker manager tarafından yönetilen merkezi server olacaktır. Danışman laptoplarında veri tabanı tutulmayacak; kullanıcılar güvenli HTTPS adresine veya oluşturulan Windows kısayoluna bağlanacaktır.

## Geçiş sırası

Önce manager laptopunda son haftalık yedekler doğrulanır. Her manifestte kullanıcı, cihaz, kayıt sayısı, dışa aktarma zamanı, SHA-256 checksum ve ECDSA imza durumu kontrol edilir. Çakışmalar çözülmeden kayıtlar merkezi sisteme aktarılmaz. Onaylanan birleşik veri için yeni ana yedek ve rollback noktası saklanır.

| Aşama | Sorumlu | Kontrol |
|---|---|---|
| Yedekleri toplama | Broker manager | Üç laptop dosyası ve dosya adları |
| Manifest doğrulama | Sistem | Checksum + ECDSA imzası |
| Çakışma kararı | Broker manager | Kayıt sürümü ve güncelleme tarihi |
| Merkezi aktarım | Broker manager | Aktarım özeti ve audit kaydı |
| Kullanıcı bağlantısı | Danışman | HTTPS kısa yolu ve giriş testi |

## Windows kısayolu

Merkezi adres kesinleştiğinde Chrome veya Edge ile HTTPS adresi açılır. Menüden **Uygulama olarak yükle / Kısayol oluştur** seçilir, masaüstüne eklenir ve “pencere olarak aç” seçeneği işaretlenir. Kısayol yalnızca merkezi adresi açar; laptopta yerel veri deposu oluşturmaz.

## Erişim ve yetki

Broker manager ekip, sözleşme onayı, mali tablolar, merge ve rollback işlemlerini yürütür. Danışman yalnızca kendi yetki kapsamındaki müşteri, mülk, sözleşme ve tahsilat kayıtlarını görür. Merkezi server HTTPS, güçlü kullanıcı oturumu, rol kontrolü ve audit kayıtları olmadan üretimde kullanılmamalıdır.

## Bağlantı kesintisi

Server erişilemiyorsa kullanıcı yeni merkezi kayıt yazmamalı, ekranda bağlantı uyarısı görmeli ve yeniden bağlanmayı denemelidir. Offline Electron paketi bu dönemde ayrı geçiş aracı olarak kullanılabilir; merkezi server ile aynı anda iki farklı kaynağa yazmak yerine haftalık manager merge prosedürü uygulanır.

## Yedekleme ve geri alma

Merkezi veri tabanı için günlük otomatik sunucu yedeği, ayrıca manager tarafından haftalık dışa aktarma ve geri yükleme provası uygulanmalıdır. Geri yükleme yalnızca broker manager rolüyle yapılmalı; işlem öncesi mevcut verinin snapshot’ı alınmalı, işlem sonunda kayıt sayısı ve audit özeti karşılaştırılmalıdır.

## Üretime geçiş kontrol listesi

- HTTPS alan adı ve TLS sertifikası hazır.
- Merkezi veritabanı ve günlük yedekleme politikası doğrulandı.
- Manager hesabı ve danışman hesapları rol bazında test edildi.
- Offline birleşik ana yedek arşivlendi ve checksum not edildi.
- İlk bağlantı, sözleşme, mali tablo ve audit ekranları test edildi.
- Kullanıcılara yalnızca merkezi HTTPS kısayolu dağıtıldı.

Bu belge operasyonel geçiş planıdır; hosting sağlayıcısı, alan adı ve yedek saklama süresi kesinleştiğinde ilgili değerler ayrıca doldurulmalıdır.

## Geri dönüş planı

İlk merkezi kullanım haftasında beklenmeyen veri veya erişim sorunu görülürse yeni merkezi yazımlar durdurulur, son doğrulanmış birleşik ana yedek ve audit özeti korunur, kullanıcılar geçici olarak offline geçiş prosedürüne döner. Sorun giderilmeden iki sistem arasında karşılıklı yazma yapılmaz.

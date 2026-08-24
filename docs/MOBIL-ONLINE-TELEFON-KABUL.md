# Global 1881 Mobil Online Telefon Kabulü

## Amaç

Bu kabul, Android ve iPhone 13 Pro’nun aynı merkezi online ofis verisini görmesini doğrular. Telefonlar laptopta saklanan offline IndexedDB kayıtlarını kullanmaz.

## Ön koşul

Merkezi sistemde gerçek bir manager hesabı ile en az bir gerçek danışman hesabı bulunmalı; test edilecek müşteri, portföy veya imza teyitli aktif sözleşme merkezi online kayıt olarak oluşturulmuş olmalıdır. Offline laptop kaydı, bu kabulden önce otomatik olarak telefona taşınmış sayılmaz.

| Telefon | Açılacak adres | Ana ekrana ekleme |
|---|---|---|
| Android | Kalıcı kabulde `https://ofis.global1881.com/mobile` | Chrome menüsünden **Ana ekrana ekle** veya **Uygulamayı yükle** |
| iPhone 13 Pro | Kalıcı kabulde `https://ofis.global1881.com/mobile` | Safari Paylaş menüsünden **Ana Ekrana Ekle** |

`ofis.global1881.com` DNS kaydı tamamlanıncaya kadar kullanılan teknik önizleme adresi yalnız geçici test içindir; kalıcı paylaşım veya ana ekrana ekleme için kullanılmaz.

## Erişim sürekliliği

Mobil ofis uygulamasının merkezi veri, API ve belge depolama katmanı Hostinger’daki WordPress web hostinginden bağımsızdır. Hostinger tarafında yalnız mevcut alan adı için DNS yönlendirmesi bulunur; `global1881.com` ve `www` kayıtları değiştirilmez.

| Koruma | Uygulama |
|---|---|
| DNS sınırı | Yalnız `ofis` alt alan adı için ayrı kayıt eklenir; ana WordPress sitesi korunur. |
| Yönetici yedeği | Alan adı/DNS hesabında ikinci yetkili erişim kaydı tutulur. |
| Geçici erişim | Kalıcı alan adı taşınırken uygulanacak, kullanıcılarla paylaşılmayan teknik yedek erişim adresi işletme kaydında saklanır. |
| Taşınabilirlik | Hosting/DNS sağlayıcısı değişirse, merkezi veriler aktarılmaz; yalnız alt alan adı yeni güvenli hedefe yönlendirilir. |

## Manager kabulü

Manager önce Android’de, ardından iPhone’da aynı hesabıyla giriş yapar. Her iki telefonda **Ofis Akışı**, aktif sözleşme/portföy/vade özetleri ve merkezi kayıtlardaki aynı bilgiler görünmelidir. Bir telefonda merkezi web uygulamasından yapılan yetkili değişiklik sonrasında diğer telefonda yenile düğmesiyle aynı güncel veri görünmelidir.

## Danışman gizlilik kabulü

Gerçek danışman hesabıyla giriş yapıldığında, yalnız o danışmana `assignedUserId` ile atanmış müşteri, portföy, sözleşme ve belge satırları görünmelidir. Başka danışmanın müşteri adı, telefon, adres, not veya PDF listesi görünmemelidir. Manager ise merkezi rolü nedeniyle yetkili kapsamı görebilir.

## İmzalı belge kabulü

Danışman, yalnız kendi **imza teyitli veya aktif** sözleşmesini seçer ve en fazla 12 MB PDF ekler. Sistem PDF’nin SHA-256 değerini hesaplar, merkezi dosya depolamaya yükler ve silinemez belge metadata’sını/audit kaydını oluşturur. Mobil ekranda silme veya düzenleme seçeneği bulunmamalıdır.

> Geçmiş PDF’ler **Müşteri Dijital Arşivi** içindir. Devam eden kira sözleşmelerinin imzalı nüshası ise **Aktif İmzalı Belgeler** akışında tutulur.

## Paylaşılacak kanıtlar

Android manager ekranı, iPhone manager ekranı, bir danışman ekranı ve danışmanın kendi PDF’sini eklediği belge ekranı olmak üzere dört ekran görüntüsü paylaşılmalıdır. Sorun görülürse ekran görüntüsü ile birlikte saat bilgisi ve kullanılan hesap rolü yazılmalıdır.

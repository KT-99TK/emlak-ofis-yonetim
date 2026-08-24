# Global 1881 Mobil Online Merkezi Sistem Tasarımı

## Hedef

Danışmanlar, Android ve iPhone uygulamasından ofis dışında iken aynı merkezi ofis verisini görür ve yetkisi olan kaydı günceller. Telefon, laptopun yerel IndexedDB kaydını kopyalamaz; merkezi veritabanı ve güvenli belge depolama **tek doğruluk kaynağı** olur.

| Katman | Görev | Güvenlik ilkesi |
|---|---|---|
| Merkezi veritabanı | Kullanıcı, danışman rolü, müşteri, portföy, sözleşme, vade ve muhasebe metadata’sı | Her sorgu sunucuda danışman sahipliği ve rol ile filtrelenir |
| Belge depolama | Aktif imzalı PDF ve geçmiş Müşteri Dijital Arşivi PDF’si | Dosya baytı veritabanında değil güvenli dosya depolamada; metadata/audit merkezi kayıtta |
| API | Web, Windows ve Android/iOS için ortak iş kuralları | İstemci rol beyanına değil doğrulanmış merkezi oturuma dayanır |
| Mobil uygulama | Gündem, müşteri, portföy, sözleşme, talep ve belge işlemleri | Telefon yalnız kendi güvenli oturumunu tutar; hassas veri için ekran kilidi/oturum zaman aşımı uygulanır |

## Geçiş kuralı

Bu yıl kullanılan üç bağımsız laptop, merkezi veri sistemine doğrudan ve sessizce eşitlenmez. Broker manager önce şifreli yedekleri doğrular ve birleştirir; ardından kabul edilen kayıtlar merkezi veri modeline **kontrollü aktarım** ile alınır. Aynı kaydın hem eski laptopta hem merkezi sistemde farklı biçimde değiştirilmesini önlemek için merkezi geçiş tarihinde kayıt bazında sahiplik ve son değişiklik denetimi tutulur.

> Mobil uygulama denemesi yalnız merkezi sistemde oluşmuş veya manager tarafından kontrollü aktarılmış veriyi gösterir. Yerel laptoplardaki gizli veriler telefonlara doğrudan kopyalanmaz.

## İlk mobil deneme kapsamı

1. Manager ana ekranı: anonim Ofis Akışı, kritik vade sayıları ve danışman kapsamı.
2. Danışman ana ekranı: Size Özel Gündem, kendi müşteri/portföy ve yaklaşan vade özetleri.
3. Müşteri ve portföy listeleri: yalnız atanan danışmanın kayıtları; manager tam yetkili özet.
4. Aktif sözleşme görünümü ve imzalı belge açma/yükleme: danışman kendi sözleşmesine ekler; silme yoktur.
5. Müşteri talepleri ve işlem notları: danışman kendi kaydını yazar, manager yetkili görünür.

Kira/satış sözleşmesinin tüm uzun formu ve muhasebe tahsilat girişi, telefon denemesinin ilk sürümünde salt-okunur veya kontrollü kısa eylem olarak kalır. Bu, yanlışlıkla finansal kayıt veya hukuki sözleşme değişikliği yapılma riskini azaltır.

## Android ve iPhone test sırası

| Sıra | Android | iPhone 13 Pro | Kabul ölçütü |
|---|---|---|---|
| 1 | Manager hesabıyla giriş | Aynı manager hesabıyla giriş | Aynı merkezi gündem ve kayıtlar görünür |
| 2 | Bir müşteri/portföy notu güncelle | Listeyi yenile | Güncelleme merkezi veriden görünür |
| 3 | Danışman hesabıyla giriş | Başka danışman/manager hesabıyla giriş | Danışman yalnız kendi müşteri ve PDF’lerini görür |
| 4 | İmzalı PDF ekle/aç | Aynı belgeyi yetkili hesapla aç | Dosya merkezi kayıtta, audit izinde ve silme eylemi olmadan görünür |

## Uygulama dağıtımı

İlk deneme, Android ve iPhone’da mağazaya yayın yapmadan test bağlantısıyla çalıştırılır. Kabulden sonra aynı kod tabanından Android ve iOS için dağıtım paketi hazırlanır. Üretim aşamasında danışman daveti, merkezi hesap aktivasyonu, uygulama kilidi ve bildirim izinleri eklenir.

## Alan adı ve hostingten bağımsızlık

`global1881.com` üzerindeki WordPress sitesi ile merkezi ofis uygulaması ayrı bileşenlerdir. WordPress/Hostinger yalnız mevcut web sitesi ve alan adı DNS yönetimi için kullanılabilir; mobil uygulamanın merkezi veritabanı, API’si ve güvenli belge depolaması bu web hosting hesabına taşınmaz.

Önerilen kalıcı adres `ofis.global1881.com` olur. Bu alt alan adı için yalnız yeni DNS yönlendirmesi eklenir; mevcut `www` ve ana alan adı kayıtları değiştirilmez. Hostinger web hosting hizmeti kesilse bile merkezi uygulama verisi kaybolmaz. Etki, DNS kaydının yönetimi kaybedilirse mobil adresin çözülmemesiyle sınırlıdır.

> Süreklilik kuralı: Alan adı sahibinin kontrolündeki ayrı DNS yönetimi, yönetici erişimi yedeği ve yayımlanmış bir geçici erişim adresi dokümante edilir. Böylece bir hosting veya yönetici hesabı erişilemez olsa bile veri/uygulama taşınabilir kalır; yalnız alan adı yönlendirmesi yeniden bağlanır.

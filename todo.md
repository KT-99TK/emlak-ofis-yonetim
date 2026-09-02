# Global 1881 — Aktif Proje Görevleri

Bu dosya yalnızca **bugün açık olan ve tekrar etmeyen** işleri içerir. Önceki ayrıntılı görev geçmişi `todo-archive.md` ve `todo-history-2026-08-29.md` içinde korunmaktadır; hiçbir geçmiş kayıt silinmemiştir.

## 1. Güvenli Windows / Electron kabulü — dağıtım durduruldu

- [ ] Defender’ın `Trojan:Script/Wacatac.H!ml` algıladığı 1.0.23 EXE, ZIP ve BAT dosyalarını geçersiz kabul etmeyi sürdür; bu dosyaları yeniden üretme, gönderme, geri yükletme, izin verme veya güvenlik korumasını aşma yönlendirmesi yapma.
- [ ] Kullanıcının mevcut 1.0.22 kurulumu ve `%APPDATA%\Global 1881 Gayrimenkul` verilerini değiştirmeden koru.
- [ ] Gelecekte offline Windows dağıtımı yeniden ele alınırsa yalnız gerçek Windows ortamında oluşturulan, bağımsız güvenlik incelemesinden geçmiş ve kullanıcı kabulü için tek toplu paket yaklaşımını değerlendir; bu karar oluşmadan paket üretme.
- [ ] Güvenli bir Windows kabul yolu oluştuğunda tek oturumda Offline Genel Bakış açılışı, `startup.log`, `En geç` tarihinin `GG.AA.YYYY` görünümü, A4 kira/yetki belgeleri, DASK/EİDS/ekler, menü ve Ofis Akışı yerleşimini doğrula.

## 2. Canlı web erişimi — platform / alan adı takibi

- [ ] Yayın alanı kullanıcı ağlarında güvenlik uyarısı veya bakım ekranı göstermeden kararlı biçimde erişilebilir olana kadar altyapı durumunu takip et. Ubuntu kontrolünde TLS sertifikası geçerli ve giriş sayfası HTTP 200 dönmüştür; bu, kullanıcı ağındaki önceki `ERR_SSL_PROTOCOL_ERROR` ve bakım ekranını tek başına kapatmaz.
- [ ] `ofis.global1881.com` özel alt alan adı için DNS yönetim yetkisini, mevcut `ofis` kaydının boşluğunu ve kayıt ekleyecek web tasarımcısı/sağlayıcıyı doğrula; bağlantı penceresi başlatılmadan önce DNS kaydı eklemeye hazır olsun.
- [ ] Kullanıcının açık onayıyla, mevcut `emlakdash-kcw9r85v.manus.space` yayını kesmeden `ofis.global1881.com` bağlantısını başlat ve yalnız panelde verilen DNS kaydını alan adı sağlayıcısına uygulat; doğrulama ve HTTPS kabulü tamamlanmadan eski adresi kaldırma.
- [ ] Güvenli erişim kararlı olduğunda, Windows paketi yerine yayımlanmış web uygulamasında tek ekran kabul oturumunu planla. Kullanıcıdan aynı bağlantı testlerini tekrarlamasını isteme.
- [x] Alan adı erişimi düzelir düzelmez uygulanacak, tek oturumluk ve veri değiştirmeyen web kabul kontrol listesini hazırla. `web-acceptance-checklist.md` oluşturuldu.
- [x] Hesap içi bildirim veya e-posta temelinde Ağustos 2026 hizmet değişikliği kapsamını doğrula; arama sonucu veya bakım ekranından etkilenme/geri yükleme gereğini varsayma. Kullanıcı Manus hesabına giriş yapabildiğini ve özel hizmet değişikliği bildirimi almadığını doğruladı; geri yükleme gereği varsayılmayacak.
- [x] Manus Destek’in e-posta ilettiği “Yanıtı görüntüle” bağlantısı kullanıcı tarafında içerik açmadığı için destek yanıtını e-posta gövdesinde talep et; yanıt alınmadan yedek/geri yükleme işlemi başlatma. Kullanıcı e-posta yanıt talebini gönderdi.
- [x] Kullanıcının 29.08.2026 tarihli normal tarayıcı ekran görüntüsünde tekrar doğrulanan `ERR_SSL_PROTOCOL_ERROR` bulgusunu alan adı/HTTPS erişim katmanı olayı olarak platform desteğine ilet; uygulama kodu, Windows ağ teşhisi veya güvenlik korumasını aşma ile çözmeye çalışma. Kullanıcı destek başvurusunu gönderdi.
- [x] Destek ekibine, kullanıcıda daha önce normal pencere, gizli pencere ve mobil veri ile gözlenen hata kanıtlarının zaten bulunduğunu; son normal pencere ekranında `ERR_SSL_PROTOCOL_ERROR` görüldüğünü ve gereksiz yeniden deneme yapılmayacağını bildir. Kullanıcı hesabına giriş yapabildiğini, özel hizmet değişikliği bildirimi almadığını ve alan adı/TLS inceleme talebini destek ekibine iletti.
- [x] Destek ekibinin çoklu ağ HTTP 200 / TLS 1.3 sonucuna rağmen, kullanıcıda son normal Chrome denemesinde `ERR_SSL_PROTOCOL_ERROR` hatasının tekrar oluştuğunu; kesin tarih-saat ve saat dilimiyle destek e-postasına ilet. Kullanıcı, ekran görüntüsündeki hata zamanının 29.08.2026 tarihinde 18:11 Türkiye saati olduğunu aynı destek sohbetinde iletti.
- [x] Destek e-postasına gönderilen son yanıtta kullanılan kesin deneme tarihi, saat ve saat dilimini doğrula; eksikse aynı aktif görüşmeye yalnız tam zaman damgası ve hata metnini ilet. 18:11 Türkiye saati bilgisi sohbet ekran görüntüsünde doğrulandı.
- [ ] Destek ekibinin ekran görüntüsüyle tekrar eden `ERR_SSL_PROTOCOL_ERROR` bulgusunu doğrulayıp TLS/HTTPS erişim farkını teknik ekibe aktardığı süreçte, teknik ekip e-posta sonucunu bekle; bu sırada yeni kullanıcı testi veya yerel ayar değişikliği isteme.
- [ ] Kullanıcının destek sohbetine gönderdiği `Record2026-08-31203811.mp4` ekran kaydını, 31.08.2026 20:38 Türkiye saati deneme kanıtı olarak teknik ekip teşhis sonucu gelene kadar takip et; ek kullanıcı testi isteme.

- [x] Windows 10’daki uygulama kilitlenmesi ve takip eden Windows 11 kurulumu bağlamını destek başvurusuna ekle; işletim sistemi geçişini olası yerel etken olarak not et, ancak alan adı sorununa doğrulanmış kök neden diye tanımlama. Kullanıcı destek başvurusuna ekledi.

## 3. Bağımlılık ve uygulama güvenliği

- [x] `mdast-util-to-hast` paketini 13.2.1 sürümüne yükselt; tam test, TypeScript ve production build ile doğrula.
- [ ] ExcelJS üzerinden gelen `uuid@8.3.2` için kalan tek orta seviye audit bulgusunu, yalnız uyumlu upstream sürüm veya desteklenen ve kilit dosyasında uygulanabildiği kanıtlanan bir düzeltme ile ele al. Uygulanamayan yerel patch’i dağıtıma alma.
- [x] Express 5 rota geçişinden sonra ana sayfanın HTTP 200 ve korunan `/manus-storage/office-documents/example.pdf` isteğinin HTTP 403 davranışını doğrula.
- [x] Aktif Kiralamalar ekranındaki ExcelJS yüklemesini dosya seçimi anına taşı; aktarım testleri, TypeScript ve production build ile doğrula. Sayfa parçası 999,12 kB’dan 59,48 kB’a indi; Excel kodu yalnız aktarım gerektiğinde ayrı 939,79 kB parçası olarak yüklenir.

## 4. Fonksiyonel kabulde bekleyen tekil noktalar

- [ ] Kod ve test düzeyinde tamamlanan kira yardımcı tarihi, A4 belgeler/ekler, yedek/merge, rol mahremiyeti, boş online başlangıç ve responsive Ofis Akışı davranışlarını güvenli erişim sağlandığında kullanıcıya görünen gerçek çalışma ortamında toplu kabul et.
- [x] Kimlik/vergi numarası ve telefonun dijital sözleşme ile müşteri kaydından çıkarılıp, bu alanların yalnız fizikî imzalı sözleşmede el yazısıyla tutulması seçeneğini KVKK, sözleşme iş akışı, hizmet takvimi, rol mahremiyeti ve arşiv güvenliği bakımından değerlendir; kullanıcı onayı olmadan alanları silme veya migrasyon yapma. Değerlendirme tamamlandı; tam silme yerine maskeli saklama politikası seçildi.
- [x] Yeni sözleşmelerde T.C. kimlik/vergi no ve telefonun yalnız imza öncesi belge üretiminde kullanılmasını; fizikî ıslak imzalı nüsha tamamlandı onayı sonrası T.C. bilgisinin geri döndürülemez temizlenmesini ve telefonun silinmesi/maskelemesi kararını rol, audit ve yedek sınırlarıyla tasarla. Mevcut kayıtları veya geçmiş yedekleri değiştirme. Karar, kontrollü maskeli saklama olarak revize edildi ve tasarım belgesine işlendi.
- [x] Yeni sözleşmelerde T.C. kimlik/vergi no ve telefonun maskeli saklanmasını; telefonun tam değerinin yalnız atanmış danışman ile broker managera, T.C./vergi no tam değerinin yalnız broker managera gerekçeli ve audit kayıtlı gösterilmesini; ofis asistanı ile varsayılan Excel/PDF dışa aktarımlarının tam değerlere erişememesini tasarla. Mevcut kayıtları ve yedekleri değiştirme. `KIMLIK-TELEFON-MINIMUM-VERI-PLANI.md` hedef rol, maskeleme, audit ve dışa aktarım kurallarını içerir.
- [x] Yeni sözleşmelerde telefon ile T.C./vergi noyu varsayılan maskeli göster; tam değeri yalnız broker managerın gerekçe ile geçici açabilmesini, danışman/ofis asistanının tam değeri hiç görememesini ve değer içermeyen audit kaydını uygula. Mevcut kayıtları ve şifreli yedekleri değiştirme. Yeni veriler AES-256-GCM kasasına ayrıldı; normal API yanıtları/sözleşme detayları/offline snapshot’lar maskeleniyor. Broker managerın müşteri, aktif kira ve merkezi sözleşme ekranlarında gerekçeli erişimi 30 saniye sonra otomatik gizleniyor; danışman/offline formunda hassas alanlar fizikî nüshada el yazısıyla tamamlanıyor. 98 test/268 test, TypeScript, production build ve HTTP erişim sınırı ile doğrulandı.
- [ ] WordPress, DNS delegasyonu ve alan adı sahipliği modelini, web tasarımcısının erişim sınırlarıyla kullanıcı kararı olarak değerlendir.
- [ ] Otomatik dış mesaj veya zamanlanmış iletişim ekleme; yalnız kullanıcı tarafından manuel yenilenen hizmet takvimi yaklaşımını koru.

## 5. Hesaplar arası devam için yedek/devir hazırlığı

- [x] Mevcut projenin kaynak kodu, mimari ve güvenlik notları, veritabanı şeması/migrasyonları, bağımlılık kilit dosyası, test kanıtları ve çalışma durumu için salt-okunur bir devir envanteri oluştur. `DEVRALMA-VE-YEDEK-PLANI.md` ile 392 izlenen dosya, 294 kaynak/şema dosyası ve 94 test dosyası envanterlendi.
- [x] Uygulama verileri, kullanıcı yüklemeleri, gizli değişkenler ve alan adı bağlarının kaynak kod paketinden ayrı tutulduğunu açıkça belirle; başka hesapta devam seçeneğinin hangi verileri otomatik taşımadığını belgele. `DEVRALMA-VE-YEDEK-PLANI.md` kapsam ayrımını ve karar seçeneklerini içerir.
- [x] Mevcut kullanıcı verilerini, IndexedDB yedeklerini, imzalı PDF’leri, `%APPDATA%\Global 1881 Gayrimenkul` içeriğini veya yayın alanı bağını değiştirmeden, başka hesapta kaynak üzerinden devam için geri dönüş yönergesi hazırla. `DEVRALMA-VE-YEDEK-PLANI.md` güvenli sıra ve koruma sınırlarını içerir.
- [x] Mevcut proje kaynakları, mimari/güvenlik notları, şema/migrasyonlar, testler ve kilit dosyasını içeren; merkezi veri, yüklenen belge, gizli değişken, çalışma çıktısı ve Windows kurulum dosyalarını dışlayan doğrulanabilir salt-okunur kaynak devir paketi oluştur. Teslim edilecek `Global1881-kaynak-devir-guvenli-2026-08-30.zip`, kayıtlı `8e462d6` sürümünden üretildi; 420 dosya, 1,3 MB, ZIP bütünlük testi başarılıdır. Windows kurulum BAT/PowerShell betikleri, paketleme ayarları, bağımlılık/derleme/log klasörleri ve gizli dosya/anahtar uzantıları denetimle dışlanmıştır. SHA-256 özeti: `44d22d5adafe4e77a2fceaec1c007dcd1f99430b4a7162fd0577cc9bc414b427`.
- [ ] Kaynak paketi dışındaki merkezi veritabanı, yüklenen belgeler, gizli yapılandırma, alan adı bağı ve yerel Windows verileri için erişim sınırlarını ve ayrı yedekleme yöntemlerini envanterle.
- [ ] Merkezi veri ve yüklenen belgeler için hesabın kullanabildiği resmî görev verisi yedekleme yolunu destek ekibi veya yönetim arayüzü üzerinden doğrula; kaynak ZIP’inin bu verileri içermediğini koru.
- [ ] `%APPDATA%\Global 1881 Gayrimenkul` için kullanıcı cihazında salt kopya alma, gizli ayarları değerlerini açığa çıkarmadan yeniden oluşturma ve alan adı bağını değiştirmeden koruma yönergelerini hazırla.
- [x] Merkezi veritabanında mevcut kayıtları değiştirmeden dışa aktar; müşteri ve operasyonel kayıtları parolayla şifrelenmiş ayrı veri yedeğine koy, paket bütünlüğünü doğrula ve parolayı arşivden ayrı tut. `Global1881-merkezi-veri-sifreli-yedek-2026-08-30.7z` AES-256 ve şifreli dosya adlarıyla oluşturuldu; doğru parola bütünlük testi, yanlış parola reddi, arşiv SHA-256 özeti ve düz metin geçici dosya temizliği doğrulandı.

## 6. Bulut altyapısı görüşmesi

- [x] Uygulamanın React/TypeScript, Node.js/Express/tRPC, MySQL uyumlu veritabanı, S3 uyumlu belge depolama ve OAuth/gizli değişken gereksinimlerini içeren sağlayıcı kontrol listesi hazırla. `BULUT-SAGLAYICI-GORUSME-LISTESI.md` oluşturuldu.
- [x] Sağlayıcıya sorulacak TLS/alan adı, yedekleme-geri yükleme, erişim güvenliği, izleme, taşınabilirlik, maliyet ve destek maddelerini açık kabul ölçütleriyle yaz. `BULUT-SAGLAYICI-GORUSME-LISTESI.md` kabul ölçütleri ve teklif kalemlerini içerir.
- [ ] Ubuntu/Docker önerilerini mevcut MySQL/TiDB, Express/tRPC, S3 ve rol/mahremiyet mimarisiyle karşılaştır; uygulanmış güvenlik katmanlarını, eksik altyapı katmanlarını ve doğru bulut geçiş sırasını belgeleyerek öner.
- [x] Kartvizit, portföy ve müstakil ilanlarda kullanılacak QR kodların sabit `ofis.global1881.com` bağlantısından ilan detayına yönlenmesi için özel alan adı, TLS, kısa yönlendirme, ilan durum yönetimi ve ölçüm gereksinimlerini bulut sağlayıcı görüşme listesine ekle. `BULUT-SAGLAYICI-GORUSME-LISTESI.md` içindeki QR bölümü; doğrudan portal, kalıcı ofis yönlendirmesi ve public ilan sayfası seçeneklerini içerir.

## 7. Yeni hesapta devam seçeneği

- [x] Korunan kaynak ve şifreli merkezi veri yedeklerinden, yeni hesapta sıfırdan yazmadan devam için teknik yeniden kurulum adımlarını, dış bağımlılıkları ve süre aralıklarını değerlendir; kullanıcı onayı olmadan yeni hesap/proje/veri aktarımı başlatma. `YENI-HESAP-KURULUM-REHBERI.md` kurulum sırası, gizli ayar sınırları ve 2–3 iş günü teknik geçiş aralığını içerir.
- [x] Kaynak yedeğini, şifreli merkezi veri arşivini, SHA-256 kayıtlarını, mimari/güvenlik/bulut görüşme notlarını ve parola içermeyen yeni hesap kurulum yönergelerini tek doğrulanabilir önlem ZIP’inde topla; merkezi sistem veya alan adı ayarını değiştirme. `Global1881-yeni-hesap-onlem-paketi-2026-08-31.zip` 9 dosya ve 1.317.255 bayt içerir; ZIP bütünlüğü, Windows çalıştırılabilir/betik dışlaması ve parola dışlama denetimi başarılıdır. SHA-256: `6f15c25432a35eaee8510796b507678a9ea4a01d97f87824435d15c9bc6830bc`.

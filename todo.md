# Global 1881 — Aktif Proje Görevleri

- [ ] Ana PC’nin LAN IP adresini ve uygulamanın gerçek dinleme portunu kesinleştir; Windows ağ profilini Özel yap, yalnızca ofis ağına port izni ver ve iki istemci bağlantısını doğrula.

- [ ] Canlıya alma ertelensin; aynı ofis Wi‑Fi ağındaki üç aktif kullanıcıyla bir günlük kontrollü kabul testi yapılsın.
- [ ] Üç kullanıcı için login/rol, müşteri-kira veri girişi, sözleşme kodu, komisyon, hassas veri maskesi ve ana PC bağlantısını kontrol et.
- [ ] Ana PC’de test öncesi ve sonrası şifreli yedek al; test verisinin gerçek müşteri kayıtlarıyla karışmadığını ve tekrar kayıt oluşmadığını doğrula.
- [ ] Windows 1.0.22/AppData ve Defender sınırlarını bozmadan mevcut kurulumla kabul testi yap; bu aşamada yeni imzasız EXE/ZIP üretme.

- [ ] Sözleşme numaralarında danışman kodunu görünür ve değişmez kullan: `CT1-001`, `KT1-001`, `IP1-001`; numara üretimi, sözleşme/PDF görünümü, arama ve audit kayıtlarında düzenleyen danışmanla eşleşsin.

- [ ] Yeni danışman onboarding akışı: broker manager danışman hesabı açabilsin, geçici tek kullanımlık parola üretilsin, ilk girişte parola değişimi zorunlu olsun; mevcut Manus OAuth kullanıcıları korunarak yerel login katmanı güvenli biçimde tasarlansın.
  - [x] Yerel kimlik bilgileri için parola hash’i, geçici parola son kullanma zamanı, tek kullanımlık durum, ilk giriş zorunluluğu ve başarısız deneme/oturum audit alanlarını ekle. `localLoginCredentials` ve `localLoginSessions` tabloları 0029/0031 migration ile uygulandı; scrypt hash, 24 saatlik geçici parola süresi, `temporaryPasswordUsedAt`, 5 denemede 15 dakika kilit ve auth audit olayları kullanılıyor.
  - [x] Broker manager’ın yeni danışman hesabı oluşturma prosedürünü uzun login adı ve otomatik kısa kod üretimiyle bağla. `team.createLocalConsultant` manager-only prosedürü `consultantIdentity` yardımcısını kullanıyor.
  - [x] Yerel login, logout, geçici parola reddi ve ilk giriş parola değiştirme akışlarını uygula; Manus OAuth kullanıcılarını değiştirme. Yerel session cookie’si OAuth cookie’sinden ayrıdır; tRPC context ve contract document download fallback’i ile korunur.
  - [x] Onboarding ekranı, güvenli geçici parola gösterimi ve parola değişikliği ekranını ekle. Team ekranı manager-only onboarding kartını, dashboard login ekranı ilk giriş parola değişimini içeriyor.
  - [x] Güvenlik, rol, CT1/CT2 kodlama, tek kullanımlık parola ve ilk giriş testlerini yazıp çalıştır. `localAuthPolicy.test.ts`, logout, belge indirme ve identity testleri 9/9 odaklı başarılı; gerçek Cahit hesabı/merkezi veri login kabulü ayrıca açık.
  - [x] Uzun login adını `K-TASLIARMUT`, `I-PARIN`, `C-TERCAN` biçiminde normalize et; login/kısa kod kimliklerinde İngilizce uyumlu noktasız `I` kullan; kısa kodu baş harfleri + kullanılmayan en küçük sıra numarası olarak üret (`KT1`, `IP1`, `CT1`, `CT2`, `CT3`). `consultantIdentity` yardımcı ve regresyon testleri hazır.
  - [x] Aynı kısa kod veya uzun login adının tekrar atanmasını engelle; eski kodları yeniden kullanma, noktalı `İ` ile noktasız `I` çakışmalarını tek kimlik standardında çöz ve audit kaydı oluştur. Hesap oluşturma audit’i ve unique login/kod kontrolleri uygulanıyor.

- [ ] CT1’den alınan 19 aktif kira kaydını, kullanıcı tarafından belirtilen boş alanları boş bırakarak Aktif Kiralamalar aktarım formatına dönüştür, hassas telefonları güvenli aktarım kuralıyla işle ve veri doğrulaması yap.
  - [ ] Cahit Tercan / CT1 / Terpa Gayrimenkul danışman profilini tam yetkili ve login yapabilen danışman hesabı olarak oluştur; IP1/İbrahim Parin Broker kaydına dokunma.
  - [ ] CT1 hesabının login, danışman rolü, müşteri/aktif kira atamaları ve kendi kayıtlarına erişimini doğrula.
  - [ ] CT1 anlaşma snapshot’ını %70 danışman / %30 ofis olarak oluştur; yetki kodunu 3500211/003 olarak kaydet.
  - [ ] Önizleme, CT1 danışman eşleşmesi ve zorunlu alan doğrulamasını tamamla.
  - [ ] Onaylı 19 kaydı merkezi Aktif Kiralamalar tablosuna aktar ve tekrar kayıt kontrolü yap.
  - [ ] Telefon maskesi/şifreli kasa ve boş tahliye alanlarını aktarım sonrası doğrula.

Bu dosya yalnızca **bugün açık olan ve tekrar etmeyen** işleri içerir. Önceki ayrıntılı görev geçmişi `todo-archive.md` ve `todo-history-2026-08-29.md` içinde korunmaktadır; hiçbir geçmiş kayıt silinmemiştir.

## 1. Güvenli Windows / Electron kabulü — dağıtım durduruldu

- [ ] Defender’ın `Trojan:Script/Wacatac.H!ml` algıladığı 1.0.23 EXE, ZIP ve BAT dosyalarını geçersiz kabul etmeyi sürdür; bu dosyaları yeniden üretme, gönderme, geri yükletme, izin verme veya güvenlik korumasını aşma yönlendirmesi yapma.
- [ ] Kullanıcının mevcut 1.0.22 kurulumu ve `%APPDATA%\Global 1881 Gayrimenkul` verilerini değiştirmeden koru.
- [ ] Gelecekte offline Windows dağıtımı yeniden ele alınırsa yalnız gerçek Windows ortamında oluşturulan, bağımsız güvenlik incelemesinden geçmiş ve kullanıcı kabulü için tek toplu paket yaklaşımını değerlendir; bu karar oluşmadan paket üretme.
- [ ] Güvenli bir Windows kabul yolu oluştuğunda tek oturumda Offline Genel Bakış açılışı, `startup.log`, `En geç` tarihinin `GG.AA.YYYY` görünümü, A4 kira/yetki belgeleri, DASK/EİDS/ekler, menü ve Ofis Akışı yerleşimini doğrula.

## 2. Canlı web erişimi — platform / alan adı takibi

- [ ] Yayın alanı kullanıcı ağlarında güvenlik uyarısı veya bakım ekranı göstermeden kararlı biçimde erişilebilir olana kadar altyapı durumunu takip et. Ubuntu kontrolünde TLS sertifikası geçerli ve giriş sayfası HTTP 200 dönmüştür; bu, kullanıcı ağındaki önceki `ERR_SSL_PROTOCOL_ERROR` ve bakım ekranını tek başına kapatmaz.
- [ ] `ofis.global1881.com` özel alt alan adı için DNS yönetim yetkisini, mevcut `ofis` kaydının boşluğunu ve kayıt ekleyecek web tasarımcısı/sağlayıcıyı doğrula; bağlantı penceresi başlatılmadan önce DNS kaydı eklemeye hazır olsun. 04.09.2026 mobil Chrome ekranında `DNS_PROBE_FINISHED_NXDOMAIN` doğrulandı; bu, alt alan adı için DNS kaydının henüz oluşturulmadığını gösterir. DNS değişikliği yapılmadı.
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
- [x] Revize mahremiyet kuralını uygula: broker manager ile **yalnız atanmış danışman**, kendi müşteri/aktif kira/sözleşme kapsamındaki telefon ve T.C./vergi noyu gerekçeli ve audit kayıtlı geçici olarak görebilsin; ofis asistanı ve başka danışmanlar tam değeri göremesin. Mevcut kayıtlar ve yedekler değişmesin. Sunucu rol+sahiplik denetimi, satır bazlı arayüz butonları ve offline danışman formu güncellendi; 269 test, TypeScript ve production build ile doğrulandı.
- [ ] WordPress, DNS delegasyonu ve alan adı sahipliği modelini, web tasarımcısının erişim sınırlarıyla kullanıcı kararı olarak değerlendir.
- [x] Otomatik dış mesaj veya zamanlanmış iletişim ekleme; yalnız kullanıcı tarafından manuel yenilenen hizmet takvimi yaklaşımını koru. `reminders.schedule` tRPC kurulumu FORBIDDEN döndürüyor; manuel vade/hizmet takvimi akışı korunuyor ve `remindersPolicy.test.ts` ile doğrulandı.

## 5. Hesaplar arası devam için yedek/devir hazırlığı

- [x] Mevcut projenin kaynak kodu, mimari ve güvenlik notları, veritabanı şeması/migrasyonları, bağımlılık kilit dosyası, test kanıtları ve çalışma durumu için salt-okunur bir devir envanteri oluştur. `DEVRALMA-VE-YEDEK-PLANI.md` ile 392 izlenen dosya, 294 kaynak/şema dosyası ve 94 test dosyası envanterlendi.
- [x] Uygulama verileri, kullanıcı yüklemeleri, gizli değişkenler ve alan adı bağlarının kaynak kod paketinden ayrı tutulduğunu açıkça belirle; başka hesapta devam seçeneğinin hangi verileri otomatik taşımadığını belgele. `DEVRALMA-VE-YEDEK-PLANI.md` kapsam ayrımını ve karar seçeneklerini içerir.
- [x] Mevcut kullanıcı verilerini, IndexedDB yedeklerini, imzalı PDF’leri, `%APPDATA%\Global 1881 Gayrimenkul` içeriğini veya yayın alanı bağını değiştirmeden, başka hesapta kaynak üzerinden devam için geri dönüş yönergesi hazırla. `DEVRALMA-VE-YEDEK-PLANI.md` güvenli sıra ve koruma sınırlarını içerir.
- [x] Mevcut proje kaynakları, mimari/güvenlik notları, şema/migrasyonlar, testler ve kilit dosyasını içeren; merkezi veri, yüklenen belge, gizli değişken, çalışma çıktısı ve Windows kurulum dosyalarını dışlayan doğrulanabilir salt-okunur kaynak devir paketi oluştur. Teslim edilecek `Global1881-kaynak-devir-guvenli-2026-08-30.zip`, kayıtlı `8e462d6` sürümünden üretildi; 420 dosya, 1,3 MB, ZIP bütünlük testi başarılıdır. Windows kurulum BAT/PowerShell betikleri, paketleme ayarları, bağımlılık/derleme/log klasörleri ve gizli dosya/anahtar uzantıları denetimle dışlanmıştır. SHA-256 özeti: `44d22d5adafe4e77a2fceaec1c007dcd1f99430b4a7162fd0577cc9bc414b427`.
- [x] Kaynak paketi dışındaki merkezi veritabanı, yüklenen belgeler, gizli yapılandırma, alan adı bağı ve yerel Windows verileri için erişim sınırlarını ve ayrı yedekleme yöntemlerini envanterle. `DEVRALMA-VE-YEDEK-PLANI.md` bölüm 8’de her varlık için erişim sınırı, yedek yöntemi ve mevcut kanıt/sınır matrisi eklendi.
- [ ] Merkezi veri ve yüklenen belgeler için hesabın kullanabildiği resmî görev verisi yedekleme yolunu destek ekibi veya yönetim arayüzü üzerinden doğrula; kaynak ZIP’inin bu verileri içermediğini koru.
- [x] `%APPDATA%\Global 1881 Gayrimenkul` için kullanıcı cihazında salt kopya alma, gizli ayarları değerlerini açığa çıkarmadan yeniden oluşturma ve alan adı bağını değiştirmeden koruma yönergelerini hazırla. `YEREL-WINDOWS-VERI-YEDEK-REHBERI.md` oluşturuldu; mevcut 1.0.22 kurulumu, AppData ve Defender güvenliği değiştirilmez.
- [x] Merkezi veritabanında mevcut kayıtları değiştirmeden dışa aktar; müşteri ve operasyonel kayıtları parolayla şifrelenmiş ayrı veri yedeğine koy, paket bütünlüğünü doğrula ve parolayı arşivden ayrı tut. `Global1881-merkezi-veri-sifreli-yedek-2026-08-30.7z` AES-256 ve şifreli dosya adlarıyla oluşturuldu; doğru parola bütünlük testi, yanlış parola reddi, arşiv SHA-256 özeti ve düz metin geçici dosya temizliği doğrulandı.

## 6. Bulut altyapısı görüşmesi

- [x] Uygulamanın React/TypeScript, Node.js/Express/tRPC, MySQL uyumlu veritabanı, S3 uyumlu belge depolama ve OAuth/gizli değişken gereksinimlerini içeren sağlayıcı kontrol listesi hazırla. `BULUT-SAGLAYICI-GORUSME-LISTESI.md` oluşturuldu.
- [x] Sağlayıcıya sorulacak TLS/alan adı, yedekleme-geri yükleme, erişim güvenliği, izleme, taşınabilirlik, maliyet ve destek maddelerini açık kabul ölçütleriyle yaz. `BULUT-SAGLAYICI-GORUSME-LISTESI.md` kabul ölçütleri ve teklif kalemlerini içerir.
- [x] Ubuntu/Docker önerilerini mevcut MySQL/TiDB, Express/tRPC, S3 ve rol/mahremiyet mimarisiyle karşılaştır; uygulanmış güvenlik katmanlarını, eksik altyapı katmanlarını ve doğru bulut geçiş sırasını belgeleyerek öner. Karşılaştırma ve staging→veri geri yükleme→rol/mahremiyet kabulü→DNS geçiş sırası `BULUT-SAGLAYICI-GORUSME-LISTESI.md` bölüm 9’a eklendi.
- [x] Kartvizit, portföy ve müstakil ilanlarda kullanılacak QR kodların sabit `ofis.global1881.com` bağlantısından ilan detayına yönlenmesi için özel alan adı, TLS, kısa yönlendirme, ilan durum yönetimi ve ölçüm gereksinimlerini bulut sağlayıcı görüşme listesine ekle. `BULUT-SAGLAYICI-GORUSME-LISTESI.md` içindeki QR bölümü; doğrudan portal, kalıcı ofis yönlendirmesi ve public ilan sayfası seçeneklerini içerir.

## 8. Offline istemci teknik güvenlik değerlendirmesi

- [x] Offline Electron uygulamasının merkezi veriyle senkronizasyonu, ağ/port gereksinimi, cihaz-başına imza anahtarı taşınabilirliği ve AES-256-GCM yedek parolasının saklanma davranışını kaynak koduna göre kesinleştir; gerektiğinde güvenli iyileştirme önerisini ayrı karar olarak sun. Sonuç: mevcut EXE veri adasıdır; otomatik merkezi senkron/ağ portu yoktur. Yedek zarfındaki açık anahtar eski cihaz yedeğinin doğrulamasını yeni cihazda mümkün kılar; yerel PDF arşivleri ayrıca AppData ile taşınmalıdır. Parola kalıcı olarak saklanmaz; yalnız açık form belleğinde kullanılır.

## 9. Geçici çok cihazlı test erişimi

- [x] Danışmanların kendi laptoplarından ofiste veya ofis dışındayken kullanıcının laptopundaki geçici ana sisteme bağlanması önerisini; mevcut web/desktop ayrımı, HTTPS/TLS, ağ maruziyeti, rol yetkileri, eşzamanlı veri girişi, yedekleme ve canlıya alma sınırları açısından değerlendir. Kullanıcı açık onayı olmadan port açma, uzak erişim veya mevcut yapıyı değiştirme. Sonuç: mevcut offline EXE veri adası olduğundan uygun değildir; merkezi HTTPS web uygulaması kullanıcı laptopundan servis edilmemeli, test yayımlanmış HTTPS uygulamasında ayrı rol hesaplarıyla yapılmalıdır. Değerlendirme yalnızca tasarım düzeyinde tamamlandı; ağ/port/yapı değişikliği yapılmadı.

## 7. Yeni hesapta devam seçeneği

- [x] Korunan kaynak ve şifreli merkezi veri yedeklerinden, yeni hesapta sıfırdan yazmadan devam için teknik yeniden kurulum adımlarını, dış bağımlılıkları ve süre aralıklarını değerlendir; kullanıcı onayı olmadan yeni hesap/proje/veri aktarımı başlatma. `YENI-HESAP-KURULUM-REHBERI.md` kurulum sırası, gizli ayar sınırları ve 2–3 iş günü teknik geçiş aralığını içerir.
- [x] Kaynak yedeğini, şifreli merkezi veri arşivini, SHA-256 kayıtlarını, mimari/güvenlik/bulut görüşme notlarını ve parola içermeyen yeni hesap kurulum yönergelerini tek doğrulanabilir önlem ZIP’inde topla; merkezi sistem veya alan adı ayarını değiştirme. `Global1881-yeni-hesap-onlem-paketi-2026-08-31.zip` 9 dosya ve 1.317.255 bayt içerir; ZIP bütünlüğü, Windows çalıştırılabilir/betik dışlaması ve parola dışlama denetimi başarılıdır. SHA-256: `6f15c25432a35eaee8510796b507678a9ea4a01d97f87824435d15c9bc6830bc`.

- [x] Komisyon paylaşım varyasyonlarını doğrula: tek danışman, iki danışmanlı alıcı-satıcı temsili, dış ofis işbirliği, ofis payı ve danışman payını veri modeli/ekran/testlerle karşılaştır; kesinleşmemiş oranları kullanıcı kararı olmadan uygulama. Tek danışman, alıcı/satıcı danışmanları, ortak danışman, dış ofis, indirim, kısmi tahsilat ve iptal akışları merkezi şema/router/UI ve testlerle doğrulandı.

- [x] Komisyon paylaşımında kesin ofis kuralını uygula: her komisyon kaynağında %60 ilgili danışman, %40 Global 1881 ofis. İki danışman alıcı/satıcı taraflarını temsil ediyorsa her tarafın komisyonu kendi temsilcisine göre ayrı hesaplanmalı; oran ters çevrilmemeli. Merkezi çok paydaşlı modelde pay oranları %100 kontrolüyle uygulanıyor; dış ofis ve varsayılan dışı oranlar manager gerekçesine bağlı.

- [x] Komisyon otomasyonunu yeniden doğrula: %60 danışman/%40 ofis kuralı, tek danışman, alıcı-satıcıyı iki danışmanın temsil ettiği işlem, ortak danışman, dış ofis, indirim/iptal ve tahsilat durumları için gerçek şema/router/UI ve Vitest kapsamını kontrol et; merkezi online kapsamı da eklendi. Not: indirim/iptal ve tahsilatın ayrıntılı muhasebe mutabakatı sonraki operasyonel genişletme olarak ayrıca değerlendirilebilir.

- [x] Çok paydaşlı komisyon modülünü uygula: alıcı ve satıcı tarafı danışmanları, aynı tarafta birden fazla danışman, farklı emlak ofisi işbirliği, dış ofis payı, %60 danışman/%40 Global 1881 varsayılanı, işlem özelinde broker manager gerekçeli override, indirim/iptal/kısmi tahsilat ve rol bazlı raporlama. Offline iç denetim paneli ile merkezi online şema, tRPC router ve `/commissions` ekranı eklendi; KDV hariç hesap, manager gerekçesi ve tahsilat referansı uygulanıyor.
- [x] Çok paydaşlı komisyon için gerçek uygulama ve kabul testlerini ekle: pay toplamı, KDV hariç taban, dış ofis ayrımı, tahsilat ve mükerrerlik kontrolleri. Offline odaklı test 7/7, merkezi komisyon regresyon testi 2/2, tam test 99 dosya/273 test başarılı; TypeScript ve production build başarılı.

- [x] Yerel Windows yedeği rehberine gizli ayar değerlerini ifşa etmeden yeniden oluşturma adımlarını ve manuel girilecek öğeleri ekle. Secret/token/DB/S3 değerleri kopyalanmıyor; yalnız güvenli giriş ve secret manager yeniden tanımlaması kullanılıyor.
- [x] Yerel Windows geri kurulumunda alan adı bağı, oturum/veri dosyaları ve PDF/manifest ayrıştırma doğrulama listesini ekle. Alan adı/DNS, oturum/şifreli veri ve PDF-SHA256 manifestleri ayrı doğrulanıyor.

- [x] Komisyon varyasyon matrisi ve eksik süreç kontrolünü tamamla; kodlanmış, kısmen kodlanmış ve eksik hesapları tablo halinde raporla. Sonuç: 8 ana iş varyasyonu ve 4 tahsilat/işlem durumu ayrıştırıldı; iade/mahsup muhasebesi ile resmî platform yedek yolu açık kaldı.

- [x] Komisyon merkezi hesaplamasında `global1881Share` alanını düzelt: varsayılan işlemde Global 1881 payı net komisyonun %40’ı olmalı; dış ofisli işlemde dış ofis payı ve Global 1881 ofis payı ile danışman payları ayrı hesaplanmalı. Dış ofis oranı sonrası kalan tutarın danışman/ofis arasında nasıl bölüneceğini kullanıcı politikasıyla kesinleştir ve test et. `globalPortfolioOfficeShare` ve `externalOfficeRole` ile yön bazlı hesap uygulandı; 100.000 TL örnekleri test edildi.

- [x] Dış ofisli paylaşım politikasını düzelt: toplam komisyonun %50’si dış ofis, %50’si Global 1881 havuzu; Global havuz iki danışmana eşit 25.000 TL tabanlarıyla dağıtılacak ve her danışman tabanında %60 danışman/%40 Global 1881 uygulanacak. Hesap çekirdeği, online ekran ve yön bazlı merkezi hesap buna göre güncellendi.
- [x] Dış ofisli 100.000 TL örneği için merkezi/offline hesap, arayüz, audit ve regresyon testlerini yeni politikaya göre güncelle; eski `global1881Share` kalan tutar hesabını kaldır. Merkezi/offline hesap, yön/audit alanları ve 11 odaklı test başarılı; gerçek merkezi DB uçtan uca kabulü 107. maddede ayrıca açık.

- [x] Dış ofisli iki danışman kesin örneğini uygula ve test et: 100.000 TL toplam → 50.000 TL dış ofis + 50.000 TL Global havuz; Global havuzdan danışman başına 25.000 TL taban → 15.000 TL danışman + 10.000 TL Global kasa; toplam 30.000 TL danışman, 20.000 TL Global kasa, 50.000 TL dış ofis. `commissionScenario` testi ve online önizleme ile doğrulandı.

- [x] Dış ofis sonrası tek danışman senaryosunu uygula ve test et: 100.000 TL toplam → 50.000 TL dış ofis; 50.000 TL Global havuz → tek danışman %60 = 30.000 TL, Global ofis %40 = 20.000 TL. `commissionScenario` testi ve online önizleme ile doğrulandı.

- [x] Karşı ofis portföyü senaryosunu ekle: portföy sahibi diğer ofis dış paydaş olarak 50.000 TL, Global 1881 dış ofis havuzu 50.000 TL; Global havuzunda bizim tek danışman %60 = 30.000 TL, Global kasa %40 = 20.000 TL. Karşı ofis/Global rolleri, sabit paylaşım ve audit ayrı görünmeli. Tek ekran senaryo çekirdeği, dış ofis yönü ve merkezi audit alanları uygulandı; 100.000 TL örneği test edildi.

- [x] Merkezi komisyon kaydına dış ofis yönünü ekle: `counterpartyPortfolio` (karşı ofis portföyü) ve `global1881External` (Global dış ofis) ayrımı; her ikisinde sabit 50/50 toplam havuz ve Global havuzunda tek danışman %60/%40 hesabı. Migration, router, UI ve yön bazlı Global kasa hesabı eklendi.

- [x] Portföy sahipliği kuralını uygula: danışman portföyünde toplam komisyon %50/%50 alıcı-satıcı taraflarına, her tarafın %60’ı ilgili danışmana ve %40’ı Global 1881’e; ofis portföyünde %50 portföy sahibi ofise, kalan %50 iki danışmana %25/%25, her danışman tabanında %60/%40. `commissionScenario` ve online ekran bu iki sabit senaryoyu otomatik hesaplıyor.
- [x] Portföy sahibi danışman/ofis senaryoları için merkezi ve offline hesap, ekran, audit ve 100.000 TL örnek regresyon testlerini ekle. `server/commissionAcceptance.test.ts` 4/4, ilgili komisyon/anlaşma testleri toplam 15/15 geçti; canlı veritabanına test kaydı eklenmedi.

- [x] Komisyon ekranını tek ekrana sadeleştir: tutar girişi + senaryo seçimi + danışman/portföy/ofis seçimi; sistem ara havuzları, danışman payını ve Global kasa payını otomatik önizlesin; karmaşık oran hesabı kullanıcıya bırakılmasın. `/commissions` ekranında sabit senaryo seçimi, otomatik önizleme ve manuel oran alanı yerine sistem oranı gösterimi uygulandı.

- [x] Danışman anlaşma profili ekle: geçerli başlangıç/bitiş tarihi, danışman payı %, Global 1881 payı %, aylık masa/ofis bedeli (örn. 5.000/7.000 TL), onaylayan manager ve değişiklik geçmişi. Merkezi şema, manager-only Team ekranı, audit ve tarih alanları eklendi.
- [x] Komisyon kayıtlarında kullanılan anlaşma profilini oran ve sabit bedel snapshot’ı olarak sakla; profil değişince geçmiş işlemleri değiştirme, yeni işlemlerde yalnız yeni geçerli profili kullan. `agreementProfileId`, `snapshotConsultantSharePercent`, `snapshotOfficeSharePercent` ve `snapshotMonthlyDeskFee` merkezi işlem kaydına eklenerek create akışına bağlandı.
- [x] Danışman alımı/anlaşma ekranı ve komisyon motoru için %60/%40, %70/%30, %80/%20 ve serbest oran/bedel testlerini ekle; oran toplamı %100 kontrolü ve manager onayı zorunlu olsun. Anlaşma/komisyon odaklı testler 3 dosya/11 test başarılı; Team ekranı manager-only ve oran toplamı doğrulaması aktif.

- [x] Otomatik dış reminder kurulumunu kapat: `reminders.schedule` tRPC prosedürü ve Heartbeat üzerinden `notifyOwner` akışını kullanıcı kararıyla devre dışı bırak; manuel vade/hizmet takvimi yenilemesini koru ve schedule/handler regresyon testi ekle. Kurulum prosedürü kapalı; handler disabled/orphan kontrolleri ve manuel politika testleri başarılı.

- [x] `reminderPreferences.scheduleCronTaskUid` kayıtlarını ve proje/hesap cron envanterini güvenli biçimde kontrol et; proje sahibi Heartbeat envanteri `total: 0` döndü. Mevcut kullanıcı verisi değiştirilmedi.
- [x] `scheduledRemindersHandler` içinde manuel politika için zorunlu kapatma ekle; eski preference/taskUid bulunsa bile `notifyOwner` çağrısı yapılmasın. Handler `disabled-by-policy` no-op döndürüyor.
- [x] Eski schedule/taskUid varlığında handler’ın dış bildirim göndermediğini politika testiyle doğrula; `remindersPolicy.test.ts` 2/2 başarılı ve kaynakta `notifyOwner` bulunmuyor.

- [x] Komisyon tahsilatını sadeleştir: varsayılan net hizmet bedeli, gerçek tahsil edilen net tutar, otomatik/manuel indirim farkı ve açıklama notunu ayrı sakla; danışman/ofis paylarını işlemdeki net hizmet bedeli üzerinden, tahsilat kayıtlarını ise gerçek tahsil edilen tutar üzerinden ayrı izlet. `discountAmount`, `netServiceFee`, `collectedAmount`, `collectionReference` ve `collectionNote` ayrıdır.
- [x] Tahsilat tutarı varsayılan bedeli aşamasın; indirim ve not audit/işlem geçmişinde korunsun; 100.000 TL→90.000 TL tahsilat akışı server tarafında üst sınır ve ayrı audit referansıyla korunuyor. Tahsilatın komisyon hak dağılımını geriye dönük değiştirmemesi kabul kuralıdır.

- [x] Komisyon işlem ekranında alıcı ve satıcıyı ayrı müşteri kütüklerine bağla: mevcut müşteri seçimi veya yeni müşteri oluşturma, taraf rolü, atanmış danışman ve gelecekte yeniden kullanılabilir müşteri kimliği birlikte saklansın; komisyon paydaşı ile müşteri kaydı ayrı kavramlar olarak korunsun. `buyerClientId`/`sellerClientId` eklemeli migration ile merkezi kayda bağlandı; `/commissions` ekranında mevcut müşteri seçimi ve aynı ekrandan yeni müşteri kütüğü oluşturma eklendi. TypeScript, 3 odaklı test dosyası/13 test ve production build başarılı.

- [ ] Ofislerarası komisyon oranlarını sabit 50/50 ile sınırlama: iki ofiste %50/%50, üç eşit paydaşta %33/%33/%33 veya imzalı anlaşmaya göre değişken oranları destekle; toplam %100, taraf/ofis adı, işlem büyüklüğü, anlaşma tarihi, geçerlilik dönemi, gerekçe ve manager onayıyla snapshot/audit sakla.
- [ ] Danışman ayrılışında portföy ve hakları tarihsel koru: ayrılmadan önce kazanılmış veya portföy döneminde oluşmuş komisyon hakkı eski danışmana bağlı kalsın; ayrılıştan sonraki yeni işlemlerde manager onaylı sorumlu danışman/ofis ataması yapılabilsin; müşteri Global 1881’de kalırsa portföy devri eski kesinleşmiş hakları değiştirmesin.

- [x] Ayrılan danışmanın bireysel portföyündeki açık işlem için eski danışman hak snapshot’ını koru; işlemi tamamlayan yeni danışmanla kararlaştırılan %50 paylaşımı ayrı hesapla. Müşteriyi yeni danışman veya ofis bulduysa Global %40 ofis payını ve eski danışmanın korunmuş hakkını geriye dönük değiştirme. Sunucu motoru payout snapshot alanlarını ve %50/%50 hesabını uygular.
- [x] Kurumsal ofis portföyünde yetki süresi sonuna kadar portföy/komisyon hakkını ofiste tut; ofisin danışmana ödeme yapmama seçeneğini ayrı anlaşma politikası olarak kaydet ve yeni danışman/portföy devrini manager onaylı tarihsel kayıtla yürüt.

- [x] Bireysel danışman portföyü ayrılış formülünü uygula: 100.000 TL örneğinde Global %40 = 40.000 TL korunur; danışman havuzu %60 = 60.000 TL eski ve yeni danışman arasında %50/%50 bölünür; her biri 30.000 TL snapshot hakkı alır. Yeni danışman yalnız işlemi gerçekleştiren kişiyse pay kazanır. Server/client kabul testleriyle doğrulandı.
- [x] Kurumsal ofis portföyü formülünü uygula: yetki süresi sonuna kadar portföy/komisyon hakları ofiste kalabilir; ofis danışmana ödeme yapmama veya anlaşmadaki ödeme seçeneğini tarihsel snapshot olarak saklar. Portföy devri eski kesinleşmiş ofis hakkını değiştirmez. `corporateOfficePaysConsultant=false` sunucu hesaplamasına bağlandı.
- [x] Ayrılış payout snapshot’ı için eski danışman, yeni danışman ve kurumsal ofis tutarlarını merkezi transaction alanlarında sakla; 0028 migration uygulandı, sunucu hesap motoru ve kabul testleri tamamlandı. `originatingConsultantPayout`, `fulfillingConsultantPayout` ve `rightsOfficePayout` alanları eklemeli ve varsayılan 0 değerleriyle eski kayıtları koruyor.

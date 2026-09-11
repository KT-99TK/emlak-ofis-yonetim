# Global 1881 — Aktif Proje Görevleri

- [ ] Ana PC’nin LAN IP adresini ve uygulamanın gerçek dinleme portunu kesinleştir; Windows ağ profilini Özel yap, yalnızca ofis ağına port izni ver ve iki istemci bağlantısını doğrula. Kod ve teşhis hazırlığı tamam; fiziksel ana PC/istemci bağlantı kanıtı bekleniyor.
  - [x] Merkezi web server’ın `0.0.0.0`/LAN bind davranışını ve port 3000 fallback aralığını kaynakta doğrula. `HOST` configurable, default `0.0.0.0`; `PORT` default 3000 ve 20 port fallback korunuyor.
  - [x] Ana PC ve istemciler için yerel IP, port, firewall ve Test-NetConnection adımlarını dokümante et. `docs/OFFICE-LAN-CONNECTION.md`, `docs/office-lan-check.ps1` ve `lanBindPolicy.test.ts`/`lanCheckGuide.test.ts` hazır; fiziksel Windows testi açık.
  - [x] Üç kullanıcı için ortak web bağlantısı kabul ölçütlerini belirle; mevcut offline 1.0.22 EXE’ye dokunma. Ortak merkezi web URL, IP1/KT1/CT1 rol ve veri kontrolleri rehbere işlendi; 1.0.22 değiştirilmedi.

- [ ] Canlıya alma ertelensin; aynı ofis Wi‑Fi ağındaki üç aktif kullanıcıyla bir günlük kontrollü kabul testi yapılsın.
- [ ] Üç kullanıcı için login/rol, müşteri-kira veri girişi, sözleşme kodu, komisyon, hassas veri maskesi ve ana PC bağlantısını kontrol et.
- [ ] Ana PC’de test öncesi ve sonrası şifreli yedek al; test verisinin gerçek müşteri kayıtlarıyla karışmadığını ve tekrar kayıt oluşmadığını doğrula.
- [ ] Windows 1.0.22/AppData ve Defender sınırlarını bozmadan mevcut kurulumla kabul testi yap; bu aşamada yeni imzasız EXE/ZIP üretme.

- [x] Sözleşme numaralarında danışman kodunu görünür ve değişmez kullan: `CT1-001`, `KT1-001`, `IP1-001`; numara üretimi, sözleşme/PDF görünümü, arama ve audit kayıtlarında düzenleyen danışmanla eşleşsin. Contracts ekranında `{item.contractNo}` listeleniyor, `window.print()` yazdırılabilir belge görünümünü koruyor; server audit özeti `contractNo`, danışman kodu ve atanan kullanıcıyı birlikte kaydediyor. `contractNumberPolicy.test.ts` 2/2 geçti.

- [x] Yeni danışman onboarding akışı: broker manager danışman hesabı açabilsin, geçici tek kullanımlık parola üretilsin, ilk girişte parola değişimi zorunlu olsun; mevcut Manus OAuth kullanıcıları korunarak yerel login katmanı güvenli biçimde tasarlandı ve uygulandı. Cahit’in gerçek cihazındaki ilk login/parola değişimi kullanıcı kabul adımı olarak ayrı açık.
  - [x] Yerel kimlik bilgileri için parola hash’i, geçici parola son kullanma zamanı, tek kullanımlık durum, ilk giriş zorunluluğu ve başarısız deneme/oturum audit alanlarını ekle. `localLoginCredentials` ve `localLoginSessions` tabloları 0029/0031 migration ile uygulandı; scrypt hash, 24 saatlik geçici parola süresi, `temporaryPasswordUsedAt`, 5 denemede 15 dakika kilit ve auth audit olayları kullanılıyor.
  - [x] Broker manager’ın yeni danışman hesabı oluşturma prosedürünü uzun login adı ve otomatik kısa kod üretimiyle bağla. `team.createLocalConsultant` manager-only prosedürü `consultantIdentity` yardımcısını kullanıyor.
  - [x] Yerel login, logout, geçici parola reddi ve ilk giriş parola değiştirme akışlarını uygula; Manus OAuth kullanıcılarını değiştirme. Yerel session cookie’si OAuth cookie’sinden ayrıdır; tRPC context ve contract document download fallback’i ile korunur.
  - [x] Onboarding ekranı, güvenli geçici parola gösterimi ve parola değişikliği ekranını ekle. Team ekranı manager-only onboarding kartını, dashboard login ekranı ilk giriş parola değişimini ve manager’ın yeni geçici parola yenilemesini içeriyor.
  - [x] Güvenlik, rol, CT1/CT2 kodlama, tek kullanımlık parola ve ilk giriş testlerini yazıp çalıştır. `localAuthPolicy.test.ts`, logout, belge indirme ve identity testleri 9/9 odaklı başarılı; gerçek Cahit hesabı/merkezi veri login kabulü ayrıca açık.
  - [x] Uzun login adını `K-TASLIARMUT`, `I-PARIN`, `C-TERCAN` biçiminde normalize et; login/kısa kod kimliklerinde İngilizce uyumlu noktasız `I` kullan; kısa kodu baş harfleri + kullanılmayan en küçük sıra numarası olarak üret (`KT1`, `IP1`, `CT1`, `CT2`, `CT3`). `consultantIdentity` yardımcı ve regresyon testleri hazır.
  - [x] Aynı kısa kod veya uzun login adının tekrar atanmasını engelle; eski kodları yeniden kullanma, noktalı `İ` ile noktasız `I` çakışmalarını tek kimlik standardında çöz ve audit kaydı oluştur. Hesap oluşturma audit’i ve unique login/kod kontrolleri uygulanıyor.

- [x] CT1’den alınan 19 aktif kira kaydını, kullanıcı tarafından belirtilen boş alanları boş bırakarak Aktif Kiralamalar aktarım formatına dönüştür, hassas telefonları güvenli aktarım kuralıyla işle ve veri doğrulaması yap. Gerçek merkezi aktarım, authorityCode migration ve 1/1 authorityCode regresyon testi tamamlandı; yalnız Cahit’in gerçek cihazdaki ilk login kabulü açık.
  - [x] Cahit Tercan / CT1 / Terpa Gayrimenkul danışman profilini tam yetkili ve login yapabilen danışman hesabı olarak oluştur; IP1/İbrahim Parin Broker kaydına dokunma. Gerçek kullanıcı hesabı `34950018`, login `C-TERCAN`, local openId `local:C-TERCAN` olarak oluşturuldu.
  - [x] CT1 hesabının login, danışman rolü, müşteri/aktif kira atamaları ve kendi kayıtlarına erişimini doğrula. Hesap `active` danışman profili ve 19 kaydın `assignedUserId=34950018` eşleşmesi okuma sorgusuyla doğrulandı; gerçek ilk giriş kabulü kullanıcı cihazında ayrıca yapılacak.
  - [x] CT1 anlaşma snapshot’ını %70 danışman / %30 ofis olarak oluştur; yetki kodunu 3500211/003 olarak kaydet. Anlaşma profili id=1, %70/%30, masa bedeli 0 ve active olarak kaydedildi; yetki kodu 19 aktif kira satırında saklandı.
  - [x] Önizleme, CT1 danışman eşleşmesi ve zorunlu alan doğrulamasını tamamla. Dry-run 19/19 satır, CT1, userId 34950018 ve authorityCode 3500211/003 doğrulandı.
  - [x] Onaylı 19 kaydı merkezi Aktif Kiralamalar tablosuna aktar ve tekrar kayıt kontrolü yap. `imported=19`, `createdClients=19`, unique fingerprint 19/19; IP1 kaydı değiştirilmedi.
  - [x] Telefon maskesi/şifreli kasa ve boş tahliye alanlarını aktarım sonrası doğrula. 19 kiracı telefonu, 19 müşteri telefonu maskeli; toplam 38 vault kaydı ve 19/19 authorityCode doğrulandı. Kullanıcının boş bıraktığı tahliye tarihleri boş kaldı; Sakız Ağacı Anaokulu satırındaki 01.07.2037 korundu.

Bu dosya yalnızca **bugün açık olan ve tekrar etmeyen** işleri içerir. Önceki ayrıntılı görev geçmişi `todo-archive.md` ve `todo-history-2026-08-29.md` içinde korunmaktadır; hiçbir geçmiş kayıt silinmemiştir.

## 1. Güvenli Windows / Electron kabulü — dağıtım durduruldu

- [x] Defender’ın `Trojan:Script/Wacatac.H!ml` algıladığı 1.0.23 EXE, ZIP ve BAT dosyalarını geçersiz kabul etmeyi sürdür; bu dosyaları yeniden üretme, gönderme, geri yükletme, izin verme veya güvenlik korumasını aşma yönlendirmesi yapma. Bu süreçte yeni EXE/ZIP/BAT üretilmedi veya dağıtılmadı.
- [x] Kullanıcının mevcut 1.0.22 kurulumu ve `%APPDATA%\Global 1881 Gayrimenkul` verilerini değiştirmeden koru. Web geliştirme ve migration işlemleri bu Windows kurulumuna/AppData’ya dokunmadı.
- [x] Gelecekte offline Windows dağıtımı yeniden ele alınırsa yalnız gerçek Windows ortamında oluşturulan, bağımsız güvenlik incelemesinden geçmiş ve kullanıcı kabulü için tek toplu paket yaklaşımını değerlendir; bu karar oluşmadan paket üretme. Karar: yeni offline paket üretilmeyecek; mevcut 1.0.22 korunacak ve merkezi web/LAN kabulü tercih edilecek.
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
- [x] ExcelJS üzerinden gelen `uuid@8.3.2` advisory’sini gerçek uyumlu bir düzeltmeyle kapat; ExcelJS üretim/test bağımlılıklarından kaldırıldı ve `pnpm why uuid` artık boş. `read-excel-file@9.3.10` üretim parserı ve `write-excel-file@4.1.1` test fixture üretimi kullanılıyor.
- [x] ExcelJS yerine bakımı süren ve advisory zincirini taşımayan bir Excel kütüphanesine geçişi veya upstream uyumlu ExcelJS/uuid düzeltmesini teknik olarak değerlendir; Aktif Kiralamalar parserı, 19 satırlık CT1 aktarımı ve Excel export regresyonları 7/7 odaklı testle korundu.
- [x] Güvenli bağımlılık düzeltmesi uygulanırsa `pnpm why uuid`, `pnpm audit`, tam test, TypeScript ve production build ile uuid advisory’sinin kalktığını kanıtla; uuid ağacı boş, 110 dosya/309 test, TypeScript ve production build başarılı. Audit’te uuid/ExcelJS bulgusu artık yok.
- [ ] Kalan bağımlılık audit bulgularını ayrı planla: production `qs` artık patched `6.16.0`; paketleme `fast-uri`/`js-yaml`, tar/Vite/PostCSS, browserslist ve Vitest zincirleri patched sürümlere çekildi. `pnpm audit --prod --audit-level=moderate` sonucu 0 critical/high/moderate/low; genel auditte yalnız dev-only `drizzle-kit > @esbuild-kit/core-utils > esbuild@0.18.20` ve düşük Babel/esbuild kayıtları açık. Kontrollü dev-only istisna güvenlik dokümanına işlendi; Drizzle upstream uyumlu çözüm yayımlandığında yeniden değerlendirilecek.
  - [x] Production dependency güvenlik taramasını temiz sonuçla doğrula: `AUDIT_PROD_EXIT=0`, tüm seviyeler 0.
  - [ ] Dev-only drizzle-kit/esbuild ve düşük Babel/esbuild advisory’lerini upstream uyumlu sürüm geldiğinde kapat; `drizzle-kit` 0.31.10’a yükseltildi, ancak `@esbuild-kit/esm-loader@2.6.5 → core-utils@3.3.2 → esbuild@0.18.20` zinciri ve plugin-react 5 içindeki `@babel/core@7.28.4` sürdüğü için advisory açık. Vite 7 uyumluluğunu bozacak plugin-react 6/Vite 8 major geçişi ve etkisiz nested override uygulanmadı. Kontrollü dev-only istisna korunuyor.
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

- [x] Ofislerarası komisyon oranlarını sabit 50/50 ile sınırlama: iki ofiste %50/%50, üç eşit paydaşta %33/%33/%33 veya imzalı anlaşmaya göre değişken oranları destekle; toplam %100, taraf/ofis adı, işlem büyüklüğü, anlaşma tarihi, geçerlilik dönemi, gerekçe ve manager onayıyla snapshot/audit sakla. OnlineCommissions, commissionTransactions snapshot/audit, 0033 migration ve dönem çakışması kontrolü tamamlandı.
  - [x] Manager-only özel paydaş oranı girişini OnlineCommissions ekranına bağla; oranların toplamı %100 değilse kayıt butonunu kapat.
  - [x] Hesap çekirdeğinde paydaş oranı override’ı, %33,33/%33,33/%33,34 örneği ve geçersiz toplam oran kontrolünü uygula; paydaş oranları işlem katılımcı snapshot’ında ve manager gerekçesi audit akışında korunuyor. Odaklı komisyon testleri 20/20 başarılı.
  - [x] İmzalı dış ofis anlaşmasının referansını, imza/geçerlilik tarihlerini merkezi transaction snapshot’ına ekle; dış ofis payı olan işlemde manager gerekçesi ve metadata zorunlu, bitiş-başlangıç sırası ve aynı dış ofis için dönem çakışması server tarafında reddediliyor. 0033 migration ve audit özeti tamamlandı.
- [x] Danışman ayrılışında portföy ve hakları tarihsel koru: ayrılmadan önce kazanılmış veya portföy döneminde oluşmuş komisyon hakkı eski danışmana bağlı kalsın; ayrılıştan sonraki yeni işlemlerde manager onaylı sorumlu danışman/ofis ataması yapılabilsin; müşteri Global 1881’de kalırsa portföy devri eski kesinleşmiş hakları değiştirmesin. `portfolioRightsTransfers` tablosu, manager-only tRPC oluşturma/listeleme/onay akışı ve Team paneli eklendi; onay eski snapshot’ları değiştirmeden müşteri/mülk sorumlusunu yeni danışmana günceller veya hak sahibini ofiste bırakır.

- [x] Ayrılan danışmanın bireysel portföyündeki açık işlem için eski danışman hak snapshot’ını koru; işlemi tamamlayan yeni danışmanla kararlaştırılan %50 paylaşımı ayrı hesapla. Müşteriyi yeni danışman veya ofis bulduysa Global %40 ofis payını ve eski danışmanın korunmuş hakkını geriye dönük değiştirme. Sunucu motoru payout snapshot alanlarını ve %50/%50 hesabını uygular.
- [x] Kurumsal ofis portföyünde yetki süresi sonuna kadar portföy/komisyon hakkını ofiste tut; ofisin danışmana ödeme yapmama seçeneğini ayrı anlaşma politikası olarak kaydet ve yeni danışman/portföy devrini manager onaylı tarihsel kayıtla yürüt.

- [x] Bireysel danışman portföyü ayrılış formülünü uygula: 100.000 TL örneğinde Global %40 = 40.000 TL korunur; danışman havuzu %60 = 60.000 TL eski ve yeni danışman arasında %50/%50 bölünür; her biri 30.000 TL snapshot hakkı alır. Yeni danışman yalnız işlemi gerçekleştiren kişiyse pay kazanır. Server/client kabul testleriyle doğrulandı.
- [x] Kurumsal ofis portföyü formülünü uygula: yetki süresi sonuna kadar portföy/komisyon hakları ofiste kalabilir; ofis danışmana ödeme yapmama veya anlaşmadaki ödeme seçeneğini tarihsel snapshot olarak saklar. Portföy devri eski kesinleşmiş ofis hakkını değiştirmez. `corporateOfficePaysConsultant=false` sunucu hesaplamasına bağlandı.
- [x] Ayrılış payout snapshot’ı için eski danışman, yeni danışman ve kurumsal ofis tutarlarını merkezi transaction alanlarında sakla; 0028 migration uygulandı, sunucu hesap motoru ve kabul testleri tamamlandı. `originatingConsultantPayout`, `fulfillingConsultantPayout` ve `rightsOfficePayout` alanları eklemeli ve varsayılan 0 değerleriyle eski kayıtları koruyor.
- [x] Değişken oran anlaşması için tek ve açık snapshot modeli ekle: taraf/ofis adı, anlaşma referansı, işlem büyüklüğü eşiği veya kapsam notu, imza tarihi, geçerlilik başlangıç/bitişi ve manager onayı aynı transaction kaydında doğrulanabilir olsun. 0035 migration; partyName, scopeNote, min/max fee, imza/geçerlilik tarihleri, manager override gerekçesi ve audit özetiyle tamamlandı.
- [x] Değişken oran anlaşmasının server kabul testini genişlet: taraf/ofis adı, işlem büyüklüğü metadata’sı, audit kaydı ve dönem çakışması reddi aynı senaryoda doğrulansın. Server/UI odaklı 10/10 test geçti; tsc başarılı.
- [x] Güvenlik bağımlılığı: `exceljs@4.4.0 > uuid@8.3.2` zincirini güncel advisory, kullanılma biçimi ve uyumluluk açısından incele; yalnız güvenli ve desteklenen düzeltmeyi uygula, aksi halde zorla override yapmadan kontrollü istisnayı dokümante et. CVE-2026-41907/GHSA-w5hq-g745-h8pq değerlendirildi; doğrudan uuid kullanımı yok, pnpm override etkisiz/uyumsuz olduğu için kaldırıldı ve kontrollü istisna notu yazıldı.
- [x] Güvenlik bağımlılığı düzeltmesi/istisnası sonrası pnpm audit, tam test, TypeScript ve production build sonuçlarını kaydet. `pnpm audit` uuid advisory’sini `exceljs@4.4.0 > uuid@8.3.2` olarak doğruladı; 2/2 policy testi, tam test 112 dosya/309 test, TypeScript ve production build başarılı. Kontrollü istisna notu `docs/SECURITY-DEPENDENCY-UUID-EXCEPTION.md` içinde; uuid advisory’si upstream uyumlu düzeltme çıkana kadar açık kalıyor.
- [x] Dev-only esbuild/Babel audit açığını kapatma çalışması: advisory zincirini upstream sürümleriyle doğrula, yalnız uyumlu yükseltmeyi uygula; uyumsuzsa override kullanmadan gerekçeli istisnayı güncelle. Uyumlu yükseltme bulunmadı; plugin-react 6/Vite 8 major geçişi ve nested override’lar uygulanmadı. Dev-only istisna güvenlik notunda gerekçelendirildi.
  - [x] `drizzle-kit`, `@esbuild-kit`, `esbuild`, `@vitejs/plugin-react`, `@babel/core`, Vite ve Vitest sürüm/peer uyumluluğunu kontrol et. `drizzle-kit` 0.31.10, Vite 7.3.5, Vitest 4.1.11, plugin-react 5.0.4 ve nested Babel/esbuild zincirleri doğrulandı; plugin-react 6/Vite 8 major geçişi mevcut uyumluluk için uygun değil.
  - [x] Güvenli yükseltme uygulanırsa tam test, TypeScript, production build ve `pnpm audit --prod` sonuçlarını doğrula. Uyumlu yükseltme uygulanmadı; mevcut kilitli durumla 112 dosya/309 test, TypeScript, production build ve `pnpm audit --prod` 0 bulgu doğrulandı.

## 5. 09.09.2026 proje sürekliliği yedeği

- [x] Proje kaynak kodu, docs, schema/migrations, package.json/lockfile, testler ve LAN/acceptance yönergelerini sürüm manifestiyle birlikte arşivle. AES-256 ZIP içinde 458 proje dosyası ve son todo kapsamı bulunuyor.
- [x] Gizli env değerlerini, JWT/API anahtarlarını ve parolaları ZIP içine düz metin koymadan geri yükleme/secret envanteri oluştur; gerçek değerleri kullanıcıya istemeden dışarı aktarma. Kullanıcının mevcut anahtarıyla AES-256 kilitlendi; anahtar ZIP’e veya manifest’e yazılmadı.
- [x] Merkezi veritabanı ve yüklenmiş dosyaların erişilebilir yedek kapsamını kontrol et; mevcut güvenli yöntemle alınabilenleri ayrı veri arşivine koy, erişilemiyorsa açıkça raporla. Kullanıcı yükleme/kanıt dosyaları arşive alındı; merkezi MySQL dumpı bağlantı/transaction kısıtı nedeniyle üretilemedi ve restore notunda açıkça belirtildi.
- [x] Arşivleri SHA-256 bütünlük manifesti, dosya listesi ve geri yükleme rehberiyle doğrula; ZIP’i kullanıcıya teslim et ve mevcut checkpoint’i referansla. AES-256 ZIP açma doğrulaması geçti; SHA-256: `4c048e4bf9184e29a84b71bbdddfe2567b6ff7822b08672b28806fac488bf712`.
- [x] Nihai ZIP’i kullanıcının mevcut gizli anahtarıyla AES-256 şifrele; anahtar sohbetten alınmayacak, arşiv açma testi yapılacak, anahtar dosyaya veya manifest’e yazılmayacak. `global1881-backup-20260909T205948Z-AES256.zip` üretildi ve aynı anahtarla 499 dosya açma testi geçti.

## 6. Satış kapama ve kat karşılığı doldurulabilir formları

- [x] Satış kapama formu için genel sözleşme bölümü, teknik şartname bölümü ve standart doldurulabilir alanları tasarla. Satıcı/alıcı, satış bedeli, taşınmaz, tapu, ödeme, devir ve teknik not alanları hazır.
- [x] Kat karşılığı formu için genel sözleşme bölümü, teknik şartname bölümü ve standart doldurulabilir alanları tasarla. Arsa sahibi/yüklenici, arsa payı, proje, taşınmaz, ödeme, teslim ve teknik not alanları hazır.
- [x] Satıcı ve alıcı için ayrı ayrı isteğe bağlı ek madde girişleri oluştur; madde sahibi, başlık, metin, sıra ve aktif/pasif durumunu destekle. Kat karşılığı için arsa sahibi/yüklenici kapsamları da eklendi.
- [x] Doldurulan isteğe bağlı maddeleri sözleşme önizlemesine ve çıktısına yalnızca aktif olduklarında dahil et; boş maddeleri çıktıda gösterme. Backend preview ve manager ekranı yalnız yayınlanmış, dolu maddeleri gösteriyor.
- [x] Yönetici onayı, değişiklik geçmişi ve hukuki metinlerin taslak/revizyon durumunu koruyacak doğrulama akışını değerlendir. Şablon ve ek madde için taslak/inceleme/yayın/arşiv durumları ile audit kayıtları eklendi.
- [x] Yeni formlar için backend, UI, çıktı ve regresyon testlerini yaz; kullanıcı metinleri geldikten sonra gerçek maddeleri sisteme aktar. Backend, UI, preview modeli ve regresyon testleri tamamlandı; gerçek maddelerin aktarımı ayrı açık görev olarak korunuyor.
- [x] Satış Kapama ve Kat Karşılığı form altyapısını hukuki metinlerden bağımsız olarak başlat: form türü, bölüm sırası, doldurulabilir alan grupları, teknik şartname bölümü ve taslak/revizyon durumu. Şablon, bölüm, alan ve revizyon tabloları; tRPC işlemleri ve manager ekranı eklendi.
- [x] Taraf bazlı isteğe bağlı ek maddeler için satıcı/alıcı/arsa sahibi/yüklenici ayrımını, başlık-metin-sıra-aktiflik-onay alanlarını ve çıktı sıralamasını tasarla. Taslak/aktif/arşiv durumu, taraf kapsamı, sıralama ve yalnız aktif maddeleri çıktı adayına alma kuralı uygulandı.
- [ ] Örnek sözleşme metinleri geldiğinde gerçek maddeleri bu altyapıya bağla; mevcut metinler gelmeden hukuki madde veya örnek veri uydurma.

## 7. Eski satış sözleşmesi formu incelemesi
- [ ] Eski satış sözleşmesi metninde mükerrer, çelişkili, tarih/hesap/atıf hatalı ve eksik alanları kullanıcıya değişiklik yapmadan raporla.
- [ ] Kullanıcı onayından sonra kabul edilen maddeleri Alım-Satım Ön Protokolü formuna aktar; onay gelmeden sözleşme metnini veya sistemi değiştirme.
- [x] Eski form incelemesinde kişi adları, T.C. kimlik numaraları, IBAN, telefon ve gerçek taşınmaz bilgilerini yok say; yalnız anonim alan yapısı ve madde mantığı üzerinden çalış. Tüm inceleme anonim alanlar ve madde mantığı üzerinden yürütüldü.
- [x] Kişisel veriler çıkarılmış Madde 1–4 humanizer metinleri kullanıcı tarafından onaylandı; Madde 4 yalnız toplam %4 tapu harcı ile döner sermaye bedelini kapsıyor, başka resmi gider eklenmedi.
- [x] Madde 5’i eski anonim metin ve humanizer önerisi olarak karşılaştır; kullanıcı onayı olmadan kesinleştirme. Kullanıcı A seçeneğini onayladı: yalnız cümle yapısı sadeleştirildi, kapora/cayma sonuçları bu maddede genişletilmedi.
- [x] Madde 6’yı eski anonim metin ve humanizer önerisi olarak karşılaştır; Madde 4 ile mükerrerliği birlikte değerlendir. Kullanıcı onayladı; Madde 6 ayrı madde olarak kaldırılacak ve hüküm Madde 4’te tek kez korunacak.
- [x] Madde 7’yi eski anonim metin ve humanizer önerisi olarak karşılaştır. Kullanıcı onayladı.
- [x] Madde 12’yi eski anonim metin ve humanizer önerisi olarak karşılaştır. Kullanıcı onayladı; vekâlet ve yetkisiz temsil sorumluluğu iki paragraflı humanizer biçiminde korunacak.
- [x] Madde 13’ü eski anonim metin ve humanizer önerisi olarak karşılaştır. Kullanıcı onayladı; alıcının tescil kişisinden bağımsız borç ve şahsi sorumluluk hükmü korunacak.
- [x] Madde 14’ü eski anonim metin ve humanizer önerisi olarak karşılaştır; emlak komisyoncusunun sözleşmedeki konumunu ve sorumluluk sınırını değerlendir. Kullanıcı onayladı.
- [x] Madde 15’i eski anonim metin ve humanizer önerisi olarak karşılaştır; resmi şekil, cayma akçesi ve hizmet bedeli ifadelerini değerlendirmeye al. Kullanıcı A seçeneğini onayladı; resmi şekil eksikliği gerekçesiyle geçersizlik ileri sürülmemesi korunacak, geniş feragat cümlesi kesin metne alınmayacak.
- [ ] Madde 16’yı eski anonim metin ve humanizer önerisi olarak karşılaştır; nüsha sayısı ve vergi/resim/harç giderlerinin taraflara dağılımını değerlendir.
- [x] Madde 8’i eski anonim metin ve humanizer önerisi olarak karşılaştır. Kullanıcı B seçeneğini onayladı; Madde 1–2’deki satış iradesi tekrarı çıkarılacak, aracılık hizmeti Madde 9 ile birlikte değerlendirilecek.
- [x] Madde 9’u eski anonim metin ve humanizer önerisi olarak karşılaştır; Madde 8’in aracılık hizmeti bölümüyle birleştirme seçeneğini değerlendir. Kullanıcı onayladı; aracılık hizmeti ve hizmet bedeline hak kazanma hükmü tek maddede korunacak.
- [x] Madde 10’u eski anonim metin ve humanizer önerisi olarak karşılaştır. Kullanıcı onayladı; toplam %4 + KDV komisyon %2 + KDV Alıcı/%2 + KDV Satıcı olarak paylaşılacak ve ödeme tapu devri tamamlandıktan sonra yapılacak.
- [x] Madde 11’i eski anonim metin ve humanizer önerisi olarak karşılaştır; cayma, komisyon ve tarih hükümlerini ayrı değerlendir. Komisyon vazgeçen tarafa, cayma bedeli ise protokole yazılacak sabit tutar alanına bağlandı.
- [x] Madde 11’de kullanıcı kararı kaydedildi: vazgeçen taraf toplam %4 + KDV komisyonu ödeyecek; “cayma bedelinin iki katı” yerine protokole doğrudan yazılacak sabit `[cayma bedeli] TL` alanı kullanılacak.
- [x] Madde 11’de son tapu devir tarihi ile Madde 7 tarih aralığı arasındaki seçim netleştirilecek. Kullanıcı tek ve doldurulabilir `[son tapu devir tarihi]` alanını seçti.
- [x] Madde 11 form alanlarını tanımla: tek `[son tapu devir tarihi]` ve doğrudan protokole yazılacak `[cayma bedeli] TL`; Alıcı/Satıcı yurtiçi-yurtdışı durumu görüşmede belirleneceği için varsayılan form alanına alınmadı.
- [x] Madde 11 sabit cayma bedeli için Alıcı ve Satıcı ayrı onayları, onay tarihi ve audit kaydı gerektiren form akışını tasarla. Kullanıcı, ayrı onay açıklamasının metinde yer almasını istemedi; tutar görüşmede belirlenip doğrudan protokole yazılacağı için ayrı alan akışı uygulanmadı.
- [x] Madde 11 cayma bedeli metninde tarafların görüşme/onay sürecini açıklayan ifade kullanılmayacak; yalnızca protokole yazılacak `[cayma bedeli] TL` tutar alanı bulunacak.
- [x] Madde 11’in tek son tapu tarihi ve görüşmede belirlenecek yurtiçi/yurtdışı durumu yaklaşımıyla nihai form taslağını kullanıcı onayına sun. Kullanıcı `aynen` diyerek kabul etti; son kararla yurtiçi/yurtdışı alanları varsayılan formdan çıkarıldı.
- [x] Satış Kapama form başlığını `ALIM-SATIM ÖN PROTOKOLÜ` olarak güncelle. UI etiketi ve şablon oluşturma ekranı güncellendi.
- [x] Görüşmede tespit edilecek Alıcı/Satıcı yurtiçi-yurtdışı, ülke, tebligat ve vekâlet alanlarını sözleşme formunun varsayılan alan setinden çıkar; bunları madde metnine otomatik aktarma. Varsayılan Satış Kapama alan setinde bulunmuyor ve metne otomatik eklenmiyor.
- [x] İlgili kanun ve yönetmelik atıflarını eski metinden koru; doğrulama yapılmadan kaldırma veya sessizce değiştirme. Nihai formda `İlgili kanun ve yönetmelik atıfları` alanı eklendi; eski metin atıflarının madde bazlı aktarımı sonraki maddeler incelenirken korunacak ve doğrulama notuyla tutulacak.
- [ ] Dev-only drizzle-kit/esbuild ve Babel advisory’leri için kontrollü istisna kaydını açık tut; upstream uyumlu sürüm yayımlandığında yeniden değerlendir ve güvenlik dokümanını güncelle.
- [ ] Genel auditte kalan dev-only advisory’ler için her bağımlılık güncellemesi veya en geç 90 günde bir yeniden kontrol yap; `pnpm audit --prod --audit-level=moderate` temizliğini koru.

## 8. Alım-Satım Ön Protokolü bütünsel eksiklik kontrolü

- [ ] Onaylı maddeler ile form alanlarını karşılaştır: taraflar, taşınmaz, bedel, ödeme, dekont/teslim kanıtı, tapu, gider, komisyon, cayma, vekâlet, tescil, nüsha, uyuşmazlık, imza ve ekler.
- [ ] Eksik veya belirsiz hususları yeni madde eklemeden önce kullanıcı kararına sun; mükerrer ve çelişkili hükümleri ayrı işaretle.
- [ ] Kanun/yönetmelik atıflarının korunmasını, güncel doğrulama yapılmadan silinmemesini ve atıf alanının formda kalmasını kontrol et.
- [x] Eksiklik kontrolünü ofis iş akışına göre daralt: teslim/anahtar maddesi ekleme; aidat/vergi/abonelikleri mevcut haliyle bırak; takyidat ve borç kontrolünü sözleşme öncesi kontrol olarak tut ve uygun değilse protokol oluşturma.
- [x] Takyidat/borç ön kontrolünü sözleşme metnine otomatik aktarma; satıcı sorumluluğu yaklaşımını yalnız ofis içi hazırlık notu olarak koru. Checklist metne aktarmıyor; yalnız audit’e hazırlık kontrolü olarak kaydediyor.

## 9. Alım-Satım Ön Protokolü hazırlık kontrolü

- [x] Protokol formu açılırken danışmana kırmızı uyarı paneli göster: sözleşme metnine eklenmeyen, yalnız hazırlık aşamasında kontrol edilen işlemler açıkça ayrı tutulsun. Panel form şablon ekranına bağlandı.
- [x] Zorunlu kontrol maddelerini belirle: taraf/taşınmaz bilgilerinin doğrulanması; takyidat ve borç ön kontrolünün tamamlanması; toplam satış bedeli, tapu işlem tutarı, kapora ve bakiye uyumu; sabit cayma bedeli; komisyon oranı ve ödeme zamanı; vekâlet varsa belge kontrolü; havale dekontu/nakit teslim belgesi planı. Sabit %4 tapu harcı ve döner sermaye kontrol listesine alınmayacak, yalnız Madde 4’te kalacak. Sekiz değişken kontrol maddesi ortak sabite alındı.
- [x] Tüm kontroller işaretlenmeden protokol kaydı ve yazdırılabilir çıktı işlemlerini engelle; uyarı mesajını açık ve erişilebilir göster. Server `assertContractPreparationComplete` kapısı ve kırmızı UI durumu bağlandı.
- [x] Kontrol işaretlerini kullanıcı, zaman ve protokol taslağıyla birlikte audit kaydına al; bu kayıtlar sözleşme maddelerine otomatik eklenmesin. Her kaydetmede kullanıcı, taslak anahtarı, tamamlanma sayısı ve zaman audit’e yazılıyor.
- [x] Alım-Satım Ön Protokolü hazırlık kontrolü için backend, UI ve regresyon testlerini yaz. Checklist birim testleri 6/6 geçti; TypeScript doğrulandı.

## 10. Danışman checklist görünürlüğü
- [x] Alım-Satım Ön Protokolü ön kontrol checklist’ini danışmanların görebileceği akışa taşı; manager-only kısıtını yalnız şablon yayınlama/audit işlemlerinde koru. Menü erişimi tüm authenticated kullanıcılara açıldı; manager işlemleri UI/backend’de korundu.
- [x] Checklist backend okuma/kaydetme/tamamlama yetkisini yetkili danışmanlara aç; şablon yönetimi prosedürlerini manager-only bırak. Checklist protectedProcedure, şablon yönetimi adminProcedure olarak ayrıldı.
- [ ] Başarılı danışman login’i sonrası kırmızı panelin görünürlüğünü ve kayıt/çıktı kapısını test et.

## 11. Sözleşme ve teknik şartname ayrımı
- [ ] Alım-Satım Ön Protokolü kalan maddelerini, nihai numara ve başlık düzenini tamamlamadan önce incele.
- [ ] Kat Karşılığı genel sözleşmesini ayrı şablon olarak tut; metin kullanıcı tarafından yüklenmeden kesin madde ekleme.
- [ ] Kat Karşılığı teknik şartnamesini genel sözleşmeden ayrı başlık/şablon olarak tut; malzeme, marka/model ve kalite alanlarını bağımsız tasarla.
- [ ] Alım-Satım Ön Protokolü ile teknik şartnameyi çıktı ve ekler yapısında birbirine karıştırma; teknik şartnameyi gerektiğinde ayrı ek belge olarak ilişkilendir.
- [x] Özel maddelerde talep sahibi tarafı (Alıcı/Satıcı/arsa sahibi/yüklenici), görünür ad/unvanı ve `... talebi üzerine protokole eklenmiştir` dipnotunu destekle; audit’te ekleyen danışman, tarih-saat ve yayın durumunu ayrıca sakla.
- [x] Özel madde dipnotunu çıktı üzerinde göster; ayrıntılı audit bilgisini yalnız yetkili kullanıcıya göster ve özel maddeleri Madde 17 bölümünde sıralayıp sonraki maddeleri dinamik numaralandır.
- [x] Özel madde modeline talep sahibi görünür adı/unvanı, talep sahibi tarafı ve çıktı dipnoti alanlarını ekle; örnek dipnotu `Bu madde, [taraf] [ad/unvan] talebi üzerine protokole eklenmiştir.` biçiminde üret.
- [x] Özel maddeleri çıktı modelinde Madde 17 bölümünde sıralı göster; yetkili mahkeme ve madde sayısı hükümlerini özel maddelerden sonra dinamik numaralandır.
- [x] Özel madde dipnotu ve ayrıntılı audit bilgisi için schema, router, UI ve regresyon testlerini güncelle; Kat Karşılığı ve teknik şartname ayrımını koru.

## 12. Kullanıcıdan gelecek genel sözleşme metni

- [ ] Genel sözleşme parçalarını sıra ve madde bütünlüğünü koruyarak teslim al; eksik veya tekrarlanan parça varsa kullanıcıya bildir.
- [ ] Her maddeyi kişisel bilgilerden arındırarak mevcut metin ve önerilen humanizer metni şeklinde karşılaştır; kanun/yönetmelik atıflarını kullanıcı onayı olmadan kaldırma.
- [ ] Kullanıcının açık onayını almadan yeni hukuki maddeyi kesinleştirme veya sisteme aktif madde olarak yayınlama.
- [ ] Onaylanan genel sözleşme maddelerini doldurulabilir alanlardan, isteğe bağlı özel maddelerden ve ayrı teknik şartname ekinden ayırarak form şablonuna aktar.
- [ ] Genel sözleşme aktarımı sonrasında dinamik madde numarası, talep sahibi dipnotu, kırmızı hazırlık checklist’i, çıktı önizlemesi, audit ve regresyon testlerini doğrula.

## 13. Kullanıcı kabulü bekleyen operasyonel işler

- [ ] Ofiste IP1, KT1 ve CT1 ile LAN bağlantısı, login, rol görünürlüğü ve maskeli veri kabulünü gerçek cihazlarda doğrula.
- [ ] Kat Karşılığı genel sözleşmesi ve teknik şartname kaynak metinleri sağlandığında ayrı şablon/ek belge olarak aktar.
- [ ] Kullanıcı DNS sağlayıcı bilgilerini ve açık geçiş onayını verdiğinde ofis.global1881.com alan adı bağlantısını başlat ve HTTPS kabulünü yap.

## 14. Mutabık Kat Karşılığı Genel Sözleşmesi aktarımı

- [ ] Kullanıcının mutabık kaldığı arsa payı karşılığı inşaat ve gayrimenkul satış vaadi sözleşmesini 21 madde ve 5 ek yapısıyla kaynak metin olarak kaydet.
- [ ] Taraf adları, T.C. kimlik numaraları, adresler, e-posta adresleri, noter ve yevmiye bilgileri ile şirket/temsilci kişisel bilgilerini sabit metinden çıkar; bunları doldurulabilir alanlara dönüştür.
- [ ] Taşınmaz, proje, bağımsız bölüm paylaşımı, etaplı devir, ruhsat, teslim, gider, cezai şart, fesih, tebligat ve uyuşmazlık alanlarını Kat Karşılığı Genel Sözleşmesi şablonuna bağla.
- [ ] Teknik Şartname, Numarataj Krokisi, Yönetim Planına Dercedilecek Hükümler, vekâletname ve imza sirkülerini ayrı ek/şablon olarak modelle; ekleri genel sözleşme metnine karıştırma.
- [ ] Kaynak metindeki mutabık hükümleri anlamını değiştirmeden form çıktısına aktar; yalnız kişisel veri yer tutucuları ve doldurulabilir alanları uygula.
- [ ] Özel maddeler, talep sahibi dipnotu, audit, manager yayınlama akışı ve Kat Karşılığı formunun satış protokolünden ayrı çalıştığını doğrula.
- [ ] Kat Karşılığı Genel Sözleşmesi için regresyon testleri, TypeScript, production build ve görsel çıktı doğrulaması yap.

- [ ] Kat Karşılığı formunda gecikme bedeli, cezai şart, para birimi, mücbir sebep süresi, garanti süresi, fesih ihtar süresi, noter harç matrahı ve diğer proje/anlaşma bazlı mali-süre koşullarını varsayılan değer olmadan doldurulabilir alanlar olarak tut; kaynak metindeki rakamları otomatik önceden doldurma.

## 15. Teknik şartname malzeme alanları ve boşluk uyarısı

- [ ] Teknik şartnamedeki mevcut malzeme/imalat içeriklerini fikir veren silüet metin olarak koru; bunları proje için kesinleşmiş değer veya otomatik seçilmiş malzeme kabul etme.
- [ ] Malzeme, marka/model, kalite, renk ve imalat alanlarını doldurulabilir yap; alan boş bırakıldığında çıktı kutusunu boş göster.
- [ ] Boş zorunlu teknik alanları form ekranında kırmızı uyarı ile göster ve doldurulması gerektiğini açıkça belirt.
- [ ] Teknik şartname zorunlu alanları tamamlanmadan formu tamamlandı/yayınlanabilir statüye geçirme; eksik alanları audit ve doğrulama akışında belirt.
- [ ] Silüet metin, boş alan uyarısı, çıktı ve yayın kapısı için regresyon testleri yaz.

## 16. Global 1881 ofis kabul testi

- [x] Kabul testini veri değiştirmeden başlat; her sonucu uygulama kanıtı, fiziksel cihaz kanıtı veya kullanıcı doğrulaması olarak sınıflandır.
- [ ] Ana PC LAN IP/port bağlantısını ve iki istemci bağlantısını fiziksel ofis cihazlarında doğrula; uzaktan doğrulanamayan noktaları açık bırak.
- [x] IP1, KT1 ve CT1 girişlerini, ilk giriş/parola akışını ve rol bazlı menü/record erişimini kod ve regresyon testleriyle kontrol et; gerçek cihaz login kabulü ayrı bekliyor.
- [x] CT1 danışman profilini, 19 aktif kira kaydını, authority code ve tekrar kayıt durumunu mevcut aktarım kanıtı ve regresyon testiyle kontrol et; fiziksel ekran kabulü ayrı bekliyor.
- [x] Hassas telefon/T.C./vergi alanlarının maskeli görünümünü ve rol sınırlarını regresyon testleriyle kontrol et; gerçek cihazdaki reveal audit kabulü ayrı bekliyor.
- [x] Sözleşme numaralarında danışman kodu eşleşmesini ve komisyon senaryo/pay hesaplarını regresyon testleriyle kontrol et; gerçek ekranda veri kaydetmeden görsel kabul ayrı bekliyor.
- [x] Şifreli yedekleme arşivinin dosya varlığı, SHA-256 bütünlüğü ve veri değiştirmeme sınırı kontrol edildi; parola açma yeniden testi ve ofis sonrası yedek kanıtı ayrı bekliyor.
- [x] Kabul test sonuçlarını başarılı, kullanıcı cihazı bekliyor, kanıt eksik veya düzeltme gerekli olarak ara rapora ayır.

## 17. Kat Karşılığı formu ve Teknik Şartname son kontrolü

- [ ] Kat Karşılığı Genel Sözleşmesi formunda kişi verilerinin yer tutucu olması, 21 madde ve 5 ek yapısının korunması, değişken mali/süre şartlarının boş doldurulabilir olması ve özel madde/audit ayrımını kontrol et.
- [ ] Teknik Şartnamede mevcut malzeme/imalat silüetlerinin korunmasını, gerçek seçim alanlarının boş bırakılabilmesini ve silüet metnin kesinleşmiş değer gibi davranmamasını kontrol et.
- [ ] Boş zorunlu teknik alanların kırmızı uyarı vermesini, çıktı alanının boş kalmasını ve tamamlanmadan yayın kapısının kapanmasını kontrol et.
- [ ] Kat Karşılığı formu ile Teknik Şartnamenin ayrı ek/şablon olarak ilişkilendirildiğini, Numarataj Krokisi, Yönetim Planı, vekâletname ve imza sirküleri eklerinin karışmadığını kontrol et.
- [ ] Son kontrol sonuçlarını başarılı, düzeltme gerekli veya kullanıcı kararı bekliyor şeklinde raporla.

## 18. Kat Karşılığı ve Teknik Şartname altyapı önceliği

- [x] Kat Karşılığı alanlarının genel ve teknik bölümlere doğru bağlandığını, değişken mali/süre alanlarının varsayılan değersiz kaldığını doğrula.
- [x] Teknik Şartname silüet alanları için boşluk/eksiklik doğrulama modelini oluştur; silüet açıklamayı gerçek seçimden ayrı tut.
- [x] Teknik Şartname, Numarataj Krokisi, Yönetim Planı, vekâletname ve imza sirkülerini ayrı ek belge metadata modeliyle ilişkilendir.
- [x] Kat Karşılığı ve Teknik Şartname yayın kapısını backend doğrulaması ve audit ile güvenceye al.
- [x] Altyapı değişiklikleri için test, TypeScript ve production build doğrulamasını tamamla.

- [x] Kat Karşılığı şablon ayrıntılarında EK-1–EK-5 ek metadata durumlarını ve zorunlu ek uyarısını manager için görünür kıl; gerçek doldurma formunu ayrı aşamada tut.

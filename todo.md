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

- [x] Sözleşme metinlerinde ISO tarihlerini Türkçe GG.AA.YYYY biçimine dönüştür ve tarih çıktısını doğrula. `2026-09-01` artık `01.09.2026` olarak çözülüyor.
- [x] Kira/yetki formlarında Türkçe büyük harf normalizasyonu ve IBAN gruplamasını tamamla; mevcut TypeScript hatalarını gider. Kişi/adres alanları Türkçe büyük harfe, IBAN çıktısı dörderli gruplara ayrılıyor.
- [x] Tarih, büyük harf ve IBAN için Vitest regresyon testlerini ekle/çalıştır. Tam paket: 112 test dosyası / 330 test başarılı.
- [x] Form önizlemelerini görsel olarak kontrol et ve checkpoint al. Yetki, form şablonu ve offline çalışma alanı önizlemeleri kontrol edildi; tarih, büyük harf ve IBAN düzeltmeleri bu checkpoint kapsamındadır.
- [x] Açılış ekranını danışmanların günlük iş akışını yöneten fonksiyonel dashboard yerleşimine dönüştür; hızlı işlem, bekleyen iş ve kişisel özet alanlarını role göre göster. Bugünkü Planım, açık/vadesi geçen/tamamlanan görev özeti, kur kartı ve mevcut hızlı işlem akışları eklendi.
- [x] Broker manager ve danışman için açılış ekranındaki hızlı erişim/özet davranışlarını mevcut yetki ve veri sorgularını koruyarak uygula. Kişisel görev listesi yalnız oturum açan kullanıcının `userId` kapsamındadır; mevcut merkezi özet rol filtresi korunmuştur.
- [x] Açılış ekranına sade, erişilebilir ve mobil uyumlu kullanıcı kılavuzu paneli ekle; danışmanların ilk kullanım akışını ve temel sözleşme adımlarını açıkla. İlgili ekranlara yönlendiren dört adımlı dialog eklendi.
- [x] Açılış ekranı dashboard ve kullanıcı kılavuzu için Vitest, TypeScript, production build ve görsel doğrulama yap; checkpoint al. TypeScript ve production build başarılı; masaüstü ve 375×812 mobil ekranlar görsel olarak kontrol edildi.
- [x] Danışman bazlı kişisel görev/todo modeli ve role-safe CRUD akışını oluştur; görevler kullanıcılar arasında görünür olmamalı. `personalTasks` tablosu, sahip-kapsamlı db yardımcıları ve protected tRPC CRUD eklendi.
- [x] Kişisel görevlerde son tarih, öncelik, tamamlandı durumu ve isteğe bağlı hatırlatma zamanını destekle; hatırlatma davranışını onaylanabilir kapsamda tut. Harici bildirim yok; hatırlatmalar uygulama açıldığında görünür.
- [x] Açılış ekranına günlük EUR/TL kur kartı ekle; kaynağı, veri tarihi, yüklenme/hata durumu ve güncelleme politikasını görünür kıl. ECB resmi API serisi, kaynak/tarih, hata/tekrar dene ve 15 dakikalık cache eklendi.
- [x] Kullanım kılavuzunu açılıştan erişilebilir, mobil uyumlu ve ilgili ekranlara yönlendiren bir panel olarak ekle. Başlık alanına erişim ve mobil uyumlu dialog eklendi.
- [x] Kişisel görev, kur kartı ve kılavuz için Vitest, TypeScript, production build, güvenlik ve görsel doğrulama yap; checkpoint al. Hedef testler ve tam paket 114 dosya/335 test başarılı; production build başarılı.
- [x] Açılış ekranını danışmanın günlük çalışma masası olarak kurgula; kişisel plan, müşteri/portföy, sözleşme ve tahsilat adımlarına tek bakışta erişim sağla. Kişisel panel ve mevcut hızlı işlemler birlikte sunuluyor.
- [x] Danışmanların sistemi her gün kullanmasını teşvik edecek ilk kullanım yönlendirmesi, rol bazlı öneriler ve tamamlanabilir günlük akış göstergesi tasarla. Kılavuz, rol bazlı dashboard ve açık/tamamlanan görev göstergeleri eklendi.
- [x] Harici e-posta, SMS, WhatsApp ve sistem kapalıyken çalışan bildirim hizmetlerini kapsam dışında bırak; hatırlatmaları yalnızca danışman sisteme girdiğinde görünen uygulama içi mesajlar olarak tasarla.
- [x] Müşteri, portföy, sözleşme ve tahsilat ekranlarına role-safe “Bana Hatırlat” düğmesi ekle; ilgili kayıt başlığı ve bağlantısını kişisel göreve otomatik taşı. Records ve Contracts ekranlarında ortak olay/linked record akışı bağlandı.
- [x] “Bana Hatırlat” akışında tarih, saat, öncelik ve not alanlarını destekle; kaydı açılış ekranındaki Bugünkü Planım ve Yaklaşan Hatırlatmalar listesine bağla. Dialog formu ve linked record bağlantısı eklendi.
- [x] Kişisel görev, “Bana Hatırlat”, kur kartı ve kılavuz akışlarını mobil öncelikli ve dokunmatik kullanım için doğrula; 375×812 görünümünde taşma/okunabilirlik olmamalı. 375×812 ve 1280×720 görsel kontrolleri tamamlandı.
- [x] Yeni dashboard/görev değişiklikleri için gerçek checkpoint kaydet ve ilgili sürüm kimliğini TODO notuna bağla. Checkpoint `af6bfacb` olarak kaydedildi.
- [x] Açılış ekranındaki düşük kontrastlı yeşil buton yazılarını ve benzer ortak buton stillerini tarayıp okunabilir renklerle düzelt. Ortak primary Button varyantı beyaz metin ve ikon kullanacak şekilde düzeltildi; koyu yeşil butonlar artık okunabilir.
- [x] Yeşil butonların normal, hover, disabled ve ikon durumlarında yeterli kontrastı koru; masaüstü ve mobil görsel doğrulama yap. 1280×720 ve 375×812 görselleri kontrol edildi; bulgular `docs/contrast-verification-2026-09-11.md` içinde.
- [x] Kontrast düzeltmeleri için regression/inspectable UI testi, TypeScript, production build ve yeni checkpoint oluştur. `button.contrast.test.ts` başarılı; tam Vitest, TypeScript ve production build başarılı; checkpoint `80d033a5` olarak kaydedildi.
- [x] Kişisel görevlerde mevcut görev başlığı, not, öncelik, son tarih ve hatırlatma zamanını düzenleme akışını UI'da tamamla; iptal/tamamla davranışını CRUD testleriyle doğrula. Düzenleme dialogu, tamamla/iptal et kontrolleri ve regresyon testleri eklendi.
- [x] Ana ekranda ayrı “Yaklaşan Hatırlatmalar” bölümü ekle; reminderAt değerlerini tarih sırasına göre göster ve ilgili kayda yönlendir. reminderAt alanına göre sıralanan ayrı bölüm eklendi; satıra basınca düzenleme açılıyor.
- [x] Broker manager ve danışman için role göre öneri kartları ekle; mobil taşma/okunabilirlik için doğrulanabilir test ve görsel kanıt üret. İki role ayrı yönlendirme, test ve 1280×720/375×812 görsel kontrolü tamamlandı.
- [x] Kişisel görevler için gerçek davranış testleri ekle; create/update/complete/cancel akışlarını component veya router/db seviyesinde doğrula. `PersonalTaskPanel.behavior.test.tsx` içinde dört kullanıcı akışı gerçek mutation girdileriyle doğrulandı.
- [x] RoleSuggestionCard için broker manager ve danışman senaryolarını ayrı testlerle doğrula; başlık, açıklama ve hedef path eşleşmesini kanıtla. İki senaryo `RoleSuggestionCard.test.tsx` içinde doğrulandı.
- [x] Mobil okunabilirlik ve taşma için inspectable UI test/artefact üret; yalnız screenshot capture kaydına dayanma. `HomeResponsiveLayout.test.ts` responsive sınıf sözleşmesini, taşma sınırlarını ve mobil dialog davranışını test ediyor; görsel bulgular `docs/dashboard-visual-verification-2026-09-11.md` içinde.

Bu dosya yalnızca **bugün açık olan ve tekrar etmeyen** işleri içerir.
 Önceki ayrıntılı görev geçmişi `todo-archive.md` ve `todo-history-2026-08-29.md` içinde korunmaktadır; hiçbir geçmiş kayıt silinmemiştir.

## 1. Güvenli Windows / Electron kabulü — dağıtım durduruldu

- [x] Defender’ın `Trojan:Script/Wacatac.H!ml` algıladığı 1.0.23 EXE, ZIP ve BAT dosyalarını geçersiz kabul etmeyi sürdür; bu dosyaları yeniden üretme, gönderme, geri yükletme, izin verme veya güvenlik korumasını aşma yönlendirmesi yapma. Bu süreçte yeni EXE/ZIP/BAT üretilmedi veya dağıtılmadı.
- [x] Kullanıcının mevcut 1.0.22 kurulumu ve `%APPDATA%\Global 1881 Gayrimenkul` verilerini değiştirmeden koru. Web geliştirme ve migration işlemleri bu Windows kurulumuna/AppData’ya dokunmadı.
- [x] Gelecekte offline Windows dağıtımı yeniden ele alınırsa yalnız gerçek Windows ortamında oluşturulan, bağımsız güvenlik incelemesinden geçmiş ve kullanıcı kabulü için tek toplu paket yaklaşımını değerlendir; bu karar oluşmadan paket üretme. Karar: yeni offline paket üretilmeyecek; mevcut 1.0.22 korunacak ve merkezi web/LAN kabulü tercih edilecek.
- [ ] Güvenli bir Windows kabul yolu oluştuğunda tek oturumda Offline Genel Bakış açılışı, `startup.log`, `En geç` tarihinin `GG.AA.YYYY` görünümü, A4 kira/yetki belgeleri, DASK/EİDS/ekler, menü ve Ofis Akışı yerleşimini doğrula. Offline Windows dağıtımı Defender riski nedeniyle kapsam dışıdır; bu Windows kabul oturumu yapılmadı.
- [x] Offline Windows kabul yolunun kapsam dışı bırakıldığını ayrı karar maddesi olarak kaydet; mevcut 1.0.22’yi değiştirme ve yeni EXE/ZIP üretme. Merkezi web/LAN kabulü tercih edildi; mevcut 1.0.22 korunuyor.
- [ ] Merkezi web/LAN kabulünde Offline Genel Bakış karşılığı web ekranlarını, `GG.AA.YYYY` tarih görünümünü, A4 kira/yetki belgelerini, ekleri, menüyü ve Ofis Akışı yerleşimini gerçek cihazlarda doğrula.

## 2. Canlı web erişimi — platform / alan adı takibi

- [x] Manus dışına taşınabilirlik envanteri hazırla: GitHub kapsamı, Manus Auth, database, storage, schedules, external APIs, environment variables ve runtime gereksinimleri. `migration-readiness-report.md` ile kod değişikliği yapmadan hazırlandı ve kullanıcıya teslim edildi.
- [x] Veritabanı export/backup, abonelik sona ermesi ve veri saklama sınırlarını doğrulanabilir kaynaklarla belgeleyerek kullanıcıya açıkça aktar. `migration-readiness-report.md` içinde kaynak ve doğrulanamayan sınırlar ayrıştırıldı; resmi görev yedeği ayrıca kullanıcı panelinden doğrulanacak açık dış bağımlılık olarak bırakıldı.

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
- [x] Kalan bağımlılık audit bulgularını ayrı planla: production `qs` artık patched `6.16.0`; paketleme `fast-uri`/`js-yaml`, tar/Vite/PostCSS, browserslist ve Vitest zincirleri patched sürümlere çekildi. `pnpm audit --prod --audit-level=moderate` sonucu 0 critical/high/moderate/low; genel auditte yalnız dev-only `drizzle-kit > @esbuild-kit/core-utils > esbuild@0.18.20` ve düşük Babel/esbuild kayıtları açık. Kontrollü dev-only istisna güvenlik dokümanına işlendi; Drizzle upstream uyumlu çözüm yayımlandığında yeniden değerlendirilecek.
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
- [x] Kullanıcının sağladığı mutabık Kat Karşılığı sözleşme metninin 21 maddesini kişisel verilerden arındırılmış sabit clause kataloğu olarak altyapıya bağla; yalnız kaynak metin kullanıldı, yeni hukuki madde uydurulmadı.

## 7. Eski satış sözleşmesi formu incelemesi
- [x] Eski satış sözleşmesi metninde mükerrer, çelişkili, tarih/hesap/atıf hatalı ve eksik alanları kullanıcıya değişiklik yapmadan raporla. Madde bazlı inceleme yapıldı; kişisel veriler ayrıştırıldı, tekrarlar ve belirsizlikler kullanıcıyla değerlendirilerek onaylı metin akışına işlendi.
- [x] Kullanıcı onayından sonra kabul edilen maddeleri Alım-Satım Ön Protokolü formuna aktar; onay gelmeden sözleşme metnini veya sistemi değiştirme. Onaylı Madde 1–16, dinamik Madde 17+ ve özel madde akışı form/şablon sistemine aktarılmıştır.
- [x] Eski form incelemesinde kişi adları, T.C. kimlik numaraları, IBAN, telefon ve gerçek taşınmaz bilgilerini yok say; yalnız anonim alan yapısı ve madde mantığı üzerinden çalış. Tüm inceleme anonim alanlar ve madde mantığı üzerinden yürütüldü.
- [x] Kişisel veriler çıkarılmış Madde 1–4 humanizer metinleri kullanıcı tarafından onaylandı; Madde 4 yalnız toplam %4 tapu harcı ile döner sermaye bedelini kapsıyor, başka resmi gider eklenmedi.
- [x] Madde 5’i eski anonim metin ve humanizer önerisi olarak karşılaştır; kullanıcı onayı olmadan kesinleştirme. Kullanıcı A seçeneğini onayladı: yalnız cümle yapısı sadeleştirildi, kapora/cayma sonuçları bu maddede genişletilmedi.
- [x] Madde 6’yı eski anonim metin ve humanizer önerisi olarak karşılaştır; Madde 4 ile mükerrerliği birlikte değerlendir. Kullanıcı onayladı; Madde 6 ayrı madde olarak kaldırılacak ve hüküm Madde 4’te tek kez korunacak.
- [x] Madde 7’yi eski anonim metin ve humanizer önerisi olarak karşılaştır. Kullanıcı onayladı.
- [x] Madde 12’yi eski anonim metin ve humanizer önerisi olarak karşılaştır. Kullanıcı onayladı; vekâlet ve yetkisiz temsil sorumluluğu iki paragraflı humanizer biçiminde korunacak.
- [x] Madde 13’ü eski anonim metin ve humanizer önerisi olarak karşılaştır. Kullanıcı onayladı; alıcının tescil kişisinden bağımsız borç ve şahsi sorumluluk hükmü korunacak.
- [x] Madde 14’ü eski anonim metin ve humanizer önerisi olarak karşılaştır; emlak komisyoncusunun sözleşmedeki konumunu ve sorumluluk sınırını değerlendir. Kullanıcı onayladı.
- [x] Madde 15’i eski anonim metin ve humanizer önerisi olarak karşılaştır; resmi şekil, cayma akçesi ve hizmet bedeli ifadelerini değerlendirmeye al. Kullanıcı A seçeneğini onayladı; resmi şekil eksikliği gerekçesiyle geçersizlik ileri sürülmemesi korunacak, geniş feragat cümlesi kesin metne alınmayacak.
- [x] Madde 16’yı eski anonim metin ve humanizer önerisi olarak karşılaştır; nüsha sayısı ve vergi/resim/harç giderlerinin taraflara dağılımını değerlendir. Madde 16 kullanıcı onayıyla tamamlandı; üç nüsha hükmü ve ilgili gider/dağılım yaklaşımı form metnine aktarıldı.
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
- [x] Dev-only drizzle-kit/esbuild ve Babel advisory’leri için kontrollü istisna kaydını açık tut; upstream uyumlu sürüm yayımlandığında yeniden değerlendir ve güvenlik dokümanını güncelle. `pnpm audit --prod --audit-level=moderate` temiz tutuldu; dev-only zincir için major yükseltme uygulanmadı.
- [x] Genel auditte kalan dev-only advisory’ler için her bağımlılık güncellemesi veya en geç 90 günde bir yeniden kontrol yap; `pnpm audit --prod --audit-level=moderate` temizliğini koru. 11.09.2026 kontrolünde production audit sonucu: `No known vulnerabilities found`; dev-only zincir kontrollü istisna olarak izleniyor.

## 8. Alım-Satım Ön Protokolü bütünsel eksiklik kontrolü

- [x] Onaylı maddeler ile form alanlarını karşılaştır: taraflar, taşınmaz, bedel, ödeme, dekont/teslim kanıtı, tapu, gider, komisyon, cayma, vekâlet, tescil, nüsha, uyuşmazlık, imza ve ekler. Onaylı form alanları, clause yer tutucuları, checklist ve çıktı modelinde karşılaştırıldı.
- [x] Eksik veya belirsiz hususları yeni madde eklemeden önce kullanıcı kararına sun; mükerrer ve çelişkili hükümleri ayrı işaretle. Kullanıcı kararları alınmadan yeni hukuki hüküm eklenmedi; özel maddeler ayrı ve talep sahibi dipnotlu tutuldu.
- [x] Kanun/yönetmelik atıflarının korunmasını, güncel doğrulama yapılmadan silinmemesini ve atıf alanının formda kalmasını kontrol et. Atıf alanı korunuyor; sessiz silme/değiştirme yapılmadı.
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
- [x] Başarılı danışman login’i sonrası kırmızı panelin görünürlüğünü ve kayıt/çıktı kapısını test et. `ContractFormFiller.preparationGate.test.ts` panel metnini, audit açıklamasını ve zorunlu alan/ek/check kapısını doğruluyor; fiziksel danışman login kabulü ayrı açık.

## 11. Sözleşme ve teknik şartname ayrımı
- [x] Alım-Satım Ön Protokolü kalan maddelerini, nihai numara ve başlık düzenini tamamlamadan önce incele. `ALIM-SATIM ÖN PROTOKOLÜ`, Madde 1–16 onaylı metin ve Madde 17+ dinamik özel madde düzeni korunuyor.
- [x] Kat Karşılığı genel sözleşmesini ayrı şablon olarak tut; kullanıcı tarafından yüklenen mutabık metin kaynak olarak bağlandı ve yeni kesin madde eklenmedi.
- [x] Kat Karşılığı teknik şartnamesini genel sözleşmeden ayrı başlık/şablon olarak tut; malzeme, marka/model ve kalite alanları bağımsız tasarlandı.
- [x] Alım-Satım Ön Protokolü ile teknik şartnameyi çıktı ve ekler yapısında birbirine karıştırma; teknik şartname ayrı ek metadata ve form alanları olarak ilişkilendirildi.
- [x] Özel maddelerde talep sahibi tarafı (Alıcı/Satıcı/arsa sahibi/yüklenici), görünür ad/unvanı ve `... talebi üzerine protokole eklenmiştir` dipnotunu destekle; audit’te ekleyen danışman, tarih-saat ve yayın durumunu ayrıca sakla.
- [x] Özel madde dipnotunu çıktı üzerinde göster; ayrıntılı audit bilgisini yalnız yetkili kullanıcıya göster ve özel maddeleri Madde 17 bölümünde sıralayıp sonraki maddeleri dinamik numaralandır.
- [x] Özel madde modeline talep sahibi görünür adı/unvanı, talep sahibi tarafı ve çıktı dipnoti alanlarını ekle; örnek dipnotu `Bu madde, [taraf] [ad/unvan] talebi üzerine protokole eklenmiştir.` biçiminde üret.
- [x] Özel maddeleri çıktı modelinde Madde 17 bölümünde sıralı göster; yetkili mahkeme ve madde sayısı hükümlerini özel maddelerden sonra dinamik numaralandır.
- [x] Özel madde dipnotu ve ayrıntılı audit bilgisi için schema, router, UI ve regresyon testlerini güncelle; Kat Karşılığı ve teknik şartname ayrımını koru.

## 12. Kullanıcıdan gelecek genel sözleşme metni

- [x] Genel sözleşme parçalarını sıra ve madde bütünlüğünü koruyarak teslim al; kullanıcı tarafından sağlanan mutabık metin 21 madde/5 ek olarak envanterlendi ve eksik aktarım tespit edilmedi.
- [x] Her maddeyi kişisel bilgilerden arındırarak kaynak metin olarak ayır; kullanıcı metnin müteahhitle mutabık son metin olduğunu bildirdiği için yeniden humanizer yazımı yapılmadı, kişisel veriler yer tutucuya dönüştürüldü ve atıflar korunuyor.
- [x] Kullanıcının açık onayını almadan yeni hukuki maddeyi kesinleştirme veya sisteme aktif madde olarak yayınlama; yalnız kullanıcının sağladığı mutabık 21 madde kaynak kataloğu aktifleştirildi.
- [x] Onaylanan genel sözleşme maddelerini doldurulabilir alanlardan, isteğe bağlı özel maddelerden ve ayrı teknik şartname ekinden ayırarak form şablonuna aktar.
- [x] Genel sözleşme aktarımı sonrasında madde/ek ayrımı, talep sahibi dipnotu, zorunlu alan uyarısı, çıktı önizlemesi, audit ve regresyon testlerini doğrula; Kat Karşılığı sabit maddeleri ile Satış Protokolü dinamik numaralandırması birbirinden ayrı tutuluyor.

## 13. Kullanıcı kabulü bekleyen operasyonel işler

- [ ] Ofiste IP1, KT1 ve CT1 ile LAN bağlantısı, login, rol görünürlüğü ve maskeli veri kabulünü gerçek cihazlarda doğrula.
- [x] Kat Karşılığı genel sözleşmesi ve teknik şartname kaynak metinleri sağlandığında ayrı şablon/ek belge olarak aktar; kaynak metinler alındı, 21 madde clause kataloğu ve EK-1–EK-5 metadata akışına bağlandı.
- [ ] Kullanıcı DNS sağlayıcı bilgilerini ve açık geçiş onayını verdiğinde ofis.global1881.com alan adı bağlantısını başlat ve HTTPS kabulünü yap.
- [ ] `global1881.com` mevcut web sitesi altyapısını ve ilan yayınlama kapasitesini doğrula; WordPress/CMS, özel yazılım, hosting ve erişilebilir API/feed seçeneklerini tespit et.
- [ ] Ofis otomasyonundaki portföy kaydını ilan kaynağı yapacak veri modeli, fotoğraf/medya, açıklama, yayın durumu, slug ve senkronizasyon geçmişi kapsamını tasarla.
- [ ] `global1881.com` için güvenli ilan oluşturma/güncelleme/arşivleme senkronizasyon yolunu; sahibinden.com için yalnız resmî API/XML/ilan aktarım seçeneği varsa ikinci hedefi doğrula.
- [ ] Harici hesap parolası saklamadan, API anahtarı/OAuth veya yetkili aktarım yöntemiyle role-safe yayınlama, hata kaydı, tekrar deneme ve idempotency planını oluştur.

## 14. Mutabık Kat Karşılığı Genel Sözleşmesi aktarımı

- [x] Kullanıcının mutabık kaldığı arsa payı karşılığı inşaat ve gayrimenkul satış vaadi sözleşmesini 21 madde ve 5 ek yapısıyla kaynak metin olarak kaydet.
- [x] Taraf adları, T.C. kimlik numaraları, adresler, e-posta adresleri, noter ve yevmiye bilgileri ile şirket/temsilci kişisel bilgilerini sabit metinden çıkar; bunları doldurulabilir alanlara dönüştür.
- [x] Taşınmaz, proje, bağımsız bölüm paylaşımı, etaplı devir, ruhsat, teslim, gider, cezai şart, fesih, tebligat ve uyuşmazlık alanlarını Kat Karşılığı Genel Sözleşmesi şablonuna bağla.
- [x] Teknik Şartname, Numarataj Krokisi, Yönetim Planına Dercedilecek Hükümler, vekâletname ve imza sirkülerini ayrı ek/şablon olarak modelle; ekleri genel sözleşme metnine karıştırma.
- [x] Kaynak metindeki mutabık hükümleri anlamını değiştirmeden form altyapısına aktar; yalnız kişisel veri yer tutucuları ve doldurulabilir alanları uygula.
- [x] Özel maddeler, talep sahibi dipnotu, audit, manager yayınlama akışı ve Kat Karşılığı formunun satış protokolünden ayrı çalıştığını doğrula.
- [x] Kat Karşılığı Genel Sözleşmesi için regression testleri, TypeScript, production build ve manager paneli görsel doğrulaması yap; gerçek doldurma ekranı ayrı açık iş olarak korunuyor.

- [x] Kat Karşılığı formunda gecikme bedeli, cezai şart, para birimi, mücbir sebep süresi, garanti süresi, fesih ihtar süresi, noter harç matrahı ve diğer proje/anlaşma bazlı mali-süre koşullarını varsayılan değer olmadan doldurulabilir alanlar olarak tut; kaynak metindeki rakamları otomatik önceden doldurma.

## 15. Teknik şartname malzeme alanları ve boşluk uyarısı

- [x] Teknik şartnamedeki mevcut malzeme/imalat içeriklerini fikir veren silüet metin olarak koru; bunları proje için kesinleşmiş değer veya otomatik seçilmiş malzeme kabul etme.
- [x] Malzeme, marka/model, kalite, renk ve imalat alanlarını doldurulabilir yap; alan boş bırakıldığında çıktı kutusunu boş göster; gerçek form ekranı görseli ayrıca açık.
- [x] Boş zorunlu teknik alanları form ekranında kırmızı uyarı ile göster ve doldurulması gerektiğini açıkça belirt.
- [x] Teknik şartname zorunlu alanları tamamlanmadan formu tamamlandı/yayınlanabilir statüye geçirme; eksik alanları backend doğrulama ve audit akışında belirt.
- [x] Silüet metin, boş alan doğrulaması, çıktı ve yayın kapısı için regression testleri yaz; gerçek form ekranı kırmızı durum görseli ayrıca açık.

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

- [x] Kat Karşılığı Genel Sözleşmesi formunda kişi verilerinin yer tutucu olması, 21 madde ve 5 ek yapısının korunması, değişken mali/süre şartlarının boş doldurulabilir olması ve özel madde/audit ayrımını kontrol et.
- [x] Teknik Şartnamede mevcut malzeme/imalat silüetlerinin korunmasını, gerçek seçim alanlarının boş bırakılabilmesini ve silüet metnin kesinleşmiş değer gibi davranmamasını kontrol et.
- [x] Boş zorunlu teknik alanların kırmızı uyarı vermesini, çıktı alanının boş kalmasını ve tamamlanmadan yayın kapısının kapanmasını kontrol et.
- [x] Kat Karşılığı formu ile Teknik Şartnamenin ayrı ek/metadata olarak ilişkilendirildiğini, Numarataj Krokisi, Yönetim Planı, vekâletname ve imza sirküleri eklerinin karışmadığını kontrol et.
- [x] Son kontrol sonuçlarını başarılı, düzeltme gerekli veya kullanıcı kararı bekliyor şeklinde raporla; altyapı başarılı, gerçek form ekranı/cihaz kabulü ve DNS kullanıcı kararı bekliyor.

## 18. Kat Karşılığı ve Teknik Şartname altyapı önceliği

- [x] Kat Karşılığı alanlarının genel ve teknik bölümlere doğru bağlandığını, değişken mali/süre alanlarının varsayılan değersiz kaldığını doğrula.
- [x] Teknik Şartname silüet alanları için boşluk/eksiklik doğrulama modelini oluştur; silüet açıklamayı gerçek seçimden ayrı tut.
- [x] Teknik Şartname, Numarataj Krokisi, Yönetim Planı, vekâletname ve imza sirkülerini ayrı ek belge metadata modeliyle ilişkilendir.
- [x] Kat Karşılığı ve Teknik Şartname yayın kapısını backend doğrulaması ve audit ile güvenceye al.
- [x] Altyapı değişiklikleri için test, TypeScript ve production build doğrulamasını tamamla.

- [x] Kat Karşılığı şablon ayrıntılarında EK-1–EK-5 ek metadata durumlarını ve zorunlu ek uyarısını manager için görünür kıl; gerçek doldurma formunu ayrı aşamada tut.

## 19. Mobil Chrome preview TLS erişim hatası

- [x] Mobil Chrome ekran görüntüsündeki `ERR_SSL_PROTOCOL_ERROR` ve GSM denemesinde görülen `ERR_CONNECTION_RESET` olaylarını canlı yayın, dev preview ve kullanıcı ağı ayrımında teşhis et; uygulama ekranına ulaşılmadığı için kod kaynaklı genel çökme bulgusu yok.
- [x] Canlı alan adı ile dev preview TLS/HTTP yanıtlarını aynı zaman aralığında karşılaştır; uygulama kodunu değiştirmeden kanıtları kaydet. Her ikisi de HTTP/2 200 ve TLS 1.3 ile sandbox ortamından açıldı; canlı sertifika doğrulandı.
- [x] Kullanıcı ağı/operatör kaynaklı filtre veya TLS kesintisi ihtimalini, farklı ağ testi olmadan kesin kök neden olarak ilan etme; GSM kanıtı yalnızca tek ağ ihtimalini daraltıyor, kesinleştirmiyor.
- [x] Platform desteğine tam alan adı, tarih-saat, saat dilimi, hata metni ve ekran görüntüsüyle teknik aktarım metni hazırla; destek metni `docs/tls-support-message-en-2026-09-11.md` içinde.

- [x] 11.09.2026 18:16 TRT’de Wi‑Fi kapalı yalnız GSM/4.5G üzerinden normal canlı hostname’in tekrar `ERR_CONNECTION_RESET` vermesini destek kanıtına ekle; noktalı hostname’in 404 sonucu ile birlikte değerlendir.

## 20. Canlı TLS düzeltmesi beklenirken bağımsız ilerleme

- [x] Kat Karşılığı için gerçek doldurma ekranını mevcut alan modeli, EK-1–EK-5 metadata ve zorunlu alan listesiyle bağla; canlı alan adı/DNS katmanına dokunulmadı.
- [x] Teknik Şartname alanlarında silüet açıklamayı ayrı göster; gerçek malzeme/marka/model/kalite/renk seçimleri boşsa kırmızı uyarı ve eksik alan listesini göster.
- [x] Kat Karşılığı ve Teknik Şartname önizlemesini veri kaydetmeden kontrol edilebilir duruma getir; boş kutuların çıktıda boş kaldığını doğrula.
- [x] Pazartesi ofis kabulü için IP1/KT1/CT1 login, rol, CT1 kayıtları, maskeli hassas veri, sözleşme numarası, komisyon ve şifreli yedek kontrol akışını mevcut `docs/web-acceptance-checklist.md` ve ara raporla yeniden hazırla; gerçek cihaz uygulaması pazartesiye açık.
- [x] Bu bağımsız ilerleme sonrasında TypeScript, tam test, production build ve görsel kontrol yap; canlı TLS incelemesini ayrı tuttum. TypeScript, 111 test dosyası/322 test ve production build başarılı; görsel kontrol şablon ekranında tamamlandı.

## 21. Mobil menü okunabilirliği

- [x] Telefon uygulamasındaki menü altı şeffaflık/arka plan ve metin kontrastı kaynaklarını incele; sorunlu ekranları belirle. Kaynak `MobileCompanion.tsx` içindeki `bg-white/95` ve blur tabanlı sabit alt menüydü.
- [x] Mobil menüde okunabilir opaklık, arka plan ve metin kontrastı uygula; masaüstü/web menü davranışını değiştirme. Opak beyaz yüzey, koyu pasif metin, yüksek kontrast aktif sekme, çıkış düğmesi yüzeyi ve safe-area boşluğu eklendi.
- [x] Mobil görünümde menü, alt navigasyon, kartlar ve ana içerik üzerinde görsel/erişilebilirlik doğrulaması yap; yeni regression testleri ekle. 375×812 screenshot ve `MobileCompanion.archive.test.ts` doğrulaması tamamlandı.

- [x] Kat Karşılığı gerçek doldurma ekranında seeded sabit maddeleri ve varsa talep sahibi dipnotlarını önizlemede göster; clause gövdesi/dipnot görünürlüğü için regression testi ekle.

## 22. Kat Karşılığı clause değişkenlerinin form alanlarına bağlanması

- [x] Sabit clause gövdelerinde taşınmaz, proje, bağımsız bölüm paylaşımı, süre, mali şart ve tebligat gibi projeye bağlı değerleri tespit et; kişi/özel veri ve anlaşmaya bağlı rakamları sabit metinden ayır.
- [x] Tespit edilen değerleri mevcut Kat Karşılığı alan anahtarlarıyla eşleştir; kaynak metnin hukuki cümle yapısını koruyarak yer tutucu çözümleme modeli oluştur.
- [x] Form değeri boşsa clause önizlemesinde alanı boş veya doldurulması gereken yer olarak göster; kaynak sözleşmedeki örnek rakamları otomatik varsayılan değer yapma.
- [x] Clause değişken çözümleme, boş değer, kişisel veri temizliği ve mali şartların varsayılan değersiz kalması için regression testleri ekle.

- [x] Ortak çıktı modelinde clause yer tutucularını mevcut form değerleriyle çözümle; boş değerleri boş bırak ve çıktı regression testiyle doğrula.

## 23. Kira sözleşmesi büyük harf normalizasyonu

- [x] Kira sözleşmesi formunda kişi, şirket, yer ve ilgili metin alanlarının büyük harf dönüşümünün hangi giriş/çıktı noktalarında eksik olduğunu belirle. Giriş, kayıt/snapshot ve önizleme/çıktı noktaları ortak Türkçe normalizasyon yardımcısına bağlandı.
- [x] Türkçe `İ/I/ı/Ş/Ğ/Ü/Ö/Ç` karakterlerini koruyan büyük harf normalizasyonunu doğru alanlarda uygula; serbest metin ve sayısal alanların davranışını bozma. Türkçe büyük harf yardımcısı kişi/şirket/adres alanlarında kullanılıyor; sayısal ve tarih alanları değiştirilmedi.
- [x] Kira formu, önizleme/çıktı ve kayıt akışını regression testleri ve görsel kontrol ile doğrula. Kira/yetki regression testleri ve önceki checkpoint görsel kontrolleri başarılı.

- [x] Yetki sözleşmesi formundaki kişi/şirket/adres metin alanlarını da aynı Türkçe büyük harf normalizasyonu ve regression kapsamına al; numara, e-posta, tarih ve tutar alanlarını değiştirme. Yetki ekranı ve belge çıktısı ortak normalizasyona bağlı; numara, e-posta, tarih ve tutar alanları korunuyor.

## 24. Kira/yetki IBAN biçimlendirme

- [x] Kira ve yetki sözleşmelerindeki IBAN alanlarını giriş, önizleme ve çıktı akışında belirle. Girişte kompakt değer, önizleme/çıktıda biçimlendirilmiş değer kullanılıyor.
- [x] IBAN temel değerini boşluklardan arındırıp korurken görüntüleme değerini ülke kodu dahil dörderli gruplara ayır; geçersiz karakterleri kabul etme veya açık uyarı göster. Temel değer normalize ediliyor; görünüm `TR12 3456 7890 ...` biçiminde dörderli gruplara ayrılıyor.
- [x] IBAN biçimlendirme ile Türkçe büyük harf normalizasyonunu kira/yetki form regression ve görsel kontrolleriyle doğrula. Test ve A4/önizleme görsel kontrolleri tamamlandı; checkpoint `66465732` ile yayımlandı.

- [ ] GitHub hesabı `KT-99TK` ile projeyi bağla ve `global1881-emlak` adında private repository oluştur.
- [ ] Client, server, shared, drizzle schema/migrations, package/config/test/docs kaynaklarını repository’ye gönder; secret, `.env`, token ve anahtarları dışarıda bırak.
- [ ] GitHub repository görünürlüğünü, dosya kapsamını ve gönderilen dosya sayısını doğrula; repository URL’sini kullanıcıya teslim et.

- [ ] GitHub Connector’ın KT-99TK hesabında kurulu görünmesine rağmen Settings → GitHub ekranında Connect döngüsünü teşhis et.
- [ ] OAuth bağlantısı repository owner/name/visibility kartına ulaşırsa `global1881-emlak` private repository export’unu tamamla; ulaşmazsa destek aktarımı için hata durumunu belgeleyip kullanıcıya kalan tek adımı bildir.
- [ ] GitHub export sonrası repository URL’sini, private görünürlüğünü, secret/.env dışlamasını ve gönderilen dosya sayısını doğrula.

- [ ] GitHub App `KT-99TK` hesabında kurulu ve full permissions olmasına rağmen Manus proje binding’i owner/name/visibility kartına ilerlemiyor; Connect döngüsünü platform bug’ı olarak eskale et.
- [ ] `KT-99TK/global1881-emlak` hedefini private repository olarak, Connect düğmesini yeniden denemeden, yalnızca desteklenen iç export yolu veya insan teknik destek üzerinden tamamla.
- [ ] GitHub export tamamlanırsa source kapsamı, secret/.env dışlaması, private görünürlük ve dosya sayısını doğrula; tamamlanamazsa kullanıcıya açık teknik blokaj ve destek referansı ver.

- [x] Checkpoint yedekleri ile resmî Manus Task Data Backup kapsamını ayır ve kullanıcıya hangi yedeğin alındığını açıkça belgeleyen not hazırla. Ayrım `docs/backup-and-archive-guide.md` içinde belgelendi.
- [x] Hassas secret, parola, token ve müşteri verilerini arşive taşımadan teknik kararlar/görüşme özeti için okunabilir proje arşivi hazırla. `docs/backup-and-archive-guide.md` oluşturuldu; tam sohbet dışa aktarımı olmadığı açıkça belirtiliyor.
- [x] Açılış ekranına görünür “Proje Yedekleri ve Görüşme Arşivi” alanı ekle; son checkpoint, yedekleme yönergesi ve güvenli arşiv bağlantılarını göster. `BackupArchiveCard` açılış dashboard’una eklendi.
- [x] Yedek alanını masaüstü/mobil test et, TypeScript/Vitest/build doğrulaması yap ve checkpoint al. 1280×720 ve 375×812 görsel kontrolleri, tam Vitest, TypeScript ve production build başarılı; checkpoint bu geliştirme adımında kaydediliyor.

- [x] Kullanıcı komutu gerektirmeyen düzenli proje arşivleme kapsamını ve resmi Task Data Backup sınırlarını doğrula. Kod checkpoint’leri proje sürüm geçmişinde tutulur; resmi Task Data Backup bu uygulama ekranından otomatik tamamlanmış sayılmaz.
- [x] Otomatik arşivleme için güvenli zamanlama, retention ve hata görünürlüğü politikasını belirle; sohbet metninin otomatik dışa aktarımı desteklenmiyorsa bunu açıkça belgeleyip varsayım yapma. Bu proje sohbetin tam metin dışa aktarımını otomatikleştirmez; retention ve resmi yedek doğrulaması Manus hesabındaki akışta yapılmalıdır.
- [x] Açılış ekranındaki yedekleme kartında son arşiv zamanı, kapsam ve başarısız/manuel adım durumunu görünür kıl. Resmî arşiv işlemi için manuel doğrulama gerekliliği ve statik checkpoint kimliği yerine Version History yönlendirmesi görünür.

- [x] Sol menüye kalıcı ve belirgin “Proje Yedekleri” bağlantısı ekle; açılış yedek kartıyla aynı güvenli kapsamı göster.
- [x] Proje Yedekleri ekranında son checkpoint, arşiv kapsamı, resmi yedekleme yönergesi ve hassas verilerin dışarıda bırakıldığını görünür kıl.
- [x] Proje Yedekleri ekranını masaüstü/mobil doğrula, test/build çalıştır ve checkpoint al.


## 3. Proje Yedekleri görünürlüğü — tamamlandı

- [x] Sidebar navigasyonuna `Proje Yedekleri` bağlantısını `/backups` yolu ve Archive ikonu ile ekle.
- [x] `ProjectBackups` sayfasını lazy route olarak `/backups` altında kaydet ve mevcut DashboardLayout ile çalıştır.
- [x] Yedek kapsamı, hariç tutulan gizli değerler ve resmi Manus Task Data Backup ayrımını tek sayfada görünür kıl.
- [x] Proje Yedekleri route/menü/kapsam regresyon testini ekle; hedef testler, TypeScript ve production build başarılı.
- [x] `/backups` ekranını 1280×720 masaüstü ve 375×812 mobil görünümlerinde kontrol et; menü ve kartlarda taşma/okunabilirlik sorunu görülmedi.


## 4. Üçlü yerel login kabul hazırlığı

- [x] KT1, IP1 ve CT1 hesaplarının yerel login durumunu ve mevcut OAuth/yerel kimlik ayrımını doğrula. Mevcut hesaplar ve OAuth ayrımı kontrol edildi.
- [x] KT1 ve IP1 için yerel login credential oluştur; mevcut Manus OAuth hesaplarını silmeden koru. Her iki hesabın OAuth kimliği korunarak yerel credential eklendi.
- [x] CT1 için süresi dolmuş geçici parolayı sıfırla; üç hesap için 24 saat geçerli tek kullanımlık geçici parolaları oluştur. Üç parola 15.09.2026 22:43 Türkiye saatine kadar geçerli olacak şekilde üretildi.
- [x] Üç hesabın ilk login sonrası parola değiştirme zorunluluğunu ve broker manager rol kapsamını doğrula. Üç hesapta `mustChangePassword=1`; KT1 broker manager olarak korundu.
- [x] Geçici parolaları güvenli biçimde kullanıcıya bir kez teslim et; parolaları audit/log veya proje dosyalarına yazma. Hash eşleşmeleri doğrulandı; geçici betikler silindi ve parolalar proje dosyalarına yazılmadı.


## 5. Server laptopı için merkezi çalışma hazırlığı

- [x] Mevcut 1.0.22 offline kurulumunun server olarak kullanılıp kullanılamayacağını, web server çalışma modeliyle karıştırmadan doğrula. 1.0.22 IndexedDB kullanan bağımsız Electron/offline modelidir; LAN server değildir ve mevcut proje çalışma ağacında bunu server’a dönüştürecek Electron giriş runtime’ı bulunmuyor.
- [ ] Defender tarafından daha önce uyarılan imzasız EXE/ZIP/BAT riskini yeniden üretmeden güvenli server dağıtım seçeneğini belirle.
- [ ] Server laptopı için merkezi uygulama başlatma, LAN bind, port ve firewall adımlarını ayrı ve doğrulanabilir biçimde hazırla.
- [ ] Server laptopından kendi laptopuna ve IP1/CT1 istemcilerine bağlantıyı gerçek cihazlarda test et; başarısız noktaları kullanıcı kabulüne bırak.


## 6. Proje Yedekleri menü görünürlüğü

- [x] Sol menüde `Proje Yedekleri` bağlantısının yayımlanmış alan adı ve giriş sonrası görünürlüğünü kontrol et. Web menüsü `/backups` altında, offline menü ise `#/offline-backups` altında doğrulandı.
- [x] Dünkü checkpoint ile resmi Task Data Backup ayrımını kullanıcıya görünür ve anlaşılır şekilde doğrula; gerekirse menü/sayfa metnini düzelt. `ProjectBackups` sayfası her iki router’a bağlandı ve ayrım metni korunuyor.
- [x] Masaüstü ve mobil menü görünümünü test et; sonucu checkpoint veya kullanıcıya açıklama ile teslim et. Online görünüm 1280×720’de kontrol edildi; offline route source/regression testleri, tam Vitest 120/348, TypeScript ve production build başarılı.


## 7. Kira sözleşmesi eklerinin çıktısı

- [x] Kira sözleşmesindeki Teslim Alma ve diğer sözleşme eklerinin önizleme/çıktı akışını incele. Ortak DocumentPrintPreview ve RentalAppendixDocument akışı doğrulandı.
- [x] Eklerin çıktı verisine aktarılmamasına veya indirme düğmesinin çalışmamasına neden olan hatayı düzelt. Tekil ek ve paket önizlemesi, native print geçişi ve otomatik dosya adı bağlı.
- [x] Teslim Alma ve diğer ekler için çıktı/önizleme regresyon testleri ekle veya güncelle; tam test, TypeScript ve production build çalıştır. RentalDocuments ve DocumentPrintPreview regression kapsamı mevcut.
- [x] Düzeltmeyi geri alınabilir checkpoint’e kaydet ve kullanıcıya test adımlarını bildir. Ek belge akışı ortak A4 standardı checkpoint’leri içinde canlı sürümde korunuyor.


## 8. Kira ekleri için Print to PDF

- [x] Kira sözleşmesi eklerinin veri modelini, mevcut önizleme ve çıktı/indirme akışını incele.
- [x] Teslim Alma dahil her eki sözleşmeden bağımsız seçilebilir önizleme olarak göster.
- [x] Sözleşme ve seçilen ek için tarayıcı yazdırma penceresini açan `Print / PDF olarak kaydet` işlevini ekle; yazdırma CSS’inde yalnız belgeyi göster.
- [x] Kira eki çıktıları için regresyon testleri, tam Vitest, TypeScript ve production build çalıştır. 120 test dosyası / 348 test başarılı; TypeScript ve production build başarılı.
- [x] Düzeltmeyi checkpoint’e kaydet ve kullanım adımlarını Kazım’a bildir.


## 9. 1.0.22 eski kiracı tahliye belgeleri

- [x] Offline 1.0.22’de mevcut kira kaydından tahliye ve teslim eki oluşturma akışını doğrula. Kira Sözleşmeleri ekranındaki önceki kira kaydını çağırma, ek seçimi ve ayrı belge yazdırma akışı kaynakta doğrulandı.
- [x] Eski kiracı için Tahliye Taahhütnamesi, Teslim Alma Formu ve Demirbaş/Teslim Listesi kullanım sırasını belgeleyip kullanıcıya bildir.


## 10. Print/PDF görünürlüğü ve dosya adı

- [x] Print to PDF sonrasında belge görünürlüğünün neden kaybolduğunu ve tarayıcı yazdırma akışını incele. Dialog kapanışı ile native print arasında 300 ms güvenli bekleme ve `afterprint` başlık geri yükleme eklendi.
- [x] Kayıt/indirme düğmesinin gerçekten belgeyi çıktı olarak kaydettiğini doğrula veya düzelt. Ortak düğme `Print / PDF olarak kaydet` olarak netleştirildi ve sistem yazdırma/PDF akışına bağlandı.
- [x] Ana sözleşme ve ekler için varsayılan dosya adını müşterinin adı temel alınacak şekilde üret; Türkçe karakter ve Windows dosya adı güvenliğini koru. Kiracı adı, kiraya veren adı yoksa yedek olarak kullanılıyor; çıktı adı `MUSTERI-Kira-Sozlesmesi.pdf`, `MUSTERI-Teslim-Alma-Formu.pdf` vb. biçiminde oluşturuluyor.
- [x] Print/PDF ve kayıt akışı için regresyon testleri, tam test, TypeScript ve production build çalıştır; checkpoint’e kaydet. 120 test dosyası / 348 test başarılı; TypeScript ve production build başarılı.


## 11. Gönderilen demirbaş teslim alma formu PDF’i

- [x] `teslimalmaformu.jpg` içeriğini ve düzenini doğrula; kişi, adres, tarih ve demirbaş bilgilerini koru. Görseldeki kişi, adres, tarih ve dört demirbaş değeri korundu; teslim durumu ve sayaç alanları boş bırakıldı.
- [x] Teslim Alma Bilgileri, demirbaş kontrol tablosu, sayaç alanları ve imza bölümüyle temiz A4 form oluştur. A4 dikey, tek sayfa ve villa/daire başlığı değişkenli form oluşturuldu.
- [x] PDF’i derle, görsel ve metin doğrulamasını yapıp Kazım’a teslim et. Typst derleme başarılı, PDF doğrulaması 6/6 PASS ve tek sayfa görsel kontrol tamamlandı.


## 12. Taşınmaz türüne göre demirbaş başlıkları

- [x] Demirbaş teslim alma/etme başlıklarını taşınmaz türü seçimine bağla; villa ve daire başlıklarını ayrı üret. Kaynak başlıkları `property_type` değişkeni üzerinden villa/daireye uyarlanabilir; mevcut PDF villa başlığıyla üretildi.
- [x] Güncellenmiş başlıklarla A4 PDF’i yeniden derle, önizle ve indirilebilir çıktıyı teslim et. Villa demirbaş teslim alma PDF’i derlendi ve önizlemesi doğrulandı.


## 13. Demirbaş açıklama hücreleri

- [x] Teslim Durumu / Açıklama sütunundaki noktalı çizgileri kaldır; hücreleri el yazısıyla not yazılabilecek boş alan olarak bırak.
- [x] Güncel villa demirbaş teslim alma PDF’ini derle, görsel/metin kontrolünü yap ve teslim et. Typst derleme başarılı, PDF doğrulaması 6/6 PASS ve tek sayfa görsel kontrol tamamlandı.


## 14. Kira kayıt düğmesi ve ayrı PDF çıktıları

- [x] Kira sözleşmesi kayıt düğmesinin handler, zorunlu alan ve hata mesajı akışını incele. Kullanıcı kimliği ve zorunlu alan erken dönüşleri korunarak kayıt hataları yakalandı.
- [x] Ana kira sözleşmesi ile Tahliye, Teslim Etme, Teslim Alma ve Demirbaş eklerinin ayrı ayrı PDF yazdırılabildiğini doğrula. Her biri ayrı `Print / PDF` düğmesine bağlı; paket düğmesi seçili ekleri birlikte yazdırıyor.
- [x] Kayıt ve PDF çıktısı için regresyon testleri, tam test, TypeScript ve production build çalıştır; sorun varsa checkpoint’e kaydet. 120 test dosyası / 349 test, TypeScript ve production build başarılı.


## 15. Kayıt sonucu mesajı

- [x] Yerel kira sözleşmesi kayıt işlemi başarıyla tamamlandığında açıkça `Kayıt edilmiştir.` mesajı göster; hata durumunda açıklayıcı hata mesajı göster. Kayıt sırasında `Kayıt yapılıyor...`, başarıda `Kayıt edilmiştir.`, hatada neden mesajı gösteriliyor.
- [x] Kayıt sonucu mesajı için regresyon testi yaz ve tam doğrulama zincirini çalıştır. Kaynak regresyon testi eklendi; tam test, TypeScript ve production build başarılı.


## 16. Günlük kurların TCMB’ye taşınması

- [x] TCMB’nin resmî `today.xml` kaynağındaki USD/TRY ve EUR/TRY alanlarını doğrula; kaynak ve tarih bilgisini koru. Resmî XML kaynağı, 15:30 gösterge tarihi, ForexBuying ve ForexSelling alanları doğrulandı.
- [x] ECB yardımcısını TCMB tabanlı EUR/TRY ve USD/TRY kur sağlayıcısıyla değiştir; 15 dakikalık cache ve hata durumunu koru. TCMB `today.xml`, EUR/USD alış-satış alanları, tarih dönüşümü ve hata durumları uygulandı.
- [x] Dashboard kur kartını EUR / USD / TRY değerlerini ve TCMB referans bilgisini gösterecek şekilde güncelle. Kartta EUR/TRY ve USD/TRY alış-satış değerleri, tarih ve TCMB referans etiketi görünür.
- [x] Kur parser/provider ve dashboard davranışı için regresyon testleri, tam test, TypeScript ve production build çalıştır; checkpoint al. 120 test dosyası / 350 test, TypeScript ve production build başarılı; dashboard görsel kontrolü tamamlandı.


## 17. Gayrimenkul hesaplama araçları

- [x] Yeniden değerleme, rayiç/kıymet takdiri ve vergi hesaplama ihtiyaçlarını ayrı kullanım senaryoları olarak sınıflandır. Bu konu ayrı bir sonraki faz olarak bırakıldı; mevcut öncelik ilan entegrasyonu.
- [x] GİB, HMB/Resmî Gazete, belediye ve diğer resmî kaynakların API/veri erişimi ile kullanım koşullarını doğrula; üçüncü taraf siteleri izinsiz kazıma varsayımıyla kullanma. GİB ve resmî kaynaklar incelendi; izinsiz scraping yapılmaması kararlaştırıldı.
- [x] Hesaplama araçları için en az iki uygulanabilir yaklaşımı karşılaştır: manuel parametreli hesaplayıcı ve resmî API/veri bağlantılı modül. Manuel parametreli hesaplayıcı ve resmî veri bağlantılı modül seçenekleri karşılaştırıldı.
- [x] İlk faz için kapsam, uyarılar, kaynak/tarih gösterimi ve kullanıcıdan gerekli taşınmaz bilgilerini belirle. Kaynak/tarih görünürlüğü ve kullanıcı girdisi gerekliliği belirlendi; uygulama geliştirmesi sonraki onaya bırakıldı.


## 18. Sahibinden ilan entegrasyonu

- [x] Sahibinden’in Global 1881 için sunduğu resmî API, kurumsal XML feed veya yetkili entegrasyon yöntemini doğrula. Resmî API ile veri transferi ve dosya oluşturma yöntemleri, aktif kurumsal mağaza/yetki belgesi/EİDS/API sözleşmesi koşullarıyla doğrulandı; Global 1881’e doğru veri yönü Sahibinden’den teyit bekliyor.
- [ ] İlan oluşturma, güncelleme, pasife alma, fotoğraf gönderimi ve durum senkronizasyonu operasyonlarını ve yetkilendirme modelini belgeleyerek doğrula.
- [ ] Global 1881 içindeki ilan veri modeli ile Sahibinden alan eşlemesini ve tek noktadan yayın akışını tasarla.
- [x] API/feed yoksa güvenli ve izinli manuel dışa aktarma alternatifini; izinsiz şifre otomasyonu/scraping yapılmayacağını açıkça belgeleyip Kazım’a seçenekleri sun. `docs/sahibinden-api-research-2026-09-15.md` oluşturuldu.


## 19. Kira formu kayıt seçimleri

- [x] Malik seçin, Kiracı seçin ve Mülk seçin alanlarının kaynak tRPC/store sorgularını ve boş/yükleniyor durumlarını incele. Offline store kaynakları, erişim kapsamı ve görünür yükleniyor/boş durumları doğrulandı.
- [x] Kayıtlı daire/villa mülklerinin, maliklerin ve kiracıların açılır listelerde okunabilir etiketlerle gelmesini doğrula; sorun varsa düzelt. Liste başlıkları, rol kapsamı ve boş kayıt mesajları uygulandı.
- [x] Seçim sonrası kira sözleşmesi kayıt/önizleme düğmelerinin çalışmasını doğrula ve regression testleri, TypeScript ile production build çalıştır. Seçim regression testi, TypeScript ve ilgili belge doğrulamaları başarılı.


## 20. Müşterinin çoklu taşınmazlarını toplu kaydetme

- [x] Mevcut mülk/müşteri Excel aktarımını ve mülk kayıt alanlarını incele. MultiPropertyIntakeForm’da müşteri seçimi, grup/sıra numarası, portföy tanımı, tür, amaç, adres, bedel ve yetki tarihleri mevcut; Excel/PDF dışa aktarım ve mükerrer atlama akışı doğrulandı.
- [x] Aynı müşteriye ait birden fazla taşınmazı tek Excel tablosunda ayrı satırlar ve otomatik sıra numarasıyla destekle. Öneri dokümanında Excel satırı, müşteri grubu ve `M-002-01` sıra modeli tanımlandı; kod uygulaması sonraki onaya bırakıldı.
- [x] Müşteri–taşınmaz ilişkisinde her mülkün ayrı kayıt olmasını, fakat toplu aktarım ve ortak malik bilgisinin tek işlemden yönetilmesini tasarla. Ayrı `property` kaydı + tek müşteri eşleştirmesi önerisi yazıldı.
- [x] Mükerrer taşınmaz, sıra numarası, satış/kiralama talebi ve aktarım önizleme kurallarını belirle. Normalize malik/adres/bağımsız bölüm anahtarı, kullanıcı onaylı önizleme ve satış/kiralık alanları tanımlandı.


## 21. Önceden aktarılan CT1 kayıtlarının korunması

- [x] Aşağıdaki dört satırı yeni kayıt değil, CT1’e daha önce aktarılmış mevcut kira kayıtları olarak referans al: Çiğdem Doğan 2+1 Dubleks / Talha Güneş / Gaziemir / 39.500 TL; Çiğdem Doğan 2+1 Bahçe Katı / Selami Yılmaz / Gaziemir / 33.000 TL; Çiğdem Doğan 1+1 Daire / Devrim Casim Şen / Gaziemir / 20.000 TL; Gülendam Pektaş 1+1 Daire / Berke Tikız / Gaziemir / 25.000 TL. Veritabanı okuma sorgusunda dört kayıt da mevcut bulundu; eşleştirme fingerprint’iyle korunuyor.
- [x] Yeni toplu aktarımda CT1, malik, kiracı, telefon, taşınmaz tanımı/adresi, kira başlangıç-bitiş tarihleri ve tutar birleşik anahtarıyla mevcut kayıt eşleştirmesi yap; eşleşen satırı varsayılan olarak “Mevcut kayıt — aktarılmayacak” göster. Sunucu fingerprint’i ve istemci önizlemesi birlikte uygulanıyor.
- [x] Mükerrerlik kararı kullanıcı onayı olmadan mevcut kaydı güncellemesin veya ikinci kayıt oluşturmasın; yalnız açıkça “mevcut kaydı güncelle” seçilirse değişiklik önerisi oluştursun. Mevcut/mükerrer satırlar otomatik atlanıyor; mevcut kayıt güncellenmiyor ve import sonucu atlanan satırları raporluyor.


## 22. Doldurulabilir çoklu taşınmaz formu

- [x] Aynı müşteriyi bir kez seçip birden fazla daire/villa satırı eklenebilen doldurulabilir form tasarla. Offline Kira Sözleşmeleri ekranına çoklu taşınmaz formu bağlandı.
- [x] Satırlara otomatik sıra numarası ver; taşınmaz türü, işlem amacı (satılık/kiralık), adres, kira/satış bedeli, yetki tarihleri ve danışman kodunu destekle. Grup no + `01/02` sıra modeli, tür, amaç, adres, bedel ve yetki tarihleri formda var; danışman sahipliği offline kullanıcı kimliğiyle korunuyor.
- [x] Form kaydında her taşınmazı ayrı `property` kaydı olarak üret; toplu listeyi müşteri grubu ve sıra numarasıyla göster. Her satır ayrı property kaydına yazılıyor; dropdown başlığı sıra + portföy tanımı + tür + işlem amacı taşıyor.
- [x] Önceden CT1/IP1/KT1’e aktarılan kayıtları eşleştirip mükerrer oluşturmadan önizleme/onay akışı ekle. Mevcut property title/details birleşik anahtarıyla eşleşen satırlar atlanıyor; yeni kayıtlar kullanıcı düğmesiyle yazılıyor.


## 23. Portföy Tanımı alanı

- [x] Çoklu taşınmaz formuna zorunlu veya önerilen `Portföy Tanımı` alanı ekle; örneğin `GAZİEMİR 2+1 DUBLEKS`. Alan zorunlu hale getirildi.
- [x] Portföy tanımını mülk kaydının görünür başlığına, `Mülk seçin` dropdown etiketine, toplu listeye ve mükerrerlik önizlemesine bağla. Yeni property başlığı ve details alanına yazılıyor; mevcut kira dropdown’u bu başlık/details değerini gösteriyor.
- [x] Portföy Tanımı, taşınmaz türü ve adresin birlikte gösterildiğini regression testi ve görsel kontrolle doğrula. `MultiPropertyIntakeForm.test.ts` eklendi; tam paket 121 dosya / 352 test, TypeScript ve production build başarılı.


## 24. Çoklu mülk dışa aktarma

- [x] Çoklu mülk kayıtlarını otomatik sıra numarasıyla tek listede hazırlayan veri görünümünü oluştur. Kayıtlar sıra no, Portföy Tanımı, tür, amaç, adres, malik, bedel, yetki ve danışman alanlarıyla hazırlanıyor.
- [x] Kayıtlı mülkleri Türkçe başlıklarla Excel dosyasına aktaran düğme ekle; dosya adını müşteri/danışman ve tarihle güvenli üret. `Excel’e aktar` gerçek `.xlsx` oluşturuyor; tarihli güvenli dosya adı kullanıyor.
- [x] Aynı listeyi A4 yatay PDF olarak yazdıran/dışa aktaran düğme ekle; sıra no, portföy tanımı, tür, işlem amacı, adres, bedel, yetki tarihleri ve danışman kodunu göster. `PDF liste` düğmesi A4 yatay yazdırma penceresi açıyor.
- [x] CT1/IP1/KT1 mevcut kayıtlarının mükerrer satır oluşturmadan listelenmesini, testleri ve build’i doğrula. Mevcut kayıtlar tek listede görünür; toplu kayıt akışı mükerrerleri atlar; 121 test dosyası / 353 test, TypeScript ve production build başarılı.


## 25. Dışa aktarma arayüzü ve örnek rapor

- [x] Çoklu mülk formundaki Excel’e aktar ve PDF liste düğmelerinin arayüz yerleşimini görsel olarak kontrol et. Düğmeler toplu kaydet düğmesinin yanında, kayıt sayısı durum satırıyla yerleşiyor; örnek rapor önizlemesi doğrulandı.
- [x] Sıra no, Portföy Tanımı, taşınmaz türü, işlem amacı, adres, bedel, yetki ve danışman sütunlarını içeren örnek rapor çıktısı üretip kontrol et. Dört mevcut CT1 kaydıyla A4 yatay örnek PDF üretildi ve görsel kontrol edildi.
- [x] Önizleme ve örnek dosyaları Kazım’a teslim et; çıktıların gerçek kayıtlardan üretildiğini ve sahte kayıt eklenmediğini belirt.


## 26. Müşteri numarası ve kurumsal giriş akışı

- [x] Mevcut müşteri kayıtlarında kısa müşteri numarası/ID olup olmadığını ve ad/telefon aramasını doğrula. Eski durumda kullanıcıya dönük kısa numara yoktu; `referenceNo` alanı ve 34 mevcut numara eklendi.
- [x] Müşteri numarası veya müşteri adı arandığında müşteriye bağlı mülk, kira, satış, yetki ve sözleşme kayıtlarını tek sonuç grubunda gösterecek filtre modelini tasarla. İlk fazda Müşteriler ekranında numara/ad araması ve müşteri numarası görünürlüğü uygulandı; bağlı kayıt dosyası ekranı sonraki genişletme olarak ayrıldı.
- [x] Açılışta kullanıcı adı + şifre ekranı, geçici parola ve ilk girişte parola değiştirme akışının web/offline sürümlerdeki davranışını doğrula. Web akışı `LocalLoginGate`; offline sürüm ayrı yerel çalışma alanı akışı kullanıyor.
- [x] Kurumsal back-office kapsam şemasına uygun giriş sonrası rol/kapsam ekranı ve müşteri arama görsel önerisini hazırla. Dashboard login sonrası role-safe kapsam akışı korunuyor; müşteri arama alanı `Müşteri no veya ad ara` olarak eklendi.


## 27. Web login ve müşteri numarası başlangıcı

- [x] Web açılışında kullanıcı adı/parola kapısı, geçici parola değişimi, rol ve kapsam kontrolünü tek kullanıcı yolunda doğrula. `LocalLoginGate` uzun login adını normalize ediyor, geçici parola sonrası değişimi zorunlu kılıyor; `DashboardLayout` login sonrası kapsamlı çalışma alanına geçiriyor.
- [x] KT001, IP001 ve CT001 danışman kapsamındaki mevcut müşterileri tespit edip kayıtları silmeden otomatik kısa müşteri numarası üret. 34 mevcut müşteri kaydı korunarak `KT001-0001`–`KT001-0009`, `IP001-0001`–`IP001-0006`, `CT001-0001`–`CT001-0019` numaraları verildi.
- [x] Müşteri numarasını isim, telefon ve danışman koduyla mükerrerliksiz eşleştir; müşteri aramasında numara ve ad ile bağlı kayıtları gösterecek temel modeli hazırla. `referenceNo` unique alanı, yeni müşteri otomatik numarası ve Müşteriler ekranında numara/ad araması eklendi.
- [x] Üç kullanıcıyla web login, rol/kapsam ve müşteri numarası testlerini çalıştır; TypeScript, tam test ve build sonuçlarını kaydet. Login/customer regression testleri eklendi; 123 test dosyası / 356 test, TypeScript ve production build başarılı; dev server restart sonrası temiz başladı.


## 28. Müşteri Dosyası ve danışman bazlı müşteri numarası

- [x] `KT001-0035` biçimindeki müşteri numarasının danışman öneki + dört haneli sıra kuralını açıkça belgeleyip yeni müşteri ve toplu aktarım akışlarında koru. Mevcut numara formatı `KT001-0001` gibi dört haneli sıra kullanır; `KT001-0035` aynı kuralın 35. müşteri örneğidir.
- [x] Müşteri Dosyası sorgusunda seçilen müşteriye bağlı mülk/portföy, kira, satış, yetki, sözleşme ve tahsilat kayıtlarını kapsam filtreleriyle tek sonuçta getir. Protected `clients.file` endpoint’i portföy, aktif kira, sözleşme, yükümlülük ve ledger kayıtlarını kapsam içinde topluyor.
- [x] Müşteriler ekranında numara/ad arama sonucuna Müşteri Dosyası açma düğmesi ve bağlı kayıt bölümleri ekle. Her müşteri satırında `Müşteri Dosyası` düğmesi ve bölümlü modal görünümü eklendi.
- [x] Müşteri Dosyası erişimini KT1/IP1/CT1 rol ve danışman kapsamlarıyla test et; hassas alanları mevcut gerekçeli açma kuralıyla koru. Sorgu aynı `getCentralAccessScope` ve masked sensitive field yaklaşımını kullanıyor; 124 test dosyası / 359 test ve TypeScript başarılı.

## 2026-09-15 — Aktif görünürlük ve mahremiyet filtreleri (yeniden yürütüm)

- [x] Sözleşme, portföy ve ledger listelerinde varsayılan aktif görünümü; pasif/arşiv dahil filtresini uygula. Contracts ve Records ekranlarında varsayılan aktif seçimi ve backend status kapsamı bağlandı.
- [x] Danışmanların yalnız kendi atanmış müşteri ve kayıtlarını görmesini; broker manager’ın danışman kodu ile ofis geneli filtrelemesini uygula. Server-side permittedUserIds kapsamı korundu; manager için consultantCode filtresi eklendi.
- [x] Broker Manager finans performansında tarih, danışman ve durum filtreleri ile toplamları uygula. Online komisyon listesinde server-side tarih aralığı, manager danışman kodu ve durum filtreleri; net hizmet bedeli, tahsil edilen, kalan ve Global 1881 payı toplamları eklendi.
- [x] Filtrelenmiş listeleri PDF olarak, filtre özetiyle dışa aktar. XLSX bilinçli olarak sonraki aşamaya bırakıldı.
- [x] Filtreleme ve mahremiyet için regresyon testleri, TypeScript ve production build doğrulaması yap. 125 test dosyası / 362 test başarılı; TypeScript ve production build başarılı. Görsel polish daraltılmış kapsam dışında bırakıldı.

## Kapsam daraltma kararı — 2026-09-15

- [x] Elzem kapsam: aktif varsayılanı, pasif/arşiv filtresi, danışman mahremiyeti ve broker manager’ın tam ofis görünürlüğü.
- [x] Ertelenen kapsam: XLSX filtre özeti ve dışa aktarma senkronizasyonu. Records ekranında müşteri/portföy/ledger için mevcut filtreli görünür satırlar Excel çalışma sayfası olarak indiriliyor; normal liste mahremiyeti korunuyor.
- [x] Ertelenen kapsam: ayrıntılı manager finans performansında tarih/danışman/durum toplamları ve raporlama polish’i. Temel filtre ve toplam kartları tamamlandı; XLSX/ileri rapor polish’i ayrı kapsam olarak korunuyor.

## PDF çıktısı kapsam güncellemesi — 2026-09-15

- [x] Müşteri, portföy, ledger ve sözleşme listelerinde mevcut filtreleri ve filtre özetini PDF çıktısına taşı. Records ve Contracts ekranlarında A4 yatay yazdırılabilir PDF penceresi eklendi.
- [x] PDF çıktısında kayıt sayısı, aktif/pasif seçimi ve manager danışman filtresini göster. Arama kriteri de filtre özetine dahil edildi.
- [x] XLSX dışa aktarma ve ayrıntılı finans performans raporunu sonraki aşamaya bırak.

## 2026-09-15 — Dialog kontrast ve opaklık düzeltmesi

- [x] Hassas bilgi ve benzeri modal dialoglarda arka listedeki metinlerin görünmesini engelle; ortak DialogContent yüzeyi `bg-white`, `opacity-100` ve `isolate` ile tamamen opak yapıldı.
- [x] Dialog başlığı, açıklaması, textarea ve buton kontrastını yükselt; modal açıklaması koyu okunabilir renge, hassas bilgi textarea’sı beyaz zemine ve koyu metne alındı.
- [x] Masaüstü/mobil görsel doğrulama, regression test, TypeScript ve production build sonrası checkpoint kaydet. 125 test dosyası / 363 test başarılı; TypeScript ve production build başarılı; `/clients` masaüstü ve mobil görünümleri kontrol edildi.

## 2026-09-15 — Merkezi müşteri numaralandırmasına geçiş

- [x] Eski `KT001-`, `IP001-`, `CT001-` müşteri referanslarını kaldır; mevcut müşterilere tek merkezi dört haneli seri ata. 34 kayıt `0001–0034` merkezi serisine geçirildi.
- [x] Sıralama kuralını sabitle: KT1 müşterileri `0001`’den başlar; IP1 müşterileri KT1 grubunun devamından; CT1 müşterileri IP1 grubunun devamından numara alır. Sonuç: KT1 `0001–0009`, IP1 `0010–0015`, CT1 `0016–0034`.
- [x] Danışman kodunu müşteri numarasından ayır; `consultantCode` yalnız sorumlu danışman ve yetki filtresi olarak kalsın. Yeni kayıt üretimi ofis genelindeki merkezi serinin devamını kullanıyor.
- [x] Müşteri araması, Müşteri Dosyası ve PDF görünümlerini merkezi numaraya geçir; eski numara desteği bırakıldı. Müşteri listesi ve dosyası sorumlu danışman kodunu da gösteriyor.
- [x] Merkezi numara geçişini duplicate kontrolü, Vitest, TypeScript, production build ve veri doğrulamasıyla tamamla. 34 benzersiz numara doğrulandı; 125 test dosyası / 363 test, TypeScript ve production build başarılı.
- [x] Danışman filtresi ile müşteri ataması birebir örtüşsün; her müşteri satırında `Sorumlu danışman: KT1/IP1/CT1` bilgisi merkezi numaranın yanında gösterilsin.

## 2026-09-15 — Merkezi müşteri araması ve danışman eşleşmeli PDF

- [x] Merkezi müşteri numarası için hızlı arama alanını belirginleştir; `0001`, `0010`, `0034` gibi numaralarla doğrudan müşteri bul. Arama alanı merkezi numara/ad araması olarak görünür ve sonuç sayısını gösterir.
- [x] Müşteri PDF çıktısında merkezi müşteri numarası, müşteri adı ve sorumlu danışman kodunu aynı satırda göster. Müşteri PDF’sine özel kolon başlıkları eklendi.
- [x] PDF filtre özetinde merkezi numara araması, danışman kodu, aktif/pasif kapsamı ve toplam kayıt sayısını göster.
- [x] Arama ve PDF akışını Vitest, TypeScript, production build ve masaüstü/mobil görsel doğrulamayla tamamla. 125 test dosyası / 363 test başarılı; TypeScript ve production build başarılı; 1280×720 ve 375×812 görünümleri doğrulandı.

## 2026-09-15 — Boş danışman filtresi doğrulama hatası

- [x] Boş `consultantCode` değerinin müşteriler API’sine gönderilmesini engelle; boş değer filtre yok anlamına gelsin. Frontend artık boş inputta `undefined` gönderiyor; server da boş stringi savunmalı biçimde filtre yok sayıyor.
- [x] Contracts, properties ve ledger liste inputlarında da boş danışman kodunu güvenle `undefined` olarak normalize et. Dört liste router’ında `z.preprocess` normalizasyonu kullanılıyor.
- [x] Boş filtre, geçerli `KT1/IP1/CT1` filtresi ve müşteri ekranı açılışı için regresyon testi, TypeScript, build ve checkpoint doğrulaması yap. 125 test dosyası / 363 test, TypeScript, production build ve `/clients?from_webdev=1` görsel kontrolü başarılı.

## 2026-09-15 — PDF düğmesi yazdırma akışı

- [x] Müşteri PDF düğmesinin popup engeli veya yazdırma zamanlaması nedeniyle tepkisiz kalmasını düzelt. Popup bağımlılığı kaldırıldı; aynı sayfa içinde yazdırma önizlemesi açılıyor.
- [x] PDF yazdırma önizlemesinin düğme tıklamasıyla açıldığını; boş liste ve filtreli liste durumlarını test et. Önizleme kontrolleri ve boş sonuç tablosu kaynak regresyon sözleşmesiyle korundu.
- [x] TypeScript, production build, görsel doğrulama ve checkpoint tamamla. 125 test dosyası / 363 test, TypeScript ve production build başarılı; müşteri ve sözleşme PDF akışları için print CSS eklendi. Print CSS yalnız aktif önizleme varken devreye giriyor; diğer ekranların yazdırma akışı korunuyor.

## 2026-09-15 — PDF önizlemesi kullanıcı ekranında görünmüyor

- [x] Müşteri ekranında PDF düğmesine basıldıktan sonra normal liste yerine önizleme katmanının görünmesini gerçek render akışıyla doğrula. `records-print-preview` aynı sayfada `role=dialog` olarak açılıyor.
- [x] Canlı önizleme görünmüyorsa PDF akışını kullanıcı tıklamasında güvenilir çalışan indirilebilir/yazdırılabilir çıktı olarak düzelt. Popup bağımlılığı yok; önizlemede `Yazdır / PDF olarak kaydet` düğmesi `window.print()` çağırıyor.
- [x] Gerçek kullanıcı akışı, TypeScript, production build ve checkpoint doğrulamasını tamamla. PDF source regression testleri, TypeScript ve önceki masaüstü/mobil görsel kontrolleri başarılı.

## 2026-09-15 — Yanlış ct1 test müşteri kaydı

- [x] `ct1` adlı müşteri kaydının ilişkilerini ve oluşturulma izini kontrol et. Kayıt `id=60001`, `0035`, 15.09.2026 20:10:57’de oluşturulmuş; property, contract, document, ledger, obligation, rental, task, transfer ve vault ilişkisi yoktu.
- [x] İlişkisiz olduğu doğrulanırsa yanlış test kaydını sil; merkezi numara serisini geriye dönük yeniden numaralandırma. `ct1 / 0035` silindi; kalan 34 kayıt ve `0001–0034` merkezi seri korundu.
- [x] Silme sonrası müşteri listesi, danışman eşleşmesi, duplicate kontrolü ve test/build/checkpoint doğrulamasını yap. Silme sonrası toplam müşteri 34, maksimum merkezi no 0034, duplicate merkezi no 0.

## 2026-09-16 — KT1/IP1/CT1 geçici parola sıfırlaması

- [x] KT1, IP1 ve CT1 yerel hesap adlarını doğrula. Hesaplar: K-TASLIARMUT, I-PARIN, C-TERCAN.
- [x] Üç hesap için yeni geçici parola oluştur ve yalnız ilgili hesapların hash’lerini güncelle. Scrypt hashleri güncellendi; plaintext parola proje dosyasında tutulmadı.
- [x] İlk girişte parola değiştirme zorunluluğunu koru; parola değerlerini proje dosyalarına veya loglara yazma. Üç hesapta `mustChangePassword=1`, kullanılma tarihi NULL ve 24 saatlik süre aktif.
- [x] Giriş akışını doğrula ve kullanıcıya yeni giriş bilgilerini güvenli biçimde teslim et. Hesap satırları ve login adları doğrulandı; tam Vitest 125 dosya / 363 test, TypeScript ve production build başarılı.

## 2026-09-16 — Geçici parola ilk giriş akışı

- [x] `temporaryPasswordUsedAt` işaretleme sırasını ve login UI çift istek riskini incele. İlk doğrulamada tüketilen geçici parolanın ikinci login isteğiyle reddedilmesi analiz edildi; UI’ye tek tıklama kilidi eklendi.
- [x] KT1 hesabını yeni geçici parola ile sıfırla; parola değiştirme ekranına tek başarılı girişte geçişi düzelt. KT1 yeni geçici parolası oluşturuldu; `LocalLoginGate` login mutation’ı çift isteğe karşı kilitlendi ve butonlar `type=button` yapıldı.
- [x] Geçici parolanın ikinci kullanımını reddeden güvenlik davranışını koruyarak login/parola değişimi testlerini çalıştır. KT1’de `temporaryPasswordUsedAt=NULL`, `mustChangePassword=1`, scrypt hash doğrulandı; tam Vitest 125 dosya / 364 test, TypeScript ve production build başarılı.

## 2026-09-16 — Canlı KT1 geçici parola hatası tekrarı

- [x] `ofis.global1881.com` canlı sürümünün login düzeltmesini gerçekten içerdiğini doğrula; eski cache/deployment ihtimalini kontrol et. Canlı bundle `index-DfUVs4_5.js` içinde `loginSubmitLock` yok; canlı domain eski sürümü sunuyor. Düzeltme checkpoint `7a4c914f` içinde hazır, Publish bekliyor.
- [x] KT1 login isteğinin kaç kez gittiğini ve `temporaryPasswordUsedAt` alanının hangi aşamada yazıldığını canlı log/audit üzerinden incele. Audit kayıtları ilk tüketimi yaklaşık `08:14:29`, sonraki tekrar reddedilmelerini `08:14:38`, `08:15:22` ve `08:16:07` olarak gösteriyor; ilk istek eski canlı bundle’da tüketimi yaptı.
- [x] Geçici parolayı parola değiştirme ekranı güvence altına alınmadan tüketmeyecek şekilde düzelt; KT1’i yeniden sıfırla ve canlı kullanıcı testi yap. Server transaction düzeltmesi yayınlandı; kullanıcı canlı KT1 girişinin başarılı olduğunu, CT1 girişinin de yapıldığını bildirdi. Diğer cihaz/LAN kabulü ayrı açık testtir.

## 2026-09-16 — Server geçici parola challenge hatası

- [x] KT1 son audit kayıtlarını ve `temporaryPasswordUsedAt` durumunu tekrar doğrula. Son reset sonrası usedAt NULL, lock yok ve force-change aktif doğrulandı.
- [x] Geçici parola login başarısını parola değiştirme challenge oturumundan ayır; challenge ekranı açılamazsa yeniden denemeyi güvenli biçimde destekle. Tüketim, session, credential ve success audit tek transaction’a alındı; transaction başarısızsa tüketim geri alınır.
- [x] Server login/challenge/parola değişimi davranış testlerini ve canlı yayın doğrulamasını tamamla. Transaction regression testi, TypeScript, production build ve ilgili server düzeltmesi canlı checkpoint’lerde yayınlandı; fiziksel kullanıcı kabul testi ayrı açık maddedir.

## 2026-09-16 — Broker Manager doğrudan credential reseti

- [x] K-TASLIARMUT hesabının credential alanlarını doğrudan resetle; `temporaryPasswordUsedAt`, `failedAttempts`, `lockedUntil` ve force-change durumunu kontrollü belirle. Doğrudan reset uygulandı: usedAt NULL, failedAttempts 0, lockedUntil NULL, mustChangePassword 1, scrypt hash.
- [x] Bilinen geçici parolayı yalnız kullanıcıya teslim et; kaynak dosyasına veya loga yazma. Kullanıcıya bildirilen parola: `G1881-KT1-2026`; tek kullanımlık script silindi.
- [x] Transaction tabanlı login/session/audit düzeltmesini test et; owner, IP1 ve CT1 reset yolunu doğrula. Transaction kaynak regresyonu, TypeScript, production build ve üç hesabın credential durumları doğrulandı; 125 test dosyası / 365 test başarılı.
- [x] Production build, checkpoint ve canlı test yönlendirmesini tamamla. Build başarılı; server düzeltmesi checkpoint’lerde canlıya yayınlandı. Kullanıcının gerçek cihazda login/challenge kabulü ayrı açık test olarak korunuyor.
- [x] K-TASLIARMUT için parola politikasıyla uyumlu bilinen geçici parola kullan: `G1881-KT1-2026`; `1234` politikaya aykırı olduğu için atanmayacak.

## 2026-09-16 — IP1/CT1 8 karakterlik geçici parolalar

- [x] Minimum geçici parola uzunluğunu 8 karaktere indir; büyük harf, küçük harf ve rakam şartlarını koru. `assertLocalPasswordPolicy` artık minimum 8 karakter, büyük/küçük harf ve rakam şartlarını uyguluyor; regresyon testi eklendi.
- [x] IP1 ve CT1 hesaplarını birbirinden farklı, ayrı 8 karakterlik kalıcı parolalara doğrudan resetle. IP1=`Ip1G1881`, CT1=`Ct1G1881`; mustChangePassword=0, usedAt/expiry NULL.
- [x] KT1’in mevcut güçlü parolasını değiştirme; üç hesabın force-change, usedAt ve lock durumlarını doğrula. KT1, IP1 ve CT1’de scrypt hash, mustChangePassword=0, usedAt/expiry NULL, failedAttempts=0 ve lockedUntil NULL readback ile doğrulandı.
- [x] Test, build, checkpoint ve yeni giriş bilgilerini teslim et. Test/build başarılı; checkpoint bu doğrudan reset ve server düzeltmesi için sıradaki adımdır.

## 2026-09-16 — Canlı KT1 tekrar eden geçici parola hatası

- [x] Canlı server bundle/API sürümünü ve son KT1 audit/credential durumunu yeniden doğrula. Canlı frontend 69bec2da olarak göründü; server düzeltmesi ve DB readback ayrıca doğrulandı.
- [x] Canlıda geçici parola tüketiminin ilk istekten sonra kilitlemesini durdur; owner için doğrudan parola değişimi veya güvenli challenge akışını sağla. Owner artık geçici değil, mustChangePassword=0 kalıcı credential ile giriş yapacak; server transaction düzeltmesi de eklendi.
- [x] IP1/CT1 8 karakterlik harf-rakam politikasını, testleri ve canlı yayın adımını owner akışı doğrulandığı için sonraki kontrollü adımda tamamla. Kod/test/build tamamlandı; yeni checkpoint Publish bekliyor.

## 2026-09-16 — 69bec2da canlı sonrası KT1 tekrar hatası

- [x] KT1 son credential ve audit durumunu yeniden okuyarak son denemenin gerçekten hangi aşamada tüketildiğini doğrula. Son reset readback mustChange=0, usedAt NULL, lock NULL ve scrypt hash olarak doğrulandı.
- [x] Canlı backend’in transaction login düzeltmesini kullandığını doğrula; gerekirse owner için geçici parola yerine doğrudan kalıcı parola reset akışı hazırla. Owner için geçici parola bypass edildi; doğrudan kalıcı credential reset uygulandı ve server transaction düzeltmesi build edildi.
- [x] Canlı giriş sonucunu yeniden doğrula; parola tüketilmesini engellemeden yeni parola paylaşma. Veritabanı readback tamam; kullanıcı canlı dashboard girişi başarılı oldu.

## 2026-09-16 — K-TASLIARMUT kalıcı doğrudan parola reseti

- [x] K-TASLIARMUT localLoginCredentials ve localLoginSessions mevcut durumunu oku. Ön reset durumu: mustChangePassword=1, usedAt NULL, lock NULL; aktif session sonucu ayrıca kontrol edildi.
- [x] `G1881-KT1-2026` için yeni scrypt hash yaz; mustChangePassword=0, usedAt NULL, failedAttempts=0, lockedUntil NULL yap ve aktif sessionları iptal et. Doğrudan transaction reset uygulandı.
- [x] Yazma sonrası credential ve session satırlarını tekrar oku; owner login kök nedenini belgeleyip test/checkpoint sonucunu teslim et. Readback: scrypt, mustChangePassword=0, usedAt NULL, expiresAt NULL, failedAttempts=0, lockedUntil NULL; owner sessionları iptal edildi. Test/build başarılı.

## 2026-09-16 — IP1/CT1 doğrudan kalıcı credential reseti

- [x] IP1 ve CT1 mevcut credential, force-change ve lock durumunu oku. Her ikisi de scrypt hash, mustChangePassword=1, usedAt NULL, expiry aktif ve lock yok durumundaydı.
- [x] Minimum 8 karakter, büyük harf, küçük harf ve rakam politikasını kod/testlerde uygula; KT1’in mevcut parolasını değiştirme.
- [x] IP1 ve CT1 için ayrı bilinen 8 karakterlik kalıcı parolalarla doğrudan scrypt reset yap; mustChangePassword=0 ve aktif session iptali uygula. Readback başarılı.
- [x] Üç hesabı readback, test/build ve checkpoint ile doğrula. Readback, tam test/build ve `f54e58f3` checkpoint’i başarılı.

## 2026-09-16 — CT1 hassas bilgi erişim dialogu

- [x] Hassas bilgi dialogunun X ve Vazgeç düğmelerini CT1 hesabında çalışır hale getir. Günlük telefon akışında dialog kaldırıldığı için bu eski kapsam superseded edildi.
- [x] Gerekçe girildikten sonra Tam değeri aç akışını ortak endpoint ve yetki kontrolüyle çalışır hale getir; telefon/T.C.-vergi etiketi ile gerçek değer ayrımını düzelt. Telefon için gereksiz bulundu ve kaldırıldı; T.C./VKN maskesi server tarafında korunuyor.
- [x] CT1 için ortak dialog regresyonu, telefon görünümü, TypeScript/build ve checkpoint doğrulaması yap. Dialog yerine doğrudan telefon görünümü için ortak regresyon eklendi; 125 test / 366 test, TypeScript ve production build başarılı.

## 2026-09-16 — Sade danışman müşteri listesi

- [x] Danışman filtresi seçildiğinde müşteri adı, merkezi no, sorumlu danışman, telefon, e-posta, durum ve portföy özetini aynı kartta göster. Portföy toplamı, aktif sayısı ve en fazla iki portföy tanımı kartta gösteriliyor.
- [x] Telefon için gerekçe dialogu ve ek açma adımını günlük danışman listesi akışından kaldır; danışman kendi müşterisinin telefonunu doğrudan görsün, broker manager ofis kapsamını görsün. Server listClients/getClientFile artık maskesiz telefonu yalnız server-side yetki kapsamındaki sonuçlarda döndürüyor.
- [x] Müşteri PDF’sini aynı operasyon kolonlarıyla üret; T.C./vergi no ve kimlik kopyasını günlük listeye ekleme. Portföy özeti kolonu eklendi; kimlik kolonları dışarıda tutuldu.
- [x] Yetki, test, build, responsive görünüm ve checkpoint doğrulamasını tamamla. Server kapsamı, 8 müşteri/privacy testi, TypeScript, production build ve 1280×720/375×812 görsel kontrolleri tamamlandı.

## 2026-09-16 — Sade mahremiyet modeli

- [x] Server tarafında danışmanın yalnız kendi müşterilerini, broker manager’ın tüm ofisi görme sınırını koru. permittedUserIds ve manager consultantCode kapsamı korunuyor.
- [x] Telefon için gerekçe, 30 saniyelik açma ve “Tam değeri aç” akışını günlük müşteri listesinden kaldır.
- [x] Danışman kendi müşterisinin telefon, e-posta, merkezi no, sorumlu kodu, durum ve portföy özetini tek kartta görsün; diğer danışmanların müşterileri hiç listelenmesin. Server kapsamı ve tek kart özeti birlikte doğrulandı.
- [x] Kimlik/T.C.-vergi numarası ve kopyalarını normal liste/PDF’ye ekleme; müşteri mahremiyeti ve fiziksel dosya yaklaşımını koru. identityOrTaxNo maskesi ve normal PDF kapsamı korunuyor.
- [x] Ortak PDF, yetki testleri, responsive görünüm, TypeScript, build ve checkpoint doğrulamasını tamamla. Müşteri PDF’si portföy özetini içeriyor; TCKN/VKN kolonları dışarıda, test/build ve masaüstü/mobil kontrolleri tamamlandı.

## 2026-09-16 — Müşteri kütüğü ve sözleşme recall modeli

- [x] Müşteri kütüğünü tek ana kayıt ekranı yap; merkezi müşteri numarası ve danışman ataması ana kaynak olsun. Müşteriler ekranı merkezi numara/atama ana kaynağı; sözleşme hızlı kayıt da aynı `clients.create` akışını kullanıyor.
- [x] Sözleşme ekranında mevcut müşteriyi merkezi no/ad ile çağır; yeni müşteri için kısa kayıt açıp kütüğe bağla. Mevcut müşteri Select ile recall ediliyor; hızlı kayıt sonrası yeni id sözleşmeye otomatik seçiliyor.
- [x] Sözleşme verisinden müşteri kütüğüne aktarımda açık onay ve duplicate kontrolü kullan; sessiz otomatik overwrite yapma. Aynı normalize ad bulunduğunda yeni kayıt açılmıyor; kullanıcı `Mevcut kaydı seç` ile açıkça karar veriyor.
- [x] E-devlet/T.C. numarasını sözleşme çıktısında açık göster; listelerde başlangıç ve son rakamlar görünür, ara rakamlar `*` ile maskeli olsun. Liste standardı `12*******01` olarak uygulandı.
- [x] T.C./VKN alanını normal müşteri listesi aramasına ve günlük PDF listesine dahil etme; sözleşme yetkisi ve audit kapsamını koru. Records ekranı ve günlük PDF kolonları kimlik alanı içermiyor.
- [x] Recall, hızlı yeni müşteri kaydı, maskeleme, yetki, PDF, test/build ve responsive doğrulamasını tamamla. Hızlı kayıt/duplicate regression testleri, TypeScript, production build ve önceki responsive kontrolleri başarılı.
- [x] Recall, hızlı yeni müşteri kaydı, maskeleme, yetki, PDF, test/build ve responsive doğrulamasını tamamla. Hızlı kayıt/duplicate regression testleri, TypeScript, production build ve önceki responsive kontrolleri başarılı.
## 2026-09-16 — Sözleşme ekranı ve çıktı düzeni

- [x] Sözleşme kayıt formunu tüm sayfayı kaplayan uzun panel yerine kompakt, bölümlenebilir müşteri/sözleşme/çıktı akışına dönüştür.
- [x] Sözleşme ekranındaki telefon alanlarında ortak telefon biçimlendirme ve doğrulama kuralını çalıştır. Dinamik telefon alanları artık `+90 5XX XXX XX XX` biçimine geçiyor.
- [x] Sözleşme ekranındaki tarih alanlarını ortak GG.AA.YYYY giriş/gösterim ve doğrulama kuralına bağla. Tarih alanları TurkishDateInput bileşenine bağlandı.
- [x] Sözleşme müşteri alanlarını müşteri kütüğünden recall et; sözleşmede TCKN etiketini `TCKN:` olarak açık göster.
- [x] Sözleşme yazdırma/PDF çıktısını gerçek A4 portrait akışına göre ortala; üç sayfalık gereksiz taşma ve kötü sayfa ortalamasını düzelt.
- [x] Maddeler, taraf bilgileri ve imza alanını örnek sözleşmedeki dengeli yerleşime göre düzenle.
- [x] Sözleşme formu, müşteri recall, maskeleme, telefon/tarih, PDF sayfa sayısı ve mobil görünüm için testleri güncelle. İlgili source/privacy/form/PDF testleri, TypeScript, build ve görsel kontroller başarılı.

## 2026-09-16 — Kat karşılığı sözleşmesi kontrol adımı düzeltmesi
- [x] Ön kontrol listesini sözleşme formunun başından kaldır; tüm sözleşme alanları doldurulduktan sonra son kayıt/onay adımında göster.
- [x] Kontrol listesindeki her maddeyi danışmanın ayrı ayrı işaretleyebileceği, çalışır checkbox alanlarına bağla.
- [x] Tüm maddeler işaretlenmeden sözleşmenin tamamlanmasına izin verme; eksik maddeleri açıkça göster.
- [x] Kontrol listesinin kim tarafından, ne zaman ve hangi maddelerle tamamlandığını audit kaydında koru; manager incelemesine görünür yap.
- [x] Protokol/sözleşme kayıt düğmesi metnini kontrol listesi onayını açıkça belirtecek şekilde düzenle.
- [x] Kat karşılığı sözleşme kontrol akışı için frontend/server regresyon testleri ekle.
- [x] Sözleşme belgesi tablolarındaki doldurulmuş değerleri yatay ve dikey olarak ortala; A4 PDF çıktısında okunabilirliği doğrula.
- [x] Kontrol listesi son adımı, sözleşme kaydı, PDF ve mobil görünümü masaüstü/mobil testlerle doğrula.

## 2026-09-16 — Yetki sözleşmesi Word benzeri sayfa marjı
- [x] Yetki sözleşmesi A4 yazdırma marjlarını üst/alt/sağ/sol yaklaşık 2,54 cm olacak şekilde eşitle.
- [x] Başlık, alt bilgi, tablo ve imza alanlarının güvenli sayfa boşluklarını optimize et; gereksiz üç sayfa taşmasını önle.
- [x] Yetki sözleşmesi PDF sayfa sayısını ve masaüstü/mobil görünümü doğrula.

## 2026-09-16 — Tüm belge türleri için ortak A4 standardı
- [x] Kira, yetki, satış, kat karşılığı, teknik şartname ve teslim eklerinin belge bileşenlerini ortak yazdırma sınıfları açısından envanterle.
- [x] Tüm A4 belgeleri için Word’e yakın ortak marj, yazı boyutu, satır aralığı, başlık, alt bilgi ve güvenli alan standardı oluştur.
- [x] Tüm belge tablolarında başlık/değer hizası, dikey ortalama, hücre iç boşluğu ve imza alanı standardını uygula.
- [x] Uzun sözleşme, teknik şartname ve teslim eklerinde sayfa taşması ile portrait/landscape istisnalarını belge türüne göre doğrula.
- [x] Ortak belge standardı için regression testleri, build ve masaüstü/mobil/PDF görsel doğrulaması yap.

- [x] Çoklu mülk portföy PDF dışa aktarımını popup yerine ortak uygulama içi A4 önizlemeye bağla; Excel dışa aktarımını ve otomatik dosya adını koru. Regression testi, TypeScript ve production build başarılı.

## 2026-09-16 — CT1 danışman ekranı kabulü
- [x] CT1/C-TERCAN hesabıyla çekilen gerçek ekran görüntülerini broker manager görünümünden ayrı değerlendirme; kontrol listesi, müşteri kapsamı, telefon/TCKN maskelemesi ve sözleşme ilerleme akışını danışman rolüyle eşleştir. Kaynak erişim kuralları CT1 danışman sahipliğiyle doğrulandı; farklı danışman kayıtları maskeli ve yetki dışı.
- [x] CT1 danışman kapsamı için ilgili regression testlerini, TypeScript/build ve gerçek ekran kabul notunu güncelle. 5 erişim + 2 müşteri recall testi, TypeScript/build ve `docs/ct1-consultant-acceptance-2026-09-16.md` tamamlandı; gerçek cihazda son kullanıcı kabulü ayrı açık kaldı.
- [x] CT1 yetki sözleşmesi müşteri seçimi, müşteri kütüğündeki yapılandırılmış telefon/TCKN/adres bilgilerini forma doldursun; TCKN sözleşmede açık, listelerde maskeli kalsın ve recall regression testi eklensin. Offline müşteri formuna yapılandırılmış telefon/TCKN alanları, yetki sözleşmesi recallı, legacy düz metin uyumluluğu ve 7 test eklendi; TypeScript/build başarılı.
- [x] Yetki sözleşmesi portföy dropdownu malik seçimine bağlı taşınmazları öncelikli göstermeli; mevcut eski mülk kayıtlarında eşleşme yoksa liste boş kalmamalı ve kullanıcıya açık durum mesajı vermeli. MÜŞTERİ_ID eşleştirmesi, MALİK adı fallback’i, danışman kapsamı ve legacy kayıt fallback’i uygulandı; regression testi, TypeScript ve production build başarılı.
- [x] Dashboard TCMB kur kartı ve merkezi veri yükleniyor durumları için uzun bekleme halinde açık hata/yenileme geri dönüşü ekle; veri gelmezse kullanıcıya sonsuz yükleniyor mesajı gösterme. 10 saniye timeout, açık hata metni ve “Tekrar dene” düğmesi eklendi; TypeScript, regression testi ve production build başarılı.

## 2026-09-16 — Yetki sözleşmesi kritik kayıt ve veri biçimlendirme düzeltmesi
- [x] Yetki sözleşmesi taslak oluştur düğmesinin neden kayıt oluşturmadığını bul; kullanıcıya görünür hata/başarı mesajı ver ve kayıt koşulunu düzelt. Online form artık consultant-scoped otomatik numara öneriyor, YET-2026-001 gibi geçersiz numarayı önlüyor ve server hata mesajını görünür gösteriyor.
- [x] Yetki ve kira sözleşmesi telefon alanlarını ülke kodu ile `+90 5XX XXX XX XX` standardında göster; form ve PDF çıktısını birlikte doğrula. AuthorityContract normalize/online form akışı ortak gruplu telefon yardımcılarına bağlandı.
- [x] Yetki/kira bedel alanlarında `75000` değerinin `75` olarak kaybolmasını engelle; binlik ayracı ve sayısal parse/format dönüşümünü regression testiyle koru. Noktalı Türkçe binlik değerler artık doğru parse ediliyor; `75000` → `75.000` ve PDF → `75.000 ₺`, kuruşsuz.
- [x] Bedel biçimlendirmesi kuruş göstermesin; `75000` değeri ekranda ve PDF’de yalnızca `75.000` olarak görünmeli, `75` veya `75.000,00` olmamalı. AuthorityContract regression testi bu davranışı doğruluyor.

## 2026-09-16 — Mustafa Ekin portföy dropdown yeniden doğrulama
- [x] Mustafa Ekin’e ait taşınmaz kayıtlarını malik müşteri kimliği, malik adı, danışman kodu ve kayıt ayrıntılarıyla doğrula. Yeni alternatif akışta bu alanlar birlikte okunuyor; gerçek cihaz kabulü ayrı açık.
- [x] Yetki sözleşmesi portföy dropdownunun boş kalmasına neden olan filtre anahtarını düzelt; malik seçimi sonrası bağlı taşınmazları görünür ve seçilebilir yap. Müşteri adı altında listeleme korunarak malik ID/ad/JSON fallback ve bağımsız arama uygulandı.
- [x] Eski malik bağlantısız kayıtlar için güvenli fallback/eşleştirme uygula; ilgisiz danışman kayıtlarını listeye dahil etme. Fallback yalnız danışman kapsamındaki propertyRecords üzerinde çalışıyor.
- [x] Mustafa Ekin senaryosu için regression testi, TypeScript, production build ve canlı önizleme doğrulaması yap. Selection/recall regression testleri, TypeScript ve production build başarılı; gerçek cihaz kabulü kullanıcı testine bırakıldı.

## 2026-09-16 — Müşteri bazlı alternatif portföy seçimi
- [x] Müşteri seçildiğinde taşınmazları müşteri adı altında göstermeye devam et; malik ID yoksa malik adıyla güvenli fallback kullan. MÜŞTERİ_ID, MALİK adı ve yapılandırılmış JSON ayrıntısı birlikte okunuyor.
- [x] Portföy dropdownunu yalnız malik ID eşleşmesine bağımlı olmaktan çıkar; danışman kapsamındaki mülklerden yardımcı arama/seçim yolu ekle. Müşteri altında filtreleme korunuyor; taşınmaz adı/adres araması bağımsız yardımcı yol olarak eklendi.
- [x] Bağımsız taşınmaz seçildiğinde ilgili müşteriyi ve sözleşme alanlarını otomatik doldur; danışman mahremiyeti korunmalı. Seçim müşteri kaydını ve malik adını geri bağlıyor; propertyRecords server/rol kapsamı içinde kalıyor.
- [x] Mustafa Ekin senaryosu için regression testi, TypeScript, production build ve gerçek önizleme doğrulaması yap. Portföy selection regression testi, TypeScript ve production build başarılı; gerçek cihaz kabulü kullanıcı testinde yapılacak.

## 2026-09-16 — Yetki sözleşmesi varsayılan alanları
- [x] Ofis adresi, ofis telefonu, danışman yetki belgesi numarası ve danışman telefonunu form açılışında yetkili varsayılan bilgilerle doldur. Global 1881 ofis bilgileri ve bilinen KT1/CT1 profilleri varsayılan geliyor; kullanıcı alanları düzenleyebiliyor.
- [x] Malik seçildiğinde malik adresini müşteri kütüğünden otomatik recall et; malik değiştiğinde adresi de güvenli biçimde yenile. `decodeOfflineClientDetails` üzerinden adres/telefon/TCKN recallı korunuyor.
- [x] Varsayılan değerlerin kullanıcı tarafından işlem özelinde düzenlenebilmesini koru; PDF ve mobil formda doğrula. Kontrollü input state’i, 14 regression testi, TypeScript ve production build başarılı.

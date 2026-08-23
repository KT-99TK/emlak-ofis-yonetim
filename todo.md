# Project TODO

- [x] İncelenecek HTML örnek paketini projeye al ve sayfa, navigasyon, iş akışı, arayüz kalıpları ve veri alanları envanterini çıkar
- [x] Broker manager ve consultant rolleri için hiyerarşi, görünürlük ve işlem yetki matrisi oluştur
- [x] Güvenli giriş, kullanıcı yönetimi, takım/manager ilişkisi, rol tabanlı ekran/işlem izinlerini uygula
- [x] Müşteri kayıtlarını tekilleştir ve müşteri bilgilerini sözleşmelerle ilişkilendir
- [x] Mülk kayıtlarını tekilleştir ve mülk bilgilerini kira/satış sözleşmeleriyle ilişkilendir
- [x] Ofis onaylı kira sözleşmesi şablonlarını, kayıtlarını, durumlarını ve yazdırılabilir çıktılarını uygula
- [x] Ofis onaylı satış sözleşmesi şablonlarını, kayıtlarını, durumlarını ve yazdırılabilir çıktılarını uygula
- [x] Sözleşme durum geçişleri, onay akışları ve kritik değişikliklerin audit kayıtlarını uygula
- [x] Gelir, gider, alacak, borç ve işlem bağlantılı tahsilat/ödeme kayıtlarını içeren ön muhasebe modülünü uygula
- [x] Broker manager için ekip bazlı sözleşme, tahsilat, ödeme ve nakit akışı özetlerini uygula
- [x] Ofise özel logo, tipografi, renk sistemi ve HTML örneğinden uyarlanan görsel kalıpları uygula
- [x] Ana karşılama alanını Türkçe yerel tarih ve “İyi çalışmalar, gününüz bereketli geçsin.” selamlamasıyla güncelle
- [x] Responsive ekranları, boş/yükleniyor/hata durumlarını ve erişilebilir klavye akışlarını doğrula
- [x] Vitest testlerini yaz, tür kontrolü ve test komutlarını çalıştır
- [x] Uygulama ilk sürümünü checkpoint ile teslimata hazırla

## Yeni kapsam: kira dönemleri, vergi takibi ve veri güvenliği

- [x] Kira dönemi, kira tahakkuku, vergi yükümlülüğü ve ödeme tarihlerini modelle
- [x] Vade tarihinden önce çok kademeli uygulama içi uyarı ve bildirim tercihleri ekle
- [x] Kira/vergi ödeme durumlarını ve gecikme risklerini dashboard üzerinde göster
- [x] Kira ve vergi mali tablolarını dönem, portföy, danışman ve ödeme durumu bazında oluştur
- [x] PC tek kullanıcı ve server merkezi kullanımını ayıran veri içe/dışa aktarma akışını tasarla
- [ ] Şifreli yedek alma, geri yükleme öncesi doğrulama, sürümleme ve audit kaydı ekle
- [ ] Periyodik uyarıların platform zamanlayıcısı ile güvenli, idempotent ve deploy sonrası çalışmasını uygula
- [x] Yeni vade, mali tablo ve yedekleme akışlarını test edip güncel checkpoint oluştur

## Mimari kararı: merkezi server + PC kısa yolu

- [x] Merkezi serverı tek doğruluk kaynağı olarak belgeleyip istemci bağlantı ve kısa yol kullanım kılavuzunu hazırla
- [x] PC üzerinde veri tutmayan güvenli web kısayolu/PWA kullanım modelini uygula
- [x] Server erişilemezse salt-okunur durum, bağlantı uyarısı ve yeniden bağlanma akışını tanımla
- [x] Merkezi yedekleme ve geri yükleme işlemlerini yalnızca manager yetkisiyle çalıştır

## Yeni kapsam: tahliye ve yeniden kiralama onayı

- [x] Kira sözleşmesine tahliye ihbar süresi, anlaşmaya özel bildirim kuralı ve tahliye tarihi alanlarını ekle
- [x] İki ay veya tanımlanan süre öncesinde danışman/manager uyarı akışını ekle
- [x] Tahliye yaklaşan kiralıkları ayrı görev ve takvim görünümünde göster
- [x] Yeniden kiralama talebini mülk sahibi onayına gönderen durum akışını ekle
- [x] Mülk sahibi onayı alınmadan yeni kiralama ilanı oluşturmayı server tarafında engelle
- [x] Onay, ret, tarih ve açıklama bilgilerini audit kaydına yaz
- [x] Geçiş dönemi için yerel/tek kullanıcı çalışma ve merkezi servera aktarılabilir yedek formatını netleştir

## Yeni kapsam: bağımsız geçiş sürümü

- [x] Her laptopta bağımsız çalışacak yerel veri katmanını ve kurulum modelini belirle
- [x] Her kullanıcı için imzalı/tarihçeli yedek dışa aktarma dosyası üret
- [x] Manager laptopunda üç yedeği doğrulayıp çakışmaları gösteren birleştirme ekranı oluştur
- [x] Birleştirme sonrası yeni ana yedek üret ve geri alma noktası sakla
- [x] Bağımsız geçiş verisini gelecekte merkezi server veritabanına aktarılabilir formatta tut
- [x] Üç laptoplu deneme prosedürünü ve veri kaybını önleme kılavuzunu hazırla

## Kesinleşen ortam: Windows 10/11 offline

- [x] Windows 10/11 için bağımsız offline masaüstü paketleme yaklaşımını seç ve proje kararını belgeleyerek kaydet
- [x] Her laptop için cihaz kimliği, kullanıcı kimliği, kayıt sürümü ve son senkronizasyon bilgilerini ekle
- [x] Offline çalışma sırasında kira, vergi, tahliye, onay, sözleşme ve ön muhasebe kayıtlarının yerel veritabanına yazılmasını sağla
- [x] Manager laptopunda üç cihaz yedeğini çakışma kontrollü birleştirme akışına dönüştür
- [x] Kurulum, masaüstü kısayolu, haftalık yedek ve geri alma prosedürünü Windows kullanıcı kılavuzuna yaz

## Offline sürüm teknik tamamlamaları

- [x] Yedek dosyalarına checksum/imza doğrulaması, backup manifesti ve geri yükleme doğrulama akışı ekle
- [x] Offline sürüm için gerçek Windows masaüstü paketleme teknolojisini seçip build/install scriptleri ve konfigürasyonu uygula
- [x] Offline veri modeline userId, recordVersion ve lastSyncAt alanlarını ekleyip UI ve backup akışına bağla
- [x] Tahliye, mülk sahibi onayı ve ön muhasebe için ayrı offline entity'ler ve gerçek form alanları ekle

## Mimari tutarlılık ve dağıtım düzeltmeleri

- [x] Offline geçiş sürümü için tek yerel veri katmanı seç ve dokümantasyon ile kodu aynı mimaride hizala
- [x] Windows offline sürüm için desteklenen dağıtım formatını üret, doğrula ve kullanım adımlarını belgeye bağla
- [x] Seçilen yerel veri katmanını manager birleştirme akışıyla uyumlu hale getirip üç laptop senaryosu için son kurulum modelini netleştir

## Yedek manifesti ve doğrulama görünürlüğü

- [x] Offline yedekler için checksum’a ek olarak cihaz, kullanıcı, sürüm, kayıt sayısı, oluşturulma zamanı, checksum ve imza alanlarını içeren manifest ekle
- [x] Geri yükleme/birleştirme öncesi manifest önizlemesi ve doğrulama sonucunu kullanıcıya göster
- [x] Başarısız manifest/checksum doğrulamasında içe aktarmayı kesin olarak engelle

## Güvenli içe aktarma onayı

- [x] Yedekleri önce parse/doğrula, manifest önizlemesini göster; manager onayından sonra ayrı apply/import adımıyla veriyi yaz
- [x] Tekil geri yükleme akışında cihaz, kullanıcı, sürüm, kayıt sayısı, tarih ve checksum/imza durumunu gösteren önizleme ekle

## Offline kullanıcı kimliği

- [x] Offline sürümde kullanıcı kimliğini ayarlayan ve koruyan kurulum/ayar ekranı ekle; gerçek userId manifestte üretilebilsin
- [x] Yedek dosya adı ve manifest önizlemesinde cihaz ile kullanıcı bilgisini görünür göster

## Son kullanıcı kimliği doğrulamaları

- [x] Manifest önizlemesinde userId alanını açıkça göster ve ekran kontrolüyle doğrula
- [x] Offline kullanıcı kimliği ayarlanmadan kayıt oluşturma ve yedek alma işlemlerini engelle veya açık uyarı göster

## Manifest UI doğrulaması

- [x] Manifest önizlemesinde userId görünümünü son değişiklikten sonra screenshot veya UI testi ile doğrula ve kaydet
- [x] Tekil/çoklu yedek önizleme ekranları için userId, deviceId ve doğrulama durumunu kapsayan UI doğrulama testi ekle

## Ana yedek ve geri alma akışı

- [x] Manager birleştirme onayından sonra birleşik veriden yeni ana yedek dosyası üret ve indir/sakla
- [x] Rollback snapshot’ını geri yükleyebilen gerçek geri alma UI/işlemini ekle ve doğrula
- [x] Birleştirme sonrası ana yedek ve rollback akışını ekran testi veya kullanım doğrulamasıyla kanıtla

## Windows kısayol doğrulaması

- [x] Windows geçiş kılavuzuna masaüstü kısayolu oluşturma ve kullanma adımlarını ekle
- [x] Kılavuzdaki kurulum ve kısayol bölümünü dosya içeriği kontrolüyle doğrula

## Offline güvenli işlem düzeltmeleri

- [x] Offline formları entity bazlı ayır: tahliye ihbar tarihi/süresi, owner approval karar/durum/not, ledger işlem tipi/tutar/vade alanları
- [x] Manager merge akışında manager userId zorunluluğu koy; ana yedek üretimi başarısızsa kayıt yazımını engelle veya rollback uygula
- [x] Rollback sırasında mevcut yerel kayıtları snapshot ile tam eşitle; gerekirse store’u temizleyip snapshot’ı yeniden yaz
- [x] Bu üç güvenli işlem düzeltmesini UI veya birim testleriyle doğrula

## Global 1881 marka varlıkları

- [x] Paylaşılan yatay logoyu arayüz, Electron paket ve print-ready doküman başlıklarında kullan
- [x] Paylaşılan şeffaf mühür görselini sözleşme çıktılarında opsiyonel marka/mühür alanı olarak kullan
- [x] Logo ve mühür varlıklarını Windows offline paketinde ve yeniden üretilebilir asset akışında belgeleyip doğrula
- [ ] Offline uygulamanın sol üst marka alanında koyu logo yerine açık renkli mühür tarzı Global 1881 işaretini kullan

## Windows marka paketleme doğrulaması

- [x] Electron/Windows paketinde logo kullanımını uygulama ikonu veya offline kabuk branding ayarıyla açıkça bağla
- [x] Windows offline kılavuzuna logo/mühür asset yollarını, yeniden üretim komutunu ve paket kullanım yerlerini ekle
- [x] Logo/mühür entegrasyonunu dosya-temelli doğrulama veya ekran kontrolüyle kanıtla

## Offline metadata görünürlüğü

- [x] Offline kayıt listesinde recordVersion ve lastSyncAt alanlarını kullanıcıya göster
- [x] Kayıt güncelleme veya merge senaryosunda recordVersion artışını açıkça uygula
- [x] userId, recordVersion ve lastSyncAt için UI/backup/import doğrulama testi veya ekran kanıtı ekle

## Vade uyarı tercihleri

- [x] Kullanıcı bazlı bildirim tercihleri için gün sayısı, seviye ve popup/açılış uyarısı ayarlarını ekle
- [x] Kira/vergi uyarılarını tercihleri okuyarak gerçek uygulama içi bildirim/popup akışına bağla
- [x] Bildirim tercihleri ve popup akışını UI kontrolüyle doğrula

## Vade ekranı rota düzeltmesi

- [x] Dashboard menüsündeki Kira & Vergi Vadeleri bağlantısını Obligations sayfasına bağla ve 404 olmadan doğrula

## Uyarı seviyesi tercihi

- [x] Kullanıcı bazlı uyarı seviyesi seçimi ekle: sadece acil, erken+acil veya gecikmiş dahil
- [x] Popup mantığını seçilen uyarı seviyesini okuyacak şekilde güncelle
- [x] Uyarı seviyesi tercihini ekranda doğrula

## Kullanıcı bazlı uyarı doğrulaması

- [x] Uyarı tercihlerini cihaz-geneli anahtar yerine oturumdaki kullanıcı kimliğine göre ayrı sakla ve yükle
- [x] Gecikmiş dahil seviyesini yaklaşan ve gecikmiş kayıtları birlikte kapsayacak şekilde düzelt
- [x] Uyarı seviyelerinin popup kapsamını test eden küçük birim/UI doğrulaması ekle

## Vitest client uyarı testleri

- [x] Vitest include globuna client/src/**/*.test.ts dosyalarını ekle
- [x] urgent, early ve overdue seviyelerinin çalışan test çıktısında görünmesini sağla
- [x] Gerekirse her uyarı seviyesinin UI davranışını ayrı ekran doğrulamasıyla kanıtla

## Uyarı seviyesi etkileşim doğrulaması

- [x] urgent, early ve overdue seçenekleri için popup kapsamını temsil eden ayrı client test senaryoları ekle
- [x] Seviye değiştiğinde tercih anahtarının değiştiğini ve popup kapsamının doğru hesaplandığını doğrula

## Uyarı tercihi saklama davranışı

- [x] Preference key’in user + alan bazlı sabit kaldığını ve noticeLevel değerinin aynı key altında güncellendiğini dokümante et
- [x] noticeLevel değişiminde popup kapsamının yeniden hesaplandığını test eden açık istemci testi ekle

## Manifest alanları ve merge ekran kanıtı

- [x] Tekil restore önizlemesine exportedAt tarihini ve checksum/imza doğrulama durumlarını ayrı alanlar olarak göster
- [x] Offline-merge ekranında ana yedek ve rollback kontrol sonuçlarını görünür doğrulama mesajlarıyla kanıtla
- [x] Tekil restore ve manager merge manifest alanları için UI doğrulama testi ekle

## Rapor kırılımları ve rollback sonucu

- [x] Kira/vergi mali tablolarına portföy ve danışman kırılımları ekle; ödeme durumunu gerçek satır/kolon tablosunda göster
- [x] Offline-merge rollback işlemi için görünür başarı ve hata mesajı ekle
- [x] Mali tablo dönem + portföy + danışman + ödeme durumu kombinasyonlarını ekran/test kanıtıyla doğrula

## Windows kurulum ve ekip dağıtımı

- [x] Windows Electron kurulum paketinin üretim, kurulum ve ekip paylaşım prosedürünü belgeleyip doğrula
- [x] Manus proje klasörü ile çalışanların kuracağı Windows programını birbirinden ayıran dağıtım açıklamasını ekle

## Otomatik Windows paketleme

- [x] ZIP içinden çalıştırılabilen Windows paketleme scripti ekle; proje klasörünü doğrula, pnpm/dependency hazırlığını yap, check çalıştır ve `.exe` üret
- [x] Script hata durumlarını Türkçe açıklamalarla yönlendir ve kullanıcı kılavuzuna bağla

## Otomatik Windows paketleme

- [x] ZIP içinden çalıştırılabilen Windows paketleme scripti ekle; proje klasörünü doğrula, pnpm/dependency hazırlığını yap, check çalıştır ve `.exe` üret
- [x] Script hata durumlarını Türkçe açıklamalarla yönlendir ve kullanıcı kılavuzuna bağla

## Manifest UI kanıtı düzeltmeleri

- [x] OfflineWorkspace tekil restore manifest önizlemesini örnek doğrulanmış manifest verisiyle render eden ve userId/deviceId/exportedAt/checksum/ECDSA alanlarını assert eden component/UI testi ekle
- [x] BackupMerge manifest satırlarını örnek çoklu manifest verisiyle render eden ve userId/deviceId/checksum/signature durumlarını DOM üzerinden doğrulayan component/UI testi ekle
- [ ] Tekil restore manifestinde userId görünümünü gerçek dolu önizleme durumuyla screenshot veya Electron içi görsel kanıt olarak kaydet

## Windows script EPERM düzeltmesi

- [x] Corepack Program Files izin hatasında npx pnpm fallback kullan; scripti normal kullanıcı yetkisiyle çalışabilir hale getir
- [x] EPERM hata açıklamasını ve güncel script kullanımını Windows kılavuzuna ekle

## Windows Electron boş pencere düzeltmesi

- [x] Paketlenmiş Electron uygulamasında arayüzün görünmemesi sorununu reproduce/teşhis et ve `dist/public` yükleme yolunu düzelt
- [x] Electron paket içeriği, açılış logları ve Windows kurulum talimatlarını runtime sonucu ile doğrula

## Paketlenmiş Electron runtime kanıtı

- [x] Windows’ta üretilen güncel `.exe`/kurulu uygulamayı açıp arayüzün gerçekten yüklendiğini ekran görüntüsü veya kullanıcı doğrulama notuyla kaydet
- [x] Paketlenmiş Electron açılışında kullanılan dosya yolunu ve arayüz yükleme başarısını görünürleştiren startup log/diagnostic mesajı ekle veya mevcut log kanıtını kaydet

## Tekrarlayan Windows boş pencere incelemesi

- [x] Kullanıcıdan startup.log veya paketlenmiş uygulama ekran kanıtını alıp gerçek Windows runtime sonucunu teşhis et
- [x] Gerekirse Electron paket yolunu/asset yükleme stratejisini yeniden düzelt ve temiz kurulum prosedürünü belgeleyerek doğrula

## PowerShell npx.cmd uyumluluğu

- [x] pnpm fallback çağrısını PowerShell Execution Policy’den etkilenmeyen `npx.cmd` biçimine geçir
- [x] npx.ps1 engelleme senaryosunu Windows kılavuzunda açıkla ve yeni scripti doğrula

## Windows gerçek paketleme kanıtı

- [x] Güncellenmiş `WINDOWS-KURULUM.bat`/`WINDOWS-KURULUM.ps1` akışını gerçek Windows PowerShell ortamında çalıştırıp npx.cmd fallback ile `.exe` üretimini kullanıcı kanıtı veya log ile doğrula
- [x] npx.ps1 çözümünden sonra oluşan gerçek başarılı paketleme çıktısını `release/*.exe` veya kullanıcı teyidiyle kaydet

## Electron offline sign-in düzeltmesi

- [x] Electron ortamında merkezi Manus auth yönlendirmesini bypass et; offline ekranını kimlik doğrulamasız aç
- [x] Electron açılış rotasını doğrudan `/offline` yap ve merkezi web auth akışını koru
- [x] Windows paketinde offline açılış ve web uygulamasında sign-in davranışını ayrı ayrı doğrula

## Electron auth bypass gerçek kanıtı

- [x] Güncel checkpointten üretilen Windows `.exe` uygulamasını açıp doğrudan offline çalışma alanını gösterdiğini kullanıcı teyidi veya ekran görüntüsüyle kaydet
- [ ] Paketlenmiş Electron `startup.log` içeriğini alıp auth bypass sonrası başlangıç ekranı yüklemesini doğrula
- [x] Gerekirse Electron başlangıcında boş hash/path durumunda `#/offline` değerini açıkça yazıp rota kanıtını netleştir

## Eski Electron paketiyle karışmayı önleme

- [x] Windows paket sürümünü 1.0.1’e çıkar ve açılış tanı kaydında sürüm/initialRoute bilgisini görünür tut
- [x] Kurulum kılavuzuna eski uygulamayı kaldırma, yeni sürüm klasörünü doğrulama ve temiz kurulum adımlarını ekle
- [ ] Windows gerçek doğrulaması için 1.0.1 `.exe` ve `startup.log` kullanıcı teyidini kaydet

## Electron file protocol auth fallback

- [x] Desktop tespitini preload bayrağına ek olarak `file:` protokolüyle sağlamlaştır; paketli Electron’da auth ve offline UI ayrımı kesin çalışsın

## 1.0.2 kesin paket ayrımı

- [x] Windows uygulama sürümünü 1.0.2’ye çıkar, kılavuz ve installer çıktı adını senkronize et
- [x] 1.0.2 üretim HTML/metadata ve script doğrulamasını yapıp yeni checkpoint oluştur

- [x] ManifestPreviewRow/OfflineWorkspace manifest component testine `exportedAt` alanının render edilen tarih çıktısı için açık assertion ekle ve test çıktısında doğrula

## Checkpoint kurtarma ve Electron offline düzeltmesi

- [x] Büyük release build dosyaları içermeyen temiz checkpoint tabanında offline sidebar hash yönlendirmesini yeniden uygula
- [x] Electron offline sidebar’daki sıkışık Global 1881 marka alanını file-safe yerel lockup ile yeniden uygula
- [x] Test/build sonrası checkpoint aktarımını doğrula ve güncel Windows kaynak ZIP’ini hazırla

## Windows fallback çalışma kanıtı

- [ ] Güncel Windows paketleme logunda `npx.cmd --yes pnpm@10.4.1` fallback yolunun gerçekten kullanıldığını veya `pnpm.cmd` bulunduğunu açıkça doğrula
- [x] Güncel paketleme çıktısında FINAL `.exe` üretim satırını kullanıcı logu ya da ekran görüntüsüyle kaydet

## Claude Yetki Sözleşmeleri — ilk adım

- [x] Claude yetki sözleşmesi alanlarını müşteri, mülk, danışman ve ofis kayıtlarına eşleştir
- [x] Yetki Sözleşmeleri için ayrı merkezi menü/rota, satış-kiralama seçimi ve otomatik doldurma formu oluştur
- [x] Canlı belge önizlemesi, güvenli details snapshot kaydı ve rol kontrollü kayıt akışını uygula
- [ ] Yetki sözleşmesi ekranını birim testleri, production build ve kullanıcı kontrolüyle doğrula

## Offline sözleşme çalışma alanı

- [x] Yerel Çalışma Alanı kayıt listesinde ham JSON snapshot metni yerine kayıt türüne göre kullanıcı dostu kısa özet göster
- [x] Yetki ve kira sözleşmesi kayıt tiplerini mevcut IndexedDB offline store, manifest ve merge şemasıyla eşleştir
- [x] Electron offline sidebar’a Yetki Sözleşmeleri ve Kira Sözleşmeleri menülerini güvenli hash rotaları olarak ekle
- [x] Claude düzenli Offline Yetki Sözleşmeleri formunu, canlı belge önizlemesini ve yerel taslak kaydını uygula
- [x] Claude düzenli Offline Kira Sözleşmeleri formunu; kira/depozito/süre/tahliye hesaplamaları ve yerel vade kayıtlarıyla uygula
- [x] Offline sözleşme kayıtlarını AES-GCM şifreli export, manifest/checksum/imza ve manager merge akışına dahil et
- [ ] Windows offline sözleşme ekranlarını gerçek paket ve kullanıcı ekran kanıtıyla doğrula

## Offline yetki sözleşmesi performans ve yazdırma iyileştirmeleri

- [x] Danışman baş harfi ve kişi bazlı sıra numarası içeren değişmez offline yetki sözleşmesi kayıt numarasını tasarla ve kaydet
- [x] Yetki sözleşmesine hizmet bedeli, para birimi ve danışman performansına temel olacak tutar alanlarını ekle
- [x] Yetki sözleşmesi metinlerini ad-soyad baş harfleri büyük olacak şekilde; telefonları uluslararası görünüme dönüştürecek biçimlendirme kurallarını uygula
- [x] Offline danışman başına sözleşme sayısı, madde bedeli ve hizmet bedeli toplamlarını sunan performans tablosunu ekle
- [x] Tutarlı çok sayfalı A4 sözleşme önizlemesi, ayarlanabilir okunabilir punto, sayfa başlığı/numarası ve taşma kontrolünü uygula
- [ ] Gerçek Windows paketinde yeni yetki sözleşmesi numarası, performans tablosu ve print preview akışını kullanıcı ekran kanıtıyla doğrula

## Offline yetki taslağı geri çağırma ve veri sürekliliği

- [x] Önceki offline yetki sözleşmesi snapshot kayıtlarını ada veya kayıt numarasına göre bulup forma kopyalama akışını ekle
- [x] Eski v1 ve güncel v2 yetki sözleşmesi snapshot’larının aynı yerel IndexedDB ve şifreli yedek/merge akışında erişilebilir olduğunu test et
- [ ] Gerçek Windows güncellemesinde Mert Somuncu gibi önceki taslakların seçilip yeni forma kopyalandığını kullanıcı ekran kanıtıyla doğrula
- [x] Offline yetki sözleşmesi kaydetme düğmesinde metin ve ikon kontrastını tüm durumlarda okunabilir yap

## Offline yetki sözleşmesi tam şablon ve para biçimi

- [x] Sözleşme, hizmet bedeli ve para tutarı girişlerini kuruşsuz Türkçe binlik ayırıcılarla otomatik biçimlendir; tam TL snapshot değerini güvenle koru
- [x] Yetki sözleşmesi A4 önizlemesini danışman, malik ve taşınmaz bilgi tabloları içeren tam form düzenine dönüştür
- [x] Kullanıcının sağladığı şablonun satış/kiralama koşullarını, ayrı ve değişmez sürüm etiketi taşıyan okunabilir numaralı belge bölümü olarak ekle
- [ ] Tam şablonun çok sayfalı yazdırma, offline kayıt, şifreli yedek/merge ve kullanıcı Windows ekran doğrulamasını tamamla
- [x] A4 belge önizlemesini doldurulabilir formun altına taşı ve eksik zorunlu alanları görünür biçimde uyar
- [x] Yetki sözleşmesi kaydetme düğmesini nötr şeffaf, eksik alanda kırmızı ve başarılı kayıtta Oxford yeşili durumlarına bağla

## Offline kira sözleşmesi tam şablon

- [x] Claude kira şablonundaki konut ve işyeri koşullarını, teslim/demirbaş ile imza bölümlerini kaynak içerikle eşleştir
- [x] Konut ve işyeri koşullarını ayrı değişmez sürüm etiketi ve snapshot olarak offline kira sözleşmesi kaydına ekle
- [x] Offline kira A4 önizlemesini bilgi tabloları, tam koşullar, teslim/demirbaş ve imza bölümleriyle form altına yerleştir
- [ ] Konut/işyeri kira tam şablonunu yazdırma, şifreli yedek/merge ve gerçek Windows ekran kanıtıyla doğrula

## Hizmet bedeli KDV tahsilat kaybı göstergesi

- [x] Satışta %2 hizmet bedeli, kiralamada bir aylık kira bedeli ve %20 KDV varsayımları için brüt/net tahsilat hesaplamasını ekle
- [x] KDV’nin ayrıca tahsil edilmediği, tahsil edilen tutarın KDV dahil faturaya dönüştürüldüğü senaryodaki tahmini KDV yükü ve net gelir kaybını hesapla
- [x] Danışman performans ve yıllık özet tablolarında ayrıca tahsil edilmeyen KDV, net hizmet geliri ve tahmini kayıp sütunlarını göster
- [ ] KDV hesaplama örneklerini birim testlerle, gerçek Windows rapor ekranını kullanıcı kanıtıyla doğrula
- [x] Yetki ve kira A4 belgelerinde sol/sağ yazdırma marjını Windows standartlarına uygun daraltarak yatay kullanılabilir alanı genişlet
- [x] Yetki ve kira sözleşmesi koşullarında 1., 2., 3. madde numaralarının ekran ve yazdırmada görünmesini sağla
- [x] Danışman Performansı menü ve ekran dilini puanlama içermeyen Sözleşme ve Finansal İstatistikler olarak değiştir
- [x] Kişinin yalnız kendi sözleşme ve tahsilat özetini, sıralama veya diğer danışman verisi olmadan görebileceği Benim Sözleşmelerim görünümünü ekle

## Yıllık danışman ciro hedefleri

- [x] Danışmanın yıl bazlı kendi ciro hedefini yazabileceği, değişiklik geçmişi taşıyan offline hedef kaydını ekle
- [x] Benim Sözleşmelerim ekranına kişinin hedefi, gerçekleşen ciro, kalan tutar ve hedefe ilerleme oranını ekle
- [x] Broker yöneticinin hedef-gerçekleşen-sapma görünümünü yalnız yetkili hesapta gösterecek erişim kuralını ekle
- [ ] Hedef kayıtlarını şifreli yedek/merge ile uyumlu kıl ve hedef hesaplarını birim/Windows testleriyle doğrula

## Offline müşteri talepleri ve portföy eşleştirme

- [x] Danışmanın satın alma veya kiralama müşteri talebini konum, bütçe, nitelik, zamanlama ve notlarıyla gireceği offline formu ekle
- [x] Talepleri mevcut yerel portföy/sözleşme kayıtlarıyla işlem türü, konum ve bütçe aralığı üzerinden eşleştiren testli kural setini ekle
- [x] Olası eşleşmede müşteri kişisel verisini açmadan ilgili danışmanlar ve eşleşme özetiyle broker bildirimi oluştur
- [x] Broker manager için ofis içi müşteri talep havuzu, eşleşme inceleme ve danışmanları yönlendirme görünümünü ekle
- [ ] Talep/eşleşme kayıtlarını şifreli yedek/merge ile uyumlu kıl ve gerçek Windows akışında doğrula

## Offline işlem kapanışı ve tahsilat kontrolü

- [x] Kira ve satış yetkisi sözleşmesinden tekil işlem dosyası açıp kapora, hizmet bedeli, KDV ve kapanış kontrol kalemlerini ilişkilendir
- [x] Tahsilat kalemlerinde beklenen/gerçekleşen tutar, nakit/banka transferi yöntemi, tarih, referans ve açıklama alanlarını sürümlü offline snapshot olarak kaydet
- [x] Eksik, vadesi geçen veya referansı olmayan tahsilatları işlem kapanış kontrol tablosunda risk olarak görünür kıl
- [x] Danışman/broker manager yetki ayrımıyla kapanış onayı, istisna notu ve audit izini uygula
- [ ] Offline Electron ortamında broker manager yetkisini merkezi oturumdan bağımsız, yerel yönetici kimliği doğrulamasıyla güvenceye al
- [ ] İşlem kapanış kayıtlarını AES-GCM yedek, checksum/imza, manager merge ve gerçek Windows akışında doğrula

## Sözleşme marka ve yazdırma düzeni

- [x] Satış ve kiralama yetki sözleşmelerine siyah leke oluşturmayan, baskı güvenli şeffaf Global 1881 mühür/watermark işaretini ekle
- [x] Kira kontratlarından Global 1881’in taraf olduğu izlenimini veren logo/başlık/kurumsal taraf bilgilerini kaldır; alt solda yalnız danışman düzenleme izi bırak
- [x] Kira A4 önizlemesinin dış kabuk sol/sağ boşluklarını Windows baskı alanıyla uyumlu daralt
- [x] Kira A4 başlığındaki “Canlı A4” ibaresini kaldırarak “Kira Sözleşmesi ve Ekleri” olarak güncelle
- [x] Kira sözleşmesi ve eklerinden düzenleyen danışman imza bloğunu kaldır; yalnız baş harf, tarih ve form numaralı silik iz bırak
- [x] Sözleşme ve Finansal İstatistikler ekranını şimdilik A4 yazdırmaya uygun düzenle
- [ ] Yetki/kira belgelerinde marka ve taraf ayrımını gerçek Windows baskı önizlemesiyle doğrula

## Kira kontratı kefil ve bağımsız ekler

- [x] Kira formuna Claude düzenindeki Kefil var seçimini ekle; işaretlenmediğinde kefil alanlarını ve belge satırını tamamen gizle
- [x] Kira snapshot’ına tahliye, teslim etme/teslim alma ve demirbaş eklerinin gerekli alanlarını sürüm etiketli biçimde ekle
- [x] Tahliye taahhütnamesi, teslim etme formu, teslim alma formu ve demirbaş listesini kira sözleşmesi bilgisinden otomatik doldurulan ayrı A4 belgeler olarak ekle
- [x] Kefil görünürlüğü ile tahliye, teslim etme, teslim alma ve demirbaş eklerinin yalnız istenen tekil belgede görünmesini test et
- [ ] Her kira ekinin tek başına yazdırılmasını; offline snapshot, şifreli yedek/merge ve gerçek Windows baskı akışıyla doğrula

## Urla mahalle ve köy/yerleşim seçicisi

- [x] Urla mahalle ve köy/yerleşim adlarını resmî güncel kaynaktan doğrula ve sürüm etiketli yerleşim veri kümesine ekle
- [x] Mahalle/köy seçimi ile Diğer serbest girişini birleştiren tekrar kullanılabilir konum alanını oluştur
- [x] Müşteri talepleri, portföy ve sözleşmelerde kullanılan konum alanlarını Urla seçicisi ve Diğer serbest girişine bağla
- [ ] Yerleşim seçimi ve Diğer girişinin offline snapshot, şifreli yedek/merge ve Windows kullanımını doğrula
- [x] Talep sahibi danışman adını müşteri talebi snapshot’ına ekle; kişinin kendi listesinde ve broker eşleşme özetinde göster
- [x] Seçilen veya serbest yazılan mahalle/konum adlarını Türkçe karakter kurallarıyla baş harfleri büyük biçime dönüştür
- [x] Urla mahalle açılır listesinin müşteri talep formu başlık ve alanlarını kapatmadan, opak ve okunaklı biçimde göster
- [ ] Düzeltilen Urla seçicisini gerçek Windows offline uygulamasında ekran görüntüsüyle doğrula
- [x] Talep formundaki danışman ve yerel müşteri adlarını Türkçe baş harf kurallarıyla blur anında normalleştir

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
- [x] Operasyon ekranlarında maksimum içerik genişliğini yaklaşık 1.080–1.180 px ile sınırla; A4 belge önizlemesini koru
- [x] Yetki ve Kira sözleşmesi ekranlarında A4 önizlemeyi global içerik genişliği sınırından muaf tut veya önizleme alanı için ayrı genişlik kuralı uygula
- [x] Yetki/Kira A4 önizlemelerinin yeni masaüstü düzeninde bozulmadığını ekran görüntüsü veya bileşen/UI testiyle doğrula
- [x] Yetki ve Kira sözleşmesi A4 önizlemeleri için gerçek render/UI testi ekle; baskı kabuklarının yeni layout altında doğru kapsayıcıyla oluştuğunu doğrula
- [ ] Electron/offline hash rotalarında gerçek A4 önizleme ekran görüntüsü al veya Windows/Electron kanıtı kaydet; yeni genişlik düzeninde bozulmadığını görsel olarak doğrula
- [x] Dashboard sağ sütununa koyu yeşil zeminli Ofis Akışı paneli ekle; vade, sözleşme işlemi ve açık tahsilat özetlerini hiyerarşik göster
- [x] Ofis Akışı panelinde danışman gizliliğini koru; başka danışmanlara ait müşteri adı, telefon ve notları hiçbir kartta gösterme
- [x] Ofis Akışı panelinin geniş ekranda sağ sütunda, dar ekranda kompakt erişilebilir düzende çalıştığını UI testi ve ekran görüntüsüyle doğrula
- [x] Danışman girişinde Ofis Akışı panelini yalnız kendi sözleşme, vade, talep ve tahsilat sorumluluklarıyla sınırla
- [x] Broker manager girişinde kişi detayı yerine ofis geneli istisna sayıları; yalnız gerekli müdahalede sınırlı detay görünümü uygula
- [x] Danışman girişinde yalnız kendi açık vade kayıtlarını denetle; bugün, gecikmiş veya en fazla üç gün içindeki kritik işlemler için popup göster
- [x] Kritik olmayan yaklaşan vadeleri yalnız Ofis Akışı sağ panelinde bilgi kartı olarak göster; popup ve panel eşiklerini test et
- [ ] Ofis Akışı paneline güvenli talep-eşleşme, eksik işlem ve broker notu özetleri için merkezi veri kaynakları ve kartlar ekle
- [x] Danışman görünümüne kendi sözleşme ve tahsilat sorumluluklarını da rol bazlı bağla; başka danışmana ait kayıtları dışarıda bırak
- [x] Broker manager için kişi adı yaymadan sınırlı istisna detayına inen ayrı akış ekle ve test et
- [x] Ofis Akışı panelinin sağ sütun/alt yığın responsive davranışını render/UI testiyle doğrula
- [x] Ofis Akışı panelinin masaüstünde sağ sütunda, dar ekranda alt yığında render edildiğini DOM düzeyinde doğrulayan gerçek component/UI testi ekle
- [x] Ofis Akışı panelinin güncel bileşen yapısında geniş ve dar viewport ekran görüntülerini kaydet; sağ sütun ve alt yığın davranışını görsel olarak kanıtla
- [x] Sol navigasyonda aktif menüye koyu yeşil zemin, açık altın vurgu ve belirgin seçili durum uygula
- [x] Sol navigasyonun pasif, hover ve klavye odak durumlarını açık adaçayı/yeşil tonlarla okunabilir ve erişilebilir hâle getir
- [x] Güncellenen sol menüyü masaüstü ve dar görünüm ekran görüntüsüyle doğrula
- [x] Sol menünün geniş ve dar görünümde render edildiğini DOM/UI düzeyinde doğrulayan gerçek component testi ekle
- [ ] Gerçek Windows kullanım geri bildirimi sonrası sol menünün koyu yeşil ve altın vurgu yoğunluğunu gerekirse daha açık tonlara ayarla
- [x] Kira formu ve snapshotına elektrik, su, doğalgaz sayaç numaraları ile DASK poliçe numarası alanlarını ekle
- [x] Sayaç numaralarını teslim alma/teslim etme eklerinde tutarlı ve yazdırılabilir biçimde göster
- [x] DASK poliçe numarasını ana kira sözleşmesinin taşınmaz/teslim bilgileri bölümünde belirgin kutuda göster
- [ ] Yeni abonelik/DASK alanlarını birim test, A4 render ve Windows/Electron görsel doğrulama kapsamına ekle
- [x] Yerel Çalışma Alanı kayıt filtresi açılır listesini opak zemin, yeterli satır yüksekliği ve arka içerikten bağımsız katmanla okunur hâle getir
- [ ] Kayıt filtresi seçicisinin Windows/dar görünümde istatistik kartları ve kayıt satırları üzerinde karışmadan açıldığını UI testi ve ekran görüntüsüyle doğrula
- [x] Offline kayıt formundaki kayıt türü seçicisini de aynı opak ve yüksek katmanlı seçim paneli kuralına bağla
- [ ] Filtre ve kayıt türü seçicilerinin arka form alanlarıyla karışmadığını dar Windows görünümünde birlikte doğrula
- [x] Yerel kaydet düğmesinin etkin ve pasif durumlarında metin/ikon kontrastını görünür ve erişilebilir hâle getir
- [ ] Yerel Çalışma Alanı seçici/düğme görünürlük düzeltmelerini dar Windows ekran görüntüsü ve istemci UI testiyle doğrula
- [x] Yetki sözleşmesi A4 üst bilgisindeki mühür işaretini daha net ve güçlü sol üst marka öğesi olarak yerleştir
- [x] Yetki belgesi üst bilgisindeki ofis adı ve belge bilgisinin tipografik oranlarını büyütüp dengeli hâle getir
- [x] Yetki sözleşmesi A4 içerik alanı için sol–sağ yaklaşma oranını varsayılan olarak eşit ve ortalanmış hâle getir
- [x] Yetki sözleşmesi formunda varsayılan yetki süresini üç ay yap; kullanıcı değiştirilebilirliğini koru
- [x] Yeni yetki başlığı, A4 hizası ve üç aylık varsayılanı render/baskı testiyle doğrula
- [x] Yetki Sözleşmeleri çalışma ekranını geniş Windows görünümünde sol form ve sağ Ofis Akışı paneliyle iki sütunlu düzene geçir
- [x] Kira Sözleşmeleri çalışma ekranına aynı sağ Ofis Akışı paneli düzenini uygula; A4 önizleme genişliğini koru
- [x] Sözleşme ekranlarındaki Ofis Akışı panelini danışman için kişisel işler, broker manager için anonim istisna özetiyle sınırla
- [ ] Yetki/Kira çalışma ekranı sağ panelinin geniş ekranda görünmesini, dar ekranda formun altına inmesini ekran görüntüsü ve UI testiyle doğrula
- [x] Yetki, kira, yerel çalışma alanı ve işlem kapanışları için ortak Windows operasyon ekranı standardı tanımla: konsantre ana kolon, sağ Ofis Akışı alanı, opak seçiciler ve yüksek kontrastlı ana işlem düğmeleri
- [ ] Ortak standardın bu dört ekranda tutarlı uygulandığını geniş/dar görünüm ve rol gizliliği testleriyle toplu doğrula
- [x] Koyu yeşil Ofis Akışı panelini Genel Bakış dışında Yetki Sözleşmeleri ekranında gerçek offline verilerle görünür kıl
- [x] Koyu yeşil Ofis Akışı panelini Kira Sözleşmeleri, Yerel Çalışma Alanı ve İşlem Kapanışları ekranlarında gerçek offline verilerle görünür kıl
- [x] Yeşil yan panelin sözleşme ekranlarında danışman kişisel kayıtlarını, yerel manager oturumu açıkken ise isim göstermeyen istisna özetini gösterdiğini doğrula
- [x] Açık işleri çalışılıyor, uygulanacak ve Windows kanıtı bekleyen durumlarıyla düzenli takip et; kullanıcı sorduğunda güncel durumu sade başlıklarla sun
- [x] Proje başlangıcından beri iletilen kullanıcı isteklerini kod/todo geçmişiyle karşılaştır; açık kalanları öncelik, gerekçe ve kabul kanıtıyla karar tablosunda sun
- [x] Sözleşme, vade, rapor, işlem kapanışı ve yedek/manifest ekranlarındaki kullanıcıya görünen tarihleri Türkiye sayısal biçimiyle (`GG.AA.YYYY`) göster
- [x] Günlük/metinli tarih gösterimlerini Türkçe gün-ay-yıl ve doğru hafta günü standardına bağla; ISO tarihleri yalnız teknik saklama alanlarında koru
- [ ] Türkiye tarih standardını birim test ve Windows/Electron ekran kabulüyle doğrula
- [x] BrokerAnnualTargets, BrokerRequestMatches, Contracts, MyOfflineContracts, Obligations, OfflineTransactionClosings ve kalan kullanıcı görünür ekranlardaki tarihleri ortak `turkishDate` yardımcılarına taşı
- [ ] İşlem kapanışı, rapor, vade ve yedek/manifest akışlarının tamamında Türkiye tarih standardını kapsayan UI testleri ekle
- [ ] Türkiye tarih standardı için gerçek Windows/Electron ekran kanıtı al; görünür tarihlerin ISO yerine Türkçe biçimde çıktığını doğrula
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

- [x] İlk kira son ödeme tarihini sözleşme tarihinden en fazla beş gün sonrasıyla sınırla ve sözleşmede açıkça göster
- [x] Tahliye, teslim etme, teslim alma ve demirbaş eklerini kira önizlemesi üzerinde belirgin tekil yazdırma düğmeleriyle göster
- [x] Tahliye, teslim etme, teslim alma ve demirbaş eklerini işaret kutusuyla sözleşme paketine seçerek dahil et
- [x] Claude kira şablonundaki konut ve işyeri koşullarını, teslim/demirbaş ile imza bölümlerini kaynak içerikle eşleştir
- [x] Konut ve işyeri koşullarını ayrı değişmez sürüm etiketi ve snapshot olarak offline kira sözleşmesi kaydına ekle
- [x] Offline kira A4 önizlemesini bilgi tabloları, tam koşullar, teslim/demirbaş ve imza bölümleriyle form altına yerleştir
- [ ] Konut/işyeri kira tam şablonunu yazdırma, şifreli yedek/merge ve gerçek Windows ekran kanıtıyla doğrula

## Hizmet bedeli KDV tahsilat kaybı göstergesi

- [x] Kira yetki sözleşmesinden malike yönelik hizmet bedeli/KDV tahsilat ifade ve hesaplarını kaldır
- [x] İmzalı kira sözleşmesinden kiracı için bir aylık kira bedeli + %20 KDV hizmet bedeli tahakkuku oluştur
- [x] Kira sözleşmesine taraf imza teyidi ekle; İşlem Kapanışları yalnız teyitli kira sözleşmesini kaynak gösterebilsin
- [x] Kiracı hizmet bedeli/KDV eksikliği için yalnız back-office’te görünen, broker manager onaylı manuel istisna ve audit akışı ekle
- [x] Müşteriye verilen kira/yetki belgelerinde tahsilat tercihi veya manuel istisna ifadelerini gizle
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
- [x] Offline Electron ortamında broker manager yetkisini merkezi oturumdan bağımsız, yerel yönetici kimliği doğrulamasıyla güvenceye al
- [x] Yerel broker manager parolasını PBKDF2 salt/hash ile sakla; doğrulama sonrası kısa süreli kapanış yetkisi ver
- [ ] İşlem kapanış kayıtlarını AES-GCM yedek, checksum/imza, manager merge ve gerçek Windows akışında doğrula

## Sözleşme marka ve yazdırma düzeni

- [x] Yetki sözleşmesi önizleme başlığındaki “Canlı A4 belge önizlemesi” ibaresini kaldır
- [x] Satış/kiralama yetki sözleşmelerinde malik ile yetki alan ofis veya danışmanı iki eşit çerçeveli imza kutusunda göster
- [x] Satış ve kiralama yetki sözleşmelerine siyah leke oluşturmayan, baskı güvenli şeffaf Global 1881 mühür/watermark işaretini ekle
- [x] Kira kontratlarından Global 1881’in taraf olduğu izlenimini veren logo/başlık/kurumsal taraf bilgilerini kaldır; alt solda yalnız danışman düzenleme izi bırak
- [x] Kira A4 önizlemesinin dış kabuk sol/sağ boşluklarını Windows baskı alanıyla uyumlu daralt
- [x] Kira A4 başlığındaki “Canlı A4” ibaresini kaldırarak “Kira Sözleşmesi ve Ekleri” olarak güncelle
- [x] Kira sözleşmesi ve eklerinden düzenleyen danışman imza bloğunu kaldır; yalnız baş harf, tarih ve form numaralı silik iz bırak
- [x] Kira sözleşmesi imza alanını kefilsiz iki, kefilli üç eşit taraf kutusu olacak biçimde düzenle
- [x] Sözleşme ve Finansal İstatistikler ekranını şimdilik A4 yazdırmaya uygun düzenle
- [ ] Yetki/kira belgelerinde marka ve taraf ayrımını gerçek Windows baskı önizlemesiyle doğrula

## Kira kontratı kefil ve bağımsız ekler

- [x] Kira formuna Claude düzenindeki Kefil var seçimini ekle; işaretlenmediğinde kefil alanlarını ve belge satırını tamamen gizle
- [x] Kira snapshot’ına tahliye, teslim etme/teslim alma ve demirbaş eklerinin gerekli alanlarını sürüm etiketli biçimde ekle
- [x] Tahliye taahhütnamesi, teslim etme formu, teslim alma formu ve demirbaş listesini kira sözleşmesi bilgisinden otomatik doldurulan ayrı A4 belgeler olarak ekle
- [x] Kira demirbaş ekini ad, adet, durum ve açıklama sütunlu; satır ekleme/silme destekli dinamik tabloya dönüştür
- [x] Kefil görünürlüğü ile tahliye, teslim etme, teslim alma ve demirbaş eklerinin yalnız istenen tekil belgede görünmesini test et
- [ ] Her kira ekinin tek başına yazdırılmasını; offline snapshot, şifreli yedek/merge ve gerçek Windows baskı akışıyla doğrula
- [x] Sözleşme paketinde işaretlenen Tahliye Taahhütnamesi, Teslim Etme, Teslim Alma ve Demirbaş eklerini ana kira sözleşmesinin hemen altında canlı A4 önizleme olarak göster; işaret kaldırıldığında ilgili önizlemeyi gizle
- [x] Seçili ek önizlemelerini paket ve tekil yazdırma düğmeleriyle aynı seçim kurallarında UI/bileşen testiyle doğrula
- [ ] Seçili eklerin ana kira sözleşmesi altında görünmesini ve işaret kaldırılınca gizlenmesini gerçek Windows/Electron ekranında doğrula

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

## Windows A4 mühür varlığı düzeltmesi

- [x] Yetki Sözleşmeleri A4 önizlemesindeki kırık şeffaf mühür görselini Electron `file://` paketinde güvenilir yüklenen yerel varlık yoluna bağla
- [ ] Yetki A4 mühür varlığını bileşen testi, production paket içeriği denetimi ve gerçek Windows ekran görüntüsüyle doğrula

## Offline sözleşme erişimi ve malik verisi gizliliği

- [x] Yetki ve kira sözleşmelerinde sözleşme sahibi/atanmış danışman, broker, ofis asistanı ve diğer danışman için yazılı erişim matrisi oluştur
- [ ] Sözleşme sahibi dışındaki danışmanların Yetki/Kira A4 önizlemesini ve yazdırma yolunu teknik olarak engelle; broker ve ofis asistanı için yetkili görüntülemeyi koru
- [ ] Yetkisiz danışman listelerinde malik adı, kimlik/VKN, telefon ve adresi geri döndürülemez maskeli özet olarak göster; tam müşteri/sözleşme snapshot’ını istemciye açma
- [ ] Rol ve sahiplik kurallarını Yetki, Kira, Benim Sözleşmelerim, kayıt listeleri ve yazdırma akışlarında birim/UI testleriyle doğrula
- [ ] Malik verisi gizlilik kuralını danışman, sözleşme sahibi, broker ve ofis asistanı Windows/Electron senaryolarıyla kabul et

## Offline Windows arayüz standardı — sol menü, form yüzeyi ve tarih girişi

- [ ] Offline sol menüde Global 1881 marka alanını daha büyük mühür/logo ve güçlü tipografiyle; bölüm gruplarını, aktif/pasif menü hiyerarşisini ve alt kullanıcı alanını sağ Ofis Akışı paneliyle dengeli güçlü bir Windows görsel diline taşı
- [x] Sağ Ofis Akışı panelindeki “Kişisel akışım” ifadesini onaylanan “Size Özel Gündem” başlığıyla değiştir ve başka danışman adı göstermeme kuralını koru
- [x] Danışmanın kendi cihazında güvenle tanımladığı isteğe bağlı hitabı (“Cahit Beyin/Hanımın Dikkatine”) Size Özel Gündem altında gösterecek yerel profil alanını ekle
- [ ] Yetki, kira, yerel çalışma alanı ve işlem kapanışları ana form yüzeylerini bölümlenmiş kartlar, daha belirgin alan başlıkları, okunur giriş çerçeveleri ve kontrollü kontrastla ortak standartta düzenle; sağ Size Özel Gündem panelini yardımcı sütun olarak daraltıp ana formun önüne geçirmeme kuralını uygula
- [x] Native `input type="date"` alanlarının Windows yerel ayarından gelen ABD tarzı görünümü yerine Türkiye standardını kullanıcıya açıklayan ve `GG.AA.YYYY` gösteren ortak tarih giriş bileşeni uygula; ISO saklamayı koru
- [ ] Sol menü, form yüzeyi, sağ Ofis Akışı ve tarih girişlerinin geniş/dar ekran ekran görüntüsü ile UI testlerini ekle
- [ ] Bütünleşik Windows arayüz düzenini gerçek Electron ekran kabulüyle doğrula

## Online ve offline birleşik arayüz standardı

- [ ] Online ve offline DashboardLayout, sol menü, içerik çerçevesi, form/kart, düğme, seçici ve sağ gündem paneli arasındaki renk ve ölçü farklarını envanterle
- [ ] Ortak tasarım değişkenleriyle online/offline menü genişliği, marka alanı, aktif/pasif durum, boşluk, kart, form alanı ve düğme ölçülerini tek standartta birleştir
- [ ] Birleşik arayüzün web ve Electron ekranlarında geniş/dar görünüm UI testlerini ve kabul kanıtını al

## Geriye dönük PDF sözleşme arşivi

- [x] Eski PDF sözleşmelerini aktif Yetki/Kira sözleşmesi, tahakkuk veya tahsilat kaydı oluşturmayan salt-okunur `contractArchive` kayıt türünde modelle
- [x] Her arşiv belgesine danışman kullanıcı kimliği, müşteri adı, belge türü, geçmiş işlem özeti, düzenleme tarihi, gizli indeks bilgileri, orijinal dosya bütünlüğü ve içe aktarma audit kaydı ekle; sözleşme/kayıt numarasını arşivde zorunlu kılma
- [x] Danışmana yalnız kendi arşiv belgelerini; broker manager ve manager tarafından atanmış ofis asistanına yetkili arşiv görüntüleme erişimini uygula
- [x] Offline Electron’da arşiv PDF’sinin yerel saklanması, metadata yedek/merge manifesti ve gelecekte merkezi sunucuya aktarım stratejisini belirle
- [x] Arşiv listesi, danışman filtresi, müşteri bazlı gruplanmış salt-okunur PDF açma ve aktif sözleşme ekranından ayrımı uygula
- [ ] Örnek PDF paketiyle belge indeksleme, erişim gizliliği, dosya bütünlüğü ve Windows/Electron kabulünü doğrula
- [x] Arşiv metadata ve içe aktarma formunda sözleşme/kayıt numarasını zorunlu olmayan müşteri adı alanıyla değiştir; müşteriye ait geçmiş işlem/bağlam bilgisini salt-okunur arşiv notunda tut
- [x] Sözleşme Arşivi listesini müşteri adına göre gruplayıp ara; müşteri kartının altında ilgili eski PDF ve işlem notlarını gösterirken aktif sözleşme/finans tetikleyicilerinden kesin olarak ayrı tut
- [x] Offline Yetki ve Kira sözleşmesi çağırma/seçme akışlarında sözleşme numarası yanında müşteri adı ve soyadıyla da güvenli arama yap; danışman sahipliği ve gizlilik filtrelerini koru
- [x] Her müşteri arşivindeki PDF ve geçmiş işlem kayıtlarını belge/sözleşme tarihine göre eskiden yeniye sırala; tarihi belirsiz belgeleri listenin sonunda açıkça göster
- [x] “Sözleşme Arşivi” kullanıcı dilini “Müşteri Dijital Arşivi” olarak güncelle; eski PDF ve geçmiş işlem bilgisini müşterinin belge geçmişi olarak konumlandır
- [ ] İlk örnek “Kiracı Tevfik Ateş Kira Sözleşmesi” PDF’sini İbrahim Parin portföy danışmanı, Necip Hakan Özcan mülk sahibi ve Tevfik Ateş kiracı bağlamında indeksle; belge tarihini, müşteri kartı seçimini ve Windows kabul adımlarını doğrula
- [x] Çok taraflı kira sözleşmesi arşivinde belgeyi hem mülk sahibi hem kiracı adıyla bulabilir kıl; tek PDF’nin iki müşteri kartında görünürken aktif sözleşme/finans kaydı oluşturmamasını ve danışman sahipliğini korumasını sağla
- [ ] İkinci örnek “Bedriye Dede Kira Sözleşmesi” PDF’sini Kazım Taşlıarmut portföy danışmanı, Mustafa Ekin işyeri sahibi ve Bedriye Dede kiracı bağlamında indeksle; belge tarihini ve Windows kabul kartlarını doğrula
- [ ] Mustafa Ekin daire sahibi ve Gökhan Erdim kiracı bilgisi için doğru karşılık PDF’yi teyit et; Kazım Taşlıarmut (`k_tasliarmut`) sahipliğiyle müşteri kartı indeksini Bedriye Dede örneğinden ayrı doğrula
- [ ] “Gonca Ayberk Kira Sözleşmesi” PDF’sini Kazım Taşlıarmut (`k_tasliarmut`) danışman sahipliği, Mert Somuncu ana müşteri ve Gonca Ayberk kiracı tarafı olarak indeksle; belge tarihi ile Windows müşteri kartlarını doğrula
- [x] Gonca Ayberg notu ile taranmış PDF’de görünen Gonca Ayberk kimliğindeki yazım farkını kullanıcı teyidiyle netleştir; arşivde PDF’deki resmi yazımı ve belge tarihi 15.04.2025’i kullan
- [x] “Didem Özbay Kira Sözleşmesi” PDF’sini Kazım Taşlıarmut (`k_tasliarmut`) danışman sahipliği, Nurten Eroğlu ana müşteri ve Didem Özbay kiracı tarafı olarak incele; 01.02.2026–01.02.2027 aktif dönemi nedeniyle arşivden ayır
- [x] Didem Özbay PDF’sindeki 01.02.2026–01.02.2027 kira dönemini aktif/geçmiş durumu açısından teyit et; aktifse Müşteri Dijital Arşivi’ne alma ve mevcut Kira Sözleşmeleri akışında ayrıca ele al
- [x] “Ali Kağan Doğdu Kira Sözleşmesi” PDF’sini İbrahim Parin (`i_parin`) danışman sahipliği, Sevda Taşlıarmut ana müşteri ve Ali Kağan Doğdu kiracı tarafı olarak incele; 03.04.2026–03.04.2027 aktif dönemi nedeniyle arşivden ayır
- [x] Ali Kağan Doğdu PDF’sindeki 03.04.2026–03.04.2027 kira dönemini aktif/geçmiş durumu açısından teyit et; aktifse Müşteri Dijital Arşivi’ne alma ve mevcut Kira Sözleşmeleri akışında ayrıca ele al
- [x] Devam eden kira PDF’lerini tarih ve süre bilgisiyle aktif Kira Sözleşmeleri akışına alma yöntemini tasarla; arşivden ayırırken vade/tahliye takip verilerinin manuel doğrulamayla kaydedilmesini sağla
- [x] Aktif imzalı sözleşme PDF’sini ilgili aktif müşteri/sözleşme dosyasına bağlayan ayrı `activeContractDocument` kayıt modelini tasarla; geçmiş Müşteri Dijital Arşivi kaydından ayır
- [x] Danışmanın yalnız kendi kullanıcı kimliğiyle sahip olduğu aktif sözleşmeye PDF yükleyebilmesini; manager ve atanmış ofis asistanının yetkili görüntülemesini; diğer danışmanların müşteri adı ve PDF içeriğini görememesini uygula
- [x] Aktif imzalı PDF yüklemesinde dosya türü/boyutu/SHA-256 bütünlük özeti/audit kaydı ve vade–tahliye akışını başlatmadan önce imza/işlem durumu doğrulamasını uygula
- [x] Danışman eklediği veya sahip olduğu hiçbir aktif imzalı PDF’nin silinmesine/değiştirilmesine izin verme; silme arayüzü ve IPC yüzeyi sunma
- [x] Olası manager istisnasını gerekçe, çift doğrulama ve silinmeyen denetim iziyle ayrı belge geçersiz kılma sürecine bağla; dosyayı iz bırakmadan yok etme
- [x] Geçiş yılı offline IndexedDB/manuel merge modelinden merkezi sunucu veri modeline geçişte müşteri, portföy, sözleşme, vade, aktif imzalı belge ve arşiv metadata eşleme planını çıkar
- [ ] Danışmanların Android/iOS uygulamasından yalnız kendi müşteri, portföy, sözleşme, talep ve gündem bilgilerine güvenli erişeceği merkezi mobil rol matrisi ile oturum modelini tasarla
- [ ] Merkezi API ve S3 belge depolama üzerinde aktif imzalı PDF ile geçmiş Müşteri Dijital Arşivi erişimini, yükleme ve denetim izini uygulamaya hazırla
- [x] Global 1881 görsel dilini koruyan Android/iOS danışman uygulaması için ana ekran, müşteri/portföy, gündem, talep, belge ve bildirim kapsamını onayla; onaylanan ilk kapsamda mobil web uygulamasını geliştir
- [ ] Offline geçiş modelinden bağımsız, danışmanların ofis dışından aynı güncel verilere erişeceği merkezi online çalışma modelini uygula; telefon denemesinde ayrı cihaz verisi/manuel merge kullanma
- [x] Sahibinin Android/iOS telefonunda test edebileceği Global 1881 mobil danışman uygulaması için güvenli oturum, canlı gündem, müşteri/portföy, sözleşme görünümü, belge erişimi ve rol gizliliği MVP’sini geliştir
- [x] Telefon testine önce sahibin manager hesabını; sonra bir danışmanın yalnız kendi kayıtlarını gördüğü ayrı rol senaryosunu ekle ve canlı online veri değişiminin iki cihazda doğrulandığı kabul akışını hazırla
- [ ] Android telefon ve iPhone 13 Pro üzerinde aynı Global 1881 merkezi online deneme uygulamasını çalıştır; manager görünümü, danışman gizliliği ve iki cihaz arasındaki canlı veri güncellemesini kabul et
- [ ] Android’de `88.255.216.16/landpag` yanlış ağ yönlendirmesi yerine `https://emlakdash-kcw9r85v.manus.space/mobile` mobil alan adının doğrudan açıldığını doğrula; 400 hatası sonrası Chrome kabulünü yeniden yap
- [ ] Android Chrome’da doğru `emlakdash-kcw9r85v.manus.space` alan adına ait `ERR_SSL_PROTOCOL_ERROR` hatasını DNS/HTTPS/telefon ağ katmanında teşhis et; güvenli HTTPS erişimini doğrulayıp mobil kabulü yeniden yap
- [ ] Mobil veri hattında doğru mobil alan adına gelen `ERR_CONNECTION_RESET` engelini kaydet; geçici test erişimi ile kalıcı özel alan adı/HTTPS erişimini ayrı kabul adımlarında doğrula
- [ ] `sg1.manus.computer` önizleme alanında mobil giriş ekranının açıldığını ancak “not live / cannot be shared directly” uyarısı verdiğini kaydet; Android/iPhone kabulü için paylaşılabilir güvenli kamusal erişim alanı sağla
- [ ] Global 1881’in mevcut `global1881.com` alan adı altında `ofis.global1881.com` veya onaylanan eşdeğer alt alan adını merkezi mobil sisteme bağla; HTTPS doğrulamasıyla Android/iPhone kamusal erişimini kabul et
- [ ] Hostinger erişiminde kullanılan Google hesabı için yapılan kurtarma başvurusunun sonucunu bekle; hesap erişimi geri geldiğinde `ofis.global1881.com` DNS kaydını mevcut WordPress sitesine dokunmadan ekle
- [x] Mobil ofis uygulamasının merkezi veri/uygulama barındırmasını Hostinger WordPress hostinginden bağımsız tut; yalnız alan adı/DNS yönlendirmesine ihtiyaç duyduğunu mimari ve kabul kılavuzunda açıkça kaydet
- [ ] `ofis.global1881.com` için DNS kaydının ayrı yönetim devri veya yedek erişim adresiyle sürekliliğini planla; Hostinger aboneliği/hesap erişimi kesilse bile veri ve uygulama kaybı oluşmamasını doğrula
- [x] Android telefonda geçici önizleme alanı üzerinden manager görünümünün açıldığını ve merkezi kayıtların henüz aktarılmadığı için sıfır göründüğünü doğrula
- [x] Şu ana kadarki Global 1881 proje geliştirmeleri, mimari kararlar, güvenlik kuralları, doğrulamalar, açık işler ve merkezi geçiş durumunu bağlantılı Obsidian Markdown kasası olarak oluştur; indirilebilir ZIP paketiyle teslim et
- [x] Merkezi belge açma akışında danışman yetkisinin tRPC denetiminden sonra depolama URL’si paylaşımına karşı da korunduğunu incele; gerekirse kısa ömürlü, sunucu yetkili belge indirme rotası uygula ve test et
- [x] Offline manager merge yedeğinden merkezi sisteme kontrollü aktarım için yalnız önizleme yapan eşleme tasarımı oluştur; müşteri/portföy/sözleşme/vade/ledger/belge metadata’sını ayrı göster, açık apply onayı ve audit olmadan merkezi veri veya PDF yükleme yapma
- [x] Emlak ofisi için genel muhasebe yerine dar kapsamlı ön muhasebe hesap planını tanımla: nakit kasa, banka hesapları, müşteri kaporaları, tahsil edilecek hizmet bedelleri, masraflar, danışman avans/mahsup ve iade/emanet kalemlerini açık kodlarla ayır
- [x] Nakit kapora ve banka transferlerinde kaynak kişi, işlem dosyası, tahsilat yöntemi, banka referansı/makbuz, teslim alan, tarih, tutar, durum ve audit zorunluluğunu içeren emlak ofisi tahsilat kontrol akışını tasarla; danışman kaydı ile manager onay/mahsup ayrımını koru
- [x] Gün sonu nakit kasa ve banka kontrol ekranı için beklenen, gerçekleşen, açık fark, onaysız transfer ve belge eksiği istisnalarını hesaplayacak dar kapsamlı özet modelini tasarla ve test et

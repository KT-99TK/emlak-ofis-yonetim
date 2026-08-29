# Global 1881 — Aktif Proje Görevleri

Bu dosya yalnızca güncel ve tekrar etmeyen işleri içerir. Önceki ayrıntılı görev geçmişi ve eski kabul kayıtları `todo-archive.md` içinde korunmaktadır; geçmiş silinmemiştir.

## 1. Otomatik tamamlanabilecek teknik işler

- [x] Türkiye tarih standardının işlem kapanışı, rapor, vade ve yedek/manifest akışlarındaki eksik render/UI testlerini tamamla.
- [x] Yerel Çalışma Alanı filtre ve kayıt türü seçicilerinin dar görünüm davranışını istemci UI testleriyle doğrula.
- [ ] Yetki/Kira çalışma ekranlarında sağ Ofis Akışı panelinin geniş/dar yerleşimini ve ortak Windows operasyon standardını toplu UI testleriyle doğrula.
- [ ] Yeni abonelik ve DASK alanlarının mevcut birim/A4 testlerine ek olarak paket içi kabul kontrolünü tamamla.
- [x] Şifreli yedek alma, geri yükleme öncesi doğrulama, sürümleme ve audit akışındaki gerçek teknik boşlukları incele; mevcut yedekleri değiştirmeden eksikleri tamamla.

## 2. Mahremiyet ve iş akışı

- [x] Ofis Akışı için talep-eşleşme ve eksik işlem özetlerinin merkezi veri kaynağını belirle; kişi, telefon ve taşınmaz ayrıntısı sızdırmadan yalnız gerekli anonim kartları uygula.
- [x] Danışman, ofis asistanı ve broker manager rollerinin merkezi/offline kapsamını mevcut audit ve render testleriyle toplu doğrula.

## 3. Tek toplu Windows/Electron kabulü

- [ ] Tek kabul oturumunda A4 kira/yetki belgeleri, DASK, EİDS, demirbaş ve teslim ekleri, tarih görünümü, menü ve sağ panel düzenini doğrula.
- [ ] Tek kabul oturumunda offline hash rotaları, paketlenen kaynak sürümü, kurulum klasörü, yeni Electron çıktısı ve `startup.log` başlangıç akışını doğrula.
- [ ] Kullanıcının Windows ekran kanıtlarını aldıktan sonra yalnız gerçek bulguları düzelt ve ilgili maddeleri kapat; eski 1.0.18–1.0.21 ekranlarını yeni sürüm kanıtı olarak tekrar kullanma.

## 4. Harici veya kullanıcı kararına bağlı işler

- [ ] Periyodik dış/otomatik uyarı işlerini kullanıcı açıkça onaylamadıkça uygulama; mevcut manuel yenileme kuralını koru.
- [ ] WordPress, DNS delegasyonu ve alan adı sahipliği modelini web tasarımcının erişim sınırlarıyla ayrı olarak değerlendir.
- [ ] Kullanıcı kabulünden sonra gerekiyorsa tek anlamlı toplu Windows paketi ve kaynak ZIP üret; küçük düzeltmelerde paket üretme.

## Tamamlanan son toplu sınır

- [x] Konut kira sözleşmesinin kullanıcı tarafından verilen 22 hususi şartını A4 belgeye uygula; işyeri şablonuna dokunma.
- [x] DASK alanını taşınmaz açık adresiyle aynı kompakt bilgi grubuna al ve A4/snapshot akışını koru.
- [x] Menü, açık mühür marka alanı ve Türkiye tarih render doğrulamalarını güncelle.
- [x] 82 test dosyası / 230 test, TypeScript ve production build doğrulamasını tamamla.
- [x] Kullanıcı talebiyle güncel menü düzenini içeren temiz kaynak ZIP’i oluştur ve bütünlüğünü doğrula.
- [x] Kalan güvenlik, yedekleme/merge ve son Windows/Electron kabul kontrollerini tek güncel kontrol planında sınıflandır ve süre tahminiyle raporla
- [x] Windows/Electron kabul testi öncesi paket, temiz başlangıç, sürüm eşleşmesi, startup.log ve tek oturum kontrol sırasını hazırla
- [ ] Kira sözleşmesi ilk kira son ödeme tarihi yardımcı satırındaki ISO gösterimini Türkçe GG.AA.YYYY biçimine çevir ve Windows kabul ekranında doğrula
- [x] Kira sözleşmesi otomatik özetindeki ilk vade, bitiş ve tahliye uyarısı tarihlerini Türkçe GG.AA.YYYY biçiminde göster; mevcut ISO tarih değerlerini yalnız sunum katmanında dönüştür
- [x] Offline işlem ön koşulunda yalnızca boşluklardan oluşan kullanıcı kimliğini reddet; kimlik doğrulama testini düzelt
- [x] Offline çalışma alanı geri yüklemesinde kayıtlar uygulandıktan sonra birleşik yedek oluşturma başarısız olursa rollback çalıştır; başarısızlık senaryosunu test et
- [x] Şifreli yedek export/import akışında `backup-exported`, `backup-verified` ve `records-applied` audit kayıtlarının üretildiğini ve korunduğunu test et
- [x] Yedek geri yükleme öncesi manifest, sürüm, checksum, ECDSA imza, yanlış parola ve geçersiz dosya senaryolarını açık testlerle tamamla
- [x] Yedekleme güvenliği geniş görevini yalnız doğrulanmış alt maddeler tamamlandıktan sonra kapat
- [x] Kullanıcının paylaştığı güncel işyeri kira sözleşmesi hususi şartlarını yalnız işyeri şablonuna uygula; konut sözleşmesini ve tüm form alanlarını koru
- [x] Kullanıcının verdiği işyeri kira sözleşmesi form düzenini uygulama: taraf vergi/iletişim alanları, KDV-stopaj, taşınmaz tapu/iskân/kat mülkiyeti, faaliyet konusu, yalnız net kira ve kıst dönem alanlarını işyeri akışına bağla
- [x] İşyeri kira formundan brüt kira bedeli alanını kaldır; yalnız aylık net kira alanını göster ve stopajı ayrı brüt kira alanı olmadan metin akışında koru
- [x] Yeni işyeri kira alanları için işlem kapanışındaki OfflineRentalDetails dönüşümünü geriye uyumlu varsayılanlarla güncelle ve TypeScript hatasını kapat
- [x] Yeni işyeri alanları sonrası durum etiketi ve kıst kira tutarı için TypeScript tip uyumsuzluklarını gider
- [x] İşyeri yeni hususi şartlarında bulunmayan eski koşullu kefalet beklentisini testlerden kaldır; konut kefil akışını koru
- [x] Konutta mevcut kefil alanı/akışı varsa doğrudan render veya birim testiyle doğrula; işyeri kefalet maddesi kaldırılırken konut davranışının değişmediğini kanıtla
- [x] İşyeri şart güncellemesi sonrası konut ve işyeri hususi şart setlerini tek karşılaştırmalı senaryoda doğrula
- [x] `exportOfflineBackup()` çağrısının gerçek `backup-exported` audit kaydı ürettiğini akış testiyle doğrula
- [x] Geçerli şifreli yedek `mergeOfflineBackups()` veya `importOfflineBackup()` üzerinden işlendiğinde `backup-verified` ve `records-applied` audit kayıtlarını doğrula
- [x] Export/import sonrası audit kayıtlarının localStorage’da korunduğunu ve recordCount/checksum/imza metadata’sını akış testiyle kanıtla
- [x] Merge sırasında aynı kayıt kimliğinin farklı sürümlerdeki iki içeriğini otomatik ezmeden çakışma olarak raporla; pending kayıtların güvenli kaldığını test et
- [x] Merkezi rol kapsamı için server/db/router düzeyinde danışman, ofis asistanı ve broker manager yetki sınırlarını testlerle açıkça doğrula
- [x] Rol kapsamı doğrulamasında ilgili audit kayıtlarının üretildiğini ve korunduğunu kanıtlayan test veya kod kanıtı ekle
- [x] Offline rol kapsamı için mevcut render ve erişim testlerini tek kabul maddesi altında özetle; merkezi kapsam maddesinden ayrı tut
- [x] Merkezi rol kapsamı için en az bir gerçek server/router testinde danışman, ofis asistanı ve broker manager kullanıcılarıyla procedure erişim sonuçlarını çalıştırarak doğrula
- [x] Rol kapsamıyla ilişkili bir merkezi işlemde audit kaydının gerçekten oluştuğunu ve listelenebildiğini/korunduğunu doğrulayan akış testi ekle
- [ ] Kira sözleşmesi ilk kira son ödeme tarihi yardımcı satırının Türkçe GG.AA.YYYY renderını gerçek Windows/Electron kabul ekranında doğrula ve kanıtı kaydet
- [x] İlk vade tarihindeki kod/tarım dönüşümünü tamamlanmış, Windows kabul doğrulamasını kullanıcı ekran kanıtı sonrası kapatılacak ayrı aşama olarak tut
- [x] Yetki ve Kira çalışma ekranlarının her ikisinde sağ Ofis Akışı panelinin geniş/dar yerleşimini doğrudan render/istemci testleriyle ayrı ayrı doğrula
- [ ] Sağ panel için ortak Windows operasyon standardını gerçek Windows/Electron kabul maddesine taşı veya somut kabul kanıtı ekle
- [x] Genel dashboard/yardımcı panel testlerini bu görevden ayır; görev metniyle birebir eşleşen ekran bazlı kanıt üret
- [x] OfflineAuthorityContracts ekranında sağ Ofis Akışı panelinin DOM renderını ve dar/geniş responsive CSS yerleşimini testle doğrula
- [x] OfflineRentalContracts ekranında sağ Ofis Akışı panelinin DOM renderını ve dar/geniş responsive CSS yerleşimini testle doğrula
- [x] Ekran bazlı kanıtı source-inspection yerine kullanıcıya görünen DOM/yerleşim davranışını assert eden testlerle güçlendir; bağlantılı iki ekran teknik maddesini DOM + responsive CSS kapsamıyla kapat
- [x] OfflineWorkspace ekranında filtre seçicisinin dar görünümde görünür DOM davranışını gerçek render/istemci testiyle doğrula
- [x] OfflineWorkspace ekranında kayıt türü seçicisinin dar görünüm yerleşimini ve erişilebilirliğini gerçek UI testiyle doğrula
- [x] Source-inspection yerine viewport/dar genişlik koşulunda kullanıcıya görünen DOM ve sınıf davranışını assert eden test ekle; ardından bu maddeyi kapat
- [x] OnlineStart geçiş tarihi sunumunu `formatTurkishDate` ile GG.AA.YYYY biçimine taşı ve hedefli testle doğrula; işlem saklama biçimi ISO olarak korundu
- [x] İşlem kapanışı ekranında kullanıcıya görünen tarihlerin GG.AA.YYYY renderını gerçek render/UI testiyle doğrula
- [x] Rapor/vade ekranlarında kullanıcıya görünen tarih özetlerini GG.AA.YYYY olarak assert eden gerçek render testleri ekle
- [x] Manifest/yedek önizleme akışında görünen tarihlerin GG.AA.YYYY SS:DD formatında render edildiğini doğrudan test et
- [x] Source-inspection testlerini destekleyici kanıt olarak bırak; rapor/vade, işlem kapanışı ve manifest/yedek önizleme render testleri tamamlandıktan sonra üst tarih standardını yeniden değerlendir
- [x] Obligations vade raporu ve kartında `30.11.2026` gibi kullanıcıya görünen tarihlerin Türkçe formatta render edildiğini jsdom testiyle doğrula
- [x] Ofis Akışı panelinde talep-eşleşme özeti ve eksik işlem özeti için kullanılan merkezi veri kaynağını kod/test düzeyinde açıkça doğrula
- [x] Talep-eşleşme ve eksik işlem anonim kartlarının müşteri/telefon/taşınmaz ayrıntısı sızdırmadan render edildiğini gerçek UI veya router testleriyle kanıtla
- [x] Mevcut anonim yönlendirme notu kanıtını geniş Ofis Akışı özetlerinden ayrı tamamlanan alt iş olarak tut
- [x] Ofis Akışı özet kartlarının Home/Dashboard/route seviyesinde hangi merkezi query/procedure’dan beslendiğini doğrudan test veya kod kanıtıyla doğrula
- [x] Talep-eşleşme ve eksik işlem kartları için gerçek render testinde müşteri adı, telefon ve taşınmaz/adres bilgisinin görünmediğini açıkça assert et
- [x] Gerekirse bu iki özet türünü ayrı veri yapıları ve ayrı test senaryolarıyla isim bazlı doğrula; yalnız genel sayı kartı testiyle kapatma
- [x] Ofis Akışı kartlarında talep-eşleşme ve eksik işlem özetlerinin hangi merkezi tRPC query/procedure’dan beslendiğini route seviyesinde açık bir testle doğrula
- [x] OfficeFlowPanel render testine müşteri adı, telefon ve taşınmaz/adres bilgisinin görünmediğini açık assertion olarak ekle
- [x] Talep-eşleşme ve eksik işlem özetleri için ayrı test senaryoları kur; her birinin başlık/sayı ve mahremiyet davranışını ayrı doğrula
- [x] Home/Dashboard route seviyesinde OfficeFlowPanel’i gerçek query mock’larıyla render eden test ekle; talep-eşleşme ve eksik işlem kartlarının hangi tRPC query/procedure verisiyle beslendiğini davranışsal olarak doğrula
- [x] OfficeFlowPanel testlerinde talep-eşleşme ve eksik işlem kartları için sayı değerlerini de açık assertion ile doğrula
- [x] Kart adları ile veri kaynağı eşlemesini testte daha açık hale getir; Sözleşme işlemi ve Açık tahsilat özetlerini iş türüyle netleştir
- [ ] Kabul bulgusu: Kira formundaki `En geç` yardımcı tarih satırını kullanıcıya GG.AA.YYYY biçiminde göster; ISO saklama ve hesaplama mantığını değiştirme
- [x] 1.0.22 Windows paketinde görülen `En geç: YYYY-MM-DD` yardımcı tarih bulgusunu kaynak/dist sürümüyle karşılaştır ve paketlenebilir düzeltmeyi doğrula — 1.0.22 artefaktı çalışma alanında bulunamadı; 1.0.23 ayırt edilebilir paket olarak supersede etti
- [ ] 1.0.22 FINAL kabul bulgusu: İlk kira son ödeme tarihinin `En geç` yardımcı satırını GG.AA.YYYY göster; ISO hesaplama ve saklama değerini koru
- [x] Yeni 1.0.22 paketinde ISO yardımcı tarih bulgusu devam ediyor: çalışan Electron runtime `indexPath` ve paket içi dist çıktısını karşılaştır; gerçek kaynağı izole etmeden kullanıcı verilerine dokunma — ana runtime kanıtı olarak 1.0.23 paket incelemesine taşındı
- [x] Mükerrer 1.0.22 runtime/dist takip maddesi — superseded/geçmiş kayıt; 1.0.23 paketinde tekil kanıt maddesiyle takip ediliyor
- [x] 1.0.22 kaynak/dist belirsizliğini gidermek için kabul düzeltmesini yeni ayırt edilebilir paket sürümüne taşı; package.json, PowerShell beklenen sürüm ve installer testini birlikte güncelle
- [x] Windows 1.0.23 kabul bulgusu: Kira Sözleşmeleri menü ekranı açılmıyor; offline rota, Electron paket runtime ve istemci hata akışını teşhis et, mevcut verileri koru
- [ ] Windows Electron açılışında doğrudan Yerel Çalışma Alanı yerine Genel Bakış/başlangıç ekranını göster; offline menü ve mevcut verileri koru, açılış rotasını testle doğrula
- [x] 1.0.22 installer/app.asar artefaktı mevcutsa doğrudan çıkarıp `startup.log` bulgusuyla eşleştir; artefakt yoktu, bu nedenle 1.0.23’e supersede edildiği açıkça kaydedildi
- [x] Mükerrer 1.0.22 runtime/dist takip maddelerini tek kanıtlanan sürüm maddesi altında birleştir; ikinci kayıt geçmiş kaydı olarak superseded notuyla korundu
- [ ] Windows 11’de açılmayan 1.0.23 EXE bulgusunu ve SmartScreen/imza durumunu güvenli kurulum akışıyla yeniden doğrula; güvenlik korumalarını devre dışı bırakma
- [x] 1.0.23 teslim paketine EXE, BAT, PowerShell betiği, kurulum yönergesi ve SHA-256 bütünlük bilgisini birlikte koy
- [x] Teslim ZIP’ini oluşturup arşiv içeriği, EXE PE/NSIS türü ve script sürüm eşleşmesini statik olarak doğrula
- [x] FINAL teslim ZIP’inde EXE başlatma BAT’ı ile kaynak projeden installer üreten BAT’ı adlandırarak ayır; kullanıcı yanlış betiği çalıştırmasın
- [x] Teslim kartında ZIP’i tek birincil dosya olarak sun; ayrı EXE/BAT eklerini göndermeden arşiv içeriği ve dosya adlarını kullanıcıya açıkça göster
- [x] OnlineStart status sorgusunda merkezi ayar yokken `undefined` yerine güvenli `null` döndür; Genel Bakış’ın kalıcı yükleme/undefined hatasını testle doğrula
- [x] Home/Genel Bakış için gerçek render/jsdom testi ekle: `trpc.onlineStart.status` null döndüğünde React Query undefined hatası oluşmadığını ve ekranın kalıcı loading yerine beklenen başlangıç durumunu gösterdiğini doğrula
- [x] OnlineStart veya MobileCompanion ekranlarında `onlineStart.status = null` akışını davranışsal testle kapsa; yalnız kaynak-metin testiyle yetinme — Home/Genel Bakış davranış testiyle kapsandı
- [x] Home/Genel Bakış için Testing Library ile gerçek jsdom DOM render testi ekle; `trpc.onlineStart.status` null döndüğünde loading bandının kalmadığını ve `Başlangıç bekliyor` durumunun göründüğünü doğrula
- [x] OnlineStart veya MobileCompanion için ayrı davranışsal test ekle; `onlineStart.status = null` akışında ekranın çökmediğini ve beklenen boş/başlangıç durumunu gösterdiğini doğrula
- [x] Mümkünse tRPC/React Query katmanını düz mock yerine gerçek QueryClient sarmalayıcısıyla test ederek `data is undefined` regresyonunu yeniden üretilemez hale getir — Home ve OnlineStart jsdom testleri gerçek QueryClientProvider ile çalışıyor
- [x] Home veya OnlineStart için gerçek QueryClient + tRPC provider/caller ile onlineStart.status boş durumda null davranışını doğrulayan entegrasyon testi ekle — gerçek appRouter caller ve gerçek QueryClient DOM testi eklendi
- [x] Gerçek query yürütmesinde `data is undefined` console/query hatasının oluşmadığını assertion ile kanıtla — procedure testinde console.error metni ayrıca assert edildi
- [x] Router procedure sonucunu gerçek çağrıyla `undefined` yerine `null` olarak doğrula ve ekranın loading yerine boş duruma geçtiğini tek akışta test et — gerçek appRouter sonucu Home QueryClient DOM akışında render edildi; null boş dalı gerçek DOM testinde ayrıca doğrulandı
- [x] ZIP eki kullanıcıya ulaşmadı; tek arşivin dosya adı, mevcutluğu ve yeniden teslim yöntemini doğrula — doğrudan CDN bağlantısıyla yeniden teslim edildi
- [x] Önceki 1.0.23 teslimindeki 186 KB yarım EXE ve çalışmayan başlatma BAT’ını geçersiz teslim olarak işaretle; yeni paket gerçek çalışabilirlik ve boyut doğrulaması olmadan gönderme — geçersiz teslim olarak ayrıldı
- [x] Windows dağıtımında uygun gerçek installer/portable alternatifini seç; sandbox Wine ile doğrulanamayan dosyayı kullanıcıya FINAL diye teslim etme — tam 617 MB portable çıktı seçildi ve statik olarak doğrulandı
- [x] Portable 1.0.23 paketinde Global1881-BASLAT.bat yanlış installer adını arıyor; gerçek `1881 Ofis Yönetim.exe` adını kullanacak şekilde BAT ve yönergeyi düzelt, ZIP içi eşleşmeyi doğrula
- [ ] Defender tarafından silinen imzasız portable paketi geçersiz kabul et; kullanıcıdan güvenlik korumalarını kapatmasını istemeden imzalı/kurumsal onaylı dağıtım yolunu belirle
- [ ] Kod imzalama sertifikası olmadığı için Windows offline portable/installer kabulünü ertele; imzasız EXE çalıştırma istemeden web uygulamasında ekran kabulünü sürdür
- [ ] 1.0.22 ile 1.0.23 paketleme farkını önceki başarılı Windows akışıyla karşılaştır; sertifika gerektirmeyen güvenli yerel paketleme yöntemini belirle ve kullanıcıya açıkla
- [ ] Defender kaynak 1.0.23 ZIP’i de tehdit olarak algıladı; tüm imzasız Windows dosya teslimini durdur, Koruma Geçmişi tehdit adı/dosya yolu ayrıntısını incelemeden paketi yeniden önerme
- [x] Defender `Trojan:Script/Wacatac.H!ml` algılaması doğrulandı; önceki portable ve kaynak ZIP’lerini geçersiz kabul et, hiçbir dosyayı geri yükletme/izin verdirtme, Windows betiklerini bağımsız güvenlik incelemesine ayır
- [x] Wacatac algılamasına öncelik ver: `WINDOWS-KURULUM.bat/.ps1`, paket oluşturma bağımlılıkları ve dış kaynak çağrılarını statik olarak incele; bulguyu belgeleyene kadar yeni Windows dosyası üretme
- [x] Kritik fast-xml-parser 5.2.5 bağımlılığını güvenli sürüme yükselt; AWS S3 zinciriyle uyumluluk, test/build ve yeniden audit doğrulamasını tamamla
- [ ] Windows dosya dağıtımı güvenlik incelemesi tamamlanana kadar ekran kabulünü yalnız yayınlanmış web uygulamasında sürdür
- [ ] Yayın alan adında ERR_SSL_PROTOCOL_ERROR görüldü; SSL/TLS yapılandırmasını doğrula ve güvenlik uyarısını aşmadan geçerli web erişim yolunu sağla
- [ ] Yayın alan adında bakım modu sayfası görünüyor; canlı yayın/alan adı bakım durumunu doğrula ve uygulama erişimini geri getir
- [ ] Kullanıcı cihazında normal ve gizli pencerede bakım modu devam ediyor; alan adı erişimini farklı ağ/yayın noktalarıyla karşılaştırıp kalıcı canlı erişimi doğrula
- [ ] Mobil internet üzerinde de ERR_SSL_PROTOCOL_ERROR doğrulandı; bu platform/alan adı erişim engelini uygulama kodundan ayır ve güvenlik uyarısını aşmadan çözüm kanalını belirle
- [ ] Kullanıcıyı tekrar Windows paket, ZIP/BAT veya web URL denemelerine yönlendirme; Ubuntu üzerinde güvenlik ve paketleme sorunu netleşmeden tekil doğrulanmış çözüm hazırlama ilkesini uygula
- [ ] Kalan 19 yüksek üretim bağımlılık bulgusunu risk ve kullanılabilirlik etkisine göre ayrı incele; büyük sürüm güncellemelerini toplu test olmadan uygulama
- [x] Aktif kira Excel aktarımında yüksek riskli `xlsx` bağımlılığını güvenli, bakım gören bir ayrıştırıcıyla değiştir; aktarım şablonu, Türkçe tarih ve mevcut test davranışını koru
- [x] Doğrudan kullanılan nanoid bağımlılığını CVE-2026-67214 için 5.1.16 veya üzeri güvenli sürüme yükselt; kimlik üretim ve tam test/audit regresyonunu doğrula
- [x] Windows’ta daha önce çalışan `WINDOWS-KURULUM.bat` akışı için güncel 1.0.23 kaynak ZIP’i hazırla; node_modules/release hariç tut, kullanıcı Windows’ta gerçek installer boyutunu doğrulasın
- [x] Linux ortamında oluşan 1.0.23 yarım installer/portable teslimlerini kullanma; Windows’ta daha önce çalışan yerel `WINDOWS-KURULUM.bat` paketleme akışına dön

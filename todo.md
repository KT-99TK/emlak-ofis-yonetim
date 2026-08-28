# Global 1881 — Aktif Proje Görevleri

Bu dosya yalnızca güncel ve tekrar etmeyen işleri içerir. Önceki ayrıntılı görev geçmişi ve eski kabul kayıtları `todo-archive.md` içinde korunmaktadır; geçmiş silinmemiştir.

## 1. Otomatik tamamlanabilecek teknik işler

- [ ] Türkiye tarih standardının işlem kapanışı, rapor, vade ve yedek/manifest akışlarındaki eksik render/UI testlerini tamamla.
- [x] Yerel Çalışma Alanı filtre ve kayıt türü seçicilerinin dar görünüm davranışını istemci UI testleriyle doğrula.
- [ ] Yetki/Kira çalışma ekranlarında sağ Ofis Akışı panelinin geniş/dar yerleşimini ve ortak Windows operasyon standardını toplu UI testleriyle doğrula.
- [ ] Yeni abonelik ve DASK alanlarının mevcut birim/A4 testlerine ek olarak paket içi kabul kontrolünü tamamla.
- [x] Şifreli yedek alma, geri yükleme öncesi doğrulama, sürümleme ve audit akışındaki gerçek teknik boşlukları incele; mevcut yedekleri değiştirmeden eksikleri tamamla.

## 2. Mahremiyet ve iş akışı

- [ ] Ofis Akışı için talep-eşleşme ve eksik işlem özetlerinin merkezi veri kaynağını belirle; kişi, telefon ve taşınmaz ayrıntısı sızdırmadan yalnız gerekli anonim kartları uygula.
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

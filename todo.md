# Global 1881 — Aktif Proje Görevleri

Bu dosya yalnızca güncel ve tekrar etmeyen işleri içerir. Önceki ayrıntılı görev geçmişi ve eski kabul kayıtları `todo-archive.md` içinde korunmaktadır; geçmiş silinmemiştir.

## 1. Otomatik tamamlanabilecek teknik işler

- [ ] Türkiye tarih standardının işlem kapanışı, rapor, vade ve yedek/manifest akışlarındaki eksik render/UI testlerini tamamla.
- [ ] Yerel Çalışma Alanı filtre ve kayıt türü seçicilerinin dar görünüm davranışını istemci UI testleriyle doğrula.
- [ ] Yetki/Kira çalışma ekranlarında sağ Ofis Akışı panelinin geniş/dar yerleşimini ve ortak Windows operasyon standardını toplu UI testleriyle doğrula.
- [ ] Yeni abonelik ve DASK alanlarının mevcut birim/A4 testlerine ek olarak paket içi kabul kontrolünü tamamla.
- [ ] Şifreli yedek alma, geri yükleme öncesi doğrulama, sürümleme ve audit akışındaki gerçek teknik boşlukları incele; mevcut yedekleri değiştirmeden eksikleri tamamla.

## 2. Mahremiyet ve iş akışı

- [ ] Ofis Akışı için talep-eşleşme ve eksik işlem özetlerinin merkezi veri kaynağını belirle; kişi, telefon ve taşınmaz ayrıntısı sızdırmadan yalnız gerekli anonim kartları uygula.
- [ ] Danışman, ofis asistanı ve broker manager rollerinin merkezi/offline kapsamını mevcut audit ve render testleriyle toplu doğrula.

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
- [x] 82 test dosyası / 219 test, TypeScript ve production build doğrulamasını tamamla.
- [x] Kullanıcı talebiyle güncel menü düzenini içeren temiz kaynak ZIP’i oluştur ve bütünlüğünü doğrula.
- [x] Kalan güvenlik, yedekleme/merge ve son Windows/Electron kabul kontrollerini tek güncel kontrol planında sınıflandır ve süre tahminiyle raporla
- [x] Windows/Electron kabul testi öncesi paket, temiz başlangıç, sürüm eşleşmesi, startup.log ve tek oturum kontrol sırasını hazırla
- [ ] Kira sözleşmesi ilk kira son ödeme tarihi yardımcı satırındaki ISO gösterimini Türkçe GG.AA.YYYY biçimine çevir ve Windows kabul ekranında doğrula
- [x] Kira sözleşmesi otomatik özetindeki ilk vade, bitiş ve tahliye uyarısı tarihlerini Türkçe GG.AA.YYYY biçiminde göster; mevcut ISO tarih değerlerini yalnız sunum katmanında dönüştür
- [x] Offline işlem ön koşulunda yalnızca boşluklardan oluşan kullanıcı kimliğini reddet; kimlik doğrulama testini düzelt

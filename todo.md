# Global 1881 — Aktif Proje Görevleri

Bu dosya yalnızca **bugün açık olan ve tekrar etmeyen** işleri içerir. Önceki ayrıntılı görev geçmişi `todo-archive.md` ve `todo-history-2026-08-29.md` içinde korunmaktadır; hiçbir geçmiş kayıt silinmemiştir.

## 1. Güvenli Windows / Electron kabulü — dağıtım durduruldu

- [ ] Defender’ın `Trojan:Script/Wacatac.H!ml` algıladığı 1.0.23 EXE, ZIP ve BAT dosyalarını geçersiz kabul etmeyi sürdür; bu dosyaları yeniden üretme, gönderme, geri yükletme, izin verme veya güvenlik korumasını aşma yönlendirmesi yapma.
- [ ] Kullanıcının mevcut 1.0.22 kurulumu ve `%APPDATA%\Global 1881 Gayrimenkul` verilerini değiştirmeden koru.
- [ ] Gelecekte offline Windows dağıtımı yeniden ele alınırsa yalnız gerçek Windows ortamında oluşturulan, bağımsız güvenlik incelemesinden geçmiş ve kullanıcı kabulü için tek toplu paket yaklaşımını değerlendir; bu karar oluşmadan paket üretme.
- [ ] Güvenli bir Windows kabul yolu oluştuğunda tek oturumda Offline Genel Bakış açılışı, `startup.log`, `En geç` tarihinin `GG.AA.YYYY` görünümü, A4 kira/yetki belgeleri, DASK/EİDS/ekler, menü ve Ofis Akışı yerleşimini doğrula.

## 2. Canlı web erişimi — platform / alan adı takibi

- [ ] Yayın alan adı kullanıcı ağlarında güvenlik uyarısı veya bakım ekranı göstermeden kararlı biçimde erişilebilir olana kadar altyapı durumunu takip et. Ubuntu kontrolünde TLS sertifikası geçerli ve giriş sayfası HTTP 200 dönmüştür; bu, kullanıcı ağındaki önceki `ERR_SSL_PROTOCOL_ERROR` ve bakım ekranını tek başına kapatmaz.
- [ ] Güvenli erişim kararlı olduğunda, Windows paketi yerine yayımlanmış web uygulamasında tek ekran kabul oturumunu planla. Kullanıcıdan aynı bağlantı testlerini tekrarlamasını isteme.
- [x] Kullanıcının 29.08.2026 tarihli normal tarayıcı ekran görüntüsünde tekrar doğrulanan `ERR_SSL_PROTOCOL_ERROR` bulgusunu alan adı/HTTPS erişim katmanı olayı olarak platform desteğine ilet; uygulama kodu, Windows ağ teşhisi veya güvenlik korumasını aşma ile çözmeye çalışma. Kullanıcı destek başvurusunu gönderdi.

- [x] Windows 10’daki uygulama kilitlenmesi ve takip eden Windows 11 kurulumu bağlamını destek başvurusuna ekle; işletim sistemi geçişini olası yerel etken olarak not et, ancak alan adı sorununa doğrulanmış kök neden diye tanımlama. Kullanıcı destek başvurusuna ekledi.

## 3. Bağımlılık ve uygulama güvenliği

- [x] `mdast-util-to-hast` paketini 13.2.1 sürümüne yükselt; tam test, TypeScript ve production build ile doğrula.
- [ ] ExcelJS üzerinden gelen `uuid@8.3.2` için kalan tek orta seviye audit bulgusunu, yalnız uyumlu upstream sürüm veya desteklenen ve kilit dosyasında uygulanabildiği kanıtlanan bir düzeltme ile ele al. Uygulanamayan yerel patch’i dağıtıma alma.
- [x] Express 5 rota geçişinden sonra ana sayfanın HTTP 200 ve korunan `/manus-storage/office-documents/example.pdf` isteğinin HTTP 403 davranışını doğrula.
- [x] Aktif Kiralamalar ekranındaki ExcelJS yüklemesini dosya seçimi anına taşı; aktarım testleri, TypeScript ve production build ile doğrula. Sayfa parçası 999,12 kB’dan 59,48 kB’a indi; Excel kodu yalnız aktarım gerektiğinde ayrı 939,79 kB parçası olarak yüklenir.

## 4. Fonksiyonel kabulde bekleyen tekil noktalar

- [ ] Kod ve test düzeyinde tamamlanan kira yardımcı tarihi, A4 belgeler/ekler, yedek/merge, rol mahremiyeti, boş online başlangıç ve responsive Ofis Akışı davranışlarını güvenli erişim sağlandığında kullanıcıya görünen gerçek çalışma ortamında toplu kabul et.
- [ ] WordPress, DNS delegasyonu ve alan adı sahipliği modelini, web tasarımcısının erişim sınırlarıyla kullanıcı kararı olarak değerlendir.
- [ ] Otomatik dış mesaj veya zamanlanmış iletişim ekleme; yalnız kullanıcı tarafından manuel yenilenen hizmet takvimi yaklaşımını koru.

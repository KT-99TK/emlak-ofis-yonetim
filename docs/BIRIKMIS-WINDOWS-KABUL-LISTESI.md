# Birikmiş Windows Kabul Kontrolü

Bu kontrol listesi, **acil hata veya anlamlı toplu sınır oluşmadan yeni kaynak ZIP’i üretmeme** tercihine göre hazırlanmıştır. Bir sonraki uygun Windows paketi kurulduğunda, aynı oturumda aşağıdaki başlıkların kısa biçimde denenmesi yeterlidir.

## Tek oturumluk öncelik sırası

| Sıra | Windows üzerinde kısa kontrol | Kabul ölçütü |
|---:|---|---|
| 1 | Offline ana ekran ve sol menü | Global 1881 marka alanı okunur; tek sol menü vardır; dar ekranda ikinci rota şeridi görünmez. |
| 2 | Yetki/Kira formu ve A4 önizleme | EİDS malik satırının altında görünür; müşteri A4’ünde görünmez; DASK, sayaçlar, tahliye ve demirbaş bölümleri taşmaz. |
| 3 | Rol gizliliği ve PDF | Danışman yalnız kendi kayıt/PDF’sini açar; ofis asistanı yalnız managerın atadığı danışman kapsamını görür. |
| 4 | Kasa-Banka ve iç denetim | Kasa hareketleri, belge referansı, 3.000 TL onay eşiği ve %60/%40 iç denetim paylaşımı görünür; resmî muhasebe çıktısı oluşmaz. |
| 5 | Merkezi başlangıç hazırlığı | Web/mobilde sıfır bakiye ve aktarım yok bildirimi görünür; manager geçiş tarihini ayarlamadan yeni merkezi kayıt açılamaz. |

> Bu beş kontrol **geçerse**, yalnız kullanıcıyla mutabık kalınmış tek kabul sınırında yeni Windows paketi değerlendirilir. Küçük görünüm düzeltmeleri için yeni ZIP veya kurulum istenmez.

| Alan | Beklenen sonuç |
|---|---|
| EİDS | Yetki formunda Malik adı/unvanı ve TCKN/VKN satırının hemen altında görünür; yalnız rakam kabul eder; boşken `bekliyor`, doluyken `tamamlandı` görünür; müşteri A4 belgesinde yer almaz. |
| EİDS yetkisi | Kayıt sahibi danışman kendi kaydını günceller; broker manager açık yerel oturumda günceller; ofis asistanı veya başka danışman değiştiremez. |
| Sözleşme/PDF gizliliği | Başka danışman müşteri, malik, iletişim, adres, sözleşme ve PDF ayrıntılarını açamaz. Ofis asistanı yalnız Yerel Çalışma Alanında managerın atadığı danışman kullanıcı kodu kapsamını görür. |
| Bütçe ve iç denetim | Bütçe/Gider ile Ofis Payı–Danışman Katkı menüleri açılır; 3.000 TL ve üzeri temsil/ağırlama kaydı manager onayına düşer; KDV hariç varsayılan paylaşım %60 danışman/%40 ofistir. |
| Kasa aktarımı | Ofis kasasına aktarılan komisyon payı, aynı kaynak işleme bağlı tekil Kasa-Banka hareketi olarak görünür; ikinci tahsilat üretmez. |
| Tarih | İşlem Kapanışları tahsilat ve kapora tarihleri `GG.AA.YYYY` görünür; kayıt veri biçimi ve hesaplamalar korunur. |
| Arayüz | Offline sol menüde Global 1881 marka alanı, Ofis Operasyonları ve Kişisel Çalışma Alanı grupları okunur; Size Özel Gündem yalnız sağda bir kez görünür ve ana formdan daha dar kalır. |
| Dar ekran gezinmesi | Electron dar görünümünde ikinci hızlı rota şeridi görünmez; tek erişim kaynağı SidebarTrigger ile açılan sol menüdür. |
| Başlangıç yükü | Ana sözleşme akışları doğrudan açılır; arşiv, bütçe, kasa-banka, rapor, mobil ve diğer ikincil ekranlar gerektiğinde yüklenir. |
| Kaynak kurulumu | Windows kaynak kurulumunda `pnpm install --frozen-lockfile --prefer-offline` uyarısız tamamlanır; Wouter patch ve Tailwind bağımlılık kuralı korunur. |
| A4 | Yetki/Kira müşteri A4 belgelerinde EİDS ve iç denetim metni görünmez; demirbaş `Adet` göstergesi tek satırdadır. |
| Temiz online başlangıç | Yalnız broker manager, `Online Başlangıç` ekranında Türkiye gününe göre geçiş tarihi ve tam teyit metniyle ayar yapabilir; etkinleşen tarih geçmişe çekilemez ve audit izi oluşur. |
| Sıfır başlangıç | Açılış bakiyesi, devir, eski kasa/banka, geçmiş tahsilat/gider, eski sözleşme veya eski PDF merkezi sisteme taşınmaz. Offline geçmiş arşivi, yedekler ve yerel veriler yerinde kalır. |
| Web/mobil durum | Başlangıç ayarlanmamış ya da ileri tarihliyken web ve mobilde `Merkezi online başlangıç bekliyor` bildirimi görünür; yeni kayıt, mobil kasa hareketi ve yeni imzalı PDF işlemleri pasiftir. |
| Devam eden aktif dosya | Gerekliyse manager yalnız güncel taraf/portföy bilgileriyle yeni kısa başlangıç özeti açar; eski sözleşme ayrıntısı, geçmiş finans, bakiye ve PDF aktarımı yapılmaz. |

> Bu liste resmî muhasebe, e-Fatura, beyanname veya vergi onayı değildir. Bütçe, KDV referansı, ofis payı ve danışman katkısı yalnız ofis içi kontrol/performans takibi için kullanılır.

# Ofis Akışı Görsel Doğrulaması

**Tarih:** 23 Ağustos 2026  
**Kapsam:** Dashboard sağ sütununda rol bazlı Ofis Akışı paneli.

| Görünüm | Sonuç | Bulgu |
|---|---|---|
| 1920 × 1080 masaüstü | Başarılı | Koyu yeşil Ofis Akışı paneli, güncel `DashboardFlowGrid` yapısında ana akış kartının sağında dengeli bir sütunda görünür. Broker manager görünümünde yalnız gecikmiş vade, yedi günlük görünüm, sözleşme işlemi ve açık tahsilat sayıları yer alır; kişi veya müşteri verisi gösterilmez. |
| 768 × 1024 dar görünüm | Başarılı | Güncel grid yapısında panel ana akış kartının altına geçer; metinler, sayaçlar, istisna kutuları ve “Vadeleri aç” eylemi taşmadan erişilebilir kalır. |

Danışman görünümündeki kişisel kayıt isimleri ile kritik giriş popupı, bileşen ve yardımcı fonksiyon testleriyle doğrulanmıştır. Gerçek Electron/Windows kanıtı ayrıca açık doğrulama kalemi olarak korunur.

## Birleşik arayüz web önizleme notu — 24 Ağustos 2026

Geniş ekran web denetiminde sol Global 1881 marka alanı, aktif menü rengi ve ana içerik çerçevesi Genel Bakış, Sözleşmeler ve Kira & Vergi Vadeleri ekranlarında ortak göründü. Tarih girişleri `GG.AA.YYYY` yer tutucusuyla görüntüleniyor. Sözleşmeler ekranındaki eski küçük yatay logo, sidebar marka alanıyla yinelenen ikinci marka anlatımı oluşturuyor; birleşik marka standardı kapsamında kaldırılması veya ortak kilitlenmeyle değiştirilmesi değerlendirilecek.

Dar ekran denetiminde üst mobil menü başlığı görünür ve tarih girişleri taşmadan render olur. Kira & Vergi Vadeleri form kartının sağ kenarı ve birincil işlem düğmesi gerçek cihaz kabulünde ayrıca incelenecek; bu önizleme yatay alanın dar hissedildiğini gösterdi.

24 Ağustos 2026 dar ekran incelemesinde Vade tablosundaki geniş tablo, grid öğesinin minimum içerik genişliğini büyüterek form kartını sağa taşırdı. Ortak `.workspace-content-frame .grid > * { min-width: 0; }` kuralı eklenerek tablo kaydırması kendi kabında tutuldu ve ana form/düğme taşması engellendi.

Sonraki 375 px mobil denetiminde Vade formu kartı ekrana sığdı; `GG.AA.YYYY` giriş alanı ve “Takvime ekle” düğmesi tam genişlikte, okunur kontrastla göründü. 1440 px Sözleşmeler denetiminde yinelenen içerik logosu kaldırıldı; Global 1881 markası sol menüde tek ve güçlü kaynak olarak kaldı, belge çalışma alanı başlığı bununla daha dengeli göründü.

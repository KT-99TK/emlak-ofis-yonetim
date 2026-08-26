# Online–Offline Kabuk Görsel Envanteri

Bu not, 26 Ağustos 2026 tarihinde 1280 px masaüstü ve 390 px mobil görünümde yapılan inceleme için hazırlanmıştır. Amaç, merkezi web uygulamasının görsel dilini Windows offline operasyon akışına yaklaştırırken; offline veri sınırlarını, Electron güvenlik davranışını ve A4 yazdırma yüzeyini değiştirmemektir.

| Yüzey | Mevcut güçlü yön | Hizalama kararı |
|---|---|---|
| Sol marka alanı | Zümrüt zemin, krem marka yazısı ve altın vurgu hem web hem offline kabukta okunaklıdır. | Offline mühür 62 px’e çıkarılır; Ofis Operasyonları ve Kişisel Çalışma Alanı başlıkları görünür tutulur. |
| Ana içerik çerçevesi | Web görünümü yaklaşık 1180 px kontrollü çalışma genişliğini ve açık zeminli kartları kullanır. | Offline ana formlar aynı kontrollü çerçeve, yumuşak kart gölgesi ve zümrüt odak halkası kurallarını kullanır. A4 kanvası bu sınırdan istisnadır. |
| Sağ yardımcı yüzey | Web ana sayfasında Ofis Akışı içerik kartıdır; offline’da Size Özel Gündem yalnız sağ yardımcı sütunda tek kez gösterilir. | Offline yardımcı sütun 248–280 px ile ana formu gölgelemeyecek biçimde tutulur; ikinci panel üretilmez. |
| Mobil görünüm | 390 px görünümde kartlar tek sütuna iner, içerik sırası korunur ve yatay taşma görülmez. | Offline’da SidebarTrigger/dar ekran menüsü korunur; marka hiyerarşisi mobilde içerik alanını daraltmaz. |

> Bu envanter yalnız tasarım hizalaması içindir. Müşteri/malik gizliliği, manager kilidi, IndexedDB saklama biçimi, PDF erişimi ve A4 yazdırma kuralları tasarım değişikliklerinden bağımsız olarak korunur.

## Rota Yükleme Görsel Doğrulaması

26 Ağustos 2026 tarihli masaüstü incelemesinde, tembel yüklenen **Müşteriler** ve **Kira ve vergi takibi** web rotaları ana kabuktan sonra sorunsuz açıldı; sol menüde doğru aktif durum ve içerik hiyerarşisi korundu. Aynı gün 390 px görünümde `/mobile` rotası da doğrudan açıldı; gündem, kasa özeti ve alt mobil dolaşım görünür kaldı. Bu gözlem, kod bölme işleminin kullanıcıya görünen rota düzenini değiştirmediğini gösterir.

# Proje Yedekleri ve Görüşme Arşivi

## Kapsam ayrımı

Bu projede iki farklı yedek türü bulunur. Kod checkpoint'i, uygulamanın kaynak dosyalarını, yapılandırmasını ve o sürümdeki proje durumunu geri alınabilir biçimde korur. Son görünür checkpoint `80d033a5` sürümüdür. Bu kayıt, kodun yedeklendiğini gösterir; ancak sohbet geçmişinin tam metin dışa aktarımı değildir.

Resmî Manus Task Data Backup ise görev, proje dosyaları, checkpoint'ler ve desteklenen görev varlıklarını hesap panelindeki resmi yedekleme akışı üzerinden korumayı amaçlar. Bu işlemin bu proje ekranından otomatik olarak tamamlandığı varsayılmamalıdır. Kullanıcı, resmi yedekleme sayfasından işlemi ayrıca başlatıp tamamlandığını doğrulamalıdır.

## Güvenlik sınırı

Yedek arşivine parola, API anahtarı, JWT secret, `.env` değeri, GitHub token'ı veya müşteri hassas verisi eklenmemelidir. Bu kart yalnızca yedekleme durumunu ve doğru resmi yönlendirmeleri gösterir; tam sohbet arşivi yerine geçmez.

## Açılış ekranındaki yönlendirme

Açılış ekranındaki **Proje yedekleri ve geçmiş** kartında son kod checkpoint'i, resmi yedekleme sayfası ve yardım merkezi bağlantıları görünür. Resmî yedek işlemi tamamlandıktan sonra kullanıcı, ilgili hesap/panel onayını ayrıca saklamalıdır.

## Güncel durum

| Öğe | Durum |
|---|---|
| Kod ve proje checkpoint'i | `80d033a5` mevcut |
| Kaynak kodu ve migration'lar | Checkpoint kapsamındaki proje dosyalarında mevcut |
| Tam sohbet metni | Bu kart tarafından otomatik dışa aktarılmış kabul edilmemeli |
| Resmî Task Data Backup | Kullanıcının hesap panelinden ayrıca tamamlaması ve doğrulaması gerekir |
| Parola/secret yedeği | Güvenlik nedeniyle proje arşivine dahil edilmez |

Resmî yönlendirmeler: [Manus yedekleme sayfası](https://manus.im/backup) ve [Manus Yardım Merkezi](https://help.manus.im).

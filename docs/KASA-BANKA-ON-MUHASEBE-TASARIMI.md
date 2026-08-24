# Global 1881 Dar Kapsamlı Kasa-Banka ve Tahsilat Kontrol Planı

> **Çalışma tasarımıdır; vergi ve resmî muhasebe sınıflandırması için mali müşavir onayı alınmalıdır.** Bu plan genel muhasebe defteri yerine, emlak ofisinin günlük para hareketini ve işlem kapanış riskini yönetmek içindir.

## Başlangıç yaklaşımı

Sistem iki ayrı soruya aynı anda cevap vermelidir:

1. **Para nerede?** Ofis kasasında mı, hangi banka hesabında mı?
2. **Para neden geldi/gitti?** Kapora-emanet mi, hizmet bedeli mi, KDV mi, ofis harcaması mı, danışman avansı/mahsubu mu, iade mi?

Bu iki boyut ayrılmazsa kapora veya müşteri emaneti yanlışlıkla ofis geliri gibi, danışman adına alınmış bir tahsilat da takip dışı görünebilir.

## Dar hesap planı

| Kod | Grup | Kullanım | Gelir sayılır mı? |
|---|---|---|---|
| `KASA-OFIS-01` | Nakit kasa | Ofiste fiziksel olarak bulunan Türk lirası | Hayır; yalnız para yeri |
| `BANKA-OFIS-01` | Banka hesabı | Ofis ana banka hesabı; her ek banka için ayrı kod | Hayır; yalnız para yeri |
| `EMANET-KAPORA` | Amaç | Müşteri kaporası/emaneti, işlem dosyasına bağlı | Hayır; ayrı takip |
| `TAHSILAT-HIZMET` | Amaç | Ofis hizmet bedeli tahsilatı | Operasyonel tahsilat olarak izlenir |
| `TAHSILAT-KDV` | Amaç | Hizmet bedeline bağlı KDV tahsilatı | Hizmet geliriyle karıştırılmaz |
| `GIDER-OFIS` | Amaç | Kira, kırtasiye, ilan, ulaşım vb. ofis masrafı | Gider kontrolü |
| `AVANS-DANISMAN` | Amaç | Danışmana verilen operasyon avansı | Gelir/gider değil, mahsup bekler |
| `MAHSUP-DANISMAN` | Amaç | Danışman avansı veya işlem bağlantılı mahsup | Ayrı kapanış kontrolü |
| `IADE-MUSTERI` | Amaç | Onaylı müşteri iadesi | İşlem dosyasına bağlı |

## Tahsilatın kayıt zinciri

| Adım | Danışman | Broker manager | Zorunlu bilgi |
|---|---|---|---|
| Tahsilatı beyan et | Kendi işlemine ait tahsilatı ekler | Görür | Müşteri/ödeyen, işlem dosyası, tutar, yöntem, tarih |
| Kanıtı kaydet | Nakit makbuz veya banka/EFT/FAST referansı girer | Kontrol eder | Referans/makbuz no, teslim alan veya banka hesabı |
| Doğrula | Yapamaz | `managerVerified` yapar | Tutar, kanıt ve amaç kontrolü |
| Banka eşleştir | Görüntüler | Ekstre hareketi ile `bankMatched` yapar | Banka hareket referansı |
| Gün sonu mutabakat | Kasa sayımını bildirir | Farkı kapatır veya gerekçelendirir | Açılış, giriş, çıkış, fiili bakiye, fark notu |

## Kapora kuralı

Kapora; satış/kira işlem dosyasına bağlı, müşteri/ödeyen bilgili, tahsilat yöntemi ve makbuz/banka referanslı kaydedilir. Operasyon ekranında `EMANET-KAPORA` amacıyla ayrılır ve **hizmet bedeli geliri toplamına eklenmez**. İade, mahsup veya işlem sonucunda kullanımına ilişkin karar broker manager onayı ve audit ile yapılır.

## Gün sonu kontrolü

Her aktif kasa/banka hesabı için sistem şunu hesaplar:

`Beklenen kapanış = Açılış bakiyesi + doğrulanmış girişler − doğrulanmış çıkışlar`

Fiziksel kasa sayımı veya banka ekstresi tutarı girildiğinde fark gösterilir. Danışman tarafından yalnız beyan edilmiş, manager doğrulaması bekleyen hareketler beklenen bakiyeye girmez; ayrıca uyarı olarak kalır. Referansı eksik nakit/banka hareketi, işlem dosyası bağlantısı olmayan kapora ve gün sonu farkı kırmızı istisnadır.

## Uygulama sırası

1. Önce tek kasa ve gerçekten kullanılan her banka hesabı tanımlanır; gereksiz hesap açılmaz.
2. Mevcut İşlem Kapanışlarındaki tahsilat satırı, kasa/banka hareketine bağlanır.
3. Danışman yalnız beyan eder; manager doğrular, banka eşleştirir ve farkı kapatır.
4. Gün sonu özetinde hizmet bedeli tahsilatı, kapora/emanet, onaysız transfer, belge eksiği ve bakiye farkı ayrı görünür.
5. Müşteri ve danışman ödemeleri için deneme kayıtlarıyla Windows/Electron kabulü yapılır; sonrasında merkezi mobile taşınır.

## Uygulanmış ilk güvenlik modeli

`cashBankControl` yardımcı katmanı; aktif kasa/banka hesabı, tutar, kişi, kaydı giren kullanıcı, makbuz/banka referansı, kapora işlem dosyası ilişkisi ve nakit teslim alan bilgisi için doğrulama kuralları içerir. Gün sonu modeli yalnız manager tarafından doğrulanmış/banka eşleşmiş/mutabık hareketleri beklenen bakiyeye katar. Bu aşama bir tasarım ve doğrulanmış iş kuralı katmanıdır; gerçek form/ekran entegrasyonu ayrı kabul adımıyla yapılacaktır.

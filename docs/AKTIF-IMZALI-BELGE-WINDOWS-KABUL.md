# Aktif İmzalı Belge — Windows Kabul Kontrolü

Bu kontrol, **geçmiş Müşteri Dijital Arşivi** ile **aktif imzalı sözleşme dosyası** ayrımını doğrular. Önce yalnız test amaçlı, kendi danışmanınıza ait imzalı ve süresi devam eden bir kira sözleşmesi kullanın.

## Danışman kabulü

1. Windows uygulamasında danışmanın kendi offline kullanıcı koduyla açın.
2. **Kira Sözleşmeleri** ekranında sözleşmenin taraf imza teyidini işaretleyip yerel olarak kaydedin.
3. Görünen **İmzalı PDF dosyasına git** düğmesine basın veya sol menüden **Aktif İmzalı Belgeler** ekranını açın.
4. Sadece danışmanın kendi, imzalı ve bitiş tarihi gelmemiş kira sözleşmesinin seçilebildiğini doğrulayın.
5. İmzalı PDF’yi ekleyin. Kayıtta müşteri tarafları, sözleşme numarası, imza tarihi, PDF adı ve SHA-256 bilgisi görünmelidir.
6. Ekranda **sil**, **düzenle** veya **yeniden yükle** eylemi bulunmadığını doğrulayın.
7. PDF’yi açın; dosyanın açıldığını ve aktif Kira/Vade ekranlarında ikinci bir vade, tahliye, tahakkuk veya tahsilat oluşmadığını doğrulayın.

## Gizlilik kabulü

| Kullanıcı | Beklenen sonuç |
|---|---|
| Sözleşme sahibi danışman | Kendi belgeyi görür ve açar; yalnız kendi aktif sözleşmesine yeni PDF ekler. |
| Başka danışman | Sözleşme, müşteri adı, PDF adı ve açma eylemini görmez. |
| Broker manager | Yetkili görüntüleme ve PDF açma yapar; danışman adına yeni belge eklemez. |
| Atanmış ofis asistanı | Yetkili görüntüleme ve PDF açma yapar; silme/düzenleme yapamaz. |

## Ekran kanıtı

Kabul için şu dört ekran görüntüsünü paylaşın:

1. Sözleşme sahibi danışmanda **Aktif İmzalı Belgeler** listesindeki PDF satırı.
2. Aynı ekranda silme/düzenleme komutunun bulunmadığı görünüm.
3. Başka danışman hesabında ilgili müşteri/PDF’nin görünmediği görünüm.
4. Broker manager veya atanmış ofis asistanında yetkili PDF açma görünümü.

> Dosya Windows kullanıcı verisi altındaki `active-contract-documents` klasöründe tutulur. Şifreli JSON yedeği metadata taşır; PDF baytlarının cihaz değişiminde ayrıca güvenli biçimde aktarılması gerekir.

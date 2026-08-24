# Aktif İmzalı Belge ve Müşteri Dosyası Tasarımı

## Amaç

Geçmiş, sona ermiş PDF’ler **Müşteri Dijital Arşivi** içinde salt-okunur kalır. Hâlen devam eden, imzalı kira sözleşmeleri ise kendi aktif sözleşme ve müşteri dosyasına eklenir. Bu ayrım, eski evrakın aktif vade ve tahliye hesaplarını değiştirmesini önlerken güncel imzalı belgeyi operasyon kaydına bağlar.

| Konu | Geçmiş Müşteri Dijital Arşivi | Aktif imzalı belge dosyası |
|---|---|---|
| Kaynak sözleşme | Sona ermiş/operasyon dışı PDF | İmzalı ve devam eden yerel `contract` kaydı |
| Kayıt türü | `contractArchive` | `activeContractDocument` |
| Vade/tahliye etkisi | Yok | Yeni etki oluşturmaz; mevcut aktif sözleşme takibini yalnız belgeyle destekler |
| Yükleme | Manager veya atanmış ofis asistanı | Sözleşmenin sahibi danışman, yalnız kendi kaydına |
| Silme/değiştirme | Yok | Yok |
| Görüntüleme | Sahip danışman, manager, yetkili asistan | Aynı sözleşme erişim matrisi |

## Sahiplik ve silinemezlik

Danışman, yalnız kendi offline kullanıcı koduyla sahip olduğu ve imza teyidi bulunan aktif kira sözleşmesini seçebilir. Bir PDF eklendiğinde dosya Windows `userData/active-contract-documents` klasörüne kopyalanır; IndexedDB’de yalnız metadata tutulur. Metadata, sözleşme kayıt kimliği, danışman sahipliği, müşteri tarafları, imza tarihi, dosya adı, boyut, SHA-256 özeti ve yükleme audit olayını içerir.

> Danışman için **silme veya düzenleme komutu bulunmaz**. IPC yüzeyinde de silme işlemi açılmaz. Bu nedenle kullanıcı arayüzünden eklenmiş imzalı belgeyi sessizce yok etmek mümkün değildir.

Broker manager açısından olası istisna, dosyayı silmek değil ayrı bir gerekçeli **belge geçersiz kılma** kaydı üretmektir. İlk geçiş sürümünde bu istisna akışı uygulanmayacak; belge ve bütünlük kaydı korunacaktır.

## Aktiflik kuralı

Bir kira sözleşmesi, `signedByParties === true` ve bitiş tarihi bugünden ileri/eşit ise belge yüklemeye uygundur. Danışman, PDF yüklemeden önce seçilen sözleşmenin müşteri, taşınmaz ve imza durumunu ekranda görür. Belge eklemek yeni vade, tahliye, tahakkuk veya tahsilat oluşturmaz; bunlar sözleşmenin mevcut operasyon kaydından yönetilir.

## Windows kabulü

1. Danışman kendi offline kullanıcı koduyla giriş yapar.
2. **Aktif İmzalı Belgeler** ekranında yalnız kendi imzalı/devam eden sözleşmesini görür.
3. PDF seçer; dosya türü, boyutu ve SHA-256 değeri doğrulanır.
4. Belge müşteri adıyla ilgili aktif sözleşme dosyasında görünür ve açılır.
5. Danışman silme/düzenleme seçeneği görmez; başka danışman kayıt veya PDF adını görmez.
6. Manager/atanmış ofis asistanı yetkili görüntüleme yapar; aktif vade ve tahliye bilgisi mevcut sözleşme üzerinden korunur.

# Müşterinin Çoklu Taşınmazlarını Toplu Kaydetme Önerisi

## Mevcut durum

Offline kira ve yetki ekranlarındaki `Malik seçin`, `Kiracı seçin` ve `Mülk seçin` alanları, bu cihazdaki erişilebilir `client` ve `property` kayıtlarını açılır liste olarak kullanıyor. Seçilen malik ve mülk bilgileri form alanlarına aktarılıyor; kayıt sırasında seçilen kayıt kimlikleri sözleşme snapshot’ına yazılıyor. Her taşınmazın ayrı bir `property` kaydı olması doğru ve gereklidir.

Mevcut yapıda genel amaçlı müşteri–çoklu mülk Excel aktarımı bulunmuyor. Aktif kira özetleri için Excel aktarımı var; ancak bu akış yeni mülk portföylerini doğrudan mülk kaydı olarak üretmek yerine kira özetlerini işler.

## Önerilen model

Bir müşterinin birden fazla taşınmazı tek Excel çalışma kitabında ayrı satırlar olarak alınır. Excel dosyasındaki her satır sistemde ayrı bir mülk kaydı oluşturur; ortak malik bilgisi müşteri kaydıyla ilişkilendirilir. Böylece kullanıcı tek tek form doldurmaz, fakat sözleşme ve dropdown seviyesinde her mülk bağımsız seçilebilir.

| Alan | Açıklama |
|---|---|
| Müşteri sıra no | Aynı müşterinin mülklerini gruplayan numara; örneğin `M-002` |
| Mülk sıra no | Müşteri içindeki taşınmaz sırası; `M-002-01`, `M-002-02` |
| İşlem amacı | Satılık, kiralık veya her ikisi |
| Malik adı/unvanı | Müşteri kartıyla eşleştirilecek kişi/kurum |
| Malik telefonu | Mevcut müşteri kartına aktarılacak iletişim bilgisi |
| Taşınmaz türü | Daire, villa, işyeri, arsa vb. |
| Taşınmaz başlığı | Kullanıcıya dropdown’da gösterilecek kısa ad |
| Açık adres | Mahalle, sokak, kapı ve bağımsız bölüm bilgisi |
| Ada/parsel/bağımsız bölüm | Uygunsa kadastro bilgisi |
| Fiyat/kira | Satış fiyatı veya aylık kira bedeli |
| Danışman kodu | Portföy sorumlusu; mevcut yetki kuralları uygulanır |
| Yetki başlangıç/bitiş | İlan ve sözleşme takibi için tarih alanları |
| Not | İç operasyon notu; müşteri çıktısına otomatik taşınmaz |

## Sıra numarası kuralı

Sıra numarası Excel satırından kör biçimde alınmamalıdır. Sistem önce malik ve taşınmazın benzersiz anahtarını kontrol eder. Yeni müşteri için `M-002`, o müşterinin ilk mülkü için `M-002-01`, ikinci mülkü için `M-002-02` verilir. Daha önce kayıtlı bir mülk bulunursa mevcut sıra korunur; yeni mülkler son sıradan devam eder.

Benzersiz kontrol için normalize edilmiş malik kimliği, taşınmaz açık adresi, bağımsız bölüm veya referans numarası birlikte kullanılır. Aynı adresin farklı bağımsız bölümleri ayrı mülk olabilir; bu nedenle yalnızca malik adına göre mükerrerlik yapılmaz.

## Kullanıcı akışı

Danışman, Portföyler veya Müşteri–Taşınmaz Aktarımı ekranında Excel şablonunu indirir. Dosyayı doldurup yüklediğinde sistem önce önizleme tablosu gösterir. Önizlemede yeni müşteri, mevcut müşteriyle eşleşen satır, yeni mülk, mükerrer veya eksik alan durumu ayrı renklerle gösterilir. Kullanıcı onaylamadan hiçbir kayıt yazılmaz.

Onaydan sonra sistem müşteri kartını bir kez oluşturur veya mevcut kartla eşleştirir; satırların her birini ayrı property kaydı olarak kaydeder; `M-002-01` gibi sıra numarasını üretir; satış/kiralama talebini taşınmazın işlem amacı alanına yazar. Bundan sonra kira formundaki `Mülk seçin` listesinde her taşınmaz ayrı ve sıra numarasıyla görünür.

## Önerilen dropdown etiketi

Dropdown’da yalnızca “Villa” veya “Daire” yazmamalıdır. Önerilen gösterim şöyledir:

`M-002-01 · VİLLA · URLA / GÜZELBAHÇE · Satılık`

Aynı müşterinin birden fazla mülkü böylece karıştırılmaz. Seçim yapıldığında açık adres, taşınmaz türü, fiyat/kira ve portföy bilgileri forma otomatik doldurulur.

## Sonuç

Her mülkün sistemde ayrı kayıt olması gerekir; ancak kullanıcı bunları tek tek elle oluşturmak zorunda bırakılmamalıdır. En doğru çözüm, Excel’den toplu aktarım ve onay önizlemesidir. Bu yaklaşım mevcut dropdown yapısını bozmaz, sözleşmelerde doğru mülkün seçilmesini sağlar ve aynı müşterinin çoklu portföyünü sıra numarasıyla takip edilebilir hale getirir.

İlk uygulama fazında Excel şablonu, önizleme/onay ekranı, müşteri eşleştirme, otomatik mülk sıra numarası, satılık/kiralık seçimi ve mükerrerlik kontrolü yeterlidir. Fotoğraf toplu aktarımı ve harici ilan siteleriyle senkronizasyon sonraki ve ayrı kapsamdır.

## Karar gerektiren varsayım

Müşterinin aynı telefon numarası veya aynı normalize edilmiş isimle eşleşmesi otomatik öneri olarak gösterilebilir; ancak mevcut müşteri kaydının üzerine yazma işlemi kullanıcı onayı olmadan yapılmamalıdır. Aynı kişiye ait olduğu kesin olmayan kayıtlar “eşleşme bekliyor” durumunda tutulmalıdır.

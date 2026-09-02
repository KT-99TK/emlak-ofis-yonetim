# Global 1881 — Kimlik ve Telefon İçin Minimum Veri Planı

**Hazırlayan:** Manus AI  
**Tarih:** 2 Eylül 2026  
**Durum:** Uygulandı — yalnız yeni kayıt akışlarında. Geçmiş merkezi kayıtlar, imzalı PDF’ler ve önceki şifreli yedekler değiştirilmemiştir.

> **Hukuki not:** Bu belge teknik ve operasyonel tasarımdır; resmî hukuk görüşü değildir. Sözleşme saklama süresi, aydınlatma metni ve fizikî arşiv prosedürü yürürlüğe alınmadan önce KVKK alanında yetkin bir hukukçu tarafından gözden geçirilmelidir.

## 1. Önerilen ilke

Yeni yetki ve kira sözleşmelerinde T.C. kimlik numarası/vergi numarası ile telefon bilgisi sözleşme hazırlığı ve imzalı fizikî nüsha üretimi için girilir. Bu alanlar yeni merkezi kayıtta şifreli kasaya ayrılır ve varsayılan sistem görünümünde maskeli kalır; broker manager veya yalnız ilgili kaydın atanmış danışmanı açık gerekçe ile geçici tam görünüm isteyebilir. Sistem bu değerleri yazdırma veya imza sonrasında kendiliğinden silmez.

Bu yaklaşım, verinin amaçla bağlantılı, sınırlı ve ölçülü tutulması ile yalnız gerekli süre boyunca muhafaza edilmesi ilkeleriyle uyumludur.[1] Fizikî dosya da kişisel veri içerdiğinden kilitli arşiv, yetkili erişim, dosya çıkış kaydı ve saklama/imha prosedürü gerekir.[1] [2]

## 2. Mevcut uygulama etkisi

| Mevcut alan / süreç | Bugünkü kullanım | Önerilen değişim etkisi |
|---|---|---|
| `clients.identityOrTaxNo` | Müşteri kimlik veya vergi numarası | Yeni sözleşmelerde varsayılan maskeli; ham değer şifreli kasada tutulur. |
| `clients.phone` | Müşteri iletişimi ve aktif kira içe aktarımı | Yeni kayıtlarda varsayılan maskeli; atanmış danışmanın hizmet takibi için gerekçeli geçici görüntüleme vardır. |
| `activeRentalSummaries.tenantPhone` | Aktif kiracı takip kaydı | Yeni içe aktarımlarda varsayılan maskeli ve şifreli kasaya ayrılmıştır; eski kayıtlar değiştirilmez. |
| `contracts.details` ve belge üretimi | Form alanlarının sözleşme çıktısına aktarımı | Yeni sözleşmelerde aynı hassas alanlar ana ayrıntıdan ayrılıp maskelenir; tam değer kasada kalır. |
| Hizmet takvimi | Kira artışı, vergi ve malik takibi | Görev, sözleşme ve danışman ataması devam eder; telefon silinirse görev ekranında “fizikî dosyadan aranacak” durumu görünür. |

## 3. Seçilen hedef politika — maskeli saklama

Ofis tercihi, müşteriyle kurulan hizmet ilişkisini sürdürebilmek için T.C. kimlik/vergi numarası ve telefon bilgisinin silinmesi değil **maskeli saklanmasıdır**. Bu seçim, verinin dijital ortamda kalmaya devam ettiği anlamına gelir; bu nedenle yalnız görsel maskeleme değil rol sınırı, gerekçeli tam görüntüleme, audit kaydı, şifreli yedek ve güvenli bulut kontrolleri birlikte uygulanır.

| Veri | Varsayılan görünüm | Tam değere erişim | Dışa aktarım / audit kuralı |
|---|---|---|---|
| Telefon | `05•• ••• •• 24` | Broker manager veya **yalnız atanmış danışman**, açık gerekçe ile 30 saniyelik geçici görünüm talep ederek | Excel/PDF/QR/kart görünümünde maskeli; audit kaydında değer değil yalnız görüntüleme olayı yer alır. |
| T.C. kimlik no / vergi no | `••••••••1234` | Broker manager veya **yalnız atanmış danışman**, açık gerekçe ile geçici tam görünüm | Varsayılan dışa aktarımlarda hiç gösterilmez; audit kaydında değer yazılmaz. |
| İmzalı fizikî sözleşme | Tam bilgi, müşteri el yazısı ve ıslak imza | Kilitli arşivde atanmış danışman ve broker manager | Varsayılan olarak sisteme taranıp yüklenmez. |

Bu kural, yeni sözleşmeler için uygulanacak hedef durumdur. Mevcut müşteri kayıtları, aktif kira özetleri, imzalı PDF’ler ve şifreli geçmiş yedekler kullanıcı onayı olmadan değişmez.

## 4. Güvenli iş akışı

| Adım | Kural | Yetki |
|---|---|---|
| 1. Taslak | Kimlik/vergi no ve telefon, yalnız sözleşme oluşturmak için görünür. | Atanmış danışman; broker manager kapsamı. |
| 2. Belge üretimi | A4/PDF çıktı bu bilgileri içerir; belge sürüm/hashi kaydedilir. İmzalı nüsha varsayılan olarak sisteme yüklenmez. | Atanmış danışman. |
| 3. Fizikî imza teyidi | “Fizikî çıktı alındı ve ıslak imzalar tamamlandı” beyanı yapılır. Bu beyan, yazdırma işlemiyle otomatik oluşmaz. | Broker manager veya belirlenmiş kontrol yetkisi. |
| 4. Maskeli saklamaya geçiş | Fizikî imza teyidi sonrası veri silinmez; varsayılan görünüm maskelenir. Tam görüntüleme broker manager veya yalnız atanmış danışman için açık gerekçe, audit kaydı ve 30 saniyelik görünüm ile yapılır. | Sistem + yetkili broker manager/danışman. |
| 5. Audit | Yalnız alan adları, zaman, işlem yapan kişi, sözleşme referansı ve erişim gerekçesi yazılır; T.C./vergi no veya telefon audit kaydına yazılmaz. | Sistem. |
| 6. Sonraki takip | Hizmet görevi çalışmaya devam eder. Telefon varsayılan olarak maskelidir; atanmış danışman gerekçeli dijital görünüm isteyebilir, ofis asistanı isteyemez/göremez. | Atanmış danışman veya broker manager. |

## 5. Maskeli saklama için zorunlu korumalar

Sistem, ıslak imzayı doğrulayamayacağı için “yazdırıldı” olayı tek başına bir erişim politikası değişikliği tetiklememelidir. Maskeli saklamanın yalnız görünüm değişikliği olarak kalmaması için aşağıdaki korumalar zorunludur.

1. Politika yalnız yeni sözleşmeler için etkinleştirilmelidir; geçmiş müşteri kartları, aktif kira özetleri, mevcut imzalı PDF’ler ve önceki yedekler kullanıcı onayı olmadan değişmez.
2. Tam değer görünümü; broker manager veya yalnız kaydın atanmış danışmanı için rol/sahiplik kontrolü, görünüm gerekçesi ve 30 saniyelik/açık kullanıcı eylemi ile sağlanır. Ofis asistanı ve diğer danışmanlar erişemez. Varsayılan tablolar, kartlar, bildirimler ve arama sonuçları her zaman maskeli kalır.
3. Audit; değerleri, kısmi numaraları, PDF önizlemelerini veya hata bildirimi detaylarını yazmamalıdır.
4. Yetkili dışa aktarımlar dahi varsayılan olarak maskelenmelidir. Tam veri dışa aktarımı yalnız broker manager için ayrı doğrulama ve amaç kaydıyla tasarlanmalıdır.
5. Şifreli veri yedekleri erişim politikasından bağımsız geçmiş kopyalar içerebilir; yedek erişimi ayrı parola, saklama ve imha politikasıyla sınırlandırılmalıdır.

## 6. Telefon için karar seçenekleri

| Seçenek | Sonraki hizmet süreci | Güvenlik sonucu | Öneri |
|---|---|---|---|
| A. Telefonu da tamamen sil | Danışman, arama gerektiğinde kilitli fizikî sözleşme dosyasına başvurur. | En düşük dijital maruziyet. | Maksimum mahremiyet hedefleniyorsa seçilir. |
| B. Telefonu maskeli sakla | Ekranda örneğin `05•• ••• •• 24` görünür; tam değer broker manager veya yalnız atanmış danışman için ayrıca açılır. | Güçlü fakat sıfır olmayan dijital risk. | Hizmet takvimi ve arama verimliliği öncelikliyse dengeli seçenektir. |
| C. Telefonu sözleşmeden sonra tut | Bugünkü iş akışı devam eder. | En geniş dijital maruziyet. | Yeni bulut geçişi hedefinde önerilmez. |

**Seçilen politika B’dir:** telefon maskeli saklanır; T.C. kimlik/vergi no da maskeli saklanır. Tam değer erişimi broker manager ile yalnız ilgili kaydın atanmış danışmanına açıktır; ofis asistanı ve diğer danışmanlar erişemez.

## 7. Fizikî dosya kontrolü

Fizikî imzalı nüsha; üzerinde sözleşme referansı bulunacak şekilde kilitli dolap/oda içinde tutulmalı, dosya teslim-alma kaydına bağlanmalı ve yalnız atanmış danışman ile broker manager erişimine açık olmalıdır. Dosyalar e-posta veya WhatsApp ile taranıp paylaşılmamalı; tarama istisnası gerekiyorsa ayrıca maskeleme ve erişim kararı verilmelidir. Saklama süresi, sözleşme/ilgili mevzuat yükümlülükleri ve imha planı hukuk incelemesiyle belirlenmelidir.

## 8. Uygulama kararından önce gerekli onaylar

1. Bu politika yalnız **yeni** kira ve yetki sözleşmelerinde mi geçerli olacak?
2. Telefonun tam görüntülemesi broker manager ile yalnız atanmış danışmana mı açık kalacak? **Evet; 2 Eylül 2026 revizyonunda ofis asistanı ve diğer danışmanlar için tam görüntüleme rotası/arüzü kapalıdır.**
3. T.C./vergi no tam görüntüleme broker manager ile yalnız atanmış danışmana mı açık kalacak? **Evet.**
4. İmzalı sözleşmenin dijital taraması varsayılan olarak kapalı mı kalacak?
5. Saklama/imha süreleri için hukuk/KVKK incelemesi yapılacak mı?

## Referanslar

[1]: [Kişisel Verileri Koruma Kurumu, *Kişisel Verilerin İşlenmesine İlişkin Temel İlkeler*](https://www.kvkk.gov.tr/Icerik/4189/Kisisel-Verilerin-Islenmesine-Iliskin-Temel-Ilkeler)

[2]: [Kişisel Verileri Koruma Kurumu, *Kişisel Veri Saklama ve İmha Politikası*](https://www.kvkk.gov.tr/Icerik/5387/KVKK-Kisisel-Veri-Saklama-ve-Imha-Politikasi)

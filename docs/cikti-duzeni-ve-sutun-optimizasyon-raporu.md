# Global 1881 Çıktı Düzeni ve Sütun Optimizasyon Raporu

**Proje:** Global 1881 Emlak Ofis Yönetim Sistemi  
**İnceleme tarihi:** 19 Eylül 2026  
**Kapsam:** Uygulamadaki PDF/yazdırma önizlemeleri, A4 belge şablonları, Excel dışa aktarımları ve tablo sütun genişlikleri.

## Genel sonuç

Çıktı altyapısı iki ana standarda ayrılıyor. Sözleşme ve form belgeleri ortak `DocumentPrintPreview` bileşeni üzerinden **A4 portre** düzeninde hazırlanıyor. Liste ve rapor ekranları ise içerik genişliğine göre portre veya yatay düzene geçiyor.

Denetimde tespit edilen en önemli sorun, çoklu mülk portföy listesinin arayüzde A4 yatay olarak tanımlanmasına rağmen ortak `@page` kuralı nedeniyle yazdırma sırasında portre düzenine düşebilmesiydi. Bu nedenle dokuz sütunlu portföy listesi gereksiz sıkışıyor ve sayfa kullanımını verimsizleştiriyordu. Sorun giderildi. Çoklu mülk PDF çıktısı artık adlandırılmış bir **A4 yatay yazdırma sayfası** kullanıyor ve sütun genişlikleri içerik türüne göre sabitleniyor.

Excel tarafında aktif kiralamalar ve merkezî kayıtlar zaten açık sütun genişlikleriyle çalışıyordu. Çoklu mülk Excel çıktısında ise genişlik tanımı bulunmuyordu. Bu çıktı da artık başlık satırı sabitlenmiş, yatay yönlendirmeli ve sabit genişlikli olarak üretiliyor.

## Çıktı envanteri

| Ekran veya form | PDF / yazdırma çıktısı | Excel çıktısı | Düzen değerlendirmesi |
|---|---|---|---|
| Müşteriler ve Portföy | Uygulama içi yazdırma önizlemesi ve A4 çıktı | Var | Merkezî müşteri numarası ile teknik kira/portföy ID’si ayrıştırıldı. Portföy listesinde yedi sütunlu sabit tablo düzeni kullanılıyor. |
| Aktif Kiralamalar | Ekran tablosu ve yazdırma/rapor akışı | Var | On iki sütunlu veri için Excel yönü yatay. Sütun genişlikleri açıkça tanımlı ve başlık satırı sabit. |
| Çoklu Mülk Portföy Listesi | Ortak A4 önizleme ve PDF | Var | **Optimize edildi.** PDF artık A4 yatay sayfayı zorunlu kullanıyor. Excel’de dokuz sütun için genişlikler ve sabit başlık satırı eklendi. |
| Kira Sözleşmeleri | Ortak A4 belge önizlemesi | Ayrı Excel çıktısı bulunmadı | Portre belge standardı, dengeli Word benzeri kenar boşlukları ve tablo satır bölünmesini önleyen kurallar kullanılıyor. |
| Yetki Sözleşmeleri | Ortak A4 belge önizlemesi | Ayrı Excel çıktısı bulunmadı | Portre düzeni korunuyor. Bilgi tablolarında metin ortalaması, açıklama hücrelerinde sol hizalama uygulanıyor. |
| Satış ve Kat Karşılığı Formları | Ortak belge önizlemesi veya form çıktısı | Ayrı Excel çıktısı bulunmadı | A4 sözleşme/form standardı kullanılıyor. Uzun şartlar bölümünün gereksiz boş sayfa üretmemesi için akışa izin veriliyor. |
| Danışmanlık Sözleşmeleri | Ortak A4 belge önizlemesi | Ayrı Excel çıktısı bulunmadı | A4 portre düzeni ve ortak belge kabuğu kullanılıyor. |
| Offline kira, yetki ve sözleşme ekleri | Ortak A4 yazdırma yüzeyi | Ayrı Excel çıktısı bulunmadı | Form ve ekler yazdırma sırasında yardımcı paneli gizleyerek belge yüzeyini koruyor. |
| Ön muhasebe, komisyon ve finans raporları | Ekran raporu; özel Excel/PDF üretimi sınırlı | Bu kapsamda ayrı genel Excel üretim noktası bulunmadı | Finans ekranlarında tablo genişliği ekran düzenine bağlı. Ayrı muhasebe raporu ihtiyacı oluşursa ikinci bir raporlama standardı önerilir. |

## Uygulanan optimizasyonlar

### Çoklu mülk PDF düzeni

Çoklu mülk listesine `global1881-landscape` adlı yazdırma sayfası tanımlandı. Bu sayfa A4 yatay boyut ve 10 mm kenar boşluğu kullanıyor. Böylece dokuz sütunlu portföy listesi portre sayfaya zorla sığdırılmıyor.

Tablo sütunları içerik uzunluğuna göre sabitlendi. Açık adres ve portföy tanımı daha geniş tutuldu. Tür, işlem amacı ve danışman gibi kısa alanlar daha dar tutuldu. Tabloya `table-layout: fixed` uygulanarak uzun bir adresin diğer sütunları sayfa dışına itmesi engellendi.

### Çoklu mülk Excel düzeni

Çoklu mülk Excel çıktısı artık şu standartları kullanıyor:

| Özellik | Uygulanan değer |
|---|---|
| Sayfa yönü | Yatay |
| Başlık satırı | Sabitlenmiş |
| Sıra No | 10 |
| Portföy Tanımı | 26 |
| Tür | 12 |
| İşlem Amacı | 16 |
| Açık Adres | 40 |
| Malik / Müşteri | 24 |
| Bedel | 16 |
| Yetki Tarihleri | 24 |
| Danışman | 16 |

Bu dağılımda en geniş alan adres, portföy tanımı ve malik bilgisine ayrıldı. Kısa kod ve tür alanları gereksiz genişlik kullanmıyor.

### Merkezî müşteri numarası ve teknik kayıt numarası

Portföy PDF ve Excel çıktılarında iki farklı numara artık ayrı alanlarda gösteriliyor:

1. **Merkezi müşteri no:** 0001, 0016, 0034 gibi müşteri kütüğü numarası.
2. **Kira / portföy kayıt no:** Teknik kira veya portföy kaydını ifade eden sistem numarası.

Bu ayrım, örneğin 30001 değerinin müşterinin 30001 numaralı olduğu şeklinde yanlış yorumlanmasını önlüyor. Veritabanı kontrolünde mevcut müşteri dizisinin 0001–0034 arasında kesintisiz olduğu ve CT1 kayıtlarının 0016–0034 aralığında bulunduğu doğrulandı.

### Ortak A4 sözleşme standardı

Sözleşme ve ek belgeler için ortak belge kabuğu korunuyor. Bu standartta A4 portre yönü, Word benzeri dengeli kenar boşlukları, başlık hiyerarşisi, tablo satırlarının bölünmemesi ve açıklama alanlarının okunabilir tutulması esas alınıyor. Uzun şartlar ve açıklamalar gereksiz bir boş sayfa oluşturmayacak şekilde doğal sayfa akışına bırakılıyor.

## Sütun genişliği değerlendirmesi

**Merkezî kayıtlar** için mevcut yedi sütunlu portföy düzeni uygundur. Müşteri numarası, kira/portföy kayıt numarası, kayıt adı, danışman, durum, tutar ve detay alanları birbirinden ayrılıyor. Portföy ve adres metinleri için daha geniş alan ayrılması, dar ekranlarda yatay kaydırmayı azaltıyor.

**Aktif Kiralamalar** ekranının Excel çıktısı on iki alan içerdiği için yatay yön doğru tercihtir. Adres ve kiracı/müşteri adları geniş sütunlarda tutuluyor. Tarih alanları için ayrılan genişlik yeterli; tahliye tarihi boş kalabildiği için bu sütun gereksiz büyütülmüyor.

**Çoklu Mülk Portföy Listesi** için yatay A4 zorunludur. Portre çıktı bu veri yoğunluğu için uygun değildir. Yapılan düzenleme ile adres ve açıklama alanları korunurken kısa alanların kapladığı yer azaltıldı.

**Sözleşme ve ek formlar** için Excel sütun standardı uygulanmıyor; bu belgeler satır/sütun raporu değil, imzaya uygun belge çıktısıdır. Bu nedenle bunları Excel’e çevirmek mevcut kullanım amacına uygun görünmüyor. İleride sözleşme arşivi için toplu Excel raporu istenirse, belge metninin tamamı yerine sözleşme no, taraflar, tarih, bedel, durum ve danışman gibi özet alanlar dışa aktarılmalıdır.

## Doğrulama sonuçları

Çıktı standardı değişiklikleri için şu kontroller tamamlandı:

- Çoklu mülk PDF önizleme testi başarılı.
- Ortak A4 belge standardı testi başarılı.
- Merkezî kayıt PDF düzeni testi başarılı.
- Merkezî kayıt Excel sütun testi başarılı.
- Portföy ve kira birleşik liste testi başarılı.
- TypeScript kontrolü başarılı.
- Production build başarılı.

Build sırasında uygulamanın mevcut büyük JavaScript paketi için bir optimizasyon uyarısı görüldü. Bu uyarı çıktı düzeniyle ilgili değildir ve üretim derlemesini başarısız kılmamıştır.

## Sonuç ve sonraki öneri

PDF ve Excel çıktılarının temel düzeni artık tutarlı durumdadır. **Sözleşmeler ve formlar A4 portre**, geniş listeler ise **A4 yatay veya Excel yatay** olarak ayrılmıştır. En kritik portföy sayfa yönü hatası düzeltilmiş, çoklu mülk Excel çıktısı da diğer raporlarla aynı sabit genişlik standardına alınmıştır.

Bir sonraki kabul testinde özellikle üç çıktı fiziksel olarak yazdırılmalıdır: çoklu mülk portföy listesi, aktif kiralamalar listesi ve merkezî portföy kayıtları. Bu üç çıktı, uygulamadaki en geniş tablo düzenlerini temsil eder. Sözleşme tarafında ise kira, yetki ve teslim eklerinden birer örnek A4 olarak kontrol edilmelidir.

## References

[1]: ../client/src/components/DocumentPrintPreview.tsx "Global 1881 ortak belge yazdırma önizlemesi"

[2]: ../client/src/components/MultiPropertyIntakeForm.tsx "Çoklu mülk portföy PDF ve Excel çıktısı"

[3]: ../client/src/pages/ActiveRentalSummaries.tsx "Aktif kiralamalar Excel çıktısı"

[4]: ../client/src/pages/Records.tsx "Merkezî müşteri ve portföy PDF/Excel çıktıları"

[5]: ../client/src/index.css "Global 1881 A4 ve yazdırma düzeni stilleri"

[6]: ../client/src/documentPrintStandard.test.ts "Ortak A4 belge standardı testleri"

[7]: ../client/src/components/MultiPropertyIntakeForm.print.test.ts "Çoklu mülk PDF ve Excel çıktı testleri"

[8]: ../client/src/pages/Records.printLayout.test.ts "Merkezî kayıt yazdırma düzeni testleri"

---

**Hazırlayan:** Manus AI

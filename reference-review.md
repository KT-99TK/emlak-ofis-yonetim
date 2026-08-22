# 1881 Ofis Paket İncelemesi

## Paket içeriği

Paket, `1881_Ofis.html` açılış menüsü, `Yetki_Sozlesmesi.html` yetki sözleşmesi oluşturucusu, `Kira_Sozlesmesi.html` kira sözleşmesi oluşturucusu, `Danisman_Listesi.xlsx` danışman ve işletme kayıt listesi, `1881_Ofis.ico` simgesi ve `OKUBENI.txt` kullanım notlarından oluşuyor.

## Yeniden kullanılacak yapı ve akışlar

| Kaynak | Gözlenen yapı/alan | Ofis sistemine uyarlama |
|---|---|---|
| Açılış menüsü | Yetki Sözleşmesi, Kira Sözleşmesi ve Danışman Listesi kısayolları | Sol menülü yönetim panelinde Dashboard, Sözleşmeler, Müşteriler, Portföy, Ön Muhasebe, Ekip ve Audit Log modülleri |
| Yetki sözleşmesi | Satış/kira ayrımı; portföyü alan kişi; işletme bilgileri; malik; taşınmaz; bedel; tarih; yazdır/Word/CSV | Sunucuya kaydedilen kayıt, onay durumu, sürüm, bağlı müşteri/mülk, yetkili danışman ve audit geçmişi |
| Kira sözleşmesi | Konut/işyeri türü; kayıt ve versiyon; taşınmaz; kiraya veren; kiracı; kefil; kira koşulları; özel maddeler; ek belgeler; sayaç ve anahtar bilgileri | Şablon seçimi, sözleşme durumu, taraflar, finansal plan, ek dosya metadata'sı ve yazdırılabilir çıktı |
| Danışman Excel listesi | Kod, ad soyad, sıfat, işletme, yetki belgesi, vergi bilgileri, iletişim, danışman/ofis payı, paylaşım sözleşmesi, başlangıç, durum, notlar | Kullanıcı profili, rol, takım/manager ilişkisi, iş paylaşımı alanları ve yalnızca manager erişimli yönetim ekranı |
| Kullanım notları | YerelStorage, tarayıcı bağımlılığı, yedek/geri yükle, CSV kayıt defteri, 30 günlük hatırlatıcı | Merkezi veritabanı, kullanıcı bazlı erişim, audit log, güvenli dosya saklama, CSV dışa aktarma ve yöneticinin yedekleme/rapor ekranı |

## Uygulanacak tasarım kararları

Paketin koyu lacivert, altın vurgu, bölüm kartları ve belge önizleme yaklaşımı korunacak; ancak tarayıcıda yerel veri tutma yerine sunucu tarafı yetkilendirme ve veritabanı kullanılacak. Sözleşme çıktıları resmi belge görünümünde, uygulama ekranları ise yoğun bilgi kullanımını destekleyen sade ve zarif bir sidebar/dashboard düzeninde tasarlanacak.

## Veri gizliliği notu

Danışman listesi kişisel veri içerdiği için genel kullanıcı görünümünden ayrılacak; manager rolü ekip ve finans özetlerini görebilecek, consultant rolü ise kendi atandığı müşteri, portföy, sözleşme ve finans hareketleriyle sınırlı çalışacak. Kimlik ve vergi alanları ekranlarda ihtiyaç kadar gösterilecek ve kritik işlemler audit kaydı oluşturacak.

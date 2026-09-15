# Global 1881 — Sahibinden İlan Entegrasyonu Ön Tasarımı

## Sonuç

Global 1881 içinde tek noktadan ilan hazırlamak ofis açısından anlamlıdır; ancak otomatik yayın ve güncelleme yalnızca Sahibinden’in Global 1881’i yetkili ilan platformu olarak kabul etmesi, API kullanımını onaylaması ve gerekli erişim anahtarı/sözleşme koşullarını sağlaması halinde yapılmalıdır. Sahibinden’in resmî açıklamasında API transferi için aktif Kurumsal Emlak mağazası, ilgili yetki belgesi, aktarımı alacak firmanın ilan hizmeti vermesi, EİDS’e entegre olması ve API Kullanım Sözleşmesi süreci belirtilmektedir [1] [2].

## İki uygulanabilir yaklaşım

| Yaklaşım | Kullanıcı deneyimi | Avantaj | Sınır | Kurulum karmaşıklığı |
|---|---|---|---|---|
| Yetkili API entegrasyonu | Danışman Global 1881’de ilanı kaydeder; sistem Sahibinden’e gönderir, durumunu ve hatasını gösterir | Tek noktadan oluşturma, güncelleme, pasife alma ve yayın durumu takibi mümkün olabilir | Sahibinden onayı, API dokümanı, erişim anahtarı, EİDS/yetki belgesi ve sözleşme gerekir; desteklenen işlemler önceden teyit edilmelidir | Orta-yüksek |
| Kullanıcı onaylı dosya aktarımı | İlan Global 1881’de hazırlanır; izin verilen dosya formatı indirilir ve Sahibinden’in ilgili ekranından aktarılır | API onayı beklenmeden daha düşük riskle başlanabilir | Tam otomatik yayın, fotoğraf senkronizasyonu ve iki yönlü durum takibi olmayabilir | Düşük-orta |

İzinsiz kullanıcı adı/şifre otomasyonu, tarayıcı botu veya ekran kazıma yapılmayacaktır. Bu yöntemler hesap güvenliği, sözleşme ve kişisel veri bakımından uygun bir temel oluşturmaz.

## Önerilen ortak ilan veri modeli

Global 1881’de tek bir `listing` kaydı tutulur. Kayıt; ilan başlığı, taşınmaz türü, işlem türü, fiyat ve para birimi, il/ilçe/mahalle, m², oda bilgisi, bina yaşı, kat, ısıtma, kullanım durumu, açıklama, danışman, portföy sahibi, yetki kodu, EİDS durumu, fotoğraf sırası ve yayın durumu alanlarını içerir. Sahibinden’e özgü alanlar ana kayda karıştırılmaz; `listing_publications` gibi ayrı bir yayın tablosunda platform adı, dış ilan kimliği, son gönderim zamanı, son başarılı senkronizasyon zamanı, durum ve hata mesajı tutulur.

Böylece aynı ilan ileride global1881.com, Sahibinden veya başka yetkili platformlara ayrı yayın kaydıyla bağlanabilir. Bir platformdaki hata diğer platformdaki ilanı bozmaz. Her gönderim audit kaydına işlem yapan kullanıcı, zaman, ilan kimliği, gönderilen alan özeti ve karşı platform yanıtı yazılır; erişim anahtarı veya gizli token audit içine yazılmaz.

## İlk API fazında önerilen operasyonlar

İlk geliştirme yalnızca aşağıdaki sırayla ele alınmalıdır: taslak ilan oluşturma, zorunlu alan doğrulama, görsel yükleme, yetkili API’ye gönderim, dış ilan kimliğini kaydetme, güncelleme, pasife alma ve yayın sonucunu gösterme. Silme işlemi yerine ilk aşamada pasife alma tercih edilmelidir. Her gönderim idempotency anahtarıyla tekrarlandığında mükerrer ilan üretmemelidir.

## Sahibinden’den yazılı olarak istenecek bilgiler

Sahibinden’e Global 1881’in kendi ilan ekranından Sahibinden’e yeni ilan gönderip gönderemeyeceği, API’nin veri yönü, ilan oluşturma/güncelleme/pasife alma ve fotoğraf operasyonlarının desteklenip desteklenmediği, OAuth veya erişim anahtarı yöntemi, EİDS ve yetki belgesi ön koşulları, sandbox/test hesabı, hız limiti, hata kodları ve webhook ya da durum sorgulama desteği sorulmalıdır. Mevcut resmî yardım metni API ile veri transferini açıklıyor; fakat Global 1881’in doğrudan Sahibinden’de ilan oluşturma yetkisini tek başına garanti etmiyor [1] [2].

## Kullanıcıdan sonraki adımda gerekenler

Kazım’ın Sahibinden’den API başvuru sonucu, API kullanım sözleşmesi veya teknik doküman, erişim anahtarı üretim yöntemi, mağaza/yetki belgesi durumu ve test hesabı bilgilerini alması gerekir. Bu bilgiler gelmeden projeye sahte API uç noktası, tahmini alan adı veya gerçek kullanıcı parolası eklenmeyecektir.

## Kaynaklar

[1]: https://yardim.sahibinden.com/hc/tr/articles/19749005158172-Kurumsal-Emlak-ve-Vas%C4%B1ta-Ma%C4%9Fazalar%C4%B1na-Sunulan-Veri-Transferi-Y%C3%B6ntemleri "Kurumsal Emlak ve Vasıta Mağazalarına Sunulan Veri Transferi Yöntemleri — sahibinden.com"

[2]: https://yardim.sahibinden.com/hc/tr/articles/19780244786460-API-Kullan%C4%B1m%C4%B1-ile-Veri-Transferi "API Kullanımı ile Veri Transferi — sahibinden.com"

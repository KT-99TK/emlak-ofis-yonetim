# Global1881.com İlan Entegrasyonu Ön İnceleme

Tarih: 11.09.2026

## Global1881.com bulguları

- Site adresi: https://global1881.com/
- Site WordPress tabanlı görünüyor; sayfa ve medya URL'lerinde `/wp-content/` kullanılıyor.
- İlan URL yapısı `https://global1881.com/wdk-listing/{slug}/` biçiminde.
- Ana sayfada `Portföy` bölümü ve `İlan Girişi` bağlantısı bulunuyor.
- `İlan Girişi` bağlantısı WordPress yönetimindeki `admin.php?page=wdk_listing` ekranına yönlendiren bir giriş akışı kullanıyor.
- Ana sayfada ilan arama alanı, kategori filtreleri, öne çıkan ilanlar ve üç mevcut ilan görünür durumda.
- Görünen ilanlarda başlık, konum, ilan türü, fiyat ve görsel bilgileri yer alıyor.
- Mevcut URL yapısı ve yönetim bağlantısı, özel bir WordPress emlak ilan eklentisi/tema modülü bulunduğuna işaret ediyor; kesin eklenti adı ve API yetenekleri henüz doğrulanmadı.

## Mimari sonucu

Global1881.com doğrudan yeniden yazılacak bir site değil; mevcut WordPress ilan altyapısına güvenli bir aktarım katmanı bağlanması daha doğru görünüyor. Ofis otomasyonu ilanların ana kaynağı olabilir. WordPress tarafında REST API, eklentiye ait özel endpoint, XML/CSV içe aktarma veya yetkili webhook desteği bulunup bulunmadığı yönetim/hosting erişimiyle doğrulanmalı.

Sahibinden.com için kullanıcı adı ve parola ile tarayıcı taklidi yapan otomasyon önerilmemelidir. Yalnızca hesap/kurumsal paket için sunulan resmî API, XML/feed veya yetkili ilan aktarım hizmeti varsa ikinci hedef olarak bağlanmalıdır.

Kaynak: https://global1881.com/

## Kullanıcıdan alınan mevcut durum

Kullanıcı, `global1881.com` üzerinde WordPress ilan girişini kullandığını ancak şu anda WordPress yönetici parolasının elinde bulunmadığını ve gerektiğinde alınabileceğini belirtti. WordPress tarafında API erişiminin mevcut olup olmadığı ayrıca araştırılacak. Sahibinden.com API şartları ve başvuru süreci kullanıcı tarafından doğrulanacak. Operasyonel tercih, danışmanların tek bir ilan giriş ekranından iki hedefi güncellemesidir; bunun mümkün olup olmadığı her platformun resmî şartları ve diğer kuruluşların veri kabul politikalarıyla birlikte değerlendirilecektir.

## Sahibinden.com resmî veri transferi bulguları

Sahibinden’in resmî yardım sayfasına göre aktif Kurumsal Emlak/Vasıta Mağazası bulunan işletmeler ilan verilerini API ile aktarılmasını talep edebilir. Bunun için ilgili yetki belgesi, mağaza üzerinden aktarım talebi, veri aktarılacak firmanın ilancılık hizmeti vermesi, EIDS’e entegre olması ve sahibinden.com ile API kullanım sözleşmesi imzalaması gerekir.

Sahibinden ayrıca iki veri transfer yöntemi tanımlıyor: Ofisim/Galerim ekranlarından bilgisayar tarafından okunabilir dosya oluşturma ve indirme; veya uygun şartları sağlayan firmaya erişim anahtarı ile API üzerinden programatik aktarım. Bu nedenle sahibinden.com hesabına ait kullanıcı adı/parola ile otomatik tarayıcı girişi yerine, kurumsal mağaza ve erişim anahtarı temelli resmî API yolu kullanılmalıdır.

## Diğer platformlar için ön bulgular

Hepsiemlak tarafında arama sonuçları API ile ilan transferi ve API ile aktarılmış ilanların güncellenmesi için ayrı kurumsal yardım içerikleri bulunduğuna işaret ediyor; uygulanabilirlik için resmî dokümantasyon veya kurumsal hesap ekranından doğrulama gerekir. Emlakjet tarafında API ile ilan transferini anlatan güncel bir içerik ve kurumsal üyelik akışı bulundu; bu, kurumsal aktarım seçeneğinin araştırılmaya değer olduğunu gösteriyor ancak bu aşamada bağlayıcı bir API sözleşmesi veya teknik endpoint doğrulanmış sayılmamalıdır. Üçüncü taraf entegrasyon hizmetleri XML/JSON/CSV/API gibi formatları desteklediğini iddia edebiliyor; bunlar doğrudan portalın resmî onayı olarak kabul edilmeyecek ve güvenlik/ücret/kişisel veri şartları ayrıca incelenecek.

Bu nedenle platform bağımsız veri modelinde şu hedefler korunmalı: tekil ilan kimliği, her portal için dış kimlik, yayın durumu, son başarılı senkron zamanı, hata/yeniden deneme bilgisi, medya eşlemesi ve geri çekme/arşivleme durumu.

Resmî kaynaklar:

1. [API Kullanımı ile Veri Transferi](https://yardim.sahibinden.com/hc/tr/articles/19780244786460-API-Kullan%C4%B1m%C4%B1-ile-Veri-Transferi)
2. [Kurumsal Emlak ve Vasıta Mağazalarına Sunulan Veri Transferi Yöntemleri](https://yardim.sahibinden.com/hc/tr/articles/19749005158172-Kurumsal-Emlak-ve-Vas%C4%B1ta-Ma%C4%9Fazalar%C4%B1na-Sunulan-Veri-Transferi-Y%C3%B6ntemleri)
3. [Sahibinden API Kullanım Başvurusu](https://www.sahibinden.com/veri-transferi-formu)

# Sahibinden İlan Entegrasyonu Araştırma Notu — 15.09.2026

## Resmî bulgular

Sahibinden’in resmî yardım sayfasına göre aktif Kurumsal Emlak/Vasıta Mağazası bulunan işletmeler iki veri transferi yönteminden yararlanabilir: Ofisim/Galerim ekranlarından dosya oluşturup indirme ve uygun firmalara API ile programatik veri transferi. Kaynak: https://yardim.sahibinden.com/hc/tr/articles/19749005158172-Kurumsal-Emlak-ve-Vas%C4%B1ta-Ma%C4%9Fazalar%C4%B1na-Sunulan-Veri-Transferi-Y%C3%B6ntemleri

API transferi için Sahibinden tarafı, veri gönderen kurumsal mağazanın ilgili Ticaret Bakanlığı yönetmeliklerine göre yetki belgesine sahip olmasını ve aktarım yapılacak firmanın ilan hizmeti sunup EİDS’e entegre olmasını şart koşuyor. Firma başvuru formu dolduruyor; değerlendirme olumlu olursa API Kullanım Sözleşmesi imzalanıyor. Kaynak: https://yardim.sahibinden.com/hc/tr/articles/19780244786460-API-Kullan%C4%B1m%C4%B1-ile-Veri-Transferi

Sahibinden’in açıklamasındaki yön, ilanların Sahibinden mağazasından yetkili ilan platformu/firmaya aktarılması şeklinde anlatılıyor. Global 1881’in kendi sisteminden Sahibinden’e ilan oluşturma ve güncelleme yetkisi ayrıca Sahibinden ile teyit edilmelidir; bu özellik varsayılmamalıdır.

## Uygulama kararı

Kullanıcı adı/şifre otomasyonu veya izinsiz ekran kazıma yapılmayacak. İlk aşamada resmî erişim anahtarı, API dokümanı, veri yönü, operasyon listesi ve EİDS/mağaza koşulları Sahibinden’den yazılı olarak alınmalıdır. Bu bilgiler geldikten sonra Global 1881 içinde ilan veri modeli ve güvenli senkronizasyon kuyruğu tasarlanabilir.

## İlk sorulacaklar

Sahibinden’e Global 1881’in kendi ilan ekranından Sahibinden’e ilan gönderip gönderemeyeceği, ilan güncelleme/pasife alma/fotoğraf operasyonlarının desteklenip desteklenmediği, API’nin OAuth veya erişim anahtarı modeli, EİDS ve yetki belgesi ön koşulları, sandbox/test hesabı, rate limit ve hata geri bildirim formatı sorulmalıdır.

## Alternatif

API onayı çıkmazsa Sahibinden’in izin verdiği dosya oluşturma/indirme yöntemiyle sınırlı ve kullanıcı onaylı içe/dışa aktarma yapılabilir. Bu yöntem tam iki yönlü otomatik senkronizasyon değildir; ancak tekil ilan verisini Global 1881’de hazırlayıp kontrollü aktarım için daha düşük riskli bir başlangıçtır.

# Kalan Kabul Sınırları

Bu not, kod ve test düzeyinde tamamlanan işler ile gerçek cihaz, kullanıcı hesabı veya harici platform erişimi gerektiren işleri birbirinden ayırır.

## Kod Tarafında Tamamlananlar

Yetki sözleşmesinde ofis ve bilinen danışman varsayılanları, malik adresi/telefon/TCKN recallı, telefon gruplaması, kuruşsuz bedel biçimlendirmesi ve görünür kayıt hatası canlı sürümde bulunmaktadır. Müşteri bazlı portföy seçimi, malik ID/ad fallback’i ve bağımsız yardımcı taşınmaz araması da uygulanmıştır.

Dashboard merkezi özet, TCMB kur kartı ve kişisel çalışma masası için 10 saniyelik timeout, açık hata mesajı ve “Tekrar dene” yolu vardır. Bu davranışlar source regression testleri, TypeScript ve production build ile doğrulanmıştır.

## Gerçek Cihaz ve Kullanıcı Kabulü Gerektirenler

| Kabul konusu | Gerekli ortam | Sonuç nasıl doğrulanır |
|---|---|---|
| KT1, IP1 ve CT1 login | Ev/ofis cihazı ve canlı alan adı | Doğru rol, müşteri kapsamı ve menülerin açılması |
| Danışman mahremiyeti | En az iki danışman hesabı | Diğer danışmanın müşterisinin görünmemesi; TCKN’nin listelerde maskeli/olmaması |
| Mustafa Ekin portföyü | Yetki sözleşmesi ekranı | Malik seçilince taşınmazların müşteri adı altında görünmesi; yardımcı aramayla da seçilebilmesi |
| PDF ve Excel | Gerçek tarayıcı | Kayıt numarası, telefon, `75.000` bedeli ve A4 önizleme kontrolü |
| Ofis LAN | Ofis router’ı ve istemci laptoplar | Server/istemci erişimi, port ve firewall davranışı |

## Harici Platform veya Yetki Gerektirenler

GitHub repository exportu, DNS/Hostinger yönetimi, WordPress/CMS erişimi, Sahibinden resmî API veya XML/ilan aktarım yetkisi ve TLS destek vakası proje içinden güvenilir biçimde tamamlanamaz. Bu maddelerde kullanıcı hesabı, platform yönetimi veya resmî destek sonucu gerekir; kaynak koda rastgele entegrasyon eklenmemelidir.

## Kabul Sırası

Önce KT1 ile genel ekranlar ve PDF/Excel akışı, ardından kısa CT1 veya IP1 mahremiyet testi, son olarak ofis LAN bağlantısı kontrol edilmelidir. Bir hata görülürse hesap, ekran, işlem ve görünen mesaj birlikte kaydedilmelidir.


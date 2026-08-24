# Mobil HTTPS Erişim Tanısı — 24.08.2026

## Gözlem

Android Chrome ekranında `https://emlakdash-kcw9r85v.manus.space` alan adı için `ERR_SSL_PROTOCOL_ERROR` görüldü. Daha önce aynı telefonda farklı bir IP/adres (`88.255.216.16/landpag`) açılmıştı.

## Dış denetim bulgusu

Sunucu tarafı HTTPS denetiminde ana alan adı TLS 1.3 ile geçerli sertifika zinciri sundu; sertifika adı `*.manus.space` alan adıyla eşleşti ve `/mobile` rotası HTTP 200 döndü. Ayrı bir tarayıcı denetiminde hem ana alan adı hem de geçici önizleme alan adı mobil giriş ekranını açtı.

> Bu bulgular, uygulama rotasının yayın tarafında erişilebilir olduğunu; Android hatasının telefon ağı, yerel DNS, captive portal, HTTPS denetimi veya cihaz tarafı sertifika politikasıyla ilişkili olabileceğini düşündürür. Bu not kesin neden atfetmez.

## Güvenli kabul sırası

1. Android’de Wi-Fi kapatılarak mobil veri ile ana alan adı tekrar denenir.
2. Aynı hata sürerse, yalnız geçici kabul için aşağıdaki önizleme alan adı denenebilir:
   `https://3000-i5nw2blv8bfezf6woazrp-b497d204.sg1.manus.computer/mobile`
3. Önizleme alan adı kalıcı danışman kullanım adresi değildir. Kalıcı kullanım yalnız özel/ana alan adı üzerinde HTTPS kabulü tamamlandığında yapılır.
4. Başarılı açılış sonrasında login ekranı, manager görünümü ve iPhone 13 Pro karşı testi yapılır.

## Özel alan adı hazırlığı

`https://global1881.com/` aktif Global 1881 web sitesi olarak doğrulandı. Kullanıcı, mevcut site içeriğini WordPress yönetim panelinden yönettiğini ve Hostinger web sitesi/hosting yüzeyine erişebildiğini bildirdi. Mobil ofis sistemi için ana siteyi değiştirmeden `ofis.global1881.com` alt alan adı önerildi.

Hostinger hPanel adresi tarayıcıdan açıldı; ancak bu oturumda giriş formu henüz yüklenmediği için DNS ayarı yapılmadı. Alan adı yönetimi hesabına kullanıcı girişinin ardından yalnız yeni alt alan adına ait DNS kaydı eklenmelidir; mevcut `global1881.com` web sitesi kayıtları değiştirilmemelidir.

# Global 1881 — Bulut Sağlayıcı Görüşme Listesi

**Hazırlayan:** Manus AI  
**Tarih:** 31 Ağustos 2026  
**Amaç:** Global 1881 Gayrimenkul ofisinin merkezi web uygulaması için, platform bağımlılığını azaltan; kullanıcı verisini, sözleşme belgelerini ve geliştirme kaynaklarını koruyan yönetilebilir bulut altyapısı seçmek.

> Bu belge bir satın alma taahhüdü değildir. Sağlayıcıdan yazılı teknik teklif, sorumluluk matrisi, fiyat dökümü ve geri dönüş testi istenmesi için hazırlanmıştır.

## 1. Görüşmeye bu kısa tanımla başlayın

“20 danışman ve broker manager için kullanılan, Türkçe arayüzlü bir gayrimenkul ofis uygulamamız var. Uygulama React/TypeScript arayüzü, Node.js/Express/tRPC sunucusu ve MySQL uyumlu merkezi veritabanı kullanıyor. Müşteri, sözleşme, aktif kira takibi, yetkilendirme, ön muhasebe, rol bazlı erişim ve belge arşivleme içeriyor. Önceliğimiz, verinin kaybolmaması, TLS/alan adı erişiminin izlenmesi, hızlı insan desteği ve başka sağlayıcıya taşınabilirliktir.”

## 2. İstenmesi gereken hedef mimari

| Katman | İstenecek asgari özellik | Neden gerekli? |
|---|---|---|
| Uygulama sunucusu | Linux tabanlı, Docker veya yönetilen Node.js 22 çalışma ortamı; başlangıçta **2 vCPU, 4 GB RAM, 40 GB SSD**; dikey büyütme seçeneği | React istemcisi ile Express/tRPC API’nin güvenilir çalışması için yeterli başlangıç sınırı sağlar. |
| Web yayını | Ters vekil/CDN, HTTP/2 veya HTTP/3, sıkıştırma, sağlık kontrolü ve kesintisiz yeniden başlatma | Sayfa erişimini, oturumları ve statik dosya dağıtımını uygulama sürecinden ayırır. |
| Veritabanı | Yönetilen **MySQL 8 uyumlu** hizmet; uygulama sunucusundan ayrı ağda; en az **2 vCPU, 4 GB RAM, 50 GB SSD**; otomatik büyütme | İş kayıtlarının uygulama sürecinden bağımsız korunmasını sağlar. |
| Belge depolama | S3 uyumlu obje depolama; özel erişim, sürümleme, yaşam döngüsü ve şifreleme | EİDS kayıtları, ekler, imzalı PDF ve gelecekteki belge yükleri veritabanından ayrı saklanmalıdır. |
| Gizli bilgiler | Sağlayıcının secret manager hizmeti; uygulamaya çalışma anında enjekte etme, sürümleme ve erişim kaydı | Parolaların/API anahtarlarının kod, ZIP veya düz metin ayar dosyalarında tutulmasını önler.[1] |
| Kimlik ve roller | MFA destekli yönetici hesapları; uygulama içi manager/danışman/ofis asistanı yetkileri korunacak | Uygulamadaki mevcut rol mahremiyeti, altyapı yönetim hesaplarından ayrı kalmalıdır. |
| İzleme | Uptime/TLS kontrolü, hata günlükleri, CPU/RAM/disk alarmı ve İstanbul’dan sentetik erişim testi | Mevcut aralıklı TLS olayı gibi sorunların yalnız kullanıcı bildirimiyle fark edilmesini önler. |

### Mimari sınır

Mevcut **Manus OAuth** akışı başka buluta doğrudan taşınmaz; yeni ortamda kimlik doğrulama yeniden yapılandırılmalıdır. Sağlayıcı, özel kullanıcılar için e-posta/şifre + MFA veya kurumsal kimlik sağlayıcısı (OIDC) seçeneği sunmalıdır. Mevcut kod, şema ve testler kaynak devir ZIP’inde mevcuttur; **gizli ortam değerleri bu ZIP içinde değildir** ve yeni ortamda güvenli biçimde yeniden tanımlanmalıdır.

## 3. Sağlayıcıya sorulacak zorunlu sorular

### A. Veri merkezi, erişim ve TLS

1. Uygulama, veritabanı ve obje depolama hangi ülkede/bölgede çalışacak? Türkiye veya AB veri merkezi seçeneği var mı?
2. KVKK kapsamında veri işleme sözleşmesi, alt yüklenici listesi ve veri ihlali bildirim prosedürü veriyor musunuz?
3. Özel alan adımızı kendi kontrolümüzde tutabilir miyiz? DNS, sertifika yenileme ve yönlendirme kayıtlarına ofis sahibi erişebilir mi?
4. TLS sertifikası otomatik yenileniyor mu? Sertifika hatası, yönlendirme hatası veya bakım sayfası görülürse bunu hangi izleme sistemi ve hangi alarm fark eder?
5. İstanbul/Türkiye’den bağımsız sentetik HTTP ve TLS testini sürekli çalıştırabiliyor musunuz? Başarısızlıkta kime, hangi kanaldan bildirim gider?
6. DDoS/WAF, hız sınırlama ve uygulama güvenlik duvarı seçenekleri var mı? Bunlar gerçek ofis kullanıcılarını engellemeden nasıl ayarlanacak?

### B. Veritabanı ve belge yedekleri

1. MySQL için günlük tam yedek, **noktasal geri dönüş (PITR)** ve en az 30 günlük saklama süresi sunuyor musunuz?
2. Yedekler uygulama sunucusundan ve ana veritabanından farklı fiziksel/lojik konumda mı tutuluyor?
3. Veritabanı şifrelemesi hem aktarımda hem depoda sağlanıyor mu? Anahtar yönetimi kimin sorumluluğunda?
4. S3 uyumlu belge depolamada sürümleme, silinmeye karşı geri alma ve yetkisiz indirmeyi engelleyecek özel erişim var mı?
5. Veritabanı ve belge depolama için birlikte geri dönüş testi yapacak mısınız? Sonuçta; kullanıcı, sözleşme, belge bağlantısı ve rol yetkisi doğrulanacak mı?
6. Yedek dosyasını ofise şifreli biçimde indirme veya ofisin ayrı depolama hesabına otomatik kopyalama olanağı var mı?

> Yedek yalnız oluşturulmuş bir dosya değildir; geri yükleme testinin yapılması, tam ve kısmi geri dönüşün belirlenen sürelerde çalıştığının kanıtlanması gerekir.[2]

### C. Güvenlik ve yönetim erişimi

1. Sunucu, veritabanı ve depolama yönetim hesaplarında MFA zorunlu kılınabiliyor mu?
2. Her yönetici için ayrı hesap, en az yetki ve işlem/audit kaydı sağlanıyor mu?
3. Uygulama gizli değişkenleri (veritabanı bağlantısı, JWT, OAuth, S3 erişimi) secret manager üzerinden mi tutulacak? Koda, Git deposuna veya destek biletlerine yazılmayacağı yazılı olarak teyit edilebilir mi?
4. Güvenlik güncellemeleri, işletim sistemi yamaları, Node.js sürüm güncellemeleri ve bağımlılık taraması kimin sorumluluğunda? Sıklığı nedir?
5. Loglar ne kadar süre tutuluyor? TLS, 5xx hata, yetkisiz erişim denemesi ve uygulama hatası için uyarı var mı?
6. Destek personeli veritabanına veya belgelere erişmek zorunda kalırsa, onay, kayıt ve süreli erişim nasıl uygulanacak?

### D. Süreklilik ve insan desteği

1. Taahhüt edilen erişilebilirlik (SLA) nedir? Planlı bakım önceden nasıl duyurulur?
2. P1 (uygulama açılamıyor), P2 (tek modül çalışmıyor) ve P3 (iyileştirme) için ilk yanıt ve çözüm hedefleri nedir?
3. Türkiye saatiyle telefonla erişilebilen veya adlandırılmış **insan teknik sorumlu** var mı? Vaka değiştiğinde geçmiş kayıtları devralma süreci nedir?
4. Bir alan adı/TLS olayı için olay kaydı, kök neden analizi (RCA) ve yazılı kapanış raporu sağlıyor musunuz?
5. Bakım penceresi, geri alma (rollback) ve acil değişiklik prosedürü nedir?

### E. Taşınabilirlik ve çıkış planı

1. İstenildiğinde tüm MySQL verisini standart SQL dump olarak; tüm belgeleri orijinal dosya adları/metadatası ile dışa aktarabiliyor musunuz?
2. Bu dışa aktarım için ek ücret, bekleme süresi veya satıcı kilidi var mı?
3. Alan adının DNS kontrolü, TLS sertifikası ve uygulama yapılandırması ofis sahibi tarafından devralınabilir mi?
4. Docker imajı, altyapı tanımı ve çalışma dokümantasyonu teslim edilecek mi?
5. Sözleşme sona erdiğinde yedeklere erişim, veri silme sertifikası ve dışa aktarım süresi nasıl işleyecek?

> Taşınabilirlik; yalnız kaynak kodunu almak değil, veritabanı, belge deposu, yapılandırma prosedürü ve doğrulanabilir geri yükleme yolunu birlikte elde etmektir.

## 4. Bu proje için kabul ölçütleri

Sağlayıcının teklifi aşağıdaki hedefleri **yazılı** kabul etmelidir.

| Başlık | Hedef kabul ölçütü |
|---|---|
| Erişim | Türkiye’den 30 gün boyunca izlenen HTTPS erişiminde kritiklik seviyesi hata oluştuğunda otomatik alarm ve insan destek kaydı açılması |
| TLS | Otomatik sertifika yenileme; sertifika zinciri, alan adı eşleşmesi ve TLS başarısızlığının dış gözlemle kaydı |
| RPO | Merkezi müşteri/sözleşme/finans verisi için azami veri kaybı hedefi: **4 saat veya daha iyi** |
| RTO | Kritik web uygulamasını ve merkezi veriyi geri döndürme hedefi: **4 saat veya daha iyi** |
| Yedek | En az günlük tam yedek + PITR + ayrı konum + aylık geri yükleme testi raporu |
| Belge koruması | Obje depolamada şifreleme, özel erişim, sürümleme ve silinme/bozulmaya karşı geri alma |
| Yetki | MFA, ayrı yönetici hesapları, en az yetki, işlem kayıtları ve destek için süreli erişim |
| Taşınabilirlik | İstenildiğinde MySQL dump, belge dışa aktarımı, açıklamalı yapılandırma envanteri ve alan adı/DNS devri |
| Destek | Tek vaka sorumlusu veya açık eskalasyon süreci; P1 için yazılı ilk yanıt hedefi |

RPO ve RTO, ofisin kabul ettiği azami veri kaybı ve kesinti süresidir. Sağlayıcı bunları karşılayamıyorsa, daha düşük ücretli teklif teknik olarak yeterli sayılmamalıdır.

## 5. Teklifte ayrı ayrı gösterilmesini isteyin

Sağlayıcıdan tek toplam fiyat yerine aşağıdaki kalemleri ayrı yazmasını isteyin:

| Kalem | Teklifte ayrı görünsün |
|---|---|
| Uygulama çalışma ortamı | vCPU, RAM, disk, trafik, otomatik ölçekleme ve yedek instance |
| Yönetilen veritabanı | CPU/RAM/disk, PITR, yedek saklama, bağlantı limiti ve izleme |
| Belge depolama | GB başı depolama, istek, dışa aktarım/indirme ve sürümleme |
| Güvenlik | WAF, DDoS, secret manager, MFA/IAM ve log saklama |
| Alan adı ve TLS | DNS yönetimi, sertifika yenileme, CDN ve durum izleme |
| Destek | İnsan danışman, P1/P2 SLA, mesai dışı destek ve olay raporu |
| Taşıma | İlk kurulum, veri aktarımı, test, geri alma planı ve dokümantasyon |
| Çıkış | Veri dışa aktarım bedeli, saklama süresi ve sonlandırma prosedürü |

## 6. Sağlayıcıya verilebilecek, fakat paylaşılmaması gerekenler

Görüşmede aşağıdaki güvenli dosyalar paylaşılabilir:

- `Global1881-kaynak-devir-guvenli-2026-08-30.zip`: Kaynak kod, şema, test ve mimari notları.
- `DEVRALMA-VE-YEDEK-PLANI.md`: Varlık envanteri ve geçiş sınırları.
- Şifreli merkezi veri yedeği: **yalnız sözleşmeli sağlayıcı ve kontrollü aktarım aşamasında**; parola ayrı kanaldan verilmeli.

Şunlar e-posta, WhatsApp veya açık destek biletiyle paylaşılmamalıdır: mevcut yedek parolası, veritabanı bağlantı bilgileri, JWT/OAuth anahtarları, S3 anahtarları, müşteri verisinin şifresiz kopyası ve yerel Windows uygulama klasörü. Gizli bilgiler merkezi gizli yönetim sistemiyle, en az yetki ilkesi altında yönetilmelidir.[1] [3]

## 7. Kartvizit, portföy ve müstakil ilanlar için QR kodlu yönlendirme

QR kodun kendisi yalnız bir internet adresi taşır; bu nedenle basılı kartvizit veya ilan panosundaki QR kod için tek başına ayrıca sunucu gerekmez. Asıl karar, QR kodun doğrudan bir dış ilan adresine mi yoksa Global 1881’in kontrol ettiği kalıcı bir bağlantıya mı yönleneceğidir.

| Seçenek | QR kodun hedefi | Ek sunucu/barındırma ihtiyacı | Avantaj ve sınır |
|---|---|---|---|
| A. Doğrudan ilan bağlantısı | Sahibinden.com veya başka portalın mevcut ilan URL’si | Hayır | En hızlı başlangıçtır; ancak ilan yenilenirse, kapanırsa veya portal URL’si değişirse basılmış QR kod işlevsiz kalır. |
| B. Ofise ait kalıcı yönlendirme | `https://ofis.global1881.com/i/<rastgele-kod>` | Evet; mevcut web barındırmanın küçük bir public yönlendirme bölümü yeterlidir | Aynı QR baskıda kalır; ilan portalı değiştiğinde veya ilan yenilendiğinde hedef adres panelden güncellenir. Bu proje için önerilen seçenektir. |
| C. Ofise ait mobil ilan sayfası | `https://ofis.global1881.com/ilan/<rastgele-kod>` | Evet; public mobil sayfa, fotoğraf depolama ve yönetim ekranı gerekir | İlanın fotoğrafı, temel özellikleri, iletişim ve portal bağlantısı ofis kontrolünde kalır. Daha güçlü marka deneyimi sağlar; ikinci aşama olarak ele alınmalıdır. |

> QR kod mümkün olduğunca **ofise ait HTTPS alan adına** gitmelidir. Dış ilana yönlendirme gerekiyorsa hedef URL kullanıcının girdiği bir parametre olmamalı; ilanın kayıtlı ve izinli hedefi sunucu tarafında eşlenmelidir. Bu yaklaşım açık yönlendirme ve sahte bağlantı riskini azaltır.[4]

### Önerilen minimum QR yapısı

İlk aşamada B seçeneği yeterlidir. Basılı QR kod, `ofis.global1881.com/i/7Kp4mN8qR2xL` gibi tahmin edilmesi zor, sıralı olmayan bir kodu taşır. Sunucu bu kodu yalnız aktif/yayınlanmış ilan kaydına eşler ve ziyaretçiyi önceden onaylanmış Sahibinden.com veya ofis ilan sayfasına yönlendirir. İlan kapandığında ziyaretçiye eski ilan yerine Global 1881 iletişim sayfası veya “ilan güncellenmiştir” bilgisi gösterilir. Böylece QR kod baskısı yenilenmeden hedef değiştirilebilir.

Bu public yönlendirme katmanı, merkezi ofis yönetim ekranından ayrı tutulmalıdır. Yalnız broker manager veya yetkili danışman ilan hedefini değiştirebilmeli; her değişiklik audit kaydına yazılmalıdır. QR kodu içinde müşteri adı, telefon, T.C. kimlik numarası, iç sözleşme numarası veya yönetim ekranı adresi bulunmamalıdır. QR ziyaret analitiği gerekiyorsa yalnız toplam tarama sayısı, tarih/saat ve kampanya/ilan kodu tutulmalı; ziyaretçi kişisel verisi ve konum kaydı varsayılan olarak toplanmamalıdır.

### Sağlayıcıya ve web tasarımcısına sorulacak QR soruları

1. `ofis.global1881.com` alt alan adı ofis sahibinin DNS hesabında tutulacak ve bulut sağlayıcı yalnız gerekli kayıtları mı isteyecek?
2. Bu alt alan adı için TLS sertifikası otomatik yenilenecek, sertifika/alan adı uyuşmazlığı izlenecek ve Türkiye’den erişim testi yapılacak mı?
3. Public QR yönlendirme servisi, iç ofis uygulamasından ayrı yetki ve hata sınırlarıyla çalışabilecek mi?
4. QR kod hedefi yalnız sunucu tarafında kayıtlı izinli alan adlarına (örneğin `sahibinden.com` ve ofis alan adları) yönlenebilecek şekilde allow-list ile sınırlandırılabilecek mi?[4]
5. İlan kapandığında veya hedef değiştiğinde, aynı QR kodun güvenli bir bilgi sayfasına yönlenmesi ve eski portal bağlantısının kapatılması sağlanabilecek mi?
6. Ziyaret sayısı ölçümü gerekiyorsa çerezsiz/özet düzeyde analiz, saklama süresi ve erişim yetkisi nasıl yönetilecek?
7. QR kodun yüksek çözünürlüklü PNG/SVG çıktısı, logo/renk şablonu ve altında yazılı kısa bağlantı üretilebilecek mi? Fiziksel QR kodlarda ziyaretçinin hedef URL’yi görüp doğrulayabilmesi için açık, markalı HTTPS bağlantısı kullanılmalıdır.[5]

### Karar özeti

QR kodlu ilan için bugün yeni bir Ubuntu sunucusu veya ayrı Docker ortamı kiralamak zorunlu değildir. Yeni bulut altyapısı seçilirse, aynı sağlayıcıdaki yönetilen web barındırma veya hafif bir yönlendirme hizmeti bunu karşılayabilir. Asıl zorunlu unsurlar; **ofise ait alan adı, otomatik TLS, kalıcı yönlendirme kaydı, hedef alan adı allow-list’i, rol/audit kontrolü ve güvenli yedektir**. Şu an public ilan modülü açılmadan yalnız mimari ve alan adı kararının teklife eklenmesi yeterlidir.

## 8. Bu görüşme için nihai öneri

Başlangıçta **yönetilen uygulama + yönetilen MySQL + S3 uyumlu özel belge depolama + secret manager + izleme** bileşimi istenmelidir. Kendi başına tek bir sanal sunucuya hem uygulamayı hem veritabanını koymak, yedekleme, yama ve kesinti sorumluluğunu ofisin üzerine bırakır. Ayrı katmanlar; yedek, geri yükleme ve taşınabilirlik bakımından daha güvenli başlangıç sağlar.

Cloud sağlayıcısı, uygulamanın mevcut TLS sorununu tek başına çözmez. Ancak alan adı/DNS/TLS yönetiminin ofis kontrolünde, izlenebilir ve tek destek sorumlusu olan bir yapıya alınmasını sağlar. Mevcut `manus.space` alanında hiçbir bağlantı kesilmeden önce kaynak, şifreli veri yedeği ve geri dönüş planı hazır olmalıdır.

## References

[1]: [OWASP, *Secrets Management Cheat Sheet*](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
[2]: [CISA, *Back Up Business Data*](https://www.cisa.gov/audiences/small-and-medium-businesses/secure-your-business/back-up-business-data)
[3]: [NIST Cybersecurity Framework, *Protect*](https://www.nist.gov/cyberframework/protect)
[4]: [OWASP, *Unvalidated Redirects and Forwards Cheat Sheet*](https://cheatsheetseries.owasp.org/cheatsheets/Unvalidated_Redirects_and_Forwards_Cheat_Sheet.html)
[5]: [Duke University Information Security, *QR Code Security Guide*](https://security.duke.edu/security-guides/qr-code-security-guide/)


## 9. Ubuntu/Docker önerisinin bu projeye göre değerlendirmesi

Ubuntu ve Docker teknik olarak kullanılabilir; ancak mevcut projede danışman laptoplarını doğrudan MySQL’e bağlamak veya ofis laptopunu üretim sunucusu yapmak doğru değildir. Merkezi erişim yalnız uygulama sunucusunun HTTPS API katmanı üzerinden yürümeli, MySQL/TiDB ve S3 erişimi özel ağda veya sunucu tarafında kalmalıdır.

| Seçenek | Global 1881 için değerlendirme | Zorunlu güvenlik koşulları |
|---|---|---|
| Yönetilen WebDev/Node ortamı | Mevcut React/Node/tRPC/MySQL uyumlu yapı için en az operasyonlu seçenektir. TLS, yayın, secret ve rollback yönetimi platform tarafından sağlanır. | Yönetilen DB, S3 özel erişim, MFA, audit, yedek/PITR ve kullanıcı kabul testi yazılı teyit edilmelidir. |
| Ubuntu + Docker + yönetilen MySQL/S3 | Taşınabilirlik ve işletim sistemi kontrolü artar; sağlayıcı teknik ekibi varsa makul üretim seçeneğidir. | UFW ile yalnız 80/443, SSH için MFA/allow-list veya VPN, DB portunun internete kapalı olması, reverse proxy TLS, secret manager, otomatik yama, imaj taraması, izleme ve geri yükleme testi. |
| Tek VPS üzerinde uygulama + MySQL + dosyalar | Başlangıçta ucuz görünür; ancak tek hata noktası ve yedek/geri yükleme sorumluluğu yüksektir. | Yalnız sağlayıcı yazılı RPO/RTO, ayrı fiziksel yedek, PITR, S3 sürümleme, restore testi ve insan destek taahhüdü verirse değerlendirilebilir; varsayılan öneri değildir. |
| Ofis laptopunu sunucu yapmak | Üretim için uygun değildir. Uyku, modem/NAT, elektrik, IP değişimi ve kişisel cihaz güvenliği erişimi kesebilir. | Kullanılmamalıdır; yalnız yayımlanmış HTTPS ortamında test yapılmalıdır. |

### Önerilen geçiş sırası

Önce kaynak kodu ve bağımlılık kilidiyle izole bir staging ortamı kurulmalı; MySQL şeması ve S3 belge depolaması ayrı hazırlanmalı; secret değerleri güvenli yönetim sistemine eklenmeli; TLS ve alan adı doğrulanmalıdır. Ardından şifreli merkezi veri yedeği kontrollü biçimde geri yüklenmeli, kayıt sayıları, roller, maskeli hassas alanlar, komisyon payları ve belge bağlantıları doğrulanmalıdır. Son olarak broker manager, atanmış danışman ve ofis asistanı hesaplarıyla veri kapsamı; indirim, tahsilat, iptal ve çok paydaşlı komisyon akışları test edilmeden DNS trafiği yeni ortama çevrilmemelidir.

> Docker, “iki dakikada otomatik kurtarma” garantisi değildir. Konteyner imajı uygulamayı yeniden başlatmayı kolaylaştırır; veritabanı, S3 belgeleri, secret değerleri, DNS/TLS ve doğrulanmış yedek geri dönüşü ayrıca yönetilmelidir.

# Global 1881 — Teknik Devir ve Yedekleme Planı

**Hazırlayan:** Manus AI  
**Tarih:** 30.08.2026  
**Amaç:** Bu belge, mevcut Global 1881 projesinin geliştirme bilgisini ve çalışma bağlamını korumak; gerekirse farklı bir hesap altında geliştirmeye güvenli biçimde devam etmek için karar çerçevesi sunar. Bu belge herhangi bir veriyi silmez, taşımaz veya geri yüklemez.

## 1. Mevcut güvenli durum

| Kalem | Mevcut durum | Devir açısından anlamı |
|---|---|---|
| Son kayıtlı proje sürümü | `da7e8b4d` | Kaynak ve teknik olay kayıtlarının geri dönülebilir temel noktasıdır. |
| Takip edilen kaynak dosyası | 392 dosya | Uygulama kaynakları, yapılandırma, şema, testler ve dokümanlar sürüm kontrolündedir. |
| Uygulama kaynak / şema dosyası | 294 dosya | React/TypeScript istemcisi, Express/tRPC sunucusu, Drizzle şeması ve Electron yerel çalışma alanı kaynaklarını içerir. |
| Test dosyası | 94 dosya | Davranışsal ve regresyon testleri yeni ortamda tekrar çalıştırılabilir. |
| Bağımlılık kilidi | `pnpm-lock.yaml` | Yeni ortamda aynı bağımlılık ağacının yeniden kurulmasını sağlar. |
| Teknik belgeler | Mimari geçiş, güvenlik notları, web kabul listesi, görev geçmişi | Geliştirme kararları ve bekleyen kabul noktaları korunur. |

> **Önemli:** Bu envanter yalnız geliştirme içeriğini tanımlar. Kaynak kodunun indirilmesi, uygulama veritabanını, kullanıcı yüklemelerini, gizli değişkenleri veya alan adı bağını tek başına taşımaz.[^source-not-enough]

## 2. Yedek kapsamı: aynı şey olmayan iki katman

| Katman | İçerik | Kaynak kod paketi yeterli mi? | Güvenli korunma yolu |
|---|---|---:|---|
| **Geliştirme paketi** | `client/`, `server/`, `desktop/`, `drizzle/`, `shared/`, `package.json`, `pnpm-lock.yaml`, testler, mimari/güvenlik notları | **Evet** | Proje kodunu indirip güvenli bir kişisel arşivde saklamak; yeni hesapta bundan geliştirmeye devam etmek. |
| **Merkezi uygulama verisi** | MySQL/TiDB veritabanı kayıtları, kullanıcı hesap ilişkileri, ayarlar | **Hayır** | Resmî görev verisi yedeği veya destek ekibinin onayladığı geçiş yoluyla korunmalıdır.[^task-backup] |
| **Yüklenen ofis dosyaları** | S3 üzerindeki sözleşme ekleri, EİDS kanıtları ve belgeler | **Hayır** | Resmî görev verisi yedeğine dahil edilmelidir; kod arşivinde dosya baytları yer almaz.[^task-backup] |
| **Gizli yapılandırma** | OAuth, JWT, depolama ve servis anahtarları | **Hayır** | Değerleri dışa aktarmadan, yeni hesap/projede güvenli gizli değişken girişi ile yeniden oluşturulmalıdır. |
| **Yayın alanı** | `emlakdash-kcw9r85v.manus.space` bağlanışı | **Hayır** | Alan adı bağlantısı kaynak dosyası değildir; erişim olayı çözülmeden değişiklik yapılmamalıdır.[^domains] |
| **Yerel Electron verisi** | `%APPDATA%\Global 1881 Gayrimenkul`, IndexedDB, şifreli yedekler ve imzalı PDF’ler | **Hayır** | Mevcut 1.0.22 kurulumuna dokunmadan, yalnız kullanıcı denetiminde ayrı fiziksel arşiv olarak korunmalıdır. |

### Merkezi veri envanteri — 30.08.2026 salt-okunur kontrolü

Merkezi veritabanında bu kontrol sırasında kayıtlar bulunduğu için, kaynak ZIP’inin tek başına tam iş verisi yedeği sayılmaması gerekir. Aşağıdaki sayılar yalnız tablo sayımıdır; müşteri adı, telefon, adres veya belge içeriği sorgulanmamış ve dışa aktarılmamıştır.

| Veri türü | Kayıt sayısı | Kaynak ZIP’inde mi? |
|---|---:|---:|
| Kullanıcı / kullanıcı profili | 3 / 2 | Hayır |
| Müşteri kartı | 15 | Hayır |
| Aktif kira özeti | 21 | Hayır |
| Hizmet görevi | 68 | Hayır |
| Online başlangıç ayarı | 1 | Hayır |
| Denetim kaydı | 2 | Hayır |
| Sözleşme, belge metadatası, taşınmaz, ön muhasebe | 0 | Hayır |
| Uygulama içi yedek manifesti | 0 | Hayır |

Bu tablo, mevcut merkezi kayıtlara erişimin bugün çalıştığını gösterir; bağımsız veri yedeğinin yerine geçmez.

### Oluşturulan şifreli merkezi veri yedeği — 30.08.2026

Kullanıcı onayıyla merkezi verinin salt-okunur dışa aktarımı alındı ve dosya adları da şifrelenmiş AES-256 7z arşive dönüştürüldü. Arşiv, doğru parola ile bütünlük testinden geçti; yanlış parola ile dosya adları görüntülenemedi ve arşiv doğrulaması başarısız oldu. Düz metin geçici dışa aktarım dosyaları işlem sonrasında silindi.

| Özellik | Değer |
|---|---|
| Arşiv adı | `Global1881-merkezi-veri-sifreli-yedek-2026-08-30.7z` |
| Arşiv SHA-256 | `b67520c79c4b70ee360501f6c66d6af29da90d5f2adf1649af0ce01bc865e0b5` |
| Şifreleme | AES-256, şifrelenmiş dosya adları |
| Dışa aktarım türü | Salt-okunur, UTC zamanlı JSON + manifest |
| Kapsam | Merkezi veritabanı kayıtları; belge metadata kaydı sıfır olduğu için saklı belge dosyası yoktur |
| Kapsam dışı | Gizli sistem ayarları, alan adı bağı, yerel Windows verileri ve imzalı yerel PDF’ler |

Arşiv parolası proje notlarına ve arşiv içine yazılmaz. Arşivi ve parola bilgisini ayrı, güvenilir ortamlarda saklamak gerekir.

## 3. Şimdi güvenle yapılabilecekler

Bu planın ilk aşaması **salt-okunurdur**. Mevcut uygulama ve kullanıcı verileri değişmeden aşağıdaki geliştirme paketi hazırlanabilir:

1. Yönetim ekranındaki **Code** bölümünden kaynak projenin indirilebilir kopyası alınır.
2. Bu kopya; bağımlılık kilit dosyası, Drizzle şeması/migrasyonları, testler ve proje belgeleriyle birlikte saklanır.
3. Bu belgede yer alan mimari ve kabul notları, yeni hesapta açılacak projeye başlangıç bağlamı olarak eklenir.
4. `node_modules`, `.manus-logs`, derleme çıktıları ve önceki hatalı Windows dağıtım çıktıları kaynak arşivine alınmaz. Bunlar yeniden üretilebilir veya geçersizdir; müşteri verisi değildir.

Bu adımlar kaynak geliştirme bilgisini korur. Yeni bir hesabın mevcut canlı verileri ve alan adıyla otomatik eşleşeceği anlamına gelmez.

## 4. Başka hesapta devam için karar seçenekleri

| Seçenek | Ne korunur? | Ne yeniden kurulmalıdır? | Ne zaman uygun? |
|---|---|---|---|
| **A. Aynı hesapta bekleyip devam etmek** | Kaynak, veritabanı, yüklemeler, ayarlar ve alan adı bağının tamamı korunur. | Hiçbir şey. | Teknik ekip erişim farkını çözdüğünde en düşük riskli yoldur. |
| **B. Yeni hesapta yalnız kaynak geliştirmesi** | Uygulama kodu, testler, şema ve teknik kararlar. | Yeni proje, kimlik doğrulama yapılandırması, gizli değişkenler ve yeni/veri aktarılmış veritabanı. | Mevcut canlı veriyi taşımadan geliştirmeyi sürdürmek istendiğinde. |
| **C. Yeni hesapta tam devam** | Kaynak yanında veritabanı, yüklenen dosyalar ve yapılandırma hedeflenir. | Resmî veri paketi veya destek ekibinin yazılı onay verdiği hesap/proje devir yöntemi gerekir. | Canlı kayıtların da korunarak yeni hesaba geçmesi gerektiğinde. |

> **Önerilen karar sırası:** Önce teknik ekipten mevcut alan adı/TLS olayı için resmî teşhis beklenmelidir. Ayrı hesaba geçme kararı alınırsa, **B seçeneği** geliştirmeyi korur fakat veri taşımaz; **C seçeneği** için ise destek ekibinin açık yönlendirmesi olmadan veri, alan adı veya gizli değişken aktarımı yapılmamalıdır.

## 5. Yeni hesapta kaynak üzerinden devam edilirse

1. Yeni hesap altında boş bir tam yığın web projesi oluşturulur.
2. Geliştirme paketi yeni projeye aktarılır; `pnpm-lock.yaml` ile bağımlılıklar yeniden kurulur.
3. Yeni proje için ayrı veritabanı ve kimlik doğrulama/gizli yapılandırma değerleri güvenli kanallardan tanımlanır. Eski gizli değerler kopyalanmaz veya sohbet içinde paylaşılmaz.
4. Şema/migrasyonlar yalnız hedef veritabanında uygulanır. Eski merkezi veritabanı değiştirilmez.
5. Testler, TypeScript kontrolü ve production build çalıştırılır.
6. Canlı verinin taşınması gerekiyorsa, yalnız destek ekibinin doğruladığı veri aktarma yöntemi uygulanır.
7. Alan adı, TLS erişim olayı çözülmeden veya destek onayı olmadan yeni projeye bağlanmaz.

## 6. Koruma sınırları

- Mevcut `%APPDATA%\Global 1881 Gayrimenkul` klasörü, eski IndexedDB kayıtları, şifreli yedekler ve imzalı PDF’ler **silinmez, dönüştürülmez ve taşınmaz**.
- Defender tarafından işaretlenen 1.0.23 EXE/ZIP/BAT dosyaları geçersiz kalır; bu devir planına dahil edilmez.
- Yeni bir Windows paketi veya yeni bir veri yedeği bu belge hazırlanırken üretilmez.
- Kullanıcı hesabının resmî doğrulamayla hizmet değişikliği kapsamı dışında olduğu bildirildiği için, hizmet değişikliği gerekçesiyle geri yükleme başlatılmaz.

## 7. Karar vermeden önce sorulacak tek soru

> Amaç yalnız **geliştirmeye başka hesapta devam etmek** mi; yoksa mevcut **merkezi uygulama verileri ve yayın alanıyla birlikte tam geçiş** mi?

İlk amaç için kaynak geliştirme paketi yeterlidir. İkinci amaç için kaynak kod paketi yeterli değildir; resmî destek yönlendirmesiyle veri, dosya, yapılandırma ve alan adı boyutları ayrı ayrı ele alınmalıdır.

## Resmî başvuru metni (tam geçiş gerekiyorsa)

> Global 1881 WebDev projesinin geliştirme kaynaklarını ayrı bir hesapta sürdürme seçeneğini değerlendiriyoruz. Mevcut proje için kaynak kod, veritabanı, yüklenen dosyalar, gizli yapılandırma ve `emlakdash-kcw9r85v.manus.space` alan adı bağını kapsayan resmî ve veri kaybı yaratmayan hesap/proje devir yöntemi var mıdır? Varsa, hangi varlıkların otomatik taşınmadığını ve güvenli geçiş sırasını yazılı olarak paylaşır mısınız? Herhangi bir aktarım yapmadan önce mevcut verilerin korunmasını istiyoruz.

[^source-not-enough]: [Manus — Websites During the August 2026 Data Separation: What a Task Data Backup contains](https://help.manus.im/en/articles/16147892-service-change-overview-how-to-back-up-your-data)
[^task-backup]: [Manus — How to Back Up Your Data](https://help.manus.im/en/articles/16147892-service-change-overview-how-to-back-up-your-data)
[^domains]: [Manus — Website domains and restoration guidance](https://help.manus.im/en/articles/16147895-service-change-overview-how-to-restore-your-data)


## 8. Ayrı varlıklar için erişim ve yedekleme matrisi

| Varlık | Erişim sınırı | Yedekleme yöntemi | Mevcut kanıt/sınır |
|---|---|---|---|
| Merkezi MySQL/TiDB verisi | Uygulama sunucusu ve yetkili yönetim akışı; danışman cihazlarından doğrudan DB bağlantısı yok | Salt-okunur dışa aktarım veya sağlayıcının resmî görev verisi yedeği; şifreli ve ayrı parola | 30.08.2026 tarihli şifreli merkezi veri arşivi mevcut; resmî platform yedek yolu ayrıca doğrulanmalıdır. |
| S3 yüklenen belgeler | Uygulama üzerinden yetkili, süreli erişim; genel bucket erişimi yok | S3 sürümleme/retention veya sağlayıcının belge dahil görev verisi yedeği | Merkezi metadata sayımında belge kaydı 0; dosya baytları kaynak ZIP’inde değildir. |
| Gizli yapılandırma | Secret manager veya yönetim panelindeki güvenli secret alanı; sohbet/ZIP/e-posta ile paylaşılmaz | Değerleri kopyalamadan yeni ortamda manuel/secret manager yeniden oluşturma | Mevcut secret değerleri bu plana yazılmaz ve dışa aktarılmaz. |
| Alan adı ve DNS bağı | Alan adı sahibinin DNS hesabı; yayın sağlayıcısına yalnız gereken kayıt | DNS kayıt envanteri ve sağlayıcının bağlantı/geri dönüş prosedürü | `ofis.global1881.com` henüz NXDOMAIN; kullanıcı onayı olmadan değişiklik yapılmadı. |
| Yerel Windows/AppData | Yalnız cihaz sahibi ve fizikî/şifreli yedek erişimi | `%APPDATA%\Global 1881 Gayrimenkul` salt-kopyası; PDF/manifest ve şifreli offline yedek ayrı korunur | `YEREL-WINDOWS-VERI-YEDEK-REHBERI.md`; mevcut 1.0.22 kurulumuna dokunulmaz. |
| Kaynak geliştirme paketi | Kod deposu/yönetim Code alanı; gizli değer ve veri içermez | Salt-okunur kaynak ZIP’i ve SHA-256 | `Global1881-kaynak-devir-guvenli-2026-08-30.zip` doğrulanmıştır. |

Bu matris, kaynak ZIP’i ile canlı uygulama varlıklarının aynı şey olmadığını açıkça ayırır. Her varlık için ayrı erişim sahibi, ayrı yedekleme yöntemi ve geri yükleme kanıtı gerekir; bir varlığın yedeği diğerinin yerine geçmez.

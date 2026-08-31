# Global 1881 — Yeni Hesapta Güvenli Devam Rehberi

**Hazırlayan:** Manus AI  
**Tarih:** 31 Ağustos 2026  
**Kullanım amacı:** Bu rehber, mevcut sistemdeki erişim sorunu çözülemezse Global 1881 uygulamasını yeni hesapta **sıfırdan yazmadan**, kontrollü biçimde yeniden kurmak için hazırlanmıştır. Bu yalnız bir önlem planıdır; bugün hiçbir yeni hesap, uygulama, veritabanı veya alan adı değişikliği başlatmaz.

> **Koruma ilkesi:** Mevcut proje, merkezi veriler, yerel Windows uygulaması, `%APPDATA%\Global 1881 Gayrimenkul` içeriği, imzalı PDF’ler ve mevcut yayın alanı bu süreç boyunca korunur. Yeni ortam kullanıcı tarafından açıkça onaylanmadan veri taşınmaz veya eski ortam silinmez.

## 1. Hazır olan devir malzemeleri

| Dosya | İçerik | Güvenlik durumu |
|---|---|---|
| `Global1881-kaynak-devir-guvenli-2026-08-30.zip` | React/TypeScript kaynak kodu, Node.js/Express/tRPC sunucusu, şema/migrasyon, testler, mimari ve güvenlik notları | Merkezi veri, gizli anahtarlar ve Windows paketleme dosyaları yoktur. |
| `Global1881-merkezi-veri-sifreli-yedek-2026-08-30.7z` | Merkezi operasyonel verinin salt-okunur dışa aktarımı ve doğrulama manifesti | AES-256 ile şifreli; parola bu pakette değildir. |
| `*.sha256` dosyaları | Her arşivin bütünlük özeti | İndirme sonrası doğrulama için kullanılır. |
| `DEVRALMA-VE-YEDEK-PLANI.md` | Kapsam, sayısal envanter ve geri dönüş sınırları | Kişisel veri dökümü veya gizli değer içermez. |
| `BULUT-SAGLAYICI-GORUSME-LISTESI.md` | Yeni ortam/sağlayıcı için kabul ölçütleri | Sağlayıcı değerlendirmesinde kullanılır. |

## 2. Yeni hesapta kurulumu başlatmadan önce karar kapıları

Kuruluma geçmeden önce aşağıdaki dört koşulun tamamı yazılı olarak doğrulanmalıdır.

| Karar kapısı | Gereken teyit | Neden önemli? |
|---|---|---|
| 1. Yeni hesap | Yeni hesabın sahibi ve yönetici erişimi belli olmalı | Uygulama ve alan adı kontrolü kişiye/kuruma bağlıdır. |
| 2. Hedef ortam | Manus üzerindeki yeni proje mi, yoksa sözleşmeli üçüncü taraf bulut mu seçilmeli | Kimlik doğrulama, veritabanı, depolama ve TLS tasarımı buna göre değişir. |
| 3. Veri geri alma | Şifreli arşivin parolası güvenli ve ayrı kanaldan sağlanmalı | Parola hiçbir kod dosyasına, e-postaya veya açık desteğe yazılmaz. |
| 4. Alan adı | Yeni geçici yayın adresiyle kabul tamamlanmadan mevcut alan adı değiştirilmeyecek | Geri dönüş ve kesintisiz çalışma olanağı korunur. |

## 3. Teknik yeniden kurulum sırası

### A. Boş proje ve kaynakların açılması

1. Yeni hesapta boş bir tam yığın proje oluşturulur.
2. Kaynak devir ZIP’i yalnız proje çalışma alanına açılır; SHA-256 özeti doğrulanır.
3. Kilitli paket listesi (`pnpm-lock.yaml`) üzerinden bağımlılıklar kurulur.
4. `pnpm test`, `pnpm check` ve `pnpm build` çalıştırılır. Hata varsa önce kaynak düzeyinde çözülür; merkezi veri henüz içe aktarılmaz.
5. Mevcut projede bulunan Windows paketleme betikleri yeni dağıtıma taşınmaz. Offline/Electron kabulü ayrıca ve yalnız güvenli Windows ortamında ele alınır.

### B. Yeni merkezi veri hizmetlerinin kurulması

1. Yeni hedefte MySQL 8 uyumlu, uygulamadan ayrı yönetilen bir veritabanı oluşturulur.
2. Özel belge depolama için S3 uyumlu obje depolama oluşturulur; erişim varsayılan olarak özel tutulur.
3. Uygulama gizli değişkenleri secret manager veya yeni projenin güvenli gizli ayar ekranından tanımlanır. Değerler koda, ZIP’e veya destek yazışmasına eklenmez.[1]
4. Veritabanı şeması/migrasyonları boş veritabanına uygulanır.
5. Yeni kimlik doğrulama yapılandırması kurulup yönetici kullanıcısı kontrollü biçimde tanımlanır. Mevcut Manus OAuth değerleri taşınmaz; yeni hesap/ortam için yeniden yapılandırılır.

### C. Şifreli merkezi verinin kontrollü geri alınması

1. Kullanıcı, şifreli `.7z` arşivi ve parolasını **ayrı kanallarda** sağlar.
2. Arşivin SHA-256 değeri doğrulanır ve parola doğruysa manifest bütünlüğü kontrol edilir.
3. Önce yalnız boş hedef veritabanına içe aktarma yapılır; eski merkezi veritabanına yazılmaz.
4. Kayıt sayıları, zorunlu ilişkiler, rol kapsamı, sözleşme numaraları ve Türkçe tarih formatları örneklenerek doğrulanır.
5. Yüklenmiş belge metadata kaydı bugün sıfırdır. Gelecekte belge varsa, dosyalar yeni özel S3 depolamaya aktarılmadan önce checksum ve erişim kontrolü yapılır.

### D. Kabul ve yayın

1. Geçici yeni yayın adresinde yalnız yöneticiyle giriş yapılır.
2. Tek kabul oturumunda işyeri/kira formu, A4 belge, EİDS alanları, DASK, rol mahremiyeti, aktif kira takibi, finans ekranları ve şifreli yedek/merge akışı doğrulanır.
3. TLS ve alan adı davranışı Türkiye’den izleme ile doğrulanır.
4. Eski ortam **silinmez**. Yeni ortam ancak kullanıcı kabulünden sonra üretim kullanımına açılır.
5. Mevcut `emlakdash-kcw9r85v.manus.space` alanına hiçbir bağlantı kesme/yeniden bağlama işlemi yapılmadan önce açık kullanıcı onayı ve yazılı geri dönüş planı alınır.

## 4. Yeni ortamda yeniden oluşturulacak, arşivde olmayan öğeler

| Öğe | Neden ZIP içinde yok? | Yeni ortamda nasıl ele alınır? |
|---|---|---|
| Veritabanı bağlantı bilgileri | Gizli bilgi | Yeni veritabanı oluşturulunca secret manager’a tanımlanır. |
| JWT/OAuth anahtarları | Gizli ve ortama özgü | Yeni ortamda yeni anahtar üretilir; eskisi kopyalanmaz. |
| S3 erişim anahtarları | Gizli bilgi | Yeni özel depolama hesabı için en az yetkiyle tanımlanır. |
| Alan adı/DNS/TLS bağlantısı | Hesap ve sağlayıcıya bağlı | Yeni ortam kabulünden sonra ayrı değişiklik planıyla ele alınır. |
| Yerel Windows verisi | Kullanıcının cihazında, merkezi sistemden bağımsız | `%APPDATA%\Global 1881 Gayrimenkul` klasöründen salt kopya alınır; bu işlem merkezi yedekten bağımsızdır. |
| İmzalı yerel PDF’ler | Yerel/offline arşiv | Yerel kopya ve şifreli harici disk/kurumsal depolama ile ayrı korunur. |

## 5. Hızlı ve güvenli süre planı

| Aşama | Tahmini teknik çalışma | Dış bağımlılık |
|---|---:|---|
| Kaynak açılışı, bağımlılık, test ve derleme | 3–5 saat | Yeni proje çalışma alanı |
| Veritabanı/depolama ve gizli ayarların yeni ortamda kurulması | 0,5–1 iş günü | Seçilen bulut/hizmet erişimleri |
| Şifreli veri geri alma ve doğrulama | 0,5–1 iş günü | Arşiv parolası ve hedef veritabanı |
| Kimlik doğrulama, kabul ve geçici yayın | 0,5–1 iş günü | Yeni hesap/alan adı kararı |

Bu nedenle, yeni hesapta kaynak geliştirme ortamı aynı gün çalışır hâle getirilebilir. Merkezi veriyle birlikte güvenli ve kabul edilmiş geçiş için **2–3 iş günü** gerçekçi tekniktir. Alan adı/TLS devri veya üçüncü taraf sağlayıcı onayı bu tahmine dahil değildir.

## 6. Gizli bilgi ve parola kuralları

Parola, müşteri verisi, veritabanı URL’si, API anahtarı, JWT/OAuth anahtarı veya S3 anahtarı sohbet, e-posta, destek bileti ve kaynak ZIP içinde tutulmamalıdır. Gizli değerler merkezi, denetlenebilir gizli yönetim hizmetinde; rol bazlı ve en az yetki ilkesiyle yönetilmelidir.[1] [3]

Yedekler için en az üç kopya, iki farklı ortam ve biri fiziksel olarak ayrı konum yaklaşımı uygulanmalı; geri yükleme prosedürü yalnız var sayılmamalı, düzenli olarak test edilmelidir.[2]

## 7. Kullanıcı yeni hesaba geçişi onayladığında izlenecek tek mesaj

Yeni hesap açılmış ve paketler hazır olduğunda şu bilgi yeterlidir:

> “Yeni hesap hazır. Kaynak devir ZIP’i ve şifreli merkezi veri arşivi yüklendi. Parola ayrı kanaldan sağlanacak. Mevcut projeye, alan adına ve Windows verilerine dokunmadan yeni ortamı kurmaya başlayabilirsiniz.”

Bu teyit gelmeden hiçbir aktarım, yeni proje oluşturma, veri geri alma, DNS değişikliği veya eski ortam silme işlemi yapılmaz.

## References

[1]: [OWASP, *Secrets Management Cheat Sheet*](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
[2]: [CISA, *Back Up Business Data*](https://www.cisa.gov/audiences/small-and-medium-businesses/secure-your-business/back-up-business-data)
[3]: [NIST Cybersecurity Framework, *Protect*](https://www.nist.gov/cyberframework/protect)

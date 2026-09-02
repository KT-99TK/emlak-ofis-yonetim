# Windows Dağıtım Güvenlik İnceleme Notu

## 29.08.2026 — Defender algılaması

Windows Defender, indirilen 1.0.23 kaynak/portable ZIP dosyası için `Trojan:Script/Wacatac.H!ml` algılaması verdi. Bu dosyalar geri yüklenmeyecek, izin verilmeyecek veya dağıtılmayacaktır. Windows kabulü yalnız web uygulamasında devam eder; imzasız Windows dağıtımı güvenlik incelemesi tamamlanana kadar durdurulmuştur.

Microsoft, `Trojan:Script/Wacatac.H!ml` ifadesini geniş bir heuristik algılama olarak tanımlar; algılama bazen yanlış pozitif üretebilse de doğrulama yapılmadan dosya çalıştırmak güvenli değildir. Microsoft ayrıca şüpheli veya yanlış algılandığı düşünülen dosyalar için dosya analiz başvuru sayfası sunar.

## 29.08.2026 — Web erişim kontrolü

Yayın alan adı `https://emlakdash-kcw9r85v.manus.space` iki bağımsız kontrolde geçerli TLS 1.3 sertifikası ve HTTP 200 yanıtı verdi; sertifika `*.manus.space` ile alan adı eşleşti. Kullanıcı tarafında önce `ERR_SSL_PROTOCOL_ERROR`, daha sonra geçici bakım modu ekranı görüldü. Son bağımsız kontrolde alan adı yeniden uygulamanın giriş ekranını döndürdü. Kullanıcı kabulü yalnız HTTPS bağlantısında güvenlik uyarısı olmadan açılan giriş ekranından sürdürülecek; bakım veya SSL hata ekranı görünürse kullanıcı uyarıyı aşmayacaktır.

## Statik ilk inceleme

`WINDOWS-KURULUM.bat` ve `WINDOWS-KURULUM.ps1` içinde doğrudan dosya indirme, registry yazma, zamanlanmış görev, gizli komut çalıştırma veya otomatik güncelleme kodu bulunmadı. Buna karşılık `ExecutionPolicy Bypass`, `npx.cmd --yes pnpm@10.4.1` ve `Remove-Item -Recurse -Force` kalıpları Windows script tabanlı heuristik algılamalar için inceleme gerektiren yüzeylerdir.

Üretim bağımlılık denetimi ilk durumda 589 üretim bağımlılığı içinde 10 düşük, 47 orta, 22 yüksek ve 1 kritik bulgu verdi. Kritik bulgu, AWS S3 zincirinden gelen `fast-xml-parser` 5.2.5 sürümündeydi. AWS S3 istemcileri `3.1121.0` sürümüne güncellendi ve geçişli parser sürümü `fast-xml-parser` 5.11.1 oldu. Kritik bulgu kapandıktan sonra, aktif kira Excel aktarımındaki yüksek riskli `xlsx`/SheetJS paketi ExcelJS 4.4.0 ile değiştirildi ve doğrudan kullanılan `nanoid` 5.1.16 sürümüne yükseltildi. tRPC, Drizzle ORM, Axios, Express ve Streamdown güvenli sürümlere yükseltildi; Express 5 wildcard rota geçişi storage proxy ve Vite fallback testleriyle düzeltildi. `mdast-util-to-hast` 13.2.1 sürümüne yükseltildikten sonra yapılan son üretim denetiminde kritik, yüksek ve düşük bulgu kalmadı; yalnızca **1 orta seviye** bulgu kaldı. Bu bulgu ExcelJS’in geçişli `uuid@8.3.2` paketinden gelir; uygulamanın kullandığı UUID v4 üretim akışından değil, `uuid` paketinin v3/v5/v6 çağrılarında dışarıdan verilen buffer için sınır doğrulaması eksikliğinden kaynaklanır. Bu bağımlılık denetimi, Defender algılamasının sebebini tek başına açıklamaz.

Windows betikleri ayrıca sadeleştirildi: `ExecutionPolicy Bypass`, otomatik `npx` indirme fallback’i ve zorlayıcı `Remove-Item -Recurse -Force` temizleme akışı kaldırıldı. BAT artık yalnız yerel `pnpm.cmd`, kilitli bağımlılık kurulumu, TypeScript doğrulaması ve installer üretim komutlarını kullanır; 50 MB’tan küçük çıktıların dağıtımını reddeder. Bu değişiklikler statik kod incelemesi ve test ile doğrulandı, fakat Microsoft’un bağımsız dosya analizi olmadan Defender algılamasının yanlış pozitif olduğu sonucuna varılmaz.

ExcelJS’in geçişli `uuid@8.3.2` bağımlılığını Web Crypto ile değiştirmeyi amaçlayan yerel patch denemesi, pnpm 10.4.1 kurulumu ve kilit dosyasına uygulanmadığı için geri alındı. Aynı sürümde yalnız `exceljs>uuid: 11.1.1` biçimindeki desteklenen override denemesi de kurulu paketi veya kilit dosyasını değiştirmedi; boş bir izole proje içinde yeniden çözümleme ile yapılan aynı deneme de `uuid@8.3.2` sonucunu verdi. `pnpm why uuid` sonucunda paket hâlâ yalnızca `exceljs -> uuid@8.3.2` zincirinde bulundu. Bu nedenle orta seviye advisory kapatılmış sayılmaz. ExcelJS’in açık upstream kaydı, 4.4.0 sürümünün `uuid@^8.3.0` kullandığını ve resmî bakım sürümünde henüz güncelleme bulunmadığını göstermektedir. PnPM’in güncel yapılandırma belgeleri, `patchedDependencies` gibi proje ayarlarının `pnpm-workspace.yaml` içinde tanımlandığını belirtmektedir; buna rağmen bu eski pnpm sürümünde uygulama kanıtı oluşmamıştır. PnPM sürümü güncellenmeden ya da ExcelJS upstream düzeltme yayımlanmadan doğrulanmamış bir patch veya override dağıtıma alınmayacaktır.

## 29.08.2026 — Son Ubuntu doğrulaması

Tam test paketi, TypeScript denetimi ve production build başarıyla tamamlandı. Uygulama sunucusu yeniden başlatıldıktan sonra ana sayfa HTTP 200, yetkisiz ofis belgesi isteği (`/manus-storage/office-documents/example.pdf`) HTTP 403 döndürdü; Express 5 wildcard rota geçişinde yeni hata görülmedi. Yayın alan adı da bağımsız tarayıcı kontrolünde giriş ekranını açtı; doğrudan TLS kontrolü `*.manus.space` kapsamlı sertifika, geçerli sertifika zinciri, TLS bağlantısı ve HTTP 200 verdi. Buna rağmen bu tek merkezî kontrol, kullanıcının farklı ağlarda gördüğü SSL/bakım sorununun kalıcı olarak çözüldüğünü kanıtlamaz.

29.08.2026 tarihinde yapılan bir sonraki bağımsız tarayıcı kontrolünde de aynı yayın alanı HTTPS üzerinden güvenlik uyarısı veya bakım ekranı olmadan “Sign in to continue” giriş sayfasını döndürdü. Bu tekrar, alan adının kontrol anında erişilebilir olduğunu doğrular; kullanıcının ayrı ağlarında karşılaştığı önceki ara kesintiler için kalıcı erişim kabulü yerine geçmez.

## 29.08.2026 — Kullanıcı ağında tekrar eden TLS kanıtı

Kullanıcının normal tarayıcıdan paylaştığı ekran görüntüsü, `emlakdash-kcw9r85v.manus.space` adresinde “Bu site güvenli bağlantı sağlayamıyor”, “geçersiz bir yanıt gönderdi” ve `ERR_SSL_PROTOCOL_ERROR` iletisini tekrar gösterdi. Aynı anda sandbox tarayıcısı giriş sayfasını, doğrudan TLS/HTTP kontrolleri ise geçerli sertifika zinciri ve HTTP 200 sonucunu verdi. Bu fark uygulama kodu ve kullanıcı cihazındaki Windows programından bağımsız bir alan adı/HTTPS erişim katmanı olayı olarak ele alınacaktır. Kullanıcıdan Windows ağ teşhisleri çalıştırması, tarayıcı güvenlik uyarısını aşması veya Defender ayarlarını değiştirmesi istenmeyecektir.

Kullanıcı, bu bulgular ile Windows 10 uygulama kilitlenmesi ardından yapılan Windows 11 kurulumu bağlamını destek başvurusuna ekleyerek 29.08.2026 tarihinde Manus Destek’e iletti. Bir sonraki teknik işlem, destek yanıtındaki alan adı/TLS bulgusuna göre belirlenecektir; bu sürede Windows dağıtımı durdurulmuştur.

Destek ekibinin yeni görüşme yanıtını bildiren e-postasındaki “Yanıtı görüntüle” bağlantısı kullanıcı tarafında içerik açmadı. Bu da mevcut HTTPS/oturum erişim farkının destek görüşmesini etkileyebileceğine işaret eder. Kullanıcıya bağlantıyı yeniden denemek, Windows ağ ayarı değiştirmek veya güvenlik korumasını aşmak yerine destek yanıtının e-posta gövdesinde istenmesi önerildi.

Daha sonraki doğrulamada kullanıcı, destek sohbetindeki yazışmaları doğrudan görebildiğini ve görüşmenin o kanalda sürdüğünü bildirdi. Bu nedenle e-posta bağlantısının genel yardım merkezine düşmesi, destek ekibiyle iletişim için engel değildir; teknik ekip yanıtı destek sohbetinden izlenecektir.

Kullanıcı bu e-posta yanıt talebini 29.08.2026 tarihinde gönderdi. Destek yanıtı e-posta gövdesinde alınana kadar hiçbir yedek geri yükleme, alan adı/DNS değişikliği, Windows kurulumu veya güvenlik yapılandırması işlemi başlatılmayacaktır.

Kullanıcı, destek ekibinin ek bilgi talebine yanıt olarak Manus hesabına giriş yapabildiğini, hesabına özel bir hizmet değişikliği bildirimi almadığını ve normal pencere, gizli pencere ile mobil veri denemelerindeki hata kanıtlarının zaten iletildiğini bildirdi. Son normal tarayıcı ekranındaki `ERR_SSL_PROTOCOL_ERROR` ile birlikte alan adı/TLS inceleme talebi destek ekibine gönderildi. Bu bilgi, hizmet değişikliği veya geri yükleme gereğinin şu aşamada varsayılmaması gerektiğini destekler; sonraki işlem destek ekibinin resmî teşhisine bağlıdır.

Destek ekibi, kullanıcı hesabının hizmet değişikliğinden etkilenme durumunu ve `emlakdash-kcw9r85v.manus.space` alan adının TLS/HTTPS davranışını yeniden doğruladığını; sonucu doğrudan aynı e-posta görüşmesinde paylaşacağını bildirdi. Bu yanıt gelene kadar değişiklik veya geri yükleme yapılmayacaktır.

Destek ekibi sonrasında hesabın hizmet değişikliğinin kapsamı dışında olduğunu, hesabın Type A/B/C olmadığını ve alan adı için bu nedenle veri geri yüklemesi gerekmediğini doğruladı. Kullanıcının son normal Chrome denemesinde `ERR_SSL_PROTOCOL_ERROR` yeniden görüldüğünü gösteren ekran görüntüsünü aldıktan sonra, bu TLS/HTTPS erişim farkını ayrıntılı inceleme için teknik ekibe aktardığını ve sonucun e-posta üzerinden paylaşılacağını bildirdi. Bu aşamada erişim olayı doğrulanmış olup uygulama kodu, Windows ayarları ve Defender üzerinde değişiklik yapılmayacaktır.

Kullanıcı, hata ekranı zamanının 29.08.2026 tarihinde 18:11 Türkiye saati olduğunu teknik destek sohbetine iletti; ekran görüntüsünde sonraki sohbet bildirimi 18:21 olarak görülmektedir. Böylece destek ekibinin talep ettiği yeniden üretim zamanı sağlanmıştır. Bu yazının ardından yeni test veya yeni mesaj istenmeyecek, teknik ekip sonucu beklenecektir.

## 02.09.2026 — Maskeli hassas veri erişimi

Yeni merkezi sözleşme ve aktif kira içe aktarım yollarında telefon ile T.C./vergi no, ana iş tablolarına düz metin olarak yazılmak yerine maskeli görünümle saklanır. Ham yeni değerler AES-256-GCM ile şifrelenmiş ayrı `sensitiveFieldVault` tablosuna alınır; bu eklemeli şema geçişi mevcut satırları, imzalı PDF’leri ve geçmiş yedekleri değiştirmemiştir. Mevcut eski değerler taşınmamış veya toplu güncellenmemiş; normal API yanıtlarında maskelenmiştir.

Tam değer döndüren üç tRPC işlemi (müşteri, sözleşme ve aktif kira), broker manager veya yalnız ilgili kaydın atanmış danışmanı için açıktır. Her işlem 8–280 karakterlik, telefon/kimlik/e-posta içermeyen bir gerekçe ister; `auditLogs` kaydında yalnız `sensitive_data_revealed`, varlık türü/kimliği ve gerekçe tutulur. Ham veya kısmi hassas değer audit kaydına yazılmaz. Müşteri ve aktif kira ekranlarındaki tam değer istemci durumunda 30 saniye sonra otomatik gizlenir; ofis asistanı ve başka danışmanlar bu erişim düğmesini ya da sunucu rotasını kullanamaz.

Bu sürümde varsayılan API listeleri, aktif kira ekrandaki iletişim sütunu, merkezi sözleşme detay yanıtı, offline kira snapshot’ı ve offline yetki snapshot’ı maskeli sonuç verir. Fizikî imza öncesi A4 baskı, formda o an girilen değerleri kullanmaya devam eder; imzalı fizikî nüshanın dijital taraması varsayılan olarak etkinleştirilmemiştir. Tam dışa aktarım için ayrı ve daha yüksek onaylı bir akış eklenmemiştir; mevcut varsayılan dışa aktarımlar bu nedenle tam değer taşımaz.

## 02.09.2026 — Bağımlılık denetimi güncellemesi

Maskeli erişim değişikliği sonrasında tekrarlanan üretim denetimi, `mysql2@3.15.1` için yüksek seviye `mysql_clear_password` kimlik bilgisi sızıntısı advisory’sini gösterdi. `mysql2`, Drizzle uyumluluğu korunarak `3.22.0` sürümüne güncellendi ve geliştirme sunucusu yeniden başlatıldı. Son doğrulama; **98 test dosyasında 268 test**, TypeScript denetimi, production build, kök yol HTTP 200 ve yetkisiz belge isteği HTTP 403 sonucunu verdi.

Son production audit sonucunda kritik, yüksek ve düşük seviye bulgu kalmadı. Kalan tek bulgu ExcelJS `4.4.0` içinden gelen geçişli `uuid@8.3.2` için orta seviyelidir; önceki upstream izleme ve doğrulanmamış override’ı dağıtıma almama kararı geçerlidir.

## Resmî kaynaklar

- [Microsoft Security Intelligence — Trojan:Script/Wacatac.H!ml](https://www.microsoft.com/en-us/wdsi/threats/malware-encyclopedia-description?name=Trojan%3AScript%2FWacatac.H!ml&threatid=2147814524)
- [Microsoft Security Intelligence — Submit a file for malware analysis](https://www.microsoft.com/en-us/wdsi/filesubmission)
- [GitHub Security Advisory — fast-xml-parser entity encoding bypass](https://github.com/advisories/GHSA-m7jm-9gc2-mpf2)
- [GitHub Security Advisory — uuid buffer bounds check](https://github.com/advisories/GHSA-w5hq-g745-h8pq)
- [PnPM Settings — workspace yapılandırması](https://pnpm.io/settings)
- [ExcelJS issue #3041 — uuid geçişli bağımlılık bulgusu](https://github.com/exceljs/exceljs/issues/3041)
- [ExcelJS issue #3055 — uuid/tmp bağımlılık güncellemesi isteği](https://github.com/exceljs/exceljs/issues/3055)

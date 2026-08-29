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

Kullanıcı bu e-posta yanıt talebini 29.08.2026 tarihinde gönderdi. Destek yanıtı e-posta gövdesinde alınana kadar hiçbir yedek geri yükleme, alan adı/DNS değişikliği, Windows kurulumu veya güvenlik yapılandırması işlemi başlatılmayacaktır.

## Resmî kaynaklar

- [Microsoft Security Intelligence — Trojan:Script/Wacatac.H!ml](https://www.microsoft.com/en-us/wdsi/threats/malware-encyclopedia-description?name=Trojan%3AScript%2FWacatac.H!ml&threatid=2147814524)
- [Microsoft Security Intelligence — Submit a file for malware analysis](https://www.microsoft.com/en-us/wdsi/filesubmission)
- [GitHub Security Advisory — fast-xml-parser entity encoding bypass](https://github.com/advisories/GHSA-m7jm-9gc2-mpf2)
- [GitHub Security Advisory — uuid buffer bounds check](https://github.com/advisories/GHSA-w5hq-g745-h8pq)
- [PnPM Settings — workspace yapılandırması](https://pnpm.io/settings)
- [ExcelJS issue #3041 — uuid geçişli bağımlılık bulgusu](https://github.com/exceljs/exceljs/issues/3041)
- [ExcelJS issue #3055 — uuid/tmp bağımlılık güncellemesi isteği](https://github.com/exceljs/exceljs/issues/3055)

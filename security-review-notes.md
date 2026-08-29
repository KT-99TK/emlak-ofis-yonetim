# Windows Dağıtım Güvenlik İnceleme Notu

## 29.08.2026 — Defender algılaması

Windows Defender, indirilen 1.0.23 kaynak/portable ZIP dosyası için `Trojan:Script/Wacatac.H!ml` algılaması verdi. Bu dosyalar geri yüklenmeyecek, izin verilmeyecek veya dağıtılmayacaktır. Windows kabulü yalnız web uygulamasında devam eder; imzasız Windows dağıtımı güvenlik incelemesi tamamlanana kadar durdurulmuştur.

Microsoft, `Trojan:Script/Wacatac.H!ml` ifadesini geniş bir heuristik algılama olarak tanımlar; algılama bazen yanlış pozitif üretebilse de doğrulama yapılmadan dosya çalıştırmak güvenli değildir. Microsoft ayrıca şüpheli veya yanlış algılandığı düşünülen dosyalar için dosya analiz başvuru sayfası sunar.

## 29.08.2026 — Web erişim kontrolü

Yayın alan adı `https://emlakdash-kcw9r85v.manus.space` iki bağımsız kontrolde geçerli TLS 1.3 sertifikası ve HTTP 200 yanıtı verdi; sertifika `*.manus.space` ile alan adı eşleşti. Kullanıcı tarafında önce `ERR_SSL_PROTOCOL_ERROR`, daha sonra geçici bakım modu ekranı görüldü. Son bağımsız kontrolde alan adı yeniden uygulamanın giriş ekranını döndürdü. Kullanıcı kabulü yalnız HTTPS bağlantısında güvenlik uyarısı olmadan açılan giriş ekranından sürdürülecek; bakım veya SSL hata ekranı görünürse kullanıcı uyarıyı aşmayacaktır.

## Statik ilk inceleme

`WINDOWS-KURULUM.bat` ve `WINDOWS-KURULUM.ps1` içinde doğrudan dosya indirme, registry yazma, zamanlanmış görev, gizli komut çalıştırma veya otomatik güncelleme kodu bulunmadı. Buna karşılık `ExecutionPolicy Bypass`, `npx.cmd --yes pnpm@10.4.1` ve `Remove-Item -Recurse -Force` kalıpları Windows script tabanlı heuristik algılamalar için inceleme gerektiren yüzeylerdir.

Üretim bağımlılık denetimi ilk durumda 589 üretim bağımlılığı içinde 10 düşük, 47 orta, 22 yüksek ve 1 kritik bulgu verdi. Kritik bulgu, AWS S3 zincirinden gelen `fast-xml-parser` 5.2.5 sürümündeydi. AWS S3 istemcileri `3.1121.0` sürümüne güncellendi ve geçişli parser sürümü `fast-xml-parser` 5.11.1 oldu. Kritik bulgu kapandıktan sonra, aktif kira Excel aktarımındaki yüksek riskli `xlsx`/SheetJS paketi ExcelJS 4.4.0 ile değiştirildi ve doğrudan kullanılan `nanoid` 5.1.16 sürümüne yükseltildi. Son üretim denetiminde kritik bulgu kalmadı; 8 düşük, 46 orta ve 16 yüksek bulgu kaldı. Bu bağımlılık denetimi, Defender algılamasının sebebini tek başına açıklamaz.

Windows betikleri ayrıca sadeleştirildi: `ExecutionPolicy Bypass`, otomatik `npx` indirme fallback’i ve zorlayıcı `Remove-Item -Recurse -Force` temizleme akışı kaldırıldı. BAT artık yalnız yerel `pnpm.cmd`, kilitli bağımlılık kurulumu, TypeScript doğrulaması ve installer üretim komutlarını kullanır; 50 MB’tan küçük çıktıların dağıtımını reddeder. Bu değişiklikler statik kod incelemesi ve test ile doğrulandı, fakat Microsoft’un bağımsız dosya analizi olmadan Defender algılamasının yanlış pozitif olduğu sonucuna varılmaz.

## Resmî kaynaklar

- [Microsoft Security Intelligence — Trojan:Script/Wacatac.H!ml](https://www.microsoft.com/en-us/wdsi/threats/malware-encyclopedia-description?name=Trojan%3AScript%2FWacatac.H!ml&threatid=2147814524)
- [Microsoft Security Intelligence — Submit a file for malware analysis](https://www.microsoft.com/en-us/wdsi/filesubmission)
- [GitHub Security Advisory — fast-xml-parser entity encoding bypass](https://github.com/advisories/GHSA-m7jm-9gc2-mpf2)

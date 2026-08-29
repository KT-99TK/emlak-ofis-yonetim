# Global 1881 Ofis Yönetimi — Windows 1.0.23 FINAL

Bu klasör 1.0.23 kabul paketi içindir. Pakette hazır Windows installer, yeniden üretim için BAT/PowerShell betikleri ve bütünlük özeti bulunur.

## Güvenli kurulum

Mevcut 1.0.22 kurulumunu ve kullanıcı verilerini silmeyin. Önce ZIP’i tamamen açın. Hazır installer dosyası olan `Global1881-Ofis-Offline-v1.0.23-FINAL.exe` dosyasını çalıştırın ve mevcut programın üzerine veya ayrı bir test klasörüne kurun. Windows 11 SmartScreen uyarısı gösterirse güvenlik korumasını devre dışı bırakmayın; dosyanın adını ve SHA-256 özetini kontrol ederek kurumunuzun güvenli yazılım prosedürünü uygulayın.

Hazır EXE’yi çalıştırmak için `Global1881-BASLAT.bat` dosyasını veya doğrudan `Global1881-Ofis-Offline-v1.0.23-FINAL.exe` dosyasını kullanın. Kurulumdan sonra uygulama açılışında **Genel Bakış** ekranı görünmelidir. Ardından **Kira Sözleşmeleri** ekranını açın ve ilk kira son ödeme tarihinin altındaki `En geç` satırının `GG.AA.YYYY` biçiminde göründüğünü kontrol edin. Mevcut kullanıcı verilerini silme, IndexedDB temizleme veya `%APPDATA%\\Global 1881 Gayrimenkul` klasörünü silme işlemi yapmayın.

## Yeniden paketleme

`WINDOWS-KURULUM.bat` hazır EXE’yi başlatmaz; kaynak proje klasöründen yeniden installer üretmek içindir. Kaynak proje klasörü ile yeniden installer oluşturulacaksa Windows’ta bu dosyayı çalıştırın. Betik PowerShell üzerinden `pnpm desktop:installer` çağırır; bu komut önce güncel Vite frontend dist çıktısını üretir, sonra Electron installer’ını paketler. Hazır installer kullanılıyorsa yeniden paketleme yapılması gerekmez.

## Kabul bulgusu bildirme

Bir ekran beklenmedik görünürse programı kapatmadan ekran görüntüsünü ve `%APPDATA%\\Global 1881 Gayrimenkul\\startup.log` dosyasının ilgili son satırlarını paylaşın. Özellikle `appVersion`, `indexPath`, `exists`, `initialRoute` ve `Arayüz yüklendi` satırları gereklidir.

> Bu paket geçiş tarihinden sonra temiz online başlangıç ilkesiyle hazırlanmıştır. Eski sözleşme, kasa/banka bakiyesi veya gider devri yapılmaz.

# Global 1881 — Yerel Windows Veri Yedeği Rehberi

**Amaç:** Mevcut Windows 1.0.22 kurulumunu, `%APPDATA%\Global 1881 Gayrimenkul` içeriğini veya kullanıcı verisini değiştirmeden, yalnız güvenli bir salt-kopya almak.

## Kapsam

Bu rehber yalnız kullanıcının kendi Windows cihazındaki yerel Electron verileri içindir. Merkezi MySQL/TiDB veritabanı, S3 belgeleri, Manus alan adı, secret değerleri ve kaynak kod ZIP’i bunun yerine geçmez. Bu rehberde parola, token, bağlantı dizesi veya şifreli yedek parolası yazılmaz.

## Güvenli kopya sırası

1. Uygulamayı normal biçimde kapatın; Defender’ı devre dışı bırakmayın ve karantinaya alınmış dosyayı geri yüklemeyin.
2. Dosya Gezgini adres çubuğuna `%APPDATA%\Global 1881 Gayrimenkul` yazın.
3. Klasörün tamamını, tercihen harici şifreli diskte veya güvenilir parola korumalı depolama alanında tarihli bir klasöre **kopyalayın**. Kaynak klasörü taşımayın, silmeyin veya yeniden adlandırmayın.
4. Kopya içinde `startup.log`, yerel PDF arşivi, PDF manifestleri ve uygulamanın yerel veri dosyaları varsa korunmalıdır. Dosya adlarını değiştirmeyin.
5. Kopya tamamlandıktan sonra klasör boyutu ve dosya sayısını kaynakla karşılaştırın. Kopya üzerinde uygulamayı çalıştırmayın ve dosya içeriğini düzenlemeyin.
6. Yedeği ikinci, erişimi sınırlı bir konumda tutun. Şifreli offline JSON yedeği ile AppData PDF/manifest kopyası ayrı varlıklardır; ikisi birlikte korunmalıdır.

## Geri yükleme sınırı

Geri yükleme yalnız Windows cihazı ve uygulama sürümü kontrollü biçimde hazırlandıktan sonra yapılmalıdır. Eski AppData klasörünün üzerine doğrudan yazılmamalı; önce mevcut klasörün ayrı bir salt-kopyası alınmalı, ardından yalnız proje sorumlusu tarafından karşılaştırmalı geri alma planı uygulanmalıdır. Yeni EXE/ZIP/BAT üretimi veya Defender uyarısını aşma bu rehberin kapsamında değildir.

> Bu belge merkezi veri yedeği değildir. Merkezi veritabanı ve belgeler için ayrıca şifreli merkezi yedek ve sağlayıcının doğrulanmış geri yükleme prosedürü gerekir.

## Gizli ayarları ifşa etmeden yeniden oluşturma

Yeni veya onarılmış cihazda gizli ayarlar eski cihazdan düz metin olarak kopyalanmamalıdır. Uygulama adı, kullanıcı profili ve veri klasörü gibi gizli olmayan ayarlar uygulamanın kendi kurulumundan yeniden oluşur. Oturum çerezi, OAuth belirteci, JWT, S3 anahtarı, veritabanı bağlantısı ve yedek parolası kopyalanmaz; kullanıcı güvenli giriş ekranından yeniden oturum açar veya yetkili yönetici bu değerleri secret manager üzerinden yeniden tanımlar. Bir ayarın değeri paylaşılmadan yalnız değişken adı, mevcut olup olmadığı ve son dört karakteri maskeli biçimde kontrol edilebilir. Bu kontroller ekran görüntüsüne, WhatsApp’a veya destek biletine gerçek değer olarak yazılmamalıdır.

Manuel olarak yeniden girilebilecek öğeler; uygulama giriş hesabı, kullanıcının tercihleri ve gerekiyorsa yeni cihazın işletim sistemi güven ayarlarıdır. Manuel olarak kopyalanmaması gereken öğeler; oturum/token dosyaları, şifreli yedek parolası, cihaz özel imza anahtarı ve gizli bağlantı yapılandırmasıdır. İmza doğrulaması gerekiyorsa, imzalı yedek zarfı ve doğrulama için gerekli açık anahtar birlikte kullanılmalı; özel anahtar düz metin olarak paylaşılmamalıdır.

## Geri kurulum ayrıştırma kontrolü

Geri kurulumda üç varlık ayrı doğrulanır. **Alan adı bağı** DNS sağlayıcısında ve yayın panelinde kalır; AppData kopyası alan adı kaydını değiştirmez. **Oturum ve yerel veri** yeni cihazda yeniden oturum açıldıktan sonra şifreli offline yedekten kullanıcı onayıyla geri alınır; eski oturum dosyası kopyalanmaz. **PDF ve manifestler** AppData içindeki ayrı klasörlerden, dosya adları değiştirilmeden kopyalanır; manifestteki SHA-256 özetiyle PDF bütünlüğü karşılaştırılır. Bu üç kontrol tamamlanmadan eski AppData klasörünün üzerine yazılmaz ve eski cihaz silinmez.

Kısa doğrulama sonucu; yeni cihazda alan adı DNS kaydı değişmemiş, uygulama güvenli giriş yapabiliyor, şifreli yedek doğru parola ile açılıyor, yanlış parola reddediliyor, PDF/manifest özeti eşleşiyor ve eski cihazdaki klasör dosya sayısı korunuyor olmalıdır.

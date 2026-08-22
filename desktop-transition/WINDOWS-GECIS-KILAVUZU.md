# 1881 Ofis — Windows Offline Geçiş Kılavuzu

## Amaç ve sınır

Bu geçiş sürümünde üç Windows 10/11 laptopu birbirinden bağımsız çalışır. Her laptop kendi tarayıcı yerel deposunda kayıt tutar; laptoplar arasında anlık ortak veri yoktur. Ortak veri, yalnızca manager laptopunda doğrulanan yedeklerin kontrollü birleştirilmesiyle oluşur.

Bu nedenle aynı müşteri, mülk, sözleşme veya ödeme kaydını iki laptopta aynı hafta değiştirmemek gerekir. Çakışma oluştuğunda sistem otomatik üzerine yazmaz; manager kararı bekleyen kayıt olarak gösterir.

## İlk kurulum

Windows paket klasörünü laptopa kopyaladıktan sonra uygulamanın ana çalıştırma dosyasına sağ tıklayın ve **Kısayol oluştur** seçeneğini seçin. Windows kısayolu aynı klasörde oluşturursa bu kısayolu masaüstüne sürükleyin. Kısayolu masaüstünde daha anlaşılır olması için `1881 Ofis — Offline` adıyla yeniden adlandırın. Uygulamayı her gün yalnızca bu kısayoldan açın; uygulama klasörünü veya yerel tarayıcı verisini silmeyin.

Kısayolun özelliklerinde **Başlangıç konumu** uygulamanın kendi klasörü olmalı ve hedef yol ağ sürücüsüne değil, laptopun yerel diskindeki uygulama klasörüne işaret etmelidir. Uygulama güncellendiğinde eski kısayolu silip yeni sürümün ana çalıştırma dosyasından yeni kısayol oluşturun. Güncelleme öncesi mutlaka yedek alın.

Her laptopta uygulama açıldıktan sonra **Offline çalışma alanı** ekranına girin. Önce kullanıcı kodunu kaydedin. Kullanıcı kodu danışman veya manager için benzersiz olmalıdır; örneğin `danisman-ayse` veya `manager-mehmet`. Kullanıcı kodu ayarlanmadan kayıt oluşturma ve yedek alma düğmeleri çalışmaz.

Ekranda görünen cihaz kimliğini ayrıca kurulum çizelgesine yazın. Aynı kullanıcı farklı laptoplarda çalışacaksa her laptopun cihaz kimliği yine ayrı kalmalıdır; yedekler cihaz ve kullanıcı bilgisiyle ayrıştırılır.

## Haftalık yedek prosedürü

Her kullanıcı haftanın son iş gününde **Şifreli yedek oluştur** düğmesine basar. Önce en az 8 karakterli bir yedek parolası girilmelidir; uygulama bu parolayı saklamaz. İndirilen JSON dosyası AES-GCM ile şifrelenir ve değiştirilmemelidir. Dosyanın dış manifesti uygulama sürümü, PBKDF2-SHA-256 parametreleri, checksum ve ECDSA imzasını taşır; kayıt içerikleri yalnızca doğru parola ile açılır.

Dosya manager laptopuna USB bellek veya güvenilir bir yerel aktarım yöntemiyle gönderilir. Manager, aynı yedek parolasını **Yedek parolası** alanına girerek dosyaları seçer; yanlış parola, eski plaintext format veya imza/checksum hatası olan dosyalar yazılmadan reddedilir. Yedeklerin en az iki kopyası tutulmalıdır: manager laptopu ve fiziksel olarak ayrı bir harici disk. Aynı laptopta tek kopya tutmak yedek sayılmaz.

## Manager birleştirme prosedürü

Manager **Yedekleri birleştir** ekranında üç JSON dosyasını birlikte seçer. Sistem önce dosyaları parse eder ve checksum/imza doğrulaması yapar. Geçersiz dosyalar yazılmaz. Doğrulama sonucu önizlemede dosya adı, cihaz, kullanıcı, kayıt sayısı ve tarih görünür.

Yeni kayıtlar ve olası çakışmalar listelenmeden önce hiçbir yeni kayıt manager deposuna yazılmaz. Çakışma varsa manager, kaydı inceleyip dosyalardan birini düzeltmeden **Manifestleri onayla ve kayıtları yaz** düğmesine basmamalıdır.

Onay sırasında mevcut manager kayıtlarının rollback snapshot’ı alınır. Ardından yeni kayıtlar yazılır ve aynı parola ile birleşik şifreli ana yedek otomatik olarak indirilir. Ana yedek, haftalık arşiv klasöründe tarihli şekilde saklanmalıdır. Yedek oluşturma, doğrulama ve kayıt uygulama olayları cihazdaki parola içermeyen audit günlüğüne eklenir.

## Rollback

Birleştirme sonrası beklenmeyen sonuç görülürse manager ekranındaki **Rollback noktasını geri yükle** düğmesi kullanılır. Bu işlem birleştirme öncesi snapshot’ı manager cihazındaki yerel depoya geri yazar. Rollback öncesinde indirilen birleşik ana yedek ayrıca korunmalıdır.

Rollback işleminden sonra yeni bir ana yedek oluşturulmalı ve olay ofis audit notuna yazılmalıdır. Rollback, iki laptopta sonradan yapılan değişiklikleri otomatik olarak çözmez; yalnızca manager cihazındaki son birleştirme öncesi görüntüyü geri getirir.

## Kayıt disiplinleri

Kira/vergi vadesi için vade tarihi; tahliye bildirimi için tahliye veya ihbar tarihi; mülk sahibi onayı için onay durumu; ön muhasebe için tutar ve açıklama alanı doldurulmalıdır. Mülk sahibi onayı alınmadan yeni kiralama ilanı veya pazarlama süreci başlatılmamalıdır.

## Merkezi server hatırlatıcıları

Merkezi HTTPS sürümü yayınlandıktan sonra manager veya danışman, uygulamanın scheduler prosedürüyle 6 alanlı UTC Heartbeat görevi oluşturabilir. Callback yolu `/api/scheduled/reminders` olarak sabittir; görev UID’si reminder preferences kaydında tutulur. Handler yalnızca platformun cron kimliğini kabul eder, kullanıcı tercihindeki lead günlerini uygular ve aynı gün/kayıt kümesi için run-key ile tekrarlı bildirimleri önler. Scheduler kodu deploy edilmeden çalıştırılamaz; deploy sonrasında görev oluşturulmalı ve ilk çalıştırma logları kontrol edilmelidir.

## Bulut/server geçişi

Bulut server seçildiğinde laptop yedekleri doğrudan veritabanı üzerine yazılmamalıdır. Önce her yedek ayrı bir import paketi olarak alınmalı, manifest ve checksum doğrulanmalı, kayıt kimlikleri ve cihaz/kullanıcı metadata’sı korunmalıdır. Çakışmalar manager onayından sonra çözülmeli ve merkezi servera ilk aktarım öncesinde tam bir ana yedek alınmalıdır.

Bu geçiş sürümü internet olmadan çalışır; ancak henüz üç laptop arasında anlık senkronizasyon sağlamaz. Merkezi servera geçildiğinde yerel yedek alma, checksum ve kontrollü import mantığı veri taşıma için korunabilir.

## Logo ve doküman kimliği

Offline kabukta uygulama adı **Global 1881 Gayrimenkul — Offline Ofis Yönetimi** olarak görünür. Web arayüzü ve yazdırılabilir sözleşme başlığı yatay logo ile çalışır: `/manus-storage/01_logo_yatay_6b31c4b8.webp`. Sözleşme çıktısındaki opsiyonel mühür dosyası `/manus-storage/21_muhur_seffaf_9a34c4d4.png` yolundadır.

Bu varlıkların proje dışı kalıcı kopyaları `/home/ubuntu/webdev-static-assets/global1881/01_logo_yatay.webp` ve `/home/ubuntu/webdev-static-assets/global1881/21_muhur_seffaf.png` altında tutulur. Yeniden üretimde dosyalar `manus-upload-file --webdev` ile yüklenir ve dönen storage yolları arayüz kodunda korunur. Electron kabuğunda pencere adı ve uygulama adı aynı marka ile ayarlanmıştır; uygulama klasörü yeniden paketlendiğinde bu branding kaynaklardan yeniden üretilir.

## Bilinen teknik not

Kaynak projede Electron Windows paketleme yapılandırması bulunur. Linux geliştirme ortamında NSIS kurulum dosyası üretimi için Wine gerekebilir. Windows ortamında paketleme yapıldığında kullanıcıya kurulum dosyası veya `win-unpacked` klasörü verilebilir. Her laptopa aynı uygulama sürümü kurulmalı ve uygulama güncellenmeden önce mevcut yedek alınmalıdır.

## Manus klasörü ile Windows dağıtım paketi arasındaki fark

Manus klasörü, projenin kaynak kodu ve geliştirme çalışma alanıdır; diğer çalışanların bilgisayarlarına bu klasörün tamamı gönderilmemelidir. Çalışanlara gönderilecek dosya, Electron Builder tarafından üretilen tek Windows kurulum dosyasıdır. Proje sahibi veya teknik hazırlığı yapan kişi, Windows ortamında proje klasöründe `pnpm install`, ardından `pnpm desktop:installer` komutlarını çalıştırır. Oluşan `release/Global1881-Ofis-Offline-v1.0.2-FINAL.exe` dosyası çalışanlara güvenilir bir USB, kurum içi paylaşım klasörü veya güvenli dosya aktarımıyla iletilir.

Kurulum sırasında çalışan, `.exe` dosyasını açar; kurulum konumunu seçebilir ve masaüstü kısayolunu oluşturabilir. Kurulum tamamlandıktan sonra uygulama Manus klasöründen bağımsız çalışır. Her laptopta uygulama bir kez kurulur, Offline çalışma alanında benzersiz kullanıcı kodu ve cihaz kimliği kaydedilir. Çalışanlar haftalık JSON yedeklerini yalnızca managerın belirlediği aktarım yöntemiyle gönderir; kaynak kod, `node_modules`, `dist` veya `.env` dosyaları paylaşılmaz.

Linux geliştirme sandboxında Windows NSIS dosyası üretimi Wine gerektirebilir. Bu nedenle en güvenilir yöntem, aynı proje sürümünü Windows 10/11 üzerinde açıp `pnpm install` ve `pnpm desktop:installer` komutlarını çalıştırmaktır. Alternatif olarak `pnpm desktop:build` ile `release/win-unpacked` klasörü oluşturulabilir; bu klasör kurulum dosyası yerine taşınabilir uygulama klasörü olarak kullanılabilir, ancak çalışanlara dağıtım için NSIS `.exe` dosyası tercih edilir.

## Tek tıklamayla kurulum paketi üretme

ZIP dosyası çıkarıldıktan sonra proje klasörünün içinde `WINDOWS-KURULUM.bat` ve `WINDOWS-KURULUM.ps1` dosyaları bulunur. Windows kullanıcısı `WINDOWS-KURULUM.bat` dosyasına çift tıklayarak işlemi başlatabilir. Script, ZIP içindeki `package.json` dosyasını arar, doğru proje klasörüne geçer, Node.js ve pnpm durumunu kontrol eder, bağımlılıkları kurar, TypeScript kontrolünü çalıştırır ve `pnpm desktop:installer` komutuyla Windows kurulum paketini üretir.

İşlem başarılı olursa proje klasöründe `release` klasörü oluşur ve içindeki `.exe` dosyası çalışanlara dağıtılabilir. Script hata verirse kırmızı hata mesajını okuyun; Node.js eksikliği, pnpm hazırlanamaması veya proje dosyalarının eksik çıkarılması en yaygın nedenlerdir. Hata metni teknik sorumluya gönderilmelidir. Script yönetici yetkisi gerektirmeden çalışacak şekilde tasarlanmıştır; ancak Node.js veya Corepack kurulumu Windows tarafından engellenirse PowerShell’in yönetici olarak açılması gerekebilir.

Bu otomasyon yalnızca kurulum paketi üretir. Çalışanlar için dağıtılacak dosya yine yalnızca `release` klasöründeki `.exe` dosyasıdır; Manus kaynak klasörü, `.env`, `node_modules` ve proje kaynak kodu paylaşılmamalıdır.

### Corepack EPERM hatası için güncel davranış

Bazı Windows kurulumlarında `pnpm` sistemde bulunmadığında Corepack, `C:\Program Files\nodejs` içine dosya yazmaya çalışarak `EPERM: operation not permitted` hatası verebilir. Güncel `WINDOWS-KURULUM.ps1` artık Corepack’i zorunlu tutmaz; `pnpm` bulunamazsa Node.js ile gelen `npx` üzerinden `pnpm@10.4.1` sürümünü geçici olarak çalıştırır. Bu nedenle script normal kullanıcı yetkisiyle çalışabilir.

Bu fallback’in kullanılabilmesi için yalnızca Windows Node.js LTS kurulumu ve internet bağlantısı gerekir. `npx` de bulunamıyorsa Node.js LTS kurulumu eksiktir. Script yine çalışmazsa PowerShell’i kapatıp yeniden açın ve `WINDOWS-KURULUM.bat` dosyasını tekrar çalıştırın. İsteğe bağlı olarak `pnpm` bir kez yönetici PowerShell ile kurulabilir; ancak bu artık zorunlu değildir.

## Boş Electron penceresi için düzeltme

Eski Windows paketinde Electron `file://` üzerinden açılan HTML’in `/assets/...` biçimindeki mutlak JavaScript ve CSS yollarını çözememesi boş veya menüsüz bir pencereye yol açabilir. Güncel kaynakta Vite üretim tabanı `./` olarak ayarlanmış, manifest ve favicon yolları da göreli hale getirilmiştir. Üretim HTML’i artık `./assets/...` yollarını kullanır ve geliştirme debug scriptini paketlenmiş uygulamaya eklemez.

Bu düzeltmeden sonra eski `.exe` dosyası otomatik olarak güncellenmez. Yeni checkpoint’ten indirilen proje ZIP’iyle `WINDOWS-KURULUM.bat` dosyasını tekrar çalıştırarak yeni bir `.exe` üretin. Önce eski sürümü kaldırmanız gerekmez; yeni kurulum sırasında aynı kurulum konumunu seçebilirsiniz. Yeni kurulumdan sonra uygulama açıldığında Global 1881 menüsü, dashboard ve Offline çalışma alanı görünmelidir.

### PowerShell `npx.ps1` engellemesi

PowerShell, bazı Windows güvenlik ayarlarında `npx.ps1 cannot be loaded because running scripts is disabled` mesajıyla `npx` komutunu engelleyebilir. Güncel kurulum scripti bu sorunu aşmak için `npx.cmd` kullanır; bu nedenle Execution Policy’yi gevşetmek veya `Set-ExecutionPolicy` çalıştırmak gerekmez. Manuel test yapılacaksa da `npx` yerine `npx.cmd` yazılmalıdır.

## Electron offline uygulamasında sign-in ekranı

Windows Electron uygulaması merkezi web dashboard’undan ayrı çalışır. Güncel sürüm açılışta Manus hesabı istemeden doğrudan yerel Offline çalışma alanını gösterir; kullanıcı cihaz kimliği ve kendi offline kullanıcı kodunu burada tanımlar. `Yedekleri birleştir` sekmesi aynı Electron kabuğunda manager işlemleri için kullanılır.

Chrome veya merkezi web kısayolunda görülen **Sign in to continue** ekranı normaldir; merkezi kayıtlar ve server dashboard’u authentication gerektirir. Eski `.exe` dosyası sign-in ekranında kalabilir. Bu nedenle düzeltmeden sonra güncel checkpoint ZIP’inden yeni `.exe` üretilmelidir.

## 1.0.2 temiz kurulum kontrolü

Güncel Windows paketi `Global1881-Ofis-Offline-v1.0.2-FINAL.exe` adıyla üretilir. Eski `1.0.0` veya `1.0.1` uygulaması kuruluysa Windows Başlat menüsünde veya Ayarlar → Uygulamalar bölümünde görünen eski **1881 Ofis Yönetim** kaydını kaldırın; ardından yalnızca `release` klasöründeki `Global1881-Ofis-Offline-v1.0.2-FINAL.exe` dosyasını çalıştırın. Yeni uygulamanın ilk açılışında `startup.log` içinde `version=1.0.2`, `initialRoute=#/offline` ve `Arayüz yüklendi` satırları bulunmalıdır.

Kurulum scripti artık PowerShell’in `.ps1` komut engellerinden etkilenmemek için sistemde varsa `pnpm.cmd`, yoksa `npx.cmd --yes pnpm@10.4.1` kullanır. Execution Policy değiştirmek veya yönetici olarak PowerShell açmak gerekli değildir.

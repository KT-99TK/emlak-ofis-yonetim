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

Her kullanıcı haftanın son iş gününde **Yedek oluştur** düğmesine basar. İndirilen JSON dosyası değiştirilmemeli ve dosya adı korunmalıdır. Dosya; cihaz, kullanıcı, uygulama sürümü, kayıt sayısı, tarih, SHA-256 checksum ve ECDSA imzası içeren bir manifest taşır.

Dosya manager laptopuna USB bellek veya güvenilir bir yerel aktarım yöntemiyle gönderilir. Yedeklerin en az iki kopyası tutulmalıdır: manager laptopu ve fiziksel olarak ayrı bir harici disk. Aynı laptopta tek kopya tutmak yedek sayılmaz.

## Manager birleştirme prosedürü

Manager **Yedekleri birleştir** ekranında üç JSON dosyasını birlikte seçer. Sistem önce dosyaları parse eder ve checksum/imza doğrulaması yapar. Geçersiz dosyalar yazılmaz. Doğrulama sonucu önizlemede dosya adı, cihaz, kullanıcı, kayıt sayısı ve tarih görünür.

Yeni kayıtlar ve olası çakışmalar listelenmeden önce hiçbir yeni kayıt manager deposuna yazılmaz. Çakışma varsa manager, kaydı inceleyip dosyalardan birini düzeltmeden **Manifestleri onayla ve kayıtları yaz** düğmesine basmamalıdır.

Onay sırasında mevcut manager kayıtlarının rollback snapshot’ı alınır. Ardından yeni kayıtlar yazılır ve birleşik ana yedek otomatik olarak indirilir. Ana yedek, haftalık arşiv klasöründe tarihli şekilde saklanmalıdır.

## Rollback

Birleştirme sonrası beklenmeyen sonuç görülürse manager ekranındaki **Rollback noktasını geri yükle** düğmesi kullanılır. Bu işlem birleştirme öncesi snapshot’ı manager cihazındaki yerel depoya geri yazar. Rollback öncesinde indirilen birleşik ana yedek ayrıca korunmalıdır.

Rollback işleminden sonra yeni bir ana yedek oluşturulmalı ve olay ofis audit notuna yazılmalıdır. Rollback, iki laptopta sonradan yapılan değişiklikleri otomatik olarak çözmez; yalnızca manager cihazındaki son birleştirme öncesi görüntüyü geri getirir.

## Kayıt disiplinleri

Kira/vergi vadesi için vade tarihi; tahliye bildirimi için tahliye veya ihbar tarihi; mülk sahibi onayı için onay durumu; ön muhasebe için tutar ve açıklama alanı doldurulmalıdır. Mülk sahibi onayı alınmadan yeni kiralama ilanı veya pazarlama süreci başlatılmamalıdır.

## Bulut/server geçişi

Bulut server seçildiğinde laptop yedekleri doğrudan veritabanı üzerine yazılmamalıdır. Önce her yedek ayrı bir import paketi olarak alınmalı, manifest ve checksum doğrulanmalı, kayıt kimlikleri ve cihaz/kullanıcı metadata’sı korunmalıdır. Çakışmalar manager onayından sonra çözülmeli ve merkezi servera ilk aktarım öncesinde tam bir ana yedek alınmalıdır.

Bu geçiş sürümü internet olmadan çalışır; ancak henüz üç laptop arasında anlık senkronizasyon sağlamaz. Merkezi servera geçildiğinde yerel yedek alma, checksum ve kontrollü import mantığı veri taşıma için korunabilir.

## Logo ve doküman kimliği

Offline kabukta uygulama adı **Global 1881 Gayrimenkul — Offline Ofis Yönetimi** olarak görünür. Web arayüzü ve yazdırılabilir sözleşme başlığı yatay logo ile çalışır: `/manus-storage/01_logo_yatay_6b31c4b8.webp`. Sözleşme çıktısındaki opsiyonel mühür dosyası `/manus-storage/21_muhur_seffaf_9a34c4d4.png` yolundadır.

Bu varlıkların proje dışı kalıcı kopyaları `/home/ubuntu/webdev-static-assets/global1881/01_logo_yatay.webp` ve `/home/ubuntu/webdev-static-assets/global1881/21_muhur_seffaf.png` altında tutulur. Yeniden üretimde dosyalar `manus-upload-file --webdev` ile yüklenir ve dönen storage yolları arayüz kodunda korunur. Electron kabuğunda pencere adı ve uygulama adı aynı marka ile ayarlanmıştır; uygulama klasörü yeniden paketlendiğinde bu branding kaynaklardan yeniden üretilir.

## Bilinen teknik not

Kaynak projede Electron Windows paketleme yapılandırması bulunur. Linux geliştirme ortamında NSIS kurulum dosyası üretimi için Wine gerekebilir. Windows ortamında paketleme yapıldığında kullanıcıya kurulum dosyası veya `win-unpacked` klasörü verilebilir. Her laptopa aynı uygulama sürümü kurulmalı ve uygulama güncellenmeden önce mevcut yedek alınmalıdır.

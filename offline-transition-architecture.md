# Windows Offline Geçiş Sürümü

## Amaç

Geçiş döneminde üç Windows 10/11 laptopunun internet olmadan bağımsız çalışabilmesi; her kullanıcının kendi yerel kayıtlarını tutması; manager laptopunda haftalık yedeklerin doğrulanıp kontrollü biçimde birleştirilmesi; daha sonra aynı veri modelinin merkezi servera aktarılabilmesi.

## Çalışma modeli

Her cihaz kendi yerel IndexedDB deposunda çalışır. Bu seçim, Windows Electron paketi içinde ek native veritabanı kurulumuna ihtiyaç bırakmadan offline çalışmayı sağlar. Laptoplar arasında canlı ağ senkronizasyonu yapılmaz. Kullanıcılar sözleşme, müşteri, mülk, kira/vergi vadesi, tahliye bildirimi, mülk sahibi onayı ve ön muhasebe kayıtlarını offline olarak girebilir.

Her kayıt için cihaz kimliği, yerel kayıt kimliği, değişiklik zamanı, değişiklik yapan kullanıcı ve kayıt sürümü tutulur. Kayıtların üzerinde doğrudan yazma yerine olay veya değişiklik bilgisi saklanır; bu sayede manager cihazında hangi bilgisayardan hangi değişikliğin geldiği izlenebilir.

## Yedek ve birleştirme

Haftalık yedek, tek bir ham veritabanı kopyası olarak değil, şifreli ve bütünlük özeti bulunan bir aktarım paketi olarak oluşturulur. Paket; cihaz kimliği, kullanıcı, uygulama sürümü, veri şeması sürümü, oluşturulma zamanı ve checksum bilgilerini içerir.

Manager laptopu üç paketi içe almadan önce imza/checksum doğrulaması yapar. Yeni ve yalnızca bir cihazda bulunan kayıtlar otomatik olarak eklenebilir. Aynı kaydın iki cihazda değiştirilmesi durumunda sistem son değişikliği sessizce seçmez; çakışma ekranında iki sürümü gösterir ve manager seçimini audit kaydına yazar.

Birleştirme başlamadan önce manager veritabanının geri alma noktası oluşturulur. Başarısız veya hatalı birleştirme, önceki geri alma noktasına döndürülebilir.

## Kira ve tahliye akışı

Kira sözleşmesinde başlangıç, bitiş, tahliye tarihi, ihbar süresi, kira ödeme günü ve sözleşmeye özel bildirim kuralı tutulur. Varsayılan bildirim 60 gün önce başlar; ofis isterse 90, 30, 14, 7, 3 ve 1 gün gibi kademeleri değiştirebilir.

Tahliye yaklaşan kayıtlar görev listesine düşer. Yeniden kiralama ilanı, mülk sahibi onayı alınmadan aktif hale gelemez. Onay, ret, tarih, açıklama ve onaylayan kullanıcı bilgisi audit kaydında tutulur.

## Gelecekte merkezi servera geçiş

Yerel cihaz verileri servera doğrudan kopyalanmaz. Önce cihaz paketleri şema sürümü ve checksum ile doğrulanır, çakışmalar çözülür, tek bir birleşik aktarım paketi hazırlanır ve server içe aktarma işlemi manager onayıyla gerçekleştirilir. Bu yaklaşım, geçiş sırasında aynı müşteri veya sözleşmenin çoğalmasını ve eski bir yedeğin yeni veriyi ezmesini önler.

## Operasyon kuralı

Her kullanıcı kendi laptopunda çalışır. Haftalık yedek alındıktan sonra yedek dosyası manager laptopuna aktarılır. Yedek dosyaları tek kopya olarak tutulmaz; manager laptopu yanında harici disk veya ayrı bir güvenli kopya bulundurulur. IndexedDB verisi işletim sistemi profili içinde tutulur; laptoplar arasında ortak klasörden canlı veri açılmaz.

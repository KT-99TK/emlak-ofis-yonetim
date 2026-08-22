# 1881 Ofis — Windows Offline Geçiş Paketi

Bu klasör, Windows 10/11 üzerinde internet olmadan çalışacak geçiş sürümünün kaynak ve paketleme alanıdır. Üç laptopun her birinde ayrı yerel veri bulunur; laptoplar arasında ortak SQLite dosyası kullanılmaz.

## Cihaz rolleri

- `consultant-01`: danışman laptopu
- `consultant-02`: danışman laptopu
- `manager-01`: manager laptopu; yedek doğrulama ve birleştirme işlemlerinin yapıldığı cihaz

Kurulum sırasında cihaz kimliği bir kez oluşturulur ve her yerel kayda eklenir. Aynı kurulum klasörü üç cihaza kopyalanmamalıdır; cihaz kimlikleri çakışmamalıdır.

## Offline veri kuralları

Uygulama internet olmadan açılır. Müşteri, mülk, sözleşme, tahliye bildirimi, mülk sahibi onayı, kira/vergi vadesi, tahsilat ve ödeme kayıtları yerel veritabanına yazılır. Kullanıcı bilgisayarındaki yedek klasörü uygulamanın canlı veritabanı olarak kullanılmaz.

## Haftalık yedek akışı

Kullanıcı uygulamadaki **Yedek oluştur** düğmesiyle tarihli ve checksum içeren bir paket üretir. Paket manager laptopuna USB, yerel ağ veya güvenli dosya aktarımıyla taşınır. Manager paketi içe almadan önce doğrular ve çakışma varsa karar verir. Birleştirme öncesi otomatik geri alma noktası oluşturulur.

## Gelecekte servera taşıma

Birleştirilmiş manager verisi, server içe aktarma formatıyla uyumlu tutulur. Servera geçişte ham uygulama klasörü kopyalanmaz; doğrulanmış ve tekilleştirilmiş aktarım paketi kullanılır.

## Kullanım sınırı

Aynı müşteri, mülk veya sözleşmenin iki cihazda aynı anda değiştirildiği durumlarda otomatik seçim yapılmaz. Manager birleştirme ekranında hangi sürümün korunacağını seçer. Bu karar audit kaydına yazılır.

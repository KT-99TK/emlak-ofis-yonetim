# TLS/Preview Incident — 11.09.2026

Kullanıcının mobil Chrome ekran görüntüsü `https://emlakdash-kcw9r85v.manus.space/` için `ERR_SSL_PROTOCOL_ERROR` gösteriyor.

Aynı oturumda sandbox üzerinden yapılan pasif karşılaştırmada hem canlı alan adı hem de dev preview HTTPS ile açıldı ve Global 1881 danışman giriş ekranı HTTP uygulama içeriğiyle yüklendi:

- Live: `https://emlakdash-kcw9r85v.manus.space/`
- Dev preview: `https://3000-ikccu90qnp1n3fpc3fdl3-28099f3d.sg2.manus.computer/`

Bu kanıt, uygulama bundle’ının ve sunucu içeriğinin çalıştığını; mobil cihazdaki hatanın en azından zaman/ağ/operatör bağımlı olabileceğini gösterir. Kullanıcı tarafındaki hata kalıcı biçimde çözülmüş kabul edilmemelidir. Uygulama kodu değiştirilmeden TLS/alan adı katmanında teşhis sürdürülmelidir.

## Kabul sınırı

Kullanıcının mobil ağında veya Wi‑Fi’ında aynı anlık hata yeniden üretilemediği için kesin kök neden ilan edilmemelidir. Sonraki kanıt: tam tarih-saat, saat dilimi, bağlantı türü, alan adı ve mümkünse farklı operatör/Wi‑Fi sonucu.

## Güvenlik

Bu incelemede parola, kullanıcı girişi veya veri değişikliği yapılmadı.


## Yeni kullanıcı kanıtı — 11:07 Türkiye saati

Kullanıcı Wi‑Fi’yi kapatıp GSM/4.5G üzerinden aynı canlı alan adını denedi. Sonuç `ERR_CONNECTION_RESET` ve “The connection was reset” oldu. Bu, önceki Wi‑Fi denemesindeki `ERR_SSL_PROTOCOL_ERROR` ile birlikte değerlendirildiğinde sorunun yalnızca tek bir ofis Wi‑Fi ağına özgü olmadığını gösterir. Ancak farklı GSM operatörü veya alternatif alan adı testi olmadan platform/operatör kök nedeni kesinleştirilmemelidir.

Bu denemede uygulama ekranı yüklenmedi ve herhangi bir kullanıcı girişi veya veri işlemi yapılmadı. Uygulama kodu değiştirilmedi.

## Tekrarlanan canlı alan adı kanıtı — 11:17 Türkiye saati

Kullanıcı, Chrome geçmişini temizledikten sonra dev preview adresini GSM üzerinden açabildi ve Global 1881 danışman giriş ekranını gördü. Aynı GSM bağlantısı ile canlı `https://emlakdash-kcw9r85v.manus.space/` adresine geçildiğinde tekrar `ERR_CONNECTION_RESET` oluştu.

Bu karşılaştırma, cihaz/GSM bağlantısının genel olarak çalıştığını ve sorunun canlı `manus.space` alan adının erişim yoluna özgü olabileceğini güçlendirir. Yine de platform edge tarafında anlık durum değişikliği ihtimali devam eder. Uygulama kodu, veritabanı ve kullanıcı verileri değiştirilmedi.

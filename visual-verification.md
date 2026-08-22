# Görsel doğrulama notları

- `/offline`: merkezi HTTPS kullanımında IndexedDB yazımının kapalı olduğu açık ve okunabilir biçimde gösteriliyor.
- `/offline-merge`: manager yedek doğrulama alanı ve checksum/ECDSA açıklaması görünür; dosya seçilmeden boş durum temiz.
- `/obligations`: dönem, portföy, danışman, ödeme durumu kırılımları ile mali tablo boş durum mesajı görünür.
- `/properties`: merkezi portföy ekranı responsive yerleşimde çalışıyor.
- Electron dışında gerçek offline manifest önizlemesi browser ekranında gösterilmez; bu akış Windows Electron kabuğu içinde kullanıcı ve cihaz bilgileriyle doğrulanmalıdır.

## Manifest merge route doğrulaması

`/backup-merge` rotası 404 döndü; uygulamanın gerçek route’u `App.tsx` içinde `/offline-merge` olarak tanımlı. `/offline-merge` ekranı manager çalışma alanı, JSON yedek seçimi ve checksum/ECDSA doğrulama açıklamasıyla görsel olarak render edildi. Manifest satırları yüklendiğinde userId, deviceId, exportedAt, sürüm ve iki doğrulama etiketi `data-testid` alanlarıyla görünürdür.

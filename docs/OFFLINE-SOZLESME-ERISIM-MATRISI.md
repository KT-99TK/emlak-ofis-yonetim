# Offline Sözleşme Erişim Matrisi

Bu belge, Global 1881 geçiş yılı offline çalışma modelinde Yetki ve Kira sözleşmelerinin kullanıcı arayüzü görünürlüğünü ve yazdırma yetkisini tanımlar. Her laptop yerel kayıtları tuttuğu için uygulama, görünürlük kuralını hem liste hem de belge önizleme/yazdırma girişinde uygular.

| Kullanıcı bağlamı | Kendi sözleşmesi | Başka danışmanın sözleşmesi | Malik kişisel verisi | A4 önizleme ve yazdırma |
|---|---|---|---|---|
| Sözleşme sahibi / atanmış danışman | Tam görünür | Görünmez; yalnız izinli anonim özet varsa maskeli | Kendi sözleşmesinde tam | Kendi sözleşmesi için izinli |
| Broker manager; yerel manager oturumu açık | Tam görünür | Tam görünür | Gereken operasyon için tam | Tüm sözleşmeler için izinli |
| Ofis asistanı; manager tarafından tanımlanmış cihaz rolü | Tam görünür | Tam görünür | Operasyon gereği tam | Tüm sözleşmeler için izinli |
| Diğer danışman | Kendi sözleşmesinde tam | A4 belgesi açılmaz | Ad, TCKN/VKN, telefon ve adres geri döndürülemez maskeli | Engelli |

> **Uygulama ilkesi:** Yetkisiz danışman için yalnız görsel bulanıklaştırma yeterli değildir. Tam sözleşme snapshot’ı belge önizleme ve yazdırma akışına aktarılmaz; erişim engeli sözleşme seçimi anında uygulanır.

Ofis asistanı rolü yalnız yerel manager doğrulamasından sonra ilgili cihaz için atanabilir. Bu rol, broker manager oturumunun kişi adı göstermeyen ofis istisna görünümünden ayrıdır; rol atama izleri yerel audit kaydında tutulmalıdır.

# Ofis Akışı Görsel Doğrulaması

**Tarih:** 23 Ağustos 2026  
**Kapsam:** Dashboard sağ sütununda rol bazlı Ofis Akışı paneli.

| Görünüm | Sonuç | Bulgu |
|---|---|---|
| 1920 × 1080 masaüstü | Başarılı | Koyu yeşil Ofis Akışı paneli, güncel `DashboardFlowGrid` yapısında ana akış kartının sağında dengeli bir sütunda görünür. Broker manager görünümünde yalnız gecikmiş vade, yedi günlük görünüm, sözleşme işlemi ve açık tahsilat sayıları yer alır; kişi veya müşteri verisi gösterilmez. |
| 768 × 1024 dar görünüm | Başarılı | Güncel grid yapısında panel ana akış kartının altına geçer; metinler, sayaçlar, istisna kutuları ve “Vadeleri aç” eylemi taşmadan erişilebilir kalır. |

Danışman görünümündeki kişisel kayıt isimleri ile kritik giriş popupı, bileşen ve yardımcı fonksiyon testleriyle doğrulanmıştır. Gerçek Electron/Windows kanıtı ayrıca açık doğrulama kalemi olarak korunur.

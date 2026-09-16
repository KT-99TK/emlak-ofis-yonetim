# Records Excel dışa aktarımı görsel doğrulaması — 2026-09-16

`/clients?from_webdev=1` masaüstü görünümünde PDF ve Excel düğmeleri merkezi kayıtlar kartının sağ üstünde yan yana, okunabilir ve filtre satırını taşırmadan yerleşti. Müşteri no/ad araması, aktif/pasif filtresi ve manager danışman kodu filtresi aynı kartta korunuyor.

İlk `/clients` capture’ı route parametresi olmadan başarısız oldu; uygulamanın gerçek `from_webdev=1` route’u ile capture başarılı sonuç verdi. Görsel kontrolde 34 aktif müşteri kaydı ve operasyon kolonları görünür durumda.


# EUR/TL kartı veri kaynağı

Bu projedeki günlük EUR/TL kartı, ECB Data Portal'ın resmi günlük döviz kuru serisini kullanır.

- Resmi açıklama: https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html
- API dokümantasyonu: https://data.ecb.europa.eu/help/api/data
- Kullanılan seri: `EXR/D.TRY.EUR.SP00.A`
- Kullanılan istek: `https://data-api.ecb.europa.eu/service/data/EXR/D.TRY.EUR.SP00.A?lastNObservations=1&format=csvdata`
- Seri, TRY değerini EUR bazında günlük referans kur olarak döndürür.
- ECB sayfası referans kurların genellikle iş günlerinde yaklaşık 16:00 CET civarında güncellendiğini ve işlem amacıyla kullanılmaması gerektiğini belirtir.
- Uygulama bu değeri yalnızca bilgilendirme kartı olarak gösterir; muhasebe, sözleşme veya işlem kuru olarak kullanmaz.
- Uygulama tarafındaki yanıt kısa süreli cache ile kullanılır; kaynak yanıt vermezse kullanıcıya açık hata ve tekrar deneme durumu gösterilir.

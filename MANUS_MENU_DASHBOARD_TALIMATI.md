Bu bundle, senin daha önce başarıyla push ettiğin (origin/main artık `4aa01ae`'de) commit zincirinin üzerine gelen **2 yeni commit**i içeriyor:

- `93a478d` — dokümantasyon dosyası (bundle talimatı), koda dokunmuyor.
- `aaa404d` — asıl iş: menü + Genel Bakış (dashboard) güncellemesi.

## `aaa404d` ne yapıyor
1. **Menü gruplaması**: `DashboardLayout.tsx`'teki düz 12 maddelik menü artık 5 gruba ayrılmış — Günlük / Portföy & Müşteri / Sözleşmeler / Finans / Ofis. Route'lar (URL'ler) değişmedi, sadece sidebar'daki sıralama ve grup başlıkları eklendi.
2. **Döviz kuru şeridi**: `ExchangeRateCard`'a "compact" varyant eklendi, sayfa başlığının yanında ince bir şerit olarak gösteriliyor (önceden büyük ayrı bir karttı).
3. **Bug fix — "Ekip bugün" kartı**: Bu kart önceden `location === "/team"` şartına bağlıydı ama Home sayfası sadece `/` route'unda render oluyor, yani bu kart **hiçbir zaman görünmüyordu**. Artık dashboard'da (ana sayfada) admin rolündeki kullanıcılara gerçekten görünüyor.
4. **"Son hareketler" artık gerçek veri**: Önceden sabit/örnek 3 satırlık statik bir listeydi. Artık `summary.recentContracts` ve `summary.recentLedger`'dan (merkezi veritabanından) gerçek zamanlı oluşturuluyor.

## Kapsam dışı (bilinçli olarak bu commit'e dahil edilmedi)
Talepler defteri, yetki süresi otomatik uyarı sistemi, ayrı bir Hakediş/Komisyon modülü, genel arama ve mobil görünüm — bunlar yeni veri modeli/backend gerektiriyor, ayrı bir iş olarak planlanacak. Bu commit sadece mevcut verilerle çalışan, gerçek bir yeniden düzenleme.

## Uygulama adımları
```
git bundle verify manus-menu-dashboard.bundle
git fetch manus-menu-dashboard.bundle refs/heads/main:refs/remotes/manus-tmp2/main
git checkout main
git merge --ff-only refs/remotes/manus-tmp2/main
```
`--ff-only` başarısız olursa (origin/main bu bundle'ın temel aldığı `4aa01ae`'den sonra ayrıca ilerlemişse), bana haber ver, bundle'ı güncel uca göre yeniden üretirim.

## Sonrası (aynı süreç)
1. `npx tsc --noEmit` ve `npx vitest run` — 399/401 test geçmeli, 2 bilinen önceden var olan hata dışında (`MultiPropertyIntakeForm`, `OfflineWorkspace`).
2. Push et, deploy et.
3. Canlıda tarayıcıdan kontrol et: sidebar'da 5 grup başlığı görünüyor mu (Günlük / Portföy & Müşteri / Sözleşmeler / Finans / Ofis); ana sayfada üstte döviz kuru şeridi var mı; admin olarak girince "Ekip bugün" kartı görünüyor mu; "Son hareketler" kartında sabit örnek metinler değil gerçek sözleşme/tahsilat kayıtları görünüyor mu (veya sistemde hiç kayıt yoksa "Henüz kayıtlı hareket yok" mesajı).

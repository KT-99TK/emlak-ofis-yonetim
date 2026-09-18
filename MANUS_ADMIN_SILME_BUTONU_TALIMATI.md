# Manus için talimat: Admin için müşteri/portföy kalıcı silme

## Bağlam

Kazım, test veya yanlışlıkla oluşturulmuş müşteri (alıcı) ve portföy
kayıtlarını temizleyebilmek için bir silme düğmesi istedi; bu yetkinin
yalnızca manager/broker'da olmasını, danışmanların yanlışlıkla müşteri
silememesini özellikle vurguladı.

**Not:** Bu sistemde "manager/broker" yetkisi zaten `role === "admin"`
alanıyla temsil ediliyor (`isManager()` fonksiyonu tam olarak bunu
kontrol ediyor, `getCentralAccessScope` da admin'i "broker_manager"
kapsamına eşliyor). Danışmanlar veritabanında her zaman `role: "user"`.
Yani admin-only kısıtı, Kazım'ın istediği "yalnızca manager/broker"
kısıtıyla zaten birebir örtüşüyor — ayrı bir rol eklemeye gerek kalmadı.

## Değişen dosyalar

1. **`server/db.ts`** — `deleteClient` ve `deleteProperty` fonksiyonları
   eklendi. Silmeden önce ilgili kayda bağlı sözleşme, finans hareketi
   (ledgerEntries), kira/vergi yükümlülüğü, aktif kiralama özeti,
   sözleşme belgesi, portföy yetki devri, kira hizmet görevi, gelir
   vergisi profili gibi tabloları sayıyor; herhangi biri > 0 ise silme
   **engelleniyor** ve hangi kayıt türünden kaç adet bağlı olduğunu
   söyleyen Türkçe bir hata dönüyor. Böylece gerçek iş verisi olan bir
   müşteri/portföy yanlışlıkla silinemez — yalnızca hiçbir bağlı kaydı
   olmayan (tipik olarak test amaçlı oluşturulmuş) kayıtlar silinebilir.
   Başarılı silme `auditLogs` tablosuna kaydediliyor (kim, ne zaman,
   hangi kayıt).

2. **`server/routers.ts`** — `clients.delete` ve `properties.delete`
   mutasyonları `adminProcedure` ile korunuyor: yalnızca `role === "admin"`
   olan kullanıcılar çağırabilir, sunucu tarafında zorunlu kılınıyor
   (arayüzdeki düğme gizlense bile danışman bu uç noktayı doğrudan
   çağıramaz).

3. **`client/src/pages/Records.tsx`** — Müşteriler ve Portföy
   sayfalarındaki kayıt kartlarında, yalnızca `user?.role === "admin"`
   olduğunda görünen kırmızı "Sil" düğmesi eklendi. Tıklanınca "bu işlem
   geri alınamaz" uyarılı bir onay penceresi açılıyor; bağlı kayıt varsa
   sunucudan dönen hata mesajı burada gösteriliyor.

## Nasıl uygulanır

```bash
git bundle verify manus-admin-silme-butonu.bundle
git fetch manus-admin-silme-butonu.bundle refs/heads/main:refs/remotes/tmp-silme/main
git checkout main
git merge --ff-only refs/remotes/tmp-silme/main

npx tsc --noEmit
npx vitest run
# Beklenen: 405/407 (kalan 2 hata önceden var olan, ilgisiz)

# Lütfen bu sefer de birikmiş checkpoint'lerle birlikte gerçekten push edip
# canlıya deploy edin (önceki talimatta da vurgulamıştık).
```

## Manuel kontrol

- Admin hesabıyla giriş yapıp Müşteriler sayfasında bir test kaydına
  "Sil" ile tıklayın; onay penceresinden "Kalıcı olarak sil"e basınca
  kayıt listeden kaybolmalı.
- Bağlı sözleşmesi/portföyü olan gerçek bir müşteride "Sil" denenirse,
  kırmızı bir hata mesajıyla hangi kayıtların engellediği görünmeli,
  kayıt silinmemeli.
- Danışman (admin olmayan) hesabıyla giriş yapıldığında "Sil" düğmesinin
  hiç görünmediğini doğrulayın.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RxQyQkHTTfL7QZUKyJjdB6

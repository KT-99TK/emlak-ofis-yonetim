# Manus için talimat: Buton kontrast düzeltmesi + "Mülk başlığı" açıklaması

## Bağlam

Kazım, canlıdaki Portföy sayfasından bir ekran görüntüsü paylaşarak "yeni
kayıt ve girişlere ait butonlar neden aktif değil" diye sordu. Ekran
görüntüsünde "Mülk başlığı" alanı boştu ve "Yeni kayıt" butonu soluk
görünüyordu.

## İnceleme sonucu

Buton aslında **doğru çalışıyordu**: "Mülk başlığı" zorunlu bir alan ve
boşken buton bilerek devre dışı bırakılıyor (`disabled={!value.trim()}`).
Gerçek sorun işlevsel değil, görselti: paylaşılan `Button` bileşeninin
devre dışı arka plan rengi (`#6f8d83`, soluk yeşil) aktif renge
(`#173e39`, koyu orman yeşili) çok yakındı — bu yüzden buton "bozuk/tepkisiz"
gibi algılanıyordu.

Ayrıca Kazım ayrıca "Mülk başlığı" ifadesinin ne anlama geldiğini net
görmediğini belirtti; alan adı teknik kalmış, örnek/ipucu yoktu.

## Değişen dosyalar ve ne düzeltildi

1. **`client/src/components/ui/button.tsx`** — `default` varyantındaki
   devre dışı arka plan rengi `#6f8d83` → `#697068` olarak değiştirildi.
   Bu renk, beyaz metinle WCAG AA kontrastını korurken (5.1:1, hesaplandı)
   aktif koyu yeşilden belirgin şekilde ayrışan, gri tonlu bir renk. Bu
   **paylaşılan bileşen** olduğu için düzeltme uygulamadaki **tüm** devre
   dışı butonları etkiler (yalnızca Portföy sayfası değil — Müşteriler,
   Ön muhasebe, Sözleşmeler, vb. her yerdeki "zorunlu alan boşken devre
   dışı" butonlar artık net biçimde soluk gri görünecek).

2. **`client/src/pages/Records.tsx`** — Portföy sayfasında (bu sayfa
   Müşteriler/Portföy/Ön muhasebe için ortak bileşen, `kind === "properties"`
   olan hali):
   - "Mülk başlığı" input placeholder'ı kısa bir örnekle güncellendi:
     "Mülk başlığı, örn: 3+1 Daire".
   - Aynı alana fare ile üzerine gelince açılan bir `title` ipucu eklendi
     (uzun örnek: "3+1 Daire – Kadıköy, Caferağa Mah." / "Ofis No:5 –
     Şişli Plaza").
   - Formun hemen üstüne, yalnızca Portföy sayfasında görünen kısa bir
     açıklama satırı eklendi: "Mülk başlığı, portföyü listede tanımlayan
     kısa isimdir. Örnek: "3+1 Daire – Kadıköy, Caferağa Mah." veya
     "Ofis No:5 – Şişli Plaza"."

## Not: Aktif Kiralamalar tablo genişliği

Bu bundle, sizin daha önce bağımsız olarak yaptığınız Aktif Kiralamalar
tablo genişliği düzeltmesi (checkpoint `584a33c`, `min-w-[950px]` ve
`whitespace-nowrap` kaldırma) üzerine inşa edildi; o değişikliğe hiç
dokunulmadı.

## Nasıl uygulanır

```bash
git bundle verify manus-buton-kontrast-mulk-basligi.bundle
git fetch manus-buton-kontrast-mulk-basligi.bundle refs/heads/main:refs/remotes/tmp-buton/main
git checkout main
git merge --ff-only refs/remotes/tmp-buton/main

npx tsc --noEmit
npx vitest run
# Beklenen: 403/405 (kalan 2 hata önceden var olan, ilgisiz:
# MultiPropertyIntakeForm.test.ts, OfflineWorkspace.client.test.tsx)

# push + deploy her zamanki akış
```

## Manuel kontrol

- Portföy sayfasında "Mülk başlığı" alanını boş bırakıp "Yeni kayıt"
  butonuna bakın: buton artık belirgin gri/soluk görünmeli, aktif yeşil
  renkle karıştırılmamalı.
- Aynı sayfada "Mülk başlığı" alanının placeholder'ında kısa örnek
  görünmeli; alanın üstünde açıklama satırı olmalı.
- Müşteriler/Ön muhasebe sayfalarında da zorunlu alan boşken "Yeni kayıt"
  butonunun aynı gri tonda göründüğünü doğrulayın (paylaşılan bileşen
  değişikliği).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RxQyQkHTTfL7QZUKyJjdB6

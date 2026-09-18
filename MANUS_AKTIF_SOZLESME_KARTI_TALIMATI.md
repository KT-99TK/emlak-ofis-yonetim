# Manus için talimat: Genel Bakış'a "Aktif sözleşmeler" kartı ekle

## Bağlam

Daha önceki bir checkpoint'te ("Dashboard'da aktif kiralama/portföy
sayaç kartları eklendi") Genel Bakış sayfasındaki sözleşme sayısı
kartı kaldırılmış, ama `HomeOfficeFlowRoute.client.test.tsx` testi
hâlâ "Aktif sözleşmeler" metnini arıyordu — bu yüzden test kırmızıya
düşmüştü. Kazım'la konuştuk, sözleşme sayısı kartının geri eklenmesini
istedi.

## Değişiklik

`client/src/pages/Home.tsx` — `liveStats` dizisine, merkezi
`dashboard.summary.contracts` değerinden beslenen "Aktif sözleşmeler"
kartı ilk sıraya eklendi (ikon: FileSignature). Diğer 4 kart (Aktif
kiralamalar, Mevcut portföyler, Bekleyen tahsilat, Ekip görünümü)
aynen korundu. Kart grid'i artık 5 kartı düzgün sığdırmak için
`xl:grid-cols-5` kullanıyor (öncesi `xl:grid-cols-4`).

## Nasıl uygulanır

```bash
git bundle verify manus-aktif-sozlesme-karti.bundle
git fetch manus-aktif-sozlesme-karti.bundle refs/heads/main:refs/remotes/tmp-sozlesme/main
git checkout main
git merge --ff-only refs/remotes/tmp-sozlesme/main

npx tsc --noEmit
npx vitest run
# Beklenen: 408/410 (kalan 2 hata önceden var olan, ilgisiz:
# MultiPropertyIntakeForm.test.ts, OfflineWorkspace.client.test.tsx)
```

## Manuel kontrol

Genel Bakış sayfasında üst sayaç şeridinde artık 5 kart olmalı:
Aktif sözleşmeler, Aktif kiralamalar, Mevcut portföyler, Bekleyen
tahsilat, Ekip görünümü.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RxQyQkHTTfL7QZUKyJjdB6

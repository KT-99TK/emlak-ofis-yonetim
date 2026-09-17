# Manus için talimat: Sidebar + Genel Bakış renk paleti güncellemesi

## Ne değişti

Kazım'ın onayladığı yeni renk paletini (koyu orman yeşili + mercan turuncu vurgu) **yalnızca** sol menüye (sidebar) ve Genel Bakış (ana panel) sayfasına uyguladık. Uygulamanın geri kalanı (Portföy, Müşteriler, Sözleşmeler, Ön Muhasebe vb.) kasıtlı olarak dokunulmadan bırakıldı — bu ayrı bir onay gerektirecek.

Fontlar değişmedi: Playfair Display (başlıklar) ve DM Sans (gövde metni) zaten uygulama genelinde yükleniyordu, sadece renkler değişti.

Renk değişiklikleri:
- Koyu yeşil `#173e39` / `#123f39` / `#0f473f` → `#12302A`
- Hover/koyu ton `#20554e` / `#1c6559` / `#315f56` → `#1C4A3F` / `#24463c`
- Altın vurgu `#e6c47d` / `#b99b5a` → mercan turuncu `#D4622A`
- Teal vurgu `#2b786e` → `#2C6B55` (yalnızca sidebar'da)
- Sayfa arka planı `#f7f7f4` → krem `#FAF7F1` (yalnızca Genel Bakış'ta)

Genel Bakış sayfasındaki bazı ikincil/nötr tonlar (`#2b786e` teal, `#8d6f3f` altın-kahve, `#d6ba7b` açık altın) bilerek değiştirilmedi — kapsamı dar tutmak için. İstenirse ayrı bir turda tam tutarlılık sağlanabilir.

Bu bundle ayrıca daha önce hazırlanmış ama henüz aktarılmamış bir "manager-only menü" talimat dosyasını da içeriyor (`MANUS_MANAGER_ONLY_TALIMATI.md`) — o değişiklik zaten canlıda çalışıyor, bu sadece belge kaydı, kod değişikliği yok.

## Değişen dosyalar

- `client/src/components/DashboardLayout.tsx` — sidebar renkleri
- `client/src/components/GlobalBrandLockup.tsx` — sidebar logo/marka bloğu renkleri
- `client/src/pages/Home.tsx` — Genel Bakış sayfası arka planı ve ana yeşil vurgular
- Test dosyaları güncellendi: `DashboardLayout.render.test.tsx`, `DashboardLayout.client.test.tsx`, `DashboardNavigation.test.ts`, `GlobalBrandLockup.test.tsx`

## Nasıl uygulanır

```bash
# 1) Bundle'ı doğrula
git bundle verify manus-color-palette.bundle

# 2) Bundle'dan geçici bir remote-tracking dalı oluştur
git fetch manus-color-palette.bundle refs/heads/main:refs/remotes/tmp-color/main

# 3) main'e geç ve fast-forward merge yap
git checkout main
git merge --ff-only refs/remotes/tmp-color/main

# 4) Doğrulama
npx tsc --noEmit
npx vitest run
# Beklenen: 399/401 test geçmeli (2 bilinen, bu değişiklikle ilgisiz eski hata devam eder:
# MultiPropertyIntakeForm.test.ts ve OfflineWorkspace.client.test.tsx)

# 5) Push + deploy (her zamanki akış)
```

## Manuel kontrol (tarayıcıda)

- Sol menü artık koyu orman yeşili (`#12302A`) arka planlı, aktif menü öğesi aynı koyu yeşil, seçili/hover vurgusu mercan turuncu.
- Genel Bakış sayfasının arka planı krem tonlu (`#FAF7F1`), "Yeni kayıt" butonu ve broker manager kartı koyu yeşil.
- Diğer sayfalar (Portföy, Müşteriler, Sözleşmeler vb.) eski renkleriyle **değişmeden** kalmalı — bu kasıtlı.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RxQyQkHTTfL7QZUKyJjdB6

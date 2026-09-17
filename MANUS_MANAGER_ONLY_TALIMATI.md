Senin push'unla origin/main şu an `aaa404d`'de. Bu bundle onun üzerine gelen 2 yeni commit'i içeriyor:

- `3f26246` — dokümantasyon, koda dokunmuyor.
- `7092af8` — asıl iş: Ekip Yönetimi, Denetim Kayıtları ve Proje Yedekleri menü maddeleri artık yalnız broker manager (admin rolündeki) hesaplara görünüyor; ayrıca `ProjectBackups.tsx` sayfasının kendisine de (daha önce hiç yoktu) `/team` ve `/audit` sayfalarındaki gibi bir "Manager yetkisi gerekli" koruması eklendi.

## Uygulama
```
git bundle verify manus-manager-only-menu.bundle
git fetch manus-manager-only-menu.bundle refs/heads/main:refs/remotes/manus-tmp3/main
git checkout main
git merge --ff-only refs/remotes/manus-tmp3/main
```
`--ff-only` başarısız olursa bana haber ver.

## Sonrası (aynı süreç)
1. `npx tsc --noEmit` ve `npx vitest run` (399/401, 2 bilinen hata hariç).
2. Push + deploy.
3. Canlıda kontrol: danışman hesabıyla girince sidebar'da "Ekip Yönetimi", "Denetim Kayıtları", "Proje Yedekleri" hiç görünmemeli; admin/broker manager hesabıyla girince üçü de görünmeli; danışman hesabıyla doğrudan `/backups` adresine gidilirse "Manager yetkisi gerekli" mesajı çıkmalı.

## Ayrı bir konu — kod değişikliği değil
Ofis sahibi, İbrahim Parin'in de (o da broker) bu üç sayfayı görebilmesini istiyor. Ancak İbrahim Parin'in hesabı şu an "danışman" (consultant) olarak tanımlı, sistemin admin/broker-manager rolünde değil. Bu bir kod değişikliği değil, bir hesap/veri güncellemesi: İbrahim Parin'in kullanıcı kaydındaki `role` alanının `admin` olarak ayarlanması gerekiyor (aynı alan `/team` ve "Online Başlangıç" erişimini de kontrol ediyor). Bunu istersen ayrı olarak Manus'tan (veritabanı erişimiyle) rica edebilirsin.

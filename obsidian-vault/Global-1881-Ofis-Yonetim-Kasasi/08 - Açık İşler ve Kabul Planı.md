---
title: Açık İşler ve Kabul Planı
type: roadmap
updated: 2026-08-24
tags:
  - kabul
  - todo
  - windows
  - mobil
---

# Açık İşler ve Kabul Planı

## Tamamlananlar

Offline Electron altyapısı, şifreli yedek/merge/rollback, kira-yetki sözleşme akışları, vade/vergi/tahliye/ön muhasebe bileşenleri, müşteri arşivi, aktif imzalı belge düzeni ve merkezi mobil PWA MVP’si uygulandı. Son kapsamlı teknik doğrulamada **49 test dosyasında 113 test**, TypeScript denetimi ve üretim derlemesi başarılıdır.

## Üzerinde çalışılanlar

| İş | Sonraki adım |
|---|---|
| `ofis.global1881.com` | Hostinger/DNS erişimi geldikten sonra özel alan adı bağlama hedefini teyit edip yalnız `ofis` kaydını eklemek |
| Merkezi offline → online aktarım | Manager doğrulanmış merge yedeğiyle eşleme önizlemesi, açık onay ve audit tasarımı |
| Merkezi geçmiş arşiv API’si | Aktif imzalı belgeye ek olarak arşiv kategorisinin sahiplik/istemci bağlantılarıyla uygulanması |
| Belge URL güvenlik denetimi | Yetkisiz kullanıcının elde kalmış doğrudan depolama URL’si ile erişemediğinin ayrıca doğrulanması |

## Windows kanıtı bekleyenler

- Gerçek Electron’da yetki/kira A4 önizleme ve baskı; mühür, marj, imza alanları ve seçili ekler.
- DASK, elektrik/su/doğalgaz sayaçları; opak seçiciler ve Yerel kaydet kontrastı.
- Üç laptopla şifreli export, doğrulama, merge, ana yedek ve rollback tatbikatı.
- İşlem kapanışında tahsilat/banka referansı, manager parolası ve istisna akışı.
- Geçmiş PDF örneklerinde sahiplik, müşteri kartı indeksi, checksum ve dosya açma kontrolü.

## Merkezi sunucu dönemi

| Başlık | Kabul ölçütü |
|---|---|
| Özel alan adı | `https://ofis.global1881.com/mobile` adresi Android/iPhone’da geçerli HTTPS ile açılır |
| Aynı canlı veri | Android ve iPhone manager ekranı aynı merkezi kayıtları gösterir |
| Danışman gizliliği | Ayrı danışman hesabı yalnız kendi kayıtlarını ve belgelerini görür |
| Aktif imzalı PDF | Yükleme, SHA-256/audit, açma, silmeme ve manager geçersiz kılma test edilir |
| Kontrollü veri aktarımı | Offline birleşik yedekten onaylı merkezi kayıt eşleme/uygulama/audit yapılır |

## Dış bağımlılık

Özel alan adı için Hostinger hesabındaki DNS erişimi beklenmektedir. `ofis.global1881.com` kaydı henüz oluşturulmamıştır; bu nedenle adresin DNS bulunamadı hatası vermesi beklenir. Bu bekleme merkezi uygulama kodunu veya veri modelini etkilemez.

## İlgili notlar

- [[03 - Windows ve Offline Geçiş]]
- [[04 - Merkezi Mobil ve Alan Adı]]
- [[06 - Belgeler ve Müşteri Arşivi]]
- [[09 - Kasayı Kullanma]]


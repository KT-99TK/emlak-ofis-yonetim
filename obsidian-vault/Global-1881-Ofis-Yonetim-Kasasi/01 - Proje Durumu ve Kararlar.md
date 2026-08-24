---
title: Proje Durumu ve Kararlar
type: overview
updated: 2026-08-24
tags:
  - karar
  - durum
---

# Proje Durumu ve Kararlar

## Hedef

Sistem; broker manager ve danışmanların kira/satış yetki belgelerini, kira sözleşmelerini, müşteri-portföy kayıtlarını, vadeleri, tahsilatları ve işlem kapanışını aynı iş akışında yönetmesi için tasarlandı. Tasarım dili koyu zümrüt, sıcak altın ve krem çalışma yüzeyi ile **Global 1881** kimliğini korur.

## Kesinleşen kararlar

| Karar | Uygulama biçimi | Gerekçe |
|---|---|---|
| Geçiş yılı çalışma modeli | Üç laptopta bağımsız Electron/offline çalışma | Bulut merkezi sisteme geçmeden önce pratik ve kontrollü kullanım |
| Yerel veri güvenliği | IndexedDB, AES-GCM/PBKDF2 şifreli yedek, SHA-256 + ECDSA doğrulama | Veri kaybını ve sahte/bozuk yedek riskini azaltmak |
| Merge yetkisi | Yalnız manager laptopu | Çakışma, yeni ana yedek ve rollback kontrolü |
| Telefon kullanımı | Merkezi online PWA | Telefonların canlı veriye erişebilmesi; laptop verisinin kopyalanmaması |
| Danışman gizliliği | Sahiplik + rol filtreli sorgular | Danışmanlar birbirinin müşteri/PDF/iletişim bilgisini görmez |
| Aktif PDF kuralı | Yükleme serbest, silme/düzenleme kapalı | İmzalı belgenin müşteri dosyasında iz bırakması |
| Geçmiş PDF kuralı | Ayrı, salt-okunur Müşteri Dijital Arşivi | Eski belgelerin vade/finans akışını yanlış etkilememesi |

## Tamamlanan öne çıkanlar

- Yetki ve kira sözleşmeleri için doldurulabilir, A4 baskıya uygun ve çok sayfalı düzen oluşturuldu.
- Kira sözleşmelerinde kefil, tahliye taahhütnamesi, teslim etme/alma ve dinamik demirbaş listesi eklendi.
- DASK poliçe numarası ile elektrik, su ve doğalgaz sayaç alanları sözleşme/ek düzenine bağlandı.
- Tahliye bildirimi, mülk sahibi yeniden kiralama onayı, vade ve vergi takip kuralları oluşturuldu.
- Ön muhasebe, KDV tahsilat kaybı görünümü, sözleşme/finans istatistikleri ve danışman hedefleri eklendi.
- Offline yedek, doğrulama, manager merge ve rollback akışları uygulandı.
- [[06 - Belgeler ve Müşteri Arşivi|Müşteri Dijital Arşivi]] ve aktif imzalı belge modeli ayrıştırıldı.
- [[04 - Merkezi Mobil ve Alan Adı|Merkezi mobil PWA]] ile Android/iPhone deneme ekranı uygulandı.

## Başarı ölçütü

Bir modül yalnız kodu yazıldığında tamam sayılmaz. Birim test, tür denetimi, üretim derlemesi ve gerekiyorsa gerçek Windows/Electron veya telefon kabul kanıtı birlikte aranır. Güncel doğrulama özetleri [[08 - Açık İşler ve Kabul Planı]] içinde bulunur.

## İlgili notlar

- [[02 - Mimari ve Veri Akışı]]
- [[03 - Windows ve Offline Geçiş]]
- [[04 - Merkezi Mobil ve Alan Adı]]
- [[08 - Açık İşler ve Kabul Planı]]


---
title: Güvenlik ve Gizlilik
type: security
updated: 2026-08-24
tags:
  - gizlilik
  - rol-yetki
  - audit
  - belge-guvenligi
---

# Güvenlik ve Gizlilik

## Temel kural

Danışman başka danışmanın müşteri adını, telefonunu, notunu, malik kimliğini/VKN’sini, tam adresini veya tam sözleşmesini görmez. Bu kural liste, arama, A4 önizleme, yazdırma, belge satırı ve mobil erişim dahil bütün yüzeylerde uygulanır.

## Erişim matrisi

| Kullanıcı | Kendi sözleşmesi ve belgesi | Başka danışmanın kaydı | Malik kişisel verisi | A4/PDF açma |
|---|---|---|---|---|
| Sözleşme sahibi danışman | Tam yetkili | Görünmez veya izinli anonim özet | Kendi kaydında tam | Kendi kaydında izinli |
| Broker manager | Operasyon gereği tam | Yetkili kapsam | Gereken kapsamda tam | Yetkili |
| Atanmış ofis asistanı | Operasyon gereği tam | Manager atamasıyla yetkili | Gereken kapsamda tam | Yetkili |
| Diğer danışman | Kendi kaydında tam | Tam veri görünmez | Geri döndürülemez maskeli | Engelli |

> Sadece ekranda bulanıklaştırmak yeterli değildir. Yetkisiz istemciye tam sözleşme snapshot’ı veya belge URL’si verilmez.

## Audit ve bütünlük

- Kritik sözleşme, tahsilat, kapanış ve belge olayları audit kaydı üretir.
- Offline yedeklerde SHA-256 ve ECDSA; merkezi belgelerde SHA-256, dosya anahtarı, boyut ve oluşturucu metadata’sı tutulur.
- Aktif imzalı belgede danışman için silme/düzenleme eylemi ve IPC/API yüzeyi yoktur.
- Manager istisnası **silme** değil; en az 20 karakter gerekçe, `GEÇERSİZ KIL` teyidi ve ikinci onay içeren geçersiz kılmadır.

## İlgili notlar

- [[03 - Windows ve Offline Geçiş]]
- [[04 - Merkezi Mobil ve Alan Adı]]
- [[06 - Belgeler ve Müşteri Arşivi]]


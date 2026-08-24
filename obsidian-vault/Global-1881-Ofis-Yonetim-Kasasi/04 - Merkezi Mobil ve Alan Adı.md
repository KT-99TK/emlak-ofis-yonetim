---
title: Merkezi Mobil ve Alan Adı
type: mobile
updated: 2026-08-24
tags:
  - pwa
  - android
  - ios
  - dns
  - merkezi-sistem
---

# Merkezi Mobil ve Alan Adı

## Uygulanan mobil MVP

`/mobile` rotası Android Chrome ve iPhone Safari üzerinden çalışan bir PWA’dır. Manager için **Ofis Akışı**, danışman için **Size Özel Gündem**, merkezi müşteri/portföy/sözleşme/vade listeleri ile aktif imzalı PDF ekleme/açma alanı bulunur. Manifest, servis çalışanı ve Global 1881 mühür ikonu eklenmiştir.

| Rol | Mobil kapsam |
|---|---|
| Broker manager | Ofis Akışı, yetkili merkezi özet, belge denetimi ve gerekçeli geçersiz kılma |
| Danışman | Yalnız kendi müşteri, portföy, sözleşme, vade ve yetkili belge alanı |
| Ofis asistanı | Manager tarafından atanan operasyon kapsamıyla yetkili erişim |

## Alan adı durumu

Kalıcı hedef adres **`https://ofis.global1881.com/mobile`** olarak planlanmıştır. Bu alt alan adı henüz DNS’de oluşturulmadığından denendiğinde `DNS_PROBE_FINISHED_NXDOMAIN` görülmesi beklenen durumdur. Bu hata mobil koddan değil, DNS kaydının henüz eklenmemesinden kaynaklanır.

Ana WordPress sitesi `global1881.com` korunur. Hostinger tarafında yalnız `ofis` alt alan adı için yeni DNS kaydı eklenecektir; `www` ve ana alan adı kayıtları değiştirilmez. Uygulamanın merkezi veri, API ve belge depolaması WordPress hostinginden bağımsız tutulur.

> Alan adı bağlama için önce hedef platformdaki özel alan adı talebi ve doğrulama bilgileri alınır. Ardından yalnız yetkili Hostinger DNS yöneticisi gerekli kaydı ekler. Değerler teyit edilmeden DNS kaydı tahmin edilmez.

## Telefon kabul sırası

1. Manager Android ve iPhone 13 Pro’da aynı merkezi hesabıyla oturum açar.
2. Her iki cihaz aynı merkezi veriyi gösterir; bir cihazdaki yetkili değişiklik diğerinde yenilemeyle görünür.
3. Ayrı danışman hesabı yalnız kendi müşteri/portföy/sözleşme/PDF satırlarını görür.
4. Danışman en fazla 12 MB imzalı aktif PDF ekler; SHA-256 ve audit görünür, silme yoktur.
5. Manager test belgesini gerekçe + `GEÇERSİZ KIL` teyidi ile geçersiz kılar; dosya/metadata silinmez.

## Dış bağımlılık ve süreklilik

Hostinger erişimi, DNS kaydını eklemek için dış bağımlılıktır. Normal parola sıfırlaması ile hesap kurtarma ve Google sosyal giriş kurtarmasının süreleri farklıdır; resmi bildirim e-postası takip edilir. Süreklilik için ayrı DNS yönetimi, ikinci yetkili erişim ve teknik yedek erişim kaydı planlanır.

## İlgili notlar

- [[02 - Mimari ve Veri Akışı]]
- [[05 - Güvenlik ve Gizlilik]]
- [[06 - Belgeler ve Müşteri Arşivi]]
- [[08 - Açık İşler ve Kabul Planı]]


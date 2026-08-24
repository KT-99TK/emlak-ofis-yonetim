---
title: Global 1881 Ofis Yönetim Sistemi
type: index
status: aktif-geliştirme
updated: 2026-08-24
tags:
  - global1881
  - proje-yonetimi
  - emlak-ofis
---

# Global 1881 Ofis Yönetim Sistemi

Bu kasa, **Global 1881 Gayrimenkul** için geliştirilen ofis yönetim sisteminin kararlarını, uygulanmış modüllerini, güvenlik kurallarını, kabul kanıtlarını ve açık işleri bir araya getirir. Obsidian’da bu klasörü kasa olarak açtıktan sonra notlar arasındaki `[[...]]` bağlantılarıyla gezinebilirsiniz.

> Ana ilke: Geçiş yılında üç Windows laptop bağımsız ve şifreli çalışır. Merkezi dönem başladığında telefonlar ile bilgisayarlar aynı merkezi veriyi, yetki kuralları korunarak kullanır. Yerel laptop verisi telefonlara otomatik kopyalanmaz.

## Hızlı durum

| Alan | Durum | Ana not |
|---|---|---|
| Windows / offline geçiş sürümü | Uygulanmış; gerçek Windows kabul kanıtları devam ediyor | [[03 - Windows ve Offline Geçiş]] |
| Sözleşme, vade, tahsilat, işlem kapanışı | Uygulanmış; saha kabulü bekleyen bölümler var | [[07 - İş Akışları ve Modüller]] |
| Gizlilik ve imzalı belgeler | Uygulanmış; silme yerine denetimli geçersiz kılma | [[05 - Güvenlik ve Gizlilik]] |
| Müşteri Dijital Arşivi | Uygulanmış; örnek PDF kabulü devam ediyor | [[06 - Belgeler ve Müşteri Arşivi]] |
| Mobil PWA / merkezi altyapı | MVP uygulanmış; özel alan adı ve cihaz kabulü bekliyor | [[04 - Merkezi Mobil ve Alan Adı]] |
| Açık işler | Öncelik ve kanıt türüne göre takipte | [[08 - Açık İşler ve Kabul Planı]] |

## Not haritası

1. [[01 - Proje Durumu ve Kararlar]] — kapsam, tamamlananlar ve temel kararlar.
2. [[02 - Mimari ve Veri Akışı]] — offline, merkezi sunucu ve kontrollü aktarım modeli.
3. [[03 - Windows ve Offline Geçiş]] — Electron, yedekleme, merge ve rollback.
4. [[04 - Merkezi Mobil ve Alan Adı]] — Android/iPhone PWA, DNS ve telefon kabulü.
5. [[05 - Güvenlik ve Gizlilik]] — rol matrisi, müşteri verisi, audit ve belge koruması.
6. [[06 - Belgeler ve Müşteri Arşivi]] — aktif imzalı belgeler ile geçmiş arşiv ayrımı.
7. [[07 - İş Akışları ve Modüller]] — sözleşme, vade, vergi, ön muhasebe ve kapanış.
8. [[08 - Açık İşler ve Kabul Planı]] — yapılacaklar ile Windows/merkezi dönem kanıtları.
9. [[09 - Kasayı Kullanma]] — Obsidian kullanım ve güncelleme rehberi.

## Durum bildirimi standardı

İlerleme bu dört başlıkla raporlanır: **Tamamlananlar**, **Üzerinde çalışılanlar**, **Windows kanıtı bekleyenler** ve **Merkezi sunucu dönemi**. Ayrıntılı teknik görev geçmişi proje kaynaklarındaki `todo.md` dosyasında korunur.


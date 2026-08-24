---
title: Mimari ve Veri Akışı
type: architecture
updated: 2026-08-24
tags:
  - mimari
  - offline
  - merkezi-sistem
---

# Mimari ve Veri Akışı

## İki dönemli model

| Dönem | Veri kaynağı | Kullanım biçimi | Senkron yaklaşımı |
|---|---|---|---|
| Geçiş yılı | Her laptopun yerel IndexedDB kaydı | Windows Electron uygulaması | Haftalık şifreli yedek, manager doğrulama ve manuel merge |
| Merkezi dönem | Merkezi MySQL/Drizzle veri modeli ve güvenli dosya depolama | Web/PWA ve sonraki masaüstü/mobil istemciler | Aynı merkezi API üzerinden anlık yetkili erişim |

> Telefonlar offline IndexedDB verisini paylaşmaz. Mobil ekran yalnız merkezi sistemde oluşturulmuş veya manager tarafından kontrollü aktarılmış kayıtları gösterir.

## Offline veri akışı

1. Her danışman kendi Windows laptopunda yerel kayıt üretir.
2. Haftalık şifreli dışa aktarım; cihaz, kullanıcı, sürüm, tarih, checksum ve ECDSA imzası içeren manifestle alınır.
3. Manager laptopu yedekleri önce doğrular, sonra çakışmaları görür ve onaylı merge yapar.
4. Birleşik ana yedek ile rollback noktası oluşturulur.
5. Merkeze geçişte ham klasör değil, doğrulanmış/karar verilmiş kayıtlar aktarılır.

## Merkezi veri modeli

Merkezi uygulama React + TypeScript, tRPC, Express, Drizzle ve MySQL bileşenleriyle çalışır. Kullanıcı/rol, müşteri, portföy, sözleşme, vade, ledger, audit ve belge metadata’sı merkezi kayıttadır. PDF baytları veritabanı BLOB alanında tutulmaz; güvenli dosya depolamada tutulur ve veritabanında yalnız anahtar, checksum, boyut, sahiplik ve audit metadata’sı yer alır.

## Kontrollü offline → merkez aktarımı

Merkezi sisteme aktarım otomatik eşitleme değildir. Manager doğrulanmış birleşik yedekten önce eşleme önizlemesi alır: müşteri, portföy, sözleşme, vade, tahsilat ve belge metadata’sı tek tek incelenir. PDF dosyaları kullanıcı açık onayı olmadan topluca merkezi depolamaya taşınmaz.

## İlgili notlar

- [[03 - Windows ve Offline Geçiş]]
- [[04 - Merkezi Mobil ve Alan Adı]]
- [[05 - Güvenlik ve Gizlilik]]
- [[06 - Belgeler ve Müşteri Arşivi]]


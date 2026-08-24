---
title: Windows ve Offline Geçiş
type: operations
updated: 2026-08-24
tags:
  - windows
  - electron
  - yedekleme
  - merge
---

# Windows ve Offline Geçiş

## Çalışma ortamı

Geçiş sürümü Windows 10/11 üzerinde Electron olarak çalışır. Her cihaz ayrı yerel veri taşır; paketli uygulamada `contextIsolation`, `sandbox` ve daraltılmış preload/IPC yüzeyi kullanılır. Uygulama offline açılır, merkezi web oturumuna yönlenmez.

## Yedek ve geri alma zinciri

| Adım | Kontrol |
|---|---|
| Dışa aktarma | AES-GCM şifreleme, PBKDF2 anahtar türetme, SHA-256 checksum, ECDSA imza |
| Manifest | Cihaz, kullanıcı, sürüm, kayıt sayısı, oluşturulma zamanı, checksum ve imza |
| Önizleme | İçe almadan önce parse/doğrulama ve manifest görünümü |
| Merge | Manager kullanıcı doğrulaması, çakışma görünümü, açık onay |
| Ana yedek | Birleşik kayıttan yeni ana yedek |
| Rollback | Önceki snapshot ile tam eşitleme |

## Windows kabulünde beklenen kanıtlar

- Kurulu sürümün offline çalışma alanına doğrudan açılması ve `startup.log` kaydı.
- Yetki/kira A4 önizlemelerinde mühür, marj, imza kutuları ve seçilmiş eklerin Windows baskı görüntüsü.
- Kayıt türü/filtre açılır listelerinin opak ve okunur görünmesi; Yerel kaydet düğmesi kontrastı.
- Üç laptop yedeklerinin doğrulama, merge, ana yedek ve rollback adımlarının gerçek sahada yapılması.
- Danışman, manager ve atanmış ofis asistanı için [[05 - Güvenlik ve Gizlilik|rol gizliliği]] kontrolü.

## Operasyon kuralı

Danışman laptopları birbirinin veri klasörlerini paylaşmaz. Broker manager, yalnız doğrulanmış yedekleri içe alır; hatalı checksum veya imza kayıtları uygulama tarafından engellenir.

## İlgili notlar

- [[02 - Mimari ve Veri Akışı]]
- [[05 - Güvenlik ve Gizlilik]]
- [[07 - İş Akışları ve Modüller]]
- [[08 - Açık İşler ve Kabul Planı]]


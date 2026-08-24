---
title: Belgeler ve Müşteri Arşivi
type: documents
updated: 2026-08-24
tags:
  - pdf
  - sozlesme
  - arsiv
  - aktif-belge
---

# Belgeler ve Müşteri Arşivi

## İki ayrı belge akışı

| Özellik | Müşteri Dijital Arşivi | Aktif İmzalı Belgeler |
|---|---|---|
| Amaç | Sona ermiş/geçmiş PDF’leri saklamak | Devam eden imzalı kira sözleşmesini müşteri dosyasına eklemek |
| Kayıt türü | `contractArchive` | `activeContractDocument` / merkezi `contractDocuments` |
| Operasyon etkisi | Vade, tahsilat, tahakkuk veya performans oluşturmaz | Mevcut aktif kaydı yalnız belge olarak destekler |
| Yükleme | Manager veya yetkili ofis asistanı | Sözleşme sahibi danışman, kendi aktif/imza teyitli kaydına |
| Silme/değiştirme | Yok | Yok; manager yalnız denetimli geçersiz kılma yapar |

## Geçmiş arşiv kuralları

Eski PDF için sözleşme numarası zorunlu değildir. Ana müşteri, varsa malik/kiracı ilgili tarafları, danışman kodu, belge türü, tarih, geçmiş işlem özeti, dosya adı ve SHA-256 değeri tutulur. Tek PDF hem malik hem kiracı müşteri kartında bulunabilir; aktif sözleşme veya finans kaydı oluşmaz. Liste eski tarihten yeni tarihe sıralanır.

## Aktif imzalı belge kuralı

Danışman, yalnız kendi sahibi olduğu ve taraf imza teyidi bulunan, bitiş tarihi geçmemiş kira sözleşmesine PDF ekleyebilir. Merkezi mobil akış PDF imzasını, en fazla 12 MB sınırını, SHA-256 değerini ve güvenli depolamayı doğrular. Belge ekleme yeni vade/tahliye/tahakkuk üretmez.

## Örnek belge durumları

| Kayıt | Danışman | Durum |
|---|---|---|
| Necip Hakan Özcan + Tevfik Ateş, 15.04.2024 | `i_parin` | Geçmiş arşiv kabulü bekliyor |
| Mustafa Ekin + Bedriye Dede, 17.07.2023 | `k_tasliarmut` | Geçmiş arşiv kabulü bekliyor |
| Mert Somuncu + Gonca Ayberk, 15.04.2025 | `k_tasliarmut` | Geçmiş arşiv kabulü bekliyor |
| Didem Özbay, 01.02.2026–01.02.2027 | `k_tasliarmut` | Aktif dönem; arşive alınmaz |
| Ali Kağan Doğdu, 03.04.2026–03.04.2027 | `i_parin` | Aktif dönem; arşive alınmaz |

## İlgili notlar

- [[05 - Güvenlik ve Gizlilik]]
- [[03 - Windows ve Offline Geçiş]]
- [[04 - Merkezi Mobil ve Alan Adı]]
- [[08 - Açık İşler ve Kabul Planı]]


---
title: İş Akışları ve Modüller
type: modules
updated: 2026-08-24
tags:
  - sozlesme
  - finans
  - vade
  - tahliye
---

# İş Akışları ve Modüller

## Sözleşme ve belge modülleri

- **Yetki Sözleşmeleri:** satış/kiralama seçimi, danışman baş harfi + sıra numarası, üç aylık varsayılan süre, hizmet bedeli alanları, A4 önizleme ve yazdırma.
- **Kira Sözleşmeleri:** konut/işyeri koşulları, kira/depozito, ilk kira son ödeme tarihi üst sınırı, kefil seçeneği, imza kutuları, DASK/sayaçlar ve ekler.
- **Kira ekleri:** tahliye taahhütnamesi, teslim etme/alma tutanakları ve satır eklenebilen demirbaş tablosu.

## Operasyon ve finans

| Modül | İşlev |
|---|---|
| Vade ve vergi | Kira, vergi, tahliye ve sözleşme dönemlerini izleme; uygulama içi uyarılar |
| Tahliye / yeniden kiralama | İhbar süresi, tahliye tarihi ve malik onayı olmadan yeni ilanı engelleme |
| Ön muhasebe | Gelir, gider, tahsilat, ödeme, alacak/borç ve nakit akışı |
| İşlem kapanışı | Kapora, hizmet bedeli, KDV, nakit/banka referansı, risk ve manager onayı |
| Sözleşme/finans istatistikleri | Sözleşme sayısı, tutar, KDV tahsilat kaybı ve kişisel hedef ilerlemesi |
| Müşteri talebi | Konum/bütçe/nitelik talebi ile gizliliği koruyan broker eşleşme özeti |

## İşlem kapanışı kuralı

Danışman tahsilat bilgisini kaydeder; broker manager yerel parola ile açılan sınırlı süreli yetki oturumunda kapanış, istisna veya risk değerlendirmesi yapar. Eksik tahsilat, gecikme veya referanssız işlem risk olarak görünür. Müşteriye verilen belgelerde yalnız back-office olan tahsilat istisnaları gösterilmez.

## Tarih ve biçim

Kullanıcıya görünen sayısal tarihler `GG.AA.YYYY` biçimindedir. ISO tarihleri yalnız teknik saklama ve API alanlarında korunur. Türkçe ad/soyad normalizasyonu ve telefon biçimlendirmesi formlarda uygulanır.

## İlgili notlar

- [[01 - Proje Durumu ve Kararlar]]
- [[03 - Windows ve Offline Geçiş]]
- [[08 - Açık İşler ve Kabul Planı]]


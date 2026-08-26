# Bütçe ve Gider Kontrolü — Araştırma Notları

Bu not, Global 1881 için tasarlanacak **yönetim amaçlı bütçe/gider kontrolü** ekranında kullanılacak üst hesap mantığını açıklar. Bu ekran genel muhasebe, resmi defter veya beyanname yerine geçmez; muhasebe fişi/alt hesap seçimi kullanımdan önce mali müşavir tarafından teyit edilmelidir.

## Kaynakla doğrulanan üst hesaplar

| Ana hesap | Tasarımdaki kullanım | Kaynak |
|---|---|---|
| `760` Pazarlama, Satış ve Dağıtım Giderleri | İlan portalı, sosyal medya, reklam, branda, portföy pazarlama harcamaları | [İSMMMO Tekdüzen Hesap Planı](https://ismmmo.org.tr/dosya/415/Mevzuat-Dosya/tekduzhesapplani.pdf); [Muhasebe Dersleri 760 açıklaması](https://www.muhasebedersleri.com/hesaplar/760-pazarlama-satis-dagitim-giderleri.html) |
| `770` Genel Yönetim Giderleri | Ofis kira/aidat, temsil-ağırlama, iletişim, yazılım, kırtasiye ve yönetimsel dış hizmetler | [İSMMMO Tekdüzen Hesap Planı](https://ismmmo.org.tr/dosya/415/Mevzuat-Dosya/tekduzhesapplani.pdf); [İzdenetim Tek Düzen Hesap Planı](https://www.izdenetim.com.tr/images/yuklenenler/hesap_plani.html) |
| `780` Finansman Giderleri | Kredi/faiz/pos finansman maliyetleri varsa ayrı izleme | [İSMMMO Tekdüzen Hesap Planı](https://ismmmo.org.tr/dosya/415/Mevzuat-Dosya/tekduzhesapplani.pdf) |
| `100` Kasa / `102` Bankalar | Bütçe kaydının değil, gerçekleşen nakit/banka hareketinin ödeme kaynağı | [İSMMMO Tekdüzen Hesap Planı](https://ismmmo.org.tr/dosya/415/Mevzuat-Dosya/tekduzhesapplani.pdf) |
| `180` Gelecek Aylara Ait Giderler / `381` Gider Tahakkukları | Peşin ödenen veya faturası henüz gelmeyen dönemsel giderlerin mali müşavir onaylı muhasebe karşılığı | [İSMMMO Tekdüzen Hesap Planı](https://ismmmo.org.tr/dosya/415/Mevzuat-Dosya/tekduzhesapplani.pdf) |

## Tasarım sınırı

Uygulama içindeki dört/altı haneli detay kodlar, resmî Tekdüzen ana hesapların yerine geçmez; broker managerin bütçe sapması ve taahhütlerini okumasını kolaylaştıran **ofis içi alt kırılımlar** olarak tasarlanacaktır.

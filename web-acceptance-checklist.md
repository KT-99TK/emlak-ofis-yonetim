# Global 1881 — Tek Oturumluk Web Kabul Kontrolü

**Kullanım koşulu:** Bu kontrol yalnız Manus Destek, `emlakdash-kcw9r85v.manus.space` için TLS/erişim olayının çözüldüğünü bildirdikten sonra uygulanır. Liste, daha önce yapılan denemeleri tekrar etmek için değil; web erişimi güvenli hâle geldiğinde kullanıcıdan tek seferlik, kısa ve veri değiştirmeyen kabul almak için hazırlanmıştır.

> Bu oturumda kayıt eklenmeyecek, düzenlenmeyecek veya silinmeyecek. Excel yükleme, yedek geri yükleme, Windows uygulaması, ZIP/BAT/EXE ve Defender ayarlarına dokunulmayacaktır.

| Sıra | Görülecek alan | Kabul ölçütü | İşlem sınırı |
|---:|---|---|---|
| 1 | Yayın adresi ve giriş | `https://emlakdash-kcw9r85v.manus.space` güvenlik uyarısı ya da bakım ekranı olmadan giriş sayfasına ulaşır; giriş tamamlanır. | Yalnız giriş yapılır. SSL/bakım hatasında oturum derhal durdurulur. |
| 2 | Genel Bakış | Ana ekran, yüklemede takılmadan açılır. Başlangıç bekleyen durumunda hata yerine güvenli boş durum görülür. | Kayıt ekleme düğmesi kullanılmaz. |
| 3 | Kira Sözleşmeleri | Form açılır; ilk kira son ödeme yardımcı satırı görünürse tarih `GG.AA.YYYY` biçimindedir. | Taslak oluşturulmaz, kayıt kaydedilmez. |
| 4 | Yetki Sözleşmeleri ve A4 önizleme | Form ve A4 önizleme açılır; belge düzeni, DASK/EİDS alanları ve ek girişleri okunur durumdadır. | Belge kaydı ya da dosya yüklemesi yapılmaz. |
| 5 | Aktif Kiralamalar | Sayfa açılır; mevcut özetler, hizmet görevi alanları ve danışman dağılımı ekranı görünür. | Excel yükleme ve görev durumu değişikliği yapılmaz. |
| 6 | Kira & Vergi Vadeleri | Tarihler kullanıcıya `GG.AA.YYYY` biçiminde görünür ve ekran hata vermeden yüklenir. | Görev yenileme veya durum değişikliği yapılmaz. |
| 7 | Menü ve mahremiyet | Broker manager menüsü düzenli açılır; ana özet kartlarında gereksiz müşteri telefon veya taşınmaz ayrıntısı bulunmaz. | Başka kullanıcı rolüyle giriş testi tekrarlanmaz; rol sınırları otomatik testlerle zaten doğrulanmıştır. |

## Oturum sonu kaydı

Kullanıcı yalnız şu üç sonuçtan birini bildirir: **“web kabulü tamamlandı”**, **“SSL/bakım hatasında durdu”** veya **“şu ekranda sorun var: …”**. Sorun varsa tek ekran görüntüsü yeterlidir. Belirsiz veya güvenlik uyarısı içeren bir durum görüldüğünde oturum uzatılmaz; önce bulgu incelenir.

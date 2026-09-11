# Global 1881 Ofis Kabul Testi — Ara Rapor

## Kapsam ve sınır

Kabul testi veri değiştirmeden yürütülmüştür. Yeni müşteri, kira, sözleşme veya komisyon kaydı oluşturulmamış; gerçek parolalar, T.C. kimlik numaraları ve tam telefon numaraları rapora alınmamıştır. Uygulama içi sonuçlar mevcut testler ve sunucu kanıtlarıyla, fiziksel ofis sonuçları ise kullanıcı cihazında alınacak kanıtlarla ayrılmıştır.

## Sonuç tablosu

| Kontrol | Sonuç | Kanıt / sınırlama |
|---|---|---|
| Ana web server sağlık durumu | Başarılı | Yerel HTTP 200 alındı. |
| LAN bind ve port | Kod/servis kanıtı başarılı | Server `0.0.0.0:3000` üzerinde dinliyor; logda LAN istemcilerinin ana PC IPv4 adresi ve port 3000 kullanacağı yazıyor. Gerçek Windows IPv4 ve istemci bağlantısı fiziksel ofiste doğrulanmalı. |
| IP1 / KT1 / CT1 login ve roller | Kod/regresyon başarılı | Yerel auth ve permissions testleri geçti; gerçek üç cihaz login kanıtı bekliyor. |
| CT1 kayıtları | Kod/veri aktarım kanıtı mevcut | 19 aktif kira kaydının CT1 ile eşleştiği önceki aktarım kanıtında kayıtlı; fiziksel CT1 ekran kabulü bekliyor. |
| Hassas veri maskesi | Regresyon başarılı | Contract output privacy ve rol testleri geçti; gerçek cihazda maskeli görünüm ve gerekçeli reveal audit’i ayrıca görülmeli. |
| Sözleşme numarası | Regresyon başarılı | `contractNumberPolicy.test.ts` geçti; danışman kodu eşleşmesi korunuyor. |
| Komisyon ekranı | Regresyon başarılı | Merkezi kabul senaryoları ve komisyon testleri geçti; gerçek ekranda kayıt yapılmadan önizleme kontrolü bekliyor. |
| Şifreli yedek | Dosya/checksum başarılı | Merkezi veri 7z arşivinin SHA-256 doğrulaması OK; AES-256 proje yedeğinin SHA-256 özeti `4c048e4bf9184e29a84b71bbdddfe2567b6ff7822b08672b28806fac488bf712`. Bu ortamda `7z` komutu bulunmadığı için 7z parola açma testi yeniden yapılamadı; önceki doğrulama kaydı korunuyor. |

## Test komutları

Seçili kabul regresyonları 6 dosya ve 19 test olarak başarılıdır: local auth policy, permissions, CT1 authority code, contract number policy, commission acceptance ve contract output privacy. Sunucu TypeScript ve production build önceki doğrulanmış sürümde başarılıdır.

## Fiziksel ofis kabulünde kalanlar

Ana Windows PC’nin gerçek IPv4 adresi, Windows ağ profilinin Private olması, TCP 3000 bağlantısı, IP1/KT1/CT1 gerçek loginleri, CT1 ekranındaki 19 kayıt, maskeli hassas alan görünümü, logout geçişi ve test öncesi/sonrası şifreli yedek kanıtı ofis cihazlarından alınmalıdır. Bu adımlar yapılmadan fiziksel LAN kabulü tamamlandı sayılmayacaktır.

## Durdurma ölçütleri

Başka kullanıcıya ait hassas veri görünürse, CT1 kayıtları yanlış kullanıcıya bağlanırsa, TCP bağlantısı başarısız olursa, port Public profile üzerinden açılırsa veya yedek doğrulanamazsa veri girişi yapılmadan test durdurulmalıdır.

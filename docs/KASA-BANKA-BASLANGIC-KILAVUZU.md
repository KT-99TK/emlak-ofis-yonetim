# Global 1881 Kasa ve Banka Başlangıç Kılavuzu

## Amaç ve kapsam

Bu ekran **genel muhasebe yerine geçmez**. Ofisin günlük nakit ve banka hareketlerini, işlem dosyasına bağlı kapora/tahsilatları ve günlük farkları kontrol etmek içindir. Resmî muhasebe, fatura, KDV ve vergi kayıtları mali müşavir tarafından yürütülür.

> Kapora ve müşteriden emanet alınan para, ofisin hizmet geliri değildir. Sistem bunları hizmet bedeli ve KDV’den ayrı gösterir.

## Başlangıç sırası

| Sıra | Yapılacak işlem | Uygulamadaki kayıt | Sorumlu |
|---|---|---|---|
| 1 | Kullanılacak para alanlarını netleştirin | `KASA-OFIS-01` ve her gerçek banka hesabı için `BANKA-OFIS-01` gibi hesaplar | Broker manager |
| 2 | Güne açılış tutarıyla başlayın | Fiziki kasa sayımı ve banka ekstresi başlangıç bakiyesi | Broker manager |
| 3 | Para her alındığında/ödendiğinde aynı gün beyan edin | Hesap, giriş/çıkış, amaç, kişi/kurum, tutar, makbuz/EFT-FAST referansı, işlem dosyası | Danışman veya tahsilatı alan kişi |
| 4 | Kaporayı işlem dosyasına bağlayın | `Müşteri kaporası / emanet`; satış-kira süreci tamamlanmadan gelir yazılmaz | Danışman + manager |
| 5 | Banka transferini ekstreden eşleştirin | Banka referansı, gönderen/alıcı, tarih ve tutar | Broker manager |
| 6 | Gün sonunda karşılaştırın | Beklenen kapanış, fiili kasa/banka, fark, eksik belge ve onaysız kayıtlar | Broker manager |

## Kullanılacak dar hesap planı

| Kod | Hesap | Ne zaman kullanılır | Gelir mi? |
|---|---|---|---|
| `KASA-OFIS-01` | Ofis nakit kasası | Ofiste fiziken bulunan TL | Hayır; yalnız para alanı |
| `BANKA-OFIS-01` | Ofis ana banka hesabı | EFT, FAST, havale ve banka ödemeleri | Hayır; yalnız para alanı |
| `EMANET-KAPORA` | Müşteri kaporası/emaneti | Süreç sonuçlanana veya iade/mahsup kararına kadar | **Hayır** |
| `HIZMET-BEDELI` | Tahsil edilen hizmet bedeli | Kira veya satış hizmet bedeli | Evet, mali müşavir kaydıyla |
| `KDV-TAHSILAT` | Tahsil edilen KDV | Hizmet bedeline bağlı KDV | Gelir değil; vergi yükümlülüğü |
| `OFIS-MASRAF` | Ofis gideri | Kırtasiye, ilan, ulaşım vb. belgeye bağlı harcama | Hayır; gider |
| `DANISMAN-AVANS` | Danışman avansı | Danışmana verilen, sonra mahsup edilecek tutar | Hayır |
| `IADE-MAHSUP` | İade/mahsup | Kapora iadesi veya onaylı mahsup | Hayır |

## Zorunlu kontrol kuralları

Bir kayıtta **tutar**, **para alanı**, **giriş/çıkış**, **kişi/kurum**, **tarih**, **makbuz veya banka referansı** ve gerekiyorsa **işlem dosyası** bulunmalıdır. Nakit tahsilatta parayı teslim alan kişi yazılır. Banka tahsilatında gönderen adı ile EFT/FAST/havale referansı yazılır. Kapora kaydı işlem dosyası olmadan tamamlanmaz.

Danışman yalnız kendi işlemini **beyan** eder. Broker manager makbuz veya banka ekstresini görünce hareketi **doğrular**. Doğrulanmamış hareket günlük beklenen bakiyeye girmez. Kasa sayımı veya banka ekstresi beklenen tutardan farklıysa fark kapatılmaz; istisna olarak kayda alınır ve açıklama/evrakla çözülür.

## Gün sonu beş dakikalık kontrol

Broker manager her iş gününün sonunda Kasa ve Banka ekranında günün açılış bakiyesini, fiziki kasa sayımını ve banka ekstresi kapanışını yazar. Sistem doğrulanmış giriş ve çıkışlardan beklenen bakiyeyi hesaplar. Fark, referans eksiği veya bekleyen beyan varsa gün sonu kontrol kaydında açık istisna olarak kalır. Bu durum silinerek değil, belge eklenip doğrulama yapılarak kapatılır.

## İlk uygulama önerisi

İlk hafta yalnız iki hesapla başlayın: ofis kasası ve ana banka hesabı. İlk gün açılış tutarını broker manager yazsın; gün içindeki her kapora, hizmet bedeli ve gider tek tek kaydedilsin. Hafta sonunda mali müşavirle toplamları karşılaştırın. İkinci haftada ikinci banka hesabı veya danışman avans hesabı gerçekten gerekiyorsa ekleyin. Bu aşamalı yol, karmaşık hesap planı oluşturmadan disiplinli kayıt alışkanlığı sağlar.

# Müşteri Dijital Arşivi — Windows Örnek Kabul Akışı

Bu kabul çalışması, tüm eski dosyaları bir defada taşımadan önce **küçük bir temsili PDF grubuyla** yapılır. Amaç, müşteri adı, geçmiş işlem bilgisi, danışman sahipliği, belge tarihi ve dosya açma akışının Windows uygulamasında birlikte doğru çalıştığını göstermektir.

| Örnek set | Beklenen içerik | Neden gereklidir |
|---|---|---|
| Müşteri A | Aynı müşteriye ait en az iki eski PDF | Belgelerin aynı müşteri kartında toplanmasını ve eskiden yeniye sıralanmasını doğrular. |
| Müşteri B | Farklı bir müşteriye ait en az bir PDF | Ayrı müşteri kartı ve arama sonucunu doğrular. |
| Tarihsiz belge | Belge tarihi bilinmeyen en fazla bir PDF | Tarihi belirsiz kaydın kendi müşteri kartının sonunda kaldığını doğrular. |

## Gönderim düzeni

PDF’leri mümkünse aşağıdaki dosya adıyla hazırlayın. Dosya adındaki bilgiler uygulamaya otomatik aktarılmaz; import sırasında danışman, müşteri adı, belge türü, belge tarihi ve geçmiş işlem özeti ayrıca kontrol edilerek girilir.

```text
DANISMAN-KODU__MUSTERI-AD-SOYAD__BELGE-TURU__YYYY-MM-DD.pdf
```

Örnek: `CAHIT-YILMAZ__AYSE-DEMIR__KIRA__2024-08-21.pdf`

## Windows uygulamasında kabul adımları

1. Broker manager hesabı veya manager tarafından atanmış ofis asistanı rolüyle **Müşteri Dijital Arşivi** ekranını açın.
2. Her PDF için danışman kullanıcı kimliğini, müşteri adı–soyadını, belge türünü ve geçmiş işlem özetini girin. Belge tarihi varsa `GG.AA.YYYY` biçiminde kaydedin.
3. Aynı müşterinin en az iki PDF’sini ekleyin. Bu iki belgenin aynı müşteri kartı altında **eskiden yeniye** sıralandığını doğrulayın.
4. `PDF aç` düğmesiyle Windows’un varsayılan PDF görüntüleyicisinde belgenin açıldığını doğrulayın.
5. Danışmanın kendi cihazında yalnız kendi müşteri kartlarının göründüğünü; başka danışmana ait kartın görünmediğini doğrulayın.
6. Broker manager ve atanmış ofis asistanında yetkili belge açma; sıradan başka danışmanda görünmeme/erişememe davranışını doğrulayın.
7. Aktif Yetki Sözleşmeleri, Kira Sözleşmeleri, vade, tahsilat, ön muhasebe ve performans ekranlarında bu arşiv PDF’lerinden yeni kayıt oluşmadığını doğrulayın.

## İstenecek Windows kanıtları

| Ekran görüntüsü | Kabul ölçütü |
|---|---|
| Manager içe aktarma ekranı | Müşteri adı ve geçmiş işlem özeti alanları görünür. |
| Aynı müşterinin kartı | İki veya daha fazla PDF eskiden yeniye görünür. |
| Danışman ekranı | Yalnız danışmanın kendi müşteri dijital arşivi görünür. |
| Yetkisiz danışman ekranı | Başka danışman müşteri/evrak adı veya PDF açma düğmesi görünmez. |
| Aktif sözleşme ekranı | Arşiv PDF’sinin aktif sözleşme, vade veya finans kaydı doğurmadığı anlaşılır. |

> **Geçiş dönemi notu:** Şifreli JSON yedeği yalnız arşiv metadata’sını taşır; PDF baytlarını taşımaz. Bir cihaz değişiminde `contract-archive` klasörü, ilgili şifreli yedekle birlikte güvenli harici ortamdan ayrıca aktarılmalıdır. Merkezi sunucu döneminde dosyalar ve metadata yetkili merkezi depolamaya taşınacaktır.

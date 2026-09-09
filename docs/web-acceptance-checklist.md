# Global 1881 — Merkezi Web/LAN Kabul Kontrol Listesi

Bu liste, aynı ofis Wi‑Fi ağı üzerindeki **IP1, KT1 ve CT1** kullanıcılarının ana Windows bilgisayarda çalışan merkezi web uygulamasını kabul etmesi için hazırlanmıştır. Kabul sırasında yeni müşteri veya sözleşme verisi eklenmez; yalnızca açıkça “TEST” olarak işaretlenmiş geçici kayıt kullanılabilir ve test sonunda silinir. Mevcut 1.0.22 offline Windows kurulumu değiştirilmez.

## 1. Başlangıç güvenliği ve yedek

Ana PC’nin ekranı açık, uykuya geçmesi engellenmiş ve yalnızca ofis ağında olmalıdır. Test öncesinde broker manager, mevcut merkezi veritabanının ve gerekli yapılandırmanın şifreli yedeğini alır. Yedek dosyası açılmadan saklanır; test sonunda yeni bir yedek alınır. İnternete port yönlendirmesi yapılmaz.

## 2. Ana PC ve bağlantı

Ana PC’de `ipconfig` ile aktif IPv4 adresi, server logunda ise gerçek dinleme portu okunur. Varsayılan adres biçimi `http://ANA_PC_IPV4:3000` olsa da port logdan doğrulanmadan varsayılmaz. Her istemcide aşağıdaki kontrol yapılır:

```powershell
Test-NetConnection ANA_PC_IPV4 -Port GERCEK_PORT
```

`TcpTestSucceeded : True` görüldükten sonra Chrome veya Edge ile aynı HTTP adresi açılır. IP1, KT1 ve CT1 aynı merkezi giriş ekranını görmelidir.

## 3. Login ve rol kabulü

| Kullanıcı | Beklenen sonuç |
|---|---|
| IP1 / Broker | Broker manager ekranı, ekip ve merkezi yönetim işlevleri görünür. |
| KT1 / Danışman | Yalnız kendi yetki, müşteri, portföy ve sözleşme kapsamı görünür. |
| CT1 / Cahit Tercan | CT1 kodu, kendi 19 aktif kira kaydı ve %70 danışman/%30 ofis snapshot’ı görünür. |

CT1 ilk girişte geçici parolayı değiştirmelidir. Yeni parola ekranda veya sohbet içinde paylaşılmaz. Her kullanıcı logout yaptıktan sonra diğer kullanıcı hesabına ait ekranın açık kalmadığını kontrol eder.

## 4. Veri ve mahremiyet kabulü

CT1’e ait aktif kira listesinde kayıt sayısı ve danışman kodu kontrol edilir. Telefon ve T.C./vergi bilgileri varsayılan listelerde maskeli görünmelidir. Yetkili müşteri danışmanı veya broker manager, gerekçeli kısa süreli reveal işlemini başlatır; işlem tamamlanınca alanların tekrar maskelendiği ve reveal audit kaydının oluştuğu kontrol edilir. Başka danışmanın müşteri kişisel verisine erişim denenmez; bu bir saldırı testi değil, yetki sınırı doğrulamasıdır.

## 5. İş akışı kabulü

Test verisi oluşturmadan mevcut bir kayıt üzerinde yalnızca ekran görüntüleme yapılır. Sözleşme numarası danışman koduyla görünür; örneğin CT1 kayıtlarında `CT1-001` biçimi korunur. Komisyon ekranında toplam tutar girildiğinde %60/%40 varsayılanı, CT1 için %70/%30 snapshot’ı ve dış ofisli senaryolarda manager gerekçesi ile anlaşma metadata’sı doğru gösterilmelidir. Kaydetme işlemi gerçek müşteri verisiyle yapılmaz.

## 6. Kabul kanıtı

Aşağıdaki kanıtlar tek oturumda kaydedilir: ana PC IPv4 ve gerçek port; üç istemcide başarılı TCP bağlantısı; IP1, KT1 ve CT1 login ekranları; CT1 aktif kira listesi; maskeli hassas alan görünümü; logout sonrası giriş ekranı; test sonrası yedek dosya adı ve checksum. Parolalar, TC kimlik numaraları ve tam telefon numaraları ekran görüntüsüne alınmaz.

## 7. Başarısızlık halinde durdurma ölçütü

Başka kullanıcıya ait kişisel veri görünürse, CT1 kayıtları yanlış kullanıcıya bağlanırsa, `TcpTestSucceeded` başarısız olursa, port Public ağ profilinde açılırsa veya şifreli yedek doğrulanamazsa kabul durdurulur. Bu durumda veri girişi yapılmaz; tarih-saat, kullanıcı ve hata metni not edilir. DNS geçişi ve yeni imzasız EXE üretimi kabul tamamlanana kadar yapılmaz.

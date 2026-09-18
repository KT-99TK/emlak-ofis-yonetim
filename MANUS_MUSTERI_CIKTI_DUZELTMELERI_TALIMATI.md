# Manus için talimat: Müşteri kütüğü/Aktif Kiralamalar çıktı düzeltmeleri

## Bağlam

Kazım, canlıdaki Müşteriler sayfası ve Aktif Kiralamalar Excel çıktısı
üzerinden ekran görüntüleriyle birkaç sorun bildirdi. Bu turda bunlardan
netlik kazanılanları düzelttik; ikisi hâlâ canlıda doğrulama bekliyor
(aşağıda "Canlıda doğrulanması gerekenler" bölümüne bakın).

## Değişen dosyalar ve ne düzeltildi

1. **Büyük harf isimler** — Müşteri/kiracı adları artık Müşteriler
   sayfasında, PDF çıktısında, Excel çıktısında ve Aktif Kiralamalar
   sayfasının hem tablosunda hem PDF/Excel çıktısında Türkçe büyük harfe
   çevriliyor (`toTurkishUpperCase`, zaten var olan `textFormatting.ts`
   yardımcı fonksiyonu).

2. **Telefon gruplama** — Müşteriler sayfasında (kart, PDF, Excel) telefon
   numaraları artık "0532 642 05 57" biçiminde gruplu gösteriliyor (zaten
   var olan `toInternationalPhone` yardımcı fonksiyonu — adı öyle ama artık
   yerli biçim üretiyor). Maskeli telefonlar ("53••…60") olduğu gibi
   bırakıldı — zaten kısmen gizli, gruplamak anlamlı olmazdı.

3. **Excel sütunları ikinci satıra taşmıyor** — Hem Müşteriler hem Aktif
   Kiralamalar Excel çıktısına `columns: [{width: ...}]` eklendi (write-excel-file
   kütüphanesinin desteklediği ayar). Başlıklar artık tek satırda kalacak
   genişlikte.

4. **Aktif Kiralamalar Excel/PDF sütun sırası** — Kazım'ın en son paylaştığı
   örnek başlık sırasıyla birebir eşleşecek şekilde yeniden sıralandı:
   Müşterinin adı/Soyadı, Telefonu, Kiracı adı, Kiracı telefonu, Sözleşme
   tarihi, Kira artış tarihi (boşsa sözleşme tarihi), Tahliye tarihi
   (opsiyonel), Güncel aylık kira (TL), Portföy adresi, Danışman kodu.
   Örnekte olmayan ama değerli iki sütun (Mahalle, Kira durumu — ikincisi
   Manus'un bu oturumdan önce eklediği bir özellik) kaldırılmadı, en sona
   eklendi.

5. **Müşteri Dosyası'na "Portföy adresi ekle"** — Kazım'ın istediği gibi,
   müşteri dosyası panelinde artık bir adres alanı + "Ekle" butonu var; aynı
   müşteriye birden fazla taşınmaz, yalnızca açık adres yazılarak
   eklenebiliyor (`properties.create` artık `ownerClientId` kabul ediyor,
   `server/db.ts`ve `server/routers.ts`).

6. **"Yeni kayıt" butonu sessiz hata** — Müşteriler/Portföy/Ön muhasebe
   hızlı kayıt formunda, mutasyon sunucu tarafında hata verirse (örn. yetki
   kısıtı, doğrulama hatası) önceden **hiçbir şey görünmüyordu** — buton
   tepkisiz gibi görünüyordu. Artık: (a) kayıt sırasında buton "Kaydediliyor…"
   yazıp devre dışı kalıyor, (b) hata olursa kırmızı bir uyarı kutusunda
   hatanın gerçek mesajı gösteriliyor. Bu, "buton çalışmıyor" şikayetinin en
   olası nedeniydi — kullanıcı büyük ihtimalle bir doğrulama/yetki hatası
   alıyordu ama görmüyordu.

7. **Sözleşme Kayıtları'ndaki çift "Yazdır" butonu** — `Contracts.tsx`
   sayfasının üst başlığında bir "Yazdır" butonu doğrudan `window.print()`
   çağırıyordu ve sayfanın kendi uygulama-içi PDF önizlemesini
   (`printFilteredContractsPdf`) tamamen atlıyordu — bu, ekli ekran
   görüntüsündeki "This app doesn't support print preview" native diyaloğunun
   muhtemel nedenlerinden biri. Artık bu buton da aynı önizleme akışını
   kullanıyor.

## Canlıda doğrulanması gerekenler (kod incelemesiyle netleşmeyen)

- **"Yeni kayıt butonu çalışmıyor"**: Kod incelemesinde net bir mantık hatası
  bulunamadı; en olası neden #6'daki sessiz hataydı ve onu düzelttik. Bu
  değişiklik canlıya çıktıktan sonra Kazım tekrar denerse artık ya kayıt
  başarıyla oluşacak ya da neden başarısız olduğunu açıkça görecek. Hâlâ
  sorun varsa, ekranda çıkan kırmızı hata mesajının tam metnini bize
  iletmesi yeterli olur; kök nedeni o mesajdan kesin olarak tespit ederiz.

- **"Çıktı alınmak istendiğinde ön görsel oluşmuyor" / diğer formlar**: Bu
  oturumda tüm `window.print()` çağrılarını taradık. Üç sayfa
  (`AuthorityContracts.tsx`, `OfflineConsultantPerformance.tsx`) hiç
  uygulama-içi önizleme kullanmıyor; bunlar ekrandaki mevcut sayfayı
  `@media print` kurallarıyla doğrudan biçimlendirip yazdıran **farklı ama
  kasıtlı bir tasarım deseni** kullanıyor (kullanıcı zaten belgeyi ekranda
  görüyor, "Yazdır" sadece onu yazıcıya/PDF'e gönderiyor). Bu, Records/Contracts/
  ActiveRentalSummaries'teki "filtrelenmiş listeden ayrı bir önizleme belgesi
  üret" deseninden farklı ama kendi içinde tutarlı. Ekran görüntüsündeki
  "This app doesn't support print preview" native diyaloğu, muhtemelen bu
  masaüstü uygulamasının (Electron tabanlı görünüyor) yerleşik tarayıcı
  bileşeninin kendi önizleme panelini desteklememesinden kaynaklanıyor —
  bizim `DocumentPrintPreview` bileşenimiz zaten tam olarak bunu telafi etmek
  için var (yazdırmadan önce uygulama içinde HTML önizleme gösteriyor). Eğer
  Kazım hâlâ bu 2 sayfada (Yetki Sözleşmeleri, Offline Sözleşme İstatistikleri)
  sorun yaşıyorsa, bunları da `DocumentPrintPreview` desenine çevirmek ayrı
  bir görev olarak planlanabilir — bu turda kapsam dışı bırakıldı çünkü her
  biri farklı bir sayfa yapısı gerektiriyor ve gerçek canlı davranışı
  görmeden doğru şekilde kodlamak risklidir.

## Nasıl uygulanır

```bash
git bundle verify manus-musteri-cikti-duzeltmeleri.bundle
git fetch manus-musteri-cikti-duzeltmeleri.bundle refs/heads/main:refs/remotes/tmp-cikti/main
git checkout main
git merge --ff-only refs/remotes/tmp-cikti/main

npx tsc --noEmit
npx vitest run
# Beklenen: 403/405 (kalan 2 hata önceden var olan, ilgisiz: MultiPropertyIntakeForm.test.ts, OfflineWorkspace.client.test.tsx)

# push + deploy her zamanki akış
```

## Manuel kontrol

- Müşteriler sayfasında isimler BÜYÜK HARF, telefonlar "0532 xxx xx xx"
  biçiminde görünmeli.
- Müşteriler ve Aktif Kiralamalar Excel çıktılarında başlıklar tek satırda
  kalmalı.
- Aktif Kiralamalar Excel/PDF çıktısında sütun sırası: Adı/Soyadı, Telefonu,
  Kiracı adı, Kiracı telefonu, Sözleşme tarihi, Kira artış tarihi, Tahliye
  tarihi, Güncel aylık kira, Portföy adresi, Danışman kodu, (sonra) Mahalle,
  Kira durumu.
- Bir müşterinin "Müşteri Dosyası"nı açıp "Portföy adresi ekle" alanına bir
  adres yazıp "Ekle"ye basınca, Portföyler listesinde yeni satır görünmeli.
- Müşteriler/Portföy/Ön muhasebe "Yeni kayıt" ile kasıtlı geçersiz bir kayıt
  denenirse (örn. çok kısa bir isim), artık ekranda kırmızı bir hata mesajı
  çıkmalı — sessiz kalmamalı.
- Sözleşme Kayıtları sayfasının üstündeki "Yazdır" butonu artık önce
  uygulama-içi önizleme göstermeli, doğrudan sistem yazdırma penceresine
  gitmemeli.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RxQyQkHTTfL7QZUKyJjdB6

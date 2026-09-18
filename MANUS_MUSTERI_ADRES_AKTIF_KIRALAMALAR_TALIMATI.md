# Manus için talimat: Müşteri adresi + Aktif Kiralamalar menüde görünür yapma

## Bağlam

Kazım, Müşteriler sayfasındaki bir müşteri kart listesini (ekran görüntüsü) ve
elindeki bir Excel örneğini (CT1 danışmanına ait aktif kiralama listesi:
Müşteri/malik adı, Portföy Adresi, Ev sahibi telefon, Kiracı adı, Kiracı
telefonu, Sözleşme tarihi, Kira artış tarihi, Tahliye tarihi, Güncel aylık
kira, Mahalle, Danışman kodu) paylaştı ve iki şey istedi: (1) müşteri kayıt
ekranına adres eksikliğinin giderilmesi, (2) bu tablo formatının sistemde
"güncellenmesi".

İnceleme sonucu ortaya çıkan gerçek durum: paylaşılan Excel'in sütun başlıkları,
sistemde zaten var olan **Aktif Kiralamalar** sayfasının (`/active-rentals`)
içe aktarma şablonuyla birebir aynı — hatta masked telefon biçimi
(`53••…60`), bu verinin muhtemelen daha önce bu sayfadan içe aktarıldığını
gösteriyor. Sorun, bu sayfanın sol menüde hiç yer almaması; Kazım bu özelliğin
var olduğunu bilmiyordu. Bu yüzden büyük bir veri/kod değişikliği yerine, asıl
eksik olan iki şeyi tamamladık:

1. **Aktif Kiralamalar artık sol menüde** ("Portföy & Müşteri" grubunda,
   Müşteriler'in hemen altında). Sayfanın kendisinde kod değişikliği yok,
   sadece artık ulaşılabilir.
2. **Müşteri (client) kaydına adres eklenebiliyor** — hem yeni kayıt oluştururken
   hem de mevcut (önceden içe aktarılmış, adresi eksik kalmış) müşterilerde
   sonradan düzenlenebiliyor.

## Değişen dosyalar

- `server/db.ts` — `createClient` artık `phone`/`email`/`address` kabul
  ediyor; yeni `updateClient` fonksiyonu eklendi (yetki kontrolü: yönetici
  veya kaydın atandığı danışman/ofis asistanı kapsamı).
- `server/routers.ts` — `clients.create` girişine `phone`/`email`/`address`
  eklendi; yeni `clients.update` mutasyonu eklendi.
- `client/src/pages/Records.tsx` (Müşteriler sayfası):
  - Hızlı kayıt satırına (yalnız müşteri kaydı için) Telefon ve Adres alanı
    eklendi.
  - Her müşteri kartına "Düzenle" butonu eklendi (ad/telefon/e-posta/adres
    düzenleme dialogu) — bu, önceden içe aktarılmış ve adresi eksik kalan
    müşterileri tamamlamak için kullanılacak asıl araç.
  - Müşteri kartında ve "Müşteri Dosyası" panelinde adres artık gösteriliyor.
  - PDF ve Excel dışa aktarımlarına "Adres" sütunu eklendi.
- `client/src/components/DashboardLayout.tsx` — sidebar menüsüne "Aktif
  Kiralamalar" (`/active-rentals`) eklendi.
- `client/src/pages/ActiveRentalSummaries.tsx` — "Tüm aktif kira özetleri"
  tablosuna, Kazım'ın paylaştığı örnek Excel ile birebir aynı sütun
  başlıklarıyla PDF ve Excel dışa aktarma eklendi (mevcut maskeleme/erişim
  kuralları korunarak — ekranda görünenden fazlası dışa aktarılmıyor).

## Nasıl uygulanır

```bash
# 1) Bundle'ı doğrula
git bundle verify manus-client-address-active-rentals.bundle

# 2) Bundle'dan geçici bir remote-tracking dalı oluştur
git fetch manus-client-address-active-rentals.bundle refs/heads/main:refs/remotes/tmp-clientaddr/main

# 3) main'e geç ve fast-forward merge yap
git checkout main
git merge --ff-only refs/remotes/tmp-clientaddr/main

# 4) Doğrulama
npx tsc --noEmit
npx vitest run
# Beklenen: 402/404 test geçmeli (kalan 2 hata bu değişiklikle ilgisiz,
# önceden var olan bilinen hatalar: MultiPropertyIntakeForm.test.ts ve
# OfflineWorkspace.client.test.tsx)

# 5) Push + deploy (her zamanki akış)
```

## Manuel kontrol (tarayıcıda)

- Sol menüde "Müşteriler" hemen altında "Aktif Kiralamalar" görünmeli;
  tıklanınca mevcut sayfa (Excel içe aktarma, görev listesi, vergi ön bilgisi,
  tüm özetler tablosu) açılmalı — bu sayfanın kendi içeriği değişmedi.
- Aktif Kiralamalar sayfasında "Tüm aktif kira özetleri" başlığının yanında
  artık PDF ve Excel butonları var; tıklanınca örnek Excel ile aynı sütun
  sırasıyla bir doküman/dosya üretmeli.
- Müşteriler sayfasında yeni müşteri eklerken artık Telefon ve Adres alanı
  görünmeli.
- Bir müşteri kartındaki "Düzenle" butonuna tıklayınca ad/telefon/e-posta/adres
  formu açılmalı; adres girip kaydedince kartta ve Müşteri Dosyası panelinde
  görünmeli.
- Müşteriler PDF/Excel çıktısında artık "Adres" sütunu olmalı.

## Not

Kazım'ın paylaştığı CT1 danışmanına ait örnek Excel tablosunun kendisi bu
oturumda sisteme aktarılmadı — bu, gerçek müşteri/kiracı verisi içerdiği için
production veritabanına yazma yetkisi olmayan bu ortamdan yapılamaz. Kazım'a
şunu önerdik: eğer bu veri daha önce içe aktarılmadıysa, artık menüde görünen
Aktif Kiralamalar sayfasındaki "Excel ile başlangıç aktarımı" (yalnız broker
manager) bölümünden, elindeki Excel dosyasını doğrudan yükleyebilir; format
zaten birebir uyuyor.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RxQyQkHTTfL7QZUKyJjdB6

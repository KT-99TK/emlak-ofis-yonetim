# Manus için talimat: Süreç omurgası — menü sırası, kılavuz, yönlendirme

## ÖNEMLİ — önce bunu okuyun

Kazım, önceki turlarda gönderdiğimiz düzeltmelerin (büyük harf isimler,
telefon gruplama, buton kontrastı, Mülk başlığı ipucu vb.) **canlıda hâlâ
görünmediğini** bildirdi. Repoyu incelediğimde bu değişikliklerin sizin
tarafınızda kod olarak zaten uygulanmış olduğunu gördüm (checkpoint
commit'leri mevcut) — ama her checkpoint commit mesajının sonunda şu not
var: *"Değişiklik canlıya push edilmeden preview checkpoint'i olarak
kaydedildi."* Yani bu commit'ler yalnızca sizin tarafınızdaki bir önizleme
dalında duruyor, gerçek `origin/main`'e push edilip ofis.global1881.com'a
deploy edilmemiş.

**Lütfen bu bundle'ı uyguladıktan sonra, hem bu değişikliği hem de daha
önce birikmiş ve henüz push edilmemiş tüm checkpoint'leri (en azından şu
anki `origin/main` ucuna kadar olan her şeyi) gerçekten push edip canlıya
deploy edin.** Kazım'ın az önce fark ettiği "büyük harf hâlâ çalışmıyor"
şikâyetinin kök nedeni büyük ihtimalle tam olarak bu — kod doğru ama
yayında değil.

## Bu bundle'da ne var

1. **Menü sırası mantıksal akışa göre düzenlendi**
   (`client/src/components/DashboardLayout.tsx`): "Portföy & Müşteri"
   grubunda sıra artık **Müşteriler → Portföy → Aktif Kiralamalar**.
   Önceden Portföy üstteydi; ama sistemde bir portföy kaydı her zaman bir
   müşteriye (malike) bağlı olarak açıldığından, önce müşteri kaydı
   gerekiyor. Yeni sıra gerçek veri bağımlılığıyla uyumlu.

2. **Kullanım Kılavuzu genişletildi** (`client/src/components/
   UserGuideDialog.tsx`, Genel Bakış sayfasındaki "Kullanım Kılavuzu"
   düğmesi): önceden 4 genel adımdı, şimdi tüm süreç omurgasını anlatan
   8 adım: Müşteri → Portföy → Yetki Sözleşmesi (EİDS) → (Kiralık: Kira
   Sözleşmesi / Satılık: Ön Protokol + Satış Sözleşmesi / Kat karşılığı:
   Danışmanlık Sözleşmesi + temlik) → Bana Hatırlat → Aktif takip. Her
   adımın "İlgili ekrana git" kısayolu ilgili sayfaya götürüyor.

3. **Müşteri oluşturulunca portföy ekleme yönlendirmesi**
   (`client/src/pages/Records.tsx`): Müşteriler sayfasında yeni bir
   müşteri kaydedildiğinde ekranda yeşil bir bilgi kutusu çıkıyor: "**AD
   SOYAD** müşteri kaydı oluşturuldu. Şimdi bu müşteriye ait portföyü
   (taşınmazı) ekleyin." — yanındaki **"Portföy ekle →"** düğmesine
   basınca, ayrı bir menüye gitmeye gerek kalmadan, doğrudan o müşterinin
   dosyasındaki "Portföy adresi ekle" alanı açılıyor. Kazım'ın önerdiği
   "dinamik yönlendirme" fikri buydu; menü değiştirmek yerine akışın
   kendi içinde bir sonraki adımı gösteriyoruz.

## Nasıl uygulanır

```bash
git bundle verify manus-surec-omurgasi-menu-kilavuz.bundle
git fetch manus-surec-omurgasi-menu-kilavuz.bundle refs/heads/main:refs/remotes/tmp-omurga/main
git checkout main
git merge --ff-only refs/remotes/tmp-omurga/main

npx tsc --noEmit
npx vitest run
# Beklenen: 405/407 (kalan 2 hata önceden var olan, ilgisiz:
# MultiPropertyIntakeForm.test.ts, OfflineWorkspace.client.test.tsx)

# ÖNEMLİ: bu sefer gerçekten push edin ve canlıya deploy edin.
```

## Canlıda uçtan uca doğrulama (lütfen bu listeyi tek tek geçin)

Ben bu ortamdan canlı siteye erişemiyorum, bu yüzden aşağıdaki kontrolleri
sizin canlıda (veya en azından deploy öncesi bir önizleme ortamında)
yapmanızı rica ediyorum — sürecin baştan sona gerçekten çalıştığını
teyit etmek için:

1. Müşteriler sayfasından yeni bir test müşterisi oluşturun (küçük harfle
   yazın, örn. "test danışman"). Kart listesinde BÜYÜK HARF görünmeli,
   ve oluşturma sonrası yeşil "Portföy ekle" kutusu çıkmalı.
2. "Portföy ekle" düğmesine basın → müşteri dosyası açılmalı, "Portföy
   adresi ekle" alanına bir adres yazıp ekleyin → Portföyler listesinde
   görünmeli.
3. Portföy sayfasına gidin, "Mülk başlığı" alanını boş bırakıp "Yeni
   kayıt" düğmesine bakın: buton belirgin gri (soluk) görünmeli, aktif
   yeşille karıştırılmamalı.
4. Yetki Sözleşmeleri sayfasına gidin: az önce oluşturduğunuz test
   müşterisini malik olarak seçin → az önce eklediğiniz portföy
   dropdown'da görünmeli (görünmüyorsa, müşteri↔portföy bağlantısı
   bozuk demektir, lütfen bize bildirin).
5. Sidebar'da "Portföy & Müşteri" grubunda sıranın Müşteriler → Portföy
   → Aktif Kiralamalar olduğunu görsel olarak doğrulayın.
6. Genel Bakış sayfasında "Kullanım Kılavuzu" düğmesine basın, 8 adımlık
   yeni rehberin göründüğünü ve her adımın kısayolunun doğru sayfaya
   gittiğini kontrol edin.
7. Test müşterisini ve test portföyünü silmeyi unutmayın (veya "pasif"e
   alın) — bu yalnızca doğrulama amaçlıydı.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01RxQyQkHTTfL7QZUKyJjdB6

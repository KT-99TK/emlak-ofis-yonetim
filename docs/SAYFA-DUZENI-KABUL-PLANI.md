# Global 1881 Sayfa Düzeni Kabul Planı

## Amaç ve çalışma kuralı

Bu kabul çalışması tamamlanmadan yeni ürün işlevi geliştirilmez. Gelen yeni istekler `todo.md` içinde açık görev olarak tutulur; ancak kodlama önceliği yalnız bu belgedeki sayfa düzeni, A4 önizleme ve yazdırma kabulündedir.

## Ortak düzen standardı

| Alan | Kabul standardı |
|---|---|
| Masaüstü çalışma alanı | Ana içerik konsantre, okunabilir ve en fazla 1.180 px genişlikte olmalıdır. Sağ Ofis Akışı alanı yalnız geniş ekranda ikinci sütunda görünmelidir. |
| Dar ekran | Kartlar tek sütunda, taşmasız ve birincil işlem düğmeleri görünür olmalıdır. |
| Marka | Uygulama içi marka alanı kırık görsel, alternatif metin kalıntısı veya aşırı büyük boşluk göstermemelidir. |
| A4 önizleme | Ekranda A4 kâğıt oranını koruyan, gölgeli fakat sınırları belirgin bir belge yüzeyi olmalıdır. Üst bilgi, başlık, meta bilgi ve ilk tablo dengeli bir dikey ritimle görünmelidir. |
| Yazdırma | Yazdırma yüzeyi A4 portre, dengeli marj ve taşmayan tablo hücreleriyle üretilebilmelidir. Ekran kabuğu, menüler ve sağ panel yazdırılmamalıdır. |
| Gizlilik | Sayfa düzeni düzeltmesi yetki filtrelerini veya danışman veri maskesini değiştirmemelidir. |

## Ekran envanteri ve sıra

| Öncelik | Yüzey | Odak |
|---:|---|---|
| 1 | Offline Yetki Sözleşmeleri | Kırık mühür/logo, üst boşluk, A4 başlık, bilgi tabloları ve yazdırma. |
| 2 | Offline Kira Sözleşmeleri ve ekleri | A4 başlık, danışman izi, eklerin belge akışı ve yazdırma. |
| 3 | Yerel Çalışma Alanı / İşlem Kapanışları / Kasa-Banka | Ana kolon, seçiciler, kart yoğunluğu, sağ Ofis Akışı alanı. |
| 4 | Müşteri Dijital Arşivi / Aktif Belgeler / Yedek Birleştirme | Belge kartları, boş durumlar, uzun metin ve tablo taşmaları. |
| 5 | Raporlar, Vade, Talep, Performans | Tablo genişliği, tarih görünümü, dar ekran kart hiyerarşisi. |
| 6 | Merkezi mobil ekran | 390 px görünümde gündem, belgeler, kasa özeti ve sabit işlem alanları. |
| 7 | Genel Bakış ve merkezi yönetim ekranları | Dashboard kart oranları, yan menü ve geniş/dar kırılımlar. |

## Yetki Sözleşmesi için özel kabul

1. Mühür, paketli Electron dosya yolundan yüklenmeli; yüklenemezse kırık görsel yerine güvenli metinsiz sade bir yer tutucu görünmelidir.
2. Belge üst bilgisi 18–22 mm etkili yükseklikte kalmalı; ilk tabloya kadar aşırı boşluk oluşmamalıdır.
3. A4 ekran önizlemesi belgeyi 210 mm genişlik oranında gösterirken masaüstü kart kabuğu belgeyi ortalamalıdır.
4. Başlık, kayıt meta bilgisi ve ilk bilgi tablosu ilk ekranda birlikte dengeli görünmelidir.
5. Yazdırma önizlemesinde kenar boşlukları ve tablo hücreleri A4 sınırında taşmamalıdır.

## Kabul kanıtı

Her öncelik grubu için aşağıdaki kanıtlar alınır:

| Kanıt | Zorunluluk |
|---|---|
| 1280 px geniş ekran görünümü | Zorunlu |
| 390 px dar ekran görünümü | Zorunlu |
| İlgili Vitest/TypeScript doğrulaması | Zorunlu |
| Yetki/Kira için Windows/Electron ekran veya yazdırma önizlemesi | Zorunlu |

Windows kabulüne giden yeni ZIP, bu kanıtların ardından ayrı sürümle hazırlanır.

## 24.08.2026 ilk geniş ekran bulgusu

| Rota | Bulgu | Sonuç |
|---|---|---|
| `/` Genel Bakış | Sol navigasyon, ana özet kartları ve Ofis Akışı geniş ekranda dengeli görünmektedir. | Ortak dashboard kabuğu korunur. |
| `/offline` web yönlendirmesi | Bu rota Electron dışındaki tarayıcıda doğru biçimde yalnız merkezi çalışma alanı uyarısını gösterir. Windows offline sözleşme ekranlarının görsel kabulü Electron veya paketli Windows kanıtı gerektirir. | Tarayıcı görüntüsü offline belge kabulünün yerine geçmez. |
| `/mobile` 1280 px | Merkez mobil tasarım kendi dar içerik kolonu içinde taşmasız yüklenmektedir. | 390 px mobil ekran doğrulaması ayrı zorunludur. |
| `/authority-contracts` | Merkezi yetki formunun eski serbest metin önizlemesi ortak A4 belge bileşeniyle değiştirildi; mühür, başlık, düzenleme metası, bölüm tabloları ve imza kutuları görünürdür. | Geniş ekran ilk doğrulaması tamamlandı; Windows/Electron kanıtı yine ayrıca gereklidir. |
| `/contracts` merkezi Kira Sözleşmeleri | Sol menünün gerçek hedefi çalışır; doğrudan `/rental-contracts` test rotasının 404 dönmesi menü arızası değildir. Başlık ve kayıt alanı menü bağlamına göre netleştirildi. | Geniş ekran temel düzen doğrulaması tamamlandı. |
| Offline operasyon ekranları | Yerel çalışma alanı, işlem kapanışları, kasa-banka ve müşteri arşivi ortak `offline-page-surface` çerçevesine bağlandı; ana kolon, başlık ritmi ve dar ekran boşlukları tek CSS kuralından yönetilir. | Kaynak testi ve TypeScript doğrulandı; gerçek Electron ekran kanıtı beklenir. |
| Paketli mühür yolu | Electron ön-yükleme katmanı mühür görselinin pakette varlığını doğrulamadan `file:` URL üretmez; eksik dosyada belge bileşeninin güvenli mühür yer tutucusu devreye girer. | Kaynak testi ve mevcut mühür dosyası doğrulandı; Windows kanıtı beklenir. |
| `/mobile` 390 px | Ofis Akışı, yaklaşan gündem, yalnız manager/asistan için kasa özeti ve alt gezinme tek sütunda taşmasız görünür. | İlk dar ekran doğrulaması tamamlandı. |
| `/authority-contracts` 390 px | Form ve ortak A4 belge önizlemesi tek sütunda ardışık görünür; mühür ve bölüm tabloları kırık görsel olmadan yüklenir. | Dar ekran ilk doğrulaması tamamlandı; gerçek Windows print preview ayrıca gereklidir. |
| `/contracts` 390 px | Menü başlığı, form kartı, yazdırma düğmesi ve boş kayıt alanı tek sütunda görünür; yatay taşma gözlenmedi. | Dar ekran ilk doğrulaması tamamlandı. |
| `/clients`, `/properties`, `/accounting` 1280 px | Ortak başlık ritmi, arama/filtre eylemleri ve boş kayıt kartları aynı içerik genişliğinde görünür. | Geniş ekran ilk doğrulaması tamamlandı. |
| `/obligations` 1280 px | Uyarı tercihi, yeni yükümlülük formu ve mali tablo iki sütunda okunaklı; filtre alanlarında taşma gözlenmedi. | Geniş ekran ilk doğrulaması tamamlandı. |
| `/team`, `/audit` 1280 px | Boş durum kartları yan menü ve ana içerik çerçevesiyle tutarlı görünür. | Veri dolu senaryoda satır/tablo taşması ayrıca test edilmelidir. |
| `/properties` 390 px | İlk kontrolde filtre satırı yatay kesiliyordu. Başlık eylemleri sarmalanabilir gruba alındı; yeni kayıt alanı mobilde görünür yapıldı. Yeniden doğrulamada seçiciler ve ana düğme ayrı satırlarda taşmasız görünür. | Dar ekran düzeltmesi ve kaynak testi tamamlandı. |
| `/` Genel Bakış 390 px | Karşılama, özet kartları, broker manager bilgisi, Ofis Akışı, hızlı işlemler ve son hareketler tek sütunda sıralanır; metin veya kart kesilmesi gözlenmedi. | Dar ekran ilk doğrulaması tamamlandı. |
| Windows Electron · Offline Yetki Sözleşmeleri | Kullanıcının 24.08.2026 tarihli gerçek Windows ekranında mühür görünür, kırık görsel/alternatif metin yoktur. Üst bilgi, belge başlığı, kayıt metası ve ilk bilgi tabloları aynı A4 yüzeyinde dengeli görünmektedir. | Ekran önizleme kanıtı alındı; Windows yazdırma önizlemesi ve Kira/operasyon ekranları hâlâ beklenir. |
| Windows Electron · Yetki çalışma ekranı | Kullanıcının 24.08.2026 tarihli gerçek Windows ekranında sol menü, ana form kolonu ve sağdaki Size Özel Gündem paneli birlikte görünmektedir. Form alanları okunaklıdır; yatay taşma veya aşırı dağınık boşluk gözlenmemiştir. | Yetki form düzeni kanıtı alındı; yazdırma önizlemesi beklenir. |
| Windows Electron · Aktif İmzalı Belgeler | Kullanıcının gerçek Windows ekranında PDF ekleme formu, imza tarihi alanı, silinmezlik bildirimi ve belge ilkesi sağ paneli dengeli görünmektedir. | Bu ekran için ilk görsel kanıt alındı. |
| Windows Electron · Kira formu ve A4 | Kullanıcının mevcut sürüm ekranında kira formu okunaklıdır. Ancak A4 taşınmaz tablosunun hemen altında ayrı `DASK POLİÇE NUMARASI` kutusu görülmüş; kullanıcı bu konumu kabul etmemiştir. | 1.0.5 adayında DASK, Taşınmaz Açık Adresi ile aynı taşınmaz bilgi tablosuna taşındı; güncel Windows yazdırma kanıtı beklenir. |
| Windows Electron · Kira formu · DASK | Kullanıcının güncel Windows ekranında DASK poliçe numarası, `Taşınmaz açık adresi` ile aynı taşınmaz/teslim/demirbaş bilgi grubunda sağ hücrede görünür. | Formdaki konum kabul edildi; Kira A4 ve yazdırma önizlemesindeki satır düzeni ayrıca beklenir. |
| Windows Electron · Kira A4 · DASK | Kullanıcının güncel Kira A4 önizlemesinde `DASK Poliçe No`, `Taşınmaz Açık Adresi` ile aynı Taşınmaz/Bedel/Süre tablosunda görünür; ayrı alt kutu yoktur. | A4 yerleşimi kabul edildi; Windows yazdırma önizlemesi kanıtı beklenir. |
| Windows Electron · Kasa ve Banka | Kullanıcının 1.0.7 gerçek Windows ekranında sol menüde Kasa ve Banka hedefi görünür; işlem formu ile sağ yardımcı sütun dengelidir. DashboardLayout üst kabuğundan çıkarılan eski gündem paneli tekrar oluşmamış, yalnız sayfanın sağ sütununda tek `Size Özel Gündem` paneli kalmıştır. | Tek panel ve tek menü kabulü tamamlandı. |

Windows Yetki ekranındaki önceki kırık mühür ve aşırı üst boşluk sorunu bu kullanıcı kanıtında tekrar gözlenmemiştir. Kabulün kapanması için belirtilen diğer Windows ekranları ve yazdırma önizlemesi ayrıca alınacaktır.

## Ofiste yapılacak kalan Windows kabul kontrolü

| Sıra | Ekran | Kullanıcının doğrulayacağı nokta |
|---:|---|---|
| 1 | Kira Sözleşmeleri formu | DASK poliçe numarası, taşınmaz bilgileri ile aynı grupta görünmeli; bağımsız alt kutu olarak kalmamalıdır. |
| 2 | Kira A4 önizleme ve Windows yazdırma önizlemesi | A4 marjları, başlık, taşınmaz tablosu ve DASK satırı kesilmeden/taşmadan görünmelidir; menüler ve sağ gündem paneli yazdırılmamalıdır. |
| 3 | İşlem Kapanışları | Sol menü tekil, ana form kolonu okunaklı ve sağ yardımcı alan dengeli olmalıdır; yinelenen üst menü veya panel görülmemelidir. |

> Bu üç kanıt alınana kadar sayfa düzeni kabulü açık kalır ve yeni ürün işlevi kodlanmaz.

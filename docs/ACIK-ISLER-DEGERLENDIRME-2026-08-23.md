# Global 1881 — Açık İşler Değerlendirmesi ve Öncelik Kararı

**Tarih:** 23 Ağustos 2026  
**Kapsam:** Proje başlangıcından itibaren iletilen istekler; mevcut görev geçmişi, offline iş akışı, A4 belgeler, Windows/Electron kabul ihtiyacı ve merkezi sunucuya geçiş kararı birlikte değerlendirilmiştir.

> Bu tablo, “kodda hiç başlanmamış iş” ile “kodda var fakat gerçek Windows/Electron kullanım kanıtı henüz alınmamış iş” arasındaki farkı açık tutar. İkinci gruptakiler eksik modül değil, **kabul testi bekleyen iş** olarak değerlendirilmelidir.

## Durum tanımları

| Durum | Anlamı |
|---|---|
| **Uygulanıyor** | Kod çalışması başlatılmış, henüz checkpoint ve toplu kabul aşamasına gelmemiş iş. |
| **Uygulanacak** | Talep tanımlı; ancak kodlamaya başlanmamış veya ortak altyapıya bağlanmamış iş. |
| **Windows kanıtı bekliyor** | Birim test/build başarılı; gerçek Electron/Windows ekranı, baskı veya üç-laptop prosedürü ile onay bekliyor. |
| **Merkezi dönem** | Bir yıllık offline geçiş modeli gereği, bulut/merkezî sunucu aktif olduğunda tamamlanacak iş. |

## A. Birinci öncelik — Kullanım kalitesi ve sözleşme kabulü

| Öncelik | İş | Mevcut durum | Neden öncelikli | Kabul ölçütü |
|---|---|---|---|---|
| **P0** | Yetki, kira, yerel çalışma alanı ve işlem kapanışlarında yeşil **Ofis Akışı** yan paneli | **Uygulanıyor** | Kullanıcı son Windows görüntüsünde paneli göremedi; form ekranları gereğinden yaygın görünüyor. | Geniş Windows ekranında sağda koyu yeşil panel; dar görünümde formun altında. Danışman kendi işlerini, manager anonim istisna sayısını görür. |
| **P0** | Yetki belgesi üst başlığı: gerçek şeffaf mühür, güçlü ofis adı, dengeli belge bilgisi | **Uygulanıyor** | Mevcut silüet mühür zayıf ve müşteri belgesi etkisini azaltıyor. | Sağlanan mühür belirgin fakat baskıyı bozmayan biçimde sol üstte; ofis adı ve belge meta bilgisi dengeli görünür. |
| **P0** | Yetki belgesi A4 sol–sağ dengesi ve varsayılan üç aylık süre | **Uygulanıyor** | Kullanıcının açık talebi; A4’de dengeli marj ve süre varsayılanı iş akışını doğrudan etkiler. | Sol/sağ A4 marjları eşit; yeni sözleşme 3 ayla açılır, kullanıcı süreyi değiştirebilir, seçilen süre snapshot ve koşul metnine girer. |
| **P0** | Yerel Çalışma Alanı açılır listeleri ve Yerel kaydet kontrastı | **Windows kanıtı bekliyor** | Kullanıcı görüntülerinde seçenekler formla karıştı, kaydet metni okunmadı. Kod düzeltildi. | Windows/Electron ekranında kayıt türü ve filtre listesi tam opak görünür; etkin/pasif kaydet düğmesi okunur. |
| **P0** | Kira sözleşmesinde DASK ve sayaç alanlarının gerçek A4 kontrolü | **Windows kanıtı bekliyor** | Kiracının abonelik başvurusu için kritik pratik bilgi. Kod ve test tamamlandı. | DASK poliçe no ile elektrik/su/doğalgaz sayaç no, formda, ana A4’te ve teslim eklerinde görünür. |
| **P0** | Türkiye tarih standardı | **Windows kanıtı bekliyor** | Ortak yardımcılar sözleşme, vade, rapor, işlem kapanışı, manifest ve yerel kayıt ekranlarına bağlandı; 88 test, tür denetimi ve production build başarılı. | Sayısal iş tarihleri `GG.AA.YYYY`; yenileme/audit zamanları `GG.AA.YYYY SS:DD`; günlük metinler Türkçe gün-ay-yıl ve doğru hafta günüyle görünür. |

## B. İkinci öncelik — Offline iş akışının gerçek kabul testi

| Öncelik | İş | Mevcut durum | Neden öncelikli | Kabul ölçütü |
|---|---|---|---|---|
| **P1** | Yetki ve kira sözleşmelerinin Windows/Electron A4 baskı önizlemesi | **Windows kanıtı bekliyor** | A4 düzeni, imza kutuları, mühür ve seçili ekler gerçek yazdırma motorunda görülmeden tamamlanmış sayılmamalı. | Yetki belgesinde malik/ofis imzası; kira belgesinde iki/üç taraf imzası; seçili ek paketi ve tekil baskılar doğru görünür. |
| **P1** | Üç laptop şifreli yedek–doğrulama–merge–rollback tatbikatı | **Windows kanıtı bekliyor** | Veri kaybını önleme, geçiş yılındaki en kritik operasyon riskidir. | Üç cihazdan export; checksum/ECDSA doğrulama; manager merge; çakışma kararı; yeni ana yedek ve rollback sonucu kayda alınır. |
| **P1** | İşlem kapanışı tahsilat, referans, risk ve yerel manager parola akışı | **Windows kanıtı bekliyor** | Nakit/banka tahsilatının kontrol edilmesi ve kapanışın broker yetkisinde kalması gerekir. | Danışman tahsilat beyanı; nakit makbuzu/banka referansı; 20 dakika manager oturumu; gerekçeli istisna ve kapanış denenir. |
| **P1** | Önceki yetki taslağını çağırma, Urla seçicisi ve kullanıcı adı biçimlendirmesi | **Windows kanıtı bekliyor** | Form hızını ve danışman günlük kullanımını etkiler. | Önceki taslak formu doldurur; Urla listesi opak/kaydırılabilir; Diğer serbest giriş Türkçe baş harf kuralıyla görünür. |
| **P1** | Marka/kurulum kanıtı ve `startup.log` | **Windows kanıtı bekliyor** | Eski paketle karışmayı ve Electron başlangıç sorunlarını önler. | 1.0.2 FINAL installer sonrası offline başlangıç, sürüm, ilk rota ve güncel log doğrulanır. |

## C. Üçüncü öncelik — Offline döneminin işlevsel derinliği

| Öncelik | İş | Mevcut durum | Değerlendirme | Kabul ölçütü |
|---|---|---|---|---|
| **P2** | Müşteri talebi–portföy eşleştirme kayıtlarının backup/merge ile saha doğrulaması | **Windows kanıtı bekliyor** | Kural seti ve gizlilik özeti kodda var; gerçek cihaz/merge kanıtı eksik. | Müşteri kişisel verisi açılmadan eşleşme özeti ve danışman/broker yönlendirmesi korunur. |
| **P2** | Yıllık danışman hedefleri ile sözleşme/finansal istatistiklerin saha doğrulaması | **Windows kanıtı bekliyor** | Hedef, KDV ve tahmini kayıp hesapları var; gerçek kayıtlarla kontrol edilmelidir. | Danışman kendi hedefini görür; broker özet görür; kişisel sıralama oluşmaz. |
| **P2** | Tahliye, mülk sahibi onayı ve yeniden kiralama iş akışının kullanıcı kabulü | **Windows kanıtı bekliyor** | Alanlar/uyarılar var; gerçek sözleşme ve takvim senaryosu ile doğrulama gerekir. | İhbar tarihi, onay bekleme ve yeniden kiralama kuralı danışman günlük iş listesinde anlaşılır görünür. |
| **P2** | Gerçek kullanım geri bildirimiyle menü ton ayarı | **Uygulanacak** | Yeni yeşil-altın menü ilk kullanımda fazla koyu bulunursa küçük görsel ayar yapılmalı. | Kullanıcı ekran görüntüsüyle menü kontrastını onaylar veya ton açıklaştırılır. |

## D. Merkezi sunucu/bulut dönemine bırakılan işler

| Öncelik | İş | Mevcut durum | Neden sonraki dönem |
|---|---|---|---|
| **P3** | Ortak merkezi talep–portföy eşleşme kartları ve broker notları | **Merkezi dönem** | Geçiş yılında üç laptop bağımsız çalışıyor; güvenli ortak veri kaynağı olmadan gerçek zamanlı ofis genel kartları doğru çalışmaz. |
| **P3** | Laptop kapalıyken zamanlı push/SMS/e-posta bildirimleri | **Merkezi dönem** | Mevcut karar uygulama açıldığında uyarıdır. Arka plan bildirimleri güvenilir sunucu/zamanlayıcı gerektirir. |
| **P3** | 20 danışman için merkezî kullanıcı yönetimi, kalıcı audit ve eş zamanlı veri | **Merkezi dönem** | Bir yıllık offline dönemde yerel kullanıcı kimliği + şifreli merge tercih edildi. Bulutta merkezi roller ve ana veri kaynağına geçilir. |
| **P3** | Kalıcı yönetim panosu, ortak performans/raporlama ve erişim denetimi | **Merkezi dönem** | Offline raporlar cihaz/merge kapsamındadır; ofis genelinde anlık ve eksiksiz görünüm için merkezî veritabanı gereklidir. |

## Önerilen çalışma sırası

| Sıra | Paket | İçerik | Kullanıcıdan beklenen tek kabul girdisi |
|---:|---|---|---|
| 1 | **Windows çalışma ekranı paketi** | Dört offline ekranda gerçek yeşil yan panel, opak seçiciler, güçlü ana düğmeler, mühürlü yetki üst bilgisi ve üç aylık süre. | Güncel kaynakla Windows’ta dört ekranın görüntüsü. |
| 2 | **Belge ve abonelik paketi** | Yetki/kira A4, DASK-sayaç, seçili ekler, imza kutuları ve baskı marjları. | Yetki ve kira önizleme/baskı ekran görüntüleri. |
| 3 | **Üç laptop güvenlik paketi** | Export, doğrulama, merge, rollback, manager yetkisi ve işlem kapanışı tatbikatı. | Üç cihaz yedeği ve manager sonucu. |
| 4 | **İş verisi kabul paketi** | Urla, taslak çağırma, hedefler, talep eşleşmesi, tahliye/onay ve finans raporları. | Gerçek örnek kayıtlarla günlük kullanım teyidi. |
| 5 | **Bulut geçiş planı** | Merkezi veri, gerçek zamanlı eşleşme/notlar, arka plan uyarıları ve 20 danışman ölçeği. | Sunucu/bulut tercihinin netleşmesi. |

## Karar önerisi

Önerim, yeni modül eklemeyi geçici olarak durdurup önce **1. paketi** bitirmektir. Çünkü kullanıcının son geri bildirimleri işlev eksikliğinden çok, mevcut işlevlerin Windows ekranında yeterince görünür ve tutarlı olmaması üzerinedir. İlk paketin gerçek Windows kabulü alınmadan ikinci pakete geçilmemelidir.

Bu dosya, ayrıntılı `todo.md` listesinin yerine geçmez; kullanıcıya karar vermeyi kolaylaştıran üst seviye kayıttır. Kodla tamamlanan ancak Windows kanıtı bekleyen işler burada açıkça korunur.

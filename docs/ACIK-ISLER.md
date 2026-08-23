# Global 1881 — Açık İşler ve Kabul Takibi

Bu dosya, `todo.md` içindeki ayrıntılı teknik geçmişi sadeleştirir. Her yeni bulgu önce burada ilgili başlığa, sonra `todo.md` içindeki doğrulanabilir göreve bağlanır. Bir görev yalnız kodu yazıldığında değil, gerekli test ve gerçek Windows/Electron kanıtı tamamlandığında kapanmış sayılır.

## Şu anda uygulanıyor

| Öncelik | İş | Kabul ölçütü |
|---|---|---|
| 1 | **Ofis Akışı yan paneli** | Koyu yeşil panel Yetki Sözleşmeleri, Kira Sözleşmeleri, Yerel Çalışma Alanı ve İşlem Kapanışları ekranlarında geniş Windows görünümünde sağda; dar görünümde ana içeriğin altında görünür. |
| 2 | **Rol ve gizlilik** | Danışman yalnız kendi cihaz/kullanıcı kapsamındaki görevleri görür. Yerel manager oturumu açık değilken başka kullanıcı adı, müşteri adı veya sözleşme başlığı paylaşılmaz. |
| 3 | **Yetki belgesi üst bilgisi** | Sağlanan şeffaf mühür net ve baskıya uygun görünür; ofis adı/belge bilgisi dengeli büyüklükte, A4 içerik alanı ortalanmış olur. |
| 4 | **Yetki süresi varsayılanı** | Yeni yetki sözleşmeleri üç ayla başlar; kullanıcı değiştirebilir ve seçilen süre snapshot/A4 metnine yansır. |

## Kod tamam, gerçek Windows kabulü bekleniyor

| Alan | Windows/Electron’da kontrol edilecek kanıt |
|---|---|
| Açılır listeler ve Yerel kaydet | Kayıt türü ile kayıt filtresi açıldığında opak panelin arka form metniyle karışmaması; kaydet düğmesinin etkin/pasif metninin okunması. |
| A4 kira/yetki belgeleri | Mühür, taraf ayrımı, sol–sağ baskı alanı, ana sözleşme ve seçili eklerin Windows baskı önizlemesinde doğru görünmesi. |
| DASK ve abonelik alanları | DASK poliçe no ile elektrik, su ve doğalgaz sayaç no alanlarının kira formu, ana A4 ve teslim eklerinde görünmesi. |
| Şifreli yedek/merge | Üç laptop yedeğinin doğrulama, manifest, çakışma ve manager merge adımlarıyla denenmesi. |
| İşlem kapanışı | Tahsilat beyanı, yerel broker manager açma/kilitleme ve kapanış istisnasının gerçek Electron kullanımında denenmesi. |
| Türkiye tarih standardı | Vade, işlem kapanışı, yerel kayıt/manifest, sözleşme ve rapor tarihlerinin `GG.AA.YYYY`; yenileme/audit zamanlarının `GG.AA.YYYY SS:DD` görünmesi. Kaynak dönüşümü ve 88 test tamamdır; Electron ekran kanıtı beklenir. |

## Merkezi sunucu dönemine bırakılan işler

Güvenli müşteri talebi–portföy eşleşmesi ile broker notları, merkezi veri kaynağına geçildiğinde Ofis Akışı kartlarına bağlanacaktır. Geçiş yılındaki offline uygulama, cihazdaki kayıtlar ve şifreli manager merge süreciyle çalışmaya devam eder.

## Kullanıcıya durum sunum biçimi

Kullanıcı açık işleri sorduğunda yanıt, **tamamlananlar**, **üzerinde çalışılanlar**, **Windows kanıtı bekleyenler** ve **merkezi sunucu dönemine bırakılanlar** başlıklarıyla verilir. Ayrıntılı geçmiş `todo.md` içinde korunur; bu dosya silinmez, yalnız durumları güncellenir.

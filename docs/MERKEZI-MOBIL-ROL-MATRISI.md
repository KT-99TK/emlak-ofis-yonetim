# Merkezi Mobil Rol Matrisi

## Temel ilke

Merkezi mobil uygulama, laptoplardaki yerel IndexedDB kaydını değil yalnız merkezi API ve veritabanındaki kayıtları kullanır. İstemcide gösterilen rol etiketi yetki kaynağı değildir; her müşteri, portföy, sözleşme, vade, tahsilat ve belge sorgusu sunucuda oturumdaki kullanıcı kimliğiyle sınırlandırılır.

| Rol | Müşteri / portföy | Sözleşme / vade | Aktif imzalı PDF | Geçmiş müşteri arşivi | Finans ve gün sonu |
|---|---|---|---|---|---|
| Danışman | Yalnız `assignedUserId` kendisi olan kayıtlar | Yalnız kendi kayıtları | Yalnız kendi imzalı/aktif sözleşmesine ekler ve kendi belgesini açar | Yalnız kendisine bağlı geçmiş belge kartları | Yalnız kendi beyanı; manager doğrulaması yok |
| Broker manager | Ofis kapsamı | Ofis kapsamı ve istisna yönetimi | Denetim için açar, silmez; gerekçeli geçersiz kılabilir | Açık manager işlemiyle geçmiş PDF ekler ve denetler | Gün sonu, banka eşleştirme, doğrulama ve istisna kaydı |
| Atanmış ofis asistanı | Yalnız manager tarafından atandığı ekip/kapsam | Aynı operasyon kapsamı; hukuki/finansal kesin işlem yok | Görüntüleme, silme/değiştirme yok | Yalnız atanan kapsamı görüntüler; manager izni olmadan içe aktarma yok | Tahsilat beyanı görebilir; doğrulama/mahsup ve gün sonu yapamaz |

## Kesin gizlilik sınırları

Bir danışman başka danışmanın müşteri adı, telefon, e-posta, malik adı, kimlik/VKN, adres, not, tam sözleşme ve PDF’sini alamaz. Bu kural kullanıcı arayüzü gizlemesiyle sınırlı değildir; sunucu sorgusu, belge indirme rotası ve S3 imzalı URL üretimi erişimi baştan reddeder.

Ofis asistanı rolü merkezi şemada ancak broker manager tarafından etkinleştirildikten ve `managerId` ile ekip/kapsam bağı kurulduktan sonra aktif kabul edilir. Bu rol danışman rolünün üzerinde genel ofis erişimi vermez. Yardımcının erişebileceği danışman/ekip kümesi kayıtlı atamayla üretilir; atama kaldırılırsa erişim bir sonraki sunucu sorgusunda kesilir.

## Oturum ve belge açma

Merkezi oturum, doğrulanmış uygulama hesabı üzerinden gelir. Mobil cihaz yalnız oturum bilgisini taşır; veri önbelleği hassas API yanıtlarını kalıcı saklamaz. Belge açma istekleri her seferinde oturum, rol, danışman sahipliği ve geçersizlik durumunu denetleyen sunucu rotasından geçer. Kopyalanan genel depolama bağlantısı erişim kanıtı sayılmaz.

## Kabul senaryoları

| Senaryo | Beklenen sonuç |
|---|---|
| Danışman A, Danışman B’nin müşteri veya belge kimliğiyle URL açar | Sunucu `FORBIDDEN` ile reddeder; isim ve metadata dönmez |
| Manager aynı belgeyi açar | Denetim amacıyla açabilir; geçersiz belgeyi yalnız manager görür |
| Ofis asistanı atanmamış ekip kaydını ister | Sunucu `FORBIDDEN` ile reddeder |
| Ofis asistanı tahsilatı kapatmaya veya belgeyi geçersiz kılmaya çalışır | Sunucu `FORBIDDEN` ile reddeder |
| Manager atamayı kaldırır | Sonraki mobil yenilemede asistanın ilgili kayıtları kaybolur |

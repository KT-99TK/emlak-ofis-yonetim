# Kontrollü Offline → Merkezi Aktarım Önizlemesi

## Amaç

Bu tasarım, manager tarafından doğrulanmış offline merge kayıtlarını merkezi sisteme **doğrudan yazmadan önce** incelemeye yarar. Önizleme; kaynak kayıt türünü, danışman kullanıcı kodunu, merkezi kullanıcı eşlemesini, sürümü ve gerekli manuel adımları gösterir. Laptop kayıtlarını değiştirmez, merkezi API’ye yazmaz ve PDF baytlarını yüklemez.

## Ön koşullar

1. Yedek AES-GCM/PBKDF2 ile açılmış, SHA-256 checksum ve ECDSA imza doğrulamasından geçmiştir.
2. Manager merge sonrası çakışmalar için karar vermiştir.
3. Offline danışman kodları merkezi kullanıcı kimlikleriyle manager tarafından eşleştirilmiştir.

## Önizleme sınıfları

| Offline kayıt türü | Merkezi hedef | Önizleme davranışı |
|---|---|---|
| `client` | müşteri | Kullanıcı eşlemesi tamam ise manager uygulama listesine alınır |
| `property` | portföy | Kullanıcı eşlemesi tamam ise manager uygulama listesine alınır |
| `contract` | sözleşme | Kullanıcı eşlemesi tamam ise manager uygulama listesine alınır |
| `obligation` | vade | Kullanıcı eşlemesi tamam ise manager uygulama listesine alınır |
| `ledger` | ön muhasebe satırı | Kullanıcı eşlemesi tamam ise manager uygulama listesine alınır |
| `contractArchive` / `activeContractDocument` | belge metadata’sı | PDF baytı yüklenmez; belge başına ayrı açık onay bekler |
| `request`, `target`, `transaction`, `evacuation`, `ownerApproval` | manuel inceleme | İlk aktarımda otomatik uygulanmaz |

## Zorunlu güvenlik sınırları

> Önizleme, **apply** değildir. Merkezi kayda yazma; managerın açık ikinci onayı, uygulama kaydı ve audit olayı olmadan başlatılamaz.

PDF dosyaları offline bilgisayardan merkezi depolamaya varsayılan olarak taşınmaz. Her belge için danışman sahipliği, aktif/geçmiş ayrımı, checksum ve kullanıcı onayı ayrıca değerlendirilir. Böylece ham eski PDF veya yanlış aktif dönem belgesi merkezi müşteri dosyasına sessizce alınmaz.

## Sonraki geliştirme

Önizleme katmanı, merkezi manager ekranına yalnız yetkili rol altında bağlanacaktır. Uygulama aşamasında önce müşteri/portföy/sözleşme/vade/ledger metadata’sı için idempotent mapping ve audit, sonra belgeler için ayrı onaylı aktarım uygulanacaktır.

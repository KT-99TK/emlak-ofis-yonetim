# Müşteri Dijital Arşivi Tasarımı

**Amaç:** Eski sözleşmeleri yeni Yetki/Kira sözleşmesi, tahakkuk, tahsilat, vade veya danışman performans hesabı oluşturmadan, salt-okunur arşiv belgeleri olarak saklamak.

## Kayıt ayrımı

| Alan | Arşiv PDF belgesi | Güncel operasyon sözleşmesi |
|---|---|---|
| Kayıt türü | `contractArchive` | `contract` |
| Mali/vade etkisi | Yok | İş kurallarına göre oluşur |
| Düzenleme | Salt-okunur kaynak belge | Form/snapshot üzerinden sürümlü |
| Görünüm | Ayrı **Müşteri Dijital Arşivi** ekranı | Yetki ve Kira çalışma ekranları |
| Arama | Danışman, müşteri, belge türü ve tarih | Aktif iş akışı alanları |

## Erişim matrisi

| Rol | Kendi arşiv belgesi | Başka danışman arşivi | İçe aktarma |
|---|---|---|---|
| Danışman | Tam görüntüleme | Görünmez | Yok |
| Ofis asistanı | Yetkili görüntüleme | Yetkili görüntüleme | Broker manager onayıyla |
| Broker manager | Yetkili görüntüleme | Yetkili görüntüleme | Yetkili |

Arşiv meta verisi danışman kullanıcı kimliği, **müşteri adı**, belge türü, düzenleme tarihi, müşteriye ait **zorunlu geçmiş işlem özeti**, orijinal dosya adı, SHA-256 bütünlük değeri ve içe aktarma audit olayı taşır. Sözleşme/kayıt numarası beklenmez. Aynı müşteri için birden fazla eski PDF ve işlem notu aynı müşteri arşivinde gruplu görünür. Telefon, TCKN/VKN ve adres yalnız yetkili PDF içeriğindedir; yetkisiz listelerde görünmez.

## Offline dosya ve yedekleme kuralı

Electron uygulamasında PDF dosyaları uygulama paketine değil, Windows kullanıcı veri alanındaki `contract-archive` dizinine yazılır. IndexedDB yalnız dosya meta verisi ve sahiplik bilgisini tutar. Bu nedenle danışman laptopunda yalnız kendi arşiv belgeleri bulunur; diğer danışmanların PDF dosyaları danışman laptopuna hiç dağıtılmaz. Manager laptopu, haftalık birleştirme sonrası kendisine aktarılmış arşiv dosyalarını ayrıca şifreli arşiv yedeğine alır.

> Geçiş yılı offline modelinde cihazın Windows kullanıcı hesabına fiziksel erişim yetki sınırıdır. Merkezi sunucuya geçildiğinde PDF dosyası ve meta verisi ayrı yetkili depolamaya taşınır; erişim server tarafında rol ve sahiplik ile uygulanır.

## Kabul akışı

1. Broker manager veya yetkili ofis asistanı PDF seçer; danışman kullanıcı kodu, müşteri adı ve isteğe bağlı geçmiş işlem özetini atar.
2. Uygulama dosya türü, boyutu ve SHA-256 değerini doğrular; yerel audit kaydı oluşur.
3. Belge yalnız **Müşteri Dijital Arşivi** ekranında görünür; aktif kira/yetki listelerine ve finansal hesaplara girmez.
4. Danışman kendi arşivini açar; broker/ofis asistanı yetkili görüntüleme yapar; diğer danışmanlar belgeyi görmez.
5. Örnek PDF paketi ile dosya açma, arama, sahiplik filtresi, checksum ve Windows/Electron kabulü doğrulanır.

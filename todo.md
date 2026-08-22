# Project TODO

- [x] İncelenecek HTML örnek paketini projeye al ve sayfa, navigasyon, iş akışı, arayüz kalıpları ve veri alanları envanterini çıkar
- [x] Broker manager ve consultant rolleri için hiyerarşi, görünürlük ve işlem yetki matrisi oluştur
- [x] Güvenli giriş, kullanıcı yönetimi, takım/manager ilişkisi, rol tabanlı ekran/işlem izinlerini uygula
- [x] Müşteri kayıtlarını tekilleştir ve müşteri bilgilerini sözleşmelerle ilişkilendir
- [x] Mülk kayıtlarını tekilleştir ve mülk bilgilerini kira/satış sözleşmeleriyle ilişkilendir
- [x] Ofis onaylı kira sözleşmesi şablonlarını, kayıtlarını, durumlarını ve yazdırılabilir çıktılarını uygula
- [x] Ofis onaylı satış sözleşmesi şablonlarını, kayıtlarını, durumlarını ve yazdırılabilir çıktılarını uygula
- [x] Sözleşme durum geçişleri, onay akışları ve kritik değişikliklerin audit kayıtlarını uygula
- [x] Gelir, gider, alacak, borç ve işlem bağlantılı tahsilat/ödeme kayıtlarını içeren ön muhasebe modülünü uygula
- [x] Broker manager için ekip bazlı sözleşme, tahsilat, ödeme ve nakit akışı özetlerini uygula
- [x] Ofise özel logo, tipografi, renk sistemi ve HTML örneğinden uyarlanan görsel kalıpları uygula
- [x] Responsive ekranları, boş/yükleniyor/hata durumlarını ve erişilebilir klavye akışlarını doğrula
- [x] Vitest testlerini yaz, tür kontrolü ve test komutlarını çalıştır
- [x] Uygulama ilk sürümünü checkpoint ile teslimata hazırla

## Yeni kapsam: kira dönemleri, vergi takibi ve veri güvenliği

- [ ] Kira dönemi, kira tahakkuku, vergi yükümlülüğü ve ödeme tarihlerini modelle
- [ ] Vade tarihinden önce çok kademeli uygulama içi uyarı ve bildirim tercihleri ekle
- [ ] Kira/vergi ödeme durumlarını ve gecikme risklerini dashboard üzerinde göster
- [ ] Kira ve vergi mali tablolarını dönem, portföy, danışman ve ödeme durumu bazında oluştur
- [ ] PC tek kullanıcı ve server merkezi kullanımını ayıran veri içe/dışa aktarma akışını tasarla
- [ ] Şifreli yedek alma, geri yükleme öncesi doğrulama, sürümleme ve audit kaydı ekle
- [ ] Periyodik uyarıların platform zamanlayıcısı ile güvenli, idempotent ve deploy sonrası çalışmasını uygula
- [ ] Yeni vade, mali tablo ve yedekleme akışlarını test edip güncel checkpoint oluştur

## Mimari kararı: merkezi server + PC kısa yolu

- [ ] Merkezi serverı tek doğruluk kaynağı olarak belgeleyip istemci bağlantı ve kısa yol kullanım kılavuzunu hazırla
- [ ] PC üzerinde veri tutmayan güvenli web kısayolu/PWA kullanım modelini uygula
- [ ] Server erişilemezse salt-okunur durum, bağlantı uyarısı ve yeniden bağlanma akışını tanımla
- [ ] Merkezi yedekleme ve geri yükleme işlemlerini yalnızca manager yetkisiyle çalıştır

## Yeni kapsam: tahliye ve yeniden kiralama onayı

- [ ] Kira sözleşmesine tahliye ihbar süresi, anlaşmaya özel bildirim kuralı ve tahliye tarihi alanlarını ekle
- [ ] İki ay veya tanımlanan süre öncesinde danışman/manager uyarı akışını ekle
- [ ] Tahliye yaklaşan kiralıkları ayrı görev ve takvim görünümünde göster
- [ ] Yeniden kiralama talebini mülk sahibi onayına gönderen durum akışını ekle
- [ ] Mülk sahibi onayı alınmadan yeni kiralama ilanı oluşturmayı server tarafında engelle
- [ ] Onay, ret, tarih ve açıklama bilgilerini audit kaydına yaz
- [ ] Geçiş dönemi için yerel/tek kullanıcı çalışma ve merkezi servera aktarılabilir yedek formatını netleştir

## Yeni kapsam: bağımsız geçiş sürümü

- [ ] Her laptopta bağımsız çalışacak yerel veri katmanını ve kurulum modelini belirle
- [x] Her kullanıcı için imzalı/tarihçeli yedek dışa aktarma dosyası üret
- [x] Manager laptopunda üç yedeği doğrulayıp çakışmaları gösteren birleştirme ekranı oluştur
- [ ] Birleştirme sonrası yeni ana yedek üret ve geri alma noktası sakla
- [ ] Bağımsız geçiş verisini gelecekte merkezi server veritabanına aktarılabilir formatta tut
- [ ] Üç laptoplu deneme prosedürünü ve veri kaybını önleme kılavuzunu hazırla

## Kesinleşen ortam: Windows 10/11 offline

- [x] Windows 10/11 için bağımsız offline masaüstü paketleme yaklaşımını seç ve proje kararını belgeleyerek kaydet
- [ ] Her laptop için cihaz kimliği, kullanıcı kimliği, kayıt sürümü ve son senkronizasyon bilgilerini ekle
- [ ] Offline çalışma sırasında kira, vergi, tahliye, onay, sözleşme ve ön muhasebe kayıtlarının yerel veritabanına yazılmasını sağla
- [ ] Manager laptopunda üç cihaz yedeğini çakışma kontrollü birleştirme akışına dönüştür
- [ ] Kurulum, masaüstü kısayolu, haftalık yedek ve geri alma prosedürünü Windows kullanıcı kılavuzuna yaz

## Offline sürüm teknik tamamlamaları

- [x] Yedek dosyalarına checksum/imza doğrulaması, backup manifesti ve geri yükleme doğrulama akışı ekle
- [ ] Offline sürüm için gerçek Windows masaüstü paketleme teknolojisini seçip build/install scriptleri ve konfigürasyonu uygula
- [ ] Offline veri modeline userId, recordVersion ve lastSyncAt alanlarını ekleyip UI ve backup akışına bağla
- [ ] Tahliye, mülk sahibi onayı ve ön muhasebe için ayrı offline entity'ler ve gerçek form alanları ekle

## Mimari tutarlılık ve dağıtım düzeltmeleri

- [x] Offline geçiş sürümü için tek yerel veri katmanı seç ve dokümantasyon ile kodu aynı mimaride hizala
- [ ] Windows offline sürüm için desteklenen dağıtım formatını üret, doğrula ve kullanım adımlarını belgeye bağla
- [x] Seçilen yerel veri katmanını manager birleştirme akışıyla uyumlu hale getirip üç laptop senaryosu için son kurulum modelini netleştir

## Yedek manifesti ve doğrulama görünürlüğü

- [x] Offline yedekler için checksum’a ek olarak cihaz, kullanıcı, sürüm, kayıt sayısı, oluşturulma zamanı, checksum ve imza alanlarını içeren manifest ekle
- [x] Geri yükleme/birleştirme öncesi manifest önizlemesi ve doğrulama sonucunu kullanıcıya göster
- [x] Başarısız manifest/checksum doğrulamasında içe aktarmayı kesin olarak engelle

## Güvenli içe aktarma onayı

- [x] Yedekleri önce parse/doğrula, manifest önizlemesini göster; manager onayından sonra ayrı apply/import adımıyla veriyi yaz
- [ ] Tekil geri yükleme akışında cihaz, kullanıcı, sürüm, kayıt sayısı, tarih ve checksum/imza durumunu gösteren önizleme ekle

## Offline kullanıcı kimliği

- [x] Offline sürümde kullanıcı kimliğini ayarlayan ve koruyan kurulum/ayar ekranı ekle; gerçek userId manifestte üretilebilsin
- [x] Yedek dosya adı ve manifest önizlemesinde cihaz ile kullanıcı bilgisini görünür göster

## Son kullanıcı kimliği doğrulamaları

- [x] Manifest önizlemesinde userId alanını açıkça göster ve ekran kontrolüyle doğrula
- [x] Offline kullanıcı kimliği ayarlanmadan kayıt oluşturma ve yedek alma işlemlerini engelle veya açık uyarı göster

## Manifest UI doğrulaması

- [ ] Manifest önizlemesinde userId görünümünü son değişiklikten sonra screenshot veya UI testi ile doğrula ve kaydet
- [ ] Tekil/çoklu yedek önizleme ekranları için userId, deviceId ve doğrulama durumunu kapsayan UI doğrulama testi ekle

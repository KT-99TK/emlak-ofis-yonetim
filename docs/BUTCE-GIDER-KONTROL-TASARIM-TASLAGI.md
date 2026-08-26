# Global 1881 — Broker Manager İç Denetim, Bütçe ve Katkı Kontrolü Taslağı

> **Sınır notu:** Bu taslak, broker managerin yönetim kararları için hazırlanmış resmiyet taşımayan bir iç denetim, bütçe ve performans kontrol modelidir. e-Fatura, gelir beyanı, geçici vergi, yıl sonu mahsuplaşması, resmî genel muhasebe fişi, KDV kaydı veya beyanname üretmez. Bu işlemler mali müşavir tarafından resmî sistemlerde yürütülür; uygulamaya gerekirse yalnız teyitli referans toplamı girilir.

## 1. Amaç ve sınır

Modülün amacı, ofisin yıllık gider bütçesini tanımlamak; her ay gerçekleşen harcama, henüz ödenmemiş sabit taahhüt, ödeme kaynağı ve bütçe sapmasını tek broker manager ekranında okumaktır. Bu modül **genel muhasebenin alternatifi değil**, Kasa-Banka ve İşlem Kapanışları kayıtlarının resmiyet taşımayan yönetimsel kontrol katmanıdır.

EİDS onayındaki çalışma mantığına paralel olarak, resmî kaynağın yerine geçmeye çalışmaz: dışarıdaki resmî süreç tamamlandıktan veya ofis içi bilgi oluştuğunda, yetkili kişi gerekli tutar/durum/referansı **elle kaydeder**. Bu manuel kayıt, ofisin kendi işlemi üzerindeki görünürlüğünü ve denetimini güçlendirir; resmî e-Fatura, vergi veya mali müşavir kaydını değiştirmez.

Tekdüzen Hesap Planında `760` Pazarlama, Satış ve Dağıtım Giderleri; `770` Genel Yönetim Giderleri; `780` ise Finansman Giderleri olarak yer alır. `100` Kasa ve `102` Bankalar hesapları ise ödemeyi yapan kaynağın izlenmesi için kullanılır. [1] [2]

## 2. Önerilen ofis içi hesap planı

Bu alt kodlar **Global 1881’in yönetimsel bütçe kodlarıdır**. Başındaki 760/770/780 ana hesap referansı muhasebe danışmanıyla eşleştirilecektir; uygulama otomatik resmî muhasebe fişi oluşturmayacaktır.

| Grup | Ofis içi kod | Gider kalemi | Bütçe karakteri | Aylık takip mantığı |
|---|---|---|---|---|
| 760 · Pazarlama | `760.01` | Sahibinden ve diğer ilan portalları | Sabit / sözleşmeli | Aylık abonelik, yenileme tarihi, taahhüt sonu |
| 760 · Pazarlama | `760.02` | Sosyal medya reklamları | Değişken | Aylık limit, kampanya, portföy/şehir bilgisi |
| 760 · Pazarlama | `760.03` | Branda, tabela, baskı ve görsel üretim | Değişken | İş/emlak bazlı harcama ve teklif karşılaştırması |
| 760 · Pazarlama | `760.04` | Dijital lead, CRM ve portföy tanıtım servisleri | Sabit / değişken | Abonelik veya kampanya bazlı izleme |
| 760 · Pazarlama | `760.05` | Etkinlik, sponsorluk ve portföy tanıtımı | Değişken | Ön onay ve etkinlik sonrası gerçekleşen |
| 770 · Genel Yönetim | `770.01` | Ofis kira ve aidatı | Sabit | Vade günü, sözleşme bitişi, gecikme riski |
| 770 · Genel Yönetim | `770.02` | Elektrik, su, doğalgaz, internet ve telefon | Yarı sabit | Dönemsel fatura, son ödeme ve sapma |
| 770 · Genel Yönetim | `770.03` | Kırtasiye, temizlik ve ofis sarfı | Değişken | Tedarikçi ve aylık limit |
| 770 · Genel Yönetim | `770.04` | Yazılım, lisans ve kurumsal abonelikler | Sabit | Yenileme tarihi, kullanıcı sayısı, ödeme periyodu |
| 770 · Genel Yönetim | `770.05` | Mali müşavir, hukuk ve dış hizmetler | Sabit / değişken | Sözleşme/iş emri ve fatura takibi |
| 770 · Genel Yönetim | `770.06` | Temsil, ağırlama ve ikram | Değişken | Amaç, katılımcı ve broker onayı |
| 770 · Genel Yönetim | `770.07` | Bakım, onarım, güvenlik ve ofis hizmetleri | Değişken | İş emri, teklif ve ödeme kontrolü |
| Personel bütçesi · ayrı yönetim grubu | `PERS.01` | Maaş, prim, yemek, ulaşım ve yan haklar | Sabit / değişken | Aylık personel bütçesi ve gerçekleşen; bordro hesaplama veya resmî SGK/beyanname üretimi yapılmaz |
| 780 · Finansman | `780.01` | Kredi, faiz ve finansman maliyetleri | Değişken | Vade, oran ve banka hareketi |
| Yatırım / ayrı izleme | `255` referansı | Mobilya, bilgisayar, ekipman ve demirbaş yatırımı | Tek seferlik yatırım | Gider bütçesine değil, yatırım planına alınır |

> **Temsil ve ağırlama notu:** Bu kalem müşteri kazanımına doğrudan bağlıysa 760, genel yönetim amaçlıysa 770 altında sınıflanabilir. Başlangıçta `770.06` yönetimsel izleme için güvenli varsayılandır; resmî muhasebe sınıflaması mali müşavir onayıyla yapılmalıdır.

## 3. Broker manager ekranı

`Kasa ve Banka` menüsünün altında yeni bir **Bütçe ve Gider Kontrolü** ekranı önerilir. İlk ekran yıllık bütçenin sağlığını, ikinci ekran ise aylık operasyonu göstermelidir.

| Bölüm | Broker managerin gördüğü bilgi | Karar amacı |
|---|---|---|
| Yıllık özet | Toplam yıllık bütçe, YTD gerçekleşen, açık taahhüt, yıl sonu tahmini, sapma | Ofisin bütçe sınırı içinde kalıp kalmadığını anlama |
| Bu ay | Bu ay bütçe, gerçekleşen, ödeme bekleyen sabit gider, aşım/uyarı | Hangi kaleme müdahale gerektiğini görme |
| Sabit taahhütler | Sahibinden, yazılım, kira, aidat gibi tekrar eden giderlerin vade/yenileme listesi | Sürpriz ödeme ve unutulan yenileme riskini azaltma |
| Gider dağılımı | 760/770/780 bazında aylık ve yıllık toplam | Pazarlama mı, ofis sabit gideri mi artıyor görme |
| Bekleyen onaylar | Bütçesiz veya limit aşan harcama talepleri | Harcama gerçekleşmeden yönetici kararı alma |

### Seçilebilir iç denetim kapsamı

Broker manager, aynı tarih dönemi için tek bir birleşik tabloya bağlı kalmayacaktır. Ekranın üstündeki kapsam seçicisinden aşağıdaki görünümler tek tek veya birlikte açılabilecektir. Seçilmeyen grup hem tablo hem toplam hem de grafik hesaplamasından çıkarılır; böylece dar mutabakat ile bütün ofis görünümü aynı ekranı gereksiz kalabalıklaştırmadan kullanılabilir.

| Kapsam seçeneği | Dahil edilen kayıtlar | Başlıca kullanım |
|---|---|---|
| `Danışman ↔ Ofis Pay Hareketleri` | Hizmet bedeli, danışman payı, ofis payı, sistem dışı nakit bildirimi, ofis kasasına aktarılan komisyon | Danışman/ofis mutabakatı ve açık ofis payı |
| `Ofis Gelirleri` | Doğrulanmış ofis payı ve kullanıcı tarafından eklenen diğer ofis içi gelir kayıtları | Ofisin operasyonel gelir katkısı |
| `Personel Giderleri` | Maaş, prim, yemek, ulaşım ve yan haklar için iç denetim kayıtları | Personel bütçesi ve aylık sapma |
| `Ofis Giderleri` | Pazarlama, ilan portalı, reklam, branda, sabit gider, yazılım, temsil/ağırlama ve dış hizmetler | Ofis bütçe disiplini ve maliyet görünümü |
| `Tümü` | Yukarıdaki dört kapsamın seçilmiş dönemdeki birleşimi | Yönetimsel faaliyet sonucu ve genel ofis görünümü |

Varsayılan görünüm `Tümü` olabilir; ancak broker manager her oturumda kapsam seçimini değiştirebilir. Danışmanlar yalnız kendi pay hareketleri/özetini görür; personel/ofis giderleri ve diğer danışmanların hareketleri görünmez.

## 4. İş akışı

Yılın başında broker manager her kod için 12 aylık plan tutarını girer. Sabit giderlerde tek kayıtla aylık dağılım otomatik oluşturulur; örneğin yıllık ilan portalı aboneliği nakit olarak peşin ödenmiş olsa bile yönetim raporunda 12 aya eşit dağıtılabilir. Bu, **nakit çıkışı** ile **bütçe tüketimini** ayrı görmeyi sağlar.

Asistan, ödeme öncesi sabit gideri veya yeni harcamayı kaydeder; ödeme kaynağını `Kasa`, `Banka` veya `Kart` olarak seçer; tedarikçi, vade, belge numarası ve tutarı ekler. Kasa-Banka hareketi oluştuğunda gerçek harcama ilgili bütçe koduna bağlanır. Broker manager, aylık raporda üç tutarı birlikte görür: **bütçe**, **gerçekleşen**, **taahhüt edilmiş fakat henüz ödenmemiş**. Personel grubu bu raporda ayrı satırda görünür; bordro hesaplaması veya SGK/vergi işlemi bu modülün dışında kalır.

| Durum | Kural | Ekran davranışı |
|---|---|---|
| Normal | Gerçekleşen + açık taahhüt, aylık bütçenin %80’inin altında | Yeşil / nötr bilgi |
| İzleme | Toplam kullanım %80–%100 aralığında | Kehribar uyarı |
| Aşım | Toplam kullanım aylık bütçeyi geçiyor | Kırmızı sapma ve broker onayı |
| Bütçesiz harcama | İlgili ay/kod için plan yok | “Bütçe dışı” etiketi ve gerekçe zorunluluğu |
| Temsil/ağırlama eşiği | Kayıt tutarı, başlangıçta tanımlı `3.000 TL` eşiğine eşit veya yüksek | Broker managera bilgi kartı ve bekleyen onay kaydı; eşik altındaki kayıtlar doğrudan gerçekleşen bütçeye gider |
| Bütçe faslı aktarımı | Bir fasıl bütçesi yetersiz, başka fasılın kullanılabilir bütçesi var | Yalnız broker manager; kaynak fasıl, hedef fasıl, tutar, gerekçe ve tarih ile aktarım kaydı oluşturur |
| Süresi yaklaşan taahhüt | Yenileme/ödeme vadesine 30 gün veya daha az kalmış | Yaklaşan vade kartı |

### Bütçe aktarım kuralı

Bir harcama onaylandığında ilgili faslın kullanılabilir bütçesi yetersizse broker manager **bütçe aktarımı** seçeneğini açabilir. Aktarım, yeni bir harcama veya gelir kaydı değildir; yalnız yıllık/aylık plan içindeki tahsisatı kaynak fasıldan hedef fasıla taşır. Kaynak fasılın kalan planı otomatik düşer, hedef faslın planı aynı tutarda artar ve hem ilk bütçe hem de aktarımlar görünür kalır.

| Zorunlu alan | Kural |
|---|---|
| Kaynak / hedef fasıl | Aynı dönem ve aynı bütçe yılı içinde seçilir; kaynak ve hedef aynı olamaz |
| Tutar | Kaynak faslın kullanılabilir bütçesini aşamaz |
| Gerekçe | Serbest metin, zorunlu; örneğin “ilan portalı yenilemesi” veya “reklam kampanyası” |
| Yetki | Yalnız broker manager oluşturabilir, geri alınmış aktarım da ayrı iz kaydı oluşturur |
| Raporlama | Aylık ekranda `İlk Bütçe`, `Aktarımlar`, `Revize Bütçe`, `Gerçekleşen`, `Açık Taahhüt`, `Kalan` sütunları birlikte görünür |

## 5. Yetki sınırı

Danışmanlar bu modülün bütçe ekranını görmez. Ofis asistanı yalnız gider taslağı, belge referansı ve ödeme bekleyen kaydı ekler; bütçeyi değiştiremez veya onay veremez. Broker manager bütçe tanımlar, temsil/ağırlama eşiğini belirler, eşik üstü harcamaya onay verir, gider kodunu değiştirir, fasıllar arası aktarım yapar ve aylık/yıllık raporu görür. Bu kural mevcut rol ve gizlilik modeline uyumludur.

## 6. İlk sürüm kapsamı

İlk sürümde aşağıdaki dört unsur yeterlidir: yıllık bütçe planı, sabit gider/taahhüt takvimi, Kasa-Banka hareketine bağlanan gider kaydı ve aylık sapma ekranı. Fatura OCR, e-Fatura entegrasyonu, e-Fatura kesimi, otomatik muhasebe fişi, bordro, geçici vergi, gelir/kurumlar vergisi hesaplaması, yıl sonu mahsuplaşması ve vergi beyannamesi bu modülün kapsamına alınmayacaktır.

## 7. Ofis Payı ve Danışman Katkı Kontrolü

Bu katman, resmî gelir kaydı veya muhasebe fişi değildir. Amacı, her işlemdeki **hizmet bedeli üretimini**, danışmana ayrılan payı, ofise ayrılan payı ve tahsilatın hangi kanaldan bildirildiğini yönetimsel olarak izlemektir. Böylece broker manager, danışmanın yalnız toplam işlem hacmini değil; ofise sağladığı katkıyı, bekleyen ofis payını ve sistem dışı nakit bildirimlerini de ayırarak görebilir.

| Kayıt alanı | Açıklama | Kontrol kuralı |
|---|---|---|
| Kaynak işlem | Kira/satış sözleşmesi veya işlem kapanış kaydı | Sistem içinden gelirse sözleşme/işlem numarası bağlanır |
| KDV hariç hizmet bedeli | Paylaşım ve faaliyet kârlılığı tabanı | Sözleşme veya işlem dosyasından önerilir; broker manager gerekirse düzeltir |
| KDV | Tahsil edilen, faturalı ve maliyeye ödenecek/mahsuplaşacak vergi bileşeni | Danışman/ofis paylaşımına katılmaz; mali müşavir teyitli vergi takip alanında ayrı izlenir |
| Danışman payı | Danışmanın hak ettiği yönetimsel pay | Varsayılan olarak **KDV hariç** hizmet bedelinin `%60`ı uygulanır; işleme özel override iz bırakır |
| Ofis payı | Ofisin hak ettiği yönetimsel pay | Varsayılan olarak **KDV hariç** hizmet bedelinin `%40`ı uygulanır; danışman payı ile birlikte KDV hariç hizmet bedeline bağlanır |
| Tahsilat kanalı | Sistem içi kasa, sistem içi banka/kart veya sistem dışı nakit bildirimi | Kanal, tutar ve işlem tarihi zorunludur |
| Ofis kasası ek girişi | Komisyon tahsilatından ofis kasasına fiilen bırakılan tutar | İsteğe bağlıdır; kaynak işlem, kasa hesabı, tutar, tarih, teslim alan ve notla Kasa-Banka hareketine bağlanır |
| Doğrulama | Bildirildi, doğrulandı, eksik bilgi, mahsuplaştı | Sistem dışı nakit yalnız broker manager doğrulamasından sonra doğrulanmış toplamda yer alır |
| Belge referansı | Makbuz/fatura/işlem notu veya açıklama | Dosya saklama ilk sürümde zorunlu değil; referans ve not zorunludur |

### Sistem dışı nakit bildirimi

Danışman, sistem dışında tahsil edilen nakit hizmet bedelini ayrı bir **Nakit Bildirimi** olarak girer. Kayıt; ilgili sözleşme/işlem, tahsil tarihi, brüt hizmet bedeli, ofis payı, danışman payı, ödeme alan kişi, kısa açıklama ve referans numarası içerir. Kayıt doğrudan tahsil edilmiş sayılmaz; önce `Bildirildi` durumuna düşer. Broker manager doğruladığında `Doğrulandı`, ofis payı fiilen ofise ulaştığında `Ofis Payı Tamamlandı` durumuna geçer.

Bu ayrım, aynı tahsilatın hem Kasa-Banka kaydında hem nakit bildiriminde iki kez sayılmasını önler. Aynı sözleşme numarası, yakın tarih ve aynı tutar kombinasyonunda sistem olası mükerrer kayıt uyarısı vermelidir.

### Komisyon kaynaklı ofis kasası ek girişi

Komisyon tahsilatının ofis payı nakit olarak kasaya bırakıldığında, kullanıcı isteğe bağlı **Ofis Kasasına Aktarılan Komisyon Payı** kaydı ekler. Bu kayıt Kasa-Banka modülündeki fizikî kasa hareketiyle bağlantılıdır; ofis payı beklenen tutarını azaltır ancak yeni hizmet bedeli veya ikinci tahsilat üretmez.

| Alan | Kural |
|---|---|
| Kaynak işlem | İlgili sözleşme/işlem kapanışı seçilir; serbest nakit eklemesi olarak kullanılamaz |
| Tutar | Ofis payı açık bakiyesini aşarsa broker manager onayı/gerekçesi gerekir |
| Kasa hesabı | Mevcut ofis kasası hesap planından seçilir |
| Teslim alan | Kasayı fiilen teslim alan ofis yetkilisi kayda bağlanır |
| Mutabakat | `Ofis Payı Beklenen`, `Ofis Kasasına Aktarılan`, `Banka/Kartla Ofise Aktarılan` ve `Açık Ofis Payı` ayrı gösterilir |
| Kullanılmama durumu | Alan boş kalabilir; mevcut hesaplamaları veya bütçeyi etkilemez |

### Broker manager aylık ve yıllık katkı tablosu

| Danışman | Hizmet Bedeli Üretimi | Sistem İçi Tahsilat | Dış Nakit Bildirimi | Doğrulanmış Toplam | Danışman Payı | Ofis Payı Beklenen | Ofis Payı Alınan | Açık Ofis Payı | İnceleme |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Her danışman için | Dönem içi sözleşme/işlem kaynaklı | Kasa/banka/kart bağlantılı | Manuel beyan | Yalnız doğrulanmış tahsilat | Paylaşım kuralına göre | Ofisin hak ettiği tutar | Ofise geçtiği doğrulanan tutar | Beklenen eksi alınan | Eksik belge, bekleyen onay, mükerrer risk |

Yıllık görünüm aynı tabloyu aylar sütununda toplar. Bu görünüm, danışmanı kamuya açık bir performans sıralamasına sokmak için değil; broker managerin **üretim, ofis payı ve tahsilat riski** dengesini izlemesi için kullanılacaktır. Danışman kendi hesabında yalnız kendi kayıtlarını ve kendi özetini görür; diğer danışmanların verilerine erişemez.

### KDV ve faaliyet kârlılığı görünümü

KDV, danışman/ofis paylaşımının parçası değildir. Uygulama, tahsil edilen KDV ile mali müşavir tarafından teyit edilmiş ödenen/mahsuplaşan KDV bilgisini ayrı gösterir; bu tutar **ofis payı**, **danışman payı** veya **faaliyet kârı** olarak değerlendirilmez. Uygulama resmî KDV beyannamesi, fatura veya mahsup fişi üretmez.

| Yönetimsel satır | Hesaplama tabanı | Kapsam |
|---|---|---|
| KDV hariç hizmet bedeli üretimi | Sözleşme/işlem kaynaklı net hizmet bedeli | Danışman/ofis paylaşımının başlangıç tutarı |
| Danışman payı | Net hizmet bedeli × `%60` | Danışman katkı/settlement görünümü |
| Ofis payı | Net hizmet bedeli × `%40` | Ofisin yönetimsel gelir katkısı |
| Ofis faaliyet giderleri | Pazarlama, genel yönetim, personel, finansman ve onaylı bütçe kalemleri | Bütçe/Gider Kontrolü ekranından gelir |
| Vergi karşılığı / ödenen vergi | Mali müşavirce teyit edilmiş yönetimsel tutar | Şirket/kişisel vergi yapısına göre sistemde yalnız referans olarak izlenir |
| Yönetimsel faaliyet sonucu | Ofis payı + diğer operasyonel gelirler − faaliyet giderleri − teyitli vergi karşılığı | Resmî mali tablo veya beyanname değildir |

> Danışman ve ofis arasındaki faturalaşma, KDV/stopaj/gelir veya kurumlar vergisi etkileri danışmanın sözleşme statüsüne ve ofisin hukuki/vergisel yapısına göre değişebilir. Uygulama yalnız düzenlenen fatura/makbuz referansını ve mutabakat durumunu izlemeli; resmî hesaplama veya belge üretimi mali müşavir teyidi olmadan yapılmamalıdır.

### Bütçe ilişkisi

Doğrulanmış ofis payı, Bütçe ve Gider Kontrolü ekranındaki nakit karşılama göstergesine katkı sağlar; ancak resmî satış geliri veya muhasebe kaydı olarak işlenmez. Bu sayede broker manager, örneğin ilan portalı ve reklam giderinin ofis payı tahsilatıyla ne ölçüde karşılandığını operasyonel olarak takip eder. Mali müşavir e-Fatura ve beyan süreçlerini kendi resmî sisteminde yürütür; uygulama bu sürecin yerine geçmez.

## 8. Onaylanan karar ve açık parametre

Personel giderleri ilk sürümde **ayrı bütçe grubu** olarak gösterilecektir. Temsil/ağırlama için broker manager onayı yalnız **3.000 TL ve üzerindeki** kayıtlarda istenecektir. Bu eşik, broker manager tarafından daha sonra değiştirilebilir olmalıdır.

Ofis payı ve danışman katkı kontrolü, sözleşme/işlem tahsilatlarından ve manuel nakit bildirimlerinden beslenen ayrı bir yönetimsel katman olacaktır. Varsayılan paylaşım **%60 danışman / %40 ofis** olarak uygulanacaktır. Oran danışman bazında tanımlanabilmeli ve işlem özelinde yalnız broker manager değişikliği/gerekçesiyle iz bırakacak şekilde güncellenebilmelidir.

KDV, paylaşım oranının ve faaliyet kârlılığının dışında tutulacaktır. Faaliyet sonucu ekranında vergi karşılığı/ödenen vergi yalnız mali müşavirce teyit edilmiş yönetimsel referans tutarı olarak ayrı gösterilecektir.

## References

[1]: https://ismmmo.org.tr/dosya/415/Mevzuat-Dosya/tekduzhesapplani.pdf "İSMMMO — Tekdüzen Hesap Planı"
[2]: https://www.izdenetim.com.tr/images/yuklenenler/hesap_plani.html "İzdenetim — Tek Düzen Hesap Planı"
[3]: https://www.muhasebedersleri.com/hesaplar/760-pazarlama-satis-dagitim-giderleri.html "760 Pazarlama, Satış ve Dağıtım Giderleri Hesabı"

# Global 1881 Gayrimenkul — Mimari ve Kaynak Kod Notları

**Belge amacı:** Bu doküman, Global 1881 Gayrimenkul için geliştirilen ofis yönetim sisteminin güncel kaynak kod yapısını, çalışma mimarisini, veri güvenliği yaklaşımını ve bakım kurallarını açıklar. Doküman, mevcut çalışma ağacındaki kaynak kod esas alınarak hazırlanmıştır.

**Durum:** Geliştirme sürümü. Yeni ZIP veya üretim kabul paketi anlamına gelmez.

## 1. Sistem özeti

Global 1881 sistemi, broker manager, danışman ve ofis asistanının ortak çevrimiçi ofis süreçlerini; imzalı sözleşme ve PDF arşivini ise cihaz üzerinde korunabilen offline çalışma alanını bir arada kullanır. Merkezi çevrimiçi tarafta yeni kayıtlar temiz başlangıç politikasıyla oluşturulur. Eski sözleşme, eski PDF, geçmiş finans hareketi, açılış bakiyesi ve devir tutarı çevrimiçi sisteme taşınmaz. Kullanıcı tarafından açıkça onaylanan dar istisna, aktif kira özetlerinin Excel üzerinden aktarılmasıdır.

> Temel ilke: Merkezi sistem yeni başlangıçtan sonra oluşan kayıtları yönetir; geçmiş belge ve finans arşivi offline tarafta korunur.

## 2. Teknoloji katmanları

| Katman | Kullanılan yapı | Sorumluluk |
|---|---|---|
| İstemci | React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/Radix | Sayfalar, formlar, rol bazlı ekranlar ve responsive arayüz |
| API sözleşmesi | tRPC 11 | İstemci ile sunucu arasında tür güvenli sorgu ve mutation akışı |
| Sunucu | Express 4, TypeScript | Oturum bağlamı, tRPC prosedürleri, dosya ve veri işlemleri |
| Veri erişimi | Drizzle ORM, MySQL/TiDB | Şema eşlemesi, sorgular ve migration yönetimi |
| Kimlik | Manus OAuth oturumu | Kullanıcı kimliği, manager/admin ayrımı ve korumalı prosedürler |
| Offline alan | Electron/IndexedDB/AES-GCM tasarımı | A4 sözleşmeler, PDF arşivi, yerel çalışma ve şifreli yedek |
| Dosya saklama | S3 tabanlı storage yardımcıları | Merkezi dosyalarda byte yerine referans ve metadata saklama |
| Test | Vitest, TypeScript denetimi, Vite production build | Birim, sunucu, arayüz ve derleme doğrulaması |

## 3. Kaynak kod haritası

| Dizin/dosya | İçerik |
|---|---|
| `client/src/App.tsx` | Rota kayıtları ve ana uygulama akışı |
| `client/src/components/DashboardLayout.tsx` | Merkezi layout, sidebar ve rol bazlı navigasyon |
| `client/src/pages/` | Home, Contracts, ActiveRentalSummaries, Team, MobileCompanion ve yönetim ekranları |
| `client/src/components/ui/` | shadcn/Radix tabanlı ortak kullanıcı arayüzü bileşenleri |
| `client/src/lib/` | İstemci hesaplamaları, tarih, kira geliri ön bilgi ve güvenlik yardımcıları |
| `server/routers.ts` | tRPC uç noktaları ve rol/prosedür girişleri |
| `server/db.ts` | Merkezi veritabanı yardımcıları, kapsam sorguları ve audit kayıtları |
| `server/onlineStartPolicy.ts` | Temiz online başlangıç tarihi ve yeni kayıt kısıtları |
| `drizzle/schema.ts` | Kullanıcı, ekip, müşteri, sözleşme, finans, aktif kira ve hizmet görevi tabloları |
| `drizzle/*.sql` | Uygulanmış migration kayıtları; özellikle aktif kira ve hizmet görevleri migrationları |
| `shared/` | İstemci-sunucu arasında paylaşılan kod ve iş kuralları |
| `todo.md` | Geliştirme görev geçmişi ve açık kabul işleri |

## 4. Online veri akışı

Kullanıcı OAuth ile oturum açar. İstemci yalnızca tRPC sözleşmelerini kullanır. Sunucu her korumalı istekte `ctx.user` üzerinden kimliği alır; işlem öncesi rol ve kapsam kontrolü yapar. Veri katmanı, listelerde kullanıcı kapsamını tekrar uygular. Kritik değişiklikler audit tablosuna yazılır.

```text
Manus OAuth oturumu
        |
        v
React sayfası -> tRPC prosedürü -> rol/kapsam kontrolü -> server/db.ts
                                                        |
                                                        v
                                             Drizzle -> MySQL/TiDB
                                                        |
                                                        v
                                              auditLogs / sonuç
```

Yeni merkezi kayıtların çoğu `assertCentralOnlineStartAllowsRecord()` üzerinden temiz online başlangıç politikasına tabidir. 27.08.2026 tarihi manager onayıyla tanımlanmıştır; `noBalanceCarry` ve `noOfflineImport` etkindir.

## 5. Rol ve gizlilik modeli

| Rol | Merkezi görünürlük | Temel işlem kapsamı |
|---|---|---|
| Broker manager/admin | Ofis geneli | Ekip kodu, onay, aktif kira aktarımı, hizmet görevlerini manuel yenileme ve finansal yönetim |
| Danışman | Kendi atanmış kayıtları | Kendi müşteri, sözleşme, aktif kira ve müşteri hizmet takipleri |
| Ofis asistanı | Manager tarafından açıkça atanmış danışman kapsamı | Atanmış danışmanların operasyonel takipleri; yetkisiz yeni müşteri/sözleşme ve yönetim işlemleri kapalı |

Kapsam yalnız istemci görünümüne bırakılmaz. `getCentralAccessScope`, aktif kira listeleri, müşteri listeleri, sözleşme listeleri ve belge sorguları sunucu tarafında da filtrelenir. Telefonlar ve müşteri detayları genel broker özet grafiklerine taşınmaz. Danışman dağılım grafiği yalnız danışman kodu ve kayıt sayısı gösterir.

## 6. Aktif kira aktarım mimarisi

Broker manager Excel dosyasını yükler. İstemci dosyayı önce salt okunur ayrıştırır; zorunlu alan, tarih, kira tutarı, taşınmaz kısa tanımı, danışman kodu, telefon çakışması ve mükerrerlik uyarıları aktarım öncesinde gösterilir. Manager açıkça aktarım komutu vermeden mutation çağrılmaz.

Aktif kira aktarımı yalnız şu bilgileri merkezi özete dönüştürür: malik/müşteri adı ve telefonu, kiracı adı ve telefonu, sözleşme tarihi, kira artış tarihi, tahliye tarihi varsa tahliye tarihi, güncel aylık kira, mahalle, taşınmaz konumu, daire bilgisi ve sorumlu danışman. Geçmiş sözleşme/PDF veya finans hareketi aktarılmaz.

Aynı malik adına birden çok taşınmaz; `propertyLocation`, `unitInfo`, mahalle, sözleşme ve sorumlu danışman bileşimiyle ayrılır. Bu sayede Mustafa Ekin gibi birden çok mülkü olan maliklerde kira geliri ön bilgisi malik bazında kümülatif, taşınmaz takipleri ise ayrı kalır.

Aktarım sonucu mevcut merkezi veride 21 aktif kira özeti ve 15 müşteri/malik kartı oluşturulmuştur. Dağılım IP1 için 7, KT1 için 14 kayıttır. `KT0` değeri yalnız bu onaylı eski dosya uyumluluğunda KT1 olarak kabul edilmiştir; yeni danışman kodu standardı hâlâ `IP1`, `KT1`, `CT1`, `CT2` biçimindedir.

## 7. Kira artışı, vergi ön bilgisi ve müşteri hizmetleri

`shared/activeRentalSummary.ts` kira artış tarihi, yaklaşan takip ve taslak bilgilendirme mantığını taşır. `client/src/lib/rentalIncomeTaxEstimate.ts` malik bazında yıllıklaştırılmış toplam kira üzerinden yaklaşık ön bilgi üretir. Bu ekran resmî tahakkuk, beyanname, e-Fatura veya muhasebe belgesi üretmez.

`shared/rentalServiceCalendar.ts` kira artışı, tahliye, emlak vergisi birinci ve ikinci taksitleri ile kira geliri vergi dönemi uyarılarını birleştirir. `rentalServiceTasks` tablosu görev durumunu `planned`, `prepared`, `reviewed`, `shared` akışında saklar. Dış mesaj gönderilmez; danışman taslak hazırlar, manager gözden geçirir, yetkili kullanıcı manuel paylaşım kaydı ve sınırlı müşteri dönüş notu ekler.

Otomatik zamanlanmış görev seçilmemiştir. Mevcut tercih **A — managerın manuel “Görevleri yenile” işlemi**dir.

## 8. Sözleşme numarası standardı

Danışman kodları ad-soyad baş harfleri ve sıra numarasıyla, büyük harfli olarak tutulur. Aynı baş harflere sahip yeni danışmanlarda sıra numarası artırılır.

```text
İbrahim Parin       -> IP1
Kazım Taşlıarmut    -> KT1
Cahit Tercan        -> CT1
Aynı baş harfli yeni danışman -> CT2, CT3 ...

İlk sözleşme        -> IP1-001
Sonraki sözleşme    -> IP1-002
```

Bu kuralı ortaklaştırmak için `shared/consultantCode.ts` oluşturulmuştur. Sözleşme ekranının sonraki numarayı kullanıcı koduna göre önermesi ve sunucu tarafında `KOD-001` biçimini doğrulaması geliştirme aşamasındadır.

## 9. Offline çalışma alanı

Offline alan, imzalı A4 belgeleri ve PDF arşivini merkezi aktif kira özetlerinden ayrı tutar. Danışmanlar yeni belge yükleyebilir; eklenmiş belgeler silinemez. Yerel kayıtlar IndexedDB ve şifreli AES-GCM yedekleme akışıyla korunur. Merkezi temiz başlangıç, offline geçmiş arşivi silmez ve çevrimiçi tarafa tarihsel aktarım yapmaz.

Kasa-banka, ön muhasebe, bütçe/gider, ofis payı ve katkı ekranları iç denetim amacı taşır. Bunlar mali müşavir tarafından yürütülen resmî e-Fatura, vergi beyannamesi veya genel muhasebe kaydının yerine geçmez.

## 10. Güvenlik ve bakım ilkeleri

Kaynak pakete `.env` dosyaları, gerçek token/secret değerleri, kullanıcı veritabanı dump’ı, S3 dosyaları, `node_modules`, `dist`, runtime logları ve geçici yüklemeler dahil edilmemelidir. Migration dosyaları kaynak kodla birlikte korunabilir; veritabanı verisi kaynak paketine alınmaz.

Şema değişikliği önce `drizzle/schema.ts` içinde yapılır, ardından migration üretilir ve veritabanına kontrollü şekilde uygulanır. Destructive SQL kullanılmaz. Uygulama değişikliğinden sonra sırasıyla hedef Vitest, `pnpm test -- --run`, `pnpm exec tsc --noEmit` ve `pnpm build` çalıştırılır.

## 11. Güncel açık işler

| Açık iş | Durum |
|---|---|
| Sözleşme ekranında `IP1-001` / `KT1-001` sonraki numara önerisi ve sunucu doğrulaması | Çalışılıyor |
| CT1 kullanıcı bilgilerinin alınması ve Cahit Tercan hesabına bağlanması | Bekliyor |
| Aktif kira hizmet görevlerinin manager tarafından ilk manuel yenilenmesi | Kullanıcı işlemi bekliyor |
| Danışman ve asistan rol görünürlüğünün gerçek hesaplarla kabulü | Kullanıcı kabulü bekliyor |
| Windows/Electron tek paket kabulü | Kullanıcı kontrolü bekliyor |
| DNS, WordPress ve MX düzenlemeleri | Bilinçli olarak ertelendi |

## 12. Kaynak referansları

Bu dokümandaki proje içi bilgiler aşağıdaki kaynak kod ve tasarım dosyalarından türetilmiştir.

- [`server/db.ts`](../server/db.ts) — Merkezi veri yardımcıları, aktif kira aktarımı, rol kapsamı ve audit akışı.
- [`server/routers.ts`](../server/routers.ts) — tRPC prosedürleri ve korumalı uç noktalar.
- [`server/onlineStartPolicy.ts`](../server/onlineStartPolicy.ts) — Temiz online başlangıç politikası.
- [`drizzle/schema.ts`](../drizzle/schema.ts) — Veritabanı tabloları ve alanları.
- [`shared/activeRentalSummary.ts`](../shared/activeRentalSummary.ts) — Aktif kira takip iş kuralları.
- [`shared/rentalServiceCalendar.ts`](../shared/rentalServiceCalendar.ts) — Hizmet takvimi ve uyarı modeli.
- [`shared/consultantCode.ts`](../shared/consultantCode.ts) — Danışman kodu ve sözleşme numarası yardımcıları.
- [`todo.md`](../todo.md) — Açık işler ve kabul geçmişi.

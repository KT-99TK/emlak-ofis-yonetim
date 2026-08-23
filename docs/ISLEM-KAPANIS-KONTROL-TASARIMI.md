# Global 1881 — İşlem Kapanış Kontrol Tasarımı

Bu tasarım, offline geçiş yılında **kira** ve **satış** işlemlerinde sözleşme, kapora, hizmet bedeli, KDV, tahsilat ve kapanış onayını aynı işlem dosyasında izlemek içindir. Kayıtlar mevcut IndexedDB, AES-GCM şifreli yedek, checksum, ECDSA imza ve broker manager merge mekanizmasının bir parçası olacaktır.

> **Kontrol ilkesi:** Danışman işlem ve tahsilat bilgisini kaydeder; broker manager doğrulamadan hiçbir işlem “kapanmış” kabul edilmez. Tahsilat onaylandıktan sonra sessizce değiştirilemez; düzeltme ayrı sürüm ve audit izi ile yapılır.

## 1. İşlem dosyası ve durum zinciri

| Aşama | Kira işlemi | Satış işlemi | Sorumlu | Zorunlu kontrol |
|---|---|---|---|---|
| 1. Yetki / hazırlık | Kiralama yetkisi ve mülk sahibi onayı | Satış yetkisi | Danışman | Sözleşme snapshot’ı işlem dosyasına bağlanır. |
| 2. Taraf / şart doğrulama | Kiracı, kira, depozito, başlangıç tarihi | Alıcı, satış bedeli, kapora planı | Danışman | Beklenen tahsilat kalemleri oluşturulur. |
| 3. Tahsilat kaydı | Depozito, ilk kira, hizmet bedeli, KDV | Kapora, hizmet bedeli, KDV; gerekirse diğer tahsilat | Danışman | Tutar, vade, yöntem ve referans kaydedilir. |
| 4. Doğrulama | Nakit veya banka transferi beyanı | Nakit veya banka transferi beyanı | Broker manager | Nakit makbuzu ya da banka referansı kontrol edilir. |
| 5. Risk değerlendirmesi | Eksik/gecikmiş/kanıtsız tahsilat kontrolü | Eksik/gecikmiş/kanıtsız tahsilat kontrolü | Sistem + broker manager | Açık risk varsa kapanış engellenir veya gerekçeli istisna gerekir. |
| 6. Kapanış | Sözleşme aktif + doğrulanmış tahsilatlar | Satış kapanışı + doğrulanmış tahsilatlar | Broker manager | Onay, tarih ve istisna notu audit izine yazılır. |

## 2. Tahsilat kalemleri

Her işlem için kalemler bağımsızdır. Böylece “hizmet bedeli alındı ama KDV alınmadı” veya “kaporanın yalnız bir bölümü geldi” gibi durumlar açık biçimde görülür.

| Kalem türü | Kira için | Satış için | Beklenen kayıt |
|---|---|---|---|
| Kapora | Opsiyonel | Genellikle opsiyonel/işlem koşuluna bağlı | Beklenen tutar, vade, teslim eden, yöntem |
| Depozito | Evet | Hayır | Beklenen / alınan / doğrulanan tutar |
| İlk kira | Evet | Hayır | Başlangıç dönemi ve ödeme günü |
| Hizmet bedeli | Evet | Evet | KDV hariç hizmet bedeli |
| KDV | Evet | Evet | Ayrı tahsil veya hizmet bedeline dahil senaryo |
| Diğer | Gerektiğinde | Gerektiğinde | Açıklama ve broker notu |

Her satırda **beklenen tutar, gerçekleşen tutar, para birimi, vade tarihi, tahsilat tarihi, nakit/banka transferi, banka referansı veya makbuz numarası, durum ve açıklama** tutulur.

## 3. Durumlar ve risk kuralları

| Tahsilat durumu | Anlamı | Kapanış etkisi |
|---|---|---|
| Planlandı | Beklenen tutar oluşturuldu, henüz tahsil edilmedi | Vadesi yaklaşınca uyarı üretir. |
| Beyan edildi | Danışman tahsilatı kaydetti | Broker manager doğrulaması bekler. |
| Doğrulandı | Broker manager yöntem ve referansı kontrol etti | Kapanış hesabına dahil edilir. |
| Kısmi | Gerçekleşen tutar beklenenden düşüktür | Risk oluşturur. |
| Gecikmiş | Vade geçmiş, doğrulanmış tam tahsilat yoktur | Risk oluşturur. |
| İstisna | Tahsil edilmeme veya fark gerekçesi broker tarafından kabul edildi | Kapanışta görünür istisna notu gerekir. |

Sistem aşağıdaki riskleri **kırmızı/amber** olarak gösterir:

- Zorunlu kalemde eksik veya gecikmiş tahsilat;
- Banka transferinde transfer referansı olmaması;
- Nakit tahsilatta makbuz/teslim referansı olmaması;
- Hizmet bedeli tahsil edilmesine rağmen KDV’nin ayrıca alınmaması veya KDV dahil senaryoda tahmini gelir kaybı;
- Kira işlemi için mülk sahibi onayı yokken kapanış talebi;
- Danışman tarafından beyan edilmiş ancak broker manager tarafından doğrulanmamış nakit;
- Kapanıştan sonra değiştirilmeye çalışılan doğrulanmış satır.

## 4. Rol ve yetki hiyerarşisi

| İşlem | Danışman | Broker manager |
|---|---|---|
| Kendi işlem dosyasını oluşturma ve düzenleme | Yapabilir | Tüm ofis için görebilir / yönlendirebilir |
| Tahsilat satırı oluşturma ve “beyan edildi” yapma | Yapabilir | Yapabilir |
| Nakit veya banka transferini doğrulama | Yapamaz | Yapabilir |
| Risk istisnası girme | Gerekçe önerebilir | Onaylayabilir veya reddedebilir |
| İşlemi kapatma | Talep edebilir | Yalnız broker manager kapatabilir |
| Doğrulanan satırı değiştirme | Yapamaz; düzeltme talebi oluşturur | Yeni sürüm ve audit notuyla düzeltebilir |

Bu ayrım, tahsilat kaydının sadece tek kişinin beyanına dayanarak “tamamlandı” görünmesini önler. Nakit işlemde fiziki makbuz numarası; banka transferinde dekont/transfer referansı tutulmalıdır. Dosya/dekont görseli bu ilk offline kapsamda saklanmayacak; merkezi sunucu döneminde erişim kontrollü dosya deposuna geçirilmesi değerlendirilir.

## 5. Offline snapshot veri yapısı

Yeni `transaction` offline kaydı, bağlı sözleşmenin kimliğini ve değişmez sözleşme snapshot özetini taşır. Tahsilat satırları işlem dosyasının `details` alanında sürümlü snapshot olarak tutulur.

```ts
type OfflineTransactionSnapshot = {
  schema: "global1881-offline-transaction-v1";
  transactionNo: string;
  kind: "sale" | "rental";
  sourceContractRecordId: string;
  sourceContractNo: string;
  consultantName: string;
  consultantCode: string;
  status: "prepared" | "collectionPending" | "managerReview" | "riskHold" | "closed" | "cancelled";
  expectedServiceFee: number;
  vatCollection: "separate" | "included";
  collections: Array<{
    id: string;
    category: "deposit" | "rentalFirstMonth" | "serviceFee" | "vat" | "reservation" | "other";
    expectedAmount: number;
    collectedAmount: number;
    currency: "TRY" | "USD" | "EUR";
    dueDate?: string;
    collectedAt?: string;
    method?: "cash" | "bankTransfer";
    reference?: string;
    state: "planned" | "declared" | "verified" | "partial" | "overdue" | "waived";
    note?: string;
  }>;
  managerApproval?: { decision: "approved" | "rejected" | "exception"; by: string; at: string; note: string };
};
```

Yeni kayıt türü mevcut generic offline modeline eklendiğinde şifreli yedek ve broker merge akışına otomatik olarak katılır. Çakışma halinde mevcut merge önizlemesi iki farklı sürümü gösterir; broker manager seçim yapmadan kayıt yazılmaz.

## 6. Kapanış kontrol tablosu

Yeni offline menü adı **İşlem Kapanışları** olacaktır. Liste, danışmana sadece kendi dosyalarını; broker manager’a ofis geneli filtrelenebilir görünümü gösterecektir.

| İşlem | Tür | Danışman | Hizmet bedeli | Doğrulanmış tahsilat | Açık fark | Risk | Kapanış |
|---|---|---|---:|---:|---:|---|---|
| SAT-2026-… | Satış | İlgili danışman | Beklenen | Kalemlerden toplam | Beklenen − doğrulanan | Örn. banka referansı eksik | Broker onayı bekliyor |
| KIR-2026-… | Kira | İlgili danışman | Beklenen | Kalemlerden toplam | Beklenen − doğrulanan | Örn. ilk kira gecikmiş | Riskte |

Bu tablo; işlem türü, danışman, risk düzeyi, kapanış durumu ve vade aralığına göre süzülebilir. Müşteri kimlik ve telefon verisi sadece işlem sahibi ve broker manager’ın ayrıntı ekranında kalır; çapraz danışman görünümüne dahil edilmez.

## 7. Uygulama sırası

1. Generic offline kayıt modeline `transaction` türü ve v1 snapshot ayrıştırıcısı eklenir.
2. Kira ve satış yetki sözleşmesinden “işlem kapanışı oluştur” bağlantısı eklenir; zorunlu beklenti kalemleri sözleşme özetinden önerilir.
3. Tahsilat satırı formu, yöntem, referans, durum ve revizyon kontrolü eklenir.
4. Danışman/broker manager görünürlüğü; doğrulama, istisna ve kapanış yetkileri uygulanır.
5. Risk motoru, işlem kapanış tablosu ve finansal istatistiklerle bağlantı eklenir.
6. Birim testleri, şifreli yedek/merge denetimi ve üç Windows laptopta gerçek akış kanıtı tamamlanır.

## 8. Onay gerektiren kararlar

Uygulamaya geçmeden önce aşağıdaki ilkeler onaylanmalıdır:

1. **Kapora**, hem kira hem satış işleminde opsiyonel kalem olarak mı tutulacak; yoksa yalnız satışta mı açılacak?
2. Nakit tahsilat için zorunlu iç makbuz/teslim referansı biçimi nedir? Öneri: `NKT-YIL-DANIŞMAN-SIRA`.
3. Banka transferi için dekont numarası veya EFT/FAST açıklaması zorunlu mu? Öneri: evet.
4. Broker manager, açık risk içeren işlemi gerekçeli istisna ile kapatabilsin mi? Öneri: evet; istisna görünür audit izi taşır.
5. Hizmet bedeli tahsilatı danışman adına mı, ofis adına mı izlenecek? İlk tasarım ofis tahsilatı olarak kaydeder; danışman yalnız sorumlu/işlem sahibi olur.

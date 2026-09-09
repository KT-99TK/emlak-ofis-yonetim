# ExcelJS / uuid güvenlik değerlendirmesi

**Durum:** Çözüldü — ExcelJS üretim ve test bağımlılıklarından kaldırıldı.

## Başlangıç bulgusu

`pnpm audit` başlangıçta `exceljs@4.4.0 → uuid@8.3.2` zincirini raporladı. Advisory, `uuid` paketinin v3/v5/v6 API’lerinde küçük buffer veya geçersiz offset kullanımıyla ilişkili sınır kontrolü riskini tanımlıyordu. Projede doğrudan `uuid` importu veya bu API’lerin kullanımı yoktu; ancak transitive advisory dağıtım bağımlılık ağacında bulunuyordu.

## Uygulanan çözüm

Aktif Kiralamalar Excel okuma akışı `read-excel-file@9.3.10` paketine geçirildi. ExcelJS üretim bağımlılığı tamamen kaldırıldı. Regresyon testlerinde XLSX fixture üretimi için `write-excel-file@4.1.1` kullanılıyor; bu paket yalnız `fflate` bağımlılığı taşır ve uuid zinciri oluşturmaz.

Uygulama parserı `read-excel-file/browser` ile dosya seçimi sonrasında lazy yüklenir. Aktif Kiralamalar sayfa seçimi, başlık eşleme, tarih/para dönüşümü, CT1 yetki kodu, mükerrerlik ve danışman atama davranışları korunmuştur.

## Doğrulama

`pnpm why uuid` artık ExcelJS kaynaklı bir zincir göstermemektedir. `uuidDependencyPolicy.test.ts` doğrudan uuid importu olmadığını ve read-excel-file’ın lazy yüklendiğini doğrular. Aktif Kiralamalar parser regresyonları 5/5, UUID policy testleri 2/2 geçmiştir.

Tam test, TypeScript, `pnpm audit` ve production build son doğrulamadan sonra bu kaydın durumu güncel tutulacaktır. Yeni bir advisory oluşursa bağımlılık ağacı yeniden değerlendirilmelidir.

## Referanslar

[1]: https://github.com/advisories/GHSA-w5hq-g745-h8pq — uuid: Missing buffer bounds check in v3/v5/v6 when buf is provided.

[2]: https://github.com/uuidjs/uuid/releases/tag/v11.1.1 — uuid v11.1.1 release.

## Son audit durumu

ExcelJS/uuid bulgusu kapatıldı. Ayrıca `mysql2@3.24.4`, `vite@7.3.5`, `@tailwindcss/vite@4.3.3`, `tailwindcss@4.3.3`, `postcss@8.5.23`, `vitest@4.1.11`, `esbuild@0.28.1` ve `browserslist@4.28.9` için uyumlu yükseltmeler uygulandı. `qs@6.16.0`, `js-yaml@4.3.2`, `picomatch@4.0.7`, `fast-uri@3.1.6`, `lodash@4.18.1` ve browserslist transitive zincirleri patched sürümlere çekildi.

Son audit’te kritik/yüksek bulgu kalmadı; kalan bulgular `drizzle-kit` içindeki dev-only `@esbuild-kit/core-utils → esbuild@0.18.20` zinciri ile düşük önem seviyeli Babel/esbuild kayıtlarıdır. Esbuild için global override denemesi nested drizzle-kit sürümünü değiştirmediği ve migration araç uyumluluğunu kanıtlamadığı için kaldırıldı. Bu zincir üretim runtime’ına dahil edilmez; drizzle-kit güncellemesi yayımlandığında yeniden değerlendirilecektir.

Son doğrulama: 110 test dosyası/309 test, TypeScript ve production build başarılı; uuid ağacı boştur. Audit sayımı 0 critical, 0 high, 1 moderate, 2 low olarak kaydedilmiştir.

## 09.09.2026 ek doğrulama

`drizzle-kit` 0.31.10’a yükseltildi. Bu yükseltme, eski `@esbuild-kit/esm-loader@2.6.5` zincirini tamamen kaldırmadı; dolayısıyla moderate esbuild bulgusu dev-only araç zincirinde izlenmeye devam ediyor. Nested override denemesi lockfile’da etkili olmadı ve geri kaldırıldı.

`pnpm audit --prod --audit-level=moderate` sonucu temizdir: critical, high, moderate ve low seviyelerinin tamamı `0`. Genel auditte kalan moderate/low kayıtlar yalnız geliştirme ve test araç zincirindedir; production runtime bağımlılıklarına taşınmamaktadır.


### Son override denemesi

09.09.2026 tarihli global `esbuild: 0.28.1` ve Babel override denemeleri nested bağımlılıkları tek sürüme hizalamadı; Vite 7, drizzle-kit ve plugin-react zincirlerinde farklı esbuild sürümleri kaldı. Mixed sürüm ve major uyumsuzluğu önlemek için bu override’lar kaldırıldı. Uygulama testleri ve üretim derlemesi override ile de geçti; ancak advisory kapanmadığı için değişiklik kalıcılaştırılmadı.

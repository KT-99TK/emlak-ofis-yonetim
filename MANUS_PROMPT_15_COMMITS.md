# Manus için Uygulama Talimatı — "Uygula, Yeniden Tasarlama"

## Bağlam
Bu, `emlak-ofis-yonetim` deposunun **local (Claude Code oturumu)** dalında zaten yazılmış, tip kontrolünden (`tsc --noEmit`) ve test paketinden (`vitest run`) geçmiş, commit'lenmiş 15 commit'lik bir kuyruktur. `origin/main` üzerinde halihazırda 289 commit canlıda (ofis.global1881.com). Bu 15 commit, o üretim kodunun üzerine gelen, zaten bitmiş ve doğrulanmış son güncellemelerdir. Görevin bu commit'leri **olduğu gibi** `origin/main`'e uygulamak ve production'a deploy etmektir — kodu yeniden tasarlama, mimariyi değiştirme, veya "daha iyi" bir yaklaşım önerme. Bu iş zaten bitti; senin işin sadece taşımak ve yayınlamak.

## Yapılacaklar (sırayla)

1. `origin/main`'in güncel ucunu çek.
2. Aşağıdaki 15 commit'i, listelenen sırayla (en eskiden en yeniye) `origin/main` üzerine uygula (cherry-pick veya bu local dalı `origin/main` üzerine rebase/merge — hangisi temiz kalıyorsa). Commit mesajlarını ve yazarlığını olduğu gibi koru.
3. Her commit'ten sonra (veya hepsi bittikten sonra tek seferde) şunları çalıştır ve **hepsi yeşil olmalı**:
   - `npx tsc --noEmit`
   - `npx vitest run`
   - Not: `OfflineWorkspace.client.test.tsx` ve `MultiPropertyIntakeForm.test.ts` içinde bu 15 commit'ten **bağımsız, önceden var olan** 2 test hatası var (138/140 geçiyor). Bunlar senin uygulamandan kaynaklanmıyor, dokunma, sadece bilgi amaçlı.
4. Çakışma çıkarsa: bu commit'ler küçük, izole, iyi tanımlanmış dosya gruplarına dokunuyor (aşağıda listelendi). Eğer `origin/main`'de bu dosyalardan biri bu 15 commit'ten sonra ayrıca değişmişse, çakışmayı **local commit'in davranışını koruyarak** çöz (yani local commit'in mantığı kazanır, sadece satır numaraları/çevresi origin'e göre ayarlanır). Emin olmadığın bir çakışma varsa dur ve bildir, tahmin etme.
5. Deploy et (mevcut CI/CD veya deploy sürecinle — bu depoda daha önce nasıl deploy ediliyorsa aynı şekilde).
6. Deploy sonrası ofis.global1881.com üzerinde en az şunları manuel doğrula:
   - `/consultancy-agreements` sayfası açılıyor ve menüde "Kat Karşılığı Danışmanlık Sözleşmesi" görünüyor.
   - Teknik Şartname formu: bir madde alanı boş bırakıldığında soluk (silüet) metin görünüyor; bir şey yazıldığında o metin gerçek değer oluyor ve çıktıda (yazdırma önizlemesinde) yazılan metin görünüyor.
   - Bir telefon alanına `05321234567` yazınca `0532 123 45 67` biçiminde gösteriliyor (uluslararası `+90` değil).
   - Bir IBAN alanına yazınca `TRxx XXXX XXXX XXXX XXXX XXXX XX` biçiminde gruplanıyor.

## Uygulanacak 15 commit (eskiden yeniye)

```
99953ad Satış Ön Protokolü: kapora tutarı/ödeme şekli/transfer tarihi alanları eklendi; cayma bedeli zorunlu yapıldı
ed0211d Add printable Satış Ön Protokolü document component (placeholders for 16 approved articles)
f720a91 Satış Ön Protokolü: İzmir Emlakçılar Odası onaylı 18 maddelik metni işle
5c39f32 Satış Ön Protokolü'ne A4 yazdırma önizlemesi ve punto kontrolü ekle
d48121c Sözleşme formlarında yazım/format tutarlılığını düzelt (büyük harf, binlik ayraç, IBAN)
52f6b86 Kat karşılığı danışmanlık hizmet sözleşmesi + Bono + Temlik belgeleri ekle
7e191c0 Kat Karşılığı sözleşmesi için A4 yazdırma belgesi ekle; alan doldurma boşluklarını kapat
0da2d96 Bono formuna doldurulmuş örnek görsel ekle
542c8db Bono ekine doldurma sonrası yapılacak işlemler kontrol listesi eklendi
6175f3e Kat Karşılığı etiket çakışmasını netleştir (inşaat sözleşmesi vs. danışmanlık sözleşmesi)
6be5fea Teknik Şartname'yi gerçek doldurulabilir/yazdırılabilir belgeye çevir; Kat Karşılığı etiketini sadeleştir
8a49f42 Kat Karşılığı Danışmanlık Sözleşmesi için doldurma/kayıt sayfası ekle
1262692 Teknik Şartname'yi notere verilecek nihai metinle (v9.1) değiştir
d0dff0b Büyük harf ve para birimi biçimlendirme kurallarını tüm formlarda tutarlı hale getir
4055fb2 Telefon numaralarını yerli biçime (0532 XXX XX XX) çevir, eksik IBAN/telefon formatlamalarını tamamla
```

Bu sıra `git log --format="%h %s" origin/main..main` çıktısının ters çevrilmiş halidir (yani soldan sağa uygulama sırası).

## Değişen dosyalar (özet — bu commit kuyruğunun tamamı, 26 dosya)

- Yeni sayfa/route: `client/src/App.tsx`, `client/src/components/DashboardLayout.tsx` (route + menü girişi: `/consultancy-agreements`)
- Yeni dosyalar: `client/src/pages/ConsultancyAssignmentContracts.tsx`, `client/src/lib/consultancyAssignmentDrafts.ts`, `client/src/lib/consultancyAssignmentContract.ts`, `client/src/components/ConsultancyAssignmentDocument.tsx`, `shared/technicalSpecificationFixedClauses.ts`
- Teknik Şartname: `shared/contractForms.ts`, `shared/contractForms.test.ts`, `client/src/components/TechnicalSpecificationDocument.tsx`, `client/src/components/ContractFormFiller.tsx`
- Biçimlendirme (büyük harf/para/IBAN/telefon): `client/src/lib/textFormatting.ts`, `client/src/lib/authorityContract.ts`, `client/src/lib/authorityContract.test.ts`, `client/src/lib/contractFormFormatting.ts`, `client/src/lib/contractFormFormatting.test.ts`, `client/src/lib/rentalContract.ts`, `client/src/pages/Contracts.tsx`, `client/src/pages/AuthorityContracts.tsx`, `client/src/pages/AuthorityContracts.saveFormatting.test.ts`, `client/src/pages/OfflineAuthorityContracts.tsx`, `client/src/pages/OfflineAuthorityContracts.defaults.test.ts`, `client/src/pages/OfflineWorkspace.tsx`, `client/src/components/LandShareContractDocument.tsx`, `client/src/components/SaleClosingContractDocument.tsx`
- Satış Ön Protokolü (daha önceki commit'ler, aynı kuyrukta): ilgili sözleşme/belge dosyaları

## Kesin kısıtlar
- Kodu yeniden yazma, refactor etme, "iyileştirme" yapma. Sadece uygula.
- `main` dışında bir dala push etme; hedef `origin/main`.
- Şema/mimari kararlarını sorgulama (ör. Teknik Şartname'nin "silüet" placeholder mimarisi kasıtlıdır, bug değildir).
- Deploy sonrası yukarıdaki 4 manuel kontrolü mutlaka yap ve sonucu raporla.

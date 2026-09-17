Tespitin doğru ve teşekkürler — az önceki açıklaman durumu netleştirdi: bu 15 commit'lik kuyruğun ilk dördü (99953ad, ed0211d, f720a91, 5c39f32) gerçekten Kat Karşılığı ile ilgisiz, bağımsız bir "Satış Ön Protokolü" özelliği ve şu an origin/main'de veya GitHub user_github/main'de yok. Bu doğru tespit için teşekkürler.

Ama bir netlik eksik: Şu ana kadar yaptığın iş **sadece doğrulama**. "Görev tamamlandı" demişsin ama sana verdiğim talimat "bu commit'lerin canlıda olup olmadığını kontrol et" değildi — "bu 15 commit'i origin/main üzerine uygula ve deploy et" idi. Doğrulama, görevin sadece ilk adımı; asıl iş henüz başlamadı.

Lütfen şimdi elindeki talimat dosyasındaki (MANUS_PROMPT_15_COMMITS.md) 1-6 arası adımları fiilen uygula:

1. origin/main'in güncel ucunu çek.
2. Listelenen 15 commit'i belirtilen sırayla (99953ad'dan 4055fb2'ye) origin/main üzerine uygula — cherry-pick veya rebase/merge, hangisi temiz kalıyorsa.
3. `npx tsc --noEmit` ve `npx vitest run` çalıştır, ikisi de yeşil olmalı (bilinen 2 önceden var olan test hatası hariç — OfflineWorkspace.client.test.tsx ve MultiPropertyIntakeForm.test.ts, bunlara dokunma).
4. Çakışma çıkarsa, local commit'in davranışını koruyarak çöz; emin olmadığın bir çakışma varsa dur ve bana bildir, tahmin etme.
5. Değişiklikleri push et ve mevcut deploy sürecinle canlıya (ofis.global1881.com) al.
6. Deploy sonrası şunları fiilen tarayıcıdan kontrol et ve ekran görüntüsüyle raporla:
   - İşlem Kapanışları ekranında Satış Ön Protokolü artık görünüyor mu, açılıyor mu, 18 maddelik metin ve kapora/ödeme/cayma alanları doğru mu.
   - `/consultancy-agreements` sayfası açılıyor, menüde "Kat Karşılığı Danışmanlık Sözleşmesi" görünüyor mu.
   - Teknik Şartname formunda boş madde alanı soluk (silüet) metin gösteriyor, bir şey yazınca o metin gerçek değer oluyor mu.
   - Telefon alanı `05321234567` girişini `0532 123 45 67` biçiminde gösteriyor mu (uluslararası `+90` değil).
   - IBAN alanı `TRxx XXXX XXXX XXXX XXXX XXXX XX` biçiminde gruplanıyor mu.

Görev, bu kontrollerin hepsi canlıda geçtiğinde tamamlanmış sayılacak — sadece "commit'ler eksik" tespiti yeterli değil.

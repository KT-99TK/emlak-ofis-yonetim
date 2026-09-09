# Global 1881 — Yerel Danışman Onboarding ve Login

## Kapsam

Yeni danışman hesabı broker manager tarafından Team ekranındaki onboarding kartından oluşturulur. Sistem uzun login adını ASCII standardıyla üretir (`C-TERCAN`, `I-PARIN`, `K-TASLIARMUT`) ve aynı baş harfleri için kullanılmayan en küçük kısa kodu verir (`CT1`, `CT2`, `CT3`). IP1/İbrahim Parin gibi mevcut OAuth kullanıcıları değiştirilmez.

## Kimlik ve parola

Yerel kullanıcılar `users` tablosunda `local:<login>` openId biçimiyle ve `userProfiles.officeRole=consultant` olarak tutulur. Login credential bilgileri `localLoginCredentials` tablosunda saklanır. Parolalar düz metin olarak tutulmaz; Node `scrypt` ile salt’lı hash saklanır. Broker manager geçici parolayı oluşturma yanıtında yalnızca bir kez görür.

Geçici parola 24 saat geçerlidir ve ilk başarılı doğrulamada `temporaryPasswordUsedAt` ile tüketilir. Aynı geçici parola ikinci kez kullanılamaz. Başarılı ilk login sonrası yerel oturum açılır ancak `mustChangePassword=1` olduğu için kullanıcı yeni güçlü parola belirlemeden çalışma alanına geçemez. Yeni parola en az 12 karakter, büyük harf, küçük harf ve rakam içermelidir.

## Oturum ve erişim

Yerel oturumlar OAuth cookie’sinden ayrı `global1881_local_session` HttpOnly cookie’si ve `localLoginSessions` tablosu ile yürür. tRPC context önce Manus OAuth, sonra yerel session fallback’ini kontrol eder. Merkezi belge indirme rotası da aynı yerel session fallback’ini kullanır. Yerel danışman `users.role=user` olarak kalır; broker manager yetkisi mevcut admin prosedürüyle korunur.

## Güvenlik ve audit

Başarısız login, kilitlenme, süresi dolmuş veya tekrar kullanılan geçici parola, başarılı login, parola değişimi ve logout olayları `auditLogs` tablosuna olay özetiyle yazılır. Beş başarısız deneme sonrası hesap 15 dakika geçici kilitlenir. Login adı veya parola audit özetine yazılmaz.

## Operasyon sınırları

Geçici parola e-posta veya düz metin loga yazılmaz; manager tarafından güvenli kanalla iletilmelidir. Cahit Tercan için hesap oluşturma sırasında `C-TERCAN`, otomatik `CT1`, `Terpa Gayrimenkul` ve daha sonra `%70/%30` anlaşma profili ayrı adımda kaydedilecektir. Gerçek kullanıcı login ve CT1 veri aktarımı, merkezi kabul testinde doğrulanmadan tamamlanmış sayılmaz.

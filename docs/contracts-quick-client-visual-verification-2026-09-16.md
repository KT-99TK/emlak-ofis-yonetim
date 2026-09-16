# Sözleşme ekranı hızlı müşteri kaydı görsel doğrulaması — 2026-09-16

Masaüstü 1280×720 görünümünde müşteri kütüğü seçimi, `+ Yeni müşteri` kısa düğmesi ve sözleşme kayıt kartı aynı kompakt form içinde okunabilir durumda. Sağdaki sözleşme kayıtları paneliyle birlikte yerleşim korunuyor.

375×812 mobil görünümünde müşteri kütüğü alanı dikey akıyor; `+ Yeni müşteri` düğmesi satır içinde taşmıyor, merkezi sözleşme numarası ve danışman kodu alanları kart genişliğine uyuyor. Hızlı kayıt dialogu küçük ekranda mevcut ortak DialogContent yapısını kullanıyor.

Kaynak regression testi: `client/src/pages/Contracts.quickClient.test.ts`; doğrulananlar: mevcut müşteri recall, yeni müşteri id’sinin sözleşmeye bağlanması, merkezi numara açıklaması ve aynı normalize ad için mevcut kaydı açıkça seçme davranışı.


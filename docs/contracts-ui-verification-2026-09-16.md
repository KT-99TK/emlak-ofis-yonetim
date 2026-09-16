# Sözleşme ekranı doğrulaması — 16.09.2026

Sözleşme kayıt ekranı 1280×720 masaüstü ve 375×812 mobil görünümde kontrol edildi. Yeni sözleşme kartı daha kompakt iki kolonlu alan düzenine geçti; müşteri kütüğü seçimi görünür, kayıt numarası ve danışman kodu ayrı ve okunabilir alanlar olarak konumlandı. Tahliye tarihi, mülk sahibi onayı ve onay notu tek bir ikincil bölümde toplandı. Kayıt listesi sağ panelde ayrı tutuldu; PDF ve yenileme düğmeleri taşmadı.

Mobil görünümde form ve kayıt listesi dikey akıyor. Alanlar ekran genişliğine uyuyor, buton metni ve filtreler taşmıyor. Müşteri seçimi sözleşme kaydına `clientId` olarak bağlanıyor. TCKN etiketi yetki sözleşmesi belgesinde `TCKN:` olarak güncellendi.

TypeScript, ilgili sözleşme/rol/ek belge Vitest testleri ve production build başarıyla tamamlandı. A4 print CSS’inde sözleşme liste önizlemesi portrait kağıt ölçüsüne alındı; yetki belgesinin yazdırma yazı boyutu ve madde satır aralığı daha dengeli hale getirildi. Gerçek yazıcı/PDF sürücüsü sonucu ayrıca kullanıcı kabul testinde kontrol edilmelidir.

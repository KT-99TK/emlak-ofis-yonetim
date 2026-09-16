# CT1 Danışman Ekranı Kabul Notu — 16.09.2026

## Kapsam

Kullanıcının son paylaştığı ekran görüntüleri `C-TERCAN / CT1` hesabıyla giriş yapıldıktan sonra alınmış danışman ekranları olarak değerlendirildi. Bu görüntüler broker manager görünümüyle karıştırılmadı.

## Kaynak doğrulaması

Offline sözleşme erişim politikası, danışmanın yalnızca kendi `userId` sahipliğindeki müşteri, mülk, sözleşme ve arşiv kayıtlarını tam görebilmesine izin veriyor. Farklı danışmana ait kayıtlarda başlık ve ayrıntı maskeleniyor; EİDS numarası da yalnız kayıt sahibi danışman veya açık broker manager oturumunda düzenlenebiliyor.

Yetki sözleşmesindeki müşteri seçimi artık yapılandırılmış offline müşteri kaydındaki adres, telefon ve TCKN/VKN alanlarını forma taşıyor. Yetki sözleşmesi çıktısında TCKN açık kullanılabilir; müşteri listesi ve genel listelerde kimlik alanı yer almaz veya maskeleme politikası uygulanır. Eski düz metin müşteri kayıtları da bozulmadan adres özeti olarak okunmaya devam eder.

## Doğrulanan teknik kapsam

Offline erişim regression testleri: 5 test başarılı. Yapılandırılmış müşteri recall testleri: 2 test başarılı. TypeScript kontrolü ve production build başarılı. Fiziksel cihazda CT1 ile yeni müşteri kaydı oluşturup yetki sözleşmesinde müşteri seçimi, telefon/TCKN recallı ve PDF çıktısını kontrol etme adımı kullanıcı kabulü olarak açık bırakılmıştır.

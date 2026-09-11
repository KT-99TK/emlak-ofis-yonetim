# Yeşil Buton Kontrast Doğrulaması — 11.09.2026

Koyu yeşil primary butonlar ortak `Button` varyantında açık/beyaz metin ve beyaz ikon kullanacak şekilde güncellendi. `Yeni kayıt` ve `Yeni görev` butonları 1280×720 masaüstü görünümünde okunabilir; `Yeni kayıt` butonu yeşil arka plan üzerinde beyaz yazı gösteriyor.

375×812 mobil görünümünde üst hızlı erişim alanındaki butonlar taşmadan ve okunabilir biçimde görünüyor. Koyu yeşil primary buton ekranın ilk mobil viewport alanında yer almadığı için ayrıca kaynak regression testiyle ortak Button kontrast sözleşmesi doğrulandı.

Doğrulama artefaktları: `client/src/components/ui/button.contrast.test.ts`, `client/src/pages/HomeResponsiveLayout.test.ts`; TypeScript ve hedef Vitest testleri başarılı.

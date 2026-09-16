# Canlı KT1 login incelemesi — 2026-09-16

Canlı URL: https://ofis.global1881.com

Canlı sayfa yerel danışman giriş ekranını gösteriyor: `K-TASLIARMUT` benzeri login adı, parola alanı ve Giriş yap düğmesi. `https://ofis.global1881.com/__manus__/version.json` adresi tarayıcıda boş içerik döndürdü; bu nedenle bu endpoint üzerinden canlı checkpoint sürümü doğrulanamadı. Kullanıcının paylaştığı hata, geçici parolanın login sonrası parola değiştirme ekranı açılmadan tüketildiğini gösteriyor.

Bir sonraki kontrol: canlı frontend’in gerçekten `loginSubmitLock` düzeltmesini içerip içermediğini network/console veya yayınlanan asset içeriği üzerinden doğrulamak; ardından server tarafında temporaryPasswordUsedAt tüketimini güvenli akışa bağlamak.

Tarayıcı console kontrolü canlı sayfanın `https://ofis.global1881.com/assets/index-DfUVs4_5.js` ve `index-CEyyOQof.css` asset’lerini yüklediğini gösterdi. Bu, canlıda checkpoint’teki son bundle’ın kullanılıp kullanılmadığını asset içeriği üzerinden doğrudan karşılaştırmayı mümkün kılıyor.

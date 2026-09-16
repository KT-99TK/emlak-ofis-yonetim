# Merkezi komisyon filtreleri görsel doğrulaması — 2026-09-16

`/commissions` ekranı 1280×720 masaüstü görünümünde mevcut komisyon kayıt alanının içine tarih başlangıç/bitiş, manager için danışman kodu, durum seçimi ve filtre temizleme kontrollerini alacak şekilde hizalandı. Filtreli kayıt sayısı, net hizmet bedeli, tahsil edilen, kalan ve Global 1881 payı özet kartları aynı panel içinde gösterilecek.

375×812 mobil görünümünde yeni çok paydaşlı işlem formu dikey akıyor; mevcut select ve input alanlarında yatay taşma görülmedi. Filtre paneli sayfanın altındaki kayıt kartında aynı grid sınıflarıyla dar ekran için tek sütuna düşer.

Doğrulanan route: `/commissions`. Server filtreleri `commissionTransactions.createdAt`, `status` ve consultant participant code üzerinden uygulanır; danışman kapsamı server-side korunur.


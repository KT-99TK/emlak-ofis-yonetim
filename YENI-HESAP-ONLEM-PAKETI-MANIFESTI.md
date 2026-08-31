# Global 1881 — Yeni Hesap Önlem Paketi Manifesti

**Tarih:** 31 Ağustos 2026  
**Paket amacı:** Bu paket, yalnız gelecekte kullanıcı tarafından açıkça onaylanırsa yeni hesapta güvenli yeniden kurulum başlatmak için hazırlanmış bir önlemdir. Mevcut projeyi, alan adını, merkezi sistemi veya Windows verilerini değiştirmez.

## Paket içeriği

| Dosya | Amaç | Hassasiyet |
|---|---|---|
| `Global1881-kaynak-devir-guvenli-2026-08-30.zip` | Kaynak kod, şema/migrasyon, testler ve mimari notlar | Gizli değer ve merkezi veri içermez. |
| `Global1881-kaynak-devir-guvenli-2026-08-30.zip.sha256` | Kaynak ZIP bütünlüğü | SHA-256 özeti. |
| `Global1881-merkezi-veri-sifreli-yedek-2026-08-30.7z` | Merkezi operasyonel veri dışa aktarımı | AES-256 ile şifreli, dosya adları da şifreli. |
| `Global1881-merkezi-veri-sifreli-yedek-2026-08-30.7z.sha256` | Şifreli veri arşivi bütünlüğü | SHA-256 özeti. |
| `DEVRALMA-VE-YEDEK-PLANI.md` | Varlık envanteri, devir sınırları ve yedek kaydı | Kişisel veri dökümü içermez. |
| `YENI-HESAP-KURULUM-REHBERI.md` | Yeni ortamın güvenli yeniden kurulum sırası | Parola veya anahtar içermez. |
| `BULUT-SAGLAYICI-GORUSME-LISTESI.md` | Sağlayıcı görüşmesinde kullanılacak teknik kabul listesi | Gizli değer içermez. |

## Kesin dışlama listesi

Bu pakette şunlar **yoktur**: merkezi veritabanı bağlantı bilgileri, JWT/OAuth/S3 anahtarları, mevcut Windows uygulaması, EXE/BAT/PowerShell paketleme dosyaları, `%APPDATA%\Global 1881 Gayrimenkul` içeriği, alan adı/DNS erişim bilgileri, şifresiz müşteri verisi ve şifreli veri arşivinin parolası.

## Kullanım sınırı

Şifreli `.7z` arşivin parolası, bu paketten ve paylaşım kanalından ayrı saklanmalıdır. Parola olmadan merkezi veri arşivi açılamaz. Yeni hesapta kuruluma geçmeden önce kaynak ZIP ve şifreli veri arşivinin SHA-256 değerleri kontrol edilmelidir.

> Mevcut erişim sorunu çözülürse bu paket yalnız yedek olarak saklanır; yeni hesapta aktarım başlatılmaz.

Haklısın — commit nesneleri senin çalışma alanında olamazdı, çünkü hiç push edilmemişlerdi, sadece benim yerel Claude Code oturumumdaydı. Kaynağı şimdi veriyorum.

## Ekteki dosyalar
1. `manus-17-commits.bundle` — Git bundle. `origin/main..main` aralığındaki **17 commit**i içeriyor (senin doğru tespit ettiğin 15 + benim bu süreçte eklediğim 2 dokümantasyon commit'i — `MANUS_PROMPT_15_COMMITS.md` ve `MANUS_TAKIP_MESAJI.md`, bunlar sadece referans dosyaları, koda dokunmuyor).
2. `manus-patches.tar.gz` — Aynı 17 commit'in `git format-patch` çıktısı (yedek/alternatif yöntem, bundle bir sebeple çalışmazsa).

## Bundle'ı uygulama adımları

Deposunun kök dizininde (origin/main'in üzerinde çalıştığın yerde):

```
git bundle verify manus-17-commits.bundle
git fetch manus-17-commits.bundle refs/heads/main:refs/remotes/manus-tmp/main
git log --oneline origin/main..refs/remotes/manus-tmp/main   # 17 commit'i gör
git checkout main
git merge --ff-only refs/remotes/manus-tmp/main   # veya: git rebase refs/remotes/manus-tmp/main
```

`--ff-only` başarısız olursa (yani `origin/main` bundle'ın temel aldığı `dc6d504` commit'inden sonra ayrıca ilerlemişse), bana haber ver — ben bundle'ı güncel origin/main üzerine yeniden üretirim, tahmin ederek çakışma çözme.

Alternatif olarak patch dosyalarını sırayla uygulayabilirsin:

```
tar xzf manus-patches.tar.gz
git am manus-patches/*.patch
```

## Sonrası
Bundle/patch uygulandıktan sonra, önceki talimatımdaki 3-6. adımları uygula:
3. `npx tsc --noEmit` ve `npx vitest run` (2 bilinen önceden var olan test hatası hariç, dokunma)
4. Çakışma varsa dur, bildir
5. Push et ve deploy et
6. Deploy sonrası kontrol listesini (İşlem Kapanışları'nda Satış Ön Protokolü, /consultancy-agreements sayfası+menü, Teknik Şartname silüet davranışı, telefon `0532 XXX XX XX` formatı, IBAN `TRxx XXXX...` formatı) tarayıcıdan fiilen doğrula ve raporla.

# Kategori ikonları (ana sayfadaki yuvarlaklar)

- `sheet.png`: proje sahibinin hazırladığı, şeffaf arka planlı 11 ikonluk tek parça görsel.
- `fluent-woman-baby.webp`: Microsoft **Fluent Emoji 3D** "woman feeding baby" (açık ten). Lisans: MIT, telif Microsoft Corporation
  (https://github.com/microsoft/fluentui-emoji). Anne & Çocuk ikonu için kullanılır; paket `@lobehub/fluent-emoji-3d` (MIT).
- `build.py`: sayfayı ikonlara ayırır, zemin (platform) gölgesini siler, erkek / kadın ikonlarına
  gülen yüz çizer, zemin gölgesinin kalıntılarını (ince beyaz/gri şeritler) temizler, otomobil + motosiklet kompozisyonunu yuvarlağa uyacak şekilde yeniden dizer, her ikonu
  yuvarlağı kenardan kenara dolduracak biçimde (en küçük çevreleyen daire) 432×432 WebP olarak kaydeder.
- Çıktı klasörü: `public/categories/` (site buradan okur; yuvarlak 72 px, 432 px = 6 kat keskinlik).

Yeniden üretmek için (bu araçlar sitenin bağımlılığı değildir, yalnızca bu betik içindir):

```bash
pip install pillow numpy scipy opencv-python-headless
python3 design-src/category-icons/build.py design-src/category-icons/sheet.png public/categories
```

Not: Betik, ikonları sayfadaki yerlerine göre okur (üstten alta, soldan sağa: erkek, kadın, anne-çocuk, ev,
süpermarket, kozmetik, saat, elektronik, spor, kitap, otomobil). Yeni bir sayfa verirseniz sıra aynı olmalı.

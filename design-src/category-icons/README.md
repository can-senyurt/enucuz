# Kategori ikonları (ana sayfadaki yuvarlaklar)

- `sheet.png`: proje sahibinin hazırladığı, şeffaf arka planlı 11 ikonluk tek parça görsel.
- `build.py`: sayfayı ikonlara ayırır, zemin (platform) gölgesini siler, erkek / kadın / anne-çocuk ikonlarına
  gülen yüz çizer, otomobil + motosiklet kompozisyonunu yuvarlağa uyacak şekilde yeniden dizer, her ikonu
  yuvarlağı kenardan kenara dolduracak biçimde (en küçük çevreleyen daire) 432×432 WebP olarak kaydeder.
- Çıktı klasörü: `public/categories/` (site buradan okur; yuvarlak 72 px, 432 px = 6 kat keskinlik).

Yeniden üretmek için (bu araçlar sitenin bağımlılığı değildir, yalnızca bu betik içindir):

```bash
pip install pillow numpy scipy opencv-python-headless
python3 design-src/category-icons/build.py design-src/category-icons/sheet.png public/categories
```

Not: Betik, ikonları sayfadaki yerlerine göre okur (üstten alta, soldan sağa: erkek, kadın, anne-çocuk, ev,
süpermarket, kozmetik, saat, elektronik, spor, kitap, otomobil). Yeni bir sayfa verirseniz sıra aynı olmalı.

# Demo fotoğraflar

Bu klasördeki görseller **yalnızca demo** içindir. Proje sahibi örnek olarak verdi; kaynakları ve kullanım lisansları
**doğrulanmadı** (internetten alınmış görseller). Site giriş korumalıyken sorun yok, ama **herkese açılmadan önce**
kendi çekimleriyle ya da lisanslı görsellerle değiştirilmeli (CLAUDE.md Bölüm 9).

| Dosya                        | Ürün                              | Boyut         |
| ---------------------------- | --------------------------------- | ------------- |
| `siyah-deri-ceket-kadin.jpg` | Kadın · Siyah Deri Ceket          | 736×920 (4:5) |
| `yun-kazak-erkek.jpg`        | Erkek · Yarım Fermuarlı Yün Kazak | 736×920 (4:5) |

Yeni fotoğraf eklerken: 4:5 oranında kırp (`python3 -I scripts/crop-demo-photo.py <kaynak> <hedef> <üstten-px>`),
metadata'yı sil, 150 KB altında tut, `src/data/mock/catalog.ts` içinde ürüne `photo: "/demo/…"` olarak bağla.

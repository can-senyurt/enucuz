# EnUcuz — Giyim Fiyat Karşılaştırma ve İndirim Takip Platformu

> Bu dosya projenin ana rehberidir. Claude Code her oturumda önce bu dosyayı okur ve buradaki kurallara göre çalışır.
> **Çalışma adı:** EnUcuz (alan adı müsaitliğe göre kesinleşecek; marka adı tek bir config dosyasından değiştirilebilir olmalı).

---

## 0. Proje Sahibi Hakkında (Claude için önemli)

- Proje sahibi **yazılımı öğrenen bir geliştirici**. Projeyi **iPhone 13 üzerinden** Claude Code ile yönetiyor; bilgisayarı yok.
- Bu yüzden:
  - Terminal komutu çalıştırmasını, dosyayı elle düzenlemesini **bekleme**. Her şeyi sen yap.
  - Her fazın sonunda **sade Türkçe** ile ne yaptığını, neyi nasıl test edeceğini anlat.
  - Kontrol, **Vercel önizleme linki** üzerinden iPhone Safari'de yapılır. Her değişiklik önce telefonda iyi görünmeli.
  - Teknik terim kullandığında bir cümleyle ne olduğunu açıkla.
- Arayüz metinleri **Türkçe**; kod, değişken, dosya adları ve commit mesajları **İngilizce**.

---

## 0.5 Güncel Durum (yeni oturumda ÖNCE bunu oku)

- **Bitti:** Faz 0 ve Faz 1, `main`'e birleşti ve canlıda: https://enucuz.vercel.app (Vercel girişi + VPN gerekir).
- **Bekleyen onay:** Yeşil renk paleti (Bölüm 3.1) `claude/site-project-analysis-r9zxai` dalında hazır; proje sahibi önizlemede beğenirse `main`'e alınır.
- **Sırada:** Faz 2 (Supabase). Proje sahibinin onayını bekle; önce `docs/HANDOFF.md` dosyasını oku.
- **Ayrıntılı devir notu:** `docs/HANDOFF.md` (neler yapıldı, kararlar, tuzaklar, Vercel/GitHub bilgileri, test araçları, Faz 2 planı).
- **Test araçları:** `scripts/qa/` (Playwright + axe denetimleri), `npm test` (birim testleri).
- **Çalışma kuralı:** Telefondan çalışılıyor; sade Türkçe anlat, her faz sonunda kontrol listesi ver ve onay bekle.

---

## 1. Ürün Vizyonu

Kullanıcı aradığı giyim ürününü (ör. "siyah deri ceket", "Nike Air Force 1") arar; EnUcuz bu ürünün farklı mağazalardaki fiyatlarını yan yana gösterir, **en ucuz mağazayı ve linkini** öne çıkarır.

Ana fark yaratan özellikler:

1. **Gerçek İndirim Skoru (0–100):** Fiyat geçmişine bakarak indirimin gerçek mi yoksa "önce zam, sonra indirim" mi olduğunu gösterir.
2. **Fiyat Nabzı:** Her üründe son 30/90 günün fiyat grafiği.
3. **Günün Fırsatları ve Kategori İndirimleri:** En çok düşen ürünler, en avantajlı kategoriler.
4. **Fiyat Alarmı (Faz 5):** "Bu ürün X TL'nin altına düşünce haber ver."

**İlk kategori:** Giyim (kadın, erkek, çocuk, ayakkabı, aksesuar).
**Gelir modeli:** Satış ortaklığı (affiliate) komisyonları. İlk aşamada şirket yok; affiliate başvuruları trafik oluşunca yapılacak.

---

## 2. Teknoloji Yığını

| Katman | Teknoloji | Not |
|---|---|---|
| Framework | **Next.js (App Router, güncel kararlı sürüm)** + **TypeScript (strict)** | Sunucu bileşenleri varsayılan |
| Stil | **Tailwind CSS** | Tasarım token'ları `tailwind.config` içinde |
| UI yardımcıları | Gerekirse **shadcn/ui** (yalnızca ihtiyaç duyulan bileşenler), **lucide-react** ikonlar | Ağır UI kütüphanesi ekleme |
| Animasyon | **Framer Motion** (ölçülü kullan) | `prefers-reduced-motion` desteklenmeli |
| Grafik | **Recharts** veya hafif bir SVG sparkline | Fiyat geçmişi için |
| Veritabanı | **Supabase (PostgreSQL)** | Faz 2'den itibaren |
| Kimlik doğrulama | **Supabase Auth** | Faz 5 |
| Doğrulama | **Zod** | Tüm dış veri ve form girdileri |
| Hosting | **Vercel** | GitHub'a her push = önizleme linki |
| Zamanlanmış işler | Vercel Cron / Supabase pg_cron / GitHub Actions | Faz 3'te ücretsiz plan limitlerine göre seçilecek |
| Test | **Vitest** (birim), **Playwright** (kritik akışlar, Faz 6) | |
| Gelecek (ölçek) | DigitalOcean, Redis, Meilisearch/Typesense | Faz 7 |

Yeni bir bağımlılık eklemeden önce **neden gerektiğini** bir cümleyle belirt. Aynı işi yapan iki kütüphane olmasın.

---

## 3. Tasarım Dili

**İlham:** apple.com/tr — sadelik, bol beyaz alan, büyük ve güçlü tipografi, ürünü kahraman yapan bölümler, akıcı geçişler.
**Kural:** Kopya değil, ilham. Apple'ın logosu, metinleri, görselleri, ürün adları veya birebir düzenleri **kullanılmaz**. EnUcuz'un kendi kimliği olmalı.

### 3.1 Kimlik

- **His:** Sakin, güvenilir, premium ama samimi. "Akıllı alışveriş arkadaşı."
- **Renkler** (proje sahibinin renk kartelası; **yalnızca `src/app/globals.css` içindeki token'lardan** kullanılır, koda sabit renk yazılmaz):
  - Palet: `#003120` derin yeşil · `#006241` yeşil · `#73A996` adaçayı · `#D1E3DD` nane · `#F7F7F5` kırık beyaz
  - Açık mod: `bg` #F7F7F5 · `surface` #FFFFFF · `ink` #003120 (metin) · `muted` #566B62 · `accent` #006241 (marka, düğmeler, ilerleme) · `on-accent` #FFFFFF · `sage` #73A996 · `mint` #D1E3DD
  - Anlam renkleri: `deal` (gerçek indirim) #12A150, yazısı `deal-text` #065C2A · `warn` (şişirilmiş indirim) #E8A317, yazısı `warn-text` #7A5200
  - Koyu mod: `bg` #04140E · `surface` #0B221A · `ink` #F7F7F5 · `muted` #9CB5AA · `accent` #73A996 · `on-accent` #00231A
  - Tüm metin/zemin çiftleri WCAG AA (≥4,5) geçer; yeni renk eklerken `scripts/qa/contrast.js` ile denetle.
- **Tipografi:** Sistem font yığını (`-apple-system, BlinkMacSystemFont, "Inter", system-ui, sans-serif`). iPhone'da doğal SF görünümü verir. Başlıklarda sıkı harf aralığı ve büyük boyut (ör. hero 48–64px mobil/masaüstü ölçekli).
- **Fiyatlar:** `tabular-nums`, Türk formatı: `1.299,90 ₺`.

### 3.2 Bileşen Dili

- **Cam efektli yapışkan üst menü** (backdrop-blur, ince alt çizgi).
- **Büyük arama çubuğu** hero'nun merkezinde; odaklanınca hafifçe büyür, altında popüler aramalar çipleri.
- **Ürün kartı:** Büyük görsel, marka, ürün adı, en düşük fiyat, "X mağazada" etiketi, İndirim Skoru rozeti, mini fiyat sparkline'ı.
- **Yatay kaydırılabilir kategori çipleri** (mobilde parmakla kaydırma, scroll-snap).
- **Bölüm geçişleri:** Kaydırdıkça hafif yukarı kayarak beliren içerik (ölçülü).
- **Yaratıcı dokunuşlar (EnUcuz'a özel):**
  - Hero'da canlı sayaç: "Bugün **N** üründe gerçek indirim var."
  - İndirim Skoru'nu gösteren küçük **halka gösterge** (yeşil/sarı/gri).
  - Ürün sayfasında "**Bu fiyat son 90 günün en düşüğü**" gibi akıllı etiketler.

### 3.3 Mobil Öncelik (iPhone 13 = 390×844)

- Önce 390px genişlikte tasarla, sonra büyüt.
- `env(safe-area-inset-*)` ile çentik ve alt çubuk boşlukları.
- Tam ekran yükseklikte `100dvh` kullan (`100vh` değil).
- Dokunma hedefleri en az 44×44px. Hover'a bağımlı etkileşim yok.
- Input font-size ≥ 16px (iOS otomatik zoom yapmasın).

### 3.4 Erişilebilirlik

- Kontrast WCAG AA. Tüm görsellerde `alt`. Klavye ile gezinilebilir. Renk tek başına anlam taşımaz (rozetlerde metin de var).

---

## 4. Mimari ve Klasör Yapısı

```
/
├─ CLAUDE.md
├─ src/
│  ├─ app/                    # Next.js App Router sayfaları
│  │  ├─ page.tsx             # Ana sayfa
│  │  ├─ ara/page.tsx         # Arama sonuçları (?q=)
│  │  ├─ urun/[slug]/page.tsx # Ürün detay
│  │  ├─ kategori/[slug]/page.tsx
│  │  ├─ firsatlar/page.tsx   # Günün fırsatları
│  │  ├─ go/[offerId]/route.ts# Mağazaya yönlendirme + tıklama kaydı (Faz 6)
│  │  └─ api/                 # API route'ları
│  ├─ components/             # UI bileşenleri (ui/, product/, layout/)
│  ├─ lib/
│  │  ├─ config.ts            # Marka adı, site URL, sabitler
│  │  ├─ format.ts            # Fiyat/tarih formatlama (tr-TR)
│  │  ├─ deal-score.ts        # İndirim skoru hesaplama
│  │  └─ search/              # Türkçe normalize, arama yardımcıları
│  ├─ data/
│  │  ├─ repository.ts        # Veri erişim arayüzü (tek giriş noktası)
│  │  ├─ mock/                # Faz 1 örnek veriler
│  │  └─ supabase/            # Faz 2+ gerçek veri erişimi
│  ├─ ingest/                 # Faz 3: veri toplama adaptörleri
│  │  ├─ adapters/            # Her kaynak için bir adaptör
│  │  ├─ matching/            # Ürün eşleştirme
│  │  └─ jobs/                # Zamanlanmış işler
│  └─ types/                  # Ortak TypeScript tipleri
├─ supabase/
│  ├─ migrations/             # SQL migration dosyaları
│  └─ seed.sql
└─ tests/
```

**Temel mimari kural — Repository Pattern:** Sayfalar ve bileşenler veriye **asla doğrudan** mock dosyalardan veya Supabase'den erişmez; her zaman `src/data/repository.ts` üzerinden erişir. Faz 1'de repository mock veriyi döner, Faz 2'de Supabase'e geçilir. **Sayfa kodunda değişiklik gerekmez.**

```ts
// Örnek arayüz
interface ProductRepository {
  search(params: SearchParams): Promise<Paginated<ProductCard>>;
  getBySlug(slug: string): Promise<ProductDetail | null>;
  getDeals(opts?: DealOptions): Promise<ProductCard[]>;
  getCategories(): Promise<Category[]>;
  getPriceHistory(productId: string, days: 30 | 90): Promise<PricePoint[]>;
}
```

---

## 5. Veri Modeli

**Para kuralı:** Tüm fiyatlar veritabanında ve kodda **kuruş cinsinden tam sayı** (`integer`) tutulur. `1.299,90 ₺` → `129990`. Ondalıklı sayı (float) ile para hesabı yapılmaz.

### 5.1 Tablolar

| Tablo | Amaç | Önemli alanlar |
|---|---|---|
| `stores` | Mağazalar | id, name, slug, domain, logo_text, is_active |
| `brands` | Markalar | id, name, slug |
| `categories` | Kategori ağacı | id, name, slug, parent_id |
| `products` | Kanonik ürün (mağazadan bağımsız) | id, slug, title, brand_id, category_id, gender, model_code, image_url, search_vector |
| `product_variants` | Beden/renk varyantı | id, product_id, size, color, gtin (barkod) |
| `offers` | Bir mağazadaki satış ilanı | id, store_id, product_id, variant_id?, url, affiliate_url?, current_price, list_price, in_stock, last_seen_at |
| `price_history` | Fiyat geçmişi | id, offer_id, price, recorded_at |
| `deal_scores` | Hesaplanmış indirim skoru (önbellek) | product_id, score, lowest_30d, median_90d, is_inflated, computed_at |
| `clicks` | Mağazaya yönlendirme kayıtları | id, offer_id, created_at, referrer (kişisel veri yok) |
| `match_review_queue` | Emin olunamayan eşleştirmeler | id, raw_offer, candidate_product_id, confidence |
| *(Faz 5)* `profiles`, `favorites`, `price_alerts` | Üyelik özellikleri | |

### 5.2 Kurallar

- Her tabloda `created_at`, `updated_at`.
- Supabase'de **Row Level Security (RLS) her tabloda açık**. Herkese açık okuma yalnızca ürün/fiyat tablolarında; yazma yalnızca sunucu tarafında (service role).
- `price_history` yalnızca **fiyat değiştiğinde** yeni satır alır (gereksiz büyümeyi önle).
- İndeksler: `offers(product_id)`, `price_history(offer_id, recorded_at)`, `products(search_vector)` GIN, `products(slug)` unique.

### 5.3 Türkçe Arama

- Türkçe karakter sorununa dikkat: `I/ı` ve `İ/i` dönüşümü. Normalize fonksiyonu `toLocaleLowerCase('tr-TR')` kullanmalı.
- Faz 2: PostgreSQL full-text (`turkish` config) + `unaccent` + `pg_trgm` (yazım hatası toleransı: "ayakabı" → "ayakkabı").
- Arama sonuçları sıralama: alaka → indirim skoru → fiyat.

---

## 6. İndirim Skoru Algoritması (`lib/deal-score.ts`)

Girdi: ürünün tüm mağazalardaki en düşük güncel fiyatı + son 90 günlük fiyat geçmişi.

1. `current` = bugünkü en düşük fiyat
2. `median90` = son 90 günün medyan fiyatı · `min30` = son 30 günün en düşüğü
3. `realDrop` = (median90 − current) / median90
4. **Şişirilmiş indirim tespiti:** Mağazanın gösterdiği liste fiyatı (`list_price`) son 90 günde gerçekten uygulanmamışsa veya indirimden kısa süre önce fiyat %15'ten fazla artırılmışsa → `is_inflated = true`
5. Skor (0–100): `realDrop` ağırlıklı; fiyat 90 günün en düşüğüyse bonus; şişirilmişse skor tavanı 30.
6. Geçmiş verisi 14 günden azsa skor gösterilmez → "Yeterli veri yok" rozeti.

Rozetler: **75+ "Gerçek Fırsat"** (yeşil) · **40–74 "İyi Fiyat"** · **<40 "Normal"** · **Şişirilmiş → "Dikkat: İndirim şişirilmiş olabilir"** (sarı).
Bu modül saf fonksiyon olarak yazılır ve **Vitest ile birim testleri** zorunludur.

---

## 7. Fazlar

Her faz bitiminde Claude: **(1)** kodu commit + push eder, **(2)** Vercel önizleme linkini verir, **(3)** "Telefonda şunları kontrol et" listesi yazar, **(4)** bir sonraki faza geçmeden **onay bekler**.

### Faz 0 — Kurulum ✅ (bitti, canlıda)
- [x] Next.js + TypeScript (strict) + Tailwind + ESLint + Prettier kurulumu
- [x] Klasör yapısı (Bölüm 4), `lib/config.ts` (marka adı tek yerde)
- [x] Tasarım token'ları (renkler, yazı tipi, boşluklar, köşe yarıçapları) Tailwind config'e
- [x] Temel layout: cam efektli üst menü, alt bilgi (footer), koyu/açık mod
- [x] GitHub'a push; Vercel bağlantısı için proje sahibine adım adım talimat
- **Bitti sayılır:** Önizleme linkinde boş ama tasarım dilini taşıyan bir ana sayfa açılıyor.

### Faz 1 — Arayüz ve Örnek Veri ✅ (bitti, canlıda; ayrıca menü, başa dön düğmesi ve arama önerileri eklendi)
- [x] `src/data/mock/`: ~40 giyim ürünü, 5 örnek mağaza, her ürün için 2–5 teklif, 90 günlük üretilmiş fiyat geçmişi (bazıları bilerek "şişirilmiş indirim" senaryosu)
- [x] Mock repository (Bölüm 4 arayüzüyle)
- [x] **Ana sayfa:** hero + büyük arama, canlı fırsat sayacı, kategori çipleri, "Günün Fırsatları" ızgarası, "En Çok Düşenler", "Kategorilere Göre İndirimler"
- [x] **Arama sonuçları:** filtreler (kategori, marka, beden, renk, fiyat aralığı, "sadece gerçek fırsatlar"), sıralama, mobilde alttan açılan filtre paneli
- [x] **Ürün detay:** görsel, mağaza fiyat tablosu (en ucuz vurgulu, "Mağazaya Git" butonu), beden/renk seçimi, Fiyat Nabzı grafiği (30/90 gün), İndirim Skoru halka göstergesi, akıllı etiketler
- [x] **Kategori sayfası** ve **Fırsatlar sayfası**
- [x] Boş durum, yükleniyor (skeleton) ve hata ekranları
- [x] `deal-score.ts` + birim testleri
- [x] Sitenin üstünde ince **"Demo veriler gösteriliyor"** bandı
- **Bitti sayılır:** iPhone'da tüm sayfalar akıcı, arama ve filtreler örnek veriyle çalışıyor.

### Faz 2 — Veritabanı (Supabase)
- [ ] Supabase projesi kurulumu için proje sahibine talimat (web sitesinden, telefondan yapılabilir)
- [ ] Migration dosyaları (Bölüm 5), RLS politikaları, indeksler
- [ ] Mock veriyi `seed.sql` olarak veritabanına taşı
- [ ] Supabase repository; `DATA_SOURCE=mock|supabase` ortam değişkeni ile geçiş
- [ ] Türkçe full-text + trigram arama
- [ ] Ortam değişkenleri: `.env.example` dosyası; gerçek anahtarlar **yalnızca Vercel panelinde**
- **Bitti sayılır:** Site aynı görünüyor ama veriyi Supabase'den okuyor.

### Faz 3 — Veri Toplama Altyapısı
- [ ] **Adaptör deseni:** Her kaynak `SourceAdapter` arayüzünü uygular → `fetch() → normalize() → NormalizedOffer[]`
  - `XmlFeedAdapter` (mağazaların gönderdiği XML / Google Merchant formatı)
  - `AffiliateNetworkAdapter` (Admitad, GelirOrtakları vb. ürün feed'leri — hesap açıldığında)
  - `CsvImportAdapter` (manuel yükleme)
- [ ] **Ürün eşleştirme** (`ingest/matching`): 1) GTIN/barkod → 2) marka + normalize model kodu → 3) başlık benzerliği (trigram). Güven < %85 ise `match_review_queue`'ya düşer, otomatik eşleştirilmez.
- [ ] Zamanlanmış güncelleme işi; fiyat değiştiyse `price_history` kaydı; skor yeniden hesaplama
- [ ] Basit yönetici sayfası (`/admin`, şifre korumalı): kaynak durumu, son çalışma, eşleştirme kuyruğu onay/ret
- [ ] **Kural:** Hiçbir sitenin kullanım şartlarına aykırı otomatik tarama (scraping) altyapısı kurulmaz. Veri yalnızca izinli kaynaklardan (feed, affiliate ağı, mağazanın kendi gönderdiği dosya) gelir.
- **Bitti sayılır:** Örnek bir XML feed dosyası içeri aktarılıyor, ürünler eşleşiyor, fiyat geçmişi birikiyor.

### Faz 4 — İndirim Zekâsı
- [ ] Günlük skor hesaplama işi, `deal_scores` önbelleği
- [ ] "En çok düşenler", "Kategori indirim endeksi" (kategorinin ortalama gerçek indirimi)
- [ ] "Bu fiyat 90 günün en düşüğü", "Fiyat son 7 günde %X düştü" etiketleri
- [ ] Trend aramalar (anonim, toplu sayım)

### Faz 5 — Üyelik ve Kişiselleştirme
- [ ] Supabase Auth (e-posta + magic link; ileride Google/Apple ile giriş)
- [ ] Favoriler, fiyat alarmı (hedef fiyat), e-posta bildirimi
- [ ] Profil ve bildirim tercihleri
- [ ] **KVKK:** Aydınlatma metni, açık rıza (bildirimler için), hesabı ve verileri silme seçeneği
- [ ] *(Opsiyonel)* Telegram bot ile alarm bildirimi

### Faz 6 — Gelir, SEO ve Kalite
- [ ] `/go/[offerId]` yönlendirme: affiliate link varsa onu kullan, tıklamayı kaydet
- [ ] Satış ortaklığı bilgilendirmesi (affiliate disclosure) her ürün sayfasında ve footer'da
- [ ] SEO: dinamik meta etiketleri, Open Graph görselleri, `sitemap.xml`, `robots.txt`, ürün için JSON-LD (`Product`, `AggregateOffer`)
- [ ] Performans: Lighthouse mobil ≥ 90, görsel optimizasyonu (`next/image`), ISR/önbellekleme
- [ ] Gizlilik dostu analitik (çerez gerektirmeyen bir çözüm tercih edilir)
- [ ] Yasal sayfalar: Hakkımızda, Gizlilik, Çerez Politikası, Kullanım Koşulları, İletişim
- [ ] Playwright ile kritik akış testleri (arama → ürün → mağazaya git)

### Faz 7 — Ölçeklenme ve Mobil
- [ ] DigitalOcean'a geçiş planı (App Platform veya Droplet + Docker), yönetilen PostgreSQL
- [ ] Redis önbellek, Meilisearch/Typesense ile hızlı arama
- [ ] Yeni kategoriler (elektronik, kozmetik, ev)
- [ ] Önce **PWA** (ana ekrana ekle), sonra **React Native / Expo** mobil uygulama — mevcut API ve tipler yeniden kullanılır

---

## 8. Kod Standartları

- TypeScript `strict`; `any` kullanılmaz (zorunluysa yorumla gerekçelendir).
- Bileşenler küçük ve tek sorumluluklu. Varsayılan **Server Component**; etkileşim gerekiyorsa `"use client"`.
- Dış kaynaktan gelen her veri **Zod** ile doğrulanır.
- Fiyat/tarih formatlama yalnızca `lib/format.ts` üzerinden (`Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })`).
- Gizli anahtarlar asla koda veya repoya yazılmaz; `.env.local` git'e eklenmez.
- Commit mesajları: Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `test:`).
- Her faz kendi branch'inde (`phase-1-ui` gibi) geliştirilir; onaydan sonra `main`'e birleştirilir.

---

## 9. Hukuki ve Etik Kurallar

- Mağaza logoları ve marka görselleri izin alınmadan kullanılmaz; mağaza adları metin rozeti olarak gösterilir.
- **Demo veriler canlı yayında gerçek fiyat gibi sunulmaz.** Demo moddayken site üstünde açıkça "Demo veriler" bandı bulunur.
- Affiliate linkler kullanıcıya açıkça bildirilir.
- Kişisel veri minimumda tutulur (KVKK). Tıklama kayıtlarında IP veya kimlik saklanmaz.
- Fiyatların anlık değişebileceği ve son güncelleme zamanı her teklifte gösterilir ("12 dk önce güncellendi").

---

## 10. Proje Sahibi İçin: iPhone'dan Çalışma Akışı

1. **GitHub** hesabı aç (yoksa) ve Claude Code'a bağla. Kodun tamamı GitHub'daki repoda durur.
2. Bu dosyayı repo kök dizinine `CLAUDE.md` adıyla koy (veya Claude Code'a "bu dosyayı repoya CLAUDE.md olarak ekle" de).
3. **Vercel** hesabını Safari'den GitHub ile aç, repoyu içeri aktar. Bundan sonra Claude'un her push'u otomatik bir **önizleme linki** üretir; siteyi oradan telefonda görürsün.
4. Faz 2'de **Supabase** hesabı aç; Claude sana hangi anahtarı Vercel'de nereye yapıştıracağını adım adım söyleyecek.
5. Her fazın sonunda linki aç, kontrol listesine bak, beğenmediğin yeri ekran görüntüsüyle Claude'a anlat.

**İlk komut önerisi:**
> CLAUDE.md dosyasını oku. Faz 0'ı tamamla, ardından Faz 1'e geç. Her fazın sonunda önizleme linkini ve telefonda kontrol etmem gerekenleri yaz, onayımı bekle.

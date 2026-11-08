# EnUcuz — Devir Notu (yeni oturum için)

> Bu dosya, sohbetin bağlam penceresi dolduğunda yeni bir oturumun kaldığı yerden devam edebilmesi için yazıldı.
> Önce `CLAUDE.md` (proje kuralları), sonra bu dosya okunur. Son güncelleme: Faz 1, yeşil palet ve 2 demo fotoğraf canlıda; sırada Faz 2.

## 1. Durum özeti

| Faz                                                               | Durum                                                                                               |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 0 Kurulum                                                         | ✅ canlıda                                                                                          |
| 1 Arayüz + örnek veri (+ menü, başa dön düğmesi, arama önerileri) | ✅ canlıda (`main`, PR #1 birleşti, `1f925ee`)                                                      |
| Yeşil renk paleti (Starbucks'a benzemeyen, kendi kimliğimiz)      | ✅ canlıda (`main`)                                                                                 |
| Demo fotoğraflar: kadın deri ceket + erkek kazak                  | ✅ canlıda; **lisansı doğrulanmamış, herkese açmadan önce değiştir** (bkz. `public/demo/README.md`) |
| 2 Veritabanı (Supabase)                                           | ⏭️ sıradaki, proje sahibi "Faz 2'ye geç" demeden başlama                                            |
| 3–7                                                               | planlandı (CLAUDE.md Bölüm 7)                                                                       |

Canlı site: https://enucuz.vercel.app (Vercel girişi + proje sahibi için **VPN** gerekir; `vercel.app` operatörde engelli gibi davranıyor).

## 2. Proje sahibi ve çalışma biçimi

- Yazılımı öğrenen biri; **yalnızca iPhone'dan** çalışıyor, terminali yok. Her şeyi sen yap.
- **Sade Türkçe** anlat, teknik terimi bir cümleyle açıkla. Arayüz Türkçe; kod, dosya adları, commit mesajları İngilizce.
- Her fazın sonunda: commit + push, önizleme/canlı link, "telefonda şunları kontrol et" listesi, **onay bekle**.
- Görsel kaliteye çok önem veriyor (apple.com'dan ilham, kopya değil). Ekran görüntüsüyle geri bildirim verir; ekran görüntüleri **gerçek iPhone** görüntüsüdür ve bizim testimizden farklı çıkabilir (bkz. tuzaklar).
- İstemediği şeyi yapma: izinsiz PR açma, `main`'e izinsiz birleştirme, gizli anahtarları koda yazma.

## 3. Altyapı ve erişim bilgileri

- **GitHub:** `can-senyurt/enucuz`, varsayılan dal `main`. Oturumların çalışma dalı: `claude/site-project-analysis-r9zxai`. Yalnızca GitHub MCP araçları var (`gh` yok). PR #1 `merge` yöntemiyle birleşti. Birleşmiş PR'ın dalı yeniden kullanılmaz: `git fetch origin main && git checkout -B <dal> origin/main`.
- **Commit biçimi:** Conventional Commits + sistemin istediği `Co-Authored-By` / `Claude-Session` satırları. PR açma: yalnızca proje sahibi isterse.
- **Vercel:** proje `enucuz`, id `prj_fe523jEoDKgybC0VE1YYTU4PfSAf`, takım id `team_5n1LX281T7d4AifQLHAAyzmA` (`cansenyurt30-1659s-projects`), Hobby plan. Production adresi `enucuz.vercel.app`. Dal önizleme adresi: `enucuz-git-claude-site-proje-dc7e27-cansenyurt30-1659s-projects.vercel.app`.
- **Vercel MCP:** ilk kullanımda `authorize_team_access` bir link verir, proje sahibi onaylar. Kullanılan araçlar: `list_deployments`, `get_deployment`, `list_deployment_events` (build günlüğü), `create_deployment` (önizleme için `gitSource: {type:"github", org, repo, ref, sha}`, `target` verme = önizleme). `web_fetch_vercel_url` korumayı aşmak için **paylaşım linki üretir**, izinsiz kullanma.
- **Otomatik deploy:** `main`'e birleşme → Production kendiliğinden. Dal push'u bazen önizleme üretmedi (Hobby planda yazarı "Claude" olan commit'ler engellenebilir). Üretmezse `create_deployment` ile elle başlat. Deploy durumunu mutlaka doğrula (`get_deployment` → `READY`). `main`'e doğrudan push (PR'sız) sonrası Production deploy'u görünmezse `create_deployment` ile `target: "production"` ve `gitSource` (ref `main`, sha) vererek elle başlat.
- **Deployment koruması (SSO) açık:** adresleri yalnızca Vercel hesabına girişli biri görür. Kapatmak proje sahibinin kararı; veriler kurgusal olduğu için şimdilik açık kalsın.

## 4. Neler yapıldı (dosya haritası)

```
src/app/            page.tsx (ana sayfa) · ara/ · kategori/[slug]/ · urun/[slug]/ · firsatlar/
                    api/oner/route.ts (arama önerileri) · layout.tsx · error.tsx · not-found.tsx · globals.css (TÜM token'lar)
src/components/
  layout/           Header (async, menü verisini çeker) · MenuDrawer (client, portal) · menu-data.ts · BackToTop · Footer · DemoBanner · ThemeToggle
  product/          ProductCard · ProductGrid · ProductHero (client: beden/renk, mağaza tablosu, alt çubuk) · PriceChart (client, SVG)
  search/           ProductListing (server; /ara ve /kategori ortak) · FilterForm · FilterSheet (alttan açılan panel)
  ui/               SearchBar (client, öneri kutusu) · ProductImage (SVG çizimler) · DealRing · DealBadge · Sparkline · Reveal · SectionHeader · EmptyState
src/lib/            config.ts (marka adı tek yerde) · format.ts (₺ biçimi) · deal-score.ts · smart-labels.ts · category-art.ts · search/normalize.ts · search/params.ts
src/data/           repository.ts (TEK giriş kapısı, arayüz) · mock/{catalog,generate,repository}.ts
src/types/index.ts  ortak tipler
tests/              deal-score · normalize · format · params-and-labels · mock-data (Vitest, 57 test)
scripts/qa/         Playwright/axe denetim betikleri (README'ye bak)
```

Özellikler: 40 kurgusal ürün/5 kurgusal mağaza/11 kurgusal marka, 90 günlük deterministik fiyat geçmişi, İndirim Skoru + şişirilmiş indirim tespiti, arama + filtre + sıralama + sayfalama, ürün sayfası (fiyat grafiği 30/90 gün, akıllı etiketler), kategori ve fırsatlar sayfaları, apple.com tarzı sol menü, başa dön düğmesi (ilerleme halkalı), arama önerileri (`/api/oner`), koyu mod, "Demo veriler" bandı.

### Ana sayfa üstü (oturum 3'te yenilendi)

- Hero artık: arama çubuğu (yazı "En uygun ürünler?") → en çok aranan 6 çip (`config.ts` `popularSearches`, şimdilik tahmini sıra; Faz 4'te gerçek sayımdan) → **kampanya kaydırıcısı** → **hikaye yuvarlakları**. Başlık/açıklama metni ve "Bugün N üründe gerçek indirim" kutusu kaldırıldı (görünmez `h1` duruyor).
- Header: arama simgesi yerine Favoriler + Giriş düğmeleri (`HeaderActions.tsx`); basınca "çok yakında" notu çıkar (üyelik Faz 5).
- `components/home/HeroCarousel.tsx` + `lib/home-banners.ts`: 12 kampanya, ~5,5 sn'de bir kendiliğinden geçer, yumuşak çapraz geçiş + yavaş yakınlaşma, Apple tarzı nokta/ilerleme hapı, duraklat düğmesi; fare üstünde/odakta/parmak basılıyken/ekran dışında/`prefers-reduced-motion` iken durur; kaydırma (swipe), ok tuşları ve ok düğmeleri var. Her slaytın bağlantısı var olan ve ürünü olan bir sayfaya gider.
- Kampanya fotoğrafları `public/banners/` (Pexels, lisans notu ve kaynak numaraları orada `README.md`). 16:9, 1280×720; sol tarafı metin için yumuşak renk geçişiyle genişletilmiş.
- `components/home/CategoryStories.tsx`: Instagram hikayesi gibi 11 yuvarlak kategori; ikonlar 3D WebP (`public/categories/`, kaynak ve üretim betiği `design-src/category-icons/`, anne-çocuk ikonu Microsoft Fluent Emoji 3D, MIT). Yalnızca Erkek/Kadın/Anne & Çocuk/Saat & Aksesuar gerçek kategoriye gider; diğerleri "çok yakında" notu gösterir (yeni kategoriler Faz 7).
- Ortam notu: Pexels'e erişim için ortamın ağ izin listesine `www.pexels.com` ve `images.pexels.com` eklendi (arama sayfaları bot korumalı, yalnızca görsel CDN'i açık).

## 5. Önemli kararlar

- **Veri kurgusal** (CLAUDE.md Bölüm 9): sahte mağaza/marka adları, ürün görselleri SVG çizim (`ProductImage`), fiyatlar uydurma. İstisna: proje sahibinin verdiği 2 örnek fotoğraf (aşağıda). Demo bandı `DATA_SOURCE` `mock` iken görünür (`isDemoData` in `config.ts`).
- **Repository Pattern:** sayfalar yalnızca `getRepository()` kullanır. Fiyatlar **kuruş cinsinden tam sayı**; biçimleme yalnızca `lib/format.ts` (`₺` öncesi bölünmeyen boşluk).
- **Deterministik mock:** `generate.ts` sabit tohumlu; "bugün" = `DEMO_TODAY = "2026-11-07"` (sabit saat). `Date.now()`/`Math.random()` kullanma (aşağıdaki `cacheComponents` kuralı).
- **Dış girdi Zod ile doğrulanır** (`search/params.ts`, `/api/oner`).
- **Başlıksız (hero) sayfada animasyon yok:** ilk boyama sabit olmalı (iOS tuzağı).
- **Renkler:** yalnızca `globals.css` token'ları (yeşil palet, CLAUDE.md 3.1). `on-accent` açık modda beyaz, koyu modda koyu yeşil. Yeni renk eklerken `scripts/qa/contrast.js` çalıştır.
- Framer Motion/Recharts **eklenmedi**: animasyonlar CSS, grafik elle SVG. Bağımlılıklar: lucide-react, zod; dev: vitest, prettier(+tailwind eklentisi). `@types/node` 22 (vitest şartı).

- **Demo fotoğraflar:** `src/data/mock/catalog.ts` içinde `photo?: string` alanı; yalnızca `siyah-deri-ceket-kadin` ve `yun-kazak-erkek` dolu (dosyalar `public/demo/*.jpg`, **4:5**, EXIF temizlenmiş, ~65–75 KB). `ProductVisual` fotoğraf varsa `next/image` (`fill`, `object-cover`) gösterir, yoksa SVG çizim. Fotoğraf `photoUrl` olarak kart, ürün detayı, menü ve arama önerisi modellerinde taşınır. Ürün sayfasında fotoğraf **yalnızca ilk renk** için görünür (fotoğraftaki renk); başka renk seçilirse o renkte çizim gösterilir. Yeni fotoğraf hazırlamak: `python3 -I scripts/crop-demo-photo.py <kaynak> <hedef> <üstten-px>` (4:5 kırpar, metadata siler); test (`tests/mock-data.test.ts`) oran, boyut (<150 KB) ve dosya varlığını denetler.

## 6. Tuzaklar (kaçın)

1. **Next.js 16 + `cacheComponents`** (create-next-app varsayılanı): prerender edilen kodda `new Date()`, `Date.now()`, `Math.random()` build'i bozar. `searchParams`/runtime veri **`<Suspense>` içinde** okunmalı; dinamik rotalar `generateStaticParams` ister. `dynamicParams` ve `dynamic` route config'leri **kullanılamaz**. Bilinmeyen `/urun/yok` → `notFound()` ama HTTP **200** (soft 404; Next `noindex` ekler). Rehber: `node_modules/next/dist/docs/` (AGENTS.md buna yönlendirir). `PageProps<"/...">` tipi bulunamazsa `npx next typegen`.
2. **Next önceki sayfaları gizli DOM'da tutar** (Activity): aynı `id` ikiye katlanır. Sabit `id` yerine `useId()` kullan; testlerde `:visible` seç.
3. **iOS Safari:** (a) `blur` filtre + `mask-image` + animasyonlu opaklık metnin etrafında **kutular çizdirdi**; hero'da yalnızca statik gradyan kullan. (b) `backdrop-filter` olan başlık, içindeki `position:fixed` çocukları kendi kutusuna hapseder → menü `createPortal` ile `body`'ye. (c) Üst öğede kalan `transform` da `fixed`'i bozar → animasyonlarda `fill-mode: backwards` + keyframe sonunda `transform: none`. (d) Rozetlerde `backdrop-blur` kullanma. (e) Safari sayfa yakınlaştırması düzen genişliğini ~312 px'e indirir: **390 ve 312 px'te test et**; kartlar kapsayıcı sorguları (`@container`, `@min-[…]`) ile uyum sağlar.
4. **Tailwind v4:** `rotate`/`translate` ayrı CSS özellikleridir (`getComputedStyle(...).rotate`); odak halkası `@layer base` içinde olmalı, yoksa `outline-none` ezilir; `overflow-x-auto` içindeki `sr-only` (absolute) üst öğe `relative` değilse sayfayı yana genişletir (kartlar `relative`).
5. **Prettier + tailwind eklentisi sınıf sırasını değiştirir:** metin değiştiren betikler gerçek metni okumalı. Edit/Write araçları dosya değiştikten sonra yeniden `Read` ister.
6. **iOS'ta blur ile kapatma güvenilmez:** öneri listesi `document pointerdown` ile kapanır.
7. **Fotoğraflar:** `next/image` `fill` kullanıyorsan üst öğe `relative` ve ölçülü olmalı (kart/küçük resim kapsayıcılarında `relative` var). Kare olmayan fotoğraf kırpılırken kadraj yüzü korumalı (üstten kırp).
8. **Playwright:** sabit öğeler için `scrollIntoView` sayfayı kaydırıp çubuğu gizleyebilir; `dispatchEvent('click')` kullan. WebKit kurulu değil, Safari'ye özgü hatalar yalnızca proje sahibinin ekran görüntüsünden anlaşılır.
9. Lint: `set-state-in-effect` kuralı var → client-only durum için `useSyncExternalStore`, rota değişimini "render sırasında önceki değerle karşılaştır" kalıbıyla yakala.

## 7. Bilinen eksikler / fikirler

- **Demo fotoğrafların lisansı doğrulanmamış** (proje sahibi bir Pinterest benzeri kaynaktan verdi). Site giriş korumalı olduğu için sorun değil; **herkese açmadan önce** kendi çekimleri ya da lisanslı görsellerle değiştirilmeli (CLAUDE.md Bölüm 9). Faz 2'de görseller Supabase Storage'a taşınıp `products.image_url` kullanılacak.
- Karttaki skor rozeti **alt-orta**da durur: fotoğraflarda yüz üstte olur, rozet yüzü kapatmasın. Fotoğraf eklerken bu kuralı koru.
- Filtre uygulayınca adreste boş parametreler (`kategori=&min=&max=`); çalışmayı bozmuyor.
- "Mağazaya Git" demo uyarısı gösterir (gerçek yönlendirme Faz 6, `/go/[offerId]`).
- "N dk önce güncellendi" demo saatine göre sabit; gerçek veride istemci tarafı göreli zaman bileşeni gerekecek.
- `scripts/qa` betikleri PR'larda otomatik çalışmıyor (Faz 6'da Playwright test paketine dönüştürülebilir).

## 8. Faz 2 planı (Supabase) — proje sahibi onaylayınca

1. Proje sahibi telefondan Supabase hesabı/projesi açar; adımları tek tek anlat. Anahtarları **yalnızca Vercel ortam değişkenlerine** yaz (`.env.example` repoda, gerçek değer yok). `DATA_SOURCE=mock|supabase`.
2. `supabase/migrations/`: CLAUDE.md Bölüm 5 tabloları, RLS **her tabloda açık**, okuma herkese yalnızca ürün/fiyat tablolarında, yazma yalnızca service role; indeksler (GIN `search_vector`, `products(slug)` unique vb.). `price_history` yalnızca fiyat değişince satır alır.
3. `supabase/seed.sql`: mock verisini üretip dışa aktar (aynı 40 ürün, aynı skorlar çıkmalı).
4. `src/data/supabase/repository.ts`: `ProductRepository` arayüzünün **tamamı** (`search`, `getBySlug`, `getDeals`, `getTopDrops`, `getInflatedDeals`, `getDealCount`, `getCategories`, `getCategoryBySlug`, `getCategoryDealIndex`, `getFilterOptions`, `getPriceHistory`, `getAllProductSlugs`, `getBrands`, `getCategoryCounts`, `suggest`). `getRepository()` `DATA_SOURCE`'a göre seçer. Sayfa kodu değişmemeli.
5. Türkçe arama: `turkish` FTS + `unaccent` + `pg_trgm` (yazım hatası toleransı), mock'taki davranışla uyumlu testler.
6. Kabul: site aynı görünür, veri Supabase'den gelir; `npm test` + `scripts/qa/*` yeşil. Demo bandı yalnızca gerçek veri gelince kalkar. `dynamicParams`/soft-404 durumunu yeniden değerlendir.

## 9. Sık kullanılan komutlar

```bash
npm run dev | build | lint | typecheck | format | format:check | test
npx next typegen                      # route tip dosyalarını yeniden üret
npm run build && npx next start -p 3100   # QA için
```

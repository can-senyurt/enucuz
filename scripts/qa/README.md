# QA betikleri

Telefona (iPhone 13 = 390 px, Safari yakınlaştırması açıkken ~312 px) ve masaüstüne göre siteyi gerçek tarayıcıda dener.
Bunlar birim test değil; uygulamayı çalıştırıp gezinir. Vitest testleri için `npm test`.

## Çalıştırma

```bash
npm run build && npx next start -p 3100 &     # siteyi 3100 portunda aç
node scripts/qa/overflow-audit.js              # 4 genişlikte kart/sayfa taşması
node scripts/qa/walk.js                        # tüm akış: kategori, ürün, filtre, menü, arama, koyu mod
node scripts/qa/menu.js  /tmp/shots            # menü: aç/kapat, kaydırma, klavye, bağlantılar (+ ekran görüntüsü klasörü)
node scripts/qa/suggest.js /tmp/shots          # arama önerileri
node scripts/qa/back-to-top.js /tmp/shots      # başa dön düğmesi
npm i --no-save axe-core && node scripts/qa/contrast.js   # açık+koyu modda WCAG AA kontrast
```

- `playwright` bu ortamda hazır kurulu (Chromium). Safari/WebKit kurulu **değil**, yani iOS'a özgü hatalar burada görünmez;
  iOS'ta sorun çıkaran teknikleri (bulanık arka plan + maske + animasyon) baştan kullanma.
- Ekran görüntüsü klasörü argümanı verilmezse bazı betikler `undefined/...` yazmaya çalışır; hep bir klasör ver.
- Betikler `http://localhost:3100` adresini kullanır.

// QA script (see scripts/qa/README.md). Needs the app running: npm run build && npx next start -p 3100
const { chromium, devices } = require('playwright');
const base = 'http://localhost:3100';
(async () => {
  const b = await chromium.launch();
  const bad = [];
  for (const w of [390, 312]) {
    const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: w, height: 760 } });
    const p = await ctx.newPage();
    p.on('console', m => { if (['error','warning'].includes(m.type())) bad.push(`[${w}] console: ${m.text()}`); });
    p.on('pageerror', e => bad.push(`[${w}] pageerror: ${e}`));
    p.on('response', r => { if (r.status() >= 400) bad.push(`[${w}] http ${r.status()} ${r.url()}`); });
    // click something, then wait for the URL to match
    const go = async (name, urlPart, action) => {
      try {
        await Promise.all([p.waitForURL((u) => u.pathname + u.search === urlPart || u.pathname.startsWith(urlPart) || u.href.includes(urlPart), { timeout: 8000 }), action()]);
        await p.waitForLoadState('networkidle');
        console.log(`[${w}] ok   ${name.padEnd(34)} -> ${new URL(p.url()).pathname}${new URL(p.url()).search}`);
      } catch (e) { bad.push(`[${w}] FAIL ${name}: ${String(e).split('\n')[0]}`); console.log(`[${w}] FAIL ${name}`); }
    };
    const act = async (name, fn) => { try { await fn(); console.log(`[${w}] ok   ${name}`); } catch (e) { bad.push(`[${w}] FAIL ${name}: ${String(e).split('\n')[0]}`); console.log(`[${w}] FAIL ${name}`); } };

    await p.goto(base + '/', { waitUntil: 'networkidle' });
    await go('tap category tile Ayakkabı', '/kategori/ayakkabi', () => p.locator('section[aria-label="Kategoriler"] a:has-text("Ayakkabı")').click());
    await go('tap first product', '/urun/', () => p.locator('a[href^="/urun/"]:visible').first().click());
    await act('pick size + colour', async () => { await p.locator('fieldset:visible:has(legend:has-text("Beden")) label').first().click(); await p.locator('fieldset:visible:has(legend:has-text("Renk")) label').last().click(); });
    await act('switch chart to 30 days', async () => { await p.locator('button:has-text("30 gün")').click(); await p.waitForTimeout(300); });
    await go('back home via logo', '/', () => p.locator('header a[aria-label$="ana sayfa"]').click());
    await go('search via popular chip', '/ara?q=', () => p.locator('nav[aria-label="Popüler aramalar"] a').first().click());
    await go('sort by lowest price', 'sirala=fiyat-artan', () => p.locator('nav[aria-label="Sıralama"] a:has-text("En düşük fiyat")').click());
    await act('open filter sheet', async () => { await p.locator('button:visible:has-text("Filtrele")').click(); await p.waitForTimeout(400); if (!(await p.evaluate(() => [...document.querySelectorAll('dialog')].some(d => d.open)))) throw new Error('sheet did not open'); });
    await go('apply a brand filter', 'marka=', async () => { await p.locator('dialog:visible label:has-text("Nordika")').click(); await p.locator('dialog:visible button:has-text("Sonuçları göster")').click(); });
    await act('sheet closed after apply', async () => { await p.waitForTimeout(300); if (await p.evaluate(() => [...document.querySelectorAll('dialog')].some(d => d.open))) throw new Error('sheet still open'); });
    await act('open the side menu', async () => { await p.locator('header button[aria-label="Menüyü aç"]').click(); await p.waitForTimeout(1000); });
    await act('expand Fırsatlar in the menu', async () => { await p.locator('nav[aria-label="Ana menü"] button:has-text("Fırsatlar")').click(); await p.waitForTimeout(700); });
    await go('deals page via side menu', '/firsatlar', () => p.locator('nav[aria-label="Ana menü"] a:has-text("Tüm fırsatlar")').click());
    await go('search icon in header', '/ara', () => p.locator('header a[aria-label="Ara"]').click());
    await act('type + submit search', async () => { await p.locator('main input[type=search]:visible').fill('kot pantolon'); await Promise.all([p.waitForURL(/q=kot/), p.keyboard.press('Enter')]); await p.waitForLoadState('networkidle'); });
    await act('results contain "Kot"', async () => { const t = await p.locator('main').innerText(); if (!/Kot/i.test(t)) throw new Error('no Kot result'); });
    await act('toggle dark theme', async () => { await p.locator('header button[aria-label*="tema"]').click(); const th = await p.evaluate(() => document.documentElement.dataset.theme); if (th !== 'dark') throw new Error('theme is ' + th); });
    await act('no duplicate ids that matter', async () => {
      const dups = await p.evaluate(() => { const c = {}; document.querySelectorAll('[id]').forEach(e => { c[e.id] = (c[e.id] || 0) + 1; }); return Object.entries(c).filter(([, n]) => n > 1).map(([id, n]) => `${id} x${n}`); });
      // headings kept from a previous page share names on purpose; ids used by label/for or url(#...) must be unique
      const risky = dups.filter(d => /^(q|pulse|:r|«)/.test(d) || /pulse/.test(d));
      console.log(`      (duplicate ids in DOM: ${dups.length ? dups.join(', ') : 'none'})`);
      if (risky.length) throw new Error('risky duplicate ids: ' + risky.join(', '));
    });
    await ctx.close();
  }
  console.log(bad.length ? '\nPROBLEMS:\n' + [...new Set(bad)].join('\n') : '\nWALK: everything worked, no console errors, no failed requests');
  await b.close();
})();

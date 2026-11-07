// QA script (see scripts/qa/README.md). Needs the app running: npm run build && npx next start -p 3100
const { chromium, devices } = require('playwright');
const out = process.argv[2];
const base = 'http://localhost:3100';
(async () => {
  const b = await chromium.launch();
  const bad = [];
  for (const { w, mobile } of [{ w: 390, mobile: true }, { w: 312, mobile: true }, { w: 1280, mobile: false }]) {
    const ctx = await b.newContext(mobile ? { ...devices['iPhone 13'], viewport: { width: w, height: 760 }, deviceScaleFactor: 2, hasTouch: true } : { viewport: { width: w, height: 800 } });
    const p = await ctx.newPage();
    p.on('console', m => { if (['error','warning'].includes(m.type())) bad.push(`[${w}] console: ${m.text()}`); });
    p.on('pageerror', e => bad.push(`[${w}] pageerror: ${e}`));
    let apiCalls = 0; p.on('request', r => { if (r.url().includes('/api/oner')) apiCalls++; });
    const ok = (n, c, extra = '') => { console.log(`[${w}] ${c ? 'ok  ' : 'FAIL'} ${n} ${extra}`); if (!c) bad.push(`[${w}] ${n}`); };
    const input = () => p.locator('main input[type=search]').first();
    const list = () => p.locator('main [role=listbox]');

    await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
    await input().click(); await p.waitForTimeout(500);
    ok('focus shows popular searches', (await list().locator('[role=option]').count()) === 6 && /popüler aramalar/i.test(await list().innerText()));
    await p.screenshot({ path: `${out}/s-popular-${w}.png` });

    apiCalls = 0;
    await input().pressSequentially('ayakkabi', { delay: 25 }); // fast typing
    await p.waitForTimeout(900);
    ok('fast typing makes few requests (debounce)', apiCalls <= 2, `(${apiCalls} request(s) for 8 letters)`);
    await input().fill(''); await input().pressSequentially('ayak', { delay: 60 }); await p.waitForTimeout(900);
    const txt = await list().innerText();
    ok('"ayak" shows Ürünler / Kategoriler sections', /ÜRÜNLER/i.test(txt) && /KATEGORİLER/i.test(txt));
    ok('shoe categories are suggested', /Ayakkabı/.test(txt) && /Spor Ayakkabı/.test(txt));
    ok('last row offers all results', /“ayak” için tüm sonuçlar/.test(txt));
    const marks = await list().locator('mark').allInnerTexts();
    ok('typed part is highlighted', marks.length > 0 && marks.every(m => /^ayak/i.test(m)), `(${marks.slice(0, 3).join(', ')})`);
    const geo = await p.evaluate(() => { const l = document.querySelector('main [role=listbox]').getBoundingClientRect(); const last = [...document.querySelectorAll('main [role=option]')].pop().getBoundingClientRect(); const hit = document.elementFromPoint(last.x + last.width / 2, last.y + last.height / 2); return { left: l.left, right: l.right, vw: innerWidth, bottom: l.bottom, vh: innerHeight, lastClickable: !!hit?.closest('[role=option]') && last.bottom <= l.bottom + 1 && last.bottom <= innerHeight, listBottom: Math.round(l.bottom) }; });
    ok('list stays inside the screen sideways', geo.left >= 0 && geo.right <= geo.vw, `(${Math.round(geo.left)}..${Math.round(geo.right)} of ${geo.vw})`);
    ok('list is not clipped by the hero (last row is reachable)', geo.lastClickable);
    await p.screenshot({ path: `${out}/s-ayak-${w}.png` });

    // keyboard
    await input().press('ArrowDown'); await p.waitForTimeout(100);
    const act1 = await input().getAttribute('aria-activedescendant');
    await input().press('ArrowDown'); const act2 = await input().getAttribute('aria-activedescendant');
    ok('arrow keys move the highlight', !!act1 && !!act2 && act1 !== act2);
    await input().press('ArrowUp'); ok('arrow up goes back', (await input().getAttribute('aria-activedescendant')) === act1);
    await Promise.all([p.waitForURL(/\/urun\//), input().press('Enter')]);
    ok('Enter opens the highlighted product', /\/urun\//.test(p.url()), p.url().replace(base, ''));

    // typo + no result
    await p.goto(base + '/', { waitUntil: 'networkidle' });
    await input().click(); await input().pressSequentially('ayakabi', { delay: 30 }); await p.waitForTimeout(900);
    ok('a typo ("ayakabi") still finds shoes', (await list().locator('[role=option]').count()) > 1 && /Ayakkab|Sneaker|Spor/i.test(await list().innerText()));
    await input().fill('zzzz'); await p.waitForTimeout(900);
    ok('no match shows a friendly message', /öneri bulamadık/.test(await list().innerText()));
    await input().fill('ayak'); await p.waitForTimeout(700);

    // closing
    await input().press('Escape'); await p.waitForTimeout(250);
    ok('Escape closes the list', (await list().count()) === 0);
    await input().press('ArrowDown'); await p.waitForTimeout(300);
    ok('ArrowDown reopens it', (await list().count()) === 1);
    await p.mouse.click(w / 2, 40 + 30); await p.waitForTimeout(300);
    ok('tapping outside closes it', (await list().count()) === 0);

    // real tap on a suggestion
    await input().fill(''); await input().click(); await input().pressSequentially('kot', { delay: 40 }); await p.waitForTimeout(900);
    await Promise.all([p.waitForURL(/\/urun\/|\/kategori\/|\/ara/), list().locator('[role=option] a').first().click()]);
    ok('tapping a suggestion navigates', /\/urun\/|\/kategori\/|\/ara/.test(p.url()), p.url().replace(base, ''));

    // Enter without a highlighted row = normal search
    await p.goto(base + '/', { waitUntil: 'networkidle' });
    await input().click(); await input().pressSequentially('mont', { delay: 40 }); await p.waitForTimeout(800);
    await Promise.all([p.waitForURL(/q=mont/), input().press('Enter')]); await p.waitForLoadState('networkidle');
    ok('Enter without a highlight runs a normal search', /q=mont/.test(p.url()));
    ok('search page keeps the typed text', (await input().inputValue()) === 'mont');

    // menu variant
    await p.goto(base + '/', { waitUntil: 'networkidle' });
    await p.locator('header button[aria-label="Menüyü aç"]').click(); await p.waitForTimeout(1000);
    const mi = p.locator('nav[aria-label="Ana menü"] input[type=search]');
    await mi.click(); await mi.pressSequentially('ayak', { delay: 50 }); await p.waitForTimeout(900);
    ok('menu search shows suggestions inline', (await p.locator('nav[aria-label="Ana menü"] [role=option]').count()) > 2);
    if (w === 390) await p.screenshot({ path: `${out}/s-menu-${w}.png` });
    await mi.press('Escape'); await p.waitForTimeout(300);
    ok('first Escape closes only the suggestions, not the menu', (await p.locator('nav[aria-label="Ana menü"] [role=listbox]').count()) === 0 && await p.evaluate(() => !document.querySelector('nav[aria-label="Ana menü"]').hasAttribute('inert')));
    await mi.pressSequentially('t', { delay: 40 }); await p.waitForTimeout(800);
    await Promise.all([p.waitForURL(/\/urun\/|\/kategori\/|\/ara/), p.locator('nav[aria-label="Ana menü"] [role=option] a').first().click()]); await p.waitForTimeout(900);
    ok('choosing a menu suggestion closes the menu', await p.evaluate(() => document.querySelector('nav[aria-label="Ana menü"]').hasAttribute('inert')));
    await ctx.close();
  }
  console.log(bad.length ? '\nPROBLEMS:\n' + [...new Set(bad)].join('\n') : '\nSUGGESTIONS: all checks passed');
  await b.close();
})();

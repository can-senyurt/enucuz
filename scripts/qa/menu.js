// QA script (see scripts/qa/README.md). Needs the app running: npm run build && npx next start -p 3100
const { chromium, devices } = require('playwright');
const out = process.argv[2];
const base = 'http://localhost:3100';
(async () => {
  const b = await chromium.launch();
  const bad = [];
  const sizes = [{ w: 390, mobile: true }, { w: 312, mobile: true }, { w: 1280, mobile: false }];
  for (const { w, mobile } of sizes) {
    const ctx = await b.newContext(mobile ? { ...devices['iPhone 13'], viewport: { width: w, height: 760 }, deviceScaleFactor: 2, hasTouch: true } : { viewport: { width: w, height: 800 } });
    const p = await ctx.newPage();
    p.on('console', m => { if (['error','warning'].includes(m.type())) bad.push(`[${w}] console: ${m.text()}`); });
    p.on('pageerror', e => bad.push(`[${w}] pageerror: ${e}`));
    const ok = (n, c, extra = '') => { console.log(`[${w}] ${c ? 'ok  ' : 'FAIL'} ${n} ${extra}`); if (!c) bad.push(`[${w}] ${n}`); };
    const trigger = () => p.locator('header button[aria-controls]');
    const panel = () => p.locator('nav[aria-label="Ana menü"]');
    const isOpen = () => p.evaluate(() => { const n = document.querySelector('nav[aria-label="Ana menü"]'); return !!n && !n.hasAttribute('inert'); });
    const openIt = async () => { await trigger().click(); await p.waitForTimeout(1100); };

    await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
    ok('closed: menu is inert', !(await isOpen()));
    ok('closed: button says "Menüyü aç"', (await trigger().getAttribute('aria-label')) === 'Menüyü aç');
    if (w === 390) await p.screenshot({ path: `${out}/a-header.png`, clip: { x: 0, y: 0, width: w, height: 120 } });

    // open, with animation frames
    await trigger().click();
    if (w === 390) { for (const ms of [90, 150, 220]) { await p.waitForTimeout(ms === 90 ? 90 : ms === 150 ? 60 : 70); await p.screenshot({ path: `${out}/a-anim-${ms}.png` }); } }
    await p.waitForTimeout(1100);
    ok('open: menu active', await isOpen());
    ok('open: button says "Menüyü kapat"', (await trigger().getAttribute('aria-label')) === 'Menüyü kapat');
    ok('open: aria-expanded', (await trigger().getAttribute('aria-expanded')) === 'true');
    const geo = await p.evaluate(() => { const n = document.querySelector('nav[aria-label="Ana menü"]').getBoundingClientRect(); const h = document.querySelector('header').getBoundingClientRect(); const t = document.querySelector('header button[aria-controls]').getBoundingClientRect(); const hit = document.elementFromPoint(t.x + t.width / 2, t.y + t.height / 2); return { navTop: Math.round(n.top), navW: Math.round(n.width), headerBottom: Math.round(h.bottom), vw: innerWidth, hitIsTrigger: !!hit?.closest('button[aria-controls]'), lines: [...document.querySelectorAll('header button[aria-controls] span span')].map(s => getComputedStyle(s).rotate) }; });
    ok('open: sheet starts right under the header', Math.abs(geo.navTop - geo.headerBottom) <= 2, `(sheet top ${geo.navTop}, header bottom ${geo.headerBottom})`);
    ok('open: header button stays tappable above the sheet', geo.hitIsTrigger);
    ok('open: sheet width', mobile ? geo.navW === geo.vw : geo.navW === 416, `(${geo.navW}px of ${geo.vw}px)`);
    ok('open: menu button became an X (both lines rotated)', geo.lines.length === 2 && geo.lines[0] === '45deg' && geo.lines[1] === '-45deg', geo.lines.join(' / '));
    ok('open: page behind is locked + inert', await p.evaluate(() => getComputedStyle(document.documentElement).overflow === 'hidden' && document.querySelector('main').hasAttribute('inert')));
    await p.screenshot({ path: `${out}/a-open-${w}.png` });

    // accordion: one open at a time
    await p.locator('nav[aria-label="Ana menü"] button:has-text("Kadın")').click(); await p.waitForTimeout(750);
    ok('Kadın expands to its sub-categories', await p.locator('nav a:has-text("Elbise")').first().isVisible());
    await p.screenshot({ path: `${out}/a-kadin-${w}.png` });
    await p.locator('nav[aria-label="Ana menü"] button:has-text("Erkek")').click(); await p.waitForTimeout(750);
    ok('opening Erkek closes Kadın', (await p.locator('nav button:has-text("Kadın")').getAttribute('aria-expanded')) === 'false' && (await p.locator('nav button:has-text("Erkek")').getAttribute('aria-expanded')) === 'true' && await p.locator('nav a:has-text("Pantolon")').first().isVisible());
    await p.locator('nav[aria-label="Ana menü"] button:has-text("Fırsatlar")').click(); await p.waitForTimeout(750);
    await p.screenshot({ path: `${out}/a-firsat-${w}.png` });
    await p.locator('nav[aria-label="Ana menü"] button:has-text("Markalar")').click(); await p.waitForTimeout(750);
    await p.screenshot({ path: `${out}/a-marka-${w}.png` });

    const over = await p.evaluate(() => { const a = document.querySelector('nav[aria-label="Ana menü"]'); const ar = a.getBoundingClientRect(); const bad = []; a.querySelectorAll('*').forEach(el => { const r = el.getBoundingClientRect(); if (r.width && el.closest('[inert]') === null && (r.right > ar.right + 1 || r.left < ar.left - 1)) bad.push(el.tagName + ' ' + String(el.className?.baseVal ?? el.className).slice(0, 30)); }); return bad.slice(0, 5); });
    ok('nothing pokes out of the sheet', over.length === 0, over.join(' | '));

    // closing paths
    await trigger().click(); await p.waitForTimeout(900);
    ok('X button closes', !(await isOpen()));
    ok('page unlocked + focus back on button', await p.evaluate(() => getComputedStyle(document.documentElement).overflow !== 'hidden' && !document.querySelector('main').hasAttribute('inert') && document.activeElement?.hasAttribute('aria-controls')));
    await openIt(); await p.keyboard.press('Escape'); await p.waitForTimeout(900);
    ok('Escape closes', !(await isOpen()));
    if (!mobile) { await openIt(); await p.mouse.click(w - 40, 500); await p.waitForTimeout(900); ok('tapping the dim area closes (desktop)', !(await isOpen())); }
    if (mobile) {
      await openIt();
      const cdp = await ctx.newCDPSession(p); const y = 400, x0 = w - 40;
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });
      for (let i = 1; i <= 8; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 - i * 24, y: y + i }] });
      await p.waitForTimeout(80); if (w === 390) await p.screenshot({ path: `${out}/a-swipe.png` });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(900);
      ok('swipe left closes', !(await isOpen()));
      await openIt();
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y }] });
      for (let i = 1; i <= 3; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 - i * 12, y }] });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(800);
      ok('short swipe springs back', await isOpen());
      await trigger().click(); await p.waitForTimeout(800);
    }

    // navigation from the menu
    await openIt();
    await p.locator('nav[aria-label="Ana menü"] button:has-text("Fırsatlar")').click(); await p.waitForTimeout(700);
    await Promise.all([p.waitForURL('**/urun/**'), p.locator('nav[aria-label="Ana menü"] a[href^="/urun/"]').first().click()]); await p.waitForTimeout(900);
    ok('featured product opens and closes the menu', !(await isOpen()) && /\/urun\//.test(p.url()), p.url().replace(base, ''));
    await openIt();
    await p.locator('nav[aria-label="Ana menü"] button:has-text("Markalar")').click(); await p.waitForTimeout(700);
    await Promise.all([p.waitForURL('**marka=nordika*'), p.locator('nav[aria-label="Ana menü"] a[href="/ara?marka=nordika"]').click()]); await p.waitForLoadState('networkidle');
    ok('brand opens filtered results', /marka=nordika/.test(p.url()) && /Nordika/.test(await p.locator('ul[aria-label="Aktif filtreler"]').innerText().catch(() => '')));
    await openIt();
    await p.locator('nav[aria-label="Ana menü"] input[type=search]').fill('kot pantolon'); await Promise.all([p.waitForURL(/q=kot/), p.keyboard.press('Enter')]); await p.waitForLoadState('networkidle'); await p.waitForTimeout(700);
    ok('search from the menu works and closes it', !(await isOpen()) && /Kot/i.test(await p.locator('main').innerText()));
    await openIt();
    const sw = p.locator('nav[aria-label="Ana menü"] [role=switch]'); await sw.scrollIntoViewIfNeeded();
    const before = await sw.getAttribute('aria-checked'); await sw.click(); await p.waitForTimeout(500);
    ok('dark switch toggles', before !== (await sw.getAttribute('aria-checked')));
    if (w === 390) { await p.screenshot({ path: `${out}/a-dark-${w}.png` }); }
    await ctx.close();
  }
  console.log(bad.length ? '\nPROBLEMS:\n' + [...new Set(bad)].join('\n') : '\nMENU: all checks passed');
  await b.close();
})();

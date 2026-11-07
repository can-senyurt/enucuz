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
    const ok = (n, c, extra = '') => { console.log(`[${w}] ${c ? 'ok  ' : 'FAIL'} ${n} ${extra}`); if (!c) bad.push(`[${w}] ${n}`); };
    const btn = () => p.locator('button[data-back-to-top]');
    const shown = () => p.evaluate(() => { const e = document.querySelector('button[data-back-to-top]'); const c = getComputedStyle(e); return c.visibility === 'visible' && Number(c.opacity) > 0.9; });
    const y = () => p.evaluate(() => Math.round(window.scrollY));
    const scrollBy = async (dy) => { await p.evaluate((d) => window.scrollBy(0, d), dy); };

    await p.goto(base + '/', { waitUntil: 'networkidle' }); await p.waitForTimeout(600);
    ok('hidden at the top of the page', !(await shown()));
    ok('hidden button is not reachable by keyboard / screen reader', (await btn().getAttribute('aria-hidden')) === 'true' && (await btn().getAttribute('tabindex')) === '-1');

    // browsing downwards: should stay out of the way
    for (let i = 0; i < 12; i++) { await scrollBy(220); await p.waitForTimeout(40); }
    ok('stays hidden while the user keeps scrolling down', !(await shown()), `(scrollY ${await y()})`);
    await p.waitForTimeout(1000);
    ok('appears once scrolling stops', await shown());
    ok('now reachable (aria-hidden false, tabindex 0)', (await btn().getAttribute('aria-hidden')) === 'false' && (await btn().getAttribute('tabindex')) === '0');
    await p.evaluate(() => window.scrollBy(0, 220)); await p.waitForTimeout(80);
    ok('quiet again when scrolling down again', !(await shown()));
    await scrollBy(-300); await p.waitForTimeout(700);
    ok('appears when scrolling up', await shown());
    if (w === 390) await p.screenshot({ path: `${out}/t-visible-${w}.png` });

    // progress ring follows the scroll position
    const ring = () => p.evaluate(() => Number(document.querySelector('button[data-back-to-top] circle:nth-of-type(2)').style.strokeDashoffset));
    const ringMid = await ring();
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(500);
    const ringEnd = await ring();
    ok('progress ring fills towards the bottom', ringEnd < ringMid && ringEnd < 3, `(offset ${Math.round(ringMid)} -> ${Math.round(ringEnd)})`);
    ok('button shows at the very bottom', await shown());
    if (w === 390) await p.screenshot({ path: `${out}/t-bottom-${w}.png` });

    // smooth scroll up
    const start = await y();
    await btn().click();
    const samples = [];
    for (let i = 0; i < 16; i++) { await p.waitForTimeout(80); samples.push(await y()); }
    const mid = samples.filter(v => v > 5 && v < start - 5);
    ok('click scrolls up gradually, not in one jump', mid.length >= 3, `(from ${start}: ${samples.slice(0, 8).join(', ')} ...)`);
    ok('samples only ever go up', samples.every((v, i) => i === 0 || v <= samples[i - 1] + 1));
    await p.waitForTimeout(900);
    ok('ends exactly at the top', (await y()) === 0);
    await p.waitForTimeout(300);
    ok('button hides again at the top', !(await shown()));

    // user can interrupt it
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(1000);
    await btn().click(); await p.waitForTimeout(150);
    const before = await y();
    await p.mouse.wheel(0, 600); await p.waitForTimeout(500);
    const after = await y();
    ok('touching / wheeling takes control back', after > 0 && after >= before - 50, `(${before} -> ${after})`);

    // reduced motion = instant
    const rctx = await b.newContext({ ...(mobile ? devices['iPhone 13'] : {}), viewport: { width: w, height: mobile ? 760 : 800 }, reducedMotion: 'reduce' });
    const rp = await rctx.newPage();
    await rp.goto(base + '/', { waitUntil: 'networkidle' });
    await rp.evaluate(() => window.scrollTo(0, 2500)); await rp.waitForTimeout(900);
    await rp.evaluate(() => document.querySelector('button[data-back-to-top]').click()); await rp.waitForTimeout(120);
    ok('reduced motion: jumps to top at once', (await rp.evaluate(() => Math.round(scrollY))) === 0);
    await rctx.close();

    // product page: sits above the mobile buy bar
    if (mobile) {
      await p.goto(base + '/urun/siyah-deri-ceket-kadin', { waitUntil: 'networkidle' }); await p.waitForTimeout(700);
      await p.evaluate(() => window.scrollTo(0, 3000)); await p.waitForTimeout(700);
      await scrollBy(-250); await p.waitForTimeout(900);
      const geo = await p.evaluate(() => { const bb = document.querySelector('button[data-back-to-top]').getBoundingClientRect(); const bar = [...document.querySelectorAll('div[class*="fixed inset-x-0 bottom-0"]')].find(d => d.querySelector('button') && /Mağazaya Git/.test(d.textContent)); const br = bar?.getBoundingClientRect(); return { btnBottom: bb.bottom, barTop: br?.top, barShown: br ? br.top < innerHeight : false, flag: document.body.dataset.buyBar }; });
      ok('buy bar flag is on while the bar shows', geo.flag === 'on' && geo.barShown, JSON.stringify({ flag: geo.flag }));
      ok('back-to-top sits above the buy bar (no overlap)', geo.btnBottom <= geo.barTop + 1, `(button bottom ${Math.round(geo.btnBottom)}, bar top ${Math.round(geo.barTop)})`);
      if (w === 390) await p.screenshot({ path: `${out}/t-product-${w}.png` });
    }

    // menu open: button is not reachable
    await p.goto(base + '/', { waitUntil: 'networkidle' });
    await p.evaluate(() => window.scrollTo(0, 2000)); await p.waitForTimeout(1000);
    await p.locator('header button[aria-label="Menüyü aç"]').click(); await p.waitForTimeout(1000);
    ok('while the menu is open the button is inert', await p.evaluate(() => document.querySelector('button[data-back-to-top]').hasAttribute('inert')));
    await p.keyboard.press('Escape'); await p.waitForTimeout(600);
    ok('and usable again after closing', await p.evaluate(() => !document.querySelector('button[data-back-to-top]').hasAttribute('inert')));

    // dark mode look
    if (w === 390) { await p.evaluate(() => { document.documentElement.dataset.theme = 'dark'; window.scrollBy(0, -200); }); await p.waitForTimeout(900); await p.screenshot({ path: `${out}/t-dark-${w}.png` }); }
    await ctx.close();
  }
  console.log(bad.length ? '\nPROBLEMS:\n' + [...new Set(bad)].join('\n') : '\nBACK-TO-TOP: all checks passed');
  await b.close();
})();

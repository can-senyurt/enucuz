// QA script (see scripts/qa/README.md). Needs the app running: npm run build && npx next start -p 3100
const { chromium, devices } = require('playwright');
const base = 'http://localhost:3100';
const widths = [390, 360, 320, 300];
const pages = ['/', '/ara?q=ceket', '/kategori/kadin', '/kategori/ayakkabi', '/firsatlar', '/urun/siyah-deri-ceket-kadin', '/urun/saten-bluz', '/urun/kargo-pantolon'];
const scrollAll = async (p) => { await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 350) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } window.scrollTo(0, 0); }); await p.waitForTimeout(1000); };
(async () => {
  const b = await chromium.launch();
  let issues = 0;
  for (const w of widths) {
    const ctx = await b.newContext({ ...devices['iPhone 13'], viewport: { width: w, height: 700 }, colorScheme: 'light' });
    const p = await ctx.newPage();
    for (const path of pages) {
      await p.goto(base + path, { waitUntil: 'networkidle' });
      await scrollAll(p);
      const r = await p.evaluate((w) => {
        const out = [];
        if (document.documentElement.scrollWidth > w + 1) out.push(`PAGE scrolls sideways: ${document.documentElement.scrollWidth} > ${w}`);
        // anything poking out of its card / tile
        document.querySelectorAll('a.group, li > a, [class*="rounded-[1.75rem]"], [class*="rounded-3xl"]').forEach((card) => {
          const cr = card.getBoundingClientRect();
          if (cr.width === 0) return;
          card.querySelectorAll('*').forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0) return;
            // Things that are clipped on purpose by an overflow-hidden wrapper inside the card are fine.
            let a = el.parentElement, clipped = false;
            while (a && a !== card) { const o = getComputedStyle(a).overflowX; if (o === 'hidden' || o === 'clip') { clipped = true; break; } a = a.parentElement; }
            if (clipped) return;
            // ignore things inside horizontal scrollers' off-screen parts: compare to card only
            if (r.left < cr.left - 1.5 || r.right > cr.right + 1.5) {
              out.push(`OVERFLOW in card: <${el.tagName.toLowerCase()} class="${String(el.className?.baseVal ?? el.className).slice(0, 40)}"> "${(el.textContent || '').trim().slice(0, 28)}" by ${Math.round(Math.max(cr.left - r.left, r.right - cr.right))}px`);
            }
          });
        });
        return [...new Set(out)].slice(0, 6);
      }, w);
      if (r.length) { issues += r.length; console.log(`[${w}px] ${path}\n   ` + r.join('\n   ')); }
    }
    await ctx.close();
  }
  console.log(issues === 0 ? 'AUDIT: no overflow problems at any width' : `AUDIT: ${issues} problem(s)`);
  await b.close();
})();

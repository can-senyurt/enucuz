// QA script (see scripts/qa/README.md). Needs the app running: npm run build && npx next start -p 3100
const { chromium, devices } = require('playwright');
const fs = require('fs');
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8') // npm i --no-save axe-core;
const base = 'http://localhost:3100';
const pages = ['/', '/ara?q=ceket', '/kategori/kadin', '/firsatlar', '/urun/siyah-deri-ceket-kadin', '/urun/saten-bluz'];
(async () => {
  const b = await chromium.launch();
  let total = 0;
  for (const theme of ['light', 'dark']) {
    const ctx = await b.newContext({ ...devices['iPhone 13'], colorScheme: theme });
    const p = await ctx.newPage();
    for (const path of pages) {
      await p.goto(base + path, { waitUntil: 'networkidle' });
      await p.evaluate((t) => { document.documentElement.dataset.theme = t; }, theme);
      // reveal everything below the fold, then wait for transitions
      await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } window.scrollTo(0, 0); });
      await p.waitForTimeout(1200);
      await p.addScriptTag({ content: axeSrc });
      const res = await p.evaluate(async () => { const r = await axe.run(document, { runOnly: ['color-contrast'] }); return r.violations.flatMap(v => v.nodes.map(n => ({ target: n.target.join(' ').slice(0, 70), msg: (n.any[0]?.message || '').slice(0, 110) }))); });
      total += res.length;
      console.log(`[${theme}] ${path.padEnd(30)} ${res.length === 0 ? 'no contrast problems' : res.length + ' problem(s)'}`);
      res.slice(0, 4).forEach(r => console.log('      ', r.target, '|', r.msg));
    }
    await ctx.close();
  }
  console.log(total === 0 ? '\nCONTRAST: no AA problems found' : `\nCONTRAST: ${total} problem(s)`);
  await b.close();
})();

/* Checks the landing page in Chromium at 360, 768 and 1280 px, with the device set to light and to dark (the page is light only).
   Run: node tests/check.js   (needs Node.js and Playwright; serves the folder on a local port) */
const path = require('path'), fs = require('fs'), http = require('http');
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const ROOT = path.join(__dirname, '..'), OUT = process.env.SHOTS || path.join(ROOT, 'tests', 'shots');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
let fails = 0; const fail = (...a) => { fails++; console.log('FAIL', ...a); };
const ok = (c, ...a) => c ? console.log('ok  ', ...a) : fail(...a);

const server = http.createServer((q, r) => {
  const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]).replace(/\/$/, '/index.html'));
  if (!f.startsWith(ROOT) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r);
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const URL = `http://localhost:${server.address().port}/`;
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();

  const size = ['index.html', 'courses.js'].reduce((s, f) => s + fs.statSync(path.join(ROOT, f)).size, 0);
  ok(size < 150 * 1024, `page size ${(size / 1024).toFixed(1)} KB < 150 KB`);

  const SEED = { 'phy-done': JSON.stringify(Object.fromEntries(['deriv','integ','products','diffeq','graphs','constant','variable','vectors','projectile','relative','forces','friction'].map(k => [k, 1]))),
                 'mvc-visited': JSON.stringify(['quadric', 'vectors', 'cross', 'quadric', 'lines']),
                 'other-done': JSON.stringify({ graphs: 1 }) };  /* another site's key on the same origin: must be ignored */

  for (const scheme of ['light', 'dark']) for (const w of [360, 768, 1280]) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    p.on('console', m => { if (m.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(m.text()) && !/ERR_(TUNNEL|NAME|CONNECTION|PROXY)/.test(m.text())) errs.push(m.text()); });
    p.on('requestfailed', () => {});
    await p.goto(URL); await p.evaluate(s => { for (const k in s) localStorage.setItem(k, s[k]); }, SEED);
    await p.reload(); await p.waitForTimeout(400);
    const tag = `${scheme} ${w}px`;

    ok(!(await p.evaluate(() => document.documentElement.scrollWidth > innerWidth)), tag, 'no horizontal scroll');
    ok(!/NaN|undefined|Infinity|\[object/.test(await p.evaluate(() => document.body.innerText)), tag, 'no NaN/undefined text');
    ok(await p.evaluate(() => document.compatMode === 'CSS1Compat'), tag, 'standards mode');
    const ring = await p.evaluate(() => { const a = document.querySelector('a.card[data-id="phy103"] .prog'); return a && a.textContent.trim(); });
    ok(ring === '12 of 32 modules done', tag, 'PHY 103 ring (phy- keys only):', ring);
    ok(await p.evaluate(() => !!document.querySelector('a.card[data-id="phy103"] .ring .val')), tag, 'ring drawn');
    ok(await p.evaluate(() => document.querySelectorAll('.card.soon .prog').length === 0), tag, 'no ring on coming-soon cards');
    ok((await p.evaluate(() => { const a = document.querySelector('a.card[data-id="mat201"] .prog'); return a && a.textContent.trim(); })) === '4 of 41 lessons visited', tag, 'MAT 201 ring (list of ids, duplicates counted once)');
    const small = await p.evaluate(() => [...document.querySelectorAll('a,button,input')].filter(e => e.offsetParent && !e.classList.contains('skip'))
      .map(e => { const r = e.getBoundingClientRect(); return [e.id || e.className || e.textContent.trim().slice(0, 20), r.width, r.height]; })
      .filter(([, W, H]) => W < 44 || H < 44));
    ok(!small.length, tag, 'touch targets >= 44px', small.length ? JSON.stringify(small) : '');
    if (w === 1280) {
      const low = await p.evaluate(() => {
        const cv = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
        const rgbOf = c => { cv.clearRect(0, 0, 1, 1); cv.fillStyle = '#000'; cv.fillStyle = c; cv.fillRect(0, 0, 1, 1); return [...cv.getImageData(0, 0, 1, 1).data].slice(0, 3); };
        const lum = c => { const [r, g, b2] = rgbOf(c).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b2; };
        const bgOf = e => { while (e) { const c = getComputedStyle(e).backgroundColor; if (!/rgba\(0, 0, 0, 0\)|transparent/.test(c) && !/[,/] 0\)$/.test(c)) return c; e = e.parentElement; } return getComputedStyle(document.body).backgroundColor; };
        const out = [];
        document.querySelectorAll('.tagline,.course,.desc,.topics li,.open,.meta,.prog,.badge,.subj,.chip,footer p,.btn-ghost,h3,.eyebrow,#q').forEach(e => {
          const s = getComputedStyle(e);
          const a = lum(s.color), c = lum(bgOf(e)); const r = (Math.max(a, c) + .05) / (Math.min(a, c) + .05);
          if (r < 4.5) out.push(e.className + ':' + r.toFixed(2)); });
        return out; });
      ok(!low.length, tag, 'text contrast >= 4.5:1', low.join(' '));
      const dup = await p.evaluate(() => { const s = {}; return [...document.querySelectorAll('[id]')].map(e => e.id.toLowerCase()).filter(i => s[i] ? 1 : (s[i] = 1, 0)); });
      ok(!dup.length, tag, 'no ids that differ only by case', dup.join(','));
      ok(JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('h1,h2,h3')].map(h => h.tagName))) === JSON.stringify(['H1', 'H2', 'H3', 'H3', 'H3']), tag, 'heading order');
    }
    ok(!errs.length, tag, 'no console errors', errs.join(' | '));
    await p.screenshot({ path: path.join(OUT, `${scheme}-${w}.png`), fullPage: true });
    await ctx.close();
  }

  /* behaviour: filters, search, theme toggle, read-only storage, no data */
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } }); const p = await ctx.newPage();
  await p.goto(URL); await p.evaluate(s => { for (const k in s) localStorage.setItem(k, s[k]); }, SEED); await p.reload();
  const snap = () => p.evaluate(() => JSON.stringify(Object.keys(localStorage).filter(() => true).sort().map(k => [k, localStorage.getItem(k)])));
  const before = await snap();
  ok(JSON.stringify(await p.$$eval('.chip', c => c.map(x => x.textContent))) === '["All","Physics","Math","Computer Science"]', 'only subjects that have a course');
  await p.click('.chip:text("Math")'); ok(await p.$$eval('.card', c => c.length) === 1, 'Math filter');
  await p.click('.chip:text("All")'); await p.fill('#q', 'partial'); ok(await p.$$eval('.card h3', c => c.map(x => x.textContent).join()) === 'Multivariable Calculus Lab', 'search by topic');
  await p.fill('#q', 'zzzz'); ok(await p.isVisible('#empty'), 'empty state');
  await p.fill('#q', '');
  await p.keyboard.press('Tab'); await p.keyboard.press('Tab');
  ok(await p.evaluate(() => !document.querySelector('#theme,canvas') && getComputedStyle(document.documentElement).colorScheme === 'light' && !localStorage.getItem('plabs-theme')), 'light only: no theme switch, no animated background');
  const after = await snap(); if (after !== before) console.log('  before', before, '\n  after ', after);
  ok(after === before, 'course keys never written');
  ok(await p.evaluate(() => [...document.querySelectorAll('a.card')].every(a => a.href.startsWith('https://jiacode2030.github.io/'))), 'cards are real links');
  ok(await p.evaluate(() => document.querySelectorAll('.card.soon a').length === 0), 'coming-soon cards are not links');
  ok(await p.evaluate(() => !document.querySelector('#report,#report2') && !/goatcounter/.test(document.documentElement.outerHTML)), 'no report link and no analytics');
  await p.evaluate(() => localStorage.clear()); await p.reload();
  ok(await p.$$eval('.prog', r => r.length) === 0, 'no progress data: ring hidden');
  await p.evaluate(() => localStorage.setItem('phy-done', '{"a":1,"b":0,"c":1}')); await p.reload();
  ok((await p.textContent('a.card[data-id="phy103"] .prog')).trim() === '2 of 32 modules done', 'falsy entries not counted');
  await p.evaluate(() => localStorage.setItem('phy-done', '"broken"')); await p.reload();
  ok(await p.$$eval('.prog', r => r.length) === 0, 'bad data: ring hidden');

  /* legal pages: load cleanly, link back, no overflow, footer links on the landing page */
  for (const f of ['privacy.html', 'terms.html']) for (const w of [360, 1280]) {
    const q = await b.newPage({ viewport: { width: w, height: 800 }, colorScheme: 'dark' }); const e2 = [];
    q.on('pageerror', e => e2.push(e.message));
    await q.goto(URL + f);
    ok(!(await q.evaluate(() => document.documentElement.scrollWidth > innerWidth)), f, w, 'no horizontal scroll');
    ok(await q.evaluate(() => /Last updated/.test(document.body.innerText) && !!document.querySelector('.brand svg') && !!document.querySelector('a[href="./"]')), f, w, 'logo, last updated, link home');
    ok(!e2.length, f, w, 'no page errors', e2.join(' | '));
    ok(await q.evaluate(() => getComputedStyle(document.body).backgroundColor === 'rgb(244, 246, 248)'), f, w, 'light only, even on a dark device');
    await q.close();
  }
  await p.goto(URL);
  ok(JSON.stringify(await p.$$eval('footer .flinks a', a => a.map(x => x.getAttribute('href').replace(/^http.*/, 'github')))) === '["privacy.html","terms.html"]', 'footer links: privacy, terms');
  ok(await p.evaluate(() => /Built by Jiarui Li · Princeton Class of 2030 · a student project/.test(document.querySelector('footer').innerText) && !/Created by|LinkedIn/i.test(document.querySelector('footer').innerText) && !document.querySelector('a[href*="linkedin"]') && /© 2026 Jiarui Li/.test(document.querySelector('footer').innerText) && /Last updated/.test(document.querySelector('footer').innerText)), 'footer: plain credit, no LinkedIn; copyright, last updated');
  await b.close(); server.close();
  console.log(fails ? `\n${fails} failed` : '\nall checks passed'); process.exit(fails ? 1 : 0);
})();

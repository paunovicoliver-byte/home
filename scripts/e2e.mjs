/**
 * Browser QA over the built site (run after `npm run build`).
 * Serves dist/ locally (POST = simulated form backend) and checks, per language:
 *  - no horizontal scrolling at 320–430px and on desktop
 *  - customer journey Home → Windows → Project → Start a project → submit
 *  - validation messages are in the page language (never English on DE/SR)
 *  - success message, file upload, loading state
 *  - dataLayer events carry language/locale and never contain PII
 *  - language switch fires language_change and updates <html lang>
 *  - Core Web Vitals proxies: LCP image is eager/high priority, CLS measured
 *
 *   PW_CHROMIUM=/path/to/chrome node scripts/e2e.mjs
 */
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SHOTS = process.env.SHOTS_DIR || '';
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };
const submissions = [];

const server = createServer(async (req, res) => {
  if (req.method === 'POST') {
    const chunks = [];
    for await (const c of req) chunks.push(c);
    submissions.push({ url: req.url, size: Buffer.concat(chunks).length, type: req.headers['content-type'] });
    res.writeHead(200, { 'content-type': 'application/json' }).end('{"ok":true}');
    return;
  }
  const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = join(DIST, url);
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' }).end(await readFile(file));
  } catch {
    const lang = url.split('/')[1];
    const nf = ['en', 'de', 'sr'].includes(lang) ? join(DIST, lang, '404/index.html') : join(DIST, '404.html');
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' }).end(await readFile(nf));
  }
});
await new Promise((r) => server.listen(4391, r));
const BASE = 'http://localhost:4391';

const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const failures = [];
const ok = (cond, msg) => { if (!cond) failures.push(msg); else console.log('  ✓', msg); };

const PII = /@|\+?\d[\d\s]{7,}|Muster|Petrović|Test Person|hello world idea/i;

const journeys = {
  en: { windows: '/en/windows/', project: '/en/projects/historic-library-windows/', start: '/en/start-a-project/', required: 'Please fill in this field.', submit: 'Send my idea', success: 'Every project starts with a conversation' },
  de: { windows: '/de/fenster/', project: '/de/projekte/fenster-historische-bibliothek/', start: '/de/projekt-starten/', required: 'Bitte füllen Sie dieses Feld aus.', submit: 'Anfrage abschicken', success: 'Jedes Projekt beginnt mit einem Gespräch' },
  sr: { windows: '/sr/prozori/', project: '/sr/projekti/prozori-istorijske-biblioteke/', start: '/sr/pokrenite-projekat/', required: 'Popunite ovo polje.', submit: 'Pošaljite upit', success: 'Svaki projekat počinje razgovorom' },
};
const htmlLang = { en: 'en', de: 'de-CH', sr: 'sr-Latn-RS' };

async function noHorizontalScroll(page, label) {
  const w = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  ok(w[0] <= w[1], `${label}: no horizontal scroll (${w[0]} ≤ ${w[1]})`);
}

// 1) Layout at mobile widths and desktop, in all languages.
for (const width of [320, 360, 375, 390, 414, 430, 1440]) {
  const ctx = await browser.newContext({ viewport: { width, height: 860 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  for (const lang of ['en', 'de', 'sr']) {
    const j = journeys[lang];
    for (const p of [`/${lang}/`, j.windows, j.project, j.start, `/${lang}/${lang === 'en' ? 'work/solid-oak-dining-table' : lang === 'de' ? 'arbeiten/esstisch-massive-eiche' : 'radovi/trpezarijski-sto-od-masivnog-hrasta'}/`]) {
      await page.goto(BASE + p, { waitUntil: 'load' });
      await noHorizontalScroll(page, `${width}px ${p}`);
      if (SHOTS && (width === 375 || width === 1440) && p === `/${lang}/`) {
        await mkdir(SHOTS, { recursive: true });
        await page.screenshot({ path: join(SHOTS, `${lang}-home-${width}.png`), fullPage: width === 375 ? false : false });
      }
    }
  }
  await ctx.close();
}

// 2) Journeys, validation, submission, analytics, language switch.
for (const lang of ['en', 'de', 'sr']) {
  console.log(`\n[${lang}] journey`);
  const j = journeys[lang];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, locale: lang === 'de' ? 'de-CH' : lang === 'sr' ? 'sr-RS' : 'en-GB' });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on('pageerror', (e) => consoleErrors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

  await page.goto(`${BASE}/${lang}/`);
  ok((await page.getAttribute('html', 'lang')) === htmlLang[lang], `html lang = ${htmlLang[lang]}`);
  const hero = page.locator('.hero img').first();
  ok((await hero.getAttribute('loading')) === 'eager' && (await hero.getAttribute('fetchpriority')) === 'high', 'hero image eager + fetchpriority=high');
  // Consent banner is localized and dismissible.
  ok(await page.locator('[data-consent-banner]').isVisible(), 'consent banner visible on first visit');
  await page.locator('[data-consent-banner] [data-consent-action="reject"]').click();
  ok(!(await page.locator('[data-consent-banner]').isVisible()), 'consent banner closes after choice');

  // Mobile menu → Windows
  await page.locator('.site-header [data-menu-open]').click();
  ok(await page.locator('#site-menu').isVisible(), 'mobile menu opens');
  await page.locator(`#site-menu a[href="${j.windows}"]`).first().click();
  await page.waitForURL(BASE + j.windows);
  ok(true, `navigated to ${j.windows}`);
  await page.goto(BASE + j.project);
  ok(await page.locator('[data-before-after]').count() > 0, 'project has before/after');
  await page.locator('[data-before-after] input[type=range]').fill('20');
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    const orig = window.dataLayer.push.bind(window.dataLayer);
    window.dataLayer.push = (e) => { if (e?.event === 'start_project') sessionStorage.setItem('sp', JSON.stringify(e)); return orig(e); };
  });
  await page.locator('.cta-band a.btn').click();
  await page.waitForURL((u) => u.pathname === j.start);
  const sp = JSON.parse((await page.evaluate(() => sessionStorage.getItem('sp'))) || '{}');
  ok(sp.event === 'start_project' && sp.location === 'project_closing' && sp.language === lang, 'start_project click tracked (not counted as lead)');

  // Empty submit → localized errors
  await page.locator('form[data-enquiry] [data-submit]').click();
  const err = await page.locator('#form-quote-name-error').textContent();
  ok(err?.trim() === j.required, `required message localized: "${err?.trim()}"`);
  const allErrors = (await page.locator('form[data-enquiry] .error:not([hidden])').allTextContents()).join(' ');
  if (lang !== 'en') ok(!/Please|field|valid email|choose/i.test(allErrors), 'no English validation text');
  ok((await page.evaluate(() => document.activeElement?.tagName)) === 'INPUT', 'focus moved to first invalid field');

  // Invalid email
  await page.fill('#form-quote-email', 'not-an-email');
  await page.locator('#form-quote-email').blur();
  ok(!(await page.locator('#form-quote-email-error').isHidden()), 'invalid email flagged');

  // Fill and submit
  await page.locator('input[name="project_type"][value="windows"]').check({ force: true });
  await page.fill('#form-quote-name', 'Test Person Petrović');
  await page.fill('#form-quote-email', 'test.person@example.com');
  await page.fill('#form-quote-phone', '+41 79 123 45 67');
  await page.selectOption('#form-quote-country', 'CH');
  await page.fill('#form-quote-city', '8001 Zürich');
  await page.fill('#form-quote-message', 'hello world idea — three windows for an old house, about 120 × 150 cm.');
  await page.setInputFiles('#form-quote-files', { name: 'facade-photo.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(2048, 1) });
  await page.locator('#form-quote-privacy').check();
  const before = submissions.length;
  await page.locator('form[data-enquiry] [data-submit]').click();
  await page.locator('[data-form-success]').waitFor({ state: 'visible', timeout: 5000 });
  ok(submissions.length === before + 1 && /multipart\/form-data/.test(submissions.at(-1).type), 'submission posted as multipart');
  ok((await page.locator('[data-form-success]').textContent()).includes(j.success), 'success message localized');

  const dl = await page.evaluate(() => window.dataLayer.filter((e) => e && typeof e === 'object' && !Array.isArray(e) && 'event' in e && !Object.prototype.hasOwnProperty.call(e, 0)));
  const names = dl.map((e) => e.event);
  for (const ev of ['page_view', 'quote_form_start', 'quote_form_error', 'project_file_added', 'quote_form_submit']) ok(names.includes(ev), `dataLayer has ${ev}`);
  const submit = dl.find((e) => e.event === 'quote_form_submit');
  ok(submit?.language === lang && submit?.locale === { en: 'en', de: 'de-CH', sr: 'sr-RS' }[lang], 'events carry language + locale');
  const serialized = JSON.stringify(dl.map(({ eventCallback, ...e }) => e));
  ok(!PII.test(serialized.replace(/"page_path":"[^"]*"/g, '')), 'no PII in dataLayer');

  // Language switch
  const target = lang === 'de' ? 'sr' : 'de';
  await page.goto(BASE + j.windows);
  await page.locator(`#site-menu a[data-lang-switch="${target}"]`).evaluate((a) => a.click());
  await page.waitForURL((u) => u.pathname.startsWith(`/${target}/`));
  ok((await page.getAttribute('html', 'lang')) === htmlLang[target], `language switch → html lang ${htmlLang[target]}`);
  ok(new URL(page.url()).pathname === journeys[target].windows, `switch keeps equivalent page (${journeys[target].windows})`);
  const stored = await page.evaluate(() => localStorage.getItem('drveno_lang'));
  ok(stored?.includes(`"lang":"${target}"`), 'language preference persisted');
  // Root no longer follows the browser language once a choice is stored.
  await page.goto(`${BASE}/`);
  await page.waitForURL((u) => u.pathname !== '/');
  ok(new URL(page.url()).pathname === `/${target}/`, 'root respects stored manual language');

  ok(consoleErrors.length === 0, `no console errors${consoleErrors.length ? ': ' + consoleErrors.join(' | ') : ''}`);
  await ctx.close();
}

// 3) language_change event payload (captured before navigation).
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/de/fenster/`);
  await page.evaluate(() => {
    const orig = window.dataLayer.push.bind(window.dataLayer);
    window.dataLayer.push = (e) => { if (e?.event === 'language_change') sessionStorage.setItem('lc', JSON.stringify(e)); return orig(e); };
  });
  await page.locator('.site-header a[data-lang-switch="sr"]').click();
  await page.waitForURL(/\/sr\/prozori\//);
  const lc = JSON.parse(await page.evaluate(() => sessionStorage.getItem('lc')) || '{}');
  ok(lc.previous_language === 'de' && lc.selected_language === 'sr' && lc.page_type === 'windows' && lc.page_path === '/de/fenster/', 'language_change payload correct');

  // CLS on home (desktop) with fonts and images.
  await page.goto(`${BASE}/en/`, { waitUntil: 'load' });
  const cls = await page.evaluate(() => new Promise((resolve) => {
    let v = 0;
    new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) v += e.value; }).observe({ type: 'layout-shift', buffered: true });
    setTimeout(() => resolve(v), 1500);
  }));
  ok(cls < 0.1, `CLS on home ${cls.toFixed(3)} < 0.1`);
  const resp = await page.goto(`${BASE}/de/gibt-es-nicht/`);
  ok(resp.status() === 404 && (await page.getAttribute('html', 'lang')) === 'de-CH', 'localized 404 with status 404');
  await ctx.close();
}

await browser.close();
server.close();
console.log(failures.length ? `\n✗ ${failures.length} failure(s):\n- ${failures.join('\n- ')}` : '\n✓ All browser checks passed');
process.exit(failures.length ? 1 : 0);

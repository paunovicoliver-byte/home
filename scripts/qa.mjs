/**
 * Static QA over the built site (run after `npm run build`):
 *  - <html lang> matches the language folder
 *  - exactly one <h1>, unique titles and meta descriptions per language
 *  - canonical points to itself; hreflang set is complete and reciprocal
 *  - JSON-LD parses and every inLanguage matches the page language
 *  - every <img> has an alt attribute and intrinsic width/height
 *  - no English interface strings on German or Serbian pages
 *  - Serbian pages contain Serbian diacritics (encoding sanity)
 *  - sitemap lists every indexable page
 */
import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = new URL('../dist/', import.meta.url).pathname;
const expectLang = { en: 'en', de: 'de-CH', sr: 'sr-Latn-RS' };
const expectInLanguage = { en: 'en', de: 'de-CH', sr: 'sr-RS' };
// English UI strings that must never appear on DE/SR pages (outside JSON payloads for other languages).
const englishLeaks = ['Start a project', 'Start your project', 'Send my idea', 'Please fill in', 'Cookie settings', 'Accept all', 'Essential only', 'Request a quote', 'Customize this piece', 'Skip to content', 'Our Story', 'Read our story', 'All projects', 'Privacy policy', 'Thank you.'];

const errors = [];
const warn = (f, m) => errors.push(`${f}: ${m}`);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (e.name === 'index.html') out.push(p);
  }
  return out;
}

const attr = (tag, name) => tag.match(new RegExp(`${name}="([^"]*)"`))?.[1];
const files = (await walk(DIST)).filter((f) => /\/(en|de|sr)\//.test(f.slice(DIST.length - 1)));
const pages = new Map();

for (const f of files) {
  const rel = '/' + f.slice(DIST.length).replace(/index\.html$/, '');
  const lang = rel.split('/')[1];
  const html = await readFile(f, 'utf8');
  const noindex = /<meta name="robots" content="noindex/.test(html);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
  const htmlLang = html.match(/<html lang="([^"]+)"/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const alts = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], new URL(m[2]).pathname]);
  pages.set(rel, { lang, noindex, title, desc, alts });

  if (htmlLang !== expectLang[lang]) warn(rel, `html lang=${htmlLang}`);
  const h1s = (html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) warn(rel, `${h1s} <h1> elements`);
  if (!title) warn(rel, 'missing title');
  if (!desc) warn(rel, 'missing description');
  if (!noindex) {
    if (!canonical || new URL(canonical).pathname !== rel) warn(rel, `canonical ${canonical}`);
    if (!alts.some(([h]) => h === 'x-default')) warn(rel, 'missing x-default');
    if (!alts.some(([h, p]) => p === rel)) warn(rel, 'hreflang set does not include itself');
  }

  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const json = JSON.parse(m[1]);
      const langs = [...JSON.stringify(json).matchAll(/"inLanguage":"([^"]+)"/g)].map((x) => x[1]);
      if (!langs.length) warn(rel, 'JSON-LD without inLanguage');
      for (const l of langs) if (l !== expectInLanguage[lang]) warn(rel, `JSON-LD inLanguage ${l}`);
    } catch (e) {
      warn(rel, `invalid JSON-LD: ${e.message}`);
    }
  }

  for (const img of html.match(/<img\b[^>]*>/g) || []) {
    if (!/\salt(="|[\s>/])/.test(img)) warn(rel, `img without alt: ${img.slice(0, 80)}`);
    if (!attr(img, 'width') || !attr(img, 'height')) warn(rel, `img without dimensions: ${img.slice(0, 80)}`);
  }

  if (lang !== 'en') {
    // Remove JSON payloads (e.g. language-suggestion strings for other languages) and elements explicitly marked lang="en".
    const visible = html
      .replace(/<script[\s\S]*?<\/script>/g, '')
      .replace(/<[^>]+lang="en"[^>]*>[^<]*<\/[^>]+>/g, '');
    for (const s of englishLeaks) if (visible.includes(s)) warn(rel, `English string on ${lang} page: "${s}"`);
  }
  if (lang === 'sr' && !/[čćžšđČĆŽŠĐ]/.test(html)) warn(rel, 'no Serbian diacritics found');
  if (/Ã|â€/.test(html)) warn(rel, 'mojibake detected');
}

// Uniqueness of titles/descriptions within each language (indexable pages).
for (const lang of ['en', 'de', 'sr']) {
  const idx = [...pages.entries()].filter(([, p]) => p.lang === lang && !p.noindex);
  for (const key of ['title', 'desc']) {
    const seen = new Map();
    for (const [rel, p] of idx) {
      if (seen.has(p[key])) warn(rel, `duplicate ${key} with ${seen.get(p[key])}`);
      seen.set(p[key], rel);
    }
  }
}

// Reciprocal hreflang.
for (const [rel, p] of pages) {
  if (p.noindex) continue;
  for (const [h, target] of p.alts) {
    if (h === 'x-default') continue;
    const other = pages.get(target);
    if (!other) { warn(rel, `hreflang ${h} → missing page ${target}`); continue; }
    if (!other.alts.some(([, t]) => t === rel)) warn(rel, `hreflang to ${target} is not reciprocal`);
  }
}

// Sitemap coverage.
const sitemap = await readFile(join(DIST, 'sitemap.xml'), 'utf8');
const locs = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname));
for (const [rel, p] of pages) {
  if (!p.noindex && !locs.has(rel)) warn(rel, 'missing from sitemap');
  if (p.noindex && locs.has(rel)) warn(rel, 'noindex page listed in sitemap');
}

const indexable = [...pages.values()].filter((p) => !p.noindex).length;
console.log(`Checked ${pages.size} pages (${indexable} indexable, ${locs.size} in sitemap).`);
if (errors.length) {
  console.error(errors.join('\n'));
  console.error(`\n✗ ${errors.length} problem(s)`);
  process.exit(1);
}
console.log('✓ All static QA checks passed');

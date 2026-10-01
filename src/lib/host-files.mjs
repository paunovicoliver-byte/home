/**
 * Writes host configuration into the build output (Netlify-compatible
 * `_redirects` and `_headers`; Cloudflare Pages reads the same format).
 *  - localized 404s with a real 404 status
 *  - 301s for slugs typed in the "wrong" language, e.g. /de/windows/ → /de/fenster/
 *  - long-term caching for fingerprinted assets, security headers
 */
import { writeFile } from 'node:fs/promises';

const routes = {
  work: { en: 'work', de: 'arbeiten', sr: 'radovi' },
  windows: { en: 'windows', de: 'fenster', sr: 'prozori' },
  heritage: { en: 'heritage-restoration', de: 'denkmalpflege-restaurierung', sr: 'nasledje-restauracija' },
  story: { en: 'our-story', de: 'unsere-geschichte', sr: 'nasa-prica' },
  process: { en: 'how-we-work', de: 'so-arbeiten-wir', sr: 'kako-radimo' },
  switzerland: { en: 'switzerland', de: 'schweiz', sr: 'svajcarska' },
  projects: { en: 'projects', de: 'projekte', sr: 'projekti' },
  journal: { en: 'journal', de: 'journal', sr: 'iz-radionice' },
  start: { en: 'start-a-project', de: 'projekt-starten', sr: 'pokrenite-projekat' },
  contact: { en: 'contact', de: 'kontakt', sr: 'kontakt' },
  privacy: { en: 'privacy', de: 'datenschutz', sr: 'privatnost' },
  imprint: { en: 'imprint', de: 'impressum', sr: 'impresum' },
};
const locales = ['en', 'de', 'sr'];

export async function writeHostFiles(dirUrl) {
  const lines = ['# Generated at build time — see src/lib/host-files.mjs', ''];
  // Cross-language slug fixes (static pages and their sub-paths).
  for (const lang of locales) {
    for (const r of Object.values(routes)) {
      const target = r[lang];
      for (const other of locales) {
        const wrong = r[other];
        if (other === lang || wrong === target) continue;
        lines.push(`/${lang}/${wrong}/  /${lang}/${target}/  301`);
      }
    }
  }
  // Short, memorable entry points.
  lines.push('/fenster  /de/fenster/  301', '/prozori  /sr/prozori/  301', '/windows  /en/windows/  301');
  lines.push('/start  /en/start-a-project/  301', '/projekt-starten  /de/projekt-starten/  301', '/pokrenite-projekat  /sr/pokrenite-projekat/  301');
  lines.push('/schweiz  /de/schweiz/  301', '/switzerland  /en/switzerland/  301');
  // Language-specific 404 pages, with the correct status.
  lines.push('', ...locales.map((l) => `/${l}/*  /${l}/404/  404`));
  await writeFile(new URL('_redirects', dirUrl), lines.join('\n') + '\n');

  const headers = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  X-Frame-Options: SAMEORIGIN

/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/favicon.svg
  Cache-Control: public, max-age=604800

/*.html
  Cache-Control: public, max-age=0, must-revalidate
`;
  await writeFile(new URL('_headers', dirUrl), headers);
}

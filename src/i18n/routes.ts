import type { Locale } from './config';

/**
 * Human-readable, translated slugs for every static page.
 * Paths are relative to the locale prefix and never start with "/".
 */
export const routes = {
  home: { en: '', de: '', sr: '' },
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
  thanks: { en: 'thank-you', de: 'danke', sr: 'hvala' },
  notFound: { en: '404', de: '404', sr: '404' },
} as const satisfies Record<string, Record<Locale, string>>;

export type RouteKey = keyof typeof routes;

/** Collections whose detail pages live below a static page. */
export const collectionBase = {
  products: 'work',
  projects: 'projects',
  journal: 'journal',
} as const satisfies Record<string, RouteKey>;

export const path = (locale: Locale, key: RouteKey, sub?: string) => {
  const base = routes[key][locale];
  const parts = [locale, base, sub].filter(Boolean);
  return `/${parts.join('/')}/`;
};

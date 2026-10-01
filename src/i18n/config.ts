/**
 * Locale registry. Every language is a first-class version of the site.
 *
 * To add Serbian Cyrillic later: add e.g. `'sr-cyrl'` here with
 * htmlLang 'sr-Cyrl-RS' / hreflang 'sr-Cyrl-RS', add slugs in routes.ts,
 * a UI dictionary, and `sr-cyrl` blocks in content. The fonts already
 * ship Cyrillic subsets (loaded on demand through unicode-range).
 */
export const locales = ['en', 'de', 'sr'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** Order shown in the language selector. */
export const selectorOrder: Locale[] = ['de', 'en', 'sr'];

export const localeMeta: Record<
  Locale,
  {
    /** <html lang> */
    htmlLang: string;
    /** hreflang attribute value */
    hreflang: string;
    /** analytics `locale` + schema inLanguage */
    locale: string;
    ogLocale: string;
    /** Intl locale for dates, country names */
    intl: string;
    label: string;
    short: string;
  }
> = {
  en: { htmlLang: 'en', hreflang: 'en', locale: 'en', ogLocale: 'en_GB', intl: 'en-GB', label: 'English', short: 'EN' },
  de: { htmlLang: 'de-CH', hreflang: 'de-CH', locale: 'de-CH', ogLocale: 'de_CH', intl: 'de-CH', label: 'Deutsch', short: 'DE' },
  sr: { htmlLang: 'sr-Latn-RS', hreflang: 'sr-RS', locale: 'sr-RS', ogLocale: 'sr_RS', intl: 'sr-Latn-RS', label: 'Srpski', short: 'SR' },
};

export const isLocale = (v: unknown): v is Locale => typeof v === 'string' && (locales as readonly string[]).includes(v);

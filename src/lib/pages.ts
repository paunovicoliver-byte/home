import { getCollection, type CollectionEntry } from 'astro:content';
import { locales, type Locale } from '../i18n/config';
import { routes, path, collectionBase, type RouteKey } from '../i18n/routes';

export type PageType =
  | 'home' | 'collection' | 'product' | 'windows' | 'heritage' | 'story' | 'process' | 'switzerland'
  | 'projects' | 'project' | 'journal' | 'article' | 'start' | 'contact' | 'privacy' | 'imprint'
  | 'thanks' | 'not_found';

export type Alternates = Partial<Record<Locale, string>>;

export type PageEntry =
  | { kind: 'static'; key: RouteKey; locale: Locale; path: string; alternates: Alternates; pageType: PageType; noindex: boolean }
  | { kind: 'product'; entry: CollectionEntry<'products'>; locale: Locale; path: string; alternates: Alternates; pageType: 'product'; noindex: false }
  | { kind: 'project'; entry: CollectionEntry<'projects'>; locale: Locale; path: string; alternates: Alternates; pageType: 'project'; noindex: false }
  | { kind: 'article'; entry: CollectionEntry<'journal'>; locale: Locale; path: string; alternates: Alternates; pageType: 'article'; noindex: false };

const pageTypeByKey: Record<RouteKey, PageType> = {
  home: 'home', work: 'collection', windows: 'windows', heritage: 'heritage', story: 'story', process: 'process',
  switzerland: 'switzerland', projects: 'projects', journal: 'journal', start: 'start', contact: 'contact',
  privacy: 'privacy', imprint: 'imprint', thanks: 'thanks', notFound: 'not_found',
};
const noindexKeys: RouteKey[] = ['thanks', 'notFound'];

type Localized = { i18n: Partial<Record<Locale, { slug: string } | undefined>> };

/** Locales an entry is published in (has a language block). */
export const entryLocales = (data: Localized) => locales.filter((l) => !!data.i18n[l]);

const entryPaths = (base: RouteKey, data: Localized): Alternates =>
  Object.fromEntries(entryLocales(data).map((l) => [l, path(l, base, data.i18n[l]!.slug)]));

export const staticAlternates = (key: RouteKey): Alternates =>
  Object.fromEntries(locales.map((l) => [l, path(l, key)]));

export async function getProducts() {
  return (await getCollection('products')).sort((a, b) => a.data.order - b.data.order);
}
export async function getProjects() {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}
export async function getArticles() {
  return (await getCollection('journal')).sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

export const productPath = (locale: Locale, e: CollectionEntry<'products'>) => path(locale, collectionBase.products, e.data.i18n[locale]!.slug);
export const projectPath = (locale: Locale, e: CollectionEntry<'projects'>) => path(locale, collectionBase.projects, e.data.i18n[locale]!.slug);
export const articlePath = (locale: Locale, e: CollectionEntry<'journal'>) => path(locale, collectionBase.journal, e.data.i18n[locale]!.slug);

export async function getAllPages(): Promise<PageEntry[]> {
  const pages: PageEntry[] = [];

  for (const key of Object.keys(routes) as RouteKey[]) {
    const alternates = staticAlternates(key);
    for (const locale of locales) {
      pages.push({
        kind: 'static', key, locale, path: path(locale, key), alternates,
        pageType: pageTypeByKey[key], noindex: noindexKeys.includes(key),
      });
    }
  }

  for (const entry of await getProducts()) {
    const alternates = entryPaths(collectionBase.products, entry.data);
    for (const locale of entryLocales(entry.data))
      pages.push({ kind: 'product', entry, locale, path: alternates[locale]!, alternates, pageType: 'product', noindex: false });
  }
  for (const entry of await getProjects()) {
    const alternates = entryPaths(collectionBase.projects, entry.data);
    for (const locale of entryLocales(entry.data))
      pages.push({ kind: 'project', entry, locale, path: alternates[locale]!, alternates, pageType: 'project', noindex: false });
  }
  for (const entry of await getArticles()) {
    const alternates = entryPaths(collectionBase.journal, entry.data);
    for (const locale of entryLocales(entry.data))
      pages.push({ kind: 'article', entry, locale, path: alternates[locale]!, alternates, pageType: 'article', noindex: false });
  }

  // Guard against slug collisions within a locale.
  const seen = new Set<string>();
  for (const p of pages) {
    if (seen.has(p.path)) throw new Error(`Duplicate URL generated: ${p.path}`);
    seen.add(p.path);
  }
  return pages;
}

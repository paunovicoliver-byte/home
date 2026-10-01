import type { Locale } from '../i18n/config';
import { t } from '../i18n/ui';
import { path } from '../i18n/routes';
import { breadcrumbs } from './schema';

export const originOf = (site: URL | undefined) => (site ?? new URL('https://www.drveno.com')).origin;

/** Builds breadcrumb items for the UI and the matching BreadcrumbList node. */
export function trail(origin: string, locale: Locale, items: { name: string; href: string }[]) {
  const all = [{ name: t(locale).nav.home, href: path(locale, 'home') }, ...items];
  const url = new URL(all[all.length - 1].href, origin).href;
  return {
    items: all,
    url,
    node: breadcrumbs(url, all.map((i) => ({ name: i.name, url: new URL(i.href, origin).href }))),
    id: `${url}#breadcrumb`,
  };
}

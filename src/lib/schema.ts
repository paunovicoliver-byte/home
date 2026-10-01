/**
 * JSON-LD builders. All text passed in must already be in the page language;
 * every node that supports it carries `inLanguage`.
 * Nothing here invents prices, ratings, reviews, stock or addresses.
 */
import { site } from '../config/site';
import { localeMeta, type Locale } from '../i18n/config';
import { ui } from '../i18n/ui';

type Node = Record<string, unknown>;

export const abs = (origin: string, p: string) => new URL(p, origin).href;

export function organization(origin: string, locale: Locale): Node {
  const t = ui[locale];
  const node: Node = {
    '@type': 'Organization',
    '@id': `${origin}/#organization`,
    name: site.name,
    url: `${origin}/${locale}/`,
    logo: abs(origin, '/favicon.svg'),
    slogan: t.brand.tagline,
    description: t.footer.statement,
    address: { '@type': 'PostalAddress', addressCountry: site.foundingCountry },
    areaServed: [
      { '@type': 'Country', name: 'RS' },
      { '@type': 'Country', name: 'CH' },
      { '@type': 'Place', name: locale === 'de' ? 'Europa' : locale === 'sr' ? 'Evropa' : 'Europe' },
    ],
  };
  if (site.contact.verified) {
    node.email = site.contact.email;
    node.contactPoint = [
      { '@type': 'ContactPoint', telephone: site.contact.phone, contactType: 'customer service', areaServed: 'RS', availableLanguage: ['sr', 'de', 'en'] },
      { '@type': 'ContactPoint', telephone: site.contact.switzerland.phone, contactType: 'customer service', areaServed: 'CH', availableLanguage: ['de', 'en', 'sr'] },
    ];
  }
  const sameAs = Object.values(site.social).filter(Boolean);
  if (sameAs.length) node.sameAs = sameAs;
  return node;
}

export function website(origin: string, locale: Locale): Node {
  return {
    '@type': 'WebSite',
    '@id': `${origin}/${locale}/#website`,
    url: `${origin}/${locale}/`,
    name: site.name,
    description: ui[locale].brand.tagline,
    inLanguage: localeMeta[locale].locale,
    publisher: { '@id': `${origin}/#organization` },
  };
}

export function webPage(
  origin: string,
  locale: Locale,
  o: { url: string; name: string; description: string; type?: string; image?: string; mainEntity?: Node; breadcrumbId?: string },
): Node {
  const node: Node = {
    '@type': o.type ?? 'WebPage',
    '@id': `${o.url}#webpage`,
    url: o.url,
    name: o.name,
    description: o.description,
    inLanguage: localeMeta[locale].locale,
    isPartOf: { '@id': `${origin}/${locale}/#website` },
    publisher: { '@id': `${origin}/#organization` },
  };
  if (o.image) node.primaryImageOfPage = { '@type': 'ImageObject', url: o.image };
  if (o.breadcrumbId) node.breadcrumb = { '@id': o.breadcrumbId };
  if (o.mainEntity) node.mainEntity = o.mainEntity;
  return node;
}

export function breadcrumbs(url: string, items: { name: string; url: string }[]): Node {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${url}#breadcrumb`,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: it.url })),
  };
}

export function service(origin: string, locale: Locale, o: { name: string; description: string; serviceType: string; url: string }): Node {
  return {
    '@type': 'Service',
    '@id': `${o.url}#service`,
    name: o.name,
    description: o.description,
    serviceType: o.serviceType,
    url: o.url,
    provider: { '@id': `${origin}/#organization` },
    areaServed: [{ '@type': 'Country', name: 'CH' }, { '@type': 'Country', name: 'RS' }, { '@type': 'Place', name: 'Europe' }],
    availableLanguage: [localeMeta[locale].locale],
  };
}

export function product(origin: string, o: { url: string; name: string; description: string; images: string[]; category: string; material: string }): Node {
  // No `offers`: every piece is priced individually on request, so no price is published.
  return {
    '@type': 'Product',
    '@id': `${o.url}#product`,
    name: o.name,
    description: o.description,
    image: o.images,
    category: o.category,
    material: o.material,
    brand: { '@type': 'Brand', name: site.name },
    manufacturer: { '@id': `${origin}/#organization` },
    countryOfOrigin: { '@type': 'Country', name: 'RS' },
    url: o.url,
  };
}

export function article(origin: string, locale: Locale, o: { url: string; headline: string; description: string; image: string; datePublished: Date; dateModified?: Date }): Node {
  return {
    '@type': 'BlogPosting',
    '@id': `${o.url}#article`,
    headline: o.headline,
    description: o.description,
    image: [o.image],
    datePublished: o.datePublished.toISOString().slice(0, 10),
    dateModified: (o.dateModified ?? o.datePublished).toISOString().slice(0, 10),
    inLanguage: localeMeta[locale].locale,
    author: { '@id': `${origin}/#organization` },
    publisher: { '@id': `${origin}/#organization` },
    mainEntityOfPage: { '@id': `${o.url}#webpage` },
  };
}

export function creativeWork(origin: string, locale: Locale, o: { url: string; name: string; description: string; image: string; dateCreated?: number; locationName?: string }): Node {
  const node: Node = {
    '@type': 'CreativeWork',
    '@id': `${o.url}#project`,
    name: o.name,
    description: o.description,
    image: o.image,
    inLanguage: localeMeta[locale].locale,
    creator: { '@id': `${origin}/#organization` },
  };
  if (o.dateCreated) node.dateCreated = String(o.dateCreated);
  if (o.locationName) node.locationCreated = { '@type': 'Place', name: o.locationName };
  return node;
}

export const graph = (nodes: Node[]) => ({ '@context': 'https://schema.org', '@graph': nodes });

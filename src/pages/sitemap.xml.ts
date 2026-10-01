import type { APIRoute } from 'astro';
import { getAllPages } from '../lib/pages';
import { locales, localeMeta, defaultLocale } from '../i18n/config';

/** XML sitemap with every indexable language version and its hreflang alternates. */
export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://www.drveno.com')).origin;
  const pages = (await getAllPages()).filter((p) => !p.noindex);
  const abs = (p: string) => new URL(p, origin).href;
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const today = new Date().toISOString().slice(0, 10);

  const urls = pages.map((p) => {
    const alts = locales
      .filter((l) => p.alternates[l])
      .map((l) => `    <xhtml:link rel="alternate" hreflang="${localeMeta[l].hreflang}" href="${esc(abs(p.alternates[l]!))}"/>`);
    // x-default: the English version (the site's fallback language).
    const xd = p.alternates[defaultLocale];
    if (xd) alts.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(abs(xd))}"/>`);
    const lastmod = p.kind === 'article' ? (p.entry.data.updated ?? p.entry.data.date).toISOString().slice(0, 10) : today;
    return `  <url>\n    <loc>${esc(abs(p.path))}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alts.join('\n')}\n  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};

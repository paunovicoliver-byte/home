import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => {
  const origin = (site ?? new URL('https://www.drveno.com')).origin;
  return new Response(`User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${origin}/sitemap.xml\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};

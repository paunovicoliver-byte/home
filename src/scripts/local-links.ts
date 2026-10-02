/**
 * Pages opened straight from disk (file://) cannot resolve "folder/" links to
 * "folder/index.html" the way a web server does. Patch those links once so the
 * site is fully browsable offline. Does nothing on a real web host.
 */
export const isLocal = location.protocol === 'file:';

export function localHref(href: string): string {
  if (!isLocal || /^(?:[a-z]+:|#|\/\/)/i.test(href)) return href;
  const m = href.match(/^([^?#]*)([?#].*)?$/)!;
  const path = m[1];
  if (path === '' || !path.endsWith('/')) return href;
  return `${path}index.html${m[2] ?? ''}`;
}

export function fixLocalLinks(root: ParentNode = document) {
  if (!isLocal) return;
  root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((a) => {
    const h = a.getAttribute('href')!;
    const fixed = localHref(h);
    if (fixed !== h) a.setAttribute('href', fixed);
  });
}

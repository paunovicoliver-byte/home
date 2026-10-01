/**
 * dataLayer helper. GTM-compatible, consent-aware (GTM itself only loads per
 * consent, see head-inline.js), and with a hard PII guard: nothing that looks
 * like a name, email, phone number, message, address or filename ever leaves.
 */

type Params = Record<string, unknown>;
interface Ctx { language: string; locale: string; pageType: string; countryContext: string; path: string }

declare global {
  interface Window {
    dataLayer: unknown[];
    __DRVENO: Ctx & { gtmId: string; consentMode: string; consentVersion: number };
    __loadGtm?: () => void;
    gtag?: (...args: unknown[]) => void;
  }
}

const BLOCKED_KEYS = /^(name|full_?name|first_?name|last_?name|email|e_?mail|phone|tel|telephone|whatsapp|message|description|enquiry|inquiry|address|street|city|postcode|postal_?code|zip|file|files|file_?name|filename|file_?names|content|comment|note|notes)$/i;
const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE = /\+?\d[\d\s().\/-]{7,}\d/;

export const ctx = (): Ctx => window.__DRVENO;

function clean(value: unknown, depth = 0): unknown {
  if (depth > 3) return undefined;
  if (typeof value === 'string') {
    if (EMAIL.test(value) || PHONE.test(value)) return undefined;
    return value.slice(0, 100);
  }
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) return value;
  if (Array.isArray(value)) return value.map((v) => clean(v, depth + 1)).filter((v) => v !== undefined).slice(0, 25);
  if (typeof value === 'object' && value) return sanitize(value as Params, depth + 1);
  return undefined;
}

export function sanitize(params: Params, depth = 0): Params {
  const out: Params = {};
  for (const [k, v] of Object.entries(params)) {
    if (BLOCKED_KEYS.test(k)) continue;
    const c = clean(v, depth);
    if (c !== undefined) out[k] = c;
  }
  return out;
}

/** Push an event with language context. Returns a promise resolving once GTM handled it (or after a timeout). */
export function track(event: string, params: Params = {}, opts: { waitMs?: number } = {}): Promise<void> {
  const c = ctx();
  const payload = sanitize({
    language: c.language,
    locale: c.locale,
    page_type: c.pageType,
    ...params,
  });
  window.dataLayer = window.dataLayer || [];
  // Reset ecommerce object between ecommerce pushes (GA4 recommendation).
  if ('ecommerce' in payload) window.dataLayer.push({ ecommerce: null });
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    const entry: Params = { event, ...payload };
    if (opts.waitMs) {
      entry.eventCallback = finish;
      entry.eventTimeout = opts.waitMs;
      setTimeout(finish, opts.waitMs + 50);
    } else {
      queueMicrotask(finish);
    }
    window.dataLayer.push(entry);
  });
}

function dataParams(el: HTMLElement): Params {
  const p: Params = {};
  for (const [k, v] of Object.entries(el.dataset)) {
    if (k.startsWith('track') && k !== 'track' && k !== 'trackView' && v !== undefined) {
      const key = k.slice(5).replace(/^[A-Z]/, (m) => m.toLowerCase()).replace(/[A-Z]/g, (m) => '_' + m.toLowerCase());
      p[key] = /^\d+$/.test(v) ? Number(v) : v;
    }
  }
  return p;
}

function linkLocation(el: Element): string {
  const loc = el.closest('[data-track-location]') as HTMLElement | null;
  if (loc?.dataset.trackLocation) return loc.dataset.trackLocation;
  if (el.closest('.site-footer')) return 'footer';
  if (el.closest('.site-header, .menu')) return 'header';
  if (el.closest('.mobile-cta')) return 'mobile_bar';
  return 'content';
}

export function initAnalytics() {
  const c = ctx();
  track('page_view', {
    page_title: document.title,
    page_path: c.path,
    country_context: c.countryContext,
  });

  // Page-specific events rendered by the server (view_item, view_project, view_item_list…)
  const pe = document.getElementById('page-events');
  if (pe?.textContent) {
    try {
      for (const e of JSON.parse(pe.textContent) as { event: string; params?: Params }[]) track(e.event, e.params);
    } catch { /* ignore */ }
  }

  document.addEventListener('click', (ev) => {
    const target = ev.target as Element | null;
    if (!target) return;

    const tracked = target.closest<HTMLElement>('[data-track]');
    if (tracked?.dataset.track) {
      const params = dataParams(tracked);
      if (tracked.dataset.track === 'select_item') {
        const { item_id, item_name, item_category, index, item_list_id, ...rest } = params;
        track('select_item', { ...rest, item_list_id, items: [{ item_id, item_name, item_category, index, item_list_id }] });
      } else {
        track(tracked.dataset.track, params);
      }
    }

    // Contact clicks (secondary conversions). Only the method is recorded, never the number/address.
    const link = target.closest<HTMLAnchorElement>('a[href]');
    if (link) {
      const href = link.getAttribute('href') || '';
      const method = href.startsWith('tel:') ? 'phone' : href.startsWith('mailto:') ? 'email' : /wa\.me|whatsapp/.test(href) ? 'whatsapp' : '';
      if (method) track('contact_click', { contact_method: method, link_location: linkLocation(link) });
    }
  });

  // One-time view events, e.g. data-track-view="shipping_info_view"
  const viewEls = document.querySelectorAll<HTMLElement>('[data-track-view]');
  if (viewEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const el = e.target as HTMLElement;
        io.unobserve(el);
        track(el.dataset.trackView!, { ...dataParams(el), trigger: 'scroll' });
      }
    }, { threshold: 0.5 });
    viewEls.forEach((el) => io.observe(el));
  }
}

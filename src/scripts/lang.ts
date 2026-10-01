import { track, ctx } from './analytics';
import { locales } from '../i18n/config';

const PREF_KEY = 'drveno_lang';
const DISMISS_KEY = 'drveno_lang_suggest';

export function storeLanguage(lang: string) {
  try { localStorage.setItem(PREF_KEY, JSON.stringify({ lang, manual: true, ts: Date.now() })); } catch { /* ignore */ }
  // Functional cookie so an edge/server could honour the choice too. No tracking purpose.
  document.cookie = `${PREF_KEY}=${lang}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
}

function storedLanguage(): string | null {
  try { return JSON.parse(localStorage.getItem(PREF_KEY) || 'null')?.lang ?? null; } catch { return null; }
}

/** Map browser languages to a site locale. Croatian/Bosnian/Montenegrin readers are served Serbian Latin. */
export function browserLocale(): string | null {
  for (const raw of navigator.languages ?? [navigator.language]) {
    const l = raw.toLowerCase();
    if (l.startsWith('de') || l.startsWith('gsw')) return 'de';
    if (l.startsWith('sr') || l.startsWith('hr') || l.startsWith('bs') || l.startsWith('sh') || l.startsWith('cnr')) return 'sr';
    if (l.startsWith('en')) return 'en';
  }
  return null;
}

export function initLang() {
  const c = ctx();

  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[data-lang-switch]');
    if (!a) return;
    const selected = a.dataset.langSwitch!;
    if (!(locales as readonly string[]).includes(selected)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) { storeLanguage(selected); return; }
    storeLanguage(selected);
    if (selected === c.language) return;
    e.preventDefault();
    const href = a.href;
    track('language_change', {
      previous_language: c.language,
      selected_language: selected,
      page_type: c.pageType,
      page_path: c.path,
    }, { waitMs: 250 }).then(() => { location.href = href; });
  });

  // Suggest (never force) another language on first visits.
  const box = document.querySelector<HTMLElement>('[data-lang-suggest]');
  if (!box) return;
  let dismissed = false;
  try { dismissed = sessionStorage.getItem(DISMISS_KEY) === '1'; } catch { /* ignore */ }
  if (storedLanguage() || dismissed) return;
  const preferred = browserLocale();
  if (!preferred || preferred === c.language) return;
  const options = JSON.parse(box.querySelector('script')!.textContent || '[]') as { lang: string; href: string; htmlLang: string; text: string; action: string; dismiss: string }[];
  const o = options.find((x) => x.lang === preferred);
  if (!o) return;
  box.lang = o.htmlLang;
  box.querySelector<HTMLElement>('[data-text]')!.textContent = o.text;
  const go = box.querySelector<HTMLAnchorElement>('[data-go]')!;
  go.textContent = o.action;
  go.href = o.href;
  go.dataset.langSwitch = o.lang;
  const dismiss = box.querySelector<HTMLButtonElement>('[data-dismiss]')!;
  dismiss.textContent = o.dismiss;
  dismiss.addEventListener('click', () => {
    box.hidden = true;
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch { /* ignore */ }
    storeLanguage(c.language);
  });
  // Show after first paint so it never competes with LCP.
  setTimeout(() => { box.hidden = false; }, 1200);
}

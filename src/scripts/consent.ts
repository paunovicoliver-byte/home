import { track } from './analytics';

const KEY = 'drveno_consent';

interface Choice { analytics: boolean; marketing: boolean }

function apply(choice: Choice) {
  const v = window.__DRVENO.consentVersion;
  try { localStorage.setItem(KEY, JSON.stringify({ ...choice, v, ts: Date.now() })); } catch { /* storage blocked: choice applies to this page view only */ }
  const m = choice.marketing ? 'granted' : 'denied';
  window.gtag?.('consent', 'update', {
    analytics_storage: choice.analytics ? 'granted' : 'denied',
    ad_storage: m, ad_user_data: m, ad_personalization: m,
  });
  document.documentElement.setAttribute('data-consent', 'set');
  track('consent_update', { analytics_consent: choice.analytics, marketing_consent: choice.marketing });
  if (choice.analytics || choice.marketing) window.__loadGtm?.();
}

function read(): Choice | null {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (s && s.v === window.__DRVENO.consentVersion) return { analytics: !!s.analytics, marketing: !!s.marketing };
  } catch { /* ignore */ }
  return null;
}

export function initConsent() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-consent-dialog]');
  const form = document.querySelector<HTMLFormElement>('[data-consent-form]');
  const status = document.querySelector<HTMLElement>('[data-consent-status]');
  if (!dialog || !form) return;

  const open = () => {
    const current = read();
    (form.elements.namedItem('analytics') as HTMLInputElement).checked = current?.analytics ?? false;
    (form.elements.namedItem('marketing') as HTMLInputElement).checked = current?.marketing ?? false;
    dialog.showModal();
  };
  const close = () => dialog.close();
  const confirm = (choice: Choice) => {
    apply(choice);
    if (status) status.textContent = status.dataset.savedText || '';
    if (dialog.open) close();
  };

  document.addEventListener('click', (e) => {
    const el = (e.target as Element).closest<HTMLElement>('[data-consent-open], [data-consent-close], [data-consent-action]');
    if (!el) return;
    if (el.hasAttribute('data-consent-open')) { e.preventDefault(); open(); return; }
    if (el.hasAttribute('data-consent-close')) { close(); return; }
    const action = el.dataset.consentAction;
    if (action === 'accept') confirm({ analytics: true, marketing: true });
    else if (action === 'reject') confirm({ analytics: false, marketing: false });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    confirm({
      analytics: (form.elements.namedItem('analytics') as HTMLInputElement).checked,
      marketing: (form.elements.namedItem('marketing') as HTMLInputElement).checked,
    });
  });

  // Click on the backdrop closes the dialog.
  dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
}

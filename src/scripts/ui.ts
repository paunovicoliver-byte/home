/** Menu dialog, header state, mobile CTA bar, reveal-on-scroll. All passive and cheap (INP). */
export function initUi() {
  // Menu
  const menu = document.getElementById('site-menu') as HTMLDialogElement | null;
  const opener = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  if (menu && opener) {
    opener.addEventListener('click', () => {
      menu.showModal();
      opener.setAttribute('aria-expanded', 'true');
      document.documentElement.style.overflow = 'hidden';
    });
    menu.querySelector('[data-menu-close]')?.addEventListener('click', () => menu.close());
    menu.addEventListener('close', () => {
      opener.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      opener.focus();
    });
    menu.addEventListener('click', (e) => {
      if ((e.target as Element).closest('a[href]')) menu.close();
    });
    matchMedia('(min-width: 1180px)').addEventListener('change', (m) => { if (m.matches && menu.open) menu.close(); });
  }

  // Header becomes solid once the hero is scrolled past; mobile CTA appears after the first screen.
  const header = document.querySelector<HTMLElement>('[data-header]');
  const bar = document.querySelector<HTMLElement>('[data-mobile-cta]');
  const footer = document.querySelector('.site-footer');
  let footerVisible = false;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = window.scrollY;
    header?.classList.toggle('is-scrolled', y > 24);
    if (bar) {
      const show = y > window.innerHeight * 0.6 && !footerVisible;
      if (show !== bar.classList.contains('is-visible')) {
        bar.classList.toggle('is-visible', show);
        bar.setAttribute('aria-hidden', String(!show));
        bar.querySelectorAll('a').forEach((a) => (show ? a.removeAttribute('tabindex') : a.setAttribute('tabindex', '-1')));
      }
    }
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  if (footer && bar && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => { footerVisible = e.isIntersecting; update(); }).observe(footer);
  }
  update();

  // Reveal
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
  els.forEach((el) => io.observe(el));
}

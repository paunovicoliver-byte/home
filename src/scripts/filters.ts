import { track } from './analytics';

/** Portfolio filters. Without JS every project is visible; with JS, buttons filter in place and update the URL hash. */
export function initFilters() {
  const root = document.querySelector<HTMLElement>('[data-filters]')!;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('button[data-filter]')];
  const items = [...document.querySelectorAll<HTMLElement>('[data-filter-tags]')];
  const count = document.querySelector<HTMLElement>('[data-filter-count]');
  const empty = document.querySelector<HTMLElement>('[data-filter-empty]');
  root.hidden = false;

  const apply = (filter: string, user: boolean) => {
    let visible = 0;
    for (const item of items) {
      const show = filter === 'all' || item.dataset.filterTags!.split(' ').includes(filter);
      item.hidden = !show;
      if (show) visible++;
    }
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    if (count) count.textContent = visible === 1 ? count.dataset.one! : count.dataset.many!.replace('{count}', String(visible));
    if (empty) empty.hidden = visible > 0;
    if (user) {
      history.replaceState(null, '', filter === 'all' ? location.pathname : `#${filter}`);
      track('portfolio_filter', { filter_value: filter, results_count: visible });
    }
  };

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter!, true)));
  const initial = location.hash.slice(1);
  apply(buttons.some((b) => b.dataset.filter === initial) ? initial : 'all', false);
}

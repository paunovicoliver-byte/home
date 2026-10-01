import { track } from './analytics';

/** Accessible before/after comparison driven by a native range input. */
export function initBeforeAfter() {
  document.querySelectorAll<HTMLElement>('[data-before-after]').forEach((root) => {
    const range = root.querySelector<HTMLInputElement>('input[type="range"]')!;
    const id = root.dataset.beforeAfter || 'before_after';
    let reported = false;
    let timer = 0;
    const set = () => root.style.setProperty('--pos', `${range.value}%`);
    range.addEventListener('input', () => {
      set();
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        const v = Number(range.value);
        track('before_after_interaction', {
          comparison_id: id,
          position: v < 34 ? 'after' : v > 66 ? 'before' : 'middle',
          first_interaction: !reported,
        });
        reported = true;
      }, 400);
    });
    set();
  });
}

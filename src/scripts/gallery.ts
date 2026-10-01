import { track } from './analytics';

/** Scroll-snap gallery: native swipe on touch, buttons for pointer/keyboard. */
export function initGalleries() {
  document.querySelectorAll<HTMLElement>('[data-gallery]').forEach((root) => {
    const track_ = root.querySelector<HTMLElement>('[data-gallery-track]')!;
    const slides = [...track_.children] as HTMLElement[];
    const prev = root.querySelector<HTMLButtonElement>('[data-gallery-prev]');
    const next = root.querySelector<HTMLButtonElement>('[data-gallery-next]');
    const pos = root.querySelector<HTMLElement>('[data-gallery-pos]');
    const template = pos?.dataset.template || '{current} / {total}';
    const id = root.dataset.gallery || 'gallery';
    let index = 0;
    let lastReported = -1;

    const go = (i: number) => {
      index = Math.max(0, Math.min(slides.length - 1, i));
      track_.scrollTo({ left: slides[index].offsetLeft - track_.offsetLeft, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    };
    const update = () => {
      const left = track_.scrollLeft;
      let best = 0;
      slides.forEach((s, i) => { if (Math.abs(s.offsetLeft - track_.offsetLeft - left) < Math.abs(slides[best].offsetLeft - track_.offsetLeft - left)) best = i; });
      index = best;
      if (pos) pos.textContent = template.replace('{current}', String(index + 1)).replace('{total}', String(slides.length));
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index >= slides.length - 1;
    };
    const report = (action: string) => {
      if (index === lastReported && action === 'swipe') return;
      lastReported = index;
      track('gallery_interaction', { gallery_id: id, action, image_index: index + 1, image_count: slides.length });
    };

    prev?.addEventListener('click', () => { go(index - 1); report('previous'); });
    next?.addEventListener('click', () => { go(index + 1); report('next'); });
    let timer = 0;
    track_.addEventListener('scroll', () => {
      cancelAnimationFrame(timer);
      timer = requestAnimationFrame(update);
    }, { passive: true });
    let touched = false;
    track_.addEventListener('pointerdown', () => { touched = true; }, { passive: true });
    track_.addEventListener('scrollend', () => { if (touched) { touched = false; report('swipe'); } });
    track_.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1); report('keyboard'); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1); report('keyboard'); }
    });
    update();
  });
}

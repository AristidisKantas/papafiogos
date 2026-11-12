/**
 * Hand-built lightbox on a native <dialog> (focus trap + Esc for free).
 * Close: ×, Esc, tap on the backdrop, swipe down. Navigate: arrows, keys, swipe.
 */
export function initLightbox() {
  const dialog = document.querySelector<HTMLDialogElement>('[data-lightbox-dialog]');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const img = dialog.querySelector<HTMLImageElement>('[data-lb-img]')!;
  const stage = dialog.querySelector<HTMLElement>('[data-lb-stage]')!;
  const count = dialog.querySelector<HTMLElement>('[data-lb-count]')!;

  let items: HTMLAnchorElement[] = [];
  let index = 0;
  let trigger: HTMLElement | null = null;

  const show = (i: number) => {
    index = (i + items.length) % items.length;
    const a = items[index]!;
    img.src = a.href;
    img.alt = a.dataset.alt ?? '';
    img.width = Number(a.dataset.w);
    img.height = Number(a.dataset.h);
    dialog.setAttribute('aria-label', a.dataset.alt ?? '');
    count.textContent = `${index + 1} / ${items.length}`;
  };

  document.querySelectorAll<HTMLAnchorElement>('a[data-lightbox]').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      trigger = a;
      items = [
        ...document.querySelectorAll<HTMLAnchorElement>(`a[data-lightbox="${a.dataset.lightbox}"]`),
      ];
      dialog.classList.toggle('is-single', items.length < 2);
      show(items.indexOf(a));
      document.documentElement.classList.add('lb-open');
      dialog.showModal();
    });
  });

  const close = () => {
    if (dialog.open) dialog.close();
  };
  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('lb-open');
    img.style.transform = '';
    img.style.opacity = '';
    trigger?.focus();
  });
  dialog.querySelector('[data-lb-close]')!.addEventListener('click', close);
  dialog.querySelector('[data-lb-prev]')!.addEventListener('click', () => show(index - 1));
  dialog.querySelector('[data-lb-next]')!.addEventListener('click', () => show(index + 1));
  stage.addEventListener('click', (e) => {
    if (e.target === stage && !moved) close();
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    else if (e.key === 'ArrowRight') show(index + 1);
  });

  // Swipe: left/right to navigate, down to close.
  let start: { x: number; y: number } | null = null;
  let moved = false;
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse') return;
    start = { x: e.clientX, y: e.clientY };
    moved = false;
  });
  stage.addEventListener('pointermove', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) moved = true;
    if (dy > 0 && Math.abs(dy) > Math.abs(dx)) {
      img.style.transition = 'none';
      img.style.transform = `translateY(${dy}px)`;
      img.style.opacity = String(Math.max(0.3, 1 - dy / 400));
    }
  });
  const end = (e: PointerEvent) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    start = null;
    img.style.transition = '';
    if (dy > 90 && dy > Math.abs(dx)) close();
    else {
      img.style.transform = '';
      img.style.opacity = '';
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) && items.length > 1)
        show(index + (dx < 0 ? 1 : -1));
    }
    window.setTimeout(() => (moved = false), 0);
  };
  stage.addEventListener('pointerup', end);
  stage.addEventListener('pointercancel', end);
}

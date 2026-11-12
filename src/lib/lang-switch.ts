/**
 * Keeps the ΕΛ · EN links pointing at the section the visitor is looking at,
 * remembers the last choice (only for consistency, never to redirect), and
 * gives one gentle hint on "/" when the browser language isn't Greek.
 */
const KEY = 'papafiogos-lang';

export function initLangSwitch() {
  const nav = document.querySelector<HTMLElement>('[data-lang-switch]');
  if (!nav) return;
  const current = nav.dataset.locale!;
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[data-lang]')];

  links.forEach((a) =>
    a.addEventListener('click', () => {
      try {
        localStorage.setItem(KEY, a.dataset.lang!);
      } catch {
        /* private mode */
      }
    }),
  );

  // Section tracking: each section declares its anchors per language.
  const sections = [...document.querySelectorAll<HTMLElement>('[data-anchors]')];
  if (sections.length) {
    const update = (el: HTMLElement | null) => {
      const map = el ? (JSON.parse(el.dataset.anchors!) as Record<string, string>) : null;
      links.forEach((a) => {
        const anchor = map?.[a.dataset.lang!];
        a.href = a.dataset.base! + (anchor ? `#${anchor}` : '');
      });
    };
    const visible = new Map<HTMLElement, number>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => visible.set(e.target as HTMLElement, e.intersectionRatio));
        let best: HTMLElement | null = null;
        let bestR = 0;
        visible.forEach((r, el) => {
          if (r > bestR) {
            bestR = r;
            best = el;
          }
        });
        update(best);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => io.observe(s));
  }

  // One gentle pulse on the other language when the browser isn't Greek.
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch {
    /* ignore */
  }
  const prefersOther = !navigator.language.toLowerCase().startsWith(current);
  if (
    current === 'el' &&
    prefersOther &&
    !stored &&
    !matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    const en = links.find((a) => a.dataset.lang === 'en');
    window.setTimeout(() => en?.classList.add('is-hint'), 1200);
  }
}

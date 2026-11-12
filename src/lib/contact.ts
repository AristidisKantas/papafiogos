/**
 * "Talk to me": reveal/collapse the contact items, rebuild the scrambled
 * email/phone, and copy-to-clipboard on long-press or right-click.
 */
const rev = (s: string) => [...s].reverse().join('');

export function initContact() {
  const section = document.querySelector<HTMLElement>('[data-contact-section]');
  if (!section) return;
  const talk = section.querySelector<HTMLButtonElement>('[data-talk]')!;
  const items = [...section.querySelectorAll<HTMLElement>('[data-contact-list] .ci')];
  const toast = section.querySelector<HTMLElement>('[data-toast]')!;
  const stagger =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--talk-stagger')) || 80;

  // Rebuild email / phone from their split parts.
  section.querySelectorAll<HTMLAnchorElement>('a[data-scramble]').forEach((a) => {
    const s = JSON.parse(a.dataset.scramble!) as {
      t: string;
      v: string[];
      j: string;
      o?: number;
      h?: string;
    };
    let parts = s.v.map(rev);
    if (s.o) parts = parts.reverse();
    const text = parts.join(s.j);
    a.href = s.t + (s.h ? rev(s.h) : text);
    a.querySelector('[data-text]')!.textContent = text;
    a.dataset.value = text;
  });

  items.forEach((li, i) => (li.style.transitionDelay = `${i * stagger}ms`));

  const setOpen = (open: boolean) => {
    section.classList.toggle('is-open', open);
    talk.setAttribute('aria-expanded', String(open));
  };
  talk.addEventListener('click', () => setOpen(!section.classList.contains('is-open')));
  // Opening via a shared link (#epikoinonia / #contact) shows the items straight away.
  if (location.hash && section.id === decodeURIComponent(location.hash.slice(1))) setOpen(true);

  // Copy to clipboard: right-click (desktop) or long-press (touch).
  if (section.dataset.copyEnabled !== '1' || !navigator.clipboard) return;
  let toastTimer = 0;
  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.textContent = section.dataset.copied!;
      toast.classList.add('is-shown');
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(
        () => {
          toast.classList.remove('is-shown');
          window.setTimeout(() => (toast.textContent = ''), 250);
        },
        Number(section.dataset.copyMs) || 1200,
      );
    } catch {
      /* clipboard blocked: the link still works */
    }
  };
  section.querySelectorAll<HTMLAnchorElement>('a[data-copy]').forEach((a) => {
    let pressTimer = 0;
    let longPressed = false;
    a.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (!longPressed) copy(a.dataset.value!);
    });
    a.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return;
      longPressed = false;
      pressTimer = window.setTimeout(() => {
        longPressed = true;
        copy(a.dataset.value!);
        (navigator as Navigator & { vibrate?: (ms: number) => boolean }).vibrate?.(10);
      }, 550);
    });
    const cancel = () => window.clearTimeout(pressTimer);
    a.addEventListener('pointerup', cancel);
    a.addEventListener('pointercancel', cancel);
    a.addEventListener('pointerleave', cancel);
    a.addEventListener('click', (e) => {
      if (longPressed) {
        e.preventDefault();
        longPressed = false;
      }
    });
  });
}

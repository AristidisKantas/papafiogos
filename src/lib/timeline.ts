/**
 * Timeline behaviour: reveal-on-scroll, line fill fallback, image fade-in,
 * short clips that play only while visible, and click-to-load video facades.
 */
export function initTimeline() {
  const root = document.querySelector<HTMLElement>('[data-timeline]');
  if (!root) return;

  // Reveal each entry once.
  const reveal = root.querySelectorAll<HTMLElement>('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.2, rootMargin: '0px 0px -5% 0px' },
    );
    reveal.forEach((el) => io.observe(el));
  } else reveal.forEach((el) => el.classList.add('is-in'));

  // Line fill fallback (browsers without scroll-driven animations).
  const fill = root.querySelector<HTMLElement>('[data-fill]');
  if (fill && !CSS.supports('animation-timeline: view()')) {
    const line = fill.parentElement!;
    let pending = false;
    const update = () => {
      pending = false;
      const r = line.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight / 2 - r.top) / r.height));
      fill.style.setProperty('--fill', p.toFixed(4));
    };
    const onScroll = () => {
      if (!pending) {
        pending = true;
        requestAnimationFrame(update);
      }
    };
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    update();
  }

  // Fade full images in over their blurred placeholder.
  root.querySelectorAll<HTMLImageElement>('img.media__img, .media__img img').forEach((img) => {
    const target = img.closest<HTMLElement>('picture.media__img') ?? img;
    const done = () => target.classList.add('is-loaded');
    if (img.complete && img.naturalWidth) done();
    else {
      img.addEventListener('load', done, { once: true });
      img.addEventListener('error', done, { once: true });
    }
  });

  // Short clips: muted, looped, playing only while ≥ 50 % visible.
  root.querySelectorAll<HTMLElement>('[data-video]').forEach((wrap) => {
    const video = wrap.querySelector('video')!;
    video.controls = false;
    video.classList.add('is-loaded');
    const io = new IntersectionObserver(
      ([e]) => {
        if (e!.intersectionRatio >= 0.5) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(video);
    const mute = wrap.querySelector<HTMLButtonElement>('[data-mute]');
    if (mute) {
      wrap.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse') {
          wrap.classList.add('is-tapped');
          window.setTimeout(() => wrap.classList.remove('is-tapped'), 3000);
        }
      });
      mute.addEventListener('click', () => {
        video.muted = !video.muted;
        mute.setAttribute('aria-pressed', String(!video.muted));
        const label = mute.querySelector('.visually-hidden');
        if (label) label.textContent = video.muted ? mute.dataset.labelOn! : mute.dataset.labelOff!;
      });
    }
  });

  // Long videos: the iframe loads only on click (privacy-enhanced domains).
  root.querySelectorAll<HTMLAnchorElement>('a[data-embed]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const iframe = document.createElement('iframe');
      iframe.src = a.dataset.embed!;
      iframe.title = a.dataset.title ?? '';
      iframe.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      a.querySelector('.media__play')?.remove();
      a.appendChild(iframe);
      a.removeAttribute('href');
      iframe.focus();
    });
  });
}

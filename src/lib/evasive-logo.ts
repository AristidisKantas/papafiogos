/**
 * The shy logo.
 *  - Mouse/pen (hover): the logo slides away when the pointer comes close,
 *    reveals the slogan, and comes home when the pointer leaves.
 *  - Touch / keyboard: a tap (or Enter/Space) makes it hop away; tap anywhere,
 *    wait, or scroll to bring it back.
 *  - Reduced motion: no movement, the logo crossfades with the slogan instead.
 * All values come from site.logo (passed in via data-config).
 */
import { Spring } from './spring';
import type { site } from '../config/site';

type LogoConfig = typeof site.logo & { scrollReturnPx: number };
type Rect = { left: number; top: number; right: number; bottom: number };

const HINT_KEY = 'papafiogos-logo-tapped';
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const deg = (d: number) => (d * Math.PI) / 180;
const intersects = (a: Rect, b: Rect) =>
  a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
const inside = (x: number, y: number, r: Rect, pad = 0) =>
  x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad;

export function initEvasiveLogo(root: HTMLElement) {
  const cfg = JSON.parse(root.dataset.config!) as LogoConfig;
  const button = root.querySelector<HTMLButtonElement>('[data-logo-button]')!;
  const mover = root.querySelector<HTMLElement>('[data-logo-mover]')!;
  const slogan = root.querySelector<HTMLElement>('[data-slogan]')!;
  const sloganText = root.querySelector<HTMLElement>('[data-slogan-text]') ?? slogan;
  const hero = root.closest<HTMLElement>('[data-hero]') ?? root;
  const langSwitch = document.querySelector<HTMLElement>('[data-lang-switch]');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const touchFirst = matchMedia('(hover: none), (pointer: coarse)');

  let away = false;
  let lastDodge = -Infinity;
  let returnTimer = 0;
  let autoReturnTimer = 0;
  let lastPointerType = '';
  let pointer: { x: number; y: number } | null = null;
  let rafPending = false;

  const spring = new Spring({ x: 0, y: 0, r: 0 }, cfg.spring, (v) => {
    mover.style.transform = `translate3d(${v.x.toFixed(2)}px, ${v.y.toFixed(2)}px, 0) rotate(${v.r.toFixed(2)}deg)`;
  });

  /* ---------- hinting cues (breathing is pure CSS) ---------- */
  let hinted = false;
  try {
    hinted = sessionStorage.getItem(HINT_KEY) === '1';
  } catch {
    /* ignore */
  }
  const setCues = () => {
    const touch = touchFirst.matches && !reduced.matches;
    root.classList.toggle('is-touch', touch);
    root.classList.toggle('has-hints', touch && !hinted);
  };
  setCues();
  touchFirst.addEventListener?.('change', setCues);
  reduced.addEventListener?.('change', setCues);

  // Curious nudge: first after N ms, then every M ms, until the first tap.
  let nudgeTimer = 0;
  const nudge = () => {
    if (!root.classList.contains('has-hints') || away || !cfg.nudge.enabled) return;
    root.classList.remove('is-nudging');
    void root.offsetWidth; // restart the CSS animation
    root.classList.add('is-nudging');
    nudgeTimer = window.setTimeout(nudge, cfg.nudge.everyMs);
  };
  nudgeTimer = window.setTimeout(nudge, cfg.nudge.firstAfterMs);
  root.addEventListener('animationend', (e) => {
    if (e.animationName.startsWith('logo-nudge')) root.classList.remove('is-nudging');
    if (e.animationName.startsWith('bowtie-wiggle')) root.classList.remove('is-wiggling');
  });

  // Desktop: an occasional bow-tie wink on every third breath.
  if (cfg.bowtieWiggle) {
    window.setInterval(() => {
      if (away || reduced.matches || document.hidden) return;
      if (!root.classList.contains('is-touch')) {
        root.classList.remove('is-wiggling');
        void root.offsetWidth;
        root.classList.add('is-wiggling');
      }
    }, cfg.breathe.periodMs * 3);
  }

  const stopHints = () => {
    if (hinted) return;
    hinted = true;
    try {
      sessionStorage.setItem(HINT_KEY, '1');
    } catch {
      /* ignore */
    }
    window.clearTimeout(nudgeTimer);
    setCues();
  };

  /* ---------- geometry ---------- */
  // The button never moves (only its inner "mover" does), so its rect is home.
  const homeRect = (): DOMRect => button.getBoundingClientRect();
  const vmin = () => Math.min(innerWidth, innerHeight) / 100;
  const noGo = (): Rect | null => {
    if (!langSwitch) return null;
    const r = langSwitch.getBoundingClientRect();
    const m = 16;
    return { left: r.left - m, top: r.top - m, right: r.right + m, bottom: r.bottom + m };
  };

  /** Pick a destination offset (from home), moving along `angle` (radians). */
  function pickOffset(angle: number) {
    const home = homeRect();
    const margin = cfg.viewportMarginPx;
    const heroRect = hero.getBoundingClientRect();
    // Keep the logo inside the visible part of the hero.
    const bounds = {
      left: margin,
      top: Math.max(margin, heroRect.top + margin),
      right: innerWidth - margin,
      bottom: Math.min(innerHeight, heroRect.bottom) - margin,
    };
    const block = noGo();
    // The slogan's box (it sits at the home centre, transform ignored).
    const st = sloganText.getBoundingClientRect();
    const pad = cfg.sloganClearancePx;
    const sloganBox: Rect = {
      left: st.left - pad,
      right: st.right + pad,
      top: home.top + home.height / 2 - st.height / 2 - pad,
      bottom: home.top + home.height / 2 + st.height / 2 + pad,
    };
    const [dMin, dMax] = cfg.dodgeDistanceVmin;
    type Cand = { x: number; y: number; d: number; covers: boolean };
    let best: Cand | null = null;
    const better = (a: Cand, b: Cand | null) =>
      !b || (a.covers !== b.covers ? !a.covers : a.d > b.d);
    // Try the requested angle, its mirrors, then the perpendiculars.
    const angles = [
      angle,
      Math.PI - angle,
      -angle,
      angle + Math.PI,
      angle + Math.PI / 2,
      angle - Math.PI / 2,
    ];
    for (const a of angles) {
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      let dist = rand(dMin, dMax) * vmin();
      if (cfg.clearSlogan) {
        // distance along this direction at which the logo stops overlapping the slogan
        // + slack for the small random rotation, which widens the logo's box
        const tilt = Math.sin(deg(cfg.dodgeRotateDeg));
        const needX = (home.width + home.height * tilt + (sloganBox.right - sloganBox.left)) / 2;
        const needY = (home.height + home.width * tilt + (sloganBox.bottom - sloganBox.top)) / 2;
        const tx = Math.abs(cos) > 1e-3 ? needX / Math.abs(cos) : Infinity;
        const ty = Math.abs(sin) > 1e-3 ? needY / Math.abs(sin) : Infinity;
        dist = Math.max(dist, Math.min(tx, ty) + 2);
      }
      let x = cos * dist;
      let y = sin * dist;
      x = Math.min(Math.max(x, bounds.left - home.left), bounds.right - home.right);
      y = Math.min(Math.max(y, bounds.top - home.top), bounds.bottom - home.bottom);
      const dest = {
        left: home.left + x,
        top: home.top + y,
        right: home.right + x,
        bottom: home.bottom + y,
      };
      if (block && intersects(dest, block)) continue;
      const cand: Cand = {
        x,
        y,
        d: Math.hypot(x, y),
        covers: cfg.clearSlogan && intersects(dest, sloganBox),
      };
      if (!cand.covers && cand.d >= cfg.dodgeMinDistanceVmin * vmin()) return { x, y };
      if (better(cand, best)) best = cand;
    }
    return best ? { x: best.x, y: best.y } : { x: 0, y: -cfg.dodgeMinDistanceVmin * vmin() };
  }

  function showSlogan(show: boolean) {
    root.classList.toggle('is-away', show);
    slogan.setAttribute('aria-hidden', show ? 'false' : 'true');
  }

  function dodge(from?: { x: number; y: number }) {
    const now = performance.now();
    if (now - lastDodge < cfg.dodgeCooldownMs) return;
    lastDodge = now;
    window.clearTimeout(returnTimer);

    if (reduced.matches) {
      away = true;
      showSlogan(true);
      return;
    }
    const home = homeRect();
    const cx = home.left + home.width / 2 + spring.value.x;
    const cy = home.top + home.height / 2 + spring.value.y;
    let angle: number;
    if (from) {
      angle = Math.atan2(cy - from.y, cx - from.x);
      if (!Number.isFinite(angle) || (cx === from.x && cy === from.y)) angle = rand(0, Math.PI * 2);
      angle += deg(rand(-cfg.dodgeAngleJitterDeg, cfg.dodgeAngleJitterDeg));
    } else {
      angle = rand(0, Math.PI * 2);
    }
    const { x, y } = pickOffset(angle);
    spring.to({ x, y, r: rand(-cfg.dodgeRotateDeg, cfg.dodgeRotateDeg) });
    away = true;
    showSlogan(true);
  }

  function goHome() {
    window.clearTimeout(returnTimer);
    window.clearTimeout(autoReturnTimer);
    returnTimer = 0;
    if (!away) return;
    away = false;
    showSlogan(false);
    if (!reduced.matches) spring.to({ x: 0, y: 0, r: 0 });
  }

  /* ---------- hover path (mouse / pen) ---------- */
  const isHoverPointer = (e: PointerEvent) => e.pointerType === 'mouse' || e.pointerType === 'pen';

  function evaluatePointer() {
    rafPending = false;
    if (!pointer) return;
    const home = homeRect();
    const { x, y } = pointer;
    const inHome = inside(x, y, home, cfg.triggerPaddingPx);
    const cur: Rect = {
      left: home.left + spring.value.x,
      top: home.top + spring.value.y,
      right: home.right + spring.value.x,
      bottom: home.bottom + spring.value.y,
    };
    const onLogo = away && inside(x, y, cur, cfg.chasePaddingPx);

    if (!away && inHome) {
      dodge(pointer);
      return;
    }
    if (away && onLogo) {
      if (!reduced.matches) dodge(pointer);
      return;
    }
    const nearHome = inside(x, y, home, cfg.triggerPaddingPx + cfg.hysteresisPx);
    if (away && !nearHome && !onLogo) {
      if (!returnTimer) returnTimer = window.setTimeout(goHome, cfg.returnDelayMs);
    } else if (returnTimer) {
      window.clearTimeout(returnTimer);
      returnTimer = 0;
    }
  }

  document.addEventListener(
    'pointermove',
    (e) => {
      if (!isHoverPointer(e)) return;
      pointer = { x: e.clientX, y: e.clientY };
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(evaluatePointer);
      }
    },
    { passive: true },
  );
  document.documentElement.addEventListener('pointerleave', (e) => {
    if (isHoverPointer(e)) {
      pointer = null;
      goHome();
    }
  });
  hero.addEventListener('pointerleave', (e) => {
    if (isHoverPointer(e)) goHome();
  });
  window.addEventListener('blur', goHome);

  /* ---------- tap / keyboard path ---------- */
  button.addEventListener('pointerdown', (e) => {
    lastPointerType = e.pointerType;
    if (!isHoverPointer(e) && !reduced.matches && !away) root.classList.add('is-pressed');
  });
  const unpress = () => root.classList.remove('is-pressed');
  button.addEventListener('pointerup', unpress);
  button.addEventListener('pointercancel', unpress);
  button.addEventListener('pointerleave', unpress);

  button.addEventListener('click', (e) => {
    // Mouse clicks are handled by the hover path (the logo has already dodged).
    if (e.detail > 0 && (lastPointerType === 'mouse' || lastPointerType === 'pen')) return;
    e.stopPropagation();
    unpress();
    if (away) {
      goHome();
      return;
    }
    stopHints();
    dodge();
    if (e.detail > 0)
      (navigator as Navigator & { vibrate?: (ms: number) => boolean }).vibrate?.(cfg.hapticMs);
    window.clearTimeout(autoReturnTimer);
    autoReturnTimer = window.setTimeout(goHome, cfg.mobileAutoReturnMs);
  });

  // Tap anywhere else brings it home (touch path).
  document.addEventListener('click', () => {
    if (away && lastPointerType !== 'mouse') goHome();
  });
  window.addEventListener(
    'scroll',
    () => {
      if (away && scrollY > cfg.scrollReturnPx) goHome();
    },
    { passive: true },
  );

  // Reduced motion: focus also reveals the slogan (and blur hides it).
  button.addEventListener('focus', () => {
    if (reduced.matches && button.matches(':focus-visible')) dodge();
  });
  button.addEventListener('blur', () => {
    if (reduced.matches) goHome();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && away) goHome();
  });

  root.classList.add('is-ready');
}

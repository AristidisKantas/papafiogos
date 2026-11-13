/**
 * PAPAFIOGOS — the single place for every tunable value.
 *
 * Contact details, timings, distances, sizes and colours all live here.
 * Change a value, save, and the whole site follows. Nothing else in the code
 * hard-codes these values.
 */
export const site = {
  name: 'PAPAFIOGOS',
  url: 'https://papafiogos.gr',
  slogan: 'I shoot. You smile.', // same on el + en, never translated
  /**
   * Show the owner's own handwriting for the slogan (traced from a photo by
   * scripts/build-slogan.mjs). false = typed in the site font instead.
   */
  sloganHandwritten: true,
  /** Width of the handwritten slogan (height follows). */
  sloganHandwrittenWidth: 'clamp(220px, 22vw + 140px, 600px)',
  /**
   * "Μίλα μου" / "Talk to me" in the owner's handwriting (same tracing script).
   * false = typed in the site font instead.
   */
  talkHandwritten: true,
  /** Height of the handwritten "Μίλα μου" / "Talk to me" (width follows). */
  talkHandwrittenHeight: 'clamp(4.75rem, 3rem + 6vw, 8rem)',
  /** Search / link-preview description (approved by the owner 2026-11-12). */
  description: {
    el: 'Παπαφιόγκος: φωτογραφία, βίντεο και περιεχόμενο που σε κάνει να χαμογελάς. Από την Πάτρα. Μίλα μου.',
    en: 'PAPAFIOGOS: photography, video and content that makes you smile. Based in Patras, Greece. Let’s talk.',
  },
  alternateNames: ['Παπαφιόγκος', 'Papafiogos', 'ΠΑΠΑ ΦΙΟΓΚΟΣ'],
  locales: ['el', 'en'] as const,
  defaultLocale: 'el' as const,
  location: {
    locality: { el: 'Πάτρα', en: 'Patras' },
    region: { el: 'Δυτική Ελλάδα', en: 'Western Greece' },
    country: 'GR',
    areaServed: ['Patras', 'Greece'],
  },

  contact: {
    instagram: 'papafiogos',
    email: 'papafiogos@gmail.com', // TEMPORARY → change to 'info@papafiogos.gr' once Zoho is set up
    phone: '+30 697 895 4464', // displayed
    phoneHref: '+306978954464', // used in tel:
    /**
     * The items shown under "Talk to me", in order. To add WhatsApp later
     * (it uses the phone number above), add 'whatsapp' to this list.
     */
    items: ['instagram', 'email', 'phone'] as ('instagram' | 'email' | 'phone' | 'whatsapp')[],
    /**
     * Brands shown in a small line above "Μίλα μου" / "Talk to me", in this order,
     * followed by "και άλλα / and more". Empty list [] = the line disappears.
     */
    brands: [
      'Daniel Wellington',
      'CabinZero',
      'Hawkers',
      'Paul Hewitt',
      'Amacx Greece',
      'Hellas Green',
      'Block Fitness Gym',
    ],
    /** Copy-to-clipboard on long-press / right-click (email + phone). */
    copyToClipboard: true,
    copiedToastMs: 1200,
  },

  timeline: {
    order: 'oldest-first' as 'oldest-first' | 'newest-first',
    bookends: true,
    startYear: 2009,
    showHeading: true, // set false to hide "Η ΙΣΤΟΡΙΑ / THE STORY"
    /**
     * Moment titles in the owner's handwriting (traced from scripts/vendor/timeline.jpg by
     * npm run handwriting into src/assets/brand/timeline/<year>-<lang>.json). A moment
     * without a traced title falls back to the typed title. false = typed titles everywhere.
     */
    handwrittenTitles: true,
    /** Size of the handwritten titles: em per traced unit (bigger = larger writing). */
    handwrittenTitleScale: 0.023,
    maxPhotos: 3,
    maxTextLength: 400,
    maxVideoMB: 4,
    revealThreshold: 0.2,
    revealMs: 600,
    revealDistancePx: 24,
    revealSideOffsetPx: 16,
    mediaDelayMs: 100,
    dotPopMs: 300,
    videoVisibleRatio: 0.5,
    imageWidths: [480, 768, 1080, 1600, 2200],
    entryGap: 'clamp(4rem, 10vh, 9rem)',
  },

  logo: {
    sizeClamp: 'clamp(160px, 38vmin, 440px)', // logo HEIGHT (portrait mark); 160 px keeps the wordmark ≥ 18 px tall
    triggerPaddingPx: 24,
    chasePaddingPx: 16,
    hysteresisPx: 40,
    viewportMarginPx: 24,
    dodgeDistanceVmin: [14, 24] as [number, number],
    dodgeMinDistanceVmin: 10,
    /** Travel at least far enough that the logo no longer covers the slogan. */
    clearSlogan: true,
    sloganClearancePx: 12,
    dodgeAngleJitterDeg: 35,
    dodgeRotateDeg: 6,
    dodgeCooldownMs: 250,
    spring: { stiffness: 180, damping: 18, mass: 1 },
    returnDelayMs: 600,
    mobileAutoReturnMs: 3500,
    scrollReturnPx: 40,
    breathe: { scale: 1.025, periodMs: 3200 },
    ripple: { enabled: true, maxScale: 1.35, opacity: 0.18, durationMs: 1400 },
    nudge: {
      enabled: true,
      firstAfterMs: 2500,
      everyMs: 7000,
      durationMs: 450,
      liftPx: 6,
      rotateDeg: 2,
    },
    pressScale: 0.94,
    pressMs: 90,
    bowtieWiggle: true,
    bowtieWiggleDeg: 4,
    bowtieWiggleMs: 500,
    hapticMs: 10,
    sloganInMs: 380,
    sloganOutMs: 240,
    sloganDelayMs: 80,
    sloganLiftPx: 8,
    reducedMotionLogoOpacity: 0.15,
  },

  scrollCue: { heightPx: 48, periodMs: 2400, hideAfterPx: 40 },

  talk: {
    breatheScale: 1.012,
    openLiftVh: 12,
    openScale: 0.6,
    itemStaggerMs: 80,
    itemMs: 400,
    itemLiftPx: 12,
    underlineMs: 300,
    rowBreakpointPx: 640,
    rowGapPx: 48,
  },

  langSwitch: { edgePx: 24, hintPulseMs: 1200 },

  ease: 'cubic-bezier(.2,.7,.2,1)',

  colors: {
    white: '#ffffff',
    black: '#000000',
    ink70: 'rgb(0 0 0 / .7)',
    ink15: 'rgb(0 0 0 / .15)',
    paper70: 'rgb(255 255 255 / .7)',
    paper25: 'rgb(255 255 255 / .25)',
  },

  /**
   * Cloudflare Web Analytics token (cookieless). Leave empty to disable.
   * Get it from Cloudflare dashboard → Web Analytics → Add site.
   */
  analyticsToken: '',
};

export type Site = typeof site;
export type Locale = (typeof site.locales)[number];

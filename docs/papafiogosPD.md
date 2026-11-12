# PAPAFIOGOS — Product Design Document

**Project:** Personal brand website for PAPAFIOGOS
**Domain:** papafiogos.gr (**registered** by the owner, 2026-11-12; papafiogos.com not bought)
**Email:** **papafiogos@gmail.com for launch.** It switches to info@papafiogos.gr later, once that mailbox exists (§11.3).
**Languages:** Greek (default) + English, with a minimal switcher (§3.1)
**Document version:** 1.2 (2026-11-12)
**Audience:** An AI coding assistant (or developer) that will build the site from this document.

---

## 0. Instructions for the AI building this

Read this whole document before you write any code. Then:

1. Follow the tech stack in §7 exactly unless something there is impossible. If you change it, say why.
2. Build in the phase order in §13. Don't start a phase until the previous one meets its acceptance criteria (§12).
3. Every value in this document (timings, distances, sizes, colours) is a starting default. Put each one in a single config file (`src/config/site.ts`) so it can be tuned without editing components.
4. Never add UI libraries such as Material UI, Bootstrap, Tailwind UI kits, Chakra or shadcn. All styling is hand-written, minimal CSS.
5. Never add stock photography, camera icons, lens graphics, film strips or any other "photographer" clichés.
6. Where this document marks something as **[OWNER INPUT]**, use a clearly marked placeholder and list it in the README under "Content to provide".
7. Before calling any phase done, test it at every viewport in §9.3.

---

## 1. Vision

PAPAFIOGOS is a personal brand, not a job title. The visitor already knows who PAPAFIOGOS is and why they came. The site's only jobs are to:

1. **Make them feel they are in a place they can trust:** calm, confident, polished, with no clutter.
2. **Tell the story** through a timeline, from the first camera to today.
3. **Make contacting PAPAFIOGOS effortless.**

The tone is minimal, modern, elegant and a little playful. It should feel like a gallery, not a portfolio template. The site has no menus, sliders, cookie walls or pop-ups, and nothing that shouts.

### 1.1 Design principles

| Principle | Meaning in practice |
|---|---|
| **Less, but better** | Three screens. One logo. One sentence per screen. |
| **Black & white only** | Pure `#FFFFFF` and `#000000`, plus opacity steps of each. No other colour, except inside the owner's photos and videos. |
| **The work speaks** | Photos and videos in the timeline are the only rich visuals. |
| **Playful, not gimmicky** | One signature interaction (the evasive logo). Every other motion is subtle. |
| **Instant** | It must feel like it loads before you finish tapping the link. |
| **Every screen is first-class** | A 320 px phone, a 4K monitor and a foldable must all look like the site was designed for them. |

---

## 2. Brand assets

| Asset | Status | Notes |
|---|---|---|
| Logo | **Cleaned files in `Desktop/papafiogos-logo/`**. Copy them to `/src/assets/brand/`. The original `papafiogos.png` is the source only; never use it on the site. | See §2.2. |
| Slogan | "I shoot. You smile." | Exact text, including punctuation and capitalisation. **Decided: it stays in English on both the Greek and the English site.** Do not translate it. |
| Brand name | PAPAFIOGOS | Always uppercase in text, and always Latin letters, even on the Greek site. |
| Instagram | **@papafiogos** | https://instagram.com/papafiogos |
| Phone | **+30 697 895 4464** | Display with spaces as shown. Link `tel:+306978954464`. |
| Email | **papafiogos@gmail.com** (temporary) | Shown on the site until `info@papafiogos.gr` is created (§11.3). The switch must be a **one-line change** in `site.ts` (`contact.email`). Nothing else in the code may hard-code the address. |

### 2.1 Brand spelling

- Logo wordmark (Greek): **ΠΑΠΑ ΦΙΟΓΚΟΣ**
- Latin / domain / text: **PAPAFIOGOS**
- Greek in running text: **Παπαφιόγκος**
- Use all three for SEO (`alternateName` in JSON-LD, §8.2), so people find the site whichever way they type it.

### 2.2 Logo: what it is and how to prepare it

**Owner requirement: the logo must never show any shadow, circle or background on the site.** Only the mark itself.

**The original file** (`papafiogos.png`) is the mark in print-black `#231F20` on a **white circular "sticker"** with a soft grey shadow on its left edge, with transparent corners. **No vector original exists.** The mark consists of:
- A stylised bearded man with a moustache, whose collar/beard shapes form wing-like V shapes.
- A **bow tie** underneath (φιόγκος = bow tie, which is the brand pun).
- The wordmark **ΠΑΠΑ / ΦΙΟΓΚΟΣ** in a bold, condensed, angular display face, on two lines.

The mark is portrait, 511 × 701 px in the source (about 1 : 1.37, width : height).

**Already done (cleaned files in `Desktop/papafiogos-logo/`):**

| File | What it is |
|---|---|
| `papafiogos-logo-black.svg` | Traced vector, pure `#000`, transparent, no circle or shadow. **Use this in the hero, inlined.** |
| `papafiogos-logo-white.svg` | The same vector in pure `#FFF`, for the black timeline or dark contexts. |
| `papafiogos-logo-black.png` / `-white.png` | Transparent PNG fallbacks, 511×701, with anti-aliased edges kept. |
| `papafiogos-logo-black-on-white-square.png` / `white-on-black-square.png` | Square, padded versions, to generate the favicon, apple-touch-icon and OG image from. |

The print-black `#231F20` was remapped to **pure `#000`** so the logo matches the site's black exactly. The circle, shadow and all faint grey residue were removed.

**Remaining preparation (Phase 1, for the AI builder):**
1. **Polish the SVG.** It is an automatic trace from a 511-px-wide bitmap. It looks clean at site sizes, but straight edges have slight micro-wobble when zoomed far in. Straighten the obviously straight edges (wing edges, bow tie, letter stems) and simplify the path. Target ≤ 8 KB gzipped. Inline it in the hero, so it renders instantly and becomes the LCP element.
2. **Split the SVG** into three named groups: `#face` (beard, moustache, wings), `#bowtie`, and `#wordmark`. This enables the optional bow tie animation below.
3. **Generate icons and the share image:** `favicon.svg` (the face + bow tie only, without the wordmark, which is unreadable at 16 px), `apple-touch-icon.png` 180×180 (black mark on white), and `og-image.jpg` 1200×630 (full mark centred on white).
4. **Never** apply `filter: drop-shadow`, `box-shadow` or any background to the logo. The moving logo (§4.2) has **no shadow** either. Motion alone conveys depth.
5. The original circular sticker is not used anywhere on the site.

**Effect on interactions:**
- The hero size rule (`clamp(160px, 38vmin, 440px)`) applies to the mark's **height**, because the mark is portrait. Adjust the clamp so the wordmark stays readable on a 320 px phone (minimum wordmark letter height about 18 px).
- **Ripple ring (§4.3.1):** draw it as a **circle**. This echoes the original circular sticker, so the brand language stays consistent. Its diameter is the mark's height × 1.05.
- **Optional delight (recommended):** the "curious nudge" on touch devices and the desktop "breathing" can animate **only the bow tie**: a tiny wiggle (rotate ±4° around its centre knot, 500 ms) while the rest of the logo stays still. It's a quiet wink at the name. Configure it in `site.ts` (`logo.bowtieWiggle: true`).
- The `<h1>` text alternative is `PAPAFIOGOS – Παπαφιόγκος`.

### 2.3 Typography

- **One typeface only**, self-hosted, variable weight, subset to Latin + Greek. Recommended: **Inter** (OFL licence, excellent Greek support). Acceptable alternatives: *Manrope* or *Geist*, but only if the Greek glyphs are verified.
- Weights used: 300 (light) for body copy, 500 for headings and the slogan.
- Load with `font-display: swap` and preload the single WOFF2 file.
- Type scale is fluid with `clamp()`:
  - Slogan: `clamp(1.25rem, 1rem + 1.5vw, 2.25rem)`, letter-spacing `0.02em`
  - "Talk to me": `clamp(2rem, 1.2rem + 4vw, 5rem)`, weight 500, letter-spacing `-0.02em`
  - Timeline year: `clamp(0.75rem, 0.7rem + 0.3vw, 0.9rem)`, uppercase, letter-spacing `0.2em`
  - Timeline title: `clamp(1.25rem, 1rem + 1vw, 1.75rem)`
  - Timeline body: `clamp(0.95rem, 0.9rem + 0.25vw, 1.1rem)`, line-height 1.6, max-width 42ch

### 2.4 Colour tokens

```css
--white: #ffffff;
--black: #000000;
--ink-70: rgb(0 0 0 / .7);    /* secondary text on white */
--ink-15: rgb(0 0 0 / .15);   /* hairlines on white */
--paper-70: rgb(255 255 255 / .7); /* secondary text on black */
--paper-25: rgb(255 255 255 / .25);/* timeline line on black */
```

No gradients and no shadows anywhere, including on the logo (§2.2).

---

## 3. Information architecture

The site is a **single page** with three full-screen sections, in this order:

```
┌───────────────────────────┐
│ 1. HERO        (WHITE)    │  100% viewport height. Logo + evasive interaction
├───────────────────────────┤
│ 2. TIMELINE    (BLACK)    │  As tall as the content. Vertical story
├───────────────────────────┤
│ 3. CONTACT     (WHITE)    │  100% viewport height. "Talk to me"
└───────────────────────────┘
```

Other pages:
- `/404`: white, logo centred and small, one line linking to the home page of the visitor's language: "Χάθηκες; Πάμε σπίτι." (el) or "Lost? Let's go home." (en).
- No other pages for v1. There is no navigation bar and no menu.

**URLs (bilingual):**

| Language | Home | Anchors |
|---|---|---|
| Greek (default) | `/` | `/#istoria`, `/#epikoinonia` |
| English | `/en/` | `/en/#story`, `/en/#contact` |

Both versions are fully pre-rendered static pages with identical layout. Only the text differs. The `/#contact`-style anchors let the owner share a direct contact link, for example in the Instagram bio.

### 3.1 Language switcher (very minimal)

- **What it is:** two tiny letters pairs, `ΕΛ · EN`, fixed in the **top-right corner** (24 px from the edges, plus the safe-area inset). Font size about 0.75rem, letter-spacing 0.15em, weight 500.
- **States:** the active language is solid (100% opacity) and the other is at 40% opacity, rising to 100% on hover or focus. There are no flags, no dropdown and no globe icon.
- **Colour:** it automatically inverts to stay visible: black over the white sections, white over the black timeline. Use `mix-blend-mode: difference` on a white element, or switch a class with IntersectionObserver.
- **Behaviour:** it is a plain link to the same anchor on the other language's page (e.g. from `/#epikoinonia` to `/en/#contact`), so it works without JS. The choice is remembered in `localStorage` only to keep the switcher consistent; it never forces a redirect.
- **First visit:** **no automatic redirect** based on browser language (automatic redirects hurt SEO and annoy people). If the browser language is not Greek and the visitor lands on `/`, the `EN` label may gently pulse once (opacity 40%→100%→40%, 1.2 s) as a hint. That's all.
- **Tap target:** each label has an invisible 48×48 px hit area.
- **Accessibility:** `<nav aria-label="Language">`, each link has `hreflang` and `lang` attributes, and the active one has `aria-current="true"`.
- On the hero, the switcher must never overlap the logo's dodge area. The dodge clamping in §4.2 treats the switcher's box as an extra no-go zone.

### 3.2 Translated interface strings

All strings live in `src/i18n/strings.ts`. Nothing is hard-coded in components.

| Key | Ελληνικά | English |
|---|---|---|
| slogan | I shoot. You smile. | I shoot. You smile. |
| timelineHeading | Η ΙΣΤΟΡΙΑ | THE STORY |
| talkToMe | Μίλα μου | Talk to me |
| copied | Αντιγράφηκε | Copied |
| skipToContact | Μετάβαση στην επικοινωνία | Skip to contact |
| notFound | Χάθηκες; Πάμε σπίτι. | Lost? Let's go home. |
| privacy | Απόρρητο | Privacy |
| playVideo | Αναπαραγωγή βίντεο | Play video |
| close | Κλείσιμο | Close |

**Approved by the owner**, including "Μίλα μου".

---

## 4. Section 1: Hero (white)

### 4.1 Layout

- Height: `100svh`, with a `100vh` fallback. Use `svh`, not `vh`, so mobile browser toolbars don't cause a jump. Width: 100%.
- Background: `--white`.
- Logo: horizontally and vertically centred. Size: `width: clamp(160px, 38vmin, 440px)`. Keep the aspect ratio.
- **Slogan** "I shoot. You smile.": hidden by default (`opacity: 0`). It sits **exactly at the logo's original centre** and is revealed when the logo moves away.
- **Scroll cue:** a 1 px × 48 px black hairline at the bottom centre, 24 px above the bottom safe area. A short segment travels down it in a loop (2.4 s, ease-in-out). It fades out once the user scrolls more than 40 px. It must not look like a "scroll down" arrow button.
- Respect `env(safe-area-inset-*)` on notched devices.
- The logo is the **`<h1>`** of the page: `<h1><img alt="PAPAFIOGOS" …></h1>`, or an inline SVG with `<title>PAPAFIOGOS</title>`.

### 4.2 Desktop interaction (devices matching `(hover: hover) and (pointer: fine)`)

**The idea:** the logo is shy. When the cursor comes close, it slides away to a nearby random spot and reveals the slogan underneath. When the cursor leaves, the logo comes home.

**Behaviour:**

1. **Trigger zone:** the logo's bounding box plus 24 px padding. Call this the *home zone*. It is fixed at the logo's **original** position.
2. **On pointer entering the home zone:**
   - Compute the vector from the pointer to the logo centre. The logo moves **away from the pointer** along this vector, with a random angular jitter of **±35°**.
   - Travel distance is random in **[14vmin, 24vmin]** ("not too far").
   - Clamp the destination so the whole logo stays inside the viewport with a 24 px margin. If clamping would cut the distance below 10vmin, mirror the angle and try again (max 4 attempts).
   - Add a small random rotation in **[-6°, +6°]**.
   - Animate with a **spring** (stiffness about 180, damping about 18, mass 1). It should feel physical, with a slight overshoot and no linear easing.
   - At the same time, fade the **slogan** in at the home position: opacity 0→1 and translateY 8px→0 over 380 ms, `cubic-bezier(.2,.7,.2,1)`, starting 80 ms after the logo starts moving.
3. **If the pointer chases the logo** to its new position (enters the logo's *current* box + 16 px), it dodges again: a new random destination using the same rules, measured from the original centre so it never wanders off. Cooldown is 250 ms between dodges.
4. **Return:** when the pointer is outside the home zone (plus a 40 px hysteresis margin) **and** not over the logo, for **≥ 600 ms**, or when the pointer leaves the window or the hero section:
   - The slogan fades out (240 ms).
   - The logo springs back to (0, 0) with rotation 0.
5. Use only `transform` and `opacity`, so nothing triggers layout. Pointer handling uses `pointermove` throttled to `requestAnimationFrame`.

### 4.3 Mobile and touch interaction (`(hover: none)` or `(pointer: coarse)`)

The same effect, triggered by a **tap** on the logo.

1. **Tap the logo:** it hops away exactly as in §4.2, but the direction is fully random (there is no pointer vector), and the slogan appears. On Android, trigger a 10 ms haptic tick (`navigator.vibrate?.(10)`). Do nothing on iOS.
2. **Return:** tap anywhere (including the logo or the slogan), or wait **3.5 s** with no interaction, or scroll past 40 px. The logo springs home and the slogan fades.
3. Tapping again after it returns repeats the effect with a new random destination.

#### 4.3.1 Making the logo irresistible to tap (the "instinct" requirement)

People must tap the logo without being told to. **Never use text such as "tap me"** or a pointing-hand icon. Use these subtle, alive cues, in combination:

| Cue | Spec |
|---|---|
| **Breathing** | The logo gently scales 1.000 → 1.025 → 1.000 on a 3.2 s loop, ease-in-out. It reads as "alive". |
| **Ripple ring** | Every 3.2 s, in sync with the breath peak, a single 1 px black ring expands from the logo's outline (scale 1 → 1.35, opacity 0.18 → 0, 1.4 s). This is the universal "touch here" signal, borrowed from radar and record buttons. |
| **Curious nudge** | If there has been no interaction **2.5 s after load**, and then every 7 s, the logo makes a tiny playful hop: translateY -6px, rotate 2°, back again in 450 ms, like something waiting to be poked. |
| **Press feedback** | On `pointerdown`, the logo scales to 0.94 within 90 ms (tactile squish), then hops away on release. |
| **Stop hinting** | Once the user has tapped the logo once, breathing continues but the ripple and nudge stop for the session (`sessionStorage`). |

The ripple ring is a pseudo-element following the logo's shape. If the logo isn't circular, use a circle sized to the logo's larger side × 0.9. The **owner must review the hinting cues** on a real phone and tune their intensity in `site.ts`.

Desktop also gets the breathing (no ripple or nudge), so the logo never looks static.

### 4.4 Keyboard and accessibility

- The logo wrapper is a `<button type="button" aria-describedby="slogan">`. Enter or Space triggers the mobile behaviour (§4.3).
- The slogan is always present in the DOM, so screen readers and search engines read it. It is only visually hidden until revealed.
- **`prefers-reduced-motion: reduce`:** no movement, breathing, ripple or nudge. Hover, focus or tap crossfades the logo to 15% opacity and fades the slogan in over it. Returning reverses this.
- A visible focus ring: 2 px black outline, 6 px offset, `:focus-visible` only.

---

## 5. Section 2: Timeline (black)

### 5.1 Purpose

This section tells the PAPAFIOGOS story, from the moment the first camera was touched until today, in chronological order (oldest at top). It is the only content-rich part of the site.

### 5.2 Transition from hero

- The hero and the timeline meet with a hard edge, white to black, with no gradient. A hard cut feels more confident and editorial.
- An optional section heading at the top of the timeline is a single small uppercase line, "Η ΙΣΤΟΡΙΑ" / "THE STORY" (`--paper-70`, letter-spacing 0.3em), centred. **[OWNER INPUT]**: keep it, change it, or remove it. Configure it in `strings.ts`.

### 5.3 Layout: desktop and tablet (≥ 768 px)

```
                     │
   [ media ]    ●────┤ 2009
   2009              │
   First camera      │
   short text…       │
                     │────●   [ media ]
                     │        2012
                     │        Title
                     │        text…
```

- A 1 px vertical **centre line** in `--paper-25`, running the whole height of the section.
- **Progress fill:** a white (`--white`) overlay on the line grows from the top as the user scrolls, so the line "draws itself" up to the viewport centre. Use a CSS scroll-driven animation (`animation-timeline: view()`) where supported, with a JS rAF fallback.
- Entries **alternate** left and right. Each entry has:
  - A **dot** on the line (8 px white circle with a 1 px `--paper-25` ring), aligned with the entry's year.
  - The **year/date label**, small uppercase, `--paper-70`.
  - A **title** in white.
  - **Text**: 1 to 3 short sentences, `--paper-70`, max 42ch.
  - **Media** (optional, see §5.6).
- Each side is about 42% wide with a 4% gutter to the line. Maximum content width is 1200 px, centred.
- Spacing between entries is fluid: `clamp(4rem, 10vh, 9rem)`.

### 5.4 Layout: mobile (< 768 px)

- The line moves to the **left**: 20 px from the left edge plus the safe-area inset.
- **All entries stack on the right side of the line**, full remaining width.
- Media goes full width of the content column, above the text.
- The dot stays aligned with the year label.

### 5.5 Motion

- Each entry reveals once as it enters the viewport (IntersectionObserver, threshold 0.2): opacity 0→1 and translateY 24px→0 over 600 ms. Media follows 100 ms after the text. Entries on the left slide in from slightly left (−16 px), entries on the right from slightly right.
- The dot "pops" (scale 0→1, 300 ms, slight overshoot) as its entry appears.
- No parallax and no scroll-jacking. Scrolling must always feel native.
- `prefers-reduced-motion`: everything is visible immediately, with no transforms.

### 5.6 Media rules

| Type | Behaviour |
|---|---|
| **Single image** | Responsive `<picture>` with AVIF, then WebP, then JPEG. `srcset` widths 480/768/1080/1600/2200. Correct `sizes`. `loading="lazy"` and `decoding="async"` on all except the first timeline image. Explicit `width`/`height` to prevent layout shift. A blurred tiny placeholder (LQIP, ≤ 1 KB inline) fades into the full image. |
| **Up to 3 images** | Shown as an asymmetric mini-grid (one large, two small). Tapping or clicking any image opens the lightbox (§5.7). |
| **Short video clip (≤ 20 s)** | Self-hosted. `muted autoplay loop playsinline`, with a `poster` image. Plays only while ≥ 50% visible (IntersectionObserver) and pauses otherwise. `preload="none"`. Encode as H.264 MP4 (≤ 4 MB) and optionally AV1/WebM. No controls visible; a tiny mute toggle appears on hover or tap only if the clip has meaningful audio. |
| **Long video (> 20 s)** | Hosted on YouTube or Vimeo. Shown as a **facade**: the poster image plus a minimal white play glyph. The heavy iframe loads **only on click** (privacy-enhanced mode: `youtube-nocookie.com` or `dnt=1` for Vimeo). |

Corners on all media are square, or at most 2 px radius. Do not use frames, borders or shadows.

### 5.7 Lightbox

- Full-screen black overlay. The image is centred with `object-fit: contain`.
- Close with ×, Esc, a tap on the backdrop or swipe-down on mobile. Navigate with arrows, swipe or the keyboard.
- Hand-built (no library), or use a library under 5 KB gzipped. The page must not scroll underneath while the lightbox is open. Focus is trapped while open and returned to the trigger on close.

### 5.8 Content management: one JSON file (the owner must be able to do this easily, at any time)

**Owner requirement:** the owner has **no timeline content yet**. The site must launch with **zero entries** and look intentional. Moments are added (and removed) later, whenever the owner wants, without a developer.

**Mechanism: one JSON file plus one media folder.**

```
src/content/timeline/
├── timeline.json          ← THE ONLY FILE THE OWNER EDITS
├── timeline.example.json  ← a filled-in example to copy from (never shown on the site)
└── media/                 ← drop photos and videos here
    ├── 2009-first-camera.jpg
    ├── 2014-wedding-1.jpg
    ├── 2024-island-clip.mp4
    └── 2024-island-poster.jpg
```

At launch, `timeline.json` contains just an empty list:

```json
[]
```

**One moment** looks like this. Both languages sit side by side; copy, paste and change the values:

```json
[
  {
    "date": "2009-06",
    "label": { "el": "Καλοκαίρι 2009", "en": "Summer 2009" },
    "title": { "el": "Η πρώτη κάμερα", "en": "The first camera" },
    "text":  { "el": "Ο θείος μου μου έδωσε την παλιά του κάμερα «μόνο για το Σαββατοκύριακο». Δεν του την επέστρεψα ποτέ.",
               "en": "My uncle handed me his old camera \"just for the weekend\". I never gave it back." },
    "media": [
      { "photo": "2009-first-camera.jpg",
        "alt": { "el": "Έφηβος με μια δανεική κάμερα", "en": "Teenage me with a borrowed camera" } }
    ],
    "hidden": false
  },
  {
    "date": "2024-08",
    "title": { "el": "Νησί", "en": "Island" },
    "text":  { "el": "Μια εβδομάδα, μια βάρκα, μια κάμερα.", "en": "One week, one boat, one camera." },
    "media": [
      { "video": "2024-island-clip.mp4", "poster": "2024-island-poster.jpg",
        "alt": { "el": "Πίσω από τις κάμερες στο νησί", "en": "Behind the scenes on the island" } }
    ]
  }
]
```

**Field reference** (also written in plain words in the README):

| Field | Required | Meaning |
|---|---|---|
| `date` | yes | `"2009"`, `"2009-06"` or `"2009-06-15"`. Used for sorting and shown as the year. |
| `label` | no | Text shown instead of the year, e.g. "Summer 2009". |
| `title` | yes (at least one language) | Short title. |
| `text` | no | 1–3 sentences, up to 400 characters per language. |
| `media` | no | Up to **3 photos**, OR **1 video**, OR **1 YouTube/Vimeo link**. |
| `media[].photo` | | A file name in `media/`. Any size, straight from the camera. |
| `media[].video` + `poster` | | A short MP4 (≤ 20 s, ≤ 4 MB) in `media/`, plus a still image for its cover. |
| `media[].youtube` or `vimeo` + `poster` | | Video ID for long videos (§5.6). |
| `media[].alt` | yes, for every media item | Describes the photo or video (accessibility and Google). |
| `hidden` | no | `true` hides the moment without deleting it. |

Moments can be written in **any order** in the file. The site sorts them by `date` automatically, oldest first (configurable in `site.ts`: `timeline.order`).

**Language fallback:** if only one language is filled in (e.g. just `el`), the other language's page shows that text instead of a blank, and the build prints a friendly warning listing untranslated moments.

**Implementation requirements (for the AI builder):**
- Load the file with an Astro content collection using the `file()` loader and a Zod schema. Resolve `photo` and `poster` names against `src/content/timeline/media/`, and run them through `astro:assets` so they are **resized, converted to AVIF/WebP and lazy-loaded** exactly as in §5.6. Use the `image()` schema helper if it resolves these paths. If not, use an `import.meta.glob('./media/*')` lookup. Either way the owner only ever types a **file name**.
- Copy videos to the output as-is, with hashed URLs.
- **Friendly validation:** the build must fail with a clear, plain-language message (in Greek and English) for:
  - broken JSON (show the line number, e.g. "Line 14: missing comma after the previous moment")
  - a missing `date` or `title`
  - a missing `alt`
  - a file name in `media` that doesn't exist in the `media/` folder ("Photo '2009-camra.jpg' not found. Did you mean '2009-camera.jpg'?")

  A failed build never takes the live site down: Cloudflare Pages keeps the last good version online.
- Media files not referenced by any moment are ignored. Leaving them in the folder is harmless.

**Empty and near-empty timeline (launch state):**
- With **0 moments**, the black section still appears, at exactly one screen tall (`100svh`). It shows the centre line with a dot at the top labelled **"2009"** and a dot at the bottom labelled **"Σήμερα / Today"**, and between them, centred on the line, one quiet sentence: **"Η ιστορία γράφεται. / The story is being written."** (`--paper-70`). This keeps the white, black, white rhythm and looks deliberate, not broken.
- With **1–2 moments**, the same 2009 → Today bookends frame them. The section's minimum height stays `100svh`.
- The "2009" and "Today" bookends are **always shown** (config `timeline.bookends: true`), so the story always reads as "from the first camera until now". **Wording approved by the owner.**

**Owner workflows** (step by step in the README):
- **Add a moment:** (1) upload the photo or video into `media/`, (2) open `timeline.json`, copy an existing moment (or one from `timeline.example.json`), paste it, change the texts and file name, (3) save. The site is live with the new moment in about 1 minute.
- **Remove a moment:** delete its `{ … }` block from `timeline.json`, or set `"hidden": true` to keep it for later.
- **Edit a moment:** change the text in `timeline.json` and save.
- All of this can be done on **github.com in a browser**, with no software to install. Upload files with "Add file → Upload files" and edit the JSON with the pencil icon.

**Required (phase 4, confirmed by the owner): Pages CMS, a form-based editor on top of the same JSON file.** Configure Pages CMS (pagescms.org, free, no server, works on a phone) with a `.pages.yml` that maps `timeline.json` to a form with the fields above and media uploads into `media/`. The owner then just fills in a form and taps "Save", and never sees JSON or risks a missing comma. The JSON file stays the single source of truth, so the two methods can be mixed freely. Do **not** add a database or a server-side CMS.

---

## 6. Section 3: Contact (white)

### 6.1 Layout

- Height: `100svh`. Background `--white`. Hard edge from black.
- Centred, a single large phrase: **"Μίλα μου"** (el) / **"Talk to me"** (en) (§2.3 size, black, weight 500).
- It is a real `<button>`, but styled as text. On hover (desktop), a 1 px underline draws from left to right (300 ms). It has the same breathing cue as the logo, at half intensity (scale 1.0 → 1.012), so it too invites a click.
- Footer at the bottom of this section: `© 2026 PAPAFIOGOS` in tiny type, `--ink-70`. The year is computed at build time.

### 6.2 Interaction

On click, tap, Enter or Space:

1. "Talk to me" moves up by about 12vh and scales to 0.6 (500 ms, spring).
2. Three contact items appear beneath it, **staggered 80 ms apart** (opacity 0→1, translateY 12px→0):

| Icon | Text | Action |
|---|---|---|
| Instagram glyph | `@papafiogos` | Opens `https://instagram.com/papafiogos` in a new tab (`rel="noopener"`). On mobile this opens the Instagram app. |
| Envelope glyph | `papafiogos@gmail.com` (later `info@papafiogos.gr`) | `mailto:` + `site.contact.email` |
| Phone glyph | `+30 697 895 4464` | `tel:+306978954464` |

The contact items are identical in both languages; only "Μίλα μου" / "Talk to me" and the "Copied" toast change.

- **Icons:** hand-drawn inline SVG, 1.5 px stroke, 22 px, monochrome black, matching style (thin outline, rounded caps). No icon fonts and no coloured brand logos. The Instagram glyph must be the simple outline version.
- **Layout:** a horizontal row with 48 px gaps on screens ≥ 640 px, and a vertical stack on smaller screens. Each item is icon plus text, and the whole item is the tap target (minimum 48 × 48 px).
- **Hover:** the text gets an underline and the icon nudges up 2 px.
- **Copy to clipboard:** long-press on mobile, or a small secondary click on desktop, copies the email or phone number and shows a 1.2 s toast reading "Copied". *Optional, nice-to-have.*
- Clicking "Talk to me" again collapses the items back.
- **No-JS fallback:** the three items are visible by default and JS hides them on load. Contact must never be impossible.
- **Spam protection:** the email and phone are assembled in JS from split parts at runtime, with a `<noscript>` plain version. JSON-LD (§8) still includes them for search engines.

### 6.3 What is *not* included

There is no contact form, map, WhatsApp button or newsletter. The owner may ask later for a WhatsApp link as a fourth item; design the component to accept N items from `site.ts`.

---

## 7. Technical architecture

### 7.1 Stack (required)

| Concern | Choice | Why |
|---|---|---|
| Framework | **Astro (latest stable, v5+)**, static output (`output: 'static'`) | Ships zero JS by default. Every page is pre-rendered HTML, which is best for SEO and speed. Content collections give the type-safe Markdown timeline. Built-in image optimisation. |
| Language | TypeScript (strict) | |
| Styling | Plain modern CSS: one global file with tokens plus component-scoped `<style>` in `.astro` files. Native CSS nesting, `clamp()`, container queries where useful. | No framework overhead and no "template look". |
| Interactivity | **Vanilla TypeScript** in small `<script>` modules. A tiny hand-written spring (about 40 lines) for the logo. | Total JS budget ≤ 15 KB gzipped. No React, Vue, GSAP or Framer. |
| Images | `astro:assets` (`<Picture>`) with Sharp: AVIF, WebP and JPEG, responsive widths, LQIP | Automatic, at build time. The owner uploads originals. |
| Video | Self-hosted MP4 for short clips. YouTube/Vimeo facade for long ones. | |
| Fonts | Self-hosted WOFF2 variable font, subset | No Google Fonts requests (GDPR and speed). |
| Hosting | **Cloudflare Pages** (free tier) | Global CDN, HTTP/3, free SSL, automatic deploys from GitHub, preview URLs per branch. Netlify or Vercel are acceptable alternatives. |
| Source control | GitHub repository `papafiogos-site` (private) | |
| Analytics | **Cloudflare Web Analytics** (cookieless) | No cookie banner needed under GDPR, and it is free. |
| Linting/format | ESLint + Prettier + `astro check` | |
| Testing | Playwright (viewport and interaction tests) + Lighthouse CI | |

### 7.2 Project structure

```
papafiogos-site/
├── public/
│   ├── favicon.svg, favicon.ico, apple-touch-icon.png
│   ├── og-image.jpg                (1200×630, logo on white)
│   ├── robots.txt
│   └── _headers                    (Cloudflare caching & security headers)
├── src/
│   ├── assets/brand/               (logo.svg, logo-white.svg, logo.png)
│   ├── config/site.ts              (ALL tunables + contact details + texts)
│   ├── content/
│   │   ├── config.ts               (Zod schema for timeline)
│   │   └── timeline/
│   │       ├── timeline.json          (owner edits this, starts as [])
│   │       ├── timeline.example.json  (copy-from examples, not rendered)
│   │       └── media/                 (photos + videos)
│   ├── components/
│   │   ├── Hero.astro
│   │   ├── EvasiveLogo.astro       (+ evasive-logo.ts)
│   │   ├── Timeline.astro
│   │   ├── TimelineEntry.astro
│   │   ├── TimelineMedia.astro
│   │   ├── Lightbox.astro
│   │   ├── Contact.astro
│   │   ├── ContactItem.astro
│   │   ├── Icon.astro              (inline SVG icons)
│   │   └── Seo.astro               (meta, OG, JSON-LD)
│   ├── lib/spring.ts
│   ├── components/LangSwitch.astro
│   ├── i18n/strings.ts             (all UI text, el + en — see §3.2)
│   ├── i18n/utils.ts               (t(), localized URL helpers, fallback)
│   ├── layouts/Base.astro
│   ├── pages/index.astro           (Greek, default)
│   ├── pages/en/index.astro        (English)
│   ├── pages/404.astro
│   └── styles/global.css           (reset, tokens, fonts)
├── tests/                          (Playwright)
├── README.md                       (owner guide — see §7.4)
└── astro.config.mjs
```

### 7.3 `site.ts` (single source of tunables)

It must contain at least:

```ts
export const site = {
  name: 'PAPAFIOGOS',
  url: 'https://papafiogos.gr',
  slogan: 'I shoot. You smile.',     // same on el + en, never translated
  description: { el: '…', en: '…' }, // [OWNER INPUT] ~150 chars each, see §8
  locales: ['el', 'en'],
  defaultLocale: 'el',              // served at "/"; English at "/en/"
  contact: {
    instagram: 'papafiogos',
    email: 'papafiogos@gmail.com',  // TEMPORARY → change to 'info@papafiogos.gr' once Zoho is set up (§11.3)
    phone: '+30 697 895 4464',      // displayed
    phoneHref: '+306978954464',     // used in tel:
  },
  timeline: { order: 'oldest-first', bookends: true, startYear: 2009 },
  logo: {
    sizeClamp: 'clamp(160px, 38vmin, 440px)',
    dodgeDistanceVmin: [14, 24],
    dodgeAngleJitterDeg: 35,
    dodgeRotateDeg: 6,
    spring: { stiffness: 180, damping: 18, mass: 1 },
    returnDelayMs: 600,
    mobileAutoReturnMs: 3500,
    breathe: { scale: 1.025, periodMs: 3200 },
    ripple: { enabled: true, maxScale: 1.35, opacity: 0.18 },
    nudge: { firstAfterMs: 2500, everyMs: 7000 },
  },
};
```

### 7.4 README: the owner guide

Write the README for a **non-developer**. It must cover:
1. How to add, edit, hide or remove a timeline moment in `timeline.json`, step by step (github.com in a browser, and Pages CMS if enabled), with a copy-paste template and a short "common JSON mistakes" list (missing comma, missing quote, file name typo).
2. How to change contact details (`site.ts`) and texts in both languages (`strings.ts`, and the `el`/`en` fields in timeline entries).
3. How to preview locally (`npm install`, `npm run dev`).
4. How deployment works (push to `main` publishes the site; any other branch gives a preview URL).
5. Photo and video tips: export videos as MP4 H.264, keep clips ≤ 20 s and ≤ 4 MB (with an example HandBrake preset); photos can be the original JPEGs.
6. "Content to provide": the list of all **[OWNER INPUT]** items.

---

## 8. SEO

### 8.1 On-page

- Everything is server-rendered static HTML, and all text is present in the HTML (not injected by JS).
- `<title>` (both languages): `PAPAFIOGOS — I shoot. You smile.`
- `<meta name="description">` per language **[OWNER INPUT]**, 140–160 characters each. Suggested drafts:
  - el: "Παπαφιόγκος: φωτογραφία, βίντεο και περιεχόμενο που σε κάνει να χαμογελάς. Από την Πάτρα, από το 2009. Μίλα μου."
  - en: "PAPAFIOGOS: photography, video and content that makes you smile. Based in Patras, Greece, since 2009. Let's talk."
  - **[OWNER INPUT]**: the year you started.
- A self-referencing canonical URL per language, `<html lang="el">` or `<html lang="en">`, and `theme-color` (#ffffff).
- Heading hierarchy: `h1` = logo (alt "PAPAFIOGOS"), `h2` = "Η ιστορία"/"The story" (can be visually hidden if the heading is removed), `h3` = each timeline title, `h2` = "Μίλα μου"/"Talk to me".
- Every image has meaningful `alt` text, which the schema enforces.
- Descriptive image file names are generated from the entry slug.

### 8.2 Structured data (JSON-LD)

- `Person` (name PAPAFIOGOS, url, image, `sameAs: [instagram URL]`, `jobTitle` omitted on purpose, which fits the brand philosophy, `email`, `telephone`).
- `WebSite` (name, url).
- `alternateName` on `Person`: `["Παπαφιόγκος", "Papafiogos", "ΠΑΠΑ ΦΙΟΓΚΟΣ"]`.
- `ProfessionalService` with `address: { addressLocality: "Patras" / "Πάτρα", addressRegion: "Western Greece" / "Δυτική Ελλάδα", addressCountry: "GR" }` and `areaServed: ["Patras", "Greece"]`, for local search. Don't publish a street address.
- Each timeline video: `VideoObject` (name, description, thumbnailUrl, uploadDate, contentUrl/embedUrl).

### 8.3 Social sharing

- Open Graph and Twitter card: title, description, `og:image` 1200×630 (logo centred on white, generated at build or hand-made), `og:url`, `og:type=website`, `og:locale` (`el_GR` or `en_US`) plus `og:locale:alternate`.
- Must preview correctly in Instagram DMs, WhatsApp, Viber, Facebook, LinkedIn and iMessage.

### 8.4 Language (bilingual SEO)

- **Greek is the default** at `/` (a `.gr` domain with a mainly Greek local audience). **English** is at `/en/`. Use Astro's built-in i18n routing (`i18n: { defaultLocale: 'el', locales: ['el','en'], routing: { prefixDefaultLocale: false } }`).
- Both pages carry `hreflang` alternates: `<link rel="alternate" hreflang="el" href="https://papafiogos.gr/">`, `hreflang="en"` → `/en/`, and `hreflang="x-default"` → `/`.
- The sitemap lists both URLs with their alternates.
- There are no IP- or browser-based redirects (§3.1). Search engines and people always get the URL they asked for.
- JSON-LD `inLanguage` is set per page.
- The font subset must include Greek glyphs, including accented/tonos characters (ά έ ή ί ό ύ ώ ϊ ΐ ϋ ΰ). Test uppercase Greek: CSS `text-transform: uppercase` must drop tonos correctly. Set `lang="el"` so browsers do this. Verify the "Η ΙΣΤΟΡΙΑ" heading renders without accents.

### 8.5 Technical SEO

- `sitemap.xml` (via `@astrojs/sitemap`) and `robots.txt`.
- HTTPS only, `www.` → apex redirect (or the reverse; pick one).
- If papafiogos.com is also bought, redirect it 301 to papafiogos.gr.
- After launch: verify in **Google Search Console** and **Bing Webmaster Tools**, and submit the sitemap.
- Create or claim a **Google Business Profile** for local discoverability (owner task, out of scope for code).

---

## 9. Performance, responsiveness and quality

### 9.1 Performance budgets (must pass on mid-range Android over throttled 4G)

| Metric | Target |
|---|---|
| Lighthouse (mobile): Performance / Accessibility / Best Practices / SEO | **≥ 95 / 100 / 100 / 100** |
| LCP (Largest Contentful Paint) | **< 1.5 s** (the logo is the LCP element: inline SVG or preloaded) |
| CLS | **< 0.02** |
| INP | **< 100 ms** |
| First-load transfer (HTML+CSS+JS+font+logo) | **< 120 KB** |
| JS shipped | **≤ 15 KB gzipped** total |
| Timeline images | Lazy-loaded. None downloaded until near the viewport (except the first). |

### 9.2 Caching headers (`public/_headers`)

- Hashed assets (`/_astro/*`): `Cache-Control: public, max-age=31536000, immutable`.
- HTML: `Cache-Control: public, max-age=0, must-revalidate`.
- Security headers: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (deny camera, mic and geolocation), and a strict `Content-Security-Policy` that allows self, Cloudflare analytics and YouTube/Vimeo frames.

### 9.3 Responsive test matrix (**critical: test every single one**)

| Class | Viewports (CSS px) | Orientation |
|---|---|---|
| Small phone | 320×568 (iPhone SE 1st gen), 360×640 | portrait + landscape |
| Phone | 375×667, 390×844, 393×852, 412×915 | portrait + landscape |
| Large phone | 430×932 | portrait + landscape |
| Foldable | 280×653 (folded), 717×512 (unfolded) | both |
| Tablet | 768×1024, 820×1180, 1024×1366 | both |
| Laptop | 1280×800, 1366×768, 1440×900 | landscape |
| Desktop | 1920×1080, 2560×1440 | landscape |
| Ultra-wide / 4K | 3440×1440, 3840×2160 | landscape |
| Short landscape | 844×390 (phone landscape) | The hero logo must still fit. Size it by `vmin`. |

Also test:
- Real devices: iOS Safari (latest and latest−1), Android Chrome, Samsung Internet, desktop Chrome, Firefox, Safari and Edge.
- Browser zoom 200% and OS text size "largest". Nothing may overlap or be clipped.
- Dark mode OS setting: the site stays black & white as designed and must **not** auto-invert.
- iPad with mouse/trackpad: the hover path (§4.2) must activate, because the media query detects a fine pointer.
- Touch laptops: both hover and tap must work.
- Slow 3G, to check that the LQIP placeholders appear and nothing jumps.
- JS disabled: hero shows the logo, the timeline is fully readable, and contact items are visible.

### 9.4 Accessibility (WCAG 2.2 AA)

- Black on white and white on black give a 21:1 contrast ratio. Secondary tones must stay ≥ 4.5:1.
- All interactive elements are keyboard reachable, have visible focus and are ≥ 48×48 px on touch.
- `prefers-reduced-motion` is honoured everywhere (§4.4, §5.5).
- Use semantic landmarks: `<header>` (hero), `<main>`, `<section aria-labelledby>` and `<footer>`.
- Add a "Skip to contact" link that is visually hidden until focused.

### 9.5 Privacy and legal (EU/GDPR)

- No cookies and no third-party trackers. Cloudflare Web Analytics is cookieless, so **no cookie banner is needed**.
- Video embeds use privacy-enhanced domains and load only on click.
- Fonts are self-hosted, so the site makes no Google Fonts requests.
- A tiny "Privacy" link in the footer opens a short static `/privacy` page **[OWNER INPUT for final text]** stating that no personal data is collected. This is optional but recommended.

---

## 10. Motion summary (single reference)

| Element | Trigger | Animation | Duration / curve |
|---|---|---|---|
| Logo breathe | always (unless reduced motion) | scale 1→1.025→1 | 3.2 s loop, ease-in-out |
| Logo ripple | touch devices, until first tap | ring scale 1→1.35, opacity .18→0 | 1.4 s, every 3.2 s |
| Logo nudge | touch, idle | translateY −6px, rotate 2° | 450 ms, at 2.5 s then every 7 s |
| Logo dodge | hover (desktop) or tap (mobile) | translate 14–24vmin, rotate ±6° | spring 180/18/1 |
| Logo return | pointer gone ≥ 600 ms or tap or 3.5 s | back to origin | same spring |
| Slogan in/out | with dodge/return | opacity + translateY 8px | 380 ms in / 240 ms out |
| Scroll cue | until scroll > 40 px | segment travels down hairline | 2.4 s loop |
| Timeline line fill | scroll | scaleY of white overlay | scroll-linked |
| Timeline entry | enters viewport | opacity + translate 24px | 600 ms, cubic-bezier(.2,.7,.2,1) |
| Timeline dot | with entry | scale 0→1 | 300 ms, slight overshoot |
| "Talk to me" breathe | always | scale 1→1.012 | 3.2 s loop |
| "Talk to me" open | click | move up 12vh, scale .6 | spring |
| Contact items | after open | stagger 80 ms, opacity + translateY 12px | 400 ms each |

All animations use `transform` and `opacity` only.

---

## 11. Domain and email setup (owner + AI-assisted)

> **Plan:** the business address will be `info@papafiogos.gr`. **Until it is created, the site shows `papafiogos@gmail.com`.** Optionally also buy **papafiogos.com** defensively and redirect it to .gr.

### 11.1 Domain: done ✓

1. **papafiogos.gr is registered** by the owner (2026-11-12). **Turn on auto-renew** at the registrar now, because an expired .gr is painful to recover.
2. papafiogos.com was **not** bought. Optional later. If it's added, follow §11.2 step 4 to redirect it.

### 11.2 Move DNS to Cloudflare (free)

1. Create a free Cloudflare account and add the site `papafiogos.gr`.
2. At the Greek registrar, change the **nameservers** to the two Cloudflare nameservers it shows. Propagation takes up to 24 hours.
3. In Cloudflare Pages, connect the GitHub repo and add the custom domains `papafiogos.gr` and `www.papafiogos.gr`. Cloudflare creates the DNS records and SSL automatically.
4. *(Only if papafiogos.com is bought later)* Add it to Cloudflare too, with a **Redirect Rule** sending it 301 to `https://papafiogos.gr`.

### 11.3 Email: `info@papafiogos.gr` (free and simple, **later**, not a launch blocker)

**Status:** not created yet. The site launches with **papafiogos@gmail.com**. When the steps below are done, change `contact.email` in `site.ts` to `info@papafiogos.gr` and save. The site, JSON-LD and contact button all update automatically.

**Owner requirement:** as cheap as possible (ideally free) and extremely easy to use.

**Recommendation: Zoho Mail "Forever Free" plan.**
- **Cost:** €0. Up to 5 mailboxes, 5 GB each, 1 custom domain.
- **Ease of use:** a real `info@papafiogos.gr` mailbox (not a forward) that **sends and receives as info@**, with the free **Zoho Mail app** for iPhone and Android and webmail at mail.zoho.eu.
- **Limits of the free plan:** no IMAP/POP, so it **cannot be added to the Gmail or Apple Mail apps**; use the Zoho Mail app instead. Attachments are limited to about 25 MB (send big video files with a WeTransfer/Drive link anyway).
- **Upgrade path:** if the owner later wants it inside Gmail or Apple Mail, upgrade to **Zoho Mail Lite (~€1/month)**. Nothing else changes.
- **Sign up on the EU data centre** (zoho.eu), which is better for GDPR.
- Zoho changes its free-plan terms from time to time. **Check at sign-up** that the Forever Free plan is offered (it is usually listed at the bottom of the pricing page as "Forever Free Plan"). If it isn't, take Mail Lite at ~€1/month.

**Other options considered:**

| Option | Cost | Why not chosen |
|---|---|---|
| Cloudflare Email Routing (forward info@ to the owner's personal Gmail) | Free | Receiving is very easy, but **replying "as" info@ is fiddly** to set up, and those replies often land in spam because they don't pass the domain's security checks. OK as a stop-gap, not as the business address. |
| Google Workspace | ~€7/month | Best overall, but not cheap. |
| Email from the Greek registrar (e.g. papaki.gr packages) | ~€2–5/month | Usually tied to a hosting plan, and the webmail and apps are clunkier. |

**Setup steps (about 20 minutes; the assistant can guide each one live):**
1. Sign up at zoho.eu → Mail → Forever Free → "Sign up with a domain I already own" → `papafiogos.gr`.
2. **Verify the domain:** Zoho shows a TXT record. Add it in Cloudflare DNS, then click Verify.
3. Create the mailbox **info@papafiogos.gr**.
4. **MX records** (in Cloudflare DNS, *DNS only* / grey cloud): `mx.zoho.eu` priority 10, `mx2.zoho.eu` priority 20, `mx3.zoho.eu` priority 50. Use the exact values Zoho shows.
5. **SPF:** TXT `@` → `v=spf1 include:zoho.eu ~all`
6. **DKIM:** Zoho admin → Domains → Email configuration → DKIM → generate, and add the TXT record it shows.
7. **DMARC:** TXT `_dmarc` → `v=DMARC1; p=none; rua=mailto:info@papafiogos.gr`. After 2–4 clean weeks, change it to `p=quarantine`.
8. **Test:** send to and from a Gmail and an Outlook address. Use mail-tester.com and aim for 10/10.
9. Install the **Zoho Mail** app on the phone, log in, and set a minimal signature: `PAPAFIOGOS · papafiogos.gr · @papafiogos · +30 697 895 4464`.
10. Optional free aliases: `hello@`, `bookings@` → delivered to info@.

---

## 12. Acceptance criteria

The site is **done** when all of the following are true:

**Hero**
- [ ] The white screen fills exactly one viewport on every device in §9.3, with no scrollbar jump on mobile.
- [ ] On desktop, hovering the logo makes it slide away (spring, random, ≤ 24vmin), and "I shoot. You smile." appears where it was.
- [ ] Moving the mouse away brings it back. Chasing it makes it dodge again but never leave the screen.
- [ ] On touch, tapping triggers the same effect. It returns on tap or after 3.5 s.
- [ ] On touch, the breathing, ripple and nudge cues are visible and stop after the first tap. 3 of 5 test users tap the logo within 10 s without being told.
- [ ] Keyboard and reduced-motion paths work.

**Timeline**
- [ ] Black section with a centre line on ≥ 768 px and a left line on < 768 px. Entries alternate on desktop.
- [ ] With `timeline.json` = `[]`, the black section shows the intentional empty state (§5.8): one screen tall, the 2009 → Today bookends, and the "story is being written" line.
- [ ] Adding a moment to `timeline.json` plus a photo in `media/` makes it appear after deploy. Removing it, or setting `"hidden": true`, makes it disappear. No code is touched.
- [ ] A JSON typo, missing `alt` or wrong file name fails the build with a plain-language message, and the live site stays up.
- [ ] A missing `alt` fails the build with a clear message.
- [ ] Images are served as AVIF/WebP at a size suited to the viewport, lazy-loaded and with no layout shift.
- [ ] Short videos autoplay muted only while visible. Long videos load the iframe only on click.

**Contact**
- [ ] The white screen shows "Talk to me". Clicking it reveals Instagram, email and phone with minimal icons.
- [ ] Each link opens the right app (Instagram app, mail client, dialer) on iOS and Android.
- [ ] Contact details are visible with JS disabled.

**Languages**
- [ ] `/` is Greek and `/en/` is English, and every UI string and timeline entry appears in the right language, with a fallback when a translation is missing.
- [ ] The `ΕΛ · EN` switcher is visible on every section (it inverts on black), keeps the visitor at the same section, works without JS, and never collides with the logo.
- [ ] `hreflang` alternates and `x-default` are present, and both URLs are in the sitemap.
- [ ] Greek text renders correctly (accents, uppercase without tonos) on every viewport.

**Quality**
- [ ] Lighthouse mobile ≥ 95/100/100/100. LCP < 1.5 s, CLS < 0.02, JS ≤ 15 KB gzipped.
- [ ] Playwright screenshot tests pass on every viewport in §9.3.
- [ ] Valid HTML, JSON-LD passes Google Rich Results Test, and the OG preview renders in WhatsApp and iMessage.
- [ ] Live on `https://papafiogos.gr` with HTTPS, `www` redirect, and .com → .gr redirect.
- [ ] The contact email shown (and in JSON-LD) comes only from `site.contact.email`, currently `papafiogos@gmail.com`. Changing that one line updates everything.
- [ ] *(Later, not a launch blocker)* `info@papafiogos.gr` sends and receives, with SPF, DKIM and DMARC passing, and `site.ts` is switched to it.

---

## 13. Build phases

| Phase | Scope | Output |
|---|---|---|
| **1. Foundation** | Astro project, tokens, font, layout, `site.ts`, the three empty full-screen sections in the right colours, SEO component, deploy pipeline to a Cloudflare Pages preview URL | Live skeleton URL |
| **2. Hero** | Evasive logo (desktop + touch + keyboard + reduced motion), slogan, hinting cues, scroll cue | Owner reviews the feel on their own phone and laptop, and the values are tuned |
| **3. Timeline** | Content collection + schema, layout (desktop/mobile), media handling, lightbox, reveal motion, line fill, empty state, `timeline.example.json` with 3 sample moments (used only for testing via a dev flag, never deployed) | Owner adds a test moment themselves using the README, then removes it |
| **4. Contact + polish** | Contact section, icons, 404, privacy page, `_headers`, analytics, OG image, favicon set, **Pages CMS** (`.pages.yml` + owner walkthrough in the README) | Full site on preview |
| **5. QA** | Full §9.3 matrix, Lighthouse CI, Playwright tests, accessibility audit | Test report |
| **6. Launch** | Domain + DNS + email (§11), custom domain on Pages, Search Console, sitemap submit | papafiogos.gr live |

---

## 14. Out of scope (v1)

Blog, e-shop, booking or calendar, contact form, client galleries or password areas, multi-page portfolio, newsletter, comments, chat widget, cookie banner (not needed), CMS with a database.

---

## 15. Open questions for the owner ([OWNER INPUT] checklist)

1. ~~Logo file~~: provided ✓. No vector original exists. Cleaned, shadow-free SVG and PNG files are in `Desktop/papafiogos-logo/` (§2.2).
2. ~~Instagram handle~~: **@papafiogos** ✓
3. ~~Phone number~~: **+30 697 895 4464** ✓
4. ~~Email~~: launch with **papafiogos@gmail.com** ✓. Create `info@papafiogos.gr` (Zoho) later and switch the one line in `site.ts`.
5. Also buy papafiogos.com as a redirect? *Deferred: the owner will decide later. Not needed for launch.*
6. ~~Site language~~: **Greek (default, `/`) + English (`/en/`)**, with the minimal `ΕΛ · EN` switcher ✓. Greek strings approved, "Μίλα μου" kept, and the slogan stays English on both sites ✓
7. Timeline heading: "Η ΙΣΤΟΡΙΑ / THE STORY", something else, or none?
8. Timeline order: oldest-first (default) or newest-first?
9. ~~City / start year~~: **Patras, since 2009** ✓
10. ~~Initial timeline content~~: *none at launch.* The site ships with an empty `timeline.json` and the empty state (§5.8). Moments are added later by the owner. Empty-state wording approved ✓
11. ~~Email provider~~: **Zoho Mail Forever Free** (fallback Mail Lite ~€1/month) ✓
12. ~~Pages CMS form editor~~: **confirmed, include it** ✓

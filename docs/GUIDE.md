# PAPAFIOGOS site: the complete guide

Everything you need to run, check, change and (later) publish the site, in one place.

- Short version: [`README.md`](../README.md)
- Running status and decisions: [`PROJECT-NOTES.md`](PROJECT-NOTES.md)
- Original design document: [`papafiogosPD.md`](papafiogosPD.md)

> **Local only.** The project lives on this computer at
> `C:\Users\aristidisk\Documents\papafiogos-site`. It is a git repository with **no remote**:
> nothing is on GitHub or the internet until you decide to go live (section 12).

---

## Contents

1. [What the site is](#1-what-the-site-is)
2. [One-time setup](#2-one-time-setup)
3. [Run the site on your computer](#3-run-the-site-on-your-computer)
4. [Test the phone experience](#4-test-the-phone-experience)
5. [Why the logo sometimes fades instead of jumping](#5-why-the-logo-sometimes-fades-instead-of-jumping)
6. [The timeline: texts and moments](#6-the-timeline-texts-and-moments)
7. [Timeline photos: the Polaroid prints](#7-timeline-photos-the-polaroid-prints)
8. [Your handwriting on the site](#8-your-handwriting-on-the-site)
9. [Other texts and settings](#9-other-texts-and-settings)
10. [Check before you save](#10-check-before-you-save)
11. [Save your work (git) and what's in the repo](#11-save-your-work-git-and-whats-in-the-repo)
12. [Going live (later)](#12-going-live-later)
13. [Troubleshooting](#13-troubleshooting)
14. [Map of the project](#14-map-of-the-project)

---

## 1. What the site is

One page, three screens, in **Greek** (`/`) and **English** (`/en/`):

| Screen | What happens |
|---|---|
| **1. The logo** (white) | The PAPAFIOGOS logo. Move the mouse onto it (or tap it on a phone) and it jumps away, revealing **"I shoot. You smile."** in your handwriting. It comes back home when you leave it alone. On phones it "breathes" and shows small tap hints. |
| **2. The story** (black) | The timeline: 8 moments from **2009** to **2026**, each with a black & white Polaroid print, ending at **Σήμερα / Today**. Photos fade in as you scroll; click one to see it full screen. |
| **3. Μίλα μου / Talk to me** (white) | Your handwriting. Click it and Instagram, email and phone appear. Email and phone are hidden from spam bots and can be copied with one click. Footer: © and the privacy page. |

Also: **ΕΛ · EN** language switch (top right), a **privacy page** (`/privacy/`, `/en/privacy/`),
a 404 page, search-engine data (title, description, sitemap, social preview image).

Built with **Astro** (a static-site generator). The result is plain HTML/CSS with ~5 KB of
JavaScript, very fast (Lighthouse 100/100/100/100).

---

## 2. One-time setup

Already done on this computer. Only needed on a new computer:

1. Install **Node.js 22 or newer** from <https://nodejs.org> (LTS version is fine).
2. Install **Git** from <https://git-scm.com> (needed to save versions).
3. Open a terminal **in the project folder** and run:
   ```bash
   npm install
   ```
   This downloads the tools the site needs into `node_modules/` (takes a minute).
4. Only for running the automatic tests the first time:
   ```bash
   npx playwright install chromium
   ```

> **Terminal:** in Windows, open the project folder in File Explorer, click the address bar,
> type `cmd` or `powershell` and press Enter. Or use the terminal in VS Code.

---

## 3. Run the site on your computer

### Live preview (use this while working)

```bash
npm run dev
```

Then open in your browser:

| Page | Address |
|---|---|
| Greek home | <http://localhost:4321/> |
| English home | <http://localhost:4321/en/> |
| Privacy (Greek / English) | <http://localhost:4321/privacy/> · <http://localhost:4321/en/privacy/> |
| A "not found" page | <http://localhost:4321/anything> |

- **Changes appear by themselves** when you save a file (texts, timeline, settings).
- If you make a mistake in `timeline.json`, the error appears in the browser and in the terminal,
  in Greek and English, with the line number.
- **Stop it:** click in the terminal and press **Ctrl + C**.
- Only this computer can see it (`localhost`). Nothing goes online.

### The finished site (exactly what would be published)

```bash
npm run build      # checks everything, builds the final site into the dist/ folder
npm run preview    # serves dist/ at http://localhost:4321
```

Use this before a final review: images are fully optimised here (the live preview makes them on the fly).

### See a full example timeline

```bash
npm run dev:example
```

Shows made-up example moments (`timeline.example.json`) to see every kind of media: three photos,
a short video, a YouTube link. Never used for the real site.

### All commands

| Command | What it does |
|---|---|
| `npm run dev` | Live preview at <http://localhost:4321> |
| `npm run dev:phone` | Live preview that your **phone on the same Wi-Fi** can open too (section 4) |
| `npm run dev:example` | Live preview with the example timeline |
| `npm run build` | Type check + build the final site into `dist/` |
| `npm run preview` | Serve the built `dist/` |
| `npm test` | 76 automatic tests (every screen size in both languages, logo, contact, SEO) |
| `npm run check` / `npm run lint` | Code checks only |
| `npm run polaroids` | Rebuild the timeline Polaroid prints from your originals (section 7) |
| `npm run handwriting` | Re-trace your handwriting from the photos (section 8) |
| `npm run brand` | Rebuild logo files, favicons, social preview image |

---

## 4. Test the phone experience

### A. Phone simulation in Chrome (quick, on this PC)

1. Run `npm run dev` and open <http://localhost:4321/> in **Chrome**.
2. Press **F12**, then **Ctrl + Shift + M** (or click the phone/tablet icon top-left of the panel).
3. Choose a phone at the top (e.g. *iPhone 12 Pro*, *Pixel 7*).
4. **Reload the page (F5).** The site decides "touch or mouse" when it loads, so this matters.

Your mouse now behaves like a finger. Try:

- **Logo:** tap → it jumps away and the handwriting appears; tap again or wait → it comes home.
  Before the first tap it breathes, shows a ripple and a little nudge (tap hints).
- **Timeline:** scroll; tap a photo to open it full screen, swipe/close.
- **Μίλα μου:** tap → contacts appear; tap email/phone → opens mail/dialler, "copied" message.
- **ΕΛ · EN:** switch language; you land on the same section (logo, story or contact).
- Rotate the phone (the rotate icon in the toolbar) and try small phones (*iPhone SE*).

Good for layout; it is still a desktop browser pretending.

### B. Your real phone (best for feel: sizes, taps, speed)

1. Phone and computer on the **same Wi-Fi** (not on a company VPN / office network).
2. Run:
   ```bash
   npm run dev:phone
   ```
3. The terminal shows two addresses, e.g.
   ```
   Local    http://localhost:4321/
   Network  http://192.168.1.23:4321/
   ```
   Type the **Network** address into the phone's browser.
4. If Windows Firewall asks about **Node.js**, allow it on **Private networks only**.
   (On a company laptop IT rules may block this; then use method A.)
5. **When done, stop it with Ctrl + C.** While it runs, anyone on the same Wi-Fi could open it.

---

## 5. Why the logo sometimes fades instead of jumping

The site respects the **"reduce motion"** setting of the computer or phone (for people who get dizzy
from animations). When it is on, the logo doesn't jump: it **fades back** and the handwritten slogan
appears on top. This is on purpose (accessibility, required by the design document), not a bug.

- **Windows:** Settings → Accessibility → Visual effects → **Animation effects** (on = jumping logo).
- **iPhone:** Settings → Accessibility → Motion → **Reduce Motion** (off = jumping logo).
- **Android:** Settings → Accessibility → **Remove animations** (off = jumping logo).
- **Chrome, just to test:** F12 → ⋮ menu → More tools → **Rendering** →
  "Emulate CSS prefers-reduced-motion".

---

## 6. The timeline: texts and moments

Everything about the story is in:

```
src/content/timeline/
├── timeline.json          ← the moments (text + which photo)
├── timeline.example.json  ← examples to copy from (never published)
└── media/                 ← the photos the site uses (the Polaroid prints)
```

**Change a text:** open `timeline.json`, change the words between the quotes, save.
Each moment looks like this:

```json
{
  "date": "2009",
  "title": { "el": "Η πρώτη κάμερα.", "en": "First camera." },
  "text": {
    "el": "Η στιγμή που κατάλαβα ...",
    "en": "The moment I realised ..."
  },
  "media": [
    {
      "photo": "2009-polaroid.jpg",
      "alt": { "el": "Σέλφι στον καθρέφτη ...", "en": "Mirror selfie ..." }
    }
  ]
}
```

- `date`: `"2009"`, `"2009-06"` or `"2009-06-15"`; the site sorts by it and shows the year.
- `title` required; `text` up to 400 characters per language.
- `alt` = a short description of the photo, **required** (blind visitors, Google). Please review the
  ones I wrote.
- `"hidden": true` hides a moment without deleting it.
- Between moments: a **comma** `{ … }, { … }`; none after the last one.
- Full field list, videos, YouTube/Vimeo and the common-mistakes table: [`README.md` §2](../README.md#2-the-timeline-add-edit-hide-or-remove-a-moment).

**Add a new moment with a photo:** follow section 7 (the photo becomes a Polaroid), then add a block
like the one above with `"photo": "<year>-polaroid.jpg"`.

**Timeline markers:** "Σήμερα / Today" always closes the timeline. A "2009" start marker only appears
when no moment shows 2009 (e.g. on the empty "Η ιστορία γράφεται." screen).

**Heading and order:** `src/config/site.ts` → `timeline.showHeading` (Η ΙΣΤΟΡΙΑ on/off) and
`timeline.order` (`'oldest-first'` or `'newest-first'`).

---

## 7. Timeline photos: the Polaroid prints

The site doesn't show your photos directly. A script turns them into **black & white Polaroid prints**:

1. **Collage** if a year has several photos.
2. **Black & white.**
3. **Instant-film look:** a bit more contrast, faded blacks, light grain, darker corners, slight softness.
4. **The frame:** square picture, white paper border, wide strip at the bottom.
5. **Web sizes:** the build then makes AVIF/WebP/JPEG versions in several sizes; each phone/screen
   downloads only the size it needs, only when it scrolls near it (~70 KB per print on a phone).

On the page each print sits slightly tilted (like on a table) and straightens on hover.

### Your originals

- Full-size originals live in **`photos-originals/`** inside the project. This folder is **not saved
  in git** (61 MB). **Keep your own backup** of these (the original `Desktop\forsite.zip` is one).
- File names **start with the year**: `2009.jpg`, `2014-0.jpg`, `2014-1.jpg`, … Photos with the same
  year become one collage, in name order.

### Change or add a photo

1. Put the photo in `photos-originals/`, named with the year first (e.g. `2027.jpg`, or `2027-1.jpg`
   and `2027-2.jpg` for a collage).
2. Run:
   ```bash
   npm run polaroids
   ```
   It rebuilds **all** prints into `src/content/timeline/media/<year>-polaroid.jpg` and lists them.
3. For a new year, add a moment to `timeline.json` with `"photo": "2027-polaroid.jpg"` and an `alt`.
4. Look at it with `npm run dev`.

### Collage layouts (1 to 4 photos per year)

| Photos | Layout |
|---|---|
| 1 | Fills the square |
| 2 | One above the other |
| 3 | One tall on the left, two on the right |
| 4 | First one across the top, three below |

5 or more for one year isn't supported; the script stops with a message.

### A face is cut off?

Each photo is cropped around a **focus point**. Open `scripts/build-polaroids.mjs`, find `FOCUS`:

```js
'2011.jpg': [0.5, 0.34],   // [x, y]: 0 = left/top, 1 = right/bottom
```

Lower the second number to keep more of the **top** (heads), raise it to keep more of the **bottom**.
Save, run `npm run polaroids` again. Photos not listed are cropped automatically.

### Fine-tuning the look (same file, top)

| Setting | Effect |
|---|---|
| `IMG`, `SIDE`, `BOTTOM` | Picture size and frame borders (px) |
| `GUTTER` | White line between collage photos |
| `PAPER` | Frame colour (255 = pure white) |
| `* 0.03; // film grain` | Grain strength (higher = grainier, bigger files) |
| `0.07 + v * 0.88` | Faded blacks / soft whites |
| Tilt | `src/components/TimelineMedia.astro` → `--print-tilt` (`-1.2deg` / `1deg`; `0deg` = straight) |

---

## 8. Your handwriting on the site

Three phrases are your own handwriting, traced from phone photos into clean vector lines:

| Phrase | Where | Photo (in `scripts/vendor/`) | Traced file (in `src/assets/brand/`) |
|---|---|---|---|
| I shoot. You smile. | Behind the logo | `ishootyousmile_handwritten.jpg` | `slogan-handwritten.*` |
| Μίλα μου. | Contact button, Greek page | `talktome.jpg` | `talk-el-handwritten.*` |
| Talk to me. | Contact button, English page | `talktome.jpg` | `talk-en-handwritten.*` |
| Timeline titles (16: 8 Greek + 8 English) | Each moment's title | `timeline.jpg` | `timeline/<year>-<lang>.*` |

The real words are also in the page (hidden), so screen readers and Google still read them.

**Switch back to typed text:** `src/config/site.ts` → `sloganHandwritten: false`,
`talkHandwritten: false` and/or `timeline.handwrittenTitles: false`.

**Timeline titles** are matched by **year + language** (`2009-el`, `2009-en`, …). If you change a
title's words in `timeline.json`, the handwriting doesn't change: write the new title, photograph it,
and add/adjust its crop in `TITLE_CROPS` in `scripts/build-slogan.mjs`. A moment with no handwritten
title simply shows the typed one. Size: `site.ts` → `timeline.handwrittenTitleScale`.

**Size:** `site.ts` → `sloganHandwrittenWidth` (slogan width) and `talkHandwrittenHeight`
(Μίλα μου / Talk to me height). The values are `clamp(smallest, grows-with-screen, largest)`.

**Thickness:** `stroke-width` in `src/components/EvasiveLogo.astro` (`.slogan__hand`, 0.35px) and
`src/components/Contact.astro` (`.talk__hand`, 0.9px) and `src/components/Timeline.astro`
(`.entry__hand`, 0.6px). Bigger = bolder.

**New handwriting:**

1. Write with a dark pen on white paper, photograph it straight-on in daylight, no shadow on the words.
2. Copy the photo into `scripts/vendor/`.
3. In `scripts/build-slogan.mjs`, in `JOBS`, set `src` (the file name) and `crop` (the rectangle
   around the words, in the photo's pixels: `left`, `top`, `width`, `height`). Tip: leave some margin.
4. Run `npm run handwriting` and check with `npm run dev`.

---

## 9. Other texts and settings

| What | Where |
|---|---|
| Email, phone, Instagram, which contacts show | `src/config/site.ts` → `contact` (switch to `info@papafiogos.gr` later = one line) |
| Search/Google description | `site.ts` → `description` |
| Interface words in both languages (Μίλα μου, Η ΙΣΤΟΡΙΑ, Σήμερα, privacy text…) | `src/i18n/strings.ts` |
| Privacy page text | `strings.ts` → `privacyBody` (update `privacyUpdated` when you change it) |
| Logo behaviour (jump distance, springiness, breathing, ripple, nudge…) | `site.ts` → `logo` |
| Contact animation | `site.ts` → `talk` |
| Analytics (later) | `site.ts` → `analyticsToken` |
| Logo, favicons, social image | `npm run brand` (from `scripts/vendor/`) |

---

## 10. Check before you save

After bigger changes:

```bash
npm run build     # must end without errors
npm test          # must say "76 passed"
```

If a test fails, the message says which screen size / page; ask for help with that message.
Small text edits only need a look in `npm run dev`.

---

## 11. Save your work (git) and what's in the repo

**Save a version** (in the project folder):

```bash
git add -A
git commit -m "Short description of the change"
```

**See history:** `git log --oneline`. **Undo unsaved changes to one file:** `git checkout -- <file>`.

There is **no remote**: `git push` does nothing until you go live. To back up the whole project,
copy the folder (or zip it) to a USB stick or cloud drive, **including `photos-originals/`**.

### In the repository (saved by git)

Everything needed to build the site: code, settings, texts, `timeline.json`, the **Polaroid prints**,
the traced handwriting, logo files, font, favicons, social image, the handwriting photos and logo
originals in `scripts/vendor/`, the scripts that make them, tests, and these docs.

### Not in the repository (on purpose)

| Folder | Why |
|---|---|
| `photos-originals/` | Your full-size timeline photos (61 MB). Only needed to rebuild the prints. **Back them up yourself.** |
| `node_modules/` | Downloaded tools; `npm install` brings them back. |
| `dist/`, `.astro/` | Build output; `npm run build` recreates it. |
| `test-results/`, `playwright-report/` | Test leftovers. |

---

## 12. Going live (later)

Not done, on purpose. Steps when you decide (details in [`README.md` §6](../README.md#6-going-live-later)):

1. Private GitHub repository → push this folder.
2. Cloudflare Pages → connect the repo (build `npm run build`, output `dist`).
3. Domains `papafiogos.gr` + `www` (redirect www → papafiogos.gr).
4. Cloudflare Web Analytics → paste the token into `site.ts` → `analyticsToken`.
5. Google Search Console / Bing: submit `https://papafiogos.gr/sitemap-index.xml`.
6. Email `info@papafiogos.gr` (Zoho), then switch `contact.email` in `site.ts`.

After that, the Pages CMS form editor (edit the timeline from your phone) also works.

---

## 13. Troubleshooting

| Problem | Fix |
|---|---|
| `Another astro dev server is already running` | One is already running: just open <http://localhost:4321>. Or stop it: `npx astro dev stop` (or start with `npx astro dev --force`). |
| `Another astro preview server is running` | `npx astro preview stop` |
| `npm` / `node` not found | Install Node.js (section 2), then open a **new** terminal. |
| Port 4321 busy | `npm run dev -- --port 4330` and open <http://localhost:4330> |
| Logo fades instead of jumping | "Reduce motion" is on (section 5). |
| Phone can't open the Network address | Same Wi-Fi? Not on VPN? Firewall allowed Node.js on Private? Or use Chrome simulation. |
| Error about `timeline.json` | Read the message: it names the line and the problem (missing comma, wrong quotes, file name typo with a suggestion, missing `alt`). |
| A photo doesn't change after `npm run polaroids` | Reload the page; if needed stop and restart `npm run dev`. |
| `npm test` can't find a browser | `npx playwright install chromium` |
| Page looks broken after pulling changes | `npm install`, then restart `npm run dev`. |

---

## 14. Map of the project

```
papafiogos-site/
├── README.md                    short owner guide
├── docs/
│   ├── GUIDE.md                 this guide
│   ├── PROJECT-NOTES.md         status, decisions, open items, session log
│   └── papafiogosPD.md          original design document (PRD v1.2)
├── src/
│   ├── config/site.ts           ALL settings (contact, sizes, timings, switches)
│   ├── i18n/strings.ts          all interface texts, Greek + English, privacy text
│   ├── content/timeline/        timeline.json + media/ (Polaroid prints)
│   ├── assets/brand/            logo + traced handwriting
│   ├── assets/fonts/            Inter (Latin + Greek), one file
│   ├── components/              the building blocks (Hero, EvasiveLogo, Timeline, Contact, …)
│   ├── lib/                     behaviour (logo spring + dodge, lightbox, contact, timeline checks)
│   ├── layouts/Base.astro       page shell
│   └── pages/                   /, /en/, /privacy/, /en/privacy/, 404
├── public/                      favicons, social image, robots.txt, hosting headers
├── scripts/
│   ├── build-polaroids.mjs      originals → B&W Polaroid prints   (npm run polaroids)
│   ├── build-slogan.mjs         handwriting photos → vector lines (npm run handwriting)
│   ├── build-brand.mjs          logo, favicons, social image      (npm run brand)
│   ├── build-font.py            the single font file
│   └── vendor/                  source files: logo originals, handwriting photos, font
├── photos-originals/            your full-size photos (NOT in git, back up yourself)
├── tests/                       automatic tests (npm test)
├── integrations/prune-media.mjs leaves unused media out of the build
├── astro.config.mjs             site address, languages, security policy
└── package.json                 the npm commands
```

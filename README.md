# PAPAFIOGOS — papafiogos.gr

The personal site of PAPAFIOGOS. Three screens: the logo, the story (timeline), and "Μίλα μου / Talk to me".
Greek at `/`, English at `/en/`.

> **Status:** built and tested **locally only**. Nothing has been pushed to GitHub or deployed.
> Going live (GitHub + Cloudflare Pages + domain) is a separate, later step — see [Going live](#going-live-later).

---

## 1. See the site on your computer

You need [Node.js](https://nodejs.org) 22 or newer (one-time install).

```bash
npm install          # first time only
npm run dev          # open http://localhost:4321  (changes appear as you save)
```

Other commands:

| Command | What it does |
|---|---|
| `npm run dev` | Live preview while you edit. |
| `npm run dev:example` | Same, but shows **example moments** from `timeline.example.json` so you can see a full timeline. Never used for the real site. |
| `npm run build` | Checks everything and builds the finished site into `dist/`. |
| `npm run preview` | Serves the finished `dist/` site at http://localhost:4321. |
| `npm test` | Runs the automatic tests (every screen size, the logo, contact, languages, SEO). |

---

## 2. The timeline: add, edit, hide or remove a moment

Everything about the story lives in **one file** and **one folder**:

```
src/content/timeline/
├── timeline.json          ← the ONLY file you edit
├── timeline.example.json  ← filled-in examples to copy from (never shown on the site)
└── media/                 ← put photos and videos here
```

Right now `timeline.json` is empty — `[]` — and the site shows the calm “Η ιστορία γράφεται. / The story is being written.” screen between **2009** and **Σήμερα / Today**.

### Add a moment

1. **Put the photo (or video) into `media/`.** Any size, straight from the camera. Give it a clear name, e.g. `2009-first-camera.jpg` (no spaces is safest).
2. **Open `timeline.json`** and paste a moment between the `[` and `]`. Copy this template:

```json
[
  {
    "date": "2009-06",
    "label": { "el": "Καλοκαίρι 2009", "en": "Summer 2009" },
    "title": { "el": "Η πρώτη κάμερα", "en": "The first camera" },
    "text":  { "el": "Μία έως τρεις μικρές προτάσεις.", "en": "One to three short sentences." },
    "media": [
      { "photo": "2009-first-camera.jpg",
        "alt": { "el": "Τι δείχνει η φωτογραφία", "en": "What the photo shows" } }
    ]
  }
]
```

3. **Save.** With `npm run dev` running you see it instantly.

**More than one moment?** Put a **comma** between them: `{ … }, { … }`. Order in the file doesn't matter — the site sorts by date (oldest first; change `timeline.order` in `src/config/site.ts`).

### The fields

| Field | Needed? | What it is |
|---|---|---|
| `date` | **yes** | `"2009"`, `"2009-06"` or `"2009-06-15"`. Used for ordering; the year is shown. |
| `label` | no | Shown instead of the year, e.g. "Summer 2009". |
| `title` | **yes** | Short title. At least one language. |
| `text` | no | 1–3 sentences, max 400 characters per language. |
| `media` | no | Up to **3 photos**, OR **1 short video**, OR **1 YouTube/Vimeo** link. |
| `alt` | **yes, for every photo/video** | Describes what's in it (for blind visitors and Google). |
| `hidden` | no | `true` hides the moment without deleting it. |

**Media examples** (see `timeline.example.json` for complete moments):

```json
"media": [ { "photo": "a.jpg", "alt": {"el": "…", "en": "…"} },
           { "photo": "b.jpg", "alt": {"el": "…", "en": "…"} },
           { "photo": "c.jpg", "alt": {"el": "…", "en": "…"} } ]

"media": [ { "video": "island.mp4", "poster": "island-cover.jpg", "alt": {"el": "…", "en": "…"} } ]

"media": [ { "youtube": "dQw4w9WgXcQ", "poster": "film-cover.jpg", "alt": {"el": "…", "en": "…"} } ]
"media": [ { "vimeo": "76979871",    "poster": "film-cover.jpg", "alt": {"el": "…", "en": "…"} } ]
```

- `youtube` / `vimeo`: only the **id**, not the whole link (`youtube.com/watch?v=`**`dQw4w9WgXcQ`**).
- Short video with real sound you want people to hear? Add `"sound": true` — a small mute button appears.
- Only one language? Fine — the other language's page shows it as-is, and the build lists what's untranslated.

### Edit, hide, remove

- **Edit:** change the words in `timeline.json`, save.
- **Hide for now:** add `"hidden": true` to the moment.
- **Remove:** delete its whole `{ … }` block (and the comma before/after it).
- Photos left in `media/` that no moment uses are ignored — they are not published.

### Common JSON mistakes (the build tells you which line)

| Mistake | Wrong | Right |
|---|---|---|
| Missing comma between moments | `{ … } { … }` | `{ … }, { … }` |
| Extra comma after the last one | `{ … }, ]` | `{ … } ]` |
| Curly/smart quotes | `“title”` | `"title"` |
| Typo in a file name | `"2009-camra.jpg"` | the build says *Did you mean '2009-camera.jpg'?* |
| Missing `alt` | `{ "photo": "a.jpg" }` | `{ "photo": "a.jpg", "alt": { "el": "…", "en": "…" } }` |

If something is wrong, `npm run dev` / `npm run build` stops with a plain message in **Greek and English**, e.g.

```
✋ timeline.json — βρέθηκε 1 πρόβλημα / found 1 problem
  • Γραμμή 14: λείπει κόμμα στο τέλος της γραμμής (μετά το προηγούμενο moment).
    Line 14: missing comma at the end of the line (after the previous moment).
```

A failed build never replaces a live site — the last good version stays online.

### The form editor (Pages CMS) — no JSON at all

`.pages.yml` configures [Pages CMS](https://pagescms.org): a free form editor that works from a phone. It edits the same `timeline.json`, so you can mix it with hand editing. **It needs the repository on GitHub**, so it becomes usable once the site goes live:

1. Go to **app.pagescms.org**, sign in with GitHub, pick the `papafiogos-site` repository.
2. Open **Timeline / Ιστορία** → **Add an entry**.
3. Fill in date, titles, text; under **Media** upload photos (or a video + cover image), and fill the **Description** for each.
4. Tap **Save**. The site rebuilds in about a minute.

---

## 3. Change contact details and texts

- **Email, phone, Instagram:** `src/config/site.ts` → `contact`. To switch to the new address once it exists, change **one line**:
  ```ts
  email: 'info@papafiogos.gr',
  ```
  The contact button, search-engine data — everything follows.
- **Add WhatsApp later:** in the same place, add `'whatsapp'` to `items`.
- **Interface words (both languages):** `src/i18n/strings.ts` (e.g. "Μίλα μου", the timeline heading, the privacy text).
- **Search description (Google snippet):** `site.ts` → `description`.
- **Every timing / size / distance** (how far the logo jumps, the breathing, the ripple, the nudge…): `site.ts` → `logo`, `timeline`, `talk`. Tune after trying it on your own phone.

---

## 4. Photo and video tips

- **Photos:** upload the original JPEGs. The site makes small, modern versions (AVIF/WebP) for each screen automatically.
- **Short videos** (they autoplay silently, looping, only while visible): **MP4 (H.264), ≤ 20 seconds, ≤ 4 MB**, plus a still image as `poster`.
  - HandBrake: preset **"Web → Social 25 MB 30 Seconds 720p30"**, then *Video* tab → *Constant Quality* RF 28, *Audio* tab → remove the track if it doesn't matter. Trim to ≤ 20 s.
  - Or with ffmpeg: `ffmpeg -i in.mov -t 20 -vf scale=-2:720 -c:v libx264 -crf 28 -preset slow -movflags +faststart -an out.mp4`
- **Longer videos:** upload to YouTube or Vimeo and use the `youtube` / `vimeo` id. The player only loads when someone presses play (privacy-friendly).

---

## 5. Content to provide [OWNER INPUT]

- [ ] **Meta descriptions** (`site.ts` → `description.el` / `.en`, 140–160 characters). Drafts from the design doc are in place.
- [ ] **Timeline heading**: keep "Η ΙΣΤΟΡΙΑ / THE STORY", change it (`strings.ts`), or hide it (`site.ts` → `timeline.showHeading: false`).
- [ ] **Timeline order**: oldest-first (current) or newest-first (`site.ts` → `timeline.order`).
- [ ] **Privacy text** final wording (`strings.ts` → `privacyBody`).
- [ ] **Timeline moments** — whenever you're ready.
- [ ] **Hinting cues on the logo** — try them on your real phone and tune `site.ts` → `logo.breathe`, `logo.ripple`, `logo.nudge`.
- [ ] **Cloudflare Web Analytics token** (`site.ts` → `analyticsToken`) — at launch.
- [ ] Later: switch `contact.email` to `info@papafiogos.gr`.

---

## 6. Going live (later)

Not done yet, on purpose. When you want it online:

1. Create a **private** GitHub repository `papafiogos-site` and push this folder (`git remote add origin …`, `git push -u origin main`).
2. **Cloudflare Pages** → *Create project* → connect the repo. Build command `npm run build`, output folder `dist`. Every push to `main` publishes; other branches get preview URLs.
3. Add the custom domains `papafiogos.gr` + `www.papafiogos.gr`, with a redirect `www → papafiogos.gr`.
4. Turn on **Web Analytics**, paste the token into `site.ts`.
5. Submit `https://papafiogos.gr/sitemap-index.xml` in Google Search Console and Bing Webmaster Tools.

`public/_headers` already holds the caching and security headers Cloudflare Pages will apply. The Content-Security-Policy is generated per page by Astro.

---

## 7. For developers

- **Design document:** the original spec this site was built from is kept in [`docs/papafiogosPD.md`](docs/papafiogosPD.md) (v1.2, 2026-11-12). Section numbers like §5.8 or §9.3 in the code and tests refer to it.
- **Stack:** Astro 7 (static), TypeScript strict, hand-written CSS, ~5 KB of vanilla JS (gzipped). No UI libraries.
- **Where things are:** `src/config/site.ts` (all tunables), `src/i18n/` (strings, URL helpers), `src/components/` (Hero, EvasiveLogo, Timeline*, Lightbox, Contact*, Seo, LangSwitch), `src/lib/` (spring, logo behaviour, timeline validation, lightbox, contact).
- **Timeline loading:** `src/content.config.ts` uses a small custom content loader instead of Astro's `file()` loader, because `file()` only *logs* JSON errors and carries on (a typo would silently publish an empty timeline). Validation and the bilingual messages are in `src/lib/timeline-validate.ts`.
- **Unused media** is removed from the output by `integrations/prune-media.mjs`.
- **Brand assets:** `npm run brand` regenerates the polished logo (split into `#face`, `#bowtie`, `#wordmark`), favicons, apple-touch-icon and OG image from `scripts/vendor/`. `python scripts/build-font.py` rebuilds the single Inter Latin+Greek font file (needs `pip install fonttools brotli`).
- **Quality checks:** `npm run check`, `npm run lint`, `npm test` (75 Playwright tests incl. the full §9.3 viewport matrix in both languages).

### Deliberate deviations from the design document

| Design doc | What was done | Why |
|---|---|---|
| Logo dodges 14–24 vmin | Same range, but extended just enough that the logo no longer covers the slogan (`logo.clearSlogan`, can be turned off) | At the doc's distance the 440 px logo still half-covered “I shoot. You smile.” on most screens. |
| Content collection with the `file()` loader | Small custom loader | `file()` swallows JSON errors; the doc requires the build to fail with a clear message. |
| Schema in `src/content/config.ts` | `src/content.config.ts` | Location required by Astro 5+. |
| CSP in `_headers` | CSP as a per-page `<meta>` with script/style hashes (Astro `security.csp`); other headers in `_headers` | Hashes are generated automatically at build, so inline code stays allowed without `'unsafe-inline'`. |
| Image file names from the entry slug | Output names are based on the file name you upload | Astro names outputs after the source file; descriptive upload names give the same SEO effect. |
| Short clips: `autoplay` attribute | Played/paused by script only while ≥ 50 % visible; without JS the clip shows native controls | `autoplay` would download every clip on page load, defeating `preload="none"`. |
| One 404 per language | One `/404` that switches to English for `/en/...` URLs | Static hosts serve a single 404 file. |

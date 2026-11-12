# PAPAFIOGOS site — project notes (working memory)

> **Read this first** when picking the project up again (new session, new assistant, or you).
> It records where things stand, what was decided, and what's next.
> Keep it updated after every working session. Newest log entries at the bottom.

---

## 1. Where things are

| What | Where |
|---|---|
| Site source (local git repo, branch `main`) | `C:\Users\aristidisk\Documents\papafiogos-site` |
| Original design document (PRD v1.2) | `docs/papafiogosPD.md` (copy of `Desktop\papafiogosPD.md`) |
| These notes | `docs/PROJECT-NOTES.md` |
| Owner guide (how to add moments, change texts) | `README.md` |
| All tunables + contact details | `src/config/site.ts` |
| All interface texts (el + en), privacy wording | `src/i18n/strings.ts` |
| Timeline content (the only file to edit) | `src/content/timeline/timeline.json` (+ `media/` folder) |
| Example timeline (dev only, never published) | `src/content/timeline/timeline.example.json` + `media/examples/` |
| Brand sources | `scripts/vendor/` (cleaned logos from `Desktop\papafiogos-logo\`, Inter font) |

## 2. Ground rules from the owner

- **Local only.** Nothing is pushed to GitHub, deployed, or shared online until the owner explicitly says so. The repo has **no remote**.
- If a phone preview over home Wi-Fi is ever needed, that is LAN only — stop the server afterwards.
- Keep this file updated so work can resume if a session is lost.

## 3. Status (as of 2026-11-12)

- **Phases 1–5 of the PRD: done** (foundation, hero, timeline, contact + polish, QA).
- **Phase 6 (launch: GitHub, Cloudflare Pages, domain DNS, email, Search Console): not started** — on purpose.
- Quality: `astro check` 0 errors, ESLint clean, **76 Playwright tests pass** (full §9.3 viewport matrix in both languages + interactions + SEO), Lighthouse mobile **100/100/100/100**, LCP 0.8 s, CLS 0, ~60 KB first load, JS 5.1 KB gzipped.
- Timeline: **empty** (`[]`), showing the "Η ιστορία γράφεται. / The story is being written." screen between 2009 and Σήμερα/Today.

## 4. Decisions made

| Date | Decision |
|---|---|
| (PRD) | Greek default at `/`, English at `/en/`; slogan "I shoot. You smile." stays English; "Μίλα μου"; Instagram @papafiogos; phone +30 697 895 4464; email papafiogos@gmail.com until info@papafiogos.gr exists (one-line change in `site.ts` → `contact.email`). |
| 2026-11-12 | **Meta descriptions approved** (PRD drafts minus "since 2009"): el "Παπαφιόγκος: φωτογραφία, βίντεο και περιεχόμενο που σε κάνει να χαμογελάς. Από την Πάτρα. Μίλα μου." / en "PAPAFIOGOS: photography, video and content that makes you smile. Based in Patras, Greece. Let's talk." |
| 2026-11-12 | **Privacy page written.** Controller: **Αριστείδης Κάντας (PAPAFIOGOS), Πάτρα**. English spelling used: **Aristeidis Kantas** — *not yet confirmed by the owner*. Email is filled in from `site.ts`. Analytics sentence appears only once `analyticsToken` is set. |
| 2026-11-12 | Original PRD copied into `docs/` for reference. |

## 5. Deliberate deviations from the PRD (also in README §7)

1. Logo dodge goes slightly further than 14–24 vmin when needed so it never covers the slogan (`logo.clearSlogan`, can be turned off).
2. Custom content loader instead of Astro `file()` (which only logs JSON errors) → broken `timeline.json` fails the build with a bilingual message + line number.
3. Content schema lives in `src/content.config.ts` (Astro 5+ location).
4. CSP generated per page by Astro as a `<meta>` with hashes; other security headers in `public/_headers`.
5. Short clips are played/paused by script only while visible (no `autoplay` attribute, so nothing downloads early).
6. One `/404` page that switches to English for `/en/...` URLs.
7. `integrations/prune-media.mjs` removes media files that no moment uses from the build output.

## 6. Open items / waiting on the owner

- [ ] **Timeline content** — owner is preparing the initial moments and will share them (in progress, started 2026-11-12).
- [ ] Timeline **heading**: keep "Η ΙΣΤΟΡΙΑ / THE STORY", change, or hide (`site.ts` → `timeline.showHeading`).
- [ ] Timeline **order**: oldest-first (current) or newest-first (`site.ts` → `timeline.order`).
- [ ] Confirm English spelling of the name on the privacy page (currently "Aristeidis Kantas").
- [ ] Try the logo's tap hints on a real phone and tune (`site.ts` → `logo.breathe / ripple / nudge`). Offer: LAN-only phone preview.
- [ ] Later (launch): Cloudflare Web Analytics token, GitHub private repo, Cloudflare Pages, domain, Zoho `info@papafiogos.gr`, then switch `contact.email`.

## 7. How to add a timeline moment (quick reference)

1. Copy the photo/video into `src/content/timeline/media/` (clear file name, no spaces).
2. Add a block to `timeline.json` (template in README §2 and `timeline.example.json`):
   ```json
   { "date": "2009-06",
     "title": { "el": "…", "en": "…" },
     "text":  { "el": "…", "en": "…" },
     "media": [ { "photo": "2009-first-camera.jpg", "alt": { "el": "…", "en": "…" } } ] }
   ```
   Commas between moments. Up to 3 photos OR 1 short video (+ `poster`) OR 1 `youtube`/`vimeo` id (+ `poster`). `alt` is required for every media item.
3. Check: `npm run dev` (live) or `npm run build` (full check). Then run `npm test`.
4. Commit: `git add -A && git commit -m "Timeline: add <title>"`.

## 8. Useful commands

```bash
npm run dev            # http://localhost:4321
npm run dev:example    # dev with the example timeline
npm run build          # type check + build to dist/
npm test               # 76 Playwright tests (builds + serves on 127.0.0.1:4322)
npx astro preview stop # if a preview server is left running
```

## 9. Session log

### 2026-11-12 — build day
- Built the whole site from PRD v1.2 (phases 1–5). Polished the traced logo (RDP smoothing, 3.1 KB gz) and split it into `#face` / `#bowtie` / `#wordmark`; generated favicons + OG image. Single Inter Latin+Greek font (40 KB).
- Fixes found during testing: logo now clears the slogan; contact row wraps on 640–670 px wide screens; hero has no min-height (280 px tall foldables); dodge cooldown no longer swallows the first activation; unused media pruned from output; friendlier trailing-comma message.
- Added `docs/papafiogosPD.md`.
- Meta descriptions approved; privacy wording written (controller Αριστείδης Κάντας, Πάτρα).
- Owner will now prepare the **initial timeline** and share the info → next session: add the moments, build, test, show screenshots, commit.

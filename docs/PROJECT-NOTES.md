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
- Timeline: **8 moments with photos** (2026-11-13). One black & white Polaroid print per year.

## 4. Decisions made

| Date | Decision |
|---|---|
| (PRD) | Greek default at `/`, English at `/en/`; slogan "I shoot. You smile." stays English; "Μίλα μου"; Instagram @papafiogos; phone +30 697 895 4464; email papafiogos@gmail.com until info@papafiogos.gr exists (one-line change in `site.ts` → `contact.email`). |
| 2026-11-12 | **Meta descriptions approved** (PRD drafts minus "since 2009"): el "Παπαφιόγκος: φωτογραφία, βίντεο και περιεχόμενο που σε κάνει να χαμογελάς. Από την Πάτρα. Μίλα μου." / en "PAPAFIOGOS: photography, video and content that makes you smile. Based in Patras, Greece. Let's talk." |
| 2026-11-12 | **Privacy page written.** Controller: **Αριστείδης Κάντας (PAPAFIOGOS), Πάτρα**. English spelling used: **Aristeidis Kantas** — *not yet confirmed by the owner*. Email is filled in from `site.ts`. Analytics sentence appears only once `analyticsToken` is set. |
| 2026-11-12 | Original PRD copied into `docs/` for reference. |
| 2026-11-13 | **Timeline photos = black & white Polaroid prints** (owner's request). Originals (`Desktop\forsite.zip`, 13 photos named by year, e.g. `2014-1.jpg`) live in `photos-originals/` (**git-ignored**, 61 MB; zip extracted in `Documents\papafiogos-intake\`). `node scripts/build-polaroids.mjs` → one `media/<year>-polaroid.jpg` per year: several photos for a year → collage first (layouts for 2/3/4 photos), then B&W, then film look (S-curve, faded blacks, grain, vignette, slight softness) and the frame. Crops tuned per photo in `FOCUS` (2011 and 2017-2 adjusted). Single prints tilt ±1° on the page, straighten on hover (CSS in TimelineMedia.astro). Alt texts written by me from the photos — **owner to review**. |
| 2026-11-12 | **Timeline filled with the owner's 8 moments** (2009, 2011, 2014, 2017, 2018, 2020, 2023, 2026), Greek = owner's own wording, English = owner's text with agreed fixes ("shit" removed, YouTube/TikTok/rap/Block Fitness Gym etc.). Text only — photos to follow. |
| 2026-11-12 | **Handwritten slogan** (owner's request): photo `Desktop\ishootyousmile_handwritten.jpg` → traced SVG by `scripts/build-slogan.mjs` (copy of the photo in `scripts/vendor/`). Shown instead of the typed slogan; switch with `site.ts` → `sloganHandwritten` (false = typed). Real text kept hidden for screen readers / Google. ~5 KB gzipped. Owner to judge size/weight on a real phone (`sloganHandwrittenWidth`, stroke in EvasiveLogo.astro `.slogan__hand`). |

## 5. Deliberate deviations from the PRD (also in README §7)

1. Logo dodge goes slightly further than 14–24 vmin when needed so it never covers the slogan (`logo.clearSlogan`, can be turned off).
2. Custom content loader instead of Astro `file()` (which only logs JSON errors) → broken `timeline.json` fails the build with a bilingual message + line number.
3. Content schema lives in `src/content.config.ts` (Astro 5+ location).
4. CSP generated per page by Astro as a `<meta>` with hashes; other security headers in `public/_headers`.
5. Short clips are played/paused by script only while visible (no `autoplay` attribute, so nothing downloads early).
6. One `/404` page that switches to English for `/en/...` URLs.
7. `integrations/prune-media.mjs` removes media files that no moment uses from the build output.

## 6. Open items / waiting on the owner

- [x] Timeline texts — 8 moments added 2026-11-12.
- [x] Timeline images — added 2026-11-13 as B&W Polaroids.
- [ ] Owner to review the photo **alt texts** (in timeline.json) and the crops/tilt.
- [ ] 2009 start bookend duplicates the first moment's "2009" — owner hasn't decided (recommendation: remove the start bookend, keep Σήμερα/Today).
- [ ] Owner to review the handwritten slogan on a real phone (size/weight).
- [ ] Timeline **heading**: keep "Η ΙΣΤΟΡΙΑ / THE STORY", change, or hide (`site.ts` → `timeline.showHeading`).
- [ ] Timeline **order**: oldest-first (current) or newest-first (`site.ts` → `timeline.order`).
- [ ] Confirm English spelling of the name on the privacy page (currently "Aristeidis Kantas").
- [ ] Try the logo's tap hints on a real phone and tune (`site.ts` → `logo.breathe / ripple / nudge`). Offer: LAN-only phone preview.
- [ ] Later (launch): Cloudflare Web Analytics token, GitHub private repo, Cloudflare Pages, domain, Zoho `info@papafiogos.gr`, then switch `contact.email`.

## 6b. Timeline draft (owner's original texts, received 2026-11-12)

Status: **now in timeline.json** (final wording there; table below = the owner's first draft, kept for reference). Still waiting for: the **images**.

| Date | Title | Text (owner, verbatim) |
|---|---|---|
| 2009 | First camera. | The moment I realised that moments are forever if you are able to trap them on your lens. |
| 2011 | First movies with the boys. | We did a lot of shit together. I was the one that had everything filmed. Especially skating. This could lead only to one thing. Video editing. Dad's laptop had Pinnacle Studio 9 installed. Say. No. More. |
| 2014 | Instagram. | Insta was something else back then. Photography was indeed appreciated. Brands liked good photos. I liked to shoot good photos. Growth and recognition came. Multiple brand collaborations took place. |
| 2017 | Video Clips. | Loved this. I directed and shot several video clips mostly on the RAP scene of Patras. Ask Gang Run ;) If you know you know. More experience came with it. |
| 2018 | Papafiogos TV. | My Youtube channel. A place which may be lost in time now but has a lot of good moments. An era of experimenting with vlogging, sound quality and other forms of video. Needed more time. Might revisit. |
| 2020 | The break. | Never really stopped. Life just got in the way. Kept most of my videos offline for internal consumption. |
| 2023 | The rebirth. | Could not resist anymore. Short form videos became a thing and I loved it. Started posting again on Tiktok trying to learn the patterns. Shit looked good. |
| 2026 | Consistency. | Never had a strict schedule other than the fact that I kept posting. More videos. More content. Better edits. Better hooks. Worked for Hellas Green. Worked for Block Fittness Gym. Worked for other brands as well. Social Media accounts that completely change shape once I step in. Do not hesitate. Talk to me. |

Review points raised with the owner: spelling (YouTube, TikTok, "Block Fitness Gym"?, rap, Social media,
Short-form, "If you know, you know."), "trap them in your lens", two uses of "shit" (owner's call),
Greek versions needed (Greek is the default site), the 2009 start bookend duplicates the 2009 moment.

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
- Owner sent the 8 timeline texts (English) → recorded in §6b, reviewed, Greek drafts proposed; owner revised the Greek → all 8 moments added to timeline.json (text only). No-JS test made content-agnostic.
- Handwritten slogan: traced owner's photo to SVG, replaced the typed slogan (config switch), fixed slogan centring (was offset right whenever wider than the logo box).
- Owner will now prepare the **initial timeline** and share the info → next session: add the moments, build, test, show screenshots, commit.

### 2026-11-13 — photos
- Owner sent `forsite.zip` (13 photos). Built `scripts/build-polaroids.mjs` (collage → B&W → Polaroid), attached one print per year with el/en alt texts, slight tilt in CSS. Grain lowered (0.045 → 0.03) to keep AVIF sizes down (~70 KB on a phone per print).
- Checks: astro check 0 errors, ESLint clean, 76/76 Playwright pass.
- To redo a photo: put the new original in `photos-originals/` (name starts with the year), run `node scripts/build-polaroids.mjs`, adjust `FOCUS` if a crop is off.

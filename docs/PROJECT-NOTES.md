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
| **Complete guide** (run locally, phone testing, photos, handwriting, settings, troubleshooting) | `docs/GUIDE.md` |
| Full-size timeline photo originals (**not in git**, owner backs up) | `photos-originals/` |
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
| 2026-11-13 | **"Μίλα μου" / "Talk to me" in the owner's handwriting** (photo `Desktop\talktome.jpg` → `scripts/vendor/talktome.jpg`). `scripts/build-slogan.mjs` now traces several phrases (JOBS list) → `src/assets/brand/talk-el-handwritten.*` and `talk-en-handwritten.*`; Greek page shows the Greek, English page the English. Real text kept for screen readers/Google. Switch: `site.ts` → `talkHandwritten`; size `talkHandwrittenHeight`; weight = `stroke-width` in Contact.astro `.talk__hand` (0.9px, heavier than the slogan's 0.35px because the pen line is thinner). The handwriting includes the full stop ("Μίλα μου."). |
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
- [x] 2009 start bookend removed (2026-11-13, owner): now hidden automatically whenever a moment already shows the start year; still shown on the empty-timeline screen. Σήμερα/Today kept.
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
- Owner reported "logo fades behind the slogan instead of dodging": not a bug — Windows *Animation effects* is off on the owner's PC (MinAnimate=0) → browser reports prefers-reduced-motion → the designed crossfade. Owner agreed; no change.
- Removed the duplicate "2009" start bookend (Timeline.astro: auto-hidden when a moment has the start year). 76/76 tests pass.
- "Μίλα μου" / "Talk to me" replaced with the owner's handwriting (traced, both languages); width capped so 280–320 px phones don't scroll sideways. 76/76 tests pass.
- Owner: "this is so beautiful". Wrote `docs/GUIDE.md` (complete guide: setup, run locally, phone testing in Chrome + real phone via `npm run dev:phone`, reduce-motion explanation, timeline, Polaroid pipeline, handwriting, settings, checks, git + what is/isn't in the repo, going live, troubleshooting, project map). README refreshed and linked to it. New npm scripts: `dev:phone`, `polaroids`, `handwriting`.
- Repo check: all assets tracked (prints, traced handwriting, logo, font, favicons, handwriting photos, logo originals); only `photos-originals/` (61 MB) is left out on purpose, plus regenerated folders (node_modules, dist, .astro, test output).
- Speed pass: (1) all timeline photos `loading=lazy` (the first print used to be eager + fetchpriority=high although it is below the full-screen hero). Measured: Chrome still pre-fetches the first 1-2 lazy prints (~1250 px look-ahead), but now at low priority after the page is ready. (2) Handwriting paths: `build-slogan.mjs` writes compact relative paths with whole-number coordinates (`PRECISION`, pixel-compared at 3x largest size: visually identical). Handwriting 13.8 -> 5.1 KB gz; home HTML 30.6 -> 24.3 KB gz (-21%). Skipped lazy-loading the 'Μίλα μου' SVG: only ~1.6 KB gz left, not worth the flash. 76/76 tests (one run flagged the slow logo-hover test once; passed 4 reruns).
- **Handwritten timeline titles (TRY-OUT, owner reviewing)**: `Desktop	imeline.jpg` -> `scripts/vendor/timeline.jpg`, 16 crops in `TITLE_CROPS` (build-slogan.mjs, speck limit 6 so accents/full stops survive) -> `src/assets/brand/timeline/<year>-<lang>.*`. Commit 7a2c1fc. **If the owner doesn't like it: `git revert 7a2c1fc`** (or set `site.timeline.handwrittenTitles: false` to keep the files but show typed titles). 'First camera.' lost its faint full stop in tracing.
- Fixed: ESLint unused var left by the speed commit (I had only run tests); flaky logo-hover test (exact-home check after fixed 1.5 s -> polls up to 5 s). Leftover `astro preview` from my measurement blocked the test server: TaskStop doesn't kill it, use `npx astro preview stop`.
- Owner **approved the handwritten timeline titles** (kept; no revert).
- Link preview (og-image.jpg) now = logo + handwritten slogan, kept in the centre square (WhatsApp crops); og:image:alt includes the slogan. Done in build-brand.mjs (commit ced59e3).
- **"Worked with" brand line (TRY-OUT, owner reviewing)**: Daniel Wellington, CabinZero (owner wrote 'Cabin Zero'; used the brand's own spelling), Hawkers, Paul Hewitt, Amacx Greece (spelling as given by owner, unverified), Hellas Green, Block Fitness Gym + 'και άλλα / and more'. Plain names, no logos (logos would need the brands' permission). Placed above the footer: above 'Μίλα μου' it collided with the open animation. **To remove: `git revert 1858028`** or `site.contact.brands: []`.
- Owner **approved the brand line** (kept). Owner considers the site done locally (2026-11-13). Remaining: small confirmations (alt texts, privacy name spelling, CabinZero/Amacx spelling, timeline heading) and going live when the owner decides.
- SEO (owner approved 1+2, not 3): home titles per language ('Παπαφιόγκος — Φωτογραφία & βίντεο στην Πάτρα | I shoot. You smile.' / 'PAPAFIOGOS — Photography & video in Patras | I shoot. You smile.', strings.ts homeTitle); visually hidden words in the logo h1 (strings.ts heroHeading). Not done (owner said no): extra 'what I do' text. Off-site advice given: Google Business Profile, bio links, Search Console at launch.
- Portability: `npm run zip` (scripts/make-zip.mjs, no deps) -> Desktop/papafiogos-site-<date>.zip = tracked files + .git history, no node_modules/dist/.astro/test output/photos-originals. New machine: Node 22+ & Git, unzip, `npm ci`, `npm run dev`. package.json now has engines node >=22. Guide section 'Move the project to another computer'.

### 2026-11-13 — owner deployed to Railway
- Owner deployed the site themselves on **Railway**: https://papafiogos-production.up.railway.app/ (not Cloudflare Pages as the PRD planned). Local-only mandate superseded by the owner's own deploy.
- Owner report: on the phone the logo 'goes to the left, not centred'. Checked the live site with iPhone/Android emulation (touch + mobile layout): logo centred at load, no horizontal overflow. A **tap** sends it up-left by design (dodge, reveals slogan) and it returns home after ~3-6 s; a swipe starting on the logo just scrolls. Asked owner whether it happens without touching.
- Note: `public/_headers` is Cloudflare-Pages-only; Railway ignores it (security/cache headers not applied there; the CSP is still in each page's <meta>).
- Owner: logo off-centre (flush left, no slogan) on the iPhone in **all** mobile browsers, persists. Not reproducible: Chromium iPhone/Android emulation, Playwright WebKit 27.2 iPhone 13 (load + tap), live build = local build. Added `?debug` diagnostics panel (src/lib/debug-panel.ts, separate chunk, loaded only with ?debug) showing viewport + logo rects + computed styles; owner to open https://papafiogos-production.up.railway.app/?debug and send a screenshot. GitHub remote `origin` connected (owner fixed auth, push works).
- **Cause found** via ?debug on the owner's iPhone (iOS 27.2, Chrome/CriOS 157 = WebKit): the logo box `[data-evasive-logo]` and `.logo__h1` were **440 px = full width** (117 px everywhere else) and the block button sat at x 0. Trigger: the visually hidden SEO text added inside the <button> (c6006c9). Fix: hidden text moved outside the button (still in the h1) + `.logo__button { margin-inline: auto }` so it centres even in a full-width box. New tests: logo centred at every viewport; forced full-width box keeps it centred (fails without the fix: 159 px off). 77 tests. The ?debug panel stays for now (remove once the owner confirms).
- Owner confirmed on the iPhone: **logo centred, fixed**. Removed the ?debug panel (it lives in git history, commit 7dd557d, if ever needed again: `git show 7dd557d:src/lib/debug-panel.ts`).

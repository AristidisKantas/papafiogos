/**
 * Reads timeline.json and checks it with plain-language, bilingual messages.
 * Any problem throws a TimelineError, which stops the build. (A failed build
 * never replaces the live site; the last good version stays online.)
 */
import fs from 'node:fs';
import path from 'node:path';
import { site } from '../config/site';

export const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'tif', 'tiff'];
export const VIDEO_EXT = ['mp4', 'webm', 'm4v'];

export type Bilingual = { el?: string; en?: string };
export type MediaItem =
  | { kind: 'photo'; photo: string; alt: Bilingual }
  | { kind: 'video'; video: string; poster: string; alt: Bilingual; sound?: boolean }
  | { kind: 'youtube'; youtube: string; poster: string; alt: Bilingual }
  | { kind: 'vimeo'; vimeo: string; poster: string; alt: Bilingual };

export type Moment = {
  id: string;
  index: number;
  date: string;
  year: number;
  label?: Bilingual;
  title: Bilingual;
  text?: Bilingual;
  media: MediaItem[];
  hidden: boolean;
};

export class TimelineError extends Error {
  constructor(problems: string[], file: string) {
    const body = problems.map((p) => `  • ${p}`).join('\n');
    super(
      `\n\n✋ timeline.json — ${problems.length === 1 ? 'βρέθηκε 1 πρόβλημα / found 1 problem' : `βρέθηκαν ${problems.length} προβλήματα / found ${problems.length} problems`}\n` +
        `   (${file})\n\n${body}\n\n` +
        `   Διόρθωσέ το και αποθήκευσε ξανά. Ο ζωντανός ιστότοπος δεν επηρεάστηκε.\n` +
        `   Fix it and save again. The live site has not been affected.\n`,
    );
    this.name = 'TimelineError';
  }
}

const both = (el: string, en: string) => `${el}\n    ${en}`;

function lineCol(text: string, pos: number) {
  const before = text.slice(0, pos);
  const line = before.split('\n').length;
  const col = pos - before.lastIndexOf('\n');
  return { line, col };
}

function prevNonSpace(text: string, pos: number) {
  let i = pos - 1;
  while (i >= 0 && /\s/.test(text[i]!)) i--;
  return i;
}

/** Turn a JSON.parse error into a friendly message with a line number. */
export function explainJsonError(text: string, err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  let m = msg.match(/position (\d+)/);
  if (!m) {
    // Some engines give no position. Look for the most common mistakes ourselves.
    const trailing = /,(\s*)[\]}]/.exec(text);
    if (trailing)
      m = ['', String(trailing.index + 1 + trailing[1].length)] as unknown as RegExpMatchArray;
    const tok = msg.match(/Unexpected token '(.)'/);
    if (!m && tok) {
      const snip =
        msg.match(/\.\.\."([\s\S]*?)"\.\.\./) ?? msg.match(/"([\s\S]*?)" is not valid JSON/);
      const at = snip ? text.indexOf(snip[1]!.replace(/^\.\.\./, '')) : -1;
      if (at >= 0) m = ['', String(at + snip![1]!.indexOf(tok[1]!))] as unknown as RegExpMatchArray;
    }
  }
  if (!m) {
    if (/Unexpected end/i.test(msg))
      return both(
        'Το αρχείο τελειώνει απότομα: λείπει κάποιο κλείσιμο } ή ] στο τέλος.',
        'The file ends too early: a closing } or ] is missing at the end.',
      );
    return both(
      `Το αρχείο δεν είναι έγκυρο JSON (${msg}).`,
      `The file is not valid JSON (${msg}).`,
    );
  }
  const pos = Number(m[1]);
  const ch = text[pos] ?? '';
  const prev = prevNonSpace(text, pos);
  const prevCh = text[prev] ?? '';
  const here = lineCol(text, pos);
  const prevLine = lineCol(text, Math.max(prev, 0)).line;

  if ((ch === ']' || ch === '}') && prevCh === ',')
    return both(
      `Γραμμή ${prevLine}: περιττό κόμμα πριν από το «${ch}». Σβήσε το τελευταίο κόμμα.`,
      `Line ${prevLine}: extra comma before "${ch}". Delete that last comma.`,
    );
  if (
    (ch === '{' && (prevCh === '}' || prevCh === '"')) ||
    (ch === '"' && (prevCh === '"' || prevCh === '}' || prevCh === ']'))
  )
    return both(
      `Γραμμή ${prevLine}: λείπει κόμμα στο τέλος της γραμμής (μετά το προηγούμενο ${ch === '{' ? 'moment' : 'πεδίο'}).`,
      `Line ${prevLine}: missing comma at the end of the line (after the previous ${ch === '{' ? 'moment' : 'field'}).`,
    );
  if (/Bad control character|Unterminated string/i.test(msg))
    return both(
      `Γραμμή ${here.line}: ένα κείμενο δεν κλείνει με εισαγωγικά " (ή έχει αλλαγή γραμμής μέσα του).`,
      `Line ${here.line}: a text is missing its closing quote " (or has a line break inside it).`,
    );
  if (ch === "'" || ch === '“' || ch === '”' || ch === '«')
    return both(
      `Γραμμή ${here.line}: χρησιμοποίησε απλά εισαγωγικά " γύρω από τα ονόματα και τα κείμενα (όχι ' ή “ ”).`,
      `Line ${here.line}: use plain double quotes " around names and texts (not ' or “ ”).`,
    );
  if (/property name/i.test(msg))
    return both(
      `Γραμμή ${here.line}, στήλη ${here.col}: το όνομα του πεδίου πρέπει να είναι μέσα σε " ".`,
      `Line ${here.line}, column ${here.col}: the field name must be inside " ".`,
    );
  return both(
    `Γραμμή ${here.line}, στήλη ${here.col}: κάτι λείπει ή περισσεύει εδώ (συνήθως κόμμα ή εισαγωγικά).`,
    `Line ${here.line}, column ${here.col}: something is missing or extra here (usually a comma or a quote).`,
  );
}

function levenshtein(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0]![j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i]![j] = Math.min(
        dp[i - 1]![j]! + 1,
        dp[i]![j - 1]! + 1,
        dp[i - 1]![j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
  return dp[a.length]![b.length]!;
}

function suggest(name: string, files: string[]) {
  let best = '';
  let score = Infinity;
  for (const f of files) {
    const s = levenshtein(name.toLowerCase(), f.toLowerCase());
    if (s < score) {
      score = s;
      best = f;
    }
  }
  return score <= Math.max(3, Math.floor(name.length / 3)) ? best : '';
}

/** Accept "x.jpg", "/x.jpg", "media/x.jpg", "src/content/timeline/media/x.jpg" (Pages CMS paths). */
export function normaliseName(v: unknown): unknown {
  if (typeof v !== 'string') return v;
  return v
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.?\//, '')
    .replace(/^src\/content\/timeline\//, '')
    .replace(/^media\//, '');
}

const filled = (v: unknown) =>
  v !== undefined && v !== null && !(typeof v === 'string' && !v.trim());

const ext = (f: string) => f.split('.').pop()?.toLowerCase() ?? '';
const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === 'object' && !Array.isArray(v);

export function validateTimeline(
  text: string,
  mediaDir: string,
  file = 'timeline.json',
): { moments: Moment[]; warnings: string[] } {
  // Strip a UTF-8 BOM that some Windows editors add.
  text = text.replace(/^﻿/, '');
  if (!text.trim()) return { moments: [], warnings: [] };

  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (err) {
    throw new TimelineError([explainJsonError(text, err)], file);
  }
  if (!Array.isArray(raw))
    throw new TimelineError(
      [
        both(
          'Το αρχείο πρέπει να ξεκινά με [ και να τελειώνει με ].',
          'The file must start with [ and end with ].',
        ),
      ],
      file,
    );

  const files = fs.existsSync(mediaDir)
    ? fs
        .readdirSync(mediaDir, { recursive: true, withFileTypes: true })
        .filter((d) => d.isFile())
        .map((d) =>
          path.relative(mediaDir, path.join(d.parentPath, d.name)).split(path.sep).join('/'),
        )
    : [];
  const fileSet = new Set(files);

  const problems: string[] = [];
  const warnings: string[] = [];
  const moments: Moment[] = [];

  raw.forEach((item: unknown, i) => {
    const n = i + 1;
    const where = (m: Record<string, unknown>) => {
      const t = isObj(m.title) ? m.title.el || m.title.en : undefined;
      return t ? `#${n} «${t}»` : `#${n}`;
    };
    if (!isObj(item)) {
      problems.push(
        both(`Moment ${n}: πρέπει να είναι μέσα σε { }.`, `Moment ${n}: must be inside { }.`),
      );
      return;
    }
    const w = where(item);
    const p = (el: string, en: string) =>
      problems.push(both(`Moment ${w}: ${el}`, `Moment ${w}: ${en}`));

    // date
    const date = typeof item.date === 'number' ? String(item.date) : item.date;
    let year = NaN;
    if (typeof date !== 'string' || !date.trim()) {
      p(
        'λείπει η ημερομηνία "date" (π.χ. "2009" ή "2009-06").',
        'the "date" is missing (e.g. "2009" or "2009-06").',
      );
    } else if (!/^\d{4}(-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?)?$/.test(date.trim())) {
      p(
        `η ημερομηνία "${date}" δεν είναι σωστή. Γράψε "2009", "2009-06" ή "2009-06-15".`,
        `the date "${date}" is not valid. Write "2009", "2009-06" or "2009-06-15".`,
      );
    } else year = Number(date.slice(0, 4));

    const bil = (key: string, required: boolean): Bilingual | undefined => {
      const v = item[key];
      if (v === undefined || v === null || v === '') {
        if (required)
          p(
            `λείπει ο τίτλος "${key}" (τουλάχιστον σε μία γλώσσα).`,
            `the "${key}" is missing (at least one language).`,
          );
        return undefined;
      }
      if (typeof v === 'string') return { el: v, en: v };
      if (!isObj(v) || (typeof v.el !== 'string' && typeof v.en !== 'string')) {
        p(
          `το "${key}" πρέπει να είναι { "el": "…", "en": "…" }.`,
          `"${key}" must look like { "el": "…", "en": "…" }.`,
        );
        return undefined;
      }
      const out: Bilingual = {};
      if (typeof v.el === 'string' && v.el.trim()) out.el = v.el.trim();
      if (typeof v.en === 'string' && v.en.trim()) out.en = v.en.trim();
      if (!out.el && !out.en) {
        if (required) p(`ο τίτλος "${key}" είναι κενός.`, `the "${key}" is empty.`);
        return undefined;
      }
      return out;
    };

    const title = bil('title', true);
    const label = bil('label', false);
    const textV = bil('text', false);
    if (textV)
      for (const l of ['el', 'en'] as const)
        if ((textV[l]?.length ?? 0) > site.timeline.maxTextLength)
          p(
            `το κείμενο (${l}) έχει ${textV[l]!.length} χαρακτήρες· το όριο είναι ${site.timeline.maxTextLength}.`,
            `the text (${l}) has ${textV[l]!.length} characters; the limit is ${site.timeline.maxTextLength}.`,
          );

    for (const [k, v] of [
      ['title', title],
      ['text', textV],
      ['label', label],
    ] as const)
      if (v && (!v.el || !v.en))
        warnings.push(
          `Moment ${w}: "${k}" ${v.el ? 'has no English (en) — Greek is shown on /en/' : 'has no Greek (el) — English is shown on /'}`,
        );

    const checkFile = (
      name: unknown,
      field: string,
      allowed: string[],
      what: { el: string; en: string },
    ) => {
      if (typeof name !== 'string' || !name.trim()) {
        p(`λείπει το "${field}".`, `"${field}" is missing.`);
        return false;
      }
      if (!fileSet.has(name)) {
        const s = suggest(name, files);
        p(
          `${what.el} '${name}' δεν βρέθηκε στον φάκελο media/.${s ? ` Μήπως εννοείς '${s}';` : ''}`,
          `${what.en} '${name}' not found in the media/ folder.${s ? ` Did you mean '${s}'?` : ''}`,
        );
        return false;
      }
      if (!allowed.includes(ext(name))) {
        p(
          `το '${name}' δεν είναι ${what.el.toLowerCase()} που υποστηρίζεται (${allowed.join(', ')}).`,
          `'${name}' is not a supported ${what.en.toLowerCase()} (${allowed.join(', ')}).`,
        );
        return false;
      }
      return true;
    };

    const media: MediaItem[] = [];
    const rawMedia = item.media ?? [];
    if (!Array.isArray(rawMedia)) {
      p('το "media" πρέπει να είναι λίστα [ … ].', '"media" must be a list [ … ].');
    } else {
      rawMedia.forEach((mRaw: unknown, j) => {
        let m: unknown = mRaw;
        const mi = `media ${j + 1}`;
        if (!isObj(m)) {
          p(`το ${mi} πρέπει να είναι μέσα σε { }.`, `${mi} must be inside { }.`);
          return;
        }
        // Drop empty fields (form editors write "" for unused ones) and tidy file names.
        m = Object.fromEntries(
          Object.entries(m)
            .filter(([, v]) => filled(v))
            .map(([k, v]) => [k, ['photo', 'video', 'poster'].includes(k) ? normaliseName(v) : v]),
        );
        if (!isObj(m)) return;
        let alt: Bilingual | undefined;
        if (typeof m.alt === 'string' && m.alt.trim()) alt = { el: m.alt.trim(), en: m.alt.trim() };
        else if (
          isObj(m.alt) &&
          ((typeof m.alt.el === 'string' && m.alt.el.trim()) ||
            (typeof m.alt.en === 'string' && m.alt.en.trim()))
        )
          alt = {
            el: (m.alt.el as string | undefined)?.trim() || undefined,
            en: (m.alt.en as string | undefined)?.trim() || undefined,
          };
        if (!alt)
          p(
            `στο ${mi} λείπει η περιγραφή "alt" (τι δείχνει η φωτογραφία/το βίντεο). Είναι υποχρεωτική.`,
            `${mi} is missing its "alt" description (what the photo/video shows). It is required.`,
          );
        const posterOk = (k: string) =>
          checkFile(m.poster, 'poster', IMAGE_EXT, {
            el: 'Η εικόνα εξωφύλλου',
            en: 'Cover image',
          }) && k;
        if ('photo' in m) {
          if (checkFile(m.photo, 'photo', IMAGE_EXT, { el: 'Η φωτογραφία', en: 'Photo' }) && alt)
            media.push({ kind: 'photo', photo: m.photo as string, alt });
        } else if ('video' in m) {
          const ok = checkFile(m.video, 'video', VIDEO_EXT, { el: 'Το βίντεο', en: 'Video' });
          if (ok) {
            const size = fs.statSync(path.join(mediaDir, m.video as string)).size / 1024 / 1024;
            if (size > site.timeline.maxVideoMB * 1.5)
              p(
                `το βίντεο '${m.video}' είναι ${size.toFixed(1)} MB. Κράτα τα σύντομα βίντεο κάτω από ${site.timeline.maxVideoMB} MB (δες README).`,
                `video '${m.video}' is ${size.toFixed(1)} MB. Keep short clips under ${site.timeline.maxVideoMB} MB (see README).`,
              );
            else if (size > site.timeline.maxVideoMB)
              warnings.push(
                `Moment ${w}: video '${m.video}' is ${size.toFixed(1)} MB (target ≤ ${site.timeline.maxVideoMB} MB).`,
              );
          }
          if (posterOk('v') && ok && alt)
            media.push({
              kind: 'video',
              video: m.video as string,
              poster: m.poster as string,
              alt,
              sound: m.sound === true,
            });
        } else if ('youtube' in m || 'vimeo' in m) {
          const k = 'youtube' in m ? 'youtube' : 'vimeo';
          const id = String(m[k] ?? '').trim();
          const okId = k === 'youtube' ? /^[\w-]{6,20}$/.test(id) : /^\d{5,12}$/.test(id);
          if (!okId)
            p(
              `το ${k} "${id}" δεν μοιάζει με κωδικό βίντεο. Γράψε μόνο τον κωδικό (π.χ. ${k === 'youtube' ? '"dQw4w9WgXcQ"' : '"76979871"'}), όχι ολόκληρο το link.`,
              `${k} "${id}" does not look like a video id. Write only the id (e.g. ${k === 'youtube' ? '"dQw4w9WgXcQ"' : '"76979871"'}), not the full link.`,
            );
          if (posterOk(k) && okId && alt)
            media.push(
              k === 'youtube'
                ? { kind: 'youtube', youtube: id, poster: m.poster as string, alt }
                : { kind: 'vimeo', vimeo: id, poster: m.poster as string, alt },
            );
        } else {
          p(
            `το ${mi} χρειάζεται "photo", "video", "youtube" ή "vimeo".`,
            `${mi} needs "photo", "video", "youtube" or "vimeo".`,
          );
        }
      });
      const photos = media.filter((x) => x.kind === 'photo').length;
      const others = media.length - photos;
      if (photos > site.timeline.maxPhotos || others > 1 || (others === 1 && photos > 0))
        p(
          `ένα moment μπορεί να έχει έως ${site.timeline.maxPhotos} φωτογραφίες Ή 1 βίντεο Ή 1 YouTube/Vimeo link.`,
          `a moment can have up to ${site.timeline.maxPhotos} photos OR 1 video OR 1 YouTube/Vimeo link.`,
        );
    }

    if (item.hidden !== undefined && typeof item.hidden !== 'boolean')
      p(
        'το "hidden" πρέπει να είναι true ή false (χωρίς εισαγωγικά).',
        '"hidden" must be true or false (without quotes).',
      );

    if (title && !Number.isNaN(year))
      moments.push({
        id: `${(date as string).trim()}-${n}`,
        index: i,
        date: (date as string).trim(),
        year,
        label,
        title,
        text: textV,
        media,
        hidden: item.hidden === true,
      });
  });

  if (problems.length) throw new TimelineError(problems, file);
  return { moments, warnings };
}

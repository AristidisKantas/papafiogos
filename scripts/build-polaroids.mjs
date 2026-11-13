// Turns the owner's original photos into black & white "Polaroid" prints for the timeline.
//   node scripts/build-polaroids.mjs
// Input:  photos-originals/<year>.jpg or <year>-<n>.jpg   (git-ignored, full size)
// Output: src/content/timeline/media/<year>-polaroid.jpg (one print per year)
//
// Several photos for the same year become one collage inside the same print.
// Order: collage -> black & white -> Polaroid look (faded blacks, grain, soft vignette, frame).
// Crops: each photo is cropped around a focus point (x, y as 0..1 of the photo). Tune FOCUS
// below if a face is cut; anything not listed uses sharp's "attention" crop.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'photos-originals');
const outDir = path.join(root, 'src/content/timeline/media');

// Print geometry (classic instant print: square picture, wide bottom border).
const IMG = 1400; // picture area, px (square)
const SIDE = 76; // left / right / top border
const BOTTOM = 330; // the "write on me" strip
const GUTTER = 14; // white line between photos in a collage
const PAPER = 244; // frame colour (warm-ish white in greyscale)

// Focus points per file (x, y of the important part, 0..1). Optional.
const FOCUS = {
  '2009.JPG': [0.55, 0.45],
  '2011.jpg': [0.5, 0.34],
  '2014-0.jpg': [0.5, 0.5],
  '2014-1.jpg': [0.5, 0.55],
  '2014-2.jpg': [0.6, 0.6],
  '2014-3.jpg': [0.5, 0.45],
  '2017-1.jpg': [0.5, 0.45],
  '2017-2.jpg': [0.5, 0.6],
  '2018-2.jpg': [0.5, 0.55],
  '2018-3.jpg': [0.45, 0.45],
  '2020.jpg': [0.5, 0.4],
  '2023.jpg': [0.5, 0.42],
  '2026.jpg': [0.5, 0.5],
};

// Collage layouts: cells as [x, y, w, h] fractions of the picture area, in file order.
const LAYOUTS = {
  1: [[0, 0, 1, 1]],
  2: [
    [0, 0, 1, 0.5],
    [0, 0.5, 1, 0.5],
  ],
  3: [
    [0, 0, 0.6, 1],
    [0.6, 0, 0.4, 0.5],
    [0.6, 0.5, 0.4, 0.5],
  ],
  // first photo across the top, three below
  4: [
    [0, 0, 1, 0.5],
    [0, 0.5, 1 / 3, 0.5],
    [1 / 3, 0.5, 1 / 3, 0.5],
    [2 / 3, 0.5, 1 / 3, 0.5],
  ],
};

/** Crop `file` to w×h around its focus point, return greyscale-ready buffer. */
async function cropTo(file, w, h) {
  const img = sharp(path.join(srcDir, file)).rotate();
  const focus = FOCUS[file];
  if (!focus) return img.resize(w, h, { fit: 'cover', position: 'attention' }).toBuffer();
  const { width: W, height: H } = await img.metadata();
  const scale = Math.max(w / W, h / H);
  const cw = Math.round(w / scale);
  const ch = Math.round(h / scale);
  const left = Math.min(W - cw, Math.max(0, Math.round(focus[0] * W - cw / 2)));
  const top = Math.min(H - ch, Math.max(0, Math.round(focus[1] * H - ch / 2)));
  return img.extract({ left, top, width: cw, height: ch }).resize(w, h).toBuffer();
}

async function collage(files) {
  const cells = LAYOUTS[files.length];
  if (!cells) throw new Error(`No collage layout for ${files.length} photos`);
  const g = GUTTER / 2;
  const parts = await Promise.all(
    files.map(async (f, i) => {
      const [x, y, w, h] = cells[i];
      // inner edges get half a gutter each; outer edges none
      const l = Math.round(x * IMG + (x > 0 ? g : 0));
      const t = Math.round(y * IMG + (y > 0 ? g : 0));
      const r = Math.round((x + w) * IMG - (x + w < 1 ? g : 0));
      const b = Math.round((y + h) * IMG - (y + h < 1 ? g : 0));
      return { input: await cropTo(f, r - l, b - t), left: l, top: t };
    }),
  );
  return sharp({
    create: { width: IMG, height: IMG, channels: 3, background: { r: PAPER, g: PAPER, b: PAPER } },
  })
    .composite(parts)
    .png()
    .toBuffer();
}

/** Black & white + instant-film look, applied to the whole picture area. */
async function filmLook(buf, seed) {
  const { data } = await sharp(buf)
    .greyscale()
    .normalise({ lower: 1, upper: 99 }) // even out very dark / very bright originals
    .raw()
    .toBuffer({ resolveWithObject: true });
  let s = seed;
  const rand = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const out = Buffer.alloc(IMG * IMG);
  for (let y = 0; y < IMG; y++) {
    for (let x = 0; x < IMG; x++) {
      const i = y * IMG + x;
      let v = data[i] / 255;
      v = v * v * (3 - 2 * v) * 0.55 + v * 0.45; // gentle S-curve (more contrast in mids)
      const dx = x / IMG - 0.5;
      const dy = y / IMG - 0.5;
      v *= 1 - 0.28 * Math.pow(dx * dx + dy * dy, 1.1) * 2; // soft vignette
      v = 0.07 + v * 0.88; // faded blacks, softened whites
      v += (rand() + rand() - 1) * 0.03; // film grain
      out[i] = Math.max(0, Math.min(255, Math.round(v * 255)));
    }
  }
  return sharp(out, { raw: { width: IMG, height: IMG, channels: 1 } })
    .blur(0.5) // instant film is never razor sharp
    .png()
    .toBuffer();
}

/** The frame: slightly uneven paper, faint inner shadow where the picture sits. */
async function frame(picture, seed) {
  const W = IMG + 2 * SIDE;
  const H = IMG + SIDE + BOTTOM;
  let s = seed;
  const rand = () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
  const paper = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) paper[i] = PAPER + Math.round((rand() - 0.5) * 6);
  const edge = Buffer.from(
    `<svg width="${IMG}" height="${IMG}"><rect x="0.5" y="0.5" width="${IMG - 1}" height="${IMG - 1}" fill="none" stroke="#000" stroke-opacity="0.25" stroke-width="2"/></svg>`,
  );
  return sharp(paper, { raw: { width: W, height: H, channels: 1 } })
    .composite([
      { input: picture, left: SIDE, top: SIDE },
      { input: edge, left: SIDE, top: SIDE },
    ])
    .greyscale()
    .jpeg({ quality: 88, mozjpeg: true, chromaSubsampling: '4:4:4' })
    .toBuffer();
}

// Group originals by year (file name starts with the year).
const groups = new Map();
for (const f of fs.readdirSync(srcDir).sort()) {
  const m = f.match(/^(\d{4})(?:[-_ ].*)?\.(jpe?g|png|webp|tiff?)$/i);
  if (!m) {
    console.warn(`skip ${f} (name must start with the year, e.g. 2014-1.jpg)`);
    continue;
  }
  if (!groups.has(m[1])) groups.set(m[1], []);
  groups.get(m[1]).push(f);
}

for (const [year, files] of groups) {
  const seed = Number(year) * 7919;
  const pic = await filmLook(await collage(files), seed);
  const jpg = await frame(pic, seed + 1);
  const name = `${year}-polaroid.jpg`;
  fs.writeFileSync(path.join(outDir, name), jpg);
  console.log(`${name}  ${files.join(' + ')}  ${(jpg.length / 1024).toFixed(0)} KB`);
}

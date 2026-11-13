// Turns photos of the owner's handwriting into clean, black, transparent SVGs.
//   node scripts/build-slogan.mjs
// Input:  scripts/vendor/*.jpg (phone photos, blue pen on paper) - see JOBS
// Output: src/assets/brand/<name>.json  ({ viewBox, width, height, d })
//         src/assets/brand/<name>.svg   (standalone, for reference)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import potrace from 'potrace';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'src/assets/brand');
// Decimals kept in the output path. 0 is visually identical (checked at 3x the largest
// size on the site): 1 unit = half a pixel of the photo crop.
const PRECISION = Number(process.env.HAND_PRECISION ?? 0);

// Each job: a photo of the owner's handwriting, the region that holds one phrase, the output name.
// Crops are in the photo's own pixels (both photos are 4032×3024).
const JOBS = [
  {
    src: 'ishootyousmile_handwritten.jpg',
    crop: { left: 200, top: 1080, width: 3500, height: 680 },
    out: 'slogan-handwritten',
    label: 'I shoot. You smile.',
  },
  {
    src: 'talktome.jpg',
    crop: { left: 950, top: 650, width: 1900, height: 720 },
    out: 'talk-el-handwritten',
    label: 'Μίλα μου.',
  },
  {
    src: 'talktome.jpg',
    crop: { left: 620, top: 1540, width: 2550, height: 780 },
    out: 'talk-en-handwritten',
    label: 'Talk to me.',
  },
];

// Timeline titles (timeline.jpg): one phrase per moment and language -> timeline/<year>-<lang>.
// The site shows them instead of the typed title when site.timeline.handwrittenTitles is on.
// Some cells are the same phrase in both languages (Instagram, Video Clips, Papafiogos TV).
const TITLE_CROPS = {
  '2009-el': [330, 180, 1160, 270],
  '2009-en': [1720, 180, 1060, 240],
  '2011-el': [250, 460, 1960, 230],
  '2011-en': [250, 695, 1700, 180],
  '2014-el': [270, 980, 790, 250],
  '2014-en': [270, 980, 790, 250],
  '2017-el': [1340, 970, 920, 230],
  '2017-en': [1340, 970, 920, 230],
  '2018-el': [260, 1340, 1040, 310],
  '2018-en': [260, 1340, 1040, 310],
  '2020-el': [250, 1710, 1060, 230],
  '2020-en': [1510, 1710, 800, 200],
  '2023-el': [280, 2050, 920, 230],
  '2023-en': [1540, 2040, 920, 220],
  '2026-el': [260, 2470, 590, 200],
  '2026-en': [1140, 2460, 770, 260],
};
fs.mkdirSync(path.join(outDir, 'timeline'), { recursive: true });
for (const [key, [left, top, width, height]] of Object.entries(TITLE_CROPS)) {
  JOBS.push({
    src: 'timeline.jpg',
    crop: { left, top, width, height },
    out: `timeline/${key}`,
    label: key,
    turd: Number(process.env.TITLE_TURD ?? 6), // small writing: keep accents and full stops
  });
}

for (const job of JOBS) await trace(job);

async function trace({ src: file, crop, out: name, label, turd = 40 }) {
  const src = path.join(root, 'scripts/vendor', file);
  // 1. Ink mask: compare each pixel with a heavily blurred copy (= the paper and its
  //    lighting), so shadows and the vignette disappear; keep dark or blue strokes.
  const img = sharp(src).rotate().extract(crop);
  const { data, info } = await img.clone().raw().toBuffer({ resolveWithObject: true });
  const bg = await img.clone().blur(40).raw().toBuffer();
  const { width: W, height: H, channels: C } = info;
  const mask = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) {
    const [r, g, b] = [data[i * C], data[i * C + 1], data[i * C + 2]];
    const [br, bgg, bb] = [bg[i * C], bg[i * C + 1], bg[i * C + 2]];
    const lum = (0.3 * r + 0.59 * g + 0.11 * b) / (0.3 * br + 0.59 * bgg + 0.11 * bb);
    const blue = b - r - (bb - br);
    mask[i] = lum < 0.78 || (blue > 28 && lum < 0.92) ? 0 : 255;
  }
  const png = await sharp(mask, { raw: { width: W, height: H, channels: 1 } })
    .median(3) // smooth ragged edges a little
    .resize({ width: Math.round(W / 2) }) // half resolution: plenty for a web slogan, far smaller path
    .png()
    .toBuffer();

  // 2. Trace to vector. turdSize (`turd`) drops paper specks smaller than that many pixels.
  const svg = await new Promise((resolve, reject) =>
    potrace.trace(
      png,
      { turdSize: turd, optTolerance: 0.4, alphaMax: 1, threshold: 128, color: '#000' },
      (err, out) => (err ? reject(err) : resolve(out)),
    ),
  );
  // round coordinates to 1 decimal to shrink the path
  const d = svg
    .match(/ d="([^"]+)"/)[1]
    .replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n) * 10) / 10));

  // 3. Tight bounding box (from the mask, ignoring specks potrace dropped is close enough;
  //    use the traced path's coordinates for exactness).
  const nums = d.match(/-?\d+(\.\d+)?/g).map(Number);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    minX = Math.min(minX, nums[i]);
    maxX = Math.max(maxX, nums[i]);
    minY = Math.min(minY, nums[i + 1]);
    maxY = Math.max(maxY, nums[i + 1]);
  }
  const pad = 6;
  const vb = [minX - pad, minY - pad, maxX - minX + 2 * pad, maxY - minY + 2 * pad].map((v) =>
    Math.round(v),
  );
  const out = { viewBox: vb.join(' '), width: vb[2], height: vb[3], d: compact(d, PRECISION) };
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(out) + '\n');
  fs.writeFileSync(
    path.join(outDir, `${name}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${out.viewBox}" role="img" aria-label="${label}"><path fill="#000" fill-rule="evenodd" d="${out.d}"/></svg>\n`,
  );
  console.log(`${name}: ${vb[2]}×${vb[3]}, path ${(out.d.length / 1024).toFixed(1)} KB`);
}

/**
 * Rewrite potrace's absolute path (M/C/L/Z) as a compact relative path: lower-case commands,
 * repeated commands without the letter, no commas, coordinates rounded to `dec` decimals.
 * Rounding is done against the already-rounded current point, so errors never add up.
 */
function compact(d, dec) {
  const f = 10 ** dec;
  const r = (v) => Math.round(v * f) / f;
  const fmt = (v) => String(r(v) || 0).replace(/^(-?)0\./, '$1.');
  const toks = d.match(/[MCLZ]|-?\d*\.?\d+/gi);
  let out = '';
  let cx = 0,
    cy = 0,
    sx = 0,
    sy = 0,
    last = '',
    i = 0;
  const num = () => Number(toks[i++]);
  const emit = (cmd, nums) => {
    const body = nums.map(fmt).reduce((s, n) => s + (s && !n.startsWith('-') ? ' ' : '') + n, '');
    out += (cmd === last ? (body.startsWith('-') ? '' : ' ') : cmd) + body;
    last = cmd;
  };
  while (i < toks.length) {
    const c = toks[i++].toUpperCase();
    if (c === 'M') {
      const x = num(),
        y = num();
      if (!out) {
        cx = r(x);
        cy = r(y);
        emit('M', [cx, cy]);
      } else {
        const dx = r(x - cx),
          dy = r(y - cy);
        cx += dx;
        cy += dy;
        emit('m', [dx, dy]);
      }
      sx = cx;
      sy = cy;
      last = 'm-start'; // the next segment always repeats its letter
    } else if (c === 'C') {
      // potrace repeats "C" for each curve, but be safe with implicit repeats too
      do {
        const p = [num(), num(), num(), num(), num(), num()];
        const rel = [
          r(p[0] - cx),
          r(p[1] - cy),
          r(p[2] - cx),
          r(p[3] - cy),
          r(p[4] - cx),
          r(p[5] - cy),
        ];
        emit('c', rel);
        cx += rel[4];
        cy += rel[5];
      } while (i < toks.length && /^[-\d.]/.test(toks[i]));
    } else if (c === 'L') {
      do {
        const dx = r(num() - cx),
          dy = r(num() - cy);
        emit('l', [dx, dy]);
        cx += dx;
        cy += dy;
      } while (i < toks.length && /^[-\d.]/.test(toks[i]));
    } else if (c === 'Z') {
      out += 'z';
      last = 'z';
      cx = sx;
      cy = sy;
    } else throw new Error(`Unexpected path command ${c}`);
  }
  return out;
}

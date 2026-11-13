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

for (const job of JOBS) await trace(job);

async function trace({ src: file, crop, out: name, label }) {
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

  // 2. Trace to vector. turdSize drops paper specks; the full stops are much bigger.
  const svg = await new Promise((resolve, reject) =>
    potrace.trace(
      png,
      { turdSize: 40, optTolerance: 0.4, alphaMax: 1, threshold: 128, color: '#000' },
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
  const out = { viewBox: vb.join(' '), width: vb[2], height: vb[3], d };
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(out) + '\n');
  fs.writeFileSync(
    path.join(outDir, `${name}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${out.viewBox}" role="img" aria-label="${label}"><path fill="#000" fill-rule="evenodd" d="${d}"/></svg>\n`,
  );
  console.log(`${name}: ${vb[2]}×${vb[3]}, path ${(d.length / 1024).toFixed(1)} KB`);
}

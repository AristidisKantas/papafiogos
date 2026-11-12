// Builds every brand asset from the traced logo in scripts/vendor/.
//   npm run brand
// Outputs (committed, so this only needs re-running if the logo changes):
//   src/assets/brand/logo-paths.json   polished path data split into #face / #bowtie / #wordmark
//   src/assets/brand/logo.svg          black, grouped, polished
//   src/assets/brand/logo-white.svg    white variant
//   src/assets/brand/logo.png          transparent PNG fallback
//   public/favicon.svg, favicon.ico, apple-touch-icon.png, og-image.jpg
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vendor = path.join(root, 'scripts/vendor');
const brandDir = path.join(root, 'src/assets/brand');
const pub = path.join(root, 'public');

const VIEW_W = 511;
const VIEW_H = 701;
// Ramer–Douglas–Peucker tolerance in source px: removes the trace's micro-wobble
// and straightens edges that are meant to be straight, without changing the look.
const TOLERANCE = 0.3;

const src = fs.readFileSync(path.join(vendor, 'papafiogos-logo-black.svg'), 'utf8');
const d = src.match(/ d="([^"]+)"/)[1];

/** @returns {number[][][]} list of closed polygons */
function parse(dAttr) {
  return dAttr
    .split(/(?=M)/)
    .map((sp) => {
      const n = sp.match(/-?[\d.]+/g).map(Number);
      const pts = [];
      for (let i = 0; i < n.length; i += 2) pts.push([n[i], n[i + 1]]);
      return pts;
    })
    .filter((p) => p.length > 2);
}

function perpDist(p, a, b) {
  const [x, y] = p;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len === 0) return Math.hypot(x - x1, y - y1);
  return Math.abs(dy * x - dx * y + x2 * y1 - y2 * x1) / len;
}

function rdp(pts, eps) {
  if (pts.length < 3) return pts;
  let max = 0;
  let idx = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const dd = perpDist(pts[i], pts[0], pts[pts.length - 1]);
    if (dd > max) {
      max = dd;
      idx = i;
    }
  }
  if (max > eps) {
    const left = rdp(pts.slice(0, idx + 1), eps);
    const right = rdp(pts.slice(idx), eps);
    return left.slice(0, -1).concat(right);
  }
  return [pts[0], pts[pts.length - 1]];
}

/** Simplify a closed ring: split at the point farthest from the first one. */
function simplifyRing(ring) {
  let far = 0;
  let fd = 0;
  ring.forEach((p, i) => {
    const dd = Math.hypot(p[0] - ring[0][0], p[1] - ring[0][1]);
    if (dd > fd) {
      fd = dd;
      far = i;
    }
  });
  const a = rdp(ring.slice(0, far + 1), TOLERANCE);
  const b = rdp(ring.slice(far).concat([ring[0]]), TOLERANCE);
  return a.slice(0, -1).concat(b.slice(0, -1));
}

const fmt = (v) => (Math.round(v * 10) / 10).toString();
const toD = (rings) =>
  rings.map((r) => 'M' + r.map(([x, y]) => `${fmt(x)} ${fmt(y)}`).join('L') + 'Z').join('');

const groups = { face: [], bowtie: [], wordmark: [] };
for (const ring of parse(d)) {
  const ys = ring.map((p) => p[1]);
  const minY = Math.min(...ys);
  const g = minY >= 420 ? 'wordmark' : minY >= 270 && Math.max(...ys) < 400 ? 'bowtie' : 'face';
  groups[g].push(simplifyRing(ring));
}

const paths = {
  viewBox: `0 0 ${VIEW_W} ${VIEW_H}`,
  width: VIEW_W,
  height: VIEW_H,
  face: toD(groups.face),
  bowtie: toD(groups.bowtie),
  wordmark: toD(groups.wordmark),
  // centre of the bow tie knot, for the wiggle animation (transform-origin)
  bowtieOrigin: '249px 329px',
};
fs.mkdirSync(brandDir, { recursive: true });
fs.writeFileSync(path.join(brandDir, 'logo-paths.json'), JSON.stringify(paths, null, 2) + '\n');

const svg = (fill, parts = ['face', 'bowtie', 'wordmark'], viewBox = paths.viewBox) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-label="PAPAFIOGOS"><title>PAPAFIOGOS</title>` +
  parts
    .map((p) => `<path id="${p}" fill="${fill}" fill-rule="evenodd" d="${paths[p]}"/>`)
    .join('') +
  `</svg>\n`;

const black = svg('#000');
fs.writeFileSync(path.join(brandDir, 'logo.svg'), black);
fs.writeFileSync(path.join(brandDir, 'logo-white.svg'), svg('#fff'));

// favicon: face + bow tie only (the wordmark is unreadable at 16 px). Square viewBox.
const markBox = '-35 -35 580 580'; // covers y 7..379 & x 6..504 with a little air, square
const faviconSvg = svg('#000', ['face', 'bowtie'], markBox).replace(
  '<title>',
  '<style>path{fill:#000}@media (prefers-color-scheme:dark){path{fill:#fff}}</style><title>',
);
fs.mkdirSync(pub, { recursive: true });
fs.writeFileSync(path.join(pub, 'favicon.svg'), faviconSvg);

const markOnly = Buffer.from(svg('#000', ['face', 'bowtie'], markBox));
const full = Buffer.from(black);

// apple-touch-icon 180x180, black mark on white
await sharp({ create: { width: 180, height: 180, channels: 3, background: '#fff' } })
  .composite([
    {
      input: await sharp(markOnly, { density: 300 })
        .resize(150, 150, { fit: 'contain', background: '#fff0' })
        .png()
        .toBuffer(),
      gravity: 'centre',
    },
  ])
  .png()
  .toFile(path.join(pub, 'apple-touch-icon.png'));

// og-image 1200x630, full mark centred on white
const ogLogo = await sharp(full, { density: 300 }).resize({ height: 500 }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#fff' } })
  .composite([{ input: ogLogo, gravity: 'centre' }])
  .jpeg({ quality: 88, mozjpeg: true })
  .toFile(path.join(pub, 'og-image.jpg'));

// transparent PNG fallback
await sharp(full, { density: 144 })
  .resize({ width: VIEW_W })
  .png()
  .toFile(path.join(brandDir, 'logo.png'));

// favicon.ico (PNG-in-ICO, 32x32 + 16x16)
const icoImgs = [];
for (const s of [16, 32, 48]) {
  icoImgs.push({
    s,
    buf: await sharp(markOnly, { density: 300 })
      .resize(s, s, { fit: 'contain', background: '#fff0' })
      .png()
      .toBuffer(),
  });
}
const header = Buffer.alloc(6 + 16 * icoImgs.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoImgs.length, 4);
let offset = header.length;
icoImgs.forEach(({ s, buf }, i) => {
  const o = 6 + i * 16;
  header.writeUInt8(s === 256 ? 0 : s, o);
  header.writeUInt8(s === 256 ? 0 : s, o + 1);
  header.writeUInt8(0, o + 2);
  header.writeUInt8(0, o + 3);
  header.writeUInt16LE(1, o + 4);
  header.writeUInt16LE(32, o + 6);
  header.writeUInt32LE(buf.length, o + 8);
  header.writeUInt32LE(offset, o + 12);
  offset += buf.length;
});
fs.writeFileSync(
  path.join(pub, 'favicon.ico'),
  Buffer.concat([header, ...icoImgs.map((i) => i.buf)]),
);

const gz = zlib.gzipSync(black).length;
console.log(
  `logo.svg: ${(black.length / 1024).toFixed(1)} KB raw, ${(gz / 1024).toFixed(1)} KB gzipped ` +
    `(face ${groups.face.length}, bowtie ${groups.bowtie.length}, wordmark ${groups.wordmark.length} shapes)`,
);

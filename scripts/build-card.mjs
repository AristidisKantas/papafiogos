// Business card (85 x 55 mm, European size) in the site's look.   npm run card
//
// Outputs (committed):
//   templates/business-card/papafiogos-card-print.pdf   2 pages (front, back), 3 mm bleed, vector
//   templates/business-card/papafiogos-card-preview.png both sides, for looking at / sending
// Printers: the PDF is 91 x 61 mm = 85 x 55 trim + 3 mm bleed each side; keep 4 mm safe area.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';

const root = path.resolve(import.meta.dirname, '..');
const brand = path.join(root, 'src/assets/brand');
const outDir = path.join(root, 'templates/business-card');
fs.mkdirSync(outDir, { recursive: true });

// ---------- text (keep in sync with src/config/site.ts) ----------
const LINE = 'Φωτογραφία & βίντεο · Πάτρα';
const CONTACT = [
  ['papafiogos.gr', '@papafiogos'],
  ['papafiogos@gmail.com', '+30 697 895 4464'],
];

const W = 85;
const H = 55;
const BLEED = 3;

const font = fs
  .readFileSync(path.join(brand, '../fonts/inter-latin-greek.woff2'))
  .toString('base64');
const logo = fs.readFileSync(path.join(brand, 'logo.svg'), 'utf8');
const sloganWhite = fs
  .readFileSync(path.join(brand, 'slogan-handwritten.svg'), 'utf8')
  .replace(/fill="#000"/g, 'fill="#fff"')
  // the pen lines are thin; a hairline of stroke keeps them from breaking up in print
  .replace('<path ', '<path stroke="#fff" stroke-width="3" stroke-linejoin="round" ');

const css = `
@font-face { font-family: Inter; font-weight: 300 500; src: url(data:font/woff2;base64,${font}) format('woff2'); }
@page { size: ${W + 2 * BLEED}mm ${H + 2 * BLEED}mm; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Inter, sans-serif; }
.side { width: ${W + 2 * BLEED}mm; height: ${H + 2 * BLEED}mm; position: relative; overflow: hidden;
  break-after: page; display: grid; place-items: center; }
.side:last-child { break-after: auto; }
.front { background: #fff; }
.front svg { height: 31mm; width: auto; display: block; }
.back { background: #000; color: #fff; }
.back .inner { position: absolute; inset: ${BLEED}mm; display: flex; flex-direction: column;
  align-items: center; justify-content: center; text-align: center; padding: 5mm; }
.back .slogan svg { width: 52mm; height: auto; display: block; }
.back .line { margin-top: 5.2mm; font-size: 5.6pt; font-weight: 400; letter-spacing: 0.16em;
  text-transform: uppercase; color: rgb(255 255 255 / .62); }
.back .rule { width: 8mm; height: 0.2mm; background: rgb(255 255 255 / .35); margin: 3.4mm 0 3mm; }
.back .contact { font-size: 6.4pt; font-weight: 300; line-height: 1.75; letter-spacing: 0.03em; }
.back .contact span + span::before { content: '·'; margin: 0 0.6em; color: rgb(255 255 255 / .45); }
`;

const sides = {
  front: `<section class="side front">${logo}</section>`,
  back: `<section class="side back"><div class="inner">
    <div class="slogan">${sloganWhite}</div>
    <p class="line">${LINE.replace('&', '&amp;')}</p>
    <div class="rule"></div>
    <div class="contact">${CONTACT.map((l) => `<div>${l.map((x) => `<span>${x}</span>`).join('')}</div>`).join('')}</div>
  </div></section>`,
};
const html = (body) =>
  `<!doctype html><html lang="el"><head><meta charset="utf-8"><style>${css}</style></head><body>${body}</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage();

// 1. Print PDF (vector, both sides with bleed)
await page.setContent(html(sides.front + sides.back), { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const pdf = path.join(outDir, 'papafiogos-card-print.pdf');
await page.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });

// 2. Preview: both sides at trim size (bleed cut off), on a soft grey table with a shadow
const px = 11; // px per mm
const preview = `
<style>${css}
body { background: #e6e6e6; padding: 60px; display: flex; gap: 60px; width: max-content; }
.card { width: ${W * px}px; height: ${H * px}px; overflow: hidden; border-radius: 3px;
  box-shadow: 0 2px 4px rgb(0 0 0 / .12), 0 18px 40px rgb(0 0 0 / .18); }
.card .side { zoom: ${px / 3.7795}; margin: -${BLEED}mm; }
</style>
<div class="card">${sides.front}</div><div class="card">${sides.back}</div>`;
await page.setContent(html(preview), { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
const png = path.join(outDir, 'papafiogos-card-preview.png');
await page.locator('body').screenshot({ path: png });
await browser.close();

for (const f of [pdf, png])
  console.log(`✓ ${path.relative(root, f)} (${(fs.statSync(f).size / 1024).toFixed(0)} KB)`);

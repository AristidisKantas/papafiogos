// Builds the one-page client offer templates (Word) with the logo + handwritten slogan as a
// watermark behind the page.   npm run offer
//
// Outputs (committed):  templates/offer-el.docx, templates/offer-en.docx
// The .docx is written by hand (plain Office Open XML + a tiny zip writer), no dependencies
// beyond sharp. Edit the TEXT below and re-run; or just edit the .docx in Word.
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const brand = path.join(root, 'src/assets/brand');
const outDir = path.join(root, 'templates');
fs.mkdirSync(outDir, { recursive: true });

// ---------- contact (keep in sync with src/config/site.ts) ----------
const CONTACT = {
  web: 'papafiogos.gr',
  instagram: '@papafiogos',
  email: 'papafiogos@gmail.com',
  phone: '+30 697 895 4464',
};

// ---------- look ----------
const FONT = 'Arial'; // on every Windows/Mac Word, has Greek
const INK = '1A1A1A';
const MUTED = '7A7A7A';
const RULE = 'D0D0D0';
const WATERMARK = '#F5F5F5'; // very pale: the text on top must stay fully readable (owner: #ECECEC hid the letters)

// A4 in twips (1 cm = 567)
const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = 1134; // 2 cm
const CONTENT_W = PAGE_W - 2 * MARGIN;
const CM_EMU = 360000;

// ---------- watermark image: logo with the handwritten slogan under it ----------
const tint = (svg) => svg.replace(/fill="#000"/g, `fill="${WATERMARK}"`);
const WM_W = 1400; // px (≈ 12 cm wide at ~300 dpi)
const logo = await sharp(Buffer.from(tint(fs.readFileSync(path.join(brand, 'logo.svg'), 'utf8'))), {
  density: 400,
})
  .resize({ height: 1300 })
  .png()
  .toBuffer();
const slogan = await sharp(
  // a little stroke so the thin pen lines don't vanish in the pale grey
  Buffer.from(
    tint(fs.readFileSync(path.join(brand, 'slogan-handwritten.svg'), 'utf8')).replace(
      '<path ',
      `<path stroke="${WATERMARK}" stroke-width="4" stroke-linejoin="round" `,
    ),
  ),
  { density: 300 },
)
  .resize({ width: WM_W })
  .png()
  .toBuffer();
const lm = await sharp(logo).metadata();
const sm = await sharp(slogan).metadata();
const GAP = 110;
const WM_H = lm.height + GAP + sm.height;
const watermark = await sharp({
  create: { width: WM_W, height: WM_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
})
  .composite([
    { input: logo, left: Math.round((WM_W - lm.width) / 2), top: 0 },
    { input: slogan, left: 0, top: lm.height + GAP },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();
const wmCx = Math.round(13 * CM_EMU); // 13 cm wide on the page
const wmCy = Math.round((wmCx * WM_H) / WM_W);

// ---------- text ----------
const TEXT = {
  el: {
    lang: 'el-GR',
    title: 'ΠΡΟΣΦΟΡΑ',
    tagline: 'Φωτογραφία & βίντεο · Πάτρα',
    meta: [
      ['Αρ. προσφοράς', '[ΠΡ-2026-001]'],
      ['Ημερομηνία', '[ηη/μμ/εεεε]'],
      ['Ισχύει έως', '[ηη/μμ/εεεε]'],
    ],
    to: 'ΠΡΟΣ',
    toLines: ['[Ονοματεπώνυμο]', '[Εταιρεία]', '[Email · Τηλέφωνο]'],
    job: 'ΕΡΓΟ',
    jobLines: ['[Είδος: γάμος, βάπτιση, εταιρικό, προϊόντα…]', '[Ημερομηνία]', '[Τοποθεσία]'],
    cols: ['Υπηρεσία', 'Περιγραφή', 'Ποσό'],
    rows: [
      ['[Φωτογράφιση]', '[Διάρκεια, τι καλύπτει]', '[0,00 €]'],
      ['[Βίντεο]', '[Διάρκεια, τελικό μοντάζ]', '[0,00 €]'],
      ['[Επεξεργασία]', '[Αριθμός επεξεργασμένων φωτογραφιών]', '[0,00 €]'],
      ['[Επιπλέον]', '[π.χ. drone, άλμπουμ, μετακίνηση]', '[0,00 €]'],
    ],
    totals: [
      ['Υποσύνολο', '[0,00 €]'],
      ['ΦΠΑ 24%', '[0,00 €]'],
      ['Σύνολο', '[0,00 €]'],
    ],
    delivery: 'ΠΑΡΑΔΟΣΗ',
    deliveryText:
      '[Οι φωτογραφίες παραδίδονται σε ψηφιακή μορφή, μέσω online gallery, εντός [Χ] εργάσιμων ημερών.]',
    terms: 'ΟΡΟΙ',
    termsLines: [
      'Προκαταβολή [30]% για την κράτηση της ημερομηνίας, εξόφληση με την παράδοση.',
      'Η προσφορά ισχύει έως την ημερομηνία που αναγράφεται παραπάνω.',
      '[Μετακίνηση εκτός Πάτρας χρεώνεται επιπλέον.]',
    ],
    thanks: 'Ευχαριστώ για την εμπιστοσύνη.',
  },
  en: {
    lang: 'en-GB',
    title: 'OFFER',
    tagline: 'Photography & video · Patras, Greece',
    meta: [
      ['Offer no.', '[OF-2026-001]'],
      ['Date', '[dd/mm/yyyy]'],
      ['Valid until', '[dd/mm/yyyy]'],
    ],
    to: 'TO',
    toLines: ['[Full name]', '[Company]', '[Email · Phone]'],
    job: 'PROJECT',
    jobLines: ['[Type: wedding, christening, corporate, products…]', '[Date]', '[Location]'],
    cols: ['Service', 'Description', 'Amount'],
    rows: [
      ['[Photography]', '[Duration, what is covered]', '[€0.00]'],
      ['[Video]', '[Duration, final edit]', '[€0.00]'],
      ['[Editing]', '[Number of edited photos]', '[€0.00]'],
      ['[Extras]', '[e.g. drone, album, travel]', '[€0.00]'],
    ],
    totals: [
      ['Subtotal', '[€0.00]'],
      ['VAT 24%', '[€0.00]'],
      ['Total', '[€0.00]'],
    ],
    delivery: 'DELIVERY',
    deliveryText:
      '[Photos are delivered digitally, through an online gallery, within [X] working days.]',
    terms: 'TERMS',
    termsLines: [
      'A [30]% deposit books the date; the balance is due on delivery.',
      'This offer is valid until the date shown above.',
      '[Travel outside Patras is charged separately.]',
    ],
    thanks: 'Thank you for your trust.',
  },
};

// ---------- tiny OOXML helpers ----------
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const run = (text, o = {}) => {
  const rPr = [
    o.bold && '<w:b/>',
    o.color && `<w:color w:val="${o.color}"/>`,
    o.spacing && `<w:spacing w:val="${o.spacing}"/>`,
    o.size && `<w:sz w:val="${o.size}"/><w:szCs w:val="${o.size}"/>`,
  ]
    .filter(Boolean)
    .join('');
  return `<w:r>${rPr ? `<w:rPr>${rPr}</w:rPr>` : ''}<w:t xml:space="preserve">${esc(text)}</w:t></w:r>`;
};
const para = (runs, o = {}) => {
  // element order matters to Word (schema sequence): keepNext, pBdr, spacing, jc
  const pPr = [
    o.keep && '<w:keepNext/>',
    o.rule && `<w:pBdr><w:bottom w:val="single" w:sz="4" w:space="6" w:color="${RULE}"/></w:pBdr>`,
    `<w:spacing w:before="${o.before ?? 0}" w:after="${o.after ?? 0}"/>`,
    o.align && `<w:jc w:val="${o.align}"/>`,
  ]
    .filter(Boolean)
    .join('');
  return `<w:p><w:pPr>${pPr}</w:pPr>${Array.isArray(runs) ? runs.join('') : runs}</w:p>`;
};
const label = (text, o = {}) =>
  para(run(text, { color: MUTED, size: 15, spacing: 30, bold: true }), { after: 60, ...o });
const border = (side, color, sz = 4) =>
  `<w:${side} w:val="single" w:sz="${sz}" w:space="0" w:color="${color}"/>`;
const cell = (w, content, o = {}) =>
  `<w:tc><w:tcPr><w:tcW w:w="${w}" w:type="dxa"/>${
    o.borders ? `<w:tcBorders>${o.borders}</w:tcBorders>` : ''
  }<w:vAlign w:val="${o.vAlign ?? 'top'}"/></w:tcPr>${content}${
    // a cell must end with a paragraph, even after a nested table
    content.endsWith('</w:tbl>')
      ? '<w:p><w:pPr><w:spacing w:before="0" w:after="0"/><w:rPr><w:sz w:val="2"/></w:rPr></w:pPr></w:p>'
      : ''
  }</w:tc>`;
const table = (widths, rows, o = {}) =>
  `<w:tbl><w:tblPr><w:tblW w:w="${widths.reduce((a, b) => a + b, 0)}" w:type="dxa"/>${
    o.align ? `<w:jc w:val="${o.align}"/>` : ''
  }<w:tblLayout w:type="fixed"/><w:tblCellMar><w:top w:w="${o.padY ?? 0}" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="${
    o.padY ?? 0
  }" w:type="dxa"/><w:right w:w="${o.padX ?? 0}" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${widths
    .map((w) => `<w:gridCol w:w="${w}"/>`)
    .join(
      '',
    )}</w:tblGrid>${rows.map((r) => `<w:tr><w:trPr><w:cantSplit/></w:trPr>${r}</w:tr>`).join('')}</w:tbl>`;

function documentXml(t) {
  const half = CONTENT_W / 2;
  const body = [];

  // Title block: "OFFER" + tagline (left), offer number / dates (right)
  const metaRows = table(
    [1700, 1900],
    t.meta.map(
      ([k, v]) =>
        cell(1700, para(run(k, { color: MUTED, size: 17 }), { after: 40 })) +
        cell(1900, para(run(v, { size: 17 }), { after: 40, align: 'right' })),
    ),
    { align: 'right' },
  );
  body.push(
    table(
      [CONTENT_W - 3600, 3600],
      [
        cell(
          CONTENT_W - 3600,
          para(run(t.title, { size: 52, spacing: 60, bold: true }), { after: 40 }) +
            para(run(t.tagline, { color: MUTED, size: 18 })),
        ) + cell(3600, metaRows, { vAlign: 'bottom' }),
      ],
    ),
  );
  body.push(para('', { rule: true, after: 360 }));

  // To / Project
  const block = (head, lines) =>
    label(head) +
    lines
      .map((l, i) => para(run(l, { size: 19 }), { after: i === lines.length - 1 ? 0 : 40 }))
      .join('');
  body.push(
    table(
      [half, half],
      [cell(half, block(t.to, t.toLines)) + cell(half, block(t.job, t.jobLines))],
    ),
  );
  body.push(para('', { after: 420 }));

  // Services
  const W = [2700, CONTENT_W - 2700 - 1800, 1800];
  const head = t.cols
    .map((c, i) =>
      cell(
        W[i],
        para(run(c.toUpperCase(), { color: MUTED, size: 15, spacing: 30, bold: true }), {
          align: i === 2 ? 'right' : undefined,
        }),
        { borders: border('bottom', INK, 6) },
      ),
    )
    .join('');
  const rows = t.rows.map((r) =>
    r
      .map((c, i) =>
        cell(
          W[i],
          para(run(c, { size: 19, bold: i === 0 }), { align: i === 2 ? 'right' : undefined }),
          {
            borders: border('bottom', RULE),
            vAlign: 'center',
          },
        ),
      )
      .join(''),
  );
  body.push(table(W, [head, ...rows], { padY: 110, padX: 120 }));
  // a paragraph between the two tables, otherwise Word glues them into one
  body.push(para('', { after: 60 }));

  // Totals, right aligned under the amount column
  const TW = [2400, 1800];
  body.push(
    table(
      TW,
      t.totals.map(([k, v], i) => {
        const last = i === t.totals.length - 1;
        const b = last ? border('top', INK, 6) : '';
        return (
          cell(
            TW[0],
            para(run(k, { size: last ? 21 : 18, bold: last, color: last ? INK : MUTED })),
            {
              borders: b,
            },
          ) +
          cell(TW[1], para(run(v, { size: last ? 21 : 18, bold: last }), { align: 'right' }), {
            borders: b,
          })
        );
      }),
      { align: 'right', padY: 70, padX: 120 },
    ),
  );
  body.push(para('', { after: 420 }));

  // Delivery + terms side by side
  const DW = [half - 300, 300, half];
  body.push(
    table(DW, [
      cell(DW[0], label(t.delivery) + para(run(t.deliveryText, { size: 18 }), { after: 0 })) +
        cell(DW[1], para('')) +
        cell(
          DW[2],
          label(t.terms) +
            t.termsLines.map((l) => para(run(`–  ${l}`, { size: 18 }), { after: 50 })).join(''),
        ),
    ]),
  );
  body.push(para('', { after: 480 }));
  body.push(para(run(t.thanks, { size: 19 }), { after: 0 }));

  const sect = `<w:sectPr><w:headerReference w:type="default" r:id="rIdHeader"/><w:footerReference w:type="default" r:id="rIdFooter"/><w:pgSz w:w="${PAGE_W}" w:h="${PAGE_H}"/><w:pgMar w:top="${MARGIN}" w:right="${MARGIN}" w:bottom="${MARGIN}" w:left="${MARGIN}" w:header="567" w:footer="567" w:gutter="0"/></w:sectPr>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:body>${body.join('')}${sect}</w:body></w:document>`;
}

// The watermark lives in the header so it sits behind the text and repeats if the page ever overflows.
const headerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><w:p><w:pPr><w:spacing w:before="0" w:after="0"/></w:pPr><w:r><w:drawing><wp:anchor distT="0" distB="0" distL="0" distR="0" simplePos="0" relativeHeight="0" behindDoc="1" locked="1" layoutInCell="0" allowOverlap="1"><wp:simplePos x="0" y="0"/><wp:positionH relativeFrom="page"><wp:align>center</wp:align></wp:positionH><wp:positionV relativeFrom="page"><wp:align>center</wp:align></wp:positionV><wp:extent cx="${wmCx}" cy="${wmCy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapNone/><wp:docPr id="1" name="Watermark" descr="PAPAFIOGOS · I shoot. You smile."/><wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1"/></wp:cNvGraphicFramePr><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="1" name="watermark.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rIdWm"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${wmCx}" cy="${wmCy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:anchor></w:drawing></w:r></w:p></w:hdr>`;

const footerXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">${para(
  run([CONTACT.web, CONTACT.instagram, CONTACT.email, CONTACT.phone].join('   ·   '), {
    color: MUTED,
    size: 16,
  }),
  { align: 'center' },
)}</w:ftr>`;

const stylesXml = (lang) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="${FONT}" w:hAnsi="${FONT}" w:eastAsia="${FONT}" w:cs="${FONT}"/><w:color w:val="${INK}"/><w:sz w:val="19"/><w:szCs w:val="19"/><w:lang w:val="${lang}" w:eastAsia="${lang}" w:bidi="ar-SA"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="0" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/></w:style><w:style w:type="table" w:default="1" w:styleId="TableNormal"><w:name w:val="Normal Table"/><w:tblPr><w:tblInd w:w="0" w:type="dxa"/><w:tblCellMar><w:top w:w="0" w:type="dxa"/><w:left w:w="0" w:type="dxa"/><w:bottom w:w="0" w:type="dxa"/><w:right w:w="0" w:type="dxa"/></w:tblCellMar></w:tblPr></w:style></w:styles>`;

const settingsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:settings xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:defaultTabStop w:val="720"/><w:characterSpacingControl w:val="doNotCompress"/><w:compat><w:compatSetting w:name="compatibilityMode" w:uri="http://schemas.microsoft.com/office/word" w:val="15"/></w:compat></w:settings>`;

const contentTypes = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/settings.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.settings+xml"/><Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/><Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`;

const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const rels = (items) =>
  `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${items
    .map(([id, type, target]) => `<Relationship Id="${id}" Type="${type}" Target="${target}"/>`)
    .join('')}</Relationships>`;

const coreXml = (title) => `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:title>${esc(title)}</dc:title><dc:creator>PAPAFIOGOS</dc:creator></cp:coreProperties>`;

// ---------- zip (stored/deflate, fixed timestamp so rebuilds are reproducible) ----------
function zip(entries) {
  const chunks = [];
  const central = [];
  let offset = 0;
  const TIME = 0;
  const DATE = ((2026 - 1980) << 9) | (1 << 5) | 1;
  for (const [file, content] of entries) {
    const data = Buffer.isBuffer(content) ? content : Buffer.from(content, 'utf8');
    const packed = zlib.deflateRawSync(data, { level: 9 });
    const deflate = packed.length < data.length;
    const body = deflate ? packed : data;
    const name = Buffer.from(file, 'utf8');
    const crc = zlib.crc32(data);
    const head = Buffer.alloc(30);
    head.writeUInt32LE(0x04034b50, 0);
    head.writeUInt16LE(20, 4);
    head.writeUInt16LE(0x0800, 6);
    head.writeUInt16LE(deflate ? 8 : 0, 8);
    head.writeUInt16LE(TIME, 10);
    head.writeUInt16LE(DATE, 12);
    head.writeUInt32LE(crc, 14);
    head.writeUInt32LE(body.length, 18);
    head.writeUInt32LE(data.length, 22);
    head.writeUInt16LE(name.length, 26);
    chunks.push(head, name, body);
    const cen = Buffer.alloc(46);
    cen.writeUInt32LE(0x02014b50, 0);
    cen.writeUInt16LE(20, 4);
    cen.writeUInt16LE(20, 6);
    cen.writeUInt16LE(0x0800, 8);
    cen.writeUInt16LE(deflate ? 8 : 0, 10);
    cen.writeUInt16LE(TIME, 12);
    cen.writeUInt16LE(DATE, 14);
    cen.writeUInt32LE(crc, 16);
    cen.writeUInt32LE(body.length, 20);
    cen.writeUInt32LE(data.length, 24);
    cen.writeUInt16LE(name.length, 28);
    cen.writeUInt32LE(offset, 42);
    central.push(cen, name);
    offset += head.length + name.length + body.length;
  }
  const size = central.reduce((n, b) => n + b.length, 0);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(size, 12);
  end.writeUInt32LE(offset, 16);
  return Buffer.concat([...chunks, ...central, end]);
}

for (const [code, t] of Object.entries(TEXT)) {
  const file = path.join(outDir, `offer-${code}.docx`);
  fs.writeFileSync(
    file,
    zip([
      ['[Content_Types].xml', contentTypes],
      [
        '_rels/.rels',
        rels([
          ['rId1', `${R}/officeDocument`, 'word/document.xml'],
          [
            'rId2',
            'http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties',
            'docProps/core.xml',
          ],
        ]),
      ],
      ['docProps/core.xml', coreXml(`PAPAFIOGOS — ${t.title}`)],
      ['word/document.xml', documentXml(t)],
      ['word/styles.xml', stylesXml(t.lang)],
      ['word/settings.xml', settingsXml],
      ['word/header1.xml', headerXml],
      ['word/footer1.xml', footerXml],
      ['word/media/watermark.png', watermark],
      [
        'word/_rels/document.xml.rels',
        rels([
          ['rIdStyles', `${R}/styles`, 'styles.xml'],
          ['rIdSettings', `${R}/settings`, 'settings.xml'],
          ['rIdHeader', `${R}/header`, 'header1.xml'],
          ['rIdFooter', `${R}/footer`, 'footer1.xml'],
        ]),
      ],
      ['word/_rels/header1.xml.rels', rels([['rIdWm', `${R}/image`, 'media/watermark.png']])],
    ]),
  );
  console.log(`✓ ${path.relative(root, file)} (${(fs.statSync(file).size / 1024).toFixed(0)} KB)`);
}

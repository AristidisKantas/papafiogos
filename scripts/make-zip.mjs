// Packs the project into one .zip to move it to another computer.
//   npm run zip                 -> Desktop/papafiogos-site-<date>.zip
//   npm run zip -- <out.zip>    -> a path of your choice
// Contains every file git tracks + the .git folder (history), so nothing that git ignores:
// no node_modules/, dist/, .astro/, test output, photos-originals/.
// No extra packages: a small ZIP writer on top of Node's zlib (Node 22+).
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' });

const dirty = git('status', '--porcelain').trim();
if (dirty) {
  console.warn('⚠ Uncommitted changes (they are in the zip only if git already tracks the file):');
  console.warn(dirty.replace(/^/gm, '   '));
}

const date = new Date().toISOString().slice(0, 10);
const desktop = path.join(os.homedir(), 'Desktop');
const out = path.resolve(
  process.argv[2] ??
    path.join(fs.existsSync(desktop) ? desktop : path.dirname(root), `papafiogos-site-${date}.zip`),
);

// 1. The file list: tracked files (as they are on disk now) + everything in .git.
const files = git('ls-files', '-z')
  .split('\0')
  .filter(Boolean)
  .filter((f) => fs.existsSync(path.join(root, f)));
const walk = (dir) =>
  fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap((e) => {
    const rel = `${dir}/${e.name}`;
    return e.isDirectory() ? walk(rel) : e.isFile() ? [rel] : [];
  });
files.push(...walk('.git'));

// 2. Write the zip (deflate, UTF-8 names, no zip64: fine for a project this size).
const top = 'papafiogos-site/';
const dosTime = (d) =>
  ((d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1)) & 0xffff;
const dosDate = (d) =>
  (((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate()) & 0xffff;
const chunks = [];
const central = [];
let offset = 0;
for (const rel of files) {
  const abs = path.join(root, rel);
  const data = fs.readFileSync(abs);
  const mtime = fs.statSync(abs).mtime;
  const packed = zlib.deflateRawSync(data, { level: 9 });
  const useDeflate = packed.length < data.length;
  const body = useDeflate ? packed : data;
  const name = Buffer.from(top + rel.replaceAll('\\', '/'), 'utf8');
  const crc = zlib.crc32(data);
  const head = Buffer.alloc(30);
  head.writeUInt32LE(0x04034b50, 0);
  head.writeUInt16LE(20, 4); // version needed
  head.writeUInt16LE(0x0800, 6); // UTF-8 names
  head.writeUInt16LE(useDeflate ? 8 : 0, 8);
  head.writeUInt16LE(dosTime(mtime), 10);
  head.writeUInt16LE(dosDate(mtime), 12);
  head.writeUInt32LE(crc, 14);
  head.writeUInt32LE(body.length, 18);
  head.writeUInt32LE(data.length, 22);
  head.writeUInt16LE(name.length, 26);
  chunks.push(head, name, body);
  const cen = Buffer.alloc(46);
  cen.writeUInt32LE(0x02014b50, 0);
  cen.writeUInt16LE(20, 4); // made by
  cen.writeUInt16LE(20, 6);
  cen.writeUInt16LE(0x0800, 8);
  cen.writeUInt16LE(useDeflate ? 8 : 0, 10);
  cen.writeUInt16LE(dosTime(mtime), 12);
  cen.writeUInt16LE(dosDate(mtime), 14);
  cen.writeUInt32LE(crc, 16);
  cen.writeUInt32LE(body.length, 20);
  cen.writeUInt32LE(data.length, 24);
  cen.writeUInt16LE(name.length, 28);
  cen.writeUInt32LE(offset, 42);
  central.push(cen, name);
  offset += head.length + name.length + body.length;
}
const cenSize = central.reduce((n, b) => n + b.length, 0);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(cenSize, 12);
end.writeUInt32LE(offset, 16);
fs.writeFileSync(out, Buffer.concat([...chunks, ...central, end]));

const mb = (fs.statSync(out).size / 1024 / 1024).toFixed(1);
console.log(`✓ ${out}`);
console.log(
  `  ${files.length} files, ${mb} MB (commit ${git('rev-parse', '--short', 'HEAD').trim()})`,
);
console.log('  On the new computer: unzip, then in the folder: npm ci && npm run dev');

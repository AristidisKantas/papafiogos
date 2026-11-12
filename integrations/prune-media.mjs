// After the build, delete timeline media files that no page uses.
// (The media lookup imports the whole media/ folder, so Vite copies every file;
// photos/videos that are not referenced by any moment must not be published.)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

export default function pruneMedia() {
  return {
    name: 'papafiogos-prune-media',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const dist = fileURLToPath(dir);
        const mediaDir = path.resolve('src/content/timeline/media');
        const stems = new Set(walk(mediaDir).map((f) => path.parse(f).name));
        const used = walk(dist)
          .filter((f) => /\.(html|xml|css|js|json)$/.test(f))
          .map((f) => fs.readFileSync(f, 'utf8'))
          .join('\n');
        let removed = 0;
        for (const f of walk(path.join(dist, '_astro'))) {
          const name = path.basename(f);
          const stem = name.split('.')[0];
          if (stems.has(stem) && !used.includes(name)) {
            fs.rmSync(f);
            removed++;
          }
        }
        if (removed) logger.info(`removed ${removed} unused media file(s) from the output`);
      },
    },
  };
}

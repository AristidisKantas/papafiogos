/**
 * Resolves the file names typed in timeline.json to real, optimisable assets.
 * The owner only ever types a file name (e.g. "2009-first-camera.jpg").
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import type { ImageMetadata } from 'astro';

const BASE = '/src/content/timeline/media/';

const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/timeline/media/**/*.{jpg,jpeg,png,webp,avif,tif,tiff,JPG,JPEG,PNG,WEBP,AVIF,TIF,TIFF}',
  { eager: true },
);
const videos = import.meta.glob<string>(
  '/src/content/timeline/media/**/*.{mp4,webm,m4v,MP4,WEBM,M4V}',
  {
    eager: true,
    query: '?url',
    import: 'default',
  },
);

export function imageFor(name: string): ImageMetadata {
  const mod = images[BASE + name];
  if (!mod) throw new Error(`Timeline image not found: ${name}`);
  return mod.default;
}

export function videoUrl(name: string): string {
  const url = videos[BASE + name];
  if (!url) throw new Error(`Timeline video not found: ${name}`);
  return url;
}

export function videoType(name: string) {
  return name.toLowerCase().endsWith('.webm') ? 'video/webm' : 'video/mp4';
}

const lqipCache = new Map<string, string>();

/** A tiny (≤ 1 KB) blurred placeholder, inlined as a data URI. */
export async function lqip(name: string): Promise<string> {
  const hit = lqipCache.get(name);
  if (hit) return hit;
  const file = path.resolve('src/content/timeline/media', name);
  const buf = await sharp(fs.readFileSync(file))
    .rotate()
    .resize(16, 16, { fit: 'inside' })
    .blur(0.6)
    .webp({ quality: 40 })
    .toBuffer();
  const uri = `data:image/webp;base64,${buf.toString('base64')}`;
  lqipCache.set(name, uri);
  return uri;
}

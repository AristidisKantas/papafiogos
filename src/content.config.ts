/**
 * Content collection for the timeline.
 *
 * Source of truth: src/content/timeline/timeline.json (+ media/ folder).
 * We use a small custom loader instead of Astro's built-in file() loader:
 * file() only *logs* JSON errors and carries on, which would silently publish
 * an empty timeline. This loader fails the build with a plain-language,
 * bilingual message instead (see src/lib/timeline-validate.ts).
 *
 * Dev only: `npm run dev:example` loads timeline.example.json instead, so the
 * layout can be checked with sample moments. Production builds never do this.
 */
import fs from 'node:fs';
import path from 'node:path';
import { defineCollection } from 'astro:content';
import type { Loader } from 'astro/loaders';
import { z } from 'astro/zod';
import { validateTimeline } from './lib/timeline-validate';

const useExample = process.env.TIMELINE_EXAMPLE === '1';
const dir = path.resolve('src/content/timeline');
const jsonFile = path.join(dir, useExample ? 'timeline.example.json' : 'timeline.json');
const mediaDir = path.join(dir, 'media');

const timelineLoader: Loader = {
  name: 'papafiogos-timeline',
  load: async ({ store, parseData, logger, watcher }) => {
    const sync = async () => {
      const text = fs.existsSync(jsonFile) ? fs.readFileSync(jsonFile, 'utf8') : '[]';
      const { moments, warnings } = validateTimeline(
        text,
        mediaDir,
        path.relative(process.cwd(), jsonFile),
      );
      if (useExample)
        logger.warn('EXAMPLE MODE: showing timeline.example.json (never used for the real site)');
      for (const w of warnings) logger.warn(`Untranslated: ${w}`);
      store.clear();
      for (const m of moments) {
        const data = await parseData({ id: m.id, data: m as unknown as Record<string, unknown> });
        store.set({ id: m.id, data });
      }
      logger.info(`${moments.filter((m) => !m.hidden).length} timeline moment(s) loaded`);
    };
    await sync();
    watcher?.add([jsonFile, mediaDir]);
    watcher?.on('all', async (_e, changed) => {
      if (changed.startsWith(dir)) {
        try {
          await sync();
        } catch (err) {
          logger.error((err as Error).message);
        }
      }
    });
  },
};

const bilingual = z.object({ el: z.string().optional(), en: z.string().optional() });
const media = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('photo'), photo: z.string(), alt: bilingual }),
  z.object({
    kind: z.literal('video'),
    video: z.string(),
    poster: z.string(),
    alt: bilingual,
    sound: z.boolean().optional(),
  }),
  z.object({ kind: z.literal('youtube'), youtube: z.string(), poster: z.string(), alt: bilingual }),
  z.object({ kind: z.literal('vimeo'), vimeo: z.string(), poster: z.string(), alt: bilingual }),
]);

const timeline = defineCollection({
  loader: timelineLoader,
  schema: z.object({
    id: z.string(),
    index: z.number(),
    date: z.string(),
    year: z.number(),
    label: bilingual.optional(),
    title: bilingual,
    text: bilingual.optional(),
    media: z.array(media),
    hidden: z.boolean(),
  }),
});

export const collections = { timeline };

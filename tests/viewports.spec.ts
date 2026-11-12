/**
 * §9.3 responsive matrix: every viewport, portrait + landscape.
 * Checks the hero fills exactly one screen, the logo is fully visible and the
 * wordmark readable, nothing overflows sideways, the language switcher never
 * touches the logo, and the contact section is at least one screen tall.
 * A screenshot of each viewport is attached to the HTML report.
 */
import { test, expect } from '@playwright/test';

const sizes: [string, number, number][] = [
  ['iphone-se-1', 320, 568],
  ['small-360', 360, 640],
  ['phone-375', 375, 667],
  ['phone-390', 390, 844],
  ['phone-393', 393, 852],
  ['phone-412', 412, 915],
  ['large-430', 430, 932],
  ['fold-closed', 280, 653],
  ['fold-open', 717, 512],
  ['tablet-768', 768, 1024],
  ['tablet-820', 820, 1180],
  ['tablet-1024', 1024, 1366],
  ['laptop-1280', 1280, 800],
  ['laptop-1366', 1366, 768],
  ['laptop-1440', 1440, 900],
  ['desktop-1920', 1920, 1080],
  ['desktop-2560', 2560, 1440],
  ['ultrawide', 3440, 1440],
  ['4k', 3840, 2160],
];
const landscapeOnly = new Set([
  'laptop-1280',
  'laptop-1366',
  'laptop-1440',
  'desktop-1920',
  'desktop-2560',
  'ultrawide',
  '4k',
  'fold-open',
]);

const matrix: [string, number, number][] = [];
for (const [name, w, h] of sizes) {
  matrix.push([name, w, h]);
  if (!landscapeOnly.has(name)) matrix.push([`${name}-landscape`, h, w]);
}

for (const path of ['/', '/en/']) {
  for (const [name, width, height] of matrix) {
    test(`${path} @ ${name} (${width}×${height})`, async ({ page }, info) => {
      await page.setViewportSize({ width, height });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);

      const m = await page.evaluate(() => {
        const r = (sel: string) => document.querySelector(sel)!.getBoundingClientRect().toJSON();
        return {
          hero: r('[data-hero]'),
          logo: r('[data-logo-button]'),
          lang: r('[data-lang-switch]'),
          contactH: document.querySelector('[data-contact-section]')!.getBoundingClientRect()
            .height,
          timelineH: document.querySelector('[data-timeline]')!.getBoundingClientRect().height,
          scrollW: document.documentElement.scrollWidth,
          vw: innerWidth,
          vh: innerHeight,
        };
      });

      // hero = exactly one screen
      expect(Math.abs(m.hero.height - m.vh)).toBeLessThanOrEqual(1);
      // logo completely inside the viewport
      expect(m.logo.left).toBeGreaterThanOrEqual(0);
      expect(m.logo.top).toBeGreaterThanOrEqual(0);
      expect(m.logo.right).toBeLessThanOrEqual(m.vw);
      expect(m.logo.bottom).toBeLessThanOrEqual(m.vh);
      // wordmark ≥ ~18 px tall: ΦΙΟΓΚΟΣ line is ~87/701 of the mark height
      expect((m.logo.height * 87) / 701).toBeGreaterThanOrEqual(17.5);
      // nothing sideways
      expect(m.scrollW).toBeLessThanOrEqual(m.vw);
      // language switcher never overlaps the logo
      const overlap =
        m.lang.left < m.logo.right &&
        m.lang.right > m.logo.left &&
        m.lang.top < m.logo.bottom &&
        m.lang.bottom > m.logo.top;
      expect(overlap).toBe(false);
      // timeline + contact are at least one screen tall
      expect(m.timelineH).toBeGreaterThanOrEqual(m.vh - 1);
      expect(m.contactH).toBeGreaterThanOrEqual(m.vh - 1);

      await info.attach(`${name}.png`, { body: await page.screenshot(), contentType: 'image/png' });
    });
  }
}

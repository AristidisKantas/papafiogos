import { test, expect, type Page } from '@playwright/test';

const moverTransform = (page: Page) =>
  page.evaluate(() => (document.querySelector('[data-logo-mover]') as HTMLElement).style.transform);
const isAway = (page: Page) =>
  page.evaluate(() => document.querySelector('[data-evasive-logo]')!.classList.contains('is-away'));

test.describe('hero — desktop hover', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('logo dodges the pointer, reveals the slogan, stays on screen, and comes home', async ({
    page,
  }) => {
    await page.goto('/');
    const box = (await page.locator('[data-logo-button]').boundingBox())!;
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;

    for (let i = 0; i < 5; i++) {
      await page.mouse.move(5, 5);
      await page.waitForTimeout(1300);
      await page.mouse.move(cx - 300, cy, { steps: 2 });
      await page.mouse.move(cx - 40, cy, { steps: 5 });
      await page.waitForTimeout(1300);
      expect(await isAway(page)).toBe(true);
      const t = await moverTransform(page);
      const [x, y] = t.match(/-?[\d.]+/g)!.map(Number);
      const dist = Math.hypot(x!, y!);
      expect(dist).toBeGreaterThan(0.1 * 900); // ≥ 10vmin
      const logo = await page.locator('.logo__breathe').boundingBox();
      expect(logo!.x).toBeGreaterThanOrEqual(0);
      expect(logo!.y).toBeGreaterThanOrEqual(0);
      expect(logo!.x + logo!.width).toBeLessThanOrEqual(1440);
      expect(logo!.y + logo!.height).toBeLessThanOrEqual(900);
      await expect(page.locator('[data-slogan]')).toHaveCSS('opacity', '1');
    }

    await page.mouse.move(10, 880, { steps: 4 });
    await page.waitForTimeout(1500);
    expect(await isAway(page)).toBe(false);
    // The spring settles exactly at home; on a busy machine that can take a little longer.
    await expect
      .poll(() => moverTransform(page), { timeout: 5000 })
      .toContain('translate3d(0px, 0px, 0px)');
  });

  test('keyboard: Enter toggles the logo, Escape brings it home', async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-logo-button]').focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(300);
    expect(await isAway(page)).toBe(true);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    expect(await isAway(page)).toBe(false);
  });
});

test.describe('hero — touch', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

  test('hinting cues show, tap hops away, auto-returns, and hints stop after the first tap', async ({
    page,
  }) => {
    await page.goto('/');
    const root = page.locator('[data-evasive-logo]');
    await expect(root).toHaveClass(/has-hints/);
    await page.tap('[data-logo-button]');
    await page.waitForTimeout(600);
    expect(await isAway(page)).toBe(true);
    await expect(root).not.toHaveClass(/has-hints/);
    await page.waitForTimeout(3700); // 3.5 s auto-return
    expect(await isAway(page)).toBe(false);
    // tap → tap again returns
    await page.tap('[data-logo-button]');
    await page.waitForTimeout(400);
    expect(await isAway(page)).toBe(true);
    await page.tap('[data-logo-button]');
    await page.waitForTimeout(400);
    expect(await isAway(page)).toBe(false);
  });
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });

  test('no movement: the logo crossfades with the slogan instead', async ({ page }) => {
    await page.goto('/');
    const box = (await page.locator('[data-logo-button]').boundingBox())!;
    await page.mouse.move(5, 5);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 4 });
    await page.waitForTimeout(500);
    expect(await isAway(page)).toBe(true);
    expect(await moverTransform(page)).toBe('');
    await expect(page.locator('[data-logo-mover]')).toHaveCSS('opacity', '0.15');
  });
});

test.describe('contact', () => {
  test('“Talk to me” reveals instagram, email and phone with correct links', async ({ page }) => {
    await page.goto('/en/');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    const list = page.locator('[data-contact-list]');
    await expect(list).toBeHidden();
    await page.click('[data-talk]');
    await expect(page.locator('[data-talk]')).toHaveAttribute('aria-expanded', 'true');
    const links = list.locator('a');
    await expect(links).toHaveCount(3);
    await expect(links.nth(0)).toHaveAttribute('href', 'https://instagram.com/papafiogos');
    await expect(links.nth(1)).toHaveAttribute('href', 'mailto:papafiogos@gmail.com');
    await expect(links.nth(1)).toHaveText('papafiogos@gmail.com');
    await expect(links.nth(2)).toHaveAttribute('href', 'tel:+306978954464');
    await expect(links.nth(2)).toHaveText('+30 697 895 4464');
    // the raw email is not sitting in the visible markup (only JSON-LD + noscript)
    const html = await (await page.request.get('/en/')).text();
    expect(html).not.toContain('data-text>papafiogos@gmail.com');
    await page.click('[data-talk]');
    await expect(page.locator('[data-talk]')).toHaveAttribute('aria-expanded', 'false');
  });

  test('a shared #contact link opens the items', async ({ page }) => {
    await page.goto('/en/#contact');
    await expect(page.locator('[data-talk]')).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('no JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('logo, timeline and contact details are all there', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1 svg title')).toHaveText('PAPAFIOGOS');
    await expect(page.locator('[data-timeline]')).toBeVisible();
    // either the empty state or the moments must be readable without JS
    const entries = page.locator('[data-timeline] .entry');
    if ((await entries.count()) === 0)
      await expect(page.getByText('Η ιστορία γράφεται.')).toBeVisible();
    else {
      await expect(entries.first().locator('.entry__title')).toBeVisible();
      await expect(entries.last().locator('.entry__text')).toBeVisible();
    }
    const plain = page.locator('.contact__list--plain a');
    await expect(plain).toHaveCount(3);
    await expect(plain.nth(1)).toHaveAttribute('href', 'mailto:papafiogos@gmail.com');
    await expect(plain.nth(2)).toBeVisible();
  });
});

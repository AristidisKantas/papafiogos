import { test, expect } from '@playwright/test';

test('Greek home: lang, title, canonical, hreflang, OG', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'el');
  await expect(page).toHaveTitle('PAPAFIOGOS — I shoot. You smile.');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
    'href',
    'https://papafiogos.gr/',
  );
  await expect(page.locator('link[hreflang=el]')).toHaveAttribute('href', 'https://papafiogos.gr/');
  await expect(page.locator('link[hreflang=en]')).toHaveAttribute(
    'href',
    'https://papafiogos.gr/en/',
  );
  await expect(page.locator('link[hreflang=x-default]')).toHaveAttribute(
    'href',
    'https://papafiogos.gr/',
  );
  await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'el_GR');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    'content',
    'https://papafiogos.gr/og-image.jpg',
  );
  const desc = await page.locator('meta[name=description]').getAttribute('content');
  expect(desc!.length).toBeGreaterThan(80);
});

test('English home has its own canonical and strings', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute(
    'href',
    'https://papafiogos.gr/en/',
  );
  await expect(page.locator('[data-talk]')).toHaveText('Talk to me');
  await expect(page.locator('#story')).toBeAttached();
  await expect(page.locator('#contact')).toBeAttached();
});

test('Greek uppercase heading renders without tonos', async ({ page }) => {
  await page.goto('/');
  const h = page.locator('.timeline__heading');
  await expect(h).toHaveText('Η ιστορία'); // source text
  await expect(h).toHaveCSS('text-transform', 'uppercase');
  // the browser drops the tonos for lang="el": rendered width equals the plain capitals
  const same = await page.evaluate(() => {
    const el = document.querySelector('.timeline__heading') as HTMLElement;
    const probe = el.cloneNode() as HTMLElement;
    probe.textContent = 'Η ΙΣΤΟΡΙΑ';
    probe.style.textTransform = 'none';
    probe.style.position = 'absolute';
    probe.style.width = 'auto';
    el.after(probe);
    const a = el.getBoundingClientRect().height;
    const range = document.createRange();
    range.selectNodeContents(el);
    const w1 = range.getBoundingClientRect().width;
    range.selectNodeContents(probe);
    const w2 = range.getBoundingClientRect().width;
    probe.remove();
    return a > 0 && Math.abs(w1 - w2) < 1;
  });
  expect(same).toBe(true);
});

test('language switcher: links, aria-current, follows the visible section', async ({ page }) => {
  await page.goto('/');
  const en = page.locator('[data-lang-switch] a[data-lang=en]');
  const el = page.locator('[data-lang-switch] a[data-lang=el]');
  await expect(el).toHaveAttribute('aria-current', 'true');
  await expect(en).toHaveAttribute('hreflang', 'en');
  await page.locator('#epikoinonia').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  await expect(en).toHaveAttribute('href', '/en/#contact');
  await en.click();
  await expect(page).toHaveURL(/\/en\/#contact$/);
});

test('JSON-LD is valid and uses site.contact', async ({ page }) => {
  await page.goto('/');
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const data = JSON.parse(raw!);
  const types = data['@graph'].map((n: { '@type': string }) => n['@type']);
  expect(types).toEqual(expect.arrayContaining(['Person', 'WebSite', 'ProfessionalService']));
  const person = data['@graph'].find((n: { '@type': string }) => n['@type'] === 'Person');
  expect(person.email).toBe('mailto:papafiogos@gmail.com');
  expect(person.alternateName).toContain('Παπαφιόγκος');
  expect(person.sameAs).toContain('https://instagram.com/papafiogos');
});

test('sitemap lists both languages; robots points to it', async ({ request }) => {
  const sm = await (await request.get('/sitemap-0.xml')).text();
  expect(sm).toContain('https://papafiogos.gr/');
  expect(sm).toContain('https://papafiogos.gr/en/');
  expect(sm).toContain('hreflang="el-GR"');
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('sitemap-index.xml');
});

test('404 page in both languages', async ({ page }) => {
  await page.goto('/does-not-exist');
  await expect(page.getByText('Χάθηκες; Πάμε σπίτι.')).toBeVisible();
  await page.goto('/en/does-not-exist');
  await expect(page.getByText('Lost? Let’s go home.')).toBeVisible();
  await expect(page.getByText('Lost? Let’s go home.')).toHaveAttribute('href', '/en/');
});

test('no console errors (incl. CSP violations) on any page', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  for (const p of ['/', '/en/', '/privacy/', '/en/privacy/']) {
    await page.goto(p);
    await page.mouse.wheel(0, 4000);
    await page.waitForTimeout(300);
  }
  expect(errors).toEqual([]);
});

test('privacy page names the controller and uses site.contact.email', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.getByText('Αριστείδης Κάντας', { exact: false })).toBeVisible();
  await expect(page.getByText('papafiogos@gmail.com', { exact: false })).toBeVisible();
  await expect(page.locator('main')).not.toContainText('{email}');
  await page.goto('/en/privacy/');
  await expect(page.getByText('Aristeidis Kantas', { exact: false })).toBeVisible();
});

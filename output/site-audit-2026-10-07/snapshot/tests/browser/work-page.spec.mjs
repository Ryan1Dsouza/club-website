import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

const site = JSON.parse(await readFile(new URL('../../shared/public-data.json', import.meta.url), 'utf8'));

async function openWork(page, data = site) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/site', route => route.fulfill({ json: data }));
  await page.goto('/projects');
  await expect(page.locator('.site-shell')).toHaveAttribute('data-loading-stage', 'done');
  await expect(page.locator('[data-loading-screen]')).toHaveCount(0);
}

for (const width of [1440, 768, 390, 320]) {
  test(`laundry card and machine details are accessible and fit at ${width}px`, async ({ page }, info) => {
    await page.setViewportSize({ width, height: 900 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await openWork(page);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByText('Ideas,')).toHaveCount(0);
    await expect(page.getByText('01 / Our work', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Built by curious minds.')).toHaveCount(0);
    const trigger = page.getByRole('button', { name: 'Explore i Laundroid', exact: true });
    await expect(trigger).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width);
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
    await page.screenshot({ path: info.outputPath('card.png'), fullPage: true });
    // Click the machine itself, not just the visual call to action.
    const machine = await page.locator('.laundroid-machine').boundingBox();
    await page.mouse.click(machine.x + machine.width / 2, machine.y + machine.height / 2);
    const dialog = page.getByRole('dialog', { name: 'i Laundroid', exact: true });
    await expect(dialog).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await expect(dialog).not.toContainText(site.projects[0].description);
    for (const name of ['Book', 'Track', 'Deliver']) await expect(dialog.getByRole('heading', { name, exact: true })).toHaveCount(0);
    expect(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()).violations).toEqual([]);
    await page.screenshot({ path: info.outputPath('machine-details.png'), fullPage: true });
    await expect(dialog.getByRole('link', { name: 'Talk to the team' })).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Close project details' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
    expect(errors).toEqual([]);
  });
}

test('keyboard activation, focus containment, Escape, backdrop and repeated opening work', async ({ page }) => {
  await openWork(page);
  const trigger = page.getByRole('button', { name: 'Explore i Laundroid', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'i Laundroid', exact: true });
  const close = dialog.getByRole('button', { name: 'Close project details' });
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.keyboard.press('Space');
  await expect(dialog).toBeVisible();
  await page.mouse.click(3, 3);
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('hover has a bounded drum turn and motion preferences are respected', async ({ page }) => {
  await openWork(page);
  const trigger = page.getByRole('button', { name: 'Explore i Laundroid', exact: true });
  const drum = page.locator('.laundroid-card .laundroid-drum__load');
  await trigger.hover();
  await expect(drum).toHaveCSS('transform', 'none');
  await page.mouse.move(0, 0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await trigger.hover();
  await expect.poll(() => drum.evaluate(element => getComputedStyle(element).transform)).not.toBe('none');
  await expect.poll(() => page.locator('.laundroid-card').evaluate(element => element.getAnimations({ subtree: true }).filter(animation => animation.playState === 'running').length)).toBe(0);
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'i Laundroid', exact: true });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('project links, other project cards and the empty state still use site data', async ({ page }) => {
  const project = { ...site.projects[0], url: 'https://example.com/laundry', repositoryUrl: 'https://github.com/nucleus-sjec/laundry' };
  await openWork(page, { ...site, projects: [project, { ...project, id: 'another-project', title: 'Another project' }] });
  await page.getByRole('button', { name: 'Explore i Laundroid', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'i Laundroid', exact: true });
  await expect(dialog.getByRole('link', { name: 'Explore project' })).toHaveAttribute('href', project.url);
  await expect(dialog.getByRole('link', { name: 'Source code' })).toHaveAttribute('href', project.repositoryUrl);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('heading', { name: 'Another project' })).toBeVisible();
  await page.unroute('**/api/site');
  await page.route('**/api/site', route => route.fulfill({ json: { ...site, projects: [] } }));
  await page.reload();
  await expect(page.getByText('New projects are taking shape.')).toBeVisible();
});

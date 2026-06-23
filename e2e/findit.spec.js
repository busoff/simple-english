import { test, expect } from '@playwright/test';
import { ttsMockScript } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(ttsMockScript);
  await page.goto('/');
});

async function ttsCalls(page) {
  return page.evaluate(() => ({
    speakCalls: window.__tts.speakCalls.slice(),
    cancelCount: window.__tts.cancelCount,
  }));
}

async function openCategory(page, id) {
  await page.locator(`.tile-${id}`).click();
  await expect(page.locator('#screen-category')).toBeVisible();
}

test('tapping Play shows the find-it screen with 4 tiles and speaks the first prompt', async ({ page }) => {
  await openCategory(page, 'animals');
  await page.locator('.mode-play').click();

  await expect(page.locator('#screen-findit')).toBeVisible();
  await expect(page.locator('#screen-category')).not.toBeVisible();
  await expect(page.locator('#findit-container .findit-tile')).toHaveCount(4);

  const calls = await ttsCalls(page);
  expect(calls.speakCalls.length).toBeGreaterThanOrEqual(1);
  expect(calls.speakCalls.at(-1)).toMatch(/^Find the /);
});

test('tapping Look returns to the word grid', async ({ page }) => {
  await openCategory(page, 'colors');
  await page.locator('.mode-play').click();
  await expect(page.locator('#screen-findit')).toBeVisible();

  await page.locator('.mode-look').click();
  await expect(page.locator('#screen-category')).toBeVisible();
  await expect(page.locator('#screen-findit')).not.toBeVisible();
  await expect(page.locator('#word-grid .word-tile')).toHaveCount(10);
});

test('completing 8 rounds shows Yay! then returns to the category grid', async ({ page }) => {
  test.setTimeout(20_000);
  await openCategory(page, 'animals');
  await page.locator('.mode-play').click();

  for (let round = 0; round < 8; round++) {
    await expect(page.locator('#screen-findit')).toBeVisible();
    // tap each tile until one flips correct
    const tiles = page.locator('#findit-container .findit-tile');
    const count = await tiles.count();
    let advanced = false;
    for (let i = 0; i < count; i++) {
      const t = tiles.nth(i);
      if (await t.evaluate((el) => el.disabled || el.classList.contains('correct'))) continue;
      await t.click();
      if (await t.evaluate((el) => el.classList.contains('correct'))) {
        advanced = true;
        break;
      }
    }
    expect(advanced).toBe(true);
    // wait for auto-advance to fire (1s in real time)
    await page.waitForTimeout(1300);
  }

  await expect(page.locator('#screen-yay')).toBeVisible();
  await expect(page.locator('#screen-findit')).not.toBeVisible();

  // Yay holds for ~3s then auto-returns
  await expect(page.locator('#screen-category')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('#screen-yay')).not.toBeVisible();
});

test('home button exits find-it mid-session', async ({ page }) => {
  await openCategory(page, 'food');
  await page.locator('.mode-play').click();
  await expect(page.locator('#screen-findit')).toBeVisible();

  await page.locator('#home-btn').click();
  await expect(page.locator('#screen-home')).toBeVisible();
  await expect(page.locator('#screen-findit')).not.toBeVisible();
});

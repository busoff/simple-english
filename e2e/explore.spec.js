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

async function openAnimalsCategory(page) {
  await page.locator('.tile-animals').click();
  await expect(page.locator('#screen-category')).toBeVisible();
}

async function openFirstWord(page) {
  const tile = page.locator('#word-grid .word-tile').first();
  const emoji = await tile.textContent();
  const word = await tile.getAttribute('aria-label');
  await tile.click();
  await expect(page.locator('#screen-explore')).toBeVisible();
  return { emoji, word };
}

test('home renders mascot, 3 category tiles with accent classes, and hides TTS indicator', async ({ page }) => {
  await expect(page.locator('#home-mascot-slot')).toContainText('🦜');
  await expect(page.locator('.tile-animals')).toBeVisible();
  await expect(page.locator('.tile-colors')).toBeVisible();
  await expect(page.locator('.tile-food')).toBeVisible();
  await expect(page.locator('#tts-indicator')).toHaveClass(/hidden/);
});

test('tapping a category tile shows the category screen with 10 tiles and Look mode active', async ({ page }) => {
  await openAnimalsCategory(page);

  await expect(page.locator('#screen-home')).not.toBeVisible();
  await expect(page.locator('#word-grid .word-tile')).toHaveCount(10);
  await expect(page.locator('.mode-look')).toHaveClass(/active/);
  await expect(page.locator('.mode-play')).not.toHaveClass(/active/);
});

test('tapping a word tile opens the explore card with matching emoji and word', async ({ page }) => {
  await openAnimalsCategory(page);
  const { emoji, word } = await openFirstWord(page);

  await expect(page.locator('#screen-category')).not.toBeVisible();
  await expect(page.locator('#explore-emoji')).toHaveText(emoji);
  await expect(page.locator('#explore-word')).toHaveText(word);
});

test('entering the explore card speaks the word once', async ({ page }) => {
  await openAnimalsCategory(page);
  const { word } = await openFirstWord(page);

  const calls = await ttsCalls(page);
  expect(calls.speakCalls).toEqual([word]);
});

test('tapping the explore card replays the word', async ({ page }) => {
  await openAnimalsCategory(page);
  const { word } = await openFirstWord(page);

  await page.locator('#explore-card').click();

  const calls = await ttsCalls(page);
  expect(calls.speakCalls).toEqual([word, word]);
});

test('tapping the replay button calls speak exactly once (no card double-fire)', async ({ page }) => {
  await openAnimalsCategory(page);
  const { word } = await openFirstWord(page);

  const before = (await ttsCalls(page)).speakCalls.length;
  await page.locator('#explore-replay').click();
  const after = (await ttsCalls(page)).speakCalls.length;

  expect(after - before).toBe(1);
  expect((await ttsCalls(page)).speakCalls.at(-1)).toBe(word);
});

test('rapid taps on the card trigger cancel-before-speak', async ({ page }) => {
  await openAnimalsCategory(page);
  await openFirstWord(page);

  const card = page.locator('#explore-card');
  await card.click();
  await card.click();
  await card.click();

  const calls = await ttsCalls(page);
  expect(calls.speakCalls.length).toBeGreaterThanOrEqual(4);
  expect(calls.cancelCount).toBe(calls.speakCalls.length);
});

test('home button is visible on every screen and returns to home', async ({ page }) => {
  await expect(page.locator('#home-btn')).toBeVisible();

  await openAnimalsCategory(page);
  await expect(page.locator('#home-btn')).toBeVisible();

  await openFirstWord(page);
  await expect(page.locator('#home-btn')).toBeVisible();

  await page.locator('#home-btn').click();
  await expect(page.locator('#screen-home')).toBeVisible();
  await expect(page.locator('#screen-explore')).not.toBeVisible();
});

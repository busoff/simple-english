import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, 'index.html'), 'utf8');

describe('app end-to-end smoke', () => {
  let speechSynthesis;
  let SpeechSynthesisUtterance;

  beforeEach(async () => {
    speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
      getVoices: vi.fn(() => [{ name: 'A', lang: 'en-US' }]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    SpeechSynthesisUtterance = vi.fn().mockImplementation((t) => ({ text: t }));
    vi.stubGlobal('speechSynthesis', speechSynthesis);
    vi.stubGlobal('SpeechSynthesisUtterance', SpeechSynthesisUtterance);
    vi.useFakeTimers();

    const doc = new DOMParser().parseFromString(html, 'text/html');
    document.documentElement.innerHTML = doc.documentElement.innerHTML;

    await import('./app.js?t=' + Date.now());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('renders the mascot on the home screen', () => {
    const mascotSlot = document.getElementById('home-mascot-slot');
    expect(mascotSlot.textContent).toContain('🦜');
  });

  it('navigates home → animals category, shows 10 tiles, and explore speaks on tap', () => {
    document.querySelector('.category-tile[data-category="animals"]').click();
    expect(document.getElementById('screen-category').classList.contains('hidden'))
      .toBe(false);

    const grid = document.getElementById('word-grid');
    expect(grid.querySelectorAll('.word-tile')).toHaveLength(10);

    speechSynthesis.speak.mockClear();
    speechSynthesis.cancel.mockClear();
    grid.querySelector('.word-tile').click();
    expect(document.getElementById('screen-explore').classList.contains('hidden'))
      .toBe(false);
    expect(speechSynthesis.speak).toHaveBeenCalled();
  });

  it('home button works from explore', () => {
    document.querySelector('.category-tile[data-category="colors"]').click();
    document.querySelector('.word-tile').click();
    document.getElementById('home-btn').click();
    expect(document.getElementById('screen-home').classList.contains('hidden'))
      .toBe(false);
  });

  it('tapping Play starts a find-it session: findit screen shows 4 tiles and speaks the first prompt', () => {
    document.querySelector('.category-tile[data-category="animals"]').click();
    speechSynthesis.speak.mockClear();

    document.querySelector('.mode-play').click();

    expect(document.getElementById('screen-findit').classList.contains('hidden'))
      .toBe(false);
    expect(document.getElementById('screen-category').classList.contains('hidden'))
      .toBe(true);
    const tiles = document.querySelectorAll('#findit-container .findit-tile');
    expect(tiles).toHaveLength(4);
    expect(speechSynthesis.speak).toHaveBeenCalledTimes(1);
    expect(speechSynthesis.speak.mock.calls[0][0].text).toMatch(/^Find the /);
  });

  it('tapping Look while in Play mode returns to the word grid', () => {
    document.querySelector('.category-tile[data-category="animals"]').click();
    document.querySelector('.mode-play').click();
    document.querySelector('.mode-look').click();
    expect(document.getElementById('screen-category').classList.contains('hidden'))
      .toBe(false);
    expect(document.getElementById('screen-findit').classList.contains('hidden'))
      .toBe(true);
  });

  it('home button exits find-it immediately and a fresh session starts at round 1', () => {
    document.querySelector('.category-tile[data-category="colors"]').click();
    document.querySelector('.mode-play').click();

    // tap correct tile to advance round 1 → 2
    const round1Tiles = [...document.querySelectorAll('#findit-container .findit-tile')];
    speechSynthesis.speak.mockClear();
    // find the correct tile by guessing each (only the right one fires onCorrect → next round)
    let advanced = false;
    for (const t of round1Tiles) {
      if (t.classList.contains('correct')) continue;
      t.click();
    }
    // nothing should have settled because we hit wrong tiles, which disable but no advance
    // Now hit home
    document.getElementById('home-btn').click();
    expect(document.getElementById('screen-home').classList.contains('hidden'))
      .toBe(false);

    // re-enter find-it: should be a fresh round 1 with 4 tiles
    document.querySelector('.category-tile[data-category="colors"]').click();
    document.querySelector('.mode-play').click();
    expect(document.querySelectorAll('#findit-container .findit-tile')).toHaveLength(4);
  });

  it('completing 8 rounds by tapping correct tiles shows Yay! then returns to category', () => {
    document.querySelector('.category-tile[data-category="animals"]').click();
    document.querySelector('.mode-play').click();

    for (let round = 0; round < 8; round++) {
      const tiles = [...document.querySelectorAll('#findit-container .findit-tile')];
      // tap each tile until one flips green (that's the correct one)
      let found = false;
      for (const t of tiles) {
        if (t.disabled || t.classList.contains('correct')) continue;
        t.click();
        if (t.classList.contains('correct')) { found = true; break; }
      }
      expect(found).toBe(true);
      vi.advanceTimersByTime(1100);
    }

    expect(document.getElementById('screen-yay').classList.contains('hidden'))
      .toBe(false);
    expect(document.getElementById('screen-findit').classList.contains('hidden'))
      .toBe(true);

    vi.advanceTimersByTime(3100);
    expect(document.getElementById('screen-category').classList.contains('hidden'))
      .toBe(false);
    expect(document.getElementById('screen-yay').classList.contains('hidden'))
      .toBe(true);
  });
});

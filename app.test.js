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

    const doc = new DOMParser().parseFromString(html, 'text/html');
    document.documentElement.innerHTML = doc.documentElement.innerHTML;

    await import('./app.js?t=' + Date.now());
  });

  afterEach(() => {
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
});

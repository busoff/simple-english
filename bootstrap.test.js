import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const html = readFileSync(join(here, 'index.html'), 'utf8');

describe('bootstrap', () => {
  let speechSynthesis;
  let SpeechSynthesisUtterance;
  let bootstrap;

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

    const mod = await import('./bootstrap.js?t=' + Date.now());
    bootstrap = mod.bootstrap;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('on bootstrap(), the home screen is visible', () => {
    bootstrap();
    expect(document.getElementById('screen-home').classList.contains('hidden'))
      .toBe(false);
  });

  it('on bootstrap(), mascot is rendered on home', () => {
    bootstrap();
    const slot = document.getElementById('home-mascot-slot');
    expect(slot.textContent).toContain('🦜');
  });

  it('on bootstrap(), home button click returns to home from another screen', () => {
    bootstrap();
    document.querySelector('.category-tile[data-category="animals"]').click();
    expect(document.getElementById('screen-home').classList.contains('hidden'))
      .toBe(true);
    document.getElementById('home-btn').click();
    expect(document.getElementById('screen-home').classList.contains('hidden'))
      .toBe(false);
  });
});

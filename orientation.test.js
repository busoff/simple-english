import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('orientation', () => {
  let applyOrientation;
  let initOrientation;
  let originalInnerWidth;
  let originalInnerHeight;

  beforeEach(async () => {
    document.body.innerHTML = '<div id="rotate-nag" class="hidden"></div>';
    originalInnerWidth = window.innerWidth;
    originalInnerHeight = window.innerHeight;
    const mod = await import('./orientation.js?t=' + Date.now());
    applyOrientation = mod.applyOrientation;
    initOrientation = mod.initOrientation;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, configurable: true, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, configurable: true, writable: true });
    vi.resetModules();
  });

  function setViewport(w, h) {
    Object.defineProperty(window, 'innerWidth', { value: w, configurable: true, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: h, configurable: true, writable: true });
  }

  it('hides rotate-nag overlay when viewport is landscape', () => {
    setViewport(1024, 768);
    applyOrientation();
    expect(document.getElementById('rotate-nag').classList.contains('hidden'))
      .toBe(true);
  });

  it('shows rotate-nag overlay when viewport is portrait', () => {
    setViewport(400, 800);
    applyOrientation();
    expect(document.getElementById('rotate-nag').classList.contains('hidden'))
      .toBe(false);
  });

  it('initOrientation re-applies on resize when viewport changes', () => {
    setViewport(1024, 768);
    initOrientation();
    expect(document.getElementById('rotate-nag').classList.contains('hidden'))
      .toBe(true);

    setViewport(400, 800);
    window.dispatchEvent(new Event('resize'));
    expect(document.getElementById('rotate-nag').classList.contains('hidden'))
      .toBe(false);

    setViewport(1024, 768);
    window.dispatchEvent(new Event('orientationchange'));
    expect(document.getElementById('rotate-nag').classList.contains('hidden'))
      .toBe(true);
  });
});

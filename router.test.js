import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('router', () => {
  let showScreen, initRouter;

  beforeEach(async () => {
    document.body.innerHTML = `
      <button id="home-btn"></button>
      <section id="screen-home" class="screen"></section>
      <section id="screen-category" class="screen"></section>
      <section id="screen-explore" class="screen"></section>
    `;
    const mod = await import('./router.js?t=' + Date.now());
    showScreen = mod.showScreen;
    initRouter = mod.initRouter;
  });

  afterEach(() => {
    vi.resetModules();
  });

  it('shows only the named screen and hides the others', () => {
    showScreen('category');
    expect(document.getElementById('screen-home').classList.contains('hidden'))
      .toBe(true);
    expect(document.getElementById('screen-category').classList.contains('hidden'))
      .toBe(false);
    expect(document.getElementById('screen-explore').classList.contains('hidden'))
      .toBe(true);
  });

  it('starts at home', () => {
    initRouter();
    expect(document.getElementById('screen-home').classList.contains('hidden'))
      .toBe(false);
  });

  it('home button returns to home from any screen', () => {
    initRouter();
    showScreen('explore');
    document.getElementById('home-btn').click();
    expect(document.getElementById('screen-home').classList.contains('hidden'))
      .toBe(false);
    expect(document.getElementById('screen-explore').classList.contains('hidden'))
      .toBe(true);
  });

  it('emits an event with screen name + params so views can react', () => {
    const cb = vi.fn();
    initRouter();
    document.addEventListener('screen-change', cb);
    showScreen('explore', { word: 'cat' });
    const detail = cb.mock.calls[0][0].detail;
    expect(detail.name).toBe('explore');
    expect(detail.params).toEqual({ word: 'cat' });
  });
});

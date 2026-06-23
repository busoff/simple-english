import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('explore view', () => {
  let openExplore;
  let initExplore;
  let speechSynthesis;
  let SpeechSynthesisUtterance;
  let speakMock;

  beforeEach(async () => {
    speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
      getVoices: vi.fn(() => [{ name: 'A', lang: 'en-US' }]),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };
    SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({ text }));
    vi.stubGlobal('speechSynthesis', speechSynthesis);
    vi.stubGlobal('SpeechSynthesisUtterance', SpeechSynthesisUtterance);

    document.body.innerHTML = `
      <section id="screen-explore" class="screen hidden">
        <div id="explore-card">
          <span id="explore-emoji"></span>
          <div id="explore-word"></div>
          <button id="explore-replay"></button>
        </div>
      </section>
    `;

    const tts = await import('./tts.js?t=' + Date.now());
    speakMock = vi.spyOn(tts, 'speak');
    const explore = await import('./explore.js?t=' + Date.now());
    openExplore = explore.openExplore;
    initExplore = explore.initExplore;
    initExplore();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('renders the emoji and word for the given entry', () => {
    openExplore({ word: 'cat', emoji: '🐱', category: 'animals' });
    expect(document.getElementById('explore-emoji').textContent).toBe('🐱');
    expect(document.getElementById('explore-word').textContent).toBe('cat');
  });

  it('speaks the word once on entry', () => {
    openExplore({ word: 'cat', emoji: '🐱', category: 'animals' });
    expect(speakMock).toHaveBeenCalledWith('cat');
    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it('replays the word when the card is tapped', () => {
    const entry = { word: 'dog', emoji: '🐶', category: 'animals' };
    openExplore(entry);
    speakMock.mockClear();
    document.getElementById('explore-card').click();
    expect(speakMock).toHaveBeenCalledWith('dog');
  });

  it('replays the word when the 🔊 button is tapped', () => {
    const entry = { word: 'fish', emoji: '🐟', category: 'animals' };
    openExplore(entry);
    speakMock.mockClear();
    document.getElementById('explore-replay').click();
    expect(speakMock).toHaveBeenCalledWith('fish');
  });
});

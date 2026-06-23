import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('find-it view', () => {
  let speechSynthesis;
  let SpeechSynthesisUtterance;
  let speakMock;
  let render;

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
    vi.useFakeTimers();

    const tts = await import('./tts.js?t=' + Date.now());
    speakMock = vi.spyOn(tts, 'speak');
    const mod = await import('./findItView.js?t=' + Date.now());
    render = mod.render;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  function makeRound(target, options) {
    const correctIndex = options.findIndex((o) => o.word === target.word);
    return { target, options, correctIndex };
  }

  it('renders exactly 4 option tiles in a 2×2 grid', () => {
    document.body.innerHTML = '<div id="findit"></div>';
    const container = document.getElementById('findit');
    const round = makeRound(
      { word: 'cat', emoji: '🐱', category: 'animals' },
      [
        { word: 'cat', emoji: '🐱', category: 'animals' },
        { word: 'dog', emoji: '🐶', category: 'animals' },
        { word: 'bird', emoji: '🐦', category: 'animals' },
        { word: 'fish', emoji: '🐟', category: 'animals' },
      ],
    );
    render(container, round, { onCorrect: vi.fn() });

    const tiles = container.querySelectorAll('.findit-tile');
    expect(tiles).toHaveLength(4);
    expect(container.querySelector('.findit-grid')).toBeTruthy();
  });

  it('speaks "Find the {target}" once on entry', () => {
    document.body.innerHTML = '<div id="findit"></div>';
    const container = document.getElementById('findit');
    const round = makeRound(
      { word: 'cat', emoji: '🐱', category: 'animals' },
      [
        { word: 'cat', emoji: '🐱', category: 'animals' },
        { word: 'dog', emoji: '🐶', category: 'animals' },
        { word: 'bird', emoji: '🐦', category: 'animals' },
        { word: 'fish', emoji: '🐟', category: 'animals' },
      ],
    );
    render(container, round, { onCorrect: vi.fn() });

    expect(speakMock).toHaveBeenCalledTimes(1);
    expect(speakMock).toHaveBeenCalledWith('Find the cat');
  });

  it('renders each option emoji in its tile', () => {
    document.body.innerHTML = '<div id="findit"></div>';
    const container = document.getElementById('findit');
    const options = [
      { word: 'cat', emoji: '🐱', category: 'animals' },
      { word: 'dog', emoji: '🐶', category: 'animals' },
      { word: 'bird', emoji: '🐦', category: 'animals' },
      { word: 'fish', emoji: '🐟', category: 'animals' },
    ];
    render(container, makeRound(options[0], options), { onCorrect: vi.fn() });

    const emojis = [...container.querySelectorAll('.findit-tile')].map((t) => t.textContent);
    expect(emojis).toEqual(['🐱', '🐶', '🐦', '🐟']);
  });

  it('correct tap marks the tile green and fires onCorrect after the auto-advance delay', () => {
    document.body.innerHTML = '<div id="findit"></div>';
    const container = document.getElementById('findit');
    const options = [
      { word: 'cat', emoji: '🐱', category: 'animals' },
      { word: 'dog', emoji: '🐶', category: 'animals' },
      { word: 'bird', emoji: '🐦', category: 'animals' },
      { word: 'fish', emoji: '🐟', category: 'animals' },
    ];
    const onCorrect = vi.fn();
    render(container, makeRound(options[0], options), { onCorrect });

    const tiles = container.querySelectorAll('.findit-tile');
    tiles[0].click();

    expect(onCorrect).not.toHaveBeenCalled();
    expect(tiles[0].classList.contains('correct')).toBe(true);

    vi.advanceTimersByTime(1000);
    expect(onCorrect).toHaveBeenCalledTimes(1);
  });

  it('wrong tap wobbles the tile red and does NOT fire onCorrect', () => {
    document.body.innerHTML = '<div id="findit"></div>';
    const container = document.getElementById('findit');
    const options = [
      { word: 'cat', emoji: '🐱', category: 'animals' },
      { word: 'dog', emoji: '🐶', category: 'animals' },
      { word: 'bird', emoji: '🐦', category: 'animals' },
      { word: 'fish', emoji: '🐟', category: 'animals' },
    ];
    const onCorrect = vi.fn();
    render(container, makeRound(options[0], options), { onCorrect });

    const tiles = container.querySelectorAll('.findit-tile');
    tiles[1].click();

    expect(onCorrect).not.toHaveBeenCalled();
    expect(tiles[1].classList.contains('wrong')).toBe(true);
    expect(tiles[1].disabled).toBe(true);

    vi.advanceTimersByTime(2000);
    expect(tiles[1].disabled).toBe(false);
  });

  it('wrong tap on one tile does not disable the others', () => {
    document.body.innerHTML = '<div id="findit"></div>';
    const container = document.getElementById('findit');
    const options = [
      { word: 'cat', emoji: '🐱', category: 'animals' },
      { word: 'dog', emoji: '🐶', category: 'animals' },
      { word: 'bird', emoji: '🐦', category: 'animals' },
      { word: 'fish', emoji: '🐟', category: 'animals' },
    ];
    render(container, makeRound(options[0], options), { onCorrect: vi.fn() });

    const tiles = container.querySelectorAll('.findit-tile');
    tiles[1].click();
    expect(tiles[0].disabled).toBe(false);
    expect(tiles[2].disabled).toBe(false);
    expect(tiles[3].disabled).toBe(false);
  });

  it('🔊 button replays the prompt immediately', () => {
    document.body.innerHTML = '<div id="findit"></div>';
    const container = document.getElementById('findit');
    const options = [
      { word: 'cat', emoji: '🐱', category: 'animals' },
      { word: 'dog', emoji: '🐶', category: 'animals' },
      { word: 'bird', emoji: '🐦', category: 'animals' },
      { word: 'fish', emoji: '🐟', category: 'animals' },
    ];
    render(container, makeRound(options[0], options), { onCorrect: vi.fn() });

    speakMock.mockClear();
    container.querySelector('.findit-replay').click();
    expect(speakMock).toHaveBeenCalledWith('Find the cat');
    expect(speakMock).toHaveBeenCalledTimes(1);
  });

  it('auto-replays the prompt after 4s with no input, and any tap clears it', () => {
    document.body.innerHTML = '<div id="findit"></div>';
    const container = document.getElementById('findit');
    const options = [
      { word: 'cat', emoji: '🐱', category: 'animals' },
      { word: 'dog', emoji: '🐶', category: 'animals' },
      { word: 'bird', emoji: '🐦', category: 'animals' },
      { word: 'fish', emoji: '🐟', category: 'animals' },
    ];
    render(container, makeRound(options[0], options), { onCorrect: vi.fn() });

    speakMock.mockClear();
    vi.advanceTimersByTime(3999);
    expect(speakMock).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(speakMock).toHaveBeenCalledWith('Find the cat');
  });

  it('any tile tap clears the 4s auto-replay', () => {
    document.body.innerHTML = '<div id="findit"></div>';
    const container = document.getElementById('findit');
    const options = [
      { word: 'cat', emoji: '🐱', category: 'animals' },
      { word: 'dog', emoji: '🐶', category: 'animals' },
      { word: 'bird', emoji: '🐦', category: 'animals' },
      { word: 'fish', emoji: '🐟', category: 'animals' },
    ];
    render(container, makeRound(options[0], options), { onCorrect: vi.fn() });

    speakMock.mockClear();
    vi.advanceTimersByTime(2000);
    container.querySelectorAll('.findit-tile')[1].click();
    speakMock.mockClear();
    vi.advanceTimersByTime(5000);
    expect(speakMock).not.toHaveBeenCalled();
  });

  it('destroy() clears pending timers so no replay fires after leaving the round', () => {
    document.body.innerHTML = '<div id="findit"></div>';
    const container = document.getElementById('findit');
    const options = [
      { word: 'cat', emoji: '🐱', category: 'animals' },
      { word: 'dog', emoji: '🐶', category: 'animals' },
      { word: 'bird', emoji: '🐦', category: 'animals' },
      { word: 'fish', emoji: '🐟', category: 'animals' },
    ];
    const handle = render(container, makeRound(options[0], options), { onCorrect: vi.fn() });
    handle.destroy();

    speakMock.mockClear();
    vi.advanceTimersByTime(5000);
    expect(speakMock).not.toHaveBeenCalled();
  });
});

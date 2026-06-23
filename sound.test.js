import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('sound', () => {
  let playCheer;
  let playTryAgain;

  beforeEach(async () => {
    const mod = await import('./sound.js?t=' + Date.now());
    playCheer = mod.playCheer;
    playTryAgain = mod.playTryAgain;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('playCheer does not throw when AudioContext is unavailable', () => {
    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('webkitAudioContext', undefined);
    expect(() => playCheer()).not.toThrow();
  });

  it('playCheer synthesizes tones via AudioContext when available', () => {
    const oscillators = [];
    const gains = [];
    const ctx = {
      currentTime: 100,
      createOscillator: vi.fn(() => {
        const o = { frequency: { value: 0 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
        oscillators.push(o);
        return o;
      }),
      createGain: vi.fn(() => {
        const g = { gain: { value: 1, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn() };
        gains.push(g);
        return g;
      }),
      destination: {},
      close: vi.fn(),
    };
    vi.stubGlobal('AudioContext', vi.fn(() => ctx));

    playCheer();

    expect(oscillators.length).toBeGreaterThanOrEqual(2);
    expect(ctx.createOscillator).toHaveBeenCalled();
    for (const o of oscillators) {
      expect(o.connect).toHaveBeenCalled();
      expect(o.start).toHaveBeenCalled();
      expect(o.stop).toHaveBeenCalled();
    }
  });

  it('playTryAgain does not throw when AudioContext is unavailable', () => {
    vi.stubGlobal('AudioContext', undefined);
    vi.stubGlobal('webkitAudioContext', undefined);
    expect(() => playTryAgain()).not.toThrow();
  });

  it('playTryAgain synthesizes tones via AudioContext when available', () => {
    const oscillators = [];
    const ctx = {
      currentTime: 100,
      createOscillator: vi.fn(() => {
        const o = { frequency: { value: 0 }, connect: vi.fn(), start: vi.fn(), stop: vi.fn() };
        oscillators.push(o);
        return o;
      }),
      createGain: vi.fn(() => ({
        gain: { value: 1, setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
        connect: vi.fn(),
      })),
      destination: {},
      close: vi.fn(),
    };
    vi.stubGlobal('AudioContext', vi.fn(() => ctx));

    playTryAgain();

    expect(oscillators.length).toBeGreaterThanOrEqual(2);
  });
});

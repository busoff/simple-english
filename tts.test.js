import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('TTS service', () => {
  let speechSynthesis;
  let SpeechSynthesisUtterance;
  let speak, isAvailable, onAvailabilityChange, __resetForTest;

  beforeEach(async () => {
    speechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn(),
      getVoices: vi.fn(() => []),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      speaking: false,
    };
    SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => ({ text }));
    vi.stubGlobal('speechSynthesis', speechSynthesis);
    vi.stubGlobal('SpeechSynthesisUtterance', SpeechSynthesisUtterance);
    vi.useFakeTimers();
    const mod = await import('./tts.js?t=' + Date.now());
    speak = mod.speak;
    isAvailable = mod.isAvailable;
    onAvailabilityChange = mod.onAvailabilityChange;
    __resetForTest = mod.__resetForTest;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('cancels any in-flight speech before speaking', () => {
    speak('cat');
    expect(speechSynthesis.cancel).toHaveBeenCalledBefore(speechSynthesis.speak);
    expect(speechSynthesis.speak).toHaveBeenCalledTimes(1);
  });

  it('builds an utterance with en-US lang, rate 0.9, pitch 1.0', () => {
    speak('cat');
    expect(SpeechSynthesisUtterance).toHaveBeenCalledWith('cat');
    const utterance = speechSynthesis.speak.mock.calls[0][0];
    expect(utterance.text).toBe('cat');
    expect(utterance.lang).toBe('en-US');
    expect(utterance.rate).toBe(0.9);
    expect(utterance.pitch).toBe(1.0);
  });

  it('prefers an en-US voice when one exists', () => {
    const enUsVoice = { name: 'A', lang: 'en-US' };
    const otherVoice = { name: 'B', lang: 'en-GB' };
    cachedVoicesSetter([otherVoice, enUsVoice]);
    speak('cat');
    const utterance = speechSynthesis.speak.mock.calls[0][0];
    expect(utterance.voice).toBe(enUsVoice);
  });

  it('reports unavailable when no en-US voice exists, and notifies when one loads', () => {
    expect(isAvailable()).toBe(false);
    const cb = vi.fn();
    onAvailabilityChange(cb);
    const voicesChangedHandler = speechSynthesis.addEventListener.mock.calls.find(
      ([event]) => event === 'voiceschanged',
    )?.[1];
    cachedVoicesSetter([{ name: 'A', lang: 'en-US' }]);
    voicesChangedHandler?.();
    expect(isAvailable()).toBe(true);
    expect(cb).toHaveBeenCalledWith(true);
  });

  function cachedVoicesSetter(voices) {
    speechSynthesis.getVoices.mockReturnValue(voices);
  }
});

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as sound from './sound.js';
import { playCorrect, playWrong, playCelebrate } from './feedback.js';

describe('feedback', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.spyOn(sound, 'playCheer');
    vi.spyOn(sound, 'playTryAgain');
  });

  it('playCorrect adds the "correct" animation class to the target element', () => {
    const target = document.createElement('button');
    playCorrect(target);
    expect(target.classList.contains('correct')).toBe(true);
  });

  it('playWrong adds the "wrong" animation class to the target element', () => {
    const target = document.createElement('button');
    playWrong(target);
    expect(target.classList.contains('wrong')).toBe(true);
  });

  it('playCorrect plays the cheer sound', () => {
    playCorrect(document.createElement('button'));
    expect(sound.playCheer).toHaveBeenCalled();
  });

  it('playWrong plays the try-again sound', () => {
    playWrong(document.createElement('button'));
    expect(sound.playTryAgain).toHaveBeenCalled();
  });

  it('playCelebrate appends a confetti burst with 🎉, ✨, ⭐ to the container', () => {
    const container = document.createElement('div');
    playCelebrate(container);

    const burst = container.querySelector('.confetti-burst');
    expect(burst).toBeTruthy();

    const text = burst.textContent;
    expect(text).toContain('🎉');
    expect(text).toContain('✨');
    expect(text).toContain('⭐');
  });
});

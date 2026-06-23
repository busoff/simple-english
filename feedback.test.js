import { describe, it, expect, beforeEach } from 'vitest';
import { playCorrect, playWrong, playCelebrate } from './feedback.js';

describe('feedback', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
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

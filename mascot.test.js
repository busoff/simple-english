import { describe, it, expect, beforeEach } from 'vitest';
import { createMascot } from './mascot.js';

describe('mascot', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the parrot emoji', () => {
    const mascot = createMascot();
    expect(mascot.textContent).toBe('🦜');
  });

  it('applies the idle-sway animation class by default', () => {
    const mascot = createMascot();
    expect(mascot.classList.contains('mascot-idle')).toBe(true);
  });

  it('home context: 120px size with idle-sway animation', () => {
    const mascot = createMascot('home');
    expect(mascot.style.fontSize).toBe('120px');
    expect(mascot.classList.contains('mascot-idle')).toBe(true);
  });

  it('celebration context: 96px size with bounce animation', () => {
    const mascot = createMascot('celebration');
    expect(mascot.style.fontSize).toBe('96px');
    expect(mascot.classList.contains('mascot-bounce')).toBe(true);
  });

  it('rotateNag context: 80px size with confused animation and 💭🔄 thought bubble', () => {
    const mascot = createMascot('rotateNag');
    expect(mascot.style.fontSize).toBe('80px');
    expect(mascot.classList.contains('mascot-confused')).toBe(true);
    const thought = mascot.querySelector('.mascot-thought');
    expect(thought).toBeTruthy();
    expect(thought.textContent).toContain('💭');
    expect(thought.textContent).toContain('🔄');
  });
});

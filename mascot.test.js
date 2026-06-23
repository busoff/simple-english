import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMascot } from './mascot.js';

describe('mascot', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('renders the 🦜 parrot emoji', () => {
    const mascot = createMascot();
    expect(mascot.textContent).toBe('🦜');
  });

  it('applies the idle-sway animation class by default', () => {
    const mascot = createMascot();
    expect(mascot.classList.contains('mascot-idle')).toBe(true);
  });
});

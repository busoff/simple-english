import { describe, it, expect } from 'vitest';
import { WORDS, byCategory } from './words.js';

describe('words data', () => {
  it('contains exactly 30 entries', () => {
    expect(WORDS).toHaveLength(30);
  });

  it('every entry has non-empty word, emoji, and a valid category', () => {
    const validCategories = new Set(['animals', 'colors', 'food']);
    for (const entry of WORDS) {
      expect(typeof entry.word).toBe('string');
      expect(entry.word.length).toBeGreaterThan(0);
      expect(typeof entry.emoji).toBe('string');
      expect(entry.emoji.length).toBeGreaterThan(0);
      expect(validCategories.has(entry.category)).toBe(true);
    }
  });

  it('contains exactly 10 animals, 10 colors, and 10 foods', () => {
    expect(byCategory('animals')).toHaveLength(10);
    expect(byCategory('colors')).toHaveLength(10);
    expect(byCategory('food')).toHaveLength(10);
  });

  it('byCategory returns entries with matching category and empty array for unknown', () => {
    const colors = byCategory('colors');
    expect(colors.every((e) => e.category === 'colors')).toBe(true);
    expect(byCategory('planets')).toEqual([]);
  });
});

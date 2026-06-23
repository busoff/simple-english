import { describe, it, expect } from 'vitest';
import { newRound, startSession } from './findIt.js';
import { byCategory } from './words.js';

describe('find-it engine', () => {
  it('returns a target from the requested category', () => {
    const animals = new Set(byCategory('animals'));
    for (let i = 0; i < 20; i++) {
      const round = newRound('animals');
      expect(animals.has(round.target)).toBe(true);
    }
  });

  it('returns exactly 4 unique options', () => {
    for (let i = 0; i < 20; i++) {
      const round = newRound('colors');
      expect(round.options).toHaveLength(4);
      const words = round.options.map((o) => o.word);
      expect(new Set(words).size).toBe(4);
    }
  });

  it('includes the target among the options', () => {
    for (let i = 0; i < 20; i++) {
      const round = newRound('food');
      expect(round.options.some((o) => o.word === round.target.word)).toBe(true);
    }
  });

  it('every option is from the requested category', () => {
    for (let i = 0; i < 20; i++) {
      const round = newRound('animals');
      for (const opt of round.options) {
        expect(opt.category).toBe('animals');
      }
    }
  });

  it('correctIndex points at the target within options', () => {
    for (let i = 0; i < 20; i++) {
      const round = newRound('colors');
      expect(round.correctIndex).toBeGreaterThanOrEqual(0);
      expect(round.correctIndex).toBeLessThan(4);
      expect(round.options[round.correctIndex].word).toBe(round.target.word);
    }
  });

  it('target position varies across rounds (positions are shuffled)', () => {
    const positions = new Set();
    for (let i = 0; i < 40; i++) {
      positions.add(newRound('animals').correctIndex);
    }
    expect(positions.size).toBeGreaterThanOrEqual(3);
  });

  it('every word in the category eventually appears as target over many calls', () => {
    const seen = new Set();
    for (let i = 0; i < 500; i++) {
      seen.add(newRound('colors').target.word);
    }
    expect(seen.size).toBe(10);
  });

  it('is deterministic when given a seeded RNG', () => {
    function seeded(seed) {
      let s = seed;
      return () => {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return s / 0x7fffffff;
      };
    }
    const a = newRound('food', seeded(42));
    const b = newRound('food', seeded(42));
    expect(b.options.map((o) => o.word)).toEqual(a.options.map((o) => o.word));
    expect(b.target.word).toBe(a.target.word);
    expect(b.correctIndex).toBe(a.correctIndex);
  });
});

describe('find-it session', () => {
  it('runs exactly 8 rounds, calling onRound each time and onComplete at the end', () => {
    const rounds = [];
    let completed = 0;
    startSession('animals', {
      onRound: (n, round, next) => {
        rounds.push({ n, round });
        next();
      },
      onComplete: () => { completed += 1; },
    });
    expect(rounds).toHaveLength(8);
    expect(rounds.map((r) => r.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(completed).toBe(1);
  });

  it('does not fire round 9 or onComplete until each round is advanced', () => {
    let completed = 0;
    let roundNums = [];
    let firstNext = null;
    startSession('colors', {
      onRound: (n, round, next) => {
        roundNums.push(n);
        if (n === 1) firstNext = next;
      },
      onComplete: () => { completed += 1; },
    });
    expect(roundNums).toEqual([1]);
    expect(completed).toBe(0);

    firstNext();
    expect(roundNums).toEqual([1, 2]);
    expect(completed).toBe(0);
  });
});

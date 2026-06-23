import { byCategory } from './words.js';

function pickN(arr, n, rng = Math.random) {
  const pool = arr.slice();
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    const idx = Math.floor(rng() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

export function newRound(category, rng = Math.random) {
  const entries = byCategory(category);
  const target = entries[Math.floor(rng() * entries.length)];
  const distractors = pickN(
    entries.filter((e) => e.word !== target.word),
    3,
    rng,
  );
  const options = [target, ...distractors];
  const shuffled = pickN(options, options.length, rng);
  const correctIndex = shuffled.findIndex((o) => o.word === target.word);
  return { target, options: shuffled, correctIndex };
}

export function startSession(category, { onRound, onComplete }) {
  let roundNum = 0;
  const advance = () => {
    roundNum += 1;
    if (roundNum > 8) {
      onComplete?.();
      return;
    }
    onRound?.(roundNum, newRound(category), advance);
  };
  advance();
}

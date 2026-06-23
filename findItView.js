import { speak } from './tts.js';

const ADVANCE_MS = 1000;
const WRONG_DISABLE_MS = 1500;
const AUTO_REPLAY_MS = 4000;

export function render(container, round, callbacks = {}) {
  container.innerHTML = '';

  const prompt = `Find the ${round.target.word}`;
  let autoReplayTimer = null;
  let advanceTimer = null;
  const wrongTimers = new Map();
  let settled = false;

  function clearAutoReplay() {
    if (autoReplayTimer !== null) {
      clearTimeout(autoReplayTimer);
      autoReplayTimer = null;
    }
  }
  function scheduleAutoReplay() {
    clearAutoReplay();
    autoReplayTimer = setTimeout(() => {
      autoReplayTimer = null;
      speak(prompt);
    }, AUTO_REPLAY_MS);
  }

  const grid = document.createElement('div');
  grid.className = 'findit-grid';
  const tiles = [];
  round.options.forEach((option, index) => {
    const tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'findit-tile';
    tile.textContent = option.emoji;
    tile.setAttribute('aria-label', option.word);
    tile.addEventListener('click', () => onTileTap(index));
    grid.appendChild(tile);
    tiles.push(tile);
  });
  container.appendChild(grid);

  const replay = document.createElement('button');
  replay.type = 'button';
  replay.className = 'findit-replay';
  replay.setAttribute('aria-label', 'Hear again');
  replay.textContent = '🔊';
  replay.addEventListener('click', (e) => {
    e.stopPropagation();
    clearAutoReplay();
    speak(prompt);
  });
  container.appendChild(replay);

  function onTileTap(index) {
    if (settled || tiles[index].disabled) return;
    clearAutoReplay();
    if (index === round.correctIndex) {
      settled = true;
      tiles[index].classList.add('correct');
      advanceTimer = setTimeout(() => {
        advanceTimer = null;
        callbacks.onCorrect?.();
      }, ADVANCE_MS);
      return;
    }
    tiles[index].classList.add('wrong');
    tiles[index].disabled = true;
    const id = setTimeout(() => {
      wrongTimers.delete(index);
      tiles[index].classList.remove('wrong');
      tiles[index].disabled = false;
    }, WRONG_DISABLE_MS);
    wrongTimers.set(index, id);
  }

  speak(prompt);
  scheduleAutoReplay();

  return {
    destroy() {
      settled = true;
      clearAutoReplay();
      if (advanceTimer !== null) clearTimeout(advanceTimer);
      for (const id of wrongTimers.values()) clearTimeout(id);
      wrongTimers.clear();
    },
  };
}

import { speak } from './tts.js';

let currentEntry = null;

export function openExplore(entry) {
  currentEntry = entry;
  document.getElementById('explore-emoji').textContent = entry.emoji;
  document.getElementById('explore-word').textContent = entry.word;
  speak(entry.word);
}

export function initExplore() {
  const card = document.getElementById('explore-card');
  const replay = document.getElementById('explore-replay');
  const replayWord = (e) => {
    e?.stopPropagation();
    if (currentEntry) speak(currentEntry.word);
  };
  card?.addEventListener('click', replayWord);
  replay?.addEventListener('click', replayWord);
}

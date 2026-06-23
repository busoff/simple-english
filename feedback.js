import { playCheer, playTryAgain } from './sound.js';

export function playCorrect(targetEl) {
  targetEl.classList.add('correct');
  playCheer();
}

export function playWrong(targetEl) {
  targetEl.classList.add('wrong');
  playTryAgain();
}

const CONFETTI_EMOJI = ['🎉', '✨', '⭐'];
const CONFETTI_COUNT = 12;

export function playCelebrate(container) {
  const burst = document.createElement('div');
  burst.className = 'confetti-burst';
  burst.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti-piece';
    piece.textContent = CONFETTI_EMOJI[i % CONFETTI_EMOJI.length];
    burst.appendChild(piece);
  }
  container.appendChild(burst);
}

import { byCategory } from './words.js';
import { showScreen, initRouter } from './router.js';
import { openExplore, initExplore } from './explore.js';
import { isAvailable, onAvailabilityChange } from './tts.js';
import { createMascot } from './mascot.js';
import { startSession } from './findIt.js';
import { render as renderFindIt } from './findItView.js';
import { playCelebrate } from './feedback.js';
import { initOrientation } from './orientation.js';

const CATEGORIES = [
  { id: 'animals', label: 'Animals', emoji: '🐾' },
  { id: 'colors', label: 'Colors', emoji: '🎨' },
  { id: 'food', label: 'Food', emoji: '🍎' },
];

const YAY_HOLD_MS = 3000;

let currentCategory = null;
let findItViewHandle = null;
let yayTimer = null;

function renderHome() {
  const mascotSlot = document.getElementById('home-mascot-slot');
  mascotSlot.innerHTML = '';
  mascotSlot.appendChild(createMascot('home'));

  const indicator = document.getElementById('tts-indicator');
  indicator.classList.toggle('hidden', isAvailable());
  onAvailabilityChange((available) => {
    indicator.classList.toggle('hidden', available);
  });

  for (const cat of CATEGORIES) {
    const btn = document.querySelector(
      `.category-tile[data-category="${cat.id}"]`,
    );
    btn?.addEventListener('click', () => showScreen('category', { category: cat.id }));
  }
}

function renderCategory(category) {
  currentCategory = category;
  const grid = document.getElementById('word-grid');
  grid.innerHTML = '';
  for (const entry of byCategory(category)) {
    const tile = document.createElement('button');
    tile.className = 'word-tile';
    tile.type = 'button';
    tile.textContent = entry.emoji;
    tile.setAttribute('aria-label', entry.word);
    tile.addEventListener('click', () => {
      openExplore(entry);
      showScreen('explore', { word: entry.word });
    });
    grid.appendChild(tile);
  }
}

function setMode(mode) {
  document.querySelectorAll('.mode-option').forEach((o) => {
    o.classList.toggle('active', o.dataset.mode === mode);
  });
}

function setModeToggleVisible(visible) {
  document.getElementById('mode-toggle')?.classList.toggle('hidden', !visible);
}

function exitFindIt() {
  findItViewHandle?.destroy();
  findItViewHandle = null;
  if (yayTimer !== null) {
    clearTimeout(yayTimer);
    yayTimer = null;
  }
}

function startFindIt(category) {
  exitFindIt();
  const container = document.getElementById('findit-container');
  const session = startSession(category, {
    onRound: (_n, round, next) => {
      findItViewHandle?.destroy();
      findItViewHandle = renderFindIt(container, round, { onCorrect: next });
    },
    onComplete: () => {
      findItViewHandle?.destroy();
      findItViewHandle = null;
      showScreen('yay');
      playCelebrate(document.querySelector('.yay-card'));
      yayTimer = setTimeout(() => {
        yayTimer = null;
        setMode('look');
        showScreen('category', { category });
      }, YAY_HOLD_MS);
    },
  });
  void session;
  showScreen('findit');
}

function setupModeToggle() {
  const options = document.querySelectorAll('.mode-option');
  options.forEach((opt) => {
    opt.addEventListener('click', () => {
      const mode = opt.dataset.mode;
      if (mode === 'play') {
        setMode('play');
        startFindIt(currentCategory);
      } else {
        exitFindIt();
        setMode('look');
        showScreen('category', { category: currentCategory });
      }
    });
  });
}

function interceptBackGesture() {
  history.pushState({ screen: 'home' }, '');
  window.addEventListener('popstate', (e) => {
    e.preventDefault?.();
    history.pushState({ screen: 'home' }, '');
    exitFindIt();
    showScreen('home');
  });
}

function renderRotateNagMascot() {
  const slot = document.getElementById('rotate-nag-mascot');
  if (slot) {
    slot.innerHTML = '';
    slot.appendChild(createMascot('rotateNag'));
  }
}

export function bootstrap() {
  initRouter();
  initExplore();
  renderHome();
  setupModeToggle();
  interceptBackGesture();
  renderRotateNagMascot();
  initOrientation();

  document.addEventListener('screen-change', (e) => {
    const { name, params } = e.detail;
    if (name === 'category' && params?.category) {
      renderCategory(params.category);
    }
    if (name === 'home') {
      exitFindIt();
    }
    setModeToggleVisible(name === 'category' || name === 'findit');
  });

  const homeBtn = document.getElementById('home-btn');
  homeBtn?.addEventListener('click', exitFindIt);
}

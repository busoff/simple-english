import { WORDS, byCategory } from './words.js';
import { showScreen, initRouter } from './router.js';
import { openExplore, initExplore } from './explore.js';
import { isAvailable, onAvailabilityChange } from './tts.js';
import { createMascot } from './mascot.js';

const CATEGORIES = [
  { id: 'animals', label: 'Animals', emoji: '🐾' },
  { id: 'colors', label: 'Colors', emoji: '🎨' },
  { id: 'food', label: 'Food', emoji: '🍎' },
];

function renderHome() {
  const mascotSlot = document.getElementById('home-mascot-slot');
  mascotSlot.appendChild(createMascot());

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

function setupModeToggle() {
  const options = document.querySelectorAll('.mode-option');
  options.forEach((opt) => {
    opt.addEventListener('click', () => {
      options.forEach((o) => o.classList.remove('active'));
      opt.classList.add('active');
    });
  });
}

function interceptBackGesture() {
  history.pushState({ screen: 'home' }, '');
  window.addEventListener('popstate', (e) => {
    e.preventDefault?.();
    history.pushState({ screen: 'home' }, '');
    showScreen('home');
  });
}

function init() {
  initRouter();
  initExplore();
  renderHome();
  setupModeToggle();
  interceptBackGesture();

  document.addEventListener('screen-change', (e) => {
    const { name, params } = e.detail;
    if (name === 'category' && params?.category) {
      renderCategory(params.category);
    }
  });
}

init();

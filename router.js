const SCREENS = ['home', 'category', 'explore', 'findit', 'yay'];

function screenEl(name) {
  return document.getElementById(`screen-${name}`);
}

export function showScreen(name, params = {}) {
  for (const s of SCREENS) {
    const el = screenEl(s);
    if (!el) continue;
    el.classList.toggle('hidden', s !== name);
  }
  document.dispatchEvent(
    new CustomEvent('screen-change', { detail: { name, params } }),
  );
}

export function initRouter() {
  const homeBtn = document.getElementById('home-btn');
  homeBtn?.addEventListener('click', () => showScreen('home'));
  showScreen('home');
}

export function createMascot() {
  const el = document.createElement('div');
  el.className = 'mascot mascot-idle';
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', 'Pip the parrot');
  el.textContent = '🦜';
  return el;
}

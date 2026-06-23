const SIZES = {
  home: '120px',
  celebration: '96px',
  rotateNag: '80px',
};

const STATE_CLASS = {
  home: 'mascot-idle',
  celebration: 'mascot-bounce',
  rotateNag: 'mascot-confused',
};

export function createMascot(context = 'home') {
  const el = document.createElement('div');
  el.className = 'mascot';
  el.setAttribute('role', 'img');
  el.setAttribute('aria-label', 'Pip the parrot');
  el.textContent = '🦜';
  el.style.fontSize = SIZES[context] ?? SIZES.home;
  el.classList.add(STATE_CLASS[context] ?? STATE_CLASS.home);

  if (context === 'rotateNag') {
    const thought = document.createElement('span');
    thought.className = 'mascot-thought';
    thought.setAttribute('aria-hidden', 'true');
    thought.textContent = '💭🔄';
    el.appendChild(thought);
  }

  return el;
}

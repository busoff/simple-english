function isPortrait() {
  return window.innerHeight > window.innerWidth;
}

export function applyOrientation() {
  const overlay = document.getElementById('rotate-nag');
  if (!overlay) return;
  overlay.classList.add('hidden');
}

export function initOrientation() {
  window.addEventListener('resize', applyOrientation);
  window.addEventListener('orientationchange', applyOrientation);
  applyOrientation();
}

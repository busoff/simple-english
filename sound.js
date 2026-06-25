function getAudioContextCtor() {
  if (typeof AudioContext !== 'undefined') return AudioContext;
  if (typeof webkitAudioContext !== 'undefined') return webkitAudioContext;
  return null;
}

function playTone(ctx, { freq, start, duration, type = 'triangle', peak = 0.18 }) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);

  const t0 = ctx.currentTime + start;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(peak, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export function playCheer() {
  const Ctor = getAudioContextCtor();
  if (!Ctor) return;
  const ctx = new Ctor();
  // ascending C-E-G major arpeggio
  playTone(ctx, { freq: 523.25, start: 0.00, duration: 0.12 });
  playTone(ctx, { freq: 659.25, start: 0.10, duration: 0.12 });
  playTone(ctx, { freq: 783.99, start: 0.20, duration: 0.20 });
  setTimeout(() => {
    if (ctx.state !== 'closed') ctx.close().catch(() => {});
  }, 600);
}

export function playTryAgain() {
  const Ctor = getAudioContextCtor();
  if (!Ctor) return;
  const ctx = new Ctor();
  // soft descending minor two-tone (A4 -> E4)
  playTone(ctx, { freq: 440.00, start: 0.00, duration: 0.18, type: 'sine', peak: 0.14 });
  playTone(ctx, { freq: 329.63, start: 0.16, duration: 0.30, type: 'sine', peak: 0.14 });
  setTimeout(() => {
    if (ctx.state !== 'closed') ctx.close().catch(() => {});
  }, 700);
}

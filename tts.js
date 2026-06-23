const RATE = 0.9;
const PITCH = 1.0;
const LANG = 'en-US';

let cachedVoices = [];
let available = false;
const availabilityListeners = new Set();

function pickVoice(voices) {
  const enUs = voices.find((v) => v.lang === LANG);
  if (enUs) return enUs;
  const enAny = voices.find((v) => v.lang && v.lang.startsWith('en'));
  return enAny || null;
}

function refreshAvailability() {
  const wasAvailable = available;
  const voices = cachedVoices.length
    ? cachedVoices
    : (typeof speechSynthesis !== 'undefined' ? speechSynthesis.getVoices() : []);
  cachedVoices = voices;
  available = !!pickVoice(voices);
  if (available !== wasAvailable) {
    availabilityListeners.forEach((cb) => cb(available));
  }
}

export function isAvailable() {
  return available;
}

export function onAvailabilityChange(cb) {
  availabilityListeners.add(cb);
  return () => availabilityListeners.delete(cb);
}

export function speak(text) {
  if (typeof speechSynthesis === 'undefined') return;
  speechSynthesis.cancel();
  if (!text) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG;
  utterance.rate = RATE;
  utterance.pitch = PITCH;
  const voices = currentVoices();
  const voice = pickVoice(voices);
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

function currentVoices() {
  if (typeof speechSynthesis === 'undefined') return [];
  const fresh = speechSynthesis.getVoices?.() ?? [];
  cachedVoices = fresh.length ? fresh : cachedVoices;
  return cachedVoices;
}

export function __resetForTest() {
  cachedVoices = [];
  available = false;
  availabilityListeners.clear();
}

if (typeof speechSynthesis !== 'undefined') {
  refreshAvailability();
  speechSynthesis.addEventListener?.('voiceschanged', refreshAvailability);
}

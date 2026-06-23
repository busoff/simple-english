export const ttsMockScript = `
(() => {
  const calls = { speakCalls: [], cancelCount: 0 };
  window.__tts = calls;
  const synth = {
    cancel: () => { calls.cancelCount += 1; },
    speak: (utterance) => { calls.speakCalls.push(utterance ? utterance.text : null); },
    getVoices: () => [{ name: 'Mock en-US', lang: 'en-US' }],
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  Object.defineProperty(window, 'speechSynthesis', { value: synth, configurable: true, writable: true });
  Object.defineProperty(window, 'SpeechSynthesisUtterance', {
    value: function (text) {
      this.text = text;
      this.lang = '';
      this.rate = 1;
      this.pitch = 1;
      this.voice = null;
    },
    configurable: true,
    writable: true,
  });
})();
`;

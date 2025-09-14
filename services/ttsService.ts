// services/ttsService.ts

let voices: SpeechSynthesisVoice[] = [];

// This function populates the voices array.
const populateVoices = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        voices = window.speechSynthesis.getVoices();
    }
};

// Try to populate voices initially, and set up a listener for when they change.
// This is a reliable cross-browser way to handle asynchronous voice loading.
if (typeof window !== 'undefined' && window.speechSynthesis) {
    populateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoices;
    }
}

const createUtterance = (text: string, lang: 'zh-CN' | 'en-US'): SpeechSynthesisUtterance => {
  // For some mobile browsers, we need to get the voices again right before speaking.
  populateVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.2;

  let desiredVoice = voices.find(voice => voice.lang === lang);
  if (!desiredVoice && lang === 'zh-CN') {
    // Fallback to any Chinese voice if the specific 'zh-CN' isn't available
    desiredVoice = voices.find(voice => voice.lang.startsWith('zh'));
  }

  if (desiredVoice) {
    utterance.voice = desiredVoice;
  } else {
    console.warn(`No voice found for lang: ${lang}. The available voices are:`, voices.map(v => `${v.name} (${v.lang})`));
  }
  
  return utterance;
};

const prepareToSpeak = (): boolean => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        return false;
    }
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();
    return true;
}

export const speak = (text: string, lang: 'zh-CN' | 'en-US') => {
  if (!prepareToSpeak()) return;
  const utterance = createUtterance(text, lang);
  window.speechSynthesis.speak(utterance);
};

export const speakSequence = (parts: {text: string, lang: 'zh-CN' | 'en-US'}[]) => {
  if (!prepareToSpeak() || parts.length === 0) return;

  parts.forEach(part => {
    const utterance = createUtterance(part.text, part.lang);
    window.speechSynthesis.speak(utterance);
  });
};
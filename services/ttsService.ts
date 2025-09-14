// services/ttsService.ts

let voices: SpeechSynthesisVoice[] = [];

// This function populates the voices array.
const populateVoices = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        const newVoices = window.speechSynthesis.getVoices();
        // The voices list can be transiently empty, only update if the new list is not empty.
        if (newVoices.length > 0) {
            voices = newVoices;
        }
    }
};

// Try to populate voices initially, and set up a listener for when they change.
if (typeof window !== 'undefined' && window.speechSynthesis) {
    populateVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = populateVoices;
    }
}

const createUtterance = (text: string, lang: 'zh-CN' | 'en-US'): SpeechSynthesisUtterance => {
  // Always get the latest list of voices right before creating an utterance.
  // This is the most reliable way to deal with lazy-loading voices on mobile.
  const currentVoices = window.speechSynthesis.getVoices();
  if (currentVoices.length > 0) {
      voices = currentVoices;
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.2;

  // Prioritize finding an exact match for the language and locale.
  let desiredVoice = voices.find(voice => voice.lang === lang);
  
  // If no exact match is found for Chinese, broaden the search.
  if (!desiredVoice && lang === 'zh-CN') {
    // Look for any voice where the language code starts with 'zh'.
    desiredVoice = voices.find(voice => voice.lang.startsWith('zh'));
  }

  if (desiredVoice) {
    utterance.voice = desiredVoice;
  } else {
    // Log a warning if no suitable voice is found. This helps in debugging.
    console.warn(`TTS Service: No voice found for lang: ${lang}. The browser may use a default voice.`);
    if (voices.length > 0) {
        console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
    } else {
        console.log('Available voices: list is currently empty.');
    }
  }
  
  return utterance;
};

// A helper function to manage the state before speaking.
const prepareToSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        return false;
    }
    // If the synth is paused, resuming can sometimes fix a stuck state.
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }
    // Clear the queue of any pending utterances.
    window.speechSynthesis.cancel();
    return true;
}

export const speak = (text: string, lang: 'zh-CN' | 'en-US') => {
  if (!prepareToSpeak()) return;
  
  // Introduce a small delay after cancelling to allow the TTS engine to reset.
  // This is a common workaround for bugs in mobile browsers.
  setTimeout(() => {
    const utterance = createUtterance(text, lang);
    window.speechSynthesis.speak(utterance);
  }, 100);
};

export const speakSequence = (parts: {text: string, lang: 'zh-CN' | 'en-US'}[]) => {
  if (!prepareToSpeak() || parts.length === 0) return;

  // Introduce a small delay after cancelling to allow the TTS engine to reset.
  setTimeout(() => {
    parts.forEach(part => {
      const utterance = createUtterance(part.text, part.lang);
      window.speechSynthesis.speak(utterance);
    });
  }, 100);
};

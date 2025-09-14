// services/ttsService.ts

let voices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false; // To track if the loading process has completed at least once.

const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return resolve([]);
    }

    // If we already have voices, resolve immediately.
    if (voicesLoaded && voices.length > 0) {
      return resolve(voices);
    }
    
    const timeout = setTimeout(() => {
        console.warn('Speech synthesis voice loading timed out.');
        const currentVoices = window.speechSynthesis.getVoices();
        voices = currentVoices;
        voicesLoaded = true;
        resolve(voices);
    }, 2500);

    const setAndResolve = () => {
      const voiceList = window.speechSynthesis.getVoices();
      if (voiceList.length > 0) {
        clearTimeout(timeout);
        voices = voiceList;
        voicesLoaded = true;
        resolve(voiceList);
        window.speechSynthesis.onvoiceschanged = null; // Clean up listener
        return true;
      }
      return false;
    };

    if (!setAndResolve()) {
      window.speechSynthesis.onvoiceschanged = setAndResolve;
    }
  });
};

/**
 * Initializes the audio engine by "priming" it and then checks for Chinese voice support.
 * Must be called from within a user-initiated event (e.g., a button click).
 * @returns {Promise<boolean>} A promise that resolves to true if a Chinese voice is found, false otherwise.
 */
export const initializeAndCheckChineseSupport = async (): Promise<boolean> => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        return false;
    }

    // On some mobile browsers, getVoices() is empty until the first speech request.
    // This "primes the pump" by making a silent, instantly-cancelled request.
    if (window.speechSynthesis.getVoices().length === 0) {
        const primer = new SpeechSynthesisUtterance(' ');
        primer.volume = 0;
        primer.pitch = 0;
        primer.rate = 0;
        window.speechSynthesis.speak(primer);
        // Give the engine a moment to initialize.
        await new Promise(resolve => setTimeout(resolve, 100));
        window.speechSynthesis.cancel();
    }
    
    await loadVoices();
    return voices.some(voice => voice.lang.startsWith('zh'));
};


const createUtterance = (text: string, lang: 'zh-CN' | 'en-US'): SpeechSynthesisUtterance => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.2;

  // Since loadVoices has been called, the `voices` array should be populated.
  let desiredVoice = voices.find(voice => voice.lang === lang);
  if (!desiredVoice && lang === 'zh-CN') {
    // Fallback to any Chinese voice if the specific 'zh-CN' isn't available
    desiredVoice = voices.find(voice => voice.lang.startsWith('zh'));
  }

  if (desiredVoice) {
    utterance.voice = desiredVoice;
  } else {
    // This is a crucial log for debugging.
    console.warn(`No voice found for lang: ${lang}. The available voices are:`, voices.map(v => v.lang));
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
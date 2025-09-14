// services/ttsService.ts

let voices: SpeechSynthesisVoice[] = [];
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  if (voicesPromise) {
    return voicesPromise;
  }
  voicesPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      return resolve([]);
    }

    // Failsafe: If voices don't load after 2.5s, resolve with what we have (or empty).
    // This prevents the app from getting stuck if `onvoiceschanged` never fires.
    const timeout = setTimeout(() => {
        console.warn('Speech synthesis voice loading timed out.');
        const currentVoices = window.speechSynthesis.getVoices();
        if (currentVoices.length > 0) {
            voices = currentVoices;
            resolve(voices);
        } else {
            resolve([]); // Resolve with empty array to unblock the UI
        }
    }, 2500);

    const setAndResolve = () => {
      const voiceList = window.speechSynthesis.getVoices();
      if (voiceList.length > 0) {
        clearTimeout(timeout); // We got voices, so cancel the failsafe timeout
        voices = voiceList; 
        resolve(voiceList);
        return true;
      }
      return false;
    };

    if (!setAndResolve()) {
      window.speechSynthesis.onvoiceschanged = setAndResolve;
    }
  });
  return voicesPromise;
};

// Immediately start loading voices when the module is loaded.
loadVoices();

/**
 * Checks if a Chinese language voice pack is available for speech synthesis.
 * @returns {Promise<boolean>} A promise that resolves to true if a Chinese voice is found, false otherwise.
 */
export const isChineseSupported = async (): Promise<boolean> => {
    await loadVoices(); // Wait for the voices list to be populated
    return voices.some(voice => voice.lang.startsWith('zh'));
};


const createUtterance = (text: string, lang: 'zh-CN' | 'en-US'): SpeechSynthesisUtterance => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.2;

  // This synchronous check is a fallback for immediate user interaction.
  if (voices.length === 0) {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
          voices = availableVoices;
      }
  }

  let desiredVoice = voices.find(voice => voice.lang === lang);
  if (!desiredVoice && lang === 'zh-CN') {
    desiredVoice = voices.find(voice => voice.lang.startsWith('zh'));
  }

  if (desiredVoice) {
    utterance.voice = desiredVoice;
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
// A singleton promise to ensure we only try to load voices once.
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/**
 * Asynchronously loads and caches the list of available speech synthesis voices.
 * This is crucial because browsers load voices asynchronously.
 * @returns A promise that resolves with an array of SpeechSynthesisVoice objects.
 */
const getVoices = (): Promise<SpeechSynthesisVoice[]> => {
  if (voicesPromise) {
    return voicesPromise;
  }

  voicesPromise = new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported.');
      resolve([]);
      return;
    }

    const load = () => {
      const voiceList = window.speechSynthesis.getVoices();
      if (voiceList.length > 0) {
        // Voices are loaded, resolve the promise.
        resolve(voiceList);
        return true;
      }
      return false;
    };
    
    // Try to load voices immediately. If they're not ready,
    // the onvoiceschanged event will trigger the load later.
    if (!load()) {
      window.speechSynthesis.onvoiceschanged = () => load();
    }
  });

  return voicesPromise;
};

// Start loading voices as soon as the module is imported.
getVoices();


/**
 * Creates and configures a SpeechSynthesisUtterance object with the best available voice.
 * @param text The text to be spoken.
 * @param lang The desired language.
 * @param voices The array of available system voices.
 * @returns A configured SpeechSynthesisUtterance object.
 */
const createUtterance = (text: string, lang: 'zh-CN' | 'en-US', voices: SpeechSynthesisVoice[]): SpeechSynthesisUtterance => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.2;

  // Find the best matching voice.
  // 1. Exact match for lang (e.g., 'zh-CN').
  let desiredVoice = voices.find(voice => voice.lang === lang);
  
  // 2. If no exact match for Chinese, try a broader match (e.g., 'zh-TW', 'zh-HK').
  if (!desiredVoice && lang === 'zh-CN') {
    desiredVoice = voices.find(voice => voice.lang.startsWith('zh'));
  }

  if (desiredVoice) {
    utterance.voice = desiredVoice;
  } else {
    // If no voice is found, the browser will use a default.
    // This might fail silently for Chinese on some systems.
    console.warn(`No voice found for language: ${lang}. Relying on browser default.`);
  }

  return utterance;
};

/**
 * Prepares the speech engine. It's crucial to cancel previous utterances
 * before starting a new sequence.
 */
const prepareToSpeak = (): boolean => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        return false;
    }
    // Resume if paused (a common issue on mobile).
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }
    // Clear any previously queued utterances.
    window.speechSynthesis.cancel();
    return true;
}

/**
 * Speaks a single piece of text.
 */
export const speak = async (text: string, lang: 'zh-CN' | 'en-US') => {
  const voices = await getVoices();
  if (!prepareToSpeak()) return;
  
  const utterance = createUtterance(text, lang, voices);
  window.speechSynthesis.speak(utterance);
};

/**
 * Speaks a sequence of text parts by queueing them.
 */
export const speakSequence = async (parts: {text: string, lang: 'zh-CN' | 'en-US'}[]) => {
  const voices = await getVoices();
  if (!prepareToSpeak() || parts.length === 0) return;

  // Queue all utterances. The browser's speech engine will play them in order.
  parts.forEach(part => {
    const utterance = createUtterance(part.text, part.lang, voices);
    window.speechSynthesis.speak(utterance);
  });
};
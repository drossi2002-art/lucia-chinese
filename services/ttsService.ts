// services/ttsService.ts

let voices: SpeechSynthesisVoice[] = [];
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null;

/**
 * Asynchronously loads and caches the list of available speech synthesis voices.
 * It populates a module-level `voices` array upon completion.
 * @returns A promise that resolves with an array of SpeechSynthesisVoice objects.
 */
const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  if (voicesPromise) {
    return voicesPromise;
  }
  voicesPromise = new Promise((resolve) => {
    // Return empty array if speech synthesis is not supported
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve([]);
      return;
    }

    // Function to get voices and resolve the promise
    const setAndResolve = () => {
      const voiceList = window.speechSynthesis.getVoices();
      if (voiceList.length > 0) {
        voices = voiceList; // Cache the voices
        resolve(voiceList);
        return true;
      }
      return false;
    };

    // If voices are already loaded, resolve immediately.
    // Otherwise, set an event listener.
    if (!setAndResolve()) {
      window.speechSynthesis.onvoiceschanged = setAndResolve;
    }
  });
  return voicesPromise;
};

// Immediately start loading voices when the app loads.
loadVoices();

/**
 * Creates and configures a SpeechSynthesisUtterance. It uses the cached `voices`
 * array, which may be empty on the first call, but the browser will fall back
 * to a default voice based on the specified language.
 */
const createUtterance = (text: string, lang: 'zh-CN' | 'en-US'): SpeechSynthesisUtterance => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.2;

  // Find the best matching voice from the (potentially empty) cached list.
  let desiredVoice = voices.find(voice => voice.lang === lang);
  if (!desiredVoice && lang === 'zh-CN') {
    desiredVoice = voices.find(voice => voice.lang.startsWith('zh'));
  }

  if (desiredVoice) {
    utterance.voice = desiredVoice;
  }
  
  return utterance;
};

/**
 * Prepares the speech engine by resuming if paused and clearing the queue.
 * This is crucial for reliability on mobile.
 */
const prepareToSpeak = (): boolean => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        return false;
    }
    // "Wake up" the engine if it's paused (a common mobile issue)
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }
    // Clear any leftover utterances
    window.speechSynthesis.cancel();
    return true;
}

/**
 * Speaks a single piece of text synchronously.
 */
export const speak = (text: string, lang: 'zh-CN' | 'en-US') => {
  if (!prepareToSpeak()) return;
  const utterance = createUtterance(text, lang);
  window.speechSynthesis.speak(utterance);
};

/**
 * Speaks a sequence of text parts by queueing them synchronously.
 */
export const speakSequence = (parts: {text: string, lang: 'zh-CN' | 'en-US'}[]) => {
  if (!prepareToSpeak() || parts.length === 0) return;

  // The browser's native queue will handle playing these in order.
  parts.forEach(part => {
    const utterance = createUtterance(part.text, part.lang);
    window.speechSynthesis.speak(utterance);
  });
};

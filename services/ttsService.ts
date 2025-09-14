// A cache for voices to avoid repeated calls to getVoices()
let voices: SpeechSynthesisVoice[] = [];

// Function to populate voices. To be called once and on onvoiceschanged event.
const updateVoices = () => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    voices = window.speechSynthesis.getVoices();
  }
};

// Initial setup
if (typeof window !== 'undefined' && window.speechSynthesis) {
  // If voices are already available, grab them.
  updateVoices();
  // Otherwise, they will be loaded asynchronously, so we listen for the event.
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }
}

/**
 * Creates and configures a SpeechSynthesisUtterance object.
 * @param text The text to be spoken.
 * @param lang The language of the text.
 * @returns A configured SpeechSynthesisUtterance object.
 */
const createUtterance = (text: string, lang: 'zh-CN' | 'en-US'): SpeechSynthesisUtterance => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.2;

  // Attempt to find a matching voice from our cached list.
  const desiredVoice = voices.find(voice => voice.lang === lang);
  if (desiredVoice) {
    utterance.voice = desiredVoice;
  } else if (voices.length > 0) {
    // Fallback if the specific language voice is not found but we have voices.
    console.warn(`Could not find a voice for ${lang}. A default will be used.`);
  }
  // If voices array is empty, the browser will handle it (it might be because they haven't loaded yet).

  return utterance;
};

/**
 * Prepares the speech synthesis engine by resuming if paused and cancelling current speech.
 * This helps to fix a common bug on mobile browsers where the engine gets "stuck".
 */
const prepareToSpeak = (): boolean => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
        return false;
    }
    // If the synthesizer is paused, resume it. This is a common fix for mobile browsers.
    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }
    // Cancel any ongoing or queued speech to start fresh.
    window.speechSynthesis.cancel();
    return true;
}

/**
 * Speaks a single piece of text, cancelling any ongoing speech.
 * This is for single, interruptive announcements.
 */
export const speak = (text: string, lang: 'zh-CN' | 'en-US') => {
  if (!prepareToSpeak()) return;
  
  const utterance = createUtterance(text, lang);

  // A small delay after cancel can improve reliability on some mobile browsers.
  setTimeout(() => {
    window.speechSynthesis.speak(utterance);
  }, 100);
};

/**
 * Speaks a sequence of text parts one after another by queueing them.
 * This is the primary method to use for multi-part speech to avoid 'onend' bugs.
 */
export const speakSequence = (parts: {text: string, lang: 'zh-CN' | 'en-US'}[]) => {
  if (!prepareToSpeak() || parts.length === 0) return;

  // A small delay after cancel can improve reliability.
  setTimeout(() => {
    parts.forEach(part => {
      const utterance = createUtterance(part.text, part.lang);
      window.speechSynthesis.speak(utterance);
    });
  }, 100);
};

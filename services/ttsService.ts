// Helper to handle the core speech synthesis logic, without cancelling previous speech
const doSpeak = (text: string, lang: 'zh-CN' | 'en-US', onEnd?: () => void) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser.');
    onEnd?.();
    return;
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.2;

  if (onEnd) {
    utterance.onend = onEnd;
  }

  const setVoiceAndSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang === lang);
    if (voice) {
      utterance.voice = voice;
    }
    window.speechSynthesis.speak(utterance);
  };

  // Voices might load asynchronously. This is a robust way to handle it.
  if (window.speechSynthesis.getVoices().length > 0) {
    setVoiceAndSpeak();
  } else {
    window.speechSynthesis.onvoiceschanged = () => {
        setVoiceAndSpeak();
        window.speechSynthesis.onvoiceschanged = null; // Clean up listener to avoid multiple fires
    };
  }
};

/**
 * Speaks a single piece of text, cancelling any ongoing speech.
 */
export const speak = (text: string, lang: 'zh-CN' | 'en-US') => {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  doSpeak(text, lang);
};

/**
 * Speaks a sequence of text parts one after another.
 */
export const speakSequence = (parts: {text: string, lang: 'zh-CN' | 'en-US'}[], onSequenceEnd?: () => void) => {
  if (typeof window === 'undefined' || !window.speechSynthesis || parts.length === 0) {
    onSequenceEnd?.();
    return;
  }
  window.speechSynthesis.cancel();
  
  let currentIndex = 0;

  const speakNext = () => {
    if (currentIndex < parts.length) {
      const part = parts[currentIndex];
      currentIndex++;
      doSpeak(part.text, part.lang, speakNext);
    } else {
      onSequenceEnd?.();
    }
  };

  speakNext();
};
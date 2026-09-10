/**
 * Speech Synthesis Utility for Accessibility
 * Supports English (en-IN) and Tamil (ta-IN)
 */

export const speak = (text, lang = "en-IN") => {
  if (!window.speechSynthesis) {
    console.warn("Speech Synthesis not supported in this browser");
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.9;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  window.speechSynthesis.speak(utterance);
};

export const speakEnglish = (text) => speak(text, "en-IN");
export const speakTamil = (text) => speak(text, "ta-IN");

export const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

import * as Speech from 'expo-speech';
import { useCallback, useState } from 'react';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

const LANG = 'cs-CZ';

export function speak(text: string, rate = 0.85) {
  Speech.stop();
  Speech.speak(text, { language: LANG, rate });
}

export function stopSpeaking() {
  Speech.stop();
}

/** Sprawdza, czy telefon ma czeski głos TTS. */
export async function hasCzechVoice(): Promise<boolean> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    return voices.some((v) => v.language?.toLowerCase().replace('_', '-').startsWith('cs'));
  } catch {
    return false;
  }
}

/** Rozpoznawanie mowy po czesku (systemowe, darmowe). */
export function useCzechDictation(onText: (text: string, isFinal: boolean) => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('result', (e) => {
    const text = e.results[0]?.transcript ?? '';
    onText(text, e.isFinal);
  });
  useSpeechRecognitionEvent('error', (e) => {
    setListening(false);
    if (e.error === 'no-speech' || e.error === 'aborted') return;
    if (e.error === 'language-not-supported') {
      setError('Telefon nie obsługuje czeskiego rozpoznawania mowy. Pobierz język czeski w ustawieniach Google (Rozpoznawanie mowy offline).');
    } else {
      setError(`Rozpoznawanie mowy: ${e.message || e.error}`);
    }
  });

  const start = useCallback(async () => {
    setError(null);
    const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!perm.granted) {
      setError('Brak zgody na mikrofon.');
      return;
    }
    Speech.stop();
    ExpoSpeechRecognitionModule.start({
      lang: LANG,
      interimResults: true,
      continuous: false,
      addsPunctuation: true,
    });
  }, []);

  const stop = useCallback(() => ExpoSpeechRecognitionModule.stop(), []);

  return { listening, error, start, stop, clearError: () => setError(null) };
}

import type { Settings } from './db';

export interface Correction {
  original: string;
  corrected: string;
  explanation_pl: string;
}

export interface NewWord {
  cz: string;
  pl: string;
  example_cz?: string;
}

export interface TutorReply {
  reply: string;
  reply_pl: string;
  corrections: Correction[];
  new_words: NewWord[];
  suggestions: string[];
}

export interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function askTutor(
  settings: Settings,
  scenario: { title: string; prompt: string },
  messages: ApiMessage[],
): Promise<TutorReply> {
  if (!settings.functionUrl) {
    throw new Error('Brak adresu funkcji. Uzupełnij go w zakładce Ustawienia.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45_000);

  try {
    const res = await fetch(settings.functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-secret': settings.appSecret,
      },
      body: JSON.stringify({ level: settings.level, scenario, messages }),
      signal: controller.signal,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error ?? `Błąd serwera (${res.status})`);

    return {
      reply: data.reply ?? '',
      reply_pl: data.reply_pl ?? '',
      corrections: Array.isArray(data.corrections) ? data.corrections : [],
      new_words: Array.isArray(data.new_words) ? data.new_words : [],
      suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    };
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error('Serwer nie odpowiedział w 45 s. Spróbuj ponownie.');
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

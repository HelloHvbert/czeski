// Supabase Edge Function: tutor czeskiego.
// Trzyma klucz Anthropic po stronie serwera i zwraca ustrukturyzowany JSON do aplikacji.
//
// Sekrety (supabase secrets set ...):
//   ANTHROPIC_API_KEY  – klucz z console.anthropic.com
//   APP_SECRET         – dowolny długi losowy ciąg; ten sam wpisujesz w aplikacji
//   ANTHROPIC_MODEL    – opcjonalnie, domyślnie claude-haiku-4-5

const MODEL = Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-haiku-4-5';
const API_KEY = Deno.env.get('ANTHROPIC_API_KEY') ?? '';
const APP_SECRET = Deno.env.get('APP_SECRET') ?? '';

const MAX_HISTORY = 30; // ostatnie wiadomości wysyłane do modelu
const MAX_CHARS = 1500; // limit długości pojedynczej wiadomości
const LEVELS = ['A1', 'A2', 'B1', 'B2'];

type Msg = { role: 'user' | 'assistant'; content: string };

const TOOL = {
  name: 'odpowiedz_tutora',
  description: 'Return the in-character reply and the learning feedback.',
  input_schema: {
    type: 'object',
    properties: {
      reply: { type: 'string', description: 'Your in-character line in Czech.' },
      reply_pl: { type: 'string', description: 'Polish translation of reply.' },
      corrections: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            original: { type: 'string' },
            corrected: { type: 'string' },
            explanation_pl: { type: 'string' },
          },
          required: ['original', 'corrected', 'explanation_pl'],
        },
      },
      new_words: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            cz: { type: 'string' },
            pl: { type: 'string' },
            example_cz: { type: 'string' },
          },
          required: ['cz', 'pl', 'example_cz'],
        },
      },
      suggestions: { type: 'array', items: { type: 'string' } },
    },
    required: ['reply', 'reply_pl', 'corrections', 'new_words', 'suggestions'],
  },
};

function systemPrompt(level: string, scenario: { title: string; prompt: string }) {
  return `You are a Czech conversation partner and tutor for a native POLISH speaker learning practical, everyday Czech. Learner level: ${level} (CEFR).

SCENE: ${scenario.prompt}

HOW TO REPLY
1. Stay in character. Speak natural, everyday spoken Czech as a real Czech person would in this situation (standard Czech, always with correct diacritics). No textbook stiffness.
2. Keep it short: 1–3 sentences, vocabulary and grammar appropriate for ${level}. Usually end with a question or something the learner must react to, so the conversation keeps going. If the scene reaches a natural end, add a small twist or next step.
3. If the conversation starts with "[Začni scénu]", open the scene yourself with your character's first line.
4. If the learner writes in Polish or mixes in Polish words because they don't know the Czech word, give them the Czech in "corrections" and continue the scene as if they had said it in Czech.
5. If the learner asks a meta question in Polish (e.g. "jak powiedzieć rachunek?"), answer it in "corrections" (original = their question, corrected = the Czech phrase, explanation_pl = short explanation) and continue the scene in "reply".
6. If the learner curses or uses vulgar language, don't lecture them or break character — react the way a real, unbothered Czech person would (shrug it off, maybe joke back) and keep the scene going naturally.

LEARNER'S WISHES COME FIRST
- The learner is an adult studying for themself. If they ask for anything other than the scene
  (a vocabulary drill, a quiz, translations, a grammar explanation, simpler or slower language,
  a different topic), do it immediately. Never refuse and never insist on continuing the role-play.
- Vocabulary drill: ask one word or phrase at a time (Polish -> Czech or Czech -> Polish,
  mix both), check the answer, put mistakes in "corrections" and the practised words in
  "new_words", then ask the next one. Prefer words from the current scene or level.
  Return to the scene only when the learner asks.
- Keep "reply" in Czech (it is read aloud by a Czech voice); put Polish explanations in
  "corrections" (explanation_pl).

FEEDBACK
- corrections: analyse ONLY the learner's latest message. Include real errors: wrong word, wrong case/ending, verb form, word order, unnatural phrasing, Polonisms. Pay special attention to Polish–Czech false friends (e.g. "sklep" means cellar in Czech, "szukat" is vulgar, "zapach" means stink) and flag them clearly. IGNORE missing diacritics, capitalisation and punctuation – the learner types on a phone or uses dictation. "original" = the learner's fragment, "corrected" = natural Czech, "explanation_pl" = short explanation in Polish (max ~20 words). Empty array if the message was fine or there is no learner message yet.
- new_words: 0–3 useful words or short phrases from your reply or the corrections that a ${level} learner probably doesn't know. Skip words that are the same or obvious for a Pole (voda, dobrý, pivo). Use the dictionary form (nominative / infinitive) in "cz", Polish meaning in "pl", and a short natural Czech example sentence in "example_cz".
- suggestions: exactly 2 short, different replies in Czech the learner could say next, at ${level} level.
- reply_pl: Polish translation of "reply".

Always answer by calling the tool "odpowiedz_tutora".`;
}

function sanitize(messages: unknown): Msg[] {
  if (!Array.isArray(messages)) return [];
  const clean: Msg[] = [];
  for (const m of messages) {
    if (!m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string') continue;
    const content = m.content.slice(0, MAX_CHARS).trim();
    if (!content) continue;
    // scal kolejne wiadomości tej samej roli (API wymaga naprzemienności)
    const last = clean[clean.length - 1];
    if (last && last.role === m.role) last.content += '\n' + content;
    else clean.push({ role: m.role, content });
  }
  let trimmed = clean.slice(-MAX_HISTORY);
  // historia musi zaczynać się od użytkownika
  if (trimmed.length === 0 || trimmed[0].role === 'assistant') {
    trimmed = [{ role: 'user', content: '[Začni scénu]' }, ...trimmed];
  }
  return trimmed;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

Deno.serve(async (req) => {
  if (!APP_SECRET || req.headers.get('x-app-secret') !== APP_SECRET) {
    return json({ error: 'Nieprawidłowy sekret aplikacji.' }, 401);
  }
  if (req.method === 'GET') return json({ ok: true, model: MODEL });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  if (!API_KEY) return json({ error: 'Brak ANTHROPIC_API_KEY w sekretach funkcji.' }, 500);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Niepoprawny JSON.' }, 400);
  }

  const level = LEVELS.includes(body?.level) ? body.level : 'A2';
  const scenario = {
    title: String(body?.scenario?.title ?? 'Rozmowa').slice(0, 100),
    prompt: String(body?.scenario?.prompt ?? 'Free conversation.').slice(0, 3000),
  };
  const messages = sanitize(body?.messages);

  // cache_control na ostatniej wiadomości: przy kolejnych turach wcześniejsza część
  // rozmowy (system + historia) liczy się po stawce cache (ok. 10% ceny wejścia).
  const apiMessages = messages.map((m, i) =>
    i === messages.length - 1
      ? { role: m.role, content: [{ type: 'text', text: m.content, cache_control: { type: 'ephemeral' } }] }
      : m,
  );

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      temperature: 0.7,
      system: [{ type: 'text', text: systemPrompt(level, scenario), cache_control: { type: 'ephemeral' } }],
      tools: [TOOL],
      tool_choice: { type: 'tool', name: TOOL.name },
      messages: apiMessages,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error('Anthropic error', res.status, text);
    return json({ error: `Błąd API modelu (${res.status}).` }, 502);
  }

  const data = await res.json();
  const tool = data.content?.find((c: any) => c.type === 'tool_use');
  if (!tool?.input) {
    console.error('No tool_use in response', JSON.stringify(data));
    return json({ error: 'Model nie zwrócił odpowiedzi w oczekiwanym formacie.' }, 502);
  }

  const out = tool.input;
  return json({
    reply: String(out.reply ?? ''),
    reply_pl: String(out.reply_pl ?? ''),
    corrections: Array.isArray(out.corrections) ? out.corrections.slice(0, 6) : [],
    new_words: Array.isArray(out.new_words) ? out.new_words.slice(0, 3) : [],
    suggestions: Array.isArray(out.suggestions) ? out.suggestions.slice(0, 3) : [],
    usage: data.usage,
  });
});

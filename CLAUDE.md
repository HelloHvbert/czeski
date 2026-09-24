@AGENTS.md

# Kontekst projektu „Czeski”

Prywatna aplikacja na Androida do praktycznej nauki czeskiego dla Polaka (jeden użytkownik: autor).
Komunikacja z użytkownikiem po polsku. Opis funkcji i wdrożenia: README.md, plan kursu: PLAN.md.

## Architektura
- Expo SDK 57 + React Native, TypeScript. **Bez Expo Router**: 6 zakładek przełączanych stanem w `App.tsx`
  (świadoma decyzja dla prostoty; nie migrować bez prośby, mimo zaleceń w AGENTS.md).
- Dane lokalnie: `expo-sqlite` (`src/db.ts`, migracje przez `PRAGMA user_version`, obecnie v2).
- Powtórki: SM-2 w `src/srs.ts`, karty w obu kierunkach (cz_pl, pl_cz).
- Głos: `expo-speech` (TTS cs-CZ, systemowy Google) + `expo-speech-recognition` (natywny, wymaga dev builda, NIE działa w Expo Go).
- Backend: Supabase Edge Function `supabase/functions/czeski-chat` (Deno), wdrażana z `--no-verify-jwt`;
  autoryzacja nagłówkiem `x-app-secret`. Woła Anthropic Messages API (domyślnie `claude-haiku-4-5`)
  z wymuszonym tool use (`odpowiedz_tutora`), żeby dostać pewny JSON:
  `{reply, reply_pl, corrections[], new_words[], suggestions[]}`. Prompt caching na system + ostatniej wiadomości.
- Adres funkcji i sekret wpisuje się w aplikacji (Ustawienia), opcjonalnie domyślne z `.env` (`EXPO_PUBLIC_*`).

## Pułapki, które już wyszły
- `SQLiteProvider` jest `memo` i ignoruje zmiany `children`, więc stan UI musi żyć w komponentach POD nim
  (dlatego `Main` w `App.tsx`). Bez tego zakładki się nie przełączały.
- Podgląd web (`npx expo export --platform web`) wymaga `wasm` w `metro.config.js` i nagłówków COOP/COEP przy serwowaniu.
- Zakładka „Luźno” montuje się dopiero przy pierwszym wejściu, żeby nie wołać API przy starcie aplikacji.

## Struktura
- `src/screens/`: CourseScreen (kurs), ChatScreen (scenki + eksportowany `Conversation`), FreestyleScreen,
  ReviewScreen, FalseFriendsScreen, SettingsScreen
- `src/data/`: `course.ts` (12 rozdziałów A1–B1; PLAN.md jest z niego generowany), `scenarios.ts` (+ FREESTYLE), `falseFriends.ts`

## Pomysły na kolejne kroki (omówione, niezrobione)
1. **Tryb bez rąk**: auto-wysyłka po końcu mowy (event `end`/`isFinal`), auto-nasłuch po zakończeniu TTS
   (`Speech.speak` z `onDone`), przełącznik w nagłówku rozmowy.
2. Wybór głosu TTS w ustawieniach (`Speech.getAvailableVoicesAsync()` filtrowane po `cs`).
3. Azure Speech (neuronowe głosy cs-CZ, ocena wymowy) przez Edge Function.
4. Historia rozmów, tryb „dziennik”, przypomnienia o powtórkach (expo-notifications).

## Sprawdzanie
`npx tsc --noEmit` przed zakończeniem pracy. Funkcję można testować lokalnie `npx supabase functions serve czeski-chat`.

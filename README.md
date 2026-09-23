# Czeski: praktyczna nauka czeskiego

Aplikacja na Androida (Expo / React Native) plus jedna funkcja Supabase, która woła Claude Haiku 4.5.

## Co jest w środku

| Zakładka | Co robi |
|---|---|
| 📚 **Kurs** | 12 rozdziałów A1→B1 (plan w `PLAN.md`). Każdy ma temat, gramatykę z przykładami do odsłuchania, pułapki dla Polaka i 10 słówek startowych. Przycisk „Ćwicz rozmowę” odpala scenkę, w której model celowo wymusza gramatykę z rozdziału i szczególnie jej pilnuje. |
| 💬 **Rozmowa** | Scenki (hospoda, dworzec, sklep, apteka, kolega z IT…) albo własna sytuacja. Mówisz do mikrofonu lub piszesz. Model odpowiada w roli i czyta odpowiedź na głos. Pod Twoją wiadomością pojawiają się poprawki z wyjaśnieniem po polsku, a nad polem tekstowym dwie podpowiedzi, co możesz odpowiedzieć. Nowe słówka same trafiają do powtórek. |
| 🃏 **Powtórki** | Fiszki SM-2 (jak w Anki), w obu kierunkach: CZ→PL (rozumienie) i PL→CZ (mówienie, pojawia się dzień później). Masz też listę słówek, ręczne dodawanie i usuwanie przez przytrzymanie. |
| ⚠️ **Pułapki** | Quiz z ok. 35 fałszywych przyjaciół (čerstvý, sklep, páchnout, právě, zápach…). Jedna z odpowiedzi to zawsze „polska pułapka”. Pomyłki lądują w powtórkach i wracają częściej. |
| ⚙️ **Ustawienia** | Adres funkcji i sekret, poziom A1–B2, tempo mowy, automatyczne czytanie odpowiedzi. |

Wszystkie dane (słówka, postępy) leżą lokalnie w SQLite na telefonie. Klucz Anthropic zna tylko funkcja w Supabase.

```
App.tsx                         zakładki
src/screens/*                   ekrany
src/db.ts, src/srs.ts           SQLite + algorytm powtórek
src/speech.ts                   TTS i rozpoznawanie mowy cs-CZ (systemowe, darmowe)
src/data/                       kurs, scenki, fałszywi przyjaciele
supabase/functions/czeski-chat  prompt + wywołanie Claude (tool use → pewny JSON)
```

## Uruchomienie

### 1. Klucz API
Na console.anthropic.com utwórz klucz i doładuj konto, np. o $5, co przy Twoim tempie wystarczy na kilka miesięcy. **Ustaw też limit wydatków** (Settings → Limits), na wszelki wypadek.

### 2. Funkcja w Supabase
Możesz użyć istniejącego projektu (np. tego od TCG Trackera) albo założyć nowy, darmowy.

```bash
npx supabase login
npx supabase link --project-ref TWOJ_REF

npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
npx supabase secrets set APP_SECRET=$(openssl rand -hex 24)   # zapisz tę wartość
npx supabase functions deploy czeski-chat --no-verify-jwt
```

Adres funkcji: `https://TWOJ_REF.supabase.co/functions/v1/czeski-chat`

Test:
```bash
curl -H "x-app-secret: TWOJ_SEKRET" https://TWOJ_REF.supabase.co/functions/v1/czeski-chat
# {"ok":true,"model":"claude-haiku-4-5"}
```

`--no-verify-jwt` jest celowe. Funkcja sama sprawdza nagłówek `x-app-secret`, więc bez niego nikt nie wyda Twoich pieniędzy.

### 3. Aplikacja (APK)
Rozpoznawanie mowy to moduł natywny, więc **Expo Go nie wystarczy**. Potrzebujesz własnego builda:

```bash
npm install
npx eas-cli@latest login
npx eas-cli@latest build -p android --profile preview    # gotowy APK do zainstalowania
```

Do developmentu z hot reloadem:
```bash
npx eas-cli@latest build -p android --profile development   # raz
npx expo start --dev-client
```

Po instalacji: **Ustawienia → Serwer**, wklej adres funkcji i sekret, potem „Zapisz i sprawdź”.
Możesz też wpisać je w `.env` (wzór w `.env.example`), wtedy będą wartościami domyślnymi w buildzie.

### 4. Czeski głos na telefonie
- **Czytanie (TTS):** Ustawienia Androida → Zamiana tekstu na mowę → Google → Zainstaluj dane głosowe → Čeština. Aplikacja ostrzeże Cię, jeśli głosu brakuje.
- **Mikrofon:** korzysta z rozpoznawania mowy Google. Jeśli pojawi się błąd języka, dodaj czeski w ustawieniach Google (Rozpoznawanie mowy offline / języki Asystenta).

## Koszty
Model to Claude Haiku 4.5 ($1 / $5 za mln tokenów wejście/wyjście). Rozmowa 10 minut kosztuje ok. 30–40 gr, a co drugi dzień wychodzi **ok. 5 zł miesięcznie**. Funkcja cache'uje prompt i historię rozmowy, więc przy dłuższych rozmowach może być taniej. Supabase Edge Functions mieszczą się w darmowym planie.

Żeby użyć mocniejszego modelu: `npx supabase secrets set ANTHROPIC_MODEL=claude-sonnet-5`. Będzie ok. 3× drożej.

## Pomysły na dalsze kroki
- Azure Speech zamiast głosu systemowego: ładniejsze czeskie głosy i ocena wymowy.
- Zapisywanie historii rozmów i tryb „dziennik”: piszesz kilka zdań o swoim dniu, model poprawia.
- Przypomnienie o powtórkach (expo-notifications).

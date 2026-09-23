// Plan kursu: 12 rozdziałów, A1 → B1. Tempo: ok. 2 tygodnie na rozdział
// przy rozmowie co 2 dni (ok. 6–7 rozmów na rozdział) + codzienne powtórki.

export interface Example { cz: string; pl: string }
export interface GrammarPoint { title: string; rule: string; examples: Example[] }
export interface Chapter {
  id: string;
  level: 'A1' | 'A2' | 'B1';
  emoji: string;
  title: string;
  theme: string;
  goals: string[];
  grammar: GrammarPoint[];
  pitfalls: string[];
  words: Example[];
  scenario: string; // opis scenki dla modelu (EN)
  focus: string; // na co model ma zwracać uwagę (EN)
}

export const COURSE: Chapter[] = [
  {
    id: 'c01', level: 'A1', emoji: '👋',
    title: 'Wymowa i powitania',
    theme: 'Przedstawianie się, grzeczności, „ty” i „pan/pani”.',
    goals: ['Przywitać się i pożegnać w różnych sytuacjach', 'Powiedzieć, kim jesteś i skąd', 'Poprawnie czytać ř, ě, y i długie samogłoski'],
    grammar: [
      {
        title: 'Wymowa: najważniejsze różnice',
        rule: 'Akcent ZAWSZE na pierwszej sylabie. Kreska (á, é, í, ó, ú/ů) to długa samogłoska, nie akcent. „y” czyta się jak „i” (nie jak polskie y). ř to jednoczesne „r” i „ż”. ě: bě/pě/vě = bje/pje/wje, mě = mnie, dě/tě/ně = ďe/ťe/ňe (miękko). „h” jest dźwięczne, inne niż „ch”.',
        examples: [
          { cz: 'Dobrý den', pl: 'Dzień dobry (czyt. dobri den, akcent na do-)' },
          { cz: 'řeka, tři', pl: 'rzeka, trzy (ř!)' },
          { cz: 'město, děkuji', pl: 'miasto (mnjesto), dziękuję (ďekuji)' },
        ],
      },
      {
        title: 'Czasownik být (być)',
        rule: 'jsem, jsi, je, jsme, jste, jsou. Przeczenie: nejsem, nejsi, NENÍ (3. os.!), nejsme, nejste, nejsou.',
        examples: [
          { cz: 'Jsem z Polska.', pl: 'Jestem z Polski.' },
          { cz: 'To není problém.', pl: 'To nie problem.' },
          { cz: 'Jste Čech?', pl: 'Jest pan Czechem?' },
        ],
      },
      {
        title: 'Vykání – forma grzecznościowa',
        rule: 'Do obcych mówi się w 2. osobie liczby mnogiej (jak „wy”): „Jak se máte?”. Polskie „pan/pani + 3. osoba” brzmi po czesku dziwnie. Do znajomych: „Jak se máš?”.',
        examples: [
          { cz: 'Jak se máte?', pl: 'Jak się pan/pani ma?' },
          { cz: 'Odkud jste?', pl: 'Skąd pan/pani jest?' },
          { cz: 'Jak se máš? – Dobře, díky.', pl: 'Jak się masz? – Dobrze, dzięki.' },
        ],
      },
    ],
    pitfalls: [
      'Nie akcentuj przedostatniej sylaby jak po polsku: „DĚkuji”, nie „děKUji”.',
      '„Prosím” to też „słucham?” i „proszę bardzo” przy podawaniu.',
      '„Na shledanou” (do widzenia) to jedno słowo w wymowie: na-schle-da-nou.',
    ],
    words: [
      { cz: 'Dobrý den', pl: 'dzień dobry' }, { cz: 'Na shledanou', pl: 'do widzenia' },
      { cz: 'Ahoj / Čau', pl: 'cześć' }, { cz: 'děkuji / díky', pl: 'dziękuję / dzięki' },
      { cz: 'prosím', pl: 'proszę; słucham?' }, { cz: 'promiňte', pl: 'przepraszam (formalnie)' },
      { cz: 'Jmenuji se…', pl: 'Nazywam się…' }, { cz: 'Těší mě.', pl: 'Miło mi.' },
      { cz: 'Nerozumím.', pl: 'Nie rozumiem.' }, { cz: 'Mluvíte polsky?', pl: 'Mówi pan/pani po polsku?' },
    ],
    scenario: 'You meet the learner at a welcome evening for foreigners in Brno. Introduce yourself, ask their name, where they are from, what they do, and how long they have been in Czechia. Use vykání at first, then offer tykání ("Můžeme si tykat?").',
    focus: 'Forms of být (esp. není), vykání vs tykání, greetings. Gently correct Polish word order and Polish words.',
  },
  {
    id: 'c02', level: 'A1', emoji: '☕',
    title: 'Kawiarnia i hospoda',
    theme: 'Zamawianie, liczby 1–100, płacenie.',
    goals: ['Zamówić jedzenie i picie', 'Zapytać o cenę i zapłacić', 'Rozumieć liczby i ceny'],
    grammar: [
      {
        title: 'Czasowniki na -at (typ dělat) i mít',
        rule: 'dělat: dělám, děláš, dělá, děláme, děláte, dělají. Tak samo: mít (mám, máš, má, máme, máte, mají), dát si (dám si…), znát, čekat.',
        examples: [
          { cz: 'Co děláte?', pl: 'Co pan/pani robi?' },
          { cz: 'Máte jídelní lístek?', pl: 'Macie menu?' },
          { cz: 'Dám si jedno pivo.', pl: 'Wezmę jedno piwo.' },
        ],
      },
      {
        title: 'Rodzaje: ten, ta, to',
        rule: 'Jak po polsku: ten (m), ta (ż), to (n). Liczebnik 1: jeden/jedna/jedno, 2: dva (m) / dvě (ż, n).',
        examples: [
          { cz: 'jeden čaj, jedna káva, jedno pivo', pl: 'jedna herbata, jedna kawa, jedno piwo' },
          { cz: 'dva čaje, dvě kávy, dvě piva', pl: 'dwie herbaty, dwie kawy, dwa piwa' },
        ],
      },
      {
        title: 'Liczebniki',
        rule: '1–10: jedna, dvě, tři, čtyři, pět, šest, sedm, osm, devět, deset. 11–19: -náct (jedenáct, dvanáct…). Dziesiątki: dvacet, třicet, čtyřicet, padesát… 21 = dvacet jedna (albo jednadvacet).',
        examples: [
          { cz: 'To dělá sto dvacet korun.', pl: 'To będzie sto dwadzieścia koron.' },
          { cz: 'Čtyřicet pět', pl: 'czterdzieści pięć' },
        ],
      },
    ],
    pitfalls: [
      '„Chci” brzmi obcesowo przy zamawianiu. Mów „Dám si…” albo „Chtěl(a) bych…”.',
      'Kelner pyta „Dohromady, nebo zvlášť?”, czyli razem czy osobno.',
      '„Účet, prosím” = rachunek, proszę (nie „rachunek”).',
    ],
    words: [
      { cz: 'dát si', pl: 'wziąć sobie, zamówić' }, { cz: 'jídelní lístek', pl: 'menu, karta dań' },
      { cz: 'čepované pivo', pl: 'piwo z beczki' }, { cz: 'malé / velké', pl: 'małe / duże (piwo)' },
      { cz: 'účet', pl: 'rachunek' }, { cz: 'platit kartou / hotově', pl: 'płacić kartą / gotówką' },
      { cz: 'dohromady / zvlášť', pl: 'razem / osobno' }, { cz: 'polévka', pl: 'zupa' },
      { cz: 'hlavní jídlo', pl: 'danie główne' }, { cz: 'Na zdraví!', pl: 'Na zdrowie!' },
    ],
    scenario: 'You are a waiter in a busy Czech pub. The learner orders drinks and food, asks for recommendations and prices, and finally pays (ask "Dohromady, nebo zvlášť?", "Kartou, nebo hotově?"). Say prices as numbers in words sometimes.',
    focus: 'Present tense of -at verbs, mít, dát si; gender agreement with ten/ta/to and numbers jeden/jedna/jedno, dva/dvě. Correct "chci" to "dám si/chtěl bych" in ordering.',
  },
  {
    id: 'c03', level: 'A1', emoji: '🛒',
    title: 'Zakupy',
    theme: 'Sklep, targ, ilości, ceny w koronach.',
    goals: ['Kupić coś na wagę i na sztuki', 'Zapytać, gdzie coś jest', 'Poradzić sobie przy kasie'],
    grammar: [
      {
        title: 'Biernik (akuzativ) – co kupuję?',
        rule: 'Żeńskie: -a → -u (káva → kávu), -e → -i (růže → růži). Męskie żywotne: + -a (bratr → bratra). Męskie nieżywotne i nijakie: bez zmian (čaj, pivo).',
        examples: [
          { cz: 'Poprosím housku a vodu.', pl: 'Poproszę bułkę i wodę.' },
          { cz: 'Máte čerstvý chleba?', pl: 'Ma pan świeży chleb?' },
        ],
      },
      {
        title: 'Dopełniacz przy ilościach',
        rule: 'Jak po polsku: po słowach ilości i od 5 w górę stoi dopełniacz. Koruna: 1 koruna, 2–4 koruny, 5+ korun.',
        examples: [
          { cz: 'kilo jablek, láhev vína', pl: 'kilo jabłek, butelka wina' },
          { cz: 'deset deka sýra', pl: '10 dag (100 g) sera' },
          { cz: 'pět rohlíků, dvacet korun', pl: 'pięć rogalików, dwadzieścia koron' },
        ],
      },
    ],
    pitfalls: [
      '„Sklep” to piwnica! Sklep = obchod, spożywczy = potraviny.',
      '„Deka” = 10 gramów: „dvacet deka šunky” = 200 g szynki.',
      '„Čerstvý” = świeży (przeciwnie niż „czerstwy”).',
      'Przy kasie usłyszysz „Ještě něco?” (coś jeszcze?) i „Chcete tašku?” (reklamówkę?).',
    ],
    words: [
      { cz: 'obchod / potraviny', pl: 'sklep / spożywczy' }, { cz: 'kolik to stojí?', pl: 'ile to kosztuje?' },
      { cz: 'rohlík', pl: 'rogalik (bułka)' }, { cz: 'šunka', pl: 'szynka' },
      { cz: 'deka', pl: '10 gramów' }, { cz: 'taška', pl: 'torba, reklamówka' },
      { cz: 'pokladna', pl: 'kasa' }, { cz: 'sleva', pl: 'zniżka, promocja' },
      { cz: 'drahý / levný', pl: 'drogi / tani' }, { cz: 'Ještě něco?', pl: 'Coś jeszcze?' },
    ],
    scenario: 'You are a shop assistant at a deli counter in a small Czech grocery. The learner buys things by weight and by piece, asks where things are, and pays. Ask "Ještě něco?", offer a bag, mention a discount (sleva).',
    focus: 'Accusative singular endings and genitive after quantities (deset deka sýra, kilo jablek, pět rohlíků, korun/koruny).',
  },
  {
    id: 'c04', level: 'A1', emoji: '🗺️',
    title: 'Miasto i kierunki',
    theme: 'Gdzie co jest, pytanie o drogę, instytucje.',
    goals: ['Zapytać o drogę i zrozumieć odpowiedź', 'Powiedzieć, gdzie jesteś', 'Użyć uprzejmych poleceń'],
    grammar: [
      {
        title: 'Miejscownik (lokál) po v / na',
        rule: 'Gdzie? v/na + miejscownik. Końcówki: -e/-ě (v Praze, v obchodě), -u (v hotelu), -i (na poště, v kanceláři). „Na” m.in. przy: pošta, nádraží, náměstí, úřad.',
        examples: [
          { cz: 'Jsem v Brně.', pl: 'Jestem w Brnie.' },
          { cz: 'Sejdeme se na náměstí.', pl: 'Spotkajmy się na rynku.' },
          { cz: 'Pracuju v bance.', pl: 'Pracuję w banku.' },
        ],
      },
      {
        title: 'Tryb rozkazujący (uprzejmy)',
        rule: 'Forma „vy” kończy się zwykle na -te: jděte, zahněte, pojďte, počkejte.',
        examples: [
          { cz: 'Jděte rovně a pak zahněte doleva.', pl: 'Proszę iść prosto, potem skręcić w lewo.' },
          { cz: 'Počkejte chvilku.', pl: 'Proszę chwilę poczekać.' },
        ],
      },
      {
        title: 'jít / jet',
        rule: 'Jak po polsku: jít (iść): jdu, jdeš, jde, jdeme, jdete, jdou. jet (jechać): jedu, jedeš, jede…',
        examples: [
          { cz: 'Jdu na tramvaj.', pl: 'Idę na tramwaj.' },
          { cz: 'Kam jedete?', pl: 'Dokąd pan jedzie?' },
        ],
      },
    ],
    pitfalls: [
      '„Záchod” = toaleta, a zachód = západ.',
      '„Hrad” = zamek warowny, „zámek” = pałac (i zamek w drzwiach).',
      '„Pozor!” = Uwaga!',
    ],
    words: [
      { cz: 'doleva / doprava', pl: 'w lewo / w prawo' }, { cz: 'rovně', pl: 'prosto' },
      { cz: 'na rohu', pl: 'na rogu' }, { cz: 'náměstí', pl: 'rynek, plac' },
      { cz: 'zastávka', pl: 'przystanek' }, { cz: 'nádraží', pl: 'dworzec' },
      { cz: 'daleko / blízko', pl: 'daleko / blisko' }, { cz: 'most', pl: 'most' },
      { cz: 'Jak se dostanu na…?', pl: 'Jak dojdę/dojadę do…?' }, { cz: 'záchod', pl: 'toaleta' },
    ],
    scenario: 'You are a local in Prague Old Town. The learner is lost and asks the way to several places (a pharmacy, a tram stop, the castle, a toilet). Give realistic directions with landmarks, and ask where they are staying.',
    focus: 'Locative after v/na, polite imperative (jděte, zahněte), jít vs jet.',
  },
  {
    id: 'c05', level: 'A2', emoji: '🚆',
    title: 'Podróże i czas',
    theme: 'Pociąg, bilety, godziny, dni tygodnia, plany.',
    goals: ['Kupić bilet i zapytać o połączenie', 'Podać godzinę i dzień', 'Powiedzieć, co musisz / możesz / chcesz'],
    grammar: [
      {
        title: 'Czasowniki modalne',
        rule: 'chtít: chci, chceš, chce, chceme, chcete, chtějí. moct: můžu, můžeš, může, můžeme, můžete, můžou. muset: musím, musíš, musí, musíme, musíte, musí.',
        examples: [
          { cz: 'Můžu platit kartou?', pl: 'Mogę zapłacić kartą?' },
          { cz: 'Musím přestoupit?', pl: 'Muszę się przesiąść?' },
        ],
      },
      {
        title: 'Godziny i dni',
        rule: '„O której?” = V kolik hodin? O trzeciej = ve tři. Wpół do czwartej = v půl čtvrté (jak po polsku!). 16:15 = ve čtvrt na pět, 16:45 = ve tři čtvrtě na pět. Dni: v pondělí, v úterý, ve středu, ve čtvrtek, v pátek, v sobotu, v neděli.',
        examples: [
          { cz: 'Vlak jede v půl deváté.', pl: 'Pociąg odjeżdża o wpół do dziewiątej.' },
          { cz: 'Přijedu ve středu večer.', pl: 'Przyjadę w środę wieczorem.' },
        ],
      },
    ],
    pitfalls: [
      '„Rychlý” = szybki, a „rychlík” to pociąg pośpieszny.',
      '„Zpoždění” = opóźnienie, „nástupiště” = peron, „kolej” = tor.',
      '„Červen” = czerwiec, ale „červenec” = LIPIEC.',
    ],
    words: [
      { cz: 'jízdenka', pl: 'bilet' }, { cz: 'zpáteční', pl: 'powrotny' },
      { cz: 'místenka', pl: 'miejscówka' }, { cz: 'nástupiště', pl: 'peron' },
      { cz: 'zpoždění', pl: 'opóźnienie' }, { cz: 'přestoupit', pl: 'przesiąść się' },
      { cz: 'odjezd / příjezd', pl: 'odjazd / przyjazd' }, { cz: 'sleva pro…', pl: 'zniżka dla…' },
      { cz: 'V kolik hodin?', pl: 'O której?' }, { cz: 'zítra / pozítří', pl: 'jutro / pojutrze' },
    ],
    scenario: 'You work at the ticket counter at Praha hlavní nádraží. The learner wants to travel to Olomouc and back, asks about times, platform, changes, seat reservation and discounts. At some point announce a delay (zpoždění).',
    focus: 'Modal verbs chtít/moct/muset, telling time (v půl…, ve čtvrt na…), days of week with v/ve.',
  },
  {
    id: 'c06', level: 'A2', emoji: '👨‍👩‍👧',
    title: 'O sobie i rodzinie',
    theme: 'Rodzina, praca, przeszłość, życiorys.',
    goals: ['Opowiedzieć o rodzinie i pracy', 'Opowiedzieć, co robiłeś wczoraj / w weekend', 'Zadać pytania o przeszłość'],
    grammar: [
      {
        title: 'Czas przeszły',
        rule: 'Forma na -l/-la/-lo/-li + być jako osobne słowo: byl jsem, byla jsi. W 3. osobie BEZ „je”: on byl, oni byli. Porównaj: byłem → byl jsem, byłaś → byla jsi.',
        examples: [
          { cz: 'Včera jsem byl v kině.', pl: 'Wczoraj byłem w kinie.' },
          { cz: 'Kde jste pracovala?', pl: 'Gdzie pani pracowała?' },
          { cz: 'Oni byli doma.', pl: 'Oni byli w domu.' },
        ],
      },
      {
        title: 'Zaimki dzierżawcze',
        rule: 'můj/moje (mój/moja), tvůj/tvoje, jeho, její, náš/naše, váš/vaše, jejich.',
        examples: [
          { cz: 'Moje žena je z Ostravy.', pl: 'Moja żona jest z Ostrawy.' },
          { cz: 'To je náš syn.', pl: 'To nasz syn.' },
        ],
      },
    ],
    pitfalls: [
      '„Jsem” w czasie przeszłym stoi zwykle na drugim miejscu: „Včera jsem byl…”, nie „Včera byl jsem…”.',
      '„Žena” to kobieta i żona, a precyzyjnie żona to „manželka”.',
      '„Starost” = zmartwienie, a starość = stáří.',
    ],
    words: [
      { cz: 'rodiče', pl: 'rodzice' }, { cz: 'sourozenci', pl: 'rodzeństwo' },
      { cz: 'manžel / manželka', pl: 'mąż / żona' }, { cz: 'kluk / holka', pl: 'chłopak / dziewczyna (pot.)' },
      { cz: 'pracovat jako…', pl: 'pracować jako…' }, { cz: 'narodil jsem se', pl: 'urodziłem się' },
      { cz: 'vyrůstat', pl: 'dorastać' }, { cz: 'včera / minulý týden', pl: 'wczoraj / w zeszłym tygodniu' },
      { cz: 'byt', pl: 'mieszkanie' }, { cz: 'bydlet', pl: 'mieszkać' },
    ],
    scenario: 'You are a new Czech friend at a barbecue. Ask the learner about their family, where they grew up, their job and what they did last weekend. Tell short stories about yourself in the past tense.',
    focus: 'Past tense forms and the position of jsem/jsi (second position, none in 3rd person), possessive pronouns.',
  },
  {
    id: 'c07', level: 'A2', emoji: '🎸',
    title: 'Czas wolny i hobby',
    theme: 'Zainteresowania, umawianie się, sport, muzyka.',
    goals: ['Powiedzieć, co lubisz robić', 'Umówić się z kimś', 'Opowiedzieć o hobby'],
    grammar: [
      {
        title: 'Lubić: rád + czasownik',
        rule: 'Czeskie „lubię czytać” to „RÁD čtu” (kobieta: ráda čtu). Z rzeczownikiem: „Mám rád kávu”. „Baví mě to” = sprawia mi to frajdę. „Líbí se mi” = podoba mi się.',
        examples: [
          { cz: 'Rád vařím.', pl: 'Lubię gotować.' },
          { cz: 'Mám ráda jazz.', pl: 'Lubię jazz (kobieta).' },
          { cz: 'Baví mě vařit.', pl: 'Lubię gotować (sprawia mi frajdę).' },
        ],
      },
      {
        title: 'Narzędnik (instrumentál)',
        rule: 's + narzędnik (z kim/czym): s kamarádem, s kamarádkou. Środek transportu: jedu autem, vlakem. Końcówki: m/n -em, ż -ou.',
        examples: [
          { cz: 'Jdu na pivo s kolegou.', pl: 'Idę na piwo z kolegą.' },
          { cz: 'Jezdím do práce autem.', pl: 'Jeżdżę do pracy samochodem.' },
        ],
      },
      {
        title: 'hrát na / hrát',
        rule: 'Na instrumencie: hrát NA + biernik (na kytaru, na klavír). Gry i sport bez przyimka: hrát fotbal, hrát šachy.',
        examples: [
          { cz: 'Hraju na kytaru.', pl: 'Gram na gitarze.' },
          { cz: 'V neděli hrajeme fotbal.', pl: 'W niedzielę gramy w piłkę.' },
        ],
      },
    ],
    pitfalls: [
      'Nie mów „lubím”, bo takiego słowa nie ma. Mów „mám rád / rád + czasownik”.',
      '„Hrát na kytaru” (biernik), a nie „na kytaře” jak po polsku „na gitarze”.',
      '„Hodně” = dużo, a nie „godnie”.',
    ],
    words: [
      { cz: 'volný čas', pl: 'czas wolny' }, { cz: 'koníček', pl: 'hobby' },
      { cz: 'rád / ráda', pl: 'chętnie; lubię (+ czasownik)' }, { cz: 'baví mě', pl: 'kręci mnie, lubię' },
      { cz: 'Máš čas?', pl: 'Masz czas?' }, { cz: 'sejít se', pl: 'spotkać się' },
      { cz: 'výlet', pl: 'wycieczka' }, { cz: 'koncert', pl: 'koncert' },
      { cz: 'posilovna', pl: 'siłownia' }, { cz: 'Tak jo!', pl: 'No to jazda! / Dobra!' },
    ],
    scenario: 'You are a Czech friend planning the weekend with the learner. Ask about their hobbies, suggest activities (concert, hiking trip, gym, board games) and agree on a day, time and place to meet.',
    focus: 'rád/ráda + verb (flag "lubím" and Polish-style "lubit"), "baví mě", instrumental after s and for transport, hrát na + acc.',
  },
  {
    id: 'c08', level: 'A2', emoji: '🍲',
    title: 'Jedzenie i plany',
    theme: 'Gotowanie, przepisy, restauracja, co zrobię jutro.',
    goals: ['Opowiedzieć o planach', 'Rozróżniać „zrobię” i „będę robić”', 'Opisać ulubione danie'],
    grammar: [
      {
        title: 'Czas przyszły i aspekt',
        rule: 'Jak po polsku: czasownik dokonany w czasie teraźniejszym = przyszłość (udělám, uvařím). Niedokonany: budu + BEZOKOLICZNIK (budu vařit). Formy „budu vařil” NIE MA. Ruch: půjdu, pojedu.',
        examples: [
          { cz: 'Zítra uvařím guláš.', pl: 'Jutro ugotuję gulasz.' },
          { cz: 'Celý den budu pracovat.', pl: 'Cały dzień będę pracować.' },
          { cz: 'Večer půjdeme ven.', pl: 'Wieczorem wyjdziemy.' },
        ],
      },
      {
        title: 'Tryb rozkazujący (ty)',
        rule: 'Do jednej osoby: vař!, dej!, pojď!, podívej se! W przepisach często: nakrájejte, osolte (vy).',
        examples: [
          { cz: 'Pojď sem!', pl: 'Chodź tu!' },
          { cz: 'Cibuli nakrájejte nadrobno.', pl: 'Cebulę pokroić drobno.' },
        ],
      },
    ],
    pitfalls: [
      '„Zápach” = smród, ładny zapach = „vůně”. „Páchne” = śmierdzi, „voní” = pachnie.',
      '„Jahody” = truskawki, jagody = borůvky.',
      '„Tlustý” = gruby, tłusty = mastný.',
    ],
    words: [
      { cz: 'vařit / uvařit', pl: 'gotować / ugotować' }, { cz: 'recept', pl: 'przepis' },
      { cz: 'knedlík', pl: 'knedel' }, { cz: 'omáčka', pl: 'sos' },
      { cz: 'vůně', pl: 'zapach (ładny)' }, { cz: 'chutnat', pl: 'smakować' },
      { cz: 'Chutná ti to?', pl: 'Smakuje ci?' }, { cz: 'sníst', pl: 'zjeść' },
      { cz: 'nakoupit', pl: 'zrobić zakupy' }, { cz: 'Dobrou chuť!', pl: 'Smacznego!' },
    ],
    scenario: 'You and the learner are planning to cook a Czech dinner together this Saturday (e.g. svíčková or guláš). Discuss the recipe, who buys what, what you will do step by step, and what you both like to eat.',
    focus: 'Future tense: perfective present vs budu + infinitive (flag any "budu + -l" form), půjdu/pojedu, imperative forms.',
  },
  {
    id: 'c09', level: 'B1', emoji: '💊',
    title: 'Zdrowie i urzędy',
    theme: 'Lekarz, apteka, samopoczucie, załatwianie spraw.',
    goals: ['Opisać objawy', 'Zrozumieć zalecenia', 'Załatwić sprawę w urzędzie lub na poczcie'],
    grammar: [
      {
        title: 'Celownik (dativ) i zaimki',
        rule: 'Komu? mi, ti, mu, jí, nám, vám, jim. Konstrukcje o samopoczuciu: Je mi zle / špatně (źle mi), Je mi zima (zimno mi). Końcówki rzeczowników: m -ovi/-u (bratrovi), ż -e/-ě/-i (mámě).',
        examples: [
          { cz: 'Co vám je?', pl: 'Co panu dolega?' },
          { cz: 'Je mi špatně.', pl: 'Niedobrze mi.' },
          { cz: 'Zavolám doktorovi.', pl: 'Zadzwonię do lekarza.' },
        ],
      },
      {
        title: 'Boli mnie…',
        rule: '„Bolí mě” + mianownik: Bolí mě hlava. Liczba mnoga: Bolí mě nohy. Czas przeszły: Bolela mě hlava.',
        examples: [
          { cz: 'Od rána mě bolí v krku.', pl: 'Od rana boli mnie gardło.' },
          { cz: 'Bolí mě záda.', pl: 'Bolą mnie plecy.' },
        ],
      },
    ],
    pitfalls: [
      '„Stolice” to stolec (med.), a stolica = hlavní město. U lekarza to ważne!',
      '„Úrok” = odsetki, „úřad” = urząd.',
      'Lek na receptę = „na předpis”, bez recepty = „bez předpisu”.',
    ],
    words: [
      { cz: 'lékař / doktor', pl: 'lekarz' }, { cz: 'lékárna', pl: 'apteka' },
      { cz: 'předpis', pl: 'recepta' }, { cz: 'horečka', pl: 'gorączka' },
      { cz: 'kašel / rýma', pl: 'kaszel / katar' }, { cz: 'Je mi špatně.', pl: 'Źle się czuję.' },
      { cz: 'objednat se', pl: 'umówić się (na wizytę)' }, { cz: 'pojištění', pl: 'ubezpieczenie' },
      { cz: 'úřad', pl: 'urząd' }, { cz: 'formulář', pl: 'formularz' },
    ],
    scenario: 'You are a GP (praktický lékař) in Czechia. The learner comes with a cold and back pain. Ask about symptoms and how long they have had them, give advice, write a prescription and explain how to take the medicine. Keep it light and everyday.',
    focus: 'Dative pronouns and endings (mi, vám, doktorovi), "je mi…", "bolí mě + nominative".',
  },
  {
    id: 'c10', level: 'B1', emoji: '🏠',
    title: 'Mieszkanie i porównania',
    theme: 'Wynajem, opis mieszkania, prośby, życzenia.',
    goals: ['Opisać i porównać mieszkania', 'Uprzejmie prosić i proponować', 'Mówić o sytuacjach hipotetycznych'],
    grammar: [
      {
        title: 'Tryb warunkowy',
        rule: 'Forma -l + bych, bys, by, bychom, byste, by. „Chtěl bych” (chciałbym), „Mohl byste…?” (czy mógłby pan…?). Kdybych… = gdybym…',
        examples: [
          { cz: 'Chtěl bych si byt prohlédnout.', pl: 'Chciałbym obejrzeć mieszkanie.' },
          { cz: 'Mohla byste mi poslat smlouvu?', pl: 'Mogłaby pani wysłać mi umowę?' },
          { cz: 'Kdybych měl víc času, učil bych se víc.', pl: 'Gdybym miał więcej czasu, uczyłbym się więcej.' },
        ],
      },
      {
        title: 'Stopniowanie przymiotników',
        rule: '-ejší / -ší: levný → levnější, velký → větší. Nieregularne: dobrý → lepší, špatný → horší, malý → menší. Najwyższy: nej- (nejlepší). „než” = niż.',
        examples: [
          { cz: 'Tenhle byt je větší než ten první.', pl: 'To mieszkanie jest większe niż pierwsze.' },
          { cz: 'Nejlepší je ten s balkonem.', pl: 'Najlepsze jest to z balkonem.' },
        ],
      },
    ],
    pitfalls: [
      '„Byt” = mieszkanie, a nie „byt” w sensie istnienia.',
      '„Křeslo” = fotel, krzesło = židle.',
      '„Pokoj” = pokój (pomieszczenie). „2+kk” = 2 pokoje z aneksem kuchennym, „2+1” = 2 pokoje + osobna kuchnia.',
    ],
    words: [
      { cz: 'pronajmout / nájem', pl: 'wynająć / najem' }, { cz: 'nájemné', pl: 'czynsz' },
      { cz: 'kauce', pl: 'kaucja' }, { cz: 'smlouva', pl: 'umowa' },
      { cz: 'zařízený', pl: 'umeblowany' }, { cz: 'pronajímatel', pl: 'wynajmujący' },
      { cz: 'sousedé', pl: 'sąsiedzi' }, { cz: 'topení', pl: 'ogrzewanie' },
      { cz: 'poplatky / energie', pl: 'opłaty / media' }, { cz: 'židle', pl: 'krzesło' },
    ],
    scenario: 'You are a landlord showing a furnished 2+kk flat in Brno. The learner is a potential tenant: they ask about rent, deposit, energy costs, neighbours and the contract, and compare it with another flat they saw.',
    focus: 'Conditional (bych/bys/by… placement and forms), comparatives with než, superlatives with nej-.',
  },
  {
    id: 'c11', level: 'B1', emoji: '💼',
    title: 'Praca',
    theme: 'Biuro, spotkania, maile, rozmowa o projekcie.',
    goals: ['Opowiedzieć o swojej pracy i projekcie', 'Wziąć udział w krótkim spotkaniu', 'Napisać prosty mail'],
    grammar: [
      {
        title: 'Szyk: słowa na drugiej pozycji',
        rule: 'Krótkie słowa (jsem/jsi, bych, se/si, mi/ti, ho/mu…) stoją na DRUGIM miejscu w zdaniu, w stałej kolejności: najpierw być/bych, potem se/si, potem zaimki celownika i biernika.',
        examples: [
          { cz: 'Včera jsem se mu to snažil vysvětlit.', pl: 'Wczoraj próbowałem mu to wytłumaczyć.' },
          { cz: 'Rád bych se na to podíval.', pl: 'Chętnie bym na to spojrzał.' },
        ],
      },
      {
        title: 'Zwrotne se / si',
        rule: 'se = się, si = sobie (jak po polsku). Z „jsi” w przeszłym łączą się w „ses / sis”: Kde ses to naučil?',
        examples: [
          { cz: 'Učím se česky.', pl: 'Uczę się czeskiego.' },
          { cz: 'Myslím si, že to půjde.', pl: 'Myślę, że się uda.' },
          { cz: 'Kde ses to naučil?', pl: 'Gdzie się tego nauczyłeś?' },
        ],
      },
    ],
    pitfalls: [
      '„Úspěch” = sukces, pośpiech = spěch.',
      '„Pokus” = próba, eksperyment, a pokusa = pokušení.',
      'W IT Czesi używają anglicyzmów: „nasadit” (wdrożyć), „tiket”, „mítink”, „bildit”.',
    ],
    words: [
      { cz: 'porada / schůzka', pl: 'spotkanie' }, { cz: 'nasadit', pl: 'wdrożyć' },
      { cz: 'termín', pl: 'termin, deadline' }, { cz: 'úkol', pl: 'zadanie' },
      { cz: 'kolega / kolegyně', pl: 'kolega / koleżanka' }, { cz: 'šéf / vedoucí', pl: 'szef / kierownik' },
      { cz: 'dovolená', pl: 'urlop' }, { cz: 'S pozdravem', pl: 'Z poważaniem (w mailu)' },
      { cz: 'Dobrý den, posílám…', pl: 'Dzień dobry, przesyłam…' }, { cz: 'stihnout', pl: 'zdążyć' },
    ],
    scenario: 'You are a Czech colleague at an IT company (a SaaS product running on the cloud). Run a short stand-up and a coffee chat: what the learner did yesterday, what they will do today, a failed deployment, an upcoming deadline and holidays. Later ask them to dictate a short e-mail to a customer.',
    focus: 'Clitic word order (jsem/bych, se/si, mi/mu/ho in second position), se vs si, past + future mixed. Correct e-mail register.',
  },
  {
    id: 'c12', level: 'B1', emoji: '🇨🇿',
    title: 'Potoczny czeski i kultura',
    theme: 'Jak Czesi naprawdę mówią: obecná čeština, humor, święta.',
    goals: ['Rozumieć potoczną mowę (filmy, podcasty, hospoda)', 'Rozpoznać formy potoczne', 'Pogadać o czeskiej kulturze'],
    grammar: [
      {
        title: 'Obecná čeština: rozpoznawanie',
        rule: 'W mowie potocznej: -ý → -ej (dobrej), -é → -ý (dobrý pivo), o- → vo- (vokno, von), jsem → sem, 3. os. l.mn. -ají → -aj (dělaj), narzędnik l.mn. -ma (s kamarádama). Rozumieć tak, ale pisać w wersji standardowej.',
        examples: [
          { cz: 'To je dobrej nápad.', pl: '= To je dobrý nápad.' },
          { cz: 'Von tam nebyl.', pl: '= On tam nebyl.' },
          { cz: 'Šel sem s klukama na pivo.', pl: '= Šel jsem s kluky na pivo.' },
        ],
      },
      {
        title: 'Zdrobnienia i wykrzykniki',
        rule: 'Czesi kochają zdrobnienia: pivečko, chvilka, kafíčko. Typowe reakcje: No jo, To snad ne!, Fakt?, Hustý!, Pohoda.',
        examples: [
          { cz: 'Dáme si kafíčko?', pl: 'Kawusia?' },
          { cz: 'No jo, to je pohoda.', pl: 'No tak, jest luz.' },
        ],
      },
    ],
    pitfalls: [
      '„Šukat” to wulgaryzm, a szukać = hledat.',
      '„Pitomec” = idiota, a nie pupil.',
      '„Chytrý” = mądry (komplement!), a nie chytry.',
    ],
    words: [
      { cz: 'pohoda', pl: 'luz, spokój' }, { cz: 'fakt', pl: 'serio' },
      { cz: 'hustý', pl: 'odjechany, super (slang)' }, { cz: 'kámoš', pl: 'kumpel' },
      { cz: 'mít kliku', pl: 'mieć farta' }, { cz: 'Vánoce / Velikonoce', pl: 'Boże Narodzenie / Wielkanoc' },
      { cz: 'chata / chalupa', pl: 'domek letniskowy' }, { cz: 'trampovat', pl: 'włóczyć się po lesie, biwakować' },
      { cz: 'No jo', pl: 'No tak / No właśnie' }, { cz: 'kafe', pl: 'kawa (pot.)' },
    ],
    scenario: 'You are a relaxed Czech friend in a pub on Friday night, speaking colloquial Czech (obecná čeština) naturally. Talk about weekends at the chata, Czech films and music, Christmas carp, and ice hockey. If the learner does not understand a colloquial form, explain it.',
    focus: 'Speak with common colloquial forms (dobrej, vokno, sem, -aj). In corrections, when useful, show the standard form. Do not penalise the learner for using standard Czech.',
  },
];

export function chapterScenario(ch: Chapter) {
  return {
    id: `course-${ch.id}`,
    emoji: ch.emoji,
    title: ch.title,
    prompt: `${ch.scenario}\n\nCOURSE CHAPTER: "${ch.title}" (${ch.level}). GRAMMAR FOCUS: ${ch.focus}\nNaturally create situations where the learner has to use this grammar, and be especially attentive to it in corrections.`,
  };
}

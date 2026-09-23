// Fałszywi przyjaciele: czeskie słowa, które Polak czyta błędnie.
export interface FalseFriend {
  cz: string;
  meaning: string; // co naprawdę znaczy po polsku
  trap: string; // co podpowiada polska intuicja
  tip: string; // jak powiedzieć po czesku to, co myśli Polak
  example: string;
}

export const FALSE_FRIENDS: FalseFriend[] = [
  { cz: 'čerstvý', meaning: 'świeży', trap: 'czerstwy', tip: 'czerstwy = okoralý, tvrdý', example: 'Ten chleba je čerstvý.' },
  { cz: 'pozor', meaning: 'uwaga!', trap: 'pozór', tip: 'pozór = zdání', example: 'Pozor, schod!' },
  { cz: 'sklep', meaning: 'piwnica', trap: 'sklep', tip: 'sklep = obchod', example: 'Brambory máme ve sklepě.' },
  { cz: 'právě', meaning: 'właśnie', trap: 'prawie', tip: 'prawie = skoro, téměř', example: 'Právě jsem přišel.' },
  { cz: 'skoro', meaning: 'prawie', trap: 'skoro (skoro tak, to…)', tip: 'skoro (bo) = když už', example: 'Je skoro deset hodin.' },
  { cz: 'jahody', meaning: 'truskawki', trap: 'jagody', tip: 'jagody = borůvky', example: 'Na zahradě rostou jahody.' },
  { cz: 'zápach', meaning: 'smród', trap: 'zapach (przyjemny)', tip: 'ładny zapach = vůně', example: 'V kuchyni je divný zápach.' },
  { cz: 'páchnout', meaning: 'śmierdzieć', trap: 'pachnieć', tip: 'pachnieć = vonět', example: 'Ta ryba už páchne.' },
  { cz: 'chytrý', meaning: 'mądry, bystry', trap: 'chytry, przebiegły', tip: 'chytry = mazaný, lakomý', example: 'To je chytrý nápad.' },
  { cz: 'pověst', meaning: 'reputacja; legenda', trap: 'powieść', tip: 'powieść = román', example: 'Ta restaurace má dobrou pověst.' },
  { cz: 'úrok', meaning: 'odsetki', trap: 'urok', tip: 'urok = kouzlo, půvab', example: 'Banka zvýšila úroky.' },
  { cz: 'úroda', meaning: 'plony, zbiory', trap: 'uroda', tip: 'uroda = krása', example: 'Letos byla dobrá úroda.' },
  { cz: 'zboží', meaning: 'towar', trap: 'zboże', tip: 'zboże = obilí', example: 'Zboží je na skladě.' },
  { cz: 'noviny', meaning: 'gazeta', trap: 'nowiny, wieści', tip: 'nowiny = novinky, zprávy', example: 'Každé ráno čtu noviny.' },
  { cz: 'hodný', meaning: 'grzeczny, miły', trap: 'godny', tip: 'godny = důstojný', example: 'Buď hodný!' },
  { cz: 'hodně', meaning: 'dużo', trap: 'godnie', tip: 'godnie = důstojně', example: 'Mám hodně práce.' },
  { cz: 'dívat se', meaning: 'patrzeć, oglądać', trap: 'dziwić się', tip: 'dziwić się = divit se', example: 'Díváme se na film.' },
  { cz: 'křeslo', meaning: 'fotel', trap: 'krzesło', tip: 'krzesło = židle', example: 'Sedni si do křesla.' },
  { cz: 'stolice', meaning: 'stolec (med.)', trap: 'stolica', tip: 'stolica = hlavní město', example: 'Hlavní město Česka je Praha.' },
  { cz: 'vrah', meaning: 'morderca', trap: 'wróg', tip: 'wróg = nepřítel', example: 'Policie hledá vraha.' },
  { cz: 'pokus', meaning: 'próba, eksperyment', trap: 'pokusa', tip: 'pokusa = pokušení', example: 'To byl jen první pokus.' },
  { cz: 'starost', meaning: 'troska, zmartwienie', trap: 'starość', tip: 'starość = stáří', example: 'Nedělej si starosti.' },
  { cz: 'tlustý', meaning: 'gruby', trap: 'tłusty', tip: 'tłusty = mastný', example: 'Ten kocour je tlustý.' },
  { cz: 'chudý', meaning: 'biedny', trap: 'chudy', tip: 'chudy = hubený', example: 'Byl to chudý student.' },
  { cz: 'úspěch', meaning: 'sukces', trap: 'pośpiech', tip: 'pośpiech = spěch', example: 'Přeju ti hodně úspěchů.' },
  { cz: 'byt', meaning: 'mieszkanie', trap: 'byt, istnienie', tip: 'byt = existence', example: 'Hledám byt v Brně.' },
  { cz: 'hrad', meaning: 'zamek (warowny)', trap: 'grad', tip: 'grad = kroupy', example: 'Pražský hrad je obrovský.' },
  { cz: 'zámek', meaning: 'pałac; zamek w drzwiach', trap: 'zamek warowny', tip: 'zamek warowny = hrad', example: 'Klíč nejde do zámku.' },
  { cz: 'záchod', meaning: 'toaleta', trap: 'zachód', tip: 'zachód = západ', example: 'Kde je tady záchod?' },
  { cz: 'červenec', meaning: 'lipiec', trap: 'czerwiec', tip: 'czerwiec = červen', example: 'Dovolenou mám v červenci.' },
  { cz: 'válka', meaning: 'wojna', trap: 'walka', tip: 'walka = boj', example: 'Ta válka trvala pět let.' },
  { cz: 'dobytek', meaning: 'bydło', trap: 'dobytek, majątek', tip: 'majątek = majetek', example: 'Farmář má hodně dobytka.' },
  { cz: 'pitomec', meaning: 'idiota', trap: 'pupil, wychowanek', tip: 'pupil = mazlíček, svěřenec', example: 'Nebuď pitomec!' },
  { cz: 'žena', meaning: 'kobieta (też żona)', trap: 'tylko żona', tip: 'żona precyzyjnie = manželka', example: 'Ta žena je moje sousedka.' },
  { cz: 'kapusta', meaning: 'kapusta włoska / jarmuż', trap: 'zwykła kapusta', tip: 'kapusta (biała) = zelí', example: 'K obědu je vepřo, knedlo, zelo.' },
  { cz: 'šukat', meaning: '(wulgarne) uprawiać seks', trap: 'szukać', tip: 'szukać = hledat', example: 'Hledám klíče.' },
];

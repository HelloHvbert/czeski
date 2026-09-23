import { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { addWord, deleteWord, getDueCards, getStats, listWords, reviewCard, type Card } from '../db';
import { describeInterval, type Grade } from '../srs';
import { useSettings } from '../SettingsContext';
import { speak } from '../speech';
import { colors, radius } from '../theme';

const GRADES: { grade: Grade; label: string; color: string }[] = [
  { grade: 0, label: 'Nie wiem', color: colors.accent },
  { grade: 3, label: 'Trudne', color: colors.warn },
  { grade: 4, label: 'Dobrze', color: colors.primary },
  { grade: 5, label: 'Łatwo', color: colors.good },
];

export default function ReviewScreen({ active }: { active: boolean }) {
  const db = useSQLiteContext();
  const { settings } = useSettings();
  const rate = settings?.speechRate ?? 0.85;
  const [queue, setQueue] = useState<Card[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState({ words: 0, due: 0, learned: 0 });
  const [mode, setMode] = useState<'review' | 'list'>('review');
  const [done, setDone] = useState(0);

  const refresh = useCallback(async () => {
    setQueue(await getDueCards(db));
    setStats(await getStats(db));
    setRevealed(false);
  }, [db]);

  useEffect(() => {
    if (active) refresh();
  }, [active, refresh]);

  const card = queue[0];

  // Kartę cz→pl od razu czytamy na głos; pl→cz dopiero po odkryciu.
  useEffect(() => {
    if (card && card.direction === 'cz_pl' && active && mode === 'review') speak(card.cz, rate);
  }, [card?.id, active, mode]);

  const grade = async (g: Grade) => {
    if (!card) return;
    await reviewCard(db, card, g);
    setDone((n) => n + 1);
    setRevealed(false);
    if (g === 0) {
      // wraca na koniec kolejki w tej sesji
      setQueue((q) => [...q.slice(1), { ...q[0], reps: 0, interval: 0 }]);
    } else {
      setQueue((q) => q.slice(1));
    }
    setStats(await getStats(db));
  };

  if (mode === 'list') return <WordList onBack={() => { setMode('review'); refresh(); }} />;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={styles.h1}>Powtórki</Text>
        <Pressable onPress={() => setMode('list')}>
          <Text style={styles.link}>Słówka ({stats.words})</Text>
        </Pressable>
      </View>
      <Text style={styles.muted}>
        Do powtórki: {stats.due} · opanowane: {stats.learned} · dziś zrobione: {done}
      </Text>

      {!card ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🎉</Text>
          <Text style={styles.emptyText}>
            {stats.words === 0
              ? 'Nie masz jeszcze słówek. Przeprowadź rozmowę, a nowe słowa same tu trafią.'
              : 'Na teraz wszystko powtórzone. Wróć później albo pogadaj po czesku.'}
          </Text>
        </View>
      ) : (
        <>
          <Pressable style={styles.card} onPress={() => setRevealed(true)}>
            <Text style={styles.dirLabel}>{card.direction === 'cz_pl' ? 'CZ → PL' : 'PL → CZ'}</Text>
            <Text style={styles.front}>{card.direction === 'cz_pl' ? card.cz : card.pl}</Text>
            {card.direction === 'cz_pl' && (
              <Pressable onPress={() => speak(card.cz, rate)} hitSlop={10}>
                <Text style={styles.link}>🔊</Text>
              </Pressable>
            )}

            {revealed ? (
              <View style={styles.back}>
                <Text style={styles.backText}>{card.direction === 'cz_pl' ? card.pl : card.cz}</Text>
                {card.direction === 'pl_cz' && (
                  <Pressable onPress={() => speak(card.cz, rate)} hitSlop={10}>
                    <Text style={styles.link}>🔊 Odsłuchaj</Text>
                  </Pressable>
                )}
                {card.example ? (
                  <Pressable onPress={() => speak(card.example!, rate)}>
                    <Text style={styles.example}>„{card.example}” 🔊</Text>
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <Text style={styles.hint}>
                {card.direction === 'pl_cz' ? 'Powiedz na głos po czesku, potem dotknij' : 'Dotknij, żeby odkryć'}
              </Text>
            )}
          </Pressable>

          {revealed && (
            <View style={styles.grades}>
              {GRADES.map((g) => (
                <Pressable key={g.grade} onPress={() => grade(g.grade)} style={[styles.gradeBtn, { borderColor: g.color }]}>
                  <Text style={[styles.gradeLabel, { color: g.color }]}>{g.label}</Text>
                  <Text style={styles.gradeInterval}>{describeInterval(card, g.grade)}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}

function WordList({ onBack }: { onBack: () => void }) {
  const db = useSQLiteContext();
  const [words, setWords] = useState<Card[]>([]);
  const [cz, setCz] = useState('');
  const [pl, setPl] = useState('');
  const [filter, setFilter] = useState('');

  const load = useCallback(async () => setWords(await listWords(db)), [db]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    await addWord(db, { cz, pl, source: 'ręcznie' });
    setCz('');
    setPl('');
    load();
  };

  const f = filter.trim().toLowerCase();
  const shown = f ? words.filter((w) => w.cz.toLowerCase().includes(f) || w.pl.toLowerCase().includes(f)) : words;

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <Text style={styles.h1}>Słówka</Text>
        <Pressable onPress={onBack}>
          <Text style={styles.link}>← Powtórki</Text>
        </Pressable>
      </View>

      <View style={styles.addRow}>
        <TextInput value={cz} onChangeText={setCz} placeholder="po czesku" placeholderTextColor={colors.muted} style={[styles.input, { flex: 1 }]} />
        <TextInput value={pl} onChangeText={setPl} placeholder="po polsku" placeholderTextColor={colors.muted} style={[styles.input, { flex: 1 }]} />
        <Pressable onPress={add} disabled={!cz.trim() || !pl.trim()} style={[styles.addBtn, (!cz.trim() || !pl.trim()) && { opacity: 0.4 }]}>
          <Text style={{ color: '#fff', fontSize: 20 }}>+</Text>
        </Pressable>
      </View>
      <TextInput value={filter} onChangeText={setFilter} placeholder="Szukaj…" placeholderTextColor={colors.muted} style={[styles.input, { marginBottom: 8 }]} />

      <FlatList
        data={shown}
        keyExtractor={(w) => String(w.id)}
        renderItem={({ item }) => (
          <Pressable
            style={styles.wordRow}
            onLongPress={() =>
              Alert.alert('Usunąć?', item.cz, [
                { text: 'Anuluj', style: 'cancel' },
                { text: 'Usuń', style: 'destructive', onPress: async () => { await deleteWord(db, item.cz); load(); } },
              ])
            }
          >
            <Text style={styles.wordCz}>{item.cz}</Text>
            <Text style={styles.wordPl}>{item.pl}</Text>
          </Pressable>
        )}
        ListFooterComponent={<Text style={[styles.muted, { textAlign: 'center', margin: 12 }]}>Przytrzymaj słówko, żeby je usunąć.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, padding: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  h1: { fontSize: 28, fontWeight: '800', color: colors.text },
  muted: { color: colors.muted, fontSize: 14, marginTop: 4 },
  link: { color: colors.primary, fontWeight: '600', fontSize: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: colors.muted, textAlign: 'center', lineHeight: 23 },
  card: { flex: 1, marginTop: 16, backgroundColor: colors.card, borderRadius: radius + 4, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 10 },
  dirLabel: { position: 'absolute', top: 14, left: 16, color: colors.muted, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  front: { fontSize: 32, fontWeight: '700', color: colors.text, textAlign: 'center' },
  hint: { color: colors.muted, marginTop: 20 },
  back: { marginTop: 16, alignItems: 'center', gap: 10, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16, alignSelf: 'stretch' },
  backText: { fontSize: 24, color: colors.primary, fontWeight: '600', textAlign: 'center' },
  example: { fontSize: 16, color: colors.muted, fontStyle: 'italic', textAlign: 'center' },
  grades: { flexDirection: 'row', gap: 8, marginTop: 12 },
  gradeBtn: { flex: 1, borderWidth: 2, borderRadius: 12, paddingVertical: 10, alignItems: 'center', backgroundColor: colors.card },
  gradeLabel: { fontWeight: '700', fontSize: 14 },
  gradeInterval: { color: colors.muted, fontSize: 12, marginTop: 2 },
  addRow: { flexDirection: 'row', gap: 8, marginVertical: 12, alignItems: 'center' },
  input: { backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },
  addBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  wordRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  wordCz: { fontSize: 17, fontWeight: '600', color: colors.text },
  wordPl: { fontSize: 14, color: colors.muted, marginTop: 2 },
});

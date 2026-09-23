import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { FALSE_FRIENDS, type FalseFriend } from '../data/falseFriends';
import { addWord, getFalseFriendStats, recordFalseFriend } from '../db';
import { useSettings } from '../SettingsContext';
import { speak } from '../speech';
import { colors, radius } from '../theme';

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

interface Question {
  ff: FalseFriend;
  options: { text: string; kind: 'correct' | 'trap' | 'other' }[];
}

function buildQuestion(ff: FalseFriend): Question {
  const other = shuffle(FALSE_FRIENDS.filter((f) => f.cz !== ff.cz))[0];
  return {
    ff,
    options: shuffle([
      { text: ff.meaning, kind: 'correct' as const },
      { text: ff.trap, kind: 'trap' as const },
      { text: other.meaning, kind: 'other' as const },
    ]),
  };
}

export default function FalseFriendsScreen() {
  const db = useSQLiteContext();
  const { settings } = useSettings();
  const [order, setOrder] = useState<FalseFriend[]>([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState({ ok: 0, all: 0 });

  const newRound = useCallback(async () => {
    const stats = await getFalseFriendStats(db);
    // Najpierw te, na których się mylisz albo których jeszcze nie było.
    const weighted = shuffle(FALSE_FRIENDS).sort((a, b) => {
      const sa = stats[a.cz], sb = stats[b.cz];
      const wa = sa ? sa.wrong * 2 - sa.correct : 1;
      const wb = sb ? sb.wrong * 2 - sb.correct : 1;
      return wb - wa;
    });
    setOrder(weighted.slice(0, 12));
    setIdx(0);
    setPicked(null);
    setScore({ ok: 0, all: 0 });
  }, [db]);

  useEffect(() => { newRound(); }, [newRound]);

  const current = order[idx];
  const q = useMemo(() => (current ? buildQuestion(current) : null), [current]);

  const choose = async (i: number) => {
    if (!q || picked !== null) return;
    setPicked(i);
    const ok = q.options[i].kind === 'correct';
    setScore((s) => ({ ok: s.ok + (ok ? 1 : 0), all: s.all + 1 }));
    await recordFalseFriend(db, q.ff.cz, ok);
    if (!ok) {
      await addWord(db, { cz: q.ff.cz, pl: `${q.ff.meaning} (nie: ${q.ff.trap})`, example: q.ff.example, source: 'fałszywi przyjaciele' });
    }
  };

  const next = () => {
    setPicked(null);
    setIdx((i) => i + 1);
  };

  if (!q) {
    return (
      <View style={[styles.wrap, { alignItems: 'center', justifyContent: 'center' }]}>
        {order.length > 0 && (
          <>
            <Text style={styles.big}>{score.ok} / {score.all}</Text>
            <Text style={[styles.muted, { textAlign: 'center', marginVertical: 12 }]}>
              Pomyłki trafiły do powtórek. W następnej rundzie dostaniesz ich więcej.
            </Text>
          </>
        )}
        <Pressable onPress={newRound} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Nowa runda</Text>
        </Pressable>
      </View>
    );
  }

  const answered = picked !== null;
  const wasTrap = answered && q.options[picked!].kind === 'trap';

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.h1}>Fałszywi przyjaciele</Text>
      <Text style={styles.muted}>Słowo {idx + 1} z {order.length} · wynik {score.ok}/{score.all}</Text>

      <Pressable style={styles.card} onPress={() => speak(q.ff.cz, settings?.speechRate)}>
        <Text style={styles.word}>{q.ff.cz}</Text>
        <Text style={styles.muted}>🔊 Co to znaczy?</Text>
      </Pressable>

      {q.options.map((o, i) => {
        const isPicked = picked === i;
        const style = !answered
          ? styles.option
          : o.kind === 'correct'
            ? [styles.option, styles.optionCorrect]
            : isPicked
              ? [styles.option, styles.optionWrong]
              : [styles.option, { opacity: 0.5 }];
        return (
          <Pressable key={i} onPress={() => choose(i)} style={style}>
            <Text style={styles.optionText}>{o.text}</Text>
          </Pressable>
        );
      })}

      {answered && (
        <View style={styles.feedback}>
          {wasTrap && <Text style={styles.trapNote}>Pułapka! Polska intuicja podpowiada źle.</Text>}
          <Text style={styles.fbLine}>
            <Text style={{ fontWeight: '700' }}>{q.ff.cz}</Text> = {q.ff.meaning}
          </Text>
          <Text style={styles.fbLine}>💡 {q.ff.tip}</Text>
          <Pressable onPress={() => speak(q.ff.example, settings?.speechRate)}>
            <Text style={styles.example}>„{q.ff.example}” 🔊</Text>
          </Pressable>
          <Pressable onPress={next} style={[styles.primaryBtn, { marginTop: 12 }]}>
            <Text style={styles.primaryBtnText}>Dalej</Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexGrow: 1, padding: 16 },
  h1: { fontSize: 28, fontWeight: '800', color: colors.text },
  muted: { color: colors.muted, fontSize: 14, marginTop: 4 },
  big: { fontSize: 48, fontWeight: '800', color: colors.primary },
  card: { backgroundColor: colors.card, borderRadius: radius + 4, borderWidth: 1, borderColor: colors.border, alignItems: 'center', paddingVertical: 36, marginVertical: 16 },
  word: { fontSize: 36, fontWeight: '800', color: colors.text },
  option: { backgroundColor: colors.card, borderRadius: radius, borderWidth: 2, borderColor: colors.border, padding: 16, marginBottom: 10 },
  optionCorrect: { borderColor: colors.good, backgroundColor: colors.goodSoft },
  optionWrong: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  optionText: { fontSize: 18, color: colors.text, textAlign: 'center' },
  feedback: { backgroundColor: colors.primarySoft, borderRadius: radius, padding: 14, marginTop: 6, gap: 6 },
  trapNote: { color: colors.accent, fontWeight: '700' },
  fbLine: { fontSize: 16, color: colors.text },
  example: { fontSize: 16, color: colors.muted, fontStyle: 'italic' },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 24, paddingVertical: 12, paddingHorizontal: 28, alignItems: 'center' },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

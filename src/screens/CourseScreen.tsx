import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { COURSE, type Chapter, type Example } from '../data/course';
import { addWord, getCourseProgress, updateCourseProgress, type ChapterProgress } from '../db';
import { useSettings } from '../SettingsContext';
import { speak } from '../speech';
import { colors, radius } from '../theme';

export default function CourseScreen({ onPractice }: { onPractice: (ch: Chapter) => void }) {
  const db = useSQLiteContext();
  const [progress, setProgress] = useState<Record<string, ChapterProgress>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => setProgress(await getCourseProgress(db)), [db]);
  useEffect(() => { load(); }, [load]);

  const open = COURSE.find((c) => c.id === openId);
  if (open) {
    return (
      <ChapterView
        chapter={open}
        progress={progress[open.id]}
        onBack={() => { setOpenId(null); load(); }}
        onChange={load}
        onPractice={async () => {
          await updateCourseProgress(db, open.id, { conversation: true });
          load();
          onPractice(open);
        }}
      />
    );
  }

  const doneCount = COURSE.filter((c) => progress[c.id]?.done).length;
  const nextId = COURSE.find((c) => !progress[c.id]?.done)?.id;

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={styles.h1}>Kurs</Text>
      <Text style={styles.muted}>
        12 rozdziałów, od A1 do B1. Na jeden rozdział ok. 2 tygodni: przeczytaj gramatykę, dodaj słówka, zrób 5–7 rozmów, codziennie powtórki.
      </Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(doneCount / COURSE.length) * 100}%` }]} />
      </View>
      <Text style={styles.muted}>Ukończone: {doneCount} / {COURSE.length}</Text>

      {(['A1', 'A2', 'B1'] as const).map((lvl) => (
        <View key={lvl}>
          <Text style={styles.levelHeader}>Poziom {lvl}</Text>
          {COURSE.filter((c) => c.level === lvl).map((c) => {
            const p = progress[c.id];
            const n = COURSE.indexOf(c) + 1;
            return (
              <Pressable
                key={c.id}
                onPress={() => setOpenId(c.id)}
                style={({ pressed }) => [styles.chapter, c.id === nextId && styles.chapterNext, pressed && { opacity: 0.7 }]}
              >
                <Text style={styles.chEmoji}>{p?.done ? '✅' : c.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.chTitle}>{n}. {c.title}</Text>
                  <Text style={styles.chSub} numberOfLines={1}>{c.grammar.map((g) => g.title).join(' · ')}</Text>
                </View>
                {!!p?.conversations && <Text style={styles.chCount}>💬 {p.conversations}</Text>}
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

function ChapterView({
  chapter: c, progress, onBack, onChange, onPractice,
}: { chapter: Chapter; progress?: ChapterProgress; onBack: () => void; onChange: () => void; onPractice: () => void }) {
  const db = useSQLiteContext();
  const { settings } = useSettings();
  const rate = settings?.speechRate;
  const [added, setAdded] = useState<number | null>(progress?.words_added ? 0 : null);

  const addWords = async () => {
    let n = 0;
    for (const w of c.words) n += await addWord(db, { cz: w.cz, pl: w.pl, source: `kurs: ${c.title}` });
    await updateCourseProgress(db, c.id, { wordsAdded: true });
    setAdded(n);
    onChange();
  };

  const toggleDone = async () => {
    await updateCourseProgress(db, c.id, { done: !progress?.done });
    onChange();
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Pressable onPress={onBack} hitSlop={10}>
        <Text style={styles.link}>← Kurs</Text>
      </Pressable>
      <Text style={styles.chLevel}>Rozdział {COURSE.indexOf(c) + 1} · {c.level}</Text>
      <Text style={styles.h1}>{c.emoji} {c.title}</Text>
      <Text style={styles.theme}>{c.theme}</Text>

      <Section title="Po tym rozdziale umiesz">
        {c.goals.map((g, i) => <Text key={i} style={styles.bullet}>• {g}</Text>)}
      </Section>

      {c.grammar.map((g, i) => (
        <Section key={i} title={`Gramatyka: ${g.title}`}>
          <Text style={styles.rule}>{g.rule}</Text>
          {g.examples.map((e, j) => <ExampleRow key={j} e={e} rate={rate} />)}
        </Section>
      ))}

      <Section title="⚠️ Pułapki dla Polaka" tone="warn">
        {c.pitfalls.map((p, i) => <Text key={i} style={styles.bullet}>• {p}</Text>)}
      </Section>

      <Section title={`Słówka startowe (${c.words.length})`}>
        {c.words.map((w, i) => <ExampleRow key={i} e={w} rate={rate} compact />)}
        <Pressable onPress={addWords} disabled={added !== null} style={[styles.secondaryBtn, added !== null && { opacity: 0.6 }]}>
          <Text style={styles.secondaryBtnText}>
            {added === null ? '+ Dodaj do powtórek' : added > 0 ? `✓ Dodano ${added} słówek` : '✓ Słówka są w powtórkach'}
          </Text>
        </Pressable>
      </Section>

      <Pressable onPress={onPractice} style={styles.primaryBtn}>
        <Text style={styles.primaryBtnText}>💬 Ćwicz rozmowę z tego rozdziału</Text>
      </Pressable>
      <Text style={[styles.muted, { textAlign: 'center' }]}>
        Model tworzy sytuacje, w których musisz użyć tej gramatyki, i szczególnie jej pilnuje.
        {progress?.conversations ? ` Rozmów: ${progress.conversations}.` : ''}
      </Text>

      <Pressable onPress={toggleDone} style={[styles.secondaryBtn, { marginTop: 16 }]}>
        <Text style={styles.secondaryBtnText}>{progress?.done ? '↺ Oznacz jako nieukończony' : '✓ Oznacz rozdział jako ukończony'}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Section({ title, children, tone }: { title: string; children: React.ReactNode; tone?: 'warn' }) {
  return (
    <View style={[styles.section, tone === 'warn' && { backgroundColor: colors.warnSoft, borderColor: colors.warnSoft }]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ExampleRow({ e, rate, compact }: { e: Example; rate?: number; compact?: boolean }) {
  return (
    <Pressable onPress={() => speak(e.cz, rate)} style={[styles.example, compact && styles.exampleCompact]}>
      <Text style={styles.exCz}>{e.cz} <Text style={styles.speaker}>🔊</Text></Text>
      <Text style={styles.exPl}>{e.pl}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 2 },
  muted: { color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 6 },
  link: { color: colors.primary, fontWeight: '600', fontSize: 16, marginBottom: 10 },
  progressBar: { height: 8, borderRadius: 4, backgroundColor: colors.border, marginTop: 14, overflow: 'hidden' },
  progressFill: { height: 8, backgroundColor: colors.good },
  levelHeader: { marginTop: 20, marginBottom: 8, color: colors.muted, fontWeight: '700', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 },
  chapter: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border, gap: 12 },
  chapterNext: { borderColor: colors.primary, borderWidth: 2 },
  chEmoji: { fontSize: 24 },
  chTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  chSub: { fontSize: 13, color: colors.muted, marginTop: 2 },
  chCount: { fontSize: 12, color: colors.muted },
  chLevel: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  theme: { fontSize: 16, color: colors.muted, marginTop: 4, lineHeight: 22 },
  section: { backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.border, padding: 14, marginTop: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, marginBottom: 8 },
  bullet: { fontSize: 15, color: colors.text, lineHeight: 22, marginBottom: 2 },
  rule: { fontSize: 15, color: colors.text, lineHeight: 22, marginBottom: 8 },
  example: { backgroundColor: colors.primarySoft, borderRadius: 10, padding: 10, marginTop: 6 },
  exampleCompact: { backgroundColor: 'transparent', padding: 0, paddingVertical: 6, marginTop: 0, borderBottomWidth: 1, borderBottomColor: colors.border, borderRadius: 0 },
  exCz: { fontSize: 16, fontWeight: '600', color: colors.text },
  speaker: { fontSize: 12 },
  exPl: { fontSize: 14, color: colors.muted, marginTop: 2 },
  primaryBtn: { backgroundColor: colors.primary, borderRadius: 24, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: { borderWidth: 1.5, borderColor: colors.primary, borderRadius: 22, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  secondaryBtnText: { color: colors.primary, fontWeight: '700' },
});

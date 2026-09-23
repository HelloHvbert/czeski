import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { askTutor, type ApiMessage, type Correction, type NewWord } from '../api';
import { addWord } from '../db';
import { SCENARIOS, customScenario, type Scenario } from '../data/scenarios';
import { useSettings } from '../SettingsContext';
import { speak, stopSpeaking, useCzechDictation } from '../speech';
import { colors, radius } from '../theme';

type ChatItem =
  | { id: string; role: 'user'; text: string; corrections?: Correction[] }
  | { id: string; role: 'assistant'; text: string; pl: string; suggestions: string[]; newWords: NewWord[]; added: number };

let idCounter = 0;
const nextId = () => String(++idCounter);

export default function ChatScreen() {
  const [scenario, setScenario] = useState<Scenario | null>(null);

  if (!scenario) return <ScenarioPicker onPick={setScenario} />;
  return <Conversation scenario={scenario} onExit={() => { stopSpeaking(); setScenario(null); }} />;
}

// ---------------- wybór scenki ----------------

function ScenarioPicker({ onPick }: { onPick: (s: Scenario) => void }) {
  const { settings, update } = useSettings();
  const [custom, setCustom] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.pickerWrap} keyboardShouldPersistTaps="handled">
      <Text style={styles.h1}>Rozmowa</Text>
      <Text style={styles.muted}>Wybierz scenkę. Model gra rolę, a pod Twoimi wiadomościami pojawiają się poprawki.</Text>

      <View style={styles.levelRow}>
        {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
          <Pressable
            key={lvl}
            onPress={() => update({ level: lvl })}
            style={[styles.levelChip, settings?.level === lvl && styles.levelChipActive]}
          >
            <Text style={[styles.levelText, settings?.level === lvl && styles.levelTextActive]}>{lvl}</Text>
          </Pressable>
        ))}
      </View>

      {SCENARIOS.map((s) => (
        <Pressable key={s.id} onPress={() => onPick(s)} style={({ pressed }) => [styles.scenario, pressed && { opacity: 0.7 }]}>
          <Text style={styles.scenarioEmoji}>{s.emoji}</Text>
          <Text style={styles.scenarioTitle}>{s.title}</Text>
        </Pressable>
      ))}

      <Text style={[styles.muted, { marginTop: 16 }]}>Albo opisz własną sytuację:</Text>
      <View style={styles.customRow}>
        <TextInput
          value={custom}
          onChangeText={setCustom}
          placeholder="np. dzwonię do mechanika w Ostrawie"
          placeholderTextColor={colors.muted}
          style={[styles.input, { flex: 1 }]}
        />
        <Pressable
          disabled={!custom.trim()}
          onPress={() => onPick(customScenario(custom.trim()))}
          style={[styles.sendBtn, !custom.trim() && { opacity: 0.4 }]}
        >
          <Text style={styles.sendText}>▶</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// ---------------- rozmowa ----------------

function Conversation({ scenario, onExit }: { scenario: Scenario; onExit: () => void }) {
  const db = useSQLiteContext();
  const { settings } = useSettings();
  const [items, setItems] = useState<ChatItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionWords, setSessionWords] = useState(0);
  const listRef = useRef<FlatList<ChatItem>>(null);
  const started = useRef(false);

  const dictation = useCzechDictation((text) => setInput(text));

  const request = useCallback(
    async (history: ChatItem[]) => {
      if (!settings) return;
      setLoading(true);
      setError(null);
      try {
        const messages: ApiMessage[] = history.map((i) => ({ role: i.role, content: i.text }));
        const r = await askTutor(settings, { title: scenario.title, prompt: scenario.prompt }, messages);

        let added = 0;
        for (const w of r.new_words) {
          added += await addWord(db, { cz: w.cz, pl: w.pl, example: w.example_cz, source: scenario.title });
        }
        setSessionWords((n) => n + added);

        setItems((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last?.role === 'user') next[next.length - 1] = { ...last, corrections: r.corrections };
          next.push({
            id: nextId(),
            role: 'assistant',
            text: r.reply,
            pl: r.reply_pl,
            suggestions: r.suggestions,
            newWords: r.new_words,
            added,
          });
          return next;
        });

        if (settings.autoSpeak && r.reply) speak(r.reply, settings.speechRate);
      } catch (e: any) {
        setError(e?.message ?? String(e));
      } finally {
        setLoading(false);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
      }
    },
    [db, scenario, settings],
  );

  // Model zaczyna scenkę
  useEffect(() => {
    if (!started.current && settings) {
      started.current = true;
      request([]);
    }
  }, [settings, request]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || loading) return;
    if (dictation.listening) dictation.stop();
    const next: ChatItem[] = [...items, { id: nextId(), role: 'user', text: t }];
    setItems(next);
    setInput('');
    request(next);
  };

  const lastAssistant = [...items].reverse().find((i) => i.role === 'assistant');
  const suggestions = !loading && lastAssistant?.role === 'assistant' && items[items.length - 1] === lastAssistant
    ? lastAssistant.suggestions
    : [];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={1}>{scenario.emoji} {scenario.title}</Text>
        {sessionWords > 0 && <Text style={styles.headerBadge}>+{sessionWords} słówek</Text>}
        <Pressable onPress={onExit} hitSlop={10}>
          <Text style={styles.headerExit}>Zakończ</Text>
        </Pressable>
      </View>

      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 4 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) =>
          item.role === 'assistant' ? (
            <AssistantBubble item={item} rate={settings?.speechRate ?? 0.85} />
          ) : (
            <UserBubble item={item} onAdd={(c) => addWord(db, { cz: c.corrected, pl: c.explanation_pl, source: 'poprawka' })} />
          )
        }
        ListFooterComponent={
          <>
            {loading && <ActivityIndicator style={{ margin: 12 }} color={colors.primary} />}
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
                <Pressable onPress={() => request(items)}>
                  <Text style={styles.retry}>Ponów</Text>
                </Pressable>
              </View>
            )}
          </>
        }
      />

      {suggestions.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center' }}>
          {suggestions.map((s, i) => (
            <Pressable key={i} onPress={() => setInput(s)} style={styles.suggestChip}>
              <Text style={styles.suggestText}>{s}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {dictation.error && (
        <Pressable onPress={dictation.clearError} style={[styles.errorBox, { marginHorizontal: 12 }]}>
          <Text style={styles.errorText}>{dictation.error}</Text>
        </Pressable>
      )}

      <View style={styles.inputRow}>
        <Pressable
          onPress={dictation.listening ? dictation.stop : dictation.start}
          style={[styles.micBtn, dictation.listening && styles.micBtnActive]}
        >
          <Text style={styles.micText}>{dictation.listening ? '■' : '🎤'}</Text>
        </Pressable>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={dictation.listening ? 'Słucham…' : 'Napisz lub powiedz po czesku'}
          placeholderTextColor={colors.muted}
          style={[styles.input, { flex: 1, maxHeight: 110 }]}
          multiline
        />
        <Pressable onPress={() => send(input)} disabled={!input.trim() || loading} style={[styles.sendBtn, (!input.trim() || loading) && { opacity: 0.4 }]}>
          <Text style={styles.sendText}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function AssistantBubble({ item, rate }: { item: Extract<ChatItem, { role: 'assistant' }>; rate: number }) {
  const [showPl, setShowPl] = useState(false);
  return (
    <View style={styles.assistantWrap}>
      <View style={styles.assistantBubble}>
        <Text style={styles.bubbleText}>{item.text}</Text>
        {showPl && <Text style={styles.translation}>{item.pl}</Text>}
        <View style={styles.bubbleActions}>
          <Pressable onPress={() => speak(item.text, rate)} hitSlop={8}>
            <Text style={styles.action}>🔊 Odsłuchaj</Text>
          </Pressable>
          <Pressable onPress={() => setShowPl((v) => !v)} hitSlop={8}>
            <Text style={styles.action}>{showPl ? 'Ukryj PL' : '🇵🇱 Tłumaczenie'}</Text>
          </Pressable>
        </View>
      </View>
      {item.newWords.length > 0 && (
        <View style={styles.wordsBox}>
          {item.newWords.map((w, i) => (
            <Pressable key={i} onPress={() => speak(w.cz, rate)}>
              <Text style={styles.wordLine}>
                <Text style={{ fontWeight: '700' }}>{w.cz}</Text> — {w.pl}
              </Text>
            </Pressable>
          ))}
          {item.added > 0 && <Text style={styles.wordsNote}>Dodano do powtórek: {item.added}</Text>}
        </View>
      )}
    </View>
  );
}

function UserBubble({ item, onAdd }: { item: Extract<ChatItem, { role: 'user' }>; onAdd: (c: Correction) => Promise<number> }) {
  const [added, setAdded] = useState<Record<number, boolean>>({});
  return (
    <View style={styles.userWrap}>
      <View style={styles.userBubble}>
        <Text style={[styles.bubbleText, { color: '#fff' }]}>{item.text}</Text>
      </View>
      {item.corrections && item.corrections.length === 0 && <Text style={styles.okNote}>✓ Bez błędów</Text>}
      {item.corrections?.map((c, i) => (
        <View key={i} style={styles.correction}>
          <Text style={styles.corrLine}>
            <Text style={styles.corrWrong}>{c.original}</Text> → <Text style={styles.corrRight}>{c.corrected}</Text>
          </Text>
          <Text style={styles.corrExpl}>{c.explanation_pl}</Text>
          <Pressable
            disabled={added[i]}
            onPress={async () => {
              await onAdd(c);
              setAdded((a) => ({ ...a, [i]: true }));
            }}
          >
            <Text style={styles.corrAdd}>{added[i] ? '✓ W powtórkach' : '+ Do powtórek'}</Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pickerWrap: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 28, fontWeight: '800', color: colors.text, marginBottom: 4 },
  muted: { color: colors.muted, fontSize: 15, lineHeight: 21 },
  levelRow: { flexDirection: 'row', gap: 8, marginVertical: 14 },
  levelChip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  levelChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  levelText: { color: colors.text, fontWeight: '600' },
  levelTextActive: { color: '#fff' },
  scenario: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: radius, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
  scenarioEmoji: { fontSize: 24, marginRight: 12 },
  scenarioTitle: { fontSize: 17, color: colors.text, fontWeight: '600' },
  customRow: { flexDirection: 'row', gap: 8, marginTop: 8, alignItems: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card, gap: 8 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: colors.text },
  headerBadge: { fontSize: 12, color: colors.good, backgroundColor: colors.goodSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, overflow: 'hidden' },
  headerExit: { color: colors.accent, fontWeight: '600' },

  assistantWrap: { marginBottom: 12, maxWidth: '88%' },
  assistantBubble: { backgroundColor: colors.card, borderRadius: radius, borderTopLeftRadius: 4, padding: 12, borderWidth: 1, borderColor: colors.border },
  bubbleText: { fontSize: 17, lineHeight: 24, color: colors.text },
  translation: { marginTop: 8, fontSize: 15, color: colors.muted, fontStyle: 'italic' },
  bubbleActions: { flexDirection: 'row', gap: 16, marginTop: 8 },
  action: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  wordsBox: { marginTop: 6, backgroundColor: colors.primarySoft, borderRadius: 10, padding: 10 },
  wordLine: { color: colors.text, fontSize: 14, lineHeight: 20 },
  wordsNote: { color: colors.muted, fontSize: 12, marginTop: 4 },

  userWrap: { marginBottom: 12, alignSelf: 'flex-end', maxWidth: '88%', alignItems: 'flex-end' },
  userBubble: { backgroundColor: colors.primary, borderRadius: radius, borderTopRightRadius: 4, padding: 12 },
  okNote: { color: colors.good, fontSize: 13, marginTop: 4 },
  correction: { backgroundColor: colors.warnSoft, borderRadius: 10, padding: 10, marginTop: 6, alignSelf: 'stretch' },
  corrLine: { fontSize: 15, color: colors.text },
  corrWrong: { color: colors.accent, textDecorationLine: 'line-through' },
  corrRight: { color: colors.good, fontWeight: '700' },
  corrExpl: { fontSize: 14, color: colors.text, marginTop: 4, lineHeight: 19 },
  corrAdd: { color: colors.warn, fontWeight: '600', marginTop: 6, fontSize: 13 },

  errorBox: { backgroundColor: colors.accentSoft, borderRadius: 10, padding: 10, marginVertical: 6 },
  errorText: { color: colors.accent, fontSize: 14 },
  retry: { color: colors.accent, fontWeight: '700', marginTop: 6 },

  suggestRow: { flexGrow: 0, flexShrink: 0 },
  suggestChip: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primary, borderRadius: 18, paddingHorizontal: 12, paddingVertical: 7 },
  suggestText: { color: colors.primary, fontSize: 14 },

  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, padding: 10, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
  input: { backgroundColor: colors.bg, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10, fontSize: 16, color: colors.text, borderWidth: 1, borderColor: colors.border },
  micBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
  micBtnActive: { backgroundColor: colors.accent },
  micText: { fontSize: 20, color: '#fff' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  sendText: { color: '#fff', fontSize: 18 },
});

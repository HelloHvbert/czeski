import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardProvider, useKeyboardState } from 'react-native-keyboard-controller';
import { SQLiteProvider } from 'expo-sqlite';
import { migrate } from './src/db';
import { SettingsProvider } from './src/SettingsContext';
import ChatScreen from './src/screens/ChatScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import FalseFriendsScreen from './src/screens/FalseFriendsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import CourseScreen from './src/screens/CourseScreen';
import FreestyleScreen from './src/screens/FreestyleScreen';
import { chapterScenario } from './src/data/course';
import type { Scenario } from './src/data/scenarios';
import { colors } from './src/theme';

type Tab = 'course' | 'chat' | 'free' | 'review' | 'ff' | 'settings';

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'course', icon: '📚', label: 'Kurs' },
  { key: 'chat', icon: '🎭', label: 'Scenki' },
  { key: 'free', icon: '🗣️', label: 'Luźno' },
  { key: 'review', icon: '🃏', label: 'Powtórki' },
  { key: 'ff', icon: '⚠️', label: 'Pułapki' },
  { key: 'settings', icon: '⚙️', label: 'Ustawienia' },
];

export default function App() {
  return (
    <KeyboardProvider>
      <SafeAreaProvider>
        <SQLiteProvider databaseName="czeski.db" onInit={migrate}>
          <SettingsProvider>
            <Main />
          </SettingsProvider>
        </SQLiteProvider>
      </SafeAreaProvider>
    </KeyboardProvider>
  );
}

// Stan zakładek musi żyć POD SQLiteProviderem: jego memo ignoruje zmiany children,
// więc stan trzymany wyżej nie przerenderowałby ekranów.
function Main() {
  const [tab, setTab] = useState<Tab>('course');
  const [pending, setPending] = useState<Scenario | null>(null);
  // Luźna rozmowa montuje się dopiero przy pierwszym wejściu (żeby nie wołać API na starcie)
  const [freeVisited, setFreeVisited] = useState(false);
  const go = (t: Tab) => { if (t === 'free') setFreeVisited(true); setTab(t); };
  // Pasek zakładek chowamy przy otwartej klawiaturze: inaczej zostaje w layoucie pod nią
  // i KeyboardStickyView w ChatScreen/FreestyleScreen dolicza jego wysokość jako szparę.
  const keyboardVisible = useKeyboardState((s) => s.isVisible);
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar style="dark" />
      {/* Ekrany zostają zamontowane, żeby rozmowa nie znikała przy zmianie zakładki */}
      <View style={[styles.screen, tab !== 'course' && styles.hidden]}>
        <CourseScreen onPractice={(ch) => { setPending(chapterScenario(ch)); setTab('chat'); }} />
      </View>
      <View style={[styles.screen, tab !== 'chat' && styles.hidden]}>
        <ChatScreen pending={pending} onPendingConsumed={() => setPending(null)} />
      </View>
      {freeVisited && (
        <View style={[styles.screen, tab !== 'free' && styles.hidden]}>
          <FreestyleScreen />
        </View>
      )}
      <View style={[styles.screen, tab !== 'review' && styles.hidden]}><ReviewScreen active={tab === 'review'} /></View>
      {tab === 'ff' && <View style={styles.screen}><FalseFriendsScreen /></View>}
      {tab === 'settings' && <View style={styles.screen}><SettingsScreen /></View>}

      <View style={[styles.tabBar, { paddingBottom: 4 + insets.bottom }, keyboardVisible && styles.hidden]}>
        {TABS.map((t) => (
          <Pressable key={t.key} onPress={() => go(t.key)} style={styles.tab}>
            <Text style={[styles.tabIcon, tab !== t.key && { opacity: 0.45 }]}>{t.icon}</Text>
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1 },
  hidden: { display: 'none' },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card, paddingTop: 6 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 10.5, color: colors.muted, marginTop: 2 },
  tabLabelActive: { color: colors.primary, fontWeight: '700' },
});

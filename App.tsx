import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { SQLiteProvider } from 'expo-sqlite';
import { migrate } from './src/db';
import { SettingsProvider } from './src/SettingsContext';
import ChatScreen from './src/screens/ChatScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import FalseFriendsScreen from './src/screens/FalseFriendsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors } from './src/theme';

type Tab = 'chat' | 'review' | 'ff' | 'settings';

const TABS: { key: Tab; icon: string; label: string }[] = [
  { key: 'chat', icon: '💬', label: 'Rozmowa' },
  { key: 'review', icon: '🃏', label: 'Powtórki' },
  { key: 'ff', icon: '⚠️', label: 'Pułapki' },
  { key: 'settings', icon: '⚙️', label: 'Ustawienia' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('chat');

  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="czeski.db" onInit={migrate}>
        <SettingsProvider>
          <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            <StatusBar style="dark" />
            {/* Ekrany zostają zamontowane, żeby rozmowa nie znikała przy zmianie zakładki */}
            <View style={[styles.screen, tab !== 'chat' && styles.hidden]}><ChatScreen /></View>
            <View style={[styles.screen, tab !== 'review' && styles.hidden]}><ReviewScreen active={tab === 'review'} /></View>
            {tab === 'ff' && <View style={styles.screen}><FalseFriendsScreen /></View>}
            {tab === 'settings' && <View style={styles.screen}><SettingsScreen /></View>}

            <View style={styles.tabBar}>
              {TABS.map((t) => (
                <Pressable key={t.key} onPress={() => setTab(t.key)} style={styles.tab}>
                  <Text style={[styles.tabIcon, tab !== t.key && { opacity: 0.45 }]}>{t.icon}</Text>
                  <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
                </Pressable>
              ))}
            </View>
          </SafeAreaView>
        </SettingsProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1 },
  hidden: { display: 'none' },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card, paddingTop: 6, paddingBottom: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabIcon: { fontSize: 20 },
  tabLabel: { fontSize: 11, color: colors.muted, marginTop: 2 },
  tabLabelActive: { color: colors.primary, fontWeight: '700' },
});

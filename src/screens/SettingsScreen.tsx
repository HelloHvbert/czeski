import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useSettings } from '../SettingsContext';
import { hasCzechVoice, speak } from '../speech';
import { colors, radius } from '../theme';

export default function SettingsScreen() {
  const { settings, update } = useSettings();
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [voiceOk, setVoiceOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (settings) {
      setUrl(settings.functionUrl);
      setSecret(settings.appSecret);
    }
  }, [settings?.functionUrl, settings?.appSecret]);

  useEffect(() => { hasCzechVoice().then(setVoiceOk); }, []);

  if (!settings) return null;

  const saveAndTest = async () => {
    await update({ functionUrl: url.trim(), appSecret: secret.trim() });
    setStatus('Sprawdzam…');
    try {
      const res = await fetch(url.trim(), { method: 'GET', headers: { 'x-app-secret': secret.trim() } });
      const data = await res.json().catch(() => ({}));
      setStatus(res.ok ? `✓ Połączono (model: ${data.model ?? '?'})` : `✗ ${data.error ?? res.status}`);
    } catch (e: any) {
      setStatus(`✗ ${e?.message ?? e}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.wrap} keyboardShouldPersistTaps="handled">
      <Text style={styles.h1}>Ustawienia</Text>

      <Text style={styles.section}>Serwer</Text>
      <View style={styles.box}>
        <Text style={styles.label}>Adres funkcji Supabase</Text>
        <TextInput
          value={url}
          onChangeText={setUrl}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="https://xxxx.supabase.co/functions/v1/czeski-chat"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Text style={styles.label}>Sekret aplikacji (APP_SECRET)</Text>
        <TextInput
          value={secret}
          onChangeText={setSecret}
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          placeholder="ten sam co w sekretach funkcji"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Pressable onPress={saveAndTest} style={styles.btn}>
          <Text style={styles.btnText}>Zapisz i sprawdź</Text>
        </Pressable>
        {status && <Text style={styles.status}>{status}</Text>}
      </View>

      <Text style={styles.section}>Głos</Text>
      <View style={styles.box}>
        <View style={styles.row}>
          <Text style={styles.rowText}>Czytaj odpowiedzi na głos</Text>
          <Switch value={settings.autoSpeak} onValueChange={(v) => update({ autoSpeak: v })} />
        </View>
        <Text style={styles.label}>Tempo mowy</Text>
        <View style={styles.row}>
          {[0.7, 0.85, 1.0].map((r) => (
            <Pressable
              key={r}
              onPress={() => { update({ speechRate: r }); speak('Dobrý den, jak se máte?', r); }}
              style={[styles.chip, settings.speechRate === r && styles.chipActive]}
            >
              <Text style={[styles.chipText, settings.speechRate === r && { color: '#fff' }]}>
                {r === 0.7 ? 'Wolno' : r === 0.85 ? 'Normalnie' : 'Szybko'}
              </Text>
            </Pressable>
          ))}
        </View>
        {voiceOk === false && (
          <Pressable onPress={() => Linking.sendIntent?.('com.android.settings.TTS_SETTINGS').catch(() => Linking.openSettings())}>
            <Text style={styles.warn}>
              Nie znaleziono czeskiego głosu. Otwórz Ustawienia → Zamiana tekstu na mowę → Google → Zainstaluj dane głosowe → Čeština. (dotknij)
            </Text>
          </Pressable>
        )}
        {voiceOk && <Text style={styles.ok}>✓ Czeski głos jest zainstalowany</Text>}
      </View>

      <Text style={styles.section}>Poziom</Text>
      <View style={[styles.box, styles.row]}>
        {(['A1', 'A2', 'B1', 'B2'] as const).map((lvl) => (
          <Pressable key={lvl} onPress={() => update({ level: lvl })} style={[styles.chip, settings.level === lvl && styles.chipActive]}>
            <Text style={[styles.chipText, settings.level === lvl && { color: '#fff' }]}>{lvl}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 40 },
  h1: { fontSize: 28, fontWeight: '800', color: colors.text },
  section: { marginTop: 20, marginBottom: 8, color: colors.muted, fontWeight: '700', textTransform: 'uppercase', fontSize: 12, letterSpacing: 1 },
  box: { backgroundColor: colors.card, borderRadius: radius, borderWidth: 1, borderColor: colors.border, padding: 14, gap: 8 },
  label: { color: colors.text, fontWeight: '600', marginTop: 4 },
  input: { backgroundColor: colors.bg, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: colors.text, borderWidth: 1, borderColor: colors.border },
  btn: { backgroundColor: colors.primary, borderRadius: 22, paddingVertical: 11, alignItems: 'center', marginTop: 6 },
  btnText: { color: '#fff', fontWeight: '700' },
  status: { color: colors.text, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowText: { color: colors.text, fontSize: 15, flex: 1 },
  chip: { flex: 1, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontWeight: '600' },
  warn: { color: colors.warn, marginTop: 6, lineHeight: 20 },
  ok: { color: colors.good, marginTop: 6 },
});

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { loadSettings, saveSettings, type Settings } from './db';

interface Ctx {
  settings: Settings | null;
  update: (patch: Partial<Settings>) => Promise<void>;
}

const SettingsContext = createContext<Ctx>({ settings: null, update: async () => {} });

export function SettingsProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    loadSettings(db).then(setSettings);
  }, [db]);

  const update = useCallback(
    async (patch: Partial<Settings>) => {
      setSettings((s) => (s ? { ...s, ...patch } : s));
      await saveSettings(db, patch);
    },
    [db],
  );

  return <SettingsContext.Provider value={{ settings, update }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  return useContext(SettingsContext);
}

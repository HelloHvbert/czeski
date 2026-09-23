import type { SQLiteDatabase } from 'expo-sqlite';
import { schedule, type Grade, type SrsState } from './srs';

export type Direction = 'cz_pl' | 'pl_cz';

export interface Card extends SrsState {
  id: number;
  cz: string;
  pl: string;
  example: string | null;
  direction: Direction;
  source: string | null;
  created: number;
}

export interface Settings {
  functionUrl: string;
  appSecret: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  autoSpeak: boolean;
  speechRate: number;
}

const DEFAULTS: Settings = {
  functionUrl: process.env.EXPO_PUBLIC_FUNCTION_URL ?? '',
  appSecret: process.env.EXPO_PUBLIC_APP_SECRET ?? '',
  level: 'A2',
  autoSpeak: true,
  speechRate: 0.9,
};

export async function migrate(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  if (version < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY NOT NULL, value TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cz TEXT NOT NULL,
        pl TEXT NOT NULL,
        example TEXT,
        direction TEXT NOT NULL,
        source TEXT,
        ease REAL NOT NULL DEFAULT 2.5,
        interval INTEGER NOT NULL DEFAULT 0,
        reps INTEGER NOT NULL DEFAULT 0,
        lapses INTEGER NOT NULL DEFAULT 0,
        due INTEGER NOT NULL,
        created INTEGER NOT NULL,
        UNIQUE(cz, direction)
      );
      CREATE INDEX IF NOT EXISTS cards_due ON cards(due);
      CREATE TABLE IF NOT EXISTS ff_stats (cz TEXT PRIMARY KEY NOT NULL, correct INTEGER NOT NULL DEFAULT 0, wrong INTEGER NOT NULL DEFAULT 0);
    `);
    version = 1;
    await db.execAsync(`PRAGMA user_version = ${version}`);
  }
}

// ---------- ustawienia ----------

export async function loadSettings(db: SQLiteDatabase): Promise<Settings> {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM settings');
  const s: Settings = { ...DEFAULTS };
  for (const { key, value } of rows) {
    if (key in s) (s as any)[key] = JSON.parse(value);
  }
  return s;
}

export async function saveSettings(db: SQLiteDatabase, s: Partial<Settings>) {
  for (const [key, value] of Object.entries(s)) {
    await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', key, JSON.stringify(value));
  }
}

// ---------- karty ----------

/** Dodaje słówko w obu kierunkach (cz→pl i pl→cz). Zwraca liczbę faktycznie nowych słówek. */
export async function addWord(
  db: SQLiteDatabase,
  w: { cz: string; pl: string; example?: string | null; source?: string },
): Promise<number> {
  const cz = w.cz.trim();
  const pl = w.pl.trim();
  if (!cz || !pl) return 0;
  const now = Date.now();
  let added = 0;
  for (const direction of ['cz_pl', 'pl_cz'] as Direction[]) {
    const res = await db.runAsync(
      `INSERT OR IGNORE INTO cards (cz, pl, example, direction, source, due, created) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      cz, pl, w.example ?? null, direction, w.source ?? null,
      // karty pl→cz odkładamy o dzień, żeby najpierw poznać słowo
      direction === 'cz_pl' ? now : now + 24 * 60 * 60 * 1000,
      now,
    );
    if (direction === 'cz_pl') added += res.changes;
  }
  return added;
}

export async function getDueCards(db: SQLiteDatabase, limit = 50): Promise<Card[]> {
  return db.getAllAsync<Card>('SELECT * FROM cards WHERE due <= ? ORDER BY due LIMIT ?', Date.now(), limit);
}

export async function getStats(db: SQLiteDatabase) {
  const r = await db.getFirstAsync<{ words: number; due: number; learned: number }>(
    `SELECT
       (SELECT COUNT(*) FROM cards WHERE direction = 'cz_pl') AS words,
       (SELECT COUNT(*) FROM cards WHERE due <= ?) AS due,
       (SELECT COUNT(*) FROM cards WHERE direction = 'cz_pl' AND interval >= 21) AS learned`,
    Date.now(),
  );
  return r ?? { words: 0, due: 0, learned: 0 };
}

export async function reviewCard(db: SQLiteDatabase, card: Card, grade: Grade) {
  const n = schedule(card, grade);
  await db.runAsync(
    'UPDATE cards SET ease = ?, interval = ?, reps = ?, lapses = ?, due = ? WHERE id = ?',
    n.ease, n.interval, n.reps, n.lapses, n.due, card.id,
  );
}

export async function listWords(db: SQLiteDatabase): Promise<Card[]> {
  return db.getAllAsync<Card>(`SELECT * FROM cards WHERE direction = 'cz_pl' ORDER BY created DESC`);
}

export async function deleteWord(db: SQLiteDatabase, cz: string) {
  await db.runAsync('DELETE FROM cards WHERE cz = ?', cz);
}

// ---------- fałszywi przyjaciele ----------

export async function recordFalseFriend(db: SQLiteDatabase, cz: string, ok: boolean) {
  await db.runAsync(
    `INSERT INTO ff_stats (cz, correct, wrong) VALUES (?, ?, ?)
     ON CONFLICT(cz) DO UPDATE SET correct = correct + excluded.correct, wrong = wrong + excluded.wrong`,
    cz, ok ? 1 : 0, ok ? 0 : 1,
  );
}

export async function getFalseFriendStats(db: SQLiteDatabase) {
  const rows = await db.getAllAsync<{ cz: string; correct: number; wrong: number }>('SELECT * FROM ff_stats');
  return Object.fromEntries(rows.map((r) => [r.cz, r]));
}

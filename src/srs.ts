// Uproszczony algorytm SM-2 (jak w Anki/SuperMemo).
export type Grade = 0 | 3 | 4 | 5; // 0 = nie wiem, 3 = trudne, 4 = dobrze, 5 = łatwo

export interface SrsState {
  ease: number;
  interval: number; // dni
  reps: number;
  lapses: number;
  due: number; // ms epoch
}

const DAY = 24 * 60 * 60 * 1000;
const MIN = 60 * 1000;

export function schedule(s: SrsState, grade: Grade, now = Date.now()): SrsState {
  let { ease, interval, reps, lapses } = s;

  if (grade < 3) {
    // Nie pamiętam: wraca za 10 minut, zaczynamy od nowa.
    return { ease: Math.max(1.3, ease - 0.2), interval: 0, reps: 0, lapses: lapses + 1, due: now + 10 * MIN };
  }

  reps += 1;
  if (reps === 1) interval = grade === 5 ? 3 : 1;
  else if (reps === 2) interval = grade === 5 ? 7 : grade === 3 ? 3 : 5;
  else {
    const mult = grade === 3 ? 1.2 : grade === 5 ? ease * 1.3 : ease;
    interval = Math.max(interval + 1, Math.round(interval * mult));
  }

  ease = Math.max(1.3, ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));
  return { ease, interval, reps, lapses, due: now + interval * DAY };
}

export function describeInterval(s: SrsState, grade: Grade): string {
  const next = schedule(s, grade, 0);
  if (next.due < DAY) return `${Math.round(next.due / MIN)} min`;
  return `${next.interval} d`;
}

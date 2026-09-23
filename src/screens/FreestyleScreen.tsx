import { useState } from 'react';
import { FREESTYLE } from '../data/scenarios';
import { stopSpeaking } from '../speech';
import { Conversation } from './ChatScreen';

/** Luźna rozmowa bez scenki. „Nowa” zaczyna od zera (krótsza historia = taniej). */
export default function FreestyleScreen() {
  const [session, setSession] = useState(0);
  return (
    <Conversation
      key={session}
      scenario={FREESTYLE}
      exitLabel="Nowa"
      onExit={() => { stopSpeaking(); setSession((n) => n + 1); }}
    />
  );
}

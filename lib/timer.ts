import { db } from "./firebase";
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp, Timestamp } from "firebase/firestore";

export interface TimerState {
  state: "stopped" | "running" | "paused";
  startAt: Timestamp | null;
  accumulatedMs: number;
  updatedBy: string;
  updatedAt: Timestamp;
}

const TIMER_DOC_PATH = "meta/timer";

/**
 * Inicializar o documento do timer se não existir
 */
export async function initializeTimer(): Promise<void> {
  const timerRef = doc(db, TIMER_DOC_PATH);
  const timerSnap = await getDoc(timerRef);

  if (!timerSnap.exists()) {
    await setDoc(timerRef, {
      state: "stopped",
      startAt: null,
      accumulatedMs: 0,
      updatedBy: "system",
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Buscar o estado atual do timer
 */
export async function getTimerState(): Promise<TimerState | null> {
  const timerRef = doc(db, TIMER_DOC_PATH);
  const timerSnap = await getDoc(timerRef);

  if (timerSnap.exists()) {
    return timerSnap.data() as TimerState;
  }

  return null;
}

/**
 * Iniciar o cronômetro
 */
export async function startTimer(adminId: string): Promise<void> {
  const timerRef = doc(db, TIMER_DOC_PATH);
  const currentState = await getTimerState();

  if (currentState && currentState.state !== "running") {
    await setDoc(timerRef, {
      state: "running",
      startAt: serverTimestamp(),
      accumulatedMs: currentState.accumulatedMs || 0,
      updatedBy: adminId,
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Pausar o cronômetro
 */
export async function pauseTimer(adminId: string): Promise<void> {
  const timerRef = doc(db, TIMER_DOC_PATH);
  const currentState = await getTimerState();

  if (currentState && currentState.state === "running" && currentState.startAt) {
    // Calcular tempo acumulado
    const now = Date.now();
    const startTime = currentState.startAt.toMillis();
    const elapsed = now - startTime;
    const totalAccumulated = (currentState.accumulatedMs || 0) + elapsed;

    await setDoc(timerRef, {
      state: "paused",
      startAt: null,
      accumulatedMs: totalAccumulated,
      updatedBy: adminId,
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Zerar o cronômetro
 */
export async function resetTimer(adminId: string): Promise<void> {
  const timerRef = doc(db, TIMER_DOC_PATH);

  await setDoc(timerRef, {
    state: "stopped",
    startAt: null,
    accumulatedMs: 0,
    updatedBy: adminId,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Observar mudanças no timer em tempo real
 */
export function subscribeToTimer(callback: (state: TimerState | null) => void): () => void {
  const timerRef = doc(db, TIMER_DOC_PATH);

  const unsubscribe = onSnapshot(timerRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as TimerState);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}

/**
 * Calcular o tempo atual do cronômetro
 */
export function calculateCurrentTime(state: TimerState | null): number {
  if (!state) return 0;

  if (state.state === "running" && state.startAt) {
    const now = Date.now();
    const startTime = state.startAt.toMillis();
    const elapsed = now - startTime;
    return (state.accumulatedMs || 0) + elapsed;
  }

  return state.accumulatedMs || 0;
}

/**
 * Formatar milissegundos para MM:SS
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Obter dígitos individuais do tempo formatado (MM:SS)
 */
export function getTimeDigits(ms: number): number[] {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  const minuteDigits = minutes.toString().padStart(2, "0").split("").map(Number);
  const secondDigits = seconds.toString().padStart(2, "0").split("").map(Number);

  return [...minuteDigits, ...secondDigits];
}


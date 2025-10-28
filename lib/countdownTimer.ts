import { db } from "./firebase";
import { doc, setDoc, getDoc, onSnapshot, serverTimestamp, Timestamp } from "firebase/firestore";

// Definição da interface para o estado do Timer de Contagem Regressiva
export interface CountdownTimerState {
  state: "stopped" | "running" | "paused" | "finished";
  deadlineAt: Timestamp | null; // Campo para o prazo final
  updatedBy: string;
  updatedAt: Timestamp;
}

// Usamos um caminho diferente para o documento do timer de contagem regressiva
const COUNTDOWN_TIMER_DOC_PATH = "meta/countdownTimer";

/**
 * Inicializar o documento do timer de contagem regressiva se não existir
 */
export async function initializeCountdownTimer(): Promise<void> {
  const timerRef = doc(db, COUNTDOWN_TIMER_DOC_PATH);
  const timerSnap = await getDoc(timerRef);

  if (!timerSnap.exists()) {
    await setDoc(timerRef, {
      state: "stopped",
      deadlineAt: null,
      updatedBy: "system",
      updatedAt: serverTimestamp(),
    } as CountdownTimerState);
  }
}

/**
 * Buscar o estado atual do timer de contagem regressiva
 */
export async function getCountdownTimerState(): Promise<CountdownTimerState | null> {
  const timerRef = doc(db, COUNTDOWN_TIMER_DOC_PATH);
  const timerSnap = await getDoc(timerRef);

  if (timerSnap.exists()) {
    return timerSnap.data() as CountdownTimerState;
  }

  return null;
}

/**
 * Atualizar o prazo final do timer de contagem regressiva
 */
export async function updateDeadline(adminId: string, deadline: Date): Promise<void> {
  const timerRef = doc(db, COUNTDOWN_TIMER_DOC_PATH);
  
  await setDoc(timerRef, {
    deadlineAt: Timestamp.fromDate(deadline),
    state: "stopped", // Reinicia o estado para stopped ao mudar o prazo
    updatedBy: adminId,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

/**
 * Iniciar o timer de contagem regressiva
 */
export async function startCountdownTimer(adminId: string): Promise<void> {
  const timerRef = doc(db, COUNTDOWN_TIMER_DOC_PATH);
  const currentState = await getCountdownTimerState();

  if (!currentState || !currentState.deadlineAt) {
    throw new Error("Prazo final não definido. Defina o prazo antes de iniciar.");
  }

  if (currentState.state !== "running") {
    await setDoc(timerRef, {
      state: "running",
      updatedBy: adminId,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
}

/**
 * Pausar o timer de contagem regressiva
 */
export async function pauseCountdownTimer(adminId: string): Promise<void> {
  const timerRef = doc(db, COUNTDOWN_TIMER_DOC_PATH);
  const currentState = await getCountdownTimerState();

  if (currentState && currentState.state === "running") {
    await setDoc(timerRef, {
      state: "paused",
      updatedBy: adminId,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }
}

/**
 * Zerar o timer de contagem regressiva
 */
export async function resetCountdownTimer(adminId: string): Promise<void> {
  const timerRef = doc(db, COUNTDOWN_TIMER_DOC_PATH);

  await setDoc(timerRef, {
    state: "stopped",
    deadlineAt: null,
    updatedBy: adminId,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Observar mudanças no timer de contagem regressiva em tempo real
 */
export function subscribeToCountdownTimer(callback: (state: CountdownTimerState | null) => void): () => void {
  const timerRef = doc(db, COUNTDOWN_TIMER_DOC_PATH);

  const unsubscribe = onSnapshot(timerRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as CountdownTimerState);
    } else {
      callback(null);
    }
  });

  return unsubscribe;
}

/**
 * Calcular o tempo restante em milissegundos
 */
export function calculateRemainingTime(state: CountdownTimerState | null): number {
  if (!state || !state.deadlineAt) return 0;

  const deadlineTime = state.deadlineAt.toMillis();
  const now = Date.now();
  const remaining = deadlineTime - now;

  if (remaining <= 0) {
    // Se o tempo acabou, o estado deve ser "finished"
    if (state.state !== "finished") {
      // Tenta atualizar o estado para finished no Firestore, mas não espera.
      const timerRef = doc(db, COUNTDOWN_TIMER_DOC_PATH);
      setDoc(timerRef, { state: "finished" }, { merge: true }).catch(console.error);
    }
    return 0;
  }

  // A contagem regressiva só é afetada pelo estado "running" para fins de exibição.
  return remaining;
}

/**
 * Formatar milissegundos para MM:SS ou HH:MM:SS
 */
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }

  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Obter dígitos individuais do tempo formatado (HH:MM:SS)
 */
export function getTimeDigits(ms: number): number[] {
  const totalSeconds = Math.floor(ms / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const minutes = totalMinutes % 60;
  const hours = Math.floor(totalMinutes / 60);

  // Always include hours, even if zero
  const timeString = `${hours.toString().padStart(2, "0")}${minutes.toString().padStart(2, "0")}${seconds.toString().padStart(2, "0")}`;
  
  return timeString.split("").map(Number);
}
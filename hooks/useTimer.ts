import { useState, useEffect, useCallback } from 'react';
import { 
  subscribeToTimer, 
  calculateCurrentTime, 
  getTimeDigits, 
  TimerState,
  getTimerState
} from '@/lib/timer';

export function useTimer() {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [digits, setDigits] = useState<number[]>([]);
  const [lastState, setLastState] = useState<{
    state: string;
    time: number;
  } | null>(null);

  // Atualizar o tempo atual a cada 100ms
  useEffect(() => {
    if (!timerState) return;

    const updateTime = () => {
      const time = calculateCurrentTime(timerState);
      setCurrentTime(time);
      setDigits(getTimeDigits(time));
      
      // Salvar o último estado conhecido
      setLastState({
        state: timerState.state,
        time: Date.now()
      });
    };

    // Atualizar imediatamente
    updateTime();

    // Se estiver rodando, atualizar a cada 100ms
    if (timerState.state === 'running') {
      const interval = setInterval(updateTime, 100);
      return () => clearInterval(interval);
    }
  }, [timerState]);

  // Sincronização em tempo real com o Firebase
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupSubscription = async () => {
      // Primeiro, busca o estado atual uma vez
      const currentState = await getTimerState();
      if (currentState) {
        handleNewState(currentState);
      }
      
      // Depois se inscreve para atualizações em tempo real
      unsubscribe = subscribeToTimer((state) => {
        handleNewState(state);
      });
    };

    setupSubscription();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  
  // Função para lidar com atualizações de estado
  const handleNewState = useCallback((state: TimerState | null) => {
    if (!state) return;
    
    // Só atualiza se o estado for mais recente que o último estado conhecido
    const shouldUpdate = !lastState || 
      state.updatedAt.toMillis() > lastState.time ||
      state.state !== lastState.state;
    
    if (shouldUpdate) {
      setTimerState(state);
    }
  }, [lastState]);

  return {
    timerState,
    currentTime,
    digits,
    isRunning: timerState?.state === 'running',
    isPaused: timerState?.state === 'paused',
    isStopped: !timerState || timerState.state === 'stopped',
  };
}

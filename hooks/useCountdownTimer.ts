import { useState, useEffect, useCallback } from 'react';
import { 
  subscribeToCountdownTimer, 
  calculateRemainingTime, 
  getTimeDigits, 
  CountdownTimerState,
  getCountdownTimerState
} from '@/lib/countdownTimer';

export function useCountdownTimer() {
  const [timerState, setTimerState] = useState<CountdownTimerState | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [digits, setDigits] = useState<number[]>([]);
  const [localDeadline, setLocalDeadline] = useState<Date | null>(null);

  // Carregar prazo do localStorage ao iniciar
  useEffect(() => {
    const savedDeadline = typeof window !== 'undefined' 
      ? localStorage.getItem('countdownDeadline') 
      : null;
    
    if (savedDeadline) {
      setLocalDeadline(new Date(savedDeadline));
    }
  }, []);

  // Atualizar o timer localmente
  useEffect(() => {
    if (!timerState || !timerState.deadlineAt) return;

    // Salvar o prazo no localStorage quando for definido
    if (timerState.deadlineAt) {
      const deadline = timerState.deadlineAt.toDate();
      setLocalDeadline(deadline);
      if (typeof window !== 'undefined') {
        localStorage.setItem('countdownDeadline', deadline.toISOString());
      }
    }

    const updateTime = () => {
      const time = calculateRemainingTime(timerState);
      setCurrentTime(time);
      setDigits(getTimeDigits(time));
    };

    updateTime();

    // Se o timer estiver rodando, atualiza a cada 100ms
    if (timerState.state === 'running') {
      const interval = setInterval(updateTime, 100);
      return () => clearInterval(interval);
    }
  }, [timerState]);

  // Se tivermos um prazo local mas não temos estado do servidor, usamos o local
  useEffect(() => {
    if (localDeadline && !timerState?.deadlineAt) {
      const updateLocalTime = () => {
        const now = new Date();
        const timeLeft = localDeadline.getTime() - now.getTime();
        
        if (timeLeft <= 0) {
          setCurrentTime(0);
          setDigits([0, 0, 0, 0, 0, 0]);
          return;
        }
        
        setCurrentTime(timeLeft);
        setDigits(getTimeDigits(timeLeft));
      };

      updateLocalTime();
      const interval = setInterval(updateLocalTime, 1000);
      return () => clearInterval(interval);
    }
  }, [localDeadline, timerState]);

  // Sincronização em tempo real com o Firebase
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    const setupSubscription = async () => {
      // Primeiro, busca o estado atual uma vez
      const currentState = await getCountdownTimerState();
      if (currentState) {
        handleNewState(currentState);
      }
      
      // Depois se inscreve para atualizações em tempo real
      unsubscribe = subscribeToCountdownTimer((state) => {
        handleNewState(state);
      });
    };

    setupSubscription();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  
  // Função para lidar com atualizações de estado
  const handleNewState = useCallback((state: CountdownTimerState | null) => {
    if (!state) return;
    
    setTimerState(state);
    
    // Atualiza o prazo local se houver um novo
    if (state.deadlineAt) {
      const newDeadline = state.deadlineAt.toDate();
      setLocalDeadline(newDeadline);
      if (typeof window !== 'undefined') {
        localStorage.setItem('countdownDeadline', newDeadline.toISOString());
      }
    }
  }, []);

  // Função para limpar o timer local
  const clearLocalTimer = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('countdownDeadline');
    }
    setLocalDeadline(null);
    setTimerState(null);
    setCurrentTime(0);
    setDigits([0, 0, 0, 0, 0, 0]);
  };

  return {
    timerState,
    currentTime,
    digits,
    localDeadline,
    clearLocalTimer,
  };
}

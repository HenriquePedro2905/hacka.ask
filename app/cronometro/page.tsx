"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { subscribeToTimer, calculateCurrentTime, getTimeDigits, TimerState } from "@/lib/timer";

export default function Cronometro() {
  const [timerState, setTimerState] = useState<TimerState | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [digits, setDigits] = useState<number[]>([0, 0, 0, 0]);

  // Subscrever ao estado do timer
  useEffect(() => {
    const unsubscribe = subscribeToTimer((state) => {
      setTimerState(state);
    });

    return () => unsubscribe();
  }, []);

  // Atualizar o tempo atual a cada 100ms
  useEffect(() => {
    if (!timerState) return;

    const updateTime = () => {
      const time = calculateCurrentTime(timerState);
      setCurrentTime(time);
      setDigits(getTimeDigits(time));
    };

    // Atualizar imediatamente
    updateTime();

    // Se estiver rodando, atualizar a cada 100ms
    if (timerState.state === "running") {
      const interval = setInterval(updateTime, 100);
      return () => clearInterval(interval);
    }
  }, [timerState]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white">
      <div className="text-center">
        {/* Título */}
        <h1 className="text-4xl md:text-6xl font-display mb-12">
          CRONÔMETRO
        </h1>

        {/* Display do Cronômetro com SVGs */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Minutos */}
          <div className="flex gap-2">
            <Image
              src={`/timer-${digits[0]}.svg`}
              alt={`${digits[0]}`}
              width={120}
              height={180}
              className="w-20 h-auto md:w-32"
            />
            <Image
              src={`/timer-${digits[1]}.svg`}
              alt={`${digits[1]}`}
              width={120}
              height={180}
              className="w-20 h-auto md:w-32"
            />
          </div>

          {/* Separador : */}
          <div className="text-6xl md:text-8xl font-display">:</div>

          {/* Segundos */}
          <div className="flex gap-2">
            <Image
              src={`/timer-${digits[2]}.svg`}
              alt={`${digits[2]}`}
              width={120}
              height={180}
              className="w-20 h-auto md:w-32"
            />
            <Image
              src={`/timer-${digits[3]}.svg`}
              alt={`${digits[3]}`}
              width={120}
              height={180}
              className="w-20 h-auto md:w-32"
            />
          </div>
        </div>

        {/* Indicador de Estado */}
        <div className="mt-8">
          {timerState?.state === "running" && (
            <div className="inline-block px-6 py-3 bg-black text-white font-bold text-xl rounded-lg animate-pulse">
              EM EXECUÇÃO
            </div>
          )}
          {timerState?.state === "paused" && (
            <div className="inline-block px-6 py-3 bg-[rgb(102_102_102)] text-white font-bold text-xl rounded-lg">
              PAUSADO
            </div>
          )}
          {timerState?.state === "stopped" && (
            <div className="inline-block px-6 py-3 border-4 border-black text-black font-bold text-xl rounded-lg">
              PARADO
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


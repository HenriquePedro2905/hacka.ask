"use client";

import Image from "next/image";
import { useTimer } from "@/hooks/useTimer";

export default function Cronometro() {
  const { digits, isRunning, isPaused } = useTimer();

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
          {isRunning && (
            <div className="inline-block px-6 py-3 bg-black text-white font-bold text-xl rounded-lg animate-pulse">
              EM EXECUÇÃO
            </div>
          )}
          {isPaused && (
            <div className="inline-block px-6 py-3 bg-[rgb(102_102_102)] text-white font-bold text-xl rounded-lg">
              PAUSADO
            </div>
          )}
          {!isRunning && !isPaused && (
            <div className="inline-block px-6 py-3 border-4 border-black text-black font-bold text-xl rounded-lg">
              PARADO
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


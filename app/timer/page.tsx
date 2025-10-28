"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";

export default function Timer() {
  const { 
    timerState, 
    digits, 
    localDeadline, 
    clearLocalTimer 
  } = useCountdownTimer();

  // Efeito para limpar o timer quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Não limpamos mais aqui, pois queremos manter o estado entre navegações
    };
  }, []);

  // Determinar qual data de prazo usar (local ou do servidor)
  const displayDeadline = localDeadline || 
    (timerState?.deadlineAt ? timerState.deadlineAt.toDate() : null);
  
  // Determinar o estado atual do timer
  const timerStatus = timerState?.state || 'stopped';

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-white">
      <div className="text-center">
        {/* Título */}
        <h1 className="text-4xl md:text-6xl font-display mb-4">
          Prazo para entrega do Desafio
        </h1>
        
        {/* Data do prazo */}
        <p className="text-2xl md:text-4xl font-display mb-4">
          {displayDeadline 
            ? `Até ${displayDeadline.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })} às ${displayDeadline.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}` 
            : 'Prazo não definido'}
        </p>

        {/* Display do Cronômetro com SVGs */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Horas */}
          <div className="flex gap-2">
            <Image
              src={`/timer-${digits[0]}.svg`}
              alt={`${digits[0]}`}
              width={120}
              height={180}
              className="w-16 h-auto md:w-24"
            />
            <Image
              src={`/timer-${digits[1]}.svg`}
              alt={`${digits[1]}`}
              width={120}
              height={180}
              className="w-16 h-auto md:w-24"
            />
          </div>

          {/* Separador : */}
          <div className="text-5xl md:text-7xl font-display">:</div>

          {/* Minutos */}
          <div className="flex gap-2">
            <Image
              src={`/timer-${digits[2]}.svg`}
              alt={`${digits[2]}`}
              width={120}
              height={180}
              className="w-16 h-auto md:w-24"
            />
            <Image
              src={`/timer-${digits[3]}.svg`}
              alt={`${digits[3]}`}
              width={120}
              height={180}
              className="w-16 h-auto md:w-24"
            />
          </div>

          {/* Separador : */}
          <div className="text-5xl md:text-7xl font-display">:</div>

          {/* Segundos */}
          <div className="flex gap-2">
            <Image
              src={`/timer-${digits[4]}.svg`}
              alt={`${digits[4]}`}
              width={120}
              height={180}
              className="w-16 h-auto md:w-24"
            />
            <Image
              src={`/timer-${digits[5]}.svg`}
              alt={`${digits[5]}`}
              width={120}
              height={180}
              className="w-16 h-auto md:w-24"
            />
          </div>
        </div>
        
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useActiveQuestion } from "@/hooks/useActiveQuestion";

export default function Visualizador() {
  const { question: activeQuestion, loading } = useActiveQuestion();
  const [showLogo, setShowLogo] = useState(true);

  // Atualizar estado do logo quando a pergunta mudar
  useEffect(() => {
    if (activeQuestion) {
      setShowLogo(false);
    } else {
      setShowLogo(true);
    }
  }, [activeQuestion]);

  const formatDate = (timestamp: any) => {
    try {
      const date = timestamp.toDate();
      return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return "";
    }
  };

  // Mostrar logo do Hackacast quando não há pergunta ativa
  if (showLogo || !activeQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-white">
        <div className="text-center w-full flex justify-center">
          <div className="w-full max-w-4xl">
            <Image
              src="/Hackacast.svg"
              alt="Hackacast"
              width={1200}
              height={300}
              className="w-full h-auto animate-pulse"
              priority
            />
          </div>
        </div>
      </div>
    );
  }

  // Exibir pergunta ativa
  return (
    <div 
      className="min-h-screen"
      style={{
        backgroundImage: 'url(/back1.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Logo fixa no topo */}
      <div className="w-full p-8">
        <div className="text-center">
          <Image
            src="/Hackacast.svg"
            alt="Logo"
            width={650}
            height={200}
            className="mx-auto"
          />
        </div>
      </div>

      {/* Card centralizado na tela */}
      <div className="flex items-start justify-center min-h-[calc(100vh-300px)] pt-16">
        <div className="border border-gray-400 rounded-2xl p-8 m-4 bg-white/25 backdrop-blur-sm shadow-lg w-[800px] mx-6">
          <p className="text-2xl md:text-4xl font-bold leading-relaxed text-center" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
            {activeQuestion.questionText}
          </p>
        </div>
      </div>
    </div>
  );
}